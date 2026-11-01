// =============================================
// Deck Estimator — Discount Service (Phase 9)
// =============================================

const DiscountPolicy = require('./discountPolicy.model');
const DiscountAssignment = require('./discountAssignment.model');
const DiscountApplication = require('./discountApplication.model');
const Estimate = require('../estimates/estimate.model');
const ContractorProfile = require('../contractors/contractorProfile.model');
const User = require('../users/users.model');
const PricingConfiguration = require('../pricing/pricingConfiguration.model');
const { applyDiscountToCalculation } = require('../pricing/pricingEngine');
const AuditLog = require('../../shared/models/auditLog.model');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../../shared/errors');
const {
  DISCOUNT_POLICY_STATUS,
  VERIFICATION_STATUS,
} = require('../../shared/constants');

/**
 * Creates a new discount policy (Admin only).
 */
async function createDiscountPolicy(policyData, adminUser) {
  const existing = await DiscountPolicy.findOne({
    code: policyData.code.toUpperCase(),
  });
  if (existing) {
    throw new ConflictError(`Discount policy code "${policyData.code}" already exists.`);
  }

  const userId = adminUser.id || adminUser._id;
  const policy = await DiscountPolicy.create({
    ...policyData,
    code: policyData.code.toUpperCase(),
    createdBy: userId,
  });

  await AuditLog.create({
    action: 'DISCOUNT_POLICY_CREATED',
    performedBy: userId,
    entityType: 'DISCOUNT_POLICY',
    entityId: policy._id,
    newValue: { code: policy.code, name: policy.name, type: policy.discountType, value: policy.discountValue },
    status: 'SUCCESS',
  });

  return policy;
}

/**
 * Lists discount policies with filtering and pagination (Admin).
 */
