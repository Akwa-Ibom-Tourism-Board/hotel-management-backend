const {
  DEV_PORT,
  DEV_NEON_DB_URL,
  DEV_REDIS_URL,
  DEV_FRONTEND_URL,
  LUMIID_BASE_URL,
  LUMIID_DEV_SECRET_KEY,
} = process.env;

console.log("Running in development mode");

export default {
  PORT: DEV_PORT,
  NEON: DEV_NEON_DB_URL,
  REDIS_URL: DEV_REDIS_URL,
  FRONTEND_URL: DEV_FRONTEND_URL || "http://localhost:5173",
  LUMIID_BASE_URL,
  LUMIID_SECRET_KEY: LUMIID_DEV_SECRET_KEY,
};
