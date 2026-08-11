-- Qidiruv `ILIKE '%...%'` bilan ishlaydi. Oddiy btree indeks bunday shablonga
-- yordam bermaydi — pg_trgm kengaytmasi va GIN indeksi kerak, aks holda
-- har bir qidiruv butun jadvalni skanerlaydi.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "children_full_name_trgm_idx" ON "children" USING gin ("full_name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "users_full_name_trgm_idx" ON "users" USING gin ("full_name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "users_email_trgm_idx"     ON "users" USING gin ("email" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "lessons_title_trgm_idx" ON "lessons" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "games_title_trgm_idx"   ON "games"   USING gin ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "media_assets_original_name_trgm_idx" ON "media_assets" USING gin ("original_name" gin_trgm_ops);