async function getDiscountPolicies(params = {}) {
  const { page = 1, limit = 20, status, discountType, search } = params;
  const query = {};

  if (status) {
    query.status = status;
  }
  if (discountType) {
    query.discountType = discountType;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  const [policies, total] = await Promise.all([
    DiscountPolicy.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email'),
    DiscountPolicy.countDocuments(query),
  ]);

  return {
    policies,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  };
}

/**
 * Gets a single discount policy by ID.
 */
async function getDiscountPolicyById(id) {
  const policy = await DiscountPolicy.findById(id)
    .populate('createdBy', 'fullName email')
    .populate('updatedBy', 'fullName email');
  if (!policy) {
    throw new NotFoundError('Discount policy not found.');
  }
  return policy;
}

/**
 * Updates a discount policy (Admin only).
 */
async function updateDiscountPolicy(id, updateData, adminUser) {
  const policy = await DiscountPolicy.findById(id);
  if (!policy) {
    throw new NotFoundError('Discount policy not found.');
  }

  if (updateData.code && updateData.code.toUpperCase() !== policy.code) {
    const existing = await DiscountPolicy.findOne({
      code: updateData.code.toUpperCase(),
      _id: { $ne: id },
    });
    if (existing) {
      throw new ConflictError(`Discount policy code "${updateData.code}" already exists.`);
    }
  }

  const userId = adminUser.id || adminUser._id;
  const previousSnapshot = { ...policy.toObject() };
  Object.assign(policy, updateData);
  if (updateData.code) policy.code = updateData.code.toUpperCase();
  policy.updatedBy = userId;
  await policy.save();

  await AuditLog.create({
    action: 'DISCOUNT_POLICY_UPDATED',
    performedBy: userId,
    entityType: 'DISCOUNT_POLICY',
    entityId: policy._id,
    previousValue: { name: previousSnapshot.name, status: previousSnapshot.status },
    newValue: { name: policy.name, status: policy.status },
    status: 'SUCCESS',
  });

  return policy;
}

/**
 * Updates discount policy status (Admin only).
 */
async function updateDiscountPolicyStatus(id, newStatus, adminUser) {
  const policy = await DiscountPolicy.findById(id);
  if (!policy) {
    throw new NotFoundError('Discount policy not found.');
  }

  const userId = adminUser.id || adminUser._id;
  const oldStatus = policy.status;
  policy.status = newStatus;
  policy.updatedBy = userId;
  await policy.save();

  await AuditLog.create({
    action: newStatus === DISCOUNT_POLICY_STATUS.ACTIVE ? 'DISCOUNT_POLICY_ACTIVATED' : 'DISCOUNT_POLICY_DEACTIVATED',
    performedBy: userId,
    entityType: 'DISCOUNT_POLICY',
    entityId: policy._id,
    previousValue: { status: oldStatus },
    newValue: { status: newStatus },
    status: 'SUCCESS',
  });

  return policy;
}

/**
 * Assigns an individual discount policy to a verified contractor.
 */
async function assignDiscountToContractor({ contractorId, discountPolicyId, effectiveStartDate, effectiveEndDate, notes }, adminUser) {
  // Validate contractor existence, approved status, and active account
  const contractorUser = await User.findById(contractorId);
  if (!contractorUser || contractorUser.role !== 'contractor') {
    throw new BadRequestError('Specified user is not a contractor.');
  }

  const profile = await ContractorProfile.findOne({ userId: contractorId });
  if (!profile || profile.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
    throw new BadRequestError('Contractor must be approved before receiving discount assignments.');
  }
  if (contractorUser.accountStatus !== 'active') {
    throw new BadRequestError('Contractor account must be active to receive discount assignments.');
  }

  const policy = await DiscountPolicy.findById(discountPolicyId);
  if (!policy) {
    throw new NotFoundError('Discount policy not found.');
  }

  const userId = adminUser.id || adminUser._id;

  // Prevent duplicate active assignment
  const existingAssignment = await DiscountAssignment.findOne({
    contractorId,
    discountPolicyId,
  });

  if (existingAssignment) {
    existingAssignment.status = 'active';
    if (effectiveStartDate) existingAssignment.effectiveStartDate = effectiveStartDate;
    if (effectiveEndDate !== undefined) existingAssignment.effectiveEndDate = effectiveEndDate;
    if (notes) existingAssignment.notes = notes;
    existingAssignment.assignedBy = userId;
    await existingAssignment.save();
    return existingAssignment;
  }

  const assignment = await DiscountAssignment.create({
    contractorId,
    discountPolicyId,
    assignedBy: userId,
    effectiveStartDate: effectiveStartDate || Date.now(),
    effectiveEndDate: effectiveEndDate || null,
    notes: notes || '',
  });

  await AuditLog.create({
    action: 'CONTRACTOR_DISCOUNT_ASSIGNED',
    performedBy: userId,
    entityType: 'DISCOUNT_ASSIGNMENT',
    entityId: assignment._id,
    newValue: { contractorId, discountPolicyId, policyCode: policy.code },
    status: 'SUCCESS',
  });

  return assignment;
}

/**
 * Lists applicable discount policies for a contractor.
 */
async function getContractorApplicableDiscounts(contractorUserId) {
  const profile = await ContractorProfile.findOne({ userId: contractorUserId });
  const isApproved = profile && profile.verificationStatus === VERIFICATION_STATUS.APPROVED;

  if (!isApproved) {
    return [];
  }

  const now = new Date();

  // Find general eligibility active policies
  const generalPolicies = await DiscountPolicy.find({
    isGeneralEligibility: true,
    status: DISCOUNT_POLICY_STATUS.ACTIVE,
    effectiveStartDate: { $lte: now },
    $or: [{ effectiveEndDate: null }, { effectiveEndDate: { $gte: now } }],
  });

  // Find individual assigned policies
  const assignments = await DiscountAssignment.find({
    contractorId: contractorUserId,
    status: 'active',
    effectiveStartDate: { $lte: now },
    $or: [{ effectiveEndDate: null }, { effectiveEndDate: { $gte: now } }],
  }).populate('discountPolicyId');

  const assignedPolicies = assignments
    .map((a) => a.discountPolicyId)
    .filter((p) => p && p.status === DISCOUNT_POLICY_STATUS.ACTIVE);

  // Deduplicate by ID
  const map = new Map();
  [...generalPolicies, ...assignedPolicies].forEach((p) => {
    map.set(p._id.toString(), p);
  });

  return Array.from(map.values());
}

/**
 * Applies an approved discount policy to an estimate.
 */
async function applyDiscountToEstimate(estimateId, { discountPolicyId, discountPolicyCode }, requestingUser) {
  const estimate = await Estimate.findById(estimateId);
  if (!estimate) {
    throw new NotFoundError('Estimate not found.');
  }

  // Verify access: Admin or estimate owner/creator
  const isAdmin = requestingUser.role === 'admin';
  const isOwner = estimate.ownerId.toString() === requestingUser.id ||
    estimate.createdBy.toString() === requestingUser.id;

  if (!isAdmin && !isOwner) {
    throw new ForbiddenError('You do not have permission to apply discounts to this estimate.');
  }

  // Resolve Policy
  let policy;
  if (discountPolicyId) {
    policy = await DiscountPolicy.findById(discountPolicyId);
  } else if (discountPolicyCode) {
    policy = await DiscountPolicy.findOne({ code: discountPolicyCode.toUpperCase() });
  }

  if (!policy) {
    throw new NotFoundError('Discount policy not found.');
  }

  // 1. Verify policy status and dates
  if (policy.status !== DISCOUNT_POLICY_STATUS.ACTIVE) {
    throw new BadRequestError(`Cannot apply discount policy with status "${policy.status}". Policy must be ACTIVE.`);
  }

  const now = new Date();
  if (policy.effectiveStartDate && policy.effectiveStartDate > now) {
    throw new BadRequestError('This discount policy is not yet effective.');
  }
  if (policy.effectiveEndDate && policy.effectiveEndDate < now) {
    throw new BadRequestError('This discount policy has expired.');
  }

  // 2. Check policy usage limit
  if (policy.usageLimit && policy.timesUsed >= policy.usageLimit) {
    throw new BadRequestError('This discount policy has reached its maximum permitted usage limit.');
  }

  // 3. Verify contractor eligibility if applied on a contractor-related estimate
  const contractorId = estimate.estimateType === 'CONTRACTOR' ? estimate.createdBy : requestingUser._id;
  if (!policy.isGeneralEligibility) {
    const assignment = await DiscountAssignment.findOne({
      contractorId,
      discountPolicyId: policy._id,
      status: 'active',
      effectiveStartDate: { $lte: now },
      $or: [{ effectiveEndDate: null }, { effectiveEndDate: { $gte: now } }],
    });

    if (!assignment && !isAdmin) {
      throw new ForbiddenError('You are not eligible for this contractor discount policy.');
    }
  }

  // 4. Retrieve Pricing Config for job minimum and tax rates
  let pricingConfig = null;
  if (estimate.pricingSnapshot?.pricingConfigId) {
    pricingConfig = await PricingConfiguration.findById(estimate.pricingSnapshot.pricingConfigId);
  }
  if (!pricingConfig) {
    pricingConfig = await PricingConfiguration.findOne({ isActive: true });
  }

  // 5. Calculate Discount on the Base (without compounding)
  const baseCalc = {
    subtotal: estimate.subtotal,
    materialsBreakdown: { totalCost: estimate.pricingSnapshot?.materialsSubtotal || 0 },
    servicesBreakdown: { totalCost: estimate.pricingSnapshot?.servicesSubtotal || 0 },
    laborBreakdown: { subtotal: estimate.pricingSnapshot?.laborSubtotal || 0 },
    minimumJobPrice: estimate.minimumJobPrice,
    taxPercentage: estimate.taxPercentage,
  };

  const updatedCalc = applyDiscountToCalculation(baseCalc, policy, pricingConfig);

  if (!updatedCalc.discountBreakdown.applied) {
    throw new BadRequestError(
      `Estimate does not meet the minimum requirement of $${policy.minimumEstimateAmount || 0} for policy "${policy.name}".`
    );
  }

  const reqUserId = requestingUser.id || requestingUser._id;

  // 6. Update estimate fields with the calculated snapshot
  estimate.discountBreakdown = {
    ...updatedCalc.discountBreakdown,
    appliedAt: now,
    appliedBy: reqUserId,
  };
  estimate.minimumAdjustment = updatedCalc.minimumAdjustment;
  estimate.preTaxTotal = updatedCalc.preTaxTotal;
  estimate.taxAmount = updatedCalc.taxAmount;
  estimate.totalAmount = updatedCalc.totalAmount;
  estimate.pricingSnapshot = {
    ...estimate.pricingSnapshot,
    discountBreakdown: estimate.discountBreakdown,
    minimumAdjustment: updatedCalc.minimumAdjustment,
    preTaxTotal: updatedCalc.preTaxTotal,
    taxAmount: updatedCalc.taxAmount,
    finalTotal: updatedCalc.totalAmount,
    discountAppliedAt: now,
  };

  await estimate.save();

  // 7. Atomic usage increment
  await DiscountPolicy.findByIdAndUpdate(policy._id, { $inc: { timesUsed: 1 } });

  // 8. Record immutable DiscountApplication snapshot
  await DiscountApplication.findOneAndUpdate(
    { estimateId: estimate._id, estimateVersion: estimate.version || 1 },
    {
      estimateId: estimate._id,
      estimateVersion: estimate.version || 1,
      contractorId,
      discountPolicyId: policy._id,
      policySnapshot: {
        policyId: policy._id,
        name: policy.name,
        code: policy.code,
        discountType: policy.discountType,
        discountValue: policy.discountValue,
        applicability: policy.applicability,
        minimumEstimateAmount: policy.minimumEstimateAmount,
        maximumDiscountAmount: policy.maximumDiscountAmount,
      },
      eligibleAmount: updatedCalc.discountBreakdown.eligibleAmount,
      discountAmount: updatedCalc.discountBreakdown.discountAmount,
      originalEstimateAmount: updatedCalc.discountBreakdown.originalSubtotal,
      finalEstimateAmount: updatedCalc.totalAmount,
      appliedComponents: policy.applicability,
      calculationSnapshot: updatedCalc,
      appliedAt: now,
      appliedBy: reqUserId,
    },
    { upsert: true, new: true }
  );

  // 9. Audit Log
  await AuditLog.create({
    action: 'DISCOUNT_APPLIED',
    performedBy: reqUserId,
    entityType: 'ESTIMATE',
    entityId: estimate._id,
    newValue: {
      policyCode: policy.code,
      discountAmount: updatedCalc.discountBreakdown.discountAmount,
      newTotal: updatedCalc.totalAmount,
    },
    status: 'SUCCESS',
  });

  return estimate;
}

/**
 * Gets historical discount applications for an estimate.
 */
async function getEstimateDiscountHistory(estimateId, requestingUser) {
  const estimate = await Estimate.findById(estimateId);
  if (!estimate) {
    throw new NotFoundError('Estimate not found.');
  }

  const isAdmin = requestingUser.role === 'admin';
  const isOwner = estimate.ownerId.toString() === requestingUser.id ||
    estimate.createdBy.toString() === requestingUser.id;

  if (!isAdmin && !isOwner) {
    throw new ForbiddenError('You do not have permission to view discount history for this estimate.');
  }

  const applications = await DiscountApplication.find({ estimateId })
    .sort({ estimateVersion: -1, createdAt: -1 })
    .populate('discountPolicyId', 'name code discountType discountValue')
    .populate('appliedBy', 'fullName email');

  return applications;
}

module.exports = {
  createDiscountPolicy,
  getDiscountPolicies,
  getDiscountPolicyById,
  updateDiscountPolicy,
  updateDiscountPolicyStatus,
  assignDiscountToContractor,
  getContractorApplicableDiscounts,
  applyDiscountToEstimate,
  getEstimateDiscountHistory,
};
