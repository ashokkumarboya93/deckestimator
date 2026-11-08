// =============================================
// Deck Estimator — Customer Estimator Page
// =============================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ContinuousEstimatorForm from '../components/ContinuousEstimatorForm';
import { getDeckById } from '../api/decksApi';

export default function DeckEstimatorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { deckId } = useParams();
  const editEstimate = location.state?.editEstimate || null;
  const isEditing = Boolean(deckId) || Boolean(editEstimate);

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(Boolean(deckId) && !editEstimate);
  const [error, setError] = useState(null);

  const loadDeck = React.useCallback(async () => {
    if (!deckId) return;
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
    if (deckId && !editEstimate) {
      loadDeck();
    }
  }, [deckId, editEstimate, loadDeck]);

  const effectiveData = useMemo(() => {
    if (editEstimate) {
      const d = editEstimate.deckDetails || {};
      const snap = editEstimate.pricingSnapshot || {};
      const spec = snap.spec || {};
      const populatedDeck =
        typeof editEstimate.deckId === 'object' && editEstimate.deckId !== null
          ? editEstimate.deckId
          : {};

      const rawDeckId =
        populatedDeck._id ||
        populatedDeck.id ||
        (typeof editEstimate.deckId === 'string' ? editEstimate.deckId : null) ||
        (typeof d.deckId === 'string' ? d.deckId : d.deckId?._id);

      const cleanDeckId =
        typeof rawDeckId === 'string' && /^[0-9a-fA-F]{24}$/.test(rawDeckId)
          ? rawDeckId
          : null;

      const rawEstId = editEstimate._id || editEstimate.id;
      const cleanEstimateId =
        typeof rawEstId === 'string' && /^[0-9a-fA-F]{24}$/.test(rawEstId)
          ? rawEstId
          : null;

      const lengthVal =
        spec.length ||
        d.deckLength ||
        populatedDeck.dimensions?.length ||
        (d.dimensions?.length) ||
        20;
      const widthVal =
        spec.width ||
        d.deckWidth ||
        populatedDeck.dimensions?.width ||
        (d.dimensions?.width) ||
        15;

      return {
        projectName:
          d.projectName ||
          editEstimate.estimateName ||
          populatedDeck.projectName ||
          'Deck Restoration Project',
        deckShape:
          spec.deckShape ||
          d.deckShape ||
          populatedDeck.deckShape ||
          snap.shape ||
          'rectangle',
        dimensions: {
          length: Number(lengthVal) || 20,
          width: Number(widthVal) || 15,
          area:
            spec.floorArea ||
            d.areaSqFt ||
            populatedDeck.dimensions?.area ||
            (Number(lengthVal) * Number(widthVal)),
        },
        surfaceDetails: {
          woodSpecies:
            spec.woodSpecies ||
            populatedDeck.surfaceDetails?.woodSpecies ||
            d.surfaceMaterial ||
            snap.wood ||
            populatedDeck.surfaceMaterial ||
            'pt_pine',
          coatingStatus:
            spec.existingCoating ||
            populatedDeck.surfaceDetails?.coatingStatus ||
            d.deckCondition ||
            snap.prep ||
            'none',
        },
        structureDetails: {
          height:
            spec.accessType ||
            populatedDeck.structureDetails?.height ||
            d.deckType ||
            snap.elevation ||
            'first',
          exactHeightFt:
            spec.exactHeightFt ||
            populatedDeck.structureDetails?.exactHeightFt ||
            null,
          components:
            spec.components ||
            populatedDeck.structureDetails?.components ||
            d.components ||
            [],
        },
        components:
          spec.components ||
          populatedDeck.structureDetails?.components ||
          d.components ||
          [],
        componentSqft:
          spec.componentSqft ||
          populatedDeck.structureDetails?.componentSqft ||
          d.componentSqft ||
          {},
        conditions:
          spec.conditions ||
          d.visibleConditions ||
          populatedDeck.visibleConditions ||
          ['good_condition'],
        propertyAddress: populatedDeck.propertyAddress || d.location || {},
        services:
          spec.services ||
          snap.services ||
          d.services ||
          [snap.prep, snap.finish].filter(Boolean),
        stainType: spec.stainType || (snap.finish === 'solid' ? 'solid' : 'semi'),
        notes: editEstimate.notes || '',
        estimateId: cleanEstimateId,
        deckId: cleanDeckId,
        estimateNumber: editEstimate.estimateNumber,
        totalAmount: editEstimate.totalAmount || snap.total || 2500,
        pricingSnapshot: snap,
        estimateStatus: editEstimate.estimateStatus || 'CREATED',
      };
    }
    return initialData;
  }, [editEstimate, initialData]);

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
        initialData={effectiveData}
        isEditing={isEditing}
        deckId={deckId || effectiveData?.deckId}
      />
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#f8fafc',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
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
