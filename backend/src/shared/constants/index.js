// =============================================
// DECK PRO — Application Constants
// =============================================

/** User roles used throughout the application */
const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  CONTRACTOR: 'contractor',
  ADMIN: 'admin',
});

/** Account statuses */
const ACCOUNT_STATUS = Object.freeze({
  PENDING_VERIFICATION: 'pending_verification',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DISABLED: 'disabled',
});

/** Contractor verification statuses */
const VERIFICATION_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
});

/** Estimate statuses */
const ESTIMATE_STATUS = Object.freeze({
  DRAFT: 'draft',
  CALCULATED: 'calculated',
  FINALIZED: 'finalized',
  SUPERSEDED: 'superseded',
  CANCELLED: 'cancelled',
});

/** Lead statuses */
const LEAD_STATUS = Object.freeze({
  NEW: 'new',
  REVIEWING: 'reviewing',
  ASSIGNED: 'assigned',
  CONTACTED: 'contacted',
  IN_PROGRESS: 'in_progress',
  CONVERTED: 'converted',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
});

/** Pricing config statuses */
const PRICING_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  SCHEDULED: 'scheduled',
  RETIRED: 'retired',
});

/** File types */
const FILE_TYPES = Object.freeze({
  DECK_PHOTO: 'deck_photo',
  ESTIMATE_REPORT: 'estimate_report',
});

/** Upload statuses */
const UPLOAD_STATUS = Object.freeze({
  PENDING: 'pending',
  UPLOADED: 'uploaded',
  FAILED: 'failed',
  DELETED: 'deleted',
});

/** AI analysis statuses */
const ANALYSIS_STATUS = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  INCONCLUSIVE: 'inconclusive',
});

/** Discount types */
const DISCOUNT_TYPE = Object.freeze({
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
});

module.exports = {
  ROLES,
  ACCOUNT_STATUS,
  VERIFICATION_STATUS,
  ESTIMATE_STATUS,
  LEAD_STATUS,
  PRICING_STATUS,
  FILE_TYPES,
  UPLOAD_STATUS,
  ANALYSIS_STATUS,
  DISCOUNT_TYPE,
};

