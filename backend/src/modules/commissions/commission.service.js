// =============================================
// Deck Estimator — Commission Service (Phase 9)
// =============================================

const CommissionPolicy = require('./commissionPolicy.model');
const Commission = require('./commission.model');
const CommissionHistory = require('./commissionHistory.model');
const CommissionPaymentRecord = require('./commissionPaymentRecord.model');
const Lead = require('../leads/lead.model');
const Estimate = require('../estimates/estimate.model');
const ContractorProfile = require('../contractors/contractorProfile.model');
const User = require('../users/users.model');
const AuditLog = require('../../shared/models/auditLog.model');
const { round2 } = require('../pricing/pricingEngine');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../../shared/errors');
const {
  COMMISSION_STATUS,
  COMMISSION_TYPE,
  COMMISSION_POLICY_STATUS,
  VERIFICATION_STATUS,
  LEAD_STATUS,
} = require('../../shared/constants');

/**
 * Creates a new commission policy (Admin only).
 */
async function createCommissionPolicy(policyData, adminUser) {
  const existing = await CommissionPolicy.findOne({
    code: policyData.code.toUpperCase(),
  });
  if (existing) {
    throw new ConflictError(`Commission policy code "${policyData.code}" already exists.`);
  }

  const userId = adminUser.id || adminUser._id;
  const policy = await CommissionPolicy.create({
    ...policyData,
    code: policyData.code.toUpperCase(),
    createdBy: userId,
  });

  await AuditLog.create({
    action: 'COMMISSION_POLICY_CREATED',
    performedBy: userId,
    entityType: 'COMMISSION_POLICY',
    entityId: policy._id,
    newValue: { code: policy.code, name: policy.name, type: policy.commissionType, value: policy.commissionValue },
    status: 'SUCCESS',
  });

  return policy;
}

/**
 * Lists commission policies with pagination (Admin).
 */
