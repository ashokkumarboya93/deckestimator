// =============================================
// Deck Estimator — Express Application
// =============================================
// Configures Express middleware and mounts API routes.
// Does NOT start the server — that is server.js's job.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { corsOptions } = require('./config/cors');
const { env } = require('./config/env');
const { requestId } = require('./middleware/requestId');
const { apiLimiter } = require('./middleware/rateLimiters');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// --------------- Security middleware ---------------
app.use(helmet());
app.use(cors(corsOptions));

// --------------- Request parsing ---------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

