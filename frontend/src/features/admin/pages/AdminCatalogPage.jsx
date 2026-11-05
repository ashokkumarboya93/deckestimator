// =============================================
// Deck Estimator — Admin Catalog Management Hub
// =============================================
// Features:
// - 5 horizontal tabs: Materials, Products & Finishes, Substrates, Services, Coverage Rates
// - Image Upload, Instant Preview, and Image Replacement across all catalog entities
// - Direct sync to MongoDB; changes immediately reflect in customer & contractor estimation flows
// - Edit & Add modals with live image file picker

import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

const TABS = [
  { id: 'materials', label: 'Deck Materials' },
  { id: 'products', label: 'Products & Finishes' },
  { id: 'substrates', label: 'Wood Substrates' },
  { id: 'services', label: 'Restoration Services' },
  { id: 'coverage', label: 'Coverage Rates' },
];

export default function AdminCatalogPage() {
  const [activeTab, setActiveTab] = useState('materials');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTabItems();
  }, [activeTab]);

  const loadTabItems = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (activeTab === 'materials') res = await adminApi.getMaterials();
      else if (activeTab === 'products') res = await adminApi.getProducts();
      else if (activeTab === 'substrates') res = await adminApi.getSubstrates();
      else if (activeTab === 'services') res = await adminApi.getServices();
      else if (activeTab === 'coverage') res = await adminApi.getCoverageRates();

      setItems(res?.data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load catalog items.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ active: true });
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setImageFile(null);
    setImagePreview(item.imageUrl || item.image || '');
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveItem = async () => {
    setSaving(true);
    try {
      let uploadedUrl = formData.imageUrl || formData.image || '';

      // Upload image if a new file was selected
      if (imageFile) {
        setUploadingImage(true);
        const uploadRes = await adminApi.uploadCatalogImage(imageFile);
        uploadedUrl = uploadRes.data?.imageUrl || uploadRes.imageUrl || uploadedUrl;
      }

      const payload = {
        ...formData,
        imageUrl: uploadedUrl,
        image: uploadedUrl,
      };

      const itemId = editingItem ? editingItem._id : null;

      if (activeTab === 'materials') await adminApi.saveMaterial(payload, itemId);
      else if (activeTab === 'products') await adminApi.saveProduct(payload, itemId);
      else if (activeTab === 'substrates') await adminApi.saveSubstrate(payload, itemId);
      else if (activeTab === 'services') await adminApi.saveService(payload, itemId);
      else if (activeTab === 'coverage') await adminApi.saveCoverageRate(payload, itemId);

      setSuccessMsg(`Catalog entry saved successfully. Updates now active across all portals.`);
      setIsModalOpen(false);
      loadTabItems();
    } catch (err) {
      setError(err?.message || 'Failed to save catalog item.');
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Catalog Management</h1>
          <p style={styles.subtitle}>
            Manage materials, finish coatings, wood substrates, and restoration services with instant image upload and replacement.
          </p>
        </div>
        <button onClick={handleOpenAdd} style={styles.btnPrimary}>
          + Add New {activeTab.slice(0, -1).toUpperCase()}
        </button>
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

      {/* Content Grid & Table */}
      <div style={styles.card}>
        {loading ? (
          <div style={styles.loaderBox}>
            <div style={styles.spinner} />
            <span>Loading {activeTab} catalog...</span>
          </div>
        ) : items.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyTitle}>No catalog entries in this section</p>
            <p style={styles.emptySub}>Add an item using the button above.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {items.map((item) => {
              const img = item.imageUrl || item.image || 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80';
              return (
                <div key={item._id} style={styles.itemCard}>
                  <div style={styles.imageContainer}>
                    <img
                      src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                      alt={item.name || item.title}
                      style={styles.cardImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div style={styles.badgeOverlay}>
                      {item.unitPrice ? `$${item.unitPrice} / ${item.unit || 'sq ft'}` : item.costPerSqFt ? `$${item.costPerSqFt}/sq ft` : `$${item.price || 0}`}
                    </div>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={styles.itemTitle}>{item.name || item.title || item.materialType}</h3>
                      {item.active !== false ? (
                        <span style={styles.activeBadge}>ACTIVE</span>
                      ) : (
                        <span style={styles.inactiveBadge}>INACTIVE</span>
                      )}
                    </div>

                    <p style={styles.itemDesc}>{item.description || 'High-performance deck restoration component.'}</p>

                    <div style={styles.metaRow}>
                      {item.category && <span style={styles.metaTag}>{item.category}</span>}
                      {item.woodSpecies && <span style={styles.metaTag}>{item.woodSpecies}</span>}
                      {item.coveragePerGallon && <span style={styles.metaTag}>{item.coveragePerGallon} sq ft/gal</span>}
                    </div>

                    <div style={styles.cardActions}>
                      <button onClick={() => handleOpenEdit(item)} style={styles.editBtn}>
                        Edit & Replace Image
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT / ADD MODAL WITH IMAGE REPLACEMENT & PREVIEW */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingItem ? `Edit ${editingItem.name || 'Catalog Item'}` : `Add New Catalog Item`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              {/* Image Preview & Replacement Section */}
              <div style={styles.imageUploadSection}>
                <label style={styles.inputLabel}>Item Visual / Catalog Image</label>
                <div style={styles.imagePickerRow}>
                  <div style={styles.previewBox}>
                    {imagePreview ? (
                      <img
                        src={imagePreview.startsWith('http') || imagePreview.startsWith('blob:') ? imagePreview : `http://localhost:5000${imagePreview}`}
                        alt="Preview"
                        style={styles.previewImg}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    ) : (
                      <div style={styles.placeholderImg}>No Image</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ fontSize: '13px' }}
                    />
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>
                      Upload PNG, JPG, or WEBP. File will be stored on server and immediately reflected in customer estimator.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Title / Name</label>
                  <input
                    type="text"
                    value={formData.name || formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, title: e.target.value })}
                    style={styles.input}
                    placeholder="e.g. Western Red Cedar or Premium Semi-Transparent"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unitPrice ?? formData.price ?? formData.costPerSqFt ?? ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormData({ ...formData, unitPrice: val, price: val, costPerSqFt: val });
                    }}
                    style={styles.input}
                    placeholder="45.00"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Category / Type</label>
                  <input
                    type="text"
                    value={formData.category || formData.materialType || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={styles.input}
                    placeholder="e.g. Wood, Stain, Sealer, Stripper"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Unit of Measure</label>
                  <input
                    type="text"
                    value={formData.unit || 'sq ft'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    style={styles.input}
                    placeholder="sq ft, gallon, quart"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Detailed Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={styles.textarea}
                  placeholder="Describe material traits, grain characteristics, and coverage notes..."
                />
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={formData.active !== false}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <strong>Active in Customer & Contractor Estimators</strong>
                </label>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setIsModalOpen(false)} style={styles.btnSecondary} disabled={saving}>
                Cancel
              </button>
              <button onClick={handleSaveItem} style={styles.btnPrimary} disabled={saving}>
                {saving || uploadingImage ? 'Saving & Syncing...' : 'Save Catalog Item'}
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
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  imageContainer: {
    position: 'relative',
    height: '160px',
    backgroundColor: '#f1f5f9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
  },
  cardBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  itemTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
  },
  activeBadge: {
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  inactiveBadge: {
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  itemDesc: {
    margin: '8px 0 12px',
    fontSize: '13px',
    color: '#64748b',
    lineHeight: 1.4,
    flex: 1,
  },
  metaRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  metaTag: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#475569',
    padding: '2px 6px',
  },
  cardActions: {
    marginTop: 'auto',
  },
  editBtn: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
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
    maxWidth: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
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
  imageUploadSection: {
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  imagePickerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '10px',
  },
  previewBox: {
    width: '90px',
    height: '70px',
    borderRadius: '6px',
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholderImg: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '600',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '14px',
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
  textarea: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    fontFamily: 'inherit',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
};
