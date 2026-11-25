// =============================================
// Deck Estimator — Express Application
// =============================================
// Configures Express middleware and mounts API routes.
// Does NOT start the server — that is server.js's job.

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { corsOptions } = require('./config/cors');
const { env } = require('./config/env');
const { requestId } = require('./middleware/requestId');
const { apiLimiter } = require('./middleware/rateLimiters');
const { sanitizeInput } = require('./middleware/sanitize');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Trust reverse proxies (Railway, Cloudflare, etc.) for rate limiters & secure cookies
app.set('trust proxy', 1);

// --------------- Security & Compression middleware ---------------
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(compression({ threshold: 1024 }));

// --------------- Request parsing & NoSQL Sanitization ---------------
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());
app.use(sanitizeInput);
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), { maxAge: '7d', etag: true }));

// Pre-register all Mongoose schemas to guarantee zero MissingSchemaError during population
require('./modules/users/users.model');
require('./modules/contractors/contractorProfile.model');
require('./modules/decks/deck.model');
require('./modules/estimates/estimate.model');
require('./modules/leads/lead.model');
require('./modules/catalogs/material.model');
require('./modules/catalogs/service.model');
require('./modules/admin/project.model');

// --------------- Request tracing ---------------
app.use(requestId);

// --------------- HTTP request logging ---------------
if (env.isDev) {
  app.use(morgan('dev'));
}

// --------------- Rate limiting ---------------
app.use('/api/', apiLimiter);

// ===============================================
// API Routes — /api/v1
// ===============================================

// Health check (no auth required)
app.get(['/', '/api/v1'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Deck Estimator API v1 is active and running',
    version: '1.0.0',
    environment: env.NODE_ENV,
    health: '/api/v1/health',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// Phase 2: Auth and Users routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/users.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Phase 4: Decks & Images routes
const deckRoutes = require('./modules/decks/deck.routes');

app.use('/api/v1/decks', deckRoutes);

// Phase 5: Catalog Management routes (Materials, Services, Compatibilities)
const catalogRoutes = require('./modules/catalogs/catalog.routes');

app.use('/api/v1/catalog', catalogRoutes);
app.use('/api/v1/catalogs', catalogRoutes);

// Phase 6: Pricing Engine & Estimate Management routes
const pricingRoutes = require('./modules/pricing/pricing.routes');
const estimateRoutes = require('./modules/estimates/estimate.routes');

app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/estimates', estimateRoutes);

// Phase 7: AI-Based Condition Analysis routes
const conditionAnalysisRoutes = require('./modules/condition-analysis/conditionAnalysis.routes');

app.use('/api/v1/condition-analyses', conditionAnalysisRoutes);

// Phase 8: Contractor Verification & Lead Management routes
const contractorRoutes = require('./modules/contractors/contractor.routes');
const leadRoutes = require('./modules/leads/lead.routes');

app.use('/api/v1/contractors', contractorRoutes);
app.use('/api/v1/leads', leadRoutes);

// Phase 9: Contractor Discounts & Commission Management routes
const discountRoutes = require('./modules/discounts/discount.routes');
const commissionRoutes = require('./modules/commissions/commission.routes');

app.use('/api/v1/discounts', discountRoutes);
app.use('/api/v1/commissions', commissionRoutes);

// Notifications routes
const notificationRoutes = require('./modules/notifications/notification.routes');
app.use('/api/v1/notifications', notificationRoutes);

// Phase 10: Administrative Dashboard & Platform Management routes
const adminRoutes = require('./modules/admin/admin.routes');
const adminController = require('./modules/admin/admin.controller');

app.get('/api/v1/settings/public', async (req, res, next) => {
  try {
    const PlatformSetting = require('./modules/admin/platformSetting.model');
    const settings = await PlatformSetting.find({
      $or: [
        { isPublic: true },
        { key: { $in: ['SUPPORT_PHONE', 'WHATSAPP_NUMBER', 'SUPPORT_EMAIL', 'BUSINESS_ADDRESS', 'OPERATING_HOURS', 'COMPANY_NAME', 'BRAND_TAGLINE'] } },
      ],
    }).lean();

    const channels = {
      supportPhone: '(856) 666-8888',
      whatsappNumber: '+1 (856) 555-0199',
      supportEmail: 'support@deckestimator.com',
      businessAddress: '1452 Boardwalk Ave, Cherry Hill, NJ 08002',
      operatingHours: 'Mon - Fri: 8:00 AM - 6:00 PM EST, Sat: 9:00 AM - 2:00 PM EST',
      companyName: 'Deck Restoration Plus',
      brandTagline: 'Commercial & Residential Exterior Wood Restoration Specialists',
    };

    settings.forEach((s) => {
      if (s.key === 'SUPPORT_PHONE' && s.value) channels.supportPhone = s.value;
      if (s.key === 'WHATSAPP_NUMBER' && s.value) channels.whatsappNumber = s.value;
      if (s.key === 'SUPPORT_EMAIL' && s.value) channels.supportEmail = s.value;
      if (s.key === 'BUSINESS_ADDRESS' && s.value) channels.businessAddress = s.value;
      if (s.key === 'OPERATING_HOURS' && s.value) channels.operatingHours = s.value;
      if (s.key === 'COMPANY_NAME' && s.value) channels.companyName = s.value;
      if (s.key === 'BRAND_TAGLINE' && s.value) channels.brandTagline = s.value;
    });

    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).json({ success: true, data: settings, channels });
  } catch (err) {
    next(err);
  }
});
app.use('/api/v1/admin', adminRoutes);

// -----------------------------------------------
// Module routes will be mounted here in later phases:
//
// Phase 5:  app.use('/api/v1/auth', authRoutes);
//           app.use('/api/v1/users', userRoutes);
// Phase 6:  app.use('/api/v1/decks', deckRoutes);
//           app.use('/api/v1/files', fileRoutes);
// Phase 7:  app.use('/api/v1/catalogs', catalogRoutes);
//           app.use('/api/v1/pricing', pricingRoutes);
// Phase 8:  app.use('/api/v1/estimates', estimateRoutes);
// Phase 9:  app.use('/api/v1/condition-analyses', conditionAnalysisRoutes);
// Phase 10: app.use('/api/v1/contractors', contractorRoutes);
//           app.use('/api/v1/leads', leadRoutes);
// Phase 11: app.use('/api/v1/discounts', discountRoutes);
//           app.use('/api/v1/reports', reportRoutes);
//           app.use('/api/v1/admin', adminRoutes);
// -----------------------------------------------

// --------------- 404 handler ---------------
app.use(notFound);

// --------------- Global error handler ---------------
app.use(errorHandler);

module.exports = app;

