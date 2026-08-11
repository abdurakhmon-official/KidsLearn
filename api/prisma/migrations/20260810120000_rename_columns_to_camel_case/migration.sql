-- Ustun nomlari snake_case dan camelCase ga o‘tkazildi.
-- `RENAME` ishlatilgan — `DROP`+`ADD` ma’lumotni yo‘qotardi.
-- Jadval nomlari snake_case qoladi (SQL konvensiyasi), Prisma ularni `@@map` bilan bog‘laydi.

-- users
ALTER TABLE "users" RENAME COLUMN "full_name" TO "fullName";
ALTER TABLE "users" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "users" RENAME COLUMN "updated_at" TO "updatedAt";

-- children
ALTER TABLE "children" RENAME COLUMN "parent_id" TO "parentId";
ALTER TABLE "children" RENAME COLUMN "full_name" TO "fullName";
ALTER TABLE "children" RENAME COLUMN "birth_date" TO "birthDate";
ALTER TABLE "children" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "children" RENAME COLUMN "updated_at" TO "updatedAt";

-- categories
ALTER TABLE "categories" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "categories" RENAME COLUMN "updated_at" TO "updatedAt";

-- lessons
ALTER TABLE "lessons" RENAME COLUMN "category_id" TO "categoryId";
ALTER TABLE "lessons" RENAME COLUMN "age_group" TO "ageGroup";
ALTER TABLE "lessons" RENAME COLUMN "cover_image" TO "coverImage";
ALTER TABLE "lessons" RENAME COLUMN "video_url" TO "videoUrl";
ALTER TABLE "lessons" RENAME COLUMN "audio_url" TO "audioUrl";
ALTER TABLE "lessons" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "lessons" RENAME COLUMN "updated_at" TO "updatedAt";

-- lesson_media
ALTER TABLE "lesson_media" RENAME COLUMN "lesson_id" TO "lessonId";
ALTER TABLE "lesson_media" RENAME COLUMN "created_at" TO "createdAt";

-- games
ALTER TABLE "games" RENAME COLUMN "category_id" TO "categoryId";
ALTER TABLE "games" RENAME COLUMN "age_group" TO "ageGroup";
ALTER TABLE "games" RENAME COLUMN "cover_image" TO "coverImage";
ALTER TABLE "games" RENAME COLUMN "instruction_audio" TO "instructionAudio";
ALTER TABLE "games" RENAME COLUMN "points_per_correct" TO "pointsPerCorrect";
ALTER TABLE "games" RENAME COLUMN "created_at" TO "createdAt";
ALTER TABLE "games" RENAME COLUMN "updated_at" TO "updatedAt";

-- game_items
ALTER TABLE "game_items" RENAME COLUMN "game_id" TO "gameId";
ALTER TABLE "game_items" RENAME COLUMN "prompt_text" TO "promptText";
ALTER TABLE "game_items" RENAME COLUMN "prompt_image" TO "promptImage";
ALTER TABLE "game_items" RENAME COLUMN "prompt_audio" TO "promptAudio";
ALTER TABLE "game_items" RENAME COLUMN "correct_value" TO "correctValue";
ALTER TABLE "game_items" RENAME COLUMN "created_at" TO "createdAt";

-- media_assets
ALTER TABLE "media_assets" RENAME COLUMN "original_name" TO "originalName";
ALTER TABLE "media_assets" RENAME COLUMN "mime_type" TO "mimeType";
ALTER TABLE "media_assets" RENAME COLUMN "uploaded_by_id" TO "uploadedById";
ALTER TABLE "media_assets" RENAME COLUMN "created_at" TO "createdAt";

-- lesson_progress
ALTER TABLE "lesson_progress" RENAME COLUMN "child_id" TO "childId";
ALTER TABLE "lesson_progress" RENAME COLUMN "lesson_id" TO "lessonId";
ALTER TABLE "lesson_progress" RENAME COLUMN "progress_percent" TO "progressPercent";
ALTER TABLE "lesson_progress" RENAME COLUMN "watched_seconds" TO "watchedSeconds";
ALTER TABLE "lesson_progress" RENAME COLUMN "points_earned" TO "pointsEarned";
ALTER TABLE "lesson_progress" RENAME COLUMN "started_at" TO "startedAt";
ALTER TABLE "lesson_progress" RENAME COLUMN "completed_at" TO "completedAt";
ALTER TABLE "lesson_progress" RENAME COLUMN "updated_at" TO "updatedAt";

