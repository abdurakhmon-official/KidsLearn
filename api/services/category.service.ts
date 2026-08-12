import prisma from '@/modules/db';
import { Prisma } from '@/generated/prisma';
import { Inject, Injectable } from '@tsed/di';
import { BadRequest, NotFound } from '@tsed/exceptions';
import { PlatformCache } from '@tsed/platform-cache';
import { CreateCategoryInput, CreateCategoryInputSchema, UpdateCategoryInput, UpdateCategoryInputSchema } from '@/inputs/category.input';
import { slugify } from '@/utils/slug';
import { CATEGORY_CACHE_TTL_MS, DEFAULT_CATEGORY_COLOR, DEFAULT_CATEGORY_ICON } from '@/utils/constants';

@Injectable()
export class CategoryService {
  @Inject()
  private cache!: PlatformCache;

  async list(includeInactive = false) {
    const categories = await this.cache.wrap(
      this.cacheKey(includeInactive),
      () =>
        prisma.category.findMany({
          where: includeInactive ? {} : { active: true },
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
          include: { _count: { select: { lessons: true, games: true } } },
        }),
      CATEGORY_CACHE_TTL_MS,
    );

    return { success: true, data: categories };
  }

  async get(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { lessons: true, games: true } } },
    });

    if (!category) {
      throw new NotFound('category not found');
    }

    return { success: true, data: category };
  }

  async create(input: CreateCategoryInput) {
    const data = CreateCategoryInputSchema.parse(input);
    const slug = slugify(data.slug ?? data.name);

    await this.assertUnique(data.name, slug);

    const category = await prisma.category.create({
      data: {
        ...data,
        slug,
        icon: data.icon?.trim() || DEFAULT_CATEGORY_ICON,
        color: data.color?.trim() || DEFAULT_CATEGORY_COLOR,
      },
    });

    await this.invalidate();

    return { success: true, _message: 'category added', data: category };
  }

  async update(id: string, input: UpdateCategoryInput) {
    const data = UpdateCategoryInputSchema.parse(input);

    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFound('category not found');
    }

    const source = data.slug ?? data.name;
    const slug = source ? slugify(source) : undefined;

    await this.assertUnique(data.name, slug, id);

    const updated = await prisma.category.update({
      where: { id },
      data: { ...data, ...(slug ? { slug } : {}) },
    });

    await this.invalidate();

    return { success: true, _message: 'saved', data: updated };
  }

  async delete(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { lessons: true, games: true } } },
    });

    if (!category) {
      throw new NotFound('category not found');
    }

    if (category._count.lessons > 0) {
      throw new BadRequest(`this category still has ${category._count.lessons} lesson(s)`);
    }

    await prisma.category.delete({ where: { id } });
    await this.invalidate();

    return { success: true, _message: 'deleted' };
  }

  private cacheKey(includeInactive: boolean) {
    return `categories:${includeInactive ? 'all' : 'active'}`;
  }

  private async invalidate() {
    await Promise.all([this.cache.del(this.cacheKey(true)), this.cache.del(this.cacheKey(false))]);
  }

  private async assertUnique(name?: string, slug?: string, exceptId?: string) {
    const conflicts = [
      name ? { name: { equals: name, mode: Prisma.QueryMode.insensitive } } : null,
      slug ? { slug } : null,
    ].filter(Boolean) as Prisma.CategoryWhereInput[];

    if (!conflicts.length) return;

    const existing = await prisma.category.findFirst({
      where: { OR: conflicts, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    });

    if (existing) {
      throw new BadRequest('a category with this name or slug already exists');
    }
  }
}
