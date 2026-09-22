-- V3__relax_business_registration_required_fields.sql
--
-- A Draft-status row can legitimately be missing almost everything except
-- entityType (still enforced NOT NULL) and ownerId (already enforced by the
-- app, not a DB constraint). Full-completeness is enforced by the consolidated
-- Joi schema at the point a Draft is submitted (Pending), not at the DB layer.
--
-- uniqueBusinessId keeps its UNIQUE constraint (Postgres allows multiple NULLs)
-- but is no longer generated until submit time, so it must accept NULL.
--
-- submittedAt is no longer defaulted at row-creation time — it's set
-- explicitly by the app only once a registration actually reaches Pending.

ALTER TABLE "BusinessRegistration"
  ALTER COLUMN "businessName" DROP NOT NULL,
  ALTER COLUMN "uniqueBusinessId" DROP NOT NULL,
  ALTER COLUMN "businessPhoneNumber" DROP NOT NULL,
  ALTER COLUMN "phoneVerified" DROP NOT NULL,
  ALTER COLUMN "address" DROP NOT NULL,
  ALTER COLUMN "localGovernment" DROP NOT NULL,
  ALTER COLUMN "hasWebsite" DROP NOT NULL,
  ALTER COLUMN "yearEstablished" DROP NOT NULL,
  ALTER COLUMN "contactName" DROP NOT NULL,
  ALTER COLUMN "contactPhoneNumber" DROP NOT NULL,
  ALTER COLUMN "contactEmail" DROP NOT NULL,
  ALTER COLUMN "businessEmail" DROP NOT NULL,
  ALTER COLUMN "submittedAt" DROP NOT NULL,
  ALTER COLUMN "submittedAt" DROP DEFAULT;
