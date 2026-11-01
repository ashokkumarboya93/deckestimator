// =============================================
// Deck Estimator — Pricing Validation Schemas
// =============================================

const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const idParamSchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required().messages({
      'string.pattern.base': 'id must be a valid 24-character hexadecimal ObjectId',
    }),
  }),
};

const createPricingConfigurationSchema = {
  body: Joi.object({
    configurationName: Joi.string().trim().max(150).default('Standard Pricing Configuration'),
    minimumJobPrice: Joi.number().min(0).default(0),
    basePricePerSqFt: Joi.number().min(0).default(0),
    additionalCoatingPrice: Joi.number().min(0).default(0),
    travelCharge: Joi.number().min(0).default(0),
    laborRate: Joi.number().min(0).default(0),
    wastePercentage: Joi.number().min(0).max(100).default(0),
    taxPercentage: Joi.number().min(0).max(100).default(0),
    taxName: Joi.string().trim().max(50).default('Sales Tax'),
    effectiveFrom: Joi.date().iso().optional(),
    effectiveUntil: Joi.date().iso().allow(null).optional(),
    isActive: Joi.boolean().default(true),
    notes: Joi.string().trim().max(1000).allow('').optional(),
  }).unknown(false),
};

const updatePricingConfigurationSchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required(),
  }),
  body: Joi.object({
    configurationName: Joi.string().trim().max(150).optional(),
    minimumJobPrice: Joi.number().min(0).optional(),
    basePricePerSqFt: Joi.number().min(0).optional(),
    additionalCoatingPrice: Joi.number().min(0).optional(),
    travelCharge: Joi.number().min(0).optional(),
    laborRate: Joi.number().min(0).optional(),
    wastePercentage: Joi.number().min(0).max(100).optional(),
    taxPercentage: Joi.number().min(0).max(100).optional(),
    taxName: Joi.string().trim().max(50).optional(),
    effectiveFrom: Joi.date().iso().optional(),
    effectiveUntil: Joi.date().iso().allow(null).optional(),
    isActive: Joi.boolean().optional(),
    notes: Joi.string().trim().max(1000).allow('').optional(),
  }).min(1).unknown(false),
};

const togglePricingStatusSchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required(),
  }),
  body: Joi.object({
    isActive: Joi.boolean().required(),
  }).unknown(false),
};

module.exports = {
  idParamSchema,
  createPricingConfigurationSchema,
  updatePricingConfigurationSchema,
  togglePricingStatusSchema,
};

