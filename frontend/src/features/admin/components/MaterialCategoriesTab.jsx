// =============================================
// Deck Estimator — Admin Material Categories Tab
// =============================================

import React, { useState, useEffect } from 'react';
import {
  getMaterialCategories,
  createMaterialCategory,
  updateMaterialCategory,
  toggleMaterialCategoryStatus,
} from '../api/catalogApi';

export default function MaterialCategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
    status: 'active',
  });
  const [modalError, setModalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories(1);
  }, []);

  async function loadCategories(page = 1, currentSearch = search) {
    setLoading(true);
    setError(null);
    try {
      const data = await getMaterialCategories({ page, limit: 10, search: currentSearch });
      setCategories(data.categories || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load material categories.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadCategories(1, search);
  }

  function openCreateModal() {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      displayOrder: categories.length + 1,
      status: 'active',
    });
    setModalError(null);
    setIsModalOpen(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);
    setFormData({
      name: category.name || category.categoryName || '',
      description: category.description || '',
      displayOrder: category.displayOrder || 0,
      status: category.status || (category.isActive ? 'active' : 'inactive'),
    });
    setModalError(null);
    setIsModalOpen(true);
  }

  async function handleModalSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      if (editingCategory) {
        await updateMaterialCategory(editingCategory.id || editingCategory._id, {
          name: formData.name,
          description: formData.description,
          displayOrder: Number(formData.displayOrder),
          status: formData.status,
        });
        setSuccessMsg(`Material category "${formData.name}" updated successfully.`);
      } else {
        await createMaterialCategory({
          name: formData.name,
          description: formData.description,
          displayOrder: Number(formData.displayOrder),
          status: formData.status,
        });
        setSuccessMsg(`Material category "${formData.name}" created successfully.`);
      }
      setIsModalOpen(false);
      loadCategories(pagination.page);
    } catch (err) {
      setModalError(err.message || 'Failed to save material category.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(cat) {
    const currentStatus = cat.status || (cat.isActive ? 'active' : 'inactive');
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await toggleMaterialCategoryStatus(cat.id || cat._id, newStatus);
      setSuccessMsg(`Category "${cat.name}" status changed to ${newStatus}.`);
      loadCategories(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to update category status.');
    }
  }

  return (
    <div>
      {/* Search & Actions Bar */}
      <div style={styles.topBar}>
        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <input
            type="text"
            placeholder="Search material categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn}>Search</button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                loadCategories(1, '');
              }}
              style={styles.clearBtn}
            >
              Clear
            </button>
          )}
        </form>

        <button type="button" onClick={openCreateModal} style={styles.addBtn}>
          + Add Material Category
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
        <div style={styles.emptyBox}>Loading categories...</div>
      ) : categories.length === 0 ? (
        <div style={styles.emptyBox}>
          <p>No material categories found.</p>
          <button type="button" onClick={openCreateModal} style={styles.addBtn}>
            Create your first material category
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Order</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Slug</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Materials</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const isActive = cat.status === 'active' || cat.isActive;
                return (
                  <tr key={cat.id || cat._id} style={styles.tr}>
                    <td style={styles.td}><strong>#{cat.displayOrder || 0}</strong></td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: 600 }}>{cat.name || cat.categoryName}</span>
                    </td>
                    <td style={styles.td}>
                      <code style={styles.code}>{cat.slug}</code>
                    </td>
                    <td style={{ ...styles.td, maxWidth: '280px' }}>
                      {cat.description || <span style={{ color: '#999' }}>—</span>}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.countBadge}>
                        {cat.materialsCount || 0} items
                      </span>
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
                          onClick={() => openEditModal(cat)}
                          style={styles.editBtn}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
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
            onClick={() => loadCategories(pagination.page - 1)}
            style={pagination.page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
          >
            ← Previous
          </button>
          <span style={styles.pageInfo}>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} categories)
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => loadCategories(pagination.page + 1)}
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
                {editingCategory ? 'Edit Material Category' : 'New Material Category'}
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
                  Category Name <span style={{ color: '#d9534f' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Decking Planks, Fasteners, Sealants"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  rows="3"
                  placeholder="Detailed description of what materials fall into this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={styles.textarea}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={styles.select}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
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
                  {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
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
  searchForm: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  searchInput: {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    width: '260px',
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
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: '13px',
    color: '#444',
  },
  tr: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#333',
    verticalAlign: 'middle',
  },
  code: {
    background: '#f0f0f0',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '12px',
    fontFamily: 'monospace',
  },
  countBadge: {
    background: '#e3f2fd',
    color: '#1565c0',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
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
    gap: '8px',
  },
  editBtn: {
    padding: '5px 10px',
    background: '#e3f2fd',
    color: '#1976d2',
    border: '1px solid #90caf9',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
  },
  activateBtn: {
    padding: '5px 10px',
    background: '#e8f5e9',
    color: '#2e7d32',
    border: '1px solid #a5d6a7',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deactivateBtn: {
    padding: '5px 10px',
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
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
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

