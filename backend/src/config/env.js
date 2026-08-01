require('dotenv').config();

const required = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Eksik ortam değişkeni: ${key}. .env dosyanızı kontrol edin.`);
  }
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  pgSsl: process.env.PGSSL === 'true',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
};
