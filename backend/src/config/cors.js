// =============================================
// Deck Estimator — CORS Configuration
// =============================================
// Defines allowed origins for cross-origin requests.

const { env } = require('./env');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, Postman, curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim().replace(/\/$/, ''));
    const normalizedOrigin = origin.replace(/\/$/, '');

    // In development, automatically allow all localhost & 127.0.0.1 ports
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isPrivateLan = env.isDev && /^https?:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);
    if (isLocalhost || isPrivateLan || allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600, // 10 minutes preflight cache
};

module.exports = { corsOptions };

