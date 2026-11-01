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
  const res = await apiClient(ENDPOINTS.ESTIMATES.BASE, {
    method: 'POST',
    body: JSON.stringify(payload),
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

export async function updateEstimateStatus(id, status) {
  const res = await apiClient(ENDPOINTS.ESTIMATES.STATUS(id), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return res.data?.estimate;
}

