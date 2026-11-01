// =============================================
// Deck Estimator — Root Application Component
// =============================================

import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '0.875rem 2rem',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-primary)' }}>
              Deck Estimator
            </h1>
          </Link>
          {isAuthenticated && (
            <nav style={{ display: 'flex', gap: '16px' }}>
              <Link
                to={user?.role === 'contractor' ? '/contractor/dashboard' : '/customer/dashboard'}
                style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' }}
              >
                Projects Dashboard
              </Link>
              <Link
                to={user?.role === 'contractor' ? '/contractor/decks/new' : '/customer/decks/new'}
                style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-primary)' }}
              >
                + New Deck
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/catalog"
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#d32f2f',
                      backgroundColor: '#ffebee',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    Catalog
                  </Link>
                  <Link
                    to="/admin/contractor-verifications"
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0369a1',
                      backgroundColor: '#e0f2fe',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    Verifications
                  </Link>
                  <Link
                    to="/admin/leads"
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#15803d',
                      backgroundColor: '#dcfce7',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    Leads Hub
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        <div>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {user.fullName} ({user.role})
              </span>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  padding: '5px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: 'var(--color-text)',
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                to="/login"
                style={{
                  padding: '6px 14px',
                  fontSize: '13px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--color-text)',
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  padding: '6px 14px',
                  fontSize: '13px',
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: 'var(--radius)',
                  color: '#ffffff',
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      <main style={{ flex: 1, backgroundColor: 'var(--color-bg)', paddingBottom: '40px' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
