// =============================================
// Deck Estimator — Password Reset Page
// =============================================
// Receives token and email from dispatched email link (?token=...&email=...)
// Requires user to verify their email address and enter their new password
// Uses the pure CSS V-Grade triple dots loader during submission

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import mainLogo from '../../../assets/images/Main_Logo_v2.png';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenFromUrl = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (tokenFromUrl) setToken(tokenFromUrl);
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [tokenFromUrl, emailFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedToken = token.trim();

    if (!trimmedEmail) {
      setErrorMsg('Email address is required for account lookup verification.');
      return;
    }

    if (!trimmedToken) {
      setErrorMsg('Password reset token is missing. Please check your reset link or request a new one.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authApi.resetPassword({
        token: trimmedToken,
        email: trimmedEmail,
        newPassword,
        confirmPassword,
      });

      setSuccessMsg(res?.message || 'Your password has been successfully reset. You can now sign in with your new credentials.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to reset password. The link may have expired or does not match this email address.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Brand Header */}
        <div style={styles.brandHeader}>
          <img src={mainLogo} alt="Deck Restoration Plus" style={styles.logo} />
          <h1 style={styles.title}>Reset Account Password</h1>
          <p style={styles.subtitle}>
            Enter your registered email address and choose a secure new password.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={styles.alertError}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
            </svg>
            <span style={{ marginLeft: 8, flex: 1 }}>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '800', color: '#065f46' }}>
              Password Reset Complete!
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: '#047857', lineHeight: '1.5' }}>
              {successMsg}
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={styles.btnPrimary}
            >
              Sign In to Your Account →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Registered Email (Lookup Verification) */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Registered Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={styles.inputWrap}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={styles.inputIcon}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  style={styles.input}
                  disabled={submitting}
                />
              </div>
              <span style={styles.hint}>Used to verify identity against the security token.</span>
            </div>

            {/* Hidden / Editable Token */}
            {!tokenFromUrl && (
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Reset Security Token <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste 64-character token from email"
                  required
                  style={styles.inputPlain}
                  disabled={submitting}
                />
              </div>
            )}

            {/* New Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                New Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={styles.inputWrap}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={styles.inputIcon}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  style={styles.input}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Confirm New Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={styles.inputWrap}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={styles.inputIcon}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  minLength={8}
                  style={styles.input}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Submit Button with pure CSS V-Grade Triple Dots Loader */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                ...styles.btnPrimary,
                opacity: submitting ? 0.75 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="ld-dots" style={{ '--ink': '#ffffff', marginRight: '10px' }}><i></i><i></i><i></i></div>
                  <span>Updating Password...</span>
                </span>
              ) : (
                'Save New Password & Sign In'
              )}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <span style={{ color: '#64748b' }}>Remember your password?</span>{' '}
          <Link to="/login" style={styles.link}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: '24px 16px',
    boxSizing: 'border-box',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    padding: '36px 32px',
    boxShadow: '0 10px 25px -5px rgba(15, 44, 89, 0.08), 0 8px 10px -6px rgba(15, 44, 89, 0.04)',
    boxSizing: 'border-box',
  },
  brandHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logo: {
    height: '48px',
    objectFit: 'contain',
    marginBottom: '14px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0F2C59',
    margin: '0 0 6px',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
    lineHeight: '1.5',
  },
  alertError: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '12px 14px',
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    borderRadius: '8px',
    border: '1px solid #FECACA',
    fontSize: '12.5px',
    marginBottom: '18px',
    lineHeight: '1.4',
  },
  successBox: {
    textAlign: 'center',
    padding: '20px 10px',
  },
  successIcon: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 auto 16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '6px',
  },
  hint: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '4px',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    padding: '0 12px',
    height: '42px',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  },
  inputIcon: {
    marginRight: '10px',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '13.5px',
    color: '#0F2C59',
  },
  inputPlain: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#0F2C59',
    boxSizing: 'border-box',
    outline: 'none',
  },
  eyeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '4px 6px',
  },
  btnPrimary: {
    width: '100%',
    height: '44px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(3, 78, 162, 0.25)',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '4px',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '13px',
    paddingTop: '16px',
    borderTop: '1px solid #F1F5F9',
  },
  link: {
    color: '#034EA2',
    fontWeight: '700',
    textDecoration: 'none',
  },
};
