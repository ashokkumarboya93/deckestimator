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
 * Redirects to role-appropriate home if user role is not permitted (avoids infinite redirect loop).
 */
export function RequireRole({ allowedRoles, children }) {
  const { user, contractorProfile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Verifying permissions...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'contractor') {
      const isApproved = contractorProfile?.verificationStatus === 'approved';
      return <Navigate to={isApproved ? "/contractor/dashboard" : "/contractor/verification-request"} replace />;
    }
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
}

/**
 * Root route smart router: sends authenticated users to their role-appropriate portal,
 * or unauthenticated users to /login, preventing blank screens or redirect loops.
 */
export function RootRedirect() {
  const { user, contractorProfile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#1d4ed8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ color: '#64748b', marginTop: '14px', fontSize: '14px', fontWeight: '500' }}>Loading Deck Pro...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === 'contractor') {
    const isApproved = contractorProfile?.verificationStatus === 'approved';
    return <Navigate to={isApproved ? "/contractor/dashboard" : "/contractor/verification-request"} replace />;
  }

  return <Navigate to="/customer/dashboard" replace />;
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

