// =============================================
// Deck Estimator — Admin Services Tab
// =============================================

import React, { useState, useEffect } from 'react';
import {
  getServices,
  getServiceCategories,
  createService,
  updateService,
  toggleServiceStatus,
} from '../api/catalogApi';

const SERVICE_TYPES = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'preparation', label: 'Preparation' },
  { value: 'repair', label: 'Repair' },
  { value: 'staining', label: 'Staining' },
  { value: 'painting', label: 'Painting' },
  { value: 'coating', label: 'Coating' },
  { value: 'sealing', label: 'Sealing' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Other' },
];

const MEASUREMENT_UNITS = [
  { value: 'square_foot', label: 'Square Foot (sqft)' },
  { value: 'square_meter', label: 'Square Meter (sqm)' },
  { value: 'linear_foot', label: 'Linear Foot (lnft)' },
  { value: 'linear_meter', label: 'Linear Meter (lnm)' },
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'piece', label: 'Piece' },
  { value: 'fixed_job', label: 'Fixed Job' },
];

export default function ServicesTab() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    serviceName: '',
    serviceCode: '',
    categoryId: '',
    serviceType: 'cleaning',
    description: '',
    measurementUnit: 'square_foot',
    estimatedDuration: '',
    durationUnit: 'hour',
    laborNotes: '',
    requiredEquipment: '',
    preparationInstructions: '',
    safetyNotes: '',
    status: 'active',
  });

  useEffect(() => {
    loadCategories();
    loadServices(1);
  }, []);

  async function loadCategories() {
    try {
      const data = await getServiceCategories({ limit: 100 });
      setCategories(data.categories || []);
    } catch {
      // Ignored non-fatal
    }
  }

  async function loadServices(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await getServices({
        page,
        limit: 10,
        search,
        categoryId: categoryFilter || undefined,
        serviceType: typeFilter || undefined,
      });
      setServices(data.services || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  }

  function handleFilterSubmit(e) {
    e.preventDefault();
    loadServices(1);
  }

  function handleClearFilters() {
    setSearch('');
    setCategoryFilter('');
    setTypeFilter('');
    setTimeout(() => {
      loadServices(1);
    }, 0);
  }

  function openCreateModal() {
    setEditingService(null);
    setFormData({
      serviceName: '',
      serviceCode: '',
      categoryId: categories.length > 0 ? categories[0].id || categories[0]._id : '',
      serviceType: 'cleaning',
      description: '',
      measurementUnit: 'square_foot',
      estimatedDuration: '',
      durationUnit: 'hour',
      laborNotes: '',
      requiredEquipment: '',
      preparationInstructions: '',
      safetyNotes: '',
      status: 'active',
    });
    setModalError(null);
    setIsModalOpen(true);
  }

  function openEditModal(srv) {
    setEditingService(srv);
    setFormData({
      serviceName: srv.serviceName || '',
      serviceCode: srv.serviceCode || '',
      categoryId: srv.categoryId?.id || srv.categoryId?._id || srv.categoryId || '',
      serviceType: srv.serviceType || 'cleaning',
      description: srv.description || '',
      measurementUnit: srv.measurement?.unit || 'square_foot',
      estimatedDuration: srv.operationalDetails?.estimatedDuration || '',
      durationUnit: srv.operationalDetails?.durationUnit || 'hour',
      laborNotes: srv.operationalDetails?.laborNotes || '',
      requiredEquipment: (srv.operationalDetails?.requiredEquipment || []).join(', '),
      preparationInstructions: srv.operationalDetails?.preparationInstructions || '',
      safetyNotes: srv.operationalDetails?.safetyNotes || '',
      status: srv.status || 'active',
    });
    setModalError(null);
    setIsModalOpen(true);
  }

  async function handleModalSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    const equipmentArray = formData.requiredEquipment
      ? formData.requiredEquipment.split(',').map((item) => item.trim()).filter(Boolean)
      : [];

    const payload = {
      serviceName: formData.serviceName,
      categoryId: formData.categoryId,
      serviceType: formData.serviceType,
      description: formData.description,
      measurement: {
        unit: formData.measurementUnit,
      },
      operationalDetails: {
        estimatedDuration: formData.estimatedDuration !== '' ? Number(formData.estimatedDuration) : null,
        durationUnit: formData.durationUnit,
        laborNotes: formData.laborNotes,
        requiredEquipment: equipmentArray,
        preparationInstructions: formData.preparationInstructions,
        safetyNotes: formData.safetyNotes,
      },
      status: formData.status,
    };

    if (!editingService && formData.serviceCode.trim()) {
      payload.serviceCode = formData.serviceCode.trim().toUpperCase();
    }

    try {
      if (editingService) {
        await updateService(editingService.id || editingService._id, payload);
        setSuccessMsg(`Service "${formData.serviceName}" updated successfully.`);
      } else {
        await createService(payload);
        setSuccessMsg(`Service "${formData.serviceName}" created successfully.`);
      }
      setIsModalOpen(false);
      loadServices(pagination.page);
    } catch (err) {
      setModalError(err.message || 'Failed to save service.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(srv) {
    const currentStatus = srv.status || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await toggleServiceStatus(srv.id || srv._id, newStatus);
      setSuccessMsg(`Service "${srv.serviceName}" status changed to ${newStatus}.`);
      loadServices(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to update service status.');
    }
  }

  return (
    <div>
      {/* Search & Filter Bar */}
      <div style={styles.topBar}>
        <form onSubmit={handleFilterSubmit} style={styles.filterForm}>
          <input
            type="text"
            placeholder="Search by service name, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Service Types</option>
            {SERVICE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <button type="submit" style={styles.searchBtn}>Filter</button>
          <button type="button" onClick={handleClearFilters} style={styles.clearBtn}>
            Reset
          </button>
        </form>

        <button type="button" onClick={openCreateModal} style={styles.addBtn}>
          + Add Service
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
        <div style={styles.emptyBox}>Loading services catalog...</div>
      ) : services.length === 0 ? (
        <div style={styles.emptyBox}>
          <p>No services found matching your filters.</p>
          <button type="button" onClick={openCreateModal} style={styles.addBtn}>
            Add a service to catalog
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Service Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Unit</th>
                <th style={styles.th}>Est. Duration</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((srv) => {
                const isActive = srv.status === 'active';
                return (
                  <tr key={srv.id || srv._id} style={styles.tr}>
                    <td style={styles.td}>
                      <code style={styles.code}>{srv.serviceCode}</code>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600, color: '#111' }}>{srv.serviceName}</div>
                      {srv.description && (
                        <div style={{ fontSize: '12px', color: '#666', maxWidth: '280px' }}>
                          {srv.description}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.categoryBadge}>
                        {srv.categoryId?.name || 'General'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.typeBadge}>
                        {srv.serviceType}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ textTransform: 'capitalize' }}>
                        {srv.measurement?.unit?.replace('_', ' ') || 'square_foot'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {srv.operationalDetails?.estimatedDuration ? (
                        <span>
                          {srv.operationalDetails.estimatedDuration} {srv.operationalDetails.durationUnit}(s)
                        </span>
                      ) : (
                        <span style={{ color: '#999' }}>—</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={isActive ? styles.statusActive : styles.statusInactive}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button
                          type="button"
                          onClick={() => openEditModal(srv)}
                          style={styles.editBtn}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(srv)}
                          style={isActive ? styles.deactivateBtn : styles.activateBtn}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={styles.paginationRow}>
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => loadServices(pagination.page - 1)}
            style={pagination.page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
          >
            ← Previous
          </button>
          <span style={styles.pageInfo}>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} services)
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => loadServices(pagination.page + 1)}
            style={pagination.page >= pagination.totalPages ? styles.pageBtnDisabled : styles.pageBtn}
          >
            Next →
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentLarge}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingService ? `Edit Service (${editingService.serviceCode})` : 'Add New Service'}
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

            <form onSubmit={handleModalSubmit} style={styles.modalFormScrollable}>
              {/* Section 1: Identification */}
              <h4 style={styles.sectionHeader}>1. Service Identification</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Service Name <span style={{ color: '#d9534f' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. High Pressure Deck Power Wash"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Service Code {!editingService && '(Auto-generated if blank)'}
                  </label>
                  <input
                    type="text"
                    disabled={!!editingService}
                    placeholder="e.g. SRV-PW-001"
                    value={formData.serviceCode}
                    onChange={(e) => setFormData({ ...formData, serviceCode: e.target.value })}
                    style={editingService ? styles.inputDisabled : styles.input}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Category <span style={{ color: '#d9534f' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    style={styles.select}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id || c._id} value={c.id || c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Service Type <span style={{ color: '#d9534f' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    style={styles.select}
                  >
                    {SERVICE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  rows="2"
                  placeholder="Scope of work, standard operational procedures..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={styles.textarea}
                />
              </div>

              {/* Section 2: Measurement */}
              <h4 style={styles.sectionHeader}>2. Unit & Operational Measurement</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Measurement Unit</label>
                  <select
                    value={formData.measurementUnit}
                    onChange={(e) => setFormData({ ...formData, measurementUnit: e.target.value })}
                    style={styles.select}
                  >
                    {MEASUREMENT_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Estimated Duration</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 1.5"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Duration Unit</label>
                  <select
                    value={formData.durationUnit}
                    onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                    style={styles.select}
                  >
                    <option value="minute">Minutes</option>
                    <option value="hour">Hours</option>
                    <option value="day">Days</option>
                  </select>
                </div>
              </div>

              {/* Section 3: Equipment & Safety */}
              <h4 style={styles.sectionHeader}>3. Equipment & Safety Requirements</h4>
              <div style={styles.formGroup}>
                <label style={styles.label}>Required Equipment (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Pressure Washer, Rotary Disc Cleaner, Extension Wands"
                  value={formData.requiredEquipment}
                  onChange={(e) => setFormData({ ...formData, requiredEquipment: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Preparation Instructions</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Clear deck furniture, protect surrounding plants..."
                    value={formData.preparationInstructions}
                    onChange={(e) => setFormData({ ...formData, preparationInstructions: e.target.value })}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Safety Notes</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Wear eye protection and non-slip footwear..."
                    value={formData.safetyNotes}
                    onChange={(e) => setFormData({ ...formData, safetyNotes: e.target.value })}
                    style={styles.textarea}
                  />
                </div>
              </div>

              {/* Status */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={styles.select}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
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
                  {submitting ? 'Saving...' : editingService ? 'Save Changes' : 'Create Service'}
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
  searchInput: {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    width: '240px',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    background: '#fff',
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
    background: '#f0f0f0',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '12px',
    fontFamily: 'monospace',
    fontWeight: 600,
  },
  categoryBadge: {
    background: '#ede7f6',
    color: '#512da8',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
  },
  typeBadge: {
    background: '#e0f2f1',
    color: '#00796b',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  statusActive: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
  },
  statusInactive: {
    background: '#fafafa',
    color: '#757575',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    border: '1px solid #ddd',
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
  activateBtn: {
    padding: '4px 8px',
    background: '#e8f5e9',
    color: '#2e7d32',
    border: '1px solid #a5d6a7',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deactivateBtn: {
    padding: '4px 8px',
    background: '#fff3e0',
    color: '#e65100',
    border: '1px solid #ffcc80',
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
  modalContentLarge: {
    background: '#fff',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '720px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
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
  modalFormScrollable: {
    padding: '20px',
    overflowY: 'auto',
  },
  sectionHeader: {
    margin: '16px 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1976d2',
    borderBottom: '1px solid #eee',
    paddingBottom: '4px',
  },
  formGroup: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '6px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  inputDisabled: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    background: '#f9f9f9',
    color: '#888',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    cursor: 'not-allowed',
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
