// =============================================
// DECK PRO — Root Application Component
// =============================================

import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="app">
      <header style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>
          DECK PRO
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Deck Restoration Estimator
        </p>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Outlet />

        {/* Temporary: Phase 1 skeleton confirmation */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
        }}>
          <h2 style={{ marginBottom: '0.5rem' }}>✅ Phase 1 Complete</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            The DECK PRO frontend skeleton is running successfully.
          </p>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Next: Phase 2 — Authentication &amp; Authorization
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
