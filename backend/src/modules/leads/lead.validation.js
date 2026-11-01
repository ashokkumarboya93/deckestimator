// =============================================
// Deck Estimator — Lead Validation Schemas (Phase 8)
// =============================================

const Joi = require('joi');
const { LEAD_STATUS, LEAD_SOURCE } = require('../../shared/constants');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createLeadSchema = Joi.object({
  deckId: Joi.string().pattern(objectIdRegex).required().messages({
    'string.pattern.base': 'Invalid deck project ID format.',
    'any.required': 'Associated deck project ID is required.',
  }),
  estimateId: Joi.string().pattern(objectIdRegex).allow(null, '').optional(),
  leadSource: Joi.string()
    .valid(...Object.values(LEAD_SOURCE))
    .default(LEAD_SOURCE.CUSTOMER_ESTIMATOR),
  enquiry: Joi.object({
    subject: Joi.string().trim().min(3).max(200).required().messages({
      'string.min': 'Subject must be at least 3 characters.',
      'any.required': 'Enquiry subject is required.',
    }),
    message: Joi.string().trim().min(5).max(2000).required().messages({
      'string.min': 'Message must be at least 5 characters.',
      'any.required': 'Enquiry message is required.',
    }),
    preferredContactMethod: Joi.string()
      .valid('email', 'phone', 'any')
      .default('any'),
    preferredContactTime: Joi.string().trim().max(100).default('any'),
    additionalNotes: Joi.string().trim().max(1000).allow(''),
  }).required(),
});

const assignLeadSchema = Joi.object({
  contractorId: Joi.string().pattern(objectIdRegex).required().messages({
    'string.pattern.base': 'Invalid contractor user ID format.',
    'any.required': 'Contractor ID is required for assignment.',
  }),
  assignmentReason: Joi.string().trim().max(500).allow(''),
  assignmentNotes: Joi.string().trim().max(1000).allow(''),
});

const contractorStatusUpdateSchema = Joi.object({
  status: Joi.string()
    .valid(
      LEAD_STATUS.CONTACTED,
      LEAD_STATUS.SITE_VISIT_SCHEDULED,
      LEAD_STATUS.QUOTE_IN_PROGRESS,
      LEAD_STATUS.CONVERTED,
      LEAD_STATUS.NOT_INTERESTED
    )
    .required(),
  notes: Joi.string().trim().max(1000).allow(''),
});

const contractorRejectSchema = Joi.object({
  reason: Joi.string().trim().min(5).max(1000).required().messages({
    'string.min': 'A clear rejection reason of at least 5 characters is required.',
    'any.required': 'Rejection reason is required.',
  }),
});

const adminCloseLeadSchema = Joi.object({
  action: Joi.string().valid('CLOSE', 'CANCEL').required(),
  reason: Joi.string().trim().min(3).max(1000).required().messages({
    'any.required': 'Closure or cancellation reason is required.',
  }),
});

const addNoteSchema = Joi.object({
  description: Joi.string().trim().min(2).max(2000).required(),
  visibility: Joi.string()
    .valid('CUSTOMER_VISIBLE', 'INTERNAL')
    .default('INTERNAL'),
});

module.exports = {
  createLeadSchema,
  assignLeadSchema,
  contractorStatusUpdateSchema,
  contractorRejectSchema,
  adminCloseLeadSchema,
  addNoteSchema,
};
