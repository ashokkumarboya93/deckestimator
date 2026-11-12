// =============================================
// Deck Estimator — Accessible Toast Viewport
// =============================================

import { useEffect, useState } from 'react';
import { subscribeToasts, dismissToast } from '../utils/toast';

const VARIANT_STYLES = {
  success: {
    bg: '#ecfdf5',
    border: '#10b981',
    color: '#065f46',
    icon: '✓',
  },
  error: {
    bg: '#fef2f2',
    border: '#ef4444',
    color: '#991b1b',
    icon: '!',
  },
  warning: {
    bg: '#fffbeb',
    border: '#f59e0b',
    color: '#92400e',
    icon: '!',
  },
  info: {
    bg: '#eff6ff',
    border: '#2563eb',
    color: '#1e40af',
    icon: 'i',
  },
};

export function ToastViewport() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timers = new Map();

    const unsubscribe = subscribeToasts((event) => {
      if (event.action === 'dismiss') {
        const t = timers.get(event.id);
        if (t) clearTimeout(t);
        timers.delete(event.id);
        setToasts((prev) => prev.filter((item) => item.id !== event.id));
        return;
      }

      if (event.action === 'add') {
        const { item } = event;
        setToasts((prev) => [...prev.slice(-3), item]);
        const timer = setTimeout(() => {
          dismissToast(item.id);
        }, item.durationMs);
        timers.set(item.id, timer);
      }
    });

    return () => {
      unsubscribe();
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="drp-toast-viewport"
      role="region"
      aria-label="Application notifications"
    >
      {toasts.map((item) => {
        const variant = VARIANT_STYLES[item.type] || VARIANT_STYLES.info;
        const isAlert = item.type === 'error' || item.type === 'warning';
        return (
          <div
            key={item.id}
            className="drp-toast-card"
            role={isAlert ? 'alert' : 'status'}
            aria-live={isAlert ? 'assertive' : 'polite'}
            style={{
              backgroundColor: variant.bg,
              borderLeft: `4px solid ${variant.border}`,
              color: variant.color,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: variant.border,
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {variant.icon}
            </span>
            <span style={{ flex: 1, fontSize: '13.5px', fontWeight: '600', lineHeight: 1.4 }}>
              {item.message}
            </span>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              aria-label="Dismiss notification"
              style={{
                background: 'transparent',
                border: 'none',
                color: variant.color,
                fontSize: '18px',
                lineHeight: 1,
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '4px',
                flexShrink: 0,
              }}
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}

