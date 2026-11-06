// =============================================
// Deck Estimator — Admin Profile Management
// =============================================
// Features:
// - Admin Account overview card with role badge and avatar
// - Edit personal profile details (Name, Phone)
// - Change password with secure validation
// - Directly backed by MongoDB via adminApi

import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../../auth/hooks/useAuth';

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'admin',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProfile();
      if (res?.data) {
        setProfile({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          role: res.data.role || 'admin',
          createdAt: res.data.createdAt,
        });
      }
    } catch {
      // Fallback to auth context
      if (user) {
        setProfile({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'admin',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await adminApi.updateProfile({
        name: profile.name,
        phone: profile.phone,
      });
      setSuccessMsg('Profile details successfully updated.');
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setChangingPassword(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await adminApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccessMsg('Admin password changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>
            Manage administrator credentials, contact information, and security authentication.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={styles.alertSuccess}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ marginLeft: 8 }}>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      {errorMsg && (
        <div style={styles.alertError}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
          </svg>
          <span style={{ marginLeft: 8 }}>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      <div style={styles.grid}>
        {/* Left Card: Account Card */}
        <div style={styles.accountCard}>
          <div style={styles.avatarLarge}>
            {(profile.name || profile.email || 'A').charAt(0).toUpperCase()}
          </div>
          <h2 style={styles.adminName}>{profile.name || 'System Administrator'}</h2>
          <span style={styles.adminEmail}>{profile.email}</span>

          <div style={styles.roleBadgeContainer}>
            <span style={styles.roleBadge}>PLATFORM ADMINISTRATOR</span>
          </div>

          <div style={styles.metaBox}>
            <div style={styles.metaRow}>
              <span>Role Clearance:</span>
              <strong>Full Root Access</strong>
            </div>
            <div style={styles.metaRow}>
              <span>Account Status:</span>
              <strong style={{ color: '#047857' }}>Active</strong>
            </div>
            <div style={styles.metaRow}>
              <span>Created Date:</span>
              <span>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Platform Genesis'}</span>
            </div>
          </div>
        </div>

        {/* Right Forms */}
        <div style={styles.formsCol}>
          {/* Form 1: Details */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Personal Information</h3>
            <p style={styles.cardSub}>Update your administrator display name and contact phone number.</p>

            <form onSubmit={handleUpdateProfile}>
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Email Address (Read Only)</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  style={{ ...styles.input, backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Phone Number</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="(856) 555-0199"
                  style={styles.input}
                />
              </div>

              <div style={{ marginTop: '16px' }}>
                <button type="submit" disabled={savingProfile} style={styles.btnPrimary}>
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Change Password */}
          <div style={{ ...styles.card, marginTop: '24px' }}>
            <h3 style={styles.cardTitle}>Change Administrator Password</h3>
            <p style={styles.cardSub}>Ensure your password contains at least 6 characters with letters and numbers.</p>

            <form onSubmit={handleChangePassword}>
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <button type="submit" disabled={changingPassword} style={styles.btnPrimary}>
                  {changingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 32px',
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    margin: '6px 0 0',
    fontSize: '14px',
    color: '#64748b',
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  alertCloseBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    fontWeight: 'bold',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '24px',
    alignItems: 'flex-start',
  },
  accountCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '32px 24px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  avatarLarge: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  adminName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
  },
  adminEmail: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
    display: 'block',
  },
  roleBadgeContainer: {
    marginTop: '12px',
  },
  roleBadge: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.04em',
  },
  metaBox: {
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    textAlign: 'left',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#64748b',
  },
  formsCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  cardTitle: {
    margin: '0 0 4px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSub: {
    margin: '0 0 20px',
    fontSize: '13px',
    color: '#64748b',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  inputLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    padding: '9px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
  },
  btnPrimary: {
    padding: '9px 20px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

