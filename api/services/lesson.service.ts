import prisma from '@/modules/db';
import { PlatformContext } from '@tsed/common';
import { Inject, Injectable, InjectContext } from '@tsed/di';
import { BadRequest, NotFound } from '@tsed/exceptions';
import { Request } from 'express';
import { Prisma, PROGRESS_STATUS } from '@/generated/prisma';
import { BasicSearch, BasicSearchSchema } from '@/inputs';
import { CreateLessonInput, CreateLessonInputSchema, LessonMediaInput, LessonMediaInputSchema, LessonProgressInput, LessonProgressInputSchema, LessonSearch, LessonSearchSchema, UpdateLessonInput, UpdateLessonInputSchema } from '@/inputs/lesson.input';
import { ActivityService } from '@/services/activity.service';
import { AwardService } from '@/services/award.service';
import { NotificationService } from '@/services/notification.service';
import { LESSON_SORT_KEYS } from '@/types/lesson';
import { buildSorting } from '@/utils/sorting';

@Injectable()
export class LessonService {
  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private activityService!: ActivityService;

  @Inject()
  private awardService!: AwardService;

  @Inject()
  private notificationService!: NotificationService;

  get req() {
    return this.context.getRequest<Request>();
  }

  get user() {
    return this.req.user;
  }

  get child() {
    return this.req.child;
  }

  async pagination(query: BasicSearch, filters: LessonSearch = {}) {
    const search = BasicSearchSchema.parse(query);
    const where = this.buildWhere(search.search, LessonSearchSchema.parse(filters));

    const [items, count] = await prisma.$transaction([
      prisma.lesson.findMany({
        where,
        take: search.size,
        skip: search.skip,
        select: {
          id: true,
          title: true,
          description: true,
          ageGroup: true,
          coverImage: true,
          points: true,
          order: true,
          active: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
          _count: { select: { media: true } },
        },
        orderBy: [buildSorting(search.sortBy, LESSON_SORT_KEYS), { id: 'asc' }] as Prisma.LessonOrderByWithRelationInput[],
      }),
      prisma.lesson.count({ where }),
    ]);

    return { success: true, data: { items, count } };
  }

  async forChild(categoryId?: string) {
    const child = this.child!;

    const lessons = await prisma.lesson.findMany({
      where: {
        active: true,
        ageGroup: child.ageGroup,
        ...(categoryId ? { categoryId: categoryId } : {}),
      },
      select: {
        ...{
          id: true,
          title: true,
          description: true,
          ageGroup: true,
          coverImage: true,
          points: true,
          order: true,
          active: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
          _count: { select: { media: true } },
        },
        progress: {
          where: { childId: child.id },
          select: { status: true, progressPercent: true, completedAt: true },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    const items = lessons.map(({ progress, ...lesson }) => ({
      ...lesson,
      progress: progress[0] ?? { status: PROGRESS_STATUS.NOT_STARTED, progressPercent: 0, completedAt: null },
    }));

    return { success: true, data: { items, count: items.length, ageGroup: child.ageGroup } };
  }

  async get(id: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
        media: { orderBy: { order: 'asc' } },
        ...(this.child
          ? {
              progress: {
                where: { childId: this.child.id },
                select: { status: true, progressPercent: true, watchedSeconds: true, completedAt: true },
              },
            }
          : {}),
      },
    });

    if (!lesson) {
      throw new NotFound('lesson not found');
    }

    return { success: true, data: lesson };
  }

  async create(input: CreateLessonInput) {
    const data = CreateLessonInputSchema.parse(input);

    await this.assertCategory(data.categoryId);

    const { media, ...fields } = data;

    const lesson = await prisma.lesson.create({
      data: {
        ...fields,
        ...(media?.length ? { media: { create: media } } : {}),
      },
      include: { media: { orderBy: { order: 'asc' } }, category: true },
    });

    if (lesson.active) {
      await this.notificationService.notifyNewLesson(lesson);
    }

    return { success: true, _message: 'lesson created', data: lesson };
  }

  async update(id: string, input: UpdateLessonInput) {
    const data = UpdateLessonInputSchema.parse(input);

    const lesson = await prisma.lesson.findUnique({ where: { id } });

    if (!lesson) {
      throw new NotFound('lesson not found');
    }

    if (data.categoryId) {
      await this.assertCategory(data.categoryId);
    }

    const { media, ...fields } = data;

    const updated = await prisma.$transaction(async tx => {
      await tx.lesson.update({ where: { id }, data: fields });

      if (media) {
        await tx.lessonMedia.deleteMany({ where: { lessonId: id } });

        if (media.length) {
          await tx.lessonMedia.createMany({ data: media.map(item => ({ ...item, lessonId: id })) });
        }
      }

      return tx.lesson.findUnique({
        where: { id },
        include: { media: { orderBy: { order: 'asc' } }, category: true },
      });
    });

    return { success: true, _message: 'saved', data: updated };
  }

  async delete(id: string) {
    const lesson = await prisma.lesson.findUnique({ where: { id } });

    if (!lesson) {
      throw new NotFound('lesson not found');
    }

    await prisma.lesson.delete({ where: { id } });

    return { success: true, _message: 'deleted' };
  }

  async addMedia(lessonId: string, input: LessonMediaInput) {
    const data = LessonMediaInputSchema.parse(input);

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });

