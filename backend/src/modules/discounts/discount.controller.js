// =============================================
// Deck Estimator — Discount Controller (Phase 9)
// =============================================

const discountService = require('./discount.service');

async function createPolicy(req, res, next) {
  try {
    const policy = await discountService.createDiscountPolicy(req.body, req.user);
    res.status(201).json({
      success: true,
      data: { policy },
      message: 'Discount policy created successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function getPolicies(req, res, next) {
  try {
    const result = await discountService.getDiscountPolicies(req.query);
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
    const policy = await discountService.getDiscountPolicyById(req.params.id);
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
    const policy = await discountService.updateDiscountPolicy(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      data: { policy },
      message: 'Discount policy updated successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function updatePolicyStatus(req, res, next) {
  try {
    const policy = await discountService.updateDiscountPolicyStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    res.status(200).json({
      success: true,
      data: { policy },
      message: `Discount policy status updated to ${req.body.status}.`,
    });
  } catch (err) {
    next(err);
  }
}

async function assignDiscount(req, res, next) {
  try {
    const assignment = await discountService.assignDiscountToContractor(req.body, req.user);
    res.status(201).json({
      success: true,
      data: { assignment },
      message: 'Discount policy assigned to contractor successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function getContractorDiscounts(req, res, next) {
  try {
    const policies = await discountService.getContractorApplicableDiscounts(req.user.id);
    res.status(200).json({
      success: true,
      data: { policies },
    });
  } catch (err) {
    next(err);
  }
}

async function applyDiscount(req, res, next) {
  try {
    const estimate = await discountService.applyDiscountToEstimate(
      req.params.estimateId,
      req.body,
      req.user
    );
    res.status(200).json({
      success: true,
      data: { estimate },
      message: 'Discount applied to estimate successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function getDiscountHistory(req, res, next) {
  try {
    const history = await discountService.getEstimateDiscountHistory(
      req.params.estimateId,
      req.user
    );
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
  updatePolicyStatus,
  assignDiscount,
  getContractorDiscounts,
  applyDiscount,
  getDiscountHistory,
};
