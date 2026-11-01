// =============================================
// Deck Estimator — Catalog Service
// =============================================

const crypto = require('crypto');
const MaterialCategory = require('./materialCategory.model');
const Material = require('./material.model');
const ServiceCategory = require('./serviceCategory.model');
const Service = require('./service.model');
const MaterialServiceCompatibility = require('./materialServiceCompatibility.model');
const AuditLog = require('../../shared/models/auditLog.model');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require('../../shared/errors');
const { ROLES } = require('../../shared/constants');

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Record an audit log entry for administrative catalog operations.
 */
async function recordAuditLog({
  performedBy,
  action,
  entityType,
  entityId,
  oldValue = null,
  newValue = null,
  ipAddress = null,
}) {
  try {
    await AuditLog.create({
      performedBy,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress,
    });
  } catch (err) {
    // Audit logging should not crash the primary operational request
    console.error('[AuditLog] Warning: Failed to record audit log:', err.message);
  }
}

// =============================================
// 1. MATERIAL CATEGORIES
// =============================================

async function createMaterialCategory(data, user, ipAddress) {
  const existingName = await MaterialCategory.findOne({
    name: new RegExp(`^${escapeRegex(data.name.trim())}$`, 'i'),
  });
  if (existingName) {
    throw new ConflictError(`Material category "${data.name}" already exists.`);
  }

  const slug = slugify(data.name);
  const existingSlug = await MaterialCategory.findOne({ slug });
  if (existingSlug) {
    throw new ConflictError(`Category slug "${slug}" already exists. Please choose a different name.`);
  }

  const category = await MaterialCategory.create({
    ...data,
    slug,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await recordAuditLog({
    performedBy: user.id,
    action: 'CREATE_MATERIAL_CATEGORY',
    entityType: 'MATERIAL',
    entityId: category._id,
    newValue: category.toJSON(),
    ipAddress,
  });

  return category.toJSON();
}

async function getMaterialCategories(query = {}, user = null) {
  const { page = 1, limit = 20, search, status } = query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: new RegExp(escapeRegex(search), 'i') },
      { description: new RegExp(escapeRegex(search), 'i') },
    ];
  }

  if (status) {
    filter.status = status;
  } else if (!user || user.role !== ROLES.ADMIN) {
    filter.status = 'active';
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

  const [categories, total] = await Promise.all([
    MaterialCategory.find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .skip(skip)
      .limit(Number(limit)),
    MaterialCategory.countDocuments(filter),
  ]);

  // Include material counts
  const categoryIds = categories.map((c) => c._id);
  const counts = await Material.aggregate([
    { $match: { categoryId: { $in: categoryIds }, status: { $ne: 'archived' } } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ]);

  const countMap = counts.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr.count;
    return acc;
  }, {});

  const items = categories.map((c) => {
    const json = c.toJSON();
    json.materialsCount = countMap[c._id.toString()] || 0;
    return json;
  });

  return {
    categories: items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getMaterialCategoryById(id) {
  const category = await MaterialCategory.findById(id);
  if (!category) {
    throw new NotFoundError('Material category not found.');
  }
  const materialsCount = await Material.countDocuments({
    categoryId: id,
    status: { $ne: 'archived' },
  });
  const result = category.toJSON();
  result.materialsCount = materialsCount;
  return result;
}

async function updateMaterialCategory(id, updateData, user, ipAddress) {
  const category = await MaterialCategory.findById(id);
  if (!category) {
    throw new NotFoundError('Material category not found.');
  }

  const oldValues = category.toJSON();

  if (updateData.name && updateData.name.trim().toLowerCase() !== category.name.toLowerCase()) {
    const existing = await MaterialCategory.findOne({
      _id: { $ne: id },
      name: new RegExp(`^${escapeRegex(updateData.name.trim())}$`, 'i'),
    });
    if (existing) {
      throw new ConflictError(`Material category "${updateData.name}" already exists.`);
    }
    updateData.slug = slugify(updateData.name);
  }

  Object.assign(category, updateData, { updatedBy: user.id });
  await category.save();

  await recordAuditLog({
    performedBy: user.id,
    action: 'UPDATE_MATERIAL_CATEGORY',
    entityType: 'MATERIAL',
    entityId: category._id,
    oldValue: oldValues,
    newValue: category.toJSON(),
    ipAddress,
  });

  return category.toJSON();
}

async function toggleMaterialCategoryStatus(id, status, user, ipAddress) {
  const category = await MaterialCategory.findById(id);
  if (!category) {
    throw new NotFoundError('Material category not found.');
  }

  const oldValues = { status: category.status };
  category.status = status;
  category.updatedBy = user.id;
  await category.save();

  await recordAuditLog({
    performedBy: user.id,
    action: `MATERIAL_CATEGORY_${status.toUpperCase()}`,
    entityType: 'MATERIAL',
    entityId: category._id,
    oldValue: oldValues,
    newValue: { status },
    ipAddress,
  });

  return category.toJSON();
}

// =============================================
// 2. MATERIALS
// =============================================

async function createMaterial(data, user, ipAddress) {
  // Validate category
  const category = await MaterialCategory.findById(data.categoryId);
  if (!category) {
    throw new BadRequestError('Referenced material category does not exist.');
  }
  if (category.status !== 'active') {
    throw new BadRequestError('Cannot assign materials to an inactive or archived category.');
  }

  // Generate code if missing
  let code = data.materialCode;
  if (!code) {
    const prefix = (data.materialType || 'MAT').substring(0, 5).toUpperCase();
    code = `MAT-${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }

  const existingCode = await Material.findOne({ materialCode: code });
  if (existingCode) {
    throw new ConflictError(`Material code "${code}" already exists.`);
  }

  const material = await Material.create({
    ...data,
    materialCode: code,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await recordAuditLog({
    performedBy: user.id,
    action: 'CREATE_MATERIAL',
    entityType: 'MATERIAL',
    entityId: material._id,
    newValue: material.toJSON(),
    ipAddress,
  });

  return material.toJSON();
}

async function getMaterials(query = {}, user = null) {
  const {
    page = 1,
    limit = 20,
    search,
    categoryId,
    materialType,
    compatibleSurface,
    brandName,
    status,
    sortBy = 'materialName',
    sortOrder = 'asc',
  } = query;

  const filter = {};

  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { materialName: regex },
      { materialCode: regex },
      { brandName: regex },
      { productName: regex },
    ];
  }

  if (categoryId) filter.categoryId = categoryId;
  if (materialType) filter.materialType = materialType;
  if (compatibleSurface) filter.compatibleSurfaces = compatibleSurface;
  if (brandName) filter.brandName = new RegExp(escapeRegex(brandName), 'i');

  if (status) {
    filter.status = status;
  } else if (!user || user.role !== ROLES.ADMIN) {
    filter.status = 'active';
  }

  const sortOptions = {};
  const allowedSortFields = ['materialName', 'materialCode', 'materialType', 'createdAt', 'status'];
  if (allowedSortFields.includes(sortBy)) {
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  } else {
    sortOptions.materialName = 1;
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

  const [materials, total] = await Promise.all([
    Material.find(filter)
      .populate('categoryId', 'name slug status')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit)),
    Material.countDocuments(filter),
  ]);

  return {
    materials: materials.map((m) => m.toJSON()),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getMaterialById(id) {
  const material = await Material.findById(id).populate('categoryId', 'name slug status');
  if (!material) {
    throw new NotFoundError('Material not found.');
  }
  return material.toJSON();
}

async function updateMaterial(id, updateData, user, ipAddress) {
  const material = await Material.findById(id);
  if (!material) {
    throw new NotFoundError('Material not found.');
  }

  const oldValues = material.toJSON();

  if (updateData.categoryId && updateData.categoryId.toString() !== material.categoryId.toString()) {
    const category = await MaterialCategory.findById(updateData.categoryId);
    if (!category || category.status === 'archived') {
      throw new BadRequestError('Referenced material category is invalid or archived.');
    }
  }

  // Update cost timestamp if unitCost changed
  if (updateData.cost && updateData.cost.unitCost !== undefined) {
    updateData.cost.costLastUpdatedAt = new Date();
  }

  delete updateData.materialCode; // Immutable
  delete updateData._id;
  delete updateData.id;

  Object.assign(material, updateData, { updatedBy: user.id });
  await material.save();

  await recordAuditLog({
    performedBy: user.id,
    action: 'UPDATE_MATERIAL',
    entityType: 'MATERIAL',
    entityId: material._id,
    oldValue: oldValues,
    newValue: material.toJSON(),
    ipAddress,
  });

  return material.toJSON();
}

async function toggleMaterialStatus(id, status, user, ipAddress) {
  const material = await Material.findById(id);
  if (!material) {
    throw new NotFoundError('Material not found.');
  }

  const oldValues = { status: material.status };
  material.status = status;
  material.updatedBy = user.id;
  await material.save();

  await recordAuditLog({
    performedBy: user.id,
    action: `MATERIAL_${status.toUpperCase()}`,
    entityType: 'MATERIAL',
    entityId: material._id,
    oldValue: oldValues,
    newValue: { status },
    ipAddress,
  });

  return material.toJSON();
}

// =============================================
// 3. SERVICE CATEGORIES
// =============================================

async function createServiceCategory(data, user, ipAddress) {
  const existingName = await ServiceCategory.findOne({
    name: new RegExp(`^${escapeRegex(data.name.trim())}$`, 'i'),
  });
  if (existingName) {
    throw new ConflictError(`Service category "${data.name}" already exists.`);
  }

  const slug = slugify(data.name);
  const existingSlug = await ServiceCategory.findOne({ slug });
  if (existingSlug) {
    throw new ConflictError(`Category slug "${slug}" already exists.`);
  }

  const category = await ServiceCategory.create({
    ...data,
    slug,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await recordAuditLog({
    performedBy: user.id,
    action: 'CREATE_SERVICE_CATEGORY',
    entityType: 'PRICING',
    entityId: category._id,
    newValue: category.toJSON(),
    ipAddress,
  });

  return category.toJSON();
}

async function getServiceCategories(query = {}, user = null) {
  const { page = 1, limit = 20, search, status } = query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: new RegExp(escapeRegex(search), 'i') },
      { description: new RegExp(escapeRegex(search), 'i') },
    ];
  }

  if (status) {
    filter.status = status;
  } else if (!user || user.role !== ROLES.ADMIN) {
    filter.status = 'active';
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

  const [categories, total] = await Promise.all([
    ServiceCategory.find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .skip(skip)
      .limit(Number(limit)),
    ServiceCategory.countDocuments(filter),
  ]);

  const categoryIds = categories.map((c) => c._id);
  const counts = await Service.aggregate([
    { $match: { categoryId: { $in: categoryIds }, status: { $ne: 'archived' } } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ]);

  const countMap = counts.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr.count;
    return acc;
  }, {});

  const items = categories.map((c) => {
    const json = c.toJSON();
    json.servicesCount = countMap[c._id.toString()] || 0;
    return json;
  });

  return {
    categories: items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getServiceCategoryById(id) {
  const category = await ServiceCategory.findById(id);
  if (!category) {
    throw new NotFoundError('Service category not found.');
  }
  const servicesCount = await Service.countDocuments({
    categoryId: id,
    status: { $ne: 'archived' },
  });
  const result = category.toJSON();
  result.servicesCount = servicesCount;
  return result;
}

async function updateServiceCategory(id, updateData, user, ipAddress) {
  const category = await ServiceCategory.findById(id);
  if (!category) {
    throw new NotFoundError('Service category not found.');
  }

  const oldValues = category.toJSON();

  if (updateData.name && updateData.name.trim().toLowerCase() !== category.name.toLowerCase()) {
    const existing = await ServiceCategory.findOne({
      _id: { $ne: id },
      name: new RegExp(`^${escapeRegex(updateData.name.trim())}$`, 'i'),
    });
    if (existing) {
      throw new ConflictError(`Service category "${updateData.name}" already exists.`);
    }
    updateData.slug = slugify(updateData.name);
  }

  Object.assign(category, updateData, { updatedBy: user.id });
  await category.save();

  await recordAuditLog({
    performedBy: user.id,
    action: 'UPDATE_SERVICE_CATEGORY',
    entityType: 'PRICING',
    entityId: category._id,
    oldValue: oldValues,
    newValue: category.toJSON(),
    ipAddress,
  });

  return category.toJSON();
}

async function toggleServiceCategoryStatus(id, status, user, ipAddress) {
  const category = await ServiceCategory.findById(id);
  if (!category) {
    throw new NotFoundError('Service category not found.');
  }

  const oldValues = { status: category.status };
  category.status = status;
  category.updatedBy = user.id;
  await category.save();

  await recordAuditLog({
    performedBy: user.id,
    action: `SERVICE_CATEGORY_${status.toUpperCase()}`,
    entityType: 'PRICING',
    entityId: category._id,
    oldValue: oldValues,
    newValue: { status },
    ipAddress,
  });

  return category.toJSON();
}

// =============================================
// 4. SERVICES
// =============================================

async function createService(data, user, ipAddress) {
  const category = await ServiceCategory.findById(data.categoryId);
  if (!category) {
    throw new BadRequestError('Referenced service category does not exist.');
  }
  if (category.status !== 'active') {
    throw new BadRequestError('Cannot assign services to an inactive or archived category.');
  }

  let code = data.serviceCode;
  if (!code) {
    const prefix = (data.serviceType || 'SRV').substring(0, 5).toUpperCase();
    code = `SRV-${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }

  const existingCode = await Service.findOne({ serviceCode: code });
  if (existingCode) {
    throw new ConflictError(`Service code "${code}" already exists.`);
  }

  const service = await Service.create({
    ...data,
    serviceCode: code,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await recordAuditLog({
    performedBy: user.id,
    action: 'CREATE_SERVICE',
    entityType: 'PRICING',
    entityId: service._id,
    newValue: service.toJSON(),
    ipAddress,
  });

  return service.toJSON();
}

async function getServices(query = {}, user = null) {
  const {
    page = 1,
    limit = 20,
    search,
    categoryId,
    serviceType,
    measurementUnit,
    status,
    sortBy = 'serviceName',
    sortOrder = 'asc',
  } = query;

  const filter = {};

  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ serviceName: regex }, { serviceCode: regex }];
  }

  if (categoryId) filter.categoryId = categoryId;
  if (serviceType) filter.serviceType = serviceType;
  if (measurementUnit) filter['measurement.unit'] = measurementUnit;

  if (status) {
    filter.status = status;
  } else if (!user || user.role !== ROLES.ADMIN) {
    filter.status = 'active';
  }

  const sortOptions = {};
  const allowedSortFields = ['serviceName', 'serviceCode', 'serviceType', 'createdAt', 'status'];
  if (allowedSortFields.includes(sortBy)) {
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  } else {
    sortOptions.serviceName = 1;
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

  const [services, total] = await Promise.all([
    Service.find(filter)
      .populate('categoryId', 'name slug status')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit)),
    Service.countDocuments(filter),
  ]);

  return {
    services: services.map((s) => s.toJSON()),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getServiceById(id) {
  const service = await Service.findById(id).populate('categoryId', 'name slug status');
  if (!service) {
    throw new NotFoundError('Service not found.');
  }
  return service.toJSON();
}

async function updateService(id, updateData, user, ipAddress) {
  const service = await Service.findById(id);
  if (!service) {
    throw new NotFoundError('Service not found.');
  }

  const oldValues = service.toJSON();

  if (updateData.categoryId && updateData.categoryId.toString() !== service.categoryId.toString()) {
    const category = await ServiceCategory.findById(updateData.categoryId);
    if (!category || category.status === 'archived') {
      throw new BadRequestError('Referenced service category is invalid or archived.');
    }
  }

  delete updateData.serviceCode;
  delete updateData._id;
  delete updateData.id;

  Object.assign(service, updateData, { updatedBy: user.id });
  await service.save();

  await recordAuditLog({
    performedBy: user.id,
    action: 'UPDATE_SERVICE',
    entityType: 'PRICING',
    entityId: service._id,
    oldValue: oldValues,
    newValue: service.toJSON(),
    ipAddress,
  });

  return service.toJSON();
}

async function toggleServiceStatus(id, status, user, ipAddress) {
  const service = await Service.findById(id);
  if (!service) {
    throw new NotFoundError('Service not found.');
  }

  const oldValues = { status: service.status };
  service.status = status;
  service.updatedBy = user.id;
  await service.save();

  await recordAuditLog({
    performedBy: user.id,
    action: `SERVICE_${status.toUpperCase()}`,
    entityType: 'PRICING',
    entityId: service._id,
    oldValue: oldValues,
    newValue: { status },
    ipAddress,
  });

  return service.toJSON();
}

// =============================================
// 5. MATERIAL-SERVICE COMPATIBILITY
// =============================================

async function createCompatibility(data, user, ipAddress) {
  const [material, service] = await Promise.all([
    Material.findById(data.materialId),
    Service.findById(data.serviceId),
  ]);

  if (!material) {
    throw new BadRequestError('Referenced material not found.');
  }
  if (!service) {
    throw new BadRequestError('Referenced service not found.');
  }

  const existingPair = await MaterialServiceCompatibility.findOne({
    materialId: data.materialId,
    serviceId: data.serviceId,
  });
  if (existingPair) {
    throw new ConflictError('A compatibility relationship for this material and service already exists.');
  }

  const compatibility = await MaterialServiceCompatibility.create({
    ...data,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await recordAuditLog({
    performedBy: user.id,
    action: 'CREATE_COMPATIBILITY',
    entityType: 'MATERIAL',
    entityId: compatibility._id,
    newValue: compatibility.toJSON(),
    ipAddress,
  });

  const populated = await MaterialServiceCompatibility.findById(compatibility._id)
    .populate('materialId', 'materialName materialCode materialType brandName')
    .populate('serviceId', 'serviceName serviceCode serviceType');

  return populated.toJSON();
}

async function getCompatibilities(query = {}) {
  const { page = 1, limit = 20, materialId, serviceId, compatibilityStatus } = query;
  const filter = {};

  if (materialId) filter.materialId = materialId;
  if (serviceId) filter.serviceId = serviceId;
  if (compatibilityStatus) filter.compatibilityStatus = compatibilityStatus;

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    MaterialServiceCompatibility.find(filter)
      .populate('materialId', 'materialName materialCode materialType brandName status')
      .populate('serviceId', 'serviceName serviceCode serviceType status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    MaterialServiceCompatibility.countDocuments(filter),
  ]);

  return {
    compatibilities: items.map((i) => i.toJSON()),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

async function getCompatibilityById(id) {
  const compatibility = await MaterialServiceCompatibility.findById(id)
    .populate('materialId', 'materialName materialCode materialType brandName status')
    .populate('serviceId', 'serviceName serviceCode serviceType status');

  if (!compatibility) {
    throw new NotFoundError('Compatibility relationship not found.');
  }
  return compatibility.toJSON();
}

async function updateCompatibility(id, updateData, user, ipAddress) {
  const compatibility = await MaterialServiceCompatibility.findById(id);
  if (!compatibility) {
    throw new NotFoundError('Compatibility relationship not found.');
  }

  const oldValues = compatibility.toJSON();

  delete updateData.materialId;
  delete updateData.serviceId;
  delete updateData._id;
  delete updateData.id;

  Object.assign(compatibility, updateData, { updatedBy: user.id });
  await compatibility.save();

  await recordAuditLog({
    performedBy: user.id,
    action: 'UPDATE_COMPATIBILITY',
    entityType: 'MATERIAL',
    entityId: compatibility._id,
    oldValue: oldValues,
    newValue: compatibility.toJSON(),
    ipAddress,
  });

  const populated = await MaterialServiceCompatibility.findById(id)
    .populate('materialId', 'materialName materialCode materialType brandName')
    .populate('serviceId', 'serviceName serviceCode serviceType');

  return populated.toJSON();
}

async function deleteCompatibility(id, user, ipAddress) {
  const compatibility = await MaterialServiceCompatibility.findById(id);
  if (!compatibility) {
    throw new NotFoundError('Compatibility relationship not found.');
  }

  const oldValues = compatibility.toJSON();
  await MaterialServiceCompatibility.findByIdAndDelete(id);

  await recordAuditLog({
    performedBy: user.id,
    action: 'DELETE_COMPATIBILITY',
    entityType: 'MATERIAL',
    entityId: compatibility._id,
    oldValue: oldValues,
    newValue: null,
    ipAddress,
  });

  return { message: 'Compatibility relationship deleted successfully.' };
}

module.exports = {
  // Material Category
  createMaterialCategory,
  getMaterialCategories,
  getMaterialCategoryById,
  updateMaterialCategory,
  toggleMaterialCategoryStatus,

  // Materials
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  toggleMaterialStatus,

  // Service Category
  createServiceCategory,
  getServiceCategories,
  getServiceCategoryById,
  updateServiceCategory,
  toggleServiceCategoryStatus,

  // Services
  createService,
  getServices,
  getServiceById,
  updateService,
  toggleServiceStatus,

  // Compatibility
  createCompatibility,
  getCompatibilities,
  getCompatibilityById,
  updateCompatibility,
  deleteCompatibility,
};
