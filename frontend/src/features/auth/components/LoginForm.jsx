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
          navigate('/contractor/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      }, 1000);
    } catch (err) {
      // In accordance with security guidelines (Correction 3):
      // Use secure generic credential error to prevent account enumeration
      const msg = getErrorMessage(err);
      if (
        msg.toLowerCase().includes('invalid') ||
        msg.toLowerCase().includes('password') ||
        msg.toLowerCase().includes('credential') ||
        msg.toLowerCase().includes('not found') ||
        err.response?.status === 401
      ) {
        setError('Invalid email or password. Please verify your credentials or register for an account.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '440px',
        margin: '3rem auto',
        padding: '2.5rem',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>
          Sign In to DECK PRO
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.925rem', marginTop: '0.35rem' }}>
          Enter your credentials to access your estimates and deck projects.
        </p>
      </div>

      {loginSuccess && (
        <div
          style={{
            padding: '0.9rem 1rem',
            marginBottom: '1.5rem',
            background: '#ecfdf5',
            border: '1px solid #10b981',
            color: '#065f46',
            borderRadius: '8px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>✓</span>
          <span>{loginSuccess}</span>
        </div>
      )}

      {error && !loginSuccess && (
        <div
          style={{
            padding: '0.9rem 1rem',
            marginBottom: '1.5rem',
            background: '#fef2f2',
            border: '1px solid #f87171',
            color: '#991b1b',
            borderRadius: '8px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email Address */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
              Email Address *
            </label>
            {touched.email && isValidEmail && (
              <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>✓ Valid format</span>
            )}
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="you@example.com"
            style={{
              width: '100%',
              padding: '0.7rem 0.85rem',
              borderRadius: '6px',
              border: fieldErrors.email ? '1px solid #ef4444' : touched.email && isValidEmail ? '1px solid #22c55e' : '1px solid #cbd5e1',
              background: fieldErrors.email ? '#fef2f2' : '#ffffff',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {fieldErrors.email && (
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#dc2626' }}>{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
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
              width: '100%',
              padding: '0.7rem 0.85rem',
              borderRadius: '6px',
              border: fieldErrors.password ? '1px solid #ef4444' : touched.password && formData.password ? '1px solid #22c55e' : '1px solid #cbd5e1',
              background: fieldErrors.password ? '#fef2f2' : '#ffffff',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {fieldErrors.password && (
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#dc2626' }}>{fieldErrors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || Boolean(loginSuccess)}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: submitting || loginSuccess ? '#94a3b8' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: submitting || loginSuccess ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
          }}
        >
          {submitting ? 'Authenticating...' : loginSuccess ? 'Signed In ✓' : 'Sign In'}
        </button>
      </form>

      <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
          Create an account here →
        </Link>
      </div>
    </div>
  );
}
