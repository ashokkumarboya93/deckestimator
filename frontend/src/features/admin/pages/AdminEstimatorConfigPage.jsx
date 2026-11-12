// =============================================
// Deck Estimator — Admin Estimator Configuration Page
// =============================================
// Features:
// - 2 horizontal tabs: Input Fields & Dependencies
// - Input Fields: Field key, Label, Input Type, Required, Order, Active toggle, Add/Edit Field Modal, Delete
// - Dependencies: Dynamic rule engine (If Field X equals Value Y, perform Action on Target Field), Add/Edit Modal, Delete
// - Directly backed by MongoDB via adminApi

import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { toast } from '../../../utils/toast';

const TABS = [
  { id: 'fields', label: 'Estimator Form Fields' },
  { id: 'dependencies', label: 'Conditional Dependencies' },
];

export default function AdminEstimatorConfigPage() {
  const [activeTab, setActiveTab] = useState('fields');
  const [fields, setFields] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Field Modal State
  const [fieldModal, setFieldModal] = useState({
    open: false,
    isEdit: false,
    data: {
      fieldKey: '',
      label: '',
      fieldType: 'number',
      section: 'dimensions',
      required: false,
      unit: '',
      minValue: '',
      maxValue: '',
      defaultValue: '',
      order: 10,
      active: true,
    },
  });

  // Dependency Modal State
  const [depModal, setDepModal] = useState({
    open: false,
    isEdit: false,
    data: {
      sourceField: '',
      condition: 'equals',
      conditionValue: '',
      targetField: '',
      action: 'show',
      active: true,
    },
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'fields') {
        const res = await adminApi.getEstimatorFields();
        setFields(res.data || []);
      } else {
        const res = await adminApi.getEstimatorDependencies();
        setDependencies(res.data || []);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load configuration.');
    } finally {
      setLoading(false);
    }
  };

  // FIELD HANDLERS
  const handleOpenAddField = () => {
    setFieldModal({
      open: true,
      isEdit: false,
      data: {
        fieldKey: '',
        label: '',
        fieldType: 'number',
        section: 'dimensions',
        required: false,
        unit: 'ft',
        minValue: '',
        maxValue: '',
        defaultValue: '',
        order: (fields.length + 1) * 10,
        active: true,
      },
    });
  };

  const handleOpenEditField = (f) => {
    setFieldModal({
      open: true,
      isEdit: true,
      data: { ...f },
    });
  };

  const handleSaveField = async () => {
    if (!fieldModal.data.fieldKey || !fieldModal.data.label) {
      toast.warning('Field Key and Label are required.');
      return;
    }
    setSaving(true);
    try {
      await adminApi.saveEstimatorField(fieldModal.data, fieldModal.isEdit ? fieldModal.data._id : null);
      setSuccessMsg(`Field "${fieldModal.data.label}" saved successfully.`);
      setFieldModal({ open: false, isEdit: false, data: {} });
      loadData();
    } catch (err) {
      setError(err?.message || 'Failed to save field.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = async (f) => {
    if (!window.confirm(`Delete field "${f.label}"?`)) return;
    setLoading(true);
    try {
      await adminApi.deleteEstimatorField(f._id);
      setSuccessMsg(`Field "${f.label}" deleted.`);
      loadData();
    } catch (err) {
      setError(err?.message || 'Failed to delete field.');
      setLoading(false);
    }
  };

  // DEPENDENCY HANDLERS
  const handleOpenAddDependency = () => {
    setDepModal({
      open: true,
      isEdit: false,
      data: {
        sourceField: fields[0]?.fieldKey || '',
        condition: 'equals',
        conditionValue: '',
        targetField: fields[1]?.fieldKey || '',
        action: 'show',
        active: true,
      },
    });
  };

  const handleOpenEditDependency = (d) => {
    setDepModal({
      open: true,
      isEdit: true,
      data: { ...d },
    });
  };

  const handleSaveDependency = async () => {
    if (!depModal.data.sourceField || !depModal.data.targetField) {
      toast.warning('Source and target fields are required.');
      return;
    }
    setSaving(true);
    try {
      await adminApi.saveEstimatorDependency(depModal.data, depModal.isEdit ? depModal.data._id : null);
      setSuccessMsg('Conditional dependency rule saved.');
      setDepModal({ open: false, isEdit: false, data: {} });
      loadData();
    } catch (err) {
      setError(err?.message || 'Failed to save dependency.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDependency = async (d) => {
    if (!window.confirm('Delete this dependency rule?')) return;
    setLoading(true);
    try {
      await adminApi.deleteEstimatorDependency(d._id);
      setSuccessMsg('Dependency rule removed.');
      loadData();
    } catch (err) {
      setError(err?.message || 'Failed to delete dependency.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Estimator Configuration</h1>
          <p style={styles.subtitle}>
            Architect the customer and contractor estimation forms, field requirements, units, and dynamic conditional rules.
          </p>
        </div>
        <div>
          {activeTab === 'fields' ? (
            <button onClick={handleOpenAddField} style={styles.btnPrimary}>
              + Add Estimator Field
            </button>
          ) : (
            <button onClick={handleOpenAddDependency} style={styles.btnPrimary}>
              + Add Dependency Rule
            </button>
          )}
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

      {/* Tabs */}
      <div style={styles.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === t.id ? styles.tabBtnActive : {}),
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Card Body */}
      <div style={styles.card}>
        {loading ? (
          <div style={styles.loaderBox}>
            <div style={styles.spinner} />
            <span>Loading estimator configuration...</span>
          </div>
        ) : activeTab === 'fields' ? (
          /* FIELDS TABLE */
          fields.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyTitle}>No estimator fields defined</p>
              <p style={styles.emptySub}>Click "+ Add Estimator Field" to set up input fields.</p>
            </div>
          ) : (
            <div className="drp-table-wrap" style={styles.tableResponsive}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Field Key</th>
                    <th style={styles.th}>Label</th>
                    <th style={styles.th}>Section</th>
                    <th style={styles.th}>Input Type</th>
                    <th style={styles.th}>Required</th>
                    <th style={styles.th}>Order</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f) => (
                    <tr key={f._id} style={styles.tr}>
                      <td style={styles.td}>
                        <code style={styles.codeBadge}>{f.fieldKey}</code>
                      </td>
                      <td style={styles.td}>
                        <strong>{f.label}</strong>
                        {f.unit && <span style={{ color: '#64748b', fontSize: '12px' }}> ({f.unit})</span>}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.sectionBadge}>{(f.section || 'General').toUpperCase()}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: '13px', color: '#0f172a' }}>{f.fieldType}</span>
                      </td>
                      <td style={styles.td}>
                        {f.required ? (
                          <span style={{ color: '#b91c1c', fontWeight: '700', fontSize: '12px' }}>YES</span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Optional</span>
                        )}
                      </td>
                      <td style={styles.td}>{f.order ?? 10}</td>
                      <td style={styles.td}>
                        {f.active !== false ? (
                          <span style={styles.activePill}>ACTIVE</span>
                        ) : (
                          <span style={styles.inactivePill}>DISABLED</span>
                        )}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={styles.actionButtonGroup}>
                          <button
                            onClick={() => handleOpenEditField(f)}
                            style={styles.actionBtnOutline}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteField(f)}
                            style={styles.actionBtnDanger}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* DEPENDENCIES TABLE */
          dependencies.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.emptyTitle}>No conditional dependency rules</p>
              <p style={styles.emptySub}>Define dynamic logic e.g., show/hide fields based on material or condition.</p>
            </div>
          ) : (
            <div className="drp-table-wrap" style={styles.tableResponsive}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Source Field</th>
                    <th style={styles.th}>Condition</th>
                    <th style={styles.th}>Trigger Value</th>
                    <th style={styles.th}>Target Field</th>
                    <th style={styles.th}>Applied Action</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dependencies.map((d) => (
                    <tr key={d._id} style={styles.tr}>
                      <td style={styles.td}>
                        <code style={styles.codeBadge}>{d.sourceField}</code>
                      </td>
                      <td style={styles.td}>{d.condition || 'equals'}</td>
                      <td style={styles.td}>
                        <strong>"{d.conditionValue}"</strong>
                      </td>
                      <td style={styles.td}>
                        <code style={styles.codeBadge}>{d.targetField}</code>
                      </td>
                      <td style={styles.td}>
                        <span style={getActionBadge(d.action)}>{(d.action || 'show').toUpperCase()}</span>
                      </td>
                      <td style={styles.td}>
                        {d.active !== false ? (
                          <span style={styles.activePill}>ACTIVE</span>
                        ) : (
                          <span style={styles.inactivePill}>DISABLED</span>
                        )}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={styles.actionButtonGroup}>
                          <button
                            onClick={() => handleOpenEditDependency(d)}
                            style={styles.actionBtnOutline}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteDependency(d)}
                            style={styles.actionBtnDanger}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* ADD / EDIT FIELD MODAL */}
      {fieldModal.open && (
        <div className="drp-modal-overlay" role="dialog" aria-modal="true" style={styles.modalOverlay} onClick={() => setFieldModal({ open: false, isEdit: false, data: {} })}>
          <div className="drp-modal-card" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{fieldModal.isEdit ? 'Edit Estimator Field' : 'Add New Estimator Field'}</h3>
              <button onClick={() => setFieldModal({ open: false, isEdit: false, data: {} })} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div className="drp-grid-collapse" style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Field Key (Unique Identifier)</label>
                  <input
                    type="text"
                    disabled={fieldModal.isEdit}
                    placeholder="e.g. deck_length"
                    value={fieldModal.data.fieldKey || ''}
                    onChange={(e) => setFieldModal({ ...fieldModal, data: { ...fieldModal.data, fieldKey: e.target.value } })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Display Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Deck Length"
                    value={fieldModal.data.label || ''}
                    onChange={(e) => setFieldModal({ ...fieldModal, data: { ...fieldModal.data, label: e.target.value } })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div className="drp-grid-collapse" style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Section</label>
                  <select
                    value={fieldModal.data.section || 'dimensions'}
                    onChange={(e) => setFieldModal({ ...fieldModal, data: { ...fieldModal.data, section: e.target.value } })}
                    style={styles.select}
                  >
                    <option value="dimensions">Dimensions</option>
                    <option value="materials">Materials & Wood</option>
                    <option value="condition">Condition & Prep</option>
                    <option value="finishes">Finishes & Coatings</option>
                    <option value="addons">Add-ons & Extras</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Input Type</label>
                  <select
                    value={fieldModal.data.fieldType || 'number'}
                    onChange={(e) => setFieldModal({ ...fieldModal, data: { ...fieldModal.data, fieldType: e.target.value } })}
                    style={styles.select}
                  >
                    <option value="number">Number</option>
                    <option value="select">Dropdown Select</option>
                    <option value="radio">Radio Buttons</option>
                    <option value="text">Text Input</option>
                    <option value="boolean">Toggle / Checkbox</option>
                  </select>
                </div>
              </div>

              <div className="drp-grid-collapse" style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Unit of Measure (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ft, sq ft, linear ft"
                    value={fieldModal.data.unit || ''}
                    onChange={(e) => setFieldModal({ ...fieldModal, data: { ...fieldModal.data, unit: e.target.value } })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Sort Order</label>
                  <input
                    type="number"
                    value={fieldModal.data.order ?? 10}
                    onChange={(e) => setFieldModal({ ...fieldModal, data: { ...fieldModal.data, order: Number(e.target.value) } })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={fieldModal.data.required || false}
                    onChange={(e) => setFieldModal({ ...fieldModal, data: { ...fieldModal.data, required: e.target.checked } })}
                  />
                  <strong>Required Field</strong>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={fieldModal.data.active !== false}
                    onChange={(e) => setFieldModal({ ...fieldModal, data: { ...fieldModal.data, active: e.target.checked } })}
                  />
                  <strong>Active in Estimator</strong>
                </label>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setFieldModal({ open: false, isEdit: false, data: {} })} style={styles.btnSecondary} disabled={saving}>
                Cancel
              </button>
              <button onClick={handleSaveField} style={styles.btnPrimary} disabled={saving}>
                {saving ? 'Saving...' : 'Save Field'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT DEPENDENCY MODAL */}
      {depModal.open && (
        <div className="drp-modal-overlay" role="dialog" aria-modal="true" style={styles.modalOverlay} onClick={() => setDepModal({ open: false, isEdit: false, data: {} })}>
          <div className="drp-modal-card" style={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{depModal.isEdit ? 'Edit Dependency Rule' : 'New Conditional Rule'}</h3>
              <button onClick={() => setDepModal({ open: false, isEdit: false, data: {} })} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Source Field</label>
                <input
                  type="text"
                  placeholder="e.g. wood_species"
                  value={depModal.data.sourceField || ''}
                  onChange={(e) => setDepModal({ ...depModal, data: { ...depModal.data, sourceField: e.target.value } })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Condition Operator</label>
                <select
                  value={depModal.data.condition || 'equals'}
                  onChange={(e) => setDepModal({ ...depModal, data: { ...depModal.data, condition: e.target.value } })}
                  style={styles.select}
                >
                  <option value="equals">Equals (===)</option>
                  <option value="not_equals">Does Not Equal (!==)</option>
                  <option value="greater_than">Greater Than (&gt;)</option>
                  <option value="contains">Contains</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Trigger Value</label>
                <input
                  type="text"
                  placeholder="e.g. cedar or true"
                  value={depModal.data.conditionValue || ''}
                  onChange={(e) => setDepModal({ ...depModal, data: { ...depModal.data, conditionValue: e.target.value } })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Target Field</label>
                <input
                  type="text"
                  placeholder="e.g. special_sealant"
                  value={depModal.data.targetField || ''}
                  onChange={(e) => setDepModal({ ...depModal, data: { ...depModal.data, targetField: e.target.value } })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Action on Target</label>
                <select
                  value={depModal.data.action || 'show'}
                  onChange={(e) => setDepModal({ ...depModal, data: { ...depModal.data, action: e.target.value } })}
                  style={styles.select}
                >
                  <option value="show">Show Field</option>
                  <option value="hide">Hide Field</option>
                  <option value="require">Make Field Required</option>
                  <option value="disable">Disable Field</option>
                </select>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setDepModal({ open: false, isEdit: false, data: {} })} style={styles.btnSecondary} disabled={saving}>
                Cancel
              </button>
              <button onClick={handleSaveDependency} style={styles.btnPrimary} disabled={saving}>
                {saving ? 'Saving...' : 'Save Dependency'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getActionBadge(action) {
  const base = {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
  };
  if (action === 'hide') return { ...base, backgroundColor: '#fef2f2', color: '#b91c1c' };
  if (action === 'require') return { ...base, backgroundColor: '#fffbeb', color: '#b45309' };
  return { ...base, backgroundColor: '#ecfdf5', color: '#047857' };
}

const styles = {
  container: {
    padding: '24px 32px',
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  header: {
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
  btnPrimary: {
    padding: '8px 18px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '13px',
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
  tabBar: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '20px',
  },
  tabBtn: {
    padding: '10px 18px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    marginBottom: '-2px',
  },
  tabBtnActive: {
    color: '#1d4ed8',
    borderBottom: '2px solid #1d4ed8',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
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
  codeBadge: {
    fontFamily: 'monospace',
    fontSize: '12px',
    backgroundColor: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#1e293b',
  },
  sectionBadge: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#f8fafc',
    color: '#475569',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
  },
  activePill: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  inactivePill: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  actionButtonGroup: {
    display: 'inline-flex',
    gap: '6px',
  },
  actionBtnOutline: {
    padding: '5px 10px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
  },
  actionBtnDanger: {
    padding: '5px 10px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#b91c1c',
    cursor: 'pointer',
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
    maxWidth: '560px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalContentSmall: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '440px',
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
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '14px',
  },
  inputLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
};

