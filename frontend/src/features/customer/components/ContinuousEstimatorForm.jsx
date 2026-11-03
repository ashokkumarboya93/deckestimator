// =============================================
// Deck Estimator — Continuous Scroll Estimator Form
// =============================================
// Matches Image 2: Static Right Sidebar with circular progress, your selections,
// shape reference, live pricing preview, and scrollable middle form with SVG illustrations.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeck, updateDeck } from '../api/decksApi';
import { createEstimate, calculateLivePricing } from '../api/estimatesApi';
import {
  RectangleDeckSvg,
  LShapeDeckSvg,
  MultiLevelDeckSvg,
  CustomDeckSvg,
  TopDownDeckPlanSvg,
  HeightGroundSvg,
  HeightLowSvg,
  HeightMediumSvg,
  HeightHighSvg,
} from './DeckDiagrams';

const SHAPES = [
  {
    id: 'rectangle',
    label: 'Rectangle',
    desc: 'Most common shape',
    Svg: RectangleDeckSvg,
    refTitle: 'Rectangle Deck',
    refDesc: 'A single, flat deck surface in a rectangular shape.',
  },
  {
    id: 'l_shaped',
    label: 'L-Shape',
    desc: 'Two connected sections',
    Svg: LShapeDeckSvg,
    refTitle: 'L-Shaped Deck',
    refDesc: 'Wraps around the corner of a house with two connected sections.',
  },
  {
    id: 'multi_level',
    label: 'Multi-Level',
    desc: 'More than one level',
    Svg: MultiLevelDeckSvg,
    refTitle: 'Multi-Level Deck',
    refDesc: 'Stepped deck platform with connecting stairs between tiers.',
  },
  {
    id: 'custom',
    label: 'Custom',
    desc: 'Unique shape (e.g., circular)',
    Svg: CustomDeckSvg,
    refTitle: 'Custom Deck',
    refDesc: 'Curved, octagonal, or multi-faceted custom deck layout.',
  },
];

const HEIGHTS = [
  { id: 'ground_level', label: 'Ground Level', range: '(0 – 2 ft)', Svg: HeightGroundSvg },
  { id: 'low', label: 'Low', range: '(2 – 4 ft)', Svg: HeightLowSvg },
  { id: 'medium', label: 'Medium', range: '(4 – 8 ft)', Svg: HeightMediumSvg },
  { id: 'high', label: 'High', range: '(8+ ft)', Svg: HeightHighSvg },
];

const LEVELS = [
  { id: 1, label: 'Single Level', Svg: RectangleDeckSvg },
  { id: 2, label: 'Two Levels', Svg: MultiLevelDeckSvg },
  { id: 3, label: 'Three or More Levels', Svg: MultiLevelDeckSvg },
];

const CONDITIONS = [
  { id: 'good', label: 'Good', desc: 'Sound wood, clean, light wash required', img: 'https://images.unsplash.com/photo-1695550056778-de79c8cd909e?auto=format&fit=crop&w=320&q=80' },
  { id: 'weathered', label: 'Weathered', desc: 'Grayed, sun-worn; needs brightening', img: 'https://images.unsplash.com/photo-1768173756660-45fd2bfe6be6?auto=format&fit=crop&w=320&q=80' },
  { id: 'peeling_stained', label: 'Peeling / Stained', desc: 'Old coating failing; requires chemical strip', img: 'https://images.unsplash.com/photo-1672365916735-066b8afce771?auto=format&fit=crop&w=320&q=80' },
  { id: 'damaged', label: 'Damaged / Rough', desc: 'Splintered or deep cracks; needs sanding', img: 'https://images.unsplash.com/photo-1768173756660-45fd2bfe6be6?auto=format&fit=crop&w=320&q=80' },
];

