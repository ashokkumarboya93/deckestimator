// =============================================
// Deck Estimator — Admin Discounts Management Hub
// =============================================
// Features:
// - Default 10% Contractor Discount Card with quick-edit and save
// - Individual Contractor Custom Discounts with Completed-Projects Counts
// - Tier recommendations based on completed project metrics (0-5: 10%, 6-15: 12%, 16+: 15%)
// - Audit history log of all discount modifications
// - Directly wired to estimation calculation in backend

import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

export default function AdminDiscountsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Default Discount Edit State
  const [isEditingDefault, setIsEditingDefault] = useState(false);
  const [defaultVal, setDefaultVal] = useState(10);
  const [defaultReason, setDefaultReason] = useState('');
  const [savingDefault, setSavingDefault] = useState(false);

  // Contractor Override Modal State
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [customDiscount, setCustomDiscount] = useState(10);
  const [overrideReason, setOverrideReason] = useState('');
  const [savingOverride, setSavingOverride] = useState(false);

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getDiscountsOverview();
      setData(res.data);
      if (res.data?.defaultDiscount !== undefined) {
        setDefaultVal(res.data.defaultDiscount);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load discount policies.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDefault = async () => {
    setSavingDefault(true);
    setError(null);
    try {
      await adminApi.updateDefaultDiscount(Number(defaultVal), defaultReason || 'Default platform rate adjustment');
      setSuccessMsg(`Default contractor discount updated to ${defaultVal}%.`);
      setIsEditingDefault(false);
      loadDiscounts();
    } catch (err) {
      setError(err?.message || 'Failed to update default discount.');
    } finally {
      setSavingDefault(false);
    }
  };

  const handleOpenOverride = (c) => {
    setSelectedContractor(c);
    setCustomDiscount(c.customDiscount !== undefined ? c.customDiscount : defaultVal);
    setOverrideReason('');
  };

  const handleSaveOverride = async () => {
    if (!selectedContractor) return;
    setSavingOverride(true);
    setError(null);
    try {
      await adminApi.setContractorDiscount(
        selectedContractor._id,
        Number(customDiscount),
        overrideReason || `Tier incentive based on ${selectedContractor.completedProjects || 0} completed projects`
      );
      setSuccessMsg(`Custom discount set to ${customDiscount}% for ${selectedContractor.name}.`);
      setSelectedContractor(null);
      loadDiscounts();
    } catch (err) {
      setError(err?.message || 'Failed to set custom discount.');
    } finally {
      setSavingOverride(false);
    }
  };

  const getRecommendedDiscount = (completedJobs) => {
    const jobs = completedJobs || 0;
    if (jobs >= 16) return { rate: 15, tier: 'Platinum Tier (16+ Projects)' };
    if (jobs >= 6) return { rate: 12, tier: 'Gold Tier (6–15 Projects)' };
    return { rate: 10, tier: 'Standard Tier (0–5 Projects)' };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Discounts Management</h1>
          <p style={styles.subtitle}>
            Administer global contractor margins, individual discount incentives based on completed projects, and audit logs.
          </p>
        </div>
      </div>

      {/* Alerts */}
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

      {/* Global Default Contractor Discount Card */}
      <div style={styles.defaultCard}>
        <div style={styles.defaultCardContent}>
          <div style={styles.defaultIconPill}>%</div>
          <div>
            <div style={styles.defaultSub}>Global Platform Standard</div>
            <h2 style={styles.defaultTitle}>Default Contractor Discount: {data?.defaultDiscount ?? 10}%</h2>
            <p style={styles.defaultDesc}>
              Automatically subtracted from materials and services on all verified contractor estimates unless an individual override is configured.
            </p>
          </div>
        </div>

        <div>
          {!isEditingDefault ? (
            <button onClick={() => setIsEditingDefault(true)} style={styles.btnOutlineWhite}>
              Edit Default Rate
            </button>
          ) : (
            <div style={styles.editDefaultBox}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={defaultVal}
                  onChange={(e) => setDefaultVal(e.target.value)}
                  style={styles.inputMini}
                />
                <span style={{ color: '#ffffff', fontWeight: 'bold' }}>%</span>
              </div>
              <input
                type="text"
                placeholder="Audit reason..."
                value={defaultReason}
                onChange={(e) => setDefaultReason(e.target.value)}
                style={styles.inputReason}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handleSaveDefault} disabled={savingDefault} style={styles.btnSaveMini}>
                  {savingDefault ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setIsEditingDefault(false)} style={styles.btnCancelMini}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contractor Overrides Roster */}
      <div style={styles.card}>
        <div style={styles.cardHeaderFlex}>
          <div>
            <h3 style={styles.cardTitle}>Individual Contractor Discounts</h3>
            <p style={styles.cardSub}>
              Evaluate completed project counts and assign custom volume discount overrides.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={styles.loaderBox}>
            <div style={styles.spinner} />
            <span>Loading contractor policies...</span>
          </div>
        ) : !data?.contractors || data.contractors.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyTitle}>No verified contractors registered</p>
            <p style={styles.emptySub}>Approved contractors will appear here with project stats.</p>
          </div>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Contractor / Company</th>
                  <th style={styles.th}>Completed Projects</th>
                  <th style={styles.th}>Performance Tier</th>
                  <th style={styles.th}>Current Discount</th>
                  <th style={styles.th}>Discount Status</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.contractors.map((c) => {
                  const rec = getRecommendedDiscount(c.completedProjects);
                  const isCustom = c.customDiscount !== undefined && c.customDiscount !== null;
                  return (
                    <tr key={c._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{c.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{c.companyName || c.email}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.jobsBadge}>{c.completedProjects || 0} Projects</span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{rec.tier}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Benchmark: {rec.rate}%</div>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: '#1d4ed8' }}>
                          {isCustom ? `${c.customDiscount}%` : `${data.defaultDiscount || 10}% (Default)`}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {isCustom ? (
                          <span style={styles.overridePill}>CUSTOM OVERRIDE</span>
                        ) : (
                          <span style={styles.defaultPill}>SYSTEM DEFAULT</span>
                        )}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenOverride(c)}
                          style={styles.actionBtnOutline}
                        >
                          Set Custom Discount
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Discount Audit Trail */}
      <div style={{ ...styles.card, marginTop: '24px' }}>
        <h3 style={styles.cardTitle}>Discount Audit History</h3>
        <p style={styles.cardSub}>Immutable log of all discount adjustments, reasons, and approving administrators.</p>

        {!data?.auditLogs || data.auditLogs.length === 0 ? (
          <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px', margin: '16px 0 0' }}>
            No discount policy changes recorded yet.
          </p>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date & Time</th>
                  <th style={styles.th}>Target</th>
                  <th style={styles.th}>Adjustment</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Admin User</th>
                </tr>
              </thead>
              <tbody>
                {data.auditLogs.map((log, i) => (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        {new Date(log.changedAt || Date.now()).toLocaleString()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong>{log.targetContractorName || 'Global Platform Default'}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: '#b91c1c', textDecoration: 'line-through', marginRight: '6px' }}>
                        {log.oldDiscount}%
                      </span>
                      →
                      <span style={{ color: '#047857', fontWeight: '700', marginLeft: '6px' }}>
                        {log.newDiscount}%
                      </span>
                    </td>
                    <td style={styles.td}>{log.reason || 'Volume adjustment'}</td>
                    <td style={styles.td}>{log.changedBy || 'Admin System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONTRACTOR CUSTOM DISCOUNT MODAL */}
      {selectedContractor && (
        <div style={styles.modalOverlay} onClick={() => setSelectedContractor(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Set Custom Contractor Discount</h3>
              <button onClick={() => setSelectedContractor(null)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.contractorBanner}>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{selectedContractor.name}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{selectedContractor.companyName}</div>
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#1d4ed8', fontWeight: '600' }}>
                  Completed Projects on Record: {selectedContractor.completedProjects || 0}
                </div>
              </div>

              {/* Recommended Tier Card */}
              {(() => {
                const rec = getRecommendedDiscount(selectedContractor.completedProjects);
                return (
                  <div style={styles.tierRecommendationBox}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#047857', textTransform: 'uppercase' }}>
                      System Recommendation
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#065f46', marginTop: '2px' }}>
                      {rec.tier} — Suggested {rec.rate}%
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomDiscount(rec.rate)}
                      style={styles.applyTierBtn}
                    >
                      Apply Suggested {rec.rate}%
                    </button>
                  </div>
                );
              })()}

              <div style={{ marginTop: '16px' }}>
                <label style={styles.inputLabel}>Custom Discount Percentage (%):</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(e.target.value)}
                  style={styles.inputFull}
                />
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={styles.inputLabel}>Justification / Audit Note (Required):</label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Loyalty incentive for reaching 10 completed projects on schedule..."
                  style={styles.textarea}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setSelectedContractor(null)} style={styles.btnSecondary} disabled={savingOverride}>
                Cancel
              </button>
              <button onClick={handleSaveOverride} style={styles.btnPrimary} disabled={savingOverride || !overrideReason.trim()}>
                {savingOverride ? 'Saving...' : 'Confirm Custom Discount'}
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
    padding: '24px 32px',
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  header: {
    marginBottom: '24px',
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
  defaultCard: {
    backgroundColor: '#0a1628',
    borderRadius: '12px',
    padding: '24px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '20px',
    color: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  },
  defaultCardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    maxWidth: '650px',
  },
  defaultIconPill: {
    width: '54px',
    height: '54px',
    borderRadius: '12px',
    backgroundColor: 'rgba(29, 78, 216, 0.4)',
    border: '1px solid #1d4ed8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '800',
    color: '#93c5fd',
    flexShrink: 0,
  },
  defaultSub: {
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: '#93c5fd',
  },
  defaultTitle: {
    margin: '4px 0',
    fontSize: '20px',
    fontWeight: '700',
  },
  defaultDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#cbd5e1',
    lineHeight: 1.4,
  },
  btnOutlineWhite: {
    padding: '10px 18px',
    backgroundColor: 'transparent',
    border: '1px solid #94a3b8',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  editDefaultBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: '12px',
    borderRadius: '8px',
  },
  inputMini: {
    width: '60px',
    padding: '6px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    fontWeight: 'bold',
    outline: 'none',
  },
  inputReason: {
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    outline: 'none',
  },
  btnSaveMini: {
    padding: '6px 12px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnCancelMini: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#e2e8f0',
    border: '1px solid #64748b',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
  },
  cardHeaderFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardTitle: {
    margin: '0 0 4px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSub: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 14px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px',
    fontSize: '14px',
    color: '#1e293b',
    verticalAlign: 'middle',
  },
  jobsBadge: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
  },
  overridePill: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
  },
  defaultPill: {
    backgroundColor: '#f8fafc',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
  },
  actionBtnOutline: {
    padding: '6px 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
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
  loaderBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 0',
    gap: '12px',
    color: '#64748b',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#1d4ed8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '48px 0',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#334155',
    margin: '12px 0 4px',
  },
  emptySub: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
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
    zIndex: 1000,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
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
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#64748b',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '24px',
  },
  contractorBanner: {
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  tierRecommendationBox: {
    marginTop: '16px',
    padding: '14px',
    backgroundColor: '#ecfdf5',
    borderRadius: '8px',
    border: '1px solid #a7f3d0',
  },
  applyTierBtn: {
    marginTop: '8px',
    padding: '4px 10px',
    backgroundColor: '#047857',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  inputLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px',
  },
  inputFull: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  btnPrimary: {
    padding: '8px 18px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
  },
};

