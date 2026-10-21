-- V9__room_rates_and_wage_rename.sql
--
-- 1. Wage & Salary section: "Total Wage-Salary" becomes "Minimum Monthly
--    Salary (Gross)" — a different figure (a monthly floor, not a period
--    total), so the column is renamed rather than reinterpreted in place.
--    No production data exists in this column (confirmed before writing
--    this migration), so a rename is safe.
-- 2. New yearly section "Rates of Rooms per Year": a rate per accommodation
--    category per reporting year. Room categories themselves are owned by
--    EstablishmentAccommodationCategories (not user-editable here), so this
--    table only adds a rate on top of an existing category — hence the FK
--    with ON DELETE CASCADE (a rate makes no sense once its category is
--    gone).

ALTER TABLE "EstablishmentWageStats"
  RENAME COLUMN "totalWageSalary" TO "minimumMonthlySalaryGross";

CREATE TABLE IF NOT EXISTS "EstablishmentRoomRates" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "establishmentId" UUID NOT NULL REFERENCES "BusinessRegistration"(id) ON DELETE CASCADE,
  "accommodationCategoryId" UUID NOT NULL REFERENCES "EstablishmentAccommodationCategories"(id) ON DELETE CASCADE,
  "reportingYear" INTEGER NOT NULL,
  "rate" NUMERIC(12, 2),
  "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("accommodationCategoryId", "reportingYear")
);
CREATE INDEX IF NOT EXISTS "idx_room_rates_establishment_year"
  ON "EstablishmentRoomRates" ("establishmentId", "reportingYear");
