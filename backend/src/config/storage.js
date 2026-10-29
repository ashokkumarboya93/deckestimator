// =============================================
// DECK PRO — Object Storage Configuration
// =============================================
// Placeholder for object storage adapter configuration.
// Will be implemented when file upload module is built (Phase 6).

// TODO: Configure storage provider (e.g., AWS S3, GCS, local dev storage)
// Storage provider selection depends on confirmed deployment requirements.

const storageConfig = {
  provider: process.env.STORAGE_PROVIDER || 'local',
  // Additional provider-specific settings will be added here
};

module.exports = { storageConfig };