    if (!lesson) {
      throw new NotFound('lesson not found');
    }

    const media = await prisma.lessonMedia.create({ data: { ...data, lessonId: lessonId } });

    return { success: true, _message: 'media added', data: media };
  }

  async removeMedia(lessonId: string, mediaId: string) {
    const media = await prisma.lessonMedia.findUnique({ where: { id: mediaId } });

    if (!media || media.lessonId !== lessonId) {
      throw new NotFound('media not found');
    }

    await prisma.lessonMedia.delete({ where: { id: mediaId } });

    return { success: true, _message: 'media removed' };
  }

  async saveProgress(lessonId: string, input: LessonProgressInput) {
    const data = LessonProgressInputSchema.parse(input);
    const child = this.child!;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, points: true, active: true, ageGroup: true, categoryId: true },
    });

    if (!lesson || !lesson.active) {
      throw new NotFound('lesson not found');
    }

    if (lesson.ageGroup !== child.ageGroup) {
      throw new BadRequest('this lesson is not for your age group');
    }

    const existing = await prisma.lessonProgress.findUnique({
      where: { childId_lessonId: { childId: child.id, lessonId: lessonId } },
    });

    const status = data.status ?? (data.progressPercent === 100 ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.IN_PROGRESS);
    const isCompleted = status === PROGRESS_STATUS.COMPLETED;
    const completedNow = isCompleted && existing?.status !== PROGRESS_STATUS.COMPLETED;

    const percent = isCompleted ? 100 : (data.progressPercent ?? existing?.progressPercent ?? 0);
    const watched = data.watchedSeconds ?? existing?.watchedSeconds ?? 0;
    const watchedDelta = Math.max(0, watched - (existing?.watchedSeconds ?? 0));
    const points = completedNow ? lesson.points : 0;

    const activity = {
      points,
      lessonsCompleted: completedNow ? 1 : 0,
      activeSeconds: watchedDelta,
    };

    const { progress, stats } = await prisma.$transaction(async tx => {
      const saved = await tx.lessonProgress.upsert({
        where: { childId_lessonId: { childId: child.id, lessonId: lessonId } },
        create: {
          childId: child.id,
          lessonId: lessonId,
          status,
          progressPercent: percent,
          watchedSeconds: watched,
          pointsEarned: points,
          completedAt: isCompleted ? new Date() : null,
        },
        update: {
          status,
          progressPercent: percent,
          watchedSeconds: watched,
          ...(completedNow ? { pointsEarned: { increment: points }, completedAt: new Date() } : {}),
        },
      });

      return { progress: saved, stats: await this.activityService.writeStats(tx, child.id, activity) };
    });

    const awards = await this.activityService.grantAwards(child.id, stats, activity);

    const masteryAwards = completedNow ? await this.awardService.evaluateCategoryMastery(child.id, lesson.categoryId) : [];

    return {
      success: true,
      _message: completedNow ? 'lesson completed' : 'progress saved',
      data: {
        progress,
        pointsEarned: points,
        stats,
        awards: [...awards, ...masteryAwards],
      },
    };
  }

  private async assertCategory(categoryId: string) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });

    if (!category) {
      throw new BadRequest('category not found');
    }
  }

  private buildWhere(term: string | null | undefined, filters: LessonSearch): Prisma.LessonWhereInput {
    const where: Prisma.LessonWhereInput = {};

    where.active = this.user?.isAdmin ? filters.active : true;

    if (where.active === undefined) {
      delete where.active;
    }

    if (filters.ageGroup) {
      where.ageGroup = filters.ageGroup;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.from || filters.to) {
      where.createdAt = {
        ...(filters.from ? { gte: filters.from } : {}),
        ...(filters.to ? { lte: filters.to } : {}),
      };
    }

    if (term?.trim()) {
      const contains = { contains: term.trim(), mode: Prisma.QueryMode.insensitive };
      where.OR = [{ title: contains }, { description: contains }, { category: { name: contains } }];
    }

    return where;
  }
}
