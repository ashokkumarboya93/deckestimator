// =============================================
// Deck Estimator — Condition Analysis Controller (Phase 7)
// =============================================

const conditionAnalysisService = require('./conditionAnalysis.service');
const { mlClient } = require('./mlClient');

async function createAnalysis(req, res, next) {
  try {
    const { deckId } = req.params;
    const { imageId, notes } = req.body;

    const analysis = await conditionAnalysisService.createAnalysis(deckId, req.user, {
      imageId,
      notes,
    });

    res.status(201).json({
      success: true,
      data: {
        analysis,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getDeckAnalyses(req, res, next) {
  try {
    const { deckId } = req.params;
    const analyses = await conditionAnalysisService.getAnalysesByDeckId(deckId, req.user);

    res.status(200).json({
      success: true,
      data: {
        analyses,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getAnalysisById(req, res, next) {
  try {
    const { id } = req.params;
    const analysis = await conditionAnalysisService.getAnalysisById(id, req.user);

    res.status(200).json({
      success: true,
      data: {
        analysis,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function retryAnalysis(req, res, next) {
  try {
    const { id } = req.params;
    const analysis = await conditionAnalysisService.retryAnalysis(id, req.user);

    res.status(200).json({
      success: true,
      data: {
        analysis,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateReview(req, res, next) {
  try {
    const { id } = req.params;
    const analysis = await conditionAnalysisService.updateManualReview(id, req.user, req.body);

    res.status(200).json({
      success: true,
      data: {
        analysis,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function checkMLHealth(req, res, next) {
  try {
    const health = await mlClient.checkHealth();
    res.status(200).json({
      success: true,
      data: health,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAnalysis,
  getDeckAnalyses,
  getAnalysisById,
  retryAnalysis,
  updateReview,
  checkMLHealth,
};
