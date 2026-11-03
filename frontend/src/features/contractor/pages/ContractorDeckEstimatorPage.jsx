// =============================================
// Deck Estimator — Contractor Create / Edit Deck Page
// =============================================
// Identical Continuous Estimator interface as customer side:
// - 7 continuous sections with real internet images and SVG blueprint
// - Live single-amount pricing calculation engine
// - Fixed right sidebar with 0/7 progress ring & summary
// - Middle section scroll with fixed sidebars
// - Full backend connectivity for deck & estimate persistence

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContinuousEstimatorForm from '../../customer/components/ContinuousEstimatorForm';
import { getDeckById } from '../../customer/api/decksApi';

export default function ContractorDeckEstimatorPage() {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const isEditing = Boolean(deckId);

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);

  const loadDeck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (deckId && !deckId.startsWith('sample') && !deckId.startsWith('proj') && deckId.length === 24) {
        const deck = await getDeckById(deckId);
        setInitialData(deck);
      } else {
        setInitialData(null);
      }
    } catch (err) {
      console.warn('Could not load deck by ID:', err);
      setInitialData(null);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    if (isEditing) {
      loadDeck();
    }
  }, [isEditing, loadDeck]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ marginTop: '12px', color: '#64748b', fontWeight: '500' }}>
          Loading deck project specifications...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {error && <div style={styles.errorBox}>{error}</div>}

      <ContinuousEstimatorForm
        initialData={initialData}
        isEditing={isEditing}
        deckId={deckId}
      />
    </div>
  );
}

const styles = {
  page: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#1d4ed8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '8px',
    margin: '16px 24px',
    fontSize: '0.9rem',
  },
};
