// =============================================
// Deck Estimator — Estimates API Client
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

export async function createEstimate(payload) {
  const mapped = {
    deckId: payload.deckId,
    estimateName: payload.estimateName || '',
    materialIds: payload.materialIds || (payload.selectedMaterials || []).map((m) => m.materialId || m),
    serviceIds: payload.serviceIds || (payload.selectedServices || []).map((s) => s.serviceId || s),
    selectedMaterials: payload.selectedMaterials,
    selectedServices: payload.selectedServices,
    numberOfCoats: payload.numberOfCoats,
    notes: payload.notes || '',
    // Client pricing fields
    floorArea: payload.floorArea,
    floorProductionRate: payload.floorProductionRate,
    woodSpecies: payload.woodSpecies,
    accessType: payload.accessType,
    coatingType: payload.coatingType,
    coatingConfidence: payload.coatingConfidence,
    conditionFlags: payload.conditionFlags,
    railingLength: payload.railingLength,
    railingStyle: payload.railingStyle,
    stairCount: payload.stairCount,
    fasciaLength: payload.fasciaLength,
    pergolaLength: payload.pergolaLength,
    sidingArea: payload.sidingArea,
    includeJoists: payload.includeJoists,
    billingRate: payload.billingRate,
    customPrices: payload.customPrices,
    isCoatingIncomplete: payload.isCoatingIncomplete,
  };
  const res = await apiClient(ENDPOINTS.ESTIMATES.BASE, {
    method: 'POST',
    body: JSON.stringify(mapped),
  });
  return res.data?.estimate;
}

export async function getEstimates(params = {}) {
  const res = await apiClient(`${ENDPOINTS.ESTIMATES.BASE}${buildQuery(params)}`);
  return res.data;
}

export async function getEstimateById(id) {
  const res = await apiClient(ENDPOINTS.ESTIMATES.BY_ID(id));
  return res.data?.estimate;
}

export async function recalculateEstimate(id, payload = {}) {
  const res = await apiClient(ENDPOINTS.ESTIMATES.RECALCULATE(id), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data?.estimate;
}

export async function getEstimateHistory(id) {
  const res = await apiClient(ENDPOINTS.ESTIMATES.HISTORY(id));
  return res.data?.revisions || [];
}

export async function updateEstimateStatus(id, status, notes = '') {
  const res = await apiClient(ENDPOINTS.ESTIMATES.STATUS(id), {
    method: 'PATCH',
    body: JSON.stringify({ estimateStatus: status, status, notes }),
  });
  return res.data?.estimate;
}

export async function updateEstimate(id, payload) {
  const res = await apiClient(ENDPOINTS.ESTIMATES.BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data?.estimate;
}

export async function deleteEstimate(id) {
  const res = await apiClient(ENDPOINTS.ESTIMATES.BY_ID(id), {
    method: 'DELETE',
  });
  return res.data;
}

export async function requestProjectEstimate(id, payload = {}) {
  const res = await apiClient(`${ENDPOINTS.ESTIMATES.BASE}/${id}/request`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function calculateLivePricing(payload) {
  const res = await apiClient(ENDPOINTS.PRICING.CALCULATE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}
