// =============================================
// Deck Estimator — Secure Photo Uploader Component
// =============================================

import React, { useState, useRef } from 'react';
import { uploadDeckImages } from '../api/decksApi';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function PhotoUploader({ deckId, onUploadSuccess, existingCount = 0, maxAllowed = 10 }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const availableSlots = Math.max(0, maxAllowed - existingCount);

  function handleFileSelect(e) {
    setError(null);
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.length + selectedFiles.length > availableSlots) {
      setError(`You can only upload up to ${availableSlots} more photo(s). (Max ${maxAllowed} total per deck)`);
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setError(`"${file.name}" is not a valid JPEG, PNG, or WebP image.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" exceeds the maximum size of 10MB.`);
        return;
      }
      validFiles.push(file);
      newPreviews.push({
        url: URL.createObjectURL(file),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2),
      });
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeSelected(index) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]?.url);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedFiles.length) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('images', file));
      if (description) formData.append('description', description);

      const uploaded = await uploadDeckImages(deckId, formData);
      // Clean up object URLs
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setSelectedFiles([]);
      setPreviews([]);
      setDescription('');
      if (onUploadSuccess) onUploadSuccess(uploaded);
    } catch (err) {
      setError(err.message || 'Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Upload Deck Photographs</h3>
      <p style={styles.subtitle}>
        Upload high-resolution photographs of your deck structure, stairs, railing, and surface condition (JPEG, PNG, or WebP — max 10MB each).
        <br />
        <strong>Remaining slots:</strong> {availableSlots} of {maxAllowed} photos.
      </p>

      {error && <div style={styles.errorBox}>{error}</div>}

      {availableSlots > 0 ? (
        <div style={styles.dropZone}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="deck-photo-input"
            disabled={isUploading}
          />
          <label htmlFor="deck-photo-input" style={styles.uploadBtn}>
            + Choose Photos
          </label>
          <span style={styles.dropText}>or drag and drop photos here</span>
        </div>
      ) : (
        <div style={styles.infoBox}>
          Maximum limit of {maxAllowed} photos reached for this deck. Delete existing photos to upload new ones.
        </div>
      )}

      {previews.length > 0 && (
        <div style={styles.previewSection}>
          <h4 style={styles.previewTitle}>Selected Photos ({previews.length})</h4>
          <div style={styles.previewGrid}>
            {previews.map((prev, idx) => (
              <div key={idx} style={styles.previewCard}>
                <img src={prev.url} alt={prev.name} style={styles.previewImg} />
                <div style={styles.previewInfo}>
                  <span style={styles.fileName}>{prev.name}</span>
                  <span style={styles.fileSize}>{prev.size} MB</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSelected(idx)}
                  style={styles.removeBtn}
                  disabled={isUploading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={styles.metaRow}>
            <input
              type="text"
              placeholder="Optional photo notes / description (e.g. South rail rot, stairs wear)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.captionInput}
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={handleUpload}
              style={styles.submitUploadBtn}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload ${previews.length} Photo(s)`}
            </button>
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
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--color-text)',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    marginBottom: '16px',
    lineHeight: '1.5',
  },
  dropZone: {
    border: '2px dashed var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '24px',
    textAlign: 'center',
    backgroundColor: 'var(--color-bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  uploadBtn: {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    padding: '8px 18px',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'inline-block',
  },
  dropText: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
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
  infoBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid var(--color-success)',
    color: 'var(--color-success)',
    padding: '12px 16px',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
  },
  previewSection: {
    marginTop: '20px',
  },
  previewTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '12px',
    color: 'var(--color-text)',
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  previewCard: {
    position: 'relative',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  previewImg: {
    width: '100%',
    height: '100px',
    objectFit: 'cover',
    display: 'block',
  },
  previewInfo: {
    padding: '6px',
    fontSize: '11px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  fileName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'var(--color-text)',
  },
  fileSize: {
    color: 'var(--color-text-muted)',
  },
  removeBtn: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    background: 'rgba(220, 38, 38, 0.85)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    cursor: 'pointer',
    fontSize: '12px',
    lineHeight: '1',
  },
  metaRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  captionInput: {
    flex: '1 1 250px',
    padding: '9px 12px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    fontSize: '14px',
  },
  submitUploadBtn: {
    backgroundColor: 'var(--color-success)',
    color: '#fff',
    padding: '9px 20px',
    borderRadius: 'var(--radius)',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
