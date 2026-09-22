-- V1__add_auth_fields_to_user.sql
--
-- Adds the NIN + email-OTP + password-reset fields the new /auth feature needs.
-- Left nullable at the DB level (the one existing admin row has none of these) —
-- the application (Joi + Sequelize model validation) enforces them as required
-- on the new registration path; the DB just doesn't enforce it retroactively.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "nin" VARCHAR(11),
  ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "dateOfBirth" DATE,
  ADD COLUMN IF NOT EXISTS "phoneNumber" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "emailOtpHash" TEXT,
  ADD COLUMN IF NOT EXISTS "emailOtpExpiresAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "passwordResetTokenHash" TEXT,
  ADD COLUMN IF NOT EXISTS "passwordResetExpiresAt" TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_nin_key'
  ) THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_nin_key" UNIQUE ("nin");
  END IF;
END
$$;
