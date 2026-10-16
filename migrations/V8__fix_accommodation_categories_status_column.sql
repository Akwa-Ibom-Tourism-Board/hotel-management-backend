-- V8__fix_accommodation_categories_status_column.sql
--
-- V7 created EstablishmentAccommodationCategories with CREATE TABLE IF NOT
-- EXISTS, which silently no-op'd against the dev database because the table
-- already existed there (created earlier by Sequelize's sync() safety net,
-- before the "status" column was added to the model). This backfills the
-- missing column. Additive-only, idempotent.

ALTER TABLE "EstablishmentAccommodationCategories"
  ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) NOT NULL DEFAULT 'draft';
