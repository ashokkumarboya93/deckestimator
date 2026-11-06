// =============================================
// Deck Estimator — Admin Management Controller
// =============================================

const adminService = require('./admin.service');

// 1. Dashboard
async function getDashboardSummary(req, res, next) {
  try {
    const summary = await adminService.getDashboardSummary(req.query.dateRange);
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

async function getBusinessActivityTrend(req, res, next) {
  try {
    const trend = await adminService.getBusinessActivityTrend(req.query.period);
    res.status(200).json({ success: true, data: trend });
  } catch (err) {
    next(err);
  }
}

// 2. Users Management & Moderation
async function listUsers(req, res, next) {
  try {
    const result = await adminService.listUsers(req.query);
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination, counts: result.counts });
  } catch (err) {
    next(err);
  }
}

async function getUserProfile(req, res, next) {
  try {
    const result = await adminService.getUserProfile(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}


async function exportSingleUserDossier(req, res, next) {
  try {
    const { format = 'csv' } = req.query;
    const file = await adminService.exportSingleUserDossier(req.params.id, format);
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.status(200).send(file.data);
  } catch (err) {
    next(err);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const { status, reason } = req.body;
    const user = await adminService.updateUserStatus(req.user, req.params.id, status, reason);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function softDeleteUser(req, res, next) {
  try {
    const result = await adminService.softDeleteUser(req.user, req.params.id, req.body.reason);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// 3. Verifications
async function listVerifications(req, res, next) {
  try {
    const result = await adminService.listVerifications(req.query);
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination, counts: result.counts });
  } catch (err) {
    next(err);
  }
}

async function approveContractorVerification(req, res, next) {
  try {
    const result = await adminService.approveContractorVerification(req.user, req.params.id);
    res.status(200).json({ success: true, data: result, message: 'Contractor application approved.' });
  } catch (err) {
    next(err);
  }
}

async function rejectContractorVerification(req, res, next) {
  try {
    const result = await adminService.rejectContractorVerification(req.user, req.params.id, req.body.reason);
    res.status(200).json({ success: true, data: result, message: 'Contractor application rejected.' });
  } catch (err) {
    next(err);
  }
}

async function getVerificationHistory(req, res, next) {
  try {
    const history = await adminService.getVerificationHistoryList(req.params.contractorId);
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

// 4. Projects & Progress
async function listProjects(req, res, next) {
  try {
    const result = await adminService.listProjects(req.query);
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination, counts: result.counts });
  } catch (err) {
    next(err);
  }
}

async function updateProjectProgress(req, res, next) {
  try {
    const result = await adminService.updateProjectProgress(req.user, req.params.id, req.body);
    res.status(200).json({ success: true, data: result, message: 'Project progress updated.' });
  } catch (err) {
    next(err);
  }
}

async function exportProjects(req, res, next) {
  try {
    const { format = 'csv' } = req.query;
    const file = await adminService.exportProjectsData(format, req.query);
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.status(200).send(file.data);
  } catch (err) {
    next(err);
  }
}

// 5. Leads Management
async function listLeads(req, res, next) {
  try {
    const result = await adminService.listLeads(req.query);
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination, counts: result.counts });
  } catch (err) {
    next(err);
  }
}

async function exportLeads(req, res, next) {
  try {
    const { format = 'csv', tab = 'all' } = req.query;
    const file = await adminService.exportLeadsData(format, tab, req.query);
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.status(200).send(file.data);
  } catch (err) {
    next(err);
  }
}

// 6. Estimator Configuration

async function getLeadDetails(req, res, next) {
  try {
    const details = await adminService.getLeadDetails(req.params.id);
    res.status(200).json({ success: true, data: details });
  } catch (err) {
    next(err);
  }
}

async function exportSingleLeadDossier(req, res, next) {
  try {
    const { format = 'csv' } = req.query;
    const file = await adminService.exportSingleLeadDossier(req.params.id, format);
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.status(200).send(file.data);
  } catch (err) {
    next(err);
  }
}

async function listEstimatorFields(req, res, next) {
  try {
    const fields = await adminService.listEstimatorFields();
    res.status(200).json({ success: true, data: fields });
  } catch (err) {
    next(err);
  }
}

async function saveEstimatorField(req, res, next) {
  try {
    const field = await adminService.saveEstimatorField(req.user, req.body, req.params.id);
    res.status(200).json({ success: true, data: field });
  } catch (err) {
    next(err);
  }
}

async function deleteEstimatorField(req, res, next) {
  try {
    const result = await adminService.deleteEstimatorField(req.user, req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function listEstimatorDependencies(req, res, next) {
  try {
    const deps = await adminService.listEstimatorDependencies();
    res.status(200).json({ success: true, data: deps });
  } catch (err) {
    next(err);
  }
}

async function saveEstimatorDependency(req, res, next) {
  try {
    const dep = await adminService.saveEstimatorDependency(req.user, req.body, req.params.id);
    res.status(200).json({ success: true, data: dep });
  } catch (err) {
    next(err);
  }
}

async function deleteEstimatorDependency(req, res, next) {
  try {
    const result = await adminService.deleteEstimatorDependency(req.user, req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// 7. Catalog Management
async function getCatalogOverview(req, res, next) {
  try {
    const overview = await adminService.getCatalogOverview();
    res.status(200).json({ success: true, data: overview });
  } catch (err) {
    next(err);
  }
}

async function listCatalogMaterials(req, res, next) {
  try {
    const data = await adminService.listCatalogMaterials();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function saveCatalogMaterial(req, res, next) {
  try {
    const data = await adminService.saveCatalogMaterial(req.user, req.body, req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function listCatalogProducts(req, res, next) {
  try {
    const data = await adminService.listCatalogProducts();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function saveCatalogProduct(req, res, next) {
  try {
    const data = await adminService.saveCatalogProduct(req.user, req.body, req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function listCatalogSubstrates(req, res, next) {
  try {
    const data = await adminService.listCatalogSubstrates();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function saveCatalogSubstrate(req, res, next) {
  try {
    const data = await adminService.saveCatalogSubstrate(req.user, req.body, req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function listCatalogServices(req, res, next) {
  try {
    const data = await adminService.listCatalogServices();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function saveCatalogService(req, res, next) {
  try {
    const data = await adminService.saveCatalogService(req.user, req.body, req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function listCatalogCoverageRates(req, res, next) {
  try {
    const data = await adminService.listCatalogCoverageRates();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function saveCatalogCoverageRate(req, res, next) {
  try {
    const data = await adminService.saveCatalogCoverageRate(req.user, req.body, req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function uploadCatalogImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required.' });
    }
    const imageUrl = `/uploads/catalog/${req.file.filename}`;
    res.status(200).json({ success: true, data: { url: imageUrl } });
  } catch (err) {
    next(err);
  }
}

// 8. Pricing Management
async function getPricingConfig(req, res, next) {
  try {
    const config = await adminService.getPricingConfig();
    res.status(200).json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
}

async function updatePricingConfig(req, res, next) {
  try {
    const config = await adminService.updatePricingConfig(req.user, req.body);
    res.status(200).json({ success: true, data: config, message: 'Pricing configuration saved successfully.' });
  } catch (err) {
    next(err);
  }
}

// 9. Discounts Management
async function getDiscountsOverview(req, res, next) {
  try {
    const data = await adminService.getDiscountsOverview();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updateDefaultContractorDiscount(req, res, next) {
  try {
    const { discount, reason } = req.body;
    const policy = await adminService.updateDefaultContractorDiscount(req.user, discount, reason);
    res.status(200).json({ success: true, data: policy, message: 'Default contractor discount saved.' });
  } catch (err) {
    next(err);
  }
}

async function setContractorIndividualDiscount(req, res, next) {
  try {
    const { discount, reason } = req.body;
    const result = await adminService.setContractorIndividualDiscount(req.user, req.params.contractorId, discount, reason);
    res.status(200).json({ success: true, data: result, message: 'Individual discount saved.' });
  } catch (err) {
    next(err);
  }
}

// 10. System Settings & Info
async function getSystemSettings(req, res, next) {
  try {
    const data = await adminService.getSystemSettings();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function updateSystemSettings(req, res, next) {
  try {
    const data = await adminService.updateSystemSettings(req.user, req.body);
    res.status(200).json({ success: true, data, message: 'Settings saved successfully.' });
  } catch (err) {
    next(err);
  }
}


// Notification Dispatcher
async function dispatchNotification(req, res, next) {
  try {
    const result = await adminService.dispatchAdminNotification(req.user, req.body);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function getNotificationHistory(req, res, next) {
  try {
    const data = await adminService.getNotificationBroadcastHistory(req.query.limit);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function searchRecipients(req, res, next) {
  try {
    const data = await adminService.searchNotificationRecipients(req.query.q);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// 11. Permissions Matrix
async function getPermissionsMatrix(req, res, next) {
  try {
    const data = await adminService.getPermissionsMatrix();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function savePermissionsMatrix(req, res, next) {
  try {
    const data = await adminService.savePermissionsMatrix(req.user, req.body.permissions);
    res.status(200).json({ success: true, data, message: 'Permissions saved.' });
  } catch (err) {
    next(err);
  }
}

// 12. Reports & Analytics
async function exportReports(req, res, next) {
  try {
    const { format = 'csv' } = req.query;
    const file = await adminService.exportReportsData(format, req.query);
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.status(200).send(file.data);
  } catch (err) {
    next(err);
  }
}

async function exportSingleProjectDossier(req, res, next) {
  try {
    const { format = 'csv' } = req.query;
    const file = await adminService.exportSingleProjectDossier(req.params.id, format);
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.status(200).send(file.data);
  } catch (err) {
    next(err);
  }
}

async function getReportsAnalytics(req, res, next) {
  try {
    const data = await adminService.getReportsAnalyticsData(req.query.tab, req.query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// 13. Admin Profile
async function getAdminProfile(req, res, next) {
  try {
    const profile = await adminService.getAdminProfile(req.user.id || req.user._id);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

async function updateAdminProfile(req, res, next) {
  try {
    const profile = await adminService.updateAdminProfile(req.user.id || req.user._id, req.body);
    res.status(200).json({ success: true, data: profile, message: 'Profile updated successfully.' });
  } catch (err) {
    next(err);
  }
}

async function changeAdminPassword(req, res, next) {
  try {
    const result = await adminService.changeAdminPassword(req.user.id || req.user._id, req.body);
    res.status(200).json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardSummary,
  getBusinessActivityTrend,
  listUsers,
  getUserProfile,
  exportSingleUserDossier,
  updateUserStatus,
  softDeleteUser,
  listVerifications,
  approveContractorVerification,
  rejectContractorVerification,
  getVerificationHistory,
  listProjects,
  updateProjectProgress,
  exportProjects,
  listLeads,
  getLeadDetails,
  exportSingleLeadDossier,
  exportLeads,
  listEstimatorFields,
  saveEstimatorField,
  deleteEstimatorField,
  listEstimatorDependencies,
  saveEstimatorDependency,
  deleteEstimatorDependency,
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
  uploadCatalogImage,
  getPricingConfig,
  updatePricingConfig,
  getDiscountsOverview,
  updateDefaultContractorDiscount,
  setContractorIndividualDiscount,
  getSystemSettings,
  updateSystemSettings,
  dispatchNotification,
  getNotificationHistory,
  searchRecipients,
  getPermissionsMatrix,
  savePermissionsMatrix,
  getReportsAnalytics,
  exportReports,
  exportSingleProjectDossier,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
};
