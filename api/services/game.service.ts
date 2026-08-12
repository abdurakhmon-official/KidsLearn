import prisma from '@/modules/db';
import { PlatformContext } from '@tsed/common';
import { Inject, Injectable, InjectContext } from '@tsed/di';
import { BadRequest, NotFound } from '@tsed/exceptions';
import { Request } from 'express';
import { GAME_TYPE, Prisma } from '@/generated/prisma';
import { BasicSearch, BasicSearchSchema } from '@/inputs';
import { CreateGameInput, CreateGameInputSchema, GameItemInput, GameItemInputSchema, GameOption, GameSearch, GameSearchSchema, SubmitGameInput, SubmitGameInputSchema, UpdateGameInput, UpdateGameInputSchema } from '@/inputs/game.input';
import { ActivityService } from '@/services/activity.service';
import { shuffle } from '@/utils/shuffle';
import { starsFor } from '@/utils/stars';
import { Move, buildMemoryLayout, buildPuzzleLayout, memoryPairs, puzzleSide, verifyMemory, verifyPuzzle } from '@/utils/game-rules';
import { GAME_SORT_KEYS, GameAnswerResult, GameConfig } from '@/types/game';
import { buildSorting } from '@/utils/sorting';

@Injectable()
export class GameService {
  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private activityService!: ActivityService;

  get req() {
    return this.context.getRequest<Request>();
  }

  get user() {
    return this.req.user;
  }

  get child() {
    return this.req.child;
  }

  async pagination(query: BasicSearch, filters: GameSearch = {}) {
    const search = BasicSearchSchema.parse(query);
    const where = this.buildWhere(search.search, GameSearchSchema.parse(filters));

    const [items, count] = await prisma.$transaction([
      prisma.game.findMany({
        where,
        take: search.size,
        skip: search.skip,
        select: {
          id: true,
          code: true,
          title: true,
          description: true,
          ageGroup: true,
          coverImage: true,
          pointsPerCorrect: true,
          config: true,
          order: true,
          active: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
          _count: { select: { items: true } },
        },
        orderBy: [buildSorting(search.sortBy, GAME_SORT_KEYS), { id: 'asc' }] as Prisma.GameOrderByWithRelationInput[],
      }),
      prisma.game.count({ where }),
    ]);

    return { success: true, data: { items, count } };
  }

