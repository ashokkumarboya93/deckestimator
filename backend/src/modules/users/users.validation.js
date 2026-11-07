// =============================================
// Deck Estimator — Users Validation Schemas
// =============================================

const Joi = require('joi');

const updateProfileSchema = {
  body: Joi.object({
    fullName: Joi.string().trim().min(2).max(100).optional(),
    phone: Joi.string().trim().allow('').max(25).optional(),
    avatar: Joi.string().allow('').optional(),
    address: Joi.object({
      street: Joi.string().allow('').trim().optional(),
      city: Joi.string().allow('').trim().optional(),
      state: Joi.string().allow('').trim().optional(),
      zipCode: Joi.string().allow('').trim().optional(),
      country: Joi.string().allow('').trim().optional(),
    }).optional(),
    preferredContactMethod: Joi.string().valid('email', 'phone', 'sms').optional(),
    currentPassword: Joi.string().min(6).optional(),
    newPassword: Joi.string().min(6).optional(),
  }).min(1),
};

module.exports = {
  updateProfileSchema,
};
