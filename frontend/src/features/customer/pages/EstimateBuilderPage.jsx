// =============================================
// Deck Estimator — Estimate Builder Page (Phase 6)
// =============================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDeckById } from '../api/decksApi';
import { getMaterials, getServices } from '../../admin/api/catalogApi';
import { getActivePricingConfiguration } from '../../admin/api/pricingApi';
import { createEstimate } from '../api/estimatesApi';
import { useAuth } from '../../auth/hooks/useAuth';

export default function EstimateBuilderPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [deck, setDeck] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [services, setServices] = useState([]);
  const [pricingConfig, setPricingConfig] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form selections
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [numberOfCoats, setNumberOfCoats] = useState(1);
  const [estimateNotes, setEstimateNotes] = useState('');

  const isContractor = user?.role === 'contractor';
  const basePath = isContractor ? '/contractor' : '/customer';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deckData, matsData, servsData, configData] = await Promise.all([
        getDeckById(deckId),
        getMaterials({ isActive: true, limit: 100 }),
        getServices({ isActive: true, limit: 100 }),
        getActivePricingConfiguration().catch(() => null),
      ]);

      setDeck(deckData);
      setMaterials(matsData.materials || []);
      setServices(servsData.services || []);
      setPricingConfig(configData);

      // Auto-select first matching material for the deck surface if available
      const surface = deckData?.surfaceDetails?.material;
      if (surface && matsData.materials?.length > 0) {
        const matching = matsData.materials.find(
          (m) => !m.compatibleSurfaces?.length || m.compatibleSurfaces.includes(surface)
        );
        if (matching) setSelectedMaterialId(matching._id || matching.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load estimate builder data.');
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter materials compatible with the deck surface
  const compatibleMaterials = useMemo(() => {
    if (!deck) return materials;
    const surface = deck.surfaceDetails?.material;
    if (!surface) return materials;
    return materials.filter(
      (m) => !m.compatibleSurfaces?.length || m.compatibleSurfaces.includes(surface)
    );
  }, [deck, materials]);

  // Calculate live preview
  const preview = useMemo(() => {
    if (!deck) return null;
    const areaSqFt = Number(deck.dimensions?.area || 0);
    const wastePercent = pricingConfig?.wastePercentage ?? 10;
    const wasteMultiplier = 1 + wastePercent / 100;
    const laborRate = Number(pricingConfig?.laborRate || 0);
    const travelCharge = Number(pricingConfig?.travelCharge || 0);
    const taxPercent = Number(pricingConfig?.taxPercentage || 0);
    const minJobPrice = Number(pricingConfig?.minimumJobPrice || 0);
    const additionalCoatingRate = Number(pricingConfig?.additionalCoatingPrice || 0);

    let materialsCost = 0;
    const materialsBreakdown = [];
    const chosenMat = materials.find((m) => (m._id || m.id) === selectedMaterialId);
    if (chosenMat) {
      const coverage = Number(chosenMat.coverageValue || 200);
      const unitCost = Number(chosenMat.unitCost || 0);
      const rawUnits = areaSqFt > 0 && coverage > 0 ? areaSqFt / coverage : 0;
      const unitsWithWaste = Math.ceil(rawUnits * wasteMultiplier * (numberOfCoats > 0 ? numberOfCoats : 1));
      const subtotal = Number((unitsWithWaste * unitCost).toFixed(2));
      materialsCost += subtotal;
      materialsBreakdown.push({
        material: chosenMat,
        quantity: unitsWithWaste,
        unitCost,
        subtotal,
      });
    }

    let servicesCost = 0;
    let laborCost = 0;
    const servicesBreakdown = [];
    selectedServiceIds.forEach((sId) => {
      const s = services.find((item) => (item._id || item.id) === sId);
      if (s) {
        let qty = 1;
        if (s.pricingModel === 'per_sq_ft') {
          qty = areaSqFt;
        }
        const unitPrice = Number(s.basePrice || 0);
        const sSubtotal = Number((qty * unitPrice).toFixed(2));
        servicesCost += sSubtotal;

        const estHours = Number(s.estimatedHours || 0);
        const sLabor = Number((estHours * laborRate).toFixed(2));
        laborCost += sLabor;

        servicesBreakdown.push({
          service: s,
          quantity: qty,
          unitPrice,
          subtotal: sSubtotal,
          labor: sLabor,
        });
      }
    });

    const extraCoatingFee = numberOfCoats > 1 ? (numberOfCoats - 1) * additionalCoatingRate * areaSqFt : 0;
    const subtotal = Number((materialsCost + servicesCost + laborCost + travelCharge + extraCoatingFee).toFixed(2));
    const taxAmount = Number(((subtotal * taxPercent) / 100).toFixed(2));
    const rawTotal = Number((subtotal + taxAmount).toFixed(2));
    const finalTotal = Math.max(rawTotal, minJobPrice);
    const minAdjustment = Number((finalTotal - rawTotal).toFixed(2));

    return {
      areaSqFt,
      materialsCost,
      servicesCost,
      laborCost,
      travelCharge,
      extraCoatingFee,
      subtotal,
      taxPercent,
      taxAmount,
      minJobPrice,
      minAdjustment,
      finalTotal,
      materialsBreakdown,
      servicesBreakdown,
      wastePercent,
    };
  }, [deck, materials, services, pricingConfig, selectedMaterialId, selectedServiceIds, numberOfCoats]);

  const toggleService = (sId) => {
    setSelectedServiceIds((prev) =>
      prev.includes(sId) ? prev.filter((id) => id !== sId) : [...prev, sId]
    );
  };

  const handleSaveEstimate = async () => {
    if (!deck) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      deckId: deck._id || deck.id,
      selectedMaterials: selectedMaterialId
        ? [{ materialId: selectedMaterialId, numberOfCoats: Number(numberOfCoats) }]
        : [],
      selectedServices: selectedServiceIds.map((sId) => ({ serviceId: sId })),
      numberOfCoats: Number(numberOfCoats),
      notes: estimateNotes,
    };

    try {
      const saved = await createEstimate(payload);
      navigate(`${basePath}/estimates/${saved._id || saved.id}`);
    } catch (err) {
      setError(err.message || 'Failed to generate estimate.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerBox}>
        <p>Loading project & pricing catalog data...</p>
      </div>
    );
  }

  if (error && !deck) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>{error}</div>
        <button type="button" onClick={() => navigate(-1)} style={styles.secondaryBtn}>
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button type="button" onClick={() => navigate(-1)} style={styles.secondaryBtn}>
        ← Back to Project Details
      </button>

      <div style={styles.header}>
        <div>
          <span style={styles.tag}>Phase 6 Pricing Engine</span>
          <h1 style={styles.title}>Estimate Generator for &ldquo;{deck.projectName}&rdquo;</h1>
          <p style={styles.subtitle}>
            Deck Area: <strong>{deck.dimensions?.area || 0} sq {deck.measurementUnit || 'ft'}</strong> | Shape:{' '}
            <strong>{deck.deckShape}</strong> | Surface: <strong>{deck.surfaceDetails?.material || 'Unknown'}</strong>
          </p>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.layout}>
        {/* Left Column: Selections */}
        <div style={styles.leftCol}>
          {/* Material Selection Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>1. Select Deck Coating / Material</h3>
            <p style={styles.cardSub}>Filtered for compatibility with {deck.surfaceDetails?.material || 'wood'}.</p>

            {compatibleMaterials.length === 0 ? (
              <div style={styles.emptyNotice}>
                No materials currently configured for surface: {deck.surfaceDetails?.material || 'wood'}.
              </div>
            ) : (
              <div style={styles.optionsList}>
                {compatibleMaterials.map((mat) => {
                  const mId = mat._id || mat.id;
                  const isSelected = selectedMaterialId === mId;
                  return (
                    <div
                      key={mId}
                      onClick={() => setSelectedMaterialId(mId)}
                      style={isSelected ? styles.optionSelected : styles.option}
                    >
                      <input
                        type="radio"
                        name="primaryMaterial"
                        checked={isSelected}
                        onChange={() => setSelectedMaterialId(mId)}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={styles.optionHeader}>
                          <span style={styles.optionTitle}>{mat.materialName}</span>
                          <span style={styles.optionPrice}>${Number(mat.unitCost || 0).toFixed(2)} / {mat.unitOfMeasure}</span>
                        </div>
                        <div style={styles.optionDetails}>
                          Coverage: {mat.coverageValue || 'N/A'} sq ft / {mat.unitOfMeasure} | Brand: {mat.brandName || 'Standard'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>Number of Coats / Layers:</label>
              <select
                value={numberOfCoats}
                onChange={(e) => setNumberOfCoats(Number(e.target.value))}
                style={styles.select}
              >
                <option value={1}>1 Coat (Standard Refresh)</option>
                <option value={2}>2 Coats (Recommended Full Seal)</option>
                <option value={3}>3 Coats (Heavy Duty / Commercial)</option>
              </select>
            </div>
          </div>

          {/* Services Selection Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>2. Select Preparation & Labor Services</h3>
            <p style={styles.cardSub}>Choose required prep, power washing, and application services.</p>

            {services.length === 0 ? (
              <div style={styles.emptyNotice}>No active services available in the catalog.</div>
            ) : (
              <div style={styles.optionsList}>
                {services.map((srv) => {
                  const sId = srv._id || srv.id;
                  const isSelected = selectedServiceIds.includes(sId);
                  return (
                    <div
                      key={sId}
                      onClick={() => toggleService(sId)}
                      style={isSelected ? styles.optionSelected : styles.option}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleService(sId)}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={styles.optionHeader}>
                          <span style={styles.optionTitle}>{srv.serviceName}</span>
                          <span style={styles.optionPrice}>
                            ${Number(srv.basePrice || 0).toFixed(2)} {srv.pricingModel === 'per_sq_ft' ? '/ sq ft' : 'flat'}
                          </span>
                        </div>
                        <div style={styles.optionDetails}>
                          {srv.description || 'Professional deck service'} | Est. Hours: {srv.estimatedHours || 0} hr
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes Card */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>3. Project Notes & Requirements</h3>
            <textarea
              rows={3}
              value={estimateNotes}
              onChange={(e) => setEstimateNotes(e.target.value)}
              placeholder="Any specific requests, site accessibility details, or scheduling constraints..."
              style={styles.textarea}
            />
          </div>
        </div>

        {/* Right Column: Live Calculated Breakdown */}
        <div style={styles.rightCol}>
          <div style={styles.stickyCard}>
            <h3 style={styles.previewTitle}>Live Estimate Calculation</h3>
            <p style={styles.previewSub}>Single source of truth calculation engine</p>

            {preview && (
              <div>
                <div style={styles.summaryItem}>
                  <span>Base Area</span>
                  <strong>{preview.areaSqFt} sq ft</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Materials Subtotal ({preview.wastePercent}% waste margin)</span>
                  <strong>${preview.materialsCost.toFixed(2)}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Services Subtotal</span>
                  <strong>${preview.servicesCost.toFixed(2)}</strong>
                </div>

                <div style={styles.summaryItem}>
                  <span>Labor Allowance</span>
                  <strong>${preview.laborCost.toFixed(2)}</strong>
                </div>

                {preview.travelCharge > 0 && (
                  <div style={styles.summaryItem}>
                    <span>Travel / Mobilization</span>
                    <strong>${preview.travelCharge.toFixed(2)}</strong>
                  </div>
                )}

                {preview.extraCoatingFee > 0 && (
                  <div style={styles.summaryItem}>
                    <span>Extra Coating Layers</span>
                    <strong>${preview.extraCoatingFee.toFixed(2)}</strong>
                  </div>
                )}

                <div style={{ ...styles.summaryItem, borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <span>Subtotal</span>
                  <strong>${preview.subtotal.toFixed(2)}</strong>
                </div>

                {preview.taxPercent > 0 && (
                  <div style={styles.summaryItem}>
                    <span>Tax ({preview.taxPercent}%)</span>
                    <strong>${preview.taxAmount.toFixed(2)}</strong>
                  </div>
                )}

                {preview.minAdjustment > 0 && (
                  <div style={{ ...styles.summaryItem, color: '#0369a1' }}>
                    <span>Min Job Price Floor Adjustment</span>
                    <strong>+${preview.minAdjustment.toFixed(2)}</strong>
                  </div>
                )}

                <div style={styles.totalBox}>
                  <div style={styles.totalLabel}>Estimated Total</div>
                  <div style={styles.totalValue}>${preview.finalTotal.toFixed(2)}</div>
                </div>

                <div style={styles.formulaNotice}>
                  Calculations strictly adhere to active catalog specifications without invented prices.
                </div>

                <button
                  type="button"
                  onClick={handleSaveEstimate}
                  disabled={submitting}
                  style={styles.saveBtn}
                >
                  {submitting ? 'Generating Estimate...' : 'Generate & Save Official Estimate'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 20px 60px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  centerBox: {
    padding: '60px',
    textAlign: 'center',
    color: '#64748b',
  },
  header: {
    marginBottom: '24px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '16px',
  },
  tag: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '8px 0 4px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  secondaryBtn: {
    background: 'none',
    border: 'none',
    color: '#0284c7',
    fontSize: '14px',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '16px',
    fontWeight: 600,
  },
  layout: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: '1 1 650px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightCol: {
    flex: '1 1 340px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 700,
    margin: '0 0 4px',
    color: '#0f172a',
  },
  cardSub: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 16px',
  },
  emptyNotice: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    color: '#64748b',
    fontSize: '13px',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    transition: 'all 0.15s ease',
  },
  optionSelected: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '6px',
    border: '1.5px solid #0284c7',
    cursor: 'pointer',
    backgroundColor: '#f0f9ff',
    transition: 'all 0.15s ease',
  },
  optionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2px',
  },
  optionTitle: {
    fontWeight: 600,
    fontSize: '14px',
    color: '#0f172a',
  },
  optionPrice: {
    fontWeight: 700,
    fontSize: '14px',
    color: '#0284c7',
  },
  optionDetails: {
    fontSize: '12px',
    color: '#64748b',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#334155',
    marginBottom: '6px',
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  },
  stickyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: '20px',
  },
  previewTitle: {
    fontSize: '18px',
    fontWeight: 700,
    margin: '0 0 4px',
    color: '#0f172a',
  },
  previewSub: {
    fontSize: '12px',
    color: '#64748b',
    margin: '0 0 16px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginBottom: '8px',
    color: '#334155',
  },
  totalBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '14px',
    marginTop: '16px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
  },
  totalValue: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#0284c7',
  },
  formulaNotice: {
    fontSize: '11px',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '8px 10px',
    borderRadius: '4px',
    marginBottom: '16px',
    lineHeight: '1.4',
  },
  saveBtn: {
    width: '100%',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  errorBox: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
  },
};

