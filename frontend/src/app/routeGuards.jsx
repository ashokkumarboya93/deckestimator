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
 * Restrict contractor pages exclusively to contractors whose verification has been approved by admin.
 * If pending, draft, under_review, or rejected, redirect to /contractor/verification-request.
 */
export function RequireApprovedContractor({ children }) {
  const { user, contractorProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Verifying credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admins can view any contractor page if authorized
  if (user.role === 'admin') {
    return children;
  }

  if (user.role !== 'contractor') {
    return <Navigate to="/" replace />;
  }

  const isApproved = contractorProfile?.verificationStatus === 'approved';

  if (!isApproved) {
    return <Navigate to="/contractor/verification-request" replace />;
  }

  return children;
}

/**
 * Redirect authenticated users away from guest pages (login, register).
 */
export function GuestOnly({ children }) {
  const { user, contractorProfile, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'contractor') {
      const isApproved = contractorProfile?.verificationStatus === 'approved';
      return <Navigate to={isApproved ? "/contractor/dashboard" : "/contractor/verification-request"} replace />;
    }
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
}

