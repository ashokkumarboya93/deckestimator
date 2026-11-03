// =============================================
// Deck Estimator — Continuous Scroll Estimator Form
// =============================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeck, updateDeck } from '../api/decksApi';
import { createEstimate, calculateLivePricing } from '../api/estimatesApi';

const SHAPE_CARDS = [
  { id: 'rectangle', label: 'Rectangle', desc: 'Standard 4-sided rectangular deck', img: 'https://images.unsplash.com/photo-1695550056778-de79c8cd909e?auto=format&fit=crop&w=400&q=80' },
  { id: 'l_shaped', label: 'L-Shape', desc: 'Two connected sections wrapping corner', img: 'https://images.unsplash.com/photo-1659320681808-4cf523d261a2?auto=format&fit=crop&w=400&q=80' },
  { id: 'multi_level', label: 'Multi-Level', desc: 'More than one stepped level', img: 'https://images.unsplash.com/photo-1659320681808-4cf523d261a2?auto=format&fit=crop&w=400&q=80' },
  { id: 'custom', label: 'Custom', desc: 'Curved, tiered, or irregular shape', img: 'https://images.unsplash.com/photo-1695550056778-de79c8cd909e?auto=format&fit=crop&w=400&q=80' },
];

const HEIGHT_CARDS = [
  { id: 'ground_level', label: 'Ground Level', desc: '0–2 ft off ground', val: 1 },
  { id: 'low', label: 'Low', desc: '2–4 ft off ground', val: 3 },
  { id: 'medium', label: 'Medium', desc: '4–8 ft elevated', val: 6 },
  { id: 'high', label: 'High', desc: '8+ ft second story', val: 10 },
];

const CONDITION_CARDS = [
  { id: 'good', label: 'Good', desc: 'Clean, sound wood; minimal discoloration', img: 'https://images.unsplash.com/photo-1695550056778-de79c8cd909e?auto=format&fit=crop&w=400&q=80' },
  { id: 'weathered', label: 'Weathered', desc: 'Grayed wood, sun wear, needs brightening', img: 'https://images.unsplash.com/photo-1768173756660-45fd2bfe6be6?auto=format&fit=crop&w=400&q=80' },
  { id: 'peeling_stained', label: 'Peeling / Stained', desc: 'Old coating peeling; requires chemical strip', img: 'https://images.unsplash.com/photo-1672365916735-066b8afce771?auto=format&fit=crop&w=400&q=80' },
  { id: 'damaged', label: 'Damaged / Rough', desc: 'Splintered, cracked, or heavily worn; needs sanding', img: 'https://images.unsplash.com/photo-1768173756660-45fd2bfe6be6?auto=format&fit=crop&w=400&q=80' },
];

const RESTORATION_CARDS = [
  { id: 'cleaning', label: 'Deep Cleaning', desc: 'Power scrub & eco cleaner', img: 'https://images.unsplash.com/photo-1695550056778-de79c8cd909e?auto=format&fit=crop&w=400&q=80' },
  { id: 'stripping', label: 'Stain Stripping', desc: 'Remove old failing sealers', img: 'https://images.unsplash.com/photo-1672365916735-066b8afce771?auto=format&fit=crop&w=400&q=80' },
  { id: 'sanding', label: 'Deck Sanding', desc: 'Smooth rough splinters', img: 'https://images.unsplash.com/photo-1679797878543-66c1e502d413?auto=format&fit=crop&w=400&q=80' },
  { id: 'full_restoration', label: 'Full Restoration', desc: 'Complete strip, sand & stain', img: 'https://images.unsplash.com/photo-1659320681808-4cf523d261a2?auto=format&fit=crop&w=400&q=80' },
];

const FINISH_CARDS = [
  { id: 'natural', label: 'Natural / Clear', desc: 'Clear weather protection; natural wood grain', img: 'https://images.unsplash.com/photo-1768173756660-45fd2bfe6be6?auto=format&fit=crop&w=400&q=80' },
  { id: 'semi_transparent_stain', label: 'Semi-Transparent Stain', desc: 'Enriched tone while highlighting wood grain', img: 'https://images.unsplash.com/photo-1695550056778-de79c8cd909e?auto=format&fit=crop&w=400&q=80' },
  { id: 'solid_stain', label: 'Solid Stain', desc: 'Opaque solid color coat with maximum UV shield', img: 'https://images.unsplash.com/photo-1672365916735-066b8afce771?auto=format&fit=crop&w=400&q=80' },
  { id: 'clear_sealer', label: 'Clear Sealer', desc: 'Penetrating hydrophobic water repellent', img: 'https://images.unsplash.com/photo-1768173756660-45fd2bfe6be6?auto=format&fit=crop&w=400&q=80' },
];

