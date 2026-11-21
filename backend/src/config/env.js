const path = require('path');
const dotenv = require('dotenv');

// Load environment-specific file in test mode if present, otherwise standard .env
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(__dirname, '../../', envFile) });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requireEnv = (key) => {
  const value = process.env[key];
  if (!value || !String(value).trim()) {
    throw new Error(`[Config] Missing required environment variable: ${key}. Check backend/.env`);
  }
  return String(value).trim();
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: requireEnv('MONGO_URI'),
  allowInMemoryDbFallback: process.env.ALLOW_IN_MEMORY_DB_FALLBACK === 'true',
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '250', 10),
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '20', 10),
  maxAvatarSizeBytes: parseInt(process.env.MAX_AVATAR_SIZE_MB || '2', 10) * 1024 * 1024,
  defaultNewUserPassword: process.env.DEFAULT_NEW_USER_PASSWORD || requireEnv('JWT_SECRET').slice(0, 12),
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || '',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || '',
    hrEmail: process.env.SEED_HR_EMAIL || '',
    hrPassword: process.env.SEED_HR_PASSWORD || '',
    userEmail: process.env.SEED_USER_EMAIL || 'priya.nair@company.com',
    employeePassword: process.env.SEED_EMPLOYEE_PASSWORD || '',
  },
};

module.exports = env;
