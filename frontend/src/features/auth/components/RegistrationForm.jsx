// =============================================
// Deck Estimator — Registration Form Component
// =============================================

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../../../api/apiErrors';

export function RegistrationForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    businessName: '',
    licenseNumber: '',
    licenseJurisdiction: '',
  });

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [emailConflict, setEmailConflict] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email') {
      setEmailConflict(false);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // Password rules checklist
  const passwordCheck = useMemo(() => {
    const p = formData.password || '';
    return {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
    };
  }, [formData.password]);

  const isPasswordValid = Object.values(passwordCheck).every(Boolean);

  // Validation rules
  const errors = useMemo(() => {
    const errs = {};

    // Full name
    if (touched.fullName) {
      if (!formData.fullName.trim()) {
        errs.fullName = 'Full name is required.';
      } else if (formData.fullName.trim().length < 2) {
        errs.fullName = 'Full name must be at least 2 characters.';
      }
    }

    // Email
    if (touched.email || emailConflict) {
      if (!formData.email.trim()) {
        errs.email = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errs.email = 'Please enter a valid email address (e.g. name@example.com).';
      } else if (emailConflict) {
        errs.email = 'This email is already registered. Please log in or use another email.';
      }
    }

    // Phone
    if (touched.phone && formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/[\s\-().+]/g, '');
      if (cleanPhone.length < 10) {
        errs.phone = 'Please enter a valid 10-digit phone number.';
      }
    }

    // Password
    if (touched.password && !isPasswordValid) {
      errs.password = 'Password does not meet all security requirements.';
    }

    // Confirm password
    if (touched.confirmPassword) {
      if (!formData.confirmPassword) {
        errs.confirmPassword = 'Please confirm your password.';
      } else if (formData.confirmPassword !== formData.password) {
        errs.confirmPassword = 'Passwords do not match.';
      }
    }

    // Contractor specific
    if (formData.role === 'contractor') {
      if (touched.businessName && !formData.businessName.trim()) {
        errs.businessName = 'Business name is required for contractor registration.';
      }
      if (touched.licenseNumber && !formData.licenseNumber.trim()) {
        errs.licenseNumber = 'Contractor license number is required.';
      }
    }

    return errs;
  }, [formData, touched, isPasswordValid, emailConflict]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) && !emailConflict;
  const isPasswordsMatching = formData.confirmPassword && formData.confirmPassword === formData.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    // Mark all as touched
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      businessName: true,
      licenseNumber: true,
    });

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) return;
    if (!isValidEmail) return;
    if (!isPasswordValid) return;
    if (!isPasswordsMatching) return;
    if (formData.role === 'contractor' && (!formData.businessName.trim() || !formData.licenseNumber.trim())) return;

    setSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: formData.role,
      };

      if (formData.role === 'contractor') {
        payload.businessName = formData.businessName.trim();
        payload.licenseNumber = formData.licenseNumber.trim();
        if (formData.licenseJurisdiction) {
          payload.licenseJurisdiction = formData.licenseJurisdiction.trim();
        }
      }

      const data = await register(payload);

      setRegistrationSuccess(
        data.user.role === 'contractor'
          ? `Account created successfully! Welcome to Deck Pro, ${data.user.fullName || 'Contractor'}. Redirecting to business verification...`
          : `Account created successfully! Welcome to Deck Pro, ${data.user.fullName || 'Customer'}. Redirecting to your dashboard...`
      );

      setTimeout(() => {
        if (data.user.role === 'contractor') {
          navigate('/contractor/verification-request');
        } else {
          navigate('/customer/dashboard');
        }
      }, 1500);
    } catch (err) {
      const msg = getErrorMessage(err);
      if (
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('duplicate') ||
        err.response?.status === 409
      ) {
        setEmailConflict(true);
        setServerError('This email is already registered. Please log in or use another email.');
      } else {
        setServerError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '520px',
        margin: '2rem auto',
        padding: '2.5rem',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>
          Join DECK PRO
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.925rem', marginTop: '0.35rem' }}>
          Create your account to start calculating and managing professional deck estimates.
        </p>
      </div>

      {registrationSuccess && (
        <div
          style={{
            padding: '1rem',
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
          <span>{registrationSuccess}</span>
        </div>
      )}

      {serverError && !registrationSuccess && (
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
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Role Selection Tabs */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>
            I want to register as:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, role: 'customer' }))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: formData.role === 'customer' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: formData.role === 'customer' ? '#eff6ff' : '#f8fafc',
                color: formData.role === 'customer' ? '#1d4ed8' : '#475569',
                fontWeight: formData.role === 'customer' ? '700' : '500',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Homeowner / Customer
            </button>
            <button
              type="button"
              data-role-btn="contractor"
              onClick={() => setFormData((p) => ({ ...p, role: 'contractor' }))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: formData.role === 'contractor' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: formData.role === 'contractor' ? '#eff6ff' : '#f8fafc',
                color: formData.role === 'contractor' ? '#1d4ed8' : '#475569',
                fontWeight: formData.role === 'contractor' ? '700' : '500',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
              Deck Contractor
            </button>
          </div>
        </div>

        {/* Full Name */}
        <div style={{ marginBottom: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Full Name *</label>
            {touched.fullName && !errors.fullName && formData.fullName.trim() && (
              <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>✓ Valid</span>
            )}
          </div>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. John Smith"
            style={{
              width: '100%',
              padding: '0.7rem 0.85rem',
              borderRadius: '6px',
              border: errors.fullName ? '1px solid #ef4444' : touched.fullName && formData.fullName ? '1px solid #22c55e' : '1px solid #cbd5e1',
              background: errors.fullName ? '#fef2f2' : '#ffffff',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.fullName && (
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#dc2626' }}>{errors.fullName}</p>
          )}
        </div>

        {/* Email Address */}
        <div style={{ marginBottom: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Email Address *</label>
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
              border: errors.email ? '1px solid #ef4444' : touched.email && isValidEmail ? '1px solid #22c55e' : '1px solid #cbd5e1',
              background: errors.email ? '#fef2f2' : '#ffffff',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.email && (
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#dc2626', fontWeight: emailConflict ? '600' : '400' }}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Phone Number (Optional)</label>
            {formData.phone && !errors.phone && (
              <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>✓ Valid</span>
            )}
          </div>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="(555) 123-4567"
            style={{
              width: '100%',
              padding: '0.7rem 0.85rem',
              borderRadius: '6px',
              border: errors.phone ? '1px solid #ef4444' : '1px solid #cbd5e1',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.phone && (
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#dc2626' }}>{errors.phone}</p>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Password *</label>
            {isPasswordValid && (
              <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>✓ Strong password</span>
            )}
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Create a secure password"
            style={{
              width: '100%',
              padding: '0.7rem 0.85rem',
              borderRadius: '6px',
              border: errors.password ? '1px solid #ef4444' : isPasswordValid ? '1px solid #22c55e' : '1px solid #cbd5e1',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {/* Real-time Checklist */}
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.65rem 0.85rem',
              background: '#f8fafc',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontSize: '0.785rem',
            }}
          >
            <p style={{ margin: '0 0 0.35rem', fontWeight: '600', color: '#475569' }}>Password must include:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 0.75rem' }}>
              <span style={{ color: passwordCheck.length ? '#16a34a' : '#94a3b8' }}>
                {passwordCheck.length ? '✓' : '○'} At least 8 characters
              </span>
              <span style={{ color: passwordCheck.upper ? '#16a34a' : '#94a3b8' }}>
                {passwordCheck.upper ? '✓' : '○'} Uppercase letter (A-Z)
              </span>
              <span style={{ color: passwordCheck.lower ? '#16a34a' : '#94a3b8' }}>
                {passwordCheck.lower ? '✓' : '○'} Lowercase letter (a-z)
              </span>
              <span style={{ color: passwordCheck.number ? '#16a34a' : '#94a3b8' }}>
                {passwordCheck.number ? '✓' : '○'} At least 1 number (0-9)
              </span>
              <span style={{ color: passwordCheck.special ? '#16a34a' : '#94a3b8' }}>
                {passwordCheck.special ? '✓' : '○'} Special character (!@#$)
              </span>
            </div>
          </div>
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Confirm Password *</label>
            {isPasswordsMatching && (
              <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>✓ Passwords match</span>
            )}
          </div>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Re-enter password"
            style={{
              width: '100%',
              padding: '0.7rem 0.85rem',
              borderRadius: '6px',
              border: errors.confirmPassword ? '1px solid #ef4444' : isPasswordsMatching ? '1px solid #22c55e' : '1px solid #cbd5e1',
              background: errors.confirmPassword ? '#fef2f2' : '#ffffff',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {errors.confirmPassword && (
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#dc2626' }}>{errors.confirmPassword}</p>
          )}
        </div>

        {/* Contractor Specific Fields */}
        {formData.role === 'contractor' && (
          <div
            style={{
              marginBottom: '1.25rem',
              padding: '1rem',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
            }}
          >
            <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: '700' }}>
              Contractor Business Profile
            </h4>

            {/* Business Name */}
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: '#334155', marginBottom: '0.25rem' }}>
                Business Name *
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Apex Deck Restoration LLC"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  border: errors.businessName ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
              {errors.businessName && (
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#dc2626' }}>{errors.businessName}</p>
              )}
            </div>

            {/* License Number */}
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: '#334155', marginBottom: '0.25rem' }}>
                Contractor License # *
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="LIC-12345678"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  border: errors.licenseNumber ? '1px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
              {errors.licenseNumber && (
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#dc2626' }}>{errors.licenseNumber}</p>
              )}
            </div>

            {/* License Jurisdiction */}
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: '600', color: '#334155', marginBottom: '0.25rem' }}>
                Issuing State / Jurisdiction
              </label>
              <input
                type="text"
                name="licenseJurisdiction"
                value={formData.licenseJurisdiction}
                onChange={handleChange}
                placeholder="e.g. California, Texas"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || Boolean(registrationSuccess)}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: submitting || registrationSuccess ? '#94a3b8' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: submitting || registrationSuccess ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
          }}
        >
          {submitting ? 'Creating Account...' : registrationSuccess ? 'Account Created ✓' : 'Complete Registration'}
        </button>
      </form>

      <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}>
          Sign In here →
        </Link>
      </div>
    </div>
  );
}
