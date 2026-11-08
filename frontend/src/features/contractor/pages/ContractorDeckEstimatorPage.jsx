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
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ContinuousEstimatorForm from '../../customer/components/ContinuousEstimatorForm';
import { getDeckById } from '../../customer/api/decksApi';
import { getEstimateById } from '../../customer/api/estimatesApi';

export default function ContractorDeckEstimatorPage() {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const [searchParams] = useSearchParams();
  const estimateIdParam = searchParams.get('estimateId') || searchParams.get('id');
  const targetDeckId = deckId || searchParams.get('deckId');
  const isEditing = Boolean(targetDeckId || estimateIdParam);

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. If estimateId is provided, fetch full estimate specifications and pre-populate
      if (estimateIdParam && estimateIdParam.length === 24) {
        const est = await getEstimateById(estimateIdParam);
        if (est) {
          const spec = est.pricingSnapshot?.spec || {};
          const compSqft = spec.componentSqft || {};
          const shape = spec.deckShape || est.deckDetails?.deckShape || 'rectangle';
          const length = spec.length || est.deckDetails?.deckLength || 20;
          const width = spec.width || est.deckDetails?.deckWidth || 15;
          const floorArea = spec.floorArea || est.deckDetails?.areaSqFt || (Number(length) * Number(width));

          setInitialData({
            ...est,
            estimateId: est._id || est.id,
            deckId: est.deckId?._id || est.deckId || est.deckDetails?.deckId || targetDeckId,
            projectName: est.deckDetails?.projectName || est.estimateName || '',
            deckShape: shape,
            shape,
            dimensions: { length, width, area: floorArea },
            surfaceDetails: {
              woodSpecies: spec.woodSpecies || est.deckDetails?.surfaceMaterial || 'pt_pine',
              coatingStatus: spec.existingCoating || est.deckDetails?.deckCondition || 'none',
            },
            structureDetails: {
              height: spec.accessType || est.deckDetails?.deckType || 'ground',
              exactHeightFt: spec.exactHeightFt || null,
              components: spec.components || est.deckDetails?.components || [],
            },
            components: spec.components || est.deckDetails?.components || [],
            componentSqft: compSqft,
            services: spec.services || est.deckDetails?.services || ['cleaning', 'sealing'],
            stainType: spec.stainType || 'semi',
            visibleConditions: spec.conditions || est.deckDetails?.visibleConditions || ['weathered'],
            conditions: spec.conditions || est.deckDetails?.visibleConditions || ['weathered'],
            propertyAddress: est.deckDetails?.location || {},
            notes: est.notes || '',
            totalAmount: est.totalAmount,
            pricingSnapshot: est.pricingSnapshot,
          });
          return;
        }
      }

      // 2. If deckId is provided, fetch deck specifications
      if (targetDeckId && !targetDeckId.startsWith('sample') && !targetDeckId.startsWith('proj') && targetDeckId.length === 24) {
        const deck = await getDeckById(targetDeckId);
        setInitialData(deck);
      } else {
        setInitialData(null);
      }
    } catch (err) {
      console.warn('Could not load estimation/deck specs:', err);
      setInitialData(null);
    } finally {
      setLoading(false);
    }
  }, [targetDeckId, estimateIdParam]);

  useEffect(() => {
    if (isEditing) {
      loadData();
    }
  }, [isEditing, loadData]);

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
        isContractor={true}
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
