// =============================================
// Deck Estimator — Catalog Validation Schemas
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

// ---------------------------------------------
// MATERIAL CATEGORY SCHEMAS
// ---------------------------------------------
const createMaterialCategorySchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters',
    }),
    description: Joi.string().trim().max(500).allow('').optional(),
    displayOrder: Joi.number().integer().min(0).default(0),
    status: Joi.string().valid('active', 'inactive').default('active'),
  }).unknown(false),
};

const updateMaterialCategorySchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    description: Joi.string().trim().max(500).allow('').optional(),
    displayOrder: Joi.number().integer().min(0).optional(),
    status: Joi.string().valid('active', 'inactive', 'archived').optional(),
  }).min(1).unknown(false),
};

// ---------------------------------------------
// MATERIAL SCHEMAS
// ---------------------------------------------
const createMaterialSchema = {
  body: Joi.object({
    materialName: Joi.string().trim().min(2).max(150).required().messages({
      'string.empty': 'Material name is required',
    }),
    materialCode: Joi.string().trim().min(3).max(50).uppercase().optional(),
    description: Joi.string().trim().max(2000).allow('').optional(),
    categoryId: Joi.string().pattern(objectIdPattern).required().messages({
      'string.empty': 'Valid categoryId is required',
      'string.pattern.base': 'categoryId must be a valid ObjectId',
    }),
    materialType: Joi.string()
      .valid(
        'stain',
        'paint',
        'coating',
        'sealer',
        'primer',
        'cleaner',
        'surface_preparation',
        'repair_material',
        'other'
      )
      .required(),
    brandName: Joi.string().trim().max(100).allow('').optional(),
    productName: Joi.string().trim().max(150).allow('').optional(),
    productModel: Joi.string().trim().max(100).allow('').optional(),
    productImage: Joi.string().trim().allow('').optional(),
    technicalDocument: Joi.string().trim().allow('').optional(),
    compatibleSurfaces: Joi.array()
      .items(Joi.string().valid('wood', 'composite', 'other'))
      .default(['wood']),
    specifications: Joi.object({
      baseType: Joi.string().trim().allow('').optional(),
      applicationMethod: Joi.string().trim().allow('').optional(),
      finishType: Joi.string().trim().allow('').optional(),
      colors: Joi.array().items(Joi.string().trim()).optional(),
      dryingTime: Joi.number().min(0).allow(null).optional(),
      recommendedCoats: Joi.number().min(1).allow(null).optional(),
      uvResistance: Joi.boolean().optional(),
      waterResistance: Joi.boolean().optional(),
      weatherResistance: Joi.boolean().optional(),
      additionalSpecifications: Joi.object().optional(),
    }).optional(),
    measurement: Joi.object({
      quantityUnit: Joi.string()
        .valid(
          'gallon',
          'liter',
          'quart',
          'milliliter',
          'kilogram',
          'pound',
          'piece',
          'pack',
          'square_foot',
          'square_meter'
        )
        .default('gallon'),
    }).optional(),
    coverage: Joi.object({
      coverageValue: Joi.number().positive().allow(null).optional(),
      coverageAreaUnit: Joi.string().valid('square_foot', 'square_meter').default('square_foot'),
      coverageQuantity: Joi.number().positive().default(1),
      coverageQuantityUnit: Joi.string().default('gallon'),
      coverageNotes: Joi.string().trim().max(500).allow('').optional(),
    }).optional(),
    cost: Joi.object({
      unitCost: Joi.number().min(0).allow(null).optional(),
      currency: Joi.string().trim().uppercase().max(5).default('USD'),
      costUnit: Joi.string().default('gallon'),
      costNotes: Joi.string().trim().max(500).allow('').optional(),
    }).optional(),
    status: Joi.string().valid('active', 'inactive', 'archived').default('active'),
  }).unknown(false),
};

const updateMaterialSchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required(),
  }),
  body: Joi.object({
    materialName: Joi.string().trim().min(2).max(150).optional(),
    materialCode: Joi.forbidden().messages({
      'any.unknown': 'Material code cannot be altered after creation',
    }),
    description: Joi.string().trim().max(2000).allow('').optional(),
    categoryId: Joi.string().pattern(objectIdPattern).optional(),
    materialType: Joi.string()
      .valid(
        'stain',
        'paint',
        'coating',
        'sealer',
        'primer',
        'cleaner',
        'surface_preparation',
        'repair_material',
        'other'
      )
      .optional(),
    brandName: Joi.string().trim().max(100).allow('').optional(),
    productName: Joi.string().trim().max(150).allow('').optional(),
    productModel: Joi.string().trim().max(100).allow('').optional(),
    productImage: Joi.string().trim().allow('').optional(),
    technicalDocument: Joi.string().trim().allow('').optional(),
    compatibleSurfaces: Joi.array()
      .items(Joi.string().valid('wood', 'composite', 'other'))
      .optional(),
    specifications: Joi.object({
      baseType: Joi.string().trim().allow('').optional(),
      applicationMethod: Joi.string().trim().allow('').optional(),
      finishType: Joi.string().trim().allow('').optional(),
      colors: Joi.array().items(Joi.string().trim()).optional(),
      dryingTime: Joi.number().min(0).allow(null).optional(),
      recommendedCoats: Joi.number().min(1).allow(null).optional(),
      uvResistance: Joi.boolean().optional(),
      waterResistance: Joi.boolean().optional(),
      weatherResistance: Joi.boolean().optional(),
      additionalSpecifications: Joi.object().optional(),
    }).optional(),
    measurement: Joi.object({
      quantityUnit: Joi.string()
        .valid(
          'gallon',
          'liter',
          'quart',
          'milliliter',
          'kilogram',
          'pound',
          'piece',
          'pack',
          'square_foot',
          'square_meter'
        )
        .optional(),
    }).optional(),
    coverage: Joi.object({
      coverageValue: Joi.number().positive().allow(null).optional(),
      coverageAreaUnit: Joi.string().valid('square_foot', 'square_meter').optional(),
      coverageQuantity: Joi.number().positive().optional(),
      coverageQuantityUnit: Joi.string().optional(),
      coverageNotes: Joi.string().trim().max(500).allow('').optional(),
    }).optional(),
    cost: Joi.object({
      unitCost: Joi.number().min(0).allow(null).optional(),
      currency: Joi.string().trim().uppercase().max(5).optional(),
      costUnit: Joi.string().optional(),
      costNotes: Joi.string().trim().max(500).allow('').optional(),
    }).optional(),
    status: Joi.string().valid('active', 'inactive', 'archived').optional(),
  }).min(1).unknown(false),
};

// ---------------------------------------------
// SERVICE CATEGORY SCHEMAS
// ---------------------------------------------
const createServiceCategorySchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      'string.empty': 'Service category name is required',
    }),
    description: Joi.string().trim().max(500).allow('').optional(),
    displayOrder: Joi.number().integer().min(0).default(0),
    status: Joi.string().valid('active', 'inactive').default('active'),
  }).unknown(false),
};

const updateServiceCategorySchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    description: Joi.string().trim().max(500).allow('').optional(),
    displayOrder: Joi.number().integer().min(0).optional(),
    status: Joi.string().valid('active', 'inactive', 'archived').optional(),
  }).min(1).unknown(false),
};

// ---------------------------------------------
// SERVICE SCHEMAS
// ---------------------------------------------
const createServiceSchema = {
  body: Joi.object({
    serviceName: Joi.string().trim().min(2).max(150).required().messages({
      'string.empty': 'Service name is required',
    }),
    serviceCode: Joi.string().trim().min(3).max(50).uppercase().optional(),
    description: Joi.string().trim().max(2000).allow('').optional(),
    categoryId: Joi.string().pattern(objectIdPattern).required().messages({
      'string.empty': 'Valid categoryId is required',
    }),
    serviceType: Joi.string()
      .valid(
        'cleaning',
        'preparation',
        'repair',
        'staining',
        'painting',
        'coating',
        'sealing',
        'maintenance',
        'other'
      )
      .required(),
    measurement: Joi.object({
      unit: Joi.string()
        .valid(
          'square_foot',
          'square_meter',
          'linear_foot',
          'linear_meter',
          'hour',
          'day',
          'piece',
          'fixed_job'
        )
        .default('square_foot'),
    }).optional(),
    operationalDetails: Joi.object({
      estimatedDuration: Joi.number().min(0).allow(null).optional(),
      durationUnit: Joi.string().valid('minute', 'hour', 'day').default('hour'),
      laborNotes: Joi.string().trim().max(1000).allow('').optional(),
      requiredEquipment: Joi.array().items(Joi.string().trim()).optional(),
      preparationInstructions: Joi.string().trim().max(1000).allow('').optional(),
      safetyNotes: Joi.string().trim().max(1000).allow('').optional(),
    }).optional(),
    serviceImage: Joi.string().trim().allow('').optional(),
    status: Joi.string().valid('active', 'inactive', 'archived').default('active'),
  }).unknown(false),
};

const updateServiceSchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required(),
  }),
  body: Joi.object({
    serviceName: Joi.string().trim().min(2).max(150).optional(),
    serviceCode: Joi.forbidden().messages({
      'any.unknown': 'Service code cannot be altered after creation',
    }),
    description: Joi.string().trim().max(2000).allow('').optional(),
    categoryId: Joi.string().pattern(objectIdPattern).optional(),
    serviceType: Joi.string()
      .valid(
        'cleaning',
        'preparation',
        'repair',
        'staining',
        'painting',
        'coating',
        'sealing',
        'maintenance',
        'other'
      )
      .optional(),
    measurement: Joi.object({
      unit: Joi.string()
        .valid(
          'square_foot',
          'square_meter',
          'linear_foot',
          'linear_meter',
          'hour',
          'day',
          'piece',
          'fixed_job'
        )
        .optional(),
    }).optional(),
    operationalDetails: Joi.object({
      estimatedDuration: Joi.number().min(0).allow(null).optional(),
      durationUnit: Joi.string().valid('minute', 'hour', 'day').optional(),
      laborNotes: Joi.string().trim().max(1000).allow('').optional(),
      requiredEquipment: Joi.array().items(Joi.string().trim()).optional(),
      preparationInstructions: Joi.string().trim().max(1000).allow('').optional(),
      safetyNotes: Joi.string().trim().max(1000).allow('').optional(),
    }).optional(),
    serviceImage: Joi.string().trim().allow('').optional(),
    status: Joi.string().valid('active', 'inactive', 'archived').optional(),
  }).min(1).unknown(false),
};

// ---------------------------------------------
// COMPATIBILITY SCHEMAS
// ---------------------------------------------
const createCompatibilitySchema = {
  body: Joi.object({
    materialId: Joi.string().pattern(objectIdPattern).required().messages({
      'string.empty': 'Valid materialId is required',
    }),
    serviceId: Joi.string().pattern(objectIdPattern).required().messages({
      'string.empty': 'Valid serviceId is required',
    }),
    compatibilityStatus: Joi.string()
      .valid('compatible', 'incompatible', 'requires_review')
      .default('compatible'),
    compatibilityNotes: Joi.string().trim().max(1000).allow('').optional(),
  }).unknown(false),
};

const updateCompatibilitySchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required(),
  }),
  body: Joi.object({
    compatibilityStatus: Joi.string()
      .valid('compatible', 'incompatible', 'requires_review')
      .optional(),
    compatibilityNotes: Joi.string().trim().max(1000).allow('').optional(),
  }).min(1).unknown(false),
};

// ---------------------------------------------
// STATUS TOGGLE SCHEMA
// ---------------------------------------------
const toggleStatusSchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required(),
  }),
  body: Joi.object({
    status: Joi.string().valid('active', 'inactive', 'archived').required(),
  }).unknown(false),
};

module.exports = {
  idParamSchema,
  createMaterialCategorySchema,
  updateMaterialCategorySchema,
  createMaterialSchema,
  updateMaterialSchema,
  createServiceCategorySchema,
  updateServiceCategorySchema,
  createServiceSchema,
  updateServiceSchema,
  createCompatibilitySchema,
  updateCompatibilitySchema,
  toggleStatusSchema,
};

