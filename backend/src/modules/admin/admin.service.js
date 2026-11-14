// =============================================
// Deck Estimator — Comprehensive Admin Management Service
// =============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Core Models
const User = require('../users/users.model');
const ContractorProfile = require('../contractors/contractorProfile.model');
const Deck = require('../decks/deck.model');
const Estimate = require('../estimates/estimate.model');
const Lead = require('../leads/lead.model');
const Material = require('../catalogs/material.model');
const MaterialCategory = require('../catalogs/materialCategory.model');
const Service = require('../catalogs/service.model');
const ServiceCategory = require('../catalogs/serviceCategory.model');
const PricingConfiguration = require('../pricing/pricingConfiguration.model');
const DiscountPolicy = require('../discounts/discountPolicy.model');
const DiscountAssignment = require('../discounts/discountAssignment.model');
const DiscountAuditLog = require('../discounts/discountAuditLog.model');
const VerificationHistory = require('../contractors/verificationHistory.model');
const PlatformSetting = require('./platformSetting.model');
const Notification = require('../notifications/notification.model');
const Project = require('./project.model');
const { EstimatorField, EstimatorDependency } = require('./estimatorConfig.model');
const { CatalogProduct, CatalogSubstrate, CatalogCoverageRate } = require('./catalogExtended.model');
const PermissionsPolicy = require('./permissionsPolicy.model');
const AuditLog = require('../../shared/models/auditLog.model');
const UserRequest = require('../users/userRequest.model');
const VerificationDocument = require('../contractors/verificationDocument.model');
const { DEFAULT_PRICING_CONFIG } = require('../pricing/pricingEngine');

const { ROLES, ACCOUNT_STATUS, VERIFICATION_STATUS, LEAD_STATUS } = require('../../shared/constants');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../../shared/errors');
const { invalidateAuthCache } = require('../../middleware/authenticate');

// Helper to log audit events
async function logAdminAction(adminUser, action, entityType, entityId, oldValue, newValue, metadata = {}) {
  try {
    await AuditLog.create({
      performedBy: adminUser.id || adminUser._id,
      action,
      entityType,
      entityId: entityId ? entityId.toString() : null,
      oldValue,
      newValue,
      metadata,
    });
  } catch (err) {
    console.warn(`[AuditLog Warning] ${action}:`, err.message);
  }
}

// ====================================================================
// 1. DASHBOARD & OPERATIONAL AGGREGATIONS (High-Performance Consolidated & In-Memory Cached)
// ====================================================================

const dashboardSummaryCache = new Map();
const DASHBOARD_SUMMARY_TTL = 30000; // 30 seconds TTL — dashboard polls every 10s but data changes rarely

function invalidateAdminDashboardCache() {
  dashboardSummaryCache.clear();
}

async function getDashboardSummary(dateRange = '30d') {
  const cacheKey = String(dateRange);
  const cached = dashboardSummaryCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < DASHBOARD_SUMMARY_TTL) {
    return cached.data;
  }

  const now = new Date();
  let startDate = new Date();

  switch (dateRange) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case 'this_year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case '30d':
    default:
      startDate.setDate(startDate.getDate() - 30);
      break;
  }

  const durationMs = Math.max(now.getTime() - startDate.getTime(), 86400000);
  const priorStart = new Date(startDate.getTime() - durationMs);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  // Consolidated parallel aggregations using $facet (reduces 28 round-trips down to 6 fast operations)
  const [
    userMetrics,
    leadMetrics,
    estimateMetrics,
    projectMetrics,
    hotLeadsList,
    recentEstimatesList,
  ] = await Promise.all([
    // 1. User metrics & status breakdown in 1 query
    User.aggregate([
      { $match: { accountStatus: { $ne: 'disabled' } } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                customers: { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } },
                contractors: { $sum: { $cond: [{ $eq: ['$role', 'contractor'] }, 1, 0] } },
                usersCurrent: { $sum: { $cond: [{ $gte: ['$createdAt', startDate] }, 1, 0] } },
                usersPrior: { $sum: { $cond: [{ $and: [{ $gte: ['$createdAt', priorStart] }, { $lt: ['$createdAt', startDate] }] }, 1, 0] } },
                customersCurrent: { $sum: { $cond: [{ $and: [{ $eq: ['$role', 'customer'] }, { $gte: ['$createdAt', startDate] }] }, 1, 0] } },
                customersPrior: { $sum: { $cond: [{ $and: [{ $eq: ['$role', 'customer'] }, { $gte: ['$createdAt', priorStart] }, { $lt: ['$createdAt', startDate] }] }, 1, 0] } },
                contractorsCurrent: { $sum: { $cond: [{ $and: [{ $eq: ['$role', 'contractor'] }, { $gte: ['$createdAt', startDate] }] }, 1, 0] } },
                contractorsPrior: { $sum: { $cond: [{ $and: [{ $eq: ['$role', 'contractor'] }, { $gte: ['$createdAt', priorStart] }, { $lt: ['$createdAt', startDate] }] }, 1, 0] } },
              },
            },
          ],
          statuses: [
            { $group: { _id: '$accountStatus', count: { $sum: 1 } } },
          ],
        },
      },
    ]),

    // 2. Lead metrics & status breakdown in 1 query (project only needed fields to skip photo blobs)
    Lead.aggregate([
      { $project: { createdAt: 1, latestContactDate: 1, priority: 1, status: 1 } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                leadsCurrent: { $sum: { $cond: [{ $gte: ['$createdAt', startDate] }, 1, 0] } },
                leadsPrior: { $sum: { $cond: [{ $and: [{ $gte: ['$createdAt', priorStart] }, { $lt: ['$createdAt', startDate] }] }, 1, 0] } },
                hotCount: {
                  $sum: {
                    $cond: [
                      {
                        $or: [
                          { $gte: ['$latestContactDate', thirtyDaysAgo] },
                          { $in: ['$priority', ['hot', 'HOT', 'high', 'HIGH']] },
                          { $gte: ['$createdAt', thirtyDaysAgo] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          statuses: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
        },
      },
    ]),

    // 3. Estimate metrics, value & growth in 1 query (project only needed fields — excludes huge photo blobs)
    Estimate.aggregate([
      { $project: { createdAt: 1, totalAmount: 1, 'pricingSnapshot.total': 1 } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                estCurrent: { $sum: { $cond: [{ $gte: ['$createdAt', startDate] }, 1, 0] } },
                estPrior: { $sum: { $cond: [{ $and: [{ $gte: ['$createdAt', priorStart] }, { $lt: ['$createdAt', startDate] }] }, 1, 0] } },
                totalAmountSum: {
                  $sum: {
                    $cond: [
                      { $gt: ['$totalAmount', 0] },
                      '$totalAmount',
                      { $ifNull: ['$pricingSnapshot.total', 0] },
                    ],
                  },
                },
                amountCurrent: {
                  $sum: {
                    $cond: [
                      { $and: [{ $gte: ['$createdAt', startDate] }, { $gt: [{ $ifNull: ['$totalAmount', '$pricingSnapshot.total'] }, 0] }] },
                      { $ifNull: ['$totalAmount', '$pricingSnapshot.total'] },
                      0,
                    ],
                  },
                },
                amountPrior: {
                  $sum: {
                    $cond: [
                      { $and: [{ $gte: ['$createdAt', priorStart] }, { $lt: ['$createdAt', startDate] }] },
                      { $ifNull: ['$totalAmount', '$pricingSnapshot.total'] },
                      0,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ]),

    // 4. Project metrics & status breakdown in 1 query
    Project.aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                activeCount: { $sum: { $cond: [{ $in: ['$status', ['in_progress', 'active']] }, 1, 0] } },
                completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                projectsCurrent: { $sum: { $cond: [{ $gte: ['$createdAt', startDate] }, 1, 0] } },
                projectsPrior: { $sum: { $cond: [{ $and: [{ $gte: ['$createdAt', priorStart] }, { $lt: ['$createdAt', startDate] }] }, 1, 0] } },
              },
            },
          ],
          statuses: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
        },
      },
    ]),

    // 5. Hot Priority Leads (projected lean records)
    Lead.find()
      .select('leadNumber priority status customerSnapshot createdAt latestContactDate userType contactSource name email')
      .sort({ latestContactDate: -1, createdAt: -1 })
      .limit(5)
      .lean(),

    // 6. Recent live platform events (projected lean records)
    Estimate.find()
      .select('estimateNumber totalAmount pricingSnapshot createdAt deckDetails customerSnapshot')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const uTot = userMetrics?.[0]?.totals?.[0] || {};
  const userStatusCounts = userMetrics?.[0]?.statuses || [];

  const lTot = leadMetrics?.[0]?.totals?.[0] || {};
  const leadStatusCounts = leadMetrics?.[0]?.statuses || [];

  const eTot = estimateMetrics?.[0]?.totals?.[0] || {};

  const pTot = projectMetrics?.[0]?.totals?.[0] || {};
  const projectStatusCounts = projectMetrics?.[0]?.statuses || [];

  const totalUsers = uTot.total || 0;
  const totalCustomers = uTot.customers || 0;
  const totalContractors = uTot.contractors || 0;

  const totalLeads = lTot.total || 0;
  const hotPriorityLeadsCount = lTot.hotCount || 0;

  const totalEstimates = eTot.total || 0;
  const estimatedValue = Math.round(eTot.totalAmountSum || 0);
  const totalRevenue = Math.round(pTot.completedCount ? (eTot.totalAmountSum || 0) * 0.35 : 0);

  function calcGrowth(current = 0, prior = 0) {
    if (prior === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prior) / prior) * 100);
  }

  const dynamicGrowth = {
    users: calcGrowth(uTot.usersCurrent, uTot.usersPrior),
    customers: calcGrowth(uTot.customersCurrent, uTot.customersPrior),
    contractors: calcGrowth(uTot.contractorsCurrent, uTot.contractorsPrior),
    leads: calcGrowth(lTot.leadsCurrent, lTot.leadsPrior),
    projects: calcGrowth(pTot.projectsCurrent, pTot.projectsPrior),
    estimates: calcGrowth(eTot.estCurrent, eTot.estPrior),
    value: calcGrowth(eTot.amountCurrent, eTot.amountPrior),
  };

  // Format Lead Status Overview (New, Assigned, In Progress, Converted, Lost)
  const leadStatuses = {
    new: 0,
    assigned: 0,
    in_progress: 0,
    converted: 0,
    lost: 0,
  };
  leadStatusCounts.forEach((s) => {
    const k = (s._id || '').toLowerCase();
    if (k === 'new') leadStatuses.new += s.count;
    else if (k.includes('assign')) leadStatuses.assigned += s.count;
    else if (k.includes('progress') || k.includes('review') || k.includes('contact')) leadStatuses.in_progress += s.count;
    else if (k.includes('convert')) leadStatuses.converted += s.count;
    else leadStatuses.lost += s.count;
  });

  const leadDistribution = [
    { label: 'New', count: leadStatuses.new, color: '#1d4ed8' },
    { label: 'Assigned', count: leadStatuses.assigned, color: '#10b981' },
    { label: 'In Progress', count: leadStatuses.in_progress, color: '#f59e0b' },
    { label: 'Converted', count: leadStatuses.converted, color: '#8b5cf6' },
    { label: 'Lost', count: leadStatuses.lost, color: '#ef4444' },
  ].map((item) => ({
    ...item,
    percentage: totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0,
  }));

  if (totalLeads > 0) {
    const currentSum = leadDistribution.reduce((acc, i) => acc + i.percentage, 0);
    if (currentSum > 0 && currentSum !== 100) {
      const maxItem = leadDistribution.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), leadDistribution[0]);
      maxItem.percentage += (100 - currentSum);
    }
  }

  // Format Project Status Overview (Active, Completed, On Hold)
  const projectStatuses = {
    active: pTot.activeCount || 0,
    completed: pTot.completedCount || 0,
    on_hold: 0,
    total: pTot.total || 0,
  };
  projectStatusCounts.forEach((p) => {
    const st = (p._id || '').toLowerCase();
    if (st !== 'in_progress' && st !== 'active' && st !== 'completed') {
      projectStatuses.on_hold += p.count;
    }
  });

  const projTotal = projectStatuses.total;
  const projActivePct = projTotal > 0 ? Math.round((projectStatuses.active / projTotal) * 100) : 0;
  const projCompletedPct = projTotal > 0 ? Math.round((projectStatuses.completed / projTotal) * 100) : 0;
  const projOnHoldPct = projTotal > 0 ? Math.max(0, 100 - projActivePct - projCompletedPct) : 0;

  // Format Hot Priority Leads Panel
  const formattedHotLeads = hotLeadsList.map((l, idx) => ({
    id: l._id,
    leadId: l.leadNumber || `LD-${101 + idx * 4}`,
    name: l.customerSnapshot?.name || l.name || 'Valued Customer',
    type: l.userType || (l.contractorId ? 'Contractor' : 'Customer'),
    source: l.contactSource || 'Customer Portal',
    priority: l.priority || 'HOT',
    status: l.status ? (l.status.charAt(0).toUpperCase() + l.status.slice(1).replace(/_/g, ' ')) : 'New',
    contactDate: l.latestContactDate || l.createdAt || new Date(),
    email: l.customerSnapshot?.email || l.email || 'N/A',
  }));

  // Format Recent Activities
  const formattedActivities = recentEstimatesList.map((e) => {
    const custName = e.customerSnapshot?.name || e.deckDetails?.projectName || 'Customer';
    const totalVal = e.totalAmount || e.pricingSnapshot?.total || 0;
    return {
      id: 'est-' + e._id,
      date: e.createdAt,
      type: 'estimate',
      title: `Estimate Created — ${custName} (${e.estimateNumber || 'EST-' + String(e._id).slice(-6).toUpperCase()})`,
      subtitle: totalVal ? `$${Math.round(totalVal).toLocaleString()}` : 'Estimate Active',
    };
  });

  const result = {
    summary: {
      totalUsers,
      totalCustomers,
      totalContractors,
      totalLeads,
      hotPriorityLeads: hotPriorityLeadsCount,
      activeProjects: projectStatuses.active,
      totalEstimates,
      estimatedValue,
      totalRevenue,
      growth: dynamicGrowth,
    },
    leadOverview: {
      total: totalLeads,
      distribution: leadDistribution,
    },
    projectOverview: {
      total: projTotal,
      active: projectStatuses.active,
      completed: projectStatuses.completed,
      onHold: projectStatuses.on_hold,
      percentages: {
        active: projActivePct,
        completed: projCompletedPct,
        onHold: projOnHoldPct,
      },
    },
    hotLeads: formattedHotLeads,
    recentActivities: formattedActivities,
    userOverview: {
      total: totalUsers,
      distribution: [
        { label: 'Customers', count: totalCustomers, color: '#1d4ed8', role: 'customer' },
        { label: 'Contractors', count: totalContractors, color: '#f59e0b', role: 'contractor' },
        { label: 'Active', count: userStatusCounts.reduce((acc, u) => (u._id === 'active' ? acc + u.count : acc), 0), color: '#10b981', status: 'active' },
        { label: 'Pending', count: userStatusCounts.reduce((acc, u) => (u._id !== 'active' && u._id !== 'blocked' ? acc + u.count : acc), 0), color: '#8b5cf6', status: 'pending' },
        { label: 'Blocked', count: userStatusCounts.reduce((acc, u) => (u._id === 'blocked' ? acc + u.count : acc), 0), color: '#ef4444', status: 'blocked' },
      ].map((item) => ({
        ...item,
        percentage: totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0,
      })),
    },
  };

  dashboardSummaryCache.set(cacheKey, { data: result, cachedAt: Date.now() });
  return result;
}

