// =============================================
// Deck Estimator — Root Application Component
// =============================================

import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const isCustomerRoute = location.pathname.startsWith('/customer');
  const isContractorRoute = location.pathname.startsWith('/contractor');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  // Dedicated Portal Experience for Customer, Contractor, Admin, and Auth routes
  if (isCustomerRoute || isContractorRoute || isAdminRoute || isAuthRoute) {
    return <Outlet />;
  }

  return (
    <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '0.75rem 2rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: '900', letterSpacing: '-0.5px', color: '#0f172a' }}>
              DECK <span style={{ color: '#16a34a' }}>PRO</span>
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#475569',
                backgroundColor: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Estimator
            </span>
          </Link>

          {isAuthenticated && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              {user?.role === 'customer' ? (
                <>
                  <Link
                    to="/customer/dashboard"
                    style={{
                      fontSize: '14px',
                      fontWeight: location.pathname === '/customer/dashboard' ? '700' : '600',
                      color: location.pathname === '/customer/dashboard' ? '#16a34a' : '#0f172a',
                      textDecoration: 'none',
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    Home
                  </Link>
                  <Link
                    to="/customer/decks/new"
                    style={{
                      fontSize: '14px',
                      fontWeight: location.pathname === '/customer/decks/new' ? '700' : '600',
                      color: location.pathname === '/customer/decks/new' ? '#16a34a' : '#475569',
                      textDecoration: 'none',
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    Estimator
                  </Link>
                  <Link
                    to="/customer/estimates"
                    style={{
                      fontSize: '14px',
                      fontWeight: location.pathname === '/customer/estimates' ? '700' : '500',
                      color: location.pathname === '/customer/estimates' ? '#16a34a' : '#475569',
                      textDecoration: 'none',
                      padding: '4px 8px',
                    }}
                  >
                    My Estimates
                  </Link>
                </>
              ) : (
                <>
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
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#4338ca',
                      backgroundColor: '#e0e7ff',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    Admin Console
                  </Link>
                  <Link
                    to="/admin/catalog"
                    style={{
                      fontSize: '13px',
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
                      fontSize: '13px',
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
                      fontSize: '13px',
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
                  <Link
                    to="/admin/commissions"
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#b45309',
                      backgroundColor: '#fef3c7',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    Commissions & Discounts
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        <div>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '4px 12px 4px 6px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '12px',
                  }}
                >
                  {(user?.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', lineHeight: 1.2 }}>
                    {user?.fullName || 'User'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'capitalize' }}>
                    {user?.role || 'customer'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: '#475569',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.color = '#dc2626';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#475569';
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
                  border: '2px solid #ef4444',
                  borderRadius: 'var(--radius)',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
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
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      <main style={{ flex: 1, backgroundColor: '#f8fafc', paddingBottom: '40px' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
