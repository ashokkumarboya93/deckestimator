// =============================================
// Deck Estimator — Storage Provider Adapter
// =============================================
// Provides modular file storage operations (save, retrieve, delete)
// Default implementation uses secure local filesystem storage.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE_UPLOADS_DIR = path.resolve(__dirname, '../../../uploads');
const DECKS_DIR = path.join(BASE_UPLOADS_DIR, 'decks');
const DOCS_DIR = path.join(BASE_UPLOADS_DIR, 'contractor-documents');

// Ensure upload directories exist
[DECKS_DIR, DOCS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storageProvider = {
  /**
   * Save buffer or stream to storage.
   * Generates a collision-resistant UUID filename to prevent path traversal.
   */
  async saveFile(buffer, originalname, mimeType, subDir = 'decks') {
    const ext =
      path.extname(originalname).toLowerCase() ||
      (mimeType === 'application/pdf'
        ? '.pdf'
        : mimeType === 'image/png'
        ? '.png'
        : mimeType === 'image/webp'
        ? '.webp'
        : '.jpg');
    const filename = `${crypto.randomUUID()}${ext}`;
    const targetDir = subDir === 'contractor-documents' ? DOCS_DIR : DECKS_DIR;
    const destinationPath = path.join(targetDir, filename);

    await fs.promises.writeFile(destinationPath, buffer);

    return {
      storageKey: filename,
      storageProvider: 'local',
      fileSize: buffer.length,
      subDir,
    };
  },

  /**
   * Get absolute filepath for local file serving.
   */
  getFilePath(storageKey, subDir = null) {
    // Prevent directory traversal
    const safeKey = path.basename(storageKey);
    if (subDir === 'contractor-documents') {
      const p = path.join(DOCS_DIR, safeKey);
      return fs.existsSync(p) ? p : null;
    }
    // Check default DECKS_DIR first, then DOCS_DIR
    const deckPath = path.join(DECKS_DIR, safeKey);
    if (fs.existsSync(deckPath)) {
      return deckPath;
    }
    const docPath = path.join(DOCS_DIR, safeKey);
    if (fs.existsSync(docPath)) {
      return docPath;
    }
    return null;
  },

  /**
   * Delete file from storage.
   */
  async deleteFile(storageKey, subDir = null) {
    try {
      const filePath = this.getFilePath(storageKey, subDir);
      if (filePath && fs.existsSync(filePath)) {
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

