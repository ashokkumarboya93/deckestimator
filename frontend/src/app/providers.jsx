// =============================================
// Deck Estimator — Shared React Providers
// =============================================

import { AuthProvider } from '../features/auth/hooks/useAuth';
import { ToastViewport } from '../components/ToastViewport';

export function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
      <ToastViewport />
    </AuthProvider>
  );
}
