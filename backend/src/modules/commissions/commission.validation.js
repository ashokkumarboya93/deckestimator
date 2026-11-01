// =============================================
// Deck Estimator — Commission Validation Schemas (Phase 9)
// =============================================

const Joi = require('joi');
const {
  COMMISSION_TYPE,
  COMMISSION_POLICY_STATUS,
  COMMISSION_CALCULATION_BASIS,
} = require('../../shared/constants');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createCommissionPolicySchema = Joi.object({
  name: Joi.string().trim().max(120).required(),
  code: Joi.string().trim().uppercase().min(3).max(30).required(),
  description: Joi.string().trim().max(500).allow('').optional(),
  commissionType: Joi.string().valid(...Object.values(COMMISSION_TYPE)).required(),
  commissionValue: Joi.number().positive().required(),
  calculationBasis: Joi.string().valid(...Object.values(COMMISSION_CALCULATION_BASIS)).default('converted_estimate'),
  minimumCommissionAmount: Joi.number().min(0).default(0),
  maximumCommissionAmount: Joi.number().min(0).allow(null).optional(),
  effectiveStartDate: Joi.date().iso().optional(),
  effectiveEndDate: Joi.date().iso().min(Joi.ref('effectiveStartDate')).allow(null).optional(),
  status: Joi.string().valid(...Object.values(COMMISSION_POLICY_STATUS)).default('draft'),
});

const updateCommissionPolicySchema = Joi.object({
  name: Joi.string().trim().max(120).optional(),
  description: Joi.string().trim().max(500).allow('').optional(),
  commissionType: Joi.string().valid(...Object.values(COMMISSION_TYPE)).optional(),
  commissionValue: Joi.number().positive().optional(),
  calculationBasis: Joi.string().valid(...Object.values(COMMISSION_CALCULATION_BASIS)).optional(),
  minimumCommissionAmount: Joi.number().min(0).optional(),
  maximumCommissionAmount: Joi.number().min(0).allow(null).optional(),
  effectiveStartDate: Joi.date().iso().optional(),
  effectiveEndDate: Joi.date().iso().allow(null).optional(),
  status: Joi.string().valid(...Object.values(COMMISSION_POLICY_STATUS)).optional(),
}).min(1);

const generateCommissionSchema = Joi.object({
  leadId: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'leadId must be a valid 24-character hex ObjectId',
  }),
  commissionPolicyId: Joi.string().pattern(objectIdPattern).optional(),
  verifiedContractAmount: Joi.number().positive().optional(),
  conversionReference: Joi.string().trim().max(100).allow('').optional(),
});

const reviewCommissionSchema = Joi.object({
  action: Joi.string().valid('APPROVE', 'REJECT', 'MARK_PAYABLE', 'DISPUTE', 'REVERSE').required(),
  reason: Joi.when('action', {
    is: Joi.valid('REJECT', 'REVERSE'),
    then: Joi.string().trim().min(5).max(500).required().messages({
      'any.required': 'A reason is mandatory when rejecting or reversing a commission.',
    }),
    otherwise: Joi.string().trim().max(500).allow('').optional(),
  }),
  notes: Joi.string().trim().max(500).allow('').optional(),
  approvedAmount: Joi.number().positive().optional(),
});

const recordPaymentSchema = Joi.object({
  paymentReference: Joi.string().trim().min(3).max(100).required(),
  paymentMethod: Joi.string().trim().min(2).max(50).required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().trim().uppercase().max(5).default('USD'),
  notes: Joi.string().trim().max(500).allow('').optional(),
});

module.exports = {
  createCommissionPolicySchema,
  updateCommissionPolicySchema,
  generateCommissionSchema,
  reviewCommissionSchema,
  recordPaymentSchema,
};
