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
  @Description('Returns a cached text-to-speech audio URL for the given text.')
  async speak(@QueryParams('text') text: string, @QueryParams('locale') locale: string) {
    return await this.audioService.speak({ text, locale: locale as never });
  }

  @Post('/speak/batch')
  @Authorized(Authenticate())
  @Description('Resolves many texts at once so a whole game round can be preloaded.')
  async speakBatch(@BodyParams() data: SpeakBatchInput) {
    return await this.audioService.speakBatch(data);
  }

  @Get('/phrases')
  @Authorized(Authenticate())
  @Description('Recorded audio for interface phrases, as a { key: url } map.')
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
  @Description('Removes generated speech clips that have not been used for a while.')
  async pruneCache(@QueryParams('days') days?: number) {
    return await this.audioService.pruneTtsCache(Number(days) || undefined);
  }
}
