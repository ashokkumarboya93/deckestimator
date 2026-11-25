// =============================================
// Deck Estimator — Discount Service (Phase 9)
// =============================================

const DiscountPolicy = require('./discountPolicy.model');
const DiscountAssignment = require('./discountAssignment.model');
const DiscountApplication = require('./discountApplication.model');
const DiscountRequest = require('./discountRequest.model');
const Estimate = require('../estimates/estimate.model');
const ContractorProfile = require('../contractors/contractorProfile.model');
const VerificationDocument = require('../contractors/verificationDocument.model');
const Notification = require('../notifications/notification.model');
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
  const now = new Date();

  // Find general eligibility active policies or platform contractor policies
  const generalPolicies = await DiscountPolicy.find({
    status: DISCOUNT_POLICY_STATUS.ACTIVE,
    $or: [
      { isGeneralEligibility: true },
      { code: 'CONTRACTOR_DEFAULT_5' },
      { code: 'CONTRACTOR_DEFAULT_10' },
      { code: /^DISC_/i },
    ],
    effectiveStartDate: { $lte: now },
    $or: [{ effectiveEndDate: null }, { effectiveEndDate: { $gte: now } }],
  });

  // Find individual assigned policies
  let assignedPolicies = [];
  if (contractorUserId) {
    try {
      const assignments = await DiscountAssignment.find({
        contractorId: contractorUserId,
        status: 'active',
        effectiveStartDate: { $lte: now },
        $or: [{ effectiveEndDate: null }, { effectiveEndDate: { $gte: now } }],
      }).populate('discountPolicyId');

      assignedPolicies = assignments
        .map((a) => a.discountPolicyId)
        .filter((p) => p && p.status === DISCOUNT_POLICY_STATUS.ACTIVE);
    } catch (err) {
      console.warn('[Assigned Policies Warning]:', err.message);
    }
  }

  // Deduplicate by ID
  const map = new Map();
  [...generalPolicies, ...assignedPolicies].forEach((p) => {
    map.set(p._id.toString(), p);
  });

  return Array.from(map.values());
}

/**
 * Gets effective discount rate for contractor (assigned or default 5%).
 */
