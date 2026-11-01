// =============================================
// Deck Estimator — Discount Validation Schemas (Phase 9)
// =============================================

const Joi = require('joi');
const {
  DISCOUNT_TYPE,
  DISCOUNT_POLICY_STATUS,
  DISCOUNT_APPLICABILITY,
} = require('../../shared/constants');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createDiscountPolicySchema = Joi.object({
  name: Joi.string().trim().max(120).required(),
  code: Joi.string().trim().uppercase().min(3).max(30).required(),
  description: Joi.string().trim().max(500).allow('').optional(),
  discountType: Joi.string().valid(...Object.values(DISCOUNT_TYPE)).required(),
  discountValue: Joi.number().positive().required(),
  applicability: Joi.string().valid(...Object.values(DISCOUNT_APPLICABILITY)).default('all'),
  minimumEstimateAmount: Joi.number().min(0).default(0),
  maximumDiscountAmount: Joi.number().min(0).allow(null).optional(),
  effectiveStartDate: Joi.date().iso().optional(),
  effectiveEndDate: Joi.date().iso().min(Joi.ref('effectiveStartDate')).allow(null).optional(),
  usageLimit: Joi.number().integer().min(1).allow(null).optional(),
  isGeneralEligibility: Joi.boolean().default(false),
  status: Joi.string().valid(...Object.values(DISCOUNT_POLICY_STATUS)).default('draft'),
});

const updateDiscountPolicySchema = Joi.object({
  name: Joi.string().trim().max(120).optional(),
  description: Joi.string().trim().max(500).allow('').optional(),
  discountType: Joi.string().valid(...Object.values(DISCOUNT_TYPE)).optional(),
  discountValue: Joi.number().positive().optional(),
  applicability: Joi.string().valid(...Object.values(DISCOUNT_APPLICABILITY)).optional(),
  minimumEstimateAmount: Joi.number().min(0).optional(),
  maximumDiscountAmount: Joi.number().min(0).allow(null).optional(),
  effectiveStartDate: Joi.date().iso().optional(),
  effectiveEndDate: Joi.date().iso().allow(null).optional(),
  usageLimit: Joi.number().integer().min(1).allow(null).optional(),
  isGeneralEligibility: Joi.boolean().optional(),
  status: Joi.string().valid(...Object.values(DISCOUNT_POLICY_STATUS)).optional(),
}).min(1);

const updateDiscountPolicyStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(DISCOUNT_POLICY_STATUS)).required(),
});

const assignDiscountSchema = Joi.object({
  contractorId: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'contractorId must be a valid 24-character hex ObjectId',
  }),
  discountPolicyId: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'discountPolicyId must be a valid 24-character hex ObjectId',
  }),
  effectiveStartDate: Joi.date().iso().optional(),
  effectiveEndDate: Joi.date().iso().allow(null).optional(),
  notes: Joi.string().trim().max(500).allow('').optional(),
});

const applyDiscountSchema = Joi.object({
  discountPolicyId: Joi.string().pattern(objectIdPattern).optional(),
  discountPolicyCode: Joi.string().trim().uppercase().optional(),
}).or('discountPolicyId', 'discountPolicyCode');

module.exports = {
  createDiscountPolicySchema,
  updateDiscountPolicySchema,
  updateDiscountPolicyStatusSchema,
  assignDiscountSchema,
  applyDiscountSchema,
};
