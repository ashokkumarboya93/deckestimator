// =============================================
// DECK PRO — Environment Configuration
// =============================================
// Reads and validates required environment variables.
// Fails fast at startup if critical variables are missing.

const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredVars = ['MONGODB_URI'];
if (process.env.NODE_ENV === 'production') {
  requiredVars.push('JWT_SECRET');
}

/**
 * Validate that all required environment variables are set.
 * Throws on missing variables so the server never starts misconfigured.
 */
function validateEnv() {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Copy .env.example to .env and fill in the values.'
    );
  }
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  get isDev() {
    return this.NODE_ENV === 'development';
  },
  get isProd() {
    return this.NODE_ENV === 'production';
  },
  get isTest() {
    return this.NODE_ENV === 'test';
  },
};

module.exports = { env, validateEnv };

