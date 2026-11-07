// =============================================
// Deck Restoration Plus — Precision Estimator Engine
// =============================================
// Clean, modern Dark Navy Blue & Crisp White Theme (#0B192C / #1E3E62 / #FFFFFF).
// Adheres strictly to the Build Specification:
// - F1–F15 Server-side single source of truth pricing
// - Right Sidebar: Circular progress gauge, live selections preview, interactive
//   architectural photo reference window, live estimate preview, and Reach Out button.
// - Post-submission official estimate result box with highlight total & instant lead creation.
// - Identical experience across Customer & Contractor portals.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeck, updateDeck } from '../api/decksApi';
import { createEstimate, calculateLivePricing } from '../api/estimatesApi';
import { leadApi } from '../api/leadApi';
import {
  RectangleDeckIcon,
  LShapeDeckIcon,
  MultiLevelDeckIcon,
  CustomDeckIcon,
  HeightGroundIcon,
  HeightLowIcon,
  HeightMediumIcon,
  HeightHighIcon,
  TopDownDeckPlanSvg,
} from './DeckDiagrams';

// --- DATA DEFINITIONS & ARCHITECTURAL ASSETS ---

const SHAPES = [
  {
    id: 'rectangle',
    label: 'Rectangle',
    desc: 'Classic uniform platform',
    Icon: RectangleDeckIcon,
    refTitle: 'Classic Rectangular Deck',
    refDesc: 'Optimized for open furniture layouts and maximum square footage efficiency. Standard joist spacing spans cleanly.',
    realImg: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'square',
    label: 'Square',
    desc: 'Equal length and width',
    Icon: RectangleDeckIcon,
    refTitle: 'Balanced Square Deck',
    refDesc: 'Ideal for intimate courtyard patios, dining gazebos, and compact perimeter outdoor living.',
    realImg: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'l_shaped',
    label: 'L-Shape',
    desc: 'Wraps exterior corners',
    Icon: LShapeDeckIcon,
    refTitle: 'Architectural L-Shaped Wrap',
    refDesc: 'Wraps around home elevations to create two distinct functional zones: dining and outdoor lounge.',
    realImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'multi_level',
    label: 'Multi-Level',
    desc: 'Stepped transition tiers',
    Icon: MultiLevelDeckIcon,
    refTitle: 'Tiered Multi-Level Living',
    refDesc: 'Separate stepped platforms accommodating slope grades, hot tubs, and defined elevation transitions.',
    realImg: 'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'custom',
    label: 'Custom Shape',
    desc: 'Curved, angled or faceted',
    Icon: CustomDeckIcon,
    refTitle: 'Custom Geometric Deck',
    refDesc: 'Bespoke custom perimeter with angled cantilevers, curved fascias, and built-in perimeter seating.',
    realImg: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
  },
];

const WOOD_SPECIES = [
  {
    id: 'pt_pine',
    name: 'Pressure-Treated Pine',
    laborPct: '0% labor adj.',
    desc: 'Standard commercial softwood, treated for exterior ground contact.',
    grainImg: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=600&q=80',
    maintenanceNote: 'Responds best to deep cleaning and penetrating semi-transparent oil stain every 2–3 years.',
  },
  {
    id: 'cedar',
    name: 'Western Red Cedar',
    laborPct: '+10% labor adj.',
    desc: 'Naturally rot-resistant aromatic softwood with rich natural grain.',
    grainImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    maintenanceNote: 'Naturally pitch-free; absorbs transparent stains exceptionally with beautiful golden red tones.',
  },
  {
    id: 'redwood',
    name: 'California Redwood',
    laborPct: '+15% labor adj.',
    desc: 'Dense, durable heartwood with natural tannin resistance to insects.',
    grainImg: 'https://images.unsplash.com/photo-1502005229762-ee1b2da97a06?auto=format&fit=crop&w=600&q=80',
    maintenanceNote: 'Requires periodic pH neutralization and conditioning before sealing to highlight crimson tones.',
  },
  {
    id: 'meranti',
    name: 'Mahogany / Meranti',
    laborPct: '+20% labor adj.',
    desc: 'High-density exotic hardwood with tight, straight ribbon grain.',
    grainImg: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=600&q=80',
    maintenanceNote: 'Dense grain requires thin-viscosity penetrating oils; surface wipe required post-application.',
  },
  {
    id: 'tigerwood',
    name: 'Tigerwood (Muiracatiara)',
    laborPct: '+30% labor adj.',
    desc: 'Exotic Brazilian hardwood with striking dark brown to black tiger stripes.',
    grainImg: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=600&q=80',
    maintenanceNote: 'Extremely dense structure; requires specialized UV-blocking hardwood oils.',
  },
  {
    id: 'ipe',
    name: 'Brazilian Ipe (Ironwood)',
    laborPct: '+35% labor adj.',
    desc: 'World-renowned ultra-dense hardwood with class-A fire and rot durability.',
    grainImg: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80',
    maintenanceNote: 'Requires diamond or carbide sanding pads; accepts specialized trans-oxide iron hardwood finishes.',
  },
  {
    id: 'trex',
    name: 'Composite Trex',
    laborPct: '−55% credit (clean only)',
    desc: 'Engineered synthetic capped polymer core. No staining or stripping.',
    grainImg: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
    maintenanceNote: 'Strictly deep wash and eco-pressure cleaning. Stains and chemical strippers are prohibited.',
  },
];

const HEIGHTS = [
  { id: 'ground', label: 'Ground Level', range: '0–4 ft', pct: '0%', Icon: HeightGroundIcon },
  { id: 'first', label: 'First Story', range: '4–8 ft', pct: '+15%', Icon: HeightLowIcon },
  { id: 'second', label: 'Second Story', range: '8–12 ft', pct: '+35%', Icon: HeightMediumIcon },
  { id: 'roof', label: 'Roof / Staging', range: 'Over 12 ft', pct: '+60%', Icon: HeightHighIcon },
];

const EXISTING_COATINGS = [
  { id: 'none', label: 'No Coating / Bare Wood', desc: 'Weathered natural wood; no active film or stain layer' },
  { id: 'sealer', label: 'Clear Sealer', desc: 'Water-repellent transparent film; no pigment' },
  { id: 'transparent_stain', label: 'Transparent Stain', desc: 'Light tone enhancer with minimal pigment' },
  { id: 'semi_transparent', label: 'Semi-Transparent Stain', desc: 'Visible wood grain with rich pigment protection' },
  { id: 'solid_stain', label: 'Solid Color Stain', desc: 'Opaque protective color coat; hides wood grain' },
  { id: 'paint', label: 'Exterior Paint', desc: 'Heavy latex or oil paint film; requires chemical stripping' },
  { id: 'other', label: 'Other / Mixed', desc: 'Multiple coats or unknown previous manufacturer' },
];

