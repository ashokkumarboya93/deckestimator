// =============================================
// Deck Estimator — Estimate Controller
// =============================================

const estimateService = require('./estimate.service');

function getClientIp(req) {
  return req.ip || (req.connection && req.connection.remoteAddress) || null;
}

async function createEstimate(req, res, next) {
  try {
    const estimate = await estimateService.createEstimate(
      req.body,
      req.user,
      getClientIp(req)
    );
    res.status(201).json({
      success: true,
      data: { estimate },
    });
  } catch (error) {
    next(error);
  }
}

async function getEstimates(req, res, next) {
  try {
    const result = await estimateService.getEstimates(req.query, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getEstimateById(req, res, next) {
  try {
    const estimate = await estimateService.getEstimateById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: { estimate },
    });
  } catch (error) {
    next(error);
  }
}

async function recalculateEstimate(req, res, next) {
  try {
    const estimate = await estimateService.recalculateEstimate(
      req.params.id,
      req.body,
      req.user,
      getClientIp(req)
    );
    res.status(200).json({
      success: true,
      data: { estimate },
    });
  } catch (error) {
    next(error);
  }
}

async function getEstimateHistory(req, res, next) {
  try {
    const result = await estimateService.getEstimateHistory(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function updateEstimateStatus(req, res, next) {
  try {
    const estimate = await estimateService.updateEstimateStatus(
      req.params.id,
      req.body.estimateStatus,
      req.body.notes,
      req.user,
      getClientIp(req)
    );
    res.status(200).json({
      success: true,
      data: { estimate },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEstimate,
  getEstimates,
  getEstimateById,
  recalculateEstimate,
  getEstimateHistory,
  updateEstimateStatus,
};

