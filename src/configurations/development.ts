

const {
    DEV_PORT,
    DEV_NEON_DB_URL,
    DEV_REDIS_URL,
    RESEND_API_KEY
} = process.env

console.log('Running in development mode')

export default {
    PORT: DEV_PORT,
    NEON: DEV_NEON_DB_URL,
    REDIS_URL: DEV_REDIS_URL,
    RESEND_API_KEY
}