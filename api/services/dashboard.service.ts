import prisma from '@/modules/db';
import { PlatformContext } from '@tsed/common';
import { Inject, Injectable, InjectContext } from '@tsed/di';
import { NotFound } from '@tsed/exceptions';
import { Request } from 'express';
import { PROGRESS_STATUS } from '@/generated/prisma';
import { categoryPerformance as categoryPerformanceQuery } from '@/generated/prisma/sql';
import { LeaderboardSearch, LeaderboardSearchSchema, ParentDashboardQuery, ParentDashboardSchema } from '@/inputs/dashboard.input';
import { ChildService } from '@/services/child.service';
import { birthDateRangeFor, withAge } from '@/utils/age';
import { ActivityChart, AdminChartDay, CategoryPerformance, ChartDay, DailyActivityRow } from '@/types/dashboard';
import { ADMIN_CHART_RANGE_DAYS, MONTHLY_RANGE_DAYS, TOP_SUBJECTS_LIMIT, WEEKLY_RANGE_DAYS } from '@/utils/constants';
import { dateOnly, eachDay, startOfLocalRange, startOfRange, toDateKey } from '@/utils/date';

@Injectable()
export class DashboardService {
  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private childService!: ChildService;

  get req() {
    return this.context.getRequest<Request>();
  }

  get user() {
    return this.req.user;
  }

