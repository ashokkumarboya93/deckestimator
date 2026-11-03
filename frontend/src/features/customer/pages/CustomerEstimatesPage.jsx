// =============================================
// Deck Estimator — Customer My Estimates Page (DECK PRO)
// =============================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEstimates } from '../api/estimatesApi';

export default function CustomerEstimatesPage() {
  const navigate = useNavigate();

  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Print / PDF Modal
  const [printEstimate, setPrintEstimate] = useState(null);

  const fetchEstimates = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getEstimates({ limit: 50 });
      setEstimates(data?.estimates || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your estimates.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  // KPIs
  const kpis = useMemo(() => {
    const total = estimates.length;
    const completed = estimates.filter((e) => ['COMPLETED', 'APPROVED', 'SUBMITTED'].includes((e.estimateStatus || '').toUpperCase())).length;
    const drafts = estimates.filter((e) => (e.estimateStatus || 'DRAFT').toUpperCase() === 'DRAFT').length;
    const totalVal = estimates.reduce((sum, e) => sum + (Number(e.totalAmount) || 0), 0);
    return { total, completed, drafts, totalVal };
  }, [estimates]);

  // Filtered List
  const filteredEstimates = useMemo(() => {
    return estimates.filter((est) => {
      const matchesStatus =
        statusFilter === 'ALL' || (est.estimateStatus || 'DRAFT').toUpperCase() === statusFilter;
      const projName = est.deckDetails?.projectName || est.deckId?.projectName || est.estimateName || '';
      const estNum = est.estimateNumber || est._id || '';
      const matchesSearch =
        projName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estNum.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [estimates, statusFilter, searchTerm]);

  function formatCurrency(val) {
    if (typeof val !== 'number' || isNaN(val)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  }

  function getPriceDisplay(est) {
    const snap = est.pricingSnapshot;
    if (snap?.displayQuote?.formatted) {
      return snap.displayQuote.formatted;
    }
    if (snap?.lowRange && snap?.highRange) {
      return `${formatCurrency(snap.lowRange)} – ${formatCurrency(snap.highRange)}`;
    }
    if (est.totalAmount) {
      return formatCurrency(est.totalAmount);
    }
    return '$0';
  }

  function getStatusStyle(status) {
    const s = (status || 'DRAFT').toUpperCase();
    switch (s) {
      case 'COMPLETED':
      case 'APPROVED':
        return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'SUBMITTED':
        return { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' };
      case 'EXPIRED':
      case 'REJECTED':
        return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' };
      case 'DRAFT':
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  }

  const handlePrint = (est) => {
    setPrintEstimate(est);
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  return (
    <div style={styles.page}>
      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={styles.title}>My Estimates</h1>
            <span style={styles.countBadge}>{kpis.total} Total</span>
          </div>
          <p style={styles.subtitle}>
            Review and export your deck restoration project estimates, itemized labor hours, and material calculations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => fetchEstimates(true)}
            disabled={refreshing}
            style={styles.refreshBtn}
          >
            {refreshing ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/customer/decks/new')}
            style={styles.newBtn}
          >
            + New Estimate
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Total Estimates</span>
          <strong style={styles.kpiValue}>{kpis.total}</strong>
          <span style={styles.kpiSub}>Calculated projects</span>
        </div>

        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Official / Submitted</span>
          <strong style={{ ...styles.kpiValue, color: '#16a34a' }}>{kpis.completed}</strong>
          <span style={styles.kpiSub}>Active quotes</span>
        </div>

        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Saved Drafts</span>
          <strong style={{ ...styles.kpiValue, color: '#d97706' }}>{kpis.drafts}</strong>
          <span style={styles.kpiSub}>In-progress</span>
        </div>

        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Total Estimated Value</span>
          <strong style={{ ...styles.kpiValue, color: '#0f172a' }}>{formatCurrency(kpis.totalVal)}</strong>
          <span style={styles.kpiSub}>Aggregate project sum</span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div style={styles.filterCard}>
        <div style={styles.searchBox}>
          <span style={{ color: '#94a3b8' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by project name or reference ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.selectInput}
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={styles.errorBox}>
          <span>{error}</span>
          <button type="button" onClick={() => fetchEstimates()} style={styles.retryBtn}>Retry</button>
        </div>
      )}

      {/* Content Table / Empty State */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px' }}>Loading your estimates...</p>
          </div>
        ) : filteredEstimates.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📑</div>
            <h3 style={styles.emptyTitle}>No Estimates Found</h3>
            <p style={styles.emptyDesc}>
              {searchTerm || statusFilter !== 'ALL'
                ? 'No estimates match your search criteria. Try resetting the filters.'
                : "You haven't generated any estimates yet. Calculate your first instant estimate now."}
            </p>
            <button
              type="button"
              onClick={() => navigate('/customer/decks/new')}
              style={styles.newBtn}
            >
              + Create Your First Estimate
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.tableHeadCell}>Estimate Ref & Project</th>
                  <th style={styles.tableHeadCell}>Deck Size</th>
                  <th style={styles.tableHeadCell}>Labor & Materials</th>
                  <th style={styles.tableHeadCell}>Estimated Amount</th>
                  <th style={styles.tableHeadCell}>Status</th>
                  <th style={styles.tableHeadCell}>Date</th>
                  <th style={{ ...styles.tableHeadCell, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEstimates.map((est) => {
                  const estId = est._id || est.id;
                  const projectName = est.deckDetails?.projectName || est.deckId?.projectName || est.estimateName || 'Deck Restoration Project';
                  const area = est.deckDetails?.areaSqFt || est.deckDetails?.deckArea || est.pricingSnapshot?.billableArea || '--';
                  const statusStyle = getStatusStyle(est.estimateStatus);
                  const laborHours = est.pricingSnapshot?.laborBreakdown?.totalHours || est.laborBreakdown?.totalHours;
                  const matCost = est.pricingSnapshot?.totalMaterialCost;

                  return (
                    <tr key={estId} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{projectName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Ref: {est.estimateNumber || estId}</div>
                      </td>

                      <td style={styles.tableCell}>
                        <div style={{ fontWeight: '600', color: '#166534' }}>{area} sq ft</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {est.deckDetails?.deckShape ? est.deckDetails.deckShape.toUpperCase() : 'Standard'}
                        </div>
                      </td>

                      <td style={styles.tableCell}>
                        <div style={{ fontSize: '12px', color: '#334155' }}>
                          {laborHours ? `${laborHours.toFixed(1)} hrs labor` : 'Labor included'}
                        </div>
                        {matCost ? (
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            ${Math.round(matCost)} materials
                          </div>
                        ) : null}
                      </td>

                      <td style={styles.tableCell}>
                        <div style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>
                          {getPriceDisplay(est)}
                        </div>
                      </td>

                      <td style={styles.tableCell}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                            borderColor: statusStyle.border,
                          }}
                        >
                          {est.estimateStatus || 'DRAFT'}
                        </span>
                      </td>

                      <td style={styles.tableCell}>
                        <div style={{ fontSize: '12px', color: '#475569' }}>
                          {new Date(est.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => navigate(`/customer/estimates/${estId}`)}
                            style={styles.actionBtn}
                            title="View full estimate breakdown"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrint(est)}
                            style={{ ...styles.actionBtn, backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }}
                            title="Print or export PDF"
                          >
                            PDF / Print
                          </button>
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

      {/* Printable PDF Modal Preview */}
      {printEstimate && (
        <div style={styles.modalOverlay} onClick={() => setPrintEstimate(null)}>
          <div style={styles.printModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.noPrintBar}>
              <button
                type="button"
                onClick={triggerBrowserPrint}
                style={styles.printNowBtn}
              >
                🖨️ Print / Save as PDF
              </button>
              <button
                type="button"
                onClick={() => setPrintEstimate(null)}
                style={styles.closeModalBtn}
              >
                ✕ Close
              </button>
            </div>

            {/* Official Printable Document Layout */}
            <div style={styles.printSheet}>
              <div style={styles.sheetHeader}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '900', color: '#0f172a' }}>
                    DECK <span style={{ color: '#16a34a' }}>PRO</span>
                  </h2>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Professional Deck Restoration Estimates</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>OFFICIAL ESTIMATE</h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Ref #: {printEstimate.estimateNumber || printEstimate._id}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Date: {new Date(printEstimate.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={styles.sheetDivider} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <h4 style={styles.sheetHeading}>Project Information</h4>
                  <div style={styles.sheetRow}>
                    <span>Project:</span> <strong>{printEstimate.deckDetails?.projectName || 'Deck Restoration'}</strong>
                  </div>
                  <div style={styles.sheetRow}>
                    <span>Deck Dimensions:</span> <strong>{printEstimate.deckDetails?.deckLength || '--'} × {printEstimate.deckDetails?.deckWidth || '--'} ft</strong>
                  </div>
                  <div style={styles.sheetRow}>
                    <span>Deck Floor Area:</span> <strong>{printEstimate.deckDetails?.areaSqFt || printEstimate.deckDetails?.deckArea || '--'} sq ft</strong>
                  </div>
                  <div style={styles.sheetRow}>
                    <span>Wood Species:</span> <strong>{printEstimate.pricingSnapshot?.woodSpecies || printEstimate.deckDetails?.surfaceMaterial || 'Wood'}</strong>
                  </div>
                </div>

                <div>
                  <h4 style={styles.sheetHeading}>Scope & Specifications</h4>
                  <div style={styles.sheetRow}>
                    <span>Coating Type:</span> <strong>{printEstimate.pricingSnapshot?.coatingType || 'Stain / Sealer'}</strong>
                  </div>
                  <div style={styles.sheetRow}>
                    <span>Billable Surface Area:</span> <strong>{printEstimate.pricingSnapshot?.billableArea || printEstimate.deckDetails?.areaSqFt} sq ft</strong>
                  </div>
                  <div style={styles.sheetRow}>
                    <span>Estimated Labor Hours:</span> <strong>{printEstimate.pricingSnapshot?.laborBreakdown?.totalHours?.toFixed(2) || printEstimate.laborBreakdown?.totalHours || '--'} hrs</strong>
                  </div>
                  <div style={styles.sheetRow}>
                    <span>Estimate Status:</span> <strong>{printEstimate.estimateStatus}</strong>
                  </div>
                </div>
              </div>

              {/* Itemized Materials & Labor Table */}
              <h4 style={styles.sheetHeading}>Cost Breakdown Summary</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #0f172a' }}>
                    <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '12px' }}>Description</th>
                    <th style={{ textAlign: 'center', padding: '8px 0', fontSize: '12px' }}>Quantity / Scope</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '12px' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 0', fontSize: '13px' }}>
                      <strong>5-Part Surface Restoration Labor</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Base floor prep, coatings, access factors & conditions</div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 0', fontSize: '13px' }}>
                      {printEstimate.pricingSnapshot?.laborBreakdown?.totalHours?.toFixed(1) || '--'} hrs
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px 0', fontSize: '13px', fontWeight: '700' }}>
                      ${printEstimate.pricingSnapshot?.laborCost?.toFixed(2) || printEstimate.laborBreakdown?.subtotal?.toFixed(2) || '--'}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 0', fontSize: '13px' }}>
                      <strong>Materials & Chemistry Supplies</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Stains, cleaners, strippers & neutralizers</div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 0', fontSize: '13px' }}>Coverage based</td>
                    <td style={{ textAlign: 'right', padding: '10px 0', fontSize: '13px', fontWeight: '700' }}>
                      ${printEstimate.pricingSnapshot?.totalMaterialCost?.toFixed(2) || '--'}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '2px solid #0f172a' }}>
                    <td colSpan={2} style={{ padding: '12px 0', fontSize: '14px', fontWeight: '800' }}>
                      TOTAL ESTIMATE / QUOTE RANGE
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 0', fontSize: '18px', fontWeight: '900', color: '#16a34a' }}>
                      {getPriceDisplay(printEstimate)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={styles.sheetGuarantee}>
                <strong>DECK PRO Transparent Pricing Guarantee:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                  All pricing calculations follow pure production rates, verified material coverage benchmarks, and regional labor standards. No arbitrary contractor markups.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '1200px',
    margin: '24px auto',
    padding: '0 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '14px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  countBadge: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    padding: '3px 9px',
    borderRadius: '12px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0 0',
  },
  refreshBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  newBtn: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#64748b',
    marginBottom: '6px',
  },
  kpiValue: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#0f172a',
  },
  kpiSub: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  filterCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: '240px',
  },
  searchInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    color: '#0f172a',
  },
  selectInput: {
    padding: '6px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    borderBottom: '2px solid #e2e8f0',
  },
  tableHeadCell: {
    padding: '12px 14px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#64748b',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease',
  },
  tableCell: {
    padding: '14px',
    fontSize: '13px',
    verticalAlign: 'middle',
  },
  statusBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 9px',
    borderRadius: '12px',
    border: '1px solid transparent',
  },
  actionBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#b91c1c',
    fontSize: '13px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    padding: '3px 8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#b91c1c',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#16a34a',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 0.8s linear infinite',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '60px 20px',
    maxWidth: '440px',
    margin: '0 auto',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  emptyDesc: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '18px',
    lineHeight: 1.5,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 80,
    padding: '16px',
  },
  printModal: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '740px',
    width: '100%',
    maxHeight: '94vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  noPrintBar: {
    padding: '12px 20px',
    backgroundColor: '#0f172a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#ffffff',
  },
  printNowBtn: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  closeModalBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '16px',
    cursor: 'pointer',
  },
  printSheet: {
    padding: '36px',
    backgroundColor: '#ffffff',
  },
  sheetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sheetDivider: {
    height: '2px',
    backgroundColor: '#0f172a',
    margin: '20px 0',
  },
  sheetHeading: {
    fontSize: '14px',
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#0f172a',
    margin: '0 0 10px 0',
  },
  sheetRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#475569',
    marginBottom: '6px',
  },
  sheetGuarantee: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '12px',
    color: '#0f172a',
  },
};

