import prisma from '@/modules/db';
import { PlatformContext } from '@tsed/common';
import { Inject, Injectable, InjectContext } from '@tsed/di';
import { Request } from 'express';
import { PROGRESS_STATUS } from '@/generated/prisma';
import { ChildService } from '@/services/child.service';
import { withAge } from '@/utils/age';

@Injectable()
export class ProgressService {
  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private childService!: ChildService;

  get req() {
    return this.context.getRequest<Request>();
  }

  get child() {
    return this.req.child;
  }

  async me() {
    return this.forChild(this.child!.id);
  }

  async forChild(childId: string) {
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

    const [lessonsCompleted, lessonsInProgress, totalLessons, sessions, awards, recentSessions] = await prisma.$transaction([
      prisma.lessonProgress.count({ where: { childId: childId, status: PROGRESS_STATUS.COMPLETED } }),
      prisma.lessonProgress.count({ where: { childId: childId, status: PROGRESS_STATUS.IN_PROGRESS } }),
      prisma.lesson.count({ where: { active: true, ageGroup: withAge(child).ageGroup } }),
      prisma.gameSession.aggregate({
        where: { childId: childId },
        _count: { _all: true },
        _sum: { score: true, stars: true, correctCount: true, totalItems: true },
      }),
      prisma.award.findMany({ where: { childId: childId }, orderBy: { earnedAt: 'desc' }, take: 10 }),
      prisma.gameSession.findMany({
        where: { childId: childId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { game: { select: { id: true, title: true, code: true, coverImage: true } } },
      }),
    ]);

    const answered = sessions._sum.totalItems ?? 0;
    const correct = sessions._sum.correctCount ?? 0;

    return {
      success: true,
      data: {
        child: withAge(child),
        stats: child.stats,
        lessons: {
          completed: lessonsCompleted,
          inProgress: lessonsInProgress,
          available: totalLessons,
          percent: totalLessons ? Math.round((lessonsCompleted / totalLessons) * 100) : 0,
        },
        games: {
          played: sessions._count._all,
          totalScore: sessions._sum.score ?? 0,
          totalStars: sessions._sum.stars ?? 0,
          accuracy: answered ? Math.round((correct / answered) * 10000) / 100 : 0,
        },
        awards,
        recentSessions: recentSessions,
      },
    };
  }
}
