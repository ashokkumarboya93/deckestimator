// =============================================
// Deck Estimator — Enterprise Confirmation Dialog Modal
// =============================================
// Clean, accessible, modal confirmation dialog for destructive
// or critical business actions (Deletions, Approvals, Rejections).

import React, { useEffect } from 'react';

export function ConfirmModal({
  isOpen = false,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Please confirm to proceed.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  isLoading = false,
  onConfirm,
  onClose,
  details = null,
}) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: '#FEF2F2',
      iconBorder: '#F87171',
      iconColor: '#DC2626',
      btnBg: 'linear-gradient(180deg, #DC2626 0%, #B91C1C 100%)',
      btnShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    warning: {
      iconBg: '#FFFBEB',
      iconBorder: '#FCD34D',
      iconColor: '#D97706',
      btnBg: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
      btnShadow: '0 4px 14px rgba(217, 119, 6, 0.35)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    primary: {
      iconBg: '#F0F6FF',
      iconBorder: '#BFDBFE',
      iconColor: '#0A58CA',
      btnBg: 'linear-gradient(180deg, #0A58CA 0%, #033B85 100%)',
      btnShadow: '0 4px 14px rgba(3, 59, 133, 0.35)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A58CA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
  };

  const v = variantStyles[variant] || variantStyles.danger;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px',
        animation: 'modalFadeIn 0.15s ease-out',
      }}
      onClick={() => !isLoading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '440px',
          padding: '26px 26px 22px 26px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          position: 'relative',
          animation: 'modalSlideUp 0.18s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          {/* Visual Icon Badge */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: v.iconBg,
              border: `1px solid ${v.iconBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {v.icon}
          </div>

          {/* Text Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              id="confirm-modal-title"
              style={{
                fontSize: '17px',
                fontWeight: '700',
                color: '#0F172A',
                margin: '0 0 6px 0',
                letterSpacing: '-0.3px',
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: '13.5px',
                color: '#64748B',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {message}
            </p>

            {/* Optional details box */}
            {details && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12.5px',
                  color: '#334155',
                  wordBreak: 'break-word',
                }}
              >
                {details}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '24px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              height: '38px',
              padding: '0 16px',
              borderRadius: '10px',
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#475569',
              fontSize: '13px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              height: '38px',
              padding: '0 18px',
              borderRadius: '10px',
              background: v.btnBg,
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: v.btnShadow,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isLoading ? 0.75 : 1,
              transition: 'transform 0.15s ease, opacity 0.15s ease',
            }}
          >
            {isLoading && (
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  borderTopColor: '#FFFFFF',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'deckSpin 0.7s linear infinite',
                }}
              />
            )}
            <span>{isLoading ? 'Processing...' : confirmLabel}</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes deckSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ConfirmModal;

