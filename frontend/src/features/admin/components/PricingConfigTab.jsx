// =============================================
// Deck Estimator — Admin Pricing Configurations Tab
// =============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  getPricingConfigurations,
  createPricingConfiguration,
  updatePricingConfiguration,
  togglePricingConfigurationStatus,
} from '../api/pricingApi';

const DEFAULT_FORM = {
  configurationName: 'Standard Deck Pricing Rules',
  basePricePerSqFt: 0,
  minimumJobPrice: 0,
  laborRate: 0,
  wastePercentage: 10,
  travelCharge: 0,
  taxPercentage: 0,
  taxName: 'Sales Tax',
  additionalCoatingPrice: 0,
  notes: '',
  isActive: true,
};

export default function PricingConfigTab() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPricingConfigurations({ limit: 50 });
      setConfigs(data.configurations || []);
    } catch (err) {
      setError(err.message || 'Failed to load pricing configurations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const openCreateModal = () => {
    setEditingConfig(null);
    setFormData(DEFAULT_FORM);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cfg) => {
    setEditingConfig(cfg);
    setFormData({
      configurationName: cfg.configurationName || '',
      basePricePerSqFt: cfg.basePricePerSqFt ?? 0,
      minimumJobPrice: cfg.minimumJobPrice ?? 0,
      laborRate: cfg.laborRate ?? 0,
      wastePercentage: cfg.wastePercentage ?? 0,
      travelCharge: cfg.travelCharge ?? 0,
      taxPercentage: cfg.taxPercentage ?? 0,
      taxName: cfg.taxName || 'Sales Tax',
      additionalCoatingPrice: cfg.additionalCoatingPrice ?? 0,
      notes: cfg.notes || '',
      isActive: cfg.isActive ?? true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (cfg) => {
    try {
      await togglePricingConfigurationStatus(cfg._id || cfg.id, !cfg.isActive);
      setSuccessMsg(`Configuration "${cfg.configurationName}" status updated.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchConfigs();
    } catch (err) {
      setError(err.message || 'Failed to toggle status.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    const payload = {
      configurationName: formData.configurationName,
      basePricePerSqFt: Number(formData.basePricePerSqFt),
      minimumJobPrice: Number(formData.minimumJobPrice),
      laborRate: Number(formData.laborRate),
      wastePercentage: Number(formData.wastePercentage),
      travelCharge: Number(formData.travelCharge),
      taxPercentage: Number(formData.taxPercentage),
      taxName: formData.taxName,
      additionalCoatingPrice: Number(formData.additionalCoatingPrice),
      notes: formData.notes,
      isActive: formData.isActive,
    };

    try {
      if (editingConfig) {
        await updatePricingConfiguration(editingConfig._id || editingConfig.id, payload);
        setSuccessMsg('Pricing configuration updated successfully.');
      } else {
        await createPricingConfiguration(payload);
        setSuccessMsg('New pricing configuration created successfully.');
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchConfigs();
    } catch (err) {
      setModalError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Tab Header & Action Bar */}
      <div style={styles.actionBar}>
        <div>
          <h2 style={styles.tabHeading}>Pricing Configurations & Calculation Rules</h2>
          <p style={styles.tabSubheading}>
            Configure base square-foot rates, labor allowances, minimum project thresholds, waste margins, and tax rules.
            The calculation engine applies active configurations deterministically.
          </p>
        </div>
        <button type="button" onClick={openCreateModal} style={styles.primaryBtn}>
          + New Pricing Configuration
        </button>
      </div>

      {successMsg && <div style={styles.successBanner}>{successMsg}</div>}
      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* Configurations Table */}
      {loading ? (
        <div style={styles.loadingBox}>Loading pricing rules...</div>
      ) : configs.length === 0 ? (
        <div style={styles.emptyBox}>
          <p>No pricing configurations found.</p>
          <button type="button" onClick={openCreateModal} style={styles.primaryBtn}>
            Create Initial Configuration
          </button>
        </div>
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Configuration Name</th>
                <th style={styles.th}>Base / Sq Ft</th>
                <th style={styles.th}>Labor Rate / Hr</th>
                <th style={styles.th}>Min Job Price</th>
                <th style={styles.th}>Waste %</th>
                <th style={styles.th}>Tax</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((cfg) => {
                const id = cfg._id || cfg.id;
                return (
                  <tr key={id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{cfg.configurationName}</strong>
                      {cfg.notes && <div style={styles.mutedText}>{cfg.notes}</div>}
                    </td>
                    <td style={styles.td}>${Number(cfg.basePricePerSqFt || 0).toFixed(2)}</td>
                    <td style={styles.td}>${Number(cfg.laborRate || 0).toFixed(2)}</td>
                    <td style={styles.td}>${Number(cfg.minimumJobPrice || 0).toFixed(2)}</td>
                    <td style={styles.td}>{cfg.wastePercentage ?? 0}%</td>
                    <td style={styles.td}>
                      {cfg.taxPercentage ? `${cfg.taxPercentage}% (${cfg.taxName || 'Tax'})` : '0%'}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: cfg.isActive ? '#dcfce7' : '#fee2e2',
                          color: cfg.isActive ? '#15803d' : '#b91c1c',
                        }}
                      >
                        {cfg.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionBtnRow}>
                        <button
                          type="button"
                          onClick={() => openEditModal(cfg)}
                          style={styles.editBtn}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cfg)}
                          style={cfg.isActive ? styles.deactivateBtn : styles.activateBtn}
                        >
                          {cfg.isActive ? 'Deactivate' : 'Activate'}
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

      {/* Modal Form */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingConfig ? 'Edit Pricing Configuration' : 'Create Pricing Configuration'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            {modalError && <div style={styles.errorBanner}>{modalError}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Configuration Name *</label>
                <input
                  type="text"
                  required
                  value={formData.configurationName}
                  onChange={(e) => setFormData({ ...formData, configurationName: e.target.value })}
                  style={styles.input}
                  placeholder="e.g. Standard Regional Deck Pricing 2026"
                />
              </div>

              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>Base Price Per Sq Ft ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.basePricePerSqFt}
                    onChange={(e) => setFormData({ ...formData, basePricePerSqFt: e.target.value })}
                    style={styles.input}
                  />
                  <small style={styles.hint}>Baseline area calculation rate</small>
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>Minimum Job Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.minimumJobPrice}
                    onChange={(e) => setFormData({ ...formData, minimumJobPrice: e.target.value })}
                    style={styles.input}
                  />
                  <small style={styles.hint}>Floor price for any completed estimate</small>
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>Labor Rate ($/hr)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.laborRate}
                    onChange={(e) => setFormData({ ...formData, laborRate: e.target.value })}
                    style={styles.input}
                  />
                  <small style={styles.hint}>Applied to service estimated hours</small>
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>Waste Allowance (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.wastePercentage}
                    onChange={(e) => setFormData({ ...formData, wastePercentage: e.target.value })}
                    style={styles.input}
                  />
                  <small style={styles.hint}>Standard cut and margin buffer (e.g. 10%)</small>
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>Travel / Mobilization Charge ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.travelCharge}
                    onChange={(e) => setFormData({ ...formData, travelCharge: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>Additional Coating Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.additionalCoatingPrice}
                    onChange={(e) => setFormData({ ...formData, additionalCoatingPrice: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>Tax Percentage (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.taxPercentage}
                    onChange={(e) => setFormData({ ...formData, taxPercentage: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>Tax Label</label>
                  <input
                    type="text"
                    value={formData.taxName}
                    onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
                    style={styles.input}
                    placeholder="e.g. State Sales Tax"
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Internal Notes / Justification</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={styles.textarea}
                  placeholder="Optional context about this pricing revision..."
                />
              </div>

              <div style={styles.checkboxRow}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Set as active configuration</span>
                </label>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={styles.cancelBtn}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.primaryBtn} disabled={submitting}>
                  {submitting ? 'Saving...' : editingConfig ? 'Save Changes' : 'Create Configuration'}
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
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  tabHeading: {
    fontSize: '20px',
    fontWeight: 700,
    margin: '0 0 4px 0',
    color: '#1e293b',
  },
  tabSubheading: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    maxWidth: '750px',
  },
  primaryBtn: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '6px',
    fontSize: '14px',
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
  errorBanner: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  loadingBox: {
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
  },
  emptyBox: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
    color: '#64748b',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    overflowX: 'auto',
    border: '1px solid #e2e8f0',
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
    padding: '12px 16px',
    fontWeight: 600,
    color: '#475569',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 16px',
    color: '#1e293b',
    verticalAlign: 'middle',
  },
  mutedText: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block',
  },
  actionBtnRow: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    padding: '5px 12px',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  activateBtn: {
    padding: '5px 12px',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    border: '1px solid #86efac',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  deactivateBtn: {
    padding: '5px 12px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fca5a5',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
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
    maxWidth: '650px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
    color: '#0f172a',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#64748b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  col: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#334155',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  textarea: {
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  hint: {
    fontSize: '11px',
    color: '#64748b',
  },
  checkboxRow: {
    paddingTop: '4px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '16px',
  },
  cancelBtn: {
    padding: '9px 18px',
    backgroundColor: '#ffffff',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

