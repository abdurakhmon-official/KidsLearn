import prisma from '@/modules/db';
import { PlatformContext } from '@tsed/common';
import { Injectable, InjectContext } from '@tsed/di';
import { BadRequest, Forbidden, NotFound } from '@tsed/exceptions';
import { Request } from 'express';
import { Prisma } from '@/generated/prisma';
import { BasicSearch, BasicSearchSchema } from '@/inputs';
import { ChildSearch, ChildSearchSchema, CreateChildInput, CreateChildInputSchema, UpdateChildInput, UpdateChildInputSchema } from '@/inputs/child.input';
import { birthDateRangeFor, birthDateRangeForAge, withAge } from '@/utils/age';
import { CHILD_SORT_KEYS } from '@/types/child';
import { dateOnly } from '@/utils/date';
import { buildSorting } from '@/utils/sorting';

@Injectable()
export class ChildService {
  @InjectContext()
  private context!: PlatformContext;

  get req() {
    return this.context.getRequest<Request>();
  }

  get user() {
    return this.req.user;
  }

  async listForParent() {
    const children = await prisma.child.findMany({
      where: { parentId: this.user!.id },
      select: {
        id: true,
        parentId: true,
        fullName: true,
        birthDate: true,
        avatar: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        stats: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return { success: true, data: children.map(withAge) };
  }

  async pagination(query: BasicSearch, filters: ChildSearch = {}) {
    const search = BasicSearchSchema.parse(query);
    const where = this.buildWhere(search.search, ChildSearchSchema.parse(filters));

    const [items, count] = await prisma.$transaction([
      prisma.child.findMany({
        where,
        take: search.size,
        skip: search.skip,
        select: {
          ...{
            id: true,
            parentId: true,
            fullName: true,
            birthDate: true,
            avatar: true,
            active: true,
            createdAt: true,
            updatedAt: true,
            stats: true,
          },
          parent: { select: { id: true, fullName: true, email: true, phone: true } },
        },
        orderBy: [buildSorting(search.sortBy, CHILD_SORT_KEYS), { id: 'asc' }] as Prisma.ChildOrderByWithRelationInput[],
      }),
      prisma.child.count({ where }),
    ]);

    return { success: true, data: { items: items.map(withAge), count } };
  }

  async get(id: string) {
    const child = await this.findAccessible(id, {
      ...{
        id: true,
        parentId: true,
        fullName: true,
        birthDate: true,
        avatar: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        stats: true,
      },
      parent: { select: { id: true, fullName: true, email: true, phone: true } },
    });

    return { success: true, data: withAge(child) };
  }

  async create(input: CreateChildInput) {
    const data = CreateChildInputSchema.parse(input);

    const parentId = this.user!.isAdmin && data.parentId ? data.parentId : this.user!.id;

    const parent = await prisma.user.findUnique({ where: { id: parentId } });

    if (!parent) {
      throw new NotFound('parent not found');
    }

    const duplicate = await prisma.child.findFirst({
      where: { parentId: parentId, fullName: data.fullName },
    });

    if (duplicate) {
      throw new BadRequest('you already have a child with this name');
    }

    const child = await prisma.child.create({
      data: {
        parentId: parentId,
        fullName: data.fullName,
        birthDate: dateOnly(data.birthDate),
        avatar: data.avatar,
        stats: { create: {} },
      },
      select: {
        id: true,
        parentId: true,
        fullName: true,
        birthDate: true,
        avatar: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        stats: true,
      },
    });

    return { success: true, _message: 'child added', data: withAge(child) };
  }

  async update(id: string, input: UpdateChildInput) {
    const data = UpdateChildInputSchema.parse(input);

    await this.findAccessible(id, { id: true });

    const child = await prisma.child.update({
      where: { id },
      data: {
        ...data,
        ...(data.birthDate ? { birthDate: dateOnly(data.birthDate) } : {}),
      },
      select: {
        id: true,
        parentId: true,
        fullName: true,
        birthDate: true,
        avatar: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        stats: true,
      },
    });

    return { success: true, _message: 'saved', data: withAge(child) };
  }

  async delete(id: string) {
    await this.findAccessible(id, { id: true });

    await prisma.child.delete({ where: { id } });

    return { success: true, _message: 'deleted' };
  }

  async findAccessible<T extends Prisma.ChildSelect>(id: string, select: T) {
    const child = await prisma.child.findUnique({ where: { id }, select });

    if (!child) {
      throw new NotFound('child not found');
    }

    const owner = await prisma.child.findUnique({ where: { id }, select: {parentId: true} });

    if (this.req.child && this.req.child.id !== id) {
      throw new Forbidden('You are not authorized to access this resource.');
    }

    if (!this.user!.isAdmin && !this.req.child && owner!.parentId !== this.user!.id) {
      throw new NotFound('child not found');
    }

    return child as Prisma.ChildGetPayload<{ select: T }>;
  }

  private buildWhere(term: string | null | undefined, filters: ChildSearch): Prisma.ChildWhereInput {
    const where: Prisma.ChildWhereInput = {};

    if (this.req.child) {
      where.id = this.req.child.id;
    } else if (!this.user!.isAdmin) {
      where.parentId = this.user!.id;
    } else if (filters.parentId) {
      where.parentId = filters.parentId;
    }

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    if (filters.age !== undefined) {
      where.birthDate = birthDateRangeForAge(filters.age);
    } else if (filters.ageGroup) {
      where.birthDate = birthDateRangeFor(filters.ageGroup);
    }

    if (term?.trim()) {
      const contains = { contains: term.trim(), mode: Prisma.QueryMode.insensitive };

      where.OR = [{ fullName: contains }, { parent: { fullName: contains } }, { parent: { email: contains } }];
    }

    return where;
  }
}
