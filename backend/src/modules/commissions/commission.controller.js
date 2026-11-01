// =============================================
// Deck Estimator — Commission Controller (Phase 9)
// =============================================

const commissionService = require('./commission.service');

async function createPolicy(req, res, next) {
  try {
    const policy = await commissionService.createCommissionPolicy(req.body, req.user);
    res.status(201).json({
      success: true,
      data: { policy },
      message: 'Commission policy created successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function getPolicies(req, res, next) {
  try {
    const result = await commissionService.getCommissionPolicies(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getPolicyById(req, res, next) {
  try {
    const policy = await commissionService.getCommissionPolicyById(req.params.id);
    res.status(200).json({
      success: true,
      data: { policy },
    });
  } catch (err) {
    next(err);
  }
}

async function updatePolicy(req, res, next) {
  try {
    const policy = await commissionService.updateCommissionPolicy(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      data: { policy },
      message: 'Commission policy updated successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function generateCommission(req, res, next) {
  try {
    const commission = await commissionService.generateCommissionForLead(req.body, req.user);
    res.status(201).json({
      success: true,
      data: { commission },
      message: 'Commission calculated and record created successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function reviewCommission(req, res, next) {
  try {
    const commission = await commissionService.reviewCommission(
      req.params.id,
      req.body,
      req.user
    );
    res.status(200).json({
      success: true,
      data: { commission },
      message: `Commission ${req.body.action.toLowerCase()} action processed successfully.`,
    });
  } catch (err) {
    next(err);
  }
}

async function recordPayment(req, res, next) {
  try {
    const result = await commissionService.recordCommissionPayment(
      req.params.id,
      req.body,
      req.user
    );
    res.status(200).json({
      success: true,
      data: result,
      message: 'Commission payment recorded successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function getCommissions(req, res, next) {
  try {
    const result = await commissionService.getCommissions(req.query, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getCommissionById(req, res, next) {
  try {
    const commission = await commissionService.getCommissionById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: { commission },
    });
  } catch (err) {
    next(err);
  }
}

async function getSummary(req, res, next) {
  try {
    const summary = await commissionService.getCommissionSummary(req.user);
    res.status(200).json({
      success: true,
      data: { summary },
    });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const history = await commissionService.getCommissionHistory(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  generateCommission,
  reviewCommission,
  recordPayment,
  getCommissions,
  getCommissionById,
  getSummary,
  getHistory,
};
