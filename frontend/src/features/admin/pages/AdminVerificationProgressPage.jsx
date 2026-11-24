// =============================================
// Deck Estimator — Admin Verification & Progress Page
// =============================================
// Features:
// - 4 horizontal tabs: Verifications, Contractor Documents, Customers, Contractors
// - Tab 1 (Verifications): Contractor onboarding queue, document inspect, Approve & Reject with mandatory reason dialog, Verification History
// - Tab 2 (Contractor Documents): Review uploaded licenses, insurance certificates, and commercial credentials with live inline preview
// - Tab 3 (Customers): Complete customer directory with estimate count, projects, and moderation controls
// - Tab 4 (Contractors): Complete contractor roster with verification standing, license, discount tier, and projects
// - All tabs feature search, status filtering, refresh, and pagination

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { getStoredToken, BASE_URL } from '../../../api/client';

const PAGE_SIZE = 10;

const TABS = [
  { id: 'verifications', label: 'Verifications' },
  { id: 'documents', label: 'Contractor Documents' },
  { id: 'customers', label: 'Customers' },
  { id: 'contractors', label: 'Contractors' },
  { id: 'discount_requests', label: 'Discount Requests' },
];

export default function AdminVerificationProgressPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Tab State: restore tab if returning from user profile
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.tab || 'verifications';
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Responsive layout
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 900 : false));
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Shared / Tab Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Status filters
  const [verifFilter, setVerifFilter] = useState('all');
  const [docsFilter, setDocsFilter] = useState('all');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('all');
  const [contractorStatusFilter, setContractorStatusFilter] = useState('all');

  // Document Blob Preview State
  const [docBlobUrl, setDocBlobUrl] = useState(null);
  const [docLoading, setDocLoading] = useState(false);
  const [viewingDocModal, setViewingDocModal] = useState(null);
  const [docReviewModal, setDocReviewModal] = useState({ open: false, doc: null, action: '', notes: '' });
  const [docSubmitting, setDocSubmitting] = useState(false);

  // Verifications State
  const [verifications, setVerifications] = useState([]);
  const [verifCounts, setVerifCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [verifActionModal, setVerifActionModal] = useState({ open: false, type: '', item: null, reason: '' });
  const [verifHistoryModal, setVerifHistoryModal] = useState({ open: false, logs: [], contractorName: '' });
  const [viewContractorModal, setViewContractorModal] = useState(null);

  // Contractor Documents State
  const [contractorDocs, setContractorDocs] = useState([]);
  const [docsCounts, setDocsCounts] = useState({ pending: 0, verified: 0, rejected: 0, total: 0 });

  // Users Directory State (Customers & Contractors)
  const [customers, setCustomers] = useState([]);
  const [contractors, setContractors] = useState([]);

  // Discount Requests State (Tab 5)
  const [discountRequests, setDiscountRequests] = useState([]);
  const [discountReqFilter, setDiscountReqFilter] = useState('all');
  const [tuneModal, setTuneModal] = useState({ open: false, request: null, discountPercent: 10, adminNotes: '' });
  const [rejectReqModal, setRejectReqModal] = useState({ open: false, request: null, adminNotes: '' });
  const [contractorDocsModal, setContractorDocsModal] = useState({ open: false, request: null });

  // Reset page and search when switching tabs
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchTerm('');
    setPage(1);
  };

  // Secure Document Viewer with Authorization Token (Fixes previewing landing page)
  useEffect(() => {
    if (!viewingDocModal) {
      if (docBlobUrl) {
        URL.revokeObjectURL(docBlobUrl);
        setDocBlobUrl(null);
      }
      return;
    }

    const docId = viewingDocModal._id || viewingDocModal.id;
    if (!docId) return;

    let isMounted = true;
    async function fetchDocBlob() {
      setDocLoading(true);
      try {
        const token = getStoredToken();
        const fileUrl = `${BASE_URL}/admin/contractor-documents/${docId}/file?token=${encodeURIComponent(token || '')}`;
        const res = await fetch(fileUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch file: ${res.status}`);
        }
        const cType = res.headers.get('content-type') || '';
        if (cType.includes('text/html')) {
          throw new Error('Received HTML fallback instead of real document blob');
        }
        const blob = await res.blob();
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setDocBlobUrl(url);
        }
      } catch (err) {
        console.warn('Direct file stream fallback:', err);
      } finally {
        if (isMounted) setDocLoading(false);
      }
    }
    fetchDocBlob();

    return () => {
      isMounted = false;
      if (docBlobUrl) {
        URL.revokeObjectURL(docBlobUrl);
      }
    };
  }, [viewingDocModal]);

  useEffect(() => {
    loadTabData(false);

    const interval = setInterval(() => {
      loadTabData(true);
    }, 15000);

    const handleFocus = () => {
      loadTabData(true);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeTab, verifFilter, docsFilter, discountReqFilter]);

  const loadTabData = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      if (activeTab === 'verifications') {
        const res = await adminApi.getVerifications({ status: verifFilter !== 'all' ? verifFilter : undefined });
        setVerifications(res.data || []);
        if (res.counts) setVerifCounts(res.counts);
      } else if (activeTab === 'documents') {
        const res = await adminApi.getContractorDocuments({ status: docsFilter !== 'all' ? docsFilter : undefined });
        const list = res.data?.data || res.data || [];
        setContractorDocs(list);
        if (res.counts || res.data?.counts) setDocsCounts(res.counts || res.data?.counts);
      } else if (activeTab === 'customers') {
        const res = await adminApi.getUsers({ role: 'customer', limit: 100 });
        setCustomers(res.data || []);
      } else if (activeTab === 'contractors') {
        const res = await adminApi.getUsers({ role: 'contractor', limit: 100 });
        setContractors(res.data || []);
      } else if (activeTab === 'discount_requests') {
        const res = await adminApi.getDiscountRequests({
          status: discountReqFilter !== 'all' ? discountReqFilter : undefined,
        });
        const list = res.data?.requests || res.data || [];
        setDiscountRequests(list);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load module data');
    } finally {
      setLoading(false);
    }
  };

  // DOCUMENT REVIEW ACTIONS (Separate from profile approval, for discount tier verification)
  const handleReviewDocument = async (docId, status, notes = '') => {
    setDocSubmitting(true);
    try {
      await adminApi.reviewContractorDocument(docId, status, notes);
      setSuccessMsg(`Document ${status === 'verified' ? 'approved' : 'rejected'} successfully.`);
      setDocReviewModal({ open: false, doc: null, action: '', notes: '' });
      loadTabData();
    } catch (err) {
      setError(err?.message || 'Failed to update document status.');
    } finally {
      setDocSubmitting(false);
    }
  };

  // VERIFICATION ACTIONS
  const handleApproveVerification = async (item) => {
    setLoading(true);
    try {
      await adminApi.approveVerification(item._id || item.id);
      setSuccessMsg(`Contractor ${item.contractorName || 'account'} approved successfully.`);
      loadTabData();
    } catch (err) {
      setError(err?.message || 'Approval failed.');
      setLoading(false);
    }
  };

  const handleOpenRejectModal = (item) => {
    setVerifActionModal({ open: true, type: 'reject', item, reason: '' });
  };

  const handleConfirmReject = async () => {
    if (!verifActionModal.reason.trim()) {
      alert('Please provide a mandatory rejection reason.');
      return;
    }
    setLoading(true);
    try {
      await adminApi.rejectVerification(verifActionModal.item._id || verifActionModal.item.id, verifActionModal.reason);
      setSuccessMsg('Contractor registration rejected with reason logged.');
      setVerifActionModal({ open: false, type: '', item: null, reason: '' });
      loadTabData();
    } catch (err) {
      setError(err?.message || 'Rejection failed.');
      setLoading(false);
    }
  };

  const handleViewVerificationHistory = async (contractorId, contractorName) => {
    try {
      const res = await adminApi.getVerificationHistory(contractorId);
      setVerifHistoryModal({ open: true, logs: res.data || [], contractorName: contractorName || 'Contractor' });
    } catch (err) {
      alert('Unable to retrieve verification history logs.');
    }
  };

  // =========================================================================
  // TAB FILTERING & PAGINATION DERIVATIONS
  // =========================================================================

  // Tab 1: Verifications
  const filteredVerifications = useMemo(() => {
    return verifications.filter((item) => {
      if (verifFilter !== 'all' && item.status !== verifFilter) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        (item.contractorName || '').toLowerCase().includes(q) ||
        (item.contractorEmail || '').toLowerCase().includes(q) ||
        (item.companyName || '').toLowerCase().includes(q) ||
        (item.licenseNumber || '').toLowerCase().includes(q)
      );
    });
  }, [verifications, verifFilter, searchTerm]);

  const totalVerifPages = Math.max(1, Math.ceil(filteredVerifications.length / PAGE_SIZE));
  const currentVerifications = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredVerifications.slice(start, start + PAGE_SIZE);
  }, [filteredVerifications, page]);

  // Tab 2: Contractor Documents
  const filteredContractorDocs = useMemo(() => {
    return contractorDocs.filter((doc) => {
      const docStatus = doc.documentStatus || 'pending_review';
      if (docsFilter !== 'all' && docStatus !== docsFilter) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const cont = doc.contractorId || {};
      const user = doc.userId || {};
      return (
        (doc.originalFileName || '').toLowerCase().includes(q) ||
        (cont.businessName || '').toLowerCase().includes(q) ||
        (user.fullName || '').toLowerCase().includes(q) ||
        (cont.licenseNumber || '').toLowerCase().includes(q) ||
        (user.email || '').toLowerCase().includes(q)
      );
    });
  }, [contractorDocs, docsFilter, searchTerm]);

  const totalDocsPages = Math.max(1, Math.ceil(filteredContractorDocs.length / PAGE_SIZE));
  const currentContractorDocs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredContractorDocs.slice(start, start + PAGE_SIZE);
  }, [filteredContractorDocs, page]);

  // Tab 3: Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const st = (c.accountStatus || c.status || 'active').toLowerCase();
      if (customerStatusFilter !== 'all' && st !== customerStatusFilter.toLowerCase()) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        (c.fullName || c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q)
      );
    });
  }, [customers, customerStatusFilter, searchTerm]);

  const totalCustPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const currentCustomers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [filteredCustomers, page]);

  // Tab 4: Contractors
  const filteredContractors = useMemo(() => {
    return contractors.filter((c) => {
      const vStatus = (c.contractorProfile?.verificationStatus || 'unverified').toLowerCase();
      const accStatus = (c.accountStatus || c.status || 'active').toLowerCase();
      if (contractorStatusFilter !== 'all') {
        if (contractorStatusFilter === 'verified' && vStatus !== 'verified') return false;
        if (contractorStatusFilter === 'unverified' && vStatus !== 'unverified') return false;
        if (contractorStatusFilter === 'pending' && vStatus !== 'pending') return false;
        if (contractorStatusFilter === 'suspended' && accStatus !== 'suspended') return false;
      }
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        (c.fullName || c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.contractorProfile?.companyName || '').toLowerCase().includes(q) ||
        (c.contractorProfile?.licenseNumber || '').toLowerCase().includes(q)
      );
    });
  }, [contractors, contractorStatusFilter, searchTerm]);

  const totalContPages = Math.max(1, Math.ceil(filteredContractors.length / PAGE_SIZE));
  const currentContractors = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredContractors.slice(start, start + PAGE_SIZE);
  }, [filteredContractors, page]);

  // Tab 5: Discount Requests Derivation
  const filteredDiscountRequests = useMemo(() => {
    return discountRequests.filter((item) => {
      const st = (item.status || 'PENDING').toUpperCase();
      if (discountReqFilter !== 'all' && st !== discountReqFilter.toUpperCase()) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const cont = item.contractorId || {};
      return (
        (item.businessName || '').toLowerCase().includes(q) ||
        (item.contactName || cont.fullName || '').toLowerCase().includes(q) ||
        (item.contactEmail || cont.email || '').toLowerCase().includes(q) ||
        (item.requestType || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      );
    });
  }, [discountRequests, discountReqFilter, searchTerm]);

  const totalDiscountPages = Math.max(1, Math.ceil(filteredDiscountRequests.length / PAGE_SIZE));
  const currentDiscountRequests = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredDiscountRequests.slice(start, start + PAGE_SIZE);
  }, [filteredDiscountRequests, page]);

  // Tab 5 Actions
  const handleOpenTuneModal = (item) => {
    setTuneModal({
      open: true,
      request: item,
      discountPercent: item.approvedDiscountPct || (item.currentTier ? item.currentTier + 5 : 10),
      adminNotes: '',
    });
  };

  const handleConfirmTuneApproval = async () => {
    if (!tuneModal.request) return;
    setLoading(true);
    try {
      await adminApi.approveDiscountRequest(
        tuneModal.request._id || tuneModal.request.id,
        tuneModal.discountPercent,
        tuneModal.adminNotes
      );
      setSuccessMsg(`✓ Discount approved! ${tuneModal.request.businessName || 'Contractor'} wholesale discount set to ${tuneModal.discountPercent}%.`);
      setTuneModal({ open: false, request: null, discountPercent: 10, adminNotes: '' });
      loadTabData();
    } catch (err) {
      setError(err?.message || 'Failed to approve discount request.');
      setLoading(false);
    }
  };

  const handleOpenRejectDiscountModal = (item) => {
    setRejectReqModal({
      open: true,
      request: item,
      adminNotes: '',
    });
  };

  const handleConfirmRejectDiscount = async () => {
    if (!rejectReqModal.request) return;
    setLoading(true);
    try {
      await adminApi.rejectDiscountRequest(
        rejectReqModal.request._id || rejectReqModal.request.id,
        rejectReqModal.adminNotes
      );
      setSuccessMsg(`Discount request rejected. Contractor has been notified.`);
      setRejectReqModal({ open: false, request: null, adminNotes: '' });
      loadTabData();
    } catch (err) {
      setError(err?.message || 'Failed to reject discount request.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.title}>Platform Verifications & Directory</h2>
          <p style={styles.subtitle}>
            Comprehensive contractor compliance, document inspections, customer accounts, and credential moderation.
          </p>
        </div>
        <div style={styles.badgeGroup}>
          <span style={styles.badgePending}>Pending: {verifCounts.pending || 0}</span>
          <span style={styles.badgeApproved}>Verified: {verifCounts.approved || 0}</span>
          <span style={styles.badgeRejected}>Rejected: {verifCounts.rejected || 0}</span>
        </div>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div style={styles.alertSuccess}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ marginLeft: 8 }}>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      {error && (
        <div style={styles.alertError}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
          </svg>
          <span style={{ marginLeft: 8 }}>{error}</span>
          <button onClick={() => setError(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                ...styles.tabButton,
                ...(isActive ? styles.tabButtonActive : {}),
              }}
            >
              {tab.label}
              {tab.id === 'verifications' && verifCounts.pending > 0 && (
                <span style={styles.tabCounter}>{verifCounts.pending}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VERIFICATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'verifications' && (
        <div>
          {/* Universal Search & Filter Bar */}
          <div style={styles.filterBar}>
            <div style={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search contractor, company, license, email..."
                style={styles.searchInput}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 4px' }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={styles.filterRight}>
              <label style={styles.filterLabel}>Status:</label>
              <select
                value={verifFilter}
                onChange={(e) => {
                  setVerifFilter(e.target.value);
                  setPage(1);
                }}
                style={styles.selectInput}
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <button
                type="button"
                onClick={() => loadTabData(false)}
                style={styles.refreshBtn}
                title="Refresh verifications"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div style={styles.card}>
            {loading ? (
              <div style={styles.loaderBox}>
                <div style={styles.spinner} />
                <span>Loading verification applications...</span>
              </div>
            ) : filteredVerifications.length === 0 ? (
              <div style={styles.emptyBox}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <p style={styles.emptyTitle}>No verification applications found</p>
                <p style={styles.emptySub}>Try adjusting your search keywords or status filter.</p>
              </div>
            ) : (
              <>
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Contractor / Company</th>
                        <th style={styles.th}>Submitted Date</th>
                        <th style={styles.th}>License / Documents</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Verification History</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Review Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentVerifications.map((item) => {
                        const itemId = item._id || item.id;
                        return (
                        <tr key={itemId} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{item.contractorName || 'Contractor'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{item.contractorEmail}</div>
                            {item.companyName && (
                              <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: '500' }}>{item.companyName}</div>
                            )}
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontSize: '13px', color: '#334155' }}>
                              {new Date(item.submittedAt || item.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontSize: '13px', color: '#0f172a' }}>
                              License: <strong>{item.licenseNumber || 'Verified ID'}</strong>
                            </div>
                            {item.documents && item.documents.length > 0 ? (
                              <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '2px' }}>
                                {item.documents.length} document(s) attached
                              </div>
                            ) : (
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Standard verification</div>
                            )}
                          </td>
                          <td style={styles.td}>
                            <span style={getVerifStatusBadge(item.status)}>{(item.status || 'PENDING').toUpperCase()}</span>
                            {item.rejectionReason && (
                              <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '4px' }}>
                                Reason: {item.rejectionReason}
                              </div>
                            )}
                          </td>
                          <td style={styles.td}>
                            <button
                              onClick={() => handleViewVerificationHistory(item.contractorId, item.contractorName)}
                              style={styles.actionBtnOutline}
                            >
                              View Audit ({item.history?.length || 0})
                            </button>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <div style={styles.actionButtonGroup}>
                              <button
                                type="button"
                                onClick={() => setViewContractorModal(item)}
                                style={styles.actionBtnOutline}
                                title="View contractor submission details and location"
                              >
                                View
                              </button>
                              {item.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleApproveVerification(item)}
                                    style={styles.actionBtnSuccess}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleOpenRejectModal(item)}
                                    style={styles.actionBtnDanger}
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : item.status === 'rejected' ? (
                                <button
                                  onClick={() => handleApproveVerification(item)}
                                  style={styles.actionBtnSuccess}
                                >
                                  Re-Approve
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenRejectModal(item)}
                                  style={styles.actionBtnOutline}
                                >
                                  Revoke
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

                {/* Pagination */}
                <div style={styles.paginationBar}>
                  <div style={styles.paginationInfo}>
                    Showing {Math.min((page - 1) * PAGE_SIZE + 1, filteredVerifications.length)} to{' '}
                    {Math.min(page * PAGE_SIZE, filteredVerifications.length)} of {filteredVerifications.length} applications
                  </div>
                  <div style={styles.paginationBtns}>
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      style={page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
                    >
                      &larr; Previous
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a63', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                      Page {page} of {totalVerifPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalVerifPages}
                      onClick={() => setPage((p) => Math.min(totalVerifPages, p + 1))}
                      style={page >= totalVerifPages ? styles.pageBtnDisabled : styles.pageBtn}
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONTRACTOR DOCUMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'documents' && (
        <div style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <div>
              <h3 style={styles.cardTitle}>Contractor Verification Documents</h3>
              <p style={styles.cardSub}>
                Review uploaded licenses, insurance certificates, and commercial credentials to approve contractor discount eligibility.
              </p>
            </div>
            <span style={styles.countBadge}>{filteredContractorDocs.length} Documents</span>
          </div>

          {/* Universal Search & Filter Bar */}
          <div style={styles.filterBar}>
            <div style={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search file name, business, license, email..."
                style={styles.searchInput}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 4px' }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={styles.filterRight}>
              <label style={styles.filterLabel}>Status:</label>
              <select
                value={docsFilter}
                onChange={(e) => {
                  setDocsFilter(e.target.value);
                  setPage(1);
                }}
                style={styles.selectInput}
              >
                <option value="all">All Documents</option>
                <option value="pending_review">Pending Review</option>
                <option value="verified">Verified (Approved)</option>
                <option value="rejected">Rejected</option>
              </select>

              <button
                type="button"
                onClick={() => loadTabData(false)}
                style={styles.refreshBtn}
                title="Refresh contractor documents"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Document File</th>
                  <th style={styles.th}>Contractor / Business</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Uploaded Date</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentContractorDocs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={styles.emptyTd}>No contractor documents found matching this filter.</td>
                  </tr>
                ) : (
                  currentContractorDocs.map((doc) => {
                    const docId = doc._id || doc.id;
                    const cont = doc.contractorId || {};
                    const user = doc.userId || {};
                    const docStatus = doc.documentStatus || 'pending_review';
                    return (
                      <tr key={docId} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={styles.docFileIcon}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: '#0f172a' }}>{doc.originalFileName || 'document.pdf'}</div>
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                Size: {Math.round((doc.fileSize || 1024) / 1024)} KB • MIME: {doc.mimeType || 'application/pdf'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <strong>{cont.businessName || user.fullName || 'Contractor'}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            License: {cont.licenseNumber || 'N/A'} • {user.email || ''}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusPillSmall,
                            backgroundColor: docStatus === 'verified' ? '#ecfdf5' : docStatus === 'rejected' ? '#fef2f2' : '#fffbeb',
                            color: docStatus === 'verified' ? '#065f46' : docStatus === 'rejected' ? '#991b1b' : '#92400e',
                          }}>
                            {docStatus.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={styles.actionButtonGroup}>
                            <button
                              type="button"
                              onClick={() => setViewingDocModal(doc)}
                              style={styles.actionBtnOutline}
                              title="Inspect document file"
                            >
                              View
                            </button>
                            {docStatus !== 'verified' && (
                              <button
                                type="button"
                                disabled={docSubmitting}
                                onClick={() => handleReviewDocument(docId, 'verified')}
                                style={styles.actionBtnSuccess}
                                title="Approve document to unlock contractor wholesale discounts"
                              >
                                Approve
                              </button>
                            )}
                            {docStatus !== 'rejected' && (
                              <button
                                type="button"
                                disabled={docSubmitting}
                                onClick={() => setDocReviewModal({ open: true, doc, action: 'reject', notes: '' })}
                                style={styles.actionBtnDanger}
                                title="Reject document"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={styles.paginationBar}>
            <div style={styles.paginationInfo}>
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filteredContractorDocs.length)} to{' '}
              {Math.min(page * PAGE_SIZE, filteredContractorDocs.length)} of {filteredContractorDocs.length} documents
            </div>
            <div style={styles.paginationBtns}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
              >
                &larr; Previous
              </button>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a63', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                Page {page} of {totalDocsPages}
              </span>
              <button
                type="button"
                disabled={page >= totalDocsPages}
                onClick={() => setPage((p) => Math.min(totalDocsPages, p + 1))}
                style={page >= totalDocsPages ? styles.pageBtnDisabled : styles.pageBtn}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CUSTOMERS DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'customers' && (
        <div style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <div>
              <h3 style={styles.cardTitle}>Customer Accounts Directory</h3>
              <p style={styles.cardSub}>Overview of registered homeowners, estimates generated, and active projects.</p>
            </div>
            <span style={styles.countBadge}>{filteredCustomers.length} Customers</span>
          </div>

          {/* Universal Search & Filter Bar */}
          <div style={styles.filterBar}>
            <div style={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search customer name, email, phone..."
                style={styles.searchInput}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 4px' }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={styles.filterRight}>
              <label style={styles.filterLabel}>Status:</label>
              <select
                value={customerStatusFilter}
                onChange={(e) => {
                  setCustomerStatusFilter(e.target.value);
                  setPage(1);
                }}
                style={styles.selectInput}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked / Inactive</option>
                <option value="suspended">Suspended</option>
              </select>

              <button
                type="button"
                onClick={() => loadTabData(false)}
                style={styles.refreshBtn}
                title="Refresh customer accounts"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Joined Date</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.emptyTd}>No customers found matching this filter.</td>
                  </tr>
                ) : (
                  currentCustomers.map((c) => {
                    const custId = c._id || c.id;
                    const custName = c.fullName || c.name || 'Customer';
                    const custStatus = c.accountStatus || c.status || 'ACTIVE';
                    return (
                      <tr key={custId} style={styles.tr}>
                        <td style={styles.td}>
                          <strong>{custName}</strong>
                        </td>
                        <td style={styles.td}>{c.email}</td>
                        <td style={styles.td}>{c.phone || '—'}</td>
                        <td style={styles.td}>
                          <span style={getVerifStatusBadge(custStatus)}>
                            {custStatus.toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.td}>{new Date(c.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/users/${custId}`, {
                              state: {
                                from: '/admin/verification-progress',
                                fromTab: 'customers',
                                fromTitle: '← Back to Verification & Progress',
                              },
                            })}
                            style={styles.actionBtnOutline}
                            title="View complete user dossier"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={styles.paginationBar}>
            <div style={styles.paginationInfo}>
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filteredCustomers.length)} to{' '}
              {Math.min(page * PAGE_SIZE, filteredCustomers.length)} of {filteredCustomers.length} customers
            </div>
            <div style={styles.paginationBtns}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
              >
                &larr; Previous
              </button>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a63', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                Page {page} of {totalCustPages}
              </span>
              <button
                type="button"
                disabled={page >= totalCustPages}
                onClick={() => setPage((p) => Math.min(totalCustPages, p + 1))}
                style={page >= totalCustPages ? styles.pageBtnDisabled : styles.pageBtn}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CONTRACTORS ROSTER */}
      {/* ========================================================================= */}
      {activeTab === 'contractors' && (
        <div style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <div>
              <h3 style={styles.cardTitle}>Verified Contractor Roster</h3>
              <p style={styles.cardSub}>Status of verified contractors, licensed specialists, and active projects.</p>
            </div>
            <span style={styles.countBadge}>{filteredContractors.length} Contractors</span>
          </div>

          {/* Universal Search & Filter Bar */}
          <div style={styles.filterBar}>
            <div style={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search contractor name, company, license, email..."
                style={styles.searchInput}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 4px' }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={styles.filterRight}>
              <label style={styles.filterLabel}>Status:</label>
              <select
                value={contractorStatusFilter}
                onChange={(e) => {
                  setContractorStatusFilter(e.target.value);
                  setPage(1);
                }}
                style={styles.selectInput}
              >
                <option value="all">All Contractors</option>
                <option value="verified">Verified Standing</option>
                <option value="unverified">Unverified</option>
                <option value="pending">Pending Verification</option>
                <option value="suspended">Suspended / Blocked</option>
              </select>

              <button
                type="button"
                onClick={() => loadTabData(false)}
                style={styles.refreshBtn}
                title="Refresh contractor roster"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Contractor / Company</th>
                  <th style={styles.th}>License #</th>
                  <th style={styles.th}>Verification</th>
                  <th style={styles.th}>Discount Rate</th>
                  <th style={styles.th}>Completed Jobs</th>
                  <th style={styles.th}>Account Status</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentContractors.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyTd}>No contractors found matching this filter.</td>
                  </tr>
                ) : (
                  currentContractors.map((c) => {
                    const contId = c._id || c.id;
                    const contName = c.fullName || c.name || 'Contractor';
                    const contStatus = c.accountStatus || c.status || 'ACTIVE';
                    return (
                      <tr key={contId} style={styles.tr}>
                        <td style={styles.td}>
                          <strong>{contName}</strong>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{c.contractorProfile?.companyName || c.email}</div>
                        </td>
                        <td style={styles.td}>{c.contractorProfile?.licenseNumber || '—'}</td>
                        <td style={styles.td}>
                          <span style={getVerifStatusBadge(c.contractorProfile?.verificationStatus || 'unverified')}>
                            {(c.contractorProfile?.verificationStatus || 'UNVERIFIED').toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontWeight: '700', color: '#1d4ed8' }}>
                            {c.contractorProfile?.customDiscount !== undefined ? `${c.contractorProfile.customDiscount}%` : '10% (Default)'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontWeight: '600', color: '#0f172a' }}>
                            {c.contractorProfile?.completedProjectsCount || 0}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={getVerifStatusBadge(contStatus)}>
                            {contStatus.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/users/${contId}`, {
                              state: {
                                from: '/admin/verification-progress',
                                fromTab: 'contractors',
                                fromTitle: '← Back to Verification & Progress',
                              },
                            })}
                            style={styles.actionBtnOutline}
                            title="View complete user dossier"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={styles.paginationBar}>
            <div style={styles.paginationInfo}>
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filteredContractors.length)} to{' '}
              {Math.min(page * PAGE_SIZE, filteredContractors.length)} of {filteredContractors.length} contractors
            </div>
            <div style={styles.paginationBtns}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
              >
                &larr; Previous
              </button>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a63', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                Page {page} of {totalContPages}
              </span>
              <button
                type="button"
                disabled={page >= totalContPages}
                onClick={() => setPage((p) => Math.min(totalContPages, p + 1))}
                style={page >= totalContPages ? styles.pageBtnDisabled : styles.pageBtn}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DISCOUNT REQUESTS */}
      {/* ========================================================================= */}
      {activeTab === 'discount_requests' && (
        <div style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <div>
              <h3 style={styles.cardTitle}>Contractor Wholesale Discount Requests</h3>
              <p style={styles.cardSub}>Review, inspect proof credentials, and tune wholesale pricing tiers for partner contractors.</p>
            </div>
            <span style={styles.countBadge}>{filteredDiscountRequests.length} Requests</span>
          </div>

          {/* Universal Search & Filter Bar */}
          <div style={styles.filterBar}>
            <div style={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder={isMobile ? 'Search requests...' : 'Search contractor, business name, request details...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                style={styles.searchInput}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={styles.searchClearBtn}>✕</button>
              )}
            </div>

            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Status:</span>
              <select
                value={discountReqFilter}
                onChange={(e) => {
                  setDiscountReqFilter(e.target.value);
                  setPage(1);
                }}
                style={styles.filterSelect}
              >
                <option value="all">All Requests</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <button
                type="button"
                onClick={() => loadTabData()}
                style={styles.refreshBtn}
                title="Refresh requests from database"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M23 4v6h-6" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Requests Table */}
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Contractor &amp; Business</th>
                  <th style={styles.th}>Submitted Date</th>
                  <th style={styles.th}>Request Type &amp; Details</th>
                  <th style={styles.th}>Current / Approved Tier</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDiscountRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.emptyState}>
                      <div style={styles.emptyIcon}>🏷️</div>
                      <div style={styles.emptyTitle}>No discount requests found</div>
                      <div style={styles.emptySub}>
                        {searchTerm ? 'Try adjusting your search criteria' : 'Pending discount requests from contractors will appear here.'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentDiscountRequests.map((item) => {
                    const cUser = item.contractorId || {};
                    const cProfile = item.contractorProfile || {};
                    const docs = item.uploadedDocs || [];
                    const status = (item.status || 'PENDING').toUpperCase();

                    return (
                      <tr key={item._id || item.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              backgroundColor: '#EFF6FF',
                              color: '#1E3A63',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '800',
                              fontSize: '13px',
                              border: '1px solid #BFDBFE',
                              flexShrink: 0,
                            }}>
                              {(item.businessName || cProfile.businessName || cUser.fullName || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '800', color: '#1E3A63', fontSize: '13.5px' }}>
                                {item.businessName || cProfile.businessName || cUser.fullName || 'Contractor'}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                                {item.contactName || cUser.fullName} &bull; {item.contactEmail || cUser.email}
                              </div>
                              {cProfile.licenseNumber && (
                                <div style={{ fontSize: '11px', color: '#0369A1', fontWeight: '600', marginTop: '2px' }}>
                                  Lic: {cProfile.licenseNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td style={styles.td}>
                          <span style={{ fontSize: '12.5px', color: '#334155', fontWeight: '600' }}>
                            {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span style={{ display: 'block', fontSize: '11px', color: '#94A3B8' }}>
                            {new Date(item.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        <td style={{ ...styles.td, maxWidth: '280px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            backgroundColor: '#EFF6FF',
                            color: '#1E3A63',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '700',
                            marginBottom: '4px',
                          }}>
                            {item.requestType || 'Tier Upgrade'}
                          </span>
                          <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                            {item.description}
                          </p>
                        </td>

                        <td style={styles.td}>
                          <span style={{ fontSize: '14px', fontWeight: '800', color: '#15803D' }}>
                            {item.approvedDiscountPct ? `${item.approvedDiscountPct}% Active` : `${item.currentTier || 5}% Baseline`}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: '800',
                              backgroundColor:
                                status === 'APPROVED' ? '#DCFCE7' : status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                              color:
                                status === 'APPROVED' ? '#15803D' : status === 'REJECTED' ? '#DC2626' : '#B45309',
                              border: `1px solid ${
                                status === 'APPROVED' ? '#86EFAC' : status === 'REJECTED' ? '#FCA5A5' : '#FDE68A'
                              }`,
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor:
                                  status === 'APPROVED' ? '#15803D' : status === 'REJECTED' ? '#DC2626' : '#D97706',
                              }}
                            />
                            {status}
                          </span>
                        </td>

                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', flexWrap: 'wrap' }}>
                            {/* 1. Profile Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const targetId = cUser._id || cUser.id || item.contractorId;
                                navigate(`/admin/users/${targetId}`, {
                                  state: {
                                    from: '/admin/verification-progress',
                                    fromTab: 'discount_requests',
                                    fromTitle: '← Back to Verification & Progress',
                                  },
                                });
                              }}
                              style={styles.actionBtnOutline}
                              title="View contractor complete user dossier"
                            >
                              Profile
                            </button>

                            {/* 2. Check Documents Button */}
                            <button
                              type="button"
                              onClick={() => setContractorDocsModal({ open: true, request: item })}
                              style={{
                                ...styles.actionBtnOutline,
                                color: '#0F766E',
                                borderColor: '#99F6E4',
                                backgroundColor: '#F0FDFA',
                              }}
                              title="Inspect uploaded credentials & insurance certificates"
                            >
                              Check Docs ({docs.length})
                            </button>

                            {/* 3. Accept & Tune Button */}
                            {status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => handleOpenTuneModal(item)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#15803D',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                }}
                                title="Approve and tune wholesale discount percentage"
                              >
                                Accept
                              </button>
                            )}

                            {/* 4. Reject Button */}
                            {status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => handleOpenRejectDiscountModal(item)}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#FFFFFF',
                                  color: '#DC2626',
                                  border: '1px solid #FCA5A5',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                }}
                                title="Reject discount request with contractor notification"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={styles.paginationBar}>
            <div style={styles.paginationInfo}>
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filteredDiscountRequests.length)} to{' '}
              {Math.min(page * PAGE_SIZE, filteredDiscountRequests.length)} of {filteredDiscountRequests.length} requests
            </div>
            <div style={styles.paginationBtns}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
              >
                &larr; Previous
              </button>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a63', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                Page {page} of {totalDiscountPages}
              </span>
              <button
                type="button"
                disabled={page >= totalDiscountPages}
                onClick={() => setPage((p) => Math.min(totalDiscountPages, p + 1))}
                style={page >= totalDiscountPages ? styles.pageBtnDisabled : styles.pageBtn}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* CONTRACTOR DOCUMENT VIEWER MODAL WITH REAL AUTHENTICATED PREVIEW */}
      {viewingDocModal && (() => {
        const docId = viewingDocModal._id || viewingDocModal.id;
        const fallbackUrl = `${BASE_URL}/admin/contractor-documents/${docId}/file?token=${encodeURIComponent(getStoredToken() || '')}`;
        const previewSrc = docBlobUrl || fallbackUrl;
        const isImg = (viewingDocModal.mimeType || '').includes('image') || /\.(jpg|jpeg|png|webp|gif)$/i.test(viewingDocModal.originalFileName || '');
        const isPdf = (viewingDocModal.mimeType || '').includes('pdf') || /\.pdf$/i.test(viewingDocModal.originalFileName || '');

        return (
          <div style={styles.modalOverlay} onClick={() => setViewingDocModal(null)}>
            <div style={{ ...styles.modalContent, maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <div>
                  <h3 style={styles.modalTitle}>Document Live Inspection</h3>
                  <p style={styles.modalSub}>{viewingDocModal.originalFileName}</p>
                </div>
                <button onClick={() => setViewingDocModal(null)} style={styles.modalCloseBtn}>✕</button>
              </div>
              <div style={styles.modalBody}>
                <div style={styles.docInfoGrid}>
                  <div><strong>Contractor:</strong> {viewingDocModal.contractorId?.businessName || viewingDocModal.userId?.fullName || 'N/A'}</div>
                  <div><strong>Status:</strong> {(viewingDocModal.documentStatus || 'pending').replace(/_/g, ' ').toUpperCase()}</div>
                  <div><strong>File Size:</strong> {Math.round((viewingDocModal.fileSize || 1024) / 1024)} KB</div>
                  <div><strong>Uploaded:</strong> {new Date(viewingDocModal.createdAt || viewingDocModal.uploadedAt || Date.now()).toLocaleString()}</div>
                  <div><strong>Storage:</strong> MongoDB Secure Vault</div>
                  <div><strong>File Type:</strong> {viewingDocModal.mimeType || 'application/pdf'}</div>
                </div>

                {/* REAL LIVE DOCUMENT PREVIEW CONTAINER */}
                <div style={{ marginTop: '16px', marginBottom: '16px', minHeight: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '10px', padding: '12px' }}>
                  {docLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '12px' }}>
                      <div style={styles.spinner} />
                      <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Loading secure document stream...</span>
                    </div>
                  ) : isImg ? (
                    <img
                      src={previewSrc}
                      alt={viewingDocModal.originalFileName}
                      style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    />
                  ) : isPdf ? (
                    <iframe
                      src={previewSrc}
                      title={viewingDocModal.originalFileName}
                      style={{ width: '100%', height: '500px', border: '1px solid #E2E8F0', borderRadius: '6px' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                      <p style={{ margin: '0 0 10px', fontWeight: '700', color: '#0F172A' }}>
                        {viewingDocModal.originalFileName}
                      </p>
                      <a
                        href={previewSrc}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#1E3A63', color: '#FFFFFF', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}
                      >
                        Open File in Viewer &rarr;
                      </a>
                    </div>
                  )}

                  <div style={{ marginTop: '12px', display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a
                      href={previewSrc}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '12.5px', color: '#0284C7', fontWeight: '700', textDecoration: 'underline' }}
                    >
                      Open Document in Dedicated Tab &rarr;
                    </a>
                    <a
                      href={previewSrc}
                      download={viewingDocModal.originalFileName || 'document.pdf'}
                      style={{ fontSize: '12.5px', color: '#15803D', fontWeight: '700', textDecoration: 'underline' }}
                    >
                      Download Document File ↓
                    </a>
                  </div>
                </div>

                {viewingDocModal.reviewNotes && (
                  <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#991b1b' }}>Review Notes:</span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#7f1d1d' }}>{viewingDocModal.reviewNotes}</p>
                  </div>
                )}

                <div style={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() => setViewingDocModal(null)}
                    style={styles.modalBtnSecondary}
                  >
                    Close Viewer
                  </button>
                  {viewingDocModal.documentStatus !== 'rejected' && (
                    <button
                      type="button"
                      disabled={docSubmitting}
                      onClick={() => {
                        const note = window.prompt('Enter rejection reason for this document:', 'Document illegible or expired.');
                        if (note !== null) {
                          handleReviewDocument(docId, 'rejected', note);
                          setViewingDocModal(null);
                        }
                      }}
                      style={{ ...styles.actionBtnOutline, color: '#B91C1C', borderColor: '#FCA5A5', padding: '8px 16px', fontSize: '13px' }}
                    >
                      ✕ Reject Document
                    </button>
                  )}
                  {viewingDocModal.documentStatus !== 'verified' && (
                    <button
                      type="button"
                      disabled={docSubmitting}
                      onClick={() => {
                        handleReviewDocument(docId, 'verified');
                        setViewingDocModal(null);
                      }}
                      style={styles.actionBtnSuccessLg}
                    >
                      ✓ Approve Document
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CONTRACTOR DETAILS, DATE & LOCATION POPUP MODAL */}
      {viewContractorModal && (
        <div style={styles.modalOverlay} onClick={() => setViewContractorModal(null)}>
          <div style={{ ...styles.modalContent, maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Contractor Verification Details</h3>
                <p style={styles.modalSub}>
                  Submission received on {new Date(viewContractorModal.submittedAt || viewContractorModal.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setViewContractorModal(null)} style={styles.modalCloseBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Contractor Name</span>
                  <strong style={{ fontSize: '14px', color: '#0F172A' }}>{viewContractorModal.contractorName || 'Contractor'}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Email Address</span>
                  <span style={{ fontSize: '13px', color: '#334155' }}>{viewContractorModal.contractorEmail || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Company / Business</span>
                  <strong style={{ fontSize: '14px', color: '#1E3A63' }}>{viewContractorModal.companyName || viewContractorModal.businessName || 'Independent Pro'}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>License Number</span>
                  <span style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: '700', color: '#0F172A' }}>
                    {viewContractorModal.licenseNumber || 'Verified ID'}
                    {viewContractorModal.licenseJurisdiction ? ` (${viewContractorModal.licenseJurisdiction})` : ''}
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Phone</span>
                  <span style={{ fontSize: '13px', color: '#334155' }}>{viewContractorModal.businessPhone || viewContractorModal.phone || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Verification Status</span>
                  <span style={getVerifStatusBadge(viewContractorModal.status)}>
                    {(viewContractorModal.status || 'PENDING').toUpperCase()}
                  </span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Operating Location &amp; Headquarters
                  </span>
                  <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>
                      {viewContractorModal.location?.street ? `${viewContractorModal.location.street}, ` : (viewContractorModal.businessAddress?.street ? `${viewContractorModal.businessAddress.street}, ` : '')}
                      {(viewContractorModal.location?.city || viewContractorModal.businessAddress?.city) ? `${viewContractorModal.location?.city || viewContractorModal.businessAddress?.city}, ` : ''}
                      {(viewContractorModal.location?.state || viewContractorModal.businessAddress?.state) ? `${viewContractorModal.location?.state || viewContractorModal.businessAddress?.state} ` : ''}
                      {viewContractorModal.location?.zipCode || viewContractorModal.businessAddress?.zipCode || ''}
                      {(!viewContractorModal.location?.city && !viewContractorModal.businessAddress?.city) && 'Location Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ ...styles.modalFooter, marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setViewContractorModal(null)}
                  style={styles.modalBtnSecondary}
                >
                  Close
                </button>
                {viewContractorModal.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenRejectModal(viewContractorModal);
                        setViewContractorModal(null);
                      }}
                      style={styles.actionBtnDanger}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleApproveVerification(viewContractorModal);
                        setViewContractorModal(null);
                      }}
                      style={styles.actionBtnSuccess}
                    >
                      ✓ Approve Contractor
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT REJECT REASON MODAL */}
      {docReviewModal.open && docReviewModal.doc && (
        <div style={styles.modalOverlay} onClick={() => setDocReviewModal({ open: false, doc: null, action: '', notes: '' })}>
          <div style={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Reject Verification Document</h3>
            <p style={styles.modalSub}>
              Specify why document {docReviewModal.doc.originalFileName} does not meet requirements.
            </p>

            <div style={{ marginTop: '14px' }}>
              <label style={styles.inputLabel}>Reason / Notes for Contractor:</label>
              <textarea
                rows={3}
                value={docReviewModal.notes}
                onChange={(e) => setDocReviewModal((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="e.g. Expired certificate, illegible scan, name mismatch..."
                style={styles.modalTextarea}
              />
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setDocReviewModal({ open: false, doc: null, action: '', notes: '' })}
                style={styles.modalBtnSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={docSubmitting}
                onClick={() => handleReviewDocument(docReviewModal.doc._id || docReviewModal.doc.id, 'rejected', docReviewModal.notes)}
                style={styles.actionBtnDangerLg}
              >
                {docSubmitting ? 'Saving...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONTRACTOR REASON MODAL */}
      {verifActionModal.open && verifActionModal.item && (
        <div style={styles.modalOverlay} onClick={() => setVerifActionModal({ open: false, type: '', item: null, reason: '' })}>
          <div style={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Reject Contractor Registration</h3>
            <p style={styles.modalSub}>
              Please state the specific reason for rejecting {verifActionModal.item.contractorName}. This will be permanently recorded in the audit trail.
            </p>

            <div style={{ marginTop: '16px' }}>
              <label style={styles.inputLabel}>Mandatory Rejection Reason:</label>
              <textarea
                rows={3}
                style={styles.modalTextarea}
                placeholder="e.g. Expired liability insurance certificate, invalid contractor license number..."
                value={verifActionModal.reason}
                onChange={(e) => setVerifActionModal({ ...verifActionModal, reason: e.target.value })}
              />
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setVerifActionModal({ open: false, type: '', item: null, reason: '' })}
                style={styles.modalBtnSecondary}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                style={styles.actionBtnDangerLg}
                disabled={!verifActionModal.reason.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFICATION HISTORY MODAL */}
      {verifHistoryModal.open && (
        <div style={styles.modalOverlay} onClick={() => setVerifHistoryModal({ open: false, logs: [], contractorName: '' })}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Verification Audit History</h3>
                <p style={styles.modalSub}>Audit records for {verifHistoryModal.contractorName}</p>
              </div>
              <button onClick={() => setVerifHistoryModal({ open: false, logs: [], contractorName: '' })} style={styles.modalCloseBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              {verifHistoryModal.logs.length === 0 ? (
                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No verification events recorded yet.</p>
              ) : (
                <div style={styles.historyList}>
                  {verifHistoryModal.logs.map((log, i) => (
                    <div key={i} style={styles.historyItem}>
                      <div style={styles.historyDot} />
                      <div style={styles.historyContent}>
                        <div style={styles.historyTop}>
                          <strong>Status changed to: {log.newStatus?.toUpperCase()}</strong>
                          <span style={styles.historyDate}>{new Date(log.changedAt).toLocaleString()}</span>
                        </div>
                        {log.reason && <p style={styles.historyReason}>Reason: {log.reason}</p>}
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          Changed By: {log.changedBy || 'Admin System'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setVerifHistoryModal({ open: false, logs: [], contractorName: '' })} style={styles.modalBtnSecondary}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5 MODAL 1: CHECK CONTRACTOR DOCUMENTS MODAL          */}
      {/* ======================================================== */}
      {contractorDocsModal.open && contractorDocsModal.request && (
        <div style={styles.modalOverlay} onClick={() => setContractorDocsModal({ open: false, request: null })}>
          <div style={{ ...styles.modalContent, maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Contractor Compliance &amp; Credentials</h3>
                <p style={styles.modalSub}>
                  {contractorDocsModal.request.businessName || 'Contractor'} &bull; Uploaded verification files
                </p>
              </div>
              <button onClick={() => setContractorDocsModal({ open: false, request: null })} style={styles.modalCloseBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              {(!contractorDocsModal.request.uploadedDocs || contractorDocsModal.request.uploadedDocs.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
                  <strong style={{ display: 'block', fontSize: '14px', color: '#1E3A63' }}>No Credentials Uploaded Yet</strong>
                  <span style={{ fontSize: '12px' }}>This contractor has not uploaded business licenses or insurance certificates yet.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {contractorDocsModal.request.uploadedDocs.map((doc, idx) => {
                    const st = (doc.documentStatus || 'pending').toLowerCase();
                    return (
                      <div
                        key={doc._id || doc.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 18px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: '#E0F2FE',
                            color: '#0284C7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                          }}>
                            📄
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '13.5px', color: '#1E3A63' }}>
                              {doc.documentType ? doc.documentType.replace(/_/g, ' ').toUpperCase() : 'Compliance Certificate'}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                              {doc.originalFileName || 'Credential_Document.pdf'} &bull; {Math.round((doc.fileSize || 1024) / 1024)} KB
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: st === 'verified' ? '#DCFCE7' : st === 'rejected' ? '#FEE2E2' : '#FEF3C7',
                            color: st === 'verified' ? '#15803D' : st === 'rejected' ? '#DC2626' : '#B45309',
                          }}>
                            {st.toUpperCase()}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setContractorDocsModal({ open: false, request: null });
                              setViewingDocModal(doc);
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#1E3A63',
                              color: '#FFFFFF',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            Live Inspect &rarr;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setContractorDocsModal({ open: false, request: null })}
                style={styles.modalBtnSecondary}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5 MODAL 2: TUNE & APPROVE DISCOUNT MODAL             */}
      {/* ======================================================== */}
      {tuneModal.open && tuneModal.request && (
        <div style={styles.modalOverlay} onClick={() => setTuneModal({ open: false, request: null, discountPercent: 10, adminNotes: '' })}>
          <div style={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Tune &amp; Approve Wholesale Discount</h3>
                <p style={styles.modalSub}>{tuneModal.request.businessName || 'Contractor'}</p>
              </div>
              <button onClick={() => setTuneModal({ open: false, request: null, discountPercent: 10, adminNotes: '' })} style={styles.modalCloseBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={{ marginBottom: '16px', padding: '12px 14px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px' }}>
                <span style={{ fontSize: '12.5px', color: '#166534', fontWeight: '600' }}>
                  Setting a wholesale discount tier applies automatically to all future estimation builds and material lines for this contractor account.
                </span>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#1E3A63', marginBottom: '6px' }}>
                  Select Tuned Wholesale Discount Percentage (%):
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {[5, 10, 15, 20, 25].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTuneModal((prev) => ({ ...prev, discountPercent: pct }))}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        border: '1.5px solid',
                        borderColor: tuneModal.discountPercent === pct ? '#15803D' : '#CBD5E1',
                        backgroundColor: tuneModal.discountPercent === pct ? '#DCFCE7' : '#FFFFFF',
                        color: tuneModal.discountPercent === pct ? '#15803D' : '#475569',
                      }}
                    >
                      {pct}% OFF
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Custom Rate:</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={tuneModal.discountPercent}
                    onChange={(e) => setTuneModal((prev) => ({ ...prev, discountPercent: Number(e.target.value) }))}
                    style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', color: '#1E3A63' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E3A63' }}>%</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#1E3A63', marginBottom: '6px' }}>
                  Admin Notes / Remarks (Optional):
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Verified General Liability insurance and volume history. Approved for 15% tier."
                  value={tuneModal.adminNotes}
                  onChange={(e) => setTuneModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setTuneModal({ open: false, request: null, discountPercent: 10, adminNotes: '' })}
                style={styles.modalBtnSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTuneApproval}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#15803D',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ✓ Approve {tuneModal.discountPercent}% Discount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5 MODAL 3: REJECT DISCOUNT REQUEST MODAL             */}
      {/* ======================================================== */}
      {rejectReqModal.open && rejectReqModal.request && (
        <div style={styles.modalOverlay} onClick={() => setRejectReqModal({ open: false, request: null, adminNotes: '' })}>
          <div style={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Reject Wholesale Discount Request</h3>
                <p style={styles.modalSub}>{rejectReqModal.request.businessName || 'Contractor'}</p>
              </div>
              <button onClick={() => setRejectReqModal({ open: false, request: null, adminNotes: '' })} style={styles.modalCloseBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={{ marginBottom: '14px', padding: '12px 14px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#B45309', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Automated Contractor Notification:
                </span>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#78350F', lineHeight: 1.45, fontStyle: 'italic' }}>
                  "After careful verification, you are not eligible for a higher discount at this time. Keep up the good work and continue submitting completed projects to qualify for future tier upgrades."
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#1E3A63', marginBottom: '6px' }}>
                  Internal Admin Reason (Optional):
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Minimum completed volume threshold not met yet."
                  value={rejectReqModal.adminNotes}
                  onChange={(e) => setRejectReqModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setRejectReqModal({ open: false, request: null, adminNotes: '' })}
                style={styles.modalBtnSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectDiscount}
                style={styles.actionBtnDangerLg}
              >
                Confirm Rejection &amp; Notify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getVerifStatusBadge(status) {
  const base = {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.04em',
  };
  const s = (status || '').toLowerCase();
  if (s === 'approved' || s === 'active' || s === 'verified') return { ...base, backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' };
  if (s === 'rejected' || s === 'blocked') return { ...base, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' };
  return { ...base, backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
}

const styles = {
  container: {
    padding: '24px 32px',
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
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
  badgeGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  badgePending: {
    backgroundColor: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fde68a',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '600',
  },
  badgeApproved: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '600',
  },
  badgeRejected: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '600',
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
  tabContainer: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  tabButton: {
    padding: '10px 18px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    marginBottom: '-2px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  tabButtonActive: {
    color: '#1d4ed8',
    borderBottom: '2px solid #1d4ed8',
  },
  tabCounter: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '1px 6px',
    borderRadius: '10px',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0 12px',
    height: '40px',
    flex: '1',
    minWidth: '240px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    padding: '0 8px',
    width: '100%',
    fontSize: '13.5px',
    color: '#0f172a',
    backgroundColor: 'transparent',
  },
  filterRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#475569',
  },
  selectInput: {
    padding: '8px 12px',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '160px',
    height: '40px',
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    color: '#1e3a63',
    border: '1.5px solid #1e3a63',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    height: '40px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    padding: '24px',
    marginBottom: '24px',
  },
  cardHeaderFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSub: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  countBadge: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  tableResponsive: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontSize: '12px',
    fontWeight: '600',
    borderBottom: '1px solid #e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  emptyBox: {
    padding: '48px 16px',
    textAlign: 'center',
  },
  emptyTitle: {
    margin: '12px 0 4px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
  },
  emptySub: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
  },
  loaderBox: {
    padding: '48px 16px',
    textAlign: 'center',
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#1d4ed8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  actionButtonGroup: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'flex-end',
  },
  actionBtnOutline: {
    padding: '6px 12px',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  actionBtnSuccess: {
    padding: '6px 12px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  actionBtnDanger: {
    padding: '6px 12px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  paginationBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '14px',
    borderTop: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    gap: '12px',
  },
  paginationInfo: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
  },
  paginationBtns: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  pageBtn: {
    padding: '6px 14px',
    backgroundColor: '#ffffff',
    border: '1.5px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e3a63',
    cursor: 'pointer',
  },
  pageBtnDisabled: {
    padding: '6px 14px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#94a3b8',
    cursor: 'not-allowed',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalContentSmall: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '480px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSub: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#64748b',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '24px',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingLeft: '8px',
  },
  historyItem: {
    display: 'flex',
    gap: '12px',
    position: 'relative',
  },
  historyDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    marginTop: '5px',
    flexShrink: 0,
  },
  historyContent: {
    flex: 1,
  },
  historyTop: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#1e293b',
  },
  historyDate: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  historyReason: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#64748b',
  },
  inputLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px',
  },
  modalTextarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
  },
  modalBtnSecondary: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
  },
  actionBtnDangerLg: {
    padding: '8px 18px',
    backgroundColor: '#b91c1c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  actionBtnSuccessLg: {
    padding: '8px 18px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  docFileIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusPillSmall: {
    display: 'inline-block',
    padding: '3px 9px',
    fontSize: '11px',
    fontWeight: '700',
    borderRadius: '9999px',
  },
  emptyTd: {
    padding: '32px 16px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '13px',
  },
  docInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
    color: '#334155',
    marginBottom: '16px',
  },
};
