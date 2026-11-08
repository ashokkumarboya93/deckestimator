// =============================================
// Deck Estimator — Dedicated Admin Portal Login
// Modern Split Layout matching UI Specification with Executive Admin Card
// =============================================

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import mainLogo from '../../../assets/images/MainLodo.png';

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const from = location.state?.from?.pathname || '/admin/dashboard';

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both administrator email and password.');
      return;
    }

    setLoading(true);
    try {
      await adminLogin({ email: email.trim().toLowerCase(), password });
      setSuccessMessage('Administrator credentials verified. Accessing console...');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify administrator credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.pageContainer}>
      {/* Left Column: Executive Admin Login Card */}
      <div style={styles.formColumn}>
        <div style={styles.formWrapper}>
          <div style={styles.card}>
            {/* Subtle Top Glow Accent */}
            <div style={styles.cardGlowAccent} />

            {/* Brand Header */}
            <div style={styles.header}>
              <div style={styles.logoWrap}>
                <img
                  src={mainLogo}
                  alt="Deck Restoration Plus"
                  style={styles.logoImg}
                />
              </div>

              {/* Administrative Gateway Badge */}
              <div style={styles.adminBadge}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E08131" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <span>ADMINISTRATIVE CONSOLE GATEWAY</span>
              </div>

              <h1 style={styles.title}>Administrative Sign In</h1>
              <p style={styles.subtitle}>
                Secure single-point access to platform governance, contractor verifications, and financial controls.
              </p>
            </div>

            {/* Success Alert */}
            {successMessage && (
              <div style={styles.successBanner}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Alert */}
            {errorMessage && !successMessage && (
              <div style={styles.errorBanner}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Real-time Administrator Form */}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Administrator Email *</label>
                <div style={styles.inputWrap}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
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
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>Access Key / Password *</label>
                </div>
                <div style={styles.inputWrap}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
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
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeBtn}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* High-impact Shiny Admin Submit Button */}
              <button
                type="submit"
                disabled={loading || Boolean(successMessage)}
                style={{
                  ...styles.submitBtn,
                  opacity: loading || successMessage ? 0.75 : 1,
                  cursor: loading || successMessage ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <span style={styles.btnContent}>
                    <span style={styles.spinner} />
                    <span>Verifying Credentials...</span>
                  </span>
                ) : (
                  <span style={styles.btnContent}>
                    <span>Authenticate &amp; Enter Console</span>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            {/* Bottom Security Notice */}
            <div style={styles.securityNotice}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Restricted Platform Gateway &bull; 256-Bit SSL Encrypted Session</span>
            </div>

            <div style={styles.switchPortalWrap}>
              <Link to="/login" style={styles.switchPortalLink}>
                &larr; Return to Customer &amp; Contractor Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Hero Visual Showcase */}
      <div style={styles.heroColumn}>
        <div style={styles.heroOverlay} />

        {/* Decorative Wave Overlay at bottom right */}
        <div style={styles.waveOverlay}>
          <svg viewBox="0 0 800 300" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path
              d="M0 200 C 250 120, 500 280, 800 140 L 800 300 L 0 300 Z"
              fill="rgba(6, 26, 56, 0.75)"
            />
            <path
              d="M0 240 C 300 160, 550 310, 800 180 L 800 300 L 0 300 Z"
              fill="rgba(3, 18, 42, 0.9)"
            />
          </svg>
        </div>

        <div style={styles.heroContent}>
          {/* Logo on Right Hero Column */}
          <div style={styles.heroLogoWrap}>
            <img
              src={mainLogo}
              alt="Deck Restoration Plus"
              style={styles.heroLogoImg}
            />
          </div>

          {/* Orange Accent Bar */}
          <div style={styles.orangeBar} />

          {/* Main Headline */}
          <h2 style={styles.heroTitle}>
            Enterprise Platform Governance &amp; Operations Control.
          </h2>

          {/* Subtitle */}
          <p style={styles.heroText}>
            Centralized administrative oversight for commercial estimates, contractor credentials, catalog pricing, and platform analytics.
          </p>

          {/* Feature Bullets with Orange Circles and Checkmarks */}
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span style={styles.featureLabel}>Real-time Contractor Licensing &amp; Verification Oversight</span>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span style={styles.featureLabel}>Catalog Pricing, Surcharge &amp; Margin Controls</span>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span style={styles.featureLabel}>Full Transaction Ledger &amp; Dispute Resolution</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#07162C',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  formColumn: {
    flex: '1 1 50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    backgroundColor: '#07162C',
    backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(14, 42, 82, 0.45) 0%, transparent 60%)',
  },
  formWrapper: {
    width: '100%',
    maxWidth: '470px',
  },
  card: {
    backgroundColor: '#0B203E',
    backgroundImage: 'linear-gradient(145deg, #0D2447 0%, #081933 100%)',
    borderRadius: '24px',
    border: '1px solid rgba(224, 129, 49, 0.3)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), 0 0 25px rgba(224, 129, 49, 0.08)',
    padding: '40px 38px 34px 38px',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    boxSizing: 'border-box',
  },
  cardGlowAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #E08131 0%, #F59E0B 50%, #E08131 100%)',
  },
  header: {
    marginBottom: '24px',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  logoImg: {
    maxHeight: '46px',
    width: 'auto',
    objectFit: 'contain',
    filter: 'brightness(1.08)',
  },
  adminBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '5px 12px',
    borderRadius: '16px',
    backgroundColor: 'rgba(224, 129, 49, 0.12)',
    border: '1px solid rgba(224, 129, 49, 0.35)',
    fontSize: '11px',
    fontWeight: '700',
    color: '#FDBA74',
    letterSpacing: '0.6px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#FFFFFF',
    margin: '0 0 8px 0',
    letterSpacing: '-0.3px',
    lineHeight: 1.25,
  },
  subtitle: {
    fontSize: '13px',
    color: '#94A3B8',
    margin: 0,
    lineHeight: 1.55,
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.4)',
    borderRadius: '12px',
    color: '#6EE7B7',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '20px',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    borderRadius: '12px',
    color: '#FCA5A5',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: '7px',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    borderRadius: '12px',
    padding: '0 14px',
    height: '48px',
    transition: 'all 0.15s ease',
  },
  inputIcon: {
    flexShrink: 0,
    marginRight: '10px',
  },
  input: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: 'inherit',
    height: '100%',
  },
  eyeBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#94A3B8',
    marginLeft: '8px',
  },
  submitBtn: {
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(180deg, #0A58CA 0%, #033B85 100%)',
    border: '1px solid rgba(224, 129, 49, 0.4)',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '700',
    marginTop: '6px',
    boxShadow: '0 8px 24px rgba(3, 59, 133, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  btnContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.35)',
    borderTopColor: '#FFFFFF',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  securityNotice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '22px',
    fontSize: '11.5px',
    color: '#64748B',
  },
  switchPortalWrap: {
    textAlign: 'center',
    marginTop: '16px',
  },
  switchPortalLink: {
    fontSize: '12.5px',
    color: '#94A3B8',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.15s ease',
  },
  heroColumn: {
    flex: '1 1 50%',
    position: 'relative',
    backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px 64px',
    color: '#ffffff',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(8, 24, 48, 0.7) 0%, rgba(4, 15, 32, 0.9) 100%)',
    zIndex: 1,
  },
  waveOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '220px',
    zIndex: 2,
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '540px',
  },
  heroLogoWrap: {
    marginBottom: '12px',
  },
  heroLogoImg: {
    maxHeight: '48px',
    width: 'auto',
    objectFit: 'contain',
    filter: 'brightness(1.08)',
  },
  orangeBar: {
    width: '46px',
    height: '4px',
    backgroundColor: '#E08131',
    borderRadius: '2px',
    marginBottom: '20px',
  },
  heroTitle: {
    fontSize: '2.25rem',
    fontWeight: '800',
    lineHeight: '1.25',
    color: '#ffffff',
    margin: '0 0 16px 0',
    letterSpacing: '-0.4px',
  },
  heroText: {
    fontSize: '1rem',
    lineHeight: '1.65',
    color: '#CBD5E1',
    margin: '0 0 32px 0',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  featureIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#E08131',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 6px rgba(224, 129, 49, 0.4)',
  },
  featureLabel: {
    fontSize: '0.98rem',
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: '-0.1px',
  },
};
