// =============================================
// Deck Estimator — Application Constants
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
  DRAFT: 'draft',
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  ADDITIONAL_INFORMATION_REQUIRED: 'additional_information_required',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
});

/** Verification document categories */
const VERIFICATION_DOCUMENT_TYPES = Object.freeze({
  CONTRACTOR_LICENSE: 'contractor_license',
  BUSINESS_REGISTRATION: 'business_registration',
  INSURANCE_CERTIFICATE: 'insurance_certificate',
  IDENTITY_DOCUMENT: 'identity_document',
  OTHER: 'other',
});

/** Verification document review status */
const VERIFICATION_DOCUMENT_STATUS = Object.freeze({
  PENDING_REVIEW: 'pending_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  REPLACED: 'replaced',
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
  UNDER_REVIEW: 'under_review',
  ASSIGNED: 'assigned',
  ACCEPTED: 'accepted',
  CONTACTED: 'contacted',
  SITE_VISIT_SCHEDULED: 'site_visit_scheduled',
  QUOTE_IN_PROGRESS: 'quote_in_progress',
  CONVERTED: 'converted',
  NOT_INTERESTED: 'not_interested',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
});

/** Lead sources */
const LEAD_SOURCE = Object.freeze({
  CUSTOMER_ESTIMATOR: 'customer_estimator',
  ESTIMATE_ENQUIRY: 'estimate_enquiry',
  CONTACT_FORM: 'contact_form',
  ADMIN_CREATED: 'admin_created',
  OTHER: 'other',
});

/** Lead activity types */
const LEAD_ACTIVITY_TYPE = Object.freeze({
  LEAD_CREATED: 'lead_created',
  LEAD_REVIEWED: 'lead_reviewed',
  LEAD_ASSIGNED: 'lead_assigned',
  LEAD_REASSIGNED: 'lead_reassigned',
  CONTRACTOR_ACCEPTED: 'contractor_accepted',
  CONTRACTOR_REJECTED: 'contractor_rejected',
  CUSTOMER_CONTACTED: 'customer_contacted',
  SITE_VISIT_SCHEDULED: 'site_visit_scheduled',
  QUOTE_IN_PROGRESS: 'quote_in_progress',
  LEAD_CONVERTED: 'lead_converted',
  LEAD_CLOSED: 'lead_closed',
  LEAD_CANCELLED: 'lead_cancelled',
  NOTE_ADDED: 'note_added',
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

/** Discount policy status */
const DISCOUNT_POLICY_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  ARCHIVED: 'archived',
});

/** Discount applicability components */
const DISCOUNT_APPLICABILITY = Object.freeze({
  ALL: 'all',
  MATERIALS: 'materials',
  SERVICES: 'services',
  LABOR: 'labor',
});

/** Discount assignment type */
const DISCOUNT_ASSIGNMENT_TYPE = Object.freeze({
  INDIVIDUAL: 'individual',
  GROUP: 'group',
  GENERAL_ELIGIBILITY: 'general_eligibility',
});

/** Commission calculation types */
const COMMISSION_TYPE = Object.freeze({
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
});

/** Commission policy status */
const COMMISSION_POLICY_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  ARCHIVED: 'archived',
});

/** Commission calculation basis */
const COMMISSION_CALCULATION_BASIS = Object.freeze({
  CONVERTED_ESTIMATE: 'converted_estimate',
  VERIFIED_CONTRACT: 'verified_contract',
  JOB_TOTAL: 'job_total',
});

/** Commission record lifecycle status */
const COMMISSION_STATUS = Object.freeze({
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAYABLE: 'payable',
  PAID: 'paid',
  DISPUTED: 'disputed',
  REVERSED: 'reversed',
});

module.exports = {
  ROLES,
  ACCOUNT_STATUS,
  VERIFICATION_STATUS,
  VERIFICATION_DOCUMENT_TYPES,
  VERIFICATION_DOCUMENT_STATUS,
  ESTIMATE_STATUS,
  LEAD_STATUS,
  LEAD_SOURCE,
  LEAD_ACTIVITY_TYPE,
  PRICING_STATUS,
  FILE_TYPES,
  UPLOAD_STATUS,
  ANALYSIS_STATUS,
  DISCOUNT_TYPE,
  DISCOUNT_POLICY_STATUS,
  DISCOUNT_APPLICABILITY,
  DISCOUNT_ASSIGNMENT_TYPE,
  COMMISSION_TYPE,
  COMMISSION_POLICY_STATUS,
  COMMISSION_CALCULATION_BASIS,
  COMMISSION_STATUS,
};