async function getBusinessActivityTrend(period = '30d') {
  const now = new Date();
  let startDate = new Date();
  let numPoints = 11;

  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      numPoints = 7;
      break;
    case 'this_year':
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      numPoints = 12;
      break;
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      numPoints = 6;
      break;
    case '30d':
    default:
      startDate.setDate(startDate.getDate() - 30);
      numPoints = 11;
      break;
  }

  // Real aggregations: group createdAt by YYYY-MM-DD from MongoDB
  const [userByDay, leadByDay, estByDay] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $exists: true } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: { createdAt: { $exists: true } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
    Estimate.aggregate([
      { $match: { createdAt: { $exists: true } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
  ]);

  const stepMs = (now.getTime() - startDate.getTime()) / Math.max(numPoints - 1, 1);
  const labels = [];
  const usersSeries = [];
  const leadsSeries = [];
  const estimatesSeries = [];

  for (let i = 0; i < numPoints; i++) {
    const cp = new Date(startDate.getTime() + i * stepMs);
    const dateStr = cp.toISOString().split('T')[0];
    const label = cp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    labels.push(label);

    const uCount = userByDay.filter((d) => d._id <= dateStr).reduce((s, d) => s + d.count, 0);
    const lCount = leadByDay.filter((d) => d._id <= dateStr).reduce((s, d) => s + d.count, 0);
    const eCount = estByDay.filter((d) => d._id <= dateStr).reduce((s, d) => s + d.count, 0);

    usersSeries.push(uCount);
    leadsSeries.push(lCount);
    estimatesSeries.push(eCount);
  }

  return {
    labels,
    series: [
      { name: 'Users', color: '#1d4ed8', data: usersSeries },
      { name: 'Leads', color: '#10b981', data: leadsSeries },
      { name: 'Estimates', color: '#8b5cf6', data: estimatesSeries },
    ],
  };
}

// ====================================================================
// 2. USER MANAGEMENT (4 Tabs & Account Moderation)
// ====================================================================

async function listUsers({ page = 1, limit = 10, userType, role, accountStatus, status, search, sort = 'newest', registrationDate }) {
  const roleFilter = role || userType;
  const query = { accountStatus: { $ne: 'disabled' } };
  if (roleFilter && roleFilter !== 'all') {
    query.role = roleFilter.toLowerCase();
  }

  const effectiveStatus = status || accountStatus;
  if (effectiveStatus && effectiveStatus !== 'all') {
    query.accountStatus = effectiveStatus.toLowerCase();
  }
  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
    if (mongoose.Types.ObjectId.isValid(search.trim())) {
      query.$or.push({ _id: search.trim() });
    }
  }

  if (registrationDate && registrationDate !== 'all') {
    const now = new Date();
    let past = new Date();
    if (registrationDate === 'today') past.setHours(0, 0, 0, 0);
    else if (registrationDate === '7d') past.setDate(now.getDate() - 7);
    else if (registrationDate === '30d') past.setDate(now.getDate() - 30);
    else if (registrationDate === 'this_month') past = new Date(now.getFullYear(), now.getMonth(), 1);
    query.createdAt = { $gte: past };
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };
  else if (sort === 'name_asc') sortOption = { fullName: 1 };
  else if (sort === 'name_desc') sortOption = { fullName: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total, countFacet] = await Promise.all([
    User.find(query).select('-passwordHash -__v').sort(sortOption).skip(skip).limit(Number(limit)).lean(),
    User.countDocuments(query),
    User.aggregate([
      {
        $facet: {
          totalUsers: [{ $match: { accountStatus: { $ne: 'disabled' } } }, { $count: 'count' }],
          totalCustomers: [{ $match: { role: ROLES.CUSTOMER, accountStatus: { $ne: 'disabled' } } }, { $count: 'count' }],
          totalContractors: [{ $match: { role: ROLES.CONTRACTOR, accountStatus: { $ne: 'disabled' } } }, { $count: 'count' }],
          activeUsers: [{ $match: { accountStatus: 'active' } }, { $count: 'count' }],
          inactiveUsers: [
            { $match: { accountStatus: { $in: ['inactive', 'suspended', 'blocked', 'pending_verification'] } } },
            { $count: 'count' },
          ],
        },
      },
    ]),
  ]);

  const userIds = users.map((u) => u._id);
  const [deckCounts, estimateCounts, contractorProfiles] = await Promise.all([
    userIds.length > 0
      ? Deck.aggregate([
          { $match: { ownerId: { $in: userIds } } },
          { $group: { _id: '$ownerId', count: { $sum: 1 } } },
        ])
      : [],
    userIds.length > 0
      ? Estimate.aggregate([
          { $match: { customerId: { $in: userIds } } },
          { $group: { _id: '$customerId', count: { $sum: 1 } } },
        ])
      : [],
    userIds.length > 0
      ? ContractorProfile.find({ userId: { $in: userIds } }).lean()
      : [],
  ]);

  const deckMap = {};
  deckCounts.forEach((d) => {
    deckMap[d._id.toString()] = d.count;
  });
  const estMap = {};
  estimateCounts.forEach((e) => {
    estMap[e._id.toString()] = e.count;
  });

  const profileMap = {};
  contractorProfiles.forEach((cp) => {
    profileMap[cp.userId.toString()] = cp;
  });

  const enrichedUsers = users.map((u) => {
    const idStr = u._id.toString();
    const cp = profileMap[idStr] || null;
    return {
      ...u,
      userId: `U-${idStr.slice(-4).toUpperCase()}`,
      projectsCount: deckMap[idStr] || 0,
      estimatesCount: estMap[idStr] || 0,
      contractorProfile: cp ? {
        ...cp,
        companyName: cp.businessName,
        verificationStatus: cp.verificationStatus,
        licenseNumber: cp.licenseNumber,
      } : null,
    };
  });

  const facetObj = countFacet[0] || {};
  return {
    data: enrichedUsers,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
    counts: {
      totalUsers: facetObj.totalUsers?.[0]?.count || 0,
      totalCustomers: facetObj.totalCustomers?.[0]?.count || 0,
      totalContractors: facetObj.totalContractors?.[0]?.count || 0,
      activeUsers: facetObj.activeUsers?.[0]?.count || 0,
      inactiveUsers: facetObj.inactiveUsers?.[0]?.count || 0,
    },
  };
}


const { persistAvatarIfBase64 } = require('../../shared/utils/avatarStorage');

async function getUserProfile(userId) {
  const user = await User.findById(userId).lean();
  if (!user) throw new NotFoundError('User not found.');

  // Auto-offload legacy base64 avatar to static disk file if present
  if (user.avatar && user.avatar.startsWith('data:image')) {
    const staticUrl = persistAvatarIfBase64(user._id, user.avatar);
    user.avatar = staticUrl;
    User.updateOne({ _id: user._id }, { $set: { avatar: staticUrl } }).catch(() => {});
  }

  const isCust = (user.role || '').toLowerCase() === 'customer';
  const isCont = (user.role || '').toLowerCase() === 'contractor';

  const [decks, estimates, profile, leads, activities, documents] = await Promise.all([
    isCust || isCont
      ? Deck.find({ ownerId: user._id })
          .select('name area dimensions surfaceMaterial conditionLevel createdAt')
          .sort({ createdAt: -1 })
          .lean()
      : [],
    isCust || isCont
      ? Estimate.find({ $or: [{ ownerId: user._id }, { customerId: user._id }] })
          .select('estimateReference totalCost pricing status createdAt deckId')
          .sort({ createdAt: -1 })
          .lean()
      : [],
    isCont ? ContractorProfile.findOne({ userId: user._id }).lean() : null,
    Lead.find(isCont ? { contractorId: user._id } : { customerId: user._id })
      .select('leadNumber contactSource contactCount latestContactDate status enquiry priority assignedContractorId createdAt')
      .sort({ createdAt: -1 })
      .limit(25)
      .lean(),
    AuditLog.find({ performedBy: user._id })
      .select('action entityType entityId createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    isCont ? VerificationDocument.find({ userId: user._id }).lean() : [],
  ]);

  const activeEstimatesCount = estimates.filter((e) => e.status !== 'cancelled' && e.status !== 'expired').length;
  const totalEstimatedValue = estimates.reduce((sum, e) => sum + (e.totalCost || e.pricing?.totalCost || 0), 0);

  const serializedUser = {
    ...user,
    id: String(user._id),
  };

  return {
    user: serializedUser,
    contractorProfile: profile || null,
    customerData: isCust ? {
      decksCount: decks.length,
      decks: decks.map((d) => ({
        id: (d._id || d.id).toString(),
        name: d.name,
        area: d.area,
        dimensions: d.dimensions,
        surfaceMaterial: d.surfaceMaterial,
        conditionLevel: d.conditionLevel,
        createdAt: d.createdAt,
      })),
      estimatesCount: estimates.length,
      activeEstimatesCount,
      totalEstimatedValue,
      estimates: estimates.map((e) => ({
        id: (e._id || e.id).toString(),
        estimateReference: e.estimateReference || `EST-${(e._id || e.id).toString().slice(-4).toUpperCase()}`,
        deckName: typeof e.deckId === 'object' && e.deckId?.name ? e.deckId.name : 'Deck Project',
        totalCost: e.totalCost || e.pricing?.totalCost || 0,
        status: e.status || 'draft',
        createdAt: e.createdAt,
      })),
    } : null,
    contractorData: isCont ? {
      profile: profile || null,
      assignedLeadsCount: leads.filter((l) => l.assignedContractorId?.toString() === user._id.toString()).length,
      assignedLeads: leads.filter((l) => l.assignedContractorId?.toString() === user._id.toString()).map((l) => ({
        id: (l._id || l.id).toString(),
        leadNumber: l.leadNumber,
        status: l.status,
        createdAt: l.createdAt,
      })),
    } : null,
    enquiriesCount: leads.length,
    enquiries: leads.map((l) => ({
      id: (l._id || l.id).toString(),
      leadNumber: l.leadNumber,
      source: l.contactSource || (isCont ? 'Reach Out' : 'Contact Us'),
      contactCount: l.contactCount || 1,
      latestContactDate: l.latestContactDate || l.createdAt,
      status: l.status,
      subject: l.enquiry?.subject,
      message: l.enquiry?.message,
      priority: l.priority,
    })),
    projects: decks,
    estimates,
    recentActivities: activities,
    verificationDocuments: documents,
  };
}

async function exportSingleUserDossier(userId, format = 'csv') {
  const profileData = await getUserProfile(userId);
  const u = profileData.user;
  const cp = profileData.contractorProfile;
  const cd = profileData.customerData;
  const kd = profileData.contractorData;

  const escape = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
  const sections = [];

  // Section 1: Overview
  sections.push(['--- USER ACCOUNT PROFILE & REGISTRATION ---']);
  sections.push(['Field', 'Value']);
  sections.push(['User ID', (u._id || u.id || '').toString()]);
  sections.push(['Full Name', u.fullName]);
  sections.push(['Email Address', u.email]);
  sections.push(['Phone Number', u.phone || 'N/A']);
  sections.push(['Account Role', u.role?.toUpperCase()]);
  sections.push(['Account Status', u.accountStatus || 'active']);
  sections.push(['Registered Date', u.createdAt ? new Date(u.createdAt).toISOString() : 'N/A']);
  sections.push(['Email Verified', u.emailVerifiedAt ? 'Yes' : 'No']);
  sections.push(['Phone Verified', u.phoneVerifiedAt ? 'Yes' : 'No']);

  if (cp) {
    sections.push([]);
    sections.push(['--- CONTRACTOR CREDENTIALS & LICENSING ---']);
    sections.push(['Business / Company Name', cp.businessName || 'N/A']);
    sections.push(['Contractor License #', cp.licenseNumber || 'N/A']);
    sections.push(['Jurisdiction / State', cp.licenseJurisdiction || 'N/A']);
    sections.push(['Years Experience', cp.yearsOfExperience || 0]);
    sections.push(['Verification Status', cp.verificationStatus || 'pending']);
    sections.push(['Approved At', cp.approvedAt ? new Date(cp.approvedAt).toISOString() : 'N/A']);
    sections.push(['Business Phone', cp.businessPhone || 'N/A']);
    sections.push(['Business Email', cp.businessEmail || 'N/A']);
  }

  if (cd) {
    sections.push([]);
    sections.push(['--- CUSTOMER ESTIMATES & DECK PROJECTS ---']);
    sections.push(['Total Decks', cd.decksCount]);
    sections.push(['Total Estimates', cd.estimatesCount]);
    sections.push(['Active Estimates', cd.activeEstimatesCount]);
    sections.push(['Total Estimated Value ($)', cd.totalEstimatedValue]);
    sections.push([]);
    sections.push(['Estimate Ref', 'Deck Project', 'Estimated Cost ($)', 'Status', 'Date']);
    cd.estimates.forEach((e) => {
      sections.push([e.estimateReference, e.deckName, e.totalCost, e.status, new Date(e.createdAt).toISOString().split('T')[0]]);
    });
  }

  if (u.moderationHistory && u.moderationHistory.length > 0) {
    sections.push([]);
    sections.push(['--- ACCOUNT MODERATION HISTORY ---']);
    sections.push(['Date', 'New Status', 'Reason']);
    u.moderationHistory.forEach((h) => {
      sections.push([new Date(h.changedAt || h.updatedAt || Date.now()).toISOString(), h.newStatus || h.status, h.reason || 'N/A']);
    });
  }

  const csv = sections.map((row) => row.map(escape).join(',')).join('\n');

  return {
    data: csv,
    contentType: format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv',
    filename: `user-profile-${u.fullName.replace(/\s+/g, '_')}-${Date.now()}.${format === 'excel' ? 'xls' : 'csv'}`,
  };
}


async function updateUserStatus(adminUser, targetUserId, status, reason = '') {
  const user = await User.findById(targetUserId).select('+passwordHash');
  if (!user) throw new NotFoundError('User not found.');

  const oldStatus = user.accountStatus;
  user.accountStatus = status;

  if (!user.moderationHistory) user.moderationHistory = [];
  user.moderationHistory.push({
    status,
    reason,
    updatedBy: adminUser.id || adminUser._id,
    updatedAt: new Date(),
  });

  await user.save();
  invalidateAuthCache(user._id);
  invalidateAdminDashboardCache();
  await logAdminAction(adminUser, 'USER_STATUS_UPDATE', 'User', user._id, { status: oldStatus }, { status, reason });
  return user.toJSON();
}

async function softDeleteUser(adminUser, targetUserId, reason = 'Administrative account deletion', permanent = false) {
  const user = await User.findById(targetUserId).select('+passwordHash');
  if (!user) throw new NotFoundError('User not found.');

  if (permanent) {
    await User.findByIdAndDelete(targetUserId);
    invalidateAuthCache(targetUserId);
    await ContractorProfile.deleteOne({ userId: targetUserId });
    await logAdminAction(adminUser, 'USER_DELETED_PERMANENT', 'User', targetUserId, null, { reason });
    return { success: true, message: 'Account permanently deleted from system.' };
  }

  user.accountStatus = 'disabled';
  user.deletedAt = new Date();

  if (!user.moderationHistory) user.moderationHistory = [];
  user.moderationHistory.push({
    status: 'disabled',
    reason,
    updatedBy: adminUser.id || adminUser._id,
    updatedAt: new Date(),
  });

  await user.save();
  invalidateAuthCache(user._id);
  await logAdminAction(adminUser, 'USER_DELETED_SOFT', 'User', user._id, null, { deletedAt: user.deletedAt, reason });
  return { success: true, message: 'Account deactivated and scheduled for retention compliance.' };
}

// --------------------------------------------------------------------
// User Appeals & Requests Management
// --------------------------------------------------------------------

async function listUserRequests({ page = 1, limit = 20, status = 'all', search = '' }) {
  const query = {};
  if (status && status !== 'all') {
    query.status = status;
  }
  if (search && search.trim()) {
    const rx = new RegExp(search.trim(), 'i');
    query.$or = [{ fullName: rx }, { email: rx }, { message: rx }];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [requests, total, pendingCount, resolvedCount, rejectedCount] = await Promise.all([
    UserRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    UserRequest.countDocuments(query),
    UserRequest.countDocuments({ status: 'pending' }),
    UserRequest.countDocuments({ status: 'resolved' }),
    UserRequest.countDocuments({ status: 'rejected' }),
  ]);

  return {
    data: requests,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
    counts: {
      pending: pendingCount,
      resolved: resolvedCount,
      rejected: rejectedCount,
      total,
    },
  };
}

async function resolveUserRequest(adminUser, requestId, { action, adminNotes = '' }) {
  const reqDoc = await UserRequest.findById(requestId);
  if (!reqDoc) throw new NotFoundError('User request not found.');

  if (action === 'approve' || action === 'unblock') {
    reqDoc.status = 'resolved';
    reqDoc.resolvedAt = new Date();
    reqDoc.reviewedBy = adminUser.id || adminUser._id;
    reqDoc.adminNotes = adminNotes || 'Account unblocked by administrator.';
    await reqDoc.save();

    // Reactivate the target user account
    const user = await User.findById(reqDoc.userId);
    if (user) {
      user.accountStatus = 'active';
      if (!user.moderationHistory) user.moderationHistory = [];
      user.moderationHistory.push({
        status: 'active',
        reason: `Reactivation appeal approved by admin: ${adminNotes || 'Appeal approved'}`,
        updatedBy: adminUser.id || adminUser._id,
        updatedAt: new Date(),
      });
      await user.save();
      invalidateAuthCache(user._id);
    }
  } else if (action === 'reject') {
    reqDoc.status = 'rejected';
    reqDoc.resolvedAt = new Date();
    reqDoc.reviewedBy = adminUser.id || adminUser._id;
    reqDoc.adminNotes = adminNotes || 'Reactivation appeal rejected.';
    await reqDoc.save();
  }

  await logAdminAction(adminUser, 'USER_REQUEST_RESOLVED', 'UserRequest', reqDoc._id, null, { action, adminNotes });
  return reqDoc;
}

// --------------------------------------------------------------------
// Contractor Uploaded Verification Documents
// --------------------------------------------------------------------

async function listContractorDocuments({ page = 1, limit = 50, status = 'all' }) {
  const query = {};
  if (status && status !== 'all') {
    query.documentStatus = status;
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [docs, total, pendingCount, verifiedCount, rejectedCount] = await Promise.all([
    VerificationDocument.find(query)
      .populate('userId', 'fullName email phone')
      .populate('contractorId', 'businessName licenseNumber verificationStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    VerificationDocument.countDocuments(query),
    VerificationDocument.countDocuments({ documentStatus: 'pending_review' }),
    VerificationDocument.countDocuments({ documentStatus: 'verified' }),
    VerificationDocument.countDocuments({ documentStatus: 'rejected' }),
  ]);

  return {
    data: docs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
    counts: {
      pending: pendingCount,
      verified: verifiedCount,
      rejected: rejectedCount,
      total,
    },
  };
}

async function reviewContractorDocument(adminUser, docId, { status, notes = '' }) {
  const doc = await VerificationDocument.findById(docId);
  if (!doc) throw new NotFoundError('Verification document not found.');

  doc.documentStatus = status; // 'verified' or 'rejected'
  doc.reviewNotes = notes || '';
  doc.reviewedBy = adminUser.id || adminUser._id;
  doc.reviewedAt = new Date();
  await doc.save();

  await logAdminAction(adminUser, 'CONTRACTOR_DOC_REVIEWED', 'VerificationDocument', doc._id, null, { status, notes });
  return doc;
}

// ====================================================================
// 3. CONTRACTOR VERIFICATIONS (Approve, Reject with Reason, History)
// ====================================================================

async function listVerifications({ page = 1, limit = 10, status = 'all', search = '' }) {
  const query = {};
  if (status && status !== 'all') {
    if (status.toLowerCase() === 'pending') {
      query.verificationStatus = { $in: ['pending', 'draft', 'under_review', 'pending_verification'] };
    } else {
      query.verificationStatus = status.toLowerCase();
    }
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [profiles, total, statusFacet] = await Promise.all([
    ContractorProfile.find(query)
      .populate('userId', 'fullName email phone accountStatus createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    ContractorProfile.countDocuments(query),
    ContractorProfile.aggregate([
      {
        $facet: {
          pending: [
            { $match: { verificationStatus: { $in: ['pending', 'draft', 'under_review', 'pending_verification'] } } },
            { $count: 'count' },
          ],
          approved: [
            { $match: { verificationStatus: 'approved' } },
            { $count: 'count' },
          ],
          rejected: [
            { $match: { verificationStatus: 'rejected' } },
            { $count: 'count' },
          ],
        },
      },
    ]),
  ]);

  let filtered = profiles;
  if (search) {
    const q = search.toLowerCase();
    filtered = profiles.filter(
      (p) =>
        p.businessName?.toLowerCase().includes(q) ||
        p.userId?.fullName?.toLowerCase().includes(q) ||
        p.userId?.email?.toLowerCase().includes(q) ||
        p.licenseNumber?.toLowerCase().includes(q)
    );
  }

  const mapped = filtered.map((p) => {
    const st = (p.verificationStatus === 'draft' || p.verificationStatus === 'under_review' || p.verificationStatus === 'pending_verification')
      ? 'pending'
      : (p.verificationStatus || 'pending');

    return {
      _id: p._id.toString(),
      contractorId: p._id.toString(),
      userId: p.userId?._id?.toString() || p.userId?.toString(),
      contractorName: p.userId?.fullName || p.businessName || 'Contractor',
      contractorEmail: p.userId?.email || p.businessEmail || 'N/A',
      contractorPhone: p.userId?.phone || p.businessPhone || 'N/A',
      companyName: p.businessName || 'Contractor Company',
      businessName: p.businessName || 'Contractor Company',
      licenseNumber: p.licenseNumber || 'N/A',
      licenseJurisdiction: p.licenseJurisdiction || 'N/A',
      yearsOfExperience: p.yearsOfExperience || 0,
      status: st,
      verificationStatus: p.verificationStatus,
      submittedAt: p.submittedAt || p.createdAt,
      createdAt: p.createdAt,
      approvedAt: p.approvedAt,
      rejectionReason: p.rejectionReason,
      documents: p.documents || [],
      businessAddress: p.businessAddress,
    };
  });

  return {
    data: mapped,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
    counts: {
      pending: statusFacet[0]?.pending?.[0]?.count || 0,
      approved: statusFacet[0]?.approved?.[0]?.count || 0,
      rejected: statusFacet[0]?.rejected?.[0]?.count || 0,
    },
  };
}

async function approveContractorVerification(adminUser, profileId) {
  let profile = await ContractorProfile.findById(profileId);
  if (!profile) {
    profile = await ContractorProfile.findOne({ userId: profileId });
  }
  if (!profile) throw new NotFoundError('Contractor profile not found.');

  const previousStatus = profile.verificationStatus;
  profile.verificationStatus = 'approved';
  profile.approvedAt = new Date();
  profile.reviewedBy = adminUser.id || adminUser._id;
  profile.reviewedAt = new Date();
  profile.rejectionReason = '';
  await profile.save();

  if (profile.userId) {
    await User.findByIdAndUpdate(profile.userId, { accountStatus: 'active' });
  }

  await VerificationHistory.create({
    contractorId: profile._id,
    userId: profile.userId,
    previousStatus,
    newStatus: 'approved',
    action: 'APPROVAL',
    reason: 'Verified and approved by administrator',
    performedBy: adminUser.id || adminUser._id,
    performedByRole: 'admin',
  });

  await logAdminAction(adminUser, 'CONTRACTOR_VERIFICATION_APPROVED', 'ContractorProfile', profile._id, { status: previousStatus }, { status: 'approved' });
  invalidateAdminDashboardCache();

  return profile.toJSON();
}

async function rejectContractorVerification(adminUser, profileId, reason) {
  if (!reason || !reason.trim()) {
    throw new BadRequestError('Rejection reason is required.');
  }

  let profile = await ContractorProfile.findById(profileId);
  if (!profile) {
    profile = await ContractorProfile.findOne({ userId: profileId });
  }
  if (!profile) throw new NotFoundError('Contractor profile not found.');

  const previousStatus = profile.verificationStatus;
  profile.verificationStatus = 'rejected';
  profile.rejectionReason = reason.trim();
  profile.reviewedBy = adminUser.id || adminUser._id;
  profile.reviewedAt = new Date();
  await profile.save();

  if (profile.userId) {
    await User.findByIdAndUpdate(profile.userId, { accountStatus: 'suspended' });
  }

  await VerificationHistory.create({
    contractorId: profile._id,
    userId: profile.userId,
    previousStatus,
    newStatus: 'rejected',
    action: 'REJECTION',
    reason: reason.trim(),
    performedBy: adminUser.id || adminUser._id,
    performedByRole: 'admin',
  });

  await logAdminAction(adminUser, 'CONTRACTOR_VERIFICATION_REJECTED', 'ContractorProfile', profile._id, { status: previousStatus }, { status: 'rejected', reason: reason.trim() });
  invalidateAdminDashboardCache();

  return profile.toJSON();
}

async function getVerificationHistoryList(contractorProfileId) {
  let query = {};
  if (contractorProfileId && contractorProfileId !== 'all') {
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(contractorProfileId)) {
      query = {
        $or: [
          { contractorId: contractorProfileId },
          { userId: contractorProfileId }
        ]
      };
    }
  }

  return VerificationHistory.find(query)
    .sort({ createdAt: -1 })
    .populate('performedBy', 'fullName email')
    .populate('userId', 'fullName email');
}

// ====================================================================
// 4. PROJECTS & PROGRESS TRACKING (With History & Export)
// ====================================================================

async function listProjects({ page = 1, limit = 50, status = 'all', search = '', contractorId, customerId }) {
  const query = {};
  if (status && status !== 'all') {
    const s = status.toLowerCase();
    if (s === 'created') query.estimateStatus = { $in: ['CREATED', 'DRAFT'] };
    else if (s === 'requested') query.estimateStatus = { $in: ['REQUESTED', 'IN_REVIEW', 'SUBMITTED'] };
    else if (s === 'in_progress' || s === 'in progress') query.estimateStatus = { $in: ['IN_PROGRESS', 'in_progress'] };
    else if (s === 'completed') query.estimateStatus = { $in: ['COMPLETED', 'completed'] };
    else query.estimateStatus = s;
  }
  if (customerId) query.ownerId = customerId;

  if (search && search.trim()) {
    const reg = new RegExp(search.trim(), 'i');
    query.$or = [
      { estimateReference: reg },
      { 'deckDetails.projectName': reg },
      { 'customerSnapshot.name': reg },
      { 'deckDetails.city': reg },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  // Both Customer and Contractor Estimations are monitored as Projects
  const [estimates, totalEstimates, statusFacetResult] = await Promise.all([
    Estimate.find(query)
      .select('-photos -deckDetails.photos -__v')
      .populate('ownerId', 'fullName email phone role')
      .populate('createdBy', 'fullName email phone role')
      .populate('deckId', '-photos -__v')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Estimate.countDocuments(query),
    Estimate.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          created: [
            { $match: { estimateStatus: { $in: ['CREATED', 'DRAFT'] } } },
            { $count: 'count' },
          ],
          requested: [
            { $match: { estimateStatus: { $in: ['REQUESTED', 'IN_REVIEW', 'SUBMITTED'] } } },
            { $count: 'count' },
          ],
          inProgress: [
            { $match: { estimateStatus: { $in: ['IN_PROGRESS', 'in_progress'] } } },
            { $count: 'count' },
          ],
          completed: [
            { $match: { estimateStatus: { $in: ['COMPLETED', 'completed'] } } },
            { $count: 'count' },
          ],
          totalValue: [
            { $match: { totalAmount: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
          ],
        },
      },
    ]),
  ]);

  const mapped = estimates.map((e) => {
    const rawSt = (e.estimateStatus || 'CREATED').toLowerCase();
    let stage = 'created';
    if (rawSt === 'completed') stage = 'completed';
    else if (rawSt === 'in_progress') stage = 'in_progress';
    else if (rawSt === 'requested' || rawSt === 'in_review' || rawSt === 'submitted') stage = 'requested';

    const userDoc = e.ownerId || e.createdBy;
    const isContractor = userDoc?.role === 'contractor' || e.estimateType === 'CONTRACTOR';
    const customerName = isContractor ? 'Contractor Partner' : (userDoc?.fullName || e.customerSnapshot?.name || 'Customer');
    const contractorName = isContractor ? (userDoc?.fullName || 'Contractor') : (e.assignedContractorName || 'Deck Restoration Plus Staff');

    return {
      _id: e._id.toString(),
      id: e._id.toString(),
      projectId: e.estimateReference || `PRJ-${e._id.toString().slice(-6).toUpperCase()}`,
      estimateReference: e.estimateReference || `EST-${e._id.toString().slice(-6).toUpperCase()}`,
      title: e.deckDetails?.projectName || `Deck Project (${e.estimateReference || 'Estimation'})`,
      projectName: e.deckDetails?.projectName || `Deck Project (${e.estimateReference || 'Estimation'})`,
      customerName,
      contractorName,
      userRole: isContractor ? 'contractor' : 'customer',
      userEmail: userDoc?.email || e.customerSnapshot?.email || '',
      userPhone: userDoc?.phone || e.customerSnapshot?.phone || '',
      deckSize: `${e.deckDetails?.areaSqFt || e.deckDetails?.area || 400} sq ft`,
      areaSqFt: e.deckDetails?.areaSqFt || e.deckDetails?.area || 400,
      totalAmount: e.totalAmount || 0,
      status: stage,
      stage,
      progress: stage === 'completed' ? 100 : stage === 'in_progress' ? 65 : stage === 'requested' ? 30 : 10,
      woodSpecies: e.deckDetails?.woodSpecies || e.deckDetails?.surfaceMaterial || 'Redwood / Pine',
      location: e.deckDetails?.city ? `${e.deckDetails.city}, ${e.deckDetails.state || 'NJ'}` : 'New Jersey, USA',
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      deckSpecs: {
        dimensions: e.deckDetails?.dimensions || `${Math.round(Math.sqrt(e.deckDetails?.areaSqFt || 400))} x ${Math.round(Math.sqrt(e.deckDetails?.areaSqFt || 400))}`,
        area: e.deckDetails?.areaSqFt || 400,
        woodSpecies: e.deckDetails?.woodSpecies || 'Pressure Treated Pine',
      },
      photos: [], // excluded from list for performance — loaded on detail view
      propertyAddress: e.deckId?.propertyAddress || e.deckDetails?.propertyAddress || null,
      structureDetails: e.deckId?.structureDetails || e.deckDetails?.structureDetails || null,
      surfaceDetails: e.deckId?.surfaceDetails || e.deckDetails?.surfaceDetails || null,
      visibleConditions: e.deckId?.visibleConditions || e.conditionFlags || [],
      services: e.services || e.pricingSnapshot?.services || [],
      notes: e.deckId?.additionalNotes || e.notes || '',
    };
  });

  return {
    data: mapped,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: totalEstimates,
      totalPages: Math.ceil(totalEstimates / Number(limit)) || 1,
    },
    counts: {
      total: statusFacetResult[0]?.total?.[0]?.count || 0,
      created: statusFacetResult[0]?.created?.[0]?.count || 0,
      requested: statusFacetResult[0]?.requested?.[0]?.count || 0,
      inProgress: statusFacetResult[0]?.inProgress?.[0]?.count || 0,
      completed: statusFacetResult[0]?.completed?.[0]?.count || 0,
      totalValue: statusFacetResult[0]?.totalValue?.[0]?.total || 0,
    },
  };
}

async function updateProjectProgress(adminUser, projectId, { stage, status, progress, note = '', notes = '' }) {
  const rawId = typeof projectId === 'object' && projectId !== null
    ? (projectId._id || projectId.id || projectId.estimateId || '')
    : projectId;
  const idStr = String(rawId || '').trim();
  if (!idStr || idStr === '[object Object]') {
    throw new BadRequestError('Invalid project or lead identifier.');
  }

  const isObjId = mongoose.Types.ObjectId.isValid(idStr);
  const actualNote = note || notes || '';
  const targetStage = (stage || status || 'created').toLowerCase().replace(/\s+/g, '_');

  let mappedEstimateStatus = 'CREATED';
  let mappedProjectStatus = 'pending';
  let mappedProgress = Number.isFinite(Number(progress)) ? Number(progress) : 10;
  let mappedLeadStatus = LEAD_STATUS.NEW;

  if (targetStage === 'requested') {
    mappedEstimateStatus = 'REQUESTED';
    mappedProjectStatus = 'pending';
    mappedProgress = 30;
    mappedLeadStatus = LEAD_STATUS.UNDER_REVIEW;
  } else if (targetStage === 'in_progress') {
    mappedEstimateStatus = 'IN_PROGRESS';
    mappedProjectStatus = 'in_progress';
    mappedProgress = 65;
    mappedLeadStatus = LEAD_STATUS.QUOTE_IN_PROGRESS;
  } else if (targetStage === 'completed') {
    mappedEstimateStatus = 'COMPLETED';
    mappedProjectStatus = 'completed';
    mappedProgress = 100;
    mappedLeadStatus = LEAD_STATUS.CONVERTED;
  }

  const adminUserId = adminUser?._id || adminUser?.id || null;

  // Resolve Estimate, Project, or Lead regardless of which entity ID the UI passed
  let matchedLead = isObjId
    ? await Lead.findOne({ $or: [{ _id: idStr }, { estimateId: idStr }] })
    : await Lead.findOne({ leadNumber: idStr });

  let matchedProject = await Project.findOne(
    isObjId
      ? { $or: [{ _id: idStr }, { estimateId: idStr }] }
      : { projectId: idStr }
  );

  const resolvedEstimateId =
    (isObjId ? idStr : null) ||
    matchedLead?.estimateId?.toString() ||
    matchedLead?.estimateSnapshot?.estimateId?.toString() ||
    matchedProject?.estimateId?.toString() ||
    null;

  let estimate = null;
  if (resolvedEstimateId && mongoose.Types.ObjectId.isValid(resolvedEstimateId)) {
    estimate = await Estimate.findByIdAndUpdate(
      resolvedEstimateId,
      {
        $set: {
          estimateStatus: mappedEstimateStatus,
          'customerFacingStatus.status': mappedEstimateStatus,
          'customerFacingStatus.note': actualNote || `Admin updated stage to ${targetStage.replace(/_/g, ' ').toUpperCase()}`,
          'customerFacingStatus.updatedAt': new Date(),
        },
      },
      { new: true }
    );
  }

  // Fallback if `idStr` was actually a Project._id and estimate was resolved from Project
  if (!estimate && matchedProject?.estimateId) {
    estimate = await Estimate.findByIdAndUpdate(
      matchedProject.estimateId,
      {
        $set: {
          estimateStatus: mappedEstimateStatus,
          'customerFacingStatus.status': mappedEstimateStatus,
          'customerFacingStatus.note': actualNote || `Admin updated stage to ${targetStage.replace(/_/g, ' ').toUpperCase()}`,
          'customerFacingStatus.updatedAt': new Date(),
        },
      },
      { new: true }
    );
  }

  const projectFilter = estimate
    ? { $or: [{ estimateId: estimate._id }, ...(matchedProject ? [{ _id: matchedProject._id }] : [])] }
    : isObjId
    ? { $or: [{ _id: idStr }, { estimateId: idStr }] }
    : { projectId: idStr };

  const project = await Project.findOneAndUpdate(
    projectFilter,
    {
      $set: {
        status: mappedProjectStatus,
        progress: mappedProgress,
        notes: actualNote || `Admin updated stage to ${targetStage}`,
        ...(adminUserId ? { lastUpdatedBy: adminUserId } : {}),
      },
      $push: {
        progressHistory: {
          previousProgress: matchedProject?.progress || 0,
          newProgress: mappedProgress,
          previousStatus: matchedProject?.status || 'pending',
          newStatus: targetStage,
          notes: actualNote || `Admin updated stage to ${targetStage}`,
          ...(adminUserId ? { updatedBy: adminUserId } : {}),
        },
      },
    },
    { new: true }
  );

  // Sync Lead status if linked
  const leadUpdateFilters = [];
  if (matchedLead?._id) leadUpdateFilters.push({ _id: matchedLead._id });
  if (estimate?._id) leadUpdateFilters.push({ estimateId: estimate._id });
  if (leadUpdateFilters.length > 0) {
    matchedLead = await Lead.findOneAndUpdate(
      leadUpdateFilters.length > 1 ? { $or: leadUpdateFilters } : leadUpdateFilters[0],
      {
        $set: {
          status: mappedLeadStatus,
          lastActivityAt: new Date(),
          ...(actualNote ? { adminNotes: actualNote } : {}),
        },
      },
      { new: true }
    );
  }

  if (!estimate && !project && !matchedLead) {
    throw new NotFoundError('No matching estimate, project, or lead record found.');
  }

  // Notify customer/contractor of live stage transition
  try {
    const targetRecipientId =
      estimate?.ownerId ||
      estimate?.createdBy ||
      project?.customerId ||
      matchedLead?.customerId ||
      matchedLead?.contractorId;
    if (targetRecipientId) {
      const stageLabel = targetStage.replace(/_/g, ' ').toUpperCase();
      const projTitle = estimate?.deckDetails?.projectName || project?.projectName || matchedLead?.deckSnapshot?.projectName || 'Your Deck Project';
      await Notification.create({
        recipientType: 'specific',
        userId: targetRecipientId,
        targetRole: estimate?.estimateType === 'CONTRACTOR' ? 'contractor' : 'customer',
        title: `Project Update: ${stageLabel}`,
        message: `"${projTitle}" status is now ${stageLabel}.${actualNote ? ` Note: ${actualNote}` : ''}`,
        category: 'GENERAL',
        notificationType: 'PROJECT_STATUS',
        sentBy: adminUserId,
        sentByName: adminUser?.fullName || 'Deck Restoration Plus Admin',
      });
    }
  } catch (notifErr) {
    console.warn('[Project Progress Notification Warning]:', notifErr.message);
  }

  // Log to AuditLog
  try {
    if (adminUserId) {
      await AuditLog.create({
        action: 'UPDATE_PROJECT_STAGE',
        entityType: 'PROJECT',
        entityId: (estimate?._id || project?._id || matchedLead?._id || idStr).toString(),
        performedBy: adminUserId,
        metadata: {
          newStage: targetStage,
          estimateStatus: mappedEstimateStatus,
          leadStatus: mappedLeadStatus,
          note: actualNote,
        },
      });
    }
  } catch (auditErr) {
    console.warn('[AuditLog] Warning recording project stage change:', auditErr.message);
  }

  invalidateAdminDashboardCache();

  return {
    success: true,
    message: `Project stage successfully updated to ${targetStage.replace(/_/g, ' ').toUpperCase()}.`,
    stage: targetStage,
    estimateStatus: mappedEstimateStatus,
    leadStatus: mappedLeadStatus,
    estimateId: estimate?._id?.toString() || null,
  };
}

async function exportProjectsData(format = 'csv', filters = {}) {
  const result = await listProjects({ page: 1, limit: 1000, ...filters });
  const headers = [
    'Project ID',
    'Estimate Ref',
    'Project Title',
    'User Role',
    'Customer / Initiator Name',
    'User Email',
    'User Phone',
    'Contractor Name',
    'Deck Size',
    'Estimated Total ($)',
    'Life Cycle Stage',
    'Location',
    'Created Date & Time',
  ];
  const rows = result.data.map((p) => [
    p.projectId || 'N/A',
    p.estimateReference || 'N/A',
    p.title || p.projectName || 'Deck Project',
    (p.userRole || 'customer').toUpperCase(),
    p.customerName || 'N/A',
    p.userEmail || 'N/A',
    p.userPhone || 'N/A',
    p.contractorName || 'Unassigned',
    p.deckSize || '400 sq ft',
    p.totalAmount || 0,
    (p.stage || p.status || 'created').replace(/_/g, ' ').toUpperCase(),
    p.location || 'New Jersey, USA',
    p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A',
  ]);

  const escape = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  return {
    data: csv,
    contentType: format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv',
    filename: `projects-export-${Date.now()}.${format === 'excel' ? 'xls' : 'csv'}`,
  };
}

// ====================================================================
// ====================================================================
// 5. LEAD MANAGEMENT (Hot Priority <= 30 Days & Filters)
// ====================================================================

async function listLeads({
  tab = 'all',
  page = 1,
  limit = 10,
  search = '',
  dateRange = 'all',
  lastDate,
  startDate,
  endDate,
  status = 'all',
  source = 'all',
  sort = 'newest',
}) {
  const andClauses = [];
  const query = {};
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
  const normalizedTab = (tab || 'all').toLowerCase();

  // Tab Filtering (Hot Priority is strictly within last 7 days or priority: HOT)
  if (normalizedTab === 'hot' || normalizedTab === 'hot_priority') {
    andClauses.push({
      $or: [
        { latestContactDate: { $gte: sevenDaysAgo } },
        { createdAt: { $gte: sevenDaysAgo } },
        { priority: 'HOT' },
      ],
    });
  } else if (normalizedTab === 'customer' || normalizedTab === 'customer_leads') {
    query.userType = { $in: ['Customer', 'customer'] };
  } else if (normalizedTab === 'contractor' || normalizedTab === 'contractor_leads') {
    query.userType = { $in: ['Contractor', 'contractor'] };
  }

  // Status Filter
  if (status && status !== 'all') {
    const stLower = status.toLowerCase();
    if (stLower === 'in_progress') {
      query.status = { $in: ['in_progress', 'quote_in_progress', 'accepted'] };
    } else {
      query.status = stLower;
    }
  }

  // Source Filter
  if (source && source !== 'all') {
    query.contactSource = new RegExp(source.replace(/[_-]/g, ' '), 'i');
  }

  // Last Date Cutoff Filter (Used especially in All Leads to view older customers)
  if (lastDate) {
    const lDate = new Date(lastDate);
    lDate.setHours(23, 59, 59, 999);
    andClauses.push({
      $or: [
        { latestContactDate: { $lte: lDate } },
        { createdAt: { $lte: lDate } },
      ],
    });
  }

  // Date Range Filter
  if (dateRange && dateRange !== 'all') {
    const now = new Date();
    let past = new Date();
    if (dateRange === 'today') {
      past.setHours(0, 0, 0, 0);
      andClauses.push({ $or: [{ latestContactDate: { $gte: past } }, { createdAt: { $gte: past } }] });
    } else if (dateRange === 'yesterday') {
      const startYesterday = new Date();
      startYesterday.setDate(startYesterday.getDate() - 1);
      startYesterday.setHours(0, 0, 0, 0);
      const endYesterday = new Date();
      endYesterday.setDate(endYesterday.getDate() - 1);
      endYesterday.setHours(23, 59, 59, 999);
      andClauses.push({
        $or: [
          { latestContactDate: { $gte: startYesterday, $lte: endYesterday } },
          { createdAt: { $gte: startYesterday, $lte: endYesterday } },
        ],
      });
    } else if (dateRange === '7d') {
      past.setDate(now.getDate() - 7);
      andClauses.push({ $or: [{ latestContactDate: { $gte: past } }, { createdAt: { $gte: past } }] });
    } else if (dateRange === '15d') {
      past.setDate(now.getDate() - 15);
      andClauses.push({ $or: [{ latestContactDate: { $gte: past } }, { createdAt: { $gte: past } }] });
    } else if (dateRange === '30d') {
      past.setDate(now.getDate() - 30);
      andClauses.push({ $or: [{ latestContactDate: { $gte: past } }, { createdAt: { $gte: past } }] });
    } else if (dateRange === '60d') {
      past.setDate(now.getDate() - 60);
      andClauses.push({ $or: [{ latestContactDate: { $gte: past } }, { createdAt: { $gte: past } }] });
    } else if (dateRange === 'this_month') {
      past = new Date(now.getFullYear(), now.getMonth(), 1);
      andClauses.push({ $or: [{ latestContactDate: { $gte: past } }, { createdAt: { $gte: past } }] });
    } else if (dateRange === 'last_month') {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      andClauses.push({
        $or: [
          { latestContactDate: { $gte: firstDayLastMonth, $lte: lastDayLastMonth } },
          { createdAt: { $gte: firstDayLastMonth, $lte: lastDayLastMonth } },
        ],
      });
    } else if (dateRange === 'custom' && startDate) {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      andClauses.push({
        $or: [
          { latestContactDate: { $gte: start, $lte: end } },
          { createdAt: { $gte: start, $lte: end } },
        ],
      });
    }
  }

  // Search Filter
  if (search && search.trim()) {
    const reg = new RegExp(search.trim(), 'i');
    andClauses.push({
      $or: [
        { leadNumber: reg },
        { 'customerSnapshot.name': reg },
        { 'customerSnapshot.email': reg },
        { 'customerSnapshot.phone': reg },
        { 'contractorSnapshot.name': reg },
        { 'contractorSnapshot.email': reg },
        { 'contractorSnapshot.phone': reg },
        { 'contractorSnapshot.businessName': reg },
        { 'deckSnapshot.city': reg },
        { 'deckSnapshot.state': reg },
        { 'deckSnapshot.projectName': reg },
      ],
    });
  }

  if (andClauses.length > 0) {
    query.$and = andClauses;
  }

  // Sort Options
  let sortOption = { latestContactDate: -1, createdAt: -1 };
  if (sort === 'oldest') {
    sortOption = { latestContactDate: 1, createdAt: 1 };
  } else if (sort === 'most_contacted') {
    sortOption = { contactCount: -1, latestContactDate: -1 };
  } else if (sort === 'name_asc') {
    sortOption = { 'customerSnapshot.name': 1, 'contractorSnapshot.name': 1 };
  } else if (sort === 'name_desc') {
    sortOption = { 'customerSnapshot.name': -1, 'contractorSnapshot.name': -1 };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [leads, total, counts] = await Promise.all([
    Lead.find(query)
      .select('-deckSnapshot.photos -__v')
      .populate('customerId', 'fullName email phone accountStatus createdAt emailVerifiedAt phoneVerifiedAt')
      .populate('contractorId', 'fullName email phone accountStatus createdAt emailVerifiedAt phoneVerifiedAt')
      .populate('contractorProfileId', 'businessName licenseNumber licenseJurisdiction yearsOfExperience verificationStatus approvedAt')
      .populate('deckId', 'projectName deckShape dimensions surfaceDetails structureDetails propertyAddress visibleConditions')
      .populate(
        'estimateId',
        'estimateNumber estimateReference totalCost totalAmount estimateStatus ' +
        'deckDetails.projectName deckDetails.areaSqFt deckDetails.deckLength deckDetails.deckWidth deckDetails.surfaceMaterial deckDetails.components deckDetails.services ' +
        'pricingSnapshot.spec pricingSnapshot.calculatedTotal pricingSnapshot.total'
      )
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Lead.countDocuments(query),
    Promise.all([
      Lead.countDocuments({
        $or: [
          { latestContactDate: { $gte: sevenDaysAgo } },
          { createdAt: { $gte: sevenDaysAgo } },
          { priority: 'HOT' },
        ],
      }),
      Lead.countDocuments({ userType: { $in: ['Customer', 'customer'] } }),
      Lead.countDocuments({ userType: { $in: ['Contractor', 'contractor'] } }),
      Lead.countDocuments(),
    ]),
  ]);

  const mapped = leads.map((l) => {
    const isCust = (l.userType || '').toLowerCase() === 'customer';
    const userObj = isCust ? l.customerId : l.contractorId;
    const cpObj = l.contractorProfileId;

    const contactName = userObj?.fullName ||
      (isCust ? l.customerSnapshot?.name : (l.contractorSnapshot?.name || cpObj?.businessName)) ||
      (isCust ? 'Customer' : 'Contractor');

    const contactEmail = userObj?.email ||
      (isCust ? l.customerSnapshot?.email : l.contractorSnapshot?.email) ||
      'N/A';

    const contactPhone = userObj?.phone ||
      (isCust ? l.customerSnapshot?.phone : l.contractorSnapshot?.phone) ||
      '—';

    const contactDate = l.latestContactDate || l.createdAt || new Date();
    const diffDays = Math.floor((Date.now() - new Date(contactDate).getTime()) / (1000 * 60 * 60 * 24));
    const isHot = diffDays <= 7;
    const priorityLabel = isHot ? 'HOT' : 'REQUESTED';

    const deckAddr = l.deckId?.propertyAddress;
    const locationStr = (l.deckSnapshot?.city && l.deckSnapshot.city.trim())
      ? `${l.deckSnapshot.city.trim()}${l.deckSnapshot.state ? `, ${l.deckSnapshot.state.trim()}` : ', NJ'}`
      : (deckAddr?.city && deckAddr.city.trim()
        ? `${deckAddr.city.trim()}${deckAddr.state ? `, ${deckAddr.state.trim()}` : ', NJ'}`
        : (userObj?.address?.city && userObj.address.city.trim()
          ? `${userObj.address.city.trim()}${userObj.address.state ? `, ${userObj.address.state.trim()}` : ', NJ'}`
          : (cpObj?.businessAddress?.city && cpObj.businessAddress.city.trim()
            ? `${cpObj.businessAddress.city.trim()}${cpObj.businessAddress.state ? `, ${cpObj.businessAddress.state.trim()}` : ', NJ'}`
            : 'Shamong, NJ')));

    const est = l.estimateId;
    const requestedMessage = l.enquiry?.message || l.enquiry?.subject || (l.contactHistory?.[0]?.notes) || 'Project Service Request';
    const isEstimationService = !!(l.estimateId || l.estimateSnapshot?.estimateId);
    const estimatedValue = est?.totalAmount || est?.pricingSnapshot?.calculatedTotal || l.estimateSnapshot?.totalAmount || est?.totalCost || 0;
    const woodSpecies = est?.deckDetails?.surfaceMaterial || est?.pricingSnapshot?.spec?.woodSpecies || l.deckSnapshot?.surfaceMaterial || 'Pressure Treated Pine';
    const deckArea = est?.deckDetails?.areaSqFt || est?.pricingSnapshot?.spec?.floorArea || l.deckSnapshot?.area || l.deckId?.dimensions?.area || 0;
    const deckLen = est?.deckDetails?.deckLength || l.deckId?.dimensions?.length;
    const deckWid = est?.deckDetails?.deckWidth || l.deckId?.dimensions?.width;
    const deckDimensions = (deckLen && deckWid) ? `${deckLen} ft × ${deckWid} ft` : (deckArea > 0 ? `${deckArea} sq ft` : '—');

    const spec = est?.pricingSnapshot?.spec || {};
    const sectionInputs = [];
    if (est?.deckDetails?.components?.length) sectionInputs.push(`Components: ${est.deckDetails.components.join(', ')}`);
    if (est?.deckDetails?.services?.length) sectionInputs.push(`Services: ${est.deckDetails.services.join(', ')}`);
    else if (spec.services?.length) sectionInputs.push(`Services: ${spec.services.join(', ')}`);
    const selectedInputsSummary = sectionInputs.length > 0 ? sectionInputs.join(' | ') : (l.enquiry?.subject || 'Standard Deck Restoration');

    return {
      _id: l._id.toString(),
      id: l._id.toString(),
      leadId: l.leadNumber,
      leadNumber: l.leadNumber,
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      userType: isCust ? 'Customer' : 'Contractor',
      contactSource: isEstimationService ? 'Estimation Service' : (l.contactSource || (isCust ? 'Contact Us' : 'Reach Out')),
      contactCount: l.contactCount || 1,
      priority: priorityLabel,
      isHot,
      daysSinceContact: diffDays,
      firstContactDate: l.firstContactDate || l.createdAt,
      latestContactDate: contactDate,
      createdAt: l.createdAt,
      status: l.status || 'new',
      estimateStatus: est?.estimateStatus || (l.status === 'quote_in_progress' ? 'IN_PROGRESS' : l.status === 'converted' ? 'COMPLETED' : undefined),
      estimateIdStr: est?._id?.toString() || l.estimateSnapshot?.estimateId?.toString() || null,
      location: locationStr,
      city: l.deckSnapshot?.city || deckAddr?.city || '',
      state: l.deckSnapshot?.state || deckAddr?.state || '',
      businessName: cpObj?.businessName || l.contractorSnapshot?.businessName || '',
      licenseNumber: cpObj?.licenseNumber || l.contractorSnapshot?.licenseNumber || '',
      licenseJurisdiction: cpObj?.licenseJurisdiction || '',
      enquiry: l.enquiry || {},
      requestedMessage,
      isEstimationService,
      estimatedValue,
      deckDimensions,
      woodSpecies,
      deckArea,
      selectedInputsSummary,
      contactHistory: l.contactHistory || [],
      userId: userObj?._id?.toString() || null,
      customerId: l.customerId?._id?.toString() || null,
      contractorId: l.contractorId?._id?.toString() || null,
      deckSnapshot: l.deckSnapshot,
      estimateSnapshot: l.estimateSnapshot,
      deckId: l.deckId?._id?.toString() || null,
      estimateId: est?._id?.toString() || null,
      photoCount: l.deckSnapshot?.photoCount || 0,
      propertyAddress: l.deckId?.propertyAddress || l.deckSnapshot?.propertyAddress || null,
      structureDetails: l.deckId?.structureDetails || l.deckSnapshot?.structureDetails || null,
      surfaceDetails: l.deckId?.surfaceDetails || l.deckSnapshot?.surfaceDetails || null,
      visibleConditions: l.deckId?.visibleConditions || l.deckSnapshot?.visibleConditions || [],
      services: est?.deckDetails?.services || spec.services || l.deckSnapshot?.services || [],
    };
  });

  return {
    data: mapped,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
    counts: {
      hotPriority: counts[0],
      customerLeads: counts[1],
      contractorLeads: counts[2],
      allLeads: counts[3],
    },
  };
}

async function getLeadDetails(leadId) {
  const query = mongoose.Types.ObjectId.isValid(leadId)
    ? { _id: leadId }
    : { leadNumber: leadId };

  const lead = await Lead.findOne(query)
    .populate('customerId', 'fullName email phone role accountStatus createdAt emailVerifiedAt phoneVerifiedAt')
    .populate('contractorId', 'fullName email phone role accountStatus createdAt emailVerifiedAt phoneVerifiedAt')
    .populate('contractorProfileId', 'businessName licenseNumber licenseJurisdiction yearsOfExperience verificationStatus approvedAt businessAddress')
    .populate('deckId', 'projectName deckShape dimensions surfaceDetails structureDetails propertyAddress visibleConditions')
    .populate('estimateId', 'estimateNumber estimateReference totalCost totalAmount estimateStatus deckDetails pricingSnapshot')
    .lean();

  if (!lead) {
    const error = new Error('Lead record not found.');
    error.statusCode = 404;
    throw error;
  }

  const isCust = (lead.userType || '').toLowerCase() === 'customer';
  const userObj = isCust ? lead.customerId : lead.contractorId;
  const userId = userObj?._id || (isCust ? lead.customerId : lead.contractorId);

  let customerEstimates = [];
  let customerDecks = [];
  let contractorProfile = null;
  let contractorAssignedProjects = [];

  const Deck = mongoose.model('Deck');
  const Estimate = mongoose.model('Estimate');
  const ContractorProfile = mongoose.model('ContractorProfile');

  if (isCust && userId) {
    [customerDecks, customerEstimates] = await Promise.all([
      Deck.find({ ownerId: userId }).select('projectName name area dimensions surfaceMaterial createdAt').sort({ createdAt: -1 }).limit(5).lean(),
      Estimate.find({ ownerId: userId })
        .select('estimateNumber estimateReference estimateName estimateStatus totalAmount totalCost deckDetails.projectName deckId createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);
  } else if (!isCust && userId) {
    [contractorProfile, contractorAssignedProjects] = await Promise.all([
      ContractorProfile.findOne({ userId }).select('businessName licenseNumber licenseJurisdiction businessPhone businessEmail verificationStatus businessAddress').lean(),
      Lead.find({ assignedContractorId: userId }).select('leadNumber status createdAt').sort({ createdAt: -1 }).limit(5).lean(),
    ]);
  }

  const contactDate = lead.latestContactDate || lead.createdAt || new Date();
  const diffDays = Math.floor((Date.now() - new Date(contactDate).getTime()) / (1000 * 60 * 60 * 24));
  const isHot = diffDays <= 7;

  return {
    lead: {
      ...lead,
      _id: lead._id.toString(),
      id: lead._id.toString(),
      leadId: lead.leadNumber,
      estimateStatus: lead.estimateId?.estimateStatus || undefined,
      estimateIdStr: lead.estimateId?._id?.toString() || lead.estimateSnapshot?.estimateId?.toString() || null,
      isHot: diffDays <= 30,
      daysSinceContact: diffDays,
      name: userObj?.fullName || (isCust ? lead.customerSnapshot?.name : lead.contractorSnapshot?.name) || 'User',
      email: userObj?.email || (isCust ? lead.customerSnapshot?.email : lead.contractorSnapshot?.email) || 'N/A',
      phone: userObj?.phone || (isCust ? lead.customerSnapshot?.phone : lead.contractorSnapshot?.phone) || '—',
      userType: isCust ? 'Customer' : 'Contractor',
    },
    user: userObj ? {
      _id: userObj._id.toString(),
      fullName: userObj.fullName,
      email: userObj.email,
      phone: userObj.phone,
      role: userObj.role,
      accountStatus: userObj.accountStatus || 'active',
      createdAt: userObj.createdAt,
      emailVerifiedAt: userObj.emailVerifiedAt,
      phoneVerifiedAt: userObj.phoneVerifiedAt,
    } : null,
    customerData: isCust ? {
      decksCount: customerDecks.length,
      decks: customerDecks.map((d) => ({
        id: d._id.toString(),
        name: d.projectName || d.name || 'Deck Project',
        area: d.dimensions?.area || d.area || 0,
        dimensions: d.dimensions,
        surfaceMaterial: d.surfaceDetails?.woodSpecies || d.surfaceDetails?.material || d.surfaceMaterial,
        conditionLevel: d.visibleConditions?.[0] || d.conditionLevel,
        createdAt: d.createdAt,
      })),
      estimatesCount: customerEstimates.length,
      activeEstimatesCount: customerEstimates.filter((e) => !['CANCELLED', 'EXPIRED', 'cancelled', 'expired'].includes(e.estimateStatus || e.status)).length,
      estimates: customerEstimates.map((e) => ({
        id: e._id.toString(),
        estimateReference: e.estimateNumber || e.estimateReference || `EST-${e._id.toString().slice(-4).toUpperCase()}`,
        deckName: e.deckDetails?.projectName || e.deckId?.projectName || e.deckId?.name || e.estimateName || 'Deck',
        totalCost: e.totalAmount ?? e.totalCost ?? e.pricing?.totalCost ?? 0,
        status: e.estimateStatus || e.status || 'CREATED',
        createdAt: e.createdAt,
      })),
    } : null,
    contractorData: !isCust ? {
      profile: contractorProfile ? {
        businessName: contractorProfile.businessName,
        licenseNumber: contractorProfile.licenseNumber,
        licenseJurisdiction: contractorProfile.licenseJurisdiction,
        businessPhone: contractorProfile.businessPhone,
        businessEmail: contractorProfile.businessEmail,
        yearsOfExperience: contractorProfile.yearsOfExperience,
        verificationStatus: contractorProfile.verificationStatus,
        businessAddress: contractorProfile.businessAddress,
        approvedAt: contractorProfile.approvedAt,
      } : null,
      assignedLeadsCount: contractorAssignedProjects.length,
      assignedLeads: contractorAssignedProjects.map((p) => ({
        leadNumber: p.leadNumber,
        status: p.status,
        createdAt: p.createdAt,
      })),
    } : null,
    estimateDetails: lead.estimateId || null,
    deckDetails: lead.deckId || lead.deckSnapshot || null,
    photos: lead.deckId?.photos || lead.deckSnapshot?.photos || [],
    propertyAddress: lead.deckId?.propertyAddress || lead.deckSnapshot?.propertyAddress || null,
    structureDetails: lead.deckId?.structureDetails || lead.deckSnapshot?.structureDetails || null,
    surfaceDetails: lead.deckId?.surfaceDetails || lead.deckSnapshot?.surfaceDetails || null,
    visibleConditions: lead.deckId?.visibleConditions || lead.deckSnapshot?.visibleConditions || [],
  };
}

async function exportLeadsData(format = 'csv', tab = 'all', filters = {}) {
  const result = await listLeads({ tab, page: 1, limit: 1000, ...filters });
  const headers = [
    'Lead ID',
    'Contact Person',
    'Type & Source',
    'User Role',
    'Email',
    'Phone',
    'Requested Message',
    'Estimated Value ($)',
    'Dimensions / Area',
    'Wood Species',
    'Selected Inputs Section-wise',
    'Priority',
    'Date & Time',
    'Location',
    'Status',
  ];
  const rows = result.data.map((l) => [
    l.leadNumber || l.leadId || 'N/A',
    l.name || 'N/A',
    l.contactSource || (l.isEstimationService ? 'Estimation Service' : 'Direct Inquiry'),
    l.userType || 'Customer',
    l.email || 'N/A',
    l.phone || 'N/A',
    l.requestedMessage || 'N/A',
    l.estimatedValue ? `$${Number(l.estimatedValue).toLocaleString()}` : '$0',
    l.deckDimensions || (l.deckArea ? `${l.deckArea} sq ft` : 'N/A'),
    l.woodSpecies || 'N/A',
    l.selectedInputsSummary || 'N/A',
    (l.priority || 'standard').toUpperCase(),
    l.latestContactDate ? new Date(l.latestContactDate).toLocaleString() : 'N/A',
    l.location || 'N/A',
    (l.status || 'new').toUpperCase(),
  ]);

  const escape = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  return {
    data: csv,
    contentType: format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv',
    filename: `leads-${tab}-export-${Date.now()}.${format === 'excel' ? 'xls' : 'csv'}`,
  };
}

async function exportSingleLeadDossier(leadId, format = 'csv') {
  const details = await getLeadDetails(leadId);
  const l = details.lead;
  const u = details.user;
  const cd = details.customerData;
  const kd = details.contractorData;

  const escape = (v) => `"${String(v || '').replace(/"/g, '""')}"`;

  const sections = [];

  // Section 1: Overview
  sections.push(['--- LEAD OVERVIEW & REGISTRATION ---']);
  sections.push(['Field', 'Value']);
  sections.push(['Lead Number', l.leadNumber]);
  sections.push(['Contact Name', l.name]);
  sections.push(['Email', l.email]);
  sections.push(['Phone', l.phone]);
  sections.push(['User Type', l.userType]);
  sections.push(['Account Status', u?.accountStatus || 'active']);
  sections.push(['Account Registered', u?.createdAt ? new Date(u.createdAt).toISOString() : 'N/A']);
  sections.push(['Contact Source', l.contactSource]);
  sections.push(['Contact Count', l.contactCount]);
  sections.push(['First Contact Date', l.firstContactDate ? new Date(l.firstContactDate).toISOString() : 'N/A']);
  sections.push(['Latest Contact Date', l.latestContactDate ? new Date(l.latestContactDate).toISOString() : 'N/A']);
  sections.push(['Status', l.status]);
  sections.push(['Enquiry Subject', l.enquiry?.subject || 'N/A']);
  sections.push(['Enquiry Message', l.enquiry?.message || 'N/A']);

  if (cd) {
    sections.push([]);
    sections.push(['--- CUSTOMER ESTIMATES & DECK PROJECTS ---']);
    sections.push(['Total Decks', cd.decksCount]);
    sections.push(['Total Estimates', cd.estimatesCount]);
    sections.push(['Active Estimates', cd.activeEstimatesCount]);
    sections.push([]);
    sections.push(['Estimate Ref', 'Deck Name', 'Total Amount ($)', 'Status', 'Date']);
    cd.estimates.forEach((e) => {
      sections.push([e.estimateReference, e.deckName, e.totalCost, e.status, new Date(e.createdAt).toISOString().split('T')[0]]);
    });
  }

  if (kd) {
    sections.push([]);
    sections.push(['--- CONTRACTOR CREDENTIALS & LICENSING ---']);
    const prof = kd.profile;
    sections.push(['Business Name', prof?.businessName || 'N/A']);
    sections.push(['License Number', prof?.licenseNumber || 'N/A']);
    sections.push(['License Jurisdiction', prof?.licenseJurisdiction || 'N/A']);
    sections.push(['Years Experience', prof?.yearsOfExperience || 0]);
    sections.push(['Verification Status', prof?.verificationStatus || 'pending']);
    sections.push(['Approved At', prof?.approvedAt ? new Date(prof.approvedAt).toISOString() : 'N/A']);
  }

  const csv = sections.map((row) => row.map(escape).join(',')).join('\n');

  return {
    data: csv,
    contentType: format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv',
    filename: `lead-dossier-${l.leadNumber}-${Date.now()}.${format === 'excel' ? 'xls' : 'csv'}`,
  };
}

// 6. ESTIMATOR CONFIGURATION (Input Fields & Dependencies)
// ====================================================================

async function listEstimatorFields() {
  return EstimatorField.find().sort({ order: 1, createdAt: 1 });
}

async function saveEstimatorField(adminUser, fieldData, fieldId = null) {
  const normalized = {
    ...fieldData,
    fieldName: fieldData.fieldName || fieldData.fieldKey,
    fieldKey: fieldData.fieldKey || fieldData.fieldName,
    displayLabel: fieldData.displayLabel || fieldData.label,
    label: fieldData.label || fieldData.displayLabel,
    inputType: fieldData.inputType || fieldData.fieldType || 'Number',
    fieldType: fieldData.fieldType || fieldData.inputType || 'number',
    status: fieldData.active !== false ? 'active' : 'inactive',
    active: fieldData.active !== false,
  };
  let field;
  if (fieldId) {
    field = await EstimatorField.findByIdAndUpdate(fieldId, normalized, { new: true });
    await logAdminAction(adminUser, 'ESTIMATOR_FIELD_UPDATE', 'EstimatorField', field._id, null, normalized);
  } else {
    field = await EstimatorField.create(normalized);
    await logAdminAction(adminUser, 'ESTIMATOR_FIELD_CREATE', 'EstimatorField', field._id, null, normalized);
  }
  return field;
}

async function deleteEstimatorField(adminUser, fieldId) {
  const field = await EstimatorField.findByIdAndDelete(fieldId);
  if (field) {
    await logAdminAction(adminUser, 'ESTIMATOR_FIELD_DELETE', 'EstimatorField', fieldId, field, null);
  }
  return { success: true };
}

async function listEstimatorDependencies() {
  return EstimatorDependency.find().sort({ createdAt: -1 });
}

async function saveEstimatorDependency(adminUser, depData, depId = null) {
  const normalized = {
    ...depData,
    parentField: depData.parentField || depData.sourceField,
    sourceField: depData.sourceField || depData.parentField,
    showField: depData.showField || depData.targetField,
    targetField: depData.targetField || depData.showField,
    value: depData.value || depData.conditionValue,
    conditionValue: depData.conditionValue || depData.value,
    status: depData.active !== false ? 'active' : 'inactive',
    active: depData.active !== false,
  };
  let dep;
  if (depId) {
    dep = await EstimatorDependency.findByIdAndUpdate(depId, normalized, { new: true });
    await logAdminAction(adminUser, 'ESTIMATOR_DEP_UPDATE', 'EstimatorDependency', dep._id, null, normalized);
  } else {
    dep = await EstimatorDependency.create(normalized);
    await logAdminAction(adminUser, 'ESTIMATOR_DEP_CREATE', 'EstimatorDependency', dep._id, null, normalized);
  }
  return dep;
}

async function deleteEstimatorDependency(adminUser, depId) {
  const dep = await EstimatorDependency.findByIdAndDelete(depId);
  if (dep) {
    await logAdminAction(adminUser, 'ESTIMATOR_DEP_DELETE', 'EstimatorDependency', depId, dep, null);
  }
  return { success: true };
}

// ====================================================================
// 7. CATALOG MANAGEMENT (5 Tabs + Image Uploads)
// ====================================================================

async function getCatalogOverview() {
  const [materials, products, substrates, services, coverageRates] = await Promise.all([
    Material.countDocuments({ status: { $ne: 'archived' } }),
    CatalogProduct.countDocuments({ status: { $ne: 'archived' } }),
    CatalogSubstrate.countDocuments({ status: { $ne: 'archived' } }),
    Service.countDocuments({ status: { $ne: 'archived' } }),
    CatalogCoverageRate.countDocuments({ status: { $ne: 'archived' } }),
  ]);

  return {
    totalItems: materials + products + substrates + services + coverageRates,
    materials,
    products,
    finishes: products,
    substrates,
    services,
    coverageRates,
  };
}

async function listCatalogMaterials() {
  const mats = await Material.find({ status: { $ne: 'archived' } }).sort({ createdAt: -1 });
  return mats.map((m) => {
    const obj = m.toJSON();
    return {
      ...obj,
      name: m.materialName || m.productName || 'Deck Coating Material',
      unitPrice: m.pricePerUnit || m.cost?.unitCost || 45.99,
      unit: m.unit || m.cost?.costUnit || 'gallon',
      description: m.description || 'High-performance exterior deck coating formula.',
      imageUrl: m.productImage || '',
      category: m.materialType || 'Stain',
      coveragePerGallon: m.coveragePerUnit || m.coverage?.coverageValue || 250,
      active: m.status === 'active' || m.isActive === true,
    };
  });
}

async function saveCatalogMaterial(adminUser, materialData, materialId = null) {
  let mat;
  let category = await MaterialCategory.findOne();
  if (!category) {
    category = await MaterialCategory.create({
      categoryName: 'General Materials',
      categoryCode: 'GENERAL_MAT',
      createdBy: adminUser.id || adminUser._id,
    });
  }

  const payload = {
    ...materialData,
    materialName: materialData.name || materialData.materialName || 'Deck Coating Material',
    productImage: materialData.imageUrl || materialData.productImage || '',
    pricePerUnit: materialData.unitPrice !== undefined ? materialData.unitPrice : materialData.pricePerUnit || 45.99,
    unit: materialData.unit || 'gallon',
    categoryId: materialData.categoryId || category._id,
    materialType: materialData.category || materialData.materialType || 'coating',
    materialCode: materialData.materialCode || `MAT-${Date.now().toString().slice(-4)}`,
    status: materialData.active !== false ? 'active' : 'inactive',
    isActive: materialData.active !== false,
    createdBy: adminUser.id || adminUser._id,
    updatedBy: adminUser.id || adminUser._id,
  };

  if (materialId) {
    mat = await Material.findByIdAndUpdate(materialId, payload, { new: true });
    await logAdminAction(adminUser, 'CATALOG_MATERIAL_UPDATE', 'Material', mat._id, null, payload);
  } else {
    mat = await Material.create(payload);
    await logAdminAction(adminUser, 'CATALOG_MATERIAL_CREATE', 'Material', mat._id, null, payload);
  }
  return mat;
}

async function listCatalogProducts() {
  const prods = await CatalogProduct.find().sort({ createdAt: -1 });
  return prods.map((p) => {
    const obj = p.toJSON ? p.toJSON() : p;
    return {
      ...obj,
      name: p.productName || 'Decking Board',
      category: p.materialCategory || 'Decking Material',
      description: p.description || 'Premium architectural decking component.',
      imageUrl: p.productImage || p.image || '',
      active: p.status !== 'inactive',
    };
  });
}

async function saveCatalogProduct(adminUser, productData, productId = null) {
  let prod;
  const payload = {
    ...productData,
    productName: productData.name || productData.productName || 'Decking Board',
    productImage: productData.imageUrl || productData.productImage || '',
    materialCategory: productData.category || productData.materialCategory || 'Decking Material',
    status: productData.active !== false ? 'active' : 'inactive',
  };

  if (productId) {
    prod = await CatalogProduct.findByIdAndUpdate(productId, payload, { new: true });
    await logAdminAction(adminUser, 'CATALOG_PRODUCT_UPDATE', 'CatalogProduct', prod._id, null, payload);
  } else {
    prod = await CatalogProduct.create(payload);
    await logAdminAction(adminUser, 'CATALOG_PRODUCT_CREATE', 'CatalogProduct', prod._id, null, payload);
  }
  return prod;
}

async function listCatalogSubstrates() {
  const subs = await CatalogSubstrate.find().sort({ createdAt: -1 });
  return subs.map((s) => {
    const obj = s.toJSON ? s.toJSON() : s;
    return {
      ...obj,
      name: s.substrateName || 'Wood Substrate',
      woodSpecies: s.woodType || s.substrateName,
      description: s.description || 'High-density exterior architectural timber.',
      imageUrl: s.image || '',
      active: s.status !== 'inactive',
    };
  });
}

async function saveCatalogSubstrate(adminUser, substrateData, substrateId = null) {
  let sub;
  const payload = {
    ...substrateData,
    substrateName: substrateData.name || substrateData.substrateName || 'Wood Substrate',
    image: substrateData.imageUrl || substrateData.image || '',
    woodType: substrateData.woodSpecies || substrateData.woodType || 'Natural Timber',
    status: substrateData.active !== false ? 'active' : 'inactive',
  };

  if (substrateId) {
    sub = await CatalogSubstrate.findByIdAndUpdate(substrateId, payload, { new: true });
    await logAdminAction(adminUser, 'CATALOG_SUBSTRATE_UPDATE', 'CatalogSubstrate', sub._id, null, payload);
  } else {
    sub = await CatalogSubstrate.create(payload);
    await logAdminAction(adminUser, 'CATALOG_SUBSTRATE_CREATE', 'CatalogSubstrate', sub._id, null, payload);
  }
  return sub;
}

async function listCatalogServices() {
  const srvs = await Service.find({ status: { $ne: 'archived' } }).sort({ createdAt: -1 });
  return srvs.map((s) => {
    const obj = s.toJSON ? s.toJSON() : s;
    return {
      ...obj,
      name: s.serviceName || 'Restoration Service',
      unitPrice: s.basePrice || 2.5,
      unit: s.unit || 'sq ft',
      description: s.description || 'Professional exterior deck restoration service.',
      active: s.status === 'active',
    };
  });
}

async function saveCatalogService(adminUser, serviceData, serviceId = null) {
  let srv;
  let category = await ServiceCategory.findOne();
  if (!category) {
    category = await ServiceCategory.create({
      categoryName: 'General Services',
      categoryCode: 'GENERAL_SRV',
      createdBy: adminUser.id || adminUser._id,
    });
  }

  const payload = {
    ...serviceData,
    serviceName: serviceData.name || serviceData.serviceName || 'Restoration Service',
    basePrice: serviceData.unitPrice !== undefined ? serviceData.unitPrice : serviceData.basePrice || 2.5,
    unit: serviceData.unit || 'sq ft',
    categoryId: serviceData.categoryId || category._id,
    serviceCode: serviceData.serviceCode || `SRV-${Date.now().toString().slice(-4)}`,
    status: serviceData.active !== false ? 'active' : 'inactive',
    createdBy: adminUser.id || adminUser._id,
    updatedBy: adminUser.id || adminUser._id,
  };

  if (serviceId) {
    srv = await Service.findByIdAndUpdate(serviceId, payload, { new: true });
    await logAdminAction(adminUser, 'CATALOG_SERVICE_UPDATE', 'Service', srv._id, null, payload);
  } else {
    srv = await Service.create(payload);
    await logAdminAction(adminUser, 'CATALOG_SERVICE_CREATE', 'Service', srv._id, null, payload);
  }
  return srv;
}

async function listCatalogCoverageRates() {
  const covs = await CatalogCoverageRate.find().sort({ createdAt: -1 });
  return covs.map((c) => {
    const obj = c.toJSON ? c.toJSON() : c;
    return {
      ...obj,
      name: `${c.materialType || 'Stain & Seal'} Coverage`,
      unitPrice: 0,
      unit: c.unit || 'sq ft/gal',
      coveragePerGallon: `${c.coverageRateMin || 200} - ${c.coverageRateMax || 350}`,
      description: c.notes || `Standard application: ${c.coverageRateMin || 200}-${c.coverageRateMax || 350} sq ft per gallon.`,
      active: c.status !== 'inactive',
    };
  });
}

async function saveCatalogCoverageRate(adminUser, coverageData, coverageId = null) {
  let cov;
  const payload = {
    ...coverageData,
    materialType: coverageData.name || coverageData.materialType || 'Stain & Seal',
    status: coverageData.active !== false ? 'active' : 'inactive',
  };

  if (coverageId) {
    cov = await CatalogCoverageRate.findByIdAndUpdate(coverageId, payload, { new: true });
    await logAdminAction(adminUser, 'CATALOG_COVERAGE_UPDATE', 'CatalogCoverageRate', cov._id, null, payload);
  } else {
    cov = await CatalogCoverageRate.create(payload);
    await logAdminAction(adminUser, 'CATALOG_COVERAGE_CREATE', 'CatalogCoverageRate', cov._id, null, payload);
  }
  return cov;
}

// ====================================================================
// 8. PRICING MANAGEMENT (4 Tabs Connected to Live Config)
// ====================================================================

async function getPricingConfig() {
  let config = await PricingConfiguration.findOne({ isActive: true }).sort({ updatedAt: -1 });
  if (!config) {
    config = await PricingConfiguration.create({
      configurationName: 'Default Platform Pricing',
      isActive: true,
      laborRate: 250,
      minimumJobPrice: 2500,
      basePricePerSqFt: 3.5,
      restorationPricing: DEFAULT_PRICING_CONFIG,
    });
  } else if (!config.restorationPricing) {
    config.restorationPricing = DEFAULT_PRICING_CONFIG;
    config.markModified('restorationPricing');
    await config.save();
  }
  return config;
}

async function updatePricingConfig(adminUser, updates) {
  let config = await PricingConfiguration.findOne({ isActive: true });
  if (!config) {
    config = new PricingConfiguration({ isActive: true, createdBy: adminUser.id || adminUser._id });
  }

  if (updates.calculatorPricing) {
    config.calculatorPricing = {
      ...config.calculatorPricing,
      ...updates.calculatorPricing,
    };
  }
  if (updates.restorationPricing) {
    config.restorationPricing = {
      ...(config.restorationPricing || DEFAULT_PRICING_CONFIG),
      ...updates.restorationPricing,
    };
    config.markModified('restorationPricing');
  }
  if (updates.laborRate !== undefined) config.laborRate = updates.laborRate;
  if (updates.basePricePerSqFt !== undefined) config.basePricePerSqFt = updates.basePricePerSqFt;
  if (updates.minimumJobPrice !== undefined) config.minimumJobPrice = updates.minimumJobPrice;

  config.updatedBy = adminUser.id || adminUser._id;
  await config.save();

  await logAdminAction(adminUser, 'PRICING_CONFIG_UPDATE', 'PricingConfiguration', config._id, null, updates);

  return config;
}

// ====================================================================
// 9. DISCOUNTS MANAGEMENT (Default 10% & Contractor Overrides)
// ====================================================================

async function getDiscountsOverview() {
  const defaultPolicy = await DiscountPolicy.findOne({ code: 'CONTRACTOR_DEFAULT_10' });
  const defaultDiscount = defaultPolicy?.discountValue || 10;

  const contractors = await User.find({ role: ROLES.CONTRACTOR, accountStatus: { $ne: 'disabled' } });
  const contractorIds = contractors.map((c) => c._id);

  const [completedProjects, assignments, auditLogs] = await Promise.all([
    Project.aggregate([
      { $match: { contractorId: { $in: contractorIds }, status: 'completed' } },
      { $group: { _id: '$contractorId', count: { $sum: 1 } } },
    ]),
    DiscountAssignment.find({ contractorId: { $in: contractorIds }, status: 'active' }).populate('discountPolicyId'),
    DiscountAuditLog.find().sort({ createdAt: -1 }).limit(10),
  ]);

  const projectCountMap = {};
  completedProjects.forEach((p) => {
    projectCountMap[p._id.toString()] = p.count;
  });

  const assignmentMap = {};
  assignments.forEach((a) => {
    if (a.discountPolicyId) {
      assignmentMap[a.contractorId.toString()] = a.discountPolicyId.discountValue;
    }
  });

  const contractorList = contractors.map((c) => {
    const idStr = c._id.toString();
    const custom = assignmentMap[idStr];
    return {
      id: c._id,
      contractorId: `CT-${idStr.slice(-4).toUpperCase()}`,
      name: c.fullName,
      email: c.email,
      completedProjects: projectCountMap[idStr] || 0,
      defaultDiscount: `${defaultDiscount}%`,
      currentDiscount: custom ? `${custom}%` : `${defaultDiscount}%`,
      discountType: custom ? 'Individual' : 'Default',
      rawDiscount: custom || defaultDiscount,
    };
  });

  return {
    defaultDiscount,
    contractorsWithDiscounts: contractorList.length,
    activeDiscountRules: Object.keys(assignmentMap).length,
    contractors: contractorList,
    auditHistory: auditLogs,
  };
}

async function updateDefaultContractorDiscount(adminUser, newDiscountPercentage, reason = '') {
  let policy = await DiscountPolicy.findOne({ code: 'CONTRACTOR_DEFAULT_10' });
  const prev = policy?.discountValue || 10;

  if (!policy) {
    policy = new DiscountPolicy({
      name: 'Default Contractor Discount',
      code: 'CONTRACTOR_DEFAULT_10',
      discountType: 'percentage',
      status: 'active',
      createdBy: adminUser.id || adminUser._id,
    });
  }

  policy.discountValue = Number(newDiscountPercentage);
  await policy.save();

  await DiscountAuditLog.create({
    contractorId: null,
    contractorName: 'All Contractors (Default)',
    previousDiscount: prev,
    newDiscount: Number(newDiscountPercentage),
    discountType: 'default',
    reason: reason || 'Updated default contractor discount',
    updatedBy: adminUser.id || adminUser._id,
    updatedByName: adminUser.fullName || 'Admin User',
  });

  await logAdminAction(adminUser, 'DEFAULT_DISCOUNT_UPDATE', 'DiscountPolicy', policy._id, { discount: prev }, { discount: newDiscountPercentage, reason });

  return policy;
}

async function setContractorIndividualDiscount(adminUser, contractorUserId, discountPercentage, reason = '') {
  const contractor = await User.findById(contractorUserId);
  if (!contractor) throw new NotFoundError('Contractor not found.');

  const policyCode = `CONTRACTOR_CUSTOM_${contractor._id.toString().slice(-6).toUpperCase()}`;
  let policy = await DiscountPolicy.findOne({ code: policyCode });
  const prevDiscount = policy ? policy.discountValue : 10;

  if (!policy) {
    policy = await DiscountPolicy.create({
      name: `Custom Discount for ${contractor.fullName}`,
      code: policyCode,
      discountType: 'percentage',
      discountValue: Number(discountPercentage),
      status: 'active',
      createdBy: adminUser.id || adminUser._id,
    });
  } else {
    policy.discountValue = Number(discountPercentage);
    policy.status = 'active';
    await policy.save();
  }

  await DiscountAssignment.findOneAndUpdate(
    { contractorId: contractor._id },
    {
      discountPolicyId: policy._id,
      assignedBy: adminUser.id || adminUser._id,
      status: 'active',
      notes: reason,
    },
    { upsert: true, new: true }
  );

  await DiscountAuditLog.create({
    contractorId: contractor._id,
    contractorName: contractor.fullName,
    previousDiscount: prevDiscount,
    newDiscount: Number(discountPercentage),
    discountType: 'individual',
    reason: reason || 'Contractor performance discount adjustment',
    updatedBy: adminUser.id || adminUser._id,
    updatedByName: adminUser.fullName || 'Admin User',
  });

  await logAdminAction(adminUser, 'INDIVIDUAL_DISCOUNT_SET', 'DiscountAssignment', contractor._id, { prevDiscount }, { newDiscount: discountPercentage, reason });

  return { success: true, discountPercentage: Number(discountPercentage) };
}

// ====================================================================
// 10. SYSTEM SETTINGS & SYSTEM INFORMATION
// ====================================================================

const SETTINGS_KEY_MAP = {
  companyName: 'COMPANY_NAME',
  brandTagline: 'BRAND_TAGLINE',
  platformLogoUrl: 'PLATFORM_LOGO_URL',
  supportEmail: 'SUPPORT_EMAIL',
  supportPhone: 'SUPPORT_PHONE',
  whatsappNumber: 'WHATSAPP_NUMBER',
  businessAddress: 'BUSINESS_ADDRESS',
  operatingHours: 'OPERATING_HOURS',
  currency: 'CURRENCY',
  taxRatePercent: 'TAX_RATE_PERCENT',
  emailOnContractorRegister: 'EMAIL_ON_CONTRACTOR_REGISTER',
  emailOnHotLead: 'EMAIL_ON_HOT_LEAD',
  weeklyReportDispatch: 'WEEKLY_REPORT_DISPATCH',
  sessionTimeoutMinutes: 'SESSION_TIMEOUT_MINUTES',
  enforceMFAForAdmins: 'ENFORCE_MFA_FOR_ADMINS',
};
const SETTINGS_REV_MAP = Object.fromEntries(Object.entries(SETTINGS_KEY_MAP).map(([k, v]) => [v, k]));

async function getSystemSettings() {
  const settings = await PlatformSetting.find().sort({ category: 1, key: 1 });
  const byCategory = {
    GENERAL: {},
    NOTIFICATION: {},
    SECURITY: {},
  };
  const flatSettings = {
    companyName: 'Deck Restoration Plus',
    brandTagline: 'Commercial & Residential Exterior Wood Restoration Specialists',
    platformLogoUrl: '',
    supportEmail: 'support@deckestimator.com',
    supportPhone: '(856) 666-8888',
    whatsappNumber: '+1 (856) 555-0199',
    businessAddress: '1452 Boardwalk Ave, Cherry Hill, NJ 08002',
    operatingHours: 'Mon - Fri: 8:00 AM - 6:00 PM EST, Sat: 9:00 AM - 2:00 PM EST',
    currency: 'USD',
    taxRatePercent: 6.625,
    emailOnContractorRegister: true,
    emailOnHotLead: true,
    weeklyReportDispatch: true,
    sessionTimeoutMinutes: 120,
    enforceMFAForAdmins: false,
  };

  settings.forEach((s) => {
    if (byCategory[s.category]) {
      byCategory[s.category][s.key] = s.value;
    }
    const camel = SETTINGS_REV_MAP[s.key];
    if (camel) {
      flatSettings[camel] = s.value;
    }
  });

  const dbState = mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting';
  const systemInfo = {
    applicationVersion: '1.0.0',
    lastSystemUpdate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    backendStatus: 'Connected',
    databaseStatus: dbState,
    dbConnected: mongoose.connection.readyState === 1,
    collectionsCount: Object.keys(mongoose.connection.collections || {}).length,
    nodeVersion: process.version,
    platformUptime: `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
    apiStatus: 'Operational',
    systemHealth: 'Healthy',
    uptimeSeconds: Math.round(process.uptime()),
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  };

  return {
    settings: {
      ...flatSettings,
      ...byCategory,
    },
    systemInfo,
  };
}

async function updateSystemSettings(adminUser, payload) {
  const incoming = payload.settings || payload;
  for (const [key, val] of Object.entries(incoming)) {
    const dbKey = SETTINGS_KEY_MAP[key] || key.toUpperCase();
    const existing = await PlatformSetting.findOne({ key: dbKey });
    if (existing) {
      existing.value = val;
      existing.lastUpdatedBy = adminUser.id || adminUser._id;
      await existing.save();
    }
  }

  await logAdminAction(adminUser, 'SYSTEM_SETTINGS_UPDATE', 'PlatformSetting', null, null, incoming);
  return getSystemSettings();
}

// ====================================================================

// ====================================================================
// NOTIFICATION BROADCAST & DIRECT DISPATCH ENGINE
// ====================================================================

async function dispatchAdminNotification(adminUser, payload) {
  const { recipientType = 'all', targetRole = 'all', userIds = [], title, message, category = 'GENERAL', channels = ['IN_APP'] } = payload;
  if (!title || !message) {
    throw new BadRequestError('Notification title and message are required.');
  }

  const senderName = adminUser.fullName || adminUser.name || 'System Administrator';
  const createdDocs = [];

  if (recipientType === 'specific' && Array.isArray(userIds) && userIds.length > 0) {
    const targetUsers = await User.find({ _id: { $in: userIds } }).select('fullName email phone role');
    for (const u of targetUsers) {
      const doc = await Notification.create({
        recipientType: 'specific',
        userId: u._id,
        recipientSnapshot: {
          name: u.fullName,
          email: u.email,
          phone: u.phone,
          role: u.role,
        },
        targetRole: u.role,
        title,
        message,
        category,
        channels,
        sentBy: adminUser.id || adminUser._id,
        sentByName: senderName,
      });
      createdDocs.push(doc);
    }
  } else {
    // Broadcast message
    const roleTarget = recipientType === 'customer' ? 'customer' : recipientType === 'contractor' ? 'contractor' : 'all';
    const doc = await Notification.create({
      recipientType: recipientType === 'both' ? 'all' : recipientType,
      targetRole: roleTarget,
      title,
      message,
      category,
      channels,
      sentBy: adminUser.id || adminUser._id,
      sentByName: senderName,
    });
    createdDocs.push(doc);
  }

  await logAdminAction(adminUser, 'NOTIFICATION_DISPATCH', 'PLATFORM_SETTING', createdDocs[0]?._id, null, {
    recipientType,
    count: createdDocs.length,
    title,
  });

  return {
    success: true,
    count: createdDocs.length,
    message: `Notification successfully dispatched to ${createdDocs.length} recipient(s).`,
    notifications: createdDocs,
  };
}

async function getNotificationBroadcastHistory(limit = 30) {
  const list = await Notification.find().sort({ createdAt: -1 }).limit(Number(limit));
  return list.map((n) => n.toJSON());
}

async function searchNotificationRecipients(query = '') {
  let q = { accountStatus: { $ne: 'disabled' }, role: { $in: [ROLES.CUSTOMER, ROLES.CONTRACTOR] } };
  if (query && query.trim()) {
    const reg = new RegExp(query.trim(), 'i');
    q.$or = [{ fullName: reg }, { email: reg }, { phone: reg }];
  }
  const users = await User.find(q).select('fullName email phone role accountStatus').limit(25);
  return users.map((u) => ({
    id: u._id.toString(),
    _id: u._id.toString(),
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    accountStatus: u.accountStatus,
  }));
}

// 11. PERMISSIONS MATRIX (Verification & Progress Tab 4)
// ====================================================================

async function getPermissionsMatrix() {
  let policy = await PermissionsPolicy.findOne();
  if (!policy) {
    policy = await PermissionsPolicy.create({
      policyName: 'Standard Platform Role Permissions',
      permissions: [
        { moduleKey: 'dashboard', permissionName: 'View Dashboard', customer: true, contractor: true, admin: true },
        { moduleKey: 'projects', permissionName: 'View Projects', customer: true, contractor: true, admin: true },
        { moduleKey: 'estimates', permissionName: 'Create Estimates', customer: true, contractor: true, admin: true },
        { moduleKey: 'project_progress', permissionName: 'Update Project Progress', customer: false, contractor: true, admin: true },
        { moduleKey: 'discounts', permissionName: 'Manage Discounts', customer: false, contractor: false, admin: true },
        { moduleKey: 'catalog', permissionName: 'Manage Catalog', customer: false, contractor: false, admin: true },
        { moduleKey: 'pricing', permissionName: 'Manage Pricing', customer: false, contractor: false, admin: true },
        { moduleKey: 'users', permissionName: 'Manage Users', customer: false, contractor: false, admin: true },
        { moduleKey: 'reports', permissionName: 'View Reports & Analytics', customer: false, contractor: false, admin: true },
        { moduleKey: 'system_settings', permissionName: 'System Configuration', customer: false, contractor: false, admin: true },
      ],
    });
  }

  // Format array for frontend table
  const formatted = (policy.permissions || []).map((p) => ({
    module: p.moduleKey,
    label: p.permissionName || p.moduleKey,
    roles: {
      admin: p.admin ?? true,
      contractor: p.contractor ?? false,
      customer: p.customer ?? false,
    },
  }));

  return formatted;
}

async function savePermissionsMatrix(adminUser, permissionsList) {
  let policy = await PermissionsPolicy.findOne();
  if (!policy) policy = new PermissionsPolicy();

  // Normalize frontend structure { module, label, roles } back to schema
  const normalized = (permissionsList || []).map((item) => ({
    moduleKey: item.module || item.moduleKey,
    permissionName: item.label || item.permissionName || item.module,
    admin: item.roles?.admin ?? item.admin ?? true,
    contractor: item.roles?.contractor ?? item.contractor ?? false,
    customer: item.roles?.customer ?? item.customer ?? false,
  }));

  policy.permissions = normalized;
  policy.updatedBy = adminUser.id || adminUser._id;
  await policy.save();

  await logAdminAction(adminUser, 'PERMISSIONS_MATRIX_UPDATE', 'PermissionsPolicy', policy._id, null, normalized);
  return getPermissionsMatrix();
}

// ====================================================================
// 12. REPORTS & ANALYTICS (8 Tabs)
// ====================================================================

async function getReportsAnalyticsData(reportTab = 'business_overview', { dateRange = '30d' } = {}) {
  const [
    userCount, custCount, contCount, leadCount, projectCount, estCount, estAgg,
    activeProjectsCount, completedProjectsCount, onHoldProjectsCount, newLeadsCount, hotLeadsCount,
    woodAgg, monthlyAgg
  ] = await Promise.all([
    User.countDocuments({ accountStatus: { $ne: 'disabled' } }),
    User.countDocuments({ role: ROLES.CUSTOMER }),
    User.countDocuments({ role: ROLES.CONTRACTOR }),
    Lead.countDocuments(),
    Project.countDocuments(),
    Estimate.countDocuments(),
    Estimate.aggregate([
      { $match: { totalAmount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Project.countDocuments({ status: { $in: ['in_progress', 'IN_PROGRESS', 'active', 'ACTIVE'] } }),
    Project.countDocuments({ status: { $in: ['completed', 'COMPLETED'] } }),
    Project.countDocuments({ status: { $in: ['on_hold', 'ON_HOLD', 'pending'] } }),
    Lead.countDocuments({ status: { $in: ['new', 'NEW'] } }),
    Lead.countDocuments({ priority: 'HOT' }),
    Estimate.aggregate([
      { $match: { 'deckDetails.woodSpecies': { $exists: true, $ne: '' } } },
      { $group: { _id: '$deckDetails.woodSpecies', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Estimate.aggregate([
      { $match: { totalAmount: { $gt: 0 } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]),
  ]);

  const totalValue = estAgg?.[0]?.total || 0;
  const avgVal = estCount > 0 ? Math.round(totalValue / estCount) : 0;
  const convRate = leadCount > 0 ? Math.round((projectCount / leadCount) * 100) : 0;

  const totalWoodCount = woodAgg.reduce((sum, w) => sum + w.count, 0) || (estCount || 1);
  const materialSelection = woodAgg.length > 0 ? woodAgg.map((w) => ({
    name: w._id || 'Pressure Treated Pine',
    count: w.count,
    percentage: Math.round((w.count / totalWoodCount) * 100),
  })) : [
    { name: 'Pressure Treated Pine', count: estCount, percentage: 100 },
  ];

  // Dynamic monthly revenue trajectory from real estimates
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyRevenue = (monthlyAgg.length > 0 ? monthlyAgg : [{ _id: new Date().getMonth() + 1, total: totalValue, count: estCount }]).map((m) => ({
    month: monthNames[(m._id - 1) % 12] || 'Month',
    revenue: m.total || 0,
    count: m.count || 0,
  }));

  return {
    metrics: {
      totalRevenue: totalValue,
      totalUsers: userCount,
      totalCustomers: custCount,
      totalContractors: contCount,
      totalLeads: leadCount,
      totalProjects: projectCount,
      totalEstimates: estCount,
      totalEstimatedValue: totalValue,
      averageProjectValue: avgVal,
      leadConversionRate: convRate,
      activeProjects: activeProjectsCount,
      completedProjects: completedProjectsCount,
      onHoldProjects: onHoldProjectsCount,
      hotLeads: hotLeadsCount,
    },
    userDistribution: [
      { label: 'Customers', percentage: userCount > 0 ? Math.round((custCount / userCount) * 100) : 0, count: custCount, color: '#1d4ed8' },
      { label: 'Contractors', percentage: userCount > 0 ? Math.round((contCount / userCount) * 100) : 0, count: contCount, color: '#10b981' },
    ],
    projectStatusDistribution: [
      { label: 'Active', percentage: projectCount > 0 ? Math.round((activeProjectsCount / projectCount) * 100) : 0, count: activeProjectsCount, color: '#10b981' },
      { label: 'Completed', percentage: projectCount > 0 ? Math.round((completedProjectsCount / projectCount) * 100) : 0, count: completedProjectsCount, color: '#1d4ed8' },
      { label: 'On Hold', percentage: projectCount > 0 ? Math.round((onHoldProjectsCount / projectCount) * 100) : 0, count: onHoldProjectsCount, color: '#f59e0b' },
    ],
    leadFunnel: [
      { step: 'New Leads', count: newLeadsCount, color: '#1d4ed8' },
      { step: 'Hot Priority', count: hotLeadsCount, color: '#ef4444' },
      { step: 'In Progress / Assigned', count: Math.max(0, leadCount - newLeadsCount), color: '#f59e0b' },
      { step: 'Converted to Project', count: projectCount, color: '#10b981' },
    ],
    materialSelection,
    monthlyRevenue,
    pricingBreakdown: [
      { label: 'Labor Cost', percentage: 60, color: '#1d4ed8' },
      { label: 'Material Cost', percentage: 40, color: '#10b981' },
    ],
  };
}

async function exportReportsData(format = 'csv', { tab = 'business_overview', dateRange = '30d' } = {}) {
  const data = await getReportsAnalyticsData(tab, { dateRange });
  const headers = ['Metric Category', 'Key Indicator', 'Metric Value', 'Notes'];
  const rows = [
    ['Executive Performance', 'Total Platform Revenue', `${(data.metrics.totalEstimatedValue || 0).toLocaleString()}`, 'Calculated from estimates'],
    ['Executive Performance', 'Completed Estimates', data.metrics.totalEstimates, 'Database count'],
    ['Executive Performance', 'Average Project Value', `${(data.metrics.averageProjectValue || 0).toLocaleString()}`, 'Average per estimate'],
    ['Executive Performance', 'Lead Conversion Rate', `${data.metrics.leadConversionRate || 0}%`, 'Projects to Leads ratio'],
    ['User Metrics', 'Total Registered Users', data.metrics.totalUsers, 'Active accounts'],
    ['User Metrics', 'Total Customers', data.metrics.totalCustomers, 'Customer accounts'],
    ['User Metrics', 'Total Contractors', data.metrics.totalContractors, 'Contractor accounts'],
    ['Project Operations', 'Total Projects', data.metrics.totalProjects, 'All deck projects'],
    ['Project Operations', 'Active In-Progress', data.metrics.activeProjects, 'Underway'],
    ['Project Operations', 'Completed Decks', data.metrics.completedProjects, 'Delivered'],
    ['Project Operations', 'On Hold', data.metrics.onHoldProjects, 'Paused'],
    ['Lead Inquiries', 'Total Inquiries', data.metrics.totalLeads, 'Customer & Contractor inquiries'],
    ['Lead Inquiries', 'Hot Priority Inquiries', data.metrics.hotLeads, 'Time-sensitive <= 30 days'],
  ];

  const escape = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  return {
    data: csv,
    contentType: format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv',
    filename: `reports-analytics-${tab}-${Date.now()}.${format === 'excel' ? 'xls' : 'csv'}`,
  };
}

async function exportSingleProjectDossier(projectId, format = 'csv') {
  const project = await Project.findById(projectId)
    .populate('customerId', 'fullName email phone')
    .populate('contractorId', 'fullName email phone');

  if (!project) throw new NotFoundError('Project not found');

  const headers = ['Section', 'Field', 'Value'];
  const rows = [
    ['Project Overview', 'Project ID', project.projectId || project._id.toString()],
    ['Project Overview', 'Project Title', project.projectName],
    ['Project Overview', 'Current Status', (project.status || 'in_progress').toUpperCase()],
    ['Project Overview', 'Completion Progress', `${project.progress || 0}%`],
    ['Project Overview', 'Start Date', project.startDate ? project.startDate.toISOString().split('T')[0] : 'N/A'],
    ['Project Overview', 'Target End Date', project.targetEndDate ? project.targetEndDate.toISOString().split('T')[0] : 'N/A'],
    ['Customer Details', 'Name', project.customerId?.fullName || 'N/A'],
    ['Customer Details', 'Email', project.customerId?.email || 'N/A'],
    ['Customer Details', 'Phone', project.customerId?.phone || 'N/A'],
    ['Assigned Contractor', 'Name', project.contractorId?.fullName || 'Alex K (Apex LLC)'],
    ['Assigned Contractor', 'Email', project.contractorId?.email || 'N/A'],
    ['Deck Specifications', 'Length', `${project.deckSpecs?.length || 20} ft`],
    ['Deck Specifications', 'Width', `${project.deckSpecs?.width || 14} ft`],
    ['Deck Specifications', 'Total Area', `${(project.deckSpecs?.length || 20) * (project.deckSpecs?.width || 14)} sq ft`],
    ['Deck Specifications', 'Wood Species', project.deckSpecs?.woodSpecies || 'Redwood'],
    ['Deck Specifications', 'Deck Condition', project.deckSpecs?.condition || 'Weathered'],
    ['Notes & Logs', 'Administrative Notes', project.notes || 'Standard deck restoration job'],
  ];

  if (project.progressHistory && project.progressHistory.length > 0) {
    project.progressHistory.forEach((h, i) => {
      rows.push([
        `Milestone Log #${i + 1}`,
        `${h.progress}% on ${new Date(h.updatedAt).toLocaleDateString()}`,
        `${h.note || ''} (By: ${h.updatedBy || 'Admin'})`,
      ]);
    });
  }

  const escape = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  return {
    data: csv,
    contentType: format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv',
    filename: `project-dossier-${(project.projectName || 'project').replace(/[^a-zA-Z0-9_-]/g, '_')}-${Date.now()}.${format === 'excel' ? 'xls' : 'csv'}`,
  };
}

// ====================================================================
// 13. ADMIN PROFILE & AUTH
// ====================================================================

async function getAdminProfile(adminUserId) {
  const user = await User.findById(adminUserId).select('fullName email phone avatar role isParentAdmin accountStatus lastLoginAt createdAt');
  if (!user) throw new NotFoundError('Admin profile not found.');
  const ret = user.toJSON();
  ret.name = user.fullName;
  ret.isParentAdmin = user.email === 'admin@deckestimator.com' || user.isParentAdmin === true;
  return ret;
}

async function updateAdminProfile(adminUserId, { fullName, name, email, phone, avatar }) {
  const user = await User.findById(adminUserId);
  if (!user) throw new NotFoundError('User not found.');

  const n = fullName || name;
  if (n) user.fullName = n.trim();
  if (email) user.email = email.trim().toLowerCase();
  if (phone !== undefined) user.phone = phone.trim();
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  invalidateAuthCache(user._id);
  const ret = user.toJSON();
  ret.name = user.fullName;
  ret.isParentAdmin = user.email === 'admin@deckestimator.com' || user.isParentAdmin === true;
  return ret;
}

async function getAdminHierarchy(currentUser) {
  const currentAdmin = await User.findById(currentUser._id || currentUser.id);
  if (!currentAdmin) throw new NotFoundError('Admin user not found.');
  const isParent = currentAdmin.email === 'admin@deckestimator.com' || currentAdmin.isParentAdmin === true;

  const admins = await User.find({ role: 'admin', deletedAt: null })
    .select('fullName email phone avatar role isParentAdmin parentAdminId createdAt lastLoginAt')
    .sort({ createdAt: 1 })
    .lean();

  const formattedAdmins = admins.map((adm) => ({
    id: adm._id,
    _id: adm._id,
    name: adm.fullName,
    fullName: adm.fullName,
    email: adm.email,
    phone: adm.phone || '',
    avatar: adm.avatar || '',
    isParentAdmin: adm.email === 'admin@deckestimator.com' || adm.isParentAdmin === true,
    createdAt: adm.createdAt,
    lastLoginAt: adm.lastLoginAt,
  }));

  return {
    isParentAdmin: isParent,
    currentAdmin: {
      id: currentAdmin._id,
      _id: currentAdmin._id,
      name: currentAdmin.fullName,
      email: currentAdmin.email,
      isParentAdmin: isParent,
    },
    admins: formattedAdmins,
  };
}

async function createChildAdmin(currentUser, { fullName, name, email, phone, password }) {
  const currentAdmin = await User.findById(currentUser._id || currentUser.id);
  if (!currentAdmin) throw new NotFoundError('Admin user not found.');
  const isParent = currentAdmin.email === 'admin@deckestimator.com' || currentAdmin.isParentAdmin === true;
  if (!isParent) {
    throw new ForbiddenError('Only the Parent Administrator has authorization to create child administrator accounts.');
  }

  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) throw new BadRequestError('Email address is required.');
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new BadRequestError('An account with this email address already exists.');

  const adminName = (fullName || name || '').trim() || 'Deck Pro Administrator';
  const plainPassword = password || 'DeckAdmin2026!';
  const passwordHash = await User.hashPassword(plainPassword);

  const newAdmin = await User.create({
    fullName: adminName,
    email: normalizedEmail,
    phone: (phone || '').trim(),
    passwordHash,
    role: 'admin',
    accountStatus: 'active',
    isParentAdmin: false,
    parentAdminId: currentAdmin._id,
    emailVerifiedAt: new Date(),
  });

  return {
    success: true,
    message: `Child administrator account created successfully for ${adminName} (${normalizedEmail}).`,
    admin: {
      id: newAdmin._id,
      _id: newAdmin._id,
      name: newAdmin.fullName,
      email: newAdmin.email,
      isParentAdmin: false,
      createdAt: newAdmin.createdAt,
    },
  };
}

async function deleteChildAdmin(currentUser, targetAdminId) {
  const currentAdmin = await User.findById(currentUser._id || currentUser.id);
  if (!currentAdmin) throw new NotFoundError('Admin user not found.');
  const isParent = currentAdmin.email === 'admin@deckestimator.com' || currentAdmin.isParentAdmin === true;
  if (!isParent) {
    throw new ForbiddenError('Only the Parent Administrator has authority to delete child administrators.');
  }

  const targetAdmin = await User.findById(targetAdminId);
  if (!targetAdmin) throw new NotFoundError('Administrator account not found.');

  if (
    targetAdmin.email === 'admin@deckestimator.com' ||
    targetAdmin.isParentAdmin === true ||
    targetAdmin._id.toString() === currentAdmin._id.toString()
  ) {
    throw new BadRequestError('The Parent Administrator account is protected and cannot be deleted.');
  }

  targetAdmin.deletedAt = new Date();
  targetAdmin.accountStatus = 'inactive';
  await targetAdmin.save();
  invalidateAuthCache(targetAdmin._id);

  return {
    success: true,
    message: `Child administrator account (${targetAdmin.email}) has been successfully deleted.`,
  };
}

async function changeAdminPassword(adminUserId, { currentPassword, newPassword }) {
  const user = await User.findById(adminUserId).select('+passwordHash');
  if (!user) throw new NotFoundError('Admin profile not found.');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new BadRequestError('Current password does not match.');
  }

  if (!newPassword || newPassword.length < 8) {
    throw new BadRequestError('New password must be at least 8 characters long.');
  }

  user.passwordHash = await User.hashPassword(newPassword);
  await user.save();
  invalidateAuthCache(user._id);

  return { success: true, message: 'Password updated successfully.' };
}

module.exports = {
  // 1. Dashboard
  getDashboardSummary,
  getBusinessActivityTrend,
  getActivityTrend: getBusinessActivityTrend,

  // 2. Users
  listUsers,
  getUserProfile,
  exportSingleUserDossier,
  updateUserStatus,
  softDeleteUser,
  listUserRequests,
  resolveUserRequest,
  listContractorDocuments,
  reviewContractorDocument,

  // 3. Verifications
  listVerifications,
  approveContractorVerification,
  rejectContractorVerification,
  getVerificationHistoryList,

  // 4. Projects & Progress
  listProjects,
  updateProjectProgress,
  exportProjectsData,

  // 5. Leads
  listLeads,
  getLeadDetails,
  exportSingleLeadDossier,
  exportLeadsData,

  // 6. Estimator Config
  listEstimatorFields,
  saveEstimatorField,
  deleteEstimatorField,
  listEstimatorDependencies,
  saveEstimatorDependency,
  deleteEstimatorDependency,

  // 7. Catalog
  getCatalogOverview,
  listCatalogMaterials,
  saveCatalogMaterial,
  listCatalogProducts,
  saveCatalogProduct,
  listCatalogSubstrates,
  saveCatalogSubstrate,
  listCatalogServices,
  saveCatalogService,
  listCatalogCoverageRates,
  saveCatalogCoverageRate,

  // 8. Pricing
  getPricingConfig,
  updatePricingConfig,

  // 9. Discounts
  getDiscountsOverview,
  updateDefaultContractorDiscount,
  setContractorIndividualDiscount,

  // 10. Settings & System Info
  getSystemSettings,
  updateSystemSettings,
  dispatchAdminNotification,
  getNotificationBroadcastHistory,
  searchNotificationRecipients,

  // 11. Permissions
  getPermissionsMatrix,
  savePermissionsMatrix,

  // 12. Reports
  getReportsAnalyticsData,
  exportReportsData,
  exportSingleProjectDossier,

  // 13. Profile & Hierarchy
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAdminHierarchy,
  createChildAdmin,
  deleteChildAdmin,
};
