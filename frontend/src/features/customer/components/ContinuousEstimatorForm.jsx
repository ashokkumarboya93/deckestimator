// =============================================
// Deck Estimator — Continuous Scroll Estimator Form
// =============================================
// Clean, modern UI: icon-based selection cards, NO default pre-selected values,
// single exact estimate amount (no minimum job price applied), and real inspirational photos.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeck, updateDeck } from '../api/decksApi';
import { createEstimate, calculateLivePricing } from '../api/estimatesApi';
import {
  RectangleDeckIcon,
  LShapeDeckIcon,
  MultiLevelDeckIcon,
  CustomDeckIcon,
  HeightGroundIcon,
  HeightLowIcon,
  HeightMediumIcon,
  HeightHighIcon,
  LevelSingleIcon,
  LevelTwoIcon,
  LevelMultiIcon,
  TopDownDeckPlanSvg,
} from './DeckDiagrams';

const SHAPES = [
  {
    id: 'rectangle',
    label: 'Rectangle',
    desc: 'Most common shape',
    Icon: RectangleDeckIcon,
    refTitle: 'Rectangle Deck',
    refDesc: 'A classic flat rectangular deck platform, ideal for dining sets and open lounge spaces.',
    realImg: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'l_shaped',
    label: 'L-Shape',
    desc: 'Two connected sections',
    Icon: LShapeDeckIcon,
    refTitle: 'L-Shaped Deck',
    refDesc: 'Wraps around the corner of a house with two connected sections for flexible zones.',
    realImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'multi_level',
    label: 'Multi-Level',
    desc: 'More than one level',
    Icon: MultiLevelDeckIcon,
    refTitle: 'Multi-Level Deck',
    refDesc: 'Stepped architectural deck platforms with connecting transition stairs between tiers.',
    realImg: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'custom',
    label: 'Custom',
    desc: 'Unique shape (e.g., circular)',
    Icon: CustomDeckIcon,
    refTitle: 'Custom Deck',
    refDesc: 'Curved, octagonal, or multi-faceted custom deck layout with built-in seating.',
    realImg: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
  },
];

const HEIGHTS = [
  { id: 'ground_level', label: 'Ground Level', range: '(0 – 2 ft)', Icon: HeightGroundIcon },
  { id: 'low', label: 'Low', range: '(2 – 4 ft)', Icon: HeightLowIcon },
  { id: 'medium', label: 'Medium', range: '(4 – 8 ft)', Icon: HeightMediumIcon },
  { id: 'high', label: 'High', range: '(8+ ft)', Icon: HeightHighIcon },
];

const LEVELS = [
  { id: 1, label: 'Single Level', desc: 'Single flat tier', Icon: LevelSingleIcon },
  { id: 2, label: 'Two Levels', desc: 'Two tiered platforms', Icon: LevelTwoIcon },
  { id: 3, label: 'Three or More Levels', desc: 'Multi-level staircase deck', Icon: LevelMultiIcon },
];

const CONDITIONS = [
  { id: 'good', label: 'Good', icon: '🛡️', desc: 'Sound wood, clean, light wash required' },
  { id: 'weathered', label: 'Weathered', icon: '☀️', desc: 'Grayed, sun-worn; needs brightening' },
  { id: 'peeling_stained', label: 'Peeling / Stained', icon: '🖌️', desc: 'Old coating failing; requires chemical strip' },
  { id: 'damaged', label: 'Damaged / Rough', icon: '🪵', desc: 'Splintered or deep cracks; needs sanding' },
];

const RESTORATIONS = [
  { id: 'cleaning', label: 'Deep Cleaning', icon: '🚿', desc: 'Eco scrub & pressure wash' },
  { id: 'stripping', label: 'Stain Stripping', icon: '🧪', desc: 'Chemical stripping of old stains' },
  { id: 'sanding', label: 'Deck Sanding', icon: '⚙️', desc: 'Smooth rough grain & splinters' },
  { id: 'full_restoration', label: 'Full Restoration', icon: '🏆', desc: 'Complete turnkey strip, sand & stain' },
];

const FINISHES = [
  { id: 'natural', label: 'Natural / Clear', icon: '💧', desc: 'Highlights natural grain; water repellent' },
  { id: 'semi_transparent_stain', label: 'Semi-Transparent Stain', icon: '🎨', desc: 'Adds rich pigment with visible wood grain' },
  { id: 'solid_stain', label: 'Solid Stain', icon: '🛡️', desc: 'Opaque protective color coat' },
  { id: 'clear_sealer', label: 'Clear Sealer', icon: '🔒', desc: 'Hydrophobic moisture lock protection' },
];

