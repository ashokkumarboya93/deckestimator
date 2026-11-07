// =============================================
// Deck Restoration Plus — Precision Estimator Engine
// =============================================
// Theme: Samsung Blue (#034EA2 / #0057B8) & Crisp White with Green accents
// - Initially EMPTY state: 0% progress until user configures parameters
// - All Sections feature Image + Caption title card styling (no description clutter)
// - Section 1: Dimensions with green Usable Floor Area highlight & chosen shape display
// - Section 2: Components (Railings, Stairs, Pergola, Privacy Wall, Siding, Fascia, Joists)
//   asking for sqft input upon selection (Main Deck Flooring removed as it is in Section 1)
// - Section 3: 8 Wood Species with image and caption title
// - Section 4: Site Accessibility & Elevation with real images & clearly shown foot ranges
// - Section 5: Existing Deck Finish & Coating (no price impact) with images and captions
// - Section 6: Restoration Scope of Work with 8 services + No Coating option
//   ($2.50 base rate + $1/sqft per coating)
// - Section 7: Deck Physical Condition with all 9 conditions (Good Condition exclusive)
//   plus optional board counts
// - Section 8: Project Information (Full Name & Phone removed; only Project Name required,
//   all other fields marked Optional)
// - 100% reliable submission creating Deck & Estimate and rendering Official Estimate Box
// - Client Q12 Strict Compliance: Customer sees ONE TOTAL NUMBER ONLY with zero breakdown

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeck, updateDeck } from '../api/decksApi';
import { createEstimate, calculateLivePricing } from '../api/estimatesApi';
import { leadApi } from '../api/leadApi';

// --- DATA DEFINITIONS WITH CURATED IMAGES & CAPTIONS ---

const SHAPES = [
  {
    id: 'rectangle',
    label: 'Rectangle',
    img: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80',
    desc: 'Classic uniform platform, max square footage efficiency.',
  },
  {
    id: 'square',
    label: 'Square',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    desc: 'Equal perimeter length and width, courtyard living.',
  },
  {
    id: 'l_shaped',
    label: 'L-Shape',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    desc: 'Wraps exterior corners, dual dining and lounge zones.',
  },
  {
    id: 'multi_level',
    label: 'Multi-Level',
    img: 'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=400&q=80',
    desc: 'Stepped transition tiers accommodating slope grades.',
  },
  {
    id: 'custom',
    label: 'Custom Shape',
    img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
    desc: 'Curved, angled or faceted bespoke architectural perimeter.',
  },
];

const COMPONENTS = [
  {
    id: 'railings',
    label: 'Perimeter Railings',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    field: 'railingSqft',
    prompt: 'Railing Surface (sq ft)',
    unit: 'sq ft',
    defaultVal: 120,
  },
  {
    id: 'stairs',
    label: 'Stair Steps',
    img: 'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=400&q=80',
    field: 'stairSteps',
    prompt: 'Number of Steps (Count)',
    unit: 'steps',
    defaultVal: 4,
    multiplier: 12,
  },
  {
    id: 'pergola',
    label: 'Pergola',
    img: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80',
    field: 'pergolaSqft',
    prompt: 'Pergola Framing (sq ft)',
    unit: 'sq ft',
    defaultVal: 150,
  },
  {
    id: 'privacy_wall',
    label: 'Privacy Wall / Fencing',
    img: 'https://images.unsplash.com/photo-1502005229762-ee1b2da97a06?auto=format&fit=crop&w=400&q=80',
    field: 'privacyWallSqft',
    prompt: 'Privacy Wall Surface (sq ft)',
    unit: 'sq ft',
    defaultVal: 80,
  },
  {
    id: 'siding',
    label: 'Exterior Siding',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    field: 'sidingSqft',
    prompt: 'Siding Area (sq ft)',
    unit: 'sq ft',
    defaultVal: 100,
  },
  {
    id: 'fascia',
    label: 'Perimeter Fascia',
    img: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80',
    field: 'fasciaSqft',
    prompt: 'Fascia Board Surface (sq ft)',
    unit: 'sq ft',
    defaultVal: 45,
  },
  {
    id: 'joists',
    label: 'Underside Joists',
    img: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=400&q=80',
    field: 'joistsSqft',
    prompt: 'Exposed Framing Joists (sq ft)',
    unit: 'sq ft',
    defaultVal: 120,
  },
];

const WOOD_SPECIES = [
  {
    id: 'pt_pine',
    name: 'Pressure-Treated Pine',
    img: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80',
    laborPct: '0% labor adj.',
    desc: 'Standard commercial softwood, treated for exterior ground contact.',
  },
  {
    id: 'cedar',
    name: 'Western Red Cedar',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    laborPct: '+10% labor adj.',
    desc: 'Naturally rot-resistant aromatic softwood with rich natural grain.',
  },
  {
    id: 'redwood',
    name: 'California Redwood',
    img: 'https://images.unsplash.com/photo-1502005229762-ee1b2da97a06?auto=format&fit=crop&w=400&q=80',
    laborPct: '+15% labor adj.',
    desc: 'Dense, durable heartwood with natural tannin resistance.',
  },
  {
    id: 'mahogany',
    name: 'Honduran Mahogany',
    img: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=400&q=80',
    laborPct: '+20% labor adj.',
    desc: 'High-density architectural hardwood with tight ribbon grain.',
  },
  {
    id: 'meranti',
    name: 'Meranti Hardwood',
    img: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=400&q=80',
    laborPct: '+20% labor adj.',
    desc: 'Durable exotic dark red hardwood, requires thin penetrating oils.',
  },
  {
    id: 'tigerwood',
    name: 'Tigerwood',
    img: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=400&q=80',
    laborPct: '+30% labor adj.',
    desc: 'Striking exotic Brazilian hardwood with dark striped grain.',
  },
  {
    id: 'teak',
    name: 'Burmese Teak',
    img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80',
    laborPct: '+35% labor adj.',
    desc: 'Extremely durable golden hardwood packed with natural silica.',
  },
  {
    id: 'trex',
    name: 'Composite Trex',
    img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=400&q=80',
    laborPct: '−55% credit (clean only)',
    desc: 'Engineered synthetic polymer core. No chemical strippers or stains.',
  },
];

const ELEVATIONS = [
  {
    id: 'ground',
    label: 'Ground Level',
    range: '0–2 ft elevation',
    img: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'low',
    label: 'Low Elevation',
    range: '2–4 ft elevation',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'first',
    label: 'First Story',
    range: '4–8 ft elevation',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'second',
    label: 'Second Story',
    range: '8–12 ft elevation',
    img: 'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'roof',
    label: 'Roof / Staging',
    range: 'Over 12 ft elevation',
    img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
  },
];

const EXISTING_COATINGS = [
  {
    id: 'none',
    label: 'Bare Wood / No Coating',
    img: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'sealer',
    label: 'Clear Sealer',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'transparent_stain',
    label: 'Transparent Stain',
    img: 'https://images.unsplash.com/photo-1502005229762-ee1b2da97a06?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'semi_transparent',
    label: 'Semi-Transparent Stain',
    img: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'solid_stain',
    label: 'Solid Color Stain',
    img: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'paint',
    label: 'Exterior Paint',
    img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80',
  },
];

const SERVICES_LIST = [
  {
    id: 'cleaning',
    name: 'Deck Cleaning (Deep Cleaning)',
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    rate: '100 sqft/hr',
  },
  {
    id: 'stripping',
    name: 'Deck Stripping (Stain Stripping)',
    img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
    rate: '50 sqft/hr',
  },
  {
    id: 'sanding',
    name: 'Deck Sanding (Floor & Railing)',
    img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
    rate: '60 sqft/hr',
  },
  {
    id: 'staining',
    name: 'Deck Staining (Conditioning)',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    rate: '100 sqft/hr',
  },
  {
    id: 'sealing',
    name: 'Deck Sealing (Clear Sealing)',
    img: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80',
    rate: '100 sqft/hr',
  },
  {
    id: 'repairs',
    name: 'Deck Board Repair / Replacement',
    img: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80',
    rate: 'Contractor Quoted',
  },
  {
    id: 'wood_brightening',
    name: 'Wood Brightening',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    rate: '100 sqft/hr',
  },
  {
    id: 'waterproofing',
    name: 'Waterproofing Barrier',
    img: 'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=400&q=80',
    rate: '100 sqft/hr',
  },
  {
    id: 'no_coating',
    name: 'No Coating / Natural Bare Finish',
    img: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80',
    rate: 'Starts @ $2.50/sqft',
  },
];

const CONDITIONS = [
  {
    id: 'good_condition',
    label: '1. Good Condition (Baseline)',
    img: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80',
    exclusive: true,
  },
  {
    id: 'weathered',
    label: '2. Weathered Wood',
    img: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'crack',
    label: '3. Cracks & Checks',
    img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
    hasCount: true,
  },
  {
    id: 'rotted',
    label: '4. Rotted Boards',
    img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
    hasCount: true,
  },
  {
    id: 'mold',
    label: '5. Heavy Mold & Mildew',
    img: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'peeling',
    label: '6. Peeling Coating',
    img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'water_damaged',
    label: '7. Water Damaged Wood',
    img: 'https://images.unsplash.com/photo-1502005229762-ee1b2da97a06?auto=format&fit=crop&w=400&q=80',
    hasCount: true,
  },
  {
    id: 'warped',
    label: '8. Warped Boards',
    img: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=400&q=80',
    hasCount: true,
  },
  {
    id: 'loose_board',
    label: '9. Loose Deck Boards',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    hasCount: true,
  },
];

