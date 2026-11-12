// =============================================
// Deck Estimator — Dedicated Admin User Profile Page
// =============================================
// Single continuous dossier page displaying all user details:
// - Personal & contact details
// - Moderation history & standing
// - History: Estimations & requests
// - If contractor: Earnings, discounts, business profile & uploaded verification documents
// - Header actions: Back, Delete User, Block/Unblock Toggle, Export PDF

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import mainLogo from '../../../assets/images/MainLodo.png';
import { toast } from '../../../utils/toast';

export default function AdminUserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);

  // Document Viewer Modal
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUserProfile(id);
      const data = res.data || res;
      setProfileData(data);
    } catch (err) {
      setError(err?.message || 'Failed to load user profile dossier.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!profileData?.user) return;
    const currentStatus = profileData.user.accountStatus || 'active';
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    const confirmPrompt = window.confirm(
      `Are you sure you want to ${newStatus === 'blocked' ? 'BLOCK' : 'UNBLOCK'} this user account?`
    );
    if (!confirmPrompt) return;

    setActionLoading(true);
    try {
      await adminApi.updateUserStatus(id, newStatus, `Admin manual ${newStatus} from profile`);
      setSuccessMsg(`User status successfully updated to ${newStatus.toUpperCase()}`);
      fetchProfile();
    } catch (err) {
      setError(err?.message || 'Failed to update account status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      await adminApi.softDeleteUser(id, deleteReason || 'Admin deleted from profile dossier', isPermanentDelete);
      setIsDeleteModalOpen(false);
      toast.success('User account has been successfully deleted.');
      navigate('/admin/users');
    } catch (err) {
      setError(err?.message || 'Failed to delete user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loaderCircle} />
        <p style={{ marginTop: '14px', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
          Loading user dossier...
        </p>
      </div>
    );
  }

  if (error || !profileData?.user) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div style={{ marginLeft: 12 }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#991b1b' }}>Unable to load dossier</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#b91c1c' }}>{error || 'User not found'}</p>
          </div>
          <button onClick={() => navigate(-1)} style={styles.backBtnInline}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const u = profileData.user;
  const isContractor = (u.role || '').toLowerCase() === 'contractor';
  const isCustomer = (u.role || '').toLowerCase() === 'customer';
  const cp = profileData.contractorProfile || profileData.contractorData?.profile;
  const estimates = profileData.estimates || profileData.customerData?.estimates || [];
  const decks = profileData.projects || profileData.customerData?.decks || [];
  const enquiries = profileData.enquiries || [];
  const moderationHistory = u.moderationHistory || [];
  const documents = profileData.verificationDocuments || [];

  return (
    <div style={styles.container} className="user-profile-dossier-print">
      {/* Global Print Style */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          aside, header, .no-print {
            display: none !important;
          }
          .user-profile-dossier-print {
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            width: 100% !important;
          }
          .dossier-card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            margin-bottom: 20px !important;
          }
        }
      `}</style>

      {/* Top Action Bar */}
      <div style={styles.topBar} className="no-print">
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={styles.backButton}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back</span>
        </button>

        <div style={styles.actionsRight}>
          {/* Block / Unblock Button */}
          <button
            type="button"
            onClick={handleToggleBlock}
            disabled={actionLoading}
            style={u.accountStatus === 'blocked' ? styles.unblockBtn : styles.blockBtn}
          >
            {u.accountStatus === 'blocked' ? '✓ Unblock Account' : '✕ Block Account'}
          </button>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handlePrintPdf}
            style={styles.exportBtn}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export Profile (PDF)</span>
          </button>

          {/* Delete User Button */}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            style={styles.deleteBtn}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Delete User</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={styles.alertSuccess} className="no-print">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ marginLeft: 8 }}>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} style={styles.alertClose}>✕</button>
        </div>
      )}

      {/* Hero Header Card */}
      <div style={styles.heroCard} className="dossier-card">
        <div style={styles.heroLeft}>
          <div style={styles.avatarLarge}>
            {u.fullName ? u.fullName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={styles.heroName}>{u.fullName || 'User Profile'}</h1>
              <span
                style={{
                  ...styles.roleBadge,
                  backgroundColor: isContractor ? '#fef9c3' : isCustomer ? '#eff6ff' : '#f1f5f9',
                  color: isContractor ? '#854d0e' : isCustomer ? '#1d4ed8' : '#334155',
                }}
              >
                {(u.role || 'User').toUpperCase()}
              </span>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: u.accountStatus === 'active' ? '#ecfdf5' : u.accountStatus === 'blocked' ? '#fef2f2' : '#fffbeb',
                  color: u.accountStatus === 'active' ? '#065f46' : u.accountStatus === 'blocked' ? '#991b1b' : '#92400e',
                  border: `1px solid ${u.accountStatus === 'active' ? '#a7f3d0' : u.accountStatus === 'blocked' ? '#fecaca' : '#fde68a'}`,
                }}
              >
                {(u.accountStatus || 'ACTIVE').toUpperCase()}
              </span>
            </div>
            <p style={styles.heroSubText}>
              <span>{u.email}</span> • <span>{u.phone || 'No phone on file'}</span> • <span>Member since {new Date(u.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div style={styles.heroRight}>
          <img src={mainLogo} alt="Deck Restoration Plus" style={{ height: '38px', objectFit: 'contain' }} />
        </div>
      </div>

      {/* 1. CONTINUOUS SECTION: Personal & Contact Dossier */}
      <div style={styles.sectionCard} className="dossier-card">
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIconBadge}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 style={styles.sectionTitle}>1. Personal &amp; Account Dossier</h2>
        </div>

        <div style={styles.gridFour}>
          <div style={styles.infoBlock}>
            <span style={styles.infoLabel}>Full Name</span>
            <span style={styles.infoVal}>{u.fullName || '—'}</span>
          </div>
          <div style={styles.infoBlock}>
            <span style={styles.infoLabel}>Email Address</span>
            <span style={styles.infoVal}>{u.email || '—'}</span>
          </div>
          <div style={styles.infoBlock}>
            <span style={styles.infoLabel}>Primary Phone</span>
            <span style={styles.infoVal}>{u.phone || 'Not provided'}</span>
          </div>
          <div style={styles.infoBlock}>
            <span style={styles.infoLabel}>Preferred Contact</span>
            <span style={styles.infoVal}>{(u.preferredContactMethod || 'Email').toUpperCase()}</span>
          </div>

          <div style={styles.infoBlock}>
            <span style={styles.infoLabel}>Street Address</span>
            <span style={styles.infoVal}>{u.address?.street || 'Not provided'}</span>
          </div>
          <div style={styles.infoBlock}>
            <span style={styles.infoLabel}>City, State, Zip</span>
            <span style={styles.infoVal}>
              {[u.address?.city, u.address?.state, u.address?.zipCode].filter(Boolean).join(', ') || 'Not provided'}
            </span>
          </div>
          <div style={styles.infoBlock}>
            <span style={styles.infoLabel}>Last Active / Login</span>
            <span style={styles.infoVal}>
              {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never logged in'}
            </span>
          </div>
          <div style={styles.infoBlock}>
            <span style={styles.infoLabel}>Database Record ID</span>
            <span style={{ ...styles.infoVal, fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
              {u.id || u._id}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CONTINUOUS SECTION (If Contractor): Business Credentials, Earnings & Discounts */}
      {isContractor && (
        <div style={styles.sectionCard} className="dossier-card">
          <div style={styles.sectionHeader}>
            <div style={{ ...styles.sectionIconBadge, backgroundColor: '#fef3c7', color: '#b45309' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h2 style={styles.sectionTitle}>2. Contractor Commercial Dossier, Earnings &amp; Discounts</h2>
          </div>

          <div style={styles.gridFour}>
            <div style={styles.infoBlock}>
              <span style={styles.infoLabel}>Business Name</span>
              <span style={{ ...styles.infoVal, fontWeight: '700', color: '#0f172a' }}>
                {cp?.businessName || 'Business profile not set'}
              </span>
            </div>
            <div style={styles.infoBlock}>
              <span style={styles.infoLabel}>Contractor License #</span>
              <span style={styles.infoVal}>{cp?.licenseNumber || 'Pending entry'}</span>
            </div>
            <div style={styles.infoBlock}>
              <span style={styles.infoLabel}>Jurisdiction</span>
              <span style={styles.infoVal}>{cp?.licenseJurisdiction || 'USA / Regional'}</span>
            </div>
            <div style={styles.infoBlock}>
              <span style={styles.infoLabel}>Verification Status</span>
              <span style={{
                ...styles.infoVal,
                fontWeight: '700',
                color: cp?.verificationStatus === 'approved' ? '#16a34a' : '#ca8a04',
              }}>
                {(cp?.verificationStatus || 'PENDING').toUpperCase()}
              </span>
            </div>

            <div style={styles.infoBlock}>
              <span style={styles.infoLabel}>Trade Wholesale Discount</span>
              <span style={{ ...styles.infoVal, color: '#16a34a', fontWeight: '800' }}>
                {cp?.customDiscountPercent ? `${cp.customDiscountPercent}% (Custom Tier)` : '10.0% (Default Wholesale)'}
              </span>
            </div>
            <div style={styles.infoBlock}>
              <span style={styles.infoLabel}>Years of Experience</span>
              <span style={styles.infoVal}>{cp?.yearsOfExperience || 0} Years</span>
            </div>
            <div style={styles.infoBlock}>
              <span style={styles.infoLabel}>Commercial Phone</span>
              <span style={styles.infoVal}>{cp?.businessPhone || u.phone || '—'}</span>
            </div>
            <div style={styles.infoBlock}>
              <span style={styles.infoLabel}>Commercial Email</span>
              <span style={styles.infoVal}>{cp?.businessEmail || u.email || '—'}</span>
            </div>
          </div>

          {/* Uploaded Verification Documents Subsection */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={styles.subHeading}>Uploaded Verification Documents ({documents.length})</h4>
            {documents.length === 0 ? (
              <p style={styles.emptyNote}>No verification documents currently on file for this contractor.</p>
            ) : (
              <div className="drp-table-wrap" style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Document Type</th>
                      <th style={styles.th}>File Name</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Uploaded Date</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc, idx) => (
                      <tr key={doc._id || idx} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={styles.docTypeBadge}>
                            {(doc.documentType || 'DOCUMENT').replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.td}>{doc.originalFileName || 'file.pdf'}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusPillSmall,
                            backgroundColor: doc.documentStatus === 'verified' ? '#ecfdf5' : doc.documentStatus === 'rejected' ? '#fef2f2' : '#fffbeb',
                            color: doc.documentStatus === 'verified' ? '#065f46' : doc.documentStatus === 'rejected' ? '#991b1b' : '#92400e',
                          }}>
                            {(doc.documentStatus || 'pending').toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.td}>{new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString()}</td>
                        <td style={styles.td}>
                          <button
                            type="button"
                            onClick={() => setViewingDoc(doc)}
                            style={styles.viewDocBtn}
                          >
                            View File
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. CONTINUOUS SECTION: Estimations & Deck Project History */}
      <div style={styles.sectionCard} className="dossier-card">
        <div style={styles.sectionHeader}>
          <div style={{ ...styles.sectionIconBadge, backgroundColor: '#ecfdf5', color: '#059669' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h2 style={styles.sectionTitle}>
            3. Project &amp; Estimations History ({estimates.length} Estimates, {decks.length} Decks)
          </h2>
        </div>

        {estimates.length === 0 && decks.length === 0 ? (
          <p style={styles.emptyNote}>No project or estimation activity recorded for this user yet.</p>
        ) : (
          <div className="drp-table-wrap" style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Estimate / Project</th>
                  <th style={styles.th}>Deck Dimensions</th>
                  <th style={styles.th}>Surface Material</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Estimated Cost</th>
                  <th style={styles.th}>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {estimates.map((est, idx) => (
                  <tr key={est._id || est.id || idx} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>
                        {est.estimateReference || `EST-#${(est._id || est.id || '').slice(-5).toUpperCase()}`}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {est.deckId?.dimensions?.length && est.deckId?.dimensions?.width
                        ? `${est.deckId.dimensions.length}ft × ${est.deckId.dimensions.width}ft (${est.deckId.area || est.deckId.dimensions.length * est.deckId.dimensions.width} sq ft)`
                        : est.dimensions
                        ? `${est.dimensions} sq ft`
                        : 'Custom Spec'}
                    </td>
                    <td style={styles.td}>{est.deckId?.surfaceMaterial || est.surfaceMaterial || 'Pressure Treated'}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusPillSmall,
                        backgroundColor: est.status === 'calculated' || est.status === 'finalized' ? '#ecfdf5' : '#f1f5f9',
                        color: est.status === 'calculated' || est.status === 'finalized' ? '#065f46' : '#475569',
                      }}>
                        {(est.status || 'draft').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#0f172a' }}>
                      ${Number(est.totalCost || est.pricing?.totalCost || est.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={styles.td}>{new Date(est.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. CONTINUOUS SECTION: Enquiries, Requests & Inquiries */}
      <div style={styles.sectionCard} className="dossier-card">
        <div style={styles.sectionHeader}>
          <div style={{ ...styles.sectionIconBadge, backgroundColor: '#f0f9ff', color: '#0284c7' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 style={styles.sectionTitle}>4. Enquiries, Support &amp; Requests ({enquiries.length})</h2>
        </div>

        {enquiries.length === 0 ? (
          <p style={styles.emptyNote}>No inquiries or communication requests logged for this account.</p>
        ) : (
          <div className="drp-table-wrap" style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Reference #</th>
                  <th style={styles.th}>Channel / Source</th>
                  <th style={styles.th}>Subject &amp; Message</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enq, idx) => (
                  <tr key={enq._id || enq.id || idx} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>{enq.leadNumber || `REQ-${idx + 1}`}</span>
                    </td>
                    <td style={styles.td}>{enq.source || 'Portal Contact'}</td>
                    <td style={{ ...styles.td, maxWidth: '300px' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{enq.subject || 'General Enquiry'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {enq.message || 'No additional message body provided.'}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusPillSmall,
                        backgroundColor: enq.status === 'resolved' || enq.status === 'qualified' ? '#ecfdf5' : '#f8fafc',
                        color: enq.status === 'resolved' || enq.status === 'qualified' ? '#065f46' : '#475569',
                      }}>
                        {(enq.status || 'new').toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(enq.latestContactDate || enq.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. CONTINUOUS SECTION: Moderation History & Standing Audits */}
      <div style={styles.sectionCard} className="dossier-card">
        <div style={styles.sectionHeader}>
          <div style={{ ...styles.sectionIconBadge, backgroundColor: '#fef2f2', color: '#dc2626' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 style={styles.sectionTitle}>5. Administrative Moderation &amp; Standing History</h2>
        </div>

        {moderationHistory.length === 0 ? (
          <p style={styles.emptyNote}>This account has maintained good standing with no moderation penalties logged.</p>
        ) : (
          <div style={styles.timelineList}>
            {moderationHistory.map((item, idx) => (
              <div key={idx} style={styles.timelineItem}>
                <div style={{
                  ...styles.timelineDot,
                  backgroundColor: item.status === 'active' ? '#16a34a' : item.status === 'blocked' ? '#dc2626' : '#f59e0b',
                }} />
                <div>
                  <div style={styles.timelineTitle}>
                    Standing updated to <strong>{(item.status || '').toUpperCase()}</strong>
                  </div>
                  <div style={styles.timelineReason}>{item.reason || 'No admin notes provided.'}</div>
                  <div style={styles.timelineTime}>
                    {new Date(item.updatedAt || Date.now()).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Delete Confirmation */}
      {isDeleteModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#991b1b', fontWeight: '800' }}>
                Confirm Account Deletion
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to delete user account <strong>{u.fullName}</strong> ({u.email})?
              </p>

              <div style={{ marginTop: '16px' }}>
                <label style={styles.modalLabel}>Deletion Audit Reason</label>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g., Requested by user, GDPR compliance, abusive behavior"
                  style={styles.modalInput}
                />
              </div>

              <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="permDelete"
                  checked={isPermanentDelete}
                  onChange={(e) => setIsPermanentDelete(e.target.checked)}
                />
                <label htmlFor="permDelete" style={{ fontSize: '12px', color: '#b91c1c', fontWeight: '700' }}>
                  Permanently remove from database (Hard Delete)
                </label>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  style={styles.confirmDeleteBtn}
                >
                  {actionLoading ? 'Deleting...' : 'Confirm Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Document Preview */}
      {viewingDoc && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '640px' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>
                Verification Document: {viewingDoc.originalFileName}
              </h3>
              <button onClick={() => setViewingDoc(null)} style={styles.modalCloseBtn}>✕</button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={styles.docInfoGrid}>
                <div><strong>Category:</strong> {(viewingDoc.documentType || 'document').replace(/_/g, ' ').toUpperCase()}</div>
                <div><strong>Status:</strong> {(viewingDoc.documentStatus || 'pending').toUpperCase()}</div>
                <div><strong>Size:</strong> {Math.round((viewingDoc.fileSize || 1024) / 1024)} KB</div>
                <div><strong>Uploaded:</strong> {new Date(viewingDoc.createdAt).toLocaleString()}</div>
              </div>

              <div style={styles.docPreviewPlaceholder}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <p style={{ marginTop: '10px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                  {viewingDoc.originalFileName}
                </p>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Storage Key: {viewingDoc.storageKey || 'N/A'}
                </span>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  style={styles.cancelBtn}
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 28px',
    backgroundColor: '#f8fafc',
    minHeight: '100%',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  loadingContainer: {
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderCircle: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#1d4ed8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    padding: '20px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
  },
  backBtnInline: {
    marginLeft: 'auto',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  actionsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  blockBtn: {
    backgroundColor: '#fff1f2',
    color: '#be123c',
    border: '1px solid #fecdd3',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  unblockBtn: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(29, 78, 216, 0.25)',
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  alertSuccess: {
    padding: '12px 16px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    color: '#166534',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  alertClose: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: '#166534',
    cursor: 'pointer',
    fontSize: '14px',
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    marginBottom: '20px',
  },
  heroLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  avatarLarge: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    fontWeight: '800',
    boxShadow: '0 4px 12px rgba(29, 78, 216, 0.35)',
  },
  heroName: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  roleBadge: {
    fontSize: '11px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '6px',
    letterSpacing: '0.4px',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '6px',
    letterSpacing: '0.4px',
  },
  heroSubText: {
    fontSize: '13px',
    color: '#64748b',
    margin: '6px 0 0 0',
  },
  heroRight: {
    display: 'flex',
    alignItems: 'center',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '24px 28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    marginBottom: '20px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '12px',
  },
  sectionIconBadge: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.2px',
  },
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
    gap: '18px',
  },
  infoBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoLabel: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#64748b',
    letterSpacing: '0.4px',
  },
  infoVal: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
  },
  subHeading: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 10px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  emptyNote: {
    fontSize: '13px',
    color: '#94a3b8',
    fontStyle: 'italic',
    margin: 0,
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '1px solid #e2e8f0',
    color: '#64748b',
    fontWeight: '700',
    fontSize: '11px',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '11px 12px',
    verticalAlign: 'middle',
    color: '#334155',
  },
  statusPillSmall: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 7px',
    borderRadius: '4px',
  },
  docTypeBadge: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  viewDocBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#1d4ed8',
  },
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  timelineDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginTop: '4px',
    flexShrink: 0,
  },
  timelineTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
  },
  timelineReason: {
    fontSize: '12px',
    color: '#475569',
    marginTop: '2px',
  },
  timelineTime: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '2px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '16px',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '520px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#64748b',
  },
  modalLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '6px',
  },
  modalInput: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#475569',
  },
  confirmDeleteBtn: {
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    cursor: 'pointer',
  },
  docInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
    gap: '10px',
    fontSize: '12px',
    color: '#334155',
    marginBottom: '18px',
    backgroundColor: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '8px',
  },
  docPreviewPlaceholder: {
    border: '2px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
  },
};