  async forChild() {
    const child = this.child!;

    const games = await prisma.game.findMany({
      where: { active: true, ageGroup: child.ageGroup },
      select: {
        ...{
          id: true,
          code: true,
          title: true,
          description: true,
          ageGroup: true,
          coverImage: true,
          pointsPerCorrect: true,
          config: true,
          order: true,
          active: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
          _count: { select: { items: true } },
        },
        sessions: {
          where: { childId: child.id },
          select: { stars: true, score: true, createdAt: true },
          orderBy: [{ stars: 'desc' }, { score: 'desc' }],
          take: 1,
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    const items = games.map(({ sessions, ...game }) => ({ ...game, best: sessions[0] ?? null }));

    return { success: true, data: { items, count: items.length, ageGroup: child.ageGroup } };
  }

  async get(id: string) {
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
        ...(this.user?.isAdmin ? { items: { orderBy: { order: 'asc' as const } } } : {}),
        ...{ _count: { select: { items: true, sessions: true } } },
      },
    });

    if (!game) {
      throw new NotFound('game not found');
    }

    return { success: true, data: game };
  }

  async create(input: CreateGameInput) {
    const data = CreateGameInputSchema.parse(input);

    await this.assertCategory(data.categoryId);

    const { items, ...fields } = data;

    const game = await prisma.game.create({
      data: {
        ...fields,
        config: (fields.config ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        ...(items?.length ? { items: { create: items.map(item => ({ ...item, options: item.options })) } } : {}),
      },
      include: { items: { orderBy: { order: 'asc' } }, category: true },
    });

    return { success: true, _message: 'game created', data: game };
  }

  async update(id: string, input: UpdateGameInput) {
    const data = UpdateGameInputSchema.parse(input);

    const game = await prisma.game.findUnique({ where: { id } });

    if (!game) {
      throw new NotFound('game not found');
    }

    if (data.categoryId) {
      await this.assertCategory(data.categoryId);
    }

    const { items, config, ...fields } = data;

    const updated = await prisma.$transaction(async tx => {
      await tx.game.update({
        where: { id },
        data: {
          ...fields,
          ...(config !== undefined ? { config: (config ?? Prisma.JsonNull) as Prisma.InputJsonValue } : {}),
        },
      });

      if (items) {
        await tx.gameItem.deleteMany({ where: { gameId: id } });

        if (items.length) {
          await tx.gameItem.createMany({ data: items.map(item => ({ ...item, gameId: id })) });
        }
      }

      return tx.game.findUnique({
        where: { id },
        include: { items: { orderBy: { order: 'asc' } }, category: true },
      });
    });

    return { success: true, _message: 'saved', data: updated };
  }

  async delete(id: string) {
    const game = await prisma.game.findUnique({ where: { id } });

    if (!game) {
      throw new NotFound('game not found');
    }

    await prisma.game.delete({ where: { id } });

    return { success: true, _message: 'deleted' };
  }

  async listItems(gameId: string) {
    await this.findGame(gameId);

    const items = await prisma.gameItem.findMany({ where: { gameId: gameId }, orderBy: { order: 'asc' } });

    return { success: true, data: { items, count: items.length } };
  }

  async addItem(gameId: string, input: GameItemInput) {
    const data = GameItemInputSchema.parse(input);

    await this.findGame(gameId);

    const item = await prisma.gameItem.create({ data: { ...data, gameId: gameId } });

    return { success: true, _message: 'game item added', data: item };
  }

  async updateItem(gameId: string, itemId: string, input: GameItemInput) {
    const data = GameItemInputSchema.parse(input);

    const item = await prisma.gameItem.findUnique({ where: { id: itemId } });

    if (!item || item.gameId !== gameId) {
      throw new NotFound('game item not found');
    }

    const updated = await prisma.gameItem.update({ where: { id: itemId }, data });

    return { success: true, _message: 'saved', data: updated };
  }

  async deleteItem(gameId: string, itemId: string) {
    const item = await prisma.gameItem.findUnique({ where: { id: itemId } });

    if (!item || item.gameId !== gameId) {
      throw new NotFound('game item not found');
    }

    await prisma.gameItem.delete({ where: { id: itemId } });

    return { success: true, _message: 'deleted' };
  }

  async play(id: string) {
    const child = this.child!;
    const game = await this.findPlayableGame(id);

    const items = await prisma.gameItem.findMany({
      where: { gameId: id, active: true },
      orderBy: { order: 'asc' },
    });

    if (!items.length) {
      throw new BadRequest('this game has no content yet');
    }

    const config = (game.config ?? {}) as GameConfig;
    const perRound = Number(config.itemsPerRound) || items.length;

    const picked = shuffle(items).slice(0, perRound);

    const round = picked.map(({ correctValue, options, ...item }) => ({
      ...item,
      options: shuffle((options ?? []) as unknown as GameOption[]),
    }));

    const layout = this.buildLayout(game.code, config, picked);

    const saved = await prisma.gameRound.create({
      data: {
        childId: child.id,
        gameId: game.id,
        itemIds: picked.map(item => item.id),
        layout: layout ?? Prisma.DbNull,
      },
      select: { id: true },
    });

    return {
      success: true,
      data: {
        roundId: saved.id,
        game: {
          id: game.id,
          code: game.code,
          title: game.title,
          instructionAudio: game.instructionAudio,
          pointsPerCorrect: game.pointsPerCorrect,
          config: game.config,
        },
        items: round,
        layout,
        count: round.length,
        child: { id: child.id, fullName: child.fullName },
      },
    };
  }

  private buildLayout(code: GAME_TYPE, config: GameConfig, items: { options: unknown }[]) {
    if (code === GAME_TYPE.PUZZLE) {
      return buildPuzzleLayout(puzzleSide(config.rows, 3), puzzleSide(config.cols, 3));
    }

    if (code === GAME_TYPE.MEMORY) {
      const faces = ((items[0]?.options ?? []) as GameOption[])
        .map(option => option.label ?? option.image ?? '')
        .filter(Boolean);

      return buildMemoryLayout(memoryPairs(config.pairs), faces);
    }

    return null;
  }

  async submit(id: string, input: SubmitGameInput) {
    const data = SubmitGameInputSchema.parse(input);
    const child = this.child!;
    const game = await this.findPlayableGame(id);

    const round = await this.closeRound(data.roundId, id, child.id);

    const roundItemIds = (round.itemIds ?? []) as unknown as string[];

    const items = await prisma.gameItem.findMany({
      where: { id: { in: roundItemIds }, gameId: id },
      select: { id: true, correctValue: true },
    });

    const correctByItem = new Map(items.map(item => [item.id, item.correctValue]));

    const results = this.gradeRound(game.code, round, roundItemIds, correctByItem, data);

    const total = results.length;

    if (!total) {
      throw new BadRequest('this round has no items');
    }

    const correctCount = results.filter(result => result.isCorrect).length;
    const wrongCount = total - correctCount;
    const percent = Math.round((correctCount / total) * 10000) / 100;
    const stars = starsFor(percent);
    const score = correctCount * game.pointsPerCorrect;

    const activity = {
      points: score,
      stars,
      gamesPlayed: 1,
      activeSeconds: data.durationSeconds ?? 0,
      perfectGame: correctCount === total,
    };

    const { session, stats } = await prisma.$transaction(async tx => {
      const created = await tx.gameSession.create({
        data: {
          childId: child.id,
          gameId: id,
          totalItems: total,
          correctCount: correctCount,
          wrongCount: wrongCount,
          score,
          stars,
          durationSeconds: data.durationSeconds ?? null,
        },
      });

      return { session: created, stats: await this.activityService.writeStats(tx, child.id, activity) };
    });

    const awards = await this.activityService.grantAwards(child.id, stats, activity);

    return {
      success: true,
      _message: 'game completed',
      data: { session, percent, results, stats, awards },
    };
  }

  private async closeRound(roundId: string, gameId: string, childId: string) {
    const round = await prisma.gameRound.findUnique({ where: { id: roundId } });

    if (!round || round.gameId !== gameId || round.childId !== childId) {
      throw new NotFound('round not found');
    }

    const { count } = await prisma.gameRound.updateMany({
      where: { id: roundId, submittedAt: null },
      data: { submittedAt: new Date() },
    });

    if (!count) {
      throw new BadRequest('this round has already been submitted');
    }

    return round;
  }

  private gradeRound(
    code: GAME_TYPE,
    round: { layout: Prisma.JsonValue },
    roundItemIds: string[],
    correctByItem: Map<string, string>,
    data: SubmitGameInput,
  ): GameAnswerResult[] {
    if (code === GAME_TYPE.PUZZLE || code === GAME_TYPE.MEMORY) {
      const itemId = roundItemIds[0];

      if (!itemId) return [];

      const layout = (round.layout ?? []) as unknown;
      const moves = data.moves as Move[];

      const solved =
        code === GAME_TYPE.PUZZLE
          ? verifyPuzzle(layout as number[], moves)
          : verifyMemory(layout as string[], moves);

      const correctValue = correctByItem.get(itemId) ?? '';

      return [{ itemId, selected: solved ? correctValue : null, correctValue, isCorrect: solved }];
    }

    const answered = new Map(data.answers.map(answer => [answer.itemId, answer.value ?? null]));

    return roundItemIds.map(itemId => {
      const selected = answered.get(itemId) ?? null;
      const correctValue = correctByItem.get(itemId) ?? '';

      return { itemId, selected, correctValue, isCorrect: selected != null && selected === correctValue };
    });
  }

  private async findGame(id: string) {
    const game = await prisma.game.findUnique({ where: { id } });

    if (!game) {
      throw new NotFound('game not found');
    }

    return game;
  }

  private async findPlayableGame(id: string) {
    const game = await this.findGame(id);

    if (!game.active) {
      throw new NotFound('game not found');
    }

    if (game.ageGroup !== this.child!.ageGroup) {
      throw new BadRequest('this game is not for your age group');
    }

    return game;
  }

  private async assertCategory(categoryId?: string | null) {
    if (!categoryId) return;

    const category = await prisma.category.findUnique({ where: { id: categoryId } });

    if (!category) {
      throw new BadRequest('category not found');
    }
  }

  private buildWhere(term: string | null | undefined, filters: GameSearch): Prisma.GameWhereInput {
    const where: Prisma.GameWhereInput = {};

    if (this.user?.isAdmin) {
      if (filters.active !== undefined) where.active = filters.active;
    } else {
      where.active = true;
    }

    if (filters.ageGroup) {
      where.ageGroup = filters.ageGroup;
    }

    if (filters.code) {
      where.code = filters.code;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (term?.trim()) {
      const contains = { contains: term.trim(), mode: Prisma.QueryMode.insensitive };
      where.OR = [{ title: contains }, { description: contains }, { category: { name: contains } }];
    }

    return where;
  }
}
