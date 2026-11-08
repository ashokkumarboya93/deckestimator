// =============================================
// Deck Estimator — Dedicated Admin Portal Login
// =============================================
// Isolated login gateway specifically for administrators.
// Route: /admin/login

import React, { useState } from 'react';
import DeckHomeLogo from '../components/DeckHomeLogo';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const fillDemoAdmin = () => {
    setEmail('admin@deckestimator.com');
    setPassword('AdminPass123!');
    setErrorMessage('');
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please provide both administrator email and password.');
      return;
    }

    setLoading(true);
    try {
      await adminLogin({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify administrator credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.pageWrap}>
      {/* Background Accent Gradients */}
      <div style={styles.bgGlowTop} />
      <div style={styles.bgGlowBottom} />

      <div style={styles.loginCard}>
        {/* Portal Header */}
        <div style={styles.brandHeader}>
          <div style={styles.logoBadge}>
            <DeckHomeLogo size={32} color="#ffffff" strokeWidth={2.2} />
          </div>
          <h1 style={styles.brandTitle}>DECK RESTORATION PLUS</h1>
          <div style={styles.portalTag}>ADMINISTRATIVE MANAGEMENT PORTAL</div>
          <p style={styles.tagline}>Secure single-point oversight for platform governance, catalog, and operations.</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={styles.errorBanner}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: '13px', color: '#991b1b', lineHeight: '1.4' }}>{errorMessage}</span>
          </div>
        )}

        {/* Demo Credentials Quick-Fill Banner */}
        <div style={styles.demoBox}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#93c5fd', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Standard Admin Access
            </span>
            <button
              type="button"
              onClick={fillDemoAdmin}
              style={styles.demoFillBtn}
            >
              Autofill Credentials
            </button>
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px', fontFamily: 'monospace' }}>
            <div>Email: <strong style={{ color: '#ffffff' }}>admin@deckestimator.com</strong></div>
            <div>Password: <strong style={{ color: '#ffffff' }}>AdminPass123!</strong></div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Administrator Email</label>
            <div style={styles.inputWrap}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@deckestimator.com"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={styles.label}>Access Key / Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.toggleBtn}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={styles.inputWrap}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={styles.input}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={styles.spinner} />
                Authenticating Administrator...
              </span>
            ) : (
              'Enter Admin Portal'
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div style={styles.footerNotice}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Authorized executive access only. All actions are logged and audited.</span>
        </div>

        {/* Client & Contractor Links */}
        <div style={styles.switchPortalBar}>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Customer or Contractor?</span>
          <Link to="/login" style={styles.publicLoginLink}>Public Portal Login &rarr;</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a1628',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  bgGlowTop: {
    position: 'absolute',
    top: '-150px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(29, 78, 216, 0.28) 0%, rgba(10, 22, 40, 0) 70%)',
    pointerEvents: 'none',
  },
  bgGlowBottom: {
    position: 'absolute',
    bottom: '-120px',
    right: '10%',
    width: '450px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(10, 22, 40, 0) 70%)',
    pointerEvents: 'none',
  },
  loginCard: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: '#0f2038',
    border: '1px solid #1e3a5f',
    borderRadius: '16px',
    padding: '40px 36px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    position: 'relative',
    zIndex: 10,
  },
  brandHeader: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  logoBadge: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#1d4ed8',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    boxShadow: '0 8px 16px rgba(29, 78, 216, 0.35)',
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '1px',
    margin: '0 0 6px 0',
  },
  portalTag: {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  tagline: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    lineHeight: '1.4',
    margin: 0,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '20px',
  },
  demoBox: {
    backgroundColor: '#132847',
    border: '1px solid #1e40af',
    borderRadius: '10px',
    padding: '12px 14px',
    marginBottom: '20px',
  },
  demoFillBtn: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#cbd5e1',
    letterSpacing: '0.3px',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#38bdf8',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#0a1628',
    border: '1px solid #1e3a5f',
    borderRadius: '8px',
    padding: '10px 14px',
    transition: 'border-color 0.15s ease',
  },
  inputIcon: {
    marginRight: '10px',
    flexShrink: 0,
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '0.9rem',
    width: '100%',
  },
  submitBtn: {
    marginTop: '6px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    fontSize: '0.92rem',
    fontWeight: '700',
    padding: '12px 20px',
    borderRadius: '8px',
    border: '2px solid #ef4444',
    boxShadow: '0 4px 12px rgba(29, 78, 216, 0.4)',
    transition: 'all 0.15s ease',
  },
  spinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  footerNotice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #1e3a5f',
    color: '#64748b',
    fontSize: '0.72rem',
    textAlign: 'center',
  },
  switchPortalBar: {
    marginTop: '16px',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
  },
  publicLoginLink: {
    color: '#38bdf8',
    fontSize: '12px',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

