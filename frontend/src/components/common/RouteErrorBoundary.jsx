// =============================================
// Deck Estimator — Route Error Boundary
// =============================================
// Replaces the default React Router dev crash screen with a clean,
// branded fallback offering safe recovery actions to Dashboard / Home.

import React from 'react';
import { useRouteError, useNavigate, isRouteErrorResponse } from 'react-router-dom';

export default function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Something went wrong loading this page';
  let detail = 'An unexpected display error occurred. Please reload or return to your portal home.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText || 'Page Error'}`;
    detail = error.data?.message || detail;
  } else if (error instanceof Error && error.message) {
    detail = error.message;
  }

  const handleGoHome = () => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (path.startsWith('/admin')) {
      navigate('/admin/dashboard', { replace: true });
    } else if (path.startsWith('/contractor')) {
      navigate('/contractor/dashboard', { replace: true });
    } else if (path.startsWith('/customer')) {
      navigate('/customer/dashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.desc}>{detail}</p>
        <div style={styles.btnRow}>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={styles.primaryBtn}
          >
            Reload Page
          </button>
          <button
            type="button"
            onClick={handleGoHome}
            style={styles.secondaryBtn}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    backgroundColor: '#F8FAFC',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  card: {
    maxWidth: '460px',
    width: '100%',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: '28px 24px',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  },
  iconWrap: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px auto',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '800',
    color: '#1E3A63',
    lineHeight: '1.3',
  },
  desc: {
    margin: '0 0 20px 0',
    fontSize: '13.5px',
    color: '#64748B',
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },
  btnRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    padding: '10px 18px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '10px 18px',
    backgroundColor: '#FFFFFF',
    color: '#1E3A63',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};

