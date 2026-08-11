import prisma from '@/modules/db';
import { PlatformContext } from '@tsed/common';
import { Inject, Injectable, InjectContext } from '@tsed/di';
import { Request } from 'express';
import { PROGRESS_STATUS } from '@/generated/prisma';
import { AWARD_RULES, categoryMasterAward } from '@/utils/awards';
import { NotificationService } from '@/services/notification.service';
import { ChildService } from '@/services/child.service';
import { AwardContext, AwardDraft } from '@/types/award';

@Injectable()
export class AwardService {
  @Inject()
  private notificationService!: NotificationService;

  @Inject()
  private childService!: ChildService;

  @InjectContext()
  private context!: PlatformContext;

  async me() {
    return this.listForChild(this.context.getRequest<Request>().child!.id);
  }

  async listAccessible(childId: string) {
    await this.childService.findAccessible(childId, { id: true });

    return this.listForChild(childId);
  }

  async listForChild(childId: string) {
    const awards = await prisma.award.findMany({
      where: { childId: childId },
      orderBy: { earnedAt: 'desc' },
    });

    const earned = new Set(awards.map(award => award.code));
    const locked = AWARD_RULES.filter(rule => !earned.has(rule.code)).map(({ check, ...rule }) => rule);

    return { success: true, data: { earned: awards, locked, count: awards.length } };
  }

  async evaluate(childId: string, context: AwardContext) {
    const candidates = AWARD_RULES.filter(rule => rule.check(context)).map(({ check, ...rule }) => rule);

    return this.grant(childId, candidates);
  }

  async evaluateCategoryMastery(childId: string, categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, slug: true },
    });

    if (!category) return [];

    const [total, completed] = await prisma.$transaction([
      prisma.lesson.count({ where: { categoryId: categoryId, active: true } }),
      prisma.lessonProgress.count({
        where: {
          childId: childId,
          status: PROGRESS_STATUS.COMPLETED,
          lesson: { categoryId: categoryId, active: true },
        },
      }),
    ]);

    if (total === 0 || completed < total) return [];

    return this.grant(childId, [categoryMasterAward(category)]);
  }

  async grant(childId: string, candidates: AwardDraft[]) {
    if (!candidates.length) return [];

    const codes = candidates.map(candidate => candidate.code);

    const existing = await prisma.award.findMany({
      where: { childId: childId, code: { in: codes } },
      select: { code: true },
    });

    const earned = new Set(existing.map(award => award.code));
    const fresh = candidates.filter(candidate => !earned.has(candidate.code));

    if (!fresh.length) return [];

    await prisma.award.createMany({
      data: fresh.map(award => ({ childId: childId, ...award })),
      skipDuplicates: true,
    });

    const created = await prisma.award.findMany({
      where: { childId: childId, code: { in: fresh.map(award => award.code) } },
    });

    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { id: true, parentId: true, fullName: true },
    });

    if (child && created.length) {
      await this.notificationService.notifyAwards(child, created);
    }

    return created;
  }
}
