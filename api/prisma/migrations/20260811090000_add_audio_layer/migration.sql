-- Audio qatlami: yozib olingan ovoz uchun joylar va TTS keshi.
-- Jadval nomlari snake_case, ustunlar camelCase (loyiha konvensiyasi).

-- CreateEnum
CREATE TYPE "AUDIO_SOURCE" AS ENUM ('RECORDED', 'TTS');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "audioUrl" TEXT;

-- CreateTable
CREATE TABLE "phrase_audio" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" "AUDIO_SOURCE" NOT NULL DEFAULT 'RECORDED',
    "durationMs" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phrase_audio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tts_cache" (
    "hash" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "provider" TEXT NOT NULL,
    "voice" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "durationMs" INTEGER,
    "bytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tts_cache_pkey" PRIMARY KEY ("hash")
);

-- CreateIndex
CREATE UNIQUE INDEX "phrase_audio_key_locale_key" ON "phrase_audio"("key", "locale");

-- CreateIndex
CREATE INDEX "phrase_audio_locale_active_idx" ON "phrase_audio"("locale", "active");

-- CreateIndex
CREATE INDEX "tts_cache_locale_idx" ON "tts_cache"("locale");

-- CreateIndex
CREATE INDEX "tts_cache_lastUsedAt_idx" ON "tts_cache"("lastUsedAt");
