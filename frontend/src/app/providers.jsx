// =============================================
// Deck Estimator — Shared React Providers
// =============================================

import { AuthProvider } from '../features/auth/hooks/useAuth';

export function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
