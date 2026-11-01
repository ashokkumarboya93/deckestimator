// =============================================
// Deck Estimator — Catalog Controller
// =============================================

const catalogService = require('./catalog.service');

function getClientIp(req) {
  return req.ip || (req.connection && req.connection.remoteAddress) || null;
}

// ---------------------------------------------
// MATERIAL CATEGORIES
// ---------------------------------------------
async function createMaterialCategory(req, res, next) {
  try {
    const category = await catalogService.createMaterialCategory(
      req.body,
      req.user,
      getClientIp(req)
    );
    res.status(201).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

async function getMaterialCategories(req, res, next) {
  try {
    const result = await catalogService.getMaterialCategories(req.query, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getMaterialCategoryById(req, res, next) {
  try {
    const category = await catalogService.getMaterialCategoryById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

async function updateMaterialCategory(req, res, next) {
  try {
    const category = await catalogService.updateMaterialCategory(
      req.params.id,
      req.body,
      req.user,
      getClientIp(req)
    );
    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

async function toggleMaterialCategoryStatus(req, res, next) {
  try {
    const category = await catalogService.toggleMaterialCategoryStatus(
      req.params.id,
      req.body.status,
      req.user,
      getClientIp(req)
    );
    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------
// MATERIALS
// ---------------------------------------------
async function createMaterial(req, res, next) {
  try {
    const material = await catalogService.createMaterial(
      req.body,
      req.user,
      getClientIp(req)
    );
    res.status(201).json({
      success: true,
      data: { material },
    });
  } catch (error) {
    next(error);
  }
}

async function getMaterials(req, res, next) {
  try {
    const result = await catalogService.getMaterials(req.query, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getMaterialById(req, res, next) {
  try {
    const material = await catalogService.getMaterialById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: { material },
    });
  } catch (error) {
    next(error);
  }
}

async function updateMaterial(req, res, next) {
  try {
    const material = await catalogService.updateMaterial(
      req.params.id,
      req.body,
      req.user,
      getClientIp(req)
    );
    res.status(200).json({
      success: true,
      data: { material },
    });
  } catch (error) {
    next(error);
  }
}

async function toggleMaterialStatus(req, res, next) {
  try {
    const material = await catalogService.toggleMaterialStatus(
      req.params.id,
      req.body.status,
      req.user,
      getClientIp(req)
    );
    res.status(200).json({
      success: true,
      data: { material },
    });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------
// SERVICE CATEGORIES
// ---------------------------------------------
async function createServiceCategory(req, res, next) {
  try {
    const category = await catalogService.createServiceCategory(
      req.body,
      req.user,
      getClientIp(req)
    );
    res.status(201).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

async function getServiceCategories(req, res, next) {
  try {
    const result = await catalogService.getServiceCategories(req.query, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getServiceCategoryById(req, res, next) {
  try {
    const category = await catalogService.getServiceCategoryById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

async function updateServiceCategory(req, res, next) {
  try {
    const category = await catalogService.updateServiceCategory(
      req.params.id,
      req.body,
      req.user,
      getClientIp(req)
    );
    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

async function toggleServiceCategoryStatus(req, res, next) {
  try {
    const category = await catalogService.toggleServiceCategoryStatus(
      req.params.id,
      req.body.status,
      req.user,
      getClientIp(req)
    );
    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------
// SERVICES
// ---------------------------------------------
async function createService(req, res, next) {
  try {
    const service = await catalogService.createService(
      req.body,
      req.user,
      getClientIp(req)
    );
    res.status(201).json({
      success: true,
      data: { service },
    });
  } catch (error) {
    next(error);
  }
}

async function getServices(req, res, next) {
  try {
    const result = await catalogService.getServices(req.query, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getServiceById(req, res, next) {
  try {
    const service = await catalogService.getServiceById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: { service },
    });
  } catch (error) {
    next(error);
  }
}

async function updateService(req, res, next) {
  try {
    const service = await catalogService.updateService(
      req.params.id,
      req.body,
      req.user,
      getClientIp(req)
    );
    res.status(200).json({
      success: true,
      data: { service },
    });
  } catch (error) {
    next(error);
  }
}

async function toggleServiceStatus(req, res, next) {
  try {
    const service = await catalogService.toggleServiceStatus(
      req.params.id,
      req.body.status,
      req.user,
      getClientIp(req)
    );
    res.status(200).json({
      success: true,
      data: { service },
    });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------
// COMPATIBILITY
// ---------------------------------------------
async function createCompatibility(req, res, next) {
  try {
    const compatibility = await catalogService.createCompatibility(
      req.body,
      req.user,
      getClientIp(req)
    );
    res.status(201).json({
      success: true,
      data: { compatibility },
    });
  } catch (error) {
    next(error);
  }
}

async function getCompatibilities(req, res, next) {
  try {
    const result = await catalogService.getCompatibilities(req.query, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getCompatibilityById(req, res, next) {
  try {
    const compatibility = await catalogService.getCompatibilityById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: { compatibility },
    });
  } catch (error) {
    next(error);
  }
}

async function updateCompatibility(req, res, next) {
  try {
    const compatibility = await catalogService.updateCompatibility(
      req.params.id,
      req.body,
      req.user,
      getClientIp(req)
    );
    res.status(200).json({
      success: true,
      data: { compatibility },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteCompatibility(req, res, next) {
  try {
    const result = await catalogService.deleteCompatibility(
      req.params.id,
      req.user,
      getClientIp(req)
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createMaterialCategory,
  getMaterialCategories,
  getMaterialCategoryById,
  updateMaterialCategory,
  toggleMaterialCategoryStatus,

  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  toggleMaterialStatus,

  createServiceCategory,
  getServiceCategories,
  getServiceCategoryById,
  updateServiceCategory,
  toggleServiceCategoryStatus,

  createService,
  getServices,
  getServiceById,
  updateService,
  toggleServiceStatus,

  createCompatibility,
  getCompatibilities,
  getCompatibilityById,
  updateCompatibility,
  deleteCompatibility,
};

