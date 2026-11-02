// =============================================
// Deck Estimator — Admin Management Controller (Phase 10)
// =============================================

const adminService = require('./admin.service');

// 1. Dashboard
async function getDashboardSummary(req, res, next) {
  try {
    const summary = await adminService.getDashboardSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

async function getRecentActivity(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 20;
    const activities = await adminService.getRecentActivity(limit);
    res.status(200).json({ success: true, data: activities });
  } catch (err) {
    next(err);
  }
}

// 2. Users
async function listUsers(req, res, next) {
  try {
    const result = await adminService.listUsers(req.query);
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const result = await adminService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const user = await adminService.createUser(req.user, req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await adminService.updateUser(req.user, req.params.id, req.body);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const user = await adminService.updateUserStatus(
      req.user,
      req.params.id,
      req.body.accountStatus,
      req.body.reason
    );
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// 3. Decks Oversight
async function listDecks(req, res, next) {
  try {
    const result = await adminService.listDecks(req.query);
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

// 4. Estimates Oversight
async function listEstimates(req, res, next) {
  try {
    const result = await adminService.listEstimates(req.query);
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

// 5. AI Analyses Oversight
async function listAIAnalyses(req, res, next) {
  try {
    const result = await adminService.listAIAnalyses(req.query);
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

// 6. Platform Settings
async function getSettings(req, res, next) {
  try {
    const settings = await adminService.getSettings(req.query.category);
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

async function getPublicSettings(req, res, next) {
  try {
    const settings = await adminService.getPublicSettings(req.query.category);
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

async function getSettingByKey(req, res, next) {
  try {
    const setting = await adminService.getSettingByKey(req.params.key);
    res.status(200).json({ success: true, data: setting });
  } catch (err) {
    next(err);
  }
}

async function createSetting(req, res, next) {
  try {
    const setting = await adminService.createSetting(req.user, req.body);
    res.status(201).json({ success: true, data: setting });
  } catch (err) {
    next(err);
  }
}

async function updateSetting(req, res, next) {
  try {
    const setting = await adminService.updateSetting(req.user, req.params.key, req.body);
    res.status(200).json({ success: true, data: setting });
  } catch (err) {
    next(err);
  }
}

// 7. Audit Logs
async function listAuditLogs(req, res, next) {
  try {
    const result = await adminService.listAuditLogs(req.query);
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
}

// 8. Reports & Exports
async function getReport(req, res, next) {
  try {
    const reportType = req.params.type;
    const report = await adminService.getReportData(reportType, req.query);

    if (req.query.format === 'csv') {
      const csv = adminService.convertReportToCSV(report);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report-${Date.now()}.csv"`);
      return res.status(200).send(csv);
    }

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
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
  getPublicSettings,
  getSettingByKey,
  createSetting,
  updateSetting,
  listAuditLogs,
  getReport,
};

