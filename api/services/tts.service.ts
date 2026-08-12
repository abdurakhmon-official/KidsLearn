import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@tsed/di';
import { BadRequest, TooManyRequests } from '@tsed/exceptions';
import config from '@/config';
import prisma from '@/modules/db';
import { S3Service } from '@/services/s3.service';

const OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
const CONTENT_TYPE = 'audio/mpeg';

const BITRATE_BYTES_PER_MS = 48_000 / 8 / 1000;

export type TtsResult = {
  url: string;
  cached: boolean;
  durationMs: number | null;
};

@Injectable()
export class TtsService {
  @Inject()
  private s3Service!: S3Service;

  private static inFlight = new Map<string, Promise<TtsResult>>();

  get enabled() {
    return config.tts.provider === 'azure' && Boolean(config.tts.azure.key);
  }

  voiceFor(locale: string) {
    return config.tts.voices[this.normalizeLocale(locale)] ?? config.tts.voices.en;
  }

  async resolve(rawText: string, rawLocale: string): Promise<TtsResult> {
    if (!this.enabled) {
      throw new BadRequest('text-to-speech is not configured on the server');
    }

    const locale = this.normalizeLocale(rawLocale);
    const text = this.normalizeText(rawText);

    if (!text) {
      throw new BadRequest('text is required');
    }

    const voice = this.voiceFor(locale);
    const hash = this.hash(text, locale, voice);

    const cached = await prisma.ttsCache.findUnique({ where: { hash } });

    if (cached) {
      prisma.ttsCache
        .update({ where: { hash }, data: { lastUsedAt: new Date() } })
        .catch(() => undefined);

      return { url: cached.url, cached: true, durationMs: cached.durationMs };
    }

    const pending = TtsService.inFlight.get(hash);

    if (pending) {
      return await pending;
    }

    await this.assertBudget();

    const job = this.generate({ hash, text, locale, voice }).finally(() => {
      TtsService.inFlight.delete(hash);
    });

    TtsService.inFlight.set(hash, job);

    return await job;
  }

  private async assertBudget() {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const used = await prisma.ttsCache.count({ where: { createdAt: { gte: since } } });

    if (used >= config.tts.hourlyBudget) {
      throw new TooManyRequests('speech generation limit reached, please try again later');
    }
  }

  private async generate({
    hash,
    text,
    locale,
    voice,
  }: {
    hash: string;
    text: string;
    locale: string;
    voice: string;
  }): Promise<TtsResult> {
    const audio = await this.synthesizeAzure(text, locale, voice);
    const key = `${config.tts.folder}/${locale}/${hash}.mp3`;

    await this.s3Service.putObject(key, audio, CONTENT_TYPE);

    const url = this.s3Service.assetUrl(key);
    const durationMs = Math.round(audio.byteLength / BITRATE_BYTES_PER_MS);

    await prisma.ttsCache.upsert({
      where: { hash },
      create: {
        hash,
        text,
        locale,
        provider: config.tts.provider,
        voice,
        url,
        key,
        durationMs,
        bytes: audio.byteLength,
      },
      update: { url, key, durationMs, bytes: audio.byteLength, lastUsedAt: new Date() },
    });

    return { url, cached: false, durationMs };
  }

  private async synthesizeAzure(text: string, locale: string, voice: string): Promise<Buffer> {
    const endpoint = `https://${config.tts.azure.region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.tts.azure.key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': OUTPUT_FORMAT,
        'User-Agent': 'kidslearn-api',
      },
      body: this.ssml(text, locale, voice),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new BadRequest(`speech synthesis failed (${response.status}): ${detail.slice(0, 200)}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  private ssml(text: string, locale: string, voice: string) {
    const lang = voice.split('-').slice(0, 2).join('-') || locale;

    return [
      `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">`,
      `<voice name="${voice}">`,
      `<prosody rate="${config.tts.rate}" pitch="${config.tts.pitch}">${this.escape(text)}</prosody>`,
      '</voice>',
      '</speak>',
    ].join('');
  }

  private hash(text: string, locale: string, voice: string) {
    return createHash('sha256')
      .update([config.tts.provider, voice, locale, config.tts.rate, config.tts.pitch, text].join('|'))
      .digest('hex')
      .slice(0, 32);
  }

  private normalizeText(input: string) {
    const text = (input ?? '')

      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length <= config.tts.maxChars) {
      return text;
    }

    const clipped = text.slice(0, config.tts.maxChars);
    const lastSpace = clipped.lastIndexOf(' ');

    return (lastSpace > config.tts.maxChars * 0.6 ? clipped.slice(0, lastSpace) : clipped).trim();
  }

  private normalizeLocale(locale: string) {
    const base = (locale ?? '').toLowerCase().split(/[-_]/)[0];

    return base in config.tts.voices ? base : 'uz';
  }

  private escape(text: string) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
