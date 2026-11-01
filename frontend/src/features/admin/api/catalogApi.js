// =============================================
// Deck Estimator — Admin Catalog API Client
// =============================================

import apiClient from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

// ---------------------------------------------
// 1. MATERIAL CATEGORIES
// ---------------------------------------------
export async function getMaterialCategories(params = {}) {
  const res = await apiClient(`${ENDPOINTS.CATALOG.MATERIAL_CATEGORIES}${buildQuery(params)}`);
  return res.data;
}

export async function getMaterialCategoryById(id) {
  const res = await apiClient(ENDPOINTS.CATALOG.MATERIAL_CATEGORY_BY_ID(id));
  return res.data.category;
}

export async function createMaterialCategory(data) {
  const res = await apiClient(ENDPOINTS.CATALOG.MATERIAL_CATEGORIES, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data.category;
}

export async function updateMaterialCategory(id, data) {
  const res = await apiClient(ENDPOINTS.CATALOG.MATERIAL_CATEGORY_BY_ID(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.data.category;
}

export async function toggleMaterialCategoryStatus(id, status) {
  const res = await apiClient(ENDPOINTS.CATALOG.MATERIAL_CATEGORY_STATUS(id), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res.data.category;
}

// ---------------------------------------------
// 2. MATERIALS
// ---------------------------------------------
export async function getMaterials(params = {}) {
  const res = await apiClient(`${ENDPOINTS.CATALOG.MATERIALS}${buildQuery(params)}`);
  return res.data;
}

export async function getMaterialById(id) {
  const res = await apiClient(ENDPOINTS.CATALOG.MATERIAL_BY_ID(id));
  return res.data.material;
}

export async function createMaterial(data) {
  const res = await apiClient(ENDPOINTS.CATALOG.MATERIALS, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data.material;
}

export async function updateMaterial(id, data) {
  const res = await apiClient(ENDPOINTS.CATALOG.MATERIAL_BY_ID(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.data.material;
}

export async function toggleMaterialStatus(id, status) {
  const res = await apiClient(ENDPOINTS.CATALOG.MATERIAL_STATUS(id), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res.data.material;
}

// ---------------------------------------------
// 3. SERVICE CATEGORIES
// ---------------------------------------------
export async function getServiceCategories(params = {}) {
  const res = await apiClient(`${ENDPOINTS.CATALOG.SERVICE_CATEGORIES}${buildQuery(params)}`);
  return res.data;
}

export async function getServiceCategoryById(id) {
  const res = await apiClient(ENDPOINTS.CATALOG.SERVICE_CATEGORY_BY_ID(id));
  return res.data.category;
}

export async function createServiceCategory(data) {
  const res = await apiClient(ENDPOINTS.CATALOG.SERVICE_CATEGORIES, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data.category;
}

export async function updateServiceCategory(id, data) {
  const res = await apiClient(ENDPOINTS.CATALOG.SERVICE_CATEGORY_BY_ID(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.data.category;
}

export async function toggleServiceCategoryStatus(id, status) {
  const res = await apiClient(ENDPOINTS.CATALOG.SERVICE_CATEGORY_STATUS(id), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res.data.category;
}

// ---------------------------------------------
// 4. SERVICES
// ---------------------------------------------
export async function getServices(params = {}) {
  const res = await apiClient(`${ENDPOINTS.CATALOG.SERVICES}${buildQuery(params)}`);
  return res.data;
}

export async function getServiceById(id) {
  const res = await apiClient(ENDPOINTS.CATALOG.SERVICE_BY_ID(id));
  return res.data.service;
}

export async function createService(data) {
  const res = await apiClient(ENDPOINTS.CATALOG.SERVICES, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data.service;
}

export async function updateService(id, data) {
  const res = await apiClient(ENDPOINTS.CATALOG.SERVICE_BY_ID(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.data.service;
}

export async function toggleServiceStatus(id, status) {
  const res = await apiClient(ENDPOINTS.CATALOG.SERVICE_STATUS(id), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res.data.service;
}

// ---------------------------------------------
// 5. MATERIAL-SERVICE COMPATIBILITY
// ---------------------------------------------
export async function getCompatibilities(params = {}) {
  const res = await apiClient(`${ENDPOINTS.CATALOG.COMPATIBILITIES}${buildQuery(params)}`);
  return res.data;
}

export async function getCompatibilityById(id) {
  const res = await apiClient(ENDPOINTS.CATALOG.COMPATIBILITY_BY_ID(id));
  return res.data.compatibility;
}

export async function createCompatibility(data) {
  const res = await apiClient(ENDPOINTS.CATALOG.COMPATIBILITIES, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data.compatibility;
}

export async function updateCompatibility(id, data) {
  const res = await apiClient(ENDPOINTS.CATALOG.COMPATIBILITY_BY_ID(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.data.compatibility;
}

export async function deleteCompatibility(id) {
  const res = await apiClient(ENDPOINTS.CATALOG.COMPATIBILITY_BY_ID(id), {
    method: 'DELETE',
  });
  return res.data;
}

