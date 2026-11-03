// =============================================
// Deck Estimator — Contractor Verification & Compliance Page
// =============================================
// Matches Image 3 (Top Left) Visual Reference:
// - Title & description
// - Business Profile & Licensing card with Edit button
// - Verification Documents table: Document Name, Category, File, Status, Uploaded On, Action
// - Upload Document button + modal

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractorLeadApi } from '../api/contractorLeadApi';

export default function ContractorVerificationPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('License');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [profRes, docsRes] = await Promise.allSettled([
        contractorLeadApi.getProfile(),
        contractorLeadApi.getMyDocuments(),
      ]);
      if (profRes.status === 'fulfilled' && profRes.value?.data) {
        setProfile(profRes.value.data);
      }
      if (docsRes.status === 'fulfilled' && docsRes.value?.data) {
        setDocuments(docsRes.value.data);
      }
    } catch (e) {
      console.warn('Verification load error:', e);
    } finally {
      setLoading(false);
    }
  }

  // Fallback records matching Image 3 (Top Left)
  const displayDocs = documents.length > 0 ? documents : [
    {
      id: 'doc-1',
      name: 'Contractor License',
      category: 'License',
      file: 'license.pdf',
      status: 'Verified',
      uploadedOn: 'Oct 20, 2026',
    },
    {
      id: 'doc-2',
      name: 'General Liability Insurance',
      category: 'Insurance',
      file: 'insurance.pdf',
      status: 'Under Review',
      uploadedOn: 'Oct 21, 2026',
    },
    {
      id: 'doc-3',
      name: 'Business Registration',
      category: 'Registration',
      file: 'registration.pdf',
      status: 'Verified',
      uploadedOn: 'Oct 15, 2026',
    },
  ];

  return (
    <div style={styles.container}>
      {/* 1. PAGE TITLE & DESCRIPTION */}
      <div>
        <h1 style={styles.pageTitle}>Verification &amp; Compliance</h1>
        <p style={styles.pageSub}>
          Manage your business information and required verification documents.
        </p>
      </div>

      {/* 2. BUSINESS PROFILE CARD */}
      <div style={styles.profileCard}>
        <div style={styles.profileLeft}>
          <div style={styles.profileIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={styles.businessTitle}>Business Profile</strong>
              <span style={styles.verifiedBadge}>Verified</span>
            </div>
            <div style={styles.businessName}>Apex Deck Pros LLC</div>
          </div>
        </div>

        <div style={styles.profileMetaGrid}>
          <div>
            <div style={styles.metaLabel}>License Number</div>
            <div style={styles.metaVal}>LIC-TX-2026-99</div>
          </div>
          <div>
            <div style={styles.metaLabel}>Business Phone</div>
            <div style={styles.metaVal}>555-888-9999</div>
          </div>
          <div>
            <div style={styles.metaLabel}>Experience</div>
            <div style={styles.metaVal}>5 years</div>
          </div>
        </div>

        <button type="button" style={styles.editBtn}>
          Edit
        </button>
      </div>

      {/* 3. VERIFICATION DOCUMENTS TABLE */}
      <div style={styles.tableCard}>
        <div style={styles.cardHeaderRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <h2 style={styles.cardHeading}>Verification Documents</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            style={styles.uploadBtn}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <span>Upload Document</span>
          </button>
        </div>

        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Document Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>File</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Uploaded On</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayDocs.map((d) => (
                <tr key={d.id} style={styles.tr}>
                  <td style={styles.tdBold}>{d.name}</td>
                  <td style={styles.td}>{d.category}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span>{d.file}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={
                        d.status === 'Verified'
                          ? styles.statusVerified
                          : styles.statusUnderReview
                      }
                    >
                      {d.status}
                    </span>
                  </td>
                  <td style={styles.tdMuted}>{d.uploadedOn}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/contractor/verification/${d.id}`)}
                        style={styles.viewBtn}
                      >
                        View
                      </button>
                      <button type="button" style={styles.moreBtn}>•••</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.paginationRow}>
          <span style={styles.pageInfo}>Showing 1 – 3 of 3 documents</span>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={styles.modalOverlay} onClick={() => setShowUploadModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Upload Verification Document</h3>
              <button type="button" onClick={() => setShowUploadModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={styles.inputLabel}>Document Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  style={styles.modalSelect}
                >
                  <option value="License">Contractor License</option>
                  <option value="Insurance">Insurance Certificate</option>
                  <option value="Registration">Business Registration</option>
                  <option value="Identity">Identity Document</option>
                  <option value="Other">Other Supporting Document</option>
                </select>
              </div>

              <div>
                <label style={styles.inputLabel}>Select File (PDF, PNG, JPG - max 10MB)</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={styles.fileInput}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={styles.uploadSubmitBtn}
                >
                  Upload Document
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
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
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  pageSub: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  profileLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  profileIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessTitle: {
    fontSize: '14px',
    color: '#0f172a',
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  businessName: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  profileMetaGrid: {
    display: 'flex',
    gap: '32px',
  },
  metaLabel: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: '13px',
    color: '#0f172a',
    fontWeight: '700',
    marginTop: '2px',
  },
  editBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '6px 18px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    cursor: 'pointer',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardHeading: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13px',
  },
  th: {
    padding: '12px 14px',
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
    padding: '14px 14px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  tdBold: {
    padding: '14px 14px',
    color: '#0f172a',
    fontWeight: '700',
    verticalAlign: 'middle',
  },
  tdMuted: {
    padding: '14px 14px',
    color: '#64748b',
    fontSize: '12px',
    verticalAlign: 'middle',
  },
  statusVerified: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  statusUnderReview: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  viewBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '5px 14px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#1d4ed8',
    cursor: 'pointer',
  },
  moreBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '12px',
  },
  paginationRow: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9',
  },
  pageInfo: {
    fontSize: '12px',
    color: '#64748b',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '480px',
    width: '90%',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#94a3b8',
  },
  inputLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '6px',
  },
  modalSelect: {
    width: '100%',
    height: '38px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    padding: '0 12px',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
  },
  fileInput: {
    width: '100%',
    fontSize: '13px',
    color: '#334155',
  },
  uploadSubmitBtn: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};
