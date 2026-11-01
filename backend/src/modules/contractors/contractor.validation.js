// =============================================
// Deck Estimator — Contractor Validation Schemas (Phase 8)
// =============================================

const Joi = require('joi');
const {
  VERIFICATION_DOCUMENT_TYPES,
} = require('../../shared/constants');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const updateProfileSchema = Joi.object({
  businessName: Joi.string().trim().max(150),
  businessPhone: Joi.string().trim().max(30).allow(''),
  businessEmail: Joi.string().email().trim().allow(''),
  website: Joi.string().uri().trim().allow(''),
  businessDescription: Joi.string().trim().max(1000).allow(''),
  yearsOfExperience: Joi.number().min(0).max(100),
  servicesOffered: Joi.array().items(Joi.string().pattern(objectIdRegex)),
  supportedSurfaceTypes: Joi.array().items(Joi.string().trim()),
  serviceAreas: Joi.array().items(
    Joi.object({
      city: Joi.string().trim().allow(''),
      state: Joi.string().trim().allow(''),
      postalCode: Joi.string().trim().allow(''),
      country: Joi.string().trim().default('USA'),
    })
  ),
  businessAddress: Joi.object({
    street: Joi.string().trim().allow(''),
    city: Joi.string().trim().allow(''),
    state: Joi.string().trim().allow(''),
    zipCode: Joi.string().trim().allow(''),
    country: Joi.string().trim().default('USA'),
  }),
}).min(1);

const submitVerificationSchema = Joi.object({
  notes: Joi.string().trim().max(1000).allow(''),
});

const adminReviewVerificationSchema = Joi.object({
  action: Joi.string()
    .valid(
      'START_REVIEW',
      'APPROVE',
      'REJECT',
      'REQUEST_INFORMATION',
      'SUSPEND',
      'REACTIVATE'
    )
    .required(),
  reason: Joi.when('action', {
    is: Joi.valid('REJECT', 'REQUEST_INFORMATION', 'SUSPEND'),
    then: Joi.string().trim().min(5).max(1000).required(),
    otherwise: Joi.string().trim().max(1000).allow(''),
  }),
  notes: Joi.string().trim().max(1000).allow(''),
});

const uploadDocumentSchema = Joi.object({
  documentType: Joi.string()
    .valid(...Object.values(VERIFICATION_DOCUMENT_TYPES))
    .required(),
  notes: Joi.string().trim().max(500).allow(''),
});

module.exports = {
  updateProfileSchema,
  submitVerificationSchema,
  adminReviewVerificationSchema,
  uploadDocumentSchema,
};

