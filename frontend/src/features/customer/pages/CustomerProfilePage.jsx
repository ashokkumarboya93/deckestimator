// =============================================
// Deck Estimator — Customer Profile Settings Page
// =============================================

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { userProfileApi } from '../api/userProfileApi';
import { compressAvatarImage } from '../../../utils/imageOptimizer';

function EyeToggleIcon({ visible }) {
  return visible ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function CustomerProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const isDirtyRef = useRef(false);

  // Hydrate immediately from auth context/localStorage to avoid blocking spinner
  const [fullName, setFullName] = useState(() => user?.fullName || '');
  const [email, setEmail] = useState(() => user?.email || '');
  const [phone, setPhone] = useState(() => user?.phone || '');
  const [avatar, setAvatar] = useState(() => user?.avatar || '');
  const [preferredContact, setPreferredContact] = useState(() => user?.preferredContactMethod || 'email');

  // Address State
  const [street, setStreet] = useState(() => user?.address?.street || '');
  const [city, setCity] = useState(() => user?.address?.city || '');
  const [state, setState] = useState(() => user?.address?.state || '');
  const [zipCode, setZipCode] = useState(() => user?.address?.zipCode || '');
  const [country, setCountry] = useState(() => user?.address?.country || 'USA');

  // Password State & Show/Hide Toggles
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status State (Only show initial loading if no cached user exists at all)
  const [loading, setLoading] = useState(() => !user);
  const [saving, setSaving] = useState(false);
  const [compressingPhoto, setCompressingPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const applyUserToForm = (u) => {
    if (!u) return;
    setFullName(u.fullName || '');
    setEmail(u.email || '');
    setPhone(u.phone || '');
    setAvatar(u.avatar || '');
    setPreferredContact(u.preferredContactMethod || 'email');
    if (u.address) {
      setStreet(u.address.street || '');
      setCity(u.address.city || '');
      setState(u.address.state || '');
      setZipCode(u.address.zipCode || '');
      setCountry(u.address.country || 'USA');
    }
  };

  // Populate silently once on mount without blocking UI when cached user is present
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    let mounted = true;

    async function syncLatestProfile() {
      try {
        const res = await userProfileApi.getProfile();
        const u = res?.data?.user || res?.data;
        if (mounted && u && !isDirtyRef.current) {
          applyUserToForm(u);
        }
      } catch {
        // Already hydrated from AuthContext fallback
      } finally {
        if (mounted) setLoading(false);
      }
    }

    syncLatestProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const markDirty = (setter) => (valueOrEvent) => {
    isDirtyRef.current = true;
    setter(valueOrEvent?.target ? valueOrEvent.target.value : valueOrEvent);
  };

  // Compress photo client-side before storing (2-5MB -> ~15-30KB)
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image file must be under 10 MB.');
      return;
    }

    setCompressingPhoto(true);
    setErrorMsg(null);
    try {
      const optimizedDataUrl = await compressAvatarImage(file, 256, 0.82);
      isDirtyRef.current = true;
      setAvatar(optimizedDataUrl);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to process selected image.');
    } finally {
      setCompressingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    isDirtyRef.current = true;
    setAvatar('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit Handler
  const handleSaveProfile = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (saving) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }

    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        setErrorMsg('Please enter your current password to change your password.');
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirmation do not match.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatar,
        preferredContactMethod: preferredContact,
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          country: country.trim() || 'USA',
        },
      };

      if (newPassword && currentPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await userProfileApi.updateProfile(payload);
      const updatedUser = res?.data?.user || null;

      // Update auth context & localStorage synchronously without extra /auth/me round-trip
      if (updatedUser) {
        await refreshUser(updatedUser);
        applyUserToForm(updatedUser);
      } else {
        await refreshUser();
      }

      isDirtyRef.current = false;
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setSuccessMsg('Profile settings saved successfully!');

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const initials = fullName
    ? fullName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const passwordMismatch = Boolean(confirmPassword && newPassword !== confirmPassword);

  return (
    <div className="drp-prof-wrap">
      <style>{`
        .drp-prof-wrap {
          max-width: 980px;
          margin: 0 auto;
          padding: 14px 18px 24px;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        }
        .drp-prof-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .drp-prof-card {
          background-color: #FFFFFF;
          border-radius: 10px;
          border: 1px solid #E2E8F0;
          padding: 14px 18px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
        }
        .drp-prof-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 12px;
        }
        .drp-prof-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px 12px;
        }
        .drp-prof-col-full {
          grid-column: 1 / -1;
        }
        .drp-prof-input {
          width: 100%;
          box-sizing: border-box;
          padding: 8px 11px;
          border-radius: 7px;
          border: 1px solid #CBD5E1;
          font-size: 13px !important;
          color: #0F172A;
          background-color: #FFFFFF;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .drp-prof-input:focus {
          border-color: #034EA2;
          box-shadow: 0 0 0 2.5px rgba(3, 78, 162, 0.12);
        }
        .drp-prof-pw-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .drp-prof-pw-input {
          padding-right: 36px !important;
          letter-spacing: 0.04em;
        }
        .drp-prof-pw-toggle {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          padding: 4px !important;
          min-height: 26px !important;
          min-width: 26px !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #64748B;
          cursor: pointer;
          border-radius: 5px;
          transition: color 0.15s ease, background-color 0.15s ease;
        }
        .drp-prof-pw-toggle:hover {
          color: #034EA2;
          background-color: #F1F5F9;
        }
        @media (max-width: 900px) {
          .drp-prof-wrap {
            padding: 12px 14px 22px;
          }
          .drp-prof-title {
            font-size: 18px !important;
          }
          .drp-prof-card {
            padding: 13px 15px;
          }
          .drp-prof-card-heading {
            font-size: 14px !important;
          }
          .drp-prof-grid-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .drp-prof-wrap {
            padding: 10px 10px 20px;
          }
          .drp-prof-title {
            font-size: 16.5px !important;
          }
          .drp-prof-sub {
            font-size: 11px !important;
            line-height: 1.35;
          }
          .drp-prof-top-save {
            padding: 7px 12px !important;
            font-size: 11.5px !important;
            min-height: 32px !important;
          }
          .drp-prof-card {
            padding: 11px 12px;
            border-radius: 9px;
          }
          .drp-prof-card-header {
            padding-bottom: 6px !important;
            margin-bottom: 8px !important;
          }
          .drp-prof-card-heading {
            font-size: 13.5px !important;
          }
          .drp-prof-card-sub {
            font-size: 10.5px !important;
          }
          .drp-prof-grid-2,
          .drp-prof-grid-3 {
            grid-template-columns: minmax(0, 1fr);
            gap: 8px;
          }
          .drp-prof-avatar-row {
            gap: 10px !important;
          }
          .drp-prof-avatar-circle {
            width: 56px !important;
            height: 56px !important;
          }
          .drp-prof-avatar-fallback {
            font-size: 19px !important;
          }
          .drp-prof-upload-btn {
            padding: 6px 11px !important;
            font-size: 11.5px !important;
            min-height: 32px !important;
          }
          .drp-prof-label {
            font-size: 11px !important;
          }
          .drp-prof-input {
            padding: 7px 9px !important;
            font-size: 12.5px !important;
          }
          .drp-prof-method-btn {
            padding: 6px 8px !important;
            font-size: 11px !important;
            min-height: 32px !important;
          }
          .drp-prof-bottom-save {
            width: 100%;
            padding: 9px 14px !important;
            font-size: 12.5px !important;
          }
        }
      `}</style>

      {/* Page Title & Quick Save Header */}
      <div className="drp-prof-header">
        <div style={{ minWidth: 0 }}>
          <h1 className="drp-prof-title" style={styles.headingTitle}>Profile Settings</h1>
          <p className="drp-prof-sub" style={styles.subTitle}>
            Manage your personal profile, contact details, default deck address, and password.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={saving || compressingPhoto}
          className="drp-prof-top-save"
          style={{
            ...styles.topSaveBtn,
            opacity: saving || compressingPhoto ? 0.72 : 1,
          }}
          title="Save profile changes"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Inline Feedback Banners */}
      {successMsg && (
        <div role="status" style={styles.alertSuccess}>
          <span>✓ {successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div role="alert" style={styles.alertError}>
          <span>✕ {errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div style={styles.loadingBox}>Loading your profile...</div>
      ) : (
        <form onSubmit={handleSaveProfile} style={styles.formLayout}>
          {/* 1. PROFILE PHOTO & IDENTITY */}
          <div className="drp-prof-card">
            <div className="drp-prof-card-header" style={styles.cardHeader}>
              <h3 className="drp-prof-card-heading" style={styles.cardHeading}>Profile Photo &amp; Identity</h3>
              <span className="drp-prof-card-sub" style={styles.cardSub}>
                Shown across your dashboard, estimates, and contractor updates.
              </span>
            </div>

            <div className="drp-prof-avatar-row" style={styles.avatarSection}>
              <div className="drp-prof-avatar-circle" style={styles.avatarWrap}>
                {avatar ? (
                  <img src={avatar} alt={fullName || 'Profile'} style={styles.avatarImage} />
                ) : (
                  <div className="drp-prof-avatar-fallback" style={styles.avatarFallback}>{initials}</div>
                )}
              </div>

              <div style={styles.avatarActions}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={compressingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="drp-prof-upload-btn"
                    style={styles.uploadPhotoBtn}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>{compressingPhoto ? 'Optimizing...' : 'Upload Photo'}</span>
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={styles.removePhotoBtn}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <span style={styles.avatarHint}>
                  Auto-optimized JPG, PNG, or WebP (max 10 MB upload).
                </span>
              </div>
            </div>
          </div>

          {/* 2. PERSONAL INFORMATION */}
          <div className="drp-prof-card">
            <div className="drp-prof-card-header" style={styles.cardHeader}>
              <h3 className="drp-prof-card-heading" style={styles.cardHeading}>Personal Information</h3>
              <span className="drp-prof-card-sub" style={styles.cardSub}>
                Basic contact details for estimate coordination.
              </span>
            </div>

            <div className="drp-prof-grid-2">
              <div style={styles.inputGroup}>
                <label className="drp-prof-label" style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={markDirty(setFullName)}
                  placeholder="e.g. Ashok Kumar"
                  className="drp-prof-input"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label className="drp-prof-label" style={styles.label}>Email Address (Account ID)</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="drp-prof-input"
                  style={{ backgroundColor: '#F8FAFC', color: '#64748B', cursor: 'not-allowed' }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label className="drp-prof-label" style={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={markDirty(setPhone)}
                  placeholder="(555) 000-0000"
                  className="drp-prof-input"
                />
              </div>

              <div style={styles.inputGroup}>
                <label className="drp-prof-label" style={styles.label}>Preferred Contact Method</label>
                <div style={styles.contactMethodGroup}>
                  {['email', 'phone', 'sms'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        isDirtyRef.current = true;
                        setPreferredContact(method);
                      }}
                      className="drp-prof-method-btn"
                      style={{
                        ...styles.contactMethodBtn,
                        backgroundColor: preferredContact === method ? '#034EA2' : '#FFFFFF',
                        color: preferredContact === method ? '#FFFFFF' : '#334155',
                        borderColor: preferredContact === method ? '#034EA2' : '#CBD5E1',
                      }}
                    >
                      {method.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. PROPERTY & BILLING ADDRESS */}
          <div className="drp-prof-card">
            <div className="drp-prof-card-header" style={styles.cardHeader}>
              <h3 className="drp-prof-card-heading" style={styles.cardHeading}>Default Property &amp; Deck Address</h3>
              <span className="drp-prof-card-sub" style={styles.cardSub}>
                Auto-populates new restoration project location fields.
              </span>
            </div>

            <div className="drp-prof-grid-2">
              <div className="drp-prof-col-full" style={styles.inputGroup}>
                <label className="drp-prof-label" style={styles.label}>Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={markDirty(setStreet)}
                  placeholder="123 Oakwood Drive"
                  className="drp-prof-input"
                />
              </div>

              <div style={styles.inputGroup}>
                <label className="drp-prof-label" style={styles.label}>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={markDirty(setCity)}
                  placeholder="Shamong"
                  className="drp-prof-input"
                />
              </div>

              <div style={styles.inputGroup}>
                <label className="drp-prof-label" style={styles.label}>State / Province</label>
                <input
                  type="text"
                  value={state}
                  onChange={markDirty(setState)}
                  placeholder="NJ"
                  className="drp-prof-input"
                />
              </div>

              <div style={styles.inputGroup}>
                <label className="drp-prof-label" style={styles.label}>ZIP / Postal Code</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={markDirty(setZipCode)}
                  placeholder="08088"
                  className="drp-prof-input"
                />
              </div>

              <div style={styles.inputGroup}>
                <label className="drp-prof-label" style={styles.label}>Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={markDirty(setCountry)}
                  placeholder="USA"
                  className="drp-prof-input"
                />
              </div>
            </div>
          </div>

          {/* 4. SECURITY & PASSWORD */}
          <div className="drp-prof-card">
            <div className="drp-prof-card-header" style={styles.cardHeader}>
              <h3 className="drp-prof-card-heading" style={styles.cardHeading}>Security &amp; Password</h3>
              <span className="drp-prof-card-sub" style={styles.cardSub}>
                Leave blank unless changing your login password.
              </span>
            </div>

            <div className="drp-prof-grid-3">
              <div style={styles.inputGroup}>
                <label className="drp-prof-label" style={styles.label}>Current Password</label>
                <div className="drp-prof-pw-wrap">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="drp-prof-input drp-prof-pw-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="drp-prof-pw-toggle"
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                    title={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeToggleIcon visible={showCurrentPassword} />
                  </button>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label className="drp-prof-label" style={styles.label}>New Password</label>
                <div className="drp-prof-pw-wrap">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="drp-prof-input drp-prof-pw-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="drp-prof-pw-toggle"
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeToggleIcon visible={showNewPassword} />
                  </button>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label className="drp-prof-label" style={styles.label}>Confirm New Password</label>
                <div className="drp-prof-pw-wrap">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="drp-prof-input drp-prof-pw-input"
                    style={passwordMismatch ? { borderColor: '#EF4444' } : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="drp-prof-pw-toggle"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeToggleIcon visible={showConfirmPassword} />
                  </button>
                </div>
                {passwordMismatch && (
                  <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600' }}>
                    Passwords do not match.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div style={styles.actionsBar}>
            <button
              type="submit"
              disabled={saving || compressingPhoto}
              className="drp-prof-bottom-save"
              style={{
                ...styles.saveButton,
                opacity: saving || compressingPhoto ? 0.72 : 1,
                cursor: saving ? 'wait' : 'pointer',
              }}
            >
              <span>{saving ? 'Saving Changes...' : 'Save Profile Settings'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '980px',
    margin: '0 auto',
    padding: '14px 18px 28px 18px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  topSaveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 16px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(3, 78, 162, 0.22)',
    transition: 'all 0.16s ease',
    flexShrink: 0,
  },
  headingTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0F172A',
    margin: '0 0 2px 0',
    letterSpacing: '-0.3px',
  },
  subTitle: {
    fontSize: '12px',
    color: '#64748B',
    margin: 0,
  },
  alertSuccess: {
    padding: '9px 14px',
    backgroundColor: '#DCFCE7',
    border: '1px solid #86EFAC',
    borderRadius: '8px',
    color: '#15803D',
    fontSize: '12.5px',
    fontWeight: '600',
    marginBottom: '10px',
  },
  alertError: {
    padding: '9px 14px',
    backgroundColor: '#FEE2E2',
    border: '1px solid #FCA5A5',
    borderRadius: '8px',
    color: '#B91C1C',
    fontSize: '12.5px',
    fontWeight: '600',
    marginBottom: '10px',
  },
  loadingBox: {
    padding: '24px',
    textAlign: 'center',
    color: '#64748B',
    fontSize: '13px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  formLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    padding: '14px 18px',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
  },
  cardHeader: {
    borderBottom: '1px solid #F1F5F9',
    paddingBottom: '8px',
    marginBottom: '10px',
  },
  cardHeading: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 2px 0',
  },
  cardSub: {
    fontSize: '11.5px',
    color: '#64748B',
    display: 'block',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    flexWrap: 'wrap',
  },
  avatarWrap: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#034EA2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2.5px solid #E2E8F0',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarFallback: {
    color: '#FFFFFF',
    fontSize: '25px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  avatarActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0,
    flex: 1,
  },
  uploadPhotoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '7px 14px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '7px',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(3, 78, 162, 0.18)',
  },
  removePhotoBtn: {
    padding: '6px 12px',
    backgroundColor: '#FFFFFF',
    color: '#B91C1C',
    border: '1px solid #FCA5A5',
    borderRadius: '7px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  avatarHint: {
    fontSize: '11px',
    color: '#94A3B8',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  label: {
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#334155',
  },
  contactMethodGroup: {
    display: 'flex',
    gap: '6px',
  },
  contactMethodBtn: {
    flex: 1,
    padding: '8px 10px',
    borderRadius: '7px',
    border: '1.5px solid',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '4px',
  },
  saveButton: {
    padding: '10px 22px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '700',
    boxShadow: '0 3px 10px rgba(3, 78, 162, 0.25)',
    transition: 'all 0.18s ease',
  },
};
