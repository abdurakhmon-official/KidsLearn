-- Boshlangan o'yin raundi: PUZZLE/MEMORY taxtasi serverda saqlanadi va
-- `submittedAt` raundni bir marta yopadi.
-- Jadval nomi snake_case, ustunlar camelCase (loyiha konvensiyasi).

-- CreateTable
CREATE TABLE "game_rounds" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "itemIds" JSONB NOT NULL,
    "layout" JSONB,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_rounds_childId_createdAt_idx" ON "game_rounds"("childId", "createdAt");

-- CreateIndex
CREATE INDEX "game_rounds_gameId_idx" ON "game_rounds"("gameId");

-- AddForeignKey
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_rounds" ADD CONSTRAINT "game_rounds_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
