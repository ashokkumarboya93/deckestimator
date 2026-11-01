// =============================================
// Deck Estimator — Users Validation Schemas
// =============================================

const Joi = require('joi');

const updateProfileSchema = {
  body: Joi.object({
    fullName: Joi.string().trim().min(2).max(100).optional(),
    phone: Joi.string().trim().allow('').max(20).optional(),
  }).min(1),
};

module.exports = {
  updateProfileSchema,
};
