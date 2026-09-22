const {
  PROD_PORT,
  PROD_NEON_DB_URL,
  PROD_REDIS_URL,
  FRONTEND_URL,
  LUMIID_BASE_URL,
  LUMIID_SECRET_KEY,
} = process.env;

console.log("Running in production mode");

export default {
  PORT: PROD_PORT,
  NEON: PROD_NEON_DB_URL,
  REDIS_URL: PROD_REDIS_URL,
  FRONTEND_URL,
  LUMIID_BASE_URL,
  LUMIID_SECRET_KEY,
};
