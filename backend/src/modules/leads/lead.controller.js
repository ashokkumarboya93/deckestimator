// =============================================
// Deck Estimator — Lead Controller (Phase 8)
// =============================================

const leadService = require('./lead.service');

async function createLead(req, res, next) {
  try {
    const lead = await leadService.createCustomerLead(req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully. A lead has been created.',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyLeads(req, res, next) {
  try {
    const result = await leadService.getCustomerLeads(req.user.id, req.query);
    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

async function getLeadById(req, res, next) {
  try {
    const lead = await leadService.getLeadById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
}

async function adminListLeads(req, res, next) {
  try {
    const result = await leadService.getAdminLeads(req.query);
    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

async function adminAssignLead(req, res, next) {
  try {
    const updated = await leadService.assignContractor(
      req.params.id,
      req.user,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Lead assigned to contractor successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

async function adminCloseLead(req, res, next) {
  try {
    const updated = await leadService.adminCloseOrCancelLead(
      req.params.id,
      req.user,
      req.body
    );
    res.status(200).json({
      success: true,
      message: `Lead ${req.body.action.toLowerCase()}ed successfully.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

async function adminGetAnalytics(req, res, next) {
  try {
    const analytics = await leadService.getAdminLeadAnalytics();
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
}

async function contractorListLeads(req, res, next) {
  try {
    const result = await leadService.getContractorLeads(req.user.id, req.query);
    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

async function contractorAcceptLead(req, res, next) {
  try {
    const updated = await leadService.contractorAcceptLead(
      req.params.id,
      req.user.id,
      req.body?.notes
    );
    res.status(200).json({
      success: true,
      message: 'Lead accepted successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

async function contractorRejectLead(req, res, next) {
  try {
    const updated = await leadService.contractorRejectLead(
      req.params.id,
      req.user.id,
      req.body.reason
    );
    res.status(200).json({
      success: true,
      message: 'Lead assignment declined.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

async function contractorUpdateStatus(req, res, next) {
  try {
    const updated = await leadService.contractorUpdateStatus(
      req.params.id,
      req.user.id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Lead status updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

async function addNote(req, res, next) {
  try {
    const activity = await leadService.addActivityNote(
      req.params.id,
      req.user,
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Activity note added.',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
}

async function getActivities(req, res, next) {
  try {
    const activities = await leadService.getLeadActivities(
      req.params.id,
      req.user
    );
    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
}

async function getAssignmentHistory(req, res, next) {
  try {
    const history = await leadService.getLeadAssignmentHistory(
      req.params.id,
      req.user
    );
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createLead,
  getMyLeads,
  getLeadById,
  adminListLeads,
  adminAssignLead,
  adminCloseLead,
  adminGetAnalytics,
  contractorListLeads,
  contractorAcceptLead,
  contractorRejectLead,
  contractorUpdateStatus,
  addNote,
  getActivities,
  getAssignmentHistory,
};
