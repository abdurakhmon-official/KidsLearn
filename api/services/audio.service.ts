import { Inject, Injectable } from '@tsed/di';
import { NotFound } from '@tsed/exceptions';
import prisma from '@/modules/db';
import { Prisma } from '@/generated/prisma';
import { BasicSearch, BasicSearchSchema } from '@/inputs';
import {
  LocaleSchema,
  PhraseAudioSearch,
  PhraseAudioSearchSchema,
  SpeakBatchInput,
  SpeakBatchInputSchema,
  SpeakInput,
  SpeakInputSchema,
  UpsertPhraseAudioInput,
  UpsertPhraseAudioInputSchema,
} from '@/inputs/audio.input';
import { S3Service } from '@/services/s3.service';
import { TtsService } from '@/services/tts.service';
import { PHRASE_AUDIO_SORT_KEYS, TTS_BATCH_CONCURRENCY, TTS_CACHE_TTL_DAYS } from '@/types/audio';
import { buildSorting } from '@/utils/sorting';

@Injectable()
export class AudioService {
  @Inject()
  private ttsService!: TtsService;

  @Inject()
  private s3Service!: S3Service;

  async speak(input: SpeakInput) {
    const { text, locale } = SpeakInputSchema.parse(input);
    const result = await this.ttsService.resolve(text, locale);

    return { success: true, data: result };
  }

  async speakBatch(input: SpeakBatchInput) {
    const { texts, locale } = SpeakBatchInputSchema.parse(input);

    const unique = [...new Set(texts.map(text => text.trim()).filter(Boolean))];
    const items: Record<string, string> = {};

    if (!this.ttsService.enabled) {
      return { success: true, data: { items, enabled: false } };
    }

    for (let index = 0; index < unique.length; index += TTS_BATCH_CONCURRENCY) {
      const slice = unique.slice(index, index + TTS_BATCH_CONCURRENCY);

      await Promise.all(
        slice.map(async text => {
          const result = await this.ttsService.resolve(text, locale).catch(error => {
            console.error('tts batch item failed', { locale, text: text.slice(0, 60), message: error?.message });
            return null;
          });

          if (result) {
            items[text] = result.url;
          }
        }),
      );
    }

    return { success: true, data: { items, enabled: true } };
  }

  async phrases(locale: string) {
    const parsed = LocaleSchema.parse(locale || undefined);

    const rows = await prisma.phraseAudio.findMany({
      where: { locale: parsed, active: true },
      select: { key: true, url: true, durationMs: true },
    });

    const items = Object.fromEntries(rows.map(row => [row.key, row.url]));

    return { success: true, data: { locale: parsed, items } };
  }

  async pruneTtsCache(olderThanDays: number = TTS_CACHE_TTL_DAYS) {
    const days = Math.max(1, Math.floor(olderThanDays));
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const stale = await prisma.ttsCache.findMany({
      where: { lastUsedAt: { lt: cutoff } },
      select: { hash: true, key: true },
    });

    if (!stale.length) {
      return { success: true, _message: 'nothing to prune', data: { removed: 0, days } };
    }

    await this.s3Service.deleteObjects(stale.map(row => row.key));

    const { count } = await prisma.ttsCache.deleteMany({
      where: { hash: { in: stale.map(row => row.hash) } },
    });

    return { success: true, _message: 'tts cache pruned', data: { removed: count, days } };
  }

  async pagination(query: BasicSearch, filters: PhraseAudioSearch = {}) {
    const search = BasicSearchSchema.parse(query);
    const where = this.buildWhere(search.search, PhraseAudioSearchSchema.parse(filters));

    const [items, count] = await prisma.$transaction([
      prisma.phraseAudio.findMany({
        where,
        take: search.size,
        skip: search.skip,
        orderBy: [buildSorting(search.sortBy, PHRASE_AUDIO_SORT_KEYS), { id: 'asc' }] as Prisma.PhraseAudioOrderByWithRelationInput[],
      }),
      prisma.phraseAudio.count({ where }),
    ]);

    return { success: true, data: { items, count } };
  }

  async upsert(input: UpsertPhraseAudioInput) {
    const data = UpsertPhraseAudioInputSchema.parse(input);

    const phrase = await prisma.phraseAudio.upsert({
      where: { key_locale: { key: data.key, locale: data.locale } },
      create: data,
      update: data,
    });

    return { success: true, _message: 'phrase audio saved', data: phrase };
  }

  async remove(id: string) {
    const phrase = await prisma.phraseAudio.findUnique({ where: { id } });

    if (!phrase) {
      throw new NotFound('phrase audio not found');
    }

    await prisma.phraseAudio.delete({ where: { id } });

    return { success: true, _message: 'deleted', data: { key: phrase.key } };
  }

  private buildWhere(term: string | null | undefined, filters: PhraseAudioSearch): Prisma.PhraseAudioWhereInput {
    const where: Prisma.PhraseAudioWhereInput = {};

    if (filters.locale) {
      where.locale = filters.locale;
    }

    if (term?.trim()) {
      const contains = { contains: term.trim(), mode: Prisma.QueryMode.insensitive };
      where.OR = [{ key: contains }, { text: contains }];
    }

    return where;
  }
}
