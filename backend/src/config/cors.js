// =============================================
// Deck Estimator — CORS Configuration
// =============================================
// Defines allowed origins for cross-origin requests.

const { env } = require('./env');

function normalizeOrigin(origin) {
  return String(origin || '').trim().replace(/\/+$/, '');
}

function getAllowedOrigins(req) {
  const configured = env.CORS_ORIGIN.split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    configured.push(`https://${normalizeOrigin(process.env.RAILWAY_PUBLIC_DOMAIN)}`);
  }

  const host = req?.get?.('host');
  if (host) {
    const proto = (req.get('x-forwarded-proto') || req.protocol || 'http').split(',')[0].trim();
    configured.push(`${proto}://${host}`);
    configured.push(`https://${host}`);
  }

  return configured;
}

function isOriginAllowed(origin, req) {
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized);
  if (isLocalhost) return true;

  return getAllowedOrigins(req).includes(normalized);
}

const corsOptions = {
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
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

function createCorsOptionsDelegate(req, callback) {
  const origin = req.header('Origin');
  if (isOriginAllowed(origin, req)) {
    callback(null, {
      origin: true,
      credentials: true,
      methods: corsOptions.methods,
      allowedHeaders: corsOptions.allowedHeaders,
      maxAge: corsOptions.maxAge,
    });
  } else {
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  }
}

module.exports = { corsOptions, createCorsOptionsDelegate };

