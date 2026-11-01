// =============================================
// Deck Estimator — Lead Routes (Phase 8)
// =============================================

const express = require('express');
const { authenticate } = require('../../middleware/authenticate');
const { authorize, requireApprovedContractor } = require('../../middleware/authorize');
const { validate } = require('../../middleware/validate');
const { ROLES } = require('../../shared/constants');
const leadController = require('./lead.controller');
const {
  createLeadSchema,
  assignLeadSchema,
  contractorStatusUpdateSchema,
  contractorRejectSchema,
  adminCloseLeadSchema,
  addNoteSchema,
} = require('./lead.validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ----------------------------------------------------
// Customer Enquiry & Lead APIs
// ----------------------------------------------------
router.post(
  '/',
  authorize(ROLES.CUSTOMER),
  validate(createLeadSchema),
  leadController.createLead
);

router.get(
  '/my-leads',
  authorize(ROLES.CUSTOMER),
  leadController.getMyLeads
);

// ----------------------------------------------------
// Admin Lead Management APIs
// ----------------------------------------------------
router.get(
  '/admin/all',
  authorize(ROLES.ADMIN),
  leadController.adminListLeads
);

router.get(
  '/admin/analytics',
  authorize(ROLES.ADMIN),
  leadController.adminGetAnalytics
);

router.post(
  '/admin/:id/assign',
  authorize(ROLES.ADMIN),
  validate(assignLeadSchema),
  leadController.adminAssignLead
);

router.post(
  '/admin/:id/close',
  authorize(ROLES.ADMIN),
  validate(adminCloseLeadSchema),
  leadController.adminCloseLead
);

router.get(
  '/admin/:id/history',
  authorize(ROLES.ADMIN),
  leadController.getAssignmentHistory
);

// ----------------------------------------------------
// Contractor Lead Management APIs (Requires Approved Contractor)
// ----------------------------------------------------
router.get(
  '/contractor/inbox',
  requireApprovedContractor,
  leadController.contractorListLeads
);

router.post(
  '/contractor/:id/accept',
  requireApprovedContractor,
  leadController.contractorAcceptLead
);

router.post(
  '/contractor/:id/reject',
  requireApprovedContractor,
  validate(contractorRejectSchema),
  leadController.contractorRejectLead
);

router.patch(
  '/contractor/:id/status',
  requireApprovedContractor,
  validate(contractorStatusUpdateSchema),
  leadController.contractorUpdateStatus
);

// ----------------------------------------------------
// Shared Lead Details & Activities (Role-guarded inside service)
// ----------------------------------------------------
router.get(
  '/:id',
  authorize(ROLES.CUSTOMER, ROLES.CONTRACTOR, ROLES.ADMIN),
  leadController.getLeadById
);

router.get(
  '/:id/activities',
  authorize(ROLES.CUSTOMER, ROLES.CONTRACTOR, ROLES.ADMIN),
  leadController.getActivities
);

router.post(
  '/:id/notes',
  authorize(ROLES.CUSTOMER, ROLES.CONTRACTOR, ROLES.ADMIN),
  validate(addNoteSchema),
  leadController.addNote
);

module.exports = router;
