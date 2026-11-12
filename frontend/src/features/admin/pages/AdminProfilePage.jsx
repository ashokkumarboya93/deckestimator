// =============================================
// Deck Estimator — Admin Profile & Hierarchy Management
// =============================================
// Features:
// 1. Personal Profile details (Name, Phone, Avatar picture upload with instant preview)
// 2. Change password with secure validation
// 3. Parent Admin vs Child Admin Hierarchy:
//    - Current admin identified as Parent (Root) or Child Admin
//    - Parent Admin can create / invite new Child Admin accounts
//    - Parent Admin can delete Child Admin accounts
//    - Parent Admin cannot be deleted (protected)
//    - Child Admin has full operational access but cannot create or delete other admins

import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../../auth/hooks/useAuth';

export default function AdminProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Profile State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    role: 'admin',
    isParentAdmin: false,
    createdAt: null,
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Hierarchy State
  const [hierarchy, setHierarchy] = useState({
    isParentAdmin: false,
    currentAdmin: null,
    admins: [],
  });

  // New Child Admin Form State
  const [newChildAdmin, setNewChildAdmin] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [creatingChild, setCreatingChild] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Feedback State
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [profRes, hierRes] = await Promise.allSettled([
        adminApi.getProfile(),
        adminApi.getHierarchy(),
      ]);

      if (profRes.status === 'fulfilled' && profRes.value?.data) {
        const d = profRes.value.data;
        setProfile({
          name: d.name || d.fullName || '',
          email: d.email || '',
          phone: d.phone || '',
          avatar: d.avatar || '',
          role: d.role || 'admin',
          isParentAdmin: d.isParentAdmin ?? (d.email === 'admin@deckestimator.com'),
          createdAt: d.createdAt,
        });
      } else if (user) {
        setProfile({
          name: user.name || user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          avatar: user.avatar || '',
          role: user.role || 'admin',
          isParentAdmin: user.email === 'admin@deckestimator.com',
          createdAt: user.createdAt,
        });
      }

      if (hierRes.status === 'fulfilled' && hierRes.value?.data) {
        setHierarchy(hierRes.value.data);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  // Avatar Upload Handler
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Avatar image size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result;
      setProfile((prev) => ({ ...prev, avatar: base64Url }));
      setSuccessMsg('Photo selected! Click "Save Profile Changes" to persist.');
    };
    reader.readAsDataURL(file);
  };

  // Update Profile Details
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await adminApi.updateProfile({
        name: profile.name,
        phone: profile.phone,
        avatar: profile.avatar,
      });
      setSuccessMsg('✓ Admin profile details and photo successfully saved to MongoDB Atlas.');
      loadAllAdminData();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to update admin profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
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
      setSuccessMsg('✓ Administrator password changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to change administrator password.');
    } finally {
      setChangingPassword(false);
    }
  };

  // Create Child Admin (Parent Admin Only)
  const handleCreateChildAdmin = async (e) => {
    e.preventDefault();
    if (!newChildAdmin.fullName.trim() || !newChildAdmin.email.trim()) {
      setErrorMsg('Child administrator full name and email address are required.');
      return;
    }

    setCreatingChild(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await adminApi.createChildAdmin(newChildAdmin);
      setSuccessMsg(`✓ ${res.message || 'Child administrator created successfully!'}`);
      setNewChildAdmin({ fullName: '', email: '', phone: '', password: '' });
      loadAllAdminData();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to create child administrator.');
    } finally {
      setCreatingChild(false);
    }
  };

  // Delete Child Admin (Parent Admin Only)
  const handleDeleteChildAdmin = async (adminId, adminEmail) => {
    if (!window.confirm(`Are you sure you want to delete child administrator "${adminEmail}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(adminId);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await adminApi.deleteChildAdmin(adminId);
      setSuccessMsg(`✓ ${res.message || 'Child administrator successfully deleted.'}`);
      loadAllAdminData();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to delete child administrator.');
    } finally {
      setDeletingId(null);
    }
  };

  const isParent = profile.isParentAdmin || hierarchy.isParentAdmin;

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Profile &amp; Role Management</h1>
          <p style={styles.subtitle}>
            Manage administrator credentials, contact information, profile avatar, and administrative hierarchy.
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div style={styles.alertSuccess}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ marginLeft: 8, flex: 1 }}>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div style={styles.alertError}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
          </svg>
          <span style={{ marginLeft: 8, flex: 1 }}>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      <div className="drp-grid-collapse-lg" style={styles.grid}>
        {/* ======================================================== */}
        {/* LEFT COLUMN: Profile Overview Card & Avatar Upload       */}
        {/* ======================================================== */}
        <div style={styles.accountCard}>
          <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 16px' }}>
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name || 'Admin'}
                style={styles.avatarImg}
              />
            ) : (
              <div style={styles.avatarLarge}>
                {(profile.name || profile.email || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={styles.avatarUploadBtn}
              title="Upload new profile photo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          <h2 style={styles.adminName}>{profile.name || 'System Administrator'}</h2>
          <span style={styles.adminEmail}>{profile.email}</span>

          <div style={styles.roleBadgeContainer}>
            {isParent ? (
              <span style={styles.parentRoleBadge}>★ PARENT ADMINISTRATOR</span>
            ) : (
              <span style={styles.childRoleBadge}>CHILD ADMINISTRATOR</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={styles.changePhotoBtn}
          >
            Change Photo
          </button>

          <div style={styles.metaBox}>
            <div style={styles.metaRow}>
              <span>Role Clearance:</span>
              <strong style={{ color: isParent ? '#1E3A63' : '#0369A1' }}>
                {isParent ? 'Root Master Access' : 'Delegated Admin Access'}
              </strong>
            </div>
            <div style={styles.metaRow}>
              <span>Account Status:</span>
              <strong style={{ color: '#047857' }}>Active &amp; Verified</strong>
            </div>
            <div style={styles.metaRow}>
              <span>Created Date:</span>
              <span>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Platform Genesis'}</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Edit Details & Security                    */}
        {/* ======================================================== */}
        <div style={styles.formsCol}>
          {/* Form 1: Edit Profile Details */}
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
          <div style={{ ...styles.card, marginTop: '20px' }}>
            <h3 style={styles.cardTitle}>Security &amp; Authentication</h3>
            <p style={styles.cardSub}>Update your account login password with strong encryption.</p>

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
                <button type="submit" disabled={changingPassword} style={styles.btnSecondary}>
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PARENT ADMIN & CHILD ADMIN HIERARCHY SECTION           */}
      {/* ======================================================== */}
      <div style={{ ...styles.card, marginTop: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ ...styles.cardTitle, margin: 0 }}>Administrator Hierarchy &amp; Multi-Admin Access</h3>
              <span style={{
                backgroundColor: isParent ? '#FEF3C7' : '#EFF6FF',
                color: isParent ? '#92400E' : '#1E40AF',
                border: `1px solid ${isParent ? '#FCD34D' : '#BFDBFE'}`,
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '700',
              }}>
                {isParent ? 'Parent Admin Console' : 'Child Admin View'}
              </span>
            </div>
            <p style={{ ...styles.cardSub, margin: '4px 0 0' }}>
              {isParent
                ? 'As the Parent Administrator, you have full authority to invite and create Child Administrators, or revoke their accounts. Parent Admin accounts cannot be deleted.'
                : 'You are signed in as a Child Administrator. You have full access to manage projects, verify contractors, update pricing, and dispatch leads. Administrator delegation is restricted to the Parent Administrator.'}
            </p>
          </div>
        </div>

        {/* If Parent Admin: Show "Add Child Admin" Form */}
        {isParent && (
          <div style={styles.createAdminBox}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
              + Add Child Administrator Account
            </h4>
            <form onSubmit={handleCreateChildAdmin} style={styles.createAdminForm}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={styles.subInputLabel}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Robert Vance"
                  value={newChildAdmin.fullName}
                  onChange={(e) => setNewChildAdmin({ ...newChildAdmin, fullName: e.target.value })}
                  style={styles.inputSmall}
                  required
                />
              </div>

              <div style={{ flex: '1 1 220px' }}>
                <label style={styles.subInputLabel}>Email Address</label>
                <input
                  type="email"
                  placeholder="admin.child@deckestimator.com"
                  value={newChildAdmin.email}
                  onChange={(e) => setNewChildAdmin({ ...newChildAdmin, email: e.target.value })}
                  style={styles.inputSmall}
                  required
                />
              </div>

              <div style={{ flex: '1 1 150px' }}>
                <label style={styles.subInputLabel}>Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="(856) 555-0199"
                  value={newChildAdmin.phone}
                  onChange={(e) => setNewChildAdmin({ ...newChildAdmin, phone: e.target.value })}
                  style={styles.inputSmall}
                />
              </div>

              <div style={{ flex: '1 1 180px' }}>
                <label style={styles.subInputLabel}>Initial Password</label>
                <input
                  type="password"
                  placeholder="At least 8 chars"
                  value={newChildAdmin.password}
                  onChange={(e) => setNewChildAdmin({ ...newChildAdmin, password: e.target.value })}
                  style={styles.inputSmall}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={creatingChild}
                  style={styles.btnCreateChild}
                >
                  {creatingChild ? 'Creating...' : '+ Create Child Admin'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active Admins Directory Table */}
        <h4 style={{ margin: '20px 0 10px', fontSize: '14px', fontWeight: '800', color: '#334155' }}>
          Registered Platform Administrators ({hierarchy.admins?.length || 1})
        </h4>

        <div className="drp-table-wrap" style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Administrator Name</th>
                <th style={styles.th}>Email Address</th>
                <th style={styles.th}>Hierarchy Role</th>
                <th style={styles.th}>Created Date</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(hierarchy.admins || []).map((adm) => {
                const admIsParent = adm.isParentAdmin || adm.email === 'admin@deckestimator.com';
                const isCurrentAdmin = (adm._id || adm.id) === (profile._id || profile.id);
                return (
                  <tr key={adm._id || adm.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={styles.tableAvatar}>
                          {(adm.name || adm.fullName || adm.email || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{adm.name || adm.fullName || 'Administrator'}</strong>
                          {isCurrentAdmin && (
                            <span style={{ marginLeft: '6px', fontSize: '11px', color: '#15803D', fontWeight: '700' }}>
                              (You)
                            </span>
                          )}
                          {adm.phone && (
                            <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>
                              {adm.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '13px', color: '#334155' }}>{adm.email}</span>
                    </td>
                    <td style={styles.td}>
                      {admIsParent ? (
                        <span style={styles.pillParent}>
                          ★ Parent Admin (Root)
                        </span>
                      ) : (
                        <span style={styles.pillChild}>
                          Child Admin
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : 'Platform Launch'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      {admIsParent ? (
                        <span style={styles.protectedBadge}>
                          Protected (Master)
                        </span>
                      ) : isParent ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteChildAdmin(adm._id || adm.id, adm.email)}
                          disabled={deletingId === (adm._id || adm.id)}
                          style={styles.btnDeleteChild}
                          title="Revoke and delete this child administrator account"
                        >
                          {deletingId === (adm._id || adm.id) ? 'Deleting...' : 'Delete Admin'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                          Operational
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 20px',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 6px',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    borderRadius: '8px',
    border: '1px solid #a7f3d0',
    marginBottom: '20px',
    fontSize: '13.5px',
    fontWeight: '600',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    marginBottom: '20px',
    fontSize: '13.5px',
    fontWeight: '600',
  },
  alertCloseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    fontWeight: '700',
    padding: '0 4px',
    marginLeft: '12px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '24px',
  },
  accountCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    height: 'fit-content',
  },
  avatarLarge: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    backgroundColor: '#1E3A63',
    color: '#ffffff',
    fontSize: '36px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(30, 58, 99, 0.25)',
  },
  avatarImg: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #1E3A63',
    boxShadow: '0 4px 12px rgba(30, 58, 99, 0.25)',
  },
  avatarUploadBtn: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    backgroundColor: '#1E3A63',
    border: '2px solid #ffffff',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  changePhotoBtn: {
    background: 'none',
    border: 'none',
    color: '#0284C7',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '6px',
    textDecoration: 'underline',
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
  parentRoleBadge: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    border: '1px solid #FCD34D',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.04em',
  },
  childRoleBadge: {
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
    border: '1px solid #BFDBFE',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
    gap: '16px',
  },
  inputLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  subInputLabel: {
    display: 'block',
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#475569',
    marginBottom: '4px',
  },
  input: {
    padding: '9px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
  },
  inputSmall: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '12.5px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
  },
  btnPrimary: {
    padding: '9px 20px',
    backgroundColor: '#1E3A63',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  btnSecondary: {
    padding: '9px 20px',
    backgroundColor: '#ffffff',
    color: '#1E3A63',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  createAdminBox: {
    padding: '16px 18px',
    backgroundColor: '#F8FAFC',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  createAdminForm: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  btnCreateChild: {
    height: '36px',
    padding: '0 16px',
    backgroundColor: '#15803D',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  tableResponsive: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 16px',
    backgroundColor: '#F8FAFC',
    color: '#475569',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '1px solid #E2E8F0',
  },
  tr: {
    borderBottom: '1px solid #F1F5F9',
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: '#0F172A',
    verticalAlign: 'middle',
  },
  tableAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#1E3A63',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pillParent: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    border: '1px solid #FCD34D',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '800',
  },
  pillChild: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
    border: '1px solid #BFDBFE',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
  },
  protectedBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    backgroundColor: '#F1F5F9',
    color: '#64748B',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid #E2E8F0',
  },
  btnDeleteChild: {
    padding: '5px 12px',
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    border: '1px solid #FECACA',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
