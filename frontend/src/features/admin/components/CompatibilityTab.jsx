// =============================================
// Deck Estimator — Admin Compatibility Matrix Tab
// =============================================

import React, { useState, useEffect } from 'react';
import {
  getCompatibilities,
  getMaterials,
  getServices,
  createCompatibility,
  updateCompatibility,
  deleteCompatibility,
} from '../api/catalogApi';

const COMPATIBILITY_STATUSES = [
  { value: 'compatible', label: 'Compatible', color: '#2e7d32', bg: '#e8f5e9' },
  { value: 'incompatible', label: 'Incompatible', color: '#c62828', bg: '#ffebee' },
  { value: 'requires_review', label: 'Requires Review', color: '#f57f17', bg: '#fffde7' },
];

export default function CompatibilityTab() {
  const [compatibilities, setCompatibilities] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters
  const [materialFilter, setMaterialFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    materialId: '',
    serviceId: '',
    compatibilityStatus: 'compatible',
    compatibilityNotes: '',
  });

  useEffect(() => {
    loadSelectors();
    loadCompatibilities(1);
  }, []);

  async function loadSelectors() {
    try {
      const [matData, srvData] = await Promise.all([
        getMaterials({ limit: 100 }),
        getServices({ limit: 100 }),
      ]);
      setMaterials(matData.materials || []);
      setServices(srvData.services || []);
    } catch {
      // Ignored non-fatal
    }
  }

  async function loadCompatibilities(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompatibilities({
        page,
        limit: 10,
        materialId: materialFilter || undefined,
        serviceId: serviceFilter || undefined,
        compatibilityStatus: statusFilter || undefined,
      });
      setCompatibilities(data.compatibilities || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load compatibility records.');
    } finally {
      setLoading(false);
    }
  }

  function handleFilterSubmit(e) {
    e.preventDefault();
    loadCompatibilities(1);
  }

  function handleClearFilters() {
    setMaterialFilter('');
    setServiceFilter('');
    setStatusFilter('');
    setTimeout(() => {
      loadCompatibilities(1);
    }, 0);
  }

  function openCreateModal() {
    setEditingItem(null);
    setFormData({
      materialId: materials.length > 0 ? materials[0].id || materials[0]._id : '',
      serviceId: services.length > 0 ? services[0].id || services[0]._id : '',
      compatibilityStatus: 'compatible',
      compatibilityNotes: '',
    });
    setModalError(null);
    setIsModalOpen(true);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setFormData({
      materialId: item.materialId?.id || item.materialId?._id || item.materialId || '',
      serviceId: item.serviceId?.id || item.serviceId?._id || item.serviceId || '',
      compatibilityStatus: item.compatibilityStatus || 'compatible',
      compatibilityNotes: item.compatibilityNotes || '',
    });
    setModalError(null);
    setIsModalOpen(true);
  }

  async function handleModalSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    try {
      if (editingItem) {
        await updateCompatibility(editingItem.id || editingItem._id, {
          compatibilityStatus: formData.compatibilityStatus,
          compatibilityNotes: formData.compatibilityNotes,
        });
        setSuccessMsg('Compatibility record updated successfully.');
      } else {
        await createCompatibility({
          materialId: formData.materialId,
          serviceId: formData.serviceId,
          compatibilityStatus: formData.compatibilityStatus,
          compatibilityNotes: formData.compatibilityNotes,
        });
        setSuccessMsg('New compatibility link created successfully.');
      }
      setIsModalOpen(false);
      loadCompatibilities(pagination.page);
    } catch (err) {
      setModalError(err.message || 'Failed to save compatibility relationship.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    const matName = item.materialId?.materialName || 'Material';
    const srvName = item.serviceId?.serviceName || 'Service';
    if (!window.confirm(`Are you sure you want to remove compatibility link between "${matName}" and "${srvName}"?`)) {
      return;
    }

    try {
      await deleteCompatibility(item.id || item._id);
      setSuccessMsg('Compatibility relationship removed.');
      loadCompatibilities(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to remove compatibility link.');
    }
  }

  function renderStatusBadge(status) {
    const config = COMPATIBILITY_STATUSES.find((s) => s.value === status) || {
      color: '#555',
      bg: '#eee',
      label: status,
    };
    return (
      <span
        style={{
          background: config.bg,
          color: config.color,
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 600,
          border: `1px solid ${config.color}33`,
          textTransform: 'capitalize',
        }}
      >
        {config.label}
      </span>
    );
  }

  return (
    <div>
      {/* Top Bar with Filters */}
      <div style={styles.topBar}>
        <form onSubmit={handleFilterSubmit} style={styles.filterForm}>
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Materials</option>
            {materials.map((m) => (
              <option key={m.id || m._id} value={m.id || m._id}>
                {m.materialName} ({m.materialCode})
              </option>
            ))}
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Services</option>
            {services.map((s) => (
              <option key={s.id || s._id} value={s.id || s._id}>
                {s.serviceName} ({s.serviceCode})
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Compatibility Statuses</option>
            {COMPATIBILITY_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <button type="submit" style={styles.searchBtn}>Filter</button>
          <button type="button" onClick={handleClearFilters} style={styles.clearBtn}>
            Reset
          </button>
        </form>

        <button type="button" onClick={openCreateModal} style={styles.addBtn}>
          + Link Material & Service
        </button>
      </div>

      {successMsg && (
        <div style={styles.successBanner}>
          {successMsg}
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* Table Content */}
      {loading ? (
        <div style={styles.emptyBox}>Loading compatibility matrix...</div>
      ) : compatibilities.length === 0 ? (
        <div style={styles.emptyBox}>
          <p>No compatibility relationships found matching your filters.</p>
          <button type="button" onClick={openCreateModal} style={styles.addBtn}>
            Create your first compatibility relationship
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Material</th>
                <th style={styles.th}>Service</th>
                <th style={styles.th}>Compatibility Status</th>
                <th style={styles.th}>Operational & Manufacturer Notes</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {compatibilities.map((item) => (
                <tr key={item.id || item._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600, color: '#111' }}>
                      {item.materialId?.materialName || 'Unknown Material'}
                    </div>
                    {item.materialId?.materialCode && (
                      <code style={styles.code}>{item.materialId.materialCode}</code>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600, color: '#111' }}>
                      {item.serviceId?.serviceName || 'Unknown Service'}
                    </div>
                    {item.serviceId?.serviceCode && (
                      <code style={styles.code}>{item.serviceId.serviceCode}</code>
                    )}
                  </td>
                  <td style={styles.td}>
                    {renderStatusBadge(item.compatibilityStatus)}
                  </td>
                  <td style={{ ...styles.td, maxWidth: '320px' }}>
                    {item.compatibilityNotes || <span style={{ color: '#999' }}>—</span>}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionGroup}>
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        style={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        style={styles.deleteBtn}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={styles.paginationRow}>
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => loadCompatibilities(pagination.page - 1)}
            style={pagination.page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
          >
            ← Previous
          </button>
          <span style={styles.pageInfo}>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => loadCompatibilities(pagination.page + 1)}
            style={pagination.page >= pagination.totalPages ? styles.pageBtnDisabled : styles.pageBtn}
          >
            Next →
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingItem ? 'Edit Compatibility Status' : 'Link Material & Service'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            {modalError && <div style={styles.modalErrorBanner}>{modalError}</div>}

            <form onSubmit={handleModalSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Select Material <span style={{ color: '#d9534f' }}>*</span>
                </label>
                <select
                  required
                  disabled={!!editingItem}
                  value={formData.materialId}
                  onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                  style={editingItem ? styles.selectDisabled : styles.select}
                >
                  <option value="">Select Material</option>
                  {materials.map((m) => (
                    <option key={m.id || m._id} value={m.id || m._id}>
                      {m.materialName} ({m.materialCode})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Select Service <span style={{ color: '#d9534f' }}>*</span>
                </label>
                <select
                  required
                  disabled={!!editingItem}
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  style={editingItem ? styles.selectDisabled : styles.select}
                >
                  <option value="">Select Service</option>
                  {services.map((s) => (
                    <option key={s.id || s._id} value={s.id || s._id}>
                      {s.serviceName} ({s.serviceCode})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Compatibility Status <span style={{ color: '#d9534f' }}>*</span>
                </label>
                <select
                  required
                  value={formData.compatibilityStatus}
                  onChange={(e) => setFormData({ ...formData, compatibilityStatus: e.target.value })}
                  style={styles.select}
                >
                  {COMPATIBILITY_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Operational Notes & Manufacturer Guidelines</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Wash deck and allow 48h dry time before stain application. Do not apply in direct midday sun."
                  value={formData.compatibilityNotes}
                  onChange={(e) => setFormData({ ...formData, compatibilityNotes: e.target.value })}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={styles.cancelBtn}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.saveBtn}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Relationship'}
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
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  filterForm: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    background: '#fff',
    maxWidth: '220px',
  },
  searchBtn: {
    padding: '8px 14px',
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  clearBtn: {
    padding: '8px 12px',
    background: '#f5f5f5',
    color: '#555',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  addBtn: {
    padding: '10px 18px',
    background: '#2e7d32',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
  },
  successBanner: {
    padding: '12px 16px',
    background: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '4px',
    marginBottom: '16px',
    border: '1px solid #c8e6c9',
  },
  errorBanner: {
    padding: '12px 16px',
    background: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    marginBottom: '16px',
    border: '1px solid #ffcdd2',
  },
  emptyBox: {
    padding: '40px',
    textAlign: 'center',
    background: '#fafafa',
    border: '1px dashed #ccc',
    borderRadius: '6px',
    color: '#666',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  theadRow: {
    background: '#f8f9fa',
    borderBottom: '2px solid #e0e0e0',
  },
  th: {
    padding: '12px 14px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: '13px',
    color: '#444',
  },
  tr: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '12px 14px',
    fontSize: '13px',
    color: '#333',
    verticalAlign: 'middle',
  },
  code: {
    display: 'inline-block',
    marginTop: '3px',
    background: '#f0f0f0',
    padding: '1px 5px',
    borderRadius: '3px',
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#555',
  },
  actionGroup: {
    display: 'flex',
    gap: '6px',
  },
  editBtn: {
    padding: '4px 8px',
    background: '#e3f2fd',
    color: '#1976d2',
    border: '1px solid #90caf9',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deleteBtn: {
    padding: '4px 8px',
    background: '#ffebee',
    color: '#c62828',
    border: '1px solid #ffcdd2',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '20px',
  },
  pageBtn: {
    padding: '8px 14px',
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  pageBtnDisabled: {
    padding: '8px 14px',
    background: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    color: '#aaa',
    fontSize: '13px',
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: '13px',
    color: '#666',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalContent: {
    background: '#fff',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#222',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#888',
  },
  modalErrorBanner: {
    margin: '16px 20px 0',
    padding: '10px 14px',
    background: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    fontSize: '13px',
  },
  modalForm: {
    padding: '20px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '6px',
    color: '#333',
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    background: '#fff',
  },
  selectDisabled: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    background: '#f9f9f9',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    color: '#888',
    cursor: 'not-allowed',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '20px',
    borderTop: '1px solid #eee',
    paddingTop: '16px',
  },
  cancelBtn: {
    padding: '8px 16px',
    background: '#f5f5f5',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  saveBtn: {
    padding: '8px 18px',
    background: '#2e7d32',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
  },
};