  async parent(query: ParentDashboardQuery = {}) {
    const params = ParentDashboardSchema.parse(query);
    const childId = params.childId ?? (await this.firstChildId());

    const child = await this.childService.findAccessible(childId, {
      id: true,
      parentId: true,
      fullName: true,
      birthDate: true,
      avatar: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      stats: true,
    });

    const today = dateOnly();
    const weekStart = startOfRange(WEEKLY_RANGE_DAYS);
    const monthStart = startOfRange(MONTHLY_RANGE_DAYS);

    const [todayActivity, monthActivity, lessonsCompleted, awards, recentSessions] = await prisma.$transaction([
      prisma.dailyActivity.findUnique({ where: { childId_date: { childId: childId, date: today } } }),
      prisma.dailyActivity.findMany({
        where: { childId: childId, date: { gte: monthStart } },
        orderBy: { date: 'asc' },
      }),
      prisma.lessonProgress.count({ where: { childId: childId, status: PROGRESS_STATUS.COMPLETED } }),
      prisma.award.findMany({ where: { childId: childId }, orderBy: { earnedAt: 'desc' }, take: 5 }),
      prisma.gameSession.findMany({
        where: { childId: childId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { game: { select: { id: true, title: true, code: true } } },
      }),
    ]);

    const categories = await this.categoryPerformance(childId, startOfLocalRange(MONTHLY_RANGE_DAYS));

    return {
      success: true,
      data: {
        child: withAge(child),
        stats: child.stats,
        today: {
          points: todayActivity?.points ?? 0,
          gamesPlayed: todayActivity?.gamesPlayed ?? 0,
          lessonsCompleted: todayActivity?.lessonsCompleted ?? 0,
          activeMinutes: Math.round((todayActivity?.activeSeconds ?? 0) / 60),
        },
        weekly: this.buildChart(monthActivity, weekStart, today),
        monthly: this.buildChart(monthActivity, monthStart, today),
        totals: {
          lessonsCompleted: lessonsCompleted,
          streakDays: child.stats?.streakDays ?? 0,
          totalPoints: child.stats?.totalPoints ?? 0,
          totalStars: child.stats?.totalStars ?? 0,
        },
        bestSubjects: categories.filter(row => row.sessions > 0).slice(0, TOP_SUBJECTS_LIMIT),
        hardSubjects: [...categories]
          .filter(row => row.sessions > 0)
          .reverse()
          .slice(0, TOP_SUBJECTS_LIMIT),
        recentAwards: awards,
        recentSessions: recentSessions,
      },
    };
  }

  async admin() {
    const today = dateOnly();
    const chartStart = startOfRange(ADMIN_CHART_RANGE_DAYS);

    const [parents, admins, children, lessons, games, mediaAssets, sessions, activeToday, recentPoints] = await prisma.$transaction(
      [
        prisma.user.count({ where: { role: 'PARENT' } }),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.child.count(),
        prisma.lesson.count({ where: { active: true } }),
        prisma.game.count({ where: { active: true } }),
        prisma.mediaAsset.count(),
        prisma.gameSession.count(),
        prisma.dailyActivity.count({ where: { date: today } }),
        prisma.dailyActivity.aggregate({ where: { date: { gte: chartStart } }, _sum: { points: true } }),
      ],
    );

    const daily = await prisma.dailyActivity.groupBy({
      by: ['date'],
      where: { date: { gte: chartStart } },
      _sum: { points: true, gamesPlayed: true, lessonsCompleted: true },
      orderBy: { date: 'asc' },
    });

    const byDate = new Map(daily.map(row => [toDateKey(row.date), row]));

    const chart: AdminChartDay[] = eachDay(chartStart, today).map(day => {
      const key = toDateKey(day);
      const row = byDate.get(key);

      return {
        date: key,
        points: row?._sum.points ?? 0,
        gamesPlayed: row?._sum.gamesPlayed ?? 0,
        lessonsCompleted: row?._sum.lessonsCompleted ?? 0,
      };
    });

    const [group12, group34, group57] = await prisma.$transaction([
      prisma.child.count({ where: { birthDate: birthDateRangeFor('AGE_1_2') } }),
      prisma.child.count({ where: { birthDate: birthDateRangeFor('AGE_3_4') } }),
      prisma.child.count({ where: { birthDate: birthDateRangeFor('AGE_5_7') } }),
    ]);

    return {
      success: true,
      data: {
        totals: {
          parents,
          admins,
          children,
          lessons,
          games,
          mediaAssets: mediaAssets,
          gameSessions: sessions,
          activeChildrenToday: activeToday,
          pointsLast14Days: recentPoints._sum.points ?? 0,
        },
        childrenByAgeGroup: { AGE_1_2: group12, AGE_3_4: group34, AGE_5_7: group57 },
        activityChart: chart,
      },
    };
  }

  async leaderboard(query: LeaderboardSearch) {
    const params = LeaderboardSearchSchema.parse(query);

    const childFilter = {
      active: true,
      ...(params.ageGroup ? { birthDate: birthDateRangeFor(params.ageGroup) } : {}),
    };

    if (params.period === 'all') {
      const rows = await prisma.childStats.findMany({
        where: { child: childFilter },
        orderBy: [{ totalPoints: 'desc' }, { totalStars: 'desc' }],
        take: params.limit,
        include: { child: { select: { id: true, fullName: true, avatar: true, birthDate: true } } },
      });

      return {
        success: true,
        data: rows.map((row, index) => ({
          rank: index + 1,
          points: row.totalPoints,
          stars: row.totalStars,
          streakDays: row.streakDays,
          child: withAge(row.child),
        })),
      };
    }

    const from = startOfRange(params.period === 'week' ? WEEKLY_RANGE_DAYS : MONTHLY_RANGE_DAYS);

    const grouped = await prisma.dailyActivity.groupBy({
      by: ['childId'],
      where: { date: { gte: from }, child: childFilter },
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: params.limit,
    });

    const children = await prisma.child.findMany({
      where: { id: { in: grouped.map(row => row.childId) } },
      select: { ...{ id: true, fullName: true, avatar: true, birthDate: true }, stats: true },
    });

    const byId = new Map(children.map(child => [child.id, child]));

    return {
      success: true,
      data: grouped
        .filter(row => byId.has(row.childId))
        .map((row, index) => {
          const child = byId.get(row.childId)!;

          return {
            rank: index + 1,
            points: row._sum.points ?? 0,
            stars: child.stats?.totalStars ?? 0,
            streakDays: child.stats?.streakDays ?? 0,
            child: withAge(child),
          };
        }),
    };
  }

  private async categoryPerformance(childId: string, from: Date): Promise<CategoryPerformance[]> {
    const rows = await prisma.$queryRawTyped(categoryPerformanceQuery(childId, from));

    return rows
      .map(row => {
        const correct = row.correct ?? 0;
        const total = row.total ?? 0;

        return {
          ...row,
          correct,
          total,
          sessions: row.sessions ?? 0,
          accuracy: total ? Math.round((correct / total) * 10000) / 100 : 0,
        };
      })
      .sort((a, b) => b.accuracy - a.accuracy);
  }

  private buildChart(activity: DailyActivityRow[], from: Date, to: Date): ActivityChart {
    const byDate = new Map(activity.map(row => [toDateKey(row.date), row]));

    const days: ChartDay[] = eachDay(from, to).map(day => {
      const key = toDateKey(day);
      const row = byDate.get(key);

      return {
        date: key,
        points: row?.points ?? 0,
        gamesPlayed: row?.gamesPlayed ?? 0,
        lessonsCompleted: row?.lessonsCompleted ?? 0,
        activeMinutes: Math.round((row?.activeSeconds ?? 0) / 60),
      };
    });

    return {
      days,
      totals: days.reduce(
        (sum, day) => ({
          points: sum.points + day.points,
          gamesPlayed: sum.gamesPlayed + day.gamesPlayed,
          lessonsCompleted: sum.lessonsCompleted + day.lessonsCompleted,
          activeMinutes: sum.activeMinutes + day.activeMinutes,
        }),
        { points: 0, gamesPlayed: 0, lessonsCompleted: 0, activeMinutes: 0 },
      ),
    };
  }

  private async firstChildId() {
    const child = await prisma.child.findFirst({
      where: { parentId: this.user!.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    if (!child) {
      throw new NotFound('you have no children yet');
    }

    return child.id;
  }
}
