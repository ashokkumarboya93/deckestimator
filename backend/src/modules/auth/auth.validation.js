// =============================================
// Deck Estimator — Auth Validation Schemas
// =============================================

const Joi = require('joi');
const { ROLES } = require('../../shared/constants');

// Allowed registration roles from public API (ADMIN is NOT allowed via public signup)
const publicRoles = [ROLES.CUSTOMER, ROLES.CONTRACTOR];

const registerSchema = {
  body: Joi.object({
    fullName: Joi.string().trim().min(2).max(100).required().messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 2 characters',
    }),
    email: Joi.string().trim().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
    }),
    password: Joi.string().min(8).max(128).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
    }),
    role: Joi.string()
      .valid(...publicRoles)
      .default(ROLES.CUSTOMER)
      .messages({
        'any.only': 'Role must be either customer or contractor',
      }),
    phone: Joi.string().trim().allow('').max(20).optional(),

    // Contractor specific fields (required if role is contractor)
    businessName: Joi.when('role', {
      is: ROLES.CONTRACTOR,
      then: Joi.string().trim().min(2).max(150).required().messages({
        'string.empty': 'Business name is required for contractors',
      }),
      otherwise: Joi.forbidden(),
    }),
    licenseNumber: Joi.when('role', {
      is: ROLES.CONTRACTOR,
      then: Joi.string().trim().min(2).max(100).required().messages({
        'string.empty': 'License number is required for contractors',
      }),
      otherwise: Joi.forbidden(),
    }),
    licenseJurisdiction: Joi.when('role', {
      is: ROLES.CONTRACTOR,
      then: Joi.string().trim().allow('').max(100).optional(),
      otherwise: Joi.forbidden(),
    }),
  }),
};

const loginSchema = {
  body: Joi.object({
    email: Joi.string().trim().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
    }),
  }),
};

module.exports = {
  registerSchema,
  loginSchema,
};
