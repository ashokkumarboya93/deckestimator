// =============================================
// Deck Estimator — Customer Estimator Page
// =============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContinuousEstimatorForm from '../components/ContinuousEstimatorForm';
import { getDeckById } from '../api/decksApi';

export default function DeckEstimatorPage() {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const isEditing = Boolean(deckId);

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);

  const loadDeck = React.useCallback(async () => {
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading deck specifications...</p>
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
    backgroundColor: '#f8fafc',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  topBar: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '16px 20px 0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0284c7',
    cursor: 'pointer',
    padding: 0,
  },
  badgeText: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#64748b',
  },
  errorBox: {
    maxWidth: '1280px',
    margin: '10px auto',
    padding: '12px 20px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#b91c1c',
    fontSize: '13px',
  },
};
