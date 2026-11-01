// =============================================
// Deck Estimator — Contractor Create / Edit Deck Page
// =============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DeckInputForm from '../../customer/components/DeckInputForm';
import { createDeck, getDeckById, updateDeck } from '../../customer/api/decksApi';

export default function ContractorDeckEstimatorPage() {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const isEditing = Boolean(deckId);

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadDeck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const deck = await getDeckById(deckId);
      setInitialData(deck);
    } catch (err) {
      setError(err.message || 'Failed to load deck project for editing.');
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    if (isEditing) {
      loadDeck();
    }
  }, [isEditing, loadDeck]);

  async function handleSubmit(payload) {
    setIsSubmitting(true);
    setError(null);
    try {
      if (isEditing) {
        await updateDeck(deckId, payload);
        navigate(`/contractor/decks/${deckId}`);
      } else {
        const created = await createDeck(payload);
        navigate(`/contractor/decks/${created.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save deck record. Please verify inputs.');
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading deck record details...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button
          type="button"
          onClick={() => navigate('/contractor/dashboard')}
          style={styles.backBtn}
        >
          ← Back to Contractor Dashboard
        </button>
        <h1 style={styles.title}>
          {isEditing ? `Edit Deck Record: ${initialData?.projectName || ''}` : 'New Client Deck Specification'}
        </h1>
        <p style={styles.subtitle}>
          Record site measurements, structural attributes, and existing finish conditions for accurate estimating.
        </p>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <DeckInputForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/contractor/dashboard')}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '960px',
    margin: '30px auto',
    padding: '0 20px',
  },
  header: {
    marginBottom: '24px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
    marginBottom: '12px',
    display: 'inline-block',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--color-text)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    marginTop: '4px',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid var(--color-danger)',
    color: 'var(--color-danger)',
    padding: '12px 16px',
    borderRadius: 'var(--radius)',
    marginBottom: '20px',
    fontSize: '14px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '80px 20px',
    color: 'var(--color-text-muted)',
  },
};

