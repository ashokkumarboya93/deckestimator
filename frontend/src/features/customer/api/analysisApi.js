// =============================================
// Deck Estimator — Condition Analysis API Client (Phase 7)
// =============================================

import apiClient from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

export async function createDeckAnalysis(deckId, payload = {}) {
  const res = await apiClient(ENDPOINTS.ANALYSES.DECK_ANALYSES(deckId), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data?.analysis;
}

export async function getDeckAnalyses(deckId) {
  const res = await apiClient(ENDPOINTS.ANALYSES.DECK_ANALYSES(deckId));
  return res.data?.analyses || [];
}

export async function getAnalysisById(id) {
  const res = await apiClient(ENDPOINTS.ANALYSES.BY_ID(id));
  return res.data?.analysis;
}

export async function retryAnalysis(id) {
  const res = await apiClient(ENDPOINTS.ANALYSES.RETRY(id), {
    method: 'POST',
  });
  return res.data?.analysis;
}

export async function updateAnalysisReview(id, payload) {
  const res = await apiClient(ENDPOINTS.ANALYSES.REVIEW(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.data?.analysis;
}

export async function checkMLHealth() {
  const res = await apiClient(ENDPOINTS.ANALYSES.ML_HEALTH);
  return res.data;
}