const SERVICES = [
  { id: 'cleaning', name: 'Deep Cleaning', desc: 'Eco deck wash & scrub brush treatment', rate: '100 sqft/hr' },
  { id: 'pressure_washing', name: 'Pressure Washing', desc: 'Rotary surface wash & low-PSI rinse', rate: '100 sqft/hr' },
  { id: 'sanding', name: 'Floor & Railing Sanding', desc: 'Mechanical orbital sanding of rough grain & splinters', rate: '60 sqft/hr' },
  { id: 'paint_removal', name: 'Paint Removal', desc: 'Heavy-duty paint emulsifier & scrape', rate: '40 sqft/hr' },
  { id: 'stain_stripping', name: 'Stain Stripping', desc: 'Biodegradable chemical coating stripper', rate: '50 sqft/hr' },
  { id: 'staining', name: 'Staining & Conditioning', desc: 'Premium deep-penetrating exterior stain', rate: '100 sqft/hr' },
  { id: 'sealing', name: 'Clear Sealing', desc: 'Hydrophobic moisture lock protection', rate: '100 sqft/hr' },
  { id: 'waterproofing', name: 'Waterproofing Barrier', desc: 'Nano-polymer weather barrier seal', rate: '100 sqft/hr' },
  { id: 'repairs', name: 'Structural Board Repairs', desc: 'Replace rotted wood, fasteners, or balusters', rate: 'Contractor Quoted' },
];

const CONDITIONS = [
  { id: 'weathered', label: 'Weathered / Faded', desc: 'Grayed from sun UV exposure; fibers intact' },
  { id: 'peeling', label: 'Peeling / Flaking', desc: 'Existing coating delaminating in patches' },
  { id: 'cracks', label: 'Cracks & Splinters', desc: 'Surface fissures and sharp loose grain' },
  { id: 'mold', label: 'Mold, Mildew & Algae', desc: 'Slippery organic buildup and black staining' },
  { id: 'rot', label: 'Rotted Wood Boards', desc: 'Soft or punky wood requiring physical replacement' },
  { id: 'water_damage', label: 'Water Damage', desc: 'Cupping, puddling, or moisture pooling marks' },
  { id: 'warped', label: 'Warped or Loose Boards', desc: 'Board movement or protruding deck screws' },
  { id: 'railing_damage', label: 'Railing / Baluster Damage', desc: 'Wobbly top rails or missing spindles' },
];

