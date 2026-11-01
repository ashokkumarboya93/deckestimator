// =============================================
// Deck Estimator — Admin Commissions & Discounts Management (Phase 9)
// =============================================

import React, { useState, useEffect } from 'react';
import { adminCommissionApi } from '../api/adminCommissionApi';
import { adminDiscountApi } from '../api/adminDiscountApi';
import { adminVerificationApi } from '../api/adminVerificationApi';

export default function AdminCommissionsPage() {
  const [activeTab, setActiveTab] = useState('commissions'); // 'commissions' | 'commissionPolicies' | 'discountPolicies'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // --- Commissions State ---
  const [commissions, setCommissions] = useState([]);
  const [commissionPagination, setCommissionPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [commissionStatusFilter, setCommissionStatusFilter] = useState('');
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [commissionHistory, setCommissionHistory] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState('APPROVE');
  const [reviewReason, setReviewReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CHECK');
  const [paymentNotes, setPaymentNotes] = useState('');

  // --- Commission Policies State ---
  const [commPolicies, setCommPolicies] = useState([]);
  const [isCreateCommPolicyModalOpen, setIsCreateCommPolicyModalOpen] = useState(false);
  const [newCommPolicy, setNewCommPolicy] = useState({
    name: '',
    code: '',
    description: '',
    commissionType: 'PERCENTAGE',
    percentageValue: 10,
    fixedAmount: 0,
    calculationBasis: 'NET_ESTIMATE',
    minimumCommission: 0,
    maximumCommission: '',
    isActive: true,
  });

  // --- Discount Policies State ---
  const [discPolicies, setDiscPolicies] = useState([]);
  const [isCreateDiscPolicyModalOpen, setIsCreateDiscPolicyModalOpen] = useState(false);
  const [newDiscPolicy, setNewDiscPolicy] = useState({
    name: '',
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 5,
    applicability: 'ALL_CONTRACTORS',
    maxUsageCount: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  // Assignment Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignPolicyId, setAssignPolicyId] = useState(null);
  const [assignPolicyName, setAssignPolicyName] = useState('');
  const [eligibleContractors, setEligibleContractors] = useState([]);
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [currentAssignments, setCurrentAssignments] = useState([]);

  useEffect(() => {
    if (activeTab === 'commissions') {
      loadCommissions(1);
    } else if (activeTab === 'commissionPolicies') {
      loadCommissionPolicies();
    } else if (activeTab === 'discountPolicies') {
      loadDiscountPolicies();
    }
  }, [activeTab, commissionStatusFilter]);

  // Load Commissions
  async function loadCommissions(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await adminCommissionApi.getAllCommissions({
        page,
        limit: 15,
        status: commissionStatusFilter || undefined,
      });
      setCommissions(data.data || []);
      setCommissionPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to load commissions.');
    } finally {
      setLoading(false);
    }
  }

  // Load Commission Policies
  async function loadCommissionPolicies() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminCommissionApi.getPolicies();
      setCommPolicies(data.data || []);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to load commission policies.');
    } finally {
      setLoading(false);
    }
  }

  // Load Discount Policies
  async function loadDiscountPolicies() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminDiscountApi.getPolicies();
      setDiscPolicies(data.data || []);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to load discount policies.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Review Commission
  async function handleReviewCommission(e) {
    e.preventDefault();
    if (!selectedCommission) return;
    setLoading(true);
    try {
      await adminCommissionApi.reviewCommission(
        selectedCommission._id || selectedCommission.id,
        reviewAction,
        reviewReason,
        reviewNotes
      );
      setActionSuccess(`Commission successfully updated via action ${reviewAction}.`);
      setIsReviewModalOpen(false);
      setSelectedCommission(null);
      loadCommissions(commissionPagination.page);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to review commission.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Record Payment
  async function handleRecordPayment(e) {
    e.preventDefault();
    if (!selectedCommission) return;
    setLoading(true);
    try {
      await adminCommissionApi.recordPayment(selectedCommission._id || selectedCommission.id, {
        paymentReference: paymentRef,
        paymentMethod,
        notes: paymentNotes,
      });
      setActionSuccess('Commission payment confirmation recorded successfully.');
      setIsPaymentModalOpen(false);
      setSelectedCommission(null);
      setPaymentRef('');
      setPaymentNotes('');
      loadCommissions(commissionPagination.page);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to record payment.');
    } finally {
      setLoading(false);
    }
  }

  // View Commission Details & History
  async function openCommissionDetail(comm) {
    setSelectedCommission(comm);
    try {
      const histData = await adminCommissionApi.getCommissionHistory(comm._id || comm.id);
      setCommissionHistory(histData.data || []);
    } catch {
      setCommissionHistory([]);
    }
  }

  // Handle Toggle Commission Policy Status
  async function handleToggleCommPolicyStatus(policy) {
    const newStatus = policy.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminCommissionApi.updatePolicyStatus(policy._id || policy.id, newStatus, 'Admin status change');
      setActionSuccess(`Commission policy marked ${newStatus}.`);
      loadCommissionPolicies();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to update commission policy.');
    }
  }

  // Handle Create Commission Policy
  async function handleCreateCommPolicy(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: newCommPolicy.name,
        code: newCommPolicy.code.toUpperCase().replace(/\s+/g, '_'),
        description: newCommPolicy.description,
        commissionType: newCommPolicy.commissionType,
        percentageValue: newCommPolicy.commissionType === 'PERCENTAGE' ? Number(newCommPolicy.percentageValue) : undefined,
        fixedAmount: newCommPolicy.commissionType === 'FIXED' ? Number(newCommPolicy.fixedAmount) : undefined,
        calculationBasis: newCommPolicy.calculationBasis,
        minimumCommission: newCommPolicy.minimumCommission ? Number(newCommPolicy.minimumCommission) : 0,
        maximumCommission: newCommPolicy.maximumCommission ? Number(newCommPolicy.maximumCommission) : undefined,
        isActive: newCommPolicy.isActive,
      };
      await adminCommissionApi.createPolicy(payload);
      setActionSuccess('New commission policy created successfully.');
      setIsCreateCommPolicyModalOpen(false);
      loadCommissionPolicies();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to create commission policy.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Toggle Discount Policy Status
  async function handleToggleDiscPolicyStatus(policy) {
    const newStatus = policy.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminDiscountApi.updatePolicyStatus(policy._id || policy.id, newStatus, 'Admin status change');
      setActionSuccess(`Discount policy marked ${newStatus}.`);
      loadDiscountPolicies();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to update discount policy.');
    }
  }

  // Handle Create Discount Policy
  async function handleCreateDiscPolicy(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: newDiscPolicy.name,
        code: newDiscPolicy.code.toUpperCase().replace(/\s+/g, '_'),
        description: newDiscPolicy.description,
        discountType: newDiscPolicy.discountType,
        discountValue: Number(newDiscPolicy.discountValue),
        applicability: newDiscPolicy.applicability,
        maxUsageCount: newDiscPolicy.maxUsageCount ? Number(newDiscPolicy.maxUsageCount) : undefined,
        startDate: newDiscPolicy.startDate || undefined,
        endDate: newDiscPolicy.endDate || undefined,
        isActive: newDiscPolicy.isActive,
      };
      await adminDiscountApi.createPolicy(payload);
      setActionSuccess('New discount policy created successfully.');
      setIsCreateDiscPolicyModalOpen(false);
      loadDiscountPolicies();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to create discount policy.');
    } finally {
      setLoading(false);
    }
  }

  // Open Assignment Modal
  async function openAssignModal(policy) {
    setAssignPolicyId(policy._id || policy.id);
    setAssignPolicyName(policy.name);
    try {
      const [contractorsRes, assignmentsRes] = await Promise.all([
        adminVerificationApi.getApplications({ status: 'approved', limit: 100 }),
        adminDiscountApi.getPolicyAssignments(policy._id || policy.id),
      ]);
      setEligibleContractors(contractorsRes.data || []);
      setCurrentAssignments(assignmentsRes.data || []);
      setIsAssignModalOpen(true);
    } catch (err) {
      setError(err?.message || 'Failed to load contractors for assignment.');
    }
  }

  // Handle Add Assignment
  async function handleAddAssignment(e) {
    e.preventDefault();
    if (!selectedContractorId || !assignPolicyId) return;
    try {
      await adminDiscountApi.assignPolicy(assignPolicyId, {
        contractorId: selectedContractorId,
        assignmentType: 'INDIVIDUAL',
        notes: assignNotes,
      });
      setActionSuccess('Discount policy successfully assigned to contractor.');
      const res = await adminDiscountApi.getPolicyAssignments(assignPolicyId);
      setCurrentAssignments(res.data || []);
      setSelectedContractorId('');
      setAssignNotes('');
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to assign policy.');
    }
  }

  // Handle Remove Assignment
  async function handleRemoveAssignment(contractorId) {
    if (!assignPolicyId) return;
    try {
      await adminDiscountApi.removeAssignment(assignPolicyId, contractorId);
      setActionSuccess('Contractor discount assignment removed.');
      const res = await adminDiscountApi.getPolicyAssignments(assignPolicyId);
      setCurrentAssignments(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to remove assignment.');
    }
  }

  const statusBadgeColor = (st) => {
    switch (st?.toLowerCase()) {
      case 'paid':
        return { bg: '#dcfce7', text: '#15803d' };
      case 'payable':
        return { bg: '#e0f2fe', text: '#0284c7' };
      case 'approved':
        return { bg: '#fef3c7', text: '#b45309' };
      case 'under_review':
        return { bg: '#ede9fe', text: '#6d28d9' };
      case 'rejected':
      case 'reversed':
        return { bg: '#fee2e2', text: '#b91c1c' };
      case 'disputed':
        return { bg: '#ffedd5', text: '#c2410c' };
      default:
        return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Commissions & Discount Policies</h1>
          <p style={styles.subtitle}>
            Financial administration, contractor incentives, commission approval lifecycle, and transparent payout recording.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsBar}>
        <button
          type="button"
          onClick={() => setActiveTab('commissions')}
          style={{
            ...styles.tabButton,
            borderBottom: activeTab === 'commissions' ? '3px solid #0284c7' : '3px solid transparent',
            color: activeTab === 'commissions' ? '#0284c7' : '#64748b',
            fontWeight: activeTab === 'commissions' ? '700' : '500',
          }}
        >
          💰 Commission Payouts & Approvals
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('commissionPolicies')}
          style={{
            ...styles.tabButton,
            borderBottom: activeTab === 'commissionPolicies' ? '3px solid #0284c7' : '3px solid transparent',
            color: activeTab === 'commissionPolicies' ? '#0284c7' : '#64748b',
            fontWeight: activeTab === 'commissionPolicies' ? '700' : '500',
          }}
        >
          📋 Commission Policies
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('discountPolicies')}
          style={{
            ...styles.tabButton,
            borderBottom: activeTab === 'discountPolicies' ? '3px solid #0284c7' : '3px solid transparent',
            color: activeTab === 'discountPolicies' ? '#0284c7' : '#64748b',
            fontWeight: activeTab === 'discountPolicies' ? '700' : '500',
          }}
        >
          🏷️ Contractor Discount Policies
        </button>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div style={styles.successAlert}>
          <span>{actionSuccess}</span>
          <button type="button" onClick={() => setActionSuccess(null)} style={styles.closeAlertBtn}>
            ✕
          </button>
        </div>
      )}
      {error && (
        <div style={styles.errorAlert}>
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} style={styles.closeAlertBtn}>
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: COMMISSIONS */}
      {activeTab === 'commissions' && (
        <div>
          {/* Controls */}
          <div style={styles.controlsRow}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <label style={styles.filterLabel}>Status:</label>
              <select
                value={commissionStatusFilter}
                onChange={(e) => setCommissionStatusFilter(e.target.value)}
                style={styles.select}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="payable">Payable</option>
                <option value="paid">Paid</option>
                <option value="disputed">Disputed</option>
                <option value="rejected">Rejected</option>
                <option value="reversed">Reversed</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => loadCommissions(commissionPagination.page)}
              style={styles.secondaryBtn}
            >
              🔄 Refresh List
            </button>
          </div>

          {/* Commissions Table */}
          {loading && commissions.length === 0 ? (
            <div style={styles.emptyBox}>Loading commissions...</div>
          ) : commissions.length === 0 ? (
            <div style={styles.emptyBox}>No commission records found matching criteria.</div>
          ) : (
            <div style={styles.card}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Commission #</th>
                    <th style={styles.th}>Contractor</th>
                    <th style={styles.th}>Lead Code</th>
                    <th style={styles.th}>Basis Amount</th>
                    <th style={styles.th}>Rate</th>
                    <th style={styles.th}>Calculated</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((comm) => {
                    const stColor = statusBadgeColor(comm.status);
                    return (
                      <tr key={comm._id || comm.id} style={styles.tr}>
                        <td style={styles.td}>
                          <strong>{comm.commissionNumber}</strong>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {new Date(comm.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <strong>{comm.contractorId?.contractorProfile?.businessName || 'Contractor'}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {comm.contractorId?.email || comm.contractorId}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <code>{comm.leadId?.leadCode || comm.leadId}</code>
                        </td>
                        <td style={styles.td}>${Number(comm.basisAmount || 0).toFixed(2)}</td>
                        <td style={styles.td}>
                          {comm.rateApplied?.type === 'PERCENTAGE'
                            ? `${comm.rateApplied.value}%`
                            : `$${comm.rateApplied?.value || 0}`}
                        </td>
                        <td style={styles.td}>
                          <strong style={{ color: '#0284c7' }}>${Number(comm.calculatedAmount || 0).toFixed(2)}</strong>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              backgroundColor: stColor.bg,
                              color: stColor.text,
                            }}
                          >
                            {(comm.status || '').toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => openCommissionDetail(comm)}
                              style={styles.smallActionBtn}
                            >
                              👁️ View
                            </button>
                            {comm.status !== 'PAID' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCommission(comm);
                                  setIsReviewModalOpen(true);
                                }}
                                style={{ ...styles.smallActionBtn, backgroundColor: '#f0fdf4', color: '#166534' }}
                              >
                                ✍️ Review
                              </button>
                            )}
                            {(comm.status === 'PAYABLE' || comm.status === 'APPROVED') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCommission(comm);
                                  setIsPaymentModalOpen(true);
                                }}
                                style={{ ...styles.smallActionBtn, backgroundColor: '#f0f9ff', color: '#0369a1' }}
                              >
                                💳 Record Pay
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
        </div>
      )}

      {/* TAB 2: COMMISSION POLICIES */}
      {activeTab === 'commissionPolicies' && (
        <div>
          <div style={{ ...styles.controlsRow, justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
              Standard & Tiered Commission Rules
            </h2>
            <button
              type="button"
              onClick={() => setIsCreateCommPolicyModalOpen(true)}
              style={styles.primaryBtn}
            >
              + Create New Commission Policy
            </button>
          </div>

          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Policy Name & Code</th>
                  <th style={styles.th}>Type & Value</th>
                  <th style={styles.th}>Calculation Basis</th>
                  <th style={styles.th}>Min / Max Caps</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {commPolicies.map((pol) => (
                  <tr key={pol._id || pol.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{pol.name}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Code: {pol.code}</div>
                    </td>
                    <td style={styles.td}>
                      {pol.commissionType === 'PERCENTAGE' ? (
                        <strong>{pol.percentageValue}%</strong>
                      ) : (
                        <strong>${pol.fixedAmount} flat</strong>
                      )}
                    </td>
                    <td style={styles.td}>{pol.calculationBasis?.replace(/_/g, ' ')}</td>
                    <td style={styles.td}>
                      Min: ${pol.minimumCommission || 0} | Max: {pol.maximumCommission ? `$${pol.maximumCommission}` : 'None'}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: pol.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                          color: pol.status === 'ACTIVE' ? '#15803d' : '#64748b',
                        }}
                      >
                        {pol.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        onClick={() => handleToggleCommPolicyStatus(pol)}
                        style={styles.smallActionBtn}
                      >
                        {pol.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DISCOUNT POLICIES */}
      {activeTab === 'discountPolicies' && (
        <div>
          <div style={{ ...styles.controlsRow, justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
              Contractor Discount Policies
            </h2>
            <button
              type="button"
              onClick={() => setIsCreateDiscPolicyModalOpen(true)}
              style={styles.primaryBtn}
            >
              + Create Discount Policy
            </button>
          </div>

          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Policy Name & Code</th>
                  <th style={styles.th}>Type & Amount</th>
                  <th style={styles.th}>Applicability</th>
                  <th style={styles.th}>Usage Limits</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {discPolicies.map((pol) => (
                  <tr key={pol._id || pol.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{pol.name}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Code: {pol.code}</div>
                    </td>
                    <td style={styles.td}>
                      {pol.discountType === 'PERCENTAGE' ? (
                        <strong>{pol.discountValue}%</strong>
                      ) : (
                        <strong>${pol.discountValue} off</strong>
                      )}
                    </td>
                    <td style={styles.td}>{pol.applicability?.replace(/_/g, ' ')}</td>
                    <td style={styles.td}>
                      Used: {pol.usedCount || 0} / {pol.maxUsageCount || 'Unlimited'}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: pol.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                          color: pol.status === 'ACTIVE' ? '#15803d' : '#64748b',
                        }}
                      >
                        {pol.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleDiscPolicyStatus(pol)}
                          style={styles.smallActionBtn}
                        >
                          {pol.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                        {pol.applicability === 'SPECIFIC_CONTRACTORS' && (
                          <button
                            type="button"
                            onClick={() => openAssignModal(pol)}
                            style={{ ...styles.smallActionBtn, backgroundColor: '#f0f9ff', color: '#0284c7' }}
                          >
                            👥 Assignments
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: REVIEW COMMISSION */}
      {isReviewModalOpen && selectedCommission && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>Review Commission #{selectedCommission.commissionNumber}</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Lead: {selectedCommission.leadId?.leadCode || selectedCommission.leadId} | Amount: $
              {Number(selectedCommission.calculatedAmount || 0).toFixed(2)}
            </p>

            <form onSubmit={handleReviewCommission}>
              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Select Action:</label>
                <select
                  value={reviewAction}
                  onChange={(e) => setReviewAction(e.target.value)}
                  style={styles.input}
                >
                  <option value="APPROVE">APPROVE — Mark as Approved</option>
                  <option value="MARK_PAYABLE">MARK_PAYABLE — Ready for Payout</option>
                  <option value="REJECT">REJECT — Deny Commission</option>
                  <option value="DISPUTE">DISPUTE — Open Dispute Investigation</option>
                  <option value="REVERSE">REVERSE — Clawback / Reverse Commission</option>
                </select>
              </div>

              {(reviewAction === 'REJECT' || reviewAction === 'DISPUTE' || reviewAction === 'REVERSE') && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.label}>Reason (Required for Denials & Disputes):</label>
                  <input
                    type="text"
                    required
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    style={styles.input}
                    placeholder="Provide justification..."
                  />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Audit Notes (Optional):</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  style={{ ...styles.input, minHeight: '60px' }}
                  placeholder="Internal audit notes..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  style={styles.secondaryBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>
                  {loading ? 'Processing...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT */}
      {isPaymentModalOpen && selectedCommission && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>Record Payment Confirmation</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Confirm manual payout of ${Number(selectedCommission.calculatedAmount || 0).toFixed(2)} to{' '}
              {selectedCommission.contractorId?.contractorProfile?.businessName || 'Contractor'}.
            </p>

            <form onSubmit={handleRecordPayment}>
              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={styles.input}
                >
                  <option value="CHECK">Physical Company Check</option>
                  <option value="BANK_TRANSFER">Direct Bank Transfer / ACH</option>
                  <option value="DIRECT_DEPOSIT">Direct Deposit</option>
                  <option value="MANUAL_LEDGER">Manual Ledger Adjustment</option>
                  <option value="OTHER">Other Form of Payout</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Payment Reference # / Check # (Required):</label>
                <input
                  type="text"
                  required
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  style={styles.input}
                  placeholder="e.g. CHK-99042 or ACH-TXN-8812"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Payment Notes:</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  style={{ ...styles.input, minHeight: '60px' }}
                  placeholder="Details regarding transaction settlement..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  style={styles.secondaryBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>
                  {loading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: COMMISSION DETAILS & HISTORY */}
      {selectedCommission && !isReviewModalOpen && !isPaymentModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalBox, maxWidth: '640px' }}>
            <h3 style={styles.modalTitle}>Commission #{selectedCommission.commissionNumber}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', marginBottom: '16px' }}>
              <div><strong>Status:</strong> {selectedCommission.status}</div>
              <div><strong>Calculated Amount:</strong> ${Number(selectedCommission.calculatedAmount || 0).toFixed(2)}</div>
              <div><strong>Basis Amount:</strong> ${Number(selectedCommission.basisAmount || 0).toFixed(2)}</div>
              <div><strong>Rate Applied:</strong> {selectedCommission.rateApplied?.value} ({selectedCommission.rateApplied?.type})</div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
              📜 Lifecycle Audit Trail
            </h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
              {commissionHistory.length === 0 ? (
                <div>No history records yet.</div>
              ) : (
                commissionHistory.map((h, i) => (
                  <div key={i} style={{ borderBottom: '1px solid #e2e8f0', padding: '6px 0' }}>
                    <strong>{h.action}</strong>: {h.fromStatus} &rarr; <strong>{h.toStatus}</strong>
                    <div style={{ color: '#64748b' }}>{new Date(h.createdAt).toLocaleString()} | By: {h.actorId?.fullName || h.actorRole || 'System'}</div>
                    {h.reason && <div style={{ color: '#b91c1c' }}>Reason: {h.reason}</div>}
                    {h.notes && <div style={{ color: '#475569' }}>Notes: {h.notes}</div>}
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedCommission(null)}
                style={styles.secondaryBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE COMMISSION POLICY */}
      {isCreateCommPolicyModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>Create New Commission Policy</h3>
            <form onSubmit={handleCreateCommPolicy}>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Policy Name:</label>
                <input
                  type="text"
                  required
                  value={newCommPolicy.name}
                  onChange={(e) => setNewCommPolicy({ ...newCommPolicy, name: e.target.value })}
                  style={styles.input}
                  placeholder="e.g. Standard Tier 1 Commission"
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Policy Code:</label>
                <input
                  type="text"
                  required
                  value={newCommPolicy.code}
                  onChange={(e) => setNewCommPolicy({ ...newCommPolicy, code: e.target.value })}
                  style={styles.input}
                  placeholder="e.g. COMM_STD_10"
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Commission Type:</label>
                <select
                  value={newCommPolicy.commissionType}
                  onChange={(e) => setNewCommPolicy({ ...newCommPolicy, commissionType: e.target.value })}
                  style={styles.input}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>

              {newCommPolicy.commissionType === 'PERCENTAGE' ? (
                <div style={{ marginBottom: '10px' }}>
                  <label style={styles.label}>Percentage Value (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={newCommPolicy.percentageValue}
                    onChange={(e) => setNewCommPolicy({ ...newCommPolicy, percentageValue: e.target.value })}
                    style={styles.input}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: '10px' }}>
                  <label style={styles.label}>Fixed Amount ($):</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={newCommPolicy.fixedAmount}
                    onChange={(e) => setNewCommPolicy({ ...newCommPolicy, fixedAmount: e.target.value })}
                    style={styles.input}
                  />
                </div>
              )}

              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Calculation Basis:</label>
                <select
                  value={newCommPolicy.calculationBasis}
                  onChange={(e) => setNewCommPolicy({ ...newCommPolicy, calculationBasis: e.target.value })}
                  style={styles.input}
                >
                  <option value="NET_ESTIMATE">Net Estimate (Subtotal after discounts)</option>
                  <option value="GROSS_ESTIMATE">Gross Estimate (Total amount with tax)</option>
                  <option value="FIXED">Fixed Lump Sum</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Description:</label>
                <textarea
                  value={newCommPolicy.description}
                  onChange={(e) => setNewCommPolicy({ ...newCommPolicy, description: e.target.value })}
                  style={{ ...styles.input, minHeight: '50px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateCommPolicyModalOpen(false)}
                  style={styles.secondaryBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CREATE DISCOUNT POLICY */}
      {isCreateDiscPolicyModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>Create New Discount Policy</h3>
            <form onSubmit={handleCreateDiscPolicy}>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Policy Name:</label>
                <input
                  type="text"
                  required
                  value={newDiscPolicy.name}
                  onChange={(e) => setNewDiscPolicy({ ...newDiscPolicy, name: e.target.value })}
                  style={styles.input}
                  placeholder="e.g. Preferred Partner 5%"
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Policy Code:</label>
                <input
                  type="text"
                  required
                  value={newDiscPolicy.code}
                  onChange={(e) => setNewDiscPolicy({ ...newDiscPolicy, code: e.target.value })}
                  style={styles.input}
                  placeholder="e.g. PARTNER_5"
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Discount Type:</label>
                <select
                  value={newDiscPolicy.discountType}
                  onChange={(e) => setNewDiscPolicy({ ...newDiscPolicy, discountType: e.target.value })}
                  style={styles.input}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Dollar Amount ($)</option>
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Discount Value:</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  value={newDiscPolicy.discountValue}
                  onChange={(e) => setNewDiscPolicy({ ...newDiscPolicy, discountValue: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Applicability:</label>
                <select
                  value={newDiscPolicy.applicability}
                  onChange={(e) => setNewDiscPolicy({ ...newDiscPolicy, applicability: e.target.value })}
                  style={styles.input}
                >
                  <option value="ALL_CONTRACTORS">All Verified Contractors</option>
                  <option value="SPECIFIC_CONTRACTORS">Specific Assigned Contractors Only</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Description:</label>
                <textarea
                  value={newDiscPolicy.description}
                  onChange={(e) => setNewDiscPolicy({ ...newDiscPolicy, description: e.target.value })}
                  style={{ ...styles.input, minHeight: '50px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateDiscPolicyModalOpen(false)}
                  style={styles.secondaryBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ASSIGN CONTRACTOR */}
      {isAssignModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalBox, maxWidth: '580px' }}>
            <h3 style={styles.modalTitle}>Assign Contractors: {assignPolicyName}</h3>
            
            <form onSubmit={handleAddAssignment} style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Select Verified Contractor:</label>
                <select
                  required
                  value={selectedContractorId}
                  onChange={(e) => setSelectedContractorId(e.target.value)}
                  style={styles.input}
                >
                  <option value="">-- Choose Contractor --</option>
                  {eligibleContractors.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.businessName} ({c.contactEmail || c.licenseNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Notes (Optional):</label>
                <input
                  type="text"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  style={styles.input}
                  placeholder="Reason or authorization reference..."
                />
              </div>
              <button type="submit" style={styles.primaryBtn}>
                + Assign to Policy
              </button>
            </form>

            <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Current Assigned Contractors</h4>
            <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
              {currentAssignments.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>No individual contractors assigned yet.</div>
              ) : (
                currentAssignments.map((a) => (
                  <div
                    key={a._id || a.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 10px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '4px',
                      marginBottom: '6px',
                      fontSize: '12px',
                    }}
                  >
                    <span>
                      <strong>{a.contractorId?.contractorProfile?.businessName || a.contractorId?.fullName || a.contractorId}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignment(a.contractorId?._id || a.contractorId?.id || a.contractorId)}
                      style={{ ...styles.smallActionBtn, color: '#b91c1c', backgroundColor: '#fee2e2' }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                style={styles.secondaryBtn}
              >
                Done
              </button>
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
    fontFamily: 'system-ui, -apple-system, sans-serif',
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
  tabsBar: {
    display: 'flex',
    gap: '12px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '20px',
  },
  tabButton: {
    background: 'none',
    border: 'none',
    padding: '12px 16px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '16px',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
  },
  select: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: '#334155',
  },
  badge: {
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'inline-block',
  },
  primaryBtn: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  secondaryBtn: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  smallActionBtn: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyBox: {
    padding: '36px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    fontSize: '14px',
  },
  successAlert: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '10px 14px',
    borderRadius: '6px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '10px 14px',
    borderRadius: '6px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
  },
  closeAlertBtn: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '24px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
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
};
