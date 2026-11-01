// =============================================
// Deck Estimator — Storage Provider Adapter
// =============================================
// Provides modular file storage operations (save, retrieve, delete)
// Default implementation uses secure local filesystem storage.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads/decks');

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storageProvider = {
  /**
   * Save buffer or stream to storage.
   * Generates a collision-resistant UUID filename to prevent path traversal.
   */
  async saveFile(buffer, originalname, mimeType) {
    const ext = path.extname(originalname).toLowerCase() || (mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg');
    const filename = `${crypto.randomUUID()}${ext}`;
    const destinationPath = path.join(UPLOADS_DIR, filename);

    await fs.promises.writeFile(destinationPath, buffer);

    return {
      storageKey: filename,
      storageProvider: 'local',
      fileSize: buffer.length,
    };
  },

  /**
   * Get absolute filepath for local file serving.
   */
  getFilePath(storageKey) {
    // Prevent directory traversal
    const safeKey = path.basename(storageKey);
    const resolvedPath = path.join(UPLOADS_DIR, safeKey);
    if (!fs.existsSync(resolvedPath)) {
      return null;
    }
    return resolvedPath;
  },

  /**
   * Delete file from storage.
   */
  async deleteFile(storageKey) {
    try {
      const safeKey = path.basename(storageKey);
      const filePath = path.join(UPLOADS_DIR, safeKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      return true;
    } catch (err) {
      console.error('[StorageProvider] Error deleting file:', err.message);
      return false;
    }
  },
};

module.exports = storageProvider;

