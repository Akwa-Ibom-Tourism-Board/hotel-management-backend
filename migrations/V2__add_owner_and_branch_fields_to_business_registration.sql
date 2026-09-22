-- V2__add_owner_and_branch_fields_to_business_registration.sql
--
-- ownerId: nullable so pre-seeded/admin-bulk-added establishments (all 557
-- existing rows) stay unowned until an owner claims them via PATCH /:id.
-- parentEstablishmentId: self-FK representing a branch's parent record.

ALTER TABLE "BusinessRegistration"
  ADD COLUMN IF NOT EXISTS "ownerId" UUID REFERENCES "User"(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "parentEstablishmentId" UUID REFERENCES "BusinessRegistration"(id) ON DELETE CASCADE;
