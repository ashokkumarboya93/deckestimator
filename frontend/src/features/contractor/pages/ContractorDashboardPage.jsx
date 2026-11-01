// =============================================
// Deck Estimator — Contractor Dashboard Page (Phase 8)
// =============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDecks, deleteDeck } from '../../customer/api/decksApi';
import { contractorLeadApi } from '../api/contractorLeadApi';
import { contractorCommissionApi } from '../api/contractorCommissionApi';
import { contractorDiscountApi } from '../api/contractorDiscountApi';
import { useAuth } from '../../auth/hooks/useAuth';

export default function ContractorDashboardPage() {
  const navigate = useNavigate();
  const { user, contractorProfile } = useAuth();

  // Active Tab: 'decks' | 'leads' | 'verification' | 'commissions' | 'discounts'
  const [activeTab, setActiveTab] = useState('leads');

  // Decks state
  const [decks, setDecks] = useState([]);
  const [deckPagination, setDeckPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Leads state
  const [leads, setLeads] = useState([]);
  const [leadPagination, setLeadPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadActionNotes, setLeadActionNotes] = useState('');
  const [leadRejectReason, setLeadRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Verification state
  const [profile, setProfile] = useState(contractorProfile || null);
  const [documents, setDocuments] = useState([]);
  const [docType, setDocType] = useState('insurance_certificate');
  const [docFile, setDocFile] = useState(null);
  const [docNotes, setDocNotes] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Phase 9 Commissions & Discounts state
  const [contractorCommissions, setContractorCommissions] = useState([]);
  const [commissionSummary, setCommissionSummary] = useState(null);
  const [eligibleDiscounts, setEligibleDiscounts] = useState([]);
  const [viewCommission, setViewCommission] = useState(null);
  const [commissionHistory, setCommissionHistory] = useState([]);

  // Common state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const isApproved = profile?.verificationStatus === 'approved' || contractorProfile?.verificationStatus === 'approved';

  useEffect(() => {
    loadContractorProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'decks' && isApproved) {
      loadDecks(1);
    } else if (activeTab === 'leads' && isApproved) {
      loadLeads(1);
    } else if (activeTab === 'verification') {
      loadVerificationDocs();
    } else if (activeTab === 'commissions' && isApproved) {
      loadCommissions();
    } else if (activeTab === 'discounts' && isApproved) {
      loadEligibleDiscounts();
    } else {
      setLoading(false);
    }
  }, [activeTab, isApproved]);

  async function loadCommissions() {
    setLoading(true);
    setError(null);
    try {
      const [commRes, sumRes] = await Promise.all([
        contractorCommissionApi.getMyCommissions(),
        contractorCommissionApi.getCommissionSummary(),
      ]);
      setContractorCommissions(commRes.data || []);
      setCommissionSummary(sumRes.data || null);
    } catch (err) {
      setError(err?.message || 'Failed to load commissions.');
    } finally {
      setLoading(false);
    }
  }

  async function loadEligibleDiscounts() {
    setLoading(true);
    setError(null);
    try {
      const res = await contractorDiscountApi.getEligibleDiscounts();
      setEligibleDiscounts(res.data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load eligible discount policies.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenCommissionHistory(comm) {
    setViewCommission(comm);
    try {
      const histRes = await contractorCommissionApi.getCommissionHistory(comm._id || comm.id);
      setCommissionHistory(histRes.data || []);
    } catch {
      setCommissionHistory([]);
    }
  }

  async function loadContractorProfile() {
    try {
      const data = await contractorLeadApi.getProfile();
      setProfile(data.data);
    } catch {
      // Ignored if not yet initialized
    }
  }

  async function loadDecks(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await getDecks({ page, limit: 9 });
      setDecks(data.decks || []);
      setDeckPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load contractor deck projects.');
    } finally {
      setLoading(false);
    }
  }

  async function loadLeads(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await contractorLeadApi.getAssignedLeads({ page, limit: 10 });
      setLeads(data.data || []);
      setLeadPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load assigned leads.');
    } finally {
      setLoading(false);
    }
  }

  async function loadVerificationDocs() {
    setLoading(true);
    setError(null);
    try {
      const data = await contractorLeadApi.getMyDocuments();
      setDocuments(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptLead(leadId) {
    try {
      await contractorLeadApi.acceptLead(leadId);
      setActionMessage('Lead accepted successfully.');
      loadLeads(leadPagination.page);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to accept lead.');
    }
  }

  async function handleRejectLeadSubmit(e) {
    e.preventDefault();
    if (!leadRejectReason.trim()) return;

    try {
      await contractorLeadApi.rejectLead(selectedLead.id, leadRejectReason.trim());
      setActionMessage('Lead assignment declined.');
      setShowRejectModal(false);
      setSelectedLead(null);
      setLeadRejectReason('');
      loadLeads(leadPagination.page);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to decline lead.');
    }
  }

  async function handleUpdateLeadStatus(leadId, newStatus) {
    try {
      await contractorLeadApi.updateLeadStatus(leadId, newStatus, leadActionNotes);
      setActionMessage(`Lead status updated to ${newStatus.replace(/_/g, ' ')}.`);
      setLeadActionNotes('');
      loadLeads(leadPagination.page);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to update lead status.');
    }
  }

  async function handleDocumentUpload(e) {
    e.preventDefault();
    if (!docFile) {
      setError('Please select a file to upload.');
      return;
    }

    setUploadingDoc(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('documentType', docType);
      formData.append('notes', docNotes);
      formData.append('document', docFile);

      await contractorLeadApi.uploadDocument(formData);
      setActionMessage('Verification document uploaded successfully.');
      setDocFile(null);
      setDocNotes('');
      loadVerificationDocs();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  }

  async function handleSubmitVerification() {
    try {
      await contractorLeadApi.submitVerification();
      setActionMessage('Verification application submitted for administrative review.');
      loadContractorProfile();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to submit verification.');
    }
  }

  async function handleDeleteDeck(deckId, projectName) {
    if (!window.confirm(`Are you sure you want to delete deck job "${projectName}"?`)) {
      return;
    }
    try {
      await deleteDeck(deckId);
      setActionMessage(`Deck project "${projectName}" was deleted.`);
      loadDecks(deckPagination.page);
    } catch (err) {
      setError(err.message || 'Failed to delete deck project.');
    }
  }

  const statusColors = {
    pending: '#854d0e',
    under_review: '#1e40af',
    additional_information_required: '#c2410c',
    approved: '#15803d',
    rejected: '#b91c1c',
    suspended: '#475569',
  };

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={styles.pageTitle}>Contractor Portal</h1>
            <span
              style={{
                ...styles.verificationBadge,
                backgroundColor: isApproved ? '#dcfce7' : '#fef9c3',
                color: isApproved ? '#15803d' : statusColors[profile?.verificationStatus] || '#854d0e',
              }}
            >
              {isApproved
                ? '✓ Verified Contractor'
                : `Status: ${(profile?.verificationStatus || 'pending').replace(/_/g, ' ').toUpperCase()}`}
            </span>
          </div>
          <p style={styles.subtitle}>
            {profile?.businessName || user?.fullName} — Manage your verification documents, client job leads, and deck surveys.
          </p>
        </div>

        {activeTab === 'decks' && isApproved && (
          <button
            type="button"
            onClick={() => navigate('/contractor/decks/new')}
            style={styles.primaryBtn}
          >
            + Create New Deck Record
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button
          type="button"
          onClick={() => setActiveTab('leads')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'leads' ? '3px solid #d97706' : '3px solid transparent',
            color: activeTab === 'leads' ? '#d97706' : '#64748b',
            fontWeight: activeTab === 'leads' ? '700' : '500',
          }}
        >
          📥 Assigned Leads & Enquiries
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('decks')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'decks' ? '3px solid #d97706' : '3px solid transparent',
            color: activeTab === 'decks' ? '#d97706' : '#64748b',
            fontWeight: activeTab === 'decks' ? '700' : '500',
          }}
        >
          🛠️ Deck Records & Surveys
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('verification')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'verification' ? '3px solid #d97706' : '3px solid transparent',
            color: activeTab === 'verification' ? '#d97706' : '#64748b',
            fontWeight: activeTab === 'verification' ? '700' : '500',
          }}
        >
          📜 Verification & Compliance
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('commissions')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'commissions' ? '3px solid #d97706' : '3px solid transparent',
            color: activeTab === 'commissions' ? '#d97706' : '#64748b',
            fontWeight: activeTab === 'commissions' ? '700' : '500',
          }}
        >
          💰 Commissions & Earnings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('discounts')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'discounts' ? '3px solid #d97706' : '3px solid transparent',
            color: activeTab === 'discounts' ? '#d97706' : '#64748b',
            fontWeight: activeTab === 'discounts' ? '700' : '500',
          }}
        >
          🏷️ Partner Discounts
        </button>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div style={styles.successBanner}>
          <span>{actionMessage}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', float: 'right' }}
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div style={styles.errorBanner}>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', float: 'right' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Non-Approved Notice */}
      {!isApproved && (
        <div style={styles.pendingNotice}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                Contractor Verification In Progress
              </h3>
              <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                Your business application is currently in <strong>{profile?.verificationStatus?.toUpperCase() || 'PENDING'}</strong> status.
                License Number on file: <code>{profile?.licenseNumber || 'N/A'}</code>.
                {profile?.additionalInformationRequest && (
                  <span style={{ display: 'block', marginTop: '6px', color: '#c2410c' }}>
                    <strong>Admin Request:</strong> {profile.additionalInformationRequest}
                  </span>
                )}
              </p>
            </div>
            {profile?.verificationStatus === 'additional_information_required' && (
              <button
                type="button"
                onClick={handleSubmitVerification}
                style={styles.primaryBtn}
              >
                Resubmit Application
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: ASSIGNED LEADS */}
      {activeTab === 'leads' && (
        !isApproved ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔒</div>
            <h3 style={styles.emptyTitle}>Leads Locked — Verification Required</h3>
            <p style={styles.emptyDesc}>
              Approved contractors receive direct project enquiries, site visit requests, and estimate follow-ups. Once your application is reviewed and approved, customer leads will appear here.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              style={styles.primaryBtn}
            >
              Go to Verification & Upload Documents
            </button>
          </div>
        ) : loading ? (
          <div style={styles.loadingBox}><p>Loading your assigned leads...</p></div>
        ) : leads.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>No Leads Assigned Yet</h3>
            <p style={styles.emptyDesc}>
              When administrators match customer restoration requests in your service areas with your business, they will appear here in your dispatch inbox.
            </p>
          </div>
        ) : (
          <div style={styles.leadList}>
            {leads.map((lead) => {
              const isLeadAssigned = lead.status === 'assigned';
              const isAccepted = lead.status === 'accepted';
              const isClosed = ['converted', 'closed', 'cancelled', 'not_interested'].includes(lead.status);

              return (
                <div key={lead.id} style={styles.leadCard}>
                  <div style={styles.leadCardHeader}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={styles.leadNumberBadge}>{lead.leadNumber}</span>
                        <h3 style={styles.leadTitle}>{lead.enquiry?.subject || 'Restoration Enquiry'}</h3>
                      </div>
                      <p style={styles.leadMeta}>
                        From: <strong>{lead.customerSnapshot?.name}</strong> • Phone: {lead.customerSnapshot?.phone || 'On file'} • Location: {lead.deckSnapshot?.city}, {lead.deckSnapshot?.state}
                      </p>
                    </div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: isAccepted ? '#dbeafe' : isLeadAssigned ? '#fef3c7' : '#dcfce7',
                        color: isAccepted ? '#1e40af' : isLeadAssigned ? '#92400e' : '#15803d',
                      }}
                    >
                      {lead.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <div style={styles.leadCardBody}>
                    <p style={styles.leadMessage}>"{lead.enquiry?.message}"</p>

                    <div style={styles.leadSpecsGrid}>
                      <div style={styles.specBox}>
                        <span style={styles.specLabel}>Project Name</span>
                        <span style={styles.specVal}>{lead.deckSnapshot?.projectName || 'Deck'}</span>
                      </div>
                      <div style={styles.specBox}>
                        <span style={styles.specLabel}>Deck Area</span>
                        <span style={styles.specVal}>{lead.deckSnapshot?.area} sq ft</span>
                      </div>
                      <div style={styles.specBox}>
                        <span style={styles.specLabel}>Surface</span>
                        <span style={styles.specVal}>{lead.deckSnapshot?.surfaceMaterial || 'Wood'}</span>
                      </div>
                      <div style={styles.specBox}>
                        <span style={styles.specLabel}>Estimate Snapshot</span>
                        <span style={styles.specValBold}>
                          {lead.estimateSnapshot?.totalAmount ? `$${lead.estimateSnapshot.totalAmount.toLocaleString()}` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.leadCardFooter}>
                    {isLeadAssigned && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleAcceptLead(lead.id)}
                          style={styles.acceptBtn}
                        >
                          ✓ Accept Lead
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowRejectModal(true);
                          }}
                          style={styles.declineBtn}
                        >
                          ✕ Decline Lead
                        </button>
                      </div>
                    )}

                    {!isLeadAssigned && !isClosed && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>Update Status:</span>
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                          style={styles.statusSelect}
                        >
                          <option value="accepted">Accepted</option>
                          <option value="contacted">Customer Contacted</option>
                          <option value="site_visit_scheduled">Site Visit Scheduled</option>
                          <option value="quote_in_progress">Quote in Progress</option>
                          <option value="converted">Project Converted (Won)</option>
                          <option value="not_interested">Not Proceeding</option>
                        </select>
                      </div>
                    )}

                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Received: {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* TAB 2: DECK PROJECTS */}
      {activeTab === 'decks' && isApproved && (
        loading ? (
          <div style={styles.loadingBox}><p>Loading deck records...</p></div>
        ) : decks.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🛠️</div>
            <h3 style={styles.emptyTitle}>No Contractor Deck Records</h3>
            <p style={styles.emptyDesc}>Create a deck record to log client property measurements, shapes, and survey photos.</p>
            <button
              type="button"
              onClick={() => navigate('/contractor/decks/new')}
              style={styles.primaryBtn}
            >
              Create First Deck Record
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {decks.map((deck) => (
              <div key={deck.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>{deck.projectName}</h3>
                    <span style={styles.cardLocation}>
                      {[deck.propertyAddress?.city, deck.propertyAddress?.state].filter(Boolean).join(', ') || 'Seattle, WA'}
                    </span>
                  </div>
                  <span style={styles.statusBadge}>{deck.deckShape?.toUpperCase() || 'RECTANGLE'}</span>
                </div>
                <div style={styles.cardDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Area:</span>
                    <span style={styles.detailValueBold}>{deck.dimensions?.area || 300} sq ft</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Surface:</span>
                    <span style={styles.detailValue}>{deck.surfaceDetails?.material || 'Wood'}</span>
                  </div>
                </div>
                <div style={styles.cardActions}>
                  <button
                    type="button"
                    onClick={() => navigate(`/contractor/decks/${deck.id}`)}
                    style={styles.viewBtn}
                  >
                    Site Photos & Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDeck(deck.id, deck.projectName)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* TAB 3: VERIFICATION & DOCUMENTS */}
      {activeTab === 'verification' && (
        <div style={styles.verificationContainer}>
          <div style={styles.profileSection}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
              Business Profile & Licensing
            </h3>
            <div style={styles.profileGrid}>
              <div>
                <span style={styles.specLabel}>Business Name</span>
                <p style={styles.specVal}>{profile?.businessName}</p>
              </div>
              <div>
                <span style={styles.specLabel}>License Number</span>
                <p style={styles.specVal}>{profile?.licenseNumber}</p>
              </div>
              <div>
                <span style={styles.specLabel}>Business Phone</span>
                <p style={styles.specVal}>{profile?.businessPhone || 'Not set'}</p>
              </div>
              <div>
                <span style={styles.specLabel}>Experience</span>
                <p style={styles.specVal}>{profile?.yearsOfExperience || 0} years</p>
              </div>
            </div>
          </div>

          <div style={styles.documentSection}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
              Upload Verification Document
            </h3>
            <form onSubmit={handleDocumentUpload} style={styles.docForm}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={styles.label}>Document Category</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    style={styles.input}
                  >
                    <option value="contractor_license">Contractor License</option>
                    <option value="insurance_certificate">Insurance Certificate</option>
                    <option value="business_registration">Business Registration</option>
                    <option value="identity_document">Identity Document</option>
                    <option value="other">Other Supporting Document</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Select File (PDF, PNG, JPG - max 10MB)</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => setDocFile(e.target.files[0])}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <label style={styles.label}>Document Notes / Policy Number (Optional)</label>
                <input
                  type="text"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="e.g. Policy #GL-998812 exp 2027"
                  style={styles.input}
                />
              </div>
              <button
                type="submit"
                disabled={uploadingDoc || !docFile}
                style={{ ...styles.primaryBtn, marginTop: '12px' }}
              >
                {uploadingDoc ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>

            <h4 style={{ fontSize: '15px', fontWeight: '700', marginTop: '24px', marginBottom: '8px' }}>
              Submitted Verification Documents ({documents.length})
            </h4>
            {documents.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '14px' }}>No documents uploaded yet.</p>
            ) : (
              <div style={styles.docTable}>
                {documents.map((doc) => (
                  <div key={doc.id} style={styles.docRow}>
                    <div>
                      <strong>{doc.originalFileName}</strong> ({doc.documentType?.replace(/_/g, ' ')})
                      <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>
                        Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: doc.documentStatus === 'verified' ? '#dcfce7' : '#fef3c7',
                        color: doc.documentStatus === 'verified' ? '#15803d' : '#854d0e',
                      }}
                    >
                      {doc.documentStatus?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: COMMISSIONS & EARNINGS */}
      {activeTab === 'commissions' && (
        !isApproved ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔒</div>
            <h3 style={styles.emptyTitle}>Commissions Locked — Verification Required</h3>
            <p style={styles.emptyDesc}>
              Approved contractors earn commissions for converted customer leads and deck builds. Complete verification to unlock payouts.
            </p>
          </div>
        ) : loading ? (
          <div style={styles.loadingBox}><p>Loading your commissions & payout history...</p></div>
        ) : (
          <div>
            {/* KPI Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ ...styles.profileSection, borderLeft: '4px solid #15803d' }}>
                <div style={styles.label}>Total Earned (Paid Out)</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#15803d' }}>
                  ${Number(commissionSummary?.totalEarned || 0).toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  {commissionSummary?.paidCount || 0} commissions settled
                </div>
              </div>
              <div style={{ ...styles.profileSection, borderLeft: '4px solid #0284c7' }}>
                <div style={styles.label}>Payable Balance (Ready)</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#0284c7' }}>
                  ${Number(commissionSummary?.pendingPayout || 0).toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Approved & marked payable
                </div>
              </div>
              <div style={{ ...styles.profileSection, borderLeft: '4px solid #d97706' }}>
                <div style={styles.label}>Under Review / Pending</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#d97706' }}>
                  {contractorCommissions.filter((c) => c.status === 'UNDER_REVIEW' || c.status === 'PENDING').length}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Awaiting administrative sign-off
                </div>
              </div>
            </div>

            {/* Commissions Table */}
            <div style={styles.profileSection}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>
                Commission Records & Payout Ledger
              </h3>
              {contractorCommissions.length === 0 ? (
                <div style={styles.emptyBox}>No commission records found for your account yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '10px 12px', fontWeight: '700' }}>Commission #</th>
                        <th style={{ padding: '10px 12px', fontWeight: '700' }}>Lead Code</th>
                        <th style={{ padding: '10px 12px', fontWeight: '700' }}>Basis Amount</th>
                        <th style={{ padding: '10px 12px', fontWeight: '700' }}>Rate Applied</th>
                        <th style={{ padding: '10px 12px', fontWeight: '700' }}>Earned Amount</th>
                        <th style={{ padding: '10px 12px', fontWeight: '700' }}>Status</th>
                        <th style={{ padding: '10px 12px', fontWeight: '700' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractorCommissions.map((comm) => (
                        <tr key={comm._id || comm.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 12px' }}>
                            <strong>{comm.commissionNumber}</strong>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {new Date(comm.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <code>{comm.leadId?.leadCode || comm.leadId}</code>
                          </td>
                          <td style={{ padding: '10px 12px' }}>${Number(comm.basisAmount || 0).toFixed(2)}</td>
                          <td style={{ padding: '10px 12px' }}>
                            {comm.rateApplied?.type === 'PERCENTAGE'
                              ? `${comm.rateApplied.value}%`
                              : `$${comm.rateApplied?.value || 0}`}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <strong style={{ color: '#0284c7' }}>${Number(comm.calculatedAmount || 0).toFixed(2)}</strong>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span
                              style={{
                                ...styles.verificationBadge,
                                backgroundColor:
                                  comm.status === 'PAID'
                                    ? '#dcfce7'
                                    : comm.status === 'PAYABLE'
                                    ? '#e0f2fe'
                                    : '#fef3c7',
                                color:
                                  comm.status === 'PAID'
                                    ? '#15803d'
                                    : comm.status === 'PAYABLE'
                                    ? '#0284c7'
                                    : '#854d0e',
                              }}
                            >
                              {(comm.status || '').toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenCommissionHistory(comm)}
                              style={styles.viewBtn}
                            >
                              Audit Timeline
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
        )
      )}

      {/* TAB 5: PARTNER DISCOUNTS */}
      {activeTab === 'discounts' && (
        !isApproved ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔒</div>
            <h3 style={styles.emptyTitle}>Discounts Locked — Verification Required</h3>
            <p style={styles.emptyDesc}>
              Approved contractors access exclusive wholesale deck material discounts and volume promotions.
            </p>
          </div>
        ) : loading ? (
          <div style={styles.loadingBox}><p>Loading your assigned discount policies...</p></div>
        ) : (
          <div style={styles.profileSection}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#0f172a' }}>
              Your Active Partner Discounts & Promotions
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              These policies can be applied to customer estimates in the estimate breakdown view. Only one discount policy applies per estimate version.
            </p>

            {eligibleDiscounts.length === 0 ? (
              <div style={styles.emptyBox}>No active discounts assigned to your contractor tier at this time.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {eligibleDiscounts.map((disc) => (
                  <div
                    key={disc._id || disc.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#0f172a' }}>{disc.name}</h4>
                      <span
                        style={{
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                        }}
                      >
                        {disc.discountType === 'PERCENTAGE' ? `${disc.discountValue}% OFF` : `$${disc.discountValue} OFF`}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', marginBottom: '10px' }}>
                      {disc.description || 'Standard contractor incentive discount.'}
                    </p>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      <div><strong>Policy Code:</strong> <code>{disc.code}</code></div>
                      <div><strong>Applicability:</strong> {disc.applicability?.replace(/_/g, ' ')}</div>
                      {disc.maxUsageCount && <div><strong>Max Usage:</strong> {disc.maxUsageCount} estimates</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}

      {/* Contractor Commission History Modal */}
      {viewCommission && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalBox, maxWidth: '600px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
              Commission #{viewCommission.commissionNumber}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Lead: {viewCommission.leadId?.leadCode || viewCommission.leadId} | Total: ${Number(viewCommission.calculatedAmount || 0).toFixed(2)}
            </p>

            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>
              📜 Lifecycle Audit History
            </h4>
            <div style={{ maxHeight: '220px', overflowY: 'auto', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px' }}>
              {commissionHistory.length === 0 ? (
                <div>No timeline events found.</div>
              ) : (
                commissionHistory.map((h, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid #e2e8f0', padding: '6px 0' }}>
                    <strong>{h.action}</strong>: {h.fromStatus} &rarr; <strong>{h.toStatus}</strong>
                    <div style={{ color: '#64748b' }}>{new Date(h.createdAt).toLocaleString()}</div>
                    {h.notes && <div style={{ color: '#334155' }}>Note: {h.notes}</div>}
                    {h.reason && <div style={{ color: '#b91c1c' }}>Reason: {h.reason}</div>}
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setViewCommission(null)}
                style={styles.cancelBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Lead Modal */}
      {showRejectModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              Decline Lead Assignment
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              Please provide a reason for declining this lead so administrators can reassign it appropriately.
            </p>
            <form onSubmit={handleRejectLeadSubmit}>
              <textarea
                rows={3}
                value={leadRejectReason}
                onChange={(e) => setLeadRejectReason(e.target.value)}
                placeholder="e.g. Outside our current service area, or booked through June..."
                style={styles.textarea}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.declineBtn}
                >
                  Confirm Decline
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#475569',
    marginTop: '6px',
    marginBottom: 0,
  },
  verificationBadge: {
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '16px',
    textTransform: 'uppercase',
  },
  tabBar: {
    display: 'flex',
    gap: '24px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '24px',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '10px 4px',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primaryBtn: {
    backgroundColor: '#d97706',
    color: '#ffffff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
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
  pendingNotice: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fef3c7',
    color: '#92400e',
    padding: '16px 20px',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1',
  },
  emptyIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 6px 0',
  },
  emptyDesc: {
    fontSize: '14px',
    color: '#64748b',
    maxWidth: '500px',
    margin: '0 auto 20px auto',
    lineHeight: '1.5',
  },
  leadList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  leadCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  leadCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  leadNumberBadge: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#e2e8f0',
    color: '#334155',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  leadTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  leadMeta: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
    marginBottom: 0,
  },
  statusBadge: {
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  leadCardBody: {
    marginBottom: '16px',
  },
  leadMessage: {
    fontSize: '14px',
    color: '#334155',
    backgroundColor: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '8px',
    margin: '0 0 12px 0',
    fontStyle: 'italic',
  },
  leadSpecsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
  },
  specBox: {
    backgroundColor: '#f1f5f9',
    padding: '8px 12px',
    borderRadius: '6px',
  },
  specLabel: {
    fontSize: '11px',
    textTransform: 'uppercase',
    color: '#64748b',
    display: 'block',
    fontWeight: '600',
  },
  specVal: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
    marginTop: '2px',
  },
  specValBold: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#15803d',
    marginTop: '2px',
  },
  leadCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  acceptBtn: {
    backgroundColor: '#15803d',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
  declineBtn: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
  statusSelect: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  cardLocation: {
    fontSize: '12px',
    color: '#64748b',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  detailLabel: { color: '#64748b' },
  detailValue: { color: '#0f172a' },
  detailValueBold: { fontWeight: '700', color: '#0f172a' },
  cardActions: {
    display: 'flex',
    gap: '8px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '10px',
  },
  viewBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  verificationContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  profileSection: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '20px',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  documentSection: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '20px',
  },
  docForm: {
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    display: 'block',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  docTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  docRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    fontSize: '13px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '10px',
    maxWidth: '480px',
    width: '90%',
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
  loadingBox: {
    textAlign: 'center',
    padding: '36px',
    color: '#64748b',
  },
};
