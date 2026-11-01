// =============================================
// Deck Estimator — Estimate Detail & Revision Breakdown Page
// =============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getEstimateById,
  recalculateEstimate,
  getEstimateHistory,
  updateEstimateStatus,
} from '../api/estimatesApi';
import { contractorDiscountApi } from '../../contractor/api/contractorDiscountApi';
import { useAuth } from '../../auth/hooks/useAuth';

export default function EstimateDetailPage() {
  const { estimateId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [estimate, setEstimate] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Recalculate Modal
  const [isRecalcModalOpen, setIsRecalcModalOpen] = useState(false);
  const [recalcReason, setRecalcReason] = useState('');

  // Discount Modal (Phase 9)
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [eligibleDiscounts, setEligibleDiscounts] = useState([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState('');

  const isContractor = user?.role === 'contractor';
  const isAdmin = user?.role === 'admin';
  const basePath = isContractor ? '/contractor' : '/customer';

  const loadEstimateData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [estData, revData] = await Promise.all([
        getEstimateById(estimateId),
        getEstimateHistory(estimateId).catch(() => []),
      ]);
      setEstimate(estData);
      setRevisions(revData);
    } catch (err) {
      setError(err.message || 'Failed to load estimate details.');
    } finally {
      setLoading(false);
    }
  }, [estimateId]);

  useEffect(() => {
    loadEstimateData();
  }, [loadEstimateData]);

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    setActionMsg(null);
    try {
      const updated = await updateEstimateStatus(estimateId, newStatus);
      setEstimate(updated);
      setActionMsg(`Estimate status successfully changed to ${newStatus}.`);
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecalculate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const updated = await recalculateEstimate(estimateId, {
        revisionReason: recalcReason || 'Manual recalculation with latest pricing rates',
      });
      setEstimate(updated);
      setIsRecalcModalOpen(false);
      setRecalcReason('');
      setActionMsg('Estimate successfully recalculated. New revision archived.');
      setTimeout(() => setActionMsg(null), 3000);
      loadEstimateData();
    } catch (err) {
      setError(err.message || 'Failed to recalculate estimate.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDiscountModal = async () => {
    setActionLoading(true);
    try {
      const res = await contractorDiscountApi.getEligibleDiscounts();
      setEligibleDiscounts(res.data || []);
      setIsDiscountModalOpen(true);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to fetch discounts.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyDiscountSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDiscountId) return;
    setActionLoading(true);
    try {
      const res = await contractorDiscountApi.applyDiscountToEstimate(estimateId, selectedDiscountId);
      setEstimate(res.data?.estimate || res.data);
      setIsDiscountModalOpen(false);
      setSelectedDiscountId('');
      setActionMsg('Discount policy successfully applied to estimate.');
      setTimeout(() => setActionMsg(null), 3000);
      loadEstimateData();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to apply discount.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveDiscountClick = async () => {
    if (!window.confirm('Remove active discount policy from this estimate?')) return;
    setActionLoading(true);
    try {
      const res = await contractorDiscountApi.removeDiscountFromEstimate(estimateId, 'Removed by contractor/admin');
      setEstimate(res.data?.estimate || res.data);
      setActionMsg('Discount removed and rates restored.');
      setTimeout(() => setActionMsg(null), 3000);
      loadEstimateData();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to remove discount.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerBox}>
        <p>Loading estimate calculation breakdown...</p>
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>{error || 'Estimate not found.'}</div>
        <button type="button" onClick={() => navigate(`${basePath}/dashboard`)} style={styles.secondaryBtn}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const snapshot = estimate.pricingSnapshot || {};
  const statusColors = {
    DRAFT: { bg: '#fef3c7', text: '#92400e' },
    SUBMITTED: { bg: '#e0e7ff', text: '#3730a3' },
    APPROVED: { bg: '#dcfce7', text: '#15803d' },
    COMPLETED: { bg: '#dcfce7', text: '#15803d' },
    EXPIRED: { bg: '#f1f5f9', text: '#475569' },
    CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
  };

  const currentStatus = estimate.estimateStatus || 'DRAFT';
  const badgeStyle = statusColors[currentStatus] || { bg: '#f1f5f9', text: '#475569' };

  return (
    <div style={styles.container}>
      <button
        type="button"
        onClick={() => navigate(`${basePath}/decks/${estimate.deckId?._id || estimate.deckId || ''}`)}
        style={styles.secondaryBtn}
      >
        ← Back to Deck Project
      </button>

      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.titleRow}>
            <h1 style={styles.title}>Estimate #{estimate.estimateNumber || estimate.id}</h1>
            <span style={{ ...styles.statusBadge, backgroundColor: badgeStyle.bg, color: badgeStyle.text }}>
              {currentStatus}
            </span>
            <span style={styles.versionBadge}>v{estimate.version || 1}</span>
          </div>
          <p style={styles.subtext}>
            Deck: <strong>{estimate.deckDetails?.projectName || 'Project Deck'}</strong> | Area:{' '}
            <strong>{estimate.deckDetails?.areaSqFt || 0} sq ft</strong> | Created:{' '}
            {new Date(estimate.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={() => setIsRecalcModalOpen(true)}
            style={styles.recalcBtn}
            disabled={actionLoading}
          >
            🔄 Recalculate Rates
          </button>

          {(isAdmin || isContractor) && currentStatus === 'DRAFT' && (
            estimate.discountBreakdown?.applied ? (
              <button
                type="button"
                onClick={handleRemoveDiscountClick}
                style={{ ...styles.recalcBtn, color: '#b91c1c', borderColor: '#fca5a5' }}
                disabled={actionLoading}
              >
                🏷️ Remove Discount
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenDiscountModal}
                style={{ ...styles.recalcBtn, color: '#15803d', borderColor: '#86efac' }}
                disabled={actionLoading}
              >
                🏷️ Apply Discount
              </button>
            )
          )}

          {currentStatus === 'DRAFT' && (
            <button
              type="button"
              onClick={() => handleStatusChange('SUBMITTED')}
              style={styles.primaryActionBtn}
              disabled={actionLoading}
            >
              Submit Estimate
            </button>
          )}

          {(isAdmin || isContractor) && currentStatus === 'SUBMITTED' && (
            <button
              type="button"
              onClick={() => handleStatusChange('COMPLETED')}
              style={styles.approveActionBtn}
              disabled={actionLoading}
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>

      {actionMsg && <div style={styles.successBanner}>{actionMsg}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Pricing Summary Highlights */}
      <div style={styles.metricGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Materials Subtotal</div>
          <div style={styles.metricValue}>${Number(snapshot.materialsTotal || 0).toFixed(2)}</div>
          <div style={styles.metricHint}>Includes waste allowance</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Services Subtotal</div>
          <div style={styles.metricValue}>${Number(snapshot.servicesTotal || 0).toFixed(2)}</div>
          <div style={styles.metricHint}>{estimate.selectedServices?.length || 0} services applied</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Labor Allowance</div>
          <div style={styles.metricValue}>${Number(snapshot.laborTotal || 0).toFixed(2)}</div>
          <div style={styles.metricHint}>Estimated crew hours</div>
        </div>
        {estimate.discountBreakdown?.applied && (
          <div style={{ ...styles.metricCard, borderLeft: '4px solid #16a34a', backgroundColor: '#f0fdf4' }}>
            <div style={{ ...styles.metricLabel, color: '#15803d' }}>Partner Discount</div>
            <div style={{ ...styles.metricValue, color: '#16a34a' }}>
              -${Number(estimate.discountBreakdown.discountAmount || 0).toFixed(2)}
            </div>
            <div style={{ ...styles.metricHint, color: '#15803d' }}>
              {estimate.discountBreakdown.policyName} ({estimate.discountBreakdown.rateDescription})
            </div>
          </div>
        )}
        <div style={{ ...styles.metricCard, borderLeft: '4px solid #0284c7' }}>
          <div style={styles.metricLabel}>Total Amount</div>
          <div style={{ ...styles.metricValue, color: '#0284c7', fontSize: '24px' }}>
            ${Number(estimate.totalAmount || 0).toFixed(2)}
          </div>
          <div style={styles.metricHint}>
            {snapshot.minJobAdjustment > 0 ? 'Minimum Job Price Applied' : 'Calculated Subtotal + Taxes'}
          </div>
        </div>
      </div>

      {/* Materials Breakdown Table */}
      <div style={styles.sectionCard}>
        <h3 style={styles.sectionHeading}>📦 Material Requirements & Pricing Breakdown</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>Material Name</th>
              <th style={styles.th}>Coverage Rate</th>
              <th style={styles.th}>Required Qty (w/ Waste)</th>
              <th style={styles.th}>Unit Cost</th>
              <th style={styles.th}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(estimate.selectedMaterials || []).map((m, idx) => (
              <tr key={idx} style={styles.tr}>
                <td style={styles.td}>
                  <strong>{m.materialName}</strong>
                </td>
                <td style={styles.td}>{m.coverageValue || '200'} sq ft / {m.unitOfMeasure || 'unit'}</td>
                <td style={styles.td}>
                  <strong>{m.quantity}</strong> {m.unitOfMeasure || 'units'}
                </td>
                <td style={styles.td}>${Number(m.unitPrice || 0).toFixed(2)}</td>
                <td style={styles.td}>${Number(m.subtotal || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Services Breakdown Table */}
      <div style={styles.sectionCard}>
        <h3 style={styles.sectionHeading}>🛠️ Services & Labor Breakdown</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>Service Name</th>
              <th style={styles.th}>Billing Model</th>
              <th style={styles.th}>Quantity / Area</th>
              <th style={styles.th}>Base Rate</th>
              <th style={styles.th}>Labor Added</th>
              <th style={styles.th}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(estimate.selectedServices || []).map((s, idx) => (
              <tr key={idx} style={styles.tr}>
                <td style={styles.td}>
                  <strong>{s.serviceName}</strong>
                </td>
                <td style={styles.td}>{s.pricingModel === 'per_sq_ft' ? 'Per Square Foot' : 'Flat Fee'}</td>
                <td style={styles.td}>{s.quantity}</td>
                <td style={styles.td}>${Number(s.price || 0).toFixed(2)}</td>
                <td style={styles.td}>${Number(s.laborCost || 0).toFixed(2)}</td>
                <td style={styles.td}>${Number(s.subtotal || s.price || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transparent Calculation Breakdown */}
      <div style={styles.sectionCard}>
        <h3 style={styles.sectionHeading}>📐 Transparent Formula Breakdown</h3>
        <p style={styles.sectionSub}>Deterministic pricing calculation single source of truth.</p>

        <div style={styles.formulaBox}>
          <div style={styles.formulaItem}>
            <strong>Material Quantity:</strong> Area ({estimate.deckDetails?.areaSqFt || 0} sq ft) / Coverage &times; (1 + {snapshot.wastePercentage || 10}% waste buffer)
          </div>
          <div style={styles.formulaItem}>
            <strong>Labor Rate:</strong> ${Number(snapshot.laborRate || 0).toFixed(2)}/hr applied to estimated service labor hours.
          </div>
          <div style={styles.formulaItem}>
            <strong>Subtotal:</strong> Materials (${Number(snapshot.materialsTotal || 0).toFixed(2)}) + Services (${Number(snapshot.servicesTotal || 0).toFixed(2)}) + Labor (${Number(snapshot.laborTotal || 0).toFixed(2)}) + Extra Coatings (${Number(snapshot.additionalCoatingTotal || 0).toFixed(2)}) + Travel (${Number(snapshot.travelCharge || 0).toFixed(2)})
          </div>
          {estimate.discountBreakdown?.applied && (
            <div style={{ ...styles.formulaItem, color: '#15803d', backgroundColor: '#f0fdf4', padding: '6px 10px', borderRadius: '4px' }}>
              <strong>Partner Discount ({estimate.discountBreakdown.policyName}):</strong> -${Number(estimate.discountBreakdown.discountAmount || 0).toFixed(2)} ({estimate.discountBreakdown.rateDescription}) &rarr; Adjusted Subtotal: ${Number(estimate.discountBreakdown.discountedSubtotal || 0).toFixed(2)}
            </div>
          )}
          {snapshot.taxPercentage > 0 && (
            <div style={styles.formulaItem}>
              <strong>Tax ({snapshot.taxPercentage}%):</strong> ${Number(snapshot.taxAmount || 0).toFixed(2)}
            </div>
          )}
          {snapshot.minJobAdjustment > 0 && (
            <div style={{ ...styles.formulaItem, color: '#0369a1' }}>
              <strong>Minimum Job Price Rule:</strong> Raised to minimum threshold of ${Number(snapshot.minimumJobPrice || 0).toFixed(2)} (+${Number(snapshot.minJobAdjustment).toFixed(2)} adjustment)
            </div>
          )}
        </div>
      </div>

      {/* Revision History */}
      <div style={styles.sectionCard}>
        <h3 style={styles.sectionHeading}>📜 Version History & Snapshot Archive</h3>
        <p style={styles.sectionSub}>Historical estimate revisions preserved with original pricing snapshots.</p>

        {revisions.length === 0 ? (
          <div style={styles.emptyNotice}>This is the original version (v1). No previous revisions archived.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Version</th>
                <th style={styles.th}>Archived Date</th>
                <th style={styles.th}>Previous Total</th>
                <th style={styles.th}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {revisions.map((rev) => (
                <tr key={rev._id || rev.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>v{rev.version}</strong>
                  </td>
                  <td style={styles.td}>{new Date(rev.createdAt).toLocaleString()}</td>
                  <td style={styles.td}>
                    <strong>${Number(rev.totalAmount || 0).toFixed(2)}</strong>
                  </td>
                  <td style={styles.td}>{rev.revisionReason || 'Rate update'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recalculate Modal */}
      {isRecalcModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 12px', fontSize: '18px' }}>Recalculate Estimate</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Recalculating evaluates current catalog rates, labor allowances, and pricing configurations. The current state will be archived as a new revision.
            </p>
            <form onSubmit={handleRecalculate}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Reason for Recalculation:
                </label>
                <input
                  type="text"
                  required
                  value={recalcReason}
                  onChange={(e) => setRecalcReason(e.target.value)}
                  placeholder="e.g. Updated spring catalog pricing or customer requested additional coat"
                  style={styles.input}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsRecalcModalOpen(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.primaryActionBtn} disabled={actionLoading}>
                  {actionLoading ? 'Recalculating...' : 'Confirm Recalculation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Discount Modal (Phase 9) */}
      {isDiscountModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 12px', fontSize: '18px' }}>Apply Partner Discount</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Select an approved contractor discount policy to apply to this estimate. Applying a discount creates an immutable revision snapshot.
            </p>
            {eligibleDiscounts.length === 0 ? (
              <div>
                <p style={{ fontSize: '13px', color: '#b91c1c', marginBottom: '16px' }}>
                  No active discount policies currently eligible for your contractor account.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsDiscountModalOpen(false)}
                    style={styles.cancelBtn}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplyDiscountSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Select Discount Policy:
                  </label>
                  <select
                    required
                    value={selectedDiscountId}
                    onChange={(e) => setSelectedDiscountId(e.target.value)}
                    style={styles.input}
                  >
                    <option value="">-- Choose Eligible Discount --</option>
                    {eligibleDiscounts.map((d) => (
                      <option key={d._id || d.id} value={d._id || d.id}>
                        {d.name} ({d.code}) — {d.discountType === 'PERCENTAGE' ? `${d.discountValue}% off` : `$${d.discountValue} off`}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsDiscountModalOpen(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ ...styles.primaryActionBtn, backgroundColor: '#15803d' }}
                    disabled={actionLoading || !selectedDiscountId}
                  >
                    {actionLoading ? 'Applying...' : 'Apply to Estimate'}
                  </button>
                </div>
              </form>
            )}
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
    padding: '24px 20px 60px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  centerBox: {
    padding: '60px',
    textAlign: 'center',
    color: '#64748b',
  },
  secondaryBtn: {
    background: 'none',
    border: 'none',
    color: '#0284c7',
    fontSize: '14px',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '16px',
    fontWeight: 600,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '20px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '6px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f172a',
  },
  subtext: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 700,
  },
  versionBadge: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 700,
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  recalcBtn: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  primaryActionBtn: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  approveActionBtn: {
    backgroundColor: '#15803d',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  successBanner: {
    padding: '12px 16px',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  errorBox: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  metricLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  metricValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '2px',
  },
  metricHint: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  sectionHeading: {
    fontSize: '16px',
    fontWeight: 700,
    margin: '0 0 4px',
    color: '#0f172a',
  },
  sectionSub: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px',
  },
  thRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '10px 14px',
    fontWeight: 600,
    color: '#475569',
    fontSize: '13px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 14px',
    color: '#1e293b',
  },
  formulaBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '13px',
    color: '#334155',
    border: '1px solid #e2e8f0',
  },
  formulaItem: {
    lineHeight: '1.5',
  },
  emptyNotice: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    color: '#64748b',
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
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '100%',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  cancelBtn: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

