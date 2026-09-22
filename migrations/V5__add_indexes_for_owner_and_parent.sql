-- V5__add_indexes_for_owner_and_parent.sql

CREATE INDEX IF NOT EXISTS "idx_business_registration_owner_id" ON "BusinessRegistration" ("ownerId");
CREATE INDEX IF NOT EXISTS "idx_business_registration_parent_id" ON "BusinessRegistration" ("parentEstablishmentId");
