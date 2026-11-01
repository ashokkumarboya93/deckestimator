// =============================================
// Deck Estimator — Secure Image Gallery Component
// =============================================

import React, { useState } from 'react';
import { deleteDeckImage, getDeckImageUrl } from '../api/decksApi';

export default function ImageGallery({ deckId, images = [], onDeleteSuccess }) {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  async function handleDelete(imageId) {
    if (!window.confirm('Are you sure you want to delete this photograph? This action cannot be undone.')) {
      return;
    }

    setDeletingId(imageId);
    setError(null);

    try {
      await deleteDeckImage(deckId, imageId);
      if (onDeleteSuccess) {
        onDeleteSuccess(imageId);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete photograph.');
    } finally {
      setDeletingId(null);
    }
  }

  if (!images || images.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <p style={styles.emptyText}>No deck photographs uploaded yet.</p>
        <span style={styles.emptySubtext}>Upload photos above to document condition and measurements.</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h3 style={styles.title}>Project Photographs ({images.length})</h3>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.grid}>
        {images.map((img) => {
          const imgUrl = getDeckImageUrl(deckId, img.id);
          const sizeKb = (img.fileSize / 1024).toFixed(1);
          const isDeleting = deletingId === img.id;

          return (
            <div key={img.id} style={styles.card}>
              <div style={styles.imgWrapper} onClick={() => setSelectedImage(img)}>
                <img
                  src={imgUrl}
                  alt={img.originalFilename}
                  style={styles.thumbnail}
                  loading="lazy"
                  crossOrigin="use-credentials"
                />
                <div style={styles.hoverOverlay}>
                  <span>Click to view</span>
                </div>
              </div>

              <div style={styles.cardBody}>
                <p style={styles.fileName} title={img.originalFilename}>
                  {img.originalFilename}
                </p>
                <div style={styles.meta}>
                  <span>{sizeKb} KB</span>
                  <span>{new Date(img.createdAt || img.uploadedAt).toLocaleDateString()}</span>
                </div>
                {img.imageDescription && (
                  <p style={styles.caption} title={img.imageDescription}>
                    "{img.imageDescription}"
                  </p>
                )}
                <button
                  type="button"
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(img.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Photo'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div style={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              style={styles.modalCloseBtn}
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <img
              src={getDeckImageUrl(deckId, selectedImage.id)}
              alt={selectedImage.originalFilename}
              style={styles.modalImg}
              crossOrigin="use-credentials"
            />
            <div style={styles.modalCaption}>
              <h4>{selectedImage.originalFilename}</h4>
              {selectedImage.imageDescription && <p>{selectedImage.imageDescription}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '24px',
    marginTop: '20px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--color-text)',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid var(--color-danger)',
    color: 'var(--color-danger)',
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    marginBottom: '16px',
  },
  emptyContainer: {
    backgroundColor: 'var(--color-surface)',
    border: '1px dashed var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '32px 20px',
    textAlign: 'center',
    marginTop: '20px',
  },
  emptyText: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--color-text)',
    marginBottom: '4px',
  },
  emptySubtext: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  card: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow)',
  },
  imgWrapper: {
    position: 'relative',
    height: '140px',
    cursor: 'pointer',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  hoverOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '500',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    ':hover': { opacity: 1 },
  },
  cardBody: {
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  fileName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: 'var(--color-text-muted)',
  },
  caption: {
    fontSize: '12px',
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: '1.4',
  },
  deleteBtn: {
    marginTop: 'auto',
    backgroundColor: '#fee2e2',
    color: 'var(--color-danger)',
    border: '1px solid #fecaca',
    borderRadius: 'var(--radius)',
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modalContent: {
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: 'var(--radius)',
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    fontSize: '16px',
    cursor: 'pointer',
    zIndex: 10,
  },
  modalImg: {
    maxWidth: '100%',
    maxHeight: '80vh',
    objectFit: 'contain',
  },
  modalCaption: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    color: '#fff',
    padding: '12px 16px',
    fontSize: '14px',
  },
};