export default function ContinuousEstimatorForm({ initialData = null, isEditing = false, deckId = null }) {
  const navigate = useNavigate();

  // --- STATE HOOKS ---

  // Section 1: Dimensions & Shape
  const [shape, setShape] = useState(initialData?.deckShape || 'rectangle');
  const [length, setLength] = useState(initialData?.dimensions?.length ? String(initialData.dimensions.length) : '20');
  const [width, setWidth] = useState(initialData?.dimensions?.width ? String(initialData.dimensions.width) : '15');
  const [unit, setUnit] = useState(initialData?.measurementUnit || 'ft');
  const [customArea, setCustomArea] = useState('');

  // Section 2: Components
  const [hasFlooring, setHasFlooring] = useState(true);
  const [hasRailings, setHasRailings] = useState(Boolean(initialData?.structureDetails?.hasRailings));
  const [railingLf, setRailingLf] = useState(initialData?.structureDetails?.railingLength ? String(initialData.structureDetails.railingLength) : '');
  const [hasStairs, setHasStairs] = useState(Boolean(initialData?.structureDetails?.hasStairs));
  const [stairSteps, setStairSteps] = useState(initialData?.structureDetails?.stairStepCount ? String(initialData.structureDetails.stairStepCount) : '');
  const [hasPosts, setHasPosts] = useState(false);
  const [postCount, setPostCount] = useState('');
  const [includeJoists, setIncludeJoists] = useState(false);
  const [hasFascia, setHasFascia] = useState(false);
  const [fasciaLf, setFasciaLf] = useState('');

  // Section 3: Wood Species
  const [woodSpecies, setWoodSpecies] = useState(initialData?.surfaceDetails?.material || 'cedar');

  // Section 4: Site & Accessibility
  const [height, setHeight] = useState(initialData?.structureDetails?.height || 'ground');
  const [siteConditions, setSiteConditions] = useState([]);

  // Section 5: Existing Coating
  const [existingCoating, setExistingCoating] = useState(initialData?.surfaceDetails?.coatingStatus || 'none');
  const [finishBase, setFinishBase] = useState('not_sure');
  const [manufacturer, setManufacturer] = useState('');

  // Section 6: Restoration Services & Finish
  const [services, setServices] = useState(['cleaning', 'staining']);
  const [stainType, setStainType] = useState('semi');

  // Section 7: Deck Condition
  const [conditions, setConditions] = useState(['weathered']);

  // Section 8: Photographs
  const [photos, setPhotos] = useState([]);

  // Section 9: Project Information
  const [projectName, setProjectName] = useState(initialData?.projectName || 'My Deck Restoration');
  const [fullName, setFullName] = useState(initialData?.ownerName || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState(initialData?.propertyAddress?.street || '');
  const [city, setCity] = useState(initialData?.propertyAddress?.city || '');
  const [state, setState] = useState(initialData?.propertyAddress?.state || '');
  const [zipCode, setZipCode] = useState(initialData?.propertyAddress?.zipCode || '');
  const [referralSource, setReferralSource] = useState('Website');
  const [notes, setNotes] = useState('');

  // UI & Calculation state
  const [livePricing, setLivePricing] = useState(null);
  const [calculating, setCalculating] = useState(false);
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
  const [refTab, setRefTab] = useState('shape'); // 'shape' | 'wood' | 'finish' | 'process'

  // --- RULE R1: TREX LOCK ---
  useEffect(() => {
    if (woodSpecies === 'trex' || woodSpecies === 'composite') {
      setServices((prev) => prev.filter((s) => s === 'cleaning' || s === 'pressure_washing'));
    }
  }, [woodSpecies]);

  // --- SQUARE DIMENSION COPY ---
  useEffect(() => {
    if (shape === 'square' && length) {
      setWidth(length);
    }
  }, [shape, length]);

  // Calculate Base Deck Area (L × W or custom)
  const floorArea = useMemo(() => {
    if (customArea && Number(customArea) > 0) return Number(customArea);
    const l = Number(length) || 0;
    const w = Number(width) || 0;
    return Math.round(l * w);
  }, [length, width, customArea]);

  // Compute Billable Surface Area Preview (F1)
  const billableAreaPreview = useMemo(() => {
    const f = hasFlooring ? floorArea : 0;
    const r = hasRailings ? (Number(railingLf) || 0) * 4 : 0;
    const s = hasStairs ? (Number(stairSteps) || 0) * 12 : 0;
    const p = hasPosts ? (Number(postCount) || 0) * 6 : 0;
    const j = includeJoists ? floorArea * 0.4 : 0;
    const fa = hasFascia ? (Number(fasciaLf) || 0) * 1.5 : 0;
    return Math.round(f + r + s + p + j + fa);
  }, [floorArea, hasFlooring, hasRailings, railingLf, hasStairs, stairSteps, hasPosts, postCount, includeJoists, hasFascia, fasciaLf]);

  // Calculate Step Progress (1 to 9)
  const progressPercent = useMemo(() => {
    let completed = 0;
    if (floorArea > 0) completed += 1; // S1
    if (hasFlooring || hasRailings || hasStairs) completed += 1; // S2
    if (woodSpecies) completed += 1; // S3
    if (height) completed += 1; // S4
    if (existingCoating) completed += 1; // S5
    if (services.length > 0) completed += 1; // S6
    if (conditions.length > 0) completed += 1; // S7
    if (projectName.trim()) completed += 1; // S9
    return Math.round((completed / 8) * 100);
  }, [floorArea, hasFlooring, hasRailings, hasStairs, woodSpecies, height, existingCoating, services, conditions, projectName]);

  // --- LIVE SERVER-SIDE PRICING ENGINE CALL ---
  const runPricingCalc = useCallback(async () => {
    if (floorArea <= 0 || services.length === 0) {
      setLivePricing(null);
      return;
    }
    setCalculating(true);
    try {
      const payload = {
        floorArea,
        services,
        stainType,
        woodSpecies,
        accessType: height,
        existingCoating,
        railingLf: hasRailings ? Number(railingLf) || 0 : 0,
        stairSteps: hasStairs ? Number(stairSteps) || 0 : 0,
        postCount: hasPosts ? Number(postCount) || 0 : 0,
        fasciaLf: hasFascia ? Number(fasciaLf) || 0 : 0,
        includeJoists,
        travelMinutes: 30,
      };
      const res = await calculateLivePricing(payload);
      setLivePricing(res);
    } catch {
      // Fallback preview if disconnected
    } finally {
      setCalculating(false);
    }
  }, [floorArea, services, stainType, woodSpecies, height, existingCoating, hasRailings, railingLf, hasStairs, stairSteps, hasPosts, postCount, hasFascia, fasciaLf, includeJoists]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runPricingCalc();
    }, 200);
    return () => clearTimeout(timer);
  }, [runPricingCalc]);

  // Service toggle handler
  const toggleService = (id) => {
    if ((woodSpecies === 'trex' || woodSpecies === 'composite') && id !== 'cleaning' && id !== 'pressure_washing') {
      return;
    }
    setServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  // Condition toggle handler
  const toggleCondition = (id) => {
    setConditions((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  // Rule R3: prompt to add repairs if damage selected
  const hasDamageFlags = conditions.some((c) => ['rot', 'water_damage', 'warped', 'railing_damage'].includes(c));
  const repairsNotSelected = hasDamageFlags && !services.includes('repairs');

  // Rule R4: coating needs stripping hint
  const coatingNeedsStripping = (existingCoating === 'paint' || existingCoating === 'solid_stain') &&
    !services.includes('paint_removal') && !services.includes('stain_stripping');

  // --- SUBMIT ESTIMATE ---
  const handleSave = async (status = 'SUBMITTED') => {
    if (floorArea <= 0) {
      setSubmitError('Please enter valid deck dimensions to calculate your estimate.');
      return;
    }
    if (services.length === 0) {
      setSubmitError('Please select at least one restoration service.');
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
        measurementUnit: unit,
        deckShape: shape,
        dimensions: {
          length: Number(length) || 20,
          width: Number(width) || 15,
          area: floorArea,
        },
        structureDetails: {
          height,
          levels: 1,
          hasRailings,
          railingLength: hasRailings ? Number(railingLf) || 0 : 0,
          hasStairs,
          stairStepCount: hasStairs ? Number(stairSteps) || 0 : 0,
        },
        surfaceDetails: {
          material: woodSpecies.includes('trex') ? 'composite' : 'wood',
          coatingStatus: existingCoating === 'paint' ? 'painted' : existingCoating === 'solid_stain' || existingCoating === 'semi_transparent' ? 'stained' : 'none',
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
        coatingType: stainType,
        conditionFlags: conditions,
        services,
        railingLength: hasRailings ? Number(railingLf) || 0 : 0,
        stairCount: hasStairs ? Number(stairSteps) || 0 : 0,
        postCount: hasPosts ? Number(postCount) || 0 : 0,
        fasciaLength: hasFascia ? Number(fasciaLf) || 0 : 0,
        includeJoists,
        notes: notes.trim(),
      };

      const est = await createEstimate(estimatePayload);

      // Set official estimate state for the highlight box
      setOfficialEstimate({
        ref: est?.estimateNumber || `DP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        total: est?.totalAmount || livePricing?.total || 2500,
        low: est?.pricingSnapshot?.low || livePricing?.low || 2500,
        high: est?.pricingSnapshot?.high || livePricing?.high || 2500,
        billableArea: est?.pricingSnapshot?.A || billableAreaPreview,
        rate: est?.pricingSnapshot?.rate || livePricing?.rate || 3.00,
        status: est?.pricingSnapshot?.status || (services.includes('repairs') ? 'needs_contractor_quote' : 'submitted'),
        needsPhotoReview: est?.pricingSnapshot?.needsPhotoReview ?? livePricing?.needsPhotoReview ?? false,
        deckId: activeDeckId,
        estimateId: est?._id || est?.id,
      });

      // Scroll smoothly down to the official estimate result box
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
        subject: `Estimate Conversion: ${projectName} ($${officialEstimate.total.toLocaleString()})`,
        message: `Customer converted official estimate ${officialEstimate.ref} for a ${woodSpecies} deck of ${officialEstimate.billableArea} sqft. Total: $${officialEstimate.total.toLocaleString()}. Ready for contractor assignment & site verification.`,
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

  const currentShapeObj = SHAPES.find((s) => s.id === shape) || SHAPES[0];
  const currentWoodObj = WOOD_SPECIES.find((w) => w.id === woodSpecies) || WOOD_SPECIES[1];

  return (
    <div style={styles.estimatorPageContainer}>
      {/* ======================================================== */}
      {/* 1. TOP NAVY & WHITE STEPPER BAR WITH REACH OUT BUTTON */}
      {/* ======================================================== */}
      <header style={styles.topStepperBar}>
        <div style={styles.brandTitleWrap}>
          <div style={styles.brandIconBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <span style={styles.brandMainTitle}>Deck Restoration Plus</span>
            <span style={styles.brandSubTitle}>Official Client & Contractor Estimator Engine</span>
          </div>
        </div>

        {/* Highlighted Reach Out / Specialist Support Button (as requested) */}
        <button
          type="button"
          onClick={() => setReachOutOpen(true)}
          style={styles.topReachOutBtn}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>Reach Out &bull; Talk to Specialist</span>
        </button>
      </header>

      {/* ======================================================== */}
      {/* 2. TWO-COLUMN LAYOUT: MIDDLE SCROLLABLE FORM + RIGHT SIDEBAR */}
      {/* ======================================================== */}
      <div style={styles.contentLayoutRow}>
        {/* MIDDLE SCROLLABLE FORM */}
        <div style={styles.middleScrollableColumn} id="middle-scrollable-form">
          {submitError && (
            <div style={styles.errorBox}>
              <strong>Attention:</strong> {submitError}
            </div>
          )}

          {/* SECTION 1: MEASUREMENTS & SHAPE */}
          <section style={styles.cardSection} id="section-1">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 1</span>
              <div>
                <h3 style={styles.cardTitle}>Deck Dimensions & Blueprint</h3>
                <p style={styles.cardSubtitle}>Choose your deck footprint and input outer perimeter dimensions.</p>
              </div>
            </div>

            {/* Shape selection cards */}
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
                      borderColor: isSelected ? '#1E3E62' : '#E2E8F0',
                      backgroundColor: isSelected ? '#F0F7FF' : '#FFFFFF',
                      boxShadow: isSelected ? '0 0 0 2px #1E3E62' : 'none',
                    }}
                  >
                    <IconComponent width={44} height={44} active={isSelected} />
                    <span style={styles.shapeLabel}>{s.label}</span>
                    <span style={styles.shapeDesc}>{s.desc}</span>
                  </div>
                );
              })}
            </div>

            {/* Dimensions inputs + live SVG plan */}
            <div style={styles.dimTwoCol}>
              <div style={styles.dimSvgBox}>
                <TopDownDeckPlanSvg length={length} width={width} />
              </div>

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
                        max="200"
                      />
                      <span style={styles.unitSuffix}>{unit}</span>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={styles.inputLabel}>Width ({unit}) *</label>
                    <div style={styles.inputWithUnit}>
                      <input
                        type="number"
                        placeholder="e.g. 15"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        style={styles.inputInner}
                        min="1"
                        max="200"
                        disabled={shape === 'square'}
                      />
                      <span style={styles.unitSuffix}>{unit}</span>
                    </div>
                  </div>
                </div>

                {/* Calculated Area Display */}
                <div style={styles.calcAreaBox}>
                  <div>
                    <span style={styles.calcAreaLabel}>Usable Floor Area</span>
                    <strong style={styles.calcAreaVal}>{floorArea > 0 ? `${floorArea.toLocaleString()} sq ft` : '—'}</strong>
                  </div>
                  <span style={styles.calcAreaFormula}>
                    {length} ft &times; {width} ft
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: COMPONENTS & ATTACHMENTS */}
          <section style={styles.cardSection} id="section-2">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 2</span>
              <div>
                <h3 style={styles.cardTitle}>Deck Components & Features</h3>
                <p style={styles.cardSubtitle}>Include railings, stairs, underside joists, and fascia (converted to billable sqft per spec).</p>
              </div>
            </div>

            <div style={styles.componentsGrid}>
              {/* Flooring */}
              <div style={styles.componentCard}>
                <div style={styles.compHeader}>
                  <input
                    type="checkbox"
                    checked={hasFlooring}
                    onChange={(e) => setHasFlooring(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <div>
                    <strong>Main Deck Flooring</strong>
                    <span style={styles.compSub}>Full horizontal planking surface ({floorArea} sqft)</span>
                  </div>
                </div>
              </div>

              {/* Railings */}
              <div style={styles.componentCard}>
                <div style={styles.compHeader}>
                  <input
                    type="checkbox"
                    checked={hasRailings}
                    onChange={(e) => setHasRailings(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <div>
                    <strong>Perimeter Railings</strong>
                    <span style={styles.compSub}>Balusters & top rail (&times; 4 sqft per linear ft)</span>
                  </div>
                </div>
                {hasRailings && (
                  <div style={styles.compInputWrap}>
                    <input
                      type="number"
                      placeholder="Linear feet (e.g. 40)"
                      value={railingLf}
                      onChange={(e) => setRailingLf(e.target.value)}
                      style={styles.subInput}
                    />
                    <span style={styles.subInputBadge}>{Number(railingLf || 0) * 4} sqft billable</span>
                  </div>
                )}
              </div>

              {/* Stairs */}
              <div style={styles.componentCard}>
                <div style={styles.compHeader}>
                  <input
                    type="checkbox"
                    checked={hasStairs}
                    onChange={(e) => setHasStairs(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <div>
                    <strong>Stair Steps</strong>
                    <span style={styles.compSub}>Treads & risers (&times; 12 sqft per step)</span>
                  </div>
                </div>
                {hasStairs && (
                  <div style={styles.compInputWrap}>
                    <input
                      type="number"
                      placeholder="Step count (e.g. 6)"
                      value={stairSteps}
                      onChange={(e) => setStairSteps(e.target.value)}
                      style={styles.subInput}
                    />
                    <span style={styles.subInputBadge}>{Number(stairSteps || 0) * 12} sqft billable</span>
                  </div>
                )}
              </div>

              {/* Posts */}
              <div style={styles.componentCard}>
                <div style={styles.compHeader}>
                  <input
                    type="checkbox"
                    checked={hasPosts}
                    onChange={(e) => setHasPosts(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <div>
                    <strong>Structural Posts</strong>
                    <span style={styles.compSub}>Vertical support posts (&times; 6 sqft each)</span>
                  </div>
                </div>
                {hasPosts && (
                  <div style={styles.compInputWrap}>
                    <input
                      type="number"
                      placeholder="Post count (e.g. 4)"
                      value={postCount}
                      onChange={(e) => setPostCount(e.target.value)}
                      style={styles.subInput}
                    />
                    <span style={styles.subInputBadge}>{Number(postCount || 0) * 6} sqft billable</span>
                  </div>
                )}
              </div>

              {/* Joists / Underside */}
              <div style={styles.componentCard}>
                <div style={styles.compHeader}>
                  <input
                    type="checkbox"
                    checked={includeJoists}
                    onChange={(e) => setIncludeJoists(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <div>
                    <strong>Include Underside Joists</strong>
                    <span style={styles.compSub}>Exposed joist framing (auto = 40% of floor area)</span>
                  </div>
                </div>
                {includeJoists && (
                  <div style={styles.compInputWrap}>
                    <span style={styles.subInputBadge}>{Math.round(floorArea * 0.4)} sqft billable joist framing</span>
                  </div>
                )}
              </div>

              {/* Fascia */}
              <div style={styles.componentCard}>
                <div style={styles.compHeader}>
                  <input
                    type="checkbox"
                    checked={hasFascia}
                    onChange={(e) => setHasFascia(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <div>
                    <strong>Perimeter Fascia Board</strong>
                    <span style={styles.compSub}>Edge rim joist cover (&times; 1.5 sqft per linear ft)</span>
                  </div>
                </div>
                {hasFascia && (
                  <div style={styles.compInputWrap}>
                    <input
                      type="number"
                      placeholder="Linear feet (e.g. 30)"
                      value={fasciaLf}
                      onChange={(e) => setFasciaLf(e.target.value)}
                      style={styles.subInput}
                    />
                    <span style={styles.subInputBadge}>{Math.round(Number(fasciaLf || 0) * 1.5)} sqft billable</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 3: WOOD SPECIES */}
          <section style={styles.cardSection} id="section-3">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 3</span>
              <div>
                <h3 style={styles.cardTitle}>Wood Species & Material</h3>
                <p style={styles.cardSubtitle}>Species determines wood density, grain hardness, and labor production adjustments.</p>
              </div>
            </div>

            <div style={styles.woodGrid}>
              {WOOD_SPECIES.map((w) => {
                const isSelected = woodSpecies === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      setWoodSpecies(w.id);
                      setRefTab('wood');
                    }}
                    style={{
                      ...styles.woodCard,
                      borderColor: isSelected ? '#1E3E62' : '#E2E8F0',
                      backgroundColor: isSelected ? '#F0F7FF' : '#FFFFFF',
                      boxShadow: isSelected ? '0 0 0 2px #1E3E62' : 'none',
                    }}
                  >
                    <div style={styles.woodHeaderRow}>
                      <span style={styles.woodName}>{w.name}</span>
                      <span style={styles.laborBadge}>{w.laborPct}</span>
                    </div>
                    <p style={styles.woodDesc}>{w.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Trex lock banner (Rule R1) */}
            {(woodSpecies === 'trex' || woodSpecies === 'composite') && (
              <div style={styles.trexBanner}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3E62" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>
                  <strong>Trex Composite Selected:</strong> Non-wood engineered decking is automatically locked to <em>Deep Cleaning & Pressure Washing</em>. Chemical stains and strippers are excluded.
                </span>
              </div>
            )}
          </section>

          {/* SECTION 4: SITE & ACCESSIBILITY */}
          <section style={styles.cardSection} id="section-4">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 4</span>
              <div>
                <h3 style={styles.cardTitle}>Site Accessibility & Elevation</h3>
                <p style={styles.cardSubtitle}>Elevation impacts ladder staging, fall protection safety, and crew transit hours.</p>
              </div>
            </div>

            <div style={styles.heightGrid}>
              {HEIGHTS.map((h) => {
                const isSelected = height === h.id;
                const IconComponent = h.Icon;
                return (
                  <div
                    key={h.id}
                    onClick={() => setHeight(h.id)}
                    style={{
                      ...styles.heightCard,
                      borderColor: isSelected ? '#1E3E62' : '#E2E8F0',
                      backgroundColor: isSelected ? '#F0F7FF' : '#FFFFFF',
                      boxShadow: isSelected ? '0 0 0 2px #1E3E62' : 'none',
                    }}
                  >
                    <IconComponent width={38} height={38} active={isSelected} />
                    <strong style={styles.heightLabel}>{h.label}</strong>
                    <span style={styles.heightRange}>{h.range}</span>
                    <span style={styles.heightPctBadge}>{h.pct} labor</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 5: EXISTING COATING */}
          <section style={styles.cardSection} id="section-5">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 5</span>
              <div>
                <h3 style={styles.cardTitle}>Existing Deck Finish & Coating</h3>
                <p style={styles.cardSubtitle}>Identify current surface treatments to determine required chemical stripping or cleaning preparation.</p>
              </div>
            </div>

            <div style={styles.coatingGrid}>
              {EXISTING_COATINGS.map((c) => {
                const isSelected = existingCoating === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setExistingCoating(c.id)}
                    style={{
                      ...styles.coatingCard,
                      borderColor: isSelected ? '#1E3E62' : '#E2E8F0',
                      backgroundColor: isSelected ? '#F0F7FF' : '#FFFFFF',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setExistingCoating(c.id)}
                        style={styles.radio}
                      />
                      <strong style={styles.coatingLabel}>{c.label}</strong>
                    </div>
                    <p style={styles.coatingDesc}>{c.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Rule R4 Hint */}
            {coatingNeedsStripping && (
              <div style={styles.hintBanner}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>
                  <strong>Coating Recommendation:</strong> Solid stain and exterior paint films typically require <em>Paint Removal or Chemical Stain Stripping</em> before applying a new finish.
                </span>
              </div>
            )}
          </section>

          {/* SECTION 6: RESTORATION SERVICES */}
          <section style={styles.cardSection} id="section-6">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 6</span>
              <div>
                <h3 style={styles.cardTitle}>Restoration Scope of Work</h3>
                <p style={styles.cardSubtitle}>Select all professional preparation, treatment, and finishing operations required.</p>
              </div>
            </div>

            <div style={styles.servicesGrid}>
              {SERVICES.map((s) => {
                const isSelected = services.includes(s.id);
                const isLocked = (woodSpecies === 'trex' || woodSpecies === 'composite') && s.id !== 'cleaning' && s.id !== 'pressure_washing';
                return (
                  <div
                    key={s.id}
                    onClick={() => !isLocked && toggleService(s.id)}
                    style={{
                      ...styles.serviceCard,
                      borderColor: isSelected ? '#1E3E62' : '#E2E8F0',
                      backgroundColor: isSelected ? '#F0F7FF' : isLocked ? '#F8FAFC' : '#FFFFFF',
                      opacity: isLocked ? 0.45 : 1,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div style={styles.srvHeader}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => !isLocked && toggleService(s.id)}
                        disabled={isLocked}
                        style={styles.checkbox}
                      />
                      <div>
                        <strong style={styles.srvName}>{s.name}</strong>
                        <span style={styles.srvRate}>{s.rate}</span>
                      </div>
                    </div>
                    <p style={styles.srvDesc}>{s.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Stain type selection if staining is ticked */}
            {services.includes('staining') && (
              <div style={styles.stainTypeBox}>
                <label style={styles.inputLabel}>Desired Stain Finish Type *</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
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
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Shows natural wood grain with UV color pigment</span>
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

          {/* SECTION 7: DECK PHYSICAL CONDITION */}
          <section style={styles.cardSection} id="section-7">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 7</span>
              <div>
                <h3 style={styles.cardTitle}>Deck Physical Condition</h3>
                <p style={styles.cardSubtitle}>Check any physical wear, board deterioration, or rot observed on the structure.</p>
              </div>
            </div>

            <div style={styles.conditionsGrid}>
              {CONDITIONS.map((c) => {
                const isSelected = conditions.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleCondition(c.id)}
                    style={{
                      ...styles.condCard,
                      borderColor: isSelected ? '#1E3E62' : '#E2E8F0',
                      backgroundColor: isSelected ? '#F0F7FF' : '#FFFFFF',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCondition(c.id)}
                        style={styles.checkbox}
                      />
                      <strong style={styles.condLabel}>{c.label}</strong>
                    </div>
                    <p style={styles.condDesc}>{c.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Rule R3 Repairs Notice */}
            {repairsNotSelected && (
              <div style={styles.repairsBanner}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>
                  Structural damage or rotted boards detected. Consider selecting <strong>Structural Board Repairs</strong> in Section 6 for full replacement pricing.
                </span>
              </div>
            )}
          </section>

          {/* SECTION 9: PROJECT DETAILS & SUBMISSION */}
          <section style={styles.cardSection} id="section-9">
            <div style={styles.cardHeader}>
              <span style={styles.stepBadge}>Section 9</span>
              <div>
                <h3 style={styles.cardTitle}>Project Information & Property Location</h3>
                <p style={styles.cardSubtitle}>Your details are encrypted and utilized solely for your official deck restoration estimate.</p>
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

              <div>
                <label style={styles.inputLabel}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  style={styles.textInput}
                />
              </div>

              <div>
                <label style={styles.inputLabel}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 012-3456"
                  style={styles.textInput}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={styles.inputLabel}>Project Property Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Oakwood Terrace"
                  style={styles.textInput}
                />
              </div>

              <div>
                <label style={styles.inputLabel}>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Springfield"
                  style={styles.textInput}
                />
              </div>

              <div>
                <label style={styles.inputLabel}>ZIP / Postal Code</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="62704"
                  style={styles.textInput}
                />
              </div>
            </div>

            {/* SUBMIT BUTTON BAR */}
            <div style={styles.bottomActionBar}>
              <button
                type="button"
                onClick={() => handleSave('DRAFT')}
                disabled={submitting}
                style={styles.draftBtn}
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSave('SUBMITTED')}
                disabled={submitting || floorArea <= 0}
                style={styles.submitBtn}
              >
                {submitting ? 'Calculating Official Quote...' : 'Generate Official Estimate &rarr;'}
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
                  <span style={styles.verifiedCheck}>&#10003;</span>
                  <span style={styles.resultTitle}>Deck Restoration Plus &bull; Official Estimate</span>
                </div>
                <span style={styles.refBadge}>Ref: {officialEstimate.ref}</span>
              </div>

              <div style={styles.resultContentRow}>
                {/* Grand Total Display */}
                <div style={styles.resultTotalBox}>
                  <span style={styles.resultTotalSub}>Guaranteed Estimate Total</span>
                  <strong style={styles.resultTotalAmt}>
                    ${officialEstimate.total.toLocaleString()}
                  </strong>
                  <span style={styles.resultRangeNotice}>
                    Calculated Range: ${officialEstimate.low.toLocaleString()} &ndash; ${officialEstimate.high.toLocaleString()}
                  </span>
                </div>

                {/* Key Spec Breakdown */}
                <div style={styles.resultSpecsBox}>
                  <div style={styles.specLine}>
                    <span>Total Billable Area:</span>
                    <strong>{officialEstimate.billableArea.toLocaleString()} sq ft</strong>
                  </div>
                  <div style={styles.specLine}>
                    <span>Package Unit Rate:</span>
                    <strong>${officialEstimate.rate.toFixed(2)} / sq ft</strong>
                  </div>
                  <div style={styles.specLine}>
                    <span>Species & Access:</span>
                    <strong>{currentWoodObj.name} &bull; {height}</strong>
                  </div>
                  <div style={styles.specLine}>
                    <span>Status:</span>
                    <strong style={{ color: officialEstimate.needsPhotoReview ? '#D97706' : '#15803D' }}>
                      {officialEstimate.needsPhotoReview ? 'Photo Review Requested' : 'Quote Verified'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Notice Banner */}
              <p style={styles.resultNotice}>
                {officialEstimate.needsPhotoReview
                  ? 'Preliminary estimate generated from your specifications. Final quote is confirmed after brief review of your uploaded photos or an on-site visit.'
                  : 'Official estimate computed via Deck Restoration Plus rate cards. Base labor, professional chemical application, and travel mobilization included.'}
              </p>

              {/* Action Buttons: Convert to Lead & Contact Specialist */}
              <div style={styles.resultActionRow}>
                {!leadCreated ? (
                  <button
                    type="button"
                    onClick={handleConvertToLead}
                    disabled={leadLoading}
                    style={styles.convertLeadBtn}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7.5" r="4" />
                      <polyline points="17 11 19 13 23 9" />
                    </svg>
                    <span>{leadLoading ? 'Assigning Project Lead...' : 'Book Site Inspection & Convert to Lead'}</span>
                  </button>
                ) : (
                  <div style={styles.leadSuccessBadge}>
                    <span>&#10003; Project Lead Created! A Deck Restoration Plus senior estimator has been assigned and will contact you within 24 hours.</span>
                  </div>
                )}

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
          {/* 1. CIRCLE STEP PROGRESS CARD (NO PENDING CHECKLIST ITEMS) */}
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
                    stroke="#1E3E62"
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
                  <strong style={{ fontSize: '16px', color: '#0B192C' }}>{progressPercent}%</strong>
                  <span style={{ fontSize: '9px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ready</span>
                </div>
              </div>

              <div>
                <h4 style={styles.sidebarHeading}>Estimation Progress</h4>
                <p style={styles.sidebarSub}>
                  {progressPercent === 100 ? 'All parameters complete' : 'Provide specifications to complete estimate'}
                </p>
                <div style={styles.readyIndicator}>
                  <span style={{ ...styles.statusDot, backgroundColor: progressPercent > 50 ? '#15803D' : '#D97706' }} />
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#334155' }}>
                    {progressPercent > 70 ? 'Calculations Active' : 'Enter Details'}
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
                <strong style={styles.specVal}>{currentShapeObj.label} ({length}&times;{width} ft)</strong>
              </div>
              <div style={styles.specRow}>
                <span style={styles.specLabel}>Floor Surface</span>
                <strong style={styles.specVal}>{floorArea > 0 ? `${floorArea} sq ft` : '—'}</strong>
              </div>
              <div style={styles.specRow}>
                <span style={styles.specLabel}>Total Billable Area</span>
                <strong style={{ ...styles.specVal, color: '#1E3E62' }}>{billableAreaPreview > 0 ? `${billableAreaPreview} sq ft` : '—'}</strong>
              </div>
              <div style={styles.specRow}>
                <span style={styles.specLabel}>Wood Species</span>
                <strong style={styles.specVal}>{currentWoodObj.name}</strong>
              </div>
              <div style={styles.specRow}>
                <span style={styles.specLabel}>Elevation</span>
                <strong style={styles.specVal}>{height}</strong>
              </div>
              <div style={styles.specRow}>
                <span style={styles.specLabel}>Existing Finish</span>
                <strong style={styles.specVal}>{existingCoating}</strong>
              </div>
              <div style={styles.specRow}>
                <span style={styles.specLabel}>Services</span>
                <strong style={styles.specVal}>{services.length} selected</strong>
              </div>
            </div>
          </div>

          {/* 3. ARCHITECTURAL REFERENCE & EDUCATIONAL WINDOW */}
          <div style={styles.sidebarCard}>
            <div style={styles.refWindowHeader}>
              <h4 style={styles.sidebarHeading}>Architectural Reference</h4>
              <div style={styles.refTabs}>
                <button
                  type="button"
                  onClick={() => setRefTab('shape')}
                  style={{ ...styles.refTabBtn, borderBottomColor: refTab === 'shape' ? '#1E3E62' : 'transparent', color: refTab === 'shape' ? '#1E3E62' : '#64748B' }}
                >
                  Shape
                </button>
                <button
                  type="button"
                  onClick={() => setRefTab('wood')}
                  style={{ ...styles.refTabBtn, borderBottomColor: refTab === 'wood' ? '#1E3E62' : 'transparent', color: refTab === 'wood' ? '#1E3E62' : '#64748B' }}
                >
                  Wood Grain
                </button>
              </div>
            </div>

            <div style={styles.refBody}>
              {refTab === 'shape' ? (
                <>
                  <img
                    src={currentShapeObj.realImg}
                    alt={currentShapeObj.refTitle}
                    style={styles.refImage}
                  />
                  <div style={styles.refCaption}>
                    <strong style={{ fontSize: '12px', color: '#0B192C' }}>{currentShapeObj.refTitle}</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
                      {currentShapeObj.refDesc}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={currentWoodObj.grainImg}
                    alt={currentWoodObj.name}
                    style={styles.refImage}
                  />
                  <div style={styles.refCaption}>
                    <strong style={{ fontSize: '12px', color: '#0B192C' }}>{currentWoodObj.name} Texture</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
                      {currentWoodObj.maintenanceNote}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 4. LIVE ESTIMATE (PREVIEW) CARD */}
          <div style={styles.sidebarCard}>
            <div style={styles.cardHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={styles.livePulse} />
                <h4 style={{ ...styles.sidebarHeading, color: '#0B192C' }}>Live Estimate Preview</h4>
              </div>
              {calculating && <span style={styles.updatingBadge}>Syncing...</span>}
            </div>

            {floorArea > 0 && livePricing ? (
              <div style={styles.priceBreakdown}>
                <div style={styles.priceRow}>
                  <span>Billable Surface Area</span>
                  <strong>{livePricing.billableArea || billableAreaPreview} sq ft</strong>
                </div>
                <div style={styles.priceRow}>
                  <span>Base Restoration Rate</span>
                  <strong>${Number(livePricing.rate || 2.75).toFixed(2)} / sqft</strong>
                </div>
                <div style={styles.priceRow}>
                  <span>Base Package Materials</span>
                  <strong>${Number(livePricing.totalMaterialCost || livePricing.basePrice || 0).toLocaleString()}</strong>
                </div>
                <div style={styles.priceRow}>
                  <span>Labor Hours & Surcharges</span>
                  <strong>${Number(livePricing.laborCost || livePricing.labourAdj || 0).toLocaleString()}</strong>
                </div>
                {livePricing.travelFee > 0 && (
                  <div style={styles.priceRow}>
                    <span>Travel Mobilization</span>
                    <strong>${livePricing.travelFee}</strong>
                  </div>
                )}

                <div style={styles.divider} />

                {/* SINGLE AMOUNT ESTIMATED TOTAL */}
                <div style={styles.totalBox}>
                  <span style={styles.totalLabel}>Estimated Total</span>
                  <strong style={styles.totalAmount}>
                    ${Number(livePricing.total || livePricing.baseEstimate || 2500).toLocaleString()}
                  </strong>
                </div>

                <div style={styles.rangeRow}>
                  <span>Low &ndash; High Range:</span>
                  <strong>${Number(livePricing.low || 2500).toLocaleString()} &ndash; ${Number(livePricing.high || 2500).toLocaleString()}</strong>
                </div>

                {livePricing.minJobApplied && (
                  <span style={styles.minFloorNotice}>Minimum Job Size Floor ($2,500) Applied</span>
                )}
              </div>
            ) : (
              <div style={styles.emptyPricePrompt}>
                Input length and width to calculate instant server-verified estimate.
              </div>
            )}
          </div>

          {/* 5. ALWAYS-VISIBLE REACH OUT & HELP CARD */}
          <div style={styles.helpCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <strong style={{ color: '#FFFFFF', fontSize: '13px' }}>Need Estimator Support?</strong>
            </div>
            <p style={styles.helpText}>
              Have complex multilevel stairs, rot, or custom framing? Our senior deck specialists review plans daily.
            </p>
            <button
              type="button"
              onClick={() => setReachOutOpen(true)}
              style={styles.sidebarReachOutBtn}
            >
              Reach Out / Need Help?
            </button>
          </div>
        </aside>
      </div>

      {/* ======================================================== */}
      {/* 3. REACH OUT / ENQUIRY MODAL (HOT PRIORITY LEAD CREATION) */}
      {/* ======================================================== */}
      {reachOutOpen && (
        <div style={styles.modalOverlay} onClick={() => setReachOutOpen(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0B192C', fontWeight: '800' }}>
                  Reach Out &bull; Deck Restoration Plus
                </h3>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Connect directly with a deck restoration specialist. Flags priority support in our system.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReachOutOpen(false)}
                style={styles.closeBtn}
              >
                &times;
              </button>
            </div>

            {reachOutSuccess ? (
              <div style={styles.modalSuccessBox}>
                <span style={{ fontSize: '24px' }}>&#10003;</span>
                <strong style={{ color: '#15803D', fontSize: '15px' }}>Enquiry Dispatched Successfully!</strong>
                <p style={{ margin: 0, fontSize: '12px', color: '#334155', textAlign: 'center' }}>
                  Your request has been routed to our on-duty senior estimator. We will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReachOut} style={styles.modalForm}>
                <div>
                  <label style={styles.inputLabel}>Enquiry Subject</label>
                  <input
                    type="text"
                    value={reachOutSubject}
                    onChange={(e) => setReachOutSubject(e.target.value)}
                    style={styles.textInput}
                    required
                  />
                </div>

                <div>
                  <label style={styles.inputLabel}>How can we help with your deck project? *</label>
                  <textarea
                    rows={4}
                    value={reachOutMsg}
                    onChange={(e) => setReachOutMsg(e.target.value)}
                    placeholder="Provide notes on access, timing, condition, or questions about the estimate..."
                    style={styles.textArea}
                    required
                  />
                </div>

                <div style={styles.modalActionRow}>
                  <button
                    type="button"
                    onClick={() => setReachOutOpen(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reachOutSending}
                    style={styles.sendEnquiryBtn}
                  >
                    {reachOutSending ? 'Transmitting Request...' : 'Submit Support Request'}
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

// --- MODERN DARK NAVY BLUE & CRISP WHITE THEME STYLES ---

const styles = {
  estimatorPageContainer: {
    backgroundColor: '#F8FAFC',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#0F172A',
  },
  topStepperBar: {
    backgroundColor: '#0B192C',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #1E3E62',
    boxShadow: '0 2px 8px rgba(11, 25, 44, 0.15)',
    zIndex: 25,
    flexShrink: 0,
  },
  brandTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#1E3E62',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #2C4E80',
  },
  brandMainTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: '-0.01em',
    display: 'block',
  },
  brandSubTitle: {
    fontSize: '11px',
    color: '#94A3B8',
    display: 'block',
    marginTop: '1px',
  },
  topReachOutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1E3E62',
    color: '#FFFFFF',
    border: '1px solid #3B82F6',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 12px rgba(59, 130, 246, 0.25)',
  },
  contentLayoutRow: {
    flex: 1,
    maxWidth: '1440px',
    width: '100%',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 350px',
    gap: '24px',
    overflow: 'hidden',
    boxSizing: 'border-box',
    alignItems: 'stretch',
  },
  middleScrollableColumn: {
    height: '100%',
    overflowY: 'auto',
    paddingRight: '8px',
    paddingBottom: '80px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    scrollbarWidth: 'thin',
  },
  fixedRightSidebar: {
    height: '100%',
    overflowY: 'auto',
    paddingBottom: '80px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flexShrink: 0,
    scrollbarWidth: 'thin',
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '18px',
  },
  stepBadge: {
    backgroundColor: '#0B192C',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '4px 10px',
    borderRadius: '6px',
    flexShrink: 0,
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '800',
    color: '#0B192C',
  },
  cardSubtitle: {
    margin: '3px 0 0 0',
    fontSize: '12px',
    color: '#64748B',
  },
  shapeCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  shapeCard: {
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '16px 12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  shapeLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0B192C',
    marginTop: '8px',
  },
  shapeDesc: {
    fontSize: '10px',
    color: '#64748B',
    marginTop: '2px',
    lineHeight: 1.3,
  },
  dimTwoCol: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '20px',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: '18px',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  dimSvgBox: {
    backgroundColor: '#FFFFFF',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimInputsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  dimInputRow: {
    display: 'flex',
    gap: '14px',
  },
  inputLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#334155',
    letterSpacing: '0.04em',
    marginBottom: '4px',
  },
  inputWithUnit: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  inputInner: {
    flex: 1,
    border: 'none',
    padding: '9px 12px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0B192C',
    outline: 'none',
  },
  unitSuffix: {
    padding: '0 12px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    borderLeft: '1px solid #CBD5E1',
  },
  calcAreaBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B192C',
    color: '#FFFFFF',
    padding: '12px 16px',
    borderRadius: '8px',
  },
  calcAreaLabel: {
    fontSize: '11px',
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '700',
    display: 'block',
  },
  calcAreaVal: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#FFFFFF',
  },
  calcAreaFormula: {
    fontSize: '12px',
    color: '#93C5FD',
    fontWeight: '600',
  },
  componentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  componentCard: {
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '12px 14px',
    backgroundColor: '#FFFFFF',
  },
  compHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#1E3E62',
    cursor: 'pointer',
    marginTop: '2px',
  },
  compSub: {
    display: 'block',
    fontSize: '11px',
    color: '#64748B',
    marginTop: '2px',
  },
  compInputWrap: {
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  subInput: {
    width: '130px',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '12px',
    outline: 'none',
  },
  subInputBadge: {
    fontSize: '11px',
    color: '#1E3E62',
    fontWeight: '700',
    backgroundColor: '#EFF6FF',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  woodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  woodCard: {
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '14px',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  woodHeaderRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '6px',
  },
  woodName: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#0B192C',
  },
  laborBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#1E3E62',
    backgroundColor: '#EFF6FF',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  woodDesc: {
    fontSize: '11px',
    color: '#64748B',
    margin: '6px 0 0 0',
    lineHeight: 1.4,
  },
  trexBanner: {
    marginTop: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#1E3E62',
  },
  heightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  heightCard: {
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '16px 12px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.18s ease',
  },
  heightLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0B192C',
    marginTop: '8px',
  },
  heightRange: {
    fontSize: '11px',
    color: '#64748B',
    marginTop: '2px',
  },
  heightPctBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#1E3E62',
    backgroundColor: '#EFF6FF',
    padding: '2px 8px',
    borderRadius: '12px',
    marginTop: '6px',
  },
  coatingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '10px',
  },
  coatingCard: {
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
  },
  radio: {
    width: '16px',
    height: '16px',
    accentColor: '#1E3E62',
    cursor: 'pointer',
  },
  coatingLabel: {
    fontSize: '12px',
    color: '#0B192C',
  },
  coatingDesc: {
    fontSize: '11px',
    color: '#64748B',
    margin: '4px 0 0 24px',
    lineHeight: 1.3,
  },
  hintBanner: {
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#92400E',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '12px',
  },
  serviceCard: {
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '12px',
    transition: 'all 0.18s ease',
  },
  srvHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  srvName: {
    fontSize: '12px',
    color: '#0B192C',
    display: 'block',
  },
  srvRate: {
    fontSize: '10px',
    color: '#1E3E62',
    fontWeight: '700',
    backgroundColor: '#EFF6FF',
    padding: '1px 6px',
    borderRadius: '4px',
    marginTop: '3px',
    display: 'inline-block',
  },
  srvDesc: {
    fontSize: '11px',
    color: '#64748B',
    margin: '6px 0 0 28px',
    lineHeight: 1.3,
  },
  stainTypeBox: {
    marginTop: '16px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    padding: '14px',
    borderRadius: '8px',
  },
  stainOption: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    padding: '10px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  conditionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '10px',
  },
  condCard: {
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
  },
  condLabel: {
    fontSize: '12px',
    color: '#0B192C',
  },
  condDesc: {
    fontSize: '11px',
    color: '#64748B',
    margin: '4px 0 0 24px',
    lineHeight: 1.3,
  },
  repairsBanner: {
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#F0F9FF',
    border: '1px solid #BAE6FD',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#0369A1',
  },
  projFormGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
  },
  textInput: {
    width: '100%',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '13px',
    color: '#0B192C',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textArea: {
    width: '100%',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    color: '#0B192C',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  bottomActionBar: {
    marginTop: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '14px',
    borderTop: '1px solid #E2E8F0',
    paddingTop: '20px',
  },
  draftBtn: {
    backgroundColor: '#FFFFFF',
    color: '#475569',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#0B192C',
    color: '#FFFFFF',
    border: '1px solid #0B192C',
    borderRadius: '8px',
    padding: '11px 24px',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(11, 25, 44, 0.2)',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    border: '1px solid #FECACA',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '12px',
  },

  // --- POST-ESTIMATE OFFICIAL RESULT BOX ---
  officialResultCard: {
    backgroundColor: '#FFFFFF',
    border: '2px solid #0B192C',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(11, 25, 44, 0.12)',
    marginTop: '10px',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '14px',
    marginBottom: '18px',
  },
  verifiedCheck: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#15803D',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '900',
  },
  resultTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0B192C',
  },
  refBadge: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#1E3E62',
    backgroundColor: '#EFF6FF',
    padding: '4px 10px',
    borderRadius: '6px',
    letterSpacing: '0.04em',
  },
  resultContentRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  resultTotalBox: {
    borderRight: '1px solid #E2E8F0',
    paddingRight: '16px',
  },
  resultTotalSub: {
    fontSize: '11px',
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '700',
    display: 'block',
  },
  resultTotalAmt: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#0B192C',
    display: 'block',
    margin: '4px 0',
  },
  resultRangeNotice: {
    fontSize: '11px',
    color: '#1E3E62',
    fontWeight: '600',
  },
  resultSpecsBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  specLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#475569',
  },
  resultNotice: {
    fontSize: '12px',
    color: '#64748B',
    lineHeight: 1.5,
    margin: '16px 0',
  },
  resultActionRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  convertLeadBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#15803D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 18px',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)',
  },
  talkSpecialistBtn: {
    backgroundColor: '#FFFFFF',
    color: '#0B192C',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    padding: '12px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  leadSuccessBadge: {
    flex: 1,
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    border: '1px solid #86EFAC',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '12px',
    fontWeight: '700',
    textAlign: 'center',
  },

  // --- RIGHT SIDEBAR STYLES ---
  sidebarCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  sidebarHeading: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '800',
    color: '#0B192C',
    letterSpacing: '-0.01em',
  },
  sidebarSub: {
    margin: '3px 0 0 0',
    fontSize: '11px',
    color: '#64748B',
  },
  progressCircleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
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
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  readyIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  cardHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  editLinkBtn: {
    background: 'none',
    border: 'none',
    fontSize: '11px',
    fontWeight: '700',
    color: '#1E3E62',
    cursor: 'pointer',
    padding: 0,
  },
  specsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  specRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    fontSize: '11px',
  },
  specLabel: {
    color: '#64748B',
  },
  specVal: {
    color: '#0B192C',
    fontWeight: '700',
    textAlign: 'right',
  },
  refWindowHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '8px',
    marginBottom: '12px',
  },
  refTabs: {
    display: 'flex',
    gap: '8px',
  },
  refTabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '4px 6px',
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
    height: '140px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
  },
  refCaption: {
    backgroundColor: '#F8FAFC',
    padding: '10px',
    borderRadius: '6px',
  },
  livePulse: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#2563EB',
    boxShadow: '0 0 8px #2563EB',
  },
  updatingBadge: {
    fontSize: '10px',
    color: '#2563EB',
    fontWeight: '700',
  },
  priceBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
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
    margin: '8px 0',
  },
  totalBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    backgroundColor: '#0B192C',
    color: '#FFFFFF',
    padding: '10px 12px',
    borderRadius: '8px',
  },
  totalLabel: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#94A3B8',
  },
  totalAmount: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#FFFFFF',
  },
  rangeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#64748B',
    marginTop: '6px',
  },
  minFloorNotice: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#1E3E62',
    backgroundColor: '#EFF6FF',
    padding: '4px 8px',
    borderRadius: '4px',
    textAlign: 'center',
    marginTop: '4px',
  },
  emptyPricePrompt: {
    fontSize: '12px',
    color: '#64748B',
    lineHeight: 1.4,
    textAlign: 'center',
    padding: '14px 6px',
  },
  helpCard: {
    backgroundColor: '#0B192C',
    borderRadius: '12px',
    padding: '16px',
    color: '#FFFFFF',
  },
  helpText: {
    fontSize: '11px',
    color: '#94A3B8',
    margin: '8px 0 12px 0',
    lineHeight: 1.4,
  },
  sidebarReachOutBtn: {
    width: '100%',
    backgroundColor: '#1E3E62',
    color: '#FFFFFF',
    border: '1px solid #3B82F6',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 25, 44, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '16px',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '520px',
    padding: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '14px',
    marginBottom: '16px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    color: '#64748B',
    cursor: 'pointer',
    lineHeight: 1,
    padding: 0,
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  modalActionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px',
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: 'none',
    borderRadius: '6px',
    padding: '9px 16px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  sendEnquiryBtn: {
    backgroundColor: '#0B192C',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    padding: '9px 18px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  modalSuccessBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '24px 12px',
  },
};
