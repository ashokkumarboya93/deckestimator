// =============================================
// Deck Estimator — Customer Decks API Service
// =============================================

import apiClient from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';

/**
 * Fetch paginated list of user's deck projects.
 */
export async function getDecks(params = {}) {
  const query = new URLSearchParams(params).toString();
  const endpoint = query ? `${ENDPOINTS.DECKS.BASE}?${query}` : ENDPOINTS.DECKS.BASE;
  const res = await apiClient(endpoint);
  return res.data;
}

/**
 * Fetch a single deck project by ID with its image metadata.
 */
export async function getDeckById(deckId) {
  const res = await apiClient(ENDPOINTS.DECKS.BY_ID(deckId));
  return res.data.deck;
}

/**
 * Create a new deck project.
 */
export async function createDeck(deckData) {
  const res = await apiClient(ENDPOINTS.DECKS.BASE, {
    method: 'POST',
    body: JSON.stringify(deckData),
  });
  return res.data.deck;
}

/**
 * Update an existing deck project.
 */
export async function updateDeck(deckId, deckData) {
  const res = await apiClient(ENDPOINTS.DECKS.BY_ID(deckId), {
    method: 'PATCH',
    body: JSON.stringify(deckData),
  });
  return res.data.deck;
}

/**
 * Delete a deck project and its associated photos.
 */
export async function deleteDeck(deckId) {
  const res = await apiClient(ENDPOINTS.DECKS.BY_ID(deckId), {
    method: 'DELETE',
  });
  return res.data;
}

/**
 * Upload photos for a deck project.
 */
export async function uploadDeckImages(deckId, formData) {
  const res = await apiClient(ENDPOINTS.DECKS.IMAGES(deckId), {
    method: 'POST',
    body: formData,
  });
  return res.data.images;
}

/**
 * Delete a photo associated with a deck project.
 */
export async function deleteDeckImage(deckId, imageId) {
  const res = await apiClient(ENDPOINTS.DECKS.IMAGE_BY_ID(deckId, imageId), {
    method: 'DELETE',
  });
  return res.data;
}

/**
 * Get direct stream URL for an authorized deck photo.
 */
export function getDeckImageUrl(deckId, imageId) {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  return `${baseUrl}/decks/${deckId}/images/${imageId}`;
}

