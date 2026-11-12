// =============================================
// Deck Estimator — Lightweight Non-Blocking Toast Emitter
// =============================================

const listeners = new Set();
let nextId = 1;

function emit(type, message, durationMs = 4500) {
  const text = String(message || '').trim();
  if (!text) return;

  const item = {
    id: nextId++,
    type,
    message: text,
    durationMs,
  };

  listeners.forEach((fn) => fn({ action: 'add', item }));
}

export function subscribeToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function dismissToast(id) {
  listeners.forEach((fn) => fn({ action: 'dismiss', id }));
}

export const toast = {
  success: (msg, durationMs) => emit('success', msg, durationMs),
  error: (msg, durationMs = 5500) => emit('error', msg, durationMs),
  warning: (msg, durationMs = 5000) => emit('warning', msg, durationMs),
  info: (msg, durationMs) => emit('info', msg, durationMs),
};

