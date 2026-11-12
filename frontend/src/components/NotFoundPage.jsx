// =============================================
// Deck Estimator — 404 Not Found Page
// =============================================

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  let homePath = '/';
  let homeLabel = 'Back to Home';

  if (isAuthenticated && user?.role) {
    if (user.role === 'admin') {
      homePath = '/admin/dashboard';
      homeLabel = 'Go to Admin Dashboard';
    } else if (user.role === 'contractor') {
      homePath = '/contractor/dashboard';
      homeLabel = 'Go to Contractor Portal';
    } else {
      homePath = '/customer/dashboard';
      homeLabel = 'Go to My Dashboard';
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
          padding: '36px 28px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 14px',
            borderRadius: '999px',
            backgroundColor: '#eff6ff',
            color: '#1e3a8a',
            fontWeight: '800',
            fontSize: '13px',
            letterSpacing: '0.05em',
            marginBottom: '16px',
          }}
        >
          404 &bull; PAGE NOT FOUND
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
          We couldn&apos;t find that page
        </h1>
        <p style={{ fontSize: '0.94rem', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
          The link may have moved or the URL might be misspelled. Return to your workspace to continue your deck restoration estimate.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          <Link
            to={homePath}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 18px',
              borderRadius: '8px',
              backgroundColor: '#0B192C',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            {homeLabel}
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

