// =============================================
// Deck Estimator — Lead Management Service (Phase 8)
// =============================================

const mongoose = require('mongoose');
const Lead = require('./lead.model');
const LeadAssignmentHistory = require('./leadAssignmentHistory.model');
const LeadActivity = require('./leadActivity.model');
const Deck = require('../decks/deck.model');
const DeckImage = require('../files/deckImage.model');
const Estimate = require('../estimates/estimate.model');
const ContractorProfile = require('../contractors/contractorProfile.model');
const User = require('../users/users.model');
const AuditLog = require('../../shared/models/auditLog.model');
const {
  ROLES,
  LEAD_STATUS,
  LEAD_SOURCE,
  LEAD_ACTIVITY_TYPE,
  VERIFICATION_STATUS,
} = require('../../shared/constants');

/**
 * Generate a unique, readable lead number (e.g. LEAD-2026-004128).
 */
function generateLeadNumber() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `LEAD-${year}-${randomSuffix}`;
}

/**
 * Create a new lead from a customer service enquiry.
 */
async function createCustomerLead(customerUser, payload) {
  const { deckId, estimateId, leadSource = LEAD_SOURCE.CUSTOMER_ESTIMATOR, enquiry } = payload;

  // 1. Verify deck ownership
  const deck = await Deck.findById(deckId);
  if (!deck) {
    const error = new Error('Associated deck project was not found.');
    error.statusCode = 404;
    error.code = 'DECK_NOT_FOUND';
    throw error;
  }

  if (deck.ownerId.toString() !== customerUser.id) {
    const error = new Error('You do not have permission to submit an enquiry for this deck project.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  // 2. Optional Estimate Validation & Snapshot
  let estimateSnapshot = {
    estimateId: null,
    estimateReference: '',
    estimateVersion: null,
    totalAmount: null,
    currency: 'USD',
  };

  if (estimateId) {
    const estimate = await Estimate.findById(estimateId);
    if (!estimate) {
      const error = new Error('Associated estimate record was not found.');
      error.statusCode = 404;
      error.code = 'ESTIMATE_NOT_FOUND';
      throw error;
    }

    if (
      estimate.ownerId.toString() !== customerUser.id ||
      estimate.deckId.toString() !== deckId
    ) {
      const error = new Error('Specified estimate does not belong to your deck project.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    estimateSnapshot = {
      estimateId: estimate._id,
      estimateReference:
        estimate.estimateNumber ||
        estimate.estimateReference ||
        `EST-${estimate._id.toString().slice(-6)}`,
      estimateVersion: estimate.version || 1,
      totalAmount:
        estimate.totalAmount ??
        estimate.totalCost ??
        estimate.totalEstimateAmount ??
        0,
      currency: estimate.currency || 'USD',
    };
  }

  // 3. Collect Deck Image count and snapshot
  const photoCount = await DeckImage.countDocuments({ deckId });

  const deckSnapshot = {
    projectName: deck.projectName || 'My Deck',
    city: deck.location?.city || '',
    state: deck.location?.state || '',
    postalCode: deck.location?.postalCode || '',
    area: deck.measurements?.totalAreaSqFt || deck.measurements?.area || 0,
    shape: deck.measurements?.shape || 'RECTANGULAR',
    surfaceMaterial: deck.surfaceDetails?.material || '',
    conditionLevel: deck.condition?.level ?? null,
    conditionLabel: deck.condition?.label ?? null,
    photoCount,
  };

  const customerSnapshot = {
    name: `${customerUser.firstName || ''} ${customerUser.lastName || ''}`.trim() || 'Customer',
    email: customerUser.email,
    phone: customerUser.phone || '',
  };

  // 4. Create Lead
  const leadNumber = generateLeadNumber();

  const lead = await Lead.create({
    leadNumber,
    customerId: customerUser.id,
    deckId: deck._id,
    estimateId: estimateSnapshot.estimateId,
    leadSource,
    enquiry,
    customerSnapshot,
    deckSnapshot,
    estimateSnapshot,
    status: LEAD_STATUS.NEW,
    lastActivityAt: new Date(),
  });

  // 5. Create initial activity entry
  await LeadActivity.create({
    leadId: lead._id,
    actorId: customerUser.id,
    actorRole: ROLES.CUSTOMER,
    activityType: LEAD_ACTIVITY_TYPE.LEAD_CREATED,
    description: `Customer submitted enquiry: "${enquiry.subject}"`,
    newStatus: LEAD_STATUS.NEW,
    visibility: 'CUSTOMER_VISIBLE',
  });

  // 6. Audit Log
  try {
    await AuditLog.create({
      performedBy: customerUser.id,
      action: 'CREATE_LEAD',
      entityType: 'LEAD',
      entityId: lead._id,
      newValue: { leadNumber, deckId: deck._id, status: LEAD_STATUS.NEW },
    });
  } catch (err) {
    console.error('AuditLog Error:', err.message);
  }

  return lead;
}

/**
 * List leads owned by the authenticated customer.
 */
async function getCustomerLeads(customerId, query = {}) {
  const { status, page = 1, limit = 20 } = query;
  const filter = { customerId };

  if (status) {
    filter.status = status.toLowerCase();
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Lead.find(filter)
      .populate('deckId', 'projectName measurements surfaceDetails location')
      .populate('estimateId', 'estimateReference totalCost version')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Lead.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Retrieve a lead by ID with strict role-based data isolation.
 */
async function getLeadById(leadId, requestingUser) {
  const lead = await Lead.findById(leadId)
    .populate('customerId', 'firstName lastName email')
    .populate('deckId', 'projectName measurements surfaceDetails location images')
    .populate('estimateId')
    .populate('assignedContractorId', 'firstName lastName email')
    .populate('assignedContractorProfileId', 'businessName businessPhone businessEmail licenseNumber');

  if (!lead) {
    const error = new Error('Lead not found.');
    error.statusCode = 404;
    error.code = 'LEAD_NOT_FOUND';
    throw error;
  }

  // Access validation:
  // - Admin: allowed
  // - Customer: only if customerId matches
  // - Contractor: only if assignedContractorId matches
  const isOwner = lead.customerId && lead.customerId._id.toString() === requestingUser.id;
  const isAssigned =
    lead.assignedContractorId &&
    lead.assignedContractorId._id.toString() === requestingUser.id;
  const isAdmin = requestingUser.role === ROLES.ADMIN;

  if (!isOwner && !isAssigned && !isAdmin) {
    const error = new Error('You do not have permission to view this lead.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  return lead;
}

/**
 * Retrieve leads for Admin management portal with full filtering and search.
 */
async function getAdminLeads(query = {}) {
  const {
    status,
    leadSource,
    search,
    contractorId,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = {};

  if (status) {
    filter.status = status.toLowerCase();
  }

  if (leadSource) {
    filter.leadSource = leadSource.toLowerCase();
  }

  if (contractorId && mongoose.Types.ObjectId.isValid(contractorId)) {
    filter.assignedContractorId = contractorId;
  }

  if (search) {
    filter.$or = [
      { leadNumber: new RegExp(search, 'i') },
      { 'customerSnapshot.name': new RegExp(search, 'i') },
      { 'customerSnapshot.email': new RegExp(search, 'i') },
      { 'deckSnapshot.projectName': new RegExp(search, 'i') },
      { 'deckSnapshot.city': new RegExp(search, 'i') },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    Lead.find(filter)
      .populate('customerId', 'firstName lastName email')
      .populate('assignedContractorId', 'firstName lastName email')
      .populate('assignedContractorProfileId', 'businessName licenseNumber')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limitNum),
    Lead.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Assign or reassign a lead to an approved contractor.
 */
async function assignContractor(leadId, adminUser, assignPayload) {
  const { contractorId, assignmentReason = '', assignmentNotes = '' } = assignPayload;

  const lead = await Lead.findById(leadId);
  if (!lead) {
    const error = new Error('Lead not found.');
    error.statusCode = 404;
    error.code = 'LEAD_NOT_FOUND';
    throw error;
  }

  if ([LEAD_STATUS.CLOSED, LEAD_STATUS.CANCELLED].includes(lead.status)) {
    const error = new Error(`Cannot assign a lead with status '${lead.status}'.`);
    error.statusCode = 400;
    error.code = 'INVALID_LEAD_STATE';
    throw error;
  }

  // Verify target contractor
  const contractorUser = await User.findById(contractorId);
  if (!contractorUser || contractorUser.role !== ROLES.CONTRACTOR) {
    const error = new Error('Designated user is not a valid contractor.');
    error.statusCode = 400;
    error.code = 'INVALID_CONTRACTOR';
    throw error;
  }

  const contractorProfile = await ContractorProfile.findOne({ userId: contractorId });
  if (!contractorProfile) {
    const error = new Error('Contractor profile not found.');
    error.statusCode = 404;
    error.code = 'PROFILE_NOT_FOUND';
    throw error;
  }

  // Mandatory eligibility check: Contractor MUST be APPROVED and active
  if (
    contractorProfile.verificationStatus !== VERIFICATION_STATUS.APPROVED ||
    contractorUser.accountStatus !== 'active'
  ) {
    const error = new Error(
      `Cannot assign lead to contractor with verification status '${contractorProfile.verificationStatus}'. Contractor must be approved and account active.`
    );
    error.statusCode = 400;
    error.code = 'CONTRACTOR_NOT_ELIGIBLE';
    throw error;
  }

  const previousContractorId = lead.assignedContractorId;
  const isReassignment = !!previousContractorId;
  const previousStatus = lead.status;

  lead.assignedContractorId = contractorUser._id;
  lead.assignedContractorProfileId = contractorProfile._id;
  lead.assignedBy = adminUser.id;
  lead.assignedAt = new Date();
  lead.status = LEAD_STATUS.ASSIGNED;
  lead.lastActivityAt = new Date();
  if (assignmentNotes) {
    lead.adminNotes = assignmentNotes;
  }
  await lead.save();

  // Record assignment history
  await LeadAssignmentHistory.create({
    leadId: lead._id,
    previousContractorId,
    newContractorId: contractorUser._id,
    assignedBy: adminUser.id,
    assignmentReason: assignmentReason || (isReassignment ? 'Admin reassigned lead' : 'Admin assigned lead'),
    assignmentStatus: isReassignment ? 'REASSIGNED' : 'ASSIGNED',
  });

  // Create activity entry
  await LeadActivity.create({
    leadId: lead._id,
    actorId: adminUser.id,
    actorRole: ROLES.ADMIN,
    activityType: isReassignment
      ? LEAD_ACTIVITY_TYPE.LEAD_REASSIGNED
      : LEAD_ACTIVITY_TYPE.LEAD_ASSIGNED,
    description: `Lead assigned to contractor "${contractorProfile.businessName}"`,
    previousStatus,
    newStatus: LEAD_STATUS.ASSIGNED,
    visibility: 'INTERNAL',
  });

  // Audit log
  try {
    await AuditLog.create({
      performedBy: adminUser.id,
      action: isReassignment ? 'REASSIGN_LEAD' : 'ASSIGN_LEAD',
      entityType: 'LEAD',
      entityId: lead._id,
      oldValue: { assignedContractorId: previousContractorId, status: previousStatus },
      newValue: { assignedContractorId: contractorUser._id, status: LEAD_STATUS.ASSIGNED },
    });
  } catch (err) {
    console.error('AuditLog Error:', err.message);
  }

  return getLeadById(lead._id, adminUser);
}

/**
 * Retrieve leads assigned to the authenticated contractor.
 */
async function getContractorLeads(contractorUserId, query = {}) {
  // Check contractor verification status
  const profile = await ContractorProfile.findOne({ userId: contractorUserId });
  if (!profile || profile.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
    const error = new Error('Access denied. Only approved contractors can access assigned leads.');
    error.statusCode = 403;
    error.code = 'CONTRACTOR_NOT_VERIFIED';
    throw error;
  }

  const { status, page = 1, limit = 20 } = query;
  const filter = { assignedContractorId: contractorUserId };

  if (status) {
    filter.status = status.toLowerCase();
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Lead.find(filter)
      .populate('deckId', 'projectName measurements surfaceDetails location images')
      .populate('estimateId', 'estimateReference totalCost version')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Lead.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Contractor accepts an assigned lead.
 */
async function contractorAcceptLead(leadId, contractorUserId, notes = '') {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    const error = new Error('Lead not found.');
    error.statusCode = 404;
    error.code = 'LEAD_NOT_FOUND';
    throw error;
  }

  if (!lead.assignedContractorId || lead.assignedContractorId.toString() !== contractorUserId) {
    const error = new Error('You are not the designated contractor for this lead.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  if (lead.status !== LEAD_STATUS.ASSIGNED) {
    const error = new Error(`Cannot accept lead with current status '${lead.status}'. Must be ASSIGNED.`);
    error.statusCode = 400;
    error.code = 'INVALID_LEAD_STATUS';
    throw error;
  }

  const previousStatus = lead.status;
  lead.status = LEAD_STATUS.ACCEPTED;
  lead.lastActivityAt = new Date();
  if (notes) {
    lead.contractorNotes = notes;
  }
  await lead.save();

  await LeadActivity.create({
    leadId: lead._id,
    actorId: contractorUserId,
    actorRole: ROLES.CONTRACTOR,
    activityType: LEAD_ACTIVITY_TYPE.CONTRACTOR_ACCEPTED,
    description: 'Contractor accepted the lead assignment.',
    previousStatus,
    newStatus: LEAD_STATUS.ACCEPTED,
    visibility: 'CUSTOMER_VISIBLE',
  });

  try {
    await AuditLog.create({
      performedBy: contractorUserId,
      action: 'CONTRACTOR_ACCEPT_LEAD',
      entityType: 'LEAD',
      entityId: lead._id,
      oldValue: { status: previousStatus },
      newValue: { status: LEAD_STATUS.ACCEPTED },
    });
  } catch (err) {
    console.error('AuditLog Error:', err.message);
  }

  return lead;
}

/**
 * Contractor rejects an assigned lead with a mandatory reason.
 */
async function contractorRejectLead(leadId, contractorUserId, reason) {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    const error = new Error('Lead not found.');
    error.statusCode = 404;
    error.code = 'LEAD_NOT_FOUND';
    throw error;
  }

  if (!lead.assignedContractorId || lead.assignedContractorId.toString() !== contractorUserId) {
    const error = new Error('You are not the designated contractor for this lead.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  if (lead.status !== LEAD_STATUS.ASSIGNED) {
    const error = new Error(`Cannot reject lead with current status '${lead.status}'. Must be ASSIGNED.`);
    error.statusCode = 400;
    error.code = 'INVALID_LEAD_STATUS';
    throw error;
  }

  const previousContractorId = lead.assignedContractorId;
  const previousStatus = lead.status;

  // Unassign and return lead to under_review for admin triage
  lead.assignedContractorId = null;
  lead.assignedContractorProfileId = null;
  lead.status = LEAD_STATUS.UNDER_REVIEW;
  lead.lastActivityAt = new Date();
  await lead.save();

  // Record assignment rejection in history
  await LeadAssignmentHistory.create({
    leadId: lead._id,
    previousContractorId,
    newContractorId: previousContractorId,
    assignedBy: contractorUserId,
    assignmentReason: `Contractor rejected lead: ${reason}`,
    assignmentStatus: 'REJECTED_BY_CONTRACTOR',
  });

  await LeadActivity.create({
    leadId: lead._id,
    actorId: contractorUserId,
    actorRole: ROLES.CONTRACTOR,
    activityType: LEAD_ACTIVITY_TYPE.CONTRACTOR_REJECTED,
    description: `Contractor declined lead: "${reason}"`,
    previousStatus,
    newStatus: LEAD_STATUS.UNDER_REVIEW,
    visibility: 'INTERNAL',
  });

  try {
    await AuditLog.create({
      performedBy: contractorUserId,
      action: 'CONTRACTOR_REJECT_LEAD',
      entityType: 'LEAD',
      entityId: lead._id,
      oldValue: { assignedContractorId: previousContractorId, status: previousStatus },
      newValue: { assignedContractorId: null, status: LEAD_STATUS.UNDER_REVIEW, reason },
    });
  } catch (err) {
    console.error('AuditLog Error:', err.message);
  }

  return lead;
}

/**
 * Contractor updates lead operational progress (contacted, site visit, quote, converted, not interested).
 */
async function contractorUpdateStatus(leadId, contractorUserId, { status, notes = '' }) {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    const error = new Error('Lead not found.');
    error.statusCode = 404;
    error.code = 'LEAD_NOT_FOUND';
    throw error;
  }

  if (!lead.assignedContractorId || lead.assignedContractorId.toString() !== contractorUserId) {
    const error = new Error('You are not authorized to update this lead.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const allowedStatuses = [
    LEAD_STATUS.CONTACTED,
    LEAD_STATUS.SITE_VISIT_SCHEDULED,
    LEAD_STATUS.QUOTE_IN_PROGRESS,
    LEAD_STATUS.CONVERTED,
    LEAD_STATUS.NOT_INTERESTED,
  ];

  if (!allowedStatuses.includes(status)) {
    const error = new Error(`Contractor cannot set status to '${status}'.`);
    error.statusCode = 400;
    error.code = 'INVALID_STATUS_TRANSITION';
    throw error;
  }

  const previousStatus = lead.status;
  lead.status = status;
  lead.lastActivityAt = new Date();
  if (notes) {
    lead.contractorNotes = notes;
  }
  if (status === LEAD_STATUS.CONVERTED) {
    lead.closureReason = 'Successfully converted to project';
  } else if (status === LEAD_STATUS.NOT_INTERESTED) {
    lead.closureReason = notes || 'Customer or contractor decided not to proceed';
  }
  await lead.save();

  // Activity mapping
  const activityMap = {
    [LEAD_STATUS.CONTACTED]: LEAD_ACTIVITY_TYPE.CUSTOMER_CONTACTED,
    [LEAD_STATUS.SITE_VISIT_SCHEDULED]: LEAD_ACTIVITY_TYPE.SITE_VISIT_SCHEDULED,
    [LEAD_STATUS.QUOTE_IN_PROGRESS]: LEAD_ACTIVITY_TYPE.QUOTE_IN_PROGRESS,
    [LEAD_STATUS.CONVERTED]: LEAD_ACTIVITY_TYPE.LEAD_CONVERTED,
    [LEAD_STATUS.NOT_INTERESTED]: LEAD_ACTIVITY_TYPE.LEAD_CLOSED,
  };

  await LeadActivity.create({
    leadId: lead._id,
    actorId: contractorUserId,
    actorRole: ROLES.CONTRACTOR,
    activityType: activityMap[status] || LEAD_ACTIVITY_TYPE.NOTE_ADDED,
    description: notes ? `Status updated to ${status}: ${notes}` : `Status updated to ${status}`,
    previousStatus,
    newStatus: status,
    visibility: status === LEAD_STATUS.NOT_INTERESTED ? 'INTERNAL' : 'CUSTOMER_VISIBLE',
  });

  try {
    await AuditLog.create({
      performedBy: contractorUserId,
      action: `CONTRACTOR_STATUS_${status.toUpperCase()}`,
      entityType: 'LEAD',
      entityId: lead._id,
      oldValue: { status: previousStatus },
      newValue: { status, notes },
    });
  } catch (err) {
    console.error('AuditLog Error:', err.message);
  }

  return lead;
}

/**
 * Admin closes or cancels a lead with an explicit reason.
 */
async function adminCloseOrCancelLead(leadId, adminUser, { action, reason }) {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    const error = new Error('Lead not found.');
    error.statusCode = 404;
    error.code = 'LEAD_NOT_FOUND';
    throw error;
  }

  const newStatus = action === 'CANCEL' ? LEAD_STATUS.CANCELLED : LEAD_STATUS.CLOSED;
  const previousStatus = lead.status;

  lead.status = newStatus;
  lead.closureReason = reason;
  lead.closedAt = new Date();
  lead.lastActivityAt = new Date();
  await lead.save();

  await LeadActivity.create({
    leadId: lead._id,
    actorId: adminUser.id,
    actorRole: ROLES.ADMIN,
    activityType:
      action === 'CANCEL'
        ? LEAD_ACTIVITY_TYPE.LEAD_CANCELLED
        : LEAD_ACTIVITY_TYPE.LEAD_CLOSED,
    description: `Admin ${action.toLowerCase()}ed lead: "${reason}"`,
    previousStatus,
    newStatus,
    visibility: 'CUSTOMER_VISIBLE',
  });

  try {
    await AuditLog.create({
      performedBy: adminUser.id,
      action: `ADMIN_${action}_LEAD`,
      entityType: 'LEAD',
      entityId: lead._id,
      oldValue: { status: previousStatus },
      newValue: { status: newStatus, reason },
    });
  } catch (err) {
    console.error('AuditLog Error:', err.message);
  }

  return lead;
}

/**
 * Add a note / activity to a lead.
 */
async function addActivityNote(leadId, actorUser, { description, visibility = 'INTERNAL' }) {
  const lead = await Lead.findById(leadId);
  if (!lead) {
    const error = new Error('Lead not found.');
    error.statusCode = 404;
    error.code = 'LEAD_NOT_FOUND';
    throw error;
  }

  // Permission check
  const isOwner = lead.customerId.toString() === actorUser.id;
  const isAssigned = lead.assignedContractorId && lead.assignedContractorId.toString() === actorUser.id;
  const isAdmin = actorUser.role === ROLES.ADMIN;

  if (!isOwner && !isAssigned && !isAdmin) {
    const error = new Error('You do not have permission to add notes to this lead.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const activity = await LeadActivity.create({
    leadId: lead._id,
    actorId: actorUser.id,
    actorRole: actorUser.role,
    activityType: LEAD_ACTIVITY_TYPE.NOTE_ADDED,
    description,
    previousStatus: lead.status,
    newStatus: lead.status,
    visibility: isAdmin || isAssigned ? visibility : 'CUSTOMER_VISIBLE',
  });

  lead.lastActivityAt = new Date();
  await lead.save();

  return activity;
}

/**
 * Retrieve activities for a lead with visibility filtering.
 */
async function getLeadActivities(leadId, requestingUser) {
  // First verify lead access
  await getLeadById(leadId, requestingUser);

  const filter = { leadId };

  // If customer, only show CUSTOMER_VISIBLE activities
  if (requestingUser.role === ROLES.CUSTOMER) {
    filter.visibility = 'CUSTOMER_VISIBLE';
  }

  return LeadActivity.find(filter)
    .populate('actorId', 'firstName lastName email role')
    .sort({ createdAt: -1 });
}

/**
 * Retrieve assignment history for a lead.
 */
async function getLeadAssignmentHistory(leadId, requestingUser) {
  await getLeadById(leadId, requestingUser);

  return LeadAssignmentHistory.find({ leadId })
    .populate('previousContractorId', 'firstName lastName email')
    .populate('newContractorId', 'firstName lastName email')
    .populate('assignedBy', 'firstName lastName email')
    .sort({ assignedAt: -1 });
}

/**
 * Aggregate summary metrics for Admin lead management dashboard.
 */
async function getAdminLeadAnalytics() {
  const [total, byStatus, bySource] = await Promise.all([
    Lead.countDocuments({}),
    Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $group: { _id: '$leadSource', count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = {};
  byStatus.forEach((s) => {
    statusCounts[s._id] = s.count;
  });

  const sourceCounts = {};
  bySource.forEach((s) => {
    sourceCounts[s._id] = s.count;
  });

  return {
    totalLeads: total,
    statusCounts,
    sourceCounts,
  };
}

module.exports = {
  createCustomerLead,
  getCustomerLeads,
  getLeadById,
  getAdminLeads,
  assignContractor,
  getContractorLeads,
  contractorAcceptLead,
  contractorRejectLead,
  contractorUpdateStatus,
  adminCloseOrCancelLead,
  addActivityNote,
  getLeadActivities,
  getLeadAssignmentHistory,
  getAdminLeadAnalytics,
};
