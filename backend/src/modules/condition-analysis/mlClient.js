// =============================================
// Deck Estimator — ML Service Client (Phase 7)
// =============================================

const fs = require('fs');
const path = require('path');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
const ML_TIMEOUT_MS = parseInt(process.env.ML_TIMEOUT_MS, 10) || 15000;

class MLClient {
  constructor(baseUrl = ML_SERVICE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Health check to ensure ML inference service is reachable and ready.
   */
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          status: 'unhealthy',
          statusCode: response.status,
          modelLoaded: false,
        };
      }

      const data = await response.json();
      return data;
    } catch (err) {
      return {
        status: 'unreachable',
        error: err.message,
        modelLoaded: false,
      };
    }
  }

  /**
   * Send an image file to the ML service for condition and defect analysis.
   * @param {string} imagePath - Absolute local path to the image file.
   * @param {object} metadata - Optional metadata (analysisId, deckSurface, etc.)
   */
  async analyzeImage(imagePath, metadata = {}) {
    if (!fs.existsSync(imagePath)) {
      const err = new Error(`Image file not found on server: ${imagePath}`);
      err.code = 'IMAGE_NOT_FOUND';
      throw err;
    }

    const fileBuffer = await fs.promises.readFile(imagePath);
    const filename = path.basename(imagePath);
    const ext = path.extname(filename).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: mimeType });
    formData.append('file', blob, filename);

    if (metadata.analysisId) {
      formData.append('analysisId', String(metadata.analysisId));
    }
    if (metadata.deckSurface) {
      formData.append('deckSurface', String(metadata.deckSurface));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/analyze`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText };
        }

        const err = new Error(errorData.detail || errorData.message || `ML inference failed with status ${response.status}`);
        err.code = 'ML_INFERENCE_ERROR';
        err.statusCode = response.status;
        err.details = errorData;
        throw err;
      }

      const result = await response.json();
      return result;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        const timeoutErr = new Error(`ML service request timed out after ${ML_TIMEOUT_MS}ms`);
        timeoutErr.code = 'ML_SERVICE_TIMEOUT';
        throw timeoutErr;
      }
      if (err.cause && (err.cause.code === 'ECONNREFUSED' || err.code === 'ECONNREFUSED')) {
        const connErr = new Error('ML inference service is currently unavailable. Please ensure the Python service is running.');
        connErr.code = 'ML_SERVICE_UNAVAILABLE';
        throw connErr;
      }
      throw err;
    }
  }
}

const defaultClient = new MLClient();

module.exports = {
  MLClient,
  mlClient: defaultClient,
};
