const {
  PROD_PORT,
  PROD_NEON_DB_URL,
  PROD_REDIS_URL,
  PROD_FRONTEND_URL,
  LUMIID_BASE_URL,
  LUMIID_SECRET_KEY,
} = process.env;

if (!PROD_FRONTEND_URL) {
  // Every email CTA link is built from this — if it's missing, links go
  // out as the literal string "undefined/..." instead of silently failing,
  // so this needs to be loud rather than quietly producing broken emails.
  console.error(
    "⚠️  PROD_FRONTEND_URL is not set — every outgoing email link will be broken (e.g. \"undefined/reset-password\").",
  );
}

console.log("Running in production mode");

export default {
  PORT: PROD_PORT,
  NEON: PROD_NEON_DB_URL,
  REDIS_URL: PROD_REDIS_URL,
  FRONTEND_URL: PROD_FRONTEND_URL,
  LUMIID_BASE_URL,
  LUMIID_SECRET_KEY,
};
