// =============================================
// Deck Estimator — Login Form Component
// Matches UI Reference: Floating White Card, Pill Inputs & Glossy Button
// =============================================

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../../../api/apiErrors';
import mainLogo from '../../../assets/images/Main_Logo_v2.png';

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const fieldErrors = useMemo(() => {
    const errs = {};
    const trimmedEmail = formData.email.trim();
    if (touched.email) {
      if (!trimmedEmail) {
        errs.email = 'Email address is required.';
      } else if (trimmedEmail.length > 254) {
        errs.email = 'Email address must not exceed 254 characters.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        errs.email = 'Please enter a valid email address.';
      }
    }
    if (touched.password) {
      if (!formData.password) {
        errs.password = 'Password is required.';
      } else if (formData.password.length > 128) {
        errs.password = 'Password must not exceed 128 characters.';
      }
    }
    return errs;
  }, [formData, touched]);

  const trimmedEmail = formData.email.trim();
  const isValidEmail =
    trimmedEmail.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setTouched({ email: true, password: true });

    if (!trimmedEmail || !isValidEmail || !formData.password || formData.password.length > 128) {
      return;
    }

    setSubmitting(true);

    try {
      const data = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      setLoginSuccess(
        `Welcome back, ${data.user?.fullName || 'User'}! Redirecting...`
      );

      setTimeout(() => {
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.user.role === 'contractor') {
          const isApproved = data.contractorProfile?.verificationStatus === 'approved';
          navigate(isApproved ? '/contractor/dashboard' : '/contractor/verification-request');
        } else {
          navigate('/customer/dashboard');
        }
      }, 500);
    } catch (err) {
      const msg = getErrorMessage(err);
      if (err?.response?.status === 401) {
        setError('Invalid email or password. Please verify your credentials or register for an account.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.card} className="auth-card">
      {/* Decorative Wave Gradient at bottom inside card */}
      <div style={styles.cardBottomWave} />

      {/* Brand Header */}
      <div style={styles.header} className="auth-header">
        <div style={styles.logoWrap} className="auth-logo-wrap">
          <img
            src={mainLogo}
            alt="Deck Restoration Plus"
            style={styles.logoImg}
            className="auth-logo-img"
          />
        </div>
        <h1 style={styles.title} className="auth-title">Sign in to your account</h1>
        <p style={styles.subtitle} className="auth-subtitle">
          Access your interactive estimates, blueprints, and project portal.
        </p>
      </div>

      {/* Success Notification Banner */}
      {loginSuccess && (
        <div style={styles.successBanner} className="auth-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{loginSuccess}</span>
        </div>
      )}

      {/* Error Alert Banner */}
      {error && !loginSuccess && (
        <div style={styles.errorBanner} className="auth-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Real-time Login Form */}
      <form onSubmit={handleSubmit} noValidate style={styles.form} className="auth-form">
        {/* Email Field */}
        <div style={styles.fieldGroup} className="auth-field-group">
          <label htmlFor="login-email" style={styles.label} className="auth-label">Email Address *</label>
          <div
            className="auth-input-wrap"
            style={{
              ...styles.inputWrap,
              borderColor: fieldErrors.email ? '#ef4444' : touched.email && isValidEmail ? '#22c55e' : '#D0E1F9',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon} className="auth-input-icon">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              maxLength={254}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="name@example.com"
              style={styles.input}
              className="auth-input"
              disabled={submitting}
            />
          </div>
          {fieldErrors.email && (
            <p style={styles.fieldErrorText} className="auth-field-error">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div style={styles.fieldGroup} className="auth-field-group">
          <div style={styles.labelRow} className="auth-label-row">
            <label htmlFor="login-password" style={styles.label} className="auth-label">Password *</label>
          </div>
          <div
            className="auth-input-wrap"
            style={{
              ...styles.inputWrap,
              borderColor: fieldErrors.password ? '#ef4444' : '#D0E1F9',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon} className="auth-input-icon">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              maxLength={128}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••••••"
              style={styles.input}
              className="auth-input"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={styles.eyeBtn}
              className="auth-eye-btn"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p style={styles.fieldErrorText} className="auth-field-error">{fieldErrors.password}</p>
          )}
        </div>

        {/* Shiny Royal Navy Blue Submit Button */}
        <button
          type="submit"
          disabled={submitting || Boolean(loginSuccess)}
          className="auth-submit-btn"
          style={{
            ...styles.submitBtn,
            opacity: submitting || loginSuccess ? 0.75 : 1,
            cursor: submitting || loginSuccess ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? (
            <span style={styles.btnContent}>
              <span style={styles.spinner} />
              <span>Signing In...</span>
            </span>
          ) : (
            <span style={styles.btnContent}>
              <span>Sign In</span>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          )}
        </button>
      </form>

      {/* Bottom Switch Link */}
      <div style={styles.footerLinkWrap} className="auth-footer-link-wrap">
        <span style={styles.footerPrompt}>Don't have an account? </span>
        <Link to="/register" style={styles.footerLink}>
          Create Account
        </Link>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)',
    padding: '30px 32px 26px 32px',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid rgba(226, 232, 240, 0.8)',
  },
  cardBottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '36px',
    background: 'linear-gradient(180deg, transparent 0%, rgba(220, 238, 255, 0.55) 100%)',
    pointerEvents: 'none',
    borderBottomLeftRadius: '20px',
    borderBottomRightRadius: '20px',
  },
  header: {
    marginBottom: '18px',
    textAlign: 'center',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px',
    width: '100%',
  },
  logoImg: {
    maxHeight: '58px',
    maxWidth: '220px',
    width: 'auto',
    objectFit: 'contain',
    display: 'block',
    margin: '0 auto',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0F172A',
    margin: '0 0 6px 0',
    letterSpacing: '-0.3px',
    lineHeight: 1.25,
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
    lineHeight: 1.45,
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    backgroundColor: '#ECFDF5',
    border: '1px solid #10B981',
    borderRadius: '12px',
    color: '#065F46',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '20px',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #F87171',
    borderRadius: '12px',
    color: '#991B1B',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    position: 'relative',
    zIndex: 2,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    width: '100%',
    boxSizing: 'border-box',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: '7px',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#F0F6FF',
    border: '1px solid #D0E1F9',
    borderRadius: '12px',
    padding: '0 14px',
    height: '48px',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    transition: 'all 0.15s ease',
  },
  inputIcon: {
    flexShrink: 0,
    marginRight: '10px',
  },
  input: {
    flex: 1,
    minWidth: 0,
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14.5px',
    color: '#0F172A',
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
    color: '#64748B',
    marginLeft: '8px',
  },
  fieldErrorText: {
    fontSize: '12px',
    color: '#DC2626',
    margin: '5px 0 0 2px',
    fontWeight: '500',
  },
  submitBtn: {
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(180deg, #0A58CA 0%, #033B85 100%)',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '700',
    marginTop: '6px',
    boxShadow: '0 8px 22px rgba(3, 59, 133, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
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
  footerLinkWrap: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '13.5px',
    color: '#64748B',
    position: 'relative',
    zIndex: 2,
  },
  footerPrompt: {
    color: '#64748B',
  },
  footerLink: {
    color: '#033B85',
    fontWeight: '700',
    textDecoration: 'none',
    marginLeft: '4px',
  },
};
