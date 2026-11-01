// =============================================
// Deck Estimator — Admin Contractor Verification Page (Phase 8)
// =============================================

import React, { useState, useEffect } from 'react';
import { adminVerificationApi } from '../api/adminVerificationApi';

export default function AdminContractorVerificationPage() {
  const [contractors, setContractors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Review drawer/modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewAction, setReviewAction] = useState('APPROVE');
  const [reviewReason, setReviewReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadContractors(1);
  }, [statusFilter]);

  async function loadContractors(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await adminVerificationApi.getApplications({
        page,
        limit: 15,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      });
      setContractors(data.data || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to load contractor applications.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenReview(appId) {
    setReviewLoading(true);
    try {
      const data = await adminVerificationApi.getApplicationDetails(appId);
      setSelectedApp(data.data);
      setReviewReason('');
      setReviewNotes('');
    } catch (err) {
      setError(err?.message || 'Failed to load application details.');
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleExecuteReview(e) {
    e.preventDefault();
    if (!selectedApp) return;

    if (['REJECT', 'REQUEST_INFORMATION', 'SUSPEND'].includes(reviewAction) && !reviewReason.trim()) {
      setError(`A reason is required when executing ${reviewAction.replace(/_/g, ' ')}.`);
      return;
    }

    setReviewLoading(true);
    try {
      await adminVerificationApi.reviewApplication(selectedApp.profile.id, {
        action: reviewAction,
        reason: reviewReason.trim(),
        notes: reviewNotes.trim(),
      });
      setActionSuccess(`Application ${reviewAction.toLowerCase()}ed successfully.`);
      setSelectedApp(null);
      loadContractors(pagination.page);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Action failed.');
    } finally {
      setReviewLoading(false);
    }
  }

  const statusColors = {
    pending: { bg: '#fef3c7', text: '#92400e' },
    under_review: { bg: '#dbeafe', text: '#1e40af' },
    additional_information_required: { bg: '#ffedd5', text: '#c2410c' },
    approved: { bg: '#dcfce7', text: '#15803d' },
    rejected: { bg: '#fee2e2', text: '#b91c1c' },
    suspended: { bg: '#f1f5f9', text: '#475569' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Contractor Verification Portal</h1>
          <p style={styles.subtitle}>
            Review contractor business applications, license documentation, and manage platform authorization.
          </p>
        </div>
      </div>

      {actionSuccess && <div style={styles.successBanner}>{actionSuccess}</div>}
      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* Filters Bar */}
      <div style={styles.filterBar}>
        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadContractors(1)}
            placeholder="Search by business name, license #, or email..."
            style={styles.searchInput}
          />
          <button type="button" onClick={() => loadContractors(1)} style={styles.filterBtn}>
            Search
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="additional_information_required">Additional Info Required</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={styles.loadingBox}><p>Loading contractor applications...</p></div>
      ) : contractors.length === 0 ? (
        <div style={styles.emptyBox}>No contractor applications match your search criteria.</div>
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Business Name</th>
                <th style={styles.th}>Contractor Contact</th>
                <th style={styles.th}>License Number</th>
                <th style={styles.th}>City / State</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Submitted</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contractors.map((c) => {
                const colors = statusColors[c.verificationStatus] || { bg: '#f1f5f9', text: '#334155' };
                return (
                  <tr key={c.id} style={styles.tr}>
                    <td style={styles.tdBold}>{c.businessName}</td>
                    <td style={styles.td}>
                      {c.userId?.firstName} {c.userId?.lastName}
                      <span style={styles.emailSub}>{c.userId?.email}</span>
                    </td>
                    <td style={styles.td}><code>{c.licenseNumber}</code></td>
                    <td style={styles.td}>
                      {[c.businessAddress?.city, c.businessAddress?.state].filter(Boolean).join(', ') || 'N/A'}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: colors.bg,
                          color: colors.text,
                        }}
                      >
                        {c.verificationStatus.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(c.submittedAt || c.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        onClick={() => handleOpenReview(c.id)}
                        style={styles.reviewBtn}
                      >
                        Review Application
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                  Review Application: {selectedApp.profile?.businessName}
                </h2>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  License: {selectedApp.profile?.licenseNumber} • Status: {selectedApp.profile?.verificationStatus?.toUpperCase()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <h4 style={styles.sectionHeader}>Business Details</h4>
                <p style={{ fontSize: '13px', margin: '4px 0' }}>
                  <strong>Address:</strong> {selectedApp.profile?.businessAddress?.street}, {selectedApp.profile?.businessAddress?.city}, {selectedApp.profile?.businessAddress?.state} {selectedApp.profile?.businessAddress?.zipCode}
                </p>
                <p style={{ fontSize: '13px', margin: '4px 0' }}>
                  <strong>Experience:</strong> {selectedApp.profile?.yearsOfExperience || 0} years • <strong>Phone:</strong> {selectedApp.profile?.businessPhone || 'N/A'}
                </p>
                {selectedApp.profile?.businessDescription && (
                  <p style={{ fontSize: '13px', color: '#475569', fontStyle: 'italic', margin: '6px 0' }}>
                    "{selectedApp.profile.businessDescription}"
                  </p>
                )}
              </div>

              <div style={styles.modalSection}>
                <h4 style={styles.sectionHeader}>
                  Uploaded Verification Documents ({selectedApp.documents?.length || 0})
                </h4>
                {selectedApp.documents?.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>No verification documents uploaded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedApp.documents.map((d) => (
                      <div key={d.id} style={styles.docItem}>
                        <div>
                          <span style={{ fontWeight: '600', fontSize: '13px' }}>{d.originalFileName}</span>
                          <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>
                            Type: {d.documentType?.replace(/_/g, ' ').toUpperCase()} • Uploaded: {new Date(d.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <a
                          href={`/api/v1/contractors/documents/${d.id}/file`}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.downloadLink}
                        >
                          View / Download ↗
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Review Form */}
              <form onSubmit={handleExecuteReview} style={styles.reviewForm}>
                <h4 style={styles.sectionHeader}>Administrative Decision</h4>

                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.label}>Action</label>
                  <select
                    value={reviewAction}
                    onChange={(e) => setReviewAction(e.target.value)}
                    style={styles.selectFull}
                  >
                    <option value="START_REVIEW">Start Review (Mark Under Review)</option>
                    <option value="APPROVE">Approve Contractor</option>
                    <option value="REQUEST_INFORMATION">Request Additional Information</option>
                    <option value="REJECT">Reject Application</option>
                    <option value="SUSPEND">Suspend Contractor</option>
                    <option value="REACTIVATE">Reactivate Contractor</option>
                  </select>
                </div>

                {['REJECT', 'REQUEST_INFORMATION', 'SUSPEND'].includes(reviewAction) && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={styles.label}>
                      Reason for {reviewAction.replace(/_/g, ' ')} *
                    </label>
                    <textarea
                      rows={2}
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder="Explain to the contractor what is required or why the application was declined..."
                      style={styles.textarea}
                      required
                    />
                  </div>
                )}

                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.label}>Internal Admin Notes (Optional)</label>
                  <input
                    type="text"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Internal reference or verification notes..."
                    style={styles.input}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    style={styles.cancelBtn}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    style={styles.executeBtn}
                  >
                    {reviewLoading ? 'Processing...' : `Submit ${reviewAction}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 16px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
  },
  filterBtn: {
    backgroundColor: '#334155',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    fontWeight: '500',
  },
  selectFull: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: '#334155',
  },
  tdBold: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  emailSub: {
    display: 'block',
    fontSize: '11px',
    color: '#64748b',
  },
  badge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '12px',
    display: 'inline-block',
  },
  reviewBtn: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#1e293b',
  },
  successBanner: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    color: '#64748b',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '640px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '24px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalSection: {
    backgroundColor: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '8px',
  },
  sectionHeader: {
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#475569',
    margin: '0 0 8px 0',
  },
  docItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  downloadLink: {
    fontSize: '12px',
    color: '#2563eb',
    fontWeight: '600',
    textDecoration: 'none',
  },
  reviewForm: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '16px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    display: 'block',
    marginBottom: '4px',
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  cancelBtn: {
    backgroundColor: '#e2e8f0',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  executeBtn: {
    backgroundColor: '#d97706',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
