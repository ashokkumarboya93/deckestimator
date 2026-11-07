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
    selectedMaterials: Joi.array()
      .items(
        Joi.object({
          materialId: Joi.string().pattern(objectIdPattern).required(),
          numberOfCoats: Joi.number().min(1).max(5).optional(),
        })
      )
      .optional(),
    selectedServices: Joi.array()
      .items(
        Joi.object({
          serviceId: Joi.string().pattern(objectIdPattern).required(),
        })
      )
      .optional(),
    numberOfCoats: Joi.number().min(1).max(5).optional(),
    notes: Joi.string().trim().max(1000).allow('').optional(),
    // Client restoration specific inputs
    floorArea: Joi.number().min(0).optional(),
    floorProductionRate: Joi.number().min(1).optional(),
    restorationDetails: Joi.object().optional(),
    woodSpecies: Joi.string().allow('').optional(),
    accessType: Joi.string().allow('').optional(),
    coatingType: Joi.string().allow('').optional(),
    coatingConfidence: Joi.string().allow('').optional(),
    conditionFlags: Joi.alternatives().try(Joi.array(), Joi.object()).optional(),
    railingLength: Joi.number().min(0).optional(),
    railingStyle: Joi.string().allow('').optional(),
    stairCount: Joi.number().min(0).optional(),
    fasciaLength: Joi.number().min(0).optional(),
    pergolaLength: Joi.number().min(0).optional(),
    sidingArea: Joi.number().min(0).optional(),
    includeJoists: Joi.boolean().optional(),
    services: Joi.array().items(Joi.string().allow('')).optional(),
    damageConditions: Joi.alternatives().try(Joi.array(), Joi.object()).optional(),
    stainType: Joi.string().allow('').optional(),
    sandingType: Joi.string().allow('').optional(),
    exactHeightFt: Joi.number().allow(null).optional(),
    crackBoardCount: Joi.number().min(0).allow(null).optional(),
    rottedBoardCount: Joi.number().min(0).allow(null).optional(),
    warpedBoardCount: Joi.number().min(0).allow(null).optional(),
    looseBoardCount: Joi.number().min(0).allow(null).optional(),
    waterDamagedBoardCount: Joi.number().min(0).allow(null).optional(),
    crackLooseOverlapCount: Joi.number().min(0).allow(null).optional(),
    railingSqft: Joi.number().min(0).allow(null).optional(),
    stairSqft: Joi.number().min(0).allow(null).optional(),
    pergolaSqft: Joi.number().min(0).allow(null).optional(),
    privacyWallSqft: Joi.number().min(0).allow(null).optional(),
    sidingSqft: Joi.number().min(0).allow(null).optional(),
    fasciaSqft: Joi.number().min(0).allow(null).optional(),
    joistsSqft: Joi.number().min(0).allow(null).optional(),
    postCount: Joi.number().min(0).allow(null).optional(),
    billingRate: Joi.number().min(0).optional(),
    customPrices: Joi.object().optional(),
    isCoatingIncomplete: Joi.boolean().optional(),
  }).unknown(true),
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
