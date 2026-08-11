import prisma from '@/modules/db';
import { PlatformContext } from '@tsed/common';
import { BadRequest, NotFound } from '@tsed/exceptions';
import { Injectable, InjectContext } from '@tsed/di';
import { Request } from 'express';
import { hashPassword } from '@/modules/auth';
import { USER_SORT_KEYS } from '@/types/user';
import { CreateUserInput, CreateUserInputSchema, UpdateUserInput, UpdateUserInputSchema, UpdateUserStatusInput, UpdateUserStatusInputSchema, UserSearch, UserSearchSchema } from '@/inputs/user.input';
import { BasicSearch, BasicSearchSchema } from '@/inputs';
import { Prisma } from '@/generated/prisma';
import { buildSorting } from '@/utils/sorting';

@Injectable()
export class UserService {
  @InjectContext()
  private context!: PlatformContext;

  get req() {
    return this.context.getRequest<Request>();
  }

  get user() {
    return this.req.user;
  }

  async pagination(query: BasicSearch, filters: UserSearch = {}) {
    const search = BasicSearchSchema.parse(query);
    const where = this.buildWhere(search.search, UserSearchSchema.parse(filters));

    const [items, count] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        take: search.size,
        skip: search.skip,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          active: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { children: true } },
        },
        orderBy: [buildSorting(search.sortBy, USER_SORT_KEYS), { id: 'asc' }] as Prisma.UserOrderByWithRelationInput[],
      }),
      prisma.user.count({ where }),
    ]);

    return { success: true, data: { items, count } };
  }

  async get(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...{
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
        children: {
          select: { id: true, fullName: true, birthDate: true, avatar: true, active: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!user) {
      throw new NotFound('user not found');
    }

    return { success: true, data: user };
  }

  async create(input: CreateUserInput) {
    const data = CreateUserInputSchema.parse(input);
    const email = data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new BadRequest('email already exist');
    }

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email,
        password: await hashPassword(data.password),
        role: data.role,
        phone: data.phone,
        avatar: data.avatar,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, _message: 'user created', data: user };
  }

  async update(id: string, input: UpdateUserInput) {
    const data = UpdateUserInputSchema.parse(input);

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFound('user not found');
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, _message: 'saved', data: updated };
  }

  async updateStatus(id: string, input: UpdateUserStatusInput) {
    const data = UpdateUserStatusInputSchema.parse(input);

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFound('user not found');
    }

    if (id === this.user?.id) {
      throw new BadRequest("you can't deactivate your own account");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { active: data.active },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, _message: data.active ? 'user activated' : 'user deactivated', data: updated };
  }

  async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFound('user not found');
    }

    if (id === this.user?.id) {
      throw new BadRequest("you can't delete your own account");
    }

    await prisma.user.delete({ where: { id } });

    return { success: true, _message: 'deleted' };
  }

  private buildWhere(term: string | null | undefined, filters: UserSearch): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    if (term?.trim()) {
      const contains = { contains: term.trim(), mode: Prisma.QueryMode.insensitive };

      where.OR = [
        { fullName: contains },
        { email: contains },
        { phone: contains },
        { children: { some: { fullName: contains } } },
      ];
    }

    return where;
  }
}
