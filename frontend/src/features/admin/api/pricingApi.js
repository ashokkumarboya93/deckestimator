// =============================================
// Deck Estimator — Admin Pricing API Client
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

export async function getActivePricingConfiguration() {
  const res = await apiClient(ENDPOINTS.PRICING.ACTIVE);
  return res.data?.configuration;
}

export async function getPricingConfigurations(params = {}) {
  const res = await apiClient(`${ENDPOINTS.PRICING.CONFIGURATIONS}${buildQuery(params)}`);
  return res.data;
}

export async function getPricingConfigurationById(id) {
  const res = await apiClient(ENDPOINTS.PRICING.BY_ID(id));
  return res.data?.configuration;
}

export async function createPricingConfiguration(data) {
  const res = await apiClient(ENDPOINTS.PRICING.CONFIGURATIONS, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data?.configuration;
}

export async function updatePricingConfiguration(id, data) {
  const res = await apiClient(ENDPOINTS.PRICING.BY_ID(id), {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.data?.configuration;
}

export async function togglePricingConfigurationStatus(id, isActive) {
  const res = await apiClient(ENDPOINTS.PRICING.STATUS(id), {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
  return res.data?.configuration;
}

