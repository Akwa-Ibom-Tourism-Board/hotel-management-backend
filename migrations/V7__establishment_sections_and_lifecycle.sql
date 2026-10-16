-- V7__establishment_sections_and_lifecycle.sql
--
-- Additive-only: new nullable/defaulted columns and new tables, nothing
-- renamed, dropped, or narrowed. Safe to run against live data.
--
-- 1. Account/establishment lifecycle: disable+enable, forced password change
--    for admin-provisioned owner accounts.
-- 2. Owner Details: who to eventually invite, captured at establishment
--    registration time (distinct from contactName/contactEmail, which stay
--    general business-contact info).
-- 3. Five new tables for the sectioned profile: accommodation categories
--    (non-yearly) and four yearly statistics sections.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "BusinessRegistration"
  ADD COLUMN IF NOT EXISTS "ownerFirstName" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "ownerLastName" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "ownerEmail" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "isDisabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "disabledAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "disabledReason" TEXT;

CREATE TABLE IF NOT EXISTS "EstablishmentAccommodationCategories" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "establishmentId" UUID NOT NULL REFERENCES "BusinessRegistration"(id) ON DELETE CASCADE,
  "category" VARCHAR(50) NOT NULL,
  "categoryLabel" VARCHAR(100) NOT NULL,
  "roomCount" INTEGER,
  "bedCount" INTEGER,
  "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_accommodation_categories_establishment_id"
  ON "EstablishmentAccommodationCategories" ("establishmentId");

CREATE TABLE IF NOT EXISTS "EstablishmentEmploymentStats" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "establishmentId" UUID NOT NULL REFERENCES "BusinessRegistration"(id) ON DELETE CASCADE,
  "reportingYear" INTEGER NOT NULL,
  "category" VARCHAR(50) NOT NULL,
  "categoryLabel" VARCHAR(100) NOT NULL,
  "akwaIbomIndigenes" INTEGER,
  "nonIndigenes" INTEGER,
  "foreignEmployees" INTEGER,
  "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "idx_employment_stats_establishment_year"
  ON "EstablishmentEmploymentStats" ("establishmentId", "reportingYear");

CREATE TABLE IF NOT EXISTS "EstablishmentWageStats" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "establishmentId" UUID NOT NULL REFERENCES "BusinessRegistration"(id) ON DELETE CASCADE,
  "reportingYear" INTEGER NOT NULL,
  "employeesPaidCount" INTEGER,
  "totalWageSalary" NUMERIC(14, 2),
  "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("establishmentId", "reportingYear")
);

CREATE TABLE IF NOT EXISTS "EstablishmentGuestArrivalStats" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "establishmentId" UUID NOT NULL REFERENCES "BusinessRegistration"(id) ON DELETE CASCADE,
  "reportingYear" INTEGER NOT NULL,
  "akwaIbomResidents" INTEGER,
  "otherNigerianStates" INTEGER,
  "internationalGuests" INTEGER,
  "mostStateOfArrival" VARCHAR(100),
  "mostCountryOfArrival" VARCHAR(100),
  "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("establishmentId", "reportingYear")
);

CREATE TABLE IF NOT EXISTS "EstablishmentOccupancyStats" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "establishmentId" UUID NOT NULL REFERENCES "BusinessRegistration"(id) ON DELETE CASCADE,
  "reportingYear" INTEGER NOT NULL,
  "availableRooms" INTEGER,
  "roomNightsAvailable" INTEGER,
  "roomNightsSold" INTEGER,
  "totalGuestNights" INTEGER,
  "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("establishmentId", "reportingYear")
);
