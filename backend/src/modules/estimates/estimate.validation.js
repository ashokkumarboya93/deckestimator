// =============================================
// Deck Estimator — Estimate Validation Schemas
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

const createEstimateSchema = {
  body: Joi.object({
    deckId: Joi.string().pattern(objectIdPattern).required().messages({
      'string.empty': 'Valid deckId is required to generate an estimate',
      'string.pattern.base': 'deckId must be a valid ObjectId',
    }),
    estimateName: Joi.string().trim().max(150).allow('').optional(),
    materialIds: Joi.array()
      .items(Joi.string().pattern(objectIdPattern))
      .default([])
      .optional(),
    serviceIds: Joi.array()
      .items(Joi.string().pattern(objectIdPattern))
      .default([])
      .optional(),
    notes: Joi.string().trim().max(1000).allow('').optional(),
  }).unknown(false),
};

const recalculateEstimateSchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required(),
  }),
  body: Joi.object({
    materialIds: Joi.array()
      .items(Joi.string().pattern(objectIdPattern))
      .optional(),
    serviceIds: Joi.array()
      .items(Joi.string().pattern(objectIdPattern))
      .optional(),
    revisionReason: Joi.string().trim().max(500).allow('').optional(),
    notes: Joi.string().trim().max(1000).allow('').optional(),
  }).unknown(false),
};

const updateEstimateStatusSchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required(),
  }),
  body: Joi.object({
    estimateStatus: Joi.string()
      .valid('DRAFT', 'SUBMITTED', 'COMPLETED', 'EXPIRED', 'CANCELLED')
      .required(),
    notes: Joi.string().trim().max(1000).allow('').optional(),
  }).unknown(false),
};

module.exports = {
  idParamSchema,
  createEstimateSchema,
  recalculateEstimateSchema,
  updateEstimateStatusSchema,
};