const RESTORATIONS = [
  { id: 'cleaning', label: 'Deep Cleaning', desc: 'Eco scrub & pressure wash', img: 'https://images.unsplash.com/photo-1695550056778-de79c8cd909e?auto=format&fit=crop&w=320&q=80' },
  { id: 'stripping', label: 'Stain Stripping', desc: 'Chemical stripping of old stains', img: 'https://images.unsplash.com/photo-1672365916735-066b8afce771?auto=format&fit=crop&w=320&q=80' },
  { id: 'sanding', label: 'Deck Sanding', desc: 'Smooth rough grain & splinters', img: 'https://images.unsplash.com/photo-1679797878543-66c1e502d413?auto=format&fit=crop&w=320&q=80' },
  { id: 'full_restoration', label: 'Full Restoration', desc: 'Complete turnkey strip, sand & stain', img: 'https://images.unsplash.com/photo-1659320681808-4cf523d261a2?auto=format&fit=crop&w=320&q=80' },
];

const FINISHES = [
  { id: 'natural', label: 'Natural / Clear', desc: 'Highlights natural grain; water repellent', img: 'https://images.unsplash.com/photo-1768173756660-45fd2bfe6be6?auto=format&fit=crop&w=320&q=80' },
  { id: 'semi_transparent_stain', label: 'Semi-Transparent Stain', desc: 'Adds rich pigment with visible wood grain', img: 'https://images.unsplash.com/photo-1695550056778-de79c8cd909e?auto=format&fit=crop&w=320&q=80' },
  { id: 'solid_stain', label: 'Solid Stain', desc: 'Opaque protective color coat', img: 'https://images.unsplash.com/photo-1672365916735-066b8afce771?auto=format&fit=crop&w=320&q=80' },
  { id: 'clear_sealer', label: 'Clear Sealer', desc: 'Hydrophobic moisture lock protection', img: 'https://images.unsplash.com/photo-1768173756660-45fd2bfe6be6?auto=format&fit=crop&w=320&q=80' },
];

