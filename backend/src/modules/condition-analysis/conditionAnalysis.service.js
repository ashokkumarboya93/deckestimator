// =============================================
// Deck Estimator — Condition Analysis Service (Phase 7)
// =============================================

const ConditionAnalysis = require('./conditionAnalysis.model');
const Deck = require('../decks/deck.model');
const DeckImage = require('../files/deckImage.model');
const storageProvider = require('../files/storageProvider');
const { mlClient } = require('./mlClient');
const AuditLog = require('../../shared/models/auditLog.model');
const { ROLES } = require('../../shared/constants');

/**
 * Verify if the requesting user has access to the deck project.
 */
async function assertDeckAccess(deckId, user) {
  const deck = await Deck.findById(deckId);
  if (!deck) {
    const err = new Error('Deck project not found');
    err.statusCode = 404;
    err.code = 'DECK_NOT_FOUND';
    throw err;
  }

  if (user.role === ROLES.ADMIN) {
    return deck;
  }

  if (user.role === ROLES.CUSTOMER) {
    if (deck.ownerId.toString() !== user.id.toString()) {
      const err = new Error('You do not have permission to access this deck project.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }
    return deck;
  }

  if (user.role === ROLES.CONTRACTOR) {
    if (deck.ownerId.toString() !== user.id.toString()) {
      const err = new Error('You do not have contractor authorization for this deck project.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }
    return deck;
  }

  const err = new Error('Unauthorized access to deck project.');
  err.statusCode = 403;
  err.code = 'FORBIDDEN';
  throw err;
}

/**
 * Verify if the requesting user has access to a specific analysis.
 */
async function assertAnalysisAccess(analysis, user) {
  if (user.role === ROLES.ADMIN) {
    return;
  }
  if (analysis.ownerId.toString() === user.id.toString() || analysis.requestedBy.toString() === user.id.toString()) {
    return;
  }
  const err = new Error('You do not have permission to view or manage this condition analysis.');
  err.statusCode = 403;
  err.code = 'FORBIDDEN';
  throw err;
}

/**
 * Request and run AI-based condition analysis for a deck.
 */
async function createAnalysis(deckId, user, options = {}) {
  const deck = await assertDeckAccess(deckId, user);

  // Retrieve deck images
  let images = [];
  if (options.imageId) {
    const img = await DeckImage.findOne({ _id: options.imageId, deckId });
    if (!img) {
      const err = new Error('Specified image was not found for this deck project.');
      err.statusCode = 404;
      err.code = 'IMAGE_NOT_FOUND';
      throw err;
    }
    images = [img];
  } else {
    images = await DeckImage.find({ deckId }).sort({ createdAt: -1 });
  }

  if (!images || images.length === 0) {
    const err = new Error('No uploaded photos found for this deck project. Please upload photos before requesting condition analysis.');
    err.statusCode = 400;
    err.code = 'NO_IMAGES_AVAILABLE';
    throw err;
  }

  // Use the primary image (first selected/latest uploaded)
  const primaryImage = images[0];
  const filePath = storageProvider.getFilePath(primaryImage.storageKey);

  if (!filePath) {
    const err = new Error('The image file could not be located in physical storage.');
    err.statusCode = 404;
    err.code = 'STORAGE_FILE_MISSING';
    throw err;
  }

  const startTime = Date.now();
  const analysisRecord = await ConditionAnalysis.create({
    deckId: deck._id,
    ownerId: deck.ownerId,
    requestedBy: user.id,
    imageReferences: [
      {
        imageId: primaryImage._id,
        storageKey: primaryImage.storageKey,
        originalFilename: primaryImage.originalFilename,
        mimeType: primaryImage.mimeType,
      },
    ],
    analysisStatus: 'PROCESSING',
    analysisStartedAt: new Date(startTime),
    notes: options.notes || '',
  });

  try {
    const mlResponse = await mlClient.analyzeImage(filePath, {
      analysisId: analysisRecord._id,
      deckSurface: deck.surfaceDetails?.material || 'wood',
    });

    const durationMs = Date.now() - startTime;

    // Map response fields
    analysisRecord.analysisStatus = mlResponse.status || 'COMPLETED';
    analysisRecord.conditionLevel = mlResponse.condition?.level ?? null;
    analysisRecord.conditionLabel = mlResponse.condition?.label ?? null;
    analysisRecord.conditionConfidence = mlResponse.condition?.confidence ?? null;

    if (mlResponse.imageQuality) {
      analysisRecord.imageQuality = {
        label: mlResponse.imageQuality.label || 'GOOD',
        confidence: mlResponse.imageQuality.confidence ?? 1.0,
        blurScore: mlResponse.imageQuality.blurScore ?? null,
        brightness: mlResponse.imageQuality.brightness ?? null,
        resolution: mlResponse.imageQuality.resolution ?? null,
      };
    }

    if (Array.isArray(mlResponse.defects)) {
      analysisRecord.defects = mlResponse.defects.map((d) => ({
        label: d.label,
        confidence: d.confidence ?? 0,
        detected: d.detected !== undefined ? d.detected : (d.confidence ?? 0) >= 0.5,
      }));
    }

    if (mlResponse.manualReview) {
      analysisRecord.manualReview = {
        required: Boolean(mlResponse.manualReview.required),
        reason: mlResponse.manualReview.reason || null,
        reviewStatus: mlResponse.manualReview.required ? 'PENDING' : 'NONE',
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: '',
      };
    }

    if (mlResponse.model) {
      analysisRecord.model = {
        name: mlResponse.model.name || 'MobileNetV3-DeckCondition',
        version: mlResponse.model.version || '1.0.0',
        datasetVersion: mlResponse.model.datasetVersion || 'pilot-v1',
      };
    }

    if (Array.isArray(mlResponse.limitations)) {
      analysisRecord.limitations = mlResponse.limitations;
    }

    analysisRecord.inferenceDurationMs = durationMs;
    analysisRecord.analysisCompletedAt = new Date();

    await analysisRecord.save();

    // Audit log
    await AuditLog.create({
      performedBy: user.id,
      action: 'CREATE_CONDITION_ANALYSIS',
      entityType: 'ESTIMATE',
      entityId: analysisRecord._id,
      newValue: {
        deckId: deck._id,
        status: analysisRecord.analysisStatus,
        conditionLevel: analysisRecord.conditionLevel,
        durationMs,
      },
    }).catch(() => null);

    return analysisRecord;
  } catch (err) {
    analysisRecord.analysisStatus = 'FAILED';
    analysisRecord.errorCode = err.code || 'INFERENCE_ERROR';
    analysisRecord.errorMessage = err.message || 'AI inference process encountered an unexpected failure.';
    analysisRecord.analysisCompletedAt = new Date();
    await analysisRecord.save().catch(() => null);

    throw err;
  }
}

/**
 * List all condition analyses for a given deck.
 */
async function getAnalysesByDeckId(deckId, user) {
  await assertDeckAccess(deckId, user);
  const analyses = await ConditionAnalysis.find({ deckId })
    .sort({ createdAt: -1 })
    .populate('requestedBy', 'fullName role')
    .populate('imageReferences.imageId', 'originalFilename storageKey');

  return analyses;
}

/**
 * Retrieve a specific condition analysis by ID.
 */
async function getAnalysisById(analysisId, user) {
  const analysis = await ConditionAnalysis.findById(analysisId)
    .populate('deckId', 'projectName dimensions deckShape surfaceDetails measurementUnit')
    .populate('requestedBy', 'fullName role email')
    .populate('manualReview.reviewedBy', 'fullName role');

  if (!analysis) {
    const err = new Error('Condition analysis record not found');
    err.statusCode = 404;
    err.code = 'ANALYSIS_NOT_FOUND';
    throw err;
  }

  await assertAnalysisAccess(analysis, user);
  return analysis;
}

/**
 * Retry a failed or unable-to-assess analysis.
 */
async function retryAnalysis(analysisId, user) {
  const analysis = await ConditionAnalysis.findById(analysisId);
  if (!analysis) {
    const err = new Error('Condition analysis record not found');
    err.statusCode = 404;
    err.code = 'ANALYSIS_NOT_FOUND';
    throw err;
  }

  await assertAnalysisAccess(analysis, user);

  const primaryRef = analysis.imageReferences[0];
  if (!primaryRef) {
    const err = new Error('No image references associated with this analysis.');
    err.statusCode = 400;
    err.code = 'NO_IMAGE_REFERENCE';
    throw err;
  }

  const filePath = storageProvider.getFilePath(primaryRef.storageKey);
  if (!filePath) {
    const err = new Error('The physical image file for this analysis could not be located.');
    err.statusCode = 404;
    err.code = 'STORAGE_FILE_MISSING';
    throw err;
  }

  const startTime = Date.now();
  analysis.analysisStatus = 'PROCESSING';
  analysis.analysisStartedAt = new Date(startTime);
  analysis.errorCode = null;
  analysis.errorMessage = null;
  await analysis.save();

  try {
    const deck = await Deck.findById(analysis.deckId);
    const mlResponse = await mlClient.analyzeImage(filePath, {
      analysisId: analysis._id,
      deckSurface: deck?.surfaceDetails?.material || 'wood',
    });

    const durationMs = Date.now() - startTime;
    analysis.analysisStatus = mlResponse.status || 'COMPLETED';
    analysis.conditionLevel = mlResponse.condition?.level ?? null;
    analysis.conditionLabel = mlResponse.condition?.label ?? null;
    analysis.conditionConfidence = mlResponse.condition?.confidence ?? null;

    if (mlResponse.imageQuality) {
      analysis.imageQuality = {
        label: mlResponse.imageQuality.label || 'GOOD',
        confidence: mlResponse.imageQuality.confidence ?? 1.0,
        blurScore: mlResponse.imageQuality.blurScore ?? null,
        brightness: mlResponse.imageQuality.brightness ?? null,
        resolution: mlResponse.imageQuality.resolution ?? null,
      };
    }

    if (Array.isArray(mlResponse.defects)) {
      analysis.defects = mlResponse.defects.map((d) => ({
        label: d.label,
        confidence: d.confidence ?? 0,
        detected: d.detected !== undefined ? d.detected : (d.confidence ?? 0) >= 0.5,
      }));
    }

    if (mlResponse.manualReview) {
      analysis.manualReview = {
        required: Boolean(mlResponse.manualReview.required),
        reason: mlResponse.manualReview.reason || null,
        reviewStatus: mlResponse.manualReview.required ? 'PENDING' : 'NONE',
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: '',
      };
    }

    analysis.inferenceDurationMs = durationMs;
    analysis.analysisCompletedAt = new Date();
    await analysis.save();

    return analysis;
  } catch (err) {
    analysis.analysisStatus = 'FAILED';
    analysis.errorCode = err.code || 'INFERENCE_ERROR';
    analysis.errorMessage = err.message || 'Retry inference process failed.';
    analysis.analysisCompletedAt = new Date();
    await analysis.save().catch(() => null);
    throw err;
  }
}

/**
 * Update manual review state (e.g. by Contractor or Admin).
 */
async function updateManualReview(analysisId, user, reviewData) {
  const analysis = await ConditionAnalysis.findById(analysisId);
  if (!analysis) {
    const err = new Error('Condition analysis record not found');
    err.statusCode = 404;
    err.code = 'ANALYSIS_NOT_FOUND';
    throw err;
  }

  // Only Admin or Contractor can resolve reviews
  if (user.role !== ROLES.ADMIN && user.role !== ROLES.CONTRACTOR) {
    const err = new Error('Only administrators or authorized contractors can perform manual review evaluations.');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const oldSnapshot = {
    manualReview: analysis.manualReview,
    conditionLevel: analysis.conditionLevel,
  };

  analysis.manualReview.reviewStatus = reviewData.reviewStatus || 'RESOLVED';
  analysis.manualReview.reviewNotes = reviewData.reviewNotes || '';
  analysis.manualReview.reviewedBy = user.id;
  analysis.manualReview.reviewedAt = new Date();

  if (reviewData.conditionLevel) {
    analysis.conditionLevel = reviewData.conditionLevel;
    if (reviewData.conditionLabel) {
      analysis.conditionLabel = reviewData.conditionLabel;
    }
  }

  // If review is resolved, update status to COMPLETED if it was in review
  if (analysis.manualReview.reviewStatus === 'RESOLVED' && analysis.analysisStatus === 'REQUIRES_MANUAL_REVIEW') {
    analysis.analysisStatus = 'COMPLETED';
  }

  await analysis.save();

  await AuditLog.create({
    performedBy: user.id,
    action: 'UPDATE_ANALYSIS_REVIEW',
    entityType: 'ESTIMATE',
    entityId: analysis._id,
    oldValue: oldSnapshot,
    newValue: {
      reviewStatus: analysis.manualReview.reviewStatus,
      conditionLevel: analysis.conditionLevel,
      reviewNotes: analysis.manualReview.reviewNotes,
    },
  }).catch(() => null);

  return analysis;
}

module.exports = {
  createAnalysis,
  getAnalysesByDeckId,
  getAnalysisById,
  retryAnalysis,
  updateManualReview,
};
