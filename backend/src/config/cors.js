// =============================================
// Deck Estimator — CORS Configuration
// =============================================
// Defines allowed origins for cross-origin requests.

const { env } = require('./env');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, Postman, curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

    // In development, automatically allow all localhost & 127.0.0.1 ports
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost || allowedOrigins.includes(origin)) {
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

