// =============================================
// Deck Estimator — Shared Query & Cache Helpers
// =============================================

/**
 * Normalize a Mongoose `.lean()` document to match schema `toJSON` output
 * (`id` set from `_id`, `__v` removed, `_id` optionally removed).
 */
function normalizeLeanDoc(doc, { keepUnderscoreId = false } = {}) {
  if (!doc) return doc;
  const plain = { ...doc };
  if (plain._id !== undefined && plain.id === undefined) {
    plain.id = typeof plain._id === 'object' && plain._id !== null && typeof plain._id.toString === 'function'
      ? plain._id.toString()
      : plain._id;
  }
  if (!keepUnderscoreId) {
    delete plain._id;
  }
  delete plain.__v;
  return plain;
}

function normalizeLeanDocs(docs, options) {
  if (!Array.isArray(docs)) return [];
  return docs.map((doc) => normalizeLeanDoc(doc, options));
}

const ttlStore = new Map();

function getCachedValue(key) {
  const entry = ttlStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    ttlStore.delete(key);
    return null;
  }
  return entry.value;
}

function setCachedValue(key, value, ttlMs = 30000) {
  ttlStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
  return value;
}

function invalidateCachedKey(key) {
  ttlStore.delete(key);
}

module.exports = {
  normalizeLeanDoc,
  normalizeLeanDocs,
  getCachedValue,
  setCachedValue,
  invalidateCachedKey,
};

