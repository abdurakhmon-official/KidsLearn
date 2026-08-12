import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams, QueryParams } from '@tsed/platform-params';
import { Delete, Description, Get, Post, Put } from '@tsed/schema';
import { AdminOnly, Authenticate, Authorized } from '@/middlewares/auth.middleware';
import { AudioService } from '@/services/audio.service';
import { BasicSearch } from '@/inputs';
import { PhraseAudioSearch, SpeakBatchInput, UpsertPhraseAudioInput } from '@/inputs/audio.input';

@Controller('/audio')
export class AudioController {
  @Inject()
  private audioService!: AudioService;

  @Get('/speak')
  @Authorized(Authenticate())
  async speak(@QueryParams('text') text: string, @QueryParams('locale') locale: string) {
    return await this.audioService.speak({ text, locale: locale as never });
  }

  @Post('/speak/batch')
  @Authorized(Authenticate())
  async speakBatch(@BodyParams() data: SpeakBatchInput) {
    return await this.audioService.speakBatch(data);
  }

  @Get('/phrases')
  @Authorized(Authenticate())
  async phrases(@QueryParams('locale') locale: string) {
    return await this.audioService.phrases(locale);
  }

  @Get('/phrases/list')
  @Authorized(AdminOnly())
  async list(@QueryParams() query: BasicSearch, @QueryParams() filters: PhraseAudioSearch) {
    return await this.audioService.pagination(query, filters);
  }

  @Put('/phrases')
  @Authorized(AdminOnly())
  async upsert(@BodyParams() data: UpsertPhraseAudioInput) {
    return await this.audioService.upsert(data);
  }

  @Delete('/phrases/:id')
  @Authorized(AdminOnly())
  async remove(@PathParams('id') id: string) {
    return await this.audioService.remove(id);
  }

  @Delete('/tts-cache')
  @Authorized(AdminOnly())
  async pruneCache(@QueryParams('days') days?: number) {
    return await this.audioService.pruneTtsCache(Number(days) || undefined);
  }
}
