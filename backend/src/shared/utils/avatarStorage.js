// =============================================
// Deck Estimator — Avatar Storage Helper
// =============================================
// Retains compressed base64 / WebP avatars directly in MongoDB
// for multi-instance resilience across container restarts and zero-cost cloud hosting.

/**
 * Ensures avatar data URIs or image URLs are preserved and safe for MongoDB storage.
 */
function persistAvatarIfBase64(userId, avatarStr) {
  if (!avatarStr || typeof avatarStr !== 'string') return avatarStr || '';
  // Directly return avatar string (already compressed WebP/JPEG data URI or CDN URL)
  // This guarantees persistent availability without ephemeral container disk dependencies.
  return avatarStr.trim();
}

module.exports = {
  persistAvatarIfBase64,
};