-- game_sessions
ALTER TABLE "game_sessions" RENAME COLUMN "child_id" TO "childId";
ALTER TABLE "game_sessions" RENAME COLUMN "game_id" TO "gameId";
ALTER TABLE "game_sessions" RENAME COLUMN "total_items" TO "totalItems";
ALTER TABLE "game_sessions" RENAME COLUMN "correct_count" TO "correctCount";
ALTER TABLE "game_sessions" RENAME COLUMN "wrong_count" TO "wrongCount";
ALTER TABLE "game_sessions" RENAME COLUMN "duration_seconds" TO "durationSeconds";
ALTER TABLE "game_sessions" RENAME COLUMN "created_at" TO "createdAt";

-- child_stats
ALTER TABLE "child_stats" RENAME COLUMN "child_id" TO "childId";
ALTER TABLE "child_stats" RENAME COLUMN "total_points" TO "totalPoints";
ALTER TABLE "child_stats" RENAME COLUMN "total_stars" TO "totalStars";
ALTER TABLE "child_stats" RENAME COLUMN "games_played" TO "gamesPlayed";
ALTER TABLE "child_stats" RENAME COLUMN "lessons_completed" TO "lessonsCompleted";
ALTER TABLE "child_stats" RENAME COLUMN "streak_days" TO "streakDays";
ALTER TABLE "child_stats" RENAME COLUMN "longest_streak" TO "longestStreak";
ALTER TABLE "child_stats" RENAME COLUMN "last_activity_at" TO "lastActivityAt";
ALTER TABLE "child_stats" RENAME COLUMN "updated_at" TO "updatedAt";

-- daily_activity
ALTER TABLE "daily_activity" RENAME COLUMN "child_id" TO "childId";
ALTER TABLE "daily_activity" RENAME COLUMN "games_played" TO "gamesPlayed";
ALTER TABLE "daily_activity" RENAME COLUMN "lessons_completed" TO "lessonsCompleted";
ALTER TABLE "daily_activity" RENAME COLUMN "active_seconds" TO "activeSeconds";

-- awards
ALTER TABLE "awards" RENAME COLUMN "child_id" TO "childId";
ALTER TABLE "awards" RENAME COLUMN "earned_at" TO "earnedAt";

-- notifications
ALTER TABLE "notifications" RENAME COLUMN "user_id" TO "userId";
ALTER TABLE "notifications" RENAME COLUMN "child_id" TO "childId";
ALTER TABLE "notifications" RENAME COLUMN "read_at" TO "readAt";
ALTER TABLE "notifications" RENAME COLUMN "created_at" TO "createdAt";

-- revoked_tokens
ALTER TABLE "revoked_tokens" RENAME COLUMN "expires_at" TO "expiresAt";
ALTER TABLE "revoked_tokens" RENAME COLUMN "created_at" TO "createdAt";

