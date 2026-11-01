// =============================================
// Deck Estimator — Condition Analysis Validation (Phase 7)
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

const deckIdParamSchema = {
  params: Joi.object({
    deckId: Joi.string().pattern(objectIdPattern).required().messages({
      'string.pattern.base': 'deckId must be a valid 24-character hexadecimal ObjectId',
    }),
  }),
};

const createAnalysisSchema = {
  params: Joi.object({
    deckId: Joi.string().pattern(objectIdPattern).required(),
  }),
  body: Joi.object({
    imageId: Joi.string().pattern(objectIdPattern).optional(),
    notes: Joi.string().trim().max(1000).allow('').optional(),
  }).unknown(false),
};

const updateReviewSchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required(),
  }),
  body: Joi.object({
    reviewStatus: Joi.string().valid('PENDING', 'RESOLVED').required(),
    reviewNotes: Joi.string().trim().max(1000).allow('').optional(),
    conditionLevel: Joi.number().valid(1, 2, 3, 4, 5).optional(),
    conditionLabel: Joi.string()
      .valid('GOOD', 'MILD_WEAR', 'MODERATE_DETERIORATION', 'SEVERE_DETERIORATION', 'SIGNIFICANT_WOOD_DAMAGE')
      .optional(),
  }).unknown(false),
};

module.exports = {
  idParamSchema,
  deckIdParamSchema,
  createAnalysisSchema,
  updateReviewSchema,
};