async function getCommissionPolicies(params = {}) {
  const { page = 1, limit = 20, status, commissionType, search } = params;
  const query = {};

  if (status) query.status = status;
  if (commissionType) query.commissionType = commissionType;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  const [policies, total] = await Promise.all([
    CommissionPolicy.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email'),
    CommissionPolicy.countDocuments(query),
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
 * Gets a single commission policy by ID.
 */
async function getCommissionPolicyById(id) {
  const policy = await CommissionPolicy.findById(id)
    .populate('createdBy', 'fullName email')
    .populate('updatedBy', 'fullName email');
  if (!policy) {
    throw new NotFoundError('Commission policy not found.');
  }
  return policy;
}

/**
 * Updates a commission policy (Admin only).
 */
async function updateCommissionPolicy(id, updateData, adminUser) {
  const policy = await CommissionPolicy.findById(id);
  if (!policy) {
    throw new NotFoundError('Commission policy not found.');
  }

  if (updateData.code && updateData.code.toUpperCase() !== policy.code) {
    const existing = await CommissionPolicy.findOne({
      code: updateData.code.toUpperCase(),
      _id: { $ne: id },
    });
    if (existing) {
      throw new ConflictError(`Commission policy code "${updateData.code}" already exists.`);
    }
  }

  const userId = adminUser.id || adminUser._id;
  const previousSnapshot = { ...policy.toObject() };
  Object.assign(policy, updateData);
  if (updateData.code) policy.code = updateData.code.toUpperCase();
  policy.updatedBy = userId;
  await policy.save();

  await AuditLog.create({
    action: 'COMMISSION_POLICY_UPDATED',
    performedBy: userId,
    entityType: 'COMMISSION_POLICY',
    entityId: policy._id,
    previousValue: { name: previousSnapshot.name, status: previousSnapshot.status },
    newValue: { name: policy.name, status: policy.status },
    status: 'SUCCESS',
  });

  return policy;
}

/**
 * Generates an auditable commission record for an eligible, converted lead.
 */
async function generateCommissionForLead({ leadId, commissionPolicyId, verifiedContractAmount, conversionReference }, adminUser) {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    throw new NotFoundError('Lead record not found.');
  }

  // 1. Verify lead is converted
  if (lead.status !== LEAD_STATUS.CONVERTED) {
    throw new BadRequestError(`Cannot generate commission for lead with status "${lead.status}". Lead must be CONVERTED.`);
  }

  // 2. Verify assigned contractor exists and is approved/active
  if (!lead.assignedContractorId) {
    throw new BadRequestError('Lead has no assigned contractor.');
  }

  const contractorId = lead.assignedContractorId;
  const contractorUser = await User.findById(contractorId);
  if (!contractorUser || contractorUser.accountStatus !== 'active') {
    throw new BadRequestError('Assigned contractor account is not active.');
  }

  const profile = await ContractorProfile.findOne({ userId: contractorId });
  if (!profile || profile.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
    throw new BadRequestError('Assigned contractor must be fully approved to earn commissions.');
  }

  // 3. Resolve active commission policy
  let policy;
  if (commissionPolicyId) {
    policy = await CommissionPolicy.findById(commissionPolicyId);
  } else {
    policy = await CommissionPolicy.findOne({ status: COMMISSION_POLICY_STATUS.ACTIVE });
  }

  if (!policy) {
    throw new NotFoundError('No active commission policy found.');
  }

  if (policy.status !== COMMISSION_POLICY_STATUS.ACTIVE) {
    throw new BadRequestError(`Commission policy "${policy.name}" is not ACTIVE.`);
  }

  const now = new Date();
  if (policy.effectiveStartDate && policy.effectiveStartDate > now) {
    throw new BadRequestError('Commission policy is not yet effective.');
  }
  if (policy.effectiveEndDate && policy.effectiveEndDate < now) {
    throw new BadRequestError('Commission policy has expired.');
  }

  // 4. Idempotency Check: Prevent duplicate commissions for this lead & policy
  const existingCommission = await Commission.findOne({
    leadId: lead._id,
    commissionPolicyId: policy._id,
  });
  if (existingCommission) {
    throw new ConflictError(
      `A commission record (${existingCommission.commissionReference}) already exists for this lead and policy.`
    );
  }

  // 5. Determine Calculation Basis Amount
  let basisAmount = 0;
  if (verifiedContractAmount && Number(verifiedContractAmount) > 0) {
    basisAmount = Number(verifiedContractAmount);
  } else if (lead.estimateSnapshot?.totalAmount && Number(lead.estimateSnapshot.totalAmount) > 0) {
    basisAmount = Number(lead.estimateSnapshot.totalAmount);
  } else if (lead.estimateId) {
    const est = await Estimate.findById(lead.estimateId);
    if (est?.totalAmount) {
      basisAmount = Number(est.totalAmount);
    }
  }

  if (basisAmount <= 0) {
    throw new BadRequestError(
      'Unable to determine valid financial basis amount for commission calculation. Please supply verified contract amount.'
    );
  }

  // 6. Calculate Commission
  let calculatedAmount = 0;
  if (policy.commissionType === COMMISSION_TYPE.PERCENTAGE) {
    calculatedAmount = basisAmount * (Number(policy.commissionValue) / 100);
  } else {
    calculatedAmount = Number(policy.commissionValue);
  }

  if (policy.minimumCommissionAmount && policy.minimumCommissionAmount > 0) {
    calculatedAmount = Math.max(calculatedAmount, Number(policy.minimumCommissionAmount));
  }
  if (policy.maximumCommissionAmount && policy.maximumCommissionAmount > 0) {
    calculatedAmount = Math.min(calculatedAmount, Number(policy.maximumCommissionAmount));
  }

  calculatedAmount = round2(calculatedAmount);

  // 7. Persist Commission Record
  const commissionReference = `COM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

  const commission = await Commission.create({
    commissionReference,
    contractorId,
    contractorProfileId: profile._id,
    leadId: lead._id,
    estimateId: lead.estimateId || null,
    commissionPolicyId: policy._id,
    policySnapshot: {
      policyId: policy._id,
      name: policy.name,
      code: policy.code,
      commissionType: policy.commissionType,
      commissionValue: policy.commissionValue,
      calculationBasis: policy.calculationBasis,
      minimumCommissionAmount: policy.minimumCommissionAmount,
      maximumCommissionAmount: policy.maximumCommissionAmount,
    },
    conversionReference: conversionReference || `LEAD-CONV-${lead.leadNumber || lead._id}`,
    calculationBasis: policy.calculationBasis,
    basisAmount,
    commissionType: policy.commissionType,
    commissionValue: policy.commissionValue,
    calculatedAmount,
    status: COMMISSION_STATUS.PENDING,
    currency: 'USD',
  });

  const userId = adminUser.id || adminUser._id;

  // 8. Log Commission Lifecycle History
  await CommissionHistory.create({
    commissionId: commission._id,
    previousStatus: null,
    newStatus: COMMISSION_STATUS.PENDING,
    action: 'GENERATE',
    reason: 'Initial commission calculation generated upon verified lead conversion.',
    performedBy: userId,
    performedByRole: adminUser.role,
    metadata: { basisAmount, calculatedAmount },
  });

  // 9. System Audit Log
  await AuditLog.create({
    action: 'COMMISSION_GENERATED',
    performedBy: userId,
    entityType: 'COMMISSION',
    entityId: commission._id,
    newValue: {
      reference: commissionReference,
      contractorId,
      amount: calculatedAmount,
      status: commission.status,
    },
    status: 'SUCCESS',
  });

  return commission;
}

/**
 * Reviews and transitions commission status (Admin only).
 * Supported actions: APPROVE, REJECT, MARK_PAYABLE, DISPUTE, REVERSE
 */
async function reviewCommission(commissionId, { action, reason, notes, approvedAmount }, adminUser) {
  const commission = await Commission.findById(commissionId);
  if (!commission) {
    throw new NotFoundError('Commission record not found.');
  }

  const previousStatus = commission.status;
  let newStatus;

  switch (action) {
    case 'APPROVE':
      if (![COMMISSION_STATUS.PENDING, COMMISSION_STATUS.UNDER_REVIEW, COMMISSION_STATUS.DISPUTED].includes(previousStatus)) {
        throw new BadRequestError(`Cannot approve commission with status "${previousStatus}".`);
      }
      newStatus = COMMISSION_STATUS.APPROVED;
      commission.approvedAmount = approvedAmount ? round2(Number(approvedAmount)) : commission.calculatedAmount;
      break;

    case 'REJECT':
      if ([COMMISSION_STATUS.PAID, COMMISSION_STATUS.REVERSED].includes(previousStatus)) {
        throw new BadRequestError(`Cannot reject commission that has already been "${previousStatus}".`);
      }
      if (!reason || !reason.trim()) {
        throw new BadRequestError('A documented reason is required when rejecting a commission.');
      }
      newStatus = COMMISSION_STATUS.REJECTED;
      commission.rejectionReason = reason.trim();
      break;

    case 'MARK_PAYABLE':
      if (previousStatus !== COMMISSION_STATUS.APPROVED) {
        throw new BadRequestError(`Cannot mark commission payable until it is APPROVED. Current status: "${previousStatus}".`);
      }
      newStatus = COMMISSION_STATUS.PAYABLE;
      break;

    case 'DISPUTE':
      if ([COMMISSION_STATUS.REJECTED, COMMISSION_STATUS.REVERSED].includes(previousStatus)) {
        throw new BadRequestError(`Cannot dispute commission with status "${previousStatus}".`);
      }
      newStatus = COMMISSION_STATUS.DISPUTED;
      break;

    case 'REVERSE':
      if (![COMMISSION_STATUS.APPROVED, COMMISSION_STATUS.PAYABLE, COMMISSION_STATUS.PAID].includes(previousStatus)) {
        throw new BadRequestError(`Cannot reverse commission with status "${previousStatus}".`);
      }
      if (!reason || !reason.trim()) {
        throw new BadRequestError('A documented reason is required when reversing a commission.');
      }
      newStatus = COMMISSION_STATUS.REVERSED;
      commission.reversalReason = reason.trim();
      break;

    default:
      throw new BadRequestError(`Invalid review action "${action}".`);
  }

  const userId = adminUser.id || adminUser._id;
  commission.status = newStatus;
  commission.reviewedBy = userId;
  commission.reviewedAt = new Date();
  if (notes) commission.reviewNotes = notes.trim();
  await commission.save();

  await CommissionHistory.create({
    commissionId: commission._id,
    previousStatus,
    newStatus,
    action,
    reason: reason || notes || '',
    performedBy: userId,
    performedByRole: adminUser.role,
  });

  await AuditLog.create({
    action: `COMMISSION_${action}`,
    performedBy: userId,
    entityType: 'COMMISSION',
    entityId: commission._id,
    previousValue: { status: previousStatus },
    newValue: { status: newStatus, approvedAmount: commission.approvedAmount },
    status: 'SUCCESS',
  });

  return commission;
}

/**
 * Records payment confirmation for an approved or payable commission (Admin only).
 */
async function recordCommissionPayment(commissionId, { paymentReference, paymentMethod, amount, currency, notes }, adminUser) {
  const commission = await Commission.findById(commissionId);
  if (!commission) {
    throw new NotFoundError('Commission record not found.');
  }

  if (![COMMISSION_STATUS.PAYABLE, COMMISSION_STATUS.APPROVED].includes(commission.status)) {
    throw new BadRequestError(
      `Cannot record payment for commission with status "${commission.status}". Status must be PAYABLE or APPROVED.`
    );
  }

  // Prevent duplicate payment reference
  const existingPayment = await CommissionPaymentRecord.findOne({
    commissionId,
    paymentReference: paymentReference.trim(),
  });
  if (existingPayment) {
    throw new ConflictError(`Payment reference "${paymentReference}" already recorded for this commission.`);
  }

  const userId = adminUser.id || adminUser._id;
  const previousStatus = commission.status;
  const paymentRecord = await CommissionPaymentRecord.create({
    commissionId: commission._id,
    contractorId: commission.contractorId,
    paymentReference: paymentReference.trim(),
    paymentMethod: paymentMethod.trim(),
    amount: round2(Number(amount)),
    currency: (currency || commission.currency || 'USD').toUpperCase(),
    paymentDate: new Date(),
    recordedBy: userId,
    notes: notes || '',
  });

  commission.status = COMMISSION_STATUS.PAID;
  commission.paidAt = new Date();
  commission.paidBy = userId;
  commission.paymentReference = paymentReference.trim();
  await commission.save();

  await CommissionHistory.create({
    commissionId: commission._id,
    previousStatus,
    newStatus: COMMISSION_STATUS.PAID,
    action: 'RECORD_PAYMENT',
    reason: `Payment confirmed via ${paymentMethod} (Ref: ${paymentReference}).`,
    performedBy: userId,
    performedByRole: adminUser.role,
    metadata: { paymentId: paymentRecord._id, amount, paymentReference },
  });

  await AuditLog.create({
    action: 'COMMISSION_PAYMENT_RECORDED',
    performedBy: userId,
    entityType: 'COMMISSION',
    entityId: commission._id,
    newValue: { paymentReference, amount, status: COMMISSION_STATUS.PAID },
    status: 'SUCCESS',
  });

  return { commission, paymentRecord };
}

/**
 * Lists commissions with pagination, role-based isolation, and filters.
 */
async function getCommissions(params = {}, requestingUser) {
  const { page = 1, limit = 20, status, contractorId, leadId, search } = params;
  const query = {};

  // Contractor Isolation: contractors see only their own commissions
  if (requestingUser.role === 'contractor') {
    query.contractorId = requestingUser.id;
  } else if (contractorId) {
    query.contractorId = contractorId;
  }

  if (status) query.status = status;
  if (leadId) query.leadId = leadId;
  if (search) {
    query.$or = [
      { commissionReference: { $regex: search, $options: 'i' } },
      { conversionReference: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  const [commissions, total] = await Promise.all([
    Commission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('contractorId', 'fullName email')
      .populate('contractorProfileId', 'businessName licenseNumber')
      .populate('leadId', 'leadNumber status customerSnapshot deckSnapshot')
      .populate('commissionPolicyId', 'name code commissionType commissionValue')
      .populate('reviewedBy', 'fullName email')
      .populate('paidBy', 'fullName email'),
    Commission.countDocuments(query),
  ]);

  return {
    commissions,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  };
}

/**
 * Gets a single commission record by ID with role-based access check.
 */
async function getCommissionById(commissionId, requestingUser) {
  const query = { _id: commissionId };
  if (requestingUser.role === 'contractor') {
    query.contractorId = requestingUser.id;
  }

  const commission = await Commission.findOne(query)
    .populate('contractorId', 'fullName email')
    .populate('contractorProfileId', 'businessName licenseNumber businessPhone')
    .populate('leadId', 'leadNumber status customerSnapshot deckSnapshot')
    .populate('estimateId', 'estimateNumber totalAmount')
    .populate('commissionPolicyId', 'name code commissionType commissionValue')
    .populate('reviewedBy', 'fullName email')
    .populate('paidBy', 'fullName email');

  if (!commission) {
    throw new NotFoundError('Commission record not found or access denied.');
  }

  return commission;
}

/**
 * Aggregates summary financial statistics for commissions.
 */
async function getCommissionSummary(requestingUser) {
  const match = {};
  if (requestingUser.role === 'contractor') {
    const mongoose = require('mongoose');
    match.contractorId = new mongoose.Types.ObjectId(requestingUser.id);
  }

  const summary = await Commission.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: {
          $sum: {
            $cond: [
              { $ifNull: ['$approvedAmount', false] },
              '$approvedAmount',
              '$calculatedAmount',
            ],
          },
        },
      },
    },
  ]);

  const result = {
    totalRecords: 0,
    totalAmount: 0,
    byStatus: {
      pending: { count: 0, amount: 0 },
      under_review: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      payable: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
      disputed: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      reversed: { count: 0, amount: 0 },
    },
  };

  summary.forEach((item) => {
    result.totalRecords += item.count;
    result.totalAmount += round2(item.totalAmount);
    if (result.byStatus[item._id]) {
      result.byStatus[item._id].count = item.count;
      result.byStatus[item._id].amount = round2(item.totalAmount);
    }
  });

  result.totalAmount = round2(result.totalAmount);
  return result;
}

/**
 * Gets the chronological history for a commission.
 */
async function getCommissionHistory(commissionId, requestingUser) {
  const commission = await getCommissionById(commissionId, requestingUser);

  const history = await CommissionHistory.find({ commissionId: commission._id })
    .sort({ createdAt: 1 })
    .populate('performedBy', 'fullName email role');

  return history;
}

module.exports = {
  createCommissionPolicy,
  getCommissionPolicies,
  getCommissionPolicyById,
  updateCommissionPolicy,
  generateCommissionForLead,
  reviewCommission,
  recordCommissionPayment,
  getCommissions,
  getCommissionById,
  getCommissionSummary,
  getCommissionHistory,
};
