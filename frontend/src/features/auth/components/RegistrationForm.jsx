// =============================================
// Deck Estimator — Registration Form Component
// Matches UI Reference: Floating White Card, Pill Inputs & Glossy Button
// =============================================

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage, getErrorStatus } from '../../../api/apiErrors';
import mainLogo from '../../../assets/images/Main_Logo_v2.png';

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [emailConflict, setEmailConflict] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

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

  // Password rules checklist — requires at least 1 Caps and at least 1 Number
  const passwordCheck = useMemo(() => {
    const p = formData.password || '';
    return {
      upper: /[A-Z]/.test(p),
      number: /[0-9]/.test(p),
    };
  }, [formData.password]);

  const isPasswordValid = Boolean(passwordCheck.upper && passwordCheck.number);

  const errors = useMemo(() => {
    const errs = {};

    if (touched.fullName) {
      if (!formData.fullName.trim()) {
        errs.fullName = 'Full name is required.';
      } else if (formData.fullName.trim().length < 2) {
        errs.fullName = 'Full name must be at least 2 characters.';
      }
    }

    if (touched.email || emailConflict) {
      if (!formData.email.trim()) {
        errs.email = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errs.email = 'Please enter a valid email address.';
      } else if (emailConflict) {
        errs.email = 'This email is already registered. Please sign in or use another email.';
      }
    }

    if (touched.phone && formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/[\s\-().+]/g, '');
      if (cleanPhone.length < 10) {
        errs.phone = 'Please enter a valid 10-digit phone number.';
      }
    }

    if (touched.password && !isPasswordValid) {
      if (!formData.password) {
        errs.password = 'Password is required.';
      } else if (!passwordCheck.upper && !passwordCheck.number) {
        errs.password = 'Password requires at least one uppercase letter (Caps) and at least one number.';
      } else if (!passwordCheck.upper) {
        errs.password = 'Password requires at least one uppercase letter (Caps).';
      } else {
        errs.password = 'Password requires at least one number.';
      }
    }

    if (touched.confirmPassword) {
      if (!formData.confirmPassword) {
        errs.confirmPassword = 'Please confirm your password.';
      } else if (formData.confirmPassword !== formData.password) {
        errs.confirmPassword = 'Passwords do not match.';
      }
    }

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

    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      businessName: true,
      licenseNumber: true,
      licenseJurisdiction: true,
    });

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !isValidEmail ||
      !isPasswordValid ||
      !isPasswordsMatching
    ) {
      return;
    }

    if (formData.role === 'contractor' && (!formData.businessName.trim() || !formData.licenseNumber.trim())) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        ...(formData.phone.trim() ? { phone: formData.phone.trim() } : {}),
        ...(formData.role === 'contractor'
          ? {
              businessName: formData.businessName.trim(),
              licenseNumber: formData.licenseNumber.trim(),
              ...(formData.licenseJurisdiction.trim()
                ? { licenseJurisdiction: formData.licenseJurisdiction.trim() }
                : {}),
            }
          : {}),
      };

      const res = await register(payload);
      setRegistrationSuccess('Account created successfully! Preparing your workspace...');

      setTimeout(() => {
        if (formData.role === 'contractor') {
          navigate('/contractor/verification-request');
        } else {
          navigate('/customer/dashboard');
        }
      }, 800);
    } catch (err) {
      const status = getErrorStatus(err);
      const msg = getErrorMessage(err);
      if (status === 409) {
        setEmailConflict(true);
        setServerError('An account with this email address already exists. Please sign in instead.');
      } else {
        setServerError(msg || 'Registration failed. Please check your inputs and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.card}>
      {/* Decorative Wave Gradient at bottom inside card */}
      <div style={styles.cardBottomWave} />

      {/* Brand Header */}
      <div style={styles.header}>
        <div style={styles.logoWrap}>
          <img
            src={mainLogo}
            alt="Deck Restoration Plus"
            style={styles.logoImg}
          />
        </div>
        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>
          Get started with precision deck estimations and contractor workflows.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div style={styles.roleTabsWrap}>
        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, role: 'customer' }))}
          style={{
            ...styles.roleTab,
            ...(formData.role === 'customer' ? styles.roleTabActive : styles.roleTabInactive),
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Homeowner / Customer</span>
        </button>

        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, role: 'contractor' }))}
          style={{
            ...styles.roleTab,
            ...(formData.role === 'contractor' ? styles.roleTabActive : styles.roleTabInactive),
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span>Licensed Contractor</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {registrationSuccess && (
        <div style={styles.successBanner}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{registrationSuccess}</span>
        </div>
      )}

      {/* Error Alert Banner */}
      {serverError && !registrationSuccess && (
        <div style={styles.errorBanner}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{serverError}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} noValidate style={styles.form}>
        {/* Full Name */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Full Name *</label>
          <div
            style={{
              ...styles.inputWrap,
              borderColor: errors.fullName ? '#ef4444' : touched.fullName && formData.fullName.trim() ? '#22c55e' : '#D0E1F9',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              type="text"
              name="fullName"
              autoComplete="name"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. John Doe"
              style={styles.input}
              disabled={submitting}
            />
          </div>
          {errors.fullName && <p style={styles.fieldErrorText}>{errors.fullName}</p>}
        </div>

        {/* Email Address */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Email Address *</label>
          <div
            style={{
              ...styles.inputWrap,
              borderColor: errors.email ? '#ef4444' : touched.email && isValidEmail ? '#22c55e' : '#D0E1F9',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="name@example.com"
              style={styles.input}
              disabled={submitting}
            />
          </div>
          {errors.email && <p style={styles.fieldErrorText}>{errors.email}</p>}
        </div>

        {/* Phone Number */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Phone Number</label>
          <div
            style={{
              ...styles.inputWrap,
              borderColor: errors.phone ? '#ef4444' : '#D0E1F9',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="(555) 000-0000"
              style={styles.input}
              disabled={submitting}
            />
          </div>
          {errors.phone && <p style={styles.fieldErrorText}>{errors.phone}</p>}
        </div>

        {/* Contractor Specific Fields */}
        {formData.role === 'contractor' && (
          <div style={styles.contractorSection}>
            <div style={styles.contractorSectionHeader}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E08131" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Contractor Verification Details</span>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Business / Company Name *</label>
              <div
                style={{
                  ...styles.inputWrap,
                  borderColor: errors.businessName ? '#ef4444' : '#D0E1F9',
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Apex Decks LLC"
                  style={styles.input}
                  disabled={submitting}
                />
              </div>
              {errors.businessName && <p style={styles.fieldErrorText}>{errors.businessName}</p>}
            </div>

            <div className="drp-grid-collapse" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ ...styles.fieldGroup, minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
                <label style={styles.label}>License Number *</label>
                <div
                  style={{
                    ...styles.inputWrap,
                    borderColor: errors.licenseNumber ? '#ef4444' : '#D0E1F9',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="LIC-123456"
                    style={styles.input}
                    disabled={submitting}
                  />
                </div>
                {errors.licenseNumber && <p style={styles.fieldErrorText}>{errors.licenseNumber}</p>}
              </div>

              <div style={{ ...styles.fieldGroup, minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
                <label style={styles.label}>Jurisdiction / State</label>
                <div style={styles.inputWrap}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <input
                    type="text"
                    name="licenseJurisdiction"
                    value={formData.licenseJurisdiction}
                    onChange={handleChange}
                    placeholder="e.g. New Jersey"
                    style={styles.input}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password */}
        <div style={styles.fieldGroup}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Password *</label>
            {isPasswordValid && (
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>✓ Strong</span>
            )}
          </div>
          <div
            style={{
              ...styles.inputWrap,
              borderColor: errors.password ? '#ef4444' : isPasswordValid ? '#22c55e' : '#D0E1F9',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Create secure password"
              style={styles.input}
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={styles.eyeBtn}
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

          {/* Real-time Checklist: Only 1 Caps and 1 Number required */}
          <div style={styles.passwordRulesBox}>
            <span style={{ color: passwordCheck.upper ? '#16a34a' : '#64748b', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800' }}>{passwordCheck.upper ? '✓' : '○'}</span>
              <span>At least 1 Uppercase (Caps)</span>
            </span>
            <span style={{ color: passwordCheck.number ? '#16a34a' : '#64748b', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800' }}>{passwordCheck.number ? '✓' : '○'}</span>
              <span>At least 1 Number</span>
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div style={styles.fieldGroup}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Confirm Password *</label>
            {isPasswordsMatching && (
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>✓ Matches</span>
            )}
          </div>
          <div
            style={{
              ...styles.inputWrap,
              borderColor: errors.confirmPassword ? '#ef4444' : isPasswordsMatching ? '#22c55e' : '#D0E1F9',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={styles.inputIcon}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Re-enter password"
              style={styles.input}
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              style={styles.eyeBtn}
              title={showConfirmPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
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
          {errors.confirmPassword && <p style={styles.fieldErrorText}>{errors.confirmPassword}</p>}
        </div>

        {/* Shiny Royal Navy Blue Submit Button */}
        <button
          type="submit"
          disabled={submitting || Boolean(registrationSuccess)}
          style={{
            ...styles.submitBtn,
            opacity: submitting || registrationSuccess ? 0.75 : 1,
            cursor: submitting || registrationSuccess ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? (
            <span style={styles.btnContent}>
              <span style={styles.spinner} />
              <span>Creating Account...</span>
            </span>
          ) : (
            <span style={styles.btnContent}>
              <span>Create Account</span>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          )}
        </button>
      </form>

      {/* Bottom Switch Link */}
      <div style={styles.footerLinkWrap}>
        <span style={styles.footerPrompt}>Already have an account? </span>
        <Link to="/login" style={styles.footerLink}>
          Sign In
        </Link>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)',
    padding: '38px 36px 34px 36px',
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
    height: '42px',
    background: 'linear-gradient(180deg, transparent 0%, rgba(220, 238, 255, 0.55) 100%)',
    pointerEvents: 'none',
    borderBottomLeftRadius: '24px',
    borderBottomRightRadius: '24px',
  },
  header: {
    marginBottom: '22px',
    textAlign: 'center',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '18px',
    width: '100%',
  },
  logoImg: {
    maxHeight: '75px',
    maxWidth: '260px',
    width: 'auto',
    objectFit: 'contain',
    display: 'block',
    margin: '0 auto',
  },
  title: {
    fontSize: '23px',
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
    lineHeight: 1.5,
  },
  roleTabsWrap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px',
    marginBottom: '20px',
    backgroundColor: '#F8FAFC',
    padding: '5px',
    borderRadius: '14px',
    border: '1px solid #E2E8F0',
    width: '100%',
    boxSizing: 'border-box',
  },
  roleTab: {
    padding: '10px 12px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.15s ease',
  },
  roleTabActive: {
    background: 'linear-gradient(180deg, #0A58CA 0%, #033B85 100%)',
    color: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(3, 59, 133, 0.25)',
  },
  roleTabInactive: {
    backgroundColor: 'transparent',
    color: '#64748B',
  },
  contractorSection: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  contractorSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: '0.2px',
    marginBottom: '2px',
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
    marginBottom: '18px',
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
    marginBottom: '18px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
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
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: '6px',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#F0F6FF',
    border: '1px solid #D0E1F9',
    borderRadius: '12px',
    padding: '0 12px',
    height: '46px',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    transition: 'all 0.15s ease',
  },
  inputIcon: {
    flexShrink: 0,
    marginRight: '9px',
  },
  input: {
    flex: 1,
    minWidth: 0,
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
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
    marginLeft: '6px',
  },
  passwordRulesBox: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px 12px',
    marginTop: '6px',
    fontSize: '11px',
    fontWeight: '600',
    padding: '6px 10px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
  },
  fieldErrorText: {
    fontSize: '11.5px',
    color: '#DC2626',
    margin: '4px 0 0 2px',
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
    marginTop: '20px',
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
