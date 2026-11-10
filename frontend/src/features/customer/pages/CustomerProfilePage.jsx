// =============================================
// Deck Estimator — Customer Profile Settings Page
// =============================================

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { userProfileApi } from '../api/userProfileApi';

export default function CustomerProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [preferredContact, setPreferredContact] = useState('email');

  // Address State
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('USA');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Populate from current user or fetch profile
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await userProfileApi.getProfile();
        const u = res?.data?.user || res?.data || user;
        if (u) {
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
        }
      } catch (err) {
        if (user) {
          setFullName(user.fullName || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
          setAvatar(user.avatar || '');
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Handle Photo File Upload
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be under 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAvatar(uploadEvent.target.result);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatar('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setErrorMsg('Please enter your current password to set a new password.');
        return;
      }
      if (newPassword.length < 6) {
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

      await userProfileApi.updateProfile(payload);
      await refreshUser();

      setSuccessMsg('Profile settings updated and saved successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile settings.');
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

  return (
    <div style={styles.container}>
      {/* Page Title & Breadcrumb Header with Top Save Button */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.headingTitle}>Profile Settings</h1>
          <p style={styles.subTitle}>
            Manage your personal profile, contact information, and default property address.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={saving}
          style={styles.topSaveBtn}
          title="Save profile changes"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={styles.alertSuccess}>
          <span>✓ {successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div style={styles.alertError}>
          <span>✕ {errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div style={styles.loadingBox}>Loading profile data...</div>
      ) : (
        <form onSubmit={handleSaveProfile} style={styles.formLayout}>
          {/* 1. TOP PROFILE AVATAR CARD */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardHeading}>Profile Photo & Identity</h3>
              <span style={styles.cardSub}>Photo visible across estimates and contractor correspondence.</span>
            </div>

            <div style={styles.avatarSection}>
              <div style={styles.avatarWrap}>
                {avatar ? (
                  <img src={avatar} alt={fullName} style={styles.avatarImage} />
                ) : (
                  <div style={styles.avatarFallback}>{initials}</div>
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
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={styles.uploadPhotoBtn}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>Upload Photo</span>
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
                <span style={styles.avatarHint}>
                  Recommended: Square JPG or PNG, max 5 MB.
                </span>
              </div>
            </div>
          </div>

          {/* 2. PERSONAL INFORMATION CARD */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardHeading}>Personal Information</h3>
              <span style={styles.cardSub}>Basic contact details for project coordination.</span>
            </div>

            <div style={styles.grid2Col}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ashok Kumar"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address (Account ID)</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  style={{ ...styles.input, backgroundColor: '#F8FAFC', color: '#64748B', cursor: 'not-allowed' }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Preferred Contact Method</label>
                <div style={styles.contactMethodGroup}>
                  {['email', 'phone', 'sms'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPreferredContact(method)}
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

          {/* 3. PROPERTY & BILLING ADDRESS CARD */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardHeading}>Default Property & Deck Address</h3>
              <span style={styles.cardSub}>Auto-populates new restoration project location fields.</span>
            </div>

            <div style={styles.grid2Col}>
              <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                <label style={styles.label}>Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="123 Oakwood Drive"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Austin"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>State / Province</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="TX"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>ZIP / Postal Code</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="78701"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="USA"
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* 4. SECURITY & PASSWORD CARD (OPTIONAL) */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardHeading}>Security & Password</h3>
              <span style={styles.cardSub}>Leave blank if you do not wish to change your password.</span>
            </div>

            <div style={styles.grid3Col}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* FORM ACTIONS */}
          <div style={styles.actionsBar}>
            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.saveButton,
                opacity: saving ? 0.7 : 1,
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

// Modern Clean Samsung Blue Styles
const styles = {
  container: {
    maxWidth: '1040px',
    margin: '0 auto',
    padding: '16px 20px 40px 20px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  topSaveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 18px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(3, 78, 162, 0.25)',
    transition: 'all 0.16s ease',
  },
  headingTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0F172A',
    margin: '0 0 4px 0',
    letterSpacing: '-0.3px',
  },
  subTitle: {
    fontSize: '12.5px',
    color: '#64748B',
    margin: 0,
  },
  alertSuccess: {
    padding: '10px 16px',
    backgroundColor: '#DCFCE7',
    border: '1px solid #86EFAC',
    borderRadius: '8px',
    color: '#15803D',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '14px',
  },
  alertError: {
    padding: '10px 16px',
    backgroundColor: '#FEE2E2',
    border: '1px solid #FCA5A5',
    borderRadius: '8px',
    color: '#B91C1C',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '14px',
  },
  loadingBox: {
    padding: '30px',
    textAlign: 'center',
    color: '#64748B',
    fontSize: '13.5px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  formLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
  },
  cardHeader: {
    borderBottom: '1px solid #F1F5F9',
    paddingBottom: '10px',
    marginBottom: '12px',
  },
  cardHeading: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 4px 0',
  },
  cardSub: {
    fontSize: '12px',
    color: '#64748B',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
  },
  avatarWrap: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#034EA2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid #E2E8F0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarFallback: {
    color: '#FFFFFF',
    fontSize: '30px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  avatarActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  uploadPhotoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 18px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(3, 78, 162, 0.2)',
    transition: 'all 0.16s ease',
  },
  removePhotoBtn: {
    padding: '6px 14px',
    backgroundColor: '#FFFFFF',
    color: '#B91C1C',
    border: '1px solid #FCA5A5',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  avatarHint: {
    fontSize: '11px',
    color: '#94A3B8',
  },
  grid2Col: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '12px',
  },
  grid3Col: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    transition: 'border-color 0.15s ease',
  },
  contactMethodGroup: {
    display: 'flex',
    gap: '8px',
  },
  contactMethodBtn: {
    flex: 1,
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1.5px solid',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '10px',
  },
  saveButton: {
    padding: '12px 28px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '9px',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 4px 14px rgba(3, 78, 162, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
};
