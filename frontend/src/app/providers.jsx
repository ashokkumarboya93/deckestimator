// =============================================
// DECK PRO — Shared React Providers
// =============================================
// Central location for context providers.
// Auth context and other providers will be added in later phases.

export function Providers({ children }) {
  return (
    <>
      {/* AuthProvider will wrap children in Phase 5 */}
      {children}
    </>
  );
}
