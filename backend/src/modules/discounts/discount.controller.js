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
    const effectiveDiscount = await discountService.getContractorEffectiveDiscount(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        policies,
        effectiveRate: effectiveDiscount.rate,
        effectiveDiscount,
      },
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

async function submitDiscountRequest(req, res, next) {
  try {
    const request = await discountService.submitDiscountRequest(req.body, req.user);
    res.status(201).json({
      success: true,
      data: { request },
      message: 'Discount request submitted successfully. A senior estimator will review your credentials.',
    });
  } catch (err) {
    next(err);
  }
}

async function getMyDiscountRequests(req, res, next) {
  try {
    const requests = await discountService.getContractorDiscountRequests(req.user.id);
    res.status(200).json({
      success: true,
      data: { requests },
    });
  } catch (err) {
    next(err);
  }
}

async function getAdminDiscountRequests(req, res, next) {
  try {
    const requests = await discountService.getAllDiscountRequests(req.query);
    res.status(200).json({
      success: true,
      data: { requests },
    });
  } catch (err) {
    next(err);
  }
}

async function approveDiscountRequest(req, res, next) {
  try {
    const request = await discountService.approveDiscountRequest(
      req.params.id,
      req.body,
      req.user
    );
    res.status(200).json({
      success: true,
      data: { request },
      message: `Discount request approved with ${req.body.discountPercent || 10}% wholesale rate.`,
    });
  } catch (err) {
    next(err);
  }
}

async function rejectDiscountRequest(req, res, next) {
  try {
    const request = await discountService.rejectDiscountRequest(
      req.params.id,
      req.body,
      req.user
    );
    res.status(200).json({
      success: true,
      data: { request },
      message: 'Discount request has been rejected and contractor notified.',
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
  submitDiscountRequest,
  getMyDiscountRequests,
  getAdminDiscountRequests,
  approveDiscountRequest,
  rejectDiscountRequest,
};
