// =============================================
// Deck Estimator — Login Form Component
// =============================================

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../../../api/apiErrors';

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(null);

  const fillDemo = (email, password) => {
    setFormData({ email, password });
    setError(null);
    setTouched({});
  };

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
    if (touched.email) {
      if (!formData.email.trim()) {
        errs.email = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errs.email = 'Please enter a valid email address (e.g. name@example.com).';
      }
    }
    if (touched.password && !formData.password) {
      errs.password = 'Password is required.';
    }
    return errs;
  }, [formData, touched]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    setTouched({ email: true, password: true });

    if (!formData.email.trim() || !isValidEmail || !formData.password) {
      return;
    }

    setSubmitting(true);

    try {
      const data = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      setLoginSuccess(
        `Welcome back, ${data.user?.fullName || 'User'}! Redirecting to your dashboard...`
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
    <div style={styles.card}>
      {/* Brand Header */}
      <div style={styles.header}>
        <div style={styles.brandBadge}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span style={styles.brandTitle}>
            DECK <span style={{ color: '#1E3E62' }}>RESTORATION PLUS</span>
          </span>
        </div>
        <h1 style={styles.title}>Sign in to your account</h1>
        <p style={styles.subtitle}>
          Access your interactive estimates, blueprints, and project portal.
        </p>
      </div>

      {/* Quick Demo Role Selectors */}
      <div style={styles.demoBox}>
        <span style={styles.demoLabel}>Demo Quick-Fill:</span>
        <div style={styles.demoChipsRow}>
          <button
            type="button"
            onClick={() => fillDemo('customer@example.com', 'Password123!')}
            style={styles.demoChip}
            title="Login as Homeowner Customer"
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => fillDemo('alex.builder@example.com', 'Password123!')}
            style={styles.demoChip}
            title="Login as Approved Contractor"
          >
            Contractor
          </button>
          <button
            type="button"
            onClick={() => fillDemo('admin@deckestimator.com', 'AdminPass123!')}
            style={styles.demoChip}
            title="Login as Platform Administrator"
          >
            Admin
          </button>
        </div>
      </div>

      {loginSuccess && (
        <div style={styles.successBanner}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{loginSuccess}</span>
        </div>
      )}

      {error && !loginSuccess && (
        <div style={styles.errorBanner}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email Address */}
        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={styles.inputLabel}>
              Email Address *
            </label>
            {touched.email && isValidEmail && (
              <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: '600' }}>Valid email format</span>
            )}
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="name@example.com"
            style={{
              ...styles.inputField,
              border: fieldErrors.email ? '1px solid #ef4444' : touched.email && isValidEmail ? '1px solid #3b82f6' : '1px solid #cbd5e1',
              backgroundColor: fieldErrors.email ? '#fef2f2' : '#ffffff',
            }}
          />
          {fieldErrors.email && (
            <p style={styles.fieldError}>{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={styles.inputLabel}>
              Password *
            </label>
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="••••••••"
            style={{
              ...styles.inputField,
              border: fieldErrors.password ? '1px solid #ef4444' : touched.password && formData.password ? '1px solid #3b82f6' : '1px solid #cbd5e1',
              backgroundColor: fieldErrors.password ? '#fef2f2' : '#ffffff',
            }}
          />
          {fieldErrors.password && (
            <p style={styles.fieldError}>{fieldErrors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || Boolean(loginSuccess)}
          style={{
            ...styles.submitBtn,
            backgroundColor: submitting || loginSuccess ? '#94a3b8' : '#1d4ed8',
            cursor: submitting || loginSuccess ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Authenticating...' : loginSuccess ? 'Redirecting...' : 'Sign In'}
        </button>
      </form>

      {/* Switch to Register */}
      <div style={styles.footerRow}>
        <span>Don't have an account?</span>{' '}
        <Link to="/register" style={styles.footerLink}>
          Create account
        </Link>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '36px 32px',
    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
  },
  header: {
    textAlign: 'left',
    marginBottom: '20px',
  },
  brandBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.3px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '0.88rem',
    color: '#64748b',
    marginTop: '6px',
  },
  demoBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '10px 14px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  demoLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  demoChipsRow: {
    display: 'flex',
    gap: '8px',
  },
  demoChip: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#1d4ed8',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  successBanner: {
    backgroundColor: '#dcfce7',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    padding: '12px 14px',
    borderRadius: '8px',
    fontSize: '0.88rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '18px',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '12px 14px',
    borderRadius: '8px',
    fontSize: '0.88rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '18px',
  },
  inputLabel: {
    fontSize: '0.86rem',
    fontWeight: '600',
    color: '#334155',
  },
  inputField: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.92rem',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  },
  fieldError: {
    margin: '4px 0 0',
    fontSize: '0.80rem',
    color: '#b91c1c',
    fontWeight: '500',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    color: '#ffffff',
    border: '2px solid #ef4444',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '700',
    transition: 'background-color 0.15s ease',
    boxShadow: '0 4px 10px rgba(29, 78, 216, 0.2)',
  },
  footerRow: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '0.88rem',
    color: '#64748b',
  },
  footerLink: {
    color: '#1d4ed8',
    fontWeight: '700',
    textDecoration: 'none',
  },
};
