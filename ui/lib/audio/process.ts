const TARGET_SAMPLE_RATE = 24_000;

const TARGET_RMS = 0.1;
const PEAK_CEILING = 0.89;
const SILENCE_RMS = 0.005;
const WINDOW = 512;
const PADDING_MS = 60;
const MAX_WAV_SECONDS = 60;
const SAFE_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/mp4", "audio/aac"];

export type ProcessedAudio = {
  file: File;
  processed: boolean;
  durationMs: number;
};

export async function processAudioFile(file: File): Promise<ProcessedAudio> {
  try {
    const decoded = await decode(file);
    const mimeType = file.type.split(";")[0].trim().toLowerCase();

    if (decoded.duration > MAX_WAV_SECONDS && SAFE_TYPES.includes(mimeType)) {
      return { file, processed: false, durationMs: Math.round(decoded.duration * 1000) };
    }

    const mono = await toMono24k(decoded);
    const trimmed = trimSilence(mono);
    const leveled = normalizeLevel(trimmed);
    const wav = encodeWav(leveled, TARGET_SAMPLE_RATE);

    const name = file.name.replace(/\.[^.]+$/, "") || "audio";

    return {
      file: new File([wav], `${name}.wav`, { type: "audio/wav" }),
      processed: true,
      durationMs: Math.round((leveled.length / TARGET_SAMPLE_RATE) * 1000),
    };
  } catch {
    return { file, processed: false, durationMs: 0 };
  }
}

async function decode(file: File): Promise<AudioBuffer> {
  const bytes = await file.arrayBuffer();

  const context = new AudioContext();

  try {
    return await context.decodeAudioData(bytes);
  } finally {
    void context.close();
  }
}

async function toMono24k(buffer: AudioBuffer): Promise<Float32Array> {
  const length = Math.max(1, Math.ceil(buffer.duration * TARGET_SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, length, TARGET_SAMPLE_RATE);

  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start();

  const rendered = await offline.startRendering();

  return rendered.getChannelData(0).slice();
}

function rms(samples: Float32Array, from: number, to: number) {
  let sum = 0;

  for (let index = from; index < to; index++) {
    sum += samples[index] * samples[index];
  }

  return Math.sqrt(sum / Math.max(1, to - from));
}

function trimSilence(samples: Float32Array): Float32Array {
  let first = -1;
  let last = -1;

  for (let start = 0; start < samples.length; start += WINDOW) {
    const end = Math.min(start + WINDOW, samples.length);

    if (rms(samples, start, end) > SILENCE_RMS) {
      if (first < 0) first = start;
      last = end;
    }
  }

  if (first < 0) return samples;

  const padding = Math.round((PADDING_MS / 1000) * TARGET_SAMPLE_RATE);

  return samples.slice(Math.max(0, first - padding), Math.min(samples.length, last + padding));
}

function normalizeLevel(samples: Float32Array): Float32Array {
  const level = rms(samples, 0, samples.length);

  if (!level) return samples;

  let peak = 0;

  for (const sample of samples) {
    const value = Math.abs(sample);
    if (value > peak) peak = value;
  }

  const wanted = TARGET_RMS / level;
  const allowed = peak > 0 ? PEAK_CEILING / peak : wanted;
  const gain = Math.min(wanted, allowed);

  if (Math.abs(gain - 1) < 0.05) return samples;

  const output = new Float32Array(samples.length);

  for (let index = 0; index < samples.length; index++) {
    output[index] = samples[index] * gain;
  }

  return output;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  const writeText = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index++) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
  };

  const dataBytes = samples.length * bytesPerSample;

  writeText(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); 
  view.setUint16(22, 1, true); 
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true); 
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 8 * bytesPerSample, true); 
  writeText(36, "data");
  view.setUint32(40, dataBytes, true);

  let offset = 44;

  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));

    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += bytesPerSample;
  }

  return new Blob([buffer], { type: "audio/wav" });
}
