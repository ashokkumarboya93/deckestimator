// =============================================
// Deck Estimator — Admin Materials Tab
// =============================================

import React, { useState, useEffect } from 'react';
import {
  getMaterials,
  getMaterialCategories,
  createMaterial,
  updateMaterial,
  toggleMaterialStatus,
} from '../api/catalogApi';

const MATERIAL_TYPES = [
  { value: 'stain', label: 'Stain' },
  { value: 'paint', label: 'Paint' },
  { value: 'coating', label: 'Coating' },
  { value: 'sealer', label: 'Sealer' },
  { value: 'primer', label: 'Primer' },
  { value: 'cleaner', label: 'Cleaner' },
  { value: 'surface_preparation', label: 'Surface Preparation' },
  { value: 'repair_material', label: 'Repair Material' },
  { value: 'other', label: 'Other' },
];

const QUANTITY_UNITS = [
  'gallon',
  'liter',
  'quart',
  'milliliter',
  'kilogram',
  'pound',
  'piece',
  'pack',
  'square_foot',
  'square_meter',
];

export default function MaterialsTab() {
  const [materials, setMaterials] = useState([]);
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
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    materialName: '',
    materialCode: '',
    categoryId: '',
    materialType: 'stain',
    brandName: '',
    productName: '',
    description: '',
    compatibleSurfaces: ['wood'],
    unitOfMeasure: 'gallon',
    unitCost: '',
    coverageValue: '',
    coverageAreaUnit: 'square_foot',
    finishType: '',
    dryingTime: '',
    recommendedCoats: '',
    uvResistance: true,
    waterResistance: true,
    status: 'active',
  });

  useEffect(() => {
    loadCategories();
    loadMaterials(1);
  }, []);

  async function loadCategories() {
    try {
      const data = await getMaterialCategories({ limit: 100 });
      setCategories(data.categories || []);
    } catch {
      // Ignored non-fatal
    }
  }

  async function loadMaterials(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await getMaterials({
        page,
        limit: 10,
        search,
        categoryId: categoryFilter || undefined,
        materialType: typeFilter || undefined,
      });
      setMaterials(data.materials || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load materials.');
    } finally {
      setLoading(false);
    }
  }

  function handleFilterSubmit(e) {
    e.preventDefault();
    loadMaterials(1);
  }

  function handleClearFilters() {
    setSearch('');
    setCategoryFilter('');
    setTypeFilter('');
    setTimeout(() => {
      loadMaterials(1);
    }, 0);
  }

  function openCreateModal() {
    setEditingMaterial(null);
    setFormData({
      materialName: '',
      materialCode: '',
      categoryId: categories.length > 0 ? categories[0].id || categories[0]._id : '',
      materialType: 'stain',
      brandName: '',
      productName: '',
      description: '',
      compatibleSurfaces: ['wood'],
      unitOfMeasure: 'gallon',
      unitCost: '',
      coverageValue: '',
      coverageAreaUnit: 'square_foot',
      finishType: '',
      dryingTime: '',
      recommendedCoats: '1',
      uvResistance: true,
      waterResistance: true,
      status: 'active',
    });
    setModalError(null);
    setIsModalOpen(true);
  }

  function openEditModal(mat) {
    setEditingMaterial(mat);
    setFormData({
      materialName: mat.materialName || '',
      materialCode: mat.materialCode || '',
      categoryId: mat.categoryId?.id || mat.categoryId?._id || mat.categoryId || '',
      materialType: mat.materialType || 'stain',
      brandName: mat.brandName || '',
      productName: mat.productName || '',
      description: mat.description || '',
      compatibleSurfaces: mat.compatibleSurfaces || ['wood'],
      unitOfMeasure: mat.measurement?.quantityUnit || 'gallon',
      unitCost: mat.cost?.unitCost !== undefined && mat.cost?.unitCost !== null ? mat.cost.unitCost : (mat.pricePerUnit || ''),
      coverageValue: mat.coverage?.coverageValue || mat.coveragePerUnit || '',
      coverageAreaUnit: mat.coverage?.coverageAreaUnit || 'square_foot',
      finishType: mat.specifications?.finishType || '',
      dryingTime: mat.specifications?.dryingTime || '',
      recommendedCoats: mat.specifications?.recommendedCoats || '',
      uvResistance: !!mat.specifications?.uvResistance,
      waterResistance: !!mat.specifications?.waterResistance,
      status: mat.status || 'active',
    });
    setModalError(null);
    setIsModalOpen(true);
  }

  async function handleModalSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    const payload = {
      materialName: formData.materialName,
      categoryId: formData.categoryId,
      materialType: formData.materialType,
      brandName: formData.brandName,
      productName: formData.productName,
      description: formData.description,
      compatibleSurfaces: formData.compatibleSurfaces,
      measurement: {
        quantityUnit: formData.unitOfMeasure,
      },
      cost: {
        unitCost: formData.unitCost !== '' ? Number(formData.unitCost) : null,
        costUnit: formData.unitOfMeasure,
        currency: 'USD',
      },
      coverage: {
        coverageValue: formData.coverageValue !== '' ? Number(formData.coverageValue) : null,
        coverageAreaUnit: formData.coverageAreaUnit,
        coverageQuantity: 1,
        coverageQuantityUnit: formData.unitOfMeasure,
      },
      specifications: {
        finishType: formData.finishType,
        dryingTime: formData.dryingTime !== '' ? Number(formData.dryingTime) : null,
        recommendedCoats: formData.recommendedCoats !== '' ? Number(formData.recommendedCoats) : null,
        uvResistance: formData.uvResistance,
        waterResistance: formData.waterResistance,
      },
      status: formData.status,
    };

    if (!editingMaterial && formData.materialCode.trim()) {
      payload.materialCode = formData.materialCode.trim().toUpperCase();
    }

    try {
      if (editingMaterial) {
        await updateMaterial(editingMaterial.id || editingMaterial._id, payload);
        setSuccessMsg(`Material "${formData.materialName}" updated successfully.`);
      } else {
        await createMaterial(payload);
        setSuccessMsg(`Material "${formData.materialName}" created successfully.`);
      }
      setIsModalOpen(false);
      loadMaterials(pagination.page);
    } catch (err) {
      setModalError(err.message || 'Failed to save material.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(mat) {
    const currentStatus = mat.status || (mat.isActive ? 'active' : 'inactive');
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await toggleMaterialStatus(mat.id || mat._id, newStatus);
      setSuccessMsg(`Material "${mat.materialName}" status changed to ${newStatus}.`);
      loadMaterials(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to update material status.');
    }
  }

  function handleSurfaceCheckbox(surface) {
    setFormData((prev) => {
      const exists = prev.compatibleSurfaces.includes(surface);
      if (exists) {
        return {
          ...prev,
          compatibleSurfaces: prev.compatibleSurfaces.filter((s) => s !== surface),
        };
      } else {
        return {
          ...prev,
          compatibleSurfaces: [...prev.compatibleSurfaces, surface],
        };
      }
    });
  }

  return (
    <div>
      {/* Search & Filter Bar */}
      <div style={styles.topBar}>
        <form onSubmit={handleFilterSubmit} style={styles.filterForm}>
          <input
            type="text"
            placeholder="Search by name, code, brand..."
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
                {c.name || c.categoryName}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Material Types</option>
            {MATERIAL_TYPES.map((t) => (
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
          + Add Material
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
        <div style={styles.emptyBox}>Loading materials catalog...</div>
      ) : materials.length === 0 ? (
        <div style={styles.emptyBox}>
          <p>No materials found matching your filters.</p>
          <button type="button" onClick={openCreateModal} style={styles.addBtn}>
            Add a material to catalog
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Material Name & Brand</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Surfaces</th>
                <th style={styles.th}>Cost / Unit</th>
                <th style={styles.th}>Coverage</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat) => {
                const isActive = mat.status === 'active' || mat.isActive;
                const cost = mat.cost?.unitCost ?? mat.pricePerUnit;
                const coverage = mat.coverage?.coverageValue ?? mat.coveragePerUnit;
                return (
                  <tr key={mat.id || mat._id} style={styles.tr}>
                    <td style={styles.td}>
                      <code style={styles.code}>{mat.materialCode}</code>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600, color: '#111' }}>{mat.materialName}</div>
                      {mat.brandName && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Brand: {mat.brandName} {mat.productName ? `• ${mat.productName}` : ''}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.categoryBadge}>
                        {mat.categoryId?.name || mat.categoryId?.categoryName || 'General'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.typeBadge}>
                        {mat.materialType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {(mat.compatibleSurfaces || []).join(', ') || '—'}
                    </td>
                    <td style={styles.td}>
                      {cost !== null && cost !== undefined ? (
                        <strong>${Number(cost).toFixed(2)} / {mat.measurement?.quantityUnit || 'unit'}</strong>
                      ) : (
                        <span style={{ color: '#999' }}>—</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {coverage ? `${coverage} sqft / unit` : <span style={{ color: '#999' }}>—</span>}
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
                          onClick={() => openEditModal(mat)}
                          style={styles.editBtn}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(mat)}
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
            onClick={() => loadMaterials(pagination.page - 1)}
            style={pagination.page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
          >
            ← Previous
          </button>
          <span style={styles.pageInfo}>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} materials)
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => loadMaterials(pagination.page + 1)}
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
                {editingMaterial ? `Edit Material (${editingMaterial.materialCode})` : 'Add New Material'}
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
              {/* Section 1: Basic Information */}
              <h4 style={styles.sectionHeader}>1. Identification & Classification</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Material Name <span style={{ color: '#d9534f' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Olympic Maximum Semi-Transparent Stain"
                    value={formData.materialName}
                    onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Material Code {!editingMaterial && '(Auto-generated if blank)'}
                  </label>
                  <input
                    type="text"
                    disabled={!!editingMaterial}
                    placeholder="e.g. OLY-MAX-001"
                    value={formData.materialCode}
                    onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                    style={editingMaterial ? styles.inputDisabled : styles.input}
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
                        {c.name || c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Material Type <span style={{ color: '#d9534f' }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.materialType}
                    onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                    style={styles.select}
                  >
                    {MATERIAL_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Olympic, Behr, Cabot"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Model / Line</label>
                  <input
                    type="text"
                    placeholder="e.g. Maximum Waterproofing"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  rows="2"
                  placeholder="Detailed material features, durability, application recommendations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={styles.textarea}
                />
              </div>

              {/* Section 2: Compatible Surfaces */}
              <h4 style={styles.sectionHeader}>2. Surface Compatibility</h4>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                {['wood', 'composite', 'other'].map((surface) => (
                  <label key={surface} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.compatibleSurfaces.includes(surface)}
                      onChange={() => handleSurfaceCheckbox(surface)}
                    />
                    <span style={{ textTransform: 'capitalize' }}>{surface}</span>
                  </label>
                ))}
              </div>

              {/* Section 3: Cost & Coverage */}
              <h4 style={styles.sectionHeader}>3. Unit Measurement, Cost & Coverage</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Unit of Measure</label>
                  <select
                    value={formData.unitOfMeasure}
                    onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                    style={styles.select}
                  >
                    {QUANTITY_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Cost Per Unit ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 48.98"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Coverage (sqft per unit)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 300"
                    value={formData.coverageValue}
                    onChange={(e) => setFormData({ ...formData, coverageValue: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Section 4: Specifications */}
              <h4 style={styles.sectionHeader}>4. Product Specifications</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Finish Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Semi-Transparent, Solid, Clear"
                    value={formData.finishType}
                    onChange={(e) => setFormData({ ...formData, finishType: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Drying Time (hours)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 24"
                    value={formData.dryingTime}
                    onChange={(e) => setFormData({ ...formData, dryingTime: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Recommended Coats</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 2"
                    value={formData.recommendedCoats}
                    onChange={(e) => setFormData({ ...formData, recommendedCoats: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.uvResistance}
                    onChange={(e) => setFormData({ ...formData, uvResistance: e.target.checked })}
                  />
                  <span>UV Resistant</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.waterResistance}
                    onChange={(e) => setFormData({ ...formData, waterResistance: e.target.checked })}
                  />
                  <span>Water Resistant</span>
                </label>
              </div>

              {/* Status */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Catalog Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={styles.select}
                >
                  <option value="active">Active (Available for estimates)</option>
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
                  {submitting ? 'Saving...' : editingMaterial ? 'Save Changes' : 'Create Material'}
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
