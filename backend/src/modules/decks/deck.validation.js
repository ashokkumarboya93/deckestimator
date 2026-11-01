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
      .valid('rectangle', 'square', 'l_shaped', 'custom', 'other')
      .default('rectangle'),
    structureDetails: Joi.object({
      levels: Joi.number().integer().min(1).max(5).default(1),
      isAttached: Joi.boolean().default(true),
      hasRailings: Joi.boolean().default(false),
      railingLength: Joi.number().min(0).default(0),
      hasStairs: Joi.boolean().default(false),
      stairStepCount: Joi.number().integer().min(0).default(0),
      builtInFeatures: Joi.array().items(Joi.string().trim()).default([]),
      structureNotes: Joi.string().trim().max(500).allow('').optional(),
    }).optional(),
    surfaceDetails: Joi.object({
      material: Joi.string().valid('wood', 'composite', 'other', 'unknown').default('wood'),
      coatingStatus: Joi.string().valid('none', 'painted', 'stained', 'sealed', 'unknown').default('none'),
      previousTreatment: Joi.string().trim().allow('').max(200).optional(),
      surfaceDescription: Joi.string().trim().max(500).allow('').optional(),
    }).optional(),
    visibleConditions: Joi.array()
      .items(
        Joi.string().valid(
          'peeling_coating',
          'discoloration',
          'surface_wear',
          'wood_damage',
          'cracks',
          'mold_mildew',
          'other',
          'not_sure'
        )
      )
      .default([]),
    additionalNotes: Joi.string().trim().max(1000).allow('').optional(),
    completionStatus: Joi.string().valid('draft', 'complete', 'archived').default('draft'),
  }),
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
    deckShape: Joi.string().valid('rectangle', 'square', 'l_shaped', 'custom', 'other').optional(),
    structureDetails: Joi.object({
      levels: Joi.number().integer().min(1).max(5).optional(),
      isAttached: Joi.boolean().optional(),
      hasRailings: Joi.boolean().optional(),
      railingLength: Joi.number().min(0).optional(),
      hasStairs: Joi.boolean().optional(),
      stairStepCount: Joi.number().integer().min(0).optional(),
      builtInFeatures: Joi.array().items(Joi.string().trim()).optional(),
      structureNotes: Joi.string().trim().max(500).allow('').optional(),
    }).optional(),
    surfaceDetails: Joi.object({
      material: Joi.string().valid('wood', 'composite', 'other', 'unknown').optional(),
      coatingStatus: Joi.string().valid('none', 'painted', 'stained', 'sealed', 'unknown').optional(),
      previousTreatment: Joi.string().trim().allow('').max(200).optional(),
      surfaceDescription: Joi.string().trim().max(500).allow('').optional(),
    }).optional(),
    visibleConditions: Joi.array()
      .items(
        Joi.string().valid(
          'peeling_coating',
          'discoloration',
          'surface_wear',
          'wood_damage',
          'cracks',
          'mold_mildew',
          'other',
          'not_sure'
        )
      )
      .optional(),
    additionalNotes: Joi.string().trim().max(1000).allow('').optional(),
    completionStatus: Joi.string().valid('draft', 'complete', 'archived').optional(),
  }).min(1),
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
