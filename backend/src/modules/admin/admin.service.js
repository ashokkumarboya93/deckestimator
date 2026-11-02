// =============================================
// Deck Estimator — Admin Management Service (Phase 10)
// =============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../users/users.model');
const ContractorProfile = require('../contractors/contractorProfile.model');
const Deck = require('../decks/deck.model');
const Estimate = require('../estimates/estimate.model');
const Lead = require('../leads/lead.model');
const DeckConditionAnalysis = require('../condition-analysis/conditionAnalysis.model');
const Commission = require('../commissions/commission.model');
const DiscountPolicy = require('../discounts/discountPolicy.model');
const CommissionPolicy = require('../commissions/commissionPolicy.model');
const PlatformSetting = require('./platformSetting.model');
const AuditLog = require('../../shared/models/auditLog.model');
const { ROLES, ACCOUNT_STATUS } = require('../../shared/constants');

// --- Helper: Log administrative audit record ---
async function logAdminAction(adminUser, action, entityType, entityId, oldValue, newValue, metadata = {}) {
  try {
    await AuditLog.create({
      performedBy: adminUser.id || adminUser._id,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      metadata,
    });
  } catch (err) {
    console.warn(`[AuditLog Warning] Failed to create audit log for ${action}:`, err.message);
  }
}

// =============================================
// 1. DASHBOARD & OPERATIONAL AGGREGATIONS
// =============================================

async function getDashboardSummary() {
  const [
    userStats,
    contractorStats,
    deckStats,
    estimateStats,
    leadStats,
    analysisStats,
    financialStats,
  ] = await Promise.all([
    // Users aggregation
    User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalCustomers: { $sum: { $cond: [{ $eq: ['$role', ROLES.CUSTOMER] }, 1, 0] } },
          totalContractors: { $sum: { $cond: [{ $eq: ['$role', ROLES.CONTRACTOR] }, 1, 0] } },
          totalAdmins: { $sum: { $cond: [{ $eq: ['$role', ROLES.ADMIN] }, 1, 0] } },
          activeUsers: { $sum: { $cond: [{ $eq: ['$accountStatus', ACCOUNT_STATUS.ACTIVE] }, 1, 0] } },
          suspendedUsers: { $sum: { $cond: [{ $eq: ['$accountStatus', ACCOUNT_STATUS.SUSPENDED] }, 1, 0] } },
          deactivatedUsers: { $sum: { $cond: [{ $eq: ['$accountStatus', ACCOUNT_STATUS.DEACTIVATED] }, 1, 0] } },
        },
      },
    ]),

    // Contractor verification breakdown
    ContractorProfile.aggregate([
      {
        $group: {
          _id: null,
          totalProfiles: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'approved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'pending'] }, 1, 0] } },
          underReview: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'under_review'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'rejected'] }, 1, 0] } },
          suspended: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'suspended'] }, 1, 0] } },
        },
      },
    ]),

    // Decks aggregation
    Deck.aggregate([
      {
        $group: {
          _id: null,
          totalDecks: { $sum: 1 },
          totalAreaSqFt: { $sum: '$totalAreaSqFt' },
        },
      },
    ]),

    // Estimates aggregation
    Estimate.aggregate([
      {
        $group: {
          _id: null,
          totalEstimates: { $sum: 1 },
          draft: { $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] } },
          submitted: { $sum: { $cond: [{ $eq: ['$status', 'SUBMITTED'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
          totalVolume: { $sum: '$totalAmount' },
          discountedCount: { $sum: { $cond: [{ $eq: ['$discountBreakdown.applied', true] }, 1, 0] } },
          totalDiscountGranted: {
            $sum: {
              $cond: [{ $eq: ['$discountBreakdown.applied', true] }, '$discountBreakdown.discountAmount', 0],
            },
          },
        },
      },
    ]),

    // Leads aggregation
    Lead.aggregate([
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          newLeads: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $in: ['$status', ['rejected', 'cancelled', 'expired']] }, 1, 0] } },
        },
      },
    ]),

    // AI condition analysis aggregation
    DeckConditionAnalysis.aggregate([
      {
        $group: {
          _id: null,
          totalAnalyses: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } },
          requiresManualReview: { $sum: { $cond: [{ $eq: ['$requiresManualReview', true] }, 1, 0] } },
        },
      },
    ]),

    // Commissions aggregation
    Commission.aggregate([
      {
        $group: {
          _id: null,
          totalCommissions: { $sum: 1 },
          totalAmountCalculated: { $sum: '$calculatedAmount' },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approvedCount: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          payableCount: { $sum: { $cond: [{ $eq: ['$status', 'payable'] }, 1, 0] } },
          paidCount: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
          paidAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$calculatedAmount', 0] },
          },
        },
      },
    ]),
  ]);

  return {
    users: userStats[0] || {
      totalUsers: 0,
      totalCustomers: 0,
      totalContractors: 0,
      totalAdmins: 0,
      activeUsers: 0,
      suspendedUsers: 0,
      deactivatedUsers: 0,
    },
    contractors: contractorStats[0] || {
      totalProfiles: 0,
      approved: 0,
      pending: 0,
      underReview: 0,
      rejected: 0,
      suspended: 0,
    },
    decks: deckStats[0] || { totalDecks: 0, totalAreaSqFt: 0 },
    estimates: estimateStats[0] || {
      totalEstimates: 0,
      draft: 0,
      submitted: 0,
      completed: 0,
      cancelled: 0,
      totalVolume: 0,
      discountedCount: 0,
      totalDiscountGranted: 0,
    },
    leads: leadStats[0] || {
      totalLeads: 0,
      newLeads: 0,
      assigned: 0,
      accepted: 0,
      converted: 0,
      closed: 0,
    },
    aiAnalyses: analysisStats[0] || {
      totalAnalyses: 0,
      completed: 0,
      failed: 0,
      requiresManualReview: 0,
    },
    financials: financialStats[0] || {
      totalCommissions: 0,
      totalAmountCalculated: 0,
      pendingCount: 0,
      approvedCount: 0,
      payableCount: 0,
      paidCount: 0,
      paidAmount: 0,
    },
  };
}

