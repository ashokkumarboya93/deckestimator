// =============================================
// Deck Estimator — Admin Management Validation Schemas (Phase 10)
// =============================================

const Joi = require('joi');
const { ROLES, ACCOUNT_STATUS } = require('../../shared/constants');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// User update schema
const updateUserSchema = Joi.object({
  fullName: Joi.string().trim().max(100).optional(),
  phone: Joi.string().trim().allow('').max(30).optional(),
  role: Joi.string().valid(...Object.values(ROLES)).optional(),
  accountStatus: Joi.string().valid(...Object.values(ACCOUNT_STATUS)).optional(),
  statusReason: Joi.string().trim().max(300).allow('').optional(),
}).min(1);

// User status change schema
const updateUserStatusSchema = Joi.object({
  accountStatus: Joi.string().valid(...Object.values(ACCOUNT_STATUS)).required(),
  reason: Joi.string().trim().max(300).allow('').optional(),
});

// Admin create user schema (for approved admin onboarding)
const createUserSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(128).required(),
  phone: Joi.string().trim().allow('').max(30).optional(),
  role: Joi.string().valid(...Object.values(ROLES)).default(ROLES.CUSTOMER),
  accountStatus: Joi.string().valid(...Object.values(ACCOUNT_STATUS)).default(ACCOUNT_STATUS.ACTIVE),
});

// Platform setting create schema
const createSettingSchema = Joi.object({
  key: Joi.string().trim().uppercase().min(3).max(60).required(),
  category: Joi.string().valid('GENERAL', 'ESTIMATE', 'UPLOAD', 'NOTIFICATION', 'BUSINESS', 'SECURITY').required(),
  label: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().max(500).allow('').optional(),
  valueType: Joi.string().valid('STRING', 'NUMBER', 'BOOLEAN', 'OBJECT', 'ARRAY', 'JSON').required(),
  value: Joi.any().required(),
  isPublic: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
});

// Platform setting update schema
const updateSettingSchema = Joi.object({
  value: Joi.any().optional(),
  label: Joi.string().trim().max(120).optional(),
  description: Joi.string().trim().max(500).allow('').optional(),
  isPublic: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

// Platform setting status schema
const updateSettingStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

module.exports = {
  updateUserSchema,
  updateUserStatusSchema,
  createUserSchema,
  createSettingSchema,
  updateSettingSchema,
  updateSettingStatusSchema,
};

