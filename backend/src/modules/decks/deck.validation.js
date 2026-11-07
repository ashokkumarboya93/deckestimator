// =============================================
// Deck Estimator — Deck Validation Schemas
// =============================================

const Joi = require('joi');

const createDeckSchema = {
  body: Joi.object({
    projectName: Joi.string().trim().min(2).max(120).required().messages({
      'string.empty': 'Project name is required',
      'string.min': 'Project name must be at least 2 characters',
    }),
    projectDescription: Joi.string().trim().max(1000).allow('').optional(),
    propertyAddress: Joi.object({
      street: Joi.string().trim().allow('').max(200).optional(),
      city: Joi.string().trim().allow('').max(100).optional(),
      state: Joi.string().trim().allow('').max(50).optional(),
      zipCode: Joi.string().trim().allow('').max(20).optional(),
      country: Joi.string().trim().allow('').max(50).default('USA'),
    }).optional(),
    measurementUnit: Joi.string().valid('ft', 'm').default('ft'),
    dimensions: Joi.object({
      length: Joi.number().positive().max(1000).allow(null).optional(),
      width: Joi.number().positive().max(1000).allow(null).optional(),
      area: Joi.number().positive().max(1000000).allow(null).optional(),
      isManualArea: Joi.boolean().default(false),
    }).optional(),
    deckShape: Joi.string()
      .valid('rectangle', 'square', 'l_shaped', 'multi_level', 'custom', 'other')
      .default('rectangle'),
    structureDetails: Joi.object({
      levels: Joi.number().integer().min(1).max(5).default(1),
      height: Joi.string().allow('').optional(),
      exactHeightFt: Joi.number().min(0).allow(null).optional(),
      isAttached: Joi.boolean().default(true),
      hasRailings: Joi.boolean().default(false),
      railingLength: Joi.number().min(0).default(0),
      railingSqft: Joi.number().min(0).default(0),
      hasStairs: Joi.boolean().default(false),
      stairStepCount: Joi.number().integer().min(0).default(0),
      stairSqft: Joi.number().min(0).default(0),
      hasPergola: Joi.boolean().default(false),
      pergolaSqft: Joi.number().min(0).default(0),
      hasPrivacyWall: Joi.boolean().default(false),
      privacyWallSqft: Joi.number().min(0).default(0),
      hasSiding: Joi.boolean().default(false),
      sidingSqft: Joi.number().min(0).default(0),
      hasFascia: Joi.boolean().default(false),
      fasciaSqft: Joi.number().min(0).default(0),
      includeJoists: Joi.boolean().default(false),
      joistsSqft: Joi.number().min(0).default(0),
      builtInFeatures: Joi.array().items(Joi.string().trim()).default([]),
      structureNotes: Joi.string().trim().max(500).allow('').optional(),
    }).unknown(true).optional(),
    surfaceDetails: Joi.object({
      material: Joi.string().default('wood'),
      woodSpecies: Joi.string().allow('').optional(),
      coatingStatus: Joi.string().default('none'),
      previousTreatment: Joi.string().trim().allow('').max(200).optional(),
      surfaceDescription: Joi.string().trim().max(500).allow('').optional(),
    }).unknown(true).optional(),
    visibleConditions: Joi.array().items(Joi.string().trim()).default([]),
    additionalNotes: Joi.string().trim().max(1000).allow('').optional(),
    completionStatus: Joi.string().valid('draft', 'complete', 'archived').default('draft'),
    images: Joi.array().optional(),
    ownerId: Joi.forbidden().messages({
      'any.unknown': 'Setting or modifying ownerId is forbidden.',
    }),
  }).unknown(true),
};

const updateDeckSchema = {
  params: Joi.object({
    deckId: Joi.string().hex().length(24).required().messages({
      'string.length': 'Invalid deck identifier format',
    }),
  }),
  body: Joi.object({
    projectName: Joi.string().trim().min(2).max(120).optional(),
    projectDescription: Joi.string().trim().max(1000).allow('').optional(),
    propertyAddress: Joi.object({
      street: Joi.string().trim().allow('').max(200).optional(),
      city: Joi.string().trim().allow('').max(100).optional(),
      state: Joi.string().trim().allow('').max(50).optional(),
      zipCode: Joi.string().trim().allow('').max(20).optional(),
      country: Joi.string().trim().allow('').max(50).optional(),
    }).optional(),
    measurementUnit: Joi.string().valid('ft', 'm').optional(),
    dimensions: Joi.object({
      length: Joi.number().positive().max(1000).allow(null).optional(),
      width: Joi.number().positive().max(1000).allow(null).optional(),
      area: Joi.number().positive().max(1000000).allow(null).optional(),
      isManualArea: Joi.boolean().optional(),
    }).optional(),
    deckShape: Joi.string().valid('rectangle', 'square', 'l_shaped', 'multi_level', 'custom', 'other').optional(),
    structureDetails: Joi.object().unknown(true).optional(),
    surfaceDetails: Joi.object().unknown(true).optional(),
    visibleConditions: Joi.array().items(Joi.string().trim()).optional(),
    additionalNotes: Joi.string().trim().max(1000).allow('').optional(),
    completionStatus: Joi.string().valid('draft', 'complete', 'archived').optional(),
    images: Joi.array().optional(),
    ownerId: Joi.forbidden().messages({
      'any.unknown': 'Setting or modifying ownerId is forbidden.',
    }),
  }).min(1).unknown(true),
};

const deckIdParamSchema = {
  params: Joi.object({
    deckId: Joi.string().hex().length(24).required().messages({
      'string.length': 'Invalid deck identifier format',
    }),
  }),
};

module.exports = {
  createDeckSchema,
  updateDeckSchema,
  deckIdParamSchema,
};

