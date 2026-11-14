// =============================================
// Deck Estimator — Avatar Storage Helper
// =============================================
// Offloads heavy base64 avatar images to local static files
// to prevent bloated MongoDB documents and network lag.

const fs = require('fs');
const path = require('path');

const AVATARS_DIR = path.join(__dirname, '../../../uploads/avatars');

function ensureAvatarsDir() {
  if (!fs.existsSync(AVATARS_DIR)) {
    fs.mkdirSync(AVATARS_DIR, { recursive: true });
  }
}

/**
 * If avatar is a base64 data URI, save to disk and return static URL path.
 * Otherwise, return original avatar string.
 */
function persistAvatarIfBase64(userId, avatarStr) {
  if (!avatarStr || typeof avatarStr !== 'string') return avatarStr || '';
  if (!avatarStr.startsWith('data:image/')) return avatarStr;

  try {
    ensureAvatarsDir();
    const match = avatarStr.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!match) return avatarStr;

    let ext = match[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `${userId}.${ext}`;
    const filePath = path.join(AVATARS_DIR, fileName);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/avatars/${fileName}`;
  } catch (err) {
    console.warn('[AvatarStorage] Failed to save avatar to disk, keeping fallback:', err.message);
    return avatarStr;
  }
}

module.exports = {
  persistAvatarIfBase64,
};
