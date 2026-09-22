-- V4__rebuild_registration_status_enum.sql
--
-- Frontend does exact string matching on registrationStatus, so the enum
-- values change from lowercase (pending/approved/rejected/under_review) to
-- capitalized (Draft/Pending/Approved/Rejected). "under_review" is dropped —
-- there is no frontend UI state for it; any existing under_review rows are
-- remapped to Pending (verified: 0 rows currently in that state on the dev DB).

ALTER TYPE "enum_BusinessRegistration_registrationStatus" RENAME TO "enum_BusinessRegistration_registrationStatus_old";

CREATE TYPE "enum_BusinessRegistration_registrationStatus" AS ENUM ('Draft', 'Pending', 'Approved', 'Rejected');

ALTER TABLE "BusinessRegistration"
  ALTER COLUMN "registrationStatus" DROP DEFAULT,
  ALTER COLUMN "registrationStatus" TYPE "enum_BusinessRegistration_registrationStatus"
    USING (
      CASE "registrationStatus"::text
        WHEN 'pending' THEN 'Pending'
        WHEN 'approved' THEN 'Approved'
        WHEN 'rejected' THEN 'Rejected'
        WHEN 'under_review' THEN 'Pending'
        ELSE 'Pending'
      END
    )::"enum_BusinessRegistration_registrationStatus",
  ALTER COLUMN "registrationStatus" SET DEFAULT 'Pending'::"enum_BusinessRegistration_registrationStatus";

DROP TYPE "enum_BusinessRegistration_registrationStatus_old";
