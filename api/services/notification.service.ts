import prisma from '@/modules/db';
import { PlatformContext } from '@tsed/common';
import { Injectable, InjectContext } from '@tsed/di';
import { NotFound } from '@tsed/exceptions';
import { Request } from 'express';
import { AGE_GROUP, NOTIFICATION_TYPE, Prisma } from '@/generated/prisma';
import { BasicSearch, BasicSearchSchema } from '@/inputs';
import { NotificationSearch, NotificationSearchSchema } from '@/inputs/notification.input';
import { birthDateRangeFor } from '@/utils/age';
import { dateOnly, startOfLocalDay } from '@/utils/date';
import { NOTIFICATION_SORT_KEYS, NotifiableAward, NotificationDraft } from '@/types/notification';
import { buildSorting } from '@/utils/sorting';

@Injectable()
export class NotificationService {
  @InjectContext()
  private context!: PlatformContext;

  get req() {
    return this.context.getRequest<Request>();
  }

  get user() {
    return this.req.user;
  }

  private static readonly BATCH_SIZE = 500;

  async pagination(query: BasicSearch, filters: NotificationSearch = {}) {
    const search = BasicSearchSchema.parse(query);
    const where = this.buildWhere(search.search, NotificationSearchSchema.parse(filters));

    const [items, count, unread] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        take: search.size,
        skip: search.skip,
        include: { child: { select: { id: true, fullName: true, avatar: true } } },
        orderBy: [buildSorting(search.sortBy, NOTIFICATION_SORT_KEYS), { id: 'asc' }] as Prisma.NotificationOrderByWithRelationInput[],
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: this.user!.id, readAt: null } }),
    ]);

    return { success: true, data: { items, count, unread } };
  }

  async markRead(id: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification || notification.userId !== this.user!.id) {
      throw new NotFound('notification not found');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { readAt: notification.readAt ?? new Date() },
    });

    return { success: true, _message: 'marked as read', data: updated };
  }

  async markAllRead() {
    const { count } = await prisma.notification.updateMany({
      where: { userId: this.user!.id, readAt: null },
      data: { readAt: new Date() },
    });

    return { success: true, _message: `${count} notification(s) marked as read` };
  }

  async push(drafts: NotificationDraft[]) {
    let created = 0;

    for (let offset = 0; offset < drafts.length; offset += NotificationService.BATCH_SIZE) {
      const batch = drafts.slice(offset, offset + NotificationService.BATCH_SIZE);

      const { count } = await prisma.notification.createMany({
        data: batch.map(draft => ({ ...draft, data: draft.data ?? Prisma.JsonNull })),
      });

      created += count;
    }

    return created;
  }

  async notifyNewLesson(lesson: { id: string; title: string; ageGroup: AGE_GROUP }) {
    return this.pushForEachChild(
      {
        active: true,
        birthDate: birthDateRangeFor(lesson.ageGroup),
        parent: { active: true },
      },
      child => ({
        userId: child.parentId,
        childId: child.id,
        type: NOTIFICATION_TYPE.NEW_LESSON,
        title: "Yangi dars qo'shildi",
        body: `${child.fullName} uchun yangi dars: "${lesson.title}"`,
        data: { lessonId: lesson.id },
      }),
    );
  }

  async notifyAwards(child: { id: string; parentId: string; fullName: string }, awards: NotifiableAward[]) {
    return this.push(
      awards.map(award => ({
        userId: child.parentId,
        childId: child.id,
        type: NOTIFICATION_TYPE.AWARD_EARNED,
        title: 'Yangi mukofot!',
        body: `${child.fullName} "${award.title}" mukofotini qo'lga kiritdi`,
        data: { code: award.code, medal: award.medal, icon: award.icon ?? null },
      })),
    );
  }

  async runDailyDigest() {
    const today = dateOnly();
    const dayStart = startOfLocalDay();

    const sent = await this.pushForEachChild(
      {
        active: true,
        parent: { active: true },
        dailyActivity: { none: { date: today } },
        notifications: {
          none: { type: NOTIFICATION_TYPE.NO_ACTIVITY_TODAY, createdAt: { gte: dayStart } },
        },
      },
      child => ({
        userId: child.parentId,
        childId: child.id,
        type: NOTIFICATION_TYPE.NO_ACTIVITY_TODAY,
        title: 'Bugun mashg‘ulot bo‘lmadi',
        body: `${child.fullName} bugun hali dars qilmadi. Bir necha daqiqa ajratib bering!`,
      }),
    );

    return { success: true, _message: `${sent} reminder(s) sent`, data: { sent } };
  }

  private async pushForEachChild(
    where: Prisma.ChildWhereInput,
    toDraft: (child: { id: string; parentId: string; fullName: string }) => NotificationDraft,
  ) {
    let cursor: string | undefined;
    let sent = 0;

    for (;;) {
      const children = await prisma.child.findMany({
        where,
        select: { id: true, parentId: true, fullName: true },
        orderBy: { id: 'asc' },
        take: NotificationService.BATCH_SIZE,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      if (!children.length) break;

      sent += await this.push(children.map(toDraft));
      cursor = children[children.length - 1].id;

      if (children.length < NotificationService.BATCH_SIZE) break;
    }

    return sent;
  }

  private buildWhere(term: string | null | undefined, filters: NotificationSearch): Prisma.NotificationWhereInput {
    const where: Prisma.NotificationWhereInput = { userId: this.user!.id };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.childId) {
      where.childId = filters.childId;
    }

    if (filters.unreadOnly) {
      where.readAt = null;
    }

    if (term?.trim()) {
      const contains = { contains: term.trim(), mode: Prisma.QueryMode.insensitive };
      where.OR = [{ title: contains }, { body: contains }];
    }

    return where;
  }
}
