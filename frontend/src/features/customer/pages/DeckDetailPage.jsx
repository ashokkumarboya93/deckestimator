// =============================================
// Deck Estimator — Deck Project Detail & Gallery Page
// =============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDeckById } from '../api/decksApi';
import PhotoUploader from '../components/PhotoUploader';
import ImageGallery from '../components/ImageGallery';
import DeckAnalysisSection from '../components/DeckAnalysisSection';

export default function DeckDetailPage() {
  const navigate = useNavigate();
  const { deckId } = useParams();

  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDeckDetails = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDeckById(deckId);
      setDeck(data);
    } catch (err) {
      setError(err.message || 'Failed to load deck project.');
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    loadDeckDetails();
  }, [loadDeckDetails]);

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>{error || 'Deck project not found.'}</div>
        <button
          type="button"
          onClick={() => navigate('/customer/dashboard')}
          style={styles.backBtn}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const areaStr = deck.dimensions?.area
    ? `${deck.dimensions.area} sq ${deck.measurementUnit || 'ft'}`
    : 'Pending measurements';

  const addressStr = [
    deck.propertyAddress?.street,
    deck.propertyAddress?.city,
    deck.propertyAddress?.state,
    deck.propertyAddress?.zipCode,
  ]
    .filter(Boolean)
    .join(', ') || 'No property address specified';

  return (
    <div style={styles.container}>
      <button
        type="button"
        onClick={() => navigate('/customer/dashboard')}
        style={styles.backBtn}
      >
        ← Back to Projects Dashboard
      </button>

      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.titleRow}>
            <h1 style={styles.title}>{deck.projectName}</h1>
            <span
              style={{
                ...styles.statusBadge,
                backgroundColor: deck.completionStatus === 'complete' ? '#dcfce7' : '#fef9c3',
                color: deck.completionStatus === 'complete' ? '#15803d' : '#854d0e',
              }}
            >
              {deck.completionStatus === 'complete' ? 'Complete' : 'Draft'}
            </span>
          </div>
          <p style={styles.address}>{addressStr}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => navigate(`/customer/decks/${deck.id || deck._id}/estimate/new`)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            💰 Calculate Estimate
          </button>
          <button
            type="button"
            onClick={() => navigate(`/customer/decks/${deck.id || deck._id}/edit`)}
            style={styles.editBtn}
          >
            ✎ Edit Specifications
          </button>
        </div>
      </div>

      {deck.projectDescription && (
        <div style={styles.descCard}>
          <p>{deck.projectDescription}</p>
        </div>
      )}

      {/* Specifications Grid */}
      <div style={styles.specsGrid}>
        <div style={styles.specCard}>
          <h3 style={styles.specTitle}>📐 Geometry & Area</h3>
          <div style={styles.specRow}>
            <span>Shape:</span>
            <strong>{deck.deckShape?.toUpperCase() || 'RECTANGLE'}</strong>
          </div>
          {deck.dimensions?.length && (
            <div style={styles.specRow}>
              <span>Dimensions:</span>
              <strong>
                {deck.dimensions.length} × {deck.dimensions.width} {deck.measurementUnit || 'ft'}
              </strong>
            </div>
          )}
          <div style={styles.specRow}>
            <span>Calculated Area:</span>
            <strong style={{ color: '#166534' }}>{areaStr}</strong>
          </div>
        </div>

        <div style={styles.specCard}>
          <h3 style={styles.specTitle}>🏗 Structure & Features</h3>
          <div style={styles.specRow}>
            <span>Levels:</span>
            <strong>{deck.structureDetails?.levels || 1} level(s)</strong>
          </div>
          <div style={styles.specRow}>
            <span>Attachment:</span>
            <strong>{deck.structureDetails?.isAttached ? 'Attached to House' : 'Freestanding'}</strong>
          </div>
          <div style={styles.specRow}>
            <span>Railings:</span>
            <strong>
              {deck.structureDetails?.hasRailings
                ? `Yes (${deck.structureDetails.railingLength || '?'} linear ft)`
                : 'None'}
            </strong>
          </div>
          <div style={styles.specRow}>
            <span>Stairs:</span>
            <strong>
              {deck.structureDetails?.hasStairs
                ? `Yes (${deck.structureDetails.stairStepCount || '?'} steps)`
                : 'None'}
            </strong>
          </div>
          {deck.structureDetails?.builtInFeatures?.length > 0 && (
            <div style={styles.specRow}>
              <span>Built-in:</span>
              <strong>{deck.structureDetails.builtInFeatures.join(', ')}</strong>
            </div>
          )}
        </div>

        <div style={styles.specCard}>
          <h3 style={styles.specTitle}>🪵 Surface & Condition</h3>
          <div style={styles.specRow}>
            <span>Material:</span>
            <strong>{deck.surfaceDetails?.material?.toUpperCase() || 'WOOD'}</strong>
          </div>
          <div style={styles.specRow}>
            <span>Coating Status:</span>
            <strong>{deck.surfaceDetails?.coatingStatus?.toUpperCase() || 'NONE'}</strong>
          </div>
          <div style={styles.specRow}>
            <span>Conditions:</span>
            <strong style={{ textAlign: 'right' }}>
              {deck.visibleConditions?.length > 0
                ? deck.visibleConditions.join(', ')
                : 'No defects noted'}
            </strong>
          </div>
        </div>
      </div>

      {/* Photographs Section */}
      <div style={styles.photosSection}>
        <PhotoUploader
          deckId={deck.id}
          existingCount={deck.images?.length || 0}
          onUploadSuccess={(newImages) => {
            setDeck((prev) => ({
              ...prev,
              images: [...(prev.images || []), ...newImages],
            }));
          }}
        />

        <ImageGallery
          deckId={deck.id}
          images={deck.images || []}
          onDeleteSuccess={(deletedId) => {
            setDeck((prev) => ({
              ...prev,
              images: (prev.images || []).filter((img) => img.id !== deletedId),
            }));
          }}
        />
      </div>

      {/* AI Visual Condition Analysis (Phase 7) */}
      <DeckAnalysisSection deckId={deck.id || deck._id} />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1050px',
    margin: '30px auto',
    padding: '0 20px',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '80px 20px',
    color: 'var(--color-text-muted)',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid var(--color-danger)',
    color: 'var(--color-danger)',
    padding: '12px 16px',
    borderRadius: 'var(--radius)',
    marginBottom: '16px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
    marginBottom: '16px',
    display: 'inline-block',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: 'var(--color-text)',
  },
  statusBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  address: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    marginTop: '4px',
  },
  editBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    borderRadius: 'var(--radius)',
    padding: '9px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: 'var(--shadow)',
  },
  descCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '16px 20px',
    marginBottom: '24px',
    color: '#334155',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  specCard: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '18px 20px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  specTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--color-text)',
    borderBottom: '1px solid var(--color-border)',
    paddingBottom: '8px',
    marginBottom: '4px',
  },
  specRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    gap: '8px',
  },
  photosSection: {
    marginTop: '10px',
  },
};
