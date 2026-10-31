// =============================================
// Deck Estimator — Route Guards
// =============================================
// UX-level navigation guards based on session/role.
// These improve user experience but are NOT a security boundary.
// The backend enforces all authorization.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

/**
 * Protect routes that require authentication.
 * Displays a loading state while session verification completes,
 * or redirects to /login if unauthenticated.
 */
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Restrict routes to specific roles.
 * Redirects to root if user role is not permitted.
 */
export function RequireRole({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Verifying permissions...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * Redirect authenticated users away from guest pages (login, register).
 */
export function GuestOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'contractor') return <Navigate to="/contractor/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
}