// Get recent platform activities
async function getRecentActivity(limit = 20) {
  const activities = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('performedBy', 'fullName email role');
  return activities;
}

// =============================================
// 2. USER & CUSTOMER MANAGEMENT
// =============================================

async function listUsers({ page = 1, limit = 20, search = '', role, accountStatus, sortBy = 'createdAt', sortOrder = -1 }) {
  const query = {};

  if (role) query.role = role;
  if (accountStatus) query.accountStatus = accountStatus;
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { fullName: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
      { phone: { $regex: escaped, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 1 || sortOrder === 'asc' ? 1 : -1 };

  const [users, total] = await Promise.all([
    User.find(query).sort(sort).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return {
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  // Load contextual records depending on role
  let contractorProfile = null;
  let deckCount = 0;
  let estimateCount = 0;
  let leadCount = 0;

  if (user.role === ROLES.CONTRACTOR) {
    contractorProfile = await ContractorProfile.findOne({ userId: user._id });
    leadCount = await Lead.countDocuments({ assignedContractorId: user._id });
  } else if (user.role === ROLES.CUSTOMER) {
    deckCount = await Deck.countDocuments({ customerId: user._id });
    estimateCount = await Estimate.countDocuments({ customerId: user._id });
    leadCount = await Lead.countDocuments({ customerId: user._id });
  }

  return {
    user,
    contractorProfile,
    stats: {
      deckCount,
      estimateCount,
      leadCount,
    },
  };
}

async function createUser(adminUser, payload) {
  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    const err = new Error('A user with this email address already exists.');
    err.statusCode = 409;
    throw err;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(payload.password, salt);

  const user = await User.create({
    fullName: payload.fullName,
    email: payload.email.toLowerCase(),
    phone: payload.phone || '',
    passwordHash,
    role: payload.role || ROLES.CUSTOMER,
    accountStatus: payload.accountStatus || ACCOUNT_STATUS.ACTIVE,
  });

  // If contractor role, initialize pending profile
  if (user.role === ROLES.CONTRACTOR) {
    await ContractorProfile.create({
      userId: user._id,
      businessName: `${user.fullName}'s Contracting`,
      businessAddress: { street: '', city: '', state: '', zipCode: '' },
      serviceAreas: [],
      supportedSurfaces: [],
      verificationStatus: 'pending',
    });
  }

  await logAdminAction(adminUser, 'CREATE_USER', 'USER', user._id, null, {
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  });

  return user;
}

async function updateUser(adminUser, targetUserId, payload) {
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const adminId = adminUser.id || adminUser._id;

  // Protect Last-Admin: if target is admin and role/status is changed
  if (targetUser.role === ROLES.ADMIN) {
    const isDemoting = payload.role && payload.role !== ROLES.ADMIN;
    const isDisabling = payload.accountStatus && payload.accountStatus !== ACCOUNT_STATUS.ACTIVE;

    if (isDemoting || isDisabling) {
      const activeAdminCount = await User.countDocuments({
        role: ROLES.ADMIN,
        accountStatus: ACCOUNT_STATUS.ACTIVE,
      });

      if (activeAdminCount <= 1) {
        const err = new Error('Cannot demote or deactivate the last remaining active platform administrator.');
        err.statusCode = 400;
        throw err;
      }

      // Self-demotion safeguard
      if (targetUser._id.toString() === adminId.toString()) {
        const err = new Error('Administrators cannot modify their own administrative role or status directly.');
        err.statusCode = 400;
        throw err;
      }
    }
  }

  const oldValue = {
    fullName: targetUser.fullName,
    phone: targetUser.phone,
    role: targetUser.role,
    accountStatus: targetUser.accountStatus,
  };

  if (payload.fullName) targetUser.fullName = payload.fullName;
  if (payload.phone !== undefined) targetUser.phone = payload.phone;
  if (payload.role) targetUser.role = payload.role;
  if (payload.accountStatus) targetUser.accountStatus = payload.accountStatus;

  await targetUser.save();

  await logAdminAction(adminUser, 'UPDATE_USER', 'USER', targetUser._id, oldValue, {
    fullName: targetUser.fullName,
    phone: targetUser.phone,
    role: targetUser.role,
    accountStatus: targetUser.accountStatus,
  }, { reason: payload.statusReason || '' });

  return targetUser;
}

async function updateUserStatus(adminUser, targetUserId, accountStatus, reason = '') {
  return updateUser(adminUser, targetUserId, { accountStatus, statusReason: reason });
}

// =============================================
// 3. DECK & ESTIMATE OVERSIGHT
// =============================================

async function listDecks({ page = 1, limit = 20, search = '', surfaceType, ownerRole }) {
  const query = {};
  if (surfaceType) query.surfaceType = surfaceType;

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { 'address.city': { $regex: escaped, $options: 'i' } },
      { 'address.state': { $regex: escaped, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [decks, total] = await Promise.all([
    Deck.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'fullName email role')
      .populate('contractorId', 'fullName email role'),
    Deck.countDocuments(query),
  ]);

  return {
    data: decks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function listEstimates({ page = 1, limit = 20, status, search = '' }) {
  const query = {};
  if (status) query.status = status;

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { estimateNumber: { $regex: escaped, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [estimates, total] = await Promise.all([
    Estimate.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'fullName email')
      .populate('contractorId', 'fullName email')
      .populate('deckId', 'name surfaceType totalAreaSqFt'),
    Estimate.countDocuments(query),
  ]);

  return {
    data: estimates,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

// =============================================
// 4. AI ANALYSIS OVERSIGHT
// =============================================

async function listAIAnalyses({ page = 1, limit = 20, status, conditionLevel, requiresManualReview }) {
  const query = {};
  if (status) query.status = status;
  if (conditionLevel !== undefined && conditionLevel !== '') query['conditionAssessment.overallConditionLevel'] = Number(conditionLevel);
  if (requiresManualReview !== undefined && requiresManualReview !== '') {
    query.requiresManualReview = requiresManualReview === 'true' || requiresManualReview === true;
  }

  const skip = (page - 1) * limit;

  const [analyses, total] = await Promise.all([
    DeckConditionAnalysis.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('deckId', 'name customerId')
      .populate('requestedBy', 'fullName email role'),
    DeckConditionAnalysis.countDocuments(query),
  ]);

  return {
    data: analyses,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

// =============================================
// 5. PLATFORM SETTINGS MANAGEMENT
// =============================================

async function getSettings(category = null) {
  const query = {};
  if (category) query.category = category;
  const settings = await PlatformSetting.find(query).sort({ category: 1, key: 1 });
  return settings;
}

async function getSettingByKey(key) {
  const setting = await PlatformSetting.findOne({ key: key.toUpperCase() });
  if (!setting) {
    const err = new Error(`Platform setting "${key}" not found.`);
    err.statusCode = 404;
    throw err;
  }
  return setting;
}

async function createSetting(adminUser, payload) {
  const key = payload.key.toUpperCase();
  const existing = await PlatformSetting.findOne({ key });
  if (existing) {
    const err = new Error(`Platform setting "${key}" already exists.`);
    err.statusCode = 409;
    throw err;
  }

  const setting = await PlatformSetting.create({
    key,
    category: payload.category,
    label: payload.label,
    description: payload.description || '',
    valueType: payload.valueType,
    value: payload.value,
    isPublic: payload.isPublic || false,
    isActive: payload.isActive !== undefined ? payload.isActive : true,
    lastUpdatedBy: adminUser.id || adminUser._id,
  });

  await logAdminAction(adminUser, 'CREATE_SETTING', 'PLATFORM_SETTING', setting._id, null, {
    key: setting.key,
    value: setting.value,
  });

  return setting;
}

async function updateSetting(adminUser, keyOrId, payload) {
  let query;
  if (mongoose.isValidObjectId(keyOrId)) {
    query = { $or: [{ _id: keyOrId }, { key: String(keyOrId).toUpperCase() }] };
  } else {
    query = { key: String(keyOrId).toUpperCase() };
  }
  const setting = await PlatformSetting.findOne(query);
  if (!setting) {
    const err = new Error(`Platform setting "${keyOrId}" not found.`);
    err.statusCode = 404;
    throw err;
  }

  const oldValue = {
    value: setting.value,
    label: setting.label,
    isActive: setting.isActive,
    isPublic: setting.isPublic,
  };

  if (payload.value !== undefined) setting.value = payload.value;
  if (payload.label) setting.label = payload.label;
  if (payload.description !== undefined) setting.description = payload.description;
  if (payload.isPublic !== undefined) setting.isPublic = payload.isPublic;
  if (payload.isActive !== undefined) setting.isActive = payload.isActive;
  setting.lastUpdatedBy = adminUser.id || adminUser._id;

  await setting.save();

  await logAdminAction(adminUser, 'UPDATE_SETTING', 'PLATFORM_SETTING', setting._id, oldValue, {
    value: setting.value,
    isActive: setting.isActive,
  });

  return setting;
}

// =============================================
// 6. AUDIT LOGS SEARCH & RETRIEVAL
// =============================================

async function listAuditLogs({ page = 1, limit = 20, entityType, action, actorId, startDate, endDate }) {
  const query = {};
  if (entityType) query.entityType = entityType;
  if (action) query.action = action;
  if (actorId && mongoose.Types.ObjectId.isValid(actorId)) query.performedBy = actorId;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('performedBy', 'fullName email role'),
    AuditLog.countDocuments(query),
  ]);

  return {
    data: logs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

// =============================================
// 7. OPERATIONAL REPORTS & CSV EXPORT
// =============================================

async function getReportData(reportType, { startDate, endDate, status } = {}) {
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  switch (reportType) {
    case 'users': {
      const users = await User.find(dateFilter).sort({ createdAt: -1 }).select('fullName email role accountStatus createdAt');
      return {
        type: 'users',
        columns: ['ID', 'Full Name', 'Email', 'Role', 'Status', 'Registered At'],
        rows: users.map((u) => [u._id.toString(), u.fullName, u.email, u.role, u.accountStatus, u.createdAt.toISOString()]),
      };
    }
    case 'leads': {
      const query = { ...dateFilter };
      if (status) query.status = status;
      const leads = await Lead.find(query).sort({ createdAt: -1 }).populate('customerId', 'fullName email');
      return {
        type: 'leads',
        columns: ['Lead ID', 'Lead Number', 'Customer', 'Status', 'Lead Source', 'Created At'],
        rows: leads.map((l) => [
          l._id.toString(),
          l.leadNumber || l.leadCode || 'N/A',
          l.customerId?.fullName || 'N/A',
          l.status,
          l.leadSource,
          l.createdAt.toISOString(),
        ]),
      };
    }
    case 'estimates': {
      const query = { ...dateFilter };
      if (status) query.status = status;
      const estimates = await Estimate.find(query).sort({ createdAt: -1 });
      return {
        type: 'estimates',
        columns: ['Estimate ID', 'Number', 'Total Amount', 'Status', 'Discount Applied', 'Created At'],
        rows: estimates.map((e) => [
          e._id.toString(),
          e.estimateNumber || 'N/A',
          `$${Number(e.totalAmount || 0).toFixed(2)}`,
          e.status,
          e.discountBreakdown?.applied ? 'Yes' : 'No',
          e.createdAt.toISOString(),
        ]),
      };
    }
    case 'commissions': {
      const query = { ...dateFilter };
      if (status) query.status = status;
      const commissions = await Commission.find(query).sort({ createdAt: -1 }).populate('contractorId', 'fullName email');
      return {
        type: 'commissions',
        columns: ['Commission ID', 'Ref', 'Contractor', 'Amount', 'Status', 'Created At'],
        rows: commissions.map((c) => [
          c._id.toString(),
          c.commissionReference || c.commissionNumber || 'N/A',
          c.contractorId?.fullName || 'N/A',
          `$${Number(c.calculatedAmount || 0).toFixed(2)}`,
          c.status,
          c.createdAt.toISOString(),
        ]),
      };
    }
    default: {
      const err = new Error(`Unsupported report type "${reportType}".`);
      err.statusCode = 400;
      throw err;
    }
  }
}

function convertReportToCSV(report) {
  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const header = report.columns.map(escapeCsv).join(',');
  const rows = report.rows.map((r) => r.map(escapeCsv).join(',')).join('\n');
  return `${header}\n${rows}`;
}

module.exports = {
  getDashboardSummary,
  getRecentActivity,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  listDecks,
  listEstimates,
  listAIAnalyses,
  getSettings,
  getSettingByKey,
  createSetting,
  updateSetting,
  listAuditLogs,
  getReportData,
  convertReportToCSV,
};
