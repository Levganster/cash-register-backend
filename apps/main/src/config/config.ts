export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  ACCESS_SECRET: process.env.ACCESS_SECRET,
  REFRESH_SECRET: process.env.REFRESH_SECRET,
  CACHE_TTL: parseInt(process.env.CACHE_TTL, 10) || 300, // milliseconds
  MAX_SESSIONS_PER_USER: parseInt(process.env.MAX_SESSIONS_PER_USER, 10) || 5,
  SWAGGER_USER: process.env.SWAGGER_USER,
  SWAGGER_PASSWORD: process.env.SWAGGER_PASSWORD,
});
