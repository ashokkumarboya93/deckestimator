// =============================================
// Deck Estimator — Admin Lead Management Page (Phase 8)
// =============================================

import React, { useState, useEffect } from 'react';
import { adminLeadApi } from '../api/adminLeadApi';

export default function AdminLeadManagementPage() {
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Assignment Modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [eligibleContractors, setEligibleContractors] = useState([]);
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Close Modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeAction, setCloseAction] = useState('CLOSE');
  const [closeReason, setCloseReason] = useState('');

  useEffect(() => {
    loadLeads(1);
    loadAnalytics();
  }, [statusFilter]);

  async function loadLeads(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await adminLeadApi.getAllLeads({
        page,
        limit: 15,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      });
      setLeads(data.data || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalytics() {
    try {
      const data = await adminLeadApi.getLeadAnalytics();
      setAnalytics(data.data);
    } catch {
      // Ignored
    }
  }

  async function handleOpenAssign(lead) {
    setSelectedLead(lead);
    setAssignReason('');
    setAssignNotes('');
    try {
      const data = await adminLeadApi.getEligibleContractors({
        surfaceMaterial: lead.deckSnapshot?.surfaceMaterial,
      });
      setEligibleContractors(data.data || []);
      if (data.data && data.data.length > 0) {
        setSelectedContractorId(data.data[0].userId?._id || data.data[0].userId?.id || '');
      }
    } catch {
      setEligibleContractors([]);
    }
  }

  async function handleAssignSubmit(e) {
    e.preventDefault();
    if (!selectedContractorId) {
      setError('Please select an eligible contractor.');
      return;
    }

    setAssigning(true);
    try {
      await adminLeadApi.assignContractor(selectedLead.id, {
        contractorId: selectedContractorId,
        assignmentReason: assignReason.trim(),
        assignmentNotes: assignNotes.trim(),
      });
      setActionSuccess(`Lead ${selectedLead.leadNumber} assigned successfully.`);
      setSelectedLead(null);
      loadLeads(pagination.page);
      loadAnalytics();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Assignment failed.');
    } finally {
      setAssigning(false);
    }
  }

  async function handleCloseLeadSubmit(e) {
    e.preventDefault();
    if (!closeReason.trim()) return;

    try {
      await adminLeadApi.closeLead(selectedLead.id, closeAction, closeReason.trim());
      setActionSuccess(`Lead ${selectedLead.leadNumber} ${closeAction.toLowerCase()}ed.`);
      setShowCloseModal(false);
      setSelectedLead(null);
      setCloseReason('');
      loadLeads(pagination.page);
      loadAnalytics();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Close action failed.');
    }
  }

  const statusColors = {
    new: { bg: '#dbeafe', text: '#1e40af' },
    under_review: { bg: '#fef3c7', text: '#92400e' },
    assigned: { bg: '#ffedd5', text: '#c2410c' },
    accepted: { bg: '#e0e7ff', text: '#3730a3' },
    contacted: { bg: '#f3e8ff', text: '#6b21a8' },
    site_visit_scheduled: { bg: '#fae8ff', text: '#86198f' },
    quote_in_progress: { bg: '#fef9c3', text: '#854d0e' },
    converted: { bg: '#dcfce7', text: '#15803d' },
    closed: { bg: '#f1f5f9', text: '#475569' },
    cancelled: { bg: '#fee2e2', text: '#b91c1c' },
    not_interested: { bg: '#fecdd3', text: '#9f1239' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Lead Management & Dispatch</h1>
          <p style={styles.subtitle}>
            Oversee incoming restoration enquiries, match projects to eligible contractors, and track conversion lifecycles.
          </p>
        </div>
      </div>

      {actionSuccess && <div style={styles.successBanner}>{actionSuccess}</div>}
      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* Analytics Cards */}
      {analytics && (
        <div style={styles.analyticsGrid}>
          <div style={styles.analyticCard}>
            <span style={styles.analyticLabel}>Total Leads</span>
            <span style={styles.analyticVal}>{analytics.totalLeads}</span>
          </div>
          <div style={styles.analyticCard}>
            <span style={styles.analyticLabel}>New Enquiries</span>
            <span style={{ ...styles.analyticVal, color: '#2563eb' }}>
              {analytics.statusCounts?.new || 0}
            </span>
          </div>
          <div style={styles.analyticCard}>
            <span style={styles.analyticLabel}>Assigned</span>
            <span style={{ ...styles.analyticVal, color: '#d97706' }}>
              {analytics.statusCounts?.assigned || 0}
            </span>
          </div>
          <div style={styles.analyticCard}>
            <span style={styles.analyticLabel}>In Progress</span>
            <span style={{ ...styles.analyticVal, color: '#7c3aed' }}>
              {(analytics.statusCounts?.accepted || 0) +
                (analytics.statusCounts?.contacted || 0) +
                (analytics.statusCounts?.site_visit_scheduled || 0) +
                (analytics.statusCounts?.quote_in_progress || 0)}
            </span>
          </div>
          <div style={styles.analyticCard}>
            <span style={styles.analyticLabel}>Converted (Won)</span>
            <span style={{ ...styles.analyticVal, color: '#16a34a' }}>
              {analytics.statusCounts?.converted || 0}
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadLeads(1)}
            placeholder="Search by lead #, customer name, email, or deck name..."
            style={styles.searchInput}
          />
          <button type="button" onClick={() => loadLeads(1)} style={styles.filterBtn}>
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
            <option value="new">New</option>
            <option value="under_review">Under Review</option>
            <option value="assigned">Assigned</option>
            <option value="accepted">Accepted</option>
            <option value="contacted">Contacted</option>
            <option value="site_visit_scheduled">Site Visit Scheduled</option>
            <option value="quote_in_progress">Quote in Progress</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div style={styles.loadingBox}><p>Loading leads...</p></div>
      ) : leads.length === 0 ? (
        <div style={styles.emptyBox}>No leads found matching your criteria.</div>
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Lead #</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Project & Location</th>
                <th style={styles.th}>Area / Surface</th>
                <th style={styles.th}>Estimate</th>
                <th style={styles.th}>Assigned Contractor</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => {
                const colors = statusColors[l.status] || { bg: '#f1f5f9', text: '#334155' };
                const isClosed = ['converted', 'closed', 'cancelled'].includes(l.status);

                return (
                  <tr key={l.id} style={styles.tr}>
                    <td style={styles.tdBold}>{l.leadNumber}</td>
                    <td style={styles.td}>
                      <strong>{l.customerSnapshot?.name}</strong>
                      <span style={styles.emailSub}>{l.customerSnapshot?.email}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{l.customerSnapshot?.phone}</span>
                    </td>
                    <td style={styles.td}>
                      {l.deckSnapshot?.projectName}
                      <span style={styles.emailSub}>
                        {[l.deckSnapshot?.city, l.deckSnapshot?.state].filter(Boolean).join(', ') || 'N/A'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {l.deckSnapshot?.area} sq ft
                      <span style={styles.emailSub}>{l.deckSnapshot?.surfaceMaterial}</span>
                    </td>
                    <td style={styles.td}>
                      {l.estimateSnapshot?.totalAmount
                        ? `$${l.estimateSnapshot.totalAmount.toLocaleString()}`
                        : '—'}
                    </td>
                    <td style={styles.td}>
                      {l.assignedContractorProfileId?.businessName ? (
                        <div>
                          <strong>{l.assignedContractorProfileId.businessName}</strong>
                          <span style={styles.emailSub}>
                            {l.assignedContractorId?.firstName} {l.assignedContractorId?.lastName}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: colors.bg,
                          color: colors.text,
                        }}
                      >
                        {l.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {!isClosed && (
                          <button
                            type="button"
                            onClick={() => handleOpenAssign(l)}
                            style={styles.assignBtn}
                          >
                            {l.assignedContractorId ? 'Reassign' : 'Assign'}
                          </button>
                        )}
                        {!isClosed && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLead(l);
                              setShowCloseModal(true);
                            }}
                            style={styles.closeBtn}
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Assignment Modal */}
      {selectedLead && !showCloseModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                  Assign Contractor to Lead {selectedLead.leadNumber}
                </h2>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Project: {selectedLead.deckSnapshot?.projectName} ({selectedLead.deckSnapshot?.surfaceMaterial}) • Location: {selectedLead.deckSnapshot?.city}, {selectedLead.deckSnapshot?.state}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={styles.label}>Select Eligible Approved Contractor *</label>
                {eligibleContractors.length === 0 ? (
                  <p style={{ color: '#b91c1c', fontSize: '13px' }}>
                    No approved contractors match this deck surface or location. Please verify pending contractors first.
                  </p>
                ) : (
                  <select
                    value={selectedContractorId}
                    onChange={(e) => setSelectedContractorId(e.target.value)}
                    style={styles.selectFull}
                    required
                  >
                    {eligibleContractors.map((c) => (
                      <option key={c.id} value={c.userId?._id || c.userId?.id}>
                        {c.businessName} — Lic #{c.licenseNumber} ({c.businessAddress?.city || 'WA'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={styles.label}>Assignment Reason (Optional)</label>
                <input
                  type="text"
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  placeholder="e.g. Local specialist with cedar restoration experience"
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Internal Notes for Dispatch (Optional)</label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Any contractor instructions or notes..."
                  style={styles.textarea}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning || eligibleContractors.length === 0}
                  style={styles.confirmAssignBtn}
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close/Cancel Modal */}
      {selectedLead && showCloseModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                  Close / Cancel Lead {selectedLead.leadNumber}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCloseModal(false);
                  setSelectedLead(null);
                }}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCloseLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={styles.label}>Closure Type</label>
                <select
                  value={closeAction}
                  onChange={(e) => setCloseAction(e.target.value)}
                  style={styles.selectFull}
                >
                  <option value="CLOSE">Close Lead (Completed / Resolved)</option>
                  <option value="CANCEL">Cancel Lead (Cancelled / Spam / Ineligible)</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Reason for Closure *</label>
                <textarea
                  rows={3}
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  placeholder="Explain why this lead is being closed..."
                  style={styles.textarea}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCloseModal(false);
                    setSelectedLead(null);
                  }}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.dangerBtn}
                >
                  Confirm {closeAction}
                </button>
              </div>
            </form>
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
  header: { marginBottom: '20px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    marginBottom: '24px',
  },
  analyticCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px',
  },
  analyticLabel: {
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#64748b',
    display: 'block',
  },
  analyticVal: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    marginTop: '4px',
    display: 'block',
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
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHeaderRow: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 16px', fontSize: '13px', color: '#334155' },
  tdBold: { padding: '12px 16px', fontSize: '14px', fontWeight: '700', color: '#0f172a' },
  emailSub: { display: 'block', fontSize: '11px', color: '#64748b' },
  badge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '12px',
    display: 'inline-block',
  },
  assignBtn: {
    backgroundColor: '#d97706',
    color: '#ffffff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  closeBtn: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
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
  loadingBox: { textAlign: 'center', padding: '40px', color: '#64748b' },
  emptyBox: { textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b' },
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
    maxWidth: '560px',
    width: '100%',
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
  label: { fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' },
  input: { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' },
  cancelBtn: { backgroundColor: '#e2e8f0', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  confirmAssignBtn: { backgroundColor: '#15803d', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  dangerBtn: { backgroundColor: '#b91c1c', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
};