const INSPIRATION_PHOTOS = [
  { title: 'Restored Cedar Deck', url: 'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=400&q=80' },
  { title: 'Lakefront Stained Deck', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80' },
  { title: 'Multi-Tier Outdoor Living', url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80' },
  { title: 'Modern Clean Finish', url: 'https://images.unsplash.com/photo-1695550056778-de79c8cd909e?auto=format&fit=crop&w=400&q=80' },
];

export default function ContinuousEstimatorForm({ initialData = null, isEditing = false, deckId = null }) {
  const navigate = useNavigate();

  // 1. Deck Details — NO DEFAULT SELECTIONS FOR NEW ESTIMATION
  const [shape, setShape] = useState(initialData?.deckShape || null);
  const [length, setLength] = useState(initialData?.dimensions?.length ? String(initialData.dimensions.length) : '');
  const [width, setWidth] = useState(initialData?.dimensions?.width ? String(initialData.dimensions.width) : '');
  const [unit, setUnit] = useState(initialData?.measurementUnit || 'ft');
  const [height, setHeight] = useState(initialData?.structureDetails?.height || null);
  const [levels, setLevels] = useState(initialData?.structureDetails?.levels || null);

  // Components — Unselected by default
  const [hasRailings, setHasRailings] = useState(Boolean(initialData?.structureDetails?.hasRailings));
  const [railingLength, setRailingLength] = useState(initialData?.structureDetails?.railingLength ? String(initialData.structureDetails.railingLength) : '');
  const [railingStyle, setRailingStyle] = useState(initialData?.structureDetails?.railingStyle || 'plain_2x2');
  const [hasStairs, setHasStairs] = useState(Boolean(initialData?.structureDetails?.hasStairs));
  const [stairCount, setStairCount] = useState(initialData?.structureDetails?.stairStepCount ? String(initialData.structureDetails.stairStepCount) : '');
  const [hasFascia, setHasFascia] = useState(false);
  const [fasciaLength, setFasciaLength] = useState('');
  const [hasPergola, setHasPergola] = useState(false);
  const [pergolaLength, setPergolaLength] = useState('');
  const [includeJoists, setIncludeJoists] = useState(false);
  const [hasSiding, setHasSiding] = useState(false);
  const [sidingArea, setSidingArea] = useState('');

  // 2. Condition & Restoration — NO DEFAULT SELECTIONS
  const [condition, setCondition] = useState(initialData?.surfaceDetails?.coatingStatus || null);
  const [conditionFlags, setConditionFlags] = useState([]);
  const [damageNotes, setDamageNotes] = useState('');
  const [restorationScope, setRestorationScope] = useState([]);

  // 3. Finish & Species — NO DEFAULT SELECTIONS
  const [woodSpecies, setWoodSpecies] = useState(initialData?.surfaceDetails?.material || null);
  const [coatingType, setCoatingType] = useState(null);
  const [coatingConfidence, setCoatingConfidence] = useState('medium');

  // 4. Photos & Project Info
  const [photos, setPhotos] = useState([]);
  const [projectName, setProjectName] = useState(initialData?.projectName || '');
  const [projectDescription, setProjectDescription] = useState(initialData?.projectDescription || '');
  const [propertyAddress, setPropertyAddress] = useState({
    street: initialData?.propertyAddress?.street || '',
    city: initialData?.propertyAddress?.city || '',
    state: initialData?.propertyAddress?.state || '',
    zipCode: initialData?.propertyAddress?.zipCode || '',
  });

  // Live Pricing State
  const [livePricing, setLivePricing] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Modals
  const [showMeasureGuide, setShowMeasureGuide] = useState(false);

  // Calculated Floor Area
  const floorArea = useMemo(() => {
    const l = parseFloat(length);
    const w = parseFloat(width);
    if (!isNaN(l) && !isNaN(w) && l > 0 && w > 0) {
      return Math.round(l * w);
    }
    return 0;
  }, [length, width]);

  // Selected Reference Objects
  const selectedShapeObj = useMemo(() => {
    return SHAPES.find((s) => s.id === shape) || null;
  }, [shape]);

  const selectedHeightObj = useMemo(() => {
    return HEIGHTS.find((h) => h.id === height) || null;
  }, [height]);

  const selectedLevelsObj = useMemo(() => {
    return LEVELS.find((l) => l.id === levels) || null;
  }, [levels]);

  // DYNAMIC STEP COMPLETION PROGRESS (Starts 0/7 if unselected)
  const stepStatus = useMemo(() => {
    const step1 = floorArea > 0 && Boolean(shape) && Boolean(height) && Boolean(levels);
    const step2 = Boolean(condition);
    const step3 = restorationScope.length > 0;
    const step4 = Boolean(coatingType) && Boolean(woodSpecies);
    const step5 = photos.length > 0;
    const step6 = Boolean(projectName.trim());
    const step7 = step1 && step2 && step3 && step4;

    const steps = [
      { num: 1, name: 'Deck Details', done: step1 },
      { num: 2, name: 'Deck Condition', done: step2 },
      { num: 3, name: 'Restoration Services', done: step3 },
      { num: 4, name: 'Materials & Finish', done: step4 },
      { num: 5, name: 'Photographs', done: step5 },
      { num: 6, name: 'Additional Details', done: step6 },
      { num: 7, name: 'Review & Estimate', done: step7 },
    ];

    const completedCount = steps.filter((s) => s.done).length;
    return { steps, completedCount };
  }, [floorArea, shape, height, levels, condition, restorationScope, coatingType, woodSpecies, photos, projectName]);

  // Real-Time Pricing Calculation
  const runPricingCalc = useCallback(async () => {
    if (floorArea <= 0) {
      setLivePricing(null);
      return;
    }
    setCalculating(true);
    try {
      const payload = {
        floorArea: unit === 'm' ? Math.round(floorArea * 10.7639) : floorArea,
        floorProductionRate: 200,
        woodSpecies: woodSpecies || 'cedar',
        accessType: height === 'high' ? 'elevated_second_story' : 'standard_ground',
        coatingType: coatingType || 'semi_transparent_stain',
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
    } catch {
      // Keep previous or fallback
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

  useEffect(() => {
    const timer = setTimeout(() => {
      runPricingCalc();
    }, 250);
    return () => clearTimeout(timer);
  }, [runPricingCalc]);

  // SINGLE AMOUNT PRICING CALCULATIONS (NO MINIMUM JOB PRICE APPLIED)
  const { materialsEst, servicesEst, laborEst, travelEst, subTotalEst, taxEst, finalSingleTotal } = useMemo(() => {
    if (floorArea <= 0) {
      return {
        materialsEst: 0,
        servicesEst: 0,
        laborEst: 0,
        travelEst: 0,
        subTotalEst: 0,
        taxEst: 0,
        finalSingleTotal: 0,
      };
    }

    const mat = livePricing?.totalMaterialCost ?? (floorArea * 3.0);
    const srv = 960.0;
    const lab = livePricing?.laborCost ?? (floorArea * 2.0);
    const trv = 200.0;
    const sub = mat + srv + lab + trv;
    const tax = sub * 0.0825;
    // Exactly single total without applying minimum job price
    const total = sub + tax;

    return {
      materialsEst: mat,
      servicesEst: srv,
      laborEst: lab,
      travelEst: trv,
      subTotalEst: sub,
      taxEst: tax,
      finalSingleTotal: total,
    };
  }, [floorArea, livePricing]);

  // Save Deck & Estimate
  const handleSave = async (status = 'SUBMITTED') => {
    if (floorArea <= 0) {
      setSubmitError('Please enter valid deck length and width to proceed.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      const activeProjName = projectName.trim() || 'Custom Deck Project';

      // 1. Create/Update Deck
      const deckPayload = {
        projectName: activeProjName,
        projectDescription: projectDescription.trim(),
        measurementUnit: unit,
        deckShape: shape || 'rectangle',
        dimensions: { length: Number(length) || 0, width: Number(width) || 0, area: floorArea },
        structureDetails: {
          levels: levels || 1,
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
          ].filter(Boolean),
        },
        surfaceDetails: {
          material: woodSpecies || 'pressure_treated_pine',
          coatingStatus: condition || 'weathered',
        },
        propertyAddress,
      };

      let activeDeckId = deckId;
      if (isEditing && deckId) {
        await updateDeck(deckId, deckPayload);
      } else {
        const created = await createDeck(deckPayload);
        activeDeckId = created.id || created._id;
      }

      // 2. Generate Official Estimate Snapshot
      const estimatePayload = {
        deckId: activeDeckId,
        estimateName: `${activeProjName} Quote`,
        floorArea: unit === 'm' ? Math.round(floorArea * 10.7639) : floorArea,
        floorProductionRate: 200,
        woodSpecies: woodSpecies || 'pressure_treated_pine',
        accessType: height === 'high' ? 'elevated_second_story' : 'standard_ground',
        coatingType: coatingType || 'semi_transparent_stain',
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
        totalAmount: finalSingleTotal,
      };

      const est = await createEstimate(estimatePayload);

      if (status === 'DRAFT') {
        navigate('/customer/dashboard');
      } else {
        navigate('/customer/estimates');
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to save estimate.');
      setSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // SVG Progress Ring Calculation (Radius 40)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stepStatus.completedCount / 7) * circumference;

  return (
    <div style={styles.estimatorPageContainer}>
      {/* 7-STEP HORIZONTAL STEPPER HEADER BAR */}
      <div style={styles.stepperBar}>
        <div style={styles.stepperInner}>
          {stepStatus.steps.map((st, i) => (
            <React.Fragment key={st.num}>
              <div
                style={{
                  ...styles.stepPill,
                  backgroundColor: st.done ? '#dcfce7' : '#ffffff',
                  color: st.done ? '#15803d' : '#475569',
                  borderColor: st.done ? '#86efac' : '#cbd5e1',
                }}
                onClick={() => scrollToSection(`step-${st.num}`)}
              >
                <span
                  style={{
                    ...styles.stepPillNum,
                    backgroundColor: st.done ? '#16a34a' : '#e2e8f0',
                    color: st.done ? '#ffffff' : '#64748b',
                  }}
                >
                  {st.done ? '✓' : st.num}
                </span>
                <span>{st.name}</span>
              </div>
              {i < stepStatus.steps.length - 1 && <span style={styles.stepperChevron}>&gt;</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: MIDDLE SCROLLABLE FORM + STATIC RIGHT SIDEBAR */}
      <div style={styles.mainGrid}>
        {/* ======================================================== */}
        {/* MIDDLE FORM: CONTINUOUS SCROLLABLE IMAGE & ICON INPUTS */}
        {/* ======================================================== */}
        <div style={styles.formScrollColumn}>
          {submitError && (
            <div style={styles.errorBox}>
              ⚠️ <strong>Error:</strong> {submitError}
            </div>
          )}

          {/* 1.1 SELECT DECK SHAPE */}
          <section id="step-1" style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>1.1 Select Deck Shape</h3>
              <p style={styles.cardSubtitle}>Choose the shape that best matches your deck (no default selected).</p>
            </div>

            <div style={styles.shapeCardsGrid}>
              {SHAPES.map((s) => {
                const isSelected = shape === s.id;
                const IconComponent = s.Icon;
                return (
                  <div
                    key={s.id}
                    onClick={() => setShape(s.id)}
                    style={{
                      ...styles.shapeCard,
                      borderColor: isSelected ? '#16a34a' : '#e2e8f0',
                      boxShadow: isSelected ? '0 0 0 2px #bbf7d0' : 'none',
                      backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                    }}
                  >
                    <div style={styles.shapeIconWrap}>
                      <IconComponent width={52} height={52} active={isSelected} />
                      {isSelected && <span style={styles.greenCheckmark}>✓</span>}
                    </div>
                    <div style={styles.shapeTextWrap}>
                      <span style={styles.shapeName}>{s.label}</span>
                      <span style={styles.shapeDesc}>{s.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 1.2 ENTER DECK DIMENSIONS */}
          <section style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>1.2 Enter Deck Dimensions</h3>
              <p style={styles.cardSubtitle}>Measure the main deck area. Top-down blueprint plan updates live.</p>
            </div>

            <div style={styles.dimTwoCol}>
              {/* Left: Top Down Floor Plan */}
              <div style={styles.dimSvgBox}>
                <TopDownDeckPlanSvg length={length} width={width} />
              </div>

              {/* Right: Inputs */}
              <div style={styles.dimInputsCol}>
                <div style={styles.dimInputRow}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.inputLabel}>Length ({unit}) *</label>
                    <div style={styles.inputWithUnit}>
                      <input
                        type="number"
                        placeholder="e.g. 20"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        style={styles.inputInner}
                        min="1"
                      />
                      <span style={styles.unitSuffix}>{unit}</span>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={styles.inputLabel}>Width ({unit}) *</label>
                    <div style={styles.inputWithUnit}>
                      <input
                        type="number"
                        placeholder="e.g. 12"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        style={styles.inputInner}
                        min="1"
                      />
                      <span style={styles.unitSuffix}>{unit}</span>
                    </div>
                  </div>
                </div>

                <div style={styles.calcAreaBadge}>
                  <span style={{ fontSize: '20px' }}>🧮</span>
                  <div>
                    <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '700', textTransform: 'uppercase' }}>
                      Calculated Deck Area
                    </span>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#166534' }}>
                      {floorArea > 0 ? `${floorArea} sq ft` : '—'}
                    </div>
                  </div>
                </div>

                <div style={styles.tipBox}>
                  <strong style={{ fontSize: '12px', color: '#92400e' }}>💡 How to measure?</strong>
                  <ul style={styles.tipList}>
                    <li>Measure the usable deck surface length and width.</li>
                    <li>Do not include separate stairs or railings in main surface area.</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => setShowMeasureGuide(true)}
                    style={styles.linkBtn}
                  >
                    View Measurement Guide &rarr;
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 1.3 DECK HEIGHT FROM GROUND */}
          <section style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>1.3 Deck Height from Ground</h3>
              <p style={styles.cardSubtitle}>Select how high the deck surface is from the ground level.</p>
            </div>

            <div style={styles.heightCardsGrid}>
              {HEIGHTS.map((h) => {
                const isSelected = height === h.id;
                const IconComponent = h.Icon;
                return (
                  <div
                    key={h.id}
                    onClick={() => setHeight(h.id)}
                    style={{
                      ...styles.heightCard,
                      borderColor: isSelected ? '#16a34a' : '#e2e8f0',
                      boxShadow: isSelected ? '0 0 0 2px #bbf7d0' : 'none',
                      backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                    }}
                  >
                    <div style={styles.heightIconWrap}>
                      <IconComponent width={46} height={46} active={isSelected} />
                      {isSelected && <span style={styles.greenCheckmark}>✓</span>}
                    </div>
                    <span style={styles.heightName}>{h.label}</span>
                    <span style={styles.heightRange}>{h.range}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 1.4 NUMBER OF LEVELS */}
          <section style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>1.4 Number of Levels</h3>
              <p style={styles.cardSubtitle}>A level is a flat deck surface at a distinct elevated tier.</p>
            </div>

            <div style={styles.levelsCardsGrid}>
              {LEVELS.map((l) => {
                const isSelected = levels === l.id;
                const IconComponent = l.Icon;
                return (
                  <div
                    key={l.id}
                    onClick={() => setLevels(l.id)}
                    style={{
                      ...styles.levelCard,
                      borderColor: isSelected ? '#16a34a' : '#e2e8f0',
                      boxShadow: isSelected ? '0 0 0 2px #bbf7d0' : 'none',
                      backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                    }}
                  >
                    <div style={styles.levelIconWrap}>
                      <IconComponent width={46} height={46} active={isSelected} />
                      {isSelected && <span style={styles.greenCheckmark}>✓</span>}
                    </div>
                    <span style={styles.levelName}>{l.label}</span>
                    <span style={styles.levelDesc}>{l.desc}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 2: DECK CONDITION */}
          <section id="step-2" style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>2. Deck Condition</h3>
              <p style={styles.cardSubtitle}>Select the current condition of your exterior wood surface.</p>
            </div>

            <div style={styles.conditionGrid}>
              {CONDITIONS.map((c) => {
                const isSelected = condition === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setCondition(c.id)}
                    style={{
                      ...styles.condCard,
                      borderColor: isSelected ? '#16a34a' : '#e2e8f0',
                      boxShadow: isSelected ? '0 0 0 2px #bbf7d0' : 'none',
                      backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                    }}
                  >
                    <div style={styles.condIconBox}>
                      <span style={{ fontSize: '32px' }}>{c.icon}</span>
                      {isSelected && <span style={styles.greenCheckmark}>✓</span>}
                    </div>
                    <strong style={styles.condName}>{c.label}</strong>
                    <span style={styles.condDesc}>{c.desc}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 3: RESTORATION SERVICES */}
          <section id="step-3" style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>3. Restoration Services</h3>
              <p style={styles.cardSubtitle}>Select all treatment procedures needed for your project.</p>
            </div>

            <div style={styles.servicesGrid}>
              {RESTORATIONS.map((r) => {
                const isSelected = restorationScope.includes(r.id);
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      if (isSelected) {
                        setRestorationScope(restorationScope.filter((s) => s !== r.id));
                      } else {
                        setRestorationScope([...restorationScope, r.id]);
                      }
                    }}
                    style={{
                      ...styles.serviceCard,
                      borderColor: isSelected ? '#16a34a' : '#e2e8f0',
                      boxShadow: isSelected ? '0 0 0 2px #bbf7d0' : 'none',
                      backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                    }}
                  >
                    <div style={styles.serviceIconBox}>
                      <span style={{ fontSize: '30px' }}>{r.icon}</span>
                      {isSelected && <span style={styles.greenCheckmark}>✓</span>}
                    </div>
                    <strong style={styles.serviceName}>{r.label}</strong>
                    <span style={styles.serviceDesc}>{r.desc}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 4: MATERIALS & FINISH */}
          <section id="step-4" style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>4. Materials &amp; Finish</h3>
              <p style={styles.cardSubtitle}>Specify the wood type and protective finish coat.</p>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={styles.inputLabel}>Wood Species / Substrate</label>
              <select
                value={woodSpecies || ''}
                onChange={(e) => setWoodSpecies(e.target.value)}
                style={styles.dropdownInput}
              >
                <option value="">Select wood species...</option>
                <option value="cedar">Western Red Cedar</option>
                <option value="redwood">California Redwood</option>
                <option value="pressure_treated_pine">Pressure-Treated Pine</option>
                <option value="composite">Trex / Composite</option>
                <option value="ipe_hardwood">Ipe / Brazilian Hardwood</option>
              </select>
            </div>

            <label style={styles.inputLabel}>Protective Coating / Finish</label>
            <div style={styles.finishesGrid}>
              {FINISHES.map((f) => {
                const isSelected = coatingType === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setCoatingType(f.id)}
                    style={{
                      ...styles.finishCard,
                      borderColor: isSelected ? '#16a34a' : '#e2e8f0',
                      boxShadow: isSelected ? '0 0 0 2px #bbf7d0' : 'none',
                      backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                    }}
                  >
                    <div style={styles.finishIconBox}>
                      <span style={{ fontSize: '28px' }}>{f.icon}</span>
                      {isSelected && <span style={styles.greenCheckmark}>✓</span>}
                    </div>
                    <strong style={styles.finishName}>{f.label}</strong>
                    <span style={styles.finishDesc}>{f.desc}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 5: PHOTOGRAPHS & REAL INSPIRATION */}
          <section id="step-5" style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>5. Photographs &amp; Inspiration</h3>
              <p style={styles.cardSubtitle}>Upload photos of your deck or review real deck finish examples.</p>
            </div>

            {/* Photo Upload Zone */}
            <div style={styles.uploadDropzone}>
              <span style={{ fontSize: '32px', marginBottom: '8px' }}>📷</span>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>Upload Deck Photos (Optional)</strong>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 10px 0' }}>
                Drag and drop your photos here, or browse from your computer.
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setPhotos(files);
                }}
                style={{ fontSize: '12px' }}
              />
              {photos.length > 0 && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>
                  ✓ {photos.length} photo(s) selected
                </div>
              )}
            </div>

            {/* Real Deck Photos Gallery from the Internet */}
            <div style={{ marginTop: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '10px' }}>
                Real Deck Restoration Examples:
              </span>
              <div style={styles.inspirationGrid}>
                {INSPIRATION_PHOTOS.map((pic, idx) => (
                  <div key={idx} style={styles.inspireCard}>
                    <img src={pic.url} alt={pic.title} style={styles.inspireImg} />
                    <span style={styles.inspireTitle}>{pic.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 6: ADDITIONAL DETAILS */}
          <section id="step-6" style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>6. Additional Details &amp; Location</h3>
              <p style={styles.cardSubtitle}>Provide a name and property address for this estimate.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={styles.inputLabel}>Project Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Backyard Cedar Deck"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={styles.textInput}
                />
              </div>

              <div>
                <label style={styles.inputLabel}>Property Address</label>
                <input
                  type="text"
                  placeholder="Street address (e.g. 742 Evergreen Terrace)"
                  value={propertyAddress.street}
                  onChange={(e) => setPropertyAddress({ ...propertyAddress, street: e.target.value })}
                  style={styles.textInput}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={styles.inputLabel}>City</label>
                  <input
                    type="text"
                    placeholder="Springfield"
                    value={propertyAddress.city}
                    onChange={(e) => setPropertyAddress({ ...propertyAddress, city: e.target.value })}
                    style={styles.textInput}
                  />
                </div>
                <div>
                  <label style={styles.inputLabel}>State</label>
                  <input
                    type="text"
                    placeholder="IL"
                    value={propertyAddress.state}
                    onChange={(e) => setPropertyAddress({ ...propertyAddress, state: e.target.value })}
                    style={styles.textInput}
                  />
                </div>
                <div>
                  <label style={styles.inputLabel}>Zip Code</label>
                  <input
                    type="text"
                    placeholder="62704"
                    value={propertyAddress.zipCode}
                    onChange={(e) => setPropertyAddress({ ...propertyAddress, zipCode: e.target.value })}
                    style={styles.textInput}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 7: SUBMISSION ACTION BAR */}
          <section id="step-7" style={styles.cardSection}>
            <div style={styles.bottomBtnBar}>
              <button
                type="button"
                onClick={() => handleSave('DRAFT')}
                disabled={submitting}
                style={styles.saveDraftBtn}
              >
                💾 Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSave('SUBMITTED')}
                disabled={submitting || floorArea <= 0}
                style={styles.submitEstimateBtn}
              >
                {submitting ? 'Generating Estimate...' : 'Generate Official Estimate &rarr;'}
              </button>
            </div>
          </section>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDEBAR: STATIC STICKY SUMMARY & SINGLE ESTIMATE */}
        {/* ======================================================== */}
        <aside style={styles.rightSidebar}>
          {/* 1. ESTIMATION PROGRESS CARD */}
          <div style={styles.sidebarCard}>
            <div style={styles.progressRow}>
              {/* Circular Gauge */}
              <div style={styles.circleWrap}>
                <svg width="90" height="90" viewBox="0 0 90 90">
                  <circle
                    cx="45"
                    cy="45"
                    r={radius}
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="45"
                    cy="45"
                    r={radius}
                    stroke="#16a34a"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 45 45)"
                    style={{ transition: 'stroke-dashoffset 0.35s ease' }}
                  />
                </svg>
                <div style={styles.circleCenterText}>
                  <strong style={{ fontSize: '18px', color: '#0f172a' }}>
                    {stepStatus.completedCount}/7
                  </strong>
                  <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase' }}>
                    Completed
                  </span>
                </div>
              </div>

              {/* Progress Text */}
              <div>
                <h4 style={styles.sidebarCardHeading}>Estimation Progress</h4>
                <p style={styles.sidebarCardSub}>
                  {stepStatus.completedCount} of 7 Steps Completed
                </p>
              </div>
            </div>

            {/* Dynamic Checklist */}
            <div style={styles.checklist}>
              {stepStatus.steps.map((st) => (
                <div key={st.num} style={styles.checkItem}>
                  <div style={styles.checkItemLeft}>
                    <span style={{ color: st.done ? '#16a34a' : '#94a3b8', fontSize: '13px' }}>
                      {st.done ? '✓' : '○'}
                    </span>
                    <span style={{ ...styles.checkItemText, color: st.done ? '#0f172a' : '#64748b' }}>
                      {st.num}. {st.name}
                    </span>
                  </div>
                  <span
                    style={{
                      ...styles.checkBadge,
                      backgroundColor: st.done ? '#dcfce7' : '#f1f5f9',
                      color: st.done ? '#15803d' : '#94a3b8',
                    }}
                  >
                    {st.done ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. YOUR SELECTIONS SUMMARY CARD */}
          <div style={styles.sidebarCard}>
            <div style={styles.cardHeaderRow}>
              <h4 style={styles.sidebarCardHeading}>Your Selections</h4>
              <button
                type="button"
                onClick={() => scrollToSection('step-1')}
                style={styles.editBtn}
              >
                ✏️ Edit
              </button>
            </div>

            <div style={styles.selList}>
              <div style={styles.selRow}>
                <span style={styles.selLabel}>📐 Deck Shape</span>
                <strong style={styles.selVal}>
                  {selectedShapeObj ? selectedShapeObj.label : '—'}
                </strong>
              </div>
              <div style={styles.selRow}>
                <span style={styles.selLabel}>📏 Dimensions</span>
                <strong style={styles.selVal}>
                  {length && width ? `${length} ft × ${width} ft` : '—'}
                </strong>
              </div>
              <div style={styles.selRow}>
                <span style={styles.selLabel}>📑 Deck Area</span>
                <strong style={styles.selVal}>
                  {floorArea > 0 ? `${floorArea} sq ft` : '—'}
                </strong>
              </div>
              <div style={styles.selRow}>
                <span style={styles.selLabel}>🪜 Deck Height</span>
                <strong style={styles.selVal}>
                  {selectedHeightObj ? `${selectedHeightObj.label} ${selectedHeightObj.range}` : '—'}
                </strong>
              </div>
              <div style={styles.selRow}>
                <span style={styles.selLabel}>🪜 Number of Levels</span>
                <strong style={styles.selVal}>
                  {selectedLevelsObj ? selectedLevelsObj.label : '—'}
                </strong>
              </div>
            </div>
          </div>

          {/* 3. REFERENCE - SELECTED SHAPE CARD WITH REAL INTERNET IMAGE */}
          <div style={styles.sidebarCard}>
            <h4 style={styles.sidebarCardHeading}>Reference &ndash; Selected Shape</h4>
            {selectedShapeObj ? (
              <div style={styles.refCardInner}>
                <img
                  src={selectedShapeObj.realImg}
                  alt={selectedShapeObj.refTitle}
                  style={styles.refRealImage}
                />
                <div>
                  <strong style={{ fontSize: '13px', color: '#15803d' }}>
                    {selectedShapeObj.refTitle}
                  </strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                    {selectedShapeObj.refDesc}
                  </p>
                </div>
              </div>
            ) : (
              <div style={styles.refEmptyPrompt}>
                Select a deck shape above to view architectural photo reference.
              </div>
            )}
          </div>

          {/* 4. LIVE ESTIMATE (PREVIEW) CARD — SINGLE AMOUNT, NO MINIMUM JOB PRICE */}
          <div style={styles.sidebarCard}>
            <div style={styles.cardHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🧮</span>
                <h4 style={{ ...styles.sidebarCardHeading, color: '#15803d' }}>
                  Live Estimate (Preview)
                </h4>
              </div>
              {calculating && <span style={{ fontSize: '10px', color: '#16a34a' }}>Updating...</span>}
            </div>

            {floorArea > 0 ? (
              <div style={styles.pricingTable}>
                <div style={styles.priceLine}>
                  <span>Materials (Est.)</span>
                  <strong>${materialsEst.toFixed(2)}</strong>
                </div>
                <div style={styles.priceLine}>
                  <span>Services (Est.)</span>
                  <strong>${servicesEst.toFixed(2)}</strong>
                </div>
                <div style={styles.priceLine}>
                  <span>Labor (Est.)</span>
                  <strong>${laborEst.toFixed(2)}</strong>
                </div>
                <div style={styles.priceLine}>
                  <span>Travel / Mobilization</span>
                  <strong>${travelEst.toFixed(2)}</strong>
                </div>

                <div style={styles.priceDivider} />

                <div style={styles.priceLine}>
                  <span>Sub Total</span>
                  <strong>${subTotalEst.toFixed(2)}</strong>
                </div>
                <div style={styles.priceLine}>
                  <span>Tax (8.25%)</span>
                  <strong>${taxEst.toFixed(2)}</strong>
                </div>

                {/* SINGLE AMOUNT ESTIMATED TOTAL BLOCK — NO MINIMUM JOB PRICE */}
                <div style={styles.estimatedTotalBlock}>
                  <span>Estimated Total</span>
                  <strong style={{ fontSize: '20px', fontWeight: '900' }}>
                    ${finalSingleTotal.toFixed(2)}
                  </strong>
                </div>
              </div>
            ) : (
              <div style={styles.pricingEmptyPrompt}>
                Enter deck length and width to calculate instant single-amount total.
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* MEASUREMENT GUIDE MODAL */}
      {showMeasureGuide && (
        <div style={styles.modalOverlay} onClick={() => setShowMeasureGuide(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>📐 Deck Measurement &amp; Level Guide</h3>
              <button type="button" onClick={() => setShowMeasureGuide(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <p>Follow these standard tips to measure your deck accurately:</p>
              <ul>
                <li><strong>Length:</strong> Outer edge from side to side across the main facade.</li>
                <li><strong>Width:</strong> Outer edge extending out from the house wall.</li>
                <li><strong>Levels:</strong> Multiple distinct deck tiers count as separate levels.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  estimatorPageContainer: {
    backgroundColor: '#f8fafc',
    minHeight: '100%',
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
  },
  stepperBar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '10px 24px',
    position: 'sticky',
    top: 0,
    zIndex: 25,
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  stepperInner: {
    maxWidth: '1380px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  stepPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    flexShrink: 0,
  },
  stepPillNum: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '800',
  },
  stepperChevron: {
    color: '#94a3b8',
    fontSize: '12px',
  },
  mainGrid: {
    maxWidth: '1380px',
    margin: '20px auto',
    padding: '0 24px 60px 24px',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 340px',
    gap: '24px',
    alignItems: 'start',
  },
  formScrollColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightSidebar: {
    position: 'sticky',
    top: '70px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sidebarCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  cardSection: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '22px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  cardHeader: {
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },
  shapeCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '12px',
  },
  shapeCard: {
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    transition: 'all 0.15s ease',
  },
  shapeIconWrap: {
    height: '76px',
    position: 'relative',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenCheckmark: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '900',
  },
  shapeTextWrap: {
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
  },
  shapeName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
  },
  shapeDesc: {
    fontSize: '10px',
    color: '#64748b',
    marginTop: '2px',
    lineHeight: 1.3,
  },
  dimTwoCol: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    gap: '20px',
    alignItems: 'stretch',
  },
  dimSvgBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimInputsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  dimInputRow: {
    display: 'flex',
    gap: '12px',
  },
  inputLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '4px',
  },
  inputWithUnit: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  inputInner: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '8px 10px',
    fontSize: '13px',
  },
  unitSuffix: {
    padding: '0 10px',
    fontSize: '12px',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
  },
  calcAreaBadge: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  tipBox: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fef3c7',
    borderRadius: '8px',
    padding: '10px 14px',
  },
  tipList: {
    margin: '4px 0',
    paddingLeft: '18px',
    fontSize: '11px',
    color: '#78350f',
    lineHeight: 1.4,
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    fontSize: '11px',
    fontWeight: '700',
    color: '#2563eb',
    cursor: 'pointer',
    padding: 0,
    marginTop: '4px',
  },
  heightCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  heightCard: {
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '12px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    position: 'relative',
    transition: 'all 0.15s ease',
  },
  heightIconWrap: {
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px',
    position: 'relative',
    width: '100%',
  },
  heightName: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
  },
  heightRange: {
    fontSize: '10px',
    color: '#64748b',
    marginTop: '2px',
  },
  levelsCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  levelCard: {
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '14px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    position: 'relative',
    transition: 'all 0.15s ease',
  },
  levelIconWrap: {
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px',
    position: 'relative',
    width: '100%',
  },
  levelName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
  },
  levelDesc: {
    fontSize: '10px',
    color: '#64748b',
    marginTop: '2px',
  },
  conditionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  condCard: {
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '14px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    position: 'relative',
    transition: 'all 0.15s ease',
  },
  condIconBox: {
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px',
    position: 'relative',
    width: '100%',
  },
  condName: {
    fontSize: '12px',
    color: '#0f172a',
    marginBottom: '3px',
  },
  condDesc: {
    fontSize: '10px',
    color: '#64748b',
    lineHeight: 1.3,
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  serviceCard: {
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '14px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    position: 'relative',
    transition: 'all 0.15s ease',
  },
  serviceIconBox: {
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px',
    position: 'relative',
    width: '100%',
  },
  serviceName: {
    fontSize: '12px',
    color: '#0f172a',
    marginBottom: '3px',
  },
  serviceDesc: {
    fontSize: '10px',
    color: '#64748b',
    lineHeight: 1.3,
  },
  dropdownInput: {
    width: '100%',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    outline: 'none',
  },
  finishesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  finishCard: {
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '14px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    position: 'relative',
    transition: 'all 0.15s ease',
  },
  finishIconBox: {
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px',
    position: 'relative',
    width: '100%',
  },
  finishName: {
    fontSize: '12px',
    color: '#0f172a',
    marginBottom: '3px',
  },
  finishDesc: {
    fontSize: '10px',
    color: '#64748b',
    lineHeight: 1.3,
  },
  uploadDropzone: {
    border: '2px dashed #cbd5e1',
    borderRadius: '10px',
    padding: '28px 20px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspirationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  inspireCard: {
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  inspireImg: {
    width: '100%',
    height: '90px',
    objectFit: 'cover',
    display: 'block',
  },
  inspireTitle: {
    display: 'block',
    padding: '6px 8px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#334155',
  },
  textInput: {
    width: '100%',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  bottomBtnBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveDraftBtn: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  submitEstimateBtn: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '11px 24px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '14px',
  },
  circleWrap: {
    width: '90px',
    height: '90px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  circleCenterText: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarCardHeading: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  sidebarCardSub: {
    fontSize: '11px',
    color: '#64748b',
    margin: '2px 0 0 0',
  },
  checklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '10px',
  },
  checkItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
  },
  checkItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  checkItemText: {
    fontWeight: '600',
  },
  checkBadge: {
    fontSize: '9px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '10px',
    textTransform: 'uppercase',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  editBtn: {
    background: 'none',
    border: 'none',
    fontSize: '11px',
    fontWeight: '700',
    color: '#2563eb',
    cursor: 'pointer',
    padding: 0,
  },
  selList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  selRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    borderBottom: '1px solid #f8fafc',
    paddingBottom: '4px',
  },
  selLabel: {
    color: '#64748b',
  },
  selVal: {
    color: '#0f172a',
    fontWeight: '700',
  },
  refCardInner: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  refRealImage: {
    width: '100%',
    height: '110px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  refEmptyPrompt: {
    padding: '14px 8px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '11px',
    lineHeight: 1.4,
  },
  pricingTable: {
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '12px',
  },
  priceLine: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#475569',
  },
  priceDivider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '4px 0',
  },
  estimatedTotalBlock: {
    backgroundColor: '#15803d',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
  },
  pricingEmptyPrompt: {
    padding: '14px 8px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '11px',
    lineHeight: 1.4,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px',
    color: '#b91c1c',
    fontSize: '13px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '10px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#94a3b8',
  },
  modalBody: {
    fontSize: '13px',
    color: '#334155',
    lineHeight: 1.6,
  },
};
