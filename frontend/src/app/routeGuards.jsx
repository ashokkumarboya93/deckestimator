// =============================================
// DECK PRO — Route Guards
// =============================================
// UX-level navigation guards based on session/role.
// These improve user experience but are NOT a security boundary.
// The backend enforces all authorization.

import { Navigate } from 'react-router-dom';

/**
 * Protect routes that require authentication.
 * Redirects to login if user is not authenticated.
 */
export function RequireAuth({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * Restrict routes to specific roles.
 * Redirects to home if user's role is not allowed.
 */
export function RequireRole({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

/**
 * Redirect authenticated users away from auth pages (login, register).
 */
export function GuestOnly({ user, children }) {
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
}