export default function ContinuousEstimatorForm({ initialData = null, isEditing = false, deckId = null }) {
  const navigate = useNavigate();

  // Primary Inputs
  const [shape, setShape] = useState(initialData?.deckShape || 'rectangle');
  const [unit, setUnit] = useState(initialData?.measurementUnit || 'ft');
  const [length, setLength] = useState(initialData?.dimensions?.length || 20);
  const [width, setWidth] = useState(initialData?.dimensions?.width || 20);
  const [height, setHeight] = useState('ground_level');
  const [levels, setLevels] = useState(initialData?.structureDetails?.levels || 1);
  const [multiLevels, setMultiLevels] = useState([
    { length: 15, width: 10 },
    { length: 10, width: 10 },
  ]);

  // Structural Components
  const [hasRailings, setHasRailings] = useState(initialData?.structureDetails?.hasRailings ?? true);
  const [railingLength, setRailingLength] = useState(initialData?.structureDetails?.railingLength || 40);
  const [railingStyle, setRailingStyle] = useState('plain_2x2');
  const [hasStairs, setHasStairs] = useState(initialData?.structureDetails?.hasStairs ?? true);
  const [stairCount, setStairCount] = useState(initialData?.structureDetails?.stairStepCount || 5);
  const [hasFascia, setHasFascia] = useState(false);
  const [fasciaLength, setFasciaLength] = useState(20);
  const [hasPergola, setHasPergola] = useState(false);
  const [pergolaLength, setPergolaLength] = useState(100);
  const [hasSiding, setHasSiding] = useState(false);
  const [sidingArea, setSidingArea] = useState(80);
  const [includeJoists, setIncludeJoists] = useState(false);
  const [builtInSeating, setBuiltInSeating] = useState(false);

  // Condition & Restoration
  const [condition, setCondition] = useState('weathered');
  const [conditionFlags, setConditionFlags] = useState(['weathered_wood']);
  const [damageNotes, setDamageNotes] = useState('');
  const [restorationScope, setRestorationScope] = useState(['cleaning']);
  const [woodSpecies, setWoodSpecies] = useState(initialData?.surfaceDetails?.material || 'cedar');
  const [coatingType, setCoatingType] = useState('semi_transparent_stain');
  const [coatingConfidence, setCoatingConfidence] = useState('medium');

  // Project Info & Photos
  const [projectName, setProjectName] = useState(initialData?.projectName || 'Backyard Deck Restoration');
  const [projectDescription, setProjectDescription] = useState(initialData?.projectDescription || '');
  const [propertyAddress, setPropertyAddress] = useState({
    street: initialData?.propertyAddress?.street || '',
    city: initialData?.propertyAddress?.city || '',
    state: initialData?.propertyAddress?.state || '',
    zipCode: initialData?.propertyAddress?.zipCode || '',
  });
  const [photos, setPhotos] = useState([]);

  // Live Pricing State
  const [livePricing, setLivePricing] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Calculate Base Floor Area
  const floorArea = useMemo(() => {
    if (levels > 1) {
      return multiLevels.slice(0, levels).reduce((acc, lv) => acc + (Number(lv.length || 0) * Number(lv.width || 0)), 0);
    }
    const l = Number(length) || 0;
    const w = Number(width) || 0;
    return l * w;
  }, [levels, multiLevels, length, width]);

  // Handle Multi-selection for Scope
  const toggleScope = (scopeId) => {
    if (scopeId === 'full_restoration') {
      setRestorationScope(['full_restoration']);
      return;
    }
    setRestorationScope((prev) => {
      const filtered = prev.filter((s) => s !== 'full_restoration');
      if (filtered.includes(scopeId)) {
        return filtered.filter((s) => s !== scopeId);
      }
      return [...filtered, scopeId];
    });
  };

  // Run Real Live Calculation via API
  const runLiveCalculation = useCallback(async () => {
    if (floorArea <= 0) {
      setLivePricing(null);
      return;
    }
    setCalculating(true);
    setCalcError(null);
    try {
      const payload = {
        floorArea: unit === 'm' ? Math.round(floorArea * 10.7639) : floorArea,
        floorProductionRate: 200,
        woodSpecies,
        accessType: height === 'high' ? 'elevated_second_story' : 'standard_ground',
        coatingType,
        coatingConfidence,
        conditionFlags: conditionFlags.length > 0 ? conditionFlags : ['weathered_wood'],
        railingLength: hasRailings ? Number(railingLength) || 0 : 0,
        railingStyle,
        stairCount: hasStairs ? Number(stairCount) || 0 : 0,
        fasciaLength: hasFascia ? Number(fasciaLength) || 0 : 0,
        pergolaLength: hasPergola ? Number(pergolaLength) || 0 : 0,
        sidingArea: hasSiding ? Number(sidingArea) || 0 : 0,
        includeJoists,
        billingRate: 65,
      };
      const res = await calculateLivePricing(payload);
      setLivePricing(res);
    } catch (err) {
      setCalcError(err.message || 'Error updating live estimate.');
    } finally {
      setCalculating(false);
    }
  }, [
    floorArea,
    unit,
    woodSpecies,
    height,
    coatingType,
    coatingConfidence,
    conditionFlags,
    hasRailings,
    railingLength,
    railingStyle,
    hasStairs,
    stairCount,
    hasFascia,
    fasciaLength,
    hasPergola,
    pergolaLength,
    hasSiding,
    sidingArea,
    includeJoists,
  ]);

  // Debounced recalculation on input changes
  useEffect(() => {
    const t = setTimeout(() => {
      runLiveCalculation();
    }, 250);
    return () => clearTimeout(t);
  }, [runLiveCalculation]);

  // Photo handlers
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map((file) => ({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      url: URL.createObjectURL(file),
      file,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Handler: Saves Deck and Creates/Updates Estimate
  const handleSave = async (status = 'SUBMITTED') => {
    if (floorArea <= 0) {
      setSubmitError('Please enter valid deck length and width greater than 0.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Save / Update Deck
      const deckPayload = {
        projectName: projectName.trim() || 'My Deck Project',
        projectDescription: projectDescription.trim(),
        measurementUnit: unit,
        deckShape: shape,
        dimensions: {
          length: Number(length) || 0,
          width: Number(width) || 0,
          area: floorArea,
        },
        structureDetails: {
          levels,
          isAttached: true,
          hasRailings,
          railingLength: hasRailings ? Number(railingLength) || 0 : 0,
          hasStairs,
          stairStepCount: hasStairs ? Number(stairCount) || 0 : 0,
          builtInFeatures: [
            hasFascia && 'Fascia',
            hasPergola && 'Pergola',
            hasSiding && 'Siding',
            includeJoists && 'Underside Joists',
            builtInSeating && 'Built-in Seating',
          ].filter(Boolean),
        },
        surfaceDetails: {
          material: woodSpecies,
          coatingStatus: condition === 'peeling_stained' ? 'stained' : condition === 'weathered' ? 'weathered' : 'none',
        },
        propertyAddress,
      };

      let activeDeckId = deckId;
      if (isEditing && deckId) {
        await updateDeck(deckId, deckPayload);
      } else {
        const createdDeck = await createDeck(deckPayload);
        activeDeckId = createdDeck.id || createdDeck._id;
      }

      // 2. Generate and Persist Estimate Snapshot
      const estimatePayload = {
        deckId: activeDeckId,
        estimateName: `${projectName} Quote`,
        floorArea: unit === 'm' ? Math.round(floorArea * 10.7639) : floorArea,
        floorProductionRate: 200,
        woodSpecies,
        accessType: height === 'high' ? 'elevated_second_story' : 'standard_ground',
        coatingType,
        coatingConfidence,
        conditionFlags: conditionFlags.length > 0 ? conditionFlags : ['weathered_wood'],
        railingLength: hasRailings ? Number(railingLength) || 0 : 0,
        railingStyle,
        stairCount: hasStairs ? Number(stairCount) || 0 : 0,
        fasciaLength: hasFascia ? Number(fasciaLength) || 0 : 0,
        pergolaLength: hasPergola ? Number(pergolaLength) || 0 : 0,
        sidingArea: hasSiding ? Number(sidingArea) || 0 : 0,
        includeJoists,
        billingRate: 65,
        notes: damageNotes,
      };

      const createdEst = await createEstimate(estimatePayload);

      if (status === 'DRAFT') {
        navigate('/customer/dashboard');
      } else {
        navigate(`/customer/estimates/${createdEst?._id || createdEst?.id || ''}`);
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to save estimate. Please review your entries.');
      setSubmitting(false);
    }
  };

  // Section Progress Jumps
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={styles.layout}>
      {/* Top Sticky Progress Navigation */}
      <nav style={styles.topNavBar}>
        <div style={styles.navInner}>
          <div style={styles.navTitleBox}>
            <span style={styles.navStepText}>ESTIMATOR STEPS:</span>
          </div>
          <div style={styles.navLinks}>
            <button type="button" onClick={() => scrollTo('sec-details')} style={styles.navBtn}>1. Details</button>
            <button type="button" onClick={() => scrollTo('sec-condition')} style={styles.navBtn}>2. Condition</button>
            <button type="button" onClick={() => scrollTo('sec-scope')} style={styles.navBtn}>3. Scope</button>
            <button type="button" onClick={() => scrollTo('sec-finish')} style={styles.navBtn}>4. Finish</button>
            <button type="button" onClick={() => scrollTo('sec-photos')} style={styles.navBtn}>5. Photos</button>
            <button type="button" onClick={() => scrollTo('sec-project')} style={styles.navBtn}>6. Project</button>
            <button type="button" onClick={() => scrollTo('sec-review')} style={{ ...styles.navBtn, color: '#16a34a', fontWeight: '700' }}>7. Review</button>
          </div>
        </div>
      </nav>

      {/* Main Container: Form on Left/Center, Sticky Live Preview on Right */}
      <div style={styles.contentWrap}>
        <div style={styles.formColumn}>
          {submitError && (
            <div style={styles.errorBanner}>
              ⚠️ <strong>Error:</strong> {submitError}
            </div>
          )}

          {/* SECTION 1: Deck Details */}
          <section id="sec-details" style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>1</span>
              <div>
                <h2 style={styles.sectionTitle}>Deck Geometry & Dimensions</h2>
                <p style={styles.sectionSubtitle}>Select deck shape and enter measurements from outer edge to outer edge.</p>
              </div>
            </div>

            {/* Shape Selection Cards */}
            <h4 style={styles.fieldHeading}>Deck Shape</h4>
            <div style={styles.cardsGrid4}>
              {SHAPE_CARDS.map((c) => {
                const isSelected = shape === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setShape(c.id)}
                    style={{ ...styles.imgCard, borderColor: isSelected ? '#16a34a' : '#e2e8f0', backgroundColor: isSelected ? '#f0fdf4' : '#ffffff' }}
                  >
                    <div style={styles.imgCardCover}>
                      <img src={c.img} alt={c.label} style={styles.cardImg} />
                      {isSelected && <span style={styles.checkmark}>✓</span>}
                    </div>
                    <div style={styles.cardLabelBox}>
                      <span style={styles.cardLabel}>{c.label}</span>
                      <span style={styles.cardSub}>{c.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Measurement Unit & Dimensions */}
            <div style={{ marginTop: '24px', backgroundColor: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Dimensions</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Unit:</span>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} style={styles.unitSelect}>
                    <option value="ft">Feet (ft)</option>
                    <option value="m">Meters (m)</option>
                  </select>
                </div>
              </div>

              {levels > 1 ? (
                <div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Enter dimensions for each level:</p>
                  {multiLevels.slice(0, levels).map((lv, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'center' }}>
                      <span style={{ width: '70px', fontWeight: '600', fontSize: '13px' }}>Level {idx + 1}:</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Length"
                        value={lv.length}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiLevels((prev) => prev.map((item, i) => (i === idx ? { ...item, length: val } : item)));
                        }}
                        style={styles.inputBox}
                      />
                      <span>×</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Width"
                        value={lv.width}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMultiLevels((prev) => prev.map((item, i) => (i === idx ? { ...item, width: val } : item)));
                        }}
                        style={styles.inputBox}
                      />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{unit}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={styles.inputLabel}>Length ({unit})</label>
                    <input
                      type="number"
                      min="1"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      style={styles.inputBox}
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Width ({unit})</label>
                    <input
                      type="number"
                      min="1"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      style={styles.inputBox}
                    />
                  </div>
                </div>
              )}

              {/* Area Badge */}
              <div style={styles.areaBadgeRow}>
                <span>Calculated Deck Floor Area:</span>
                <strong style={{ color: '#166534', fontSize: '16px' }}>
                  {floorArea} sq {unit} {unit === 'm' && `(~${Math.round(floorArea * 10.7639)} sq ft)`}
                </strong>
              </div>
            </div>

            {/* Height Selection */}
            <h4 style={{ ...styles.fieldHeading, marginTop: '24px' }}>Elevation / Height from Ground</h4>
            <div style={styles.cardsGrid4}>
              {HEIGHT_CARDS.map((h) => {
                const isSelected = height === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHeight(h.id)}
                    style={{ ...styles.textCard, borderColor: isSelected ? '#16a34a' : '#e2e8f0', backgroundColor: isSelected ? '#f0fdf4' : '#ffffff' }}
                  >
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{h.label}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{h.desc}</div>
                    {isSelected && <span style={styles.textCheckmark}>✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Levels Selector */}
            <h4 style={{ ...styles.fieldHeading, marginTop: '24px' }}>Deck Levels</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setLevels(num)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: levels === num ? '#16a34a' : '#cbd5e1',
                    backgroundColor: levels === num ? '#16a34a' : '#ffffff',
                    color: levels === num ? '#ffffff' : '#0f172a',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {num === 1 ? 'Single Level' : `${num} Levels`}
                </button>
              ))}
            </div>

            {/* Deck Components Checklist */}
            <h4 style={{ ...styles.fieldHeading, marginTop: '24px' }}>Deck Components & Features</h4>
            <div style={styles.componentsGrid}>
              {/* Railings */}
              <div style={styles.componentItem}>
                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={hasRailings}
                    onChange={(e) => setHasRailings(e.target.checked)}
                    style={{ accentColor: '#16a34a' }}
                  />
                  <span>Railings</span>
                </label>
                {hasRailings && (
                  <div style={{ marginTop: '8px', paddingLeft: '24px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        placeholder="Linear Feet"
                        value={railingLength}
                        onChange={(e) => setRailingLength(e.target.value)}
                        style={{ ...styles.inputBox, width: '120px' }}
                      />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>linear ft</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <select value={railingStyle} onChange={(e) => setRailingStyle(e.target.value)} style={styles.unitSelect}>
                        <option value="plain_2x2">Plain Square 2×2</option>
                        <option value="turned_spindles">Turned / Decorative Spindles</option>
                        <option value="glass_panels">Glass / Solid Panel</option>
                        <option value="cable_wire">Horizontal Cable Wire</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Stairs */}
              <div style={styles.componentItem}>
                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={hasStairs}
                    onChange={(e) => setHasStairs(e.target.checked)}
                    style={{ accentColor: '#16a34a' }}
                  />
                  <span>Stairs / Steps</span>
                </label>
                {hasStairs && (
                  <div style={{ marginTop: '8px', paddingLeft: '24px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        placeholder="Steps"
                        value={stairCount}
                        onChange={(e) => setStairCount(e.target.value)}
                        style={{ ...styles.inputBox, width: '100px' }}
                      />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>step count</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Fascia */}
              <div style={styles.componentItem}>
                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={hasFascia}
                    onChange={(e) => setHasFascia(e.target.checked)}
                    style={{ accentColor: '#16a34a' }}
                  />
                  <span>Fascia Boards</span>
                </label>
                {hasFascia && (
                  <div style={{ marginTop: '8px', paddingLeft: '24px' }}>
                    <input
                      type="number"
                      min="1"
                      placeholder="Linear Ft"
                      value={fasciaLength}
                      onChange={(e) => setFasciaLength(e.target.value)}
                      style={{ ...styles.inputBox, width: '110px' }}
                    />
                  </div>
                )}
              </div>

              {/* Pergola */}
              <div style={styles.componentItem}>
                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={hasPergola}
                    onChange={(e) => setHasPergola(e.target.checked)}
                    style={{ accentColor: '#16a34a' }}
                  />
                  <span>Pergola / Trellis</span>
                </label>
                {hasPergola && (
                  <div style={{ marginTop: '8px', paddingLeft: '24px' }}>
                    <input
                      type="number"
                      min="1"
                      placeholder="Sq Ft"
                      value={pergolaLength}
                      onChange={(e) => setPergolaLength(e.target.value)}
                      style={{ ...styles.inputBox, width: '110px' }}
                    />
                  </div>
                )}
              </div>

              {/* Underside Joists */}
              <div style={styles.componentItem}>
                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={includeJoists}
                    onChange={(e) => setIncludeJoists(e.target.checked)}
                    style={{ accentColor: '#16a34a' }}
                  />
                  <span>Underside / Support Joists (+40% labor)</span>
                </label>
              </div>

              {/* Siding / Skirting */}
              <div style={styles.componentItem}>
                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={hasSiding}
                    onChange={(e) => setHasSiding(e.target.checked)}
                    style={{ accentColor: '#16a34a' }}
                  />
                  <span>Siding / Skirting</span>
                </label>
                {hasSiding && (
                  <div style={{ marginTop: '8px', paddingLeft: '24px' }}>
                    <input
                      type="number"
                      min="1"
                      placeholder="Sq Ft"
                      value={sidingArea}
                      onChange={(e) => setSidingArea(e.target.value)}
                      style={{ ...styles.inputBox, width: '110px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 2: Deck Condition */}
          <section id="sec-condition" style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>2</span>
              <div>
                <h2 style={styles.sectionTitle}>Deck Condition Evaluation</h2>
                <p style={styles.sectionSubtitle}>Select the state of your deck wood so our calculation applies exact surface prep labor hours.</p>
              </div>
            </div>

            <div style={styles.cardsGrid4}>
              {CONDITION_CARDS.map((c) => {
                const isSelected = condition === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCondition(c.id);
                      if (c.id === 'peeling_stained') setConditionFlags(['heavy_mildew', 'peeling_coating']);
                      else if (c.id === 'weathered') setConditionFlags(['weathered_wood']);
                      else if (c.id === 'damaged') setConditionFlags(['weathered_wood', 'soft_damaged_wood']);
                      else setConditionFlags([]);
                    }}
                    style={{ ...styles.imgCard, borderColor: isSelected ? '#16a34a' : '#e2e8f0', backgroundColor: isSelected ? '#f0fdf4' : '#ffffff' }}
                  >
                    <div style={styles.imgCardCover}>
                      <img src={c.img} alt={c.label} style={styles.cardImg} />
                      {isSelected && <span style={styles.checkmark}>✓</span>}
                    </div>
                    <div style={styles.cardLabelBox}>
                      <span style={styles.cardLabel}>{c.label}</span>
                      <span style={styles.cardSub}>{c.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={styles.inputLabel}>Damage or Condition Notes (Optional)</label>
              <textarea
                rows={2}
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                placeholder="Mention any loose boards, rotting joists, or prior paint layers..."
                style={styles.textAreaBox}
              />
            </div>
          </section>

          {/* SECTION 3: Restoration Scope */}
          <section id="sec-scope" style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>3</span>
              <div>
                <h2 style={styles.sectionTitle}>Restoration Scope</h2>
                <p style={styles.sectionSubtitle}>Select desired treatments or choose Full Restoration for turnkey service.</p>
              </div>
            </div>

            <div style={styles.cardsGrid4}>
              {RESTORATION_CARDS.map((r) => {
                const isSelected = restorationScope.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleScope(r.id)}
                    style={{ ...styles.imgCard, borderColor: isSelected ? '#16a34a' : '#e2e8f0', backgroundColor: isSelected ? '#f0fdf4' : '#ffffff' }}
                  >
                    <div style={styles.imgCardCover}>
                      <img src={r.img} alt={r.label} style={styles.cardImg} />
                      {isSelected && <span style={styles.checkmark}>✓</span>}
                    </div>
                    <div style={styles.cardLabelBox}>
                      <span style={styles.cardLabel}>{r.label}</span>
                      <span style={styles.cardSub}>{r.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION 4: Materials & Finish */}
          <section id="sec-finish" style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>4</span>
              <div>
                <h2 style={styles.sectionTitle}>Materials, Wood Species & Finish</h2>
                <p style={styles.sectionSubtitle}>Select your wood species and desired topcoat finish.</p>
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={styles.inputLabel}>Deck Wood Species</label>
              <select
                value={woodSpecies}
                onChange={(e) => setWoodSpecies(e.target.value)}
                style={{ ...styles.inputBox, maxWidth: '340px' }}
              >
                <option value="pressure_treated_pine">Pressure-Treated Pine (Standard)</option>
                <option value="cedar">Western Red Cedar</option>
                <option value="redwood">California Redwood</option>
                <option value="hardwood_ipe">Hardwood (Ipe / Cumaru / Mahogany)</option>
                <option value="composite_trex">Composite / PVC (Clean-only)</option>
              </select>
            </div>

            <h4 style={styles.fieldHeading}>Desired Finish / Topcoat</h4>
            <div style={styles.cardsGrid4}>
              {FINISH_CARDS.map((f) => {
                const isSelected = coatingType === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCoatingType(f.id)}
                    style={{ ...styles.imgCard, borderColor: isSelected ? '#16a34a' : '#e2e8f0', backgroundColor: isSelected ? '#f0fdf4' : '#ffffff' }}
                  >
                    <div style={styles.imgCardCover}>
                      <img src={f.img} alt={f.label} style={styles.cardImg} />
                      {isSelected && <span style={styles.checkmark}>✓</span>}
                    </div>
                    <div style={styles.cardLabelBox}>
                      <span style={styles.cardLabel}>{f.label}</span>
                      <span style={styles.cardSub}>{f.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '18px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={styles.inputLabel}>Confidence in Current Surface Knowledge</label>
                <select
                  value={coatingConfidence}
                  onChange={(e) => setCoatingConfidence(e.target.value)}
                  style={{ ...styles.inputBox, width: '220px' }}
                >
                  <option value="high">High (±12% spread)</option>
                  <option value="medium">Medium (±20% spread)</option>
                  <option value="low">Low (±32% spread + inspection flag)</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 5: Photographs */}
          <section id="sec-photos" style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>5</span>
              <div>
                <h2 style={styles.sectionTitle}>Upload Deck Photographs</h2>
                <p style={styles.sectionSubtitle}>Add photos for accurate visual assessment (full deck, stairs, railings, surface close-ups).</p>
              </div>
            </div>

            <div style={styles.dropZone}>
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
                id="photo-file-input"
              />
              <label htmlFor="photo-file-input" style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📷</div>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>Click to Choose Photos or Drag & Drop Here</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>PNG, JPG, WEBP up to 10MB each</div>
              </label>
            </div>

            {photos.length > 0 && (
              <div style={styles.thumbsGrid}>
                {photos.map((ph, idx) => (
                  <div key={idx} style={styles.thumbCard}>
                    <img src={ph.url} alt={ph.name} style={styles.thumbImg} />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      style={styles.thumbRemoveBtn}
                      title="Remove image"
                    >
                      ✕
                    </button>
                    <div style={styles.thumbLabel}>{ph.name}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 6: Project & Property Details */}
          <section id="sec-project" style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>6</span>
              <div>
                <h2 style={styles.sectionTitle}>Project & Property Details</h2>
                <p style={styles.sectionSubtitle}>Save contact and property details to keep your estimate organized.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              <div>
                <label style={styles.inputLabel}>Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={styles.inputBox}
                />
              </div>

              <div>
                <label style={styles.inputLabel}>Property Address</label>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={propertyAddress.street}
                  onChange={(e) => setPropertyAddress({ ...propertyAddress, street: e.target.value })}
                  style={{ ...styles.inputBox, marginBottom: '8px' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="City"
                    value={propertyAddress.city}
                    onChange={(e) => setPropertyAddress({ ...propertyAddress, city: e.target.value })}
                    style={styles.inputBox}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={propertyAddress.state}
                    onChange={(e) => setPropertyAddress({ ...propertyAddress, state: e.target.value })}
                    style={styles.inputBox}
                  />
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={propertyAddress.zipCode}
                    onChange={(e) => setPropertyAddress({ ...propertyAddress, zipCode: e.target.value })}
                    style={styles.inputBox}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 7: Final Review & Submission */}
          <section id="sec-review" style={{ ...styles.sectionCard, borderColor: '#16a34a' }}>
            <div style={styles.sectionHeader}>
              <span style={{ ...styles.sectionNum, backgroundColor: '#16a34a' }}>7</span>
              <div>
                <h2 style={styles.sectionTitle}>Review & Submit Estimate</h2>
                <p style={styles.sectionSubtitle}>Generate an official immutable estimate snapshot stored securely in MongoDB.</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b', fontSize: '13px' }}>Project:</span>
                <strong>{projectName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b', fontSize: '13px' }}>Total Billable Area:</span>
                <strong>{livePricing?.billableArea || floorArea} sq ft</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b', fontSize: '13px' }}>Estimated Quote Range:</span>
                <strong style={{ color: '#166534', fontSize: '16px' }}>
                  {livePricing?.displayQuote?.formatted || 'Pending Calculation'}
                </strong>
              </div>
            </div>

            <div style={styles.actionRow}>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSave('DRAFT')}
                style={styles.draftBtn}
              >
                💾 Save as Draft
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSave('SUBMITTED')}
                style={styles.officialBtn}
              >
                {submitting ? 'Generating Official Quote...' : '✓ Generate & Save Official Estimate'}
              </button>
            </div>
          </section>
        </div>

        {/* STICKY RIGHT-SIDE LIVE PREVIEW & INPUT SUMMARY */}
        <aside style={styles.previewSidebar}>
          <div style={styles.stickyPanel}>
            <div style={styles.prevHeader}>
              <h3 style={styles.prevTitle}>⚡ Live Preview & Quote</h3>
              {calculating && <span style={styles.livePulse}>Calculating...</span>}
            </div>

            {/* Top View Diagram Stage */}
            <div style={styles.stage}>
              <div
                style={{
                  ...styles.deckBox,
                  width: `${Math.min(220, Math.max(90, (Number(length) || 20) * 8))}px`,
                  height: `${Math.min(130, Math.max(60, (Number(width) || 20) * 5))}px`,
                }}
              >
                <span style={styles.dimLabelTop}>{length} {unit}</span>
                <span style={styles.dimLabelRight}>{width} {unit}</span>
              </div>
            </div>
            <p style={styles.stageCaption}>Proportions reflect entered length & width</p>

            {/* Live Pricing Breakdown */}
            {livePricing ? (
              <div style={styles.pricingCard}>
                <div style={styles.priceRowBig}>
                  <span style={styles.priceLabelBig}>Estimated Range</span>
                  <strong style={styles.priceValueBig}>{livePricing.displayQuote?.formatted}</strong>
                </div>

                <div style={styles.divider} />

                <div style={styles.statRow}>
                  <span>Billable Surface Area:</span>
                  <strong>{livePricing.billableArea} sq ft</strong>
                </div>
                <div style={styles.statRow}>
                  <span>5-Part Labor Hours:</span>
                  <strong>{livePricing.laborBreakdown?.totalHours?.toFixed(1)} hrs</strong>
                </div>
                <div style={styles.statRow}>
                  <span>Labor Cost (@${livePricing.laborBreakdown?.billingRate}/h):</span>
                  <strong>${livePricing.laborCost?.toFixed(0)}</strong>
                </div>
                <div style={styles.statRow}>
                  <span>Materials & Supplies:</span>
                  <strong>${livePricing.totalMaterialCost?.toFixed(0)}</strong>
                </div>
                <div style={styles.statRow}>
                  <span>Confidence Spread:</span>
                  <span style={styles.confidencePill}>{coatingConfidence.toUpperCase()}</span>
                </div>
              </div>
            ) : (
              <div style={styles.warnBox}>
                ⚠️ Enter positive dimensions to calculate live price.
              </div>
            )}

            {calcError && <div style={styles.calcError}>{calcError}</div>}

            {/* Live Input Summary */}
            <div style={styles.summaryBox}>
              <h4 style={styles.summaryTitle}>Your Selections</h4>
              <ul style={styles.summaryList}>
                <li style={styles.sumItem}><span>Shape:</span> <strong>{shape.toUpperCase()}</strong></li>
                <li style={styles.sumItem}><span>Dimensions:</span> <strong>{length} × {width} {unit}</strong></li>
                <li style={styles.sumItem}><span>Base Area:</span> <strong>{floorArea} sq {unit}</strong></li>
                <li style={styles.sumItem}><span>Condition:</span> <strong>{condition.replace('_', ' ')}</strong></li>
                <li style={styles.sumItem}><span>Wood:</span> <strong>{woodSpecies.replace('_', ' ')}</strong></li>
                <li style={styles.sumItem}><span>Finish:</span> <strong>{coatingType.replace('_', ' ')}</strong></li>
                {hasRailings && <li style={styles.sumItem}><span>Railings:</span> <strong>{railingLength} ft ({railingStyle})</strong></li>}
                {hasStairs && <li style={styles.sumItem}><span>Stairs:</span> <strong>{stairCount} steps</strong></li>}
                {includeJoists && <li style={styles.sumItem}><span>Joists:</span> <strong>Included (+40%)</strong></li>}
              </ul>
            </div>

            {/* Quick Submit Buttons in Sidebar */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                disabled={submitting || floorArea <= 0}
                onClick={() => handleSave('SUBMITTED')}
                style={styles.sidebarPrimaryBtn}
              >
                {submitting ? 'Saving...' : 'Get Official Quote &rarr;'}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSave('DRAFT')}
                style={styles.sidebarSecondaryBtn}
              >
                Save Draft
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    paddingBottom: '60px',
  },
  topNavBar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: '60px',
    zIndex: 30,
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  navInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '8px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    overflowX: 'auto',
  },
  navTitleBox: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  navStepText: {
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    color: '#64748b',
  },
  navLinks: {
    display: 'flex',
    gap: '6px',
    flexShrink: 0,
  },
  navBtn: {
    background: 'none',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'background 0.15s ease',
  },
  contentWrap: {
    maxWidth: '1280px',
    margin: '24px auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 340px',
    gap: '24px',
    alignItems: 'start',
  },
  formColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  previewSidebar: {
    position: 'sticky',
    top: '120px',
  },
  stickyPanel: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '18px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  prevHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  prevTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  livePulse: {
    fontSize: '11px',
    color: '#16a34a',
    fontWeight: '600',
  },
  stage: {
    height: '140px',
    backgroundColor: '#e2e8f0',
    backgroundImage: 'repeating-linear-gradient(45deg, #cbd5e1 0, #cbd5e1 8px, #e2e8f0 8px, #e2e8f0 16px)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  deckBox: {
    backgroundColor: '#b45309',
    backgroundImage: 'repeating-linear-gradient(90deg, #b45309 0 10px, #92400e 10px 12px)',
    border: '2px solid #78350f',
    borderRadius: '4px',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  dimLabelTop: {
    position: 'absolute',
    top: '-18px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '700',
    padding: '1px 5px',
    borderRadius: '3px',
  },
  dimLabelRight: {
    position: 'absolute',
    right: '-42px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '700',
    padding: '1px 5px',
    borderRadius: '3px',
  },
  stageCaption: {
    fontSize: '10px',
    color: '#94a3b8',
    textAlign: 'center',
    margin: '6px 0 12px 0',
  },
  pricingCard: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '14px',
  },
  priceRowBig: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  priceLabelBig: {
    fontSize: '11px',
    textTransform: 'uppercase',
    fontWeight: '700',
    color: '#15803d',
  },
  priceValueBig: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#14532d',
  },
  divider: {
    height: '1px',
    backgroundColor: '#bbf7d0',
    margin: '10px 0',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#334155',
    marginBottom: '5px',
  },
  confidencePill: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    padding: '1px 6px',
    borderRadius: '10px',
  },
  warnBox: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fef3c7',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#b45309',
    marginBottom: '12px',
  },
  calcError: {
    color: '#b91c1c',
    fontSize: '11px',
    marginBottom: '8px',
  },
  summaryBox: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '12px',
  },
  summaryTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  summaryList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  sumItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#64748b',
    padding: '3px 0',
    borderBottom: '1px dashed #f1f5f9',
  },
  sidebarPrimaryBtn: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
  },
  sidebarSecondaryBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '8px',
    fontWeight: '600',
    fontSize: '12px',
    color: '#475569',
    cursor: 'pointer',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
    scrollMarginTop: '120px',
  },
  sectionHeader: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  sectionNum: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '14px',
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  fieldHeading: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '16px 0 8px 0',
  },
  cardsGrid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '10px',
  },
  imgCard: {
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    transition: 'border-color 0.15s ease',
  },
  imgCardCover: {
    height: '84px',
    position: 'relative',
    backgroundColor: '#cbd5e1',
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  checkmark: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '800',
  },
  cardLabelBox: {
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSub: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '2px',
    lineHeight: 1.3,
  },
  textCard: {
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    position: 'relative',
  },
  textCheckmark: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    color: '#16a34a',
    fontWeight: '800',
  },
  inputLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '4px',
  },
  inputBox: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
  },
  unitSelect: {
    padding: '6px 10px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '12px',
    backgroundColor: '#ffffff',
  },
  areaBadgeRow: {
    marginTop: '14px',
    paddingTop: '12px',
    borderTop: '1px dashed #cbd5e1',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
  },
  componentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '12px',
  },
  componentItem: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px',
  },
  checkLabel: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    color: '#0f172a',
  },
  textAreaBox: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  dropZone: {
    border: '2px dashed #94a3b8',
    borderRadius: '10px',
    padding: '30px 20px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
  },
  thumbsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
    gap: '10px',
    marginTop: '16px',
  },
  thumbCard: {
    position: 'relative',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  thumbImg: {
    width: '100%',
    height: '75px',
    objectFit: 'cover',
  },
  thumbRemoveBtn: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    border: 'none',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#ffffff',
    fontSize: '10px',
    cursor: 'pointer',
  },
  thumbLabel: {
    fontSize: '10px',
    padding: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#64748b',
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  draftBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '12px 20px',
    fontWeight: '600',
    fontSize: '14px',
    color: '#334155',
    cursor: 'pointer',
  },
  officialBtn: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.3)',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
  },
};