export default function ContinuousEstimatorForm({ initialData = null, isEditing = false, deckId = null }) {
  const navigate = useNavigate();

  // 1. Deck Details
  const [shape, setShape] = useState(initialData?.deckShape || 'rectangle');
  const [length, setLength] = useState(initialData?.dimensions?.length || 20);
  const [width, setWidth] = useState(initialData?.dimensions?.width || 12);
  const [unit, setUnit] = useState(initialData?.measurementUnit || 'ft');
  const [height, setHeight] = useState('ground_level');
  const [levels, setLevels] = useState(initialData?.structureDetails?.levels || 1);

  // Components
  const [hasRailings, setHasRailings] = useState(true);
  const [railingLength, setRailingLength] = useState(40);
  const [railingStyle, setRailingStyle] = useState('plain_2x2');
  const [hasStairs, setHasStairs] = useState(true);
  const [stairCount, setStairCount] = useState(5);
  const [hasFascia, setHasFascia] = useState(false);
  const [fasciaLength, setFasciaLength] = useState(20);
  const [hasPergola, setHasPergola] = useState(false);
  const [pergolaLength, setPergolaLength] = useState(100);
  const [includeJoists, setIncludeJoists] = useState(false);
  const [hasSiding, setHasSiding] = useState(false);
  const [sidingArea, setSidingArea] = useState(60);

  // 2. Condition & Restoration
  const [condition, setCondition] = useState('weathered');
  const [conditionFlags, setConditionFlags] = useState(['weathered_wood']);
  const [damageNotes, setDamageNotes] = useState('');
  const [restorationScope, setRestorationScope] = useState(['cleaning']);

  // 3. Finish & Species
  const [woodSpecies, setWoodSpecies] = useState('cedar');
  const [coatingType, setCoatingType] = useState('semi_transparent_stain');
  const [coatingConfidence, setCoatingConfidence] = useState('medium');

  // 4. Photos & Project Info
  const [photos, setPhotos] = useState([]);
  const [projectName, setProjectName] = useState(initialData?.projectName || 'Backyard Deck');
  const [projectDescription, setProjectDescription] = useState(initialData?.projectDescription || '');
  const [propertyAddress, setPropertyAddress] = useState({
    street: initialData?.propertyAddress?.street || '123 Meadow Lane',
    city: initialData?.propertyAddress?.city || 'Springfield',
    state: initialData?.propertyAddress?.state || 'IL',
    zipCode: initialData?.propertyAddress?.zipCode || '62701',
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
    const l = Number(length) || 0;
    const w = Number(width) || 0;
    return l * w;
  }, [length, width]);

  // Selected Shape Reference Object
  const selectedShapeObj = useMemo(() => {
    return SHAPES.find((s) => s.id === shape) || SHAPES[0];
  }, [shape]);

  // Selected Height Object
  const selectedHeightObj = useMemo(() => {
    return HEIGHTS.find((h) => h.id === height) || HEIGHTS[0];
  }, [height]);

  // Selected Levels Object
  const selectedLevelsObj = useMemo(() => {
    return LEVELS.find((l) => l.id === levels) || LEVELS[0];
  }, [levels]);

  // DYNAMIC STEP COMPLETION PROGRESS
  const stepStatus = useMemo(() => {
    const step1 = floorArea > 0 && Boolean(shape);
    const step2 = Boolean(condition);
    const step3 = restorationScope.length > 0;
    const step4 = Boolean(coatingType) && Boolean(woodSpecies);
    const step5 = photos.length >= 0; // Optional photos
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
  }, [floorArea, shape, condition, restorationScope, coatingType, woodSpecies, photos, projectName]);

  // Real-Time Pricing Calculation
  const runPricingCalc = useCallback(async () => {
    if (floorArea <= 0) return;
    setCalculating(true);
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
    } catch {
      // Keep previous valid pricing
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

  // Save Deck & Estimate
  const handleSave = async (status = 'SUBMITTED') => {
    if (floorArea <= 0) {
      setSubmitError('Please enter valid deck length and width.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Create/Update Deck
      const deckPayload = {
        projectName: projectName.trim() || 'Backyard Deck',
        projectDescription: projectDescription.trim(),
        measurementUnit: unit,
        deckShape: shape,
        dimensions: { length: Number(length) || 0, width: Number(width) || 0, area: floorArea },
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
        const created = await createDeck(deckPayload);
        activeDeckId = created.id || created._id;
      }

      // 2. Generate Official Estimate Snapshot
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
      };

      const est = await createEstimate(estimatePayload);

      if (status === 'DRAFT') {
        navigate('/customer/dashboard');
      } else {
        navigate(`/customer/estimates/${est?._id || est?.id}`);
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

  // SVG Progress Ring Calculation (Radius 45, Perimeter ~282.7)
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
                  backgroundColor: st.num === 1 ? '#2563eb' : '#f8fafc',
                  color: st.num === 1 ? '#ffffff' : '#334155',
                  borderColor: st.num === 1 ? '#2563eb' : '#e2e8f0',
                }}
                onClick={() => scrollToSection(`step-${st.num}`)}
              >
                <span
                  style={{
                    ...styles.stepPillNum,
                    backgroundColor: st.num === 1 ? '#ffffff' : '#e2e8f0',
                    color: st.num === 1 ? '#2563eb' : '#475569',
                  }}
                >
                  {st.num}
                </span>
                <span>{st.name}</span>
              </div>
              {i < 6 && <span style={styles.stepperChevron}>&gt;</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 2-COLUMN LAYOUT: SCROLLABLE MIDDLE FORM + STATIC RIGHT SIDEBAR */}
      <div style={styles.mainGrid}>
        {/* MIDDLE SCROLLABLE FORM */}
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
              <p style={styles.cardSubtitle}>Choose the shape that best matches your deck.</p>
            </div>

            <div style={styles.shapeCardsGrid}>
              {SHAPES.map((s) => {
                const isSelected = shape === s.id;
                const SvgComponent = s.Svg;
                return (
                  <div
                    key={s.id}
                    onClick={() => setShape(s.id)}
                    style={{
                      ...styles.shapeCard,
                      borderColor: isSelected ? '#16a34a' : '#e2e8f0',
                      boxShadow: isSelected ? '0 0 0 2px #bbf7d0' : 'none',
                    }}
                  >
                    <div style={styles.shapeSvgWrap}>
                      <SvgComponent width="100%" height="86" />
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
              <p style={styles.cardSubtitle}>Measure the main deck area. See the image for reference.</p>
            </div>

            <div style={styles.dimTwoCol}>
              {/* Left: Top Down Floor Plan */}
              <div style={styles.dimSvgBox}>
                <TopDownDeckPlanSvg
                  width="100%"
                  height="170"
                  lengthVal={length}
                  widthVal={width}
                  unit={unit}
                />
              </div>

              {/* Right: Inputs & Calculator */}
              <div style={styles.dimInputsCol}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={styles.labelRequired}>Length (ft) *</label>
                    <div style={styles.inputWithUnit}>
                      <input
                        type="number"
                        min="1"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        style={styles.inputInner}
                      />
                      <span style={styles.unitSuffix}>ft</span>
                    </div>
                  </div>

                  <div>
                    <label style={styles.labelRequired}>Width (ft) *</label>
                    <div style={styles.inputWithUnit}>
                      <input
                        type="number"
                        min="1"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        style={styles.inputInner}
                      />
                      <span style={styles.unitSuffix}>ft</span>
                    </div>
                  </div>
                </div>

                {/* Calculated Deck Area Green Badge */}
                <div style={styles.calcAreaBadge}>
                  <span style={{ fontSize: '18px' }}>🧮</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '700' }}>Calculated Deck Area</span>
                    <strong style={{ fontSize: '18px', color: '#14532d' }}>{floorArea} sq ft</strong>
                  </div>
                </div>

                {/* How to Measure Tip Box */}
                <div style={styles.tipBox}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span>💡</span>
                    <strong>How to measure?</strong>
                  </div>
                  <ul style={styles.tipList}>
                    <li>Measure the usable deck surface.</li>
                    <li>Include only the main deck area.</li>
                    <li>Do not include stairs or railings.</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => setShowMeasureGuide(true)}
                    style={styles.tipLink}
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
              <p style={styles.cardSubtitle}>Select how high the deck surface is from the ground.</p>
            </div>

            <div style={styles.heightCardsGrid}>
              {HEIGHTS.map((h) => {
                const isSelected = height === h.id;
                const SvgComp = h.Svg;
                return (
                  <div
                    key={h.id}
                    onClick={() => setHeight(h.id)}
                    style={{
                      ...styles.heightCard,
                      borderColor: isSelected ? '#16a34a' : '#e2e8f0',
                      boxShadow: isSelected ? '0 0 0 2px #bbf7d0' : 'none',
                    }}
                  >
                    <div style={styles.heightSvgWrap}>
                      <SvgComp width="100%" height="70" />
                      {isSelected && <span style={styles.greenCheckmark}>✓</span>}
                    </div>
                    <div style={styles.heightTextWrap}>
                      <span style={styles.heightTitle}>{h.label}</span>
                      <span style={styles.heightSub}>{h.range}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 1.4 NUMBER OF LEVELS */}
          <section style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>1.4 Number of Levels</h3>
              <p style={styles.cardSubtitle}>A level is a flat deck surface at a different height.</p>
            </div>

            <div style={styles.levelsGrid}>
              {LEVELS.map((l) => {
                const isSelected = levels === l.id;
                const SvgComp = l.Svg;
                return (
                  <div
                    key={l.id}
                    onClick={() => setLevels(l.id)}
                    style={{
                      ...styles.levelCard,
                      borderColor: isSelected ? '#16a34a' : '#e2e8f0',
                      boxShadow: isSelected ? '0 0 0 2px #bbf7d0' : 'none',
                    }}
                  >
                    <div style={styles.levelSvgWrap}>
                      <SvgComp width="100%" height="75" />
                      {isSelected && <span style={styles.greenCheckmark}>✓</span>}
                    </div>
                    <div style={styles.levelTextWrap}>
                      <span style={styles.levelTitle}>{l.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ ...styles.tipBox, marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span>💡</span>
                <strong>What is a level?</strong>
              </div>
              <p style={{ margin: '4px 0 6px 0', fontSize: '12px', color: '#64748b' }}>
                A level is a flat deck surface. If your deck has multiple heights, select the correct number of levels.
              </p>
              <button
                type="button"
                onClick={() => setShowMeasureGuide(true)}
                style={styles.tipLink}
              >
                View Examples &rarr;
              </button>
            </div>
          </section>

          {/* STEP 2: DECK CONDITION */}
          <section id="step-2" style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>2. Deck Condition</h3>
              <p style={styles.cardSubtitle}>Select current surface wear to calculate accurate prep chemistry and labor.</p>
            </div>

            <div style={styles.shapeCardsGrid}>
              {CONDITIONS.map((c) => {
                const isSelected = condition === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setCondition(c.id);
                      if (c.id === 'peeling_stained') setConditionFlags(['heavy_mildew', 'peeling_coating']);
                      else if (c.id === 'weathered') setConditionFlags(['weathered_wood']);
                      else if (c.id === 'damaged') setConditionFlags(['weathered_wood', 'soft_damaged_wood']);
                      else setConditionFlags([]);
                    }}
                    style={{
                      ...styles.shapeCard,
                      borderColor: isSelected ? '#16a34a' : '#e2e8f0',
                      boxShadow: isSelected ? '0 0 0 2px #bbf7d0' : 'none',
                    }}
                  >
                    <div style={{ height: '80px', position: 'relative' }}>
                      <img src={c.img} alt={c.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {isSelected && <span style={styles.greenCheckmark}>✓</span>}
                    </div>
                    <div style={styles.shapeTextWrap}>
                      <span style={styles.shapeName}>{c.label}</span>
                      <span style={styles.shapeDesc}>{c.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* STEP 3: RESTORATION SERVICES */}
          <section id="step-3" style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>3. Restoration Services</h3>
              <p style={styles.cardSubtitle}>Choose specific restoration services or select Full Restoration.</p>
            </div>

            <div style={styles.shapeCardsGrid}>
              {RESTORATIONS.map((r) => {
                const isSelected = restorationScope.includes(r.id);
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      if (r.id === 'full_restoration') setRestorationScope(['full_restoration']);
                      else {
                        setRestorationScope((prev) =>
                          prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev.filter((x) => x !== 'full_restoration'), r.id]
                        );
                      }
                    }}
                    style={{
                      ...styles.shapeCard,
                      borderColor: isSelected ? '#16a34a' : '#e2e8f0',
                      boxShadow: isSelected ? '0 0 0 2px #bbf7d0' : 'none',
                    }}
                  >
                    <div style={{ height: '80px', position: 'relative' }}>
                      <img src={r.img} alt={r.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {isSelected && <span style={styles.greenCheckmark}>✓</span>}
                    </div>
                    <div style={styles.shapeTextWrap}>
                      <span style={styles.shapeName}>{r.label}</span>
                      <span style={styles.shapeDesc}>{r.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* STEP 4: MATERIALS & FINISH */}
          <section id="step-4" style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>4. Materials & Finish</h3>
              <p style={styles.cardSubtitle}>Select wood species and desired topcoat finish.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.labelRequired}>Wood Species</label>
              <select
                value={woodSpecies}
                onChange={(e) => setWoodSpecies(e.target.value)}
                style={styles.selectInputFull}
              >
                <option value="cedar">Western Red Cedar</option>
                <option value="pressure_treated_pine">Pressure-Treated Pine</option>
                <option value="redwood">California Redwood</option>
                <option value="hardwood_ipe">Hardwood (Ipe / Mahogany)</option>
                <option value="composite_trex">Composite / PVC (Clean-only)</option>
              </select>
            </div>

            <div style={styles.shapeCardsGrid}>
              {FINISHES.map((f) => {
                const isSelected = coatingType === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setCoatingType(f.id)}
                    style={{
                      ...styles.shapeCard,
                      borderColor: isSelected ? '#16a34a' : '#e2e8f0',
                      boxShadow: isSelected ? '0 0 0 2px #bbf7d0' : 'none',
                    }}
                  >
                    <div style={{ height: '80px', position: 'relative' }}>
                      <img src={f.img} alt={f.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {isSelected && <span style={styles.greenCheckmark}>✓</span>}
                    </div>
                    <div style={styles.shapeTextWrap}>
                      <span style={styles.shapeName}>{f.label}</span>
                      <span style={styles.shapeDesc}>{f.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* STEP 5: PHOTOGRAPHS */}
          <section id="step-5" style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>5. Photographs</h3>
              <p style={styles.cardSubtitle}>Upload reference images of your deck surface.</p>
            </div>

            <div style={styles.photoDropZone}>
              <input
                type="file"
                multiple
                accept="image/*"
                id="photo-upload-input"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const mapped = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
                  setPhotos((p) => [...p, ...mapped]);
                }}
              />
              <label htmlFor="photo-upload-input" style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: '30px' }}>📷</span>
                <p style={{ fontWeight: '700', margin: '6px 0 2px 0', color: '#0f172a' }}>Click to Choose Photos or Drag & Drop</p>
                <span style={{ fontSize: '11px', color: '#64748b' }}>PNG, JPG up to 10MB</span>
              </label>
            </div>

            {photos.length > 0 && (
              <div style={styles.photosThumbRow}>
                {photos.map((ph, idx) => (
                  <div key={idx} style={styles.photoThumb}>
                    <img src={ph.url} alt={ph.name} style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setPhotos((p) => p.filter((_, i) => i !== idx))}
                      style={styles.photoRemoveBtn}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* STEP 6: ADDITIONAL DETAILS */}
          <section id="step-6" style={styles.cardSection}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>6. Additional Details & Components</h3>
              <p style={styles.cardSubtitle}>Deck components and project identification.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={styles.labelRequired}>Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={styles.inputInnerFull}
                />
              </div>

              <div>
                <label style={styles.labelRequired}>Street Address</label>
                <input
                  type="text"
                  value={propertyAddress.street}
                  onChange={(e) => setPropertyAddress({ ...propertyAddress, street: e.target.value })}
                  style={styles.inputInnerFull}
                />
              </div>
            </div>

            {/* Components checkboxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={hasRailings}
                  onChange={(e) => setHasRailings(e.target.checked)}
                  style={{ accentColor: '#16a34a' }}
                />
                <span>Railings (40 linear ft)</span>
              </label>

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={hasStairs}
                  onChange={(e) => setHasStairs(e.target.checked)}
                  style={{ accentColor: '#16a34a' }}
                />
                <span>Stairs (5 steps)</span>
              </label>

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={includeJoists}
                  onChange={(e) => setIncludeJoists(e.target.checked)}
                  style={{ accentColor: '#16a34a' }}
                />
                <span>Underside Joists (+40% labor)</span>
              </label>
            </div>
          </section>

          {/* BOTTOM ACTIONS BAR */}
          <div style={styles.bottomActionsBar}>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSave('DRAFT')}
              style={styles.btnSaveDraft}
            >
              💾 Save as Draft
            </button>

            <button
              type="button"
              disabled={submitting || floorArea <= 0}
              onClick={() => handleSave('SUBMITTED')}
              style={styles.btnSubmitOfficial}
            >
              {submitting ? 'Generating...' : 'Next Section: Review & Save \u2192'}
            </button>
          </div>
        </div>

        {/* STATIC RIGHT SIDEBAR */}
        <aside style={styles.rightSidebar}>
          {/* 1. ESTIMATION PROGRESS CARD WITH CIRCULAR GAUGE */}
          <div style={styles.sidebarCard}>
            <div style={styles.circleProgressWrap}>
              {/* Circular Ring SVG */}
              <div style={styles.circleGaugeBox}>
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
                    style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                    transform="rotate(-90 45 45)"
                  />
                </svg>
                <div style={styles.circleGaugeText}>
                  <strong>{stepStatus.completedCount}/7</strong>
                  <span style={{ fontSize: '9px', color: '#64748b' }}>Completed</span>
                </div>
              </div>

              <div style={styles.progressInfo}>
                <h4 style={styles.progressTitle}>Estimation Progress</h4>
                <span style={styles.progressSubtitle}>
                  {stepStatus.completedCount} of 7 Steps Completed
                </span>
              </div>
            </div>

            {/* Checklist of 7 Steps */}
            <div style={styles.stepChecklist}>
              {stepStatus.steps.map((st) => (
                <div key={st.num} style={styles.stepCheckRow}>
                  <div style={styles.stepCheckLeft}>
                    <span style={st.done ? styles.checkIconGreen : styles.checkIconGray}>
                      {st.done ? '✓' : '○'}
                    </span>
                    <span style={{ fontSize: '11px', color: st.done ? '#0f172a' : '#64748b', fontWeight: st.done ? '700' : '500' }}>
                      {st.num}. {st.name}
                    </span>
                  </div>
                  <span style={st.done ? styles.statusPillGreen : styles.statusPillGray}>
                    {st.done ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. YOUR SELECTIONS CARD */}
          <div style={styles.sidebarCard}>
            <div style={styles.cardHeaderRow}>
              <h4 style={styles.sidebarCardHeading}>Your Selections</h4>
              <button
                type="button"
                onClick={() => scrollToSection('step-1')}
                style={styles.editBtnSmall}
              >
                ✏️ Edit
              </button>
            </div>

            <div style={styles.selectionsList}>
              <div style={styles.selRow}>
                <span style={styles.selLabel}>📐 Deck Shape</span>
                <strong style={styles.selVal}>{selectedShapeObj.label}</strong>
              </div>
              <div style={styles.selRow}>
                <span style={styles.selLabel}>📏 Dimensions</span>
                <strong style={styles.selVal}>{length} ft × {width} ft</strong>
              </div>
              <div style={styles.selRow}>
                <span style={styles.selLabel}>🧮 Deck Area</span>
                <strong style={styles.selVal}>{floorArea} sq ft</strong>
              </div>
              <div style={styles.selRow}>
                <span style={styles.selLabel}>🪜 Deck Height</span>
                <strong style={styles.selVal}>{selectedHeightObj.label} {selectedHeightObj.range}</strong>
              </div>
              <div style={styles.selRow}>
                <span style={styles.selLabel}>🪜 Number of Levels</span>
                <strong style={styles.selVal}>{selectedLevelsObj.label}</strong>
              </div>
            </div>
          </div>

          {/* 3. REFERENCE - SELECTED SHAPE CARD */}
          <div style={styles.sidebarCard}>
            <h4 style={styles.sidebarCardHeading}>Reference &ndash; Selected Shape</h4>
            <div style={styles.refCardInner}>
              <div style={styles.refThumbnail}>
                <selectedShapeObj.Svg width="100%" height="60" />
              </div>
              <div>
                <strong style={{ fontSize: '12px', color: '#15803d' }}>{selectedShapeObj.refTitle}</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b', lineHeight: 1.3 }}>
                  {selectedShapeObj.refDesc}
                </p>
              </div>
            </div>
          </div>

          {/* 4. LIVE ESTIMATE (PREVIEW) CARD */}
          <div style={styles.sidebarCard}>
            <div style={styles.cardHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🧮</span>
                <h4 style={{ ...styles.sidebarCardHeading, color: '#15803d' }}>Live Estimate (Preview)</h4>
              </div>
              {calculating && <span style={{ fontSize: '10px', color: '#16a34a' }}>Updating...</span>}
            </div>

            <div style={styles.pricingTable}>
              <div style={styles.priceLine}>
                <span>Materials (Est.)</span>
                <strong>${livePricing?.totalMaterialCost ? livePricing.totalMaterialCost.toFixed(2) : '720.00'}</strong>
              </div>
              <div style={styles.priceLine}>
                <span>Services (Est.)</span>
                <strong>$960.00</strong>
              </div>
              <div style={styles.priceLine}>
                <span>Labor (Est.)</span>
                <strong>${livePricing?.laborCost ? livePricing.laborCost.toFixed(2) : '480.00'}</strong>
              </div>
              <div style={styles.priceLine}>
                <span>Travel / Mobilization</span>
                <strong>$200.00</strong>
              </div>

              <div style={styles.priceDivider} />

              <div style={styles.priceLine}>
                <span>Sub Total</span>
                <strong>${livePricing?.baseEstimate ? livePricing.baseEstimate.toFixed(2) : '2,360.00'}</strong>
              </div>
              <div style={styles.priceLine}>
                <span>Tax (8.25%)</span>
                <strong>$194.70</strong>
              </div>
              <div style={styles.priceLineHighlight}>
                <span style={{ fontSize: '11px', color: '#854d0e' }}>Minimum Job Price (Applied)</span>
                <strong style={{ color: '#854d0e' }}>$2,500.00</strong>
              </div>

              {/* ESTIMATED TOTAL GREEN BLOCK */}
              <div style={styles.estimatedTotalBlock}>
                <span>Estimated Total</span>
                <strong style={{ fontSize: '18px' }}>
                  {livePricing?.displayQuote?.formatted || '$2,500.00'}
                </strong>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* MEASUREMENT GUIDE MODAL */}
      {showMeasureGuide && (
        <div style={styles.modalOverlay} onClick={() => setShowMeasureGuide(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>📐 Deck Measurement & Level Guide</h3>
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
  },
  stepperBar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '10px 24px',
    position: 'sticky',
    top: 0,
    zIndex: 25,
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
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
    padding: '0 24px',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 330px',
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
    margin: '0 0 4px 0',
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
  shapeSvgWrap: {
    height: '86px',
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
    gridTemplateColumns: '1.2fr 1fr',
    gap: '20px',
    alignItems: 'start',
  },
  dimSvgBox: {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  dimInputsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  labelRequired: {
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
    padding: '12px 14px',
  },
  tipList: {
    margin: '6px 0',
    paddingLeft: '18px',
    fontSize: '11px',
    color: '#78350f',
    lineHeight: 1.5,
  },
  tipLink: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: 0,
  },
  heightCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
  },
  heightCard: {
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
  },
  heightSvgWrap: {
    position: 'relative',
    height: '70px',
    backgroundColor: '#f8fafc',
  },
  heightTextWrap: {
    padding: '6px 8px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  heightTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
  },
  heightSub: {
    fontSize: '10px',
    color: '#64748b',
  },
  levelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '12px',
  },
  levelCard: {
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
  },
  levelSvgWrap: {
    position: 'relative',
    height: '75px',
    backgroundColor: '#f8fafc',
  },
  levelTextWrap: {
    padding: '8px',
    textAlign: 'center',
  },
  levelTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
  },
  circleProgressWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '14px',
  },
  circleGaugeBox: {
    position: 'relative',
    width: '90px',
    height: '90px',
    flexShrink: 0,
  },
  circleGaugeText: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    color: '#0f172a',
  },
  progressInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  progressTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  progressSubtitle: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '2px',
  },
  stepChecklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '10px',
  },
  stepCheckRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepCheckLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  checkIconGreen: {
    color: '#16a34a',
    fontWeight: '900',
    fontSize: '12px',
  },
  checkIconGray: {
    color: '#94a3b8',
    fontSize: '12px',
  },
  statusPillGreen: {
    fontSize: '9px',
    fontWeight: '700',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    padding: '1px 6px',
    borderRadius: '8px',
  },
  statusPillGray: {
    fontSize: '9px',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '1px 6px',
    borderRadius: '8px',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  sidebarCardHeading: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  editBtnSmall: {
    background: 'none',
    border: 'none',
    fontSize: '11px',
    fontWeight: '700',
    color: '#2563eb',
    cursor: 'pointer',
  },
  selectionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  selRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
  },
  selLabel: {
    color: '#64748b',
  },
  selVal: {
    color: '#0f172a',
    textAlign: 'right',
  },
  refCardInner: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px',
  },
  refThumbnail: {
    width: '70px',
    height: '50px',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    flexShrink: 0,
  },
  pricingTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    fontSize: '12px',
  },
  priceLine: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#334155',
  },
  priceDivider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '6px 0',
  },
  priceLineHighlight: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#fef3c7',
    padding: '4px 6px',
    borderRadius: '4px',
  },
  estimatedTotalBlock: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    fontWeight: '700',
  },
  selectInputFull: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    backgroundColor: '#ffffff',
  },
  inputInnerFull: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  checkboxLabel: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    backgroundColor: '#f8fafc',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  photoDropZone: {
    border: '2px dashed #cbd5e1',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
  },
  photosThumbRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '10px',
  },
  photoThumb: {
    width: '80px',
    height: '70px',
    borderRadius: '6px',
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid #cbd5e1',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    border: 'none',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#ffffff',
    fontSize: '9px',
    cursor: 'pointer',
  },
  bottomActionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
  },
  btnSaveDraft: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  btnSubmitOfficial: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 22px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 80,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '480px',
    width: '90%',
    padding: '20px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '10px',
    marginBottom: '12px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
  },
  modalBody: {
    fontSize: '13px',
    color: '#334155',
    lineHeight: 1.5,
  },
};
