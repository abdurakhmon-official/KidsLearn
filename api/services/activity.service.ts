import prisma from '@/modules/db';
import { Inject, Injectable } from '@tsed/di';
import { ChildStats, Prisma } from '@/generated/prisma';
import { lockChildStats } from '@/generated/prisma/sql';
import { ActivityInput } from '@/types/activity';
import { dateOnly } from '@/utils/date';
import { nextStreak } from '@/utils/streak';
import { AwardService } from '@/services/award.service';

@Injectable()
export class ActivityService {
  @Inject()
  private awardService!: AwardService;

  async record(childId: string, input: ActivityInput) {
    const stats = await prisma.$transaction(tx => this.writeStats(tx, childId, input));
    const awards = await this.grantAwards(childId, stats, input);

    return { stats, awards };
  }

  async writeStats(tx: Prisma.TransactionClient, childId: string, input: ActivityInput): Promise<ChildStats> {
    const now = new Date();
    const today = dateOnly(now);

    const points = input.points ?? 0;
    const stars = input.stars ?? 0;
    const gamesPlayed = input.gamesPlayed ?? 0;
    const lessonsCompleted = input.lessonsCompleted ?? 0;
    const activeSeconds = input.activeSeconds ?? 0;

    await tx.$queryRawTyped(lockChildStats(childId));

    const current = await tx.childStats.findUnique({ where: { childId: childId } });
    const streak = nextStreak(current, today);

    const updated = await tx.childStats.upsert({
      where: { childId: childId },
      create: {
        childId: childId,
        totalPoints: points,
        totalStars: stars,
        gamesPlayed: gamesPlayed,
        lessonsCompleted: lessonsCompleted,
        streakDays: streak,
        longestStreak: streak,
        lastActivityAt: now,
      },
      update: {
        totalPoints: { increment: points },
        totalStars: { increment: stars },
        gamesPlayed: { increment: gamesPlayed },
        lessonsCompleted: { increment: lessonsCompleted },
        streakDays: streak,
        longestStreak: Math.max(current?.longestStreak ?? 0, streak),
        lastActivityAt: now,
      },
    });

    await tx.dailyActivity.upsert({
      where: { childId_date: { childId: childId, date: today } },
      create: {
        childId: childId,
        date: today,
        points,
        gamesPlayed: gamesPlayed,
        lessonsCompleted: lessonsCompleted,
        activeSeconds: activeSeconds,
      },
      update: {
        points: { increment: points },
        gamesPlayed: { increment: gamesPlayed },
        lessonsCompleted: { increment: lessonsCompleted },
        activeSeconds: { increment: activeSeconds },
      },
    });

    return updated;
  }

  grantAwards(childId: string, stats: ChildStats, input: ActivityInput) {
    return this.awardService.evaluate(childId, { stats, perfectGame: input.perfectGame });
  }
}