export default function ContinuousEstimatorForm({ initialData = null, isEditing = false, deckId = null }) {
  const navigate = useNavigate();
  const isContractor = typeof window !== 'undefined' && window.location.pathname.startsWith('/contractor');

  // --- STATE HOOKS (INITIALLY EMPTY AS REQUESTED) ---

  // Section 1: Dimensions & Shape
  const [shape, setShape] = useState(initialData?.deckShape || '');
  const [length, setLength] = useState(initialData?.dimensions?.length ? String(initialData.dimensions.length) : '');
  const [width, setWidth] = useState(initialData?.dimensions?.width ? String(initialData.dimensions.width) : '');

  // Section 2: Components (Selected set & specific sqft)
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [componentSqft, setComponentSqft] = useState({});

  // Section 3: Wood Species
  const [woodSpecies, setWoodSpecies] = useState(initialData?.surfaceDetails?.woodSpecies || initialData?.surfaceDetails?.material || '');

  // Section 4: Site & Elevation
  const [height, setHeight] = useState(initialData?.structureDetails?.height || '');
  const [exactHeightFt, setExactHeightFt] = useState('');

  // Section 5: Existing Finish
  const [existingCoating, setExistingCoating] = useState(initialData?.surfaceDetails?.coatingStatus || '');

  // Section 6: Restoration Scope
  const [services, setServices] = useState([]);
  const [stainType, setStainType] = useState('semi');
  const [sandingType, setSandingType] = useState('mechanical_sanding');

  // Section 7: Deck Physical Condition
  const [conditions, setConditions] = useState([]);
  const [crackBoardCount, setCrackBoardCount] = useState('');
  const [rottedBoardCount, setRottedBoardCount] = useState('');
  const [warpedBoardCount, setWarpedBoardCount] = useState('');
  const [looseBoardCount, setLooseBoardCount] = useState('');
  const [waterDamagedBoardCount, setWaterDamagedBoardCount] = useState('');
  const [crackLooseOverlapCount, setCrackLooseOverlapCount] = useState('');

  // Section 8: Project Information
  const [projectName, setProjectName] = useState(initialData?.projectName || '');
  const [address, setAddress] = useState(initialData?.propertyAddress?.street || '');
  const [city, setCity] = useState(initialData?.propertyAddress?.city || '');
  const [state, setState] = useState(initialData?.propertyAddress?.state || '');
  const [zipCode, setZipCode] = useState(initialData?.propertyAddress?.zipCode || '');
  const [notes, setNotes] = useState('');

  // UI & Calculation state
  const [contractorPricing, setContractorPricing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Post-Estimate Box State
  const [officialEstimate, setOfficialEstimate] = useState(null);
  const [leadCreated, setLeadCreated] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  // Reach Out / Support Modal State
  const [reachOutOpen, setReachOutOpen] = useState(false);
  const [reachOutSubject, setReachOutSubject] = useState('Estimator Assistance & Deck Scope');
  const [reachOutMsg, setReachOutMsg] = useState('');
  const [reachOutSending, setReachOutSending] = useState(false);
  const [reachOutSuccess, setReachOutSuccess] = useState(false);

  // Architectural Reference Window Active Tab
  const [refTab, setRefTab] = useState('shape'); // 'shape' | 'wood'

  // --- RULE R1: TREX LOCK ---
  useEffect(() => {
    if (woodSpecies === 'trex' || woodSpecies === 'composite') {
      setServices((prev) => prev.filter((s) => s === 'cleaning' || s === 'no_coating'));
    }
  }, [woodSpecies]);

  // --- SQUARE DIMENSION COPY ---
  useEffect(() => {
    if (shape === 'square' && length) {
      setWidth(length);
    }
  }, [shape, length]);

  // Usable Floor Area (L × W)
  const floorArea = useMemo(() => {
    const l = Number(length) || 0;
    const w = Number(width) || 0;
    return Math.round(l * w);
  }, [length, width]);

  // Total Billable Surface Area
  const totalBillableArea = useMemo(() => {
    let extra = 0;
    selectedComponents.forEach((cid) => {
      const val = Number(componentSqft[cid] || 0);
      if (cid === 'stairs') {
        extra += val * 12; // 12 sq ft per step (tread + riser)
      } else {
        extra += val;
      }
    });
    return floorArea + extra;
  }, [floorArea, selectedComponents, componentSqft]);

  // Dynamic 8-Section Progress Tracking (Starts at 0% when empty)
  const sectionSteps = useMemo(() => [
    { num: 1, name: 'Dimensions', done: Boolean(shape && floorArea > 0), id: 'section-1' },
    { num: 2, name: 'Components', done: Boolean(selectedComponents.length > 0), id: 'section-2' },
    { num: 3, name: 'Wood', done: Boolean(woodSpecies), id: 'section-3' },
    { num: 4, name: 'Elevation', done: Boolean(height), id: 'section-4' },
    { num: 5, name: 'Coating', done: Boolean(existingCoating), id: 'section-5' },
    { num: 6, name: 'Services', done: Boolean(services.length > 0), id: 'section-6' },
    { num: 7, name: 'Condition', done: Boolean(conditions.length > 0), id: 'section-7' },
    { num: 8, name: 'Details', done: Boolean(projectName.trim()), id: 'section-8' },
  ], [shape, floorArea, selectedComponents, woodSpecies, height, existingCoating, services, conditions, projectName]);

  const completedSectionsCount = useMemo(() => sectionSteps.filter((s) => s.done).length, [sectionSteps]);
  const progressPercent = useMemo(
    () => Math.round((completedSectionsCount / sectionSteps.length) * 100),
    [completedSectionsCount, sectionSteps.length]
  );

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Toggle Component Selection
  const toggleComponent = (id, defaultVal) => {
    setSelectedComponents((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((c) => c !== id);
        setComponentSqft((s) => {
          const cp = { ...s };
          delete cp[id];
          return cp;
        });
        return next;
      } else {
        const def = id === 'stairs' ? 4 : (defaultVal || 50);
        setComponentSqft((s) => ({
          ...s,
          [id]: s[id] !== undefined ? s[id] : def,
        }));
        return [...prev, id];
      }
    });
  };

  // Toggle Service
  const toggleService = (id) => {
    if ((woodSpecies === 'trex' || woodSpecies === 'composite') && id !== 'cleaning' && id !== 'no_coating') {
      return;
    }
    if (id === 'no_coating') {
      setServices((prev) => (prev.includes('no_coating') ? [] : ['no_coating', 'cleaning']));
      return;
    }
    setServices((prev) => {
      const withoutNoCoating = prev.filter((s) => s !== 'no_coating');
      if (withoutNoCoating.includes(id)) {
        return withoutNoCoating.filter((s) => s !== id);
      } else {
        return [...withoutNoCoating, id];
      }
    });
  };

  // Toggle Condition (Good Condition is 100% exclusive)
  const toggleCondition = (id) => {
    if (id === 'good_condition') {
      setConditions(['good_condition']);
      setCrackBoardCount('');
      setRottedBoardCount('');
      setWarpedBoardCount('');
      setLooseBoardCount('');
      setWaterDamagedBoardCount('');
      setCrackLooseOverlapCount('');
      return;
    }
    setConditions((prev) => {
      const withoutGood = prev.filter((c) => c !== 'good_condition');
      if (withoutGood.includes(id)) {
        return withoutGood.filter((c) => c !== id);
      } else {
        return [...withoutGood, id];
      }
    });
  };

  // Reset entire form for a fresh new calculation
  const handleResetForNewEstimate = () => {
    setShape('');
    setLength('');
    setWidth('');
    setSelectedComponents([]);
    setComponentSqft({});
    setWoodSpecies('');
    setHeight('');
    setExactHeightFt('');
    setExistingCoating('');
    setServices([]);
    setStainType('semi');
    setSandingType('mechanical_sanding');
    setConditions(['good_condition']);
    setCrackBoardCount('');
    setRottedBoardCount('');
    setWarpedBoardCount('');
    setLooseBoardCount('');
    setWaterDamagedBoardCount('');
    setCrackLooseOverlapCount('');
    setProjectName('');
    setAddress('');
    setCity('');
    setState('');
    setZipCode('');
    setNotes('');
    setOfficialEstimate(null);
    setSubmitError(null);
    setLeadCreated(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Contractor-Only Live Pricing Preview
  const runContractorCalc = useCallback(async () => {
    if (!isContractor || floorArea <= 0 || services.length === 0) return;
    try {
      const payload = {
        floorArea,
        services,
        stainType,
        woodSpecies,
        accessType: height,
        exactHeightFt: exactHeightFt ? Number(exactHeightFt) : undefined,
        existingCoating,
        railingSqft: Number(componentSqft.railings || 0),
        stairSteps: Number(componentSqft.stairs || 0),
        stairStepCount: Number(componentSqft.stairs || 0),
        stairSqft: Number(componentSqft.stairs || 0) * 12,
        pergolaSqft: Number(componentSqft.pergola || 0),
        privacyWallSqft: Number(componentSqft.privacy_wall || 0),
        sidingSqft: Number(componentSqft.siding || 0),
        fasciaSqft: Number(componentSqft.fascia || 0),
        joistsSqft: Number(componentSqft.joists || 0),
        damageConditions: conditions,
        crackBoardCount: Number(crackBoardCount) || 0,
        rottedBoardCount: Number(rottedBoardCount) || 0,
        warpedBoardCount: Number(warpedBoardCount) || 0,
        looseBoardCount: Number(looseBoardCount) || 0,
        waterDamagedBoardCount: Number(waterDamagedBoardCount) || 0,
        crackLooseOverlapCount: Number(crackLooseOverlapCount) || 0,
        forContractor: true,
      };
      const res = await calculateLivePricing(payload);
      setContractorPricing(res);
    } catch {
      // Ignore
    }
  }, [isContractor, floorArea, services, stainType, woodSpecies, height, exactHeightFt, existingCoating, componentSqft, conditions, crackBoardCount, rottedBoardCount, warpedBoardCount, looseBoardCount, waterDamagedBoardCount, crackLooseOverlapCount]);

  useEffect(() => {
    if (isContractor) {
      const timer = setTimeout(runContractorCalc, 250);
      return () => clearTimeout(timer);
    }
  }, [isContractor, runContractorCalc]);

  // --- SUBMIT ESTIMATE ---
  const handleSave = async (status = 'SUBMITTED') => {
    if (!shape) {
      setSubmitError('Please select a Deck Footprint & Shape in Section 1.');
      return;
    }
    if (floorArea <= 0) {
      setSubmitError('Please enter valid deck length and width in Section 1.');
      return;
    }
    if (!woodSpecies) {
      setSubmitError('Please select a Wood Species & Material in Section 3.');
      return;
    }
    if (!height) {
      setSubmitError('Please select Site Accessibility & Elevation in Section 4.');
      return;
    }
    if (!existingCoating) {
      setSubmitError('Please select Existing Deck Finish in Section 5.');
      return;
    }
    if (services.length === 0) {
      setSubmitError('Please select at least one Restoration Service in Section 6.');
      return;
    }
    if (conditions.length === 0) {
      setSubmitError('Please select Deck Physical Condition in Section 7.');
      return;
    }
    if (!projectName.trim()) {
      setSubmitError('Please enter a Project / Deck Name in Section 8.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const activeProjName = projectName.trim() || 'Custom Deck Restoration';

      // 1. Create or Update Deck
      const deckPayload = {
        projectName: activeProjName,
        projectDescription: `Restoration for ${woodSpecies} deck (${floorArea} sqft)`,
        deckShape: shape,
        dimensions: {
          length: Number(length) || 20,
          width: Number(width) || 15,
          area: floorArea,
        },
        structureDetails: {
          height,
          exactHeightFt: exactHeightFt ? Number(exactHeightFt) : null,
          hasRailings: selectedComponents.includes('railings'),
          railingSqft: Number(componentSqft.railings || 0),
          hasStairs: selectedComponents.includes('stairs'),
          stairStepCount: Number(componentSqft.stairs || 0),
          stairSteps: Number(componentSqft.stairs || 0),
          stairSqft: Number(componentSqft.stairs || 0) * 12,
          hasPergola: selectedComponents.includes('pergola'),
          pergolaSqft: Number(componentSqft.pergola || 0),
          hasPrivacyWall: selectedComponents.includes('privacy_wall'),
          privacyWallSqft: Number(componentSqft.privacy_wall || 0),
          hasSiding: selectedComponents.includes('siding'),
          sidingSqft: Number(componentSqft.siding || 0),
          hasFascia: selectedComponents.includes('fascia'),
          fasciaSqft: Number(componentSqft.fascia || 0),
          includeJoists: selectedComponents.includes('joists'),
          joistsSqft: Number(componentSqft.joists || 0),
        },
        surfaceDetails: {
          material: woodSpecies.includes('trex') ? 'composite' : 'wood',
          woodSpecies,
          coatingStatus: existingCoating === 'paint' ? 'painted' : existingCoating === 'solid_stain' ? 'stained' : 'none',
        },
        visibleConditions: conditions,
        propertyAddress: { street: address, city, state, zipCode, country: 'USA' },
      };

      let savedDeck;
      if (isEditing && deckId) {
        savedDeck = await updateDeck(deckId, deckPayload);
      } else {
        savedDeck = await createDeck(deckPayload);
      }

      const activeDeckId = savedDeck?._id || savedDeck?.id || deckId;

      // 2. Create Estimate with build spec snapshot
      const estimatePayload = {
        deckId: activeDeckId,
        estimateName: `${activeProjName} Official Estimate`,
        floorArea,
        woodSpecies,
        accessType: height,
        exactHeightFt: exactHeightFt ? Number(exactHeightFt) : undefined,
        coatingType: stainType,
        stainType,
        sandingType,
        conditionFlags: conditions,
        damageConditions: conditions,
        crackBoardCount: Number(crackBoardCount) || 0,
        rottedBoardCount: Number(rottedBoardCount) || 0,
        warpedBoardCount: Number(warpedBoardCount) || 0,
        looseBoardCount: Number(looseBoardCount) || 0,
        waterDamagedBoardCount: Number(waterDamagedBoardCount) || 0,
        crackLooseOverlapCount: Number(crackLooseOverlapCount) || 0,
        services,
        railingSqft: Number(componentSqft.railings || 0),
        stairSteps: Number(componentSqft.stairs || 0),
        stairStepCount: Number(componentSqft.stairs || 0),
        stairSqft: Number(componentSqft.stairs || 0) * 12,
        pergolaSqft: Number(componentSqft.pergola || 0),
        privacyWallSqft: Number(componentSqft.privacy_wall || 0),
        sidingSqft: Number(componentSqft.siding || 0),
        fasciaSqft: Number(componentSqft.fascia || 0),
        joistsSqft: Number(componentSqft.joists || 0),
        notes: notes.trim(),
      };

      const est = await createEstimate(estimatePayload);

      const snap = est?.pricingSnapshot || {};
      const calculatedAmt = snap.calculatedTotal !== undefined ? snap.calculatedTotal : (est?.totalAmount || 2500);
      const minJobFloor = snap.minJob || 2500;
      const minJobApplies = snap.minJobApplied ?? (calculatedAmt < minJobFloor);

      setOfficialEstimate({
        ref: est?.estimateNumber || `DP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        total: calculatedAmt,
        minJobApplies,
        minJobAmount: minJobFloor,
        minJobNotice: minJobApplies
          ? `Important Notice: Deck Restoration Plus maintains a standard project mobilization minimum of $${minJobFloor.toLocaleString()} for this service tier. Because your current calculated scope is below this threshold, the $${minJobFloor.toLocaleString()} minimum job price will apply upon final booking and dispatch.`
          : null,
        low: snap.low || minJobFloor,
        high: snap.high || minJobFloor,
        billableArea: snap.A || totalBillableArea,
        rate: snap.rate || 3.00,
        prep: snap.prep || 'clean',
        finish: snap.finish || 'sealer',
        baseHours: snap.baseHours || 0,
        woodHours: snap.woodHours || 0,
        accessHours: snap.accessHours || 0,
        labourAdj: snap.labourAdj || 0,
        travelFee: snap.travelFee || 0,
        repairEstimate: snap.repairEstimate || null,
        status: snap.status || (services.includes('repairs') ? 'needs_contractor_quote' : 'submitted'),
        needsPhotoReview: snap.needsPhotoReview ?? false,
        hasRepairs: snap.hasRepairs ?? services.includes('repairs'),
        deckId: activeDeckId,
        estimateId: est?._id || est?.id,
      });

      // Smooth scroll down to the official estimate result box
      setTimeout(() => {
        const el = document.getElementById('official-estimate-result-box');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    } catch (err) {
      setSubmitError(err.message || 'Failed to generate official estimate.');
    } finally {
      setSubmitting(false);
    }
  };

  // Convert Estimate to Hot Project Lead (Lead Generation)
  const handleConvertToLead = async () => {
    if (!officialEstimate) return;
    setLeadLoading(true);
    try {
      await leadApi.submitReachOut({
        deckId: officialEstimate.deckId,
        estimateId: officialEstimate.estimateId,
        contactSource: 'Official Estimator Conversion',
        subject: `Estimate Booking: ${projectName} ($${officialEstimate.total.toLocaleString()})`,
        message: `Customer converted official estimate ${officialEstimate.ref} for a ${woodSpecies} deck of ${floorArea} sqft. Estimate: $${officialEstimate.total.toLocaleString()}. Ready for certified contractor assignment & inspection.`,
      });
      setLeadCreated(true);
    } catch (err) {
      alert(`Could not convert to lead: ${err.message}`);
    } finally {
      setLeadLoading(false);
    }
  };

  // Submit General Reach Out Enquiry
  const handleSubmitReachOut = async (e) => {
    e.preventDefault();
    if (!reachOutMsg.trim()) return;
    setReachOutSending(true);
    try {
      await leadApi.submitReachOut({
        contactSource: 'Estimator Top Bar / Sidebar Reach Out',
        subject: reachOutSubject.trim() || 'Estimator Support Enquiry',
        message: reachOutMsg.trim(),
        additionalNotes: `Customer deck: ${shape}, ${floorArea} sqft, ${woodSpecies}.`,
      });
      setReachOutSuccess(true);
      setTimeout(() => {
        setReachOutOpen(false);
        setReachOutSuccess(false);
        setReachOutMsg('');
      }, 1800);
    } catch (err) {
      alert(`Enquiry failed: ${err.message}`);
    } finally {
      setReachOutSending(false);
    }
  };

  // SVG Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const currentShapeObj = SHAPES.find((s) => s.id === shape) || null;
  const currentWoodObj = WOOD_SPECIES.find((w) => w.id === woodSpecies) || null;

  return (
    <div style={styles.estimatorPageContainer}>
      {/* Top Application Section Status & Actions Bar (Bright Modern Theme) */}
      <div style={styles.topBrandingBar}>
        {/* Left: Section Boxes (Filled upon selection) */}
        <div style={styles.topSectionBoxesContainer}>
          <div style={styles.topSectionBoxesRow}>
            {sectionSteps.map((step) => {
              const isFilled = step.done;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => scrollToSection(step.id)}
                  title={`Section ${step.num}: ${step.name} - ${isFilled ? 'Completed (Click to view)' : 'Click to jump'}`}
                  style={{
                    ...styles.topSectionBox,
                    backgroundColor: isFilled ? '#034EA2' : '#FFFFFF',
                    borderColor: isFilled ? '#034EA2' : '#CBD5E1',
                    color: isFilled ? '#FFFFFF' : '#334155',
                    boxShadow: isFilled ? '0 2px 6px rgba(3, 78, 162, 0.22)' : 'none',
                  }}
                >
                  <span style={{ fontWeight: '800', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    {isFilled && <span style={{ fontSize: '12px' }}>✓</span>}
                    S{step.num}
                  </span>
                  <span
                    style={{
                      ...styles.topSectionBoxName,
                      color: isFilled ? '#FFFFFF' : '#64748B',
                    }}
                  >
                    {step.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div style={styles.topActionsGroup}>
          <button
            type="button"
            onClick={handleResetForNewEstimate}
            style={styles.topNewEstimateBtn}
            title="Clear all fields and calculate a fresh estimate"
          >
            + New Estimation
          </button>
          <button
            type="button"
            onClick={() => setReachOutOpen(true)}
            style={styles.topReachOutBtn}
          >
            <span>📞 Reach Out • Need Assistance?</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TWO-COLUMN LAYOUT: MIDDLE SCROLLABLE FORM + RIGHT SIDEBAR */}
      {/* ======================================================== */}
      <div style={styles.contentLayoutRow}>
        {/* MIDDLE SCROLLABLE FORM */}
        <div style={styles.middleScrollableColumn} id="middle-scrollable-form">
          {submitError && (
            <div style={styles.errorBox}>
              <strong style={{ color: '#B91C1C' }}>Attention:</strong> {submitError}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 1: DECK DIMENSIONS & BLUEPRINT */}
          {/* ======================================================== */}
          <section style={styles.cardSection} id="section-1">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 1</span>
              <div>
                <h3 style={styles.cardTitle}>Deck Footprint & Dimensions</h3>
                <p style={styles.cardSubtitle}>Select your deck perimeter shape and enter length and width.</p>
              </div>
            </div>

            {/* Shape Image Cards Grid */}
            <div style={styles.imageCardsGrid5}>
              {SHAPES.map((s) => {
                const isSelected = shape === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setShape(s.id)}
                    style={{
                      ...styles.imageSelectCard,
                      borderColor: isSelected ? '#034EA2' : '#E2E8F0',
                      boxShadow: isSelected ? '0 0 0 2.5px #034EA2' : 'none',
                      backgroundColor: isSelected ? '#F0F6FF' : '#FFFFFF',
                    }}
                  >
                    <img src={s.img} alt={s.label} style={styles.cardCoverImage} />
                    <div style={styles.cardCaptionBox}>
                      <strong style={{ ...styles.cardCaptionTitle, color: isSelected ? '#034EA2' : '#1E293B' }}>
                        {s.label}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dimensions Inputs & Green Usable Area Highlight Box */}
            <div style={styles.dimensionsFormRow}>
              <div style={styles.dimInputWrap}>
                <label style={styles.inputLabel}>Length (ft) *</label>
                <input
                  type="number"
                  min="1"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="e.g. 20"
                  style={styles.textInput}
                />
              </div>

              <div style={styles.dimInputWrap}>
                <label style={styles.inputLabel}>Width (ft) *</label>
                <input
                  type="number"
                  min="1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="e.g. 15"
                  disabled={shape === 'square'}
                  style={styles.textInput}
                />
              </div>

              {/* Polished Green Text Highlight Box */}
              <div style={styles.greenFloorAreaBox}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.greenDot} />
                  <span style={styles.greenAreaLabel}>
                    {currentShapeObj ? `${currentShapeObj.label} Shape Selected` : 'Select Shape & Dimensions'}
                  </span>
                </div>
                <strong style={styles.greenAreaValue}>
                  {floorArea > 0 ? `${floorArea.toLocaleString()} sq ft` : '0 sq ft'}
                </strong>
                <span style={styles.greenAreaSub}>
                  {floorArea > 0 ? `${length || 0} ft × ${width || 0} ft Usable Floor Area` : 'Enter dimensions above'}
                </span>
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 2: DECK COMPONENTS & FEATURES (SQFT INPUTS) */}
          {/* ======================================================== */}
          <section style={styles.cardSection} id="section-2">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 2</span>
              <div>
                <h3 style={styles.cardTitle}>Deck Components & Features</h3>
                <p style={styles.cardSubtitle}>Select attached architectural structures to include square footage in the estimate.</p>
              </div>
            </div>

            <div style={styles.componentsGrid}>
              {COMPONENTS.map((comp) => {
                const isSelected = selectedComponents.includes(comp.id);
                return (
                  <div
                    key={comp.id}
                    style={{
                      ...styles.componentCardItem,
                      borderColor: isSelected ? '#034EA2' : '#E2E8F0',
                      backgroundColor: isSelected ? '#F0F6FF' : '#FFFFFF',
                      boxShadow: isSelected ? '0 0 0 2px #034EA2' : 'none',
                    }}
                  >
                    <div
                      onClick={() => toggleComponent(comp.id, comp.defaultVal || comp.defaultSqft)}
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                    >
                      <img src={comp.img} alt={comp.label} style={styles.componentThumbImage} />
                      <div style={styles.componentMetaRow}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          style={{ ...styles.checkbox, pointerEvents: 'none' }}
                        />
                        <strong style={{ ...styles.cardCaptionTitle, color: isSelected ? '#034EA2' : '#1E293B' }}>
                          {comp.label}
                        </strong>
                      </div>
                    </div>

                    {/* Pop-out Input asking for Steps (for stairs) or Sqft (for others) when selected */}
                    {isSelected && (
                      <div style={styles.componentSqftInputBox}>
                        <label style={styles.sqftInputLabel}>
                          {comp.id === 'stairs' ? 'Number of Steps (Count):' : `${comp.prompt}:`}
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="number"
                            min="1"
                            value={componentSqft[comp.id] !== undefined ? componentSqft[comp.id] : ''}
                            onChange={(e) => setComponentSqft({ ...componentSqft, [comp.id]: e.target.value })}
                            placeholder={String(comp.defaultVal || 4)}
                            style={styles.sqftNumberInput}
                          />
                          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                            {comp.id === 'stairs' ? 'steps' : 'sq ft'}
                          </span>
                        </div>
                        {comp.id === 'stairs' && (
                          <span style={{ fontSize: '11px', color: '#034EA2', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                            Calculated Area: {Number(componentSqft.stairs || 0)} steps × 12 sqft/step = {(Number(componentSqft.stairs || 0) * 12).toLocaleString()} sq ft
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 3: WOOD SPECIES & MATERIAL (8 INPUTS) */}
          {/* ======================================================== */}
          <section style={styles.cardSection} id="section-3">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 3</span>
              <div>
                <h3 style={styles.cardTitle}>Wood Species & Material</h3>
                <p style={styles.cardSubtitle}>Select one species. Density parameters apply to labor adjustments.</p>
              </div>
            </div>

            <div style={styles.imageCardsGrid4}>
              {WOOD_SPECIES.map((w) => {
                const isSelected = woodSpecies === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => setWoodSpecies(w.id)}
                    style={{
                      ...styles.imageSelectCard,
                      borderColor: isSelected ? '#034EA2' : '#E2E8F0',
                      boxShadow: isSelected ? '0 0 0 2.5px #034EA2' : 'none',
                      backgroundColor: isSelected ? '#F0F6FF' : '#FFFFFF',
                    }}
                  >
                    <img src={w.img} alt={w.name} style={styles.cardCoverImage} />
                    <div style={styles.cardCaptionBox}>
                      <strong style={{ ...styles.cardCaptionTitle, color: isSelected ? '#034EA2' : '#1E293B' }}>
                        {w.name}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 4: SITE ACCESSIBILITY & ELEVATION */}
          {/* ======================================================== */}
          <section style={styles.cardSection} id="section-4">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 4</span>
              <div>
                <h3 style={styles.cardTitle}>Site Accessibility & Elevation</h3>
                <p style={styles.cardSubtitle}>Select one elevation tier. Feet ranges shown clearly.</p>
              </div>
            </div>

            <div style={styles.imageCardsGrid5}>
              {ELEVATIONS.map((el) => {
                const isSelected = height === el.id;
                return (
                  <div
                    key={el.id}
                    onClick={() => setHeight(el.id)}
                    style={{
                      ...styles.imageSelectCard,
                      borderColor: isSelected ? '#034EA2' : '#E2E8F0',
                      boxShadow: isSelected ? '0 0 0 2.5px #034EA2' : 'none',
                      backgroundColor: isSelected ? '#F0F6FF' : '#FFFFFF',
                    }}
                  >
                    <img src={el.img} alt={el.label} style={styles.cardCoverImage} />
                    <div style={styles.cardCaptionBox}>
                      <strong style={{ ...styles.cardCaptionTitle, color: isSelected ? '#034EA2' : '#1E293B' }}>
                        {el.label}
                      </strong>
                      <span style={styles.rangeCaptionBadge}>{el.range}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optional Exact Height in Feet */}
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>
                Exact Elevation Height (Optional, ft):
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="e.g. 5.5 ft"
                value={exactHeightFt}
                onChange={(e) => setExactHeightFt(e.target.value)}
                style={{ ...styles.textInput, maxWidth: '140px', padding: '6px 10px', fontSize: '13px' }}
              />
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                {exactHeightFt ? `Auto-mapped elevation: ${Number(exactHeightFt) <= 2 ? 'Ground (0–2 ft)' : Number(exactHeightFt) <= 4 ? 'Low (2–4 ft)' : Number(exactHeightFt) <= 8 ? 'First Story (4–8 ft)' : Number(exactHeightFt) <= 12 ? 'Second Story (8–12 ft)' : 'Roof / High (Over 12 ft)'}` : 'Defaults to selected card tier above'}
              </span>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 5: EXISTING DECK FINISH & COATING (NO PRICE IMPACT) */}
          {/* ======================================================== */}
          <section style={styles.cardSection} id="section-5">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 5</span>
              <div>
                <h3 style={styles.cardTitle}>Existing Deck Finish & Coating</h3>
                <p style={styles.cardSubtitle}>Select current finish layer on deck wood (No price impact, informs preparation).</p>
              </div>
            </div>

            <div style={styles.imageCardsGrid3}>
              {EXISTING_COATINGS.map((ec) => {
                const isSelected = existingCoating === ec.id;
                return (
                  <div
                    key={ec.id}
                    onClick={() => setExistingCoating(ec.id)}
                    style={{
                      ...styles.imageSelectCard,
                      borderColor: isSelected ? '#034EA2' : '#E2E8F0',
                      boxShadow: isSelected ? '0 0 0 2.5px #034EA2' : 'none',
                      backgroundColor: isSelected ? '#F0F6FF' : '#FFFFFF',
                    }}
                  >
                    <img src={ec.img} alt={ec.label} style={styles.cardCoverImage} />
                    <div style={styles.cardCaptionBox}>
                      <strong style={{ ...styles.cardCaptionTitle, color: isSelected ? '#034EA2' : '#1E293B' }}>
                        {ec.label}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 6: RESTORATION SCOPE OF WORK */}
          {/* ======================================================== */}
          <section style={styles.cardSection} id="section-6">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 6</span>
              <div>
                <h3 style={styles.cardTitle}>Restoration Scope of Work</h3>
                <p style={styles.cardSubtitle}>Select operations. No coating starts at $2.50/sq.ft; each coating adds $1/sq.ft.</p>
              </div>
            </div>

            <div style={styles.imageCardsGrid3}>
              {SERVICES_LIST.map((srv) => {
                const isSelected = services.includes(srv.id);
                const isLocked = (woodSpecies === 'trex' || woodSpecies === 'composite') && srv.id !== 'cleaning' && srv.id !== 'no_coating';
                return (
                  <div
                    key={srv.id}
                    onClick={() => !isLocked && toggleService(srv.id)}
                    style={{
                      ...styles.imageSelectCard,
                      borderColor: isSelected ? '#034EA2' : '#E2E8F0',
                      boxShadow: isSelected ? '0 0 0 2.5px #034EA2' : 'none',
                      backgroundColor: isSelected ? '#F0F6FF' : isLocked ? '#F8FAFC' : '#FFFFFF',
                      opacity: isLocked ? 0.45 : 1,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <img src={srv.img} alt={srv.name} style={styles.cardCoverImage} />
                    <div style={styles.cardCaptionBox}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          disabled={isLocked}
                          style={{ ...styles.checkbox, pointerEvents: 'none' }}
                        />
                        <strong style={{ ...styles.cardCaptionTitle, color: isSelected ? '#034EA2' : '#1E293B', fontSize: '12px' }}>
                          {srv.name}
                        </strong>
                      </div>
                      {isContractor && <span style={styles.rangeCaptionBadge}>{srv.rate}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stain type selection if staining is ticked */}
            {services.includes('staining') && (
              <div style={styles.stainTypeBox}>
                <label style={styles.inputLabel}>Desired Stain Finish Type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '6px' }}>
                  <label style={styles.stainOption}>
                    <input
                      type="radio"
                      name="stainType"
                      checked={stainType === 'semi'}
                      onChange={() => setStainType('semi')}
                      style={styles.radio}
                    />
                    <div>
                      <strong>Semi-Transparent Stain</strong>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Shows wood grain with UV color pigment</span>
                    </div>
                  </label>

                  <label style={styles.stainOption}>
                    <input
                      type="radio"
                      name="stainType"
                      checked={stainType === 'semi_solid'}
                      onChange={() => setStainType('semi_solid')}
                      style={styles.radio}
                    />
                    <div>
                      <strong>Semi-Solid Protective Stain</strong>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Rich pigment shielding with subtle grain visibility</span>
                    </div>
                  </label>

                  <label style={styles.stainOption}>
                    <input
                      type="radio"
                      name="stainType"
                      checked={stainType === 'solid'}
                      onChange={() => setStainType('solid')}
                      style={styles.radio}
                    />
                    <div>
                      <strong>Solid Color Protective Stain</strong>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Opaque, maximum weather barrier for older wood</span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </section>

          {/* ======================================================== */}
          {/* SECTION 7: DECK PHYSICAL CONDITION */}
          {/* ======================================================== */}
          <section style={styles.cardSection} id="section-7">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 7</span>
              <div>
                <h3 style={styles.cardTitle}>Deck Physical Condition</h3>
                <p style={styles.cardSubtitle}>Multi-select. <strong>Good Condition</strong> is an exclusive option.</p>
              </div>
            </div>

            <div style={styles.imageCardsGrid3}>
              {CONDITIONS.map((c) => {
                const isSelected = conditions.includes(c.id);
                const isGood = c.id === 'good_condition';
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleCondition(c.id)}
                    style={{
                      ...styles.imageSelectCard,
                      borderColor: isSelected ? (isGood ? '#15803D' : '#034EA2') : '#E2E8F0',
                      boxShadow: isSelected ? `0 0 0 2.5px ${isGood ? '#15803D' : '#034EA2'}` : 'none',
                      backgroundColor: isSelected ? (isGood ? '#F0FDF4' : '#F0F6FF') : '#FFFFFF',
                    }}
                  >
                    <img src={c.img} alt={c.label} style={styles.cardCoverImage} />
                    <div style={styles.cardCaptionBox}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          style={{ ...styles.checkbox, pointerEvents: 'none' }}
                        />
                        <strong style={{ ...styles.cardCaptionTitle, color: isSelected && isGood ? '#15803D' : '#1E293B', fontSize: '12px' }}>
                          {c.label}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optional Board Counts */}
            {!conditions.includes('good_condition') && (conditions.includes('crack') || conditions.includes('rotted') || conditions.includes('warped') || conditions.includes('loose_board') || conditions.includes('water_damaged')) && (
              <div style={styles.boardCountsContainer}>
                <strong style={{ fontSize: '13px', color: '#034EA2', display: 'block', marginBottom: '8px' }}>
                  Optional: Specify Affected Board Quantities (For precise repair estimate):
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  {conditions.includes('crack') && (
                    <div>
                      <label style={styles.inputLabel}>Cracked Boards (qty):</label>
                      <input
                        type="number"
                        min="0"
                        value={crackBoardCount}
                        onChange={(e) => setCrackBoardCount(e.target.value)}
                        style={styles.textInput}
                        placeholder="0"
                      />
                    </div>
                  )}
                  {conditions.includes('rotted') && (
                    <div>
                      <label style={styles.inputLabel}>Rotted Boards (qty):</label>
                      <input
                        type="number"
                        min="0"
                        value={rottedBoardCount}
                        onChange={(e) => setRottedBoardCount(e.target.value)}
                        style={styles.textInput}
                        placeholder="0"
                      />
                    </div>
                  )}
                  {conditions.includes('warped') && (
                    <div>
                      <label style={styles.inputLabel}>Warped Boards (qty):</label>
                      <input
                        type="number"
                        min="0"
                        value={warpedBoardCount}
                        onChange={(e) => setWarpedBoardCount(e.target.value)}
                        style={styles.textInput}
                        placeholder="0"
                      />
                    </div>
                  )}
                  {conditions.includes('loose_board') && (
                    <div>
                      <label style={styles.inputLabel}>Loose Boards (qty):</label>
                      <input
                        type="number"
                        min="0"
                        value={looseBoardCount}
                        onChange={(e) => setLooseBoardCount(e.target.value)}
                        style={styles.textInput}
                        placeholder="0"
                      />
                    </div>
                  )}
                  {conditions.includes('water_damaged') && (
                    <div>
                      <label style={styles.inputLabel}>Water Damaged (qty):</label>
                      <input
                        type="number"
                        min="0"
                        value={waterDamagedBoardCount}
                        onChange={(e) => setWaterDamagedBoardCount(e.target.value)}
                        style={styles.textInput}
                        placeholder="0"
                      />
                    </div>
                  )}
                  {(conditions.includes('crack') && conditions.includes('loose_board')) && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={styles.inputLabel}>Both Cracked & Loose on Same Board (overlap qty):</label>
                      <input
                        type="number"
                        min="0"
                        value={crackLooseOverlapCount}
                        onChange={(e) => setCrackLooseOverlapCount(e.target.value)}
                        style={styles.textInput}
                        placeholder="0 (charged replacement only)"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* ======================================================== */}
          {/* SECTION 8: PROJECT INFORMATION & PROPERTY LOCATION */}
          {/* (Full Name & Phone removed; only Project Name required) */}
          {/* ======================================================== */}
          <section style={styles.cardSection} id="section-8">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 8</span>
              <div>
                <h3 style={styles.cardTitle}>Project Information & Location</h3>
                <p style={styles.cardSubtitle}>Provide project reference name. Address fields are optional.</p>
              </div>
            </div>

            <div style={styles.projFormGrid}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.inputLabel}>Project / Deck Name *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Backyard Cedar Deck Refinishing"
                  style={styles.textInput}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.inputLabel}>Project Property Address (Optional)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Oakwood Terrace"
                  style={styles.textInput}
                />
              </div>

              <div>
                <label style={styles.inputLabel}>City (Optional)</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Springfield"
                  style={styles.textInput}
                />
              </div>

              <div>
                <label style={styles.inputLabel}>ZIP / Postal Code (Optional)</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="62704"
                  style={styles.textInput}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.inputLabel}>Scope Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or property details..."
                  style={{ ...styles.textInput, resize: 'vertical' }}
                />
              </div>
            </div>

            {/* SUBMIT BUTTON BAR */}
            <div style={styles.bottomActionBar}>
              <button
                type="button"
                onClick={() => handleSave('SUBMITTED')}
                disabled={submitting}
                style={styles.submitBtn}
              >
                {submitting ? 'Calculating Official Quote...' : 'Generate Official Estimate →'}
              </button>
            </div>
          </section>

          {/* ======================================================== */}
          {/* POST-ESTIMATE OFFICIAL ESTIMATE RESULT BOX (HIGHLIGHTED) */}
          {/* ======================================================== */}
          {officialEstimate && (
            <div style={styles.officialResultCard} id="official-estimate-result-box">
              <div style={styles.resultHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.verifiedCheck}>✓</span>
                  <span style={styles.resultTitle}>Deck Restoration Plus • Official Estimate</span>
                </div>
                <span style={styles.refBadge}>Ref: {officialEstimate.ref}</span>
              </div>

              {/* CLIENT Q12 STRICT COMPLIANCE: Customer sees ONE TOTAL NUMBER ONLY with ZERO breakdown */}
              {!isContractor ? (
                <div style={styles.customerTotalBox}>
                  <span style={styles.customerTotalSub}>Official Guaranteed Estimate Total</span>
                  <strong style={styles.customerTotalAmt}>
                    ${officialEstimate.total.toLocaleString()}
                  </strong>
                  <span style={styles.customerTotalSubNotice}>
                    {officialEstimate.status === 'needs_contractor_quote'
                      ? 'Provisional estimate • Repairs require on-site contractor confirmation'
                      : officialEstimate.needsPhotoReview
                      ? 'Preliminary quote • Subject to photo review or site visit confirmation'
                      : 'Comprehensive estimate based on Deck Restoration Plus quality standards'}
                  </span>

                  {/* USER REQUIREMENT: Minimum Job Notice without forcing $2,500 onto the estimate */}
                  {officialEstimate.minJobApplies && (
                    <div style={styles.customerMinJobNoticeBox}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <div>
                        <strong style={{ color: '#92400E', fontSize: '13px' }}>Important Minimum Job Notice:</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#78350F', lineHeight: 1.4 }}>
                          Deck Restoration Plus maintains a standard mobilization minimum of ${officialEstimate.minJobAmount.toLocaleString()} for this service tier. Because your calculated job size is below this threshold, the ${officialEstimate.minJobAmount.toLocaleString()} minimum job price will apply upon final booking and crew dispatch.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* CONTRACTOR VIEW: Full Operational Breakdown */
                <div style={styles.contractorBreakdownBox}>
                  <div style={styles.resultContentRow}>
                    <div style={styles.resultTotalBox}>
                      <span style={styles.resultTotalSub}>Contractor Quoted Total</span>
                      <strong style={styles.resultTotalAmt}>${officialEstimate.total.toLocaleString()}</strong>
                      <span style={styles.resultRangeNotice}>
                        Calculated Range: ${officialEstimate.low.toLocaleString()} – ${officialEstimate.high.toLocaleString()}
                      </span>
                    </div>

                    <div style={styles.resultSpecsBox}>
                      <div style={styles.specLine}>
                        <span>Billable Surface Area ($A$):</span>
                        <strong>{officialEstimate.billableArea.toLocaleString()} sq ft</strong>
                      </div>
                      <div style={styles.specLine}>
                        <span>Rate Card Lookup:</span>
                        <strong>Prep: {officialEstimate.prep} • Finish: {officialEstimate.finish}</strong>
                      </div>
                      <div style={styles.specLine}>
                        <span>Unit Rate:</span>
                        <strong>${officialEstimate.rate.toFixed(2)} / sq ft</strong>
                      </div>
                      <div style={styles.specLine}>
                        <span>Labor Adjustment:</span>
                        <strong>${officialEstimate.labourAdj.toLocaleString()} ({officialEstimate.baseHours}h base)</strong>
                      </div>
                      {officialEstimate.travelFee > 0 && (
                        <div style={styles.specLine}>
                          <span>Travel Mobilization:</span>
                          <strong>${officialEstimate.travelFee}</strong>
                        </div>
                      )}
                      <div style={styles.specLine}>
                        <span>Workflow Status:</span>
                        <strong style={{ color: officialEstimate.hasRepairs ? '#B91C1C' : officialEstimate.needsPhotoReview ? '#D97706' : '#15803D' }}>
                          {officialEstimate.status}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {officialEstimate.minJobApplies && (
                    <div style={styles.contractorMinNotice}>
                      <span>Min Job Floor Applied: Calculated ${officialEstimate.total.toLocaleString()} is below ${officialEstimate.minJobAmount.toLocaleString()} threshold.</span>
                    </div>
                  )}

                  {/* Dedicated Repair Estimate Line Item with Overlap Preventions */}
                  {officialEstimate.repairEstimate && officialEstimate.repairEstimate.repairTotal > 0 && (
                    <div style={styles.repairEstimateBox}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ color: '#034EA2', fontSize: '13px' }}>Structural Repair Estimate (Separate Line)</strong>
                          <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>Deduplicated using client overlap-prevention rules</span>
                        </div>
                        <strong style={{ color: '#034EA2', fontSize: '15px' }}>
                          +${officialEstimate.repairEstimate.repairTotal.toLocaleString()}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {officialEstimate.repairEstimate.lineItems.map((li, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#334155' }}>
                            <span>• {li.item} {li.count ? `(${li.count})` : ''}</span>
                            <strong>${li.totalCost.toLocaleString()}</strong>
                          </div>
                        ))}
                      </div>

                      {officialEstimate.repairEstimate.overlapDeductions.length > 0 && (
                        <div style={styles.overlapBanner}>
                          <strong>Overlap Deduplications Applied:</strong>
                          {officialEstimate.repairEstimate.overlapDeductions.map((od, idx) => (
                            <div key={idx} style={{ marginTop: '2px' }}>
                              • {od.note || od.rule} {od.saving ? `(Avoided double charge: $${od.saving})` : ''}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons: Convert to Lead & Contact Specialist */}
              <div style={styles.resultActionRow}>
                {!leadCreated ? (
                  <button
                    type="button"
                    onClick={handleConvertToLead}
                    disabled={leadLoading}
                    style={styles.convertLeadBtn}
                  >
                    <span>{leadLoading ? 'Assigning Project Lead...' : 'Book Site Inspection & Convert to Lead'}</span>
                  </button>
                ) : (
                  <div style={styles.leadSuccessBadge}>
                    <span>✓ Project Lead Created! A Deck Restoration Plus senior estimator has been assigned and will contact you within 24 hours.</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResetForNewEstimate}
                  style={styles.startNewEstimateActionBtn}
                >
                  + Calculate Another Deck / Start New Estimate
                </button>

                <button
                  type="button"
                  onClick={() => setReachOutOpen(true)}
                  style={styles.talkSpecialistBtn}
                >
                  Need Custom Scope? Reach Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDEBAR: CIRCLE PROGRESS, PREVIEW, IMAGES & ESTIMATE */}
        {/* ======================================================== */}
        <aside style={styles.fixedRightSidebar}>
          {/* Top Reach Out Button in Sidebar */}
          <button
            type="button"
            onClick={() => setReachOutOpen(true)}
            style={styles.sidebarReachOutBtn}
          >
            <span>Reach Out • Need Assistance?</span>
          </button>

          {/* 1. CIRCLE STEP PROGRESS CARD */}
          <div style={styles.sidebarCard}>
            <div style={styles.progressCircleRow}>
              <div style={styles.circleWrap}>
                <svg width="86" height="86" viewBox="0 0 86 86">
                  <circle
                    cx="43"
                    cy="43"
                    r={radius}
                    stroke="#E2E8F0"
                    strokeWidth="7"
                    fill="none"
                  />
                  <circle
                    cx="43"
                    cy="43"
                    r={radius}
                    stroke="#034EA2"
                    strokeWidth="7"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 43 43)"
                    style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                  />
                </svg>
                <div style={styles.circleCenterText}>
                  <strong style={{ fontSize: '16px', color: '#034EA2' }}>{progressPercent}%</strong>
                  <span style={{ fontSize: '9px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ready</span>
                </div>
              </div>

              <div>
                <h4 style={styles.sidebarHeading}>Estimation Progress</h4>
                <p style={styles.sidebarSub}>
                  {progressPercent === 100 ? 'All parameters complete' : 'Configure parameters to complete estimate'}
                </p>
                <div style={styles.readyIndicator}>
                  <span style={{ ...styles.statusDot, backgroundColor: progressPercent > 50 ? '#15803D' : '#D97706' }} />
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#334155' }}>
                    {progressPercent > 70 ? 'Ready for Calculation' : 'Enter Details'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. YOUR SELECTED SPECIFICATIONS SUMMARY */}
          <div style={styles.sidebarCard}>
            <div style={styles.cardHeaderRow}>
              <h4 style={styles.sidebarHeading}>Selected Specifications</h4>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('section-1');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={styles.editLinkBtn}
              >
                Edit
              </button>
            </div>

            <div style={styles.specsList}>
              <div style={styles.specRow}>
                <span style={styles.specLabel}>Footprint & Shape</span>
                <strong style={styles.specVal}>{currentShapeObj ? `${currentShapeObj.label} (${length || 0}×${width || 0} ft)` : '—'}</strong>
              </div>
              <div style={styles.specRow}>
                <span style={styles.specLabel}>Floor Surface</span>
                <strong style={styles.specVal}>{floorArea > 0 ? `${floorArea} sq ft` : '—'}</strong>
              </div>
              <div style={styles.specRow}>
                <span style={styles.specLabel}>Total Billable Area</span>
                <strong style={{ ...styles.specVal, color: '#034EA2' }}>{totalBillableArea > 0 ? `${totalBillableArea} sq ft` : '—'}</strong>
              </div>
              <div style={styles.specRow}>
                <span style={styles.specLabel}>Wood Species</span>
                <strong style={styles.specVal}>{currentWoodObj ? currentWoodObj.name : '—'}</strong>
              </div>
              <div style={styles.specRow}>
                <span style={styles.specLabel}>Elevation</span>
                <strong style={styles.specVal}>{height || '—'}</strong>
              </div>
              <div style={styles.specRow}>
                <span style={styles.specLabel}>Services</span>
                <strong style={styles.specVal}>{services.length} selected</strong>
              </div>
              {selectedComponents.includes('stairs') && (
                <div style={styles.specRow}>
                  <span style={styles.specLabel}>Stair Steps</span>
                  <strong style={styles.specVal}>
                    {Number(componentSqft.stairs || 0)} steps ({Number(componentSqft.stairs || 0) * 12} sq ft)
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* 3. ARCHITECTURAL REFERENCE & DESCRIPTIONS */}
          <div style={styles.sidebarCard}>
            <div style={styles.refWindowHeader}>
              <h4 style={styles.sidebarHeading}>Architectural Reference</h4>
              <div style={styles.refTabs}>
                <button
                  type="button"
                  onClick={() => setRefTab('shape')}
                  style={{ ...styles.refTabBtn, borderBottomColor: refTab === 'shape' ? '#034EA2' : 'transparent', color: refTab === 'shape' ? '#034EA2' : '#64748B' }}
                >
                  Shape
                </button>
                <button
                  type="button"
                  onClick={() => setRefTab('wood')}
                  style={{ ...styles.refTabBtn, borderBottomColor: refTab === 'wood' ? '#034EA2' : 'transparent', color: refTab === 'wood' ? '#034EA2' : '#64748B' }}
                >
                  Wood Grain
                </button>
              </div>
            </div>

            <div style={styles.refBody}>
              {refTab === 'shape' ? (
                currentShapeObj ? (
                  <>
                    <img src={currentShapeObj.img} alt={currentShapeObj.label} style={styles.refImage} />
                    <div style={styles.refCaption}>
                      <strong style={{ fontSize: '12px', color: '#034EA2' }}>{currentShapeObj.label} Footprint</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
                        {currentShapeObj.desc}
                      </p>
                    </div>
                  </>
                ) : (
                  <div style={styles.emptyRefBox}>Select a shape in Section 1 to view architectural specifications.</div>
                )
              ) : (
                currentWoodObj ? (
                  <>
                    <img src={currentWoodObj.img} alt={currentWoodObj.name} style={styles.refImage} />
                    <div style={styles.refCaption}>
                      <strong style={{ fontSize: '12px', color: '#034EA2' }}>{currentWoodObj.name}</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
                        {currentWoodObj.desc}
                      </p>
                    </div>
                  </>
                ) : (
                  <div style={styles.emptyRefBox}>Select a wood species in Section 3 to view grain details.</div>
                )
              )}
            </div>
          </div>

          {/* 4. LIVE ESTIMATE CARD (CLIENT Q12 COMPLIANT) */}
          <div style={styles.sidebarCard}>
            <div style={styles.cardHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={styles.livePulse} />
                <h4 style={{ ...styles.sidebarHeading, color: '#034EA2' }}>
                  {isContractor ? 'Contractor Rate Engine' : 'Official Estimate Status'}
                </h4>
              </div>
            </div>

            {!isContractor ? (
              officialEstimate ? (
                <div style={styles.customerSidebarResult}>
                  <span style={styles.customerResultLabel}>Guaranteed Estimate</span>
                  <strong style={styles.customerResultAmt}>${officialEstimate.total.toLocaleString()}</strong>
                  <span style={styles.customerResultSub}>Ref: {officialEstimate.ref}</span>
                  {officialEstimate.minJobApplies && (
                    <div style={styles.sidebarMinNotice}>
                      <span>Min Job Price (${officialEstimate.minJobAmount.toLocaleString()}) applies upon dispatch.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.customerReadyBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={styles.readyCheck}>✓</span>
                    <strong style={{ fontSize: '13px', color: '#034EA2' }}>Specifications Configured</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
                    Click <strong>Generate Official Estimate</strong> in Section 8 to compute your guaranteed quote.
                  </p>
                </div>
              )
            ) : (
              contractorPricing ? (
                <div style={styles.priceBreakdown}>
                  <div style={styles.priceRow}>
                    <span>Billable Surface Area:</span>
                    <strong>{contractorPricing.billableArea} sq ft</strong>
                  </div>
                  <div style={styles.priceRow}>
                    <span>Unit Rate:</span>
                    <strong>${Number(contractorPricing.rate || 2.75).toFixed(2)} / sqft</strong>
                  </div>
                  <div style={styles.priceRow}>
                    <span>Base Labor Hours:</span>
                    <strong>{contractorPricing.baseHours} hrs</strong>
                  </div>
                  <div style={styles.priceRow}>
                    <span>Labor Adjustment:</span>
                    <strong>${contractorPricing.labourAdj}</strong>
                  </div>
                  <div style={styles.divider} />
                  <div style={styles.totalBox}>
                    <span style={styles.totalLabel}>Estimate Total</span>
                    <strong style={styles.totalAmount}>${contractorPricing.total.toLocaleString()}</strong>
                  </div>
                  <div style={styles.rangeRow}>
                    <span>Low – High Range:</span>
                    <strong>${contractorPricing.low.toLocaleString()} – ${contractorPricing.high.toLocaleString()}</strong>
                  </div>
                </div>
              ) : (
                <div style={styles.emptyPricePrompt}>Enter parameters to compute breakdown.</div>
              )
            )}
          </div>
        </aside>
      </div>

      {/* ======================================================== */}
      {/* REACH OUT / SPECIALIST SUPPORT MODAL */}
      {/* ======================================================== */}
      {reachOutOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Specialist Support & Project Inquiries</h3>
              <button
                type="button"
                onClick={() => setReachOutOpen(false)}
                style={styles.modalCloseBtn}
              >
                ✕
              </button>
            </div>
            {reachOutSuccess ? (
              <div style={styles.modalSuccessBody}>
                <div style={styles.successIcon}>✓</div>
                <h4 style={{ margin: '8px 0', color: '#15803D' }}>Inquiry Submitted!</h4>
                <p style={{ fontSize: '13px', color: '#475569' }}>
                  A certified Deck Restoration Plus project specialist has received your request and will contact you directly within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReachOut} style={styles.modalForm}>
                <p style={styles.modalSub}>
                  Have questions regarding your deck restoration scope or need custom inspection assistance? Send our certified team a direct inquiry.
                </p>

                <div style={{ marginBottom: '14px' }}>
                  <label style={styles.inputLabel}>Inquiry Subject</label>
                  <input
                    type="text"
                    value={reachOutSubject}
                    onChange={(e) => setReachOutSubject(e.target.value)}
                    style={styles.textInput}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={styles.inputLabel}>Your Message / Question *</label>
                  <textarea
                    rows={4}
                    required
                    value={reachOutMsg}
                    onChange={(e) => setReachOutMsg(e.target.value)}
                    placeholder="Describe your deck conditions, photos, or custom requirements..."
                    style={{ ...styles.textInput, resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setReachOutOpen(false)}
                    style={styles.draftBtn}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reachOutSending || !reachOutMsg.trim()}
                    style={styles.submitBtn}
                  >
                    {reachOutSending ? 'Sending Inquiry...' : 'Submit to Specialist'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- SAMSUNG BLUE THEME STYLES ---

const styles = {
  estimatorPageContainer: {
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    padding: '20px',
  },
  topBrandingBar: {
    maxWidth: '1440px',
    margin: '0 auto 20px auto',
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid #E2E8F0',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
  },
  topSectionBoxesContainer: {
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 auto',
    minWidth: '280px',
  },
  topSectionBoxesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  topSectionBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    borderRadius: '8px',
    border: '1.5px solid',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    textDecoration: 'none',
  },
  topSectionBoxName: {
    fontSize: '12px',
    fontWeight: '500',
  },
  topActionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  topNewEstimateBtn: {
    padding: '10px 18px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(3, 78, 162, 0.25)',
    transition: 'all 0.18s ease',
  },
  topReachOutBtn: {
    padding: '10px 18px',
    backgroundColor: '#FFFFFF',
    color: '#034EA2',
    border: '1.5px solid #034EA2',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  startNewEstimateActionBtn: {
    padding: '12px 18px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    boxShadow: '0 4px 12px rgba(3, 78, 162, 0.2)',
  },
  contentLayoutRow: {
    display: 'flex',
    gap: '24px',
    maxWidth: '1440px',
    margin: '0 auto',
    alignItems: 'flex-start',
  },
  middleScrollableColumn: {
    flex: '1 1 0%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fixedRightSidebar: {
    width: '360px',
    flexShrink: 0,
    position: 'sticky',
    top: '85px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: 'calc(100vh - 105px)',
    overflowY: 'auto',
  },
  sidebarReachOutBtn: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(3, 78, 162, 0.25)',
    transition: 'all 0.2s',
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '20px',
    borderBottom: '1px solid #F1F5F9',
    paddingBottom: '14px',
  },
  stepBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  cardTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#64748B',
  },

  // Image Cards Grids
  imageCardsGrid5: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  imageCardsGrid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
  },
  imageCardsGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '12px',
  },
  imageSelectCard: {
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: '#FFFFFF',
    transition: 'all 0.18s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
  },
  cardCoverImage: {
    width: '100%',
    height: '90px',
    objectFit: 'cover',
    display: 'block',
  },
  cardCaptionBox: {
    padding: '10px 8px',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  cardCaptionTitle: {
    fontSize: '13px',
    fontWeight: '700',
    lineHeight: 1.25,
  },
  rangeCaptionBadge: {
    fontSize: '11px',
    color: '#034EA2',
    fontWeight: '600',
  },

  // Dimensions & Green Highlight
  dimensionsFormRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1.4fr',
    gap: '16px',
    alignItems: 'flex-end',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #F1F5F9',
  },
  dimInputWrap: {
    display: 'flex',
    flexDirection: 'column',
  },
  greenFloorAreaBox: {
    backgroundColor: '#F0FDF4',
    border: '1.5px solid #86EFAC',
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  greenDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#16A34A',
  },
  greenAreaLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  greenAreaValue: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#15803D',
    marginTop: '2px',
    lineHeight: 1.2,
  },
  greenAreaSub: {
    fontSize: '11px',
    color: '#166534',
    marginTop: '2px',
  },

  // Components Section
  componentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
  },
  componentCardItem: {
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    transition: 'all 0.18s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
  },
  componentThumbImage: {
    width: '100%',
    height: '80px',
    objectFit: 'cover',
    display: 'block',
  },
  componentMetaRow: {
    padding: '10px 10px 8px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  componentSqftInputBox: {
    padding: '8px 10px 10px 10px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E2E8F0',
  },
  sqftInputLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '4px',
  },
  sqftNumberInput: {
    width: '90px',
    padding: '6px 8px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#034EA2',
    border: '1.5px solid #034EA2',
    borderRadius: '6px',
    backgroundColor: '#F8FAFC',
    outline: 'none',
  },

  // Stain & Sanding Boxes
  stainTypeBox: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
  },
  stainOption: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  radio: {
    marginTop: '3px',
    accentColor: '#034EA2',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#034EA2',
    cursor: 'pointer',
  },
  boardCountsContainer: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
  },

  // Form Inputs
  inputLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '6px',
  },
  textInput: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#0F172A',
  },
  projFormGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  bottomActionBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  submitBtn: {
    padding: '14px 28px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(3, 78, 162, 0.3)',
    transition: 'all 0.2s',
  },
  draftBtn: {
    padding: '10px 18px',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorBox: {
    padding: '12px 16px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FCA5A5',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#991B1B',
  },

  // Official Estimate Result Card
  officialResultCard: {
    backgroundColor: '#FFFFFF',
    border: '2px solid #034EA2',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 10px 25px -5px rgba(3, 78, 162, 0.15)',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '12px',
  },
  verifiedCheck: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#15803D',
    color: '#FFFFFF',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: '14px',
  },
  resultTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0F172A',
  },
  refBadge: {
    padding: '4px 10px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
  },
  customerTotalBox: {
    textAlign: 'center',
    padding: '24px 16px',
    backgroundColor: '#F0F6FF',
    borderRadius: '10px',
    border: '1.5px solid #BFDBFE',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  customerTotalSub: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#034EA2',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  customerTotalAmt: {
    fontSize: '44px',
    fontWeight: '900',
    color: '#034EA2',
    margin: '8px 0',
    letterSpacing: '-0.02em',
  },
  customerTotalSubNotice: {
    fontSize: '12px',
    color: '#475569',
    maxWidth: '500px',
    lineHeight: 1.4,
  },
  customerMinJobNoticeBox: {
    marginTop: '16px',
    padding: '12px 16px',
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    textAlign: 'left',
  },
  contractorBreakdownBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  resultContentRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  resultTotalBox: {
    backgroundColor: '#F0F6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
  },
  resultTotalSub: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#034EA2',
  },
  resultTotalAmt: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#034EA2',
    margin: '4px 0',
  },
  resultRangeNotice: {
    fontSize: '12px',
    color: '#64748B',
  },
  resultSpecsBox: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  specLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#334155',
  },
  repairEstimateBox: {
    padding: '14px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
  },
  overlapBanner: {
    marginTop: '8px',
    padding: '8px',
    backgroundColor: '#ECFDF5',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#065F46',
  },
  contractorMinNotice: {
    padding: '8px 12px',
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#92400E',
  },
  resultActionRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  convertLeadBtn: {
    flex: 1,
    padding: '12px 20px',
    backgroundColor: '#15803D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
  },
  talkSpecialistBtn: {
    padding: '12px 18px',
    backgroundColor: '#FFFFFF',
    color: '#034EA2',
    border: '1.5px solid #034EA2',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
  },
  leadSuccessBadge: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#ECFDF5',
    border: '1.5px solid #6EE7B7',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#065F46',
    fontWeight: '600',
  },

  // Sidebar Styles
  sidebarCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  progressCircleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  circleWrap: {
    position: 'relative',
    width: '86px',
    height: '86px',
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
  },
  sidebarHeading: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '800',
    color: '#0F172A',
  },
  sidebarSub: {
    margin: '3px 0 6px 0',
    fontSize: '11px',
    color: '#64748B',
    lineHeight: 1.3,
  },
  readyIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    borderBottom: '1px solid #F1F5F9',
    paddingBottom: '8px',
  },
  editLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#034EA2',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: 0,
  },
  specsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  specRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
  },
  specLabel: {
    color: '#64748B',
  },
  specVal: {
    color: '#0F172A',
    fontWeight: '700',
  },
  refWindowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    borderBottom: '1px solid #F1F5F9',
    paddingBottom: '8px',
  },
  refTabs: {
    display: 'flex',
    gap: '8px',
  },
  refTabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '2px 4px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  refBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  refImage: {
    width: '100%',
    height: '110px',
    objectFit: 'cover',
    borderRadius: '6px',
  },
  refCaption: {
    display: 'flex',
    flexDirection: 'column',
  },
  emptyRefBox: {
    fontSize: '11px',
    color: '#94A3B8',
    padding: '16px 8px',
    textAlign: 'center',
  },
  livePulse: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#16A34A',
  },
  customerSidebarResult: {
    textAlign: 'center',
    padding: '14px 10px',
    backgroundColor: '#F0F6FF',
    borderRadius: '8px',
    border: '1px solid #BFDBFE',
    display: 'flex',
    flexDirection: 'column',
  },
  customerResultLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#034EA2',
    textTransform: 'uppercase',
  },
  customerResultAmt: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#034EA2',
    margin: '4px 0',
  },
  customerResultSub: {
    fontSize: '10px',
    color: '#64748B',
  },
  sidebarMinNotice: {
    marginTop: '6px',
    fontSize: '10px',
    color: '#B45309',
    lineHeight: 1.3,
  },
  customerReadyBox: {
    padding: '12px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
  },
  readyCheck: {
    color: '#15803D',
    fontWeight: '900',
  },
  priceBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#475569',
  },
  divider: {
    height: '1px',
    backgroundColor: '#E2E8F0',
    margin: '6px 0',
  },
  totalBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#0F172A',
  },
  totalAmount: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#034EA2',
  },
  rangeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: '#64748B',
  },
  emptyPricePrompt: {
    fontSize: '11px',
    color: '#94A3B8',
    textAlign: 'center',
    padding: '12px 0',
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '520px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  modalTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#64748B',
    cursor: 'pointer',
  },
  modalSub: {
    fontSize: '12px',
    color: '#64748B',
    margin: '0 0 14px 0',
    lineHeight: 1.4,
  },
  modalSuccessBody: {
    textAlign: 'center',
    padding: '24px 0',
  },
  successIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '900',
    marginBottom: '8px',
  },
};
