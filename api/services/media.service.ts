import prisma from '@/modules/db';
import { PlatformContext } from '@tsed/common';
import { Injectable, InjectContext } from '@tsed/di';
import { NotFound } from '@tsed/exceptions';
import { Request } from 'express';
import { Prisma } from '@/generated/prisma';
import { BasicSearch, BasicSearchSchema } from '@/inputs';
import { MediaSearch, MediaSearchSchema, RegisterMediaInput, RegisterMediaInputSchema } from '@/inputs/media.input';
import { MEDIA_SORT_KEYS } from '@/types/media';
import { buildSorting } from '@/utils/sorting';


@Injectable()
export class MediaService {
  @InjectContext()
  private context!: PlatformContext;

  get req() {
    return this.context.getRequest<Request>();
  }

  get user() {
    return this.req.user;
  }

  async pagination(query: BasicSearch, filters: MediaSearch = {}) {
    const search = BasicSearchSchema.parse(query);
    const where = this.buildWhere(search.search, MediaSearchSchema.parse(filters));

    const [items, count] = await prisma.$transaction([
      prisma.mediaAsset.findMany({
        where,
        take: search.size,
        skip: search.skip,
        include: { uploader: { select: { id: true, fullName: true, email: true } } },
        orderBy: [buildSorting(search.sortBy, MEDIA_SORT_KEYS), { id: 'asc' }] as Prisma.MediaAssetOrderByWithRelationInput[],
      }),
      prisma.mediaAsset.count({ where }),
    ]);

    return { success: true, data: { items, count } };
  }

  async get(id: string) {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });

    if (!asset) {
      throw new NotFound('media not found');
    }

    return { success: true, data: asset };
  }

  async register(input: RegisterMediaInput) {
    const data = RegisterMediaInputSchema.parse(input);

    const asset = await prisma.mediaAsset.upsert({
      where: { key: data.key },
      create: { ...data, uploadedById: this.user?.id },
      update: { ...data },
    });

    return { success: true, _message: 'media registered', data: asset };
  }

  async remove(id: string) {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });

    if (!asset) {
      throw new NotFound('media not found');
    }

    await prisma.mediaAsset.delete({ where: { id } });

    return { success: true, _message: 'deleted', data: { key: asset.key } };
  }

  private buildWhere(term: string | null | undefined, filters: MediaSearch): Prisma.MediaAssetWhereInput {
    const where: Prisma.MediaAssetWhereInput = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (term?.trim()) {
      const contains = { contains: term.trim(), mode: Prisma.QueryMode.insensitive };
      where.OR = [{ originalName: contains }, { key: contains }];
    }

    return where;
  }
}