async function getContractorEffectiveDiscount(contractorUserId) {
  let rate = 5;
  let policyName = 'Contractor Wholesale Discount';
  let policyCode = 'CONTRACTOR_DEFAULT_5';

  try {
    // 1. Check for active individual contractor discount override assignment
    const assignment = await DiscountAssignment.findOne({
      contractorId: contractorUserId,
      status: 'active',
    }).populate('discountPolicyId');

    if (assignment && assignment.discountPolicyId && typeof assignment.discountPolicyId.discountValue === 'number') {
      rate = assignment.discountPolicyId.discountValue;
      policyName = assignment.discountPolicyId.name || `Contractor Custom Discount (${rate}%)`;
      policyCode = assignment.discountPolicyId.code || `CONTRACTOR_CUSTOM_${rate}`;
      return { rate, policyName, policyCode, isCustom: true };
    }

    // 2. Fall back to Platform Default Wholesale Discount policy
    const defaultPol = await DiscountPolicy.findOne({
      $or: [{ code: 'CONTRACTOR_DEFAULT_5' }, { code: 'CONTRACTOR_DEFAULT_10' }],
    });
    if (defaultPol && typeof defaultPol.discountValue === 'number') {
      rate = defaultPol.discountValue;
      policyName = defaultPol.name;
      policyCode = defaultPol.code;
    }
  } catch (err) {
    console.warn('[Get Contractor Effective Discount Warning]:', err.message);
  }

  return { rate, policyName, policyCode, isCustom: false };
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

/**
 * Submit or update a contractor wholesale discount request.
 */
async function submitDiscountRequest(data, user) {
  const userId = user.id || user._id;

  // Retrieve contractor details
  const [profile, u] = await Promise.all([
    ContractorProfile.findOne({ userId }),
    User.findById(userId).lean(),
  ]);

  const businessName = data.businessName || profile?.businessName || u?.fullName || 'Contractor Trade Partner';
  const contactName = u?.fullName || 'Contractor Partner';
  const contactEmail = u?.email || '';
  const contactPhone = u?.phone || profile?.businessPhone || '';

  // If there is already a PENDING request from this contractor, update it
  let req = await DiscountRequest.findOne({ contractorId: userId, status: 'PENDING' });
  if (req) {
    req.businessName = businessName;
    req.contactName = contactName;
    req.contactEmail = contactEmail;
    req.contactPhone = contactPhone;
    req.requestType = data.requestType || req.requestType;
    req.description = data.description || req.description;
    await req.save();
    return req;
  }

  req = await DiscountRequest.create({
    contractorId: userId,
    businessName,
    contactName,
    contactEmail,
    contactPhone,
    requestType: data.requestType || 'Request Higher Wholesale Discount (Tier Upgrade)',
    description: data.description,
    status: 'PENDING',
  });

  return req;
}

/**
 * Get discount requests for the logged-in contractor.
 */
async function getContractorDiscountRequests(contractorUserId) {
  const requests = await DiscountRequest.find({ contractorId: contractorUserId })
    .sort({ createdAt: -1 })
    .lean();
  return requests;
}

/**
 * Get all discount requests for Admin (Verification Progress Page Tab 5).
 */
async function getAllDiscountRequests(query = {}) {
  const { status, search } = query;
  const filter = {};

  if (status && status !== 'all' && status !== 'ALL') {
    filter.status = status.toUpperCase();
  }

  if (search) {
    filter.$or = [
      { businessName: { $regex: search, $options: 'i' } },
      { contactName: { $regex: search, $options: 'i' } },
      { contactEmail: { $regex: search, $options: 'i' } },
      { requestType: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const requests = await DiscountRequest.find(filter)
    .populate('contractorId', 'fullName email phone avatar')
    .sort({ createdAt: -1 })
    .lean();

  // Attach contractor profile and uploaded documents for inline preview in Admin modal
  const enriched = await Promise.all(
    requests.map(async (r) => {
      const cId = r.contractorId?._id || r.contractorId;
      const [prof, docs, estimates] = await Promise.all([
        ContractorProfile.findOne({ userId: cId }).lean(),
        VerificationDocument.find({ contractorId: cId, status: { $ne: 'deleted' } }).lean(),
        Estimate.find({ contractorId: cId }).select('totalPrice finalPrice pricing status createdAt').lean(),
      ]);

      const completedEsts = (estimates || []).filter((e) => {
        const s = String(e.status || '').toUpperCase();
        return s === 'COMPLETED' || s === 'ACCEPTED' || s === 'APPROVED' || s === 'CONVERTED';
      });

      const totalCompletedEstimatesCost = completedEsts.reduce((sum, e) => {
        return sum + (e.finalPrice || e.totalPrice || e.pricing?.totalPrice || e.pricing?.totalCost || 0);
      }, 0);

      const totalEstimatesCost = (estimates || []).reduce((sum, e) => {
        return sum + (e.finalPrice || e.totalPrice || e.pricing?.totalPrice || e.pricing?.totalCost || 0);
      }, 0);

      return {
        ...r,
        contractorProfile: prof || null,
        documents: docs || [],
        currentTier: prof?.wholesaleDiscountTier || 5,
        totalEstimatesCount: (estimates || []).length,
        completedEstimatesCount: completedEsts.length,
        totalCompletedEstimatesCost: Math.round(totalCompletedEstimatesCost * 100) / 100,
        totalEstimatesCost: Math.round(totalEstimatesCost * 100) / 100,
      };
    })
  );

  return enriched;
}

/**
 * Approve a discount request and tune the contractor's wholesale discount percentage.
 */
async function approveDiscountRequest(requestId, { discountPercent = 10, adminNotes = '' }, adminUser) {
  const reqDoc = await DiscountRequest.findById(requestId);
  if (!reqDoc) {
    throw new NotFoundError('Discount request not found.');
  }

  const tunedPct = Math.min(50, Math.max(1, Number(discountPercent) || 10));

  reqDoc.status = 'APPROVED';
  reqDoc.approvedDiscountPct = tunedPct;
  reqDoc.adminNotes = adminNotes;
  reqDoc.reviewedBy = adminUser.id || adminUser._id;
  reqDoc.reviewedAt = new Date();
  await reqDoc.save();

  // Update contractor's profile wholesale discount
  await ContractorProfile.findOneAndUpdate(
    { userId: reqDoc.contractorId },
    { $set: { wholesaleDiscountTier: tunedPct } },
    { new: true }
  );

  // Send Notification to Contractor
  try {
    await Notification.create({
      recipientType: 'specific',
      userId: reqDoc.contractorId,
      targetRole: 'contractor',
      title: 'Wholesale Discount Approved! 🎉',
      message: `Congratulations! Your request for a higher wholesale discount has been approved and upgraded to ${tunedPct}%. Enjoy enhanced trade pricing on all upcoming deck restoration estimates.`,
      category: 'PROMOTION',
      notificationType: 'DISCOUNT_APPROVAL',
      isRead: false,
    });
  } catch (notifErr) {
    console.warn('[Notification Error]:', notifErr.message);
  }

  return reqDoc;
}

/**
 * Reject a discount request with notification.
 */
async function rejectDiscountRequest(requestId, { adminNotes = '' }, adminUser) {
  const reqDoc = await DiscountRequest.findById(requestId);
  if (!reqDoc) {
    throw new NotFoundError('Discount request not found.');
  }

  reqDoc.status = 'REJECTED';
  reqDoc.adminNotes = adminNotes;
  reqDoc.reviewedBy = adminUser.id || adminUser._id;
  reqDoc.reviewedAt = new Date();
  await reqDoc.save();

  // Send exact required notification to Contractor
  try {
    await Notification.create({
      recipientType: 'specific',
      userId: reqDoc.contractorId,
      targetRole: 'contractor',
      title: 'Wholesale Discount Request Update',
      message: 'After careful verification, you are not eligible for a higher discount at this time. Keep up the good work and continue submitting completed projects to qualify for future tier upgrades.',
      category: 'SYSTEM',
      notificationType: 'DISCOUNT_REJECTION',
      isRead: false,
    });
  } catch (notifErr) {
    console.warn('[Notification Error]:', notifErr.message);
  }

  return reqDoc;
}

/**
 * Delete a discount request.
 */
async function deleteDiscountRequest(requestId) {
  const reqDoc = await DiscountRequest.findByIdAndDelete(requestId);
  if (!reqDoc) {
    throw new NotFoundError('Discount request not found.');
  }
  return reqDoc;
}

/**
 * Bulk delete discount requests.
 */
async function bulkDeleteDiscountRequests(requestIds = []) {
  if (!Array.isArray(requestIds) || requestIds.length === 0) {
    return { success: true, count: 0, message: 'No requests selected.' };
  }
  const res = await DiscountRequest.deleteMany({ _id: { $in: requestIds } });
  return { success: true, count: res.deletedCount, message: `Successfully deleted ${res.deletedCount} discount request(s).` };
}

/**
 * Send an administrative reply to a contractor regarding their discount request.
 */
async function replyDiscountRequest(requestId, { message = '' }, adminUser) {
  const reqDoc = await DiscountRequest.findById(requestId);
  if (!reqDoc) {
    throw new NotFoundError('Discount request not found.');
  }

  const trimmed = (message || '').trim();
  if (!trimmed) {
    throw new BadRequestError('Reply message cannot be empty.');
  }

  reqDoc.adminNotes = (reqDoc.adminNotes ? reqDoc.adminNotes + '\n\n' : '') + `[Admin Reply by ${adminUser.fullName || 'Admin'} on ${new Date().toLocaleDateString()}]: ${trimmed}`;
  await reqDoc.save();

  try {
    await Notification.create({
      recipientType: 'specific',
      userId: reqDoc.contractorId,
      targetRole: 'contractor',
      title: 'Deck Restoration Plus: Message Regarding Your Wholesale Discount',
      message: trimmed,
      category: 'SUPPORT',
      notificationType: 'DISCOUNT_REPLY',
      isRead: false,
    });
  } catch (notifErr) {
    console.warn('[Notification Error]:', notifErr.message);
  }

  return reqDoc;
}

module.exports = {
  createDiscountPolicy,
  getDiscountPolicies,
  getDiscountPolicyById,
  updateDiscountPolicy,
  updateDiscountPolicyStatus,
  assignDiscountToContractor,
  getContractorApplicableDiscounts,
  getContractorEffectiveDiscount,
  applyDiscountToEstimate,
  getEstimateDiscountHistory,
  submitDiscountRequest,
  getContractorDiscountRequests,
  getAllDiscountRequests,
  approveDiscountRequest,
  rejectDiscountRequest,
  deleteDiscountRequest,
  bulkDeleteDiscountRequests,
  replyDiscountRequest,
};