-- Indeks nomlari
ALTER INDEX "awards_child_id_code_key" RENAME TO "awards_childId_code_key";
ALTER INDEX "awards_child_id_earned_at_idx" RENAME TO "awards_childId_earnedAt_idx";
ALTER INDEX "children_birth_date_idx" RENAME TO "children_birthDate_idx";
ALTER INDEX "children_full_name_trgm_idx" RENAME TO "children_fullName_trgm_idx";
ALTER INDEX "children_parent_id_idx" RENAME TO "children_parentId_idx";
ALTER INDEX "daily_activity_child_id_date_key" RENAME TO "daily_activity_childId_date_key";
ALTER INDEX "game_items_game_id_idx" RENAME TO "game_items_gameId_idx";
ALTER INDEX "game_sessions_child_id_created_at_idx" RENAME TO "game_sessions_childId_createdAt_idx";
ALTER INDEX "game_sessions_game_id_idx" RENAME TO "game_sessions_gameId_idx";
ALTER INDEX "games_age_group_active_idx" RENAME TO "games_ageGroup_active_idx";
ALTER INDEX "games_category_id_idx" RENAME TO "games_categoryId_idx";
ALTER INDEX "lesson_media_lesson_id_idx" RENAME TO "lesson_media_lessonId_idx";
ALTER INDEX "lesson_progress_child_id_lesson_id_key" RENAME TO "lesson_progress_childId_lessonId_key";
ALTER INDEX "lesson_progress_child_id_status_idx" RENAME TO "lesson_progress_childId_status_idx";
ALTER INDEX "lesson_progress_lesson_id_idx" RENAME TO "lesson_progress_lessonId_idx";
ALTER INDEX "lessons_age_group_active_idx" RENAME TO "lessons_ageGroup_active_idx";
ALTER INDEX "lessons_category_id_idx" RENAME TO "lessons_categoryId_idx";
ALTER INDEX "lessons_created_at_idx" RENAME TO "lessons_createdAt_idx";
ALTER INDEX "media_assets_created_at_idx" RENAME TO "media_assets_createdAt_idx";
ALTER INDEX "media_assets_original_name_trgm_idx" RENAME TO "media_assets_originalName_trgm_idx";
ALTER INDEX "notifications_created_at_idx" RENAME TO "notifications_createdAt_idx";
ALTER INDEX "notifications_user_id_read_at_idx" RENAME TO "notifications_userId_readAt_idx";
ALTER INDEX "revoked_tokens_expires_at_idx" RENAME TO "revoked_tokens_expiresAt_idx";
ALTER INDEX "users_full_name_trgm_idx" RENAME TO "users_fullName_trgm_idx";

-- Tashqi kalit cheklovlari
ALTER TABLE "awards" RENAME CONSTRAINT "awards_child_id_fkey" TO "awards_childId_fkey";
ALTER TABLE "child_stats" RENAME CONSTRAINT "child_stats_child_id_fkey" TO "child_stats_childId_fkey";
ALTER TABLE "children" RENAME CONSTRAINT "children_parent_id_fkey" TO "children_parentId_fkey";
ALTER TABLE "daily_activity" RENAME CONSTRAINT "daily_activity_child_id_fkey" TO "daily_activity_childId_fkey";
ALTER TABLE "game_items" RENAME CONSTRAINT "game_items_game_id_fkey" TO "game_items_gameId_fkey";
ALTER TABLE "game_sessions" RENAME CONSTRAINT "game_sessions_child_id_fkey" TO "game_sessions_childId_fkey";
ALTER TABLE "game_sessions" RENAME CONSTRAINT "game_sessions_game_id_fkey" TO "game_sessions_gameId_fkey";
ALTER TABLE "games" RENAME CONSTRAINT "games_category_id_fkey" TO "games_categoryId_fkey";
ALTER TABLE "lesson_media" RENAME CONSTRAINT "lesson_media_lesson_id_fkey" TO "lesson_media_lessonId_fkey";
ALTER TABLE "lesson_progress" RENAME CONSTRAINT "lesson_progress_child_id_fkey" TO "lesson_progress_childId_fkey";
ALTER TABLE "lesson_progress" RENAME CONSTRAINT "lesson_progress_lesson_id_fkey" TO "lesson_progress_lessonId_fkey";
ALTER TABLE "lessons" RENAME CONSTRAINT "lessons_category_id_fkey" TO "lessons_categoryId_fkey";
ALTER TABLE "media_assets" RENAME CONSTRAINT "media_assets_uploaded_by_id_fkey" TO "media_assets_uploadedById_fkey";
ALTER TABLE "notifications" RENAME CONSTRAINT "notifications_child_id_fkey" TO "notifications_childId_fkey";
ALTER TABLE "notifications" RENAME CONSTRAINT "notifications_user_id_fkey" TO "notifications_userId_fkey";
