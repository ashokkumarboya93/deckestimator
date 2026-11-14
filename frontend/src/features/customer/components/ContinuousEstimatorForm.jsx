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

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDeck, updateDeck, deleteDeck } from '../api/decksApi';
import { createEstimate, updateEstimate, calculateLivePricing, updateEstimateStatus } from '../api/estimatesApi';
import { leadApi } from '../api/leadApi';
import { calculateRestorationEstimateClient } from '../utils/pricingEngineClient';
import { contractorDiscountApi } from '../../contractor/api/contractorDiscountApi';
import { ESTIMATOR_IMAGES } from '../../../assets/images/Input_images/estimatorImages';
import { useAuth } from '../../auth/hooks/useAuth';

// Helper to validate Mongo ObjectIds
function isValidObjectId(id) {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
}

function extractValidObjectId(val) {
  if (!val) return null;
  if (typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val)) return val;
  if (typeof val === 'object' && val !== null) {
    const candidate = val._id || val.id;
    if (typeof candidate === 'string' && /^[0-9a-fA-F]{24}$/.test(candidate)) return candidate;
  }
  return null;
}

// Normalization Helpers for Reliable Edit Mode Pre-population (Strictly Clean on New Estimates)
function normalizeShape(val) {
  if (!val) return '';
  const s = String(val).toLowerCase().trim();
  if (s.includes('square')) return 'square';
  if (s.includes('l_shape') || s.includes('l-shape') || s.includes('l_shaped') || s === 'l') return 'l_shaped';
  if (s.includes('custom') || s.includes('multi')) return 'custom';
  if (s.includes('rect')) return 'rectangle';
  return '';
}

function normalizeWood(val) {
  if (!val) return '';
  const w = String(val).toLowerCase().trim();
  if (w.includes('cedar')) return 'cedar';
  if (w.includes('redwood')) return 'redwood';
  if (w.includes('mahogany')) return 'mahogany';
  if (w.includes('meranti')) return 'meranti';
  if (w.includes('tiger')) return 'tigerwood';
  if (w.includes('teak')) return 'teak';
  if (w.includes('trex') || w.includes('composite')) return 'trex';
  if (w.includes('pine') || w.includes('pt') || w.includes('pressure') || w === 'wood') return 'pt_pine';
  return '';
}

function normalizeElevation(val) {
  if (!val) return '';
  const h = String(val).toLowerCase().trim();
  if (h.includes('ground') || h.includes('low') || h === '0-4' || h === '0_4' || h === '0-2' || h === '0_2' || h === '2-4' || h === '2_4') return 'ground';
  if (h.includes('second') || h === '8-12' || h === '8_12') return 'second';
  if (h.includes('roof') || h.includes('staging') || h.includes('12')) return 'roof';
  if (h.includes('first') || h === '4-8' || h === '4_8') return 'first';
  return '';
}

function normalizeCoating(val) {
  if (!val) return '';
  const c = String(val).toLowerCase().trim();
  if (c.includes('paint')) return 'paint';
  if (c.includes('solid')) return 'solid_stain';
  if (c.includes('semi')) return 'semi_transparent';
  if (c.includes('trans')) return 'transparent_stain';
  if (c.includes('seal')) return 'sealer';
  if (c.includes('none') || c.includes('bare') || c.includes('clean') || c === 'fair' || c === 'good') return 'none';
  return '';
}

function normalizeServices(val) {
  if (Array.isArray(val) && val.length > 0) {
    const list = val.map((s) => {
      const str = String(s.id || s.serviceCode || s.name || s).toLowerCase();
      if (str.includes('stripp') || str.includes('strip')) return 'stripping';
      if (str.includes('sand')) return 'sanding';
      if (str.includes('stain') && !str.includes('strip')) return 'staining';
      if (str.includes('seal')) return 'sealing';
      if (str.includes('repair')) return 'repairs';
      if (str.includes('bright')) return 'wood_brightening';
      if (str.includes('waterproof')) return 'waterproofing';
      if (str.includes('no_coat')) return 'no_coating';
      if (str.includes('clean')) return 'cleaning';
      return null;
    }).filter(Boolean);
    if (list.length > 0) return [...new Set(list)];
  }
  return [];
}

function normalizeConditions(val) {
  if (Array.isArray(val) && val.length > 0) {
    const list = val.map((c) => {
      const str = String(c.id || c).toLowerCase();
      if (str.includes('weather')) return 'weathered';
      if (str.includes('crack')) return 'crack';
      if (str.includes('rot')) return 'rotted';
      if (str.includes('mold') || str.includes('mildew')) return 'mold';
      if (str.includes('peel')) return 'peeling';
      if (str.includes('water')) return 'water_damaged';
      if (str.includes('warp')) return 'warped';
      if (str.includes('loose')) return 'loose_board';
      if (str.includes('good')) return 'good_condition';
      return null;
    }).filter(Boolean);
    if (list.length > 0) return [...new Set(list)];
  }
  return [];
}

// --- DATA DEFINITIONS WITH CURATED IMAGES & CAPTIONS ---

const SHAPES = [
  {
    id: 'rectangle',
    label: 'Rectangle',
    img: ESTIMATOR_IMAGES.shapes.rectangle.main,
    isDiagram: true,
    desc: 'Classic uniform platform, max square footage efficiency.',
  },
  {
    id: 'square',
    label: 'Square',
    img: ESTIMATOR_IMAGES.shapes.square.main,
    isDiagram: true,
    desc: 'Equal perimeter length and width, courtyard living.',
  },
  {
    id: 'l_shaped',
    label: 'L-Shape',
    img: ESTIMATOR_IMAGES.shapes.l_shaped.main,
    isDiagram: true,
    desc: 'Wraps exterior corners, dual dining and lounge zones.',
  },
  {
    id: 'custom',
    label: 'Custom Shape',
    img: ESTIMATOR_IMAGES.shapes.custom.main,
    isDiagram: true,
    desc: 'Curved, angled or faceted bespoke architectural perimeter.',
  },
];

const COMPONENTS = [
  {
    id: 'railings',
    label: 'Perimeter Railings',
    img: ESTIMATOR_IMAGES.components.railings.main,
    field: 'railingSqft',
    prompt: 'Railing Surface (sq ft)',
    unit: 'sq ft',
    defaultVal: 120,
  },
  {
    id: 'stairs',
    label: 'Stair Steps',
    img: ESTIMATOR_IMAGES.components.stairs.main,
    field: 'stairSteps',
    prompt: 'Number of Steps (Count)',
    unit: 'steps',
    defaultVal: 4,
    multiplier: 12,
  },
  {
    id: 'pergola',
    label: 'Pergola',
    img: ESTIMATOR_IMAGES.components.pergola.main,
    field: 'pergolaSqft',
    prompt: 'Pergola Framing (sq ft)',
    unit: 'sq ft',
    defaultVal: 150,
  },
  {
    id: 'privacy_wall',
    label: 'Privacy Wall / Fencing',
    img: ESTIMATOR_IMAGES.components.privacy_wall.main,
    field: 'privacyWallSqft',
    prompt: 'Privacy Wall Surface (sq ft)',
    unit: 'sq ft',
    defaultVal: 80,
  },
  {
    id: 'siding',
    label: 'Exterior Siding',
    img: ESTIMATOR_IMAGES.components.siding.main,
    field: 'sidingSqft',
    prompt: 'Siding Area (sq ft)',
    unit: 'sq ft',
    defaultVal: 100,
  },
  {
    id: 'fascia',
    label: 'Perimeter Fascia',
    img: ESTIMATOR_IMAGES.components.fascia.main,
    field: 'fasciaSqft',
    prompt: 'Fascia Board Surface (sq ft)',
    unit: 'sq ft',
    defaultVal: 45,
  },
  {
    id: 'joists',
    label: 'Underside Joists',
    img: ESTIMATOR_IMAGES.components.joists.main,
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
    img: ESTIMATOR_IMAGES.woodSpecies.pt_pine.main,
    laborPct: '0% labor adj.',
    desc: 'Standard commercial softwood, treated for exterior ground contact.',
  },
  {
    id: 'cedar',
    name: 'Western Red Cedar',
    img: ESTIMATOR_IMAGES.woodSpecies.cedar.main,
    laborPct: '+10% labor adj.',
    desc: 'Naturally rot-resistant aromatic softwood with rich natural grain.',
  },
  {
    id: 'redwood',
    name: 'California Redwood',
    img: ESTIMATOR_IMAGES.woodSpecies.redwood.main,
    laborPct: '+15% labor adj.',
    desc: 'Dense, durable heartwood with natural tannin resistance.',
  },
  {
    id: 'mahogany',
    name: 'Honduran Mahogany',
    img: ESTIMATOR_IMAGES.woodSpecies.mahogany.main,
    laborPct: '+20% labor adj.',
    desc: 'High-density architectural hardwood with tight ribbon grain.',
  },
  {
    id: 'meranti',
    name: 'Meranti Hardwood',
    img: ESTIMATOR_IMAGES.woodSpecies.meranti.main,
    laborPct: '+20% labor adj.',
    desc: 'Durable exotic dark red hardwood, requires thin penetrating oils.',
  },
  {
    id: 'tigerwood',
    name: 'Tigerwood',
    img: ESTIMATOR_IMAGES.woodSpecies.tigerwood.main,
    laborPct: '+30% labor adj.',
    desc: 'Striking exotic Brazilian hardwood with dark striped grain.',
  },
  {
    id: 'teak',
    name: 'Burmese Teak',
    img: ESTIMATOR_IMAGES.woodSpecies.teak.main,
    laborPct: '+35% labor adj.',
    desc: 'Extremely durable golden hardwood packed with natural silica.',
  },
  {
    id: 'trex',
    name: 'Composite Trex',
    img: ESTIMATOR_IMAGES.woodSpecies.trex.main,
    laborPct: '−55% credit (clean only)',
    desc: 'Engineered synthetic polymer core. No chemical strippers or stains.',
  },
];

const ELEVATIONS = [
  {
    id: 'ground',
    label: 'Ground Level',
    range: '0–4 ft elevation',
    img: ESTIMATOR_IMAGES.elevations.ground.main,
  },
  {
    id: 'first',
    label: 'First Story',
    range: '4–8 ft elevation',
    img: ESTIMATOR_IMAGES.elevations.first.main,
  },
  {
    id: 'second',
    label: 'Second Story',
    range: '8–12 ft elevation',
    img: ESTIMATOR_IMAGES.elevations.second.main,
  },
  {
    id: 'roof',
    label: 'Roof / Staging',
    range: 'Over 12 ft elevation',
    img: ESTIMATOR_IMAGES.elevations.roof.main,
  },
];

const EXISTING_COATINGS = [
  {
    id: 'none',
    label: 'Bare Wood / No Coating',
    img: ESTIMATOR_IMAGES.coatings.none.main,
  },
  {
    id: 'sealer',
    label: 'Clear Sealer',
    img: ESTIMATOR_IMAGES.coatings.sealer.main,
  },
  {
    id: 'transparent_stain',
    label: 'Transparent Stain',
    img: ESTIMATOR_IMAGES.coatings.transparent_stain.main,
  },
  {
    id: 'semi_transparent',
    label: 'Semi-Transparent Stain',
    img: ESTIMATOR_IMAGES.coatings.semi_transparent.main,
  },
  {
    id: 'solid_stain',
    label: 'Solid Color Stain',
    img: ESTIMATOR_IMAGES.coatings.solid_stain.main,
  },
  {
    id: 'paint',
    label: 'Exterior Paint',
    img: ESTIMATOR_IMAGES.coatings.paint.main,
  },
];

const SERVICES_LIST = [
  {
    id: 'cleaning',
    name: 'Deck Cleaning (Deep Cleaning)',
    img: ESTIMATOR_IMAGES.services.cleaning.main,
    rate: '100 sqft/hr',
  },
  {
    id: 'stripping',
    name: 'Deck Stripping (Stain Stripping)',
    img: ESTIMATOR_IMAGES.services.stripping.main,
    rate: '50 sqft/hr',
  },
  {
    id: 'sanding',
    name: 'Deck Sanding (Floor & Railing)',
    img: ESTIMATOR_IMAGES.services.sanding.main,
    rate: '60 sqft/hr',
  },
  {
    id: 'staining',
    name: 'Deck Staining (Conditioning)',
    img: ESTIMATOR_IMAGES.services.staining.main,
    rate: '100 sqft/hr',
  },
  {
    id: 'sealing',
    name: 'Deck Sealing (Clear Sealing)',
    img: ESTIMATOR_IMAGES.services.sealing.main,
    rate: '100 sqft/hr',
  },
  {
    id: 'repairs',
    name: 'Deck Board Repair / Replacement',
    img: ESTIMATOR_IMAGES.services.repairs.main,
    rate: 'Contractor Quoted',
  },
  {
    id: 'wood_brightening',
    name: 'Wood Brightening',
    img: ESTIMATOR_IMAGES.services.wood_brightening.main,
    rate: '100 sqft/hr',
  },
  {
    id: 'waterproofing',
    name: 'Waterproofing Barrier',
    img: ESTIMATOR_IMAGES.services.waterproofing.main,
    rate: '100 sqft/hr',
  },
  {
    id: 'no_coating',
    name: 'No Coating / Natural Bare Finish',
    img: ESTIMATOR_IMAGES.services.no_coating.main,
    rate: 'Starts @ $2.50/sqft',
  },
];

const CONDITIONS = [
  {
    id: 'good_condition',
    label: '1. Good Condition (Baseline)',
    img: ESTIMATOR_IMAGES.conditions.good_condition.main,
    exclusive: true,
  },
  {
    id: 'weathered',
    label: '2. Weathered Wood',
    img: ESTIMATOR_IMAGES.conditions.weathered.main,
  },
  {
    id: 'crack',
    label: '3. Cracks & Checks',
    img: ESTIMATOR_IMAGES.conditions.crack.main,
    hasCount: true,
  },
  {
    id: 'rotted',
    label: '4. Rotted Boards',
    img: ESTIMATOR_IMAGES.conditions.rotted.main,
    hasCount: true,
  },
  {
    id: 'mold',
    label: '5. Heavy Mold & Mildew',
    img: ESTIMATOR_IMAGES.conditions.mold.main,
  },
  {
    id: 'peeling',
    label: '6. Peeling Coating',
    img: ESTIMATOR_IMAGES.conditions.peeling.main,
  },
  {
    id: 'water_damaged',
    label: '7. Water Damaged Wood',
    img: ESTIMATOR_IMAGES.conditions.water_damaged.main,
    hasCount: true,
  },
  {
    id: 'warped',
    label: '8. Warped Boards',
    img: ESTIMATOR_IMAGES.conditions.warped.main,
    hasCount: true,
  },
  {
    id: 'loose_board',
    label: '9. Loose Deck Boards',
    img: ESTIMATOR_IMAGES.conditions.loose_board.main,
    hasCount: true,
  },
];

// Curated Multi-Image Architectural Reference Dictionary
const REFERENCE_SPECS = {
  // --- SECTION 1: SHAPES ---
  shape_rectangle: {
    title: 'Rectangle Deck Blueprint',
    category: 'Perimeter Geometry',
    isDiagram: true,
    desc: 'Uniform rectangular geometry maximizing usable floor area with standardized joist runs and parallel board layouts. Minimal lumber trimming waste.',
    images: ESTIMATOR_IMAGES.shapes.rectangle.references,
  },
  shape_square: {
    title: 'Square Deck Platform',
    category: 'Perimeter Geometry',
    isDiagram: true,
    desc: 'Equilateral perimeter offering concentric load distribution. Well-suited for dedicated dining areas, fire features, and balanced outdoor entertaining.',
    images: ESTIMATOR_IMAGES.shapes.square.references,
  },
  shape_l_shaped: {
    title: 'L-Shaped Wraparound Deck',
    category: 'Perimeter Geometry',
    isDiagram: true,
    desc: 'Wraps exterior architectural corners to form distinct dining and lounging zones. Features multi-directional framing transitions and optimized traffic flow.',
    images: ESTIMATOR_IMAGES.shapes.l_shaped.references,
  },
  shape_custom: {
    title: 'Bespoke Architectural Footprint',
    category: 'Perimeter Geometry',
    isDiagram: true,
    desc: 'Curved, angled, or faceted perimeter footprints tailored to complex foundation lines, pool borders, or mature landscape trees.',
    images: ESTIMATOR_IMAGES.shapes.custom.references,
  },

  // --- SECTION 3: WOOD SPECIES ---
  wood_pt_pine: {
    title: 'Pressure-Treated Southern Pine',
    category: 'Wood Substrate',
    desc: 'Dense commercial softwood treated with preservative chemistry. Benefits from deep-penetrating oil sealers to stabilize moisture and minimize checking.',
    images: ESTIMATOR_IMAGES.woodSpecies.pt_pine.references,
  },
  wood_cedar: {
    title: 'Western Red Cedar',
    category: 'Wood Substrate',
    desc: 'Naturally decay-resistant aromatic softwood with rich natural grain. Demands non-film-forming penetrating stains to preserve fiber porosity and breathability.',
    images: ESTIMATOR_IMAGES.woodSpecies.cedar.references,
  },
  wood_redwood: {
    title: 'California Redwood',
    category: 'Wood Substrate',
    desc: 'Dense, durable heartwood with natural tannin resistance and fine texture. Treated with delicate conditioning agents to prevent surface fiber darkening.',
    images: ESTIMATOR_IMAGES.woodSpecies.redwood.references,
  },
  wood_mahogany: {
    title: 'Honduran Mahogany',
    category: 'Wood Substrate',
    desc: 'High-density architectural hardwood with tight ribbon grain. Requires deep penetrating oils and fine detail sanding to prevent grain fuzzing.',
    images: ESTIMATOR_IMAGES.woodSpecies.mahogany.references,
  },
  wood_meranti: {
    title: 'Meranti Exotic Hardwood',
    category: 'Wood Substrate',
    desc: 'Durable exotic dark red hardwood with fine pores. Requires specialized low-viscosity penetrating oils for proper saturation.',
    images: ESTIMATOR_IMAGES.woodSpecies.meranti.references,
  },
  wood_tigerwood: {
    title: 'Tigerwood (Goncalo Alves)',
    category: 'Wood Substrate',
    desc: 'Striking exotic Brazilian hardwood with dark striped grain and high silica content. Demands solvent-reduced exterior oils.',
    images: ESTIMATOR_IMAGES.woodSpecies.tigerwood.references,
  },
  wood_teak: {
    title: 'Burmese Natural Teak',
    category: 'Wood Substrate',
    desc: 'Extremely durable golden hardwood packed with natural oils and silica. Immune to rot, requiring breathable conditioning without synthetic topcoats.',
    images: ESTIMATOR_IMAGES.woodSpecies.teak.references,
  },
  wood_trex: {
    title: 'Composite & Capped Trex',
    category: 'Synthetic Substrate',
    desc: 'Engineered synthetic polymer core. Chemically washed with bio-safe detergents without heavy mechanical sanding or film-forming stains.',
    images: ESTIMATOR_IMAGES.woodSpecies.trex.references,
  },

  // --- SECTION 2: COMPONENTS ---
  comp_railings: {
    title: 'Perimeter Railings & Balusters',
    category: 'Architectural Component',
    desc: 'Handrails, posts, and vertical spindles. Restored using hand-brushing and spray techniques to coat intricate angles and spindle crevices.',
    images: ESTIMATOR_IMAGES.components.railings.references,
  },
  comp_stairs: {
    title: 'Stair Treads, Risers & Stringers',
    category: 'Architectural Component',
    desc: 'High foot-traffic transition steps. Tread surfaces receive traction-conscious deep penetrating finishes to prevent slipping while protecting wood.',
    images: ESTIMATOR_IMAGES.components.stairs.references,
  },
  comp_pergola: {
    title: 'Overhead Pergola Framing',
    category: 'Architectural Component',
    desc: 'Sun-exposed overhead beams and rafter tails. Treated with high-UV-blocking penetrating oils to counteract intense solar weathering.',
    images: ESTIMATOR_IMAGES.components.pergola.references,
  },
  comp_privacy_wall: {
    title: 'Privacy Wall & Vertical Fencing',
    category: 'Architectural Component',
    desc: 'Vertical tongue-and-groove or horizontal privacy slat panels. Treated with dual-face penetrating sealers to shield against moisture trapping.',
    images: ESTIMATOR_IMAGES.components.privacy_wall.references,
  },
  comp_siding: {
    title: 'Adjacent Exterior Siding',
    category: 'Architectural Component',
    desc: 'Exterior wooden sidewalls flanking the deck platform. Protected with matching chemical wash and mildew-inhibiting wood barrier.',
    images: ESTIMATOR_IMAGES.components.siding.references,
  },
  comp_fascia: {
    title: 'Perimeter Fascia Banding',
    category: 'Architectural Component',
    desc: 'Rim joist fascia boards framing the deck perimeter edges. Sealed to defend against ground-splash rot and end-grain capillary water absorption.',
    images: ESTIMATOR_IMAGES.components.fascia.references,
  },
  comp_joists: {
    title: 'Underside Framing Joists',
    category: 'Architectural Component',
    desc: 'Exposed structural framing beneath elevated decks. Treated with anti-fungal preservative coatings to deter mold growth in shaded moisture zones.',
    images: ESTIMATOR_IMAGES.components.joists.references,
  },

  // --- SECTION 4: ELEVATIONS ---
  elev_ground: {
    title: 'Ground Level Deck Platform',
    category: 'Site Elevation',
    desc: 'Elevated 0–4 feet above grade with close ground clearance. Inspection focuses on perimeter rim ventilation, splash back from turf sprinklers, and early damp detection.',
    images: ESTIMATOR_IMAGES.elevations.ground.references,
  },
  elev_first: {
    title: 'First Story Elevation',
    category: 'Site Elevation',
    desc: 'Elevated 4–8 feet above grade. Standard height requiring perimeter guard railings, multi-step stairs, and ladder access during restoration.',
    images: ESTIMATOR_IMAGES.elevations.first.references,
  },
  elev_second: {
    title: 'Second Story Elevated Deck',
    category: 'Site Elevation',
    desc: 'Elevated 8–12 feet above grade over walkout basements. Supported on tall heavy-duty columns with underside joist exposure and staging needs.',
    images: ESTIMATOR_IMAGES.elevations.second.references,
  },
  elev_roof: {
    title: 'Roof / Staging Elevation',
    category: 'Site Elevation',
    desc: 'Elevated over 12 feet above grade or rooftop deck setup. Requires specialized staging, safety harnesses, and heavy-duty scaffolding protocols.',
    images: ESTIMATOR_IMAGES.elevations.roof.references,
  },

  // --- SECTION 5: COATINGS & FINISHES ---
  coating_none: {
    title: 'Bare Wood / No Coating',
    category: 'Surface Coating',
    desc: 'Unfinished natural timber with raw cellulose exposed. Ideal canvas for penetrating conditioning oils and protective sealers.',
    images: ESTIMATOR_IMAGES.coatings.none.references,
  },
  coating_sealer: {
    title: 'Clear Protective Sealer',
    category: 'Surface Coating',
    desc: 'Transparent waterproofing barrier preserving wood grain aesthetics without altering natural timber coloration.',
    images: ESTIMATOR_IMAGES.coatings.sealer.references,
  },
  coating_transparent_stain: {
    title: 'Transparent Wood Stain',
    category: 'Surface Coating',
    desc: 'Lightly pigmented translucent formula enhancing natural grain patterns while imparting mild UV shielding.',
    images: ESTIMATOR_IMAGES.coatings.transparent_stain.references,
  },
  coating_semi_transparent: {
    title: 'Semi-Transparent Stain',
    category: 'Surface Coating',
    desc: 'Richly pigmented stain providing balanced color enrichment while allowing underlying timber grain and texture to shine through.',
    images: ESTIMATOR_IMAGES.coatings.semi_transparent.references,
  },
  coating_solid_stain: {
    title: 'Solid Color Deck Stain',
    category: 'Surface Coating',
    desc: 'Opaque protective film masking wood color variations, delivering maximum solar UV protection and weather shielding.',
    images: ESTIMATOR_IMAGES.coatings.solid_stain.references,
  },
  coating_paint: {
    title: 'Exterior Deck Paint',
    category: 'Surface Coating',
    desc: 'Heavy-duty acrylic exterior coating creating a solid protective shell over high-traffic decking and railing components.',
    images: ESTIMATOR_IMAGES.coatings.paint.references,
  },

  // --- SECTION 6: RESTORATION SERVICES ---
  service_cleaning: {
    title: 'Deck Deep Cleaning & Wash',
    category: 'Restoration Service',
    desc: 'Eco-safe chemical brightening and deep power wash eliminating surface dirt, algae, environmental grime, and oxidized fibers.',
    images: ESTIMATOR_IMAGES.services.cleaning.references,
  },
  service_stripping: {
    title: 'Stain & Coating Stripping',
    category: 'Restoration Service',
    desc: 'Commercial-grade emulsifier application lifting deteriorated old stains, sealers, and failing previous finishes down to raw wood.',
    images: ESTIMATOR_IMAGES.services.stripping.references,
  },
  service_sanding: {
    title: 'Mechanical Floor & Railing Sanding',
    category: 'Restoration Service',
    desc: 'Precision orbital and drum sanding removing surface splinters, leveling mill glaze, and opening wood pores for superior stain penetration.',
    images: ESTIMATOR_IMAGES.services.sanding.references,
  },
  service_staining: {
    title: 'Deck Conditioning & Staining',
    category: 'Restoration Service',
    desc: 'Deep-penetrating oil and conditioning application shielding against sun fade, water pooling, and thermal drying cycles.',
    images: ESTIMATOR_IMAGES.services.staining.references,
  },
  service_sealing: {
    title: 'Clear Protective Sealing',
    category: 'Restoration Service',
    desc: 'High-solids clear silicone/alkyd sealing barrier locking out ambient moisture, rainwater, and mold colonization.',
    images: ESTIMATOR_IMAGES.services.sealing.references,
  },
  service_repairs: {
    title: 'Board Repair & Replacement',
    category: 'Restoration Service',
    desc: 'Targeted extraction of decayed, warped, or split timber planks and fastening of new architectural-grade matching boards.',
    images: ESTIMATOR_IMAGES.services.repairs.references,
  },
  service_wood_brightening: {
    title: 'Chemical Wood Brightening',
    category: 'Restoration Service',
    desc: 'Acidic pH-balancing wash following chemical stripping to neutralize wood tannins and restore brilliant natural wood highlights.',
    images: ESTIMATOR_IMAGES.services.wood_brightening.references,
  },
  service_waterproofing: {
    title: 'Hydrophobic Waterproofing Barrier',
    category: 'Restoration Service',
    desc: 'Commercial-grade water repellant preventing capillary moisture intrusion into end-grains and joist connections.',
    images: ESTIMATOR_IMAGES.services.waterproofing.references,
  },
  service_no_coating: {
    title: 'Natural Bare Finish Treatment',
    category: 'Restoration Service',
    desc: 'Thorough chemical wash, brightening, and biological sanitization leaving wood naturally clean without synthetic topcoats.',
    images: ESTIMATOR_IMAGES.services.no_coating.references,
  },

  // --- SECTION 7: DECK PHYSICAL CONDITIONS ---
  cond_good_condition: {
    title: 'Good Baseline Condition',
    category: 'Surface Condition',
    desc: 'Deck boards maintain structural integrity with smooth surface fibers, intact protective coatings, and zero dry rot. Requires regular maintenance cleaning.',
    images: ESTIMATOR_IMAGES.conditions.good_condition.references,
  },
  cond_weathered: {
    title: 'Weathered Wood Surface',
    category: 'Surface Condition',
    desc: 'UV-degraded surface lignin with grey oxidized appearance. Benefits from chemical brightening and conditioning to restore rich natural wood tones.',
    images: ESTIMATOR_IMAGES.conditions.weathered.references,
  },
  cond_crack: {
    title: 'Cracks & Checks',
    category: 'Surface Condition',
    desc: 'Longitudinal surface fissures caused by wet-dry thermal expansion cycles. Requires deep-penetrating oil sealers to stabilize moisture and prevent splitting.',
    images: ESTIMATOR_IMAGES.conditions.crack.references,
  },
  cond_rotted: {
    title: 'Rotted Boards & Decay',
    category: 'Surface Condition',
    desc: 'Fungal decay causing soft, spongy, or compromised timber fibers. Targeted board replacement required prior to chemical treatment and sealing.',
    images: ESTIMATOR_IMAGES.conditions.rotted.references,
  },
  cond_mold: {
    title: 'Heavy Mold & Mildew Colonization',
    category: 'Surface Condition',
    desc: 'Surface spores flourishing in damp, shaded deck microclimates. Requires targeted anti-microbial detergent wash to eradicate spores down to cellular roots.',
    images: ESTIMATOR_IMAGES.conditions.mold.references,
  },
  cond_peeling: {
    title: 'Peeling & Blistered Coating',
    category: 'Surface Condition',
    desc: 'Failing surface film or solid stain flaking away from wood pores. Professional chemical stripping and mechanical sanding required before refinishing.',
    images: ESTIMATOR_IMAGES.conditions.peeling.references,
  },
  cond_water_damaged: {
    title: 'Water Damaged Timber',
    category: 'Surface Condition',
    desc: 'Deep water stains, moisture pooling discoloration, and softened surface cells. Demands drying evaluation, brightener treatment, and hydrophobic sealing.',
    images: ESTIMATOR_IMAGES.conditions.water_damaged.references,
  },
  cond_warped: {
    title: 'Warped & Cupped Boards',
    category: 'Surface Condition',
    desc: 'Boards curving upward at edges or bowing along joists due to uneven moisture evaporation. Requires leveling sanding or board replacement.',
    images: ESTIMATOR_IMAGES.conditions.warped.references,
  },
  cond_loose_board: {
    title: 'Loose Deck Boards',
    category: 'Surface Condition',
    desc: 'Backed-out nails or stripped screws causing planks to flex, squeak, or lift. Addressed with countersunk exterior-grade structural screws.',
    images: ESTIMATOR_IMAGES.conditions.loose_board.references,
  },
};

export default function ContinuousEstimatorForm({
  initialData = null,
  isEditing = false,
  deckId = null,
  isContractor: isContractorProp = undefined,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSavedDeckId, setActiveSavedDeckId] = useState(() => extractValidObjectId(deckId || initialData?.deckId));
  const [activeSavedEstimateId, setActiveSavedEstimateId] = useState(() => extractValidObjectId(initialData?.estimateId || initialData?._id || initialData?.id));
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const isContractor = isContractorProp !== undefined
    ? isContractorProp
    : (typeof window !== 'undefined' && window.location.pathname.startsWith('/contractor'));

  // --- STATE HOOKS (INITIALLY EMPTY AS REQUESTED) ---

  // Section 1: Dimensions & Shape
  const [shape, setShape] = useState(() => normalizeShape(initialData?.deckShape || initialData?.shape));
  const [length, setLength] = useState(() => (initialData?.dimensions?.length || initialData?.deckLength ? String(initialData.dimensions?.length || initialData.deckLength) : ''));
  const [width, setWidth] = useState(() => (initialData?.dimensions?.width || initialData?.deckWidth ? String(initialData.dimensions?.width || initialData.deckWidth) : ''));

  // Section 2: Components (Selected set & specific sqft)
  const [selectedComponents, setSelectedComponents] = useState(() => (initialData?.components || initialData?.structureDetails?.components || []));
  const [componentSqft, setComponentSqft] = useState(() => (initialData?.componentSqft || {}));

  // Section 3: Wood Species
  const [woodSpecies, setWoodSpecies] = useState(() => normalizeWood(initialData?.surfaceDetails?.woodSpecies || initialData?.surfaceDetails?.material || initialData?.woodSpecies));

  // Section 4: Site & Elevation
  const [height, setHeight] = useState(() => normalizeElevation(initialData?.structureDetails?.height || initialData?.elevation || initialData?.height));
  const [exactHeightFt, setExactHeightFt] = useState(() => (initialData?.exactHeightFt ? String(initialData.exactHeightFt) : ''));

  // Section 5: Existing Finish
  const [existingCoating, setExistingCoating] = useState(() => normalizeCoating(initialData?.surfaceDetails?.coatingStatus || initialData?.existingCoating || initialData?.coating));

  // Section 6: Restoration Scope
  const [services, setServices] = useState(() => normalizeServices(initialData?.services || initialData?.pricingSnapshot?.services));
  const [stainType, setStainType] = useState(() => (initialData?.stainType === 'solid' || initialData?.pricingSnapshot?.finish === 'solid' ? 'solid' : 'semi'));
  const [sandingType, setSandingType] = useState('mechanical_sanding');

  // Section 7: Deck Physical Condition
  const [conditions, setConditions] = useState(() => normalizeConditions(initialData?.conditions || initialData?.visibleConditions || initialData?.conditionFlags));
  const [crackBoardCount, setCrackBoardCount] = useState('');
  const [rottedBoardCount, setRottedBoardCount] = useState('');
  const [warpedBoardCount, setWarpedBoardCount] = useState('');
  const [looseBoardCount, setLooseBoardCount] = useState('');
  const [waterDamagedBoardCount, setWaterDamagedBoardCount] = useState('');
  const [crackLooseOverlapCount, setCrackLooseOverlapCount] = useState('');

  // Section 8: Project Information
  const [projectName, setProjectName] = useState(() => (initialData?.projectName || initialData?.estimateName || ''));
  const [address, setAddress] = useState(() => (initialData?.propertyAddress?.street || initialData?.location?.street || initialData?.address || ''));
  const [city, setCity] = useState(() => (initialData?.propertyAddress?.city || initialData?.location?.city || initialData?.city || ''));
  const [state, setState] = useState(() => (initialData?.propertyAddress?.state || initialData?.location?.state || initialData?.state || ''));
  const [zipCode, setZipCode] = useState(() => (initialData?.propertyAddress?.zipCode || initialData?.location?.zipCode || initialData?.zipCode || ''));
  const [notes, setNotes] = useState(() => (initialData?.notes || ''));

  // UI & Calculation state
  const [contractorPricing, setContractorPricing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Post-Estimate Box State
  const [officialEstimate, setOfficialEstimate] = useState(null);
  const [leadCreated, setLeadCreated] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const skipNextAutoSaveRef = useRef(false);

  // Contractor Wholesale Discount State (Default checked as requested)
  const [applyContractorDiscount, setApplyContractorDiscount] = useState(true);
  const [contractorDiscountPercent, setContractorDiscountPercent] = useState(10);

  // Minimum Job Mobilization Price Toggle (Default FALSE: pure calculated price without min job applied)
  const [applyMinJobPrice, setApplyMinJobPrice] = useState(false);

  // Fetch Contractor's Active or Admin-tuned discount rate
  useEffect(() => {
    if (!isContractor) return;
    let isMounted = true;
    async function loadContractorDiscount() {
      try {
        const res = await contractorDiscountApi.getEligibleDiscounts();
        if (!isMounted) return;
        const rate = res?.data?.effectiveRate || res?.effectiveRate;
        if (typeof rate === 'number' && rate > 0) {
          setContractorDiscountPercent(rate);
        }
      } catch (err) {
        console.warn('[Contractor Discount Fetch Note]: Using default 10%', err.message);
      }
    }
    loadContractorDiscount();
    return () => {
      isMounted = false;
    };
  }, [isContractor]);

  // Toggle Contractor Partner Discount (Interactive price recalculation & sync)
  const handleToggleContractorDiscount = async (checked) => {
    setApplyContractorDiscount(checked);
    if (officialEstimate?.estimateId) {
      try {
        const updated = await updateEstimate(officialEstimate.estimateId, {
          applyContractorDiscount: checked,
          contractorDiscountPercent,
        });
        if (updated) {
          setOfficialEstimate((prev) => ({
            ...prev,
            total: updated.totalAmount,
            discountBreakdown: updated.discountBreakdown,
          }));
        }
      } catch (err) {
        console.warn('[Discount Sync Warning]:', err.message);
      }
    }
  };

  // Toggle Minimum Job Mobilization Price (Default unchecked)
  const handleToggleMinJobPrice = async (checked) => {
    setApplyMinJobPrice(checked);
    if (officialEstimate?.estimateId) {
      try {
        const updated = await updateEstimate(officialEstimate.estimateId, {
          applyMinJobPrice: checked,
          applyContractorDiscount: isContractor ? applyContractorDiscount : false,
          contractorDiscountPercent: isContractor ? contractorDiscountPercent : 0,
        });
        if (updated) {
          setOfficialEstimate((prev) => ({
            ...prev,
            total: updated.totalAmount,
            discountBreakdown: updated.discountBreakdown,
            applyMinJobPrice: checked,
          }));
        }
      } catch (err) {
        console.warn('[Min Job Sync Warning]:', err.message);
      }
    }
  };

  // Synchronize when initialData arrives or changes (e.g. via Edit Navigation)
  useEffect(() => {
    if (!initialData) return;

    if (initialData.deckShape || initialData.shape) {
      setShape(normalizeShape(initialData.deckShape || initialData.shape));
    }
    const len = initialData.dimensions?.length || initialData.deckLength || initialData.length;
    if (len) setLength(String(len));
    const wid = initialData.dimensions?.width || initialData.deckWidth || initialData.width;
    if (wid) setWidth(String(wid));

    const wood = initialData.surfaceDetails?.woodSpecies || initialData.surfaceDetails?.material || initialData.woodSpecies || initialData.wood;
    if (wood) setWoodSpecies(normalizeWood(wood));

    const h = initialData.structureDetails?.height || initialData.elevation || initialData.height;
    if (h) setHeight(normalizeElevation(h));
    if (initialData.exactHeightFt || initialData.structureDetails?.exactHeightFt) {
      setExactHeightFt(String(initialData.exactHeightFt || initialData.structureDetails?.exactHeightFt));
    }

    const coat = initialData.surfaceDetails?.coatingStatus || initialData.existingCoating || initialData.coating;
    if (coat) setExistingCoating(normalizeCoating(coat));

    const srvs = initialData.services || initialData.pricingSnapshot?.services || [initialData.pricingSnapshot?.prep, initialData.pricingSnapshot?.finish].filter(Boolean);
    if (Array.isArray(srvs) && srvs.length > 0) {
      setServices(normalizeServices(srvs));
    }
    if (initialData.stainType || initialData.pricingSnapshot?.finish) {
      const st = initialData.stainType || initialData.pricingSnapshot?.finish;
      setStainType(st === 'solid' ? 'solid' : 'semi');
    }

    const conds = initialData.conditions || initialData.visibleConditions || initialData.conditionFlags;
    if (Array.isArray(conds) && conds.length > 0) {
      setConditions(normalizeConditions(conds));
    }

    const pName = initialData.projectName || initialData.estimateName;
    if (pName) setProjectName(pName);

    const addr = initialData.propertyAddress || initialData.location || {};
    if (addr.street) setAddress(addr.street);
    if (addr.city) setCity(addr.city);
    if (addr.state) setState(addr.state);
    if (addr.zipCode) setZipCode(addr.zipCode);
    if (initialData.notes) setNotes(initialData.notes);

    const comps = initialData.components || initialData.structureDetails?.components || [];
    if (Array.isArray(comps) && comps.length > 0) {
      setSelectedComponents(comps);
    }
    const sqfts = initialData.componentSqft || {};
    if (typeof sqfts === 'object' && Object.keys(sqfts).length > 0) {
      setComponentSqft(sqfts);
    }

    // Preload official estimate box so user sees current calculated price immediately
    const snap = initialData.pricingSnapshot;
    if (snap || initialData.totalAmount) {
      const calculatedAmt = snap?.calculatedTotal !== undefined ? snap.calculatedTotal : (initialData.totalAmount || 2500);
      const minJobFloor = snap?.minJob || 2500;
      const minJobApplies = snap?.minJobApplied ?? (calculatedAmt < minJobFloor);
      const hasMinJobApplied = Boolean(initialData.applyMinJobPrice || snap?.applyMinJobPrice);
      setApplyMinJobPrice(hasMinJobApplied);
      setOfficialEstimate({
        ref: initialData.estimateNumber || `DP-${new Date().getFullYear()}-REV`,
        total: initialData.totalAmount || (hasMinJobApplied ? minJobFloor : calculatedAmt),
        calculatedTotal: calculatedAmt,
        floorTotal: snap?.floorTotal || minJobFloor,
        applyMinJobPrice: hasMinJobApplied,
        rawTotal: snap?.calculatedTotal || calculatedAmt,
        minJobApplies,
        minJobAmount: minJobFloor,
        minJobNotice: minJobApplies
          ? `Important Notice: Deck Restoration Plus maintains a standard project mobilization minimum of $${minJobFloor.toLocaleString()} for this service tier. Because your current calculated scope is below this threshold, the $${minJobFloor.toLocaleString()} minimum job price will apply upon final booking and dispatch.`
          : null,
        low: snap?.low || minJobFloor,
        high: snap?.high || minJobFloor,
        billableArea: snap?.A || 400,
        rate: snap?.rate || 3.00,
        prep: snap?.prep || 'clean',
        finish: snap?.finish || 'sealer',
        baseHours: snap?.baseHours || 0,
        woodHours: snap?.woodHours || 0,
        accessHours: snap?.accessHours || 0,
        labourAdj: snap?.labourAdj || 0,
        travelFee: snap?.travelFee || 0,
        repairEstimate: snap?.repairEstimate || null,
        status: initialData.estimateStatus || 'CREATED',
        needsPhotoReview: snap?.needsPhotoReview ?? false,
        hasRepairs: snap?.hasRepairs ?? false,
        deckId: extractValidObjectId(initialData.deckId),
        estimateId: extractValidObjectId(initialData.estimateId || initialData._id),
      });
    }
  }, [initialData]);

  // Reach Out / Support Modal State
  const [reachOutOpen, setReachOutOpen] = useState(false);
  const [reachOutHover, setReachOutHover] = useState(false);
  const [reachOutSubject, setReachOutSubject] = useState('Estimator Assistance & Deck Scope');
  const [reachOutMsg, setReachOutMsg] = useState('');
  const [reachOutSending, setReachOutSending] = useState(false);
  const [reachOutSuccess, setReachOutSuccess] = useState(false);

  // Upload Photos (Section 8 Optional)
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  // Architectural / More References Window Interactive Key & Image Gallery
  const [activeRefKey, setActiveRefKey] = useState('shape_rectangle');
  const [refImageIdx, setRefImageIdx] = useState(0);
  const activeRefObj = REFERENCE_SPECS[activeRefKey] || REFERENCE_SPECS['shape_rectangle'];

  // Sync reference window when shape changes
  useEffect(() => {
    if (shape && REFERENCE_SPECS['shape_' + shape]) {
      setActiveRefKey('shape_' + shape);
      setRefImageIdx(0);
    }
  }, [shape]);

  // Sync reference window when woodSpecies changes
  useEffect(() => {
    if (woodSpecies && REFERENCE_SPECS['wood_' + woodSpecies]) {
      setActiveRefKey('wood_' + woodSpecies);
      setRefImageIdx(0);
    }
  }, [woodSpecies]);

  // Sync reference window when elevation changes
  useEffect(() => {
    if (height && REFERENCE_SPECS['elev_' + height]) {
      setActiveRefKey('elev_' + height);
      setRefImageIdx(0);
    }
  }, [height]);

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

  // --- SYNC PROJECT NAME TO TOP NAVBAR ---
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('deck_project_name_updated', { detail: projectName }));
  }, [projectName]);

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

  // Dynamic 9-Section Progress Tracking (Section 8 is Photos, Section 9 is Project Details)
  const sectionSteps = useMemo(() => [
    { num: 1, name: 'Dimensions', done: Boolean(shape && floorArea > 0), id: 'section-1' },
    { num: 2, name: 'Components', done: Boolean(selectedComponents.length > 0), id: 'section-2' },
    { num: 3, name: 'Wood', done: Boolean(woodSpecies), id: 'section-3' },
    { num: 4, name: 'Elevation', done: Boolean(height), id: 'section-4' },
    { num: 5, name: 'Coating', done: Boolean(existingCoating), id: 'section-5' },
    { num: 6, name: 'Services', done: Boolean(services.length > 0), id: 'section-6' },
    { num: 7, name: 'Condition', done: Boolean(conditions.length > 0), id: 'section-7' },
    { num: 8, name: 'Photos', done: Boolean(uploadedPhotos.length > 0), id: 'section-8' },
    { num: 9, name: 'Details', done: Boolean(projectName.trim()), id: 'section-9' },
  ], [shape, floorArea, selectedComponents, woodSpecies, height, existingCoating, services, conditions, uploadedPhotos, projectName]);

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
    if (REFERENCE_SPECS['cond_' + id]) {
      setActiveRefKey('cond_' + id);
      setRefImageIdx(0);
    }
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
    setConditions([]);
    setCrackBoardCount('');
    setRottedBoardCount('');
    setWarpedBoardCount('');
    setLooseBoardCount('');
    setWaterDamagedBoardCount('');
    setCrackLooseOverlapCount('');
    setUploadedPhotos([]);
    setProjectName('');
    setAddress('');
    setCity('');
    setState('');
    setZipCode('');
    setNotes('');
    setOfficialEstimate(null);
    setActiveSavedDeckId(null);
    setActiveSavedEstimateId(null);
    setSaveSuccessNotice(false);
    setSubmitError(null);
    setLeadCreated(false);
    setApplyContractorDiscount(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Photo File Upload (Section 8)
  const handlePhotoFiles = (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    fileList.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 10 MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedPhotos((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            category: 'full_view',
            dataUrl: e.target.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (id) => {
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePhotoCategoryChange = (id, category) => {
    setUploadedPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, category } : p))
    );
  };

  // Contractor-Only Live Pricing Preview with Client-Side Fallback & Live Sync
  const runContractorCalc = useCallback(async () => {
    if (!isContractor || floorArea <= 0) return;
    const activeServices = services.length > 0 ? services : ['cleaning'];
    const activeWood = woodSpecies || 'pt_pine';
    const activeHeight = height || 'ground';
    const activeCoating = existingCoating || 'none';
    const activeConditions = conditions.length > 0 ? conditions : ['weathered'];

    // 1. Instant local calculation (guaranteed 0ms response)
    const localCalc = calculateRestorationEstimateClient({
      floorArea,
      services: activeServices,
      stainType,
      woodSpecies: activeWood,
      accessType: activeHeight,
      exactHeightFt: exactHeightFt ? Number(exactHeightFt) : undefined,
      existingCoating: activeCoating,
      railingSqft: Number(componentSqft.railings || 0),
      stairSteps: Number(componentSqft.stairs || 0),
      stairStepCount: Number(componentSqft.stairs || 0),
      stairSqft: Number(componentSqft.stairs || 0) * 12,
      pergolaSqft: Number(componentSqft.pergola || 0),
      privacyWallSqft: Number(componentSqft.privacy_wall || 0),
      sidingSqft: Number(componentSqft.siding || 0),
      fasciaSqft: Number(componentSqft.fascia || 0),
      joistsSqft: Number(componentSqft.joists || 0),
      damageConditions: activeConditions,
      crackBoardCount: Number(crackBoardCount) || 0,
      rottedBoardCount: Number(rottedBoardCount) || 0,
      warpedBoardCount: Number(warpedBoardCount) || 0,
      looseBoardCount: Number(looseBoardCount) || 0,
      waterDamagedBoardCount: Number(waterDamagedBoardCount) || 0,
      crackLooseOverlapCount: Number(crackLooseOverlapCount) || 0,
      forContractor: true,
    });
    setContractorPricing(localCalc);

    // 2. Background sync to backend calculate endpoint
    try {
      const payload = {
        floorArea,
        services: activeServices,
        stainType,
        woodSpecies: activeWood,
        accessType: activeHeight,
        exactHeightFt: exactHeightFt ? Number(exactHeightFt) : undefined,
        existingCoating: activeCoating,
        railingSqft: Number(componentSqft.railings || 0),
        stairSteps: Number(componentSqft.stairs || 0),
        stairStepCount: Number(componentSqft.stairs || 0),
        stairSqft: Number(componentSqft.stairs || 0) * 12,
        pergolaSqft: Number(componentSqft.pergola || 0),
        privacyWallSqft: Number(componentSqft.privacy_wall || 0),
        sidingSqft: Number(componentSqft.siding || 0),
        fasciaSqft: Number(componentSqft.fascia || 0),
        joistsSqft: Number(componentSqft.joists || 0),
        damageConditions: activeConditions,
        crackBoardCount: Number(crackBoardCount) || 0,
        rottedBoardCount: Number(rottedBoardCount) || 0,
        warpedBoardCount: Number(warpedBoardCount) || 0,
        looseBoardCount: Number(looseBoardCount) || 0,
        waterDamagedBoardCount: Number(waterDamagedBoardCount) || 0,
        crackLooseOverlapCount: Number(crackLooseOverlapCount) || 0,
        forContractor: true,
      };
      const res = await calculateLivePricing(payload);
      if (res && (res.total || res.calculatedTotal)) {
        setContractorPricing(res);
      }
    } catch {
      // Ignore background error; localCalc is already rendered
    }
  }, [isContractor, floorArea, services, stainType, woodSpecies, height, exactHeightFt, existingCoating, componentSqft, conditions, crackBoardCount, rottedBoardCount, warpedBoardCount, looseBoardCount, waterDamagedBoardCount, crackLooseOverlapCount]);

  useEffect(() => {
    if (isContractor) {
      const timer = setTimeout(runContractorCalc, 150);
      return () => clearTimeout(timer);
    }
  }, [isContractor, runContractorCalc]);

  // --- SUBMIT ESTIMATE (INFALLIBLE CALCULATION GUARANTEE) ---
  const handleSave = async (status = 'SUBMITTED', { shouldScroll = true } = {}) => {
    // Sensible defaults so user is NEVER blocked by empty optional fields
    const activeShape = shape || 'rectangle';
    const activeLength = Number(length) > 0 ? Number(length) : 20;
    const activeWidth = Number(width) > 0 ? Number(width) : 15;
    const activeFloorArea = activeLength * activeWidth;
    const activeWood = woodSpecies || 'pt_pine';
    const activeHeight = height || 'ground';
    const activeCoating = existingCoating || 'none';
    const activeServices = services.length > 0 ? services : ['cleaning'];
    const activeConditions = conditions.length > 0 ? conditions : ['weathered'];
    const activeProjName = projectName.trim() || `Custom Deck Restoration (${activeFloorArea} sq ft) #${Math.floor(100 + Math.random() * 900)}`;

    setSubmitting(true);
    setSubmitError(null);

    // 1. Instant Client-Side Calculation Guarantee (Zero-delay, zero-failure)
    const localCalc = calculateRestorationEstimateClient({
      deckArea: activeFloorArea,
      floorArea: activeFloorArea,
      services: activeServices,
      stainType,
      woodSpecies: activeWood,
      accessType: activeHeight,
      exactHeightFt: exactHeightFt ? Number(exactHeightFt) : undefined,
      existingCoating: activeCoating,
      railingSqft: Number(componentSqft.railings || 0),
      stairSteps: Number(componentSqft.stairs || 0),
      stairStepCount: Number(componentSqft.stairs || 0),
      stairSqft: Number(componentSqft.stairs || 0) * 12,
      pergolaSqft: Number(componentSqft.pergola || 0),
      privacyWallSqft: Number(componentSqft.privacy_wall || 0),
      sidingSqft: Number(componentSqft.siding || 0),
      fasciaSqft: Number(componentSqft.fascia || 0),
      joistsSqft: Number(componentSqft.joists || 0),
      damageConditions: activeConditions,
      crackBoardCount: Number(crackBoardCount) || 0,
      rottedBoardCount: Number(rottedBoardCount) || 0,
      warpedBoardCount: Number(warpedBoardCount) || 0,
      looseBoardCount: Number(looseBoardCount) || 0,
      waterDamagedBoardCount: Number(waterDamagedBoardCount) || 0,
      crackLooseOverlapCount: Number(crackLooseOverlapCount) || 0,
      forContractor: isContractor,
    });

    const pureCalculatedTotal = localCalc.calculatedTotal !== undefined ? localCalc.calculatedTotal : (localCalc.total || 2500);
    const minJobFloor = localCalc.minJob || 2500;
    const floorCalculatedTotal = localCalc.floorTotal || Math.max(pureCalculatedTotal, minJobFloor);
    const initialChosenTotal = applyMinJobPrice ? floorCalculatedTotal : pureCalculatedTotal;
    const fallbackRef = `DP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const immediateEstimate = {
      ref: fallbackRef,
      total: initialChosenTotal,
      calculatedTotal: pureCalculatedTotal,
      floorTotal: floorCalculatedTotal,
      applyMinJobPrice,
      rawTotal: pureCalculatedTotal,
      rawLow: localCalc.lowCalculated || localCalc.low || pureCalculatedTotal,
      rawHigh: localCalc.highCalculated || localCalc.high || pureCalculatedTotal,
      minJobApplies: localCalc.minJobApplied,
      minJobAmount: minJobFloor,
      minJobNotice: localCalc.minJobNotice,
      low: applyMinJobPrice ? (localCalc.low || minJobFloor) : (localCalc.lowCalculated || localCalc.low || pureCalculatedTotal),
      high: applyMinJobPrice ? (localCalc.high || minJobFloor) : (localCalc.highCalculated || localCalc.high || pureCalculatedTotal),
      billableArea: localCalc.A || activeFloorArea,
      rate: localCalc.rate || 3.00,
      prep: localCalc.prep || 'clean',
      finish: localCalc.finish || 'sealer',
      baseHours: localCalc.baseHours || 0,
      woodHours: localCalc.woodHours || 0,
      accessHours: localCalc.accessHours || 0,
      labourAdj: localCalc.labourAdj || 0,
      travelFee: localCalc.travelFee || 0,
      repairEstimate: localCalc.repairEstimate || null,
      status: localCalc.status || (activeServices.includes('repairs') ? 'needs_contractor_quote' : 'submitted'),
      needsPhotoReview: localCalc.needsPhotoReview ?? false,
      hasRepairs: localCalc.hasRepairs ?? activeServices.includes('repairs'),
      deckId: null,
      estimateId: null,
    };

    // Immediately display the calculated estimate so the user ALWAYS sees the final price
    setOfficialEstimate(immediateEstimate);
    if (isContractor) setContractorPricing(localCalc);

    // Smooth scroll to the Official Estimate box on mobile/tablet, or sidebar/estimate on desktop
    if (shouldScroll) {
      setTimeout(() => {
        const isSmallViewport = typeof window !== 'undefined' && window.innerWidth <= 1024;
        const resultEl = document.getElementById('official-estimate-result-box');
        const sidebarCard = document.getElementById('sidebar-guidance-card');
        if (isSmallViewport && resultEl) {
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (sidebarCard) {
          sidebarCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (resultEl) {
          resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }

    // 2. Persist to Backend BEFORE showing/confirming saved official quote when creating or checking errors
    let newlyCreatedDeckId = null;
    try {
      const deckPayload = {
        projectName: activeProjName,
        projectDescription: `Restoration for ${activeWood} deck (${activeFloorArea} sqft)`,
        deckShape: activeShape,
        dimensions: {
          length: activeLength,
          width: activeWidth,
          area: activeFloorArea,
        },
        structureDetails: {
          height: activeHeight,
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
          material: activeWood.includes('trex') ? 'composite' : 'wood',
          woodSpecies: activeWood,
          coatingStatus: activeCoating === 'paint' ? 'painted' : activeCoating === 'solid_stain' ? 'stained' : 'none',
        },
        visibleConditions: activeConditions,
        photos: uploadedPhotos.map((p) => ({
          name: p.name,
          size: p.size,
          type: p.type,
          category: p.category,
          url: p.dataUrl,
        })),
        propertyAddress: { street: address, city, state, zipCode, country: 'USA' },
      };

      let savedDeck = null;
      const targetDeckId = activeSavedDeckId || extractValidObjectId(deckId || initialData?.deckId);

      if (targetDeckId) {
        try {
          savedDeck = await updateDeck(targetDeckId, deckPayload);
        } catch (deckErr) {
          console.warn('[Deck Update Fallback to Create]:', deckErr.message);
          savedDeck = await createDeck(deckPayload);
          newlyCreatedDeckId = extractValidObjectId(savedDeck?._id || savedDeck?.id);
        }
      } else {
        savedDeck = await createDeck(deckPayload);
        newlyCreatedDeckId = extractValidObjectId(savedDeck?._id || savedDeck?.id);
      }

      const activeDeckId = extractValidObjectId(savedDeck?._id || savedDeck?.id || targetDeckId);

      // Estimate Payload
      const estimatePayload = {
        deckId: activeDeckId,
        projectName: activeProjName,
        estimateName: `${activeProjName} Official Estimate`,
        floorArea: activeFloorArea,
        woodSpecies: activeWood,
        accessType: activeHeight,
        exactHeightFt: exactHeightFt ? Number(exactHeightFt) : undefined,
        coatingType: stainType,
        stainType,
        sandingType,
        conditionFlags: activeConditions,
        damageConditions: activeConditions,
        crackBoardCount: Number(crackBoardCount) || 0,
        rottedBoardCount: Number(rottedBoardCount) || 0,
        warpedBoardCount: Number(warpedBoardCount) || 0,
        looseBoardCount: Number(looseBoardCount) || 0,
        waterDamagedBoardCount: Number(waterDamagedBoardCount) || 0,
        crackLooseOverlapCount: Number(crackLooseOverlapCount) || 0,
        services: activeServices,
        railingSqft: Number(componentSqft.railings || 0),
        stairSteps: Number(componentSqft.stairs || 0),
        stairStepCount: Number(componentSqft.stairs || 0),
        stairSqft: Number(componentSqft.stairs || 0) * 12,
        pergolaSqft: Number(componentSqft.pergola || 0),
        privacyWallSqft: Number(componentSqft.privacy_wall || 0),
        sidingSqft: Number(componentSqft.siding || 0),
        fasciaSqft: Number(componentSqft.fascia || 0),
        joistsSqft: Number(componentSqft.joists || 0),
        components: selectedComponents,
        shape: activeShape,
        deckShape: activeShape,
        length: activeLength,
        width: activeWidth,
        notes: notes.trim(),
        photos: uploadedPhotos.map((p) => ({
          name: p.name,
          size: p.size,
          type: p.type,
          category: p.category,
          url: p.dataUrl || p.url,
        })),
        estimateStatus: 'CREATED',
        applyMinJobPrice,
        applyContractorDiscount: isContractor ? applyContractorDiscount : false,
        contractorDiscountPercent: isContractor ? contractorDiscountPercent : 0,
      };

      let est = null;
      const targetEstimateId = activeSavedEstimateId || extractValidObjectId(initialData?.estimateId || initialData?._id || initialData?.id);
      if (targetEstimateId) {
        try {
          est = await updateEstimate(targetEstimateId, estimatePayload);
        } catch (estErr) {
          if (estErr.status === 409 || estErr.code === 'CONFLICT') {
            throw estErr;
          }
          console.warn('[Estimate Update Fallback to Create]:', estErr.message);
          est = await createEstimate(estimatePayload);
        }
      } else {
        est = await createEstimate(estimatePayload);
      }

      if (activeDeckId && activeDeckId !== activeSavedDeckId) {
        skipNextAutoSaveRef.current = true;
        setActiveSavedDeckId(activeDeckId);
      }

      const activeEstId = extractValidObjectId(est?._id || est?.id || targetEstimateId);
      if (activeEstId && activeEstId !== activeSavedEstimateId) {
        skipNextAutoSaveRef.current = true;
        setActiveSavedEstimateId(activeEstId);
      }
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3500);

      try {
        window.dispatchEvent(new CustomEvent('estimation_saved', { detail: est }));
      } catch {
        // Safe dispatch
      }

      if (est) {
        const snap = est.pricingSnapshot || {};
        const estPureCalculated = snap.calculatedTotal !== undefined ? snap.calculatedTotal : pureCalculatedTotal;
        const estFloorTotal = snap.floorTotal || minJobFloor;
        const finalCalculatedTotal = typeof est.totalAmount === 'number' && est.totalAmount > 0
          ? est.totalAmount
          : (applyMinJobPrice ? estFloorTotal : estPureCalculated);
        const originalRaw = est.discountBreakdown?.originalTotal || (applyMinJobPrice ? estFloorTotal : estPureCalculated);
        const minJobApplies = snap.minJobApplied ?? (estPureCalculated < minJobFloor);

        setOfficialEstimate((prev) => ({
          ...prev,
          ref: est.estimateNumber || prev?.ref || fallbackRef,
          total: finalCalculatedTotal,
          calculatedTotal: estPureCalculated,
          floorTotal: estFloorTotal,
          applyMinJobPrice,
          rawTotal: originalRaw,
          rawLow: localCalc.lowCalculated || Math.round(originalRaw * 0.9),
          rawHigh: localCalc.highCalculated || Math.round(originalRaw * 1.15),
          minJobApplies,
          minJobAmount: minJobFloor,
          deckId: activeDeckId,
          estimateId: extractValidObjectId(est?._id || est?.id || activeEstId),
          discountBreakdown: est?.discountBreakdown || null,
        }));
      }
    } catch (persistErr) {
      console.warn('[Backend Persistence Note]:', persistErr.message);
      setSaveSuccessNotice(false);
      // Clean up temporary newly-created deck if estimate creation was rejected (e.g. 409 duplicate title)
      if (newlyCreatedDeckId && !activeSavedDeckId) {
        deleteDeck(newlyCreatedDeckId).catch(() => {});
      }
      if (!activeSavedEstimateId && (persistErr.status === 409 || persistErr.code === 'CONFLICT')) {
        setOfficialEstimate(null);
      }
      setSubmitError(persistErr.message || 'Failed to save estimate to server.');
      const errBanner = document.getElementById('section-9-error-banner');
      if (errBanner) {
        errBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Continuous Auto-Save: whenever inputs change after calculation, auto-update in place
  useEffect(() => {
    if (!activeSavedEstimateId && !activeSavedDeckId) return;
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      handleSave('SUBMITTED', { shouldScroll: false });
    }, 1500);
    return () => clearTimeout(timer);
  }, [
    activeSavedEstimateId,
    activeSavedDeckId,
    shape,
    length,
    width,
    woodSpecies,
    height,
    exactHeightFt,
    existingCoating,
    services,
    stainType,
    conditions,
    componentSqft,
    selectedComponents,
    crackBoardCount,
    rottedBoardCount,
    warpedBoardCount,
    looseBoardCount,
    waterDamagedBoardCount,
    address,
    city,
    state,
    zipCode,
    notes,
    applyMinJobPrice,
  ]);

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

      // Synchronize estimate status to IN_REVIEW in database
      if (officialEstimate.estimateId) {
        try {
          await updateEstimateStatus(officialEstimate.estimateId, 'IN_REVIEW', 'Customer converted to booking request');
        } catch (stErr) {
          console.warn('[Status Sync Warning]:', stErr.message);
        }
      }

      setLeadCreated(true);
    } catch (err) {
      alert(`Could not convert to lead: ${err.message}`);
    } finally {
      setLeadLoading(false);
    }
  };

  // Dedicated Export of Official Deck Estimate (Template PDF Document & Excel, lazy-loaded)
  const handleExportOfficialEstimate = async (format = 'pdf') => {
    if (!officialEstimate) return;
    const { downloadEstimatePdf, downloadEstimateExcel } = await import('../../../utils/reportExport');
    const estimatePayload = {
      ...officialEstimate,
      shape,
      deckShape: shape,
      length,
      width,
      floorArea,
      woodSpecies,
      height,
      accessType: height,
      exactHeightFt,
      existingCoating,
      services,
      conditions,
      componentSqft,
      crackBoardCount,
      rottedBoardCount,
      warpedBoardCount,
      looseBoardCount,
      waterDamagedBoardCount,
      photos: uploadedPhotos,
      projectName: projectName || 'Deck Restoration Project',
      propertyAddress: { street: address, city, state, zipCode, country: 'USA' },
    };

    if (format === 'excel') {
      downloadEstimateExcel(estimatePayload, user);
    } else {
      await downloadEstimatePdf(estimatePayload, user);
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

      // Synchronize estimate status to IN_REVIEW if active estimate exists
      if (officialEstimate?.estimateId) {
        try {
          await updateEstimateStatus(officialEstimate.estimateId, 'IN_REVIEW', 'Customer reached out via support inquiry');
        } catch (stErr) {
          console.warn('[Status Sync Warning]:', stErr.message);
        }
      }

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
    <div style={styles.estimatorPageContainer} className="estimator-page-root">
      <style>{`
        @media (max-width: 1024px) {
          .estimator-page-root {
            padding: 12px !important;
            gap: 14px !important;
          }
          .estimator-page-root .estimator-content-layout {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .estimator-page-root .estimator-sidebar-col {
            width: 100% !important;
            position: static !important;
            max-height: none !important;
            overflow-y: visible !important;
            gap: 12px !important;
          }
          .estimator-page-root .estimator-mobile-hide-guaranteed {
            display: none !important;
          }
          .estimator-page-root .estimator-top-bar {
            position: static !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            padding: 10px 12px !important;
            overflow-x: visible !important;
          }
          .estimator-page-root .estimator-top-boxes {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .estimator-page-root .estimator-top-box-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 6px 6px !important;
            min-height: 30px !important;
            font-size: 11px !important;
            border-radius: 7px !important;
          }
          .estimator-page-root .estimator-reachout-wrap {
            display: flex !important;
            justify-content: flex-end !important;
            width: 100% !important;
          }
          .estimator-page-root .estimator-reachout-btn {
            padding: 6px 12px 6px 8px !important;
            font-size: 11.5px !important;
            min-height: 32px !important;
            width: auto !important;
          }
          .estimator-page-root .estimator-dimensions-row {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
          .estimator-page-root .estimator-green-area-box {
            grid-column: 1 / -1 !important;
          }
          .estimator-page-root .estimator-proj-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
          .estimator-page-root .estimator-mini-badge {
            padding: 3px 8px !important;
            width: auto !important;
            height: auto !important;
            min-height: 0 !important;
            line-height: 1.25 !important;
          }
        }

        @media (max-width: 768px) {
          .estimator-page-root {
            padding: 10px !important;
            gap: 12px !important;
          }
          .estimator-page-root .estimator-main-col {
            gap: 12px !important;
          }
          .estimator-page-root .estimator-section-card {
            padding: 12px !important;
            border-radius: 10px !important;
          }
          .estimator-page-root .estimator-section-header {
            gap: 8px !important;
            margin-bottom: 12px !important;
            padding-bottom: 10px !important;
            align-items: center !important;
          }
          .estimator-page-root .estimator-step-badge {
            padding: 3px 9px !important;
            font-size: 10px !important;
            border-radius: 5px !important;
            white-space: nowrap !important;
            width: auto !important;
            flex-shrink: 0 !important;
            line-height: 1.2 !important;
          }
          .estimator-page-root .estimator-section-title {
            font-size: 15px !important;
            line-height: 1.25 !important;
          }
          .estimator-page-root .estimator-section-subtitle {
            font-size: 11.5px !important;
            line-height: 1.35 !important;
            margin-top: 2px !important;
          }
          .estimator-page-root .estimator-options-grid,
          .estimator-page-root .estimator-components-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }
          .estimator-page-root .estimator-card-img-frame {
            height: 70px !important;
          }
          .estimator-page-root .estimator-card-caption-box {
            padding: 7px 6px !important;
            gap: 2px !important;
          }
          .estimator-page-root .estimator-card-caption-title {
            font-size: 11.5px !important;
            line-height: 1.2 !important;
          }
          .estimator-page-root .estimator-check-badge {
            width: 18px !important;
            height: 18px !important;
            top: 5px !important;
            right: 5px !important;
          }
          .estimator-page-root .estimator-comp-meta {
            padding: 7px 8px !important;
            gap: 6px !important;
          }
          .estimator-page-root .estimator-comp-input-box {
            padding: 6px 8px 8px 8px !important;
          }
          .estimator-page-root .estimator-dimensions-row {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
            margin-top: 12px !important;
            padding-top: 12px !important;
          }
          .estimator-page-root .estimator-green-area-box {
            grid-column: 1 / -1 !important;
            padding: 10px 12px !important;
          }
          .estimator-page-root .estimator-green-area-val {
            font-size: 20px !important;
          }
          .estimator-page-root .estimator-stain-grid,
          .estimator-page-root .estimator-board-counts-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 8px !important;
          }
          .estimator-page-root .estimator-photo-tips-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }
          .estimator-page-root .estimator-photo-dropzone {
            padding: 16px 12px !important;
          }
          .estimator-page-root .estimator-proj-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 10px !important;
          }
          .estimator-page-root .estimator-proj-span2 {
            grid-column: 1 / -1 !important;
          }
          .estimator-page-root .estimator-submit-btn {
            width: 100% !important;
            padding: 11px 16px !important;
            font-size: 14px !important;
          }
          .estimator-page-root .estimator-sidebar-card {
            padding: 12px !important;
          }
          .estimator-page-root .estimator-ref-main-frame {
            height: 120px !important;
          }
          .estimator-page-root .estimator-ref-thumb-btn {
            padding: 0 !important;
            flex: 0 0 42px !important;
            width: 42px !important;
            height: 42px !important;
            min-height: 42px !important;
          }
          .estimator-page-root .estimator-ref-thumb-img {
            padding: 0 !important;
          }
          .estimator-page-root .estimator-ref-thumb-img-diagram {
            padding: 2px !important;
          }
          .estimator-page-root .estimator-official-card {
            padding: 14px 12px !important;
            margin: 8px 0 !important;
          }
          .estimator-page-root .estimator-official-header {
            flex-wrap: wrap !important;
            gap: 6px !important;
            padding-bottom: 8px !important;
          }
          .estimator-page-root .estimator-official-title {
            font-size: 13.5px !important;
          }
          .estimator-page-root .estimator-official-total-box {
            padding: 12px !important;
          }
          .estimator-page-root .estimator-official-amt {
            font-size: 28px !important;
          }
          .estimator-page-root .estimator-minjob-box {
            padding: 10px 12px !important;
            gap: 8px !important;
            margin-top: 12px !important;
          }
          .estimator-page-root .estimator-result-actions {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
            margin-top: 14px !important;
          }
          .estimator-page-root .estimator-result-actions > button {
            max-width: 100% !important;
            width: 100% !important;
            padding: 9px 10px !important;
            font-size: 12px !important;
            justify-content: center !important;
          }
          .estimator-page-root .estimator-result-actions > button:first-child {
            grid-column: 1 / -1 !important;
          }
        }

        @media (max-width: 480px) {
          .estimator-page-root .estimator-top-box-btn {
            padding: 5px 4px !important;
            font-size: 10.5px !important;
            min-height: 28px !important;
          }
          .estimator-page-root .estimator-card-img-frame {
            height: 62px !important;
          }
          .estimator-page-root .estimator-official-amt {
            font-size: 26px !important;
          }
        }
      `}</style>

      {/* Top Application Section Status & Reach Out Bar (Single Unified Line on Desktop, 3x3 Grid + Compact Reach Out on Mobile) */}
      <div style={styles.topBrandingBar} className="estimator-top-bar">
        {/* Left: Section Boxes (Section 01 to Section 09) */}
        <div style={styles.topSectionBoxesRow} className="estimator-top-boxes">
          {sectionSteps.map((step) => {
            const isFilled = step.done;
            const formattedNum = step.num < 10 ? `0${step.num}` : step.num;
            return (
              <button
                key={step.num}
                type="button"
                className="estimator-top-box-btn"
                onClick={() => scrollToSection(step.id)}
                title={`Section ${formattedNum}: ${step.name} - ${isFilled ? 'Completed (Click to view)' : 'Click to jump'}`}
                style={{
                  ...styles.topSectionBox,
                  backgroundColor: isFilled ? '#15803D' : '#FFFFFF',
                  borderColor: isFilled ? '#15803D' : '#CBD5E1',
                  color: isFilled ? '#FFFFFF' : '#334155',
                  boxShadow: isFilled ? '0 2px 6px rgba(21, 128, 61, 0.22)' : 'none',
                }}
              >
                {isFilled && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                <span>Section {formattedNum}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Reach Out button in exact same line with Hover Tooltip */}
        <div style={styles.topReachOutWrapper} className="estimator-reachout-wrap">
          <button
            type="button"
            className="estimator-reachout-btn"
            onClick={() => setReachOutOpen(true)}
            onMouseEnter={() => setReachOutHover(true)}
            onMouseLeave={() => setReachOutHover(false)}
            style={styles.topReachOutBtn}
            title="Need Assistance? Click to speak with a specialist"
          >
            <div style={styles.reachOutIconPill}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <span>Reach Out</span>
          </button>
          {reachOutHover && (
            <div style={styles.reachOutTooltip}>
              Need Assistance?
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TWO-COLUMN LAYOUT: MIDDLE SCROLLABLE FORM + RIGHT SIDEBAR */}
      {/* ======================================================== */}
      <div style={styles.contentLayoutRow} className="estimator-content-layout">
        {/* MIDDLE SCROLLABLE FORM */}
        <div style={styles.middleScrollableColumn} id="middle-scrollable-form" className="estimator-main-col">
          {submitError && (
            <div style={styles.errorBox}>
              <strong style={{ color: '#B91C1C' }}>Attention:</strong> {submitError}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 1: DECK DIMENSIONS & BLUEPRINT */}
          {/* ======================================================== */}
          <section style={styles.cardSection} className="estimator-section-card" id="section-1">
            <div style={styles.cardHeader} className="estimator-section-header">
              <span style={styles.stepBadge} className="estimator-step-badge">Section 1</span>
              <div>
                <h3 style={styles.cardTitle} className="estimator-section-title">Deck Footprint & Dimensions</h3>
                <p style={styles.cardSubtitle} className="estimator-section-subtitle">Select your deck perimeter shape and enter length and width.</p>
              </div>
            </div>

            {/* Shape Image Cards Grid (4 Shapes) */}
            <div style={styles.imageCardsGrid4} className="estimator-options-grid">
              {SHAPES.map((s) => {
                const isSelected = shape === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setShape(s.id);
                      if (REFERENCE_SPECS['shape_' + s.id]) {
                        setActiveRefKey('shape_' + s.id);
                        setRefImageIdx(0);
                      }
                    }}
                    style={{
                      ...styles.imageSelectCard,
                      borderColor: isSelected ? '#10B981' : '#E2E8F0',
                      boxShadow: isSelected ? '0 0 0 2px #10B981, 0 4px 12px rgba(16, 185, 129, 0.18)' : 'none',
                      backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                      position: 'relative',
                    }}
                  >
                    {isSelected && (
                      <div style={styles.cardSelectedCheckBadge} className="estimator-check-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <div style={styles.cardImageFrame} className="estimator-card-img-frame">
                      <img
                        src={s.img}
                        alt={s.label}
                        style={s.isDiagram ? styles.cardCoverImageContain : styles.cardCoverImage}
                      />
                    </div>
                    <div style={styles.cardCaptionBox} className="estimator-card-caption-box">
                      <strong style={{ ...styles.cardCaptionTitle, color: isSelected ? '#065F46' : '#1E293B' }} className="estimator-card-caption-title">
                        {s.label}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dimensions Inputs & Green Usable Area Highlight Box */}
            <div className="estimator-dimensions-row" style={styles.dimensionsFormRow}>
              <div style={styles.dimInputWrap}>
                <label style={styles.inputLabel}>Length (ft) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={length}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setLength(val);
                  }}
                  onWheel={(e) => e.target.blur()}
                  placeholder="e.g. 20"
                  style={styles.textInput}
                />
              </div>

              <div style={styles.dimInputWrap}>
                <label style={styles.inputLabel}>Width (ft) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={width}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setWidth(val);
                  }}
                  onWheel={(e) => e.target.blur()}
                  placeholder="e.g. 15"
                  disabled={shape === 'square'}
                  style={styles.textInput}
                />
              </div>

              {/* Polished Green Text Highlight Box */}
              <div style={styles.greenFloorAreaBox} className="estimator-green-area-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.greenDot} />
                  <span style={styles.greenAreaLabel}>
                    {currentShapeObj ? `${currentShapeObj.label} Shape Selected` : 'Select Shape & Dimensions'}
                  </span>
                </div>
                <strong style={styles.greenAreaValue} className="estimator-green-area-val">
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
          <section style={styles.cardSection} className="estimator-section-card" id="section-2">
            <div style={styles.cardHeader} className="estimator-section-header">
              <span style={styles.stepBadge} className="estimator-step-badge">Section 2</span>
              <div>
                <h3 style={styles.cardTitle} className="estimator-section-title">Deck Components & Features</h3>
                <p style={styles.cardSubtitle} className="estimator-section-subtitle">Select attached architectural structures to include square footage in the estimate.</p>
              </div>
            </div>

            <div style={styles.componentsGrid} className="estimator-components-grid">
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
                      onClick={() => {
                        toggleComponent(comp.id, comp.defaultVal || comp.defaultSqft);
                        if (REFERENCE_SPECS['comp_' + comp.id]) {
                          setActiveRefKey('comp_' + comp.id);
                          setRefImageIdx(0);
                        }
                      }}
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                    >
                      <div style={styles.componentThumbFrame} className="estimator-card-img-frame">
                        <img src={comp.img} alt={comp.label} loading="lazy" style={styles.componentThumbImage} />
                      </div>
                      <div style={styles.componentMetaRow} className="estimator-comp-meta">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          style={{ ...styles.checkbox, pointerEvents: 'none', flexShrink: 0 }}
                        />
                        <strong style={{ ...styles.cardCaptionTitle, color: isSelected ? '#034EA2' : '#1E293B' }} className="estimator-card-caption-title">
                          {comp.label}
                        </strong>
                      </div>
                    </div>

                    {/* Pop-out Input asking for Steps (for stairs) or Sqft (for others) when selected */}
                    {isSelected && (
                      <div style={styles.componentSqftInputBox} className="estimator-comp-input-box">
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
          <section style={styles.cardSection} className="estimator-section-card" id="section-3">
            <div style={styles.cardHeader} className="estimator-section-header">
              <span style={styles.stepBadge} className="estimator-step-badge">Section 3</span>
              <div>
                <h3 style={styles.cardTitle} className="estimator-section-title">Wood Species & Material</h3>
                <p style={styles.cardSubtitle} className="estimator-section-subtitle">Select one species. Density parameters apply to labor adjustments.</p>
              </div>
            </div>

            <div style={styles.imageCardsGrid4} className="estimator-options-grid">
              {WOOD_SPECIES.map((w) => {
                const isSelected = woodSpecies === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      setWoodSpecies(w.id);
                      if (REFERENCE_SPECS['wood_' + w.id]) {
                        setActiveRefKey('wood_' + w.id);
                        setRefImageIdx(0);
                      }
                    }}
                    style={{
                      ...styles.imageSelectCard,
                      borderColor: isSelected ? '#10B981' : '#E2E8F0',
                      boxShadow: isSelected ? '0 0 0 2px #10B981, 0 4px 12px rgba(16, 185, 129, 0.18)' : 'none',
                      backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                      position: 'relative',
                    }}
                  >
                    {isSelected && (
                      <div style={styles.cardSelectedCheckBadge} className="estimator-check-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <div style={styles.cardImageFrame} className="estimator-card-img-frame">
                      <img src={w.img} alt={w.name} loading="lazy" style={styles.cardCoverImage} />
                    </div>
                    <div style={styles.cardCaptionBox} className="estimator-card-caption-box">
                      <strong style={{ ...styles.cardCaptionTitle, color: isSelected ? '#065F46' : '#1E293B' }} className="estimator-card-caption-title">
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
          <section style={styles.cardSection} className="estimator-section-card" id="section-4">
            <div style={styles.cardHeader} className="estimator-section-header">
              <span style={styles.stepBadge} className="estimator-step-badge">Section 4</span>
              <div>
                <h3 style={styles.cardTitle} className="estimator-section-title">Site Accessibility & Elevation</h3>
                <p style={styles.cardSubtitle} className="estimator-section-subtitle">Select one elevation tier. Feet ranges shown clearly.</p>
              </div>
            </div>

            <div style={styles.imageCardsGrid4} className="estimator-options-grid">
              {ELEVATIONS.map((el) => {
                const isSelected = height === el.id;
                return (
                  <div
                    key={el.id}
                    onClick={() => {
                      setHeight(el.id);
                      if (REFERENCE_SPECS['elev_' + el.id]) {
                        setActiveRefKey('elev_' + el.id);
                        setRefImageIdx(0);
                      }
                    }}
                    style={{
                      ...styles.imageSelectCard,
                      borderColor: isSelected ? '#10B981' : '#E2E8F0',
                      boxShadow: isSelected ? '0 0 0 2px #10B981, 0 4px 12px rgba(16, 185, 129, 0.18)' : 'none',
                      backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                      position: 'relative',
                    }}
                  >
                    {isSelected && (
                      <div style={styles.cardSelectedCheckBadge} className="estimator-check-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <div style={styles.cardImageFrame} className="estimator-card-img-frame">
                      <img src={el.img} alt={el.label} loading="lazy" style={styles.cardCoverImage} />
                    </div>
                    <div style={styles.cardCaptionBox} className="estimator-card-caption-box">
                      <strong style={{ ...styles.cardCaptionTitle, color: isSelected ? '#065F46' : '#1E293B' }} className="estimator-card-caption-title">
                        {el.label}
                      </strong>
                      <span style={styles.rangeCaptionBadge}>{el.range}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optional Exact Height in Feet */}
            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#1E293B' }}>
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
              <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                {exactHeightFt ? `Auto-mapped elevation: ${Number(exactHeightFt) <= 4 ? 'Ground Level (0–4 ft)' : Number(exactHeightFt) <= 8 ? 'First Story (4–8 ft)' : Number(exactHeightFt) <= 12 ? 'Second Story (8–12 ft)' : 'Roof / Staging (Over 12 ft)'}` : 'Defaults to selected card tier above'}
              </span>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 5: EXISTING DECK FINISH & COATING (NO PRICE IMPACT) */}
          {/* ======================================================== */}
          <section style={styles.cardSection} className="estimator-section-card" id="section-5">
            <div style={styles.cardHeader} className="estimator-section-header">
              <span style={styles.stepBadge} className="estimator-step-badge">Section 5</span>
              <div>
                <h3 style={styles.cardTitle} className="estimator-section-title">Existing Deck Finish & Coating</h3>
                <p style={styles.cardSubtitle} className="estimator-section-subtitle">Select current finish layer on deck wood (No price impact, informs preparation).</p>
              </div>
            </div>

            <div style={styles.imageCardsGrid3} className="estimator-options-grid">
              {EXISTING_COATINGS.map((ec) => {
                const isSelected = existingCoating === ec.id;
                return (
                  <div
                    key={ec.id}
                    onClick={() => {
                      setExistingCoating(ec.id);
                      if (REFERENCE_SPECS['coating_' + ec.id]) {
                        setActiveRefKey('coating_' + ec.id);
                        setRefImageIdx(0);
                      }
                    }}
                    style={{
                      ...styles.imageSelectCard,
                      borderColor: isSelected ? '#10B981' : '#E2E8F0',
                      boxShadow: isSelected ? '0 0 0 2px #10B981, 0 4px 12px rgba(16, 185, 129, 0.18)' : 'none',
                      backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                      position: 'relative',
                    }}
                  >
                    {isSelected && (
                      <div style={styles.cardSelectedCheckBadge} className="estimator-check-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <div style={styles.cardImageFrame} className="estimator-card-img-frame">
                      <img src={ec.img} alt={ec.label} loading="lazy" style={styles.cardCoverImage} />
                    </div>
                    <div style={styles.cardCaptionBox} className="estimator-card-caption-box">
                      <strong style={{ ...styles.cardCaptionTitle, color: isSelected ? '#065F46' : '#1E293B' }} className="estimator-card-caption-title">
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
          <section style={styles.cardSection} className="estimator-section-card" id="section-6">
            <div style={styles.cardHeader} className="estimator-section-header">
              <span style={styles.stepBadge} className="estimator-step-badge">Section 6</span>
              <div>
                <h3 style={styles.cardTitle} className="estimator-section-title">Restoration Scope of Work</h3>
                <p style={styles.cardSubtitle} className="estimator-section-subtitle">Select operations. No coating starts at $2.50/sq.ft; each coating adds $1/sq.ft.</p>
              </div>
            </div>

            <div style={styles.imageCardsGrid3} className="estimator-options-grid">
              {SERVICES_LIST.map((srv) => {
                const isSelected = services.includes(srv.id);
                const isLocked = (woodSpecies === 'trex' || woodSpecies === 'composite') && srv.id !== 'cleaning' && srv.id !== 'no_coating';
                return (
                  <div
                    key={srv.id}
                    onClick={() => {
                      if (!isLocked) {
                        toggleService(srv.id);
                        if (REFERENCE_SPECS['service_' + srv.id]) {
                          setActiveRefKey('service_' + srv.id);
                          setRefImageIdx(0);
                        }
                      }
                    }}
                    style={{
                      ...styles.imageSelectCard,
                      borderColor: isSelected ? '#10B981' : '#E2E8F0',
                      boxShadow: isSelected ? '0 0 0 2px #10B981, 0 4px 12px rgba(16, 185, 129, 0.18)' : 'none',
                      backgroundColor: isSelected ? '#ECFDF5' : isLocked ? '#F8FAFC' : '#FFFFFF',
                      opacity: isLocked ? 0.45 : 1,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      position: 'relative',
                    }}
                  >
                    {isSelected && (
                      <div style={styles.cardSelectedCheckBadge} className="estimator-check-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <div style={styles.cardImageFrame} className="estimator-card-img-frame">
                      <img src={srv.img} alt={srv.name} loading="lazy" style={styles.cardCoverImage} />
                    </div>
                    <div style={styles.cardCaptionBox} className="estimator-card-caption-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          disabled={isLocked}
                          style={{ ...styles.checkbox, pointerEvents: 'none', flexShrink: 0 }}
                        />
                        <strong style={{ ...styles.cardCaptionTitle, color: isSelected ? '#065F46' : '#1E293B', fontSize: '12px' }} className="estimator-card-caption-title">
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
                <div className="estimator-stain-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '6px' }}>
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
          <section style={styles.cardSection} className="estimator-section-card" id="section-7">
            <div style={styles.cardHeader} className="estimator-section-header">
              <span style={styles.stepBadge} className="estimator-step-badge">Section 7</span>
              <div>
                <h3 style={styles.cardTitle} className="estimator-section-title">Deck Physical Condition</h3>
                <p style={styles.cardSubtitle} className="estimator-section-subtitle">Multi-select. <strong>Good Condition</strong> is an exclusive option.</p>
              </div>
            </div>

            <div style={styles.imageCardsGrid3} className="estimator-options-grid">
              {CONDITIONS.map((c) => {
                const isSelected = conditions.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      toggleCondition(c.id);
                      if (REFERENCE_SPECS['cond_' + c.id]) {
                        setActiveRefKey('cond_' + c.id);
                        setRefImageIdx(0);
                      }
                    }}
                    style={{
                      ...styles.imageSelectCard,
                      borderColor: isSelected ? '#10B981' : '#E2E8F0',
                      boxShadow: isSelected ? '0 0 0 2px #10B981, 0 4px 12px rgba(16, 185, 129, 0.18)' : 'none',
                      backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                      position: 'relative',
                    }}
                  >
                    {isSelected && (
                      <div style={styles.cardSelectedCheckBadge} className="estimator-check-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <div style={styles.cardImageFrame} className="estimator-card-img-frame">
                      <img src={c.img} alt={c.label} loading="lazy" style={styles.cardCoverImage} />
                    </div>
                    <div style={styles.cardCaptionBox} className="estimator-card-caption-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          style={{ ...styles.checkbox, pointerEvents: 'none', flexShrink: 0 }}
                        />
                        <strong style={{ ...styles.cardCaptionTitle, color: isSelected ? '#065F46' : '#1E293B', fontSize: '12px' }} className="estimator-card-caption-title">
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
                <div className="estimator-board-counts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
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
                    <div className="estimator-proj-span2" style={{ gridColumn: 'span 2' }}>
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
          {/* SECTION 8: UPLOAD PHOTOS (OPTIONAL) */}
          {/* ======================================================== */}
          <section style={styles.cardSection} className="estimator-section-card" id="section-8">
            <div style={styles.cardHeader} className="estimator-section-header">
              <span style={{ ...styles.stepBadge, backgroundColor: '#1E3A63' }} className="estimator-step-badge">Section 8</span>
              <div>
                <h3 style={styles.cardTitle} className="estimator-section-title">Upload photos (optional)</h3>
                <p style={styles.cardSubtitle} className="estimator-section-subtitle">Add photos of your deck to help us provide a more accurate estimate.</p>
              </div>
            </div>

            {/* Note banner (Clean Theme-Aligned) */}
            <div style={{ ...styles.photoNoticeBanner, backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span style={{ fontSize: '12px', color: '#1E3A63', lineHeight: 1.4 }}>
                Uploading photos is completely optional. Adding images helps our senior estimators inspect deck grain, weathering depth, and substrate condition for high-accuracy quotes.
              </span>
            </div>

            {/* Drag & Drop Upload Dropzone (Preserved Color As Requested) */}
            <div
              className="estimator-photo-dropzone"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingPhoto(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDraggingPhoto(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingPhoto(false);
                handlePhotoFiles(e.dataTransfer.files);
              }}
              onClick={() => {
                const el = document.getElementById('deck-photo-input');
                if (el) el.click();
              }}
              style={{
                ...styles.photoDropzone,
                borderColor: isDraggingPhoto ? '#D97706' : '#F59E0B',
                backgroundColor: isDraggingPhoto ? '#FEF3C7' : '#FFFBEB',
              }}
            >
              <input
                type="file"
                id="deck-photo-input"
                multiple
                accept="image/png,image/jpeg,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => handlePhotoFiles(e.target.files)}
              />
              <div style={styles.photoCloudIconBox}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                  <polyline points="12 13 12 7 9 10" />
                  <line x1="12" y1="7" x2="15" y2="10" />
                </svg>
              </div>
              <strong style={{ fontSize: '14px', color: '#78350F', display: 'block', marginBottom: '4px' }}>
                Drag & drop your photos here, or click to upload
              </strong>
              <span style={{ fontSize: '11.5px', color: '#92400E' }}>
                JPG, JPEG, PNG · max 10 MB each · previews stay in your browser
              </span>
            </div>

            {/* 4 Quick-Tip Category Guidance Cards with Clean SVGs */}
            <div style={styles.photoCategoriesGrid} className="estimator-photo-tips-grid">
              <div style={{ ...styles.photoCategoryCard, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <strong style={{ ...styles.photoCategoryTitle, color: '#1E3A63' }}>Full deck view</strong>
              </div>
              <div style={{ ...styles.photoCategoryCard, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <strong style={{ ...styles.photoCategoryTitle, color: '#1E3A63' }}>Close-up of surface</strong>
              </div>
              <div style={{ ...styles.photoCategoryCard, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 18 10 18 10 14 14 14 14 10 18 10" />
                  <line x1="6" y1="22" x2="6" y2="18" />
                  <line x1="18" y1="10" x2="18" y2="6" />
                </svg>
                <strong style={{ ...styles.photoCategoryTitle, color: '#1E3A63' }}>Stairs and railings</strong>
              </div>
              <div style={{ ...styles.photoCategoryCard, backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <strong style={{ ...styles.photoCategoryTitle, color: '#1E3A63' }}>Any problem areas</strong>
              </div>
            </div>

            {/* Photo Tips Banner with SVG Icon */}
            <div style={{ ...styles.photoTipsBanner, backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M9 18h6" />
                <path d="M10 22h4" />
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
              </svg>
              <div style={{ fontSize: '12px', color: '#1E293B', lineHeight: 1.5 }}>
                <strong style={{ color: '#1E3A63' }}>Photo tips:</strong> take photos in daylight, stand back for the full deck and get close to any peeling, cracks or gray patches.
              </div>
            </div>

            {/* Uploaded Photos Thumbnails Preview */}
            {uploadedPhotos.length > 0 && (
              <div style={styles.uploadedPhotosGrid}>
                {uploadedPhotos.map((photo) => (
                  <div key={photo.id} style={styles.photoPreviewCard}>
                    <img src={photo.dataUrl} alt={photo.name} style={styles.photoPreviewImg} />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto(photo.id);
                      }}
                      style={styles.photoRemoveBtn}
                      title="Remove photo"
                    >
                      ✕
                    </button>
                    <div style={styles.photoPreviewMeta}>
                      <span style={styles.photoPreviewName} title={photo.name}>{photo.name}</span>
                      <span style={styles.photoPreviewSize}>{(photo.size / (1024 * 1024)).toFixed(1)} MB</span>
                      <select
                        value={photo.category}
                        onChange={(e) => handlePhotoCategoryChange(photo.id, e.target.value)}
                        style={styles.photoCategorySelect}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="full_view">Full deck view</option>
                        <option value="surface">Close-up surface</option>
                        <option value="stairs_railings">Stairs & railings</option>
                        <option value="problem_areas">Problem area</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ======================================================== */}
          {/* SECTION 9: PROJECT INFORMATION & PROPERTY LOCATION */}
          {/* (Full Name & Phone removed; only Project Name required) */}
          {/* ======================================================== */}
          <section style={styles.cardSection} className="estimator-section-card" id="section-9">
            <div style={styles.cardHeader} className="estimator-section-header">
              <span style={styles.stepBadge} className="estimator-step-badge">Section 9</span>
              <div>
                <h3 style={styles.cardTitle} className="estimator-section-title">Project Information & Location</h3>
                <p style={styles.cardSubtitle} className="estimator-section-subtitle">Provide project reference name. Address fields are optional.</p>
              </div>
            </div>

            <div className="estimator-proj-grid" style={styles.projFormGrid}>
              <div className="estimator-proj-span2" style={{ gridColumn: 'span 2' }}>
                <label style={styles.inputLabel}>Project / Deck Name *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Backyard Cedar Deck Refinishing"
                  style={styles.textInput}
                />
              </div>

              <div className="estimator-proj-span2" style={{ gridColumn: 'span 2' }}>
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

              <div className="estimator-proj-span2" style={{ gridColumn: 'span 2' }}>
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

            {/* SUBMIT BUTTON BAR WITH INLINE FEEDBACK */}
            {submitError && (
              <div id="section-9-error-banner" style={{ ...styles.errorBox, marginTop: '16px', marginBottom: '8px' }}>
                <strong style={{ color: '#B91C1C' }}>Notice:</strong> {submitError}
              </div>
            )}

            <div style={styles.bottomActionBar}>
              <button
                type="button"
                className="estimator-submit-btn"
                onClick={() => handleSave('SUBMITTED')}
                disabled={submitting}
                style={styles.submitBtn}
                id="get-estimation-submit-btn"
                title="Calculate guaranteed restoration quote"
              >
                {submitting ? 'Calculating Official Quote...' : 'Get Estimation →'}
              </button>
            </div>
          </section>

          {/* ======================================================== */}
          {/* POST-ESTIMATE OFFICIAL ESTIMATE RESULT BOX (HIGHLIGHTED) */}
          {/* ======================================================== */}
          {officialEstimate && (
            <div style={styles.officialResultCard} className="estimator-official-card" id="official-estimate-result-box">
              <div style={styles.resultHeader} className="estimator-official-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.verifiedCheck}>✓</span>
                  <span style={styles.resultTitle} className="estimator-official-title">Deck Restoration Plus • Official Estimate</span>
                </div>
                <span style={styles.refBadge} className="estimator-mini-badge">Ref: {officialEstimate.ref}</span>
              </div>

              {/* CLIENT Q12 STRICT COMPLIANCE: Customer sees ONE TOTAL NUMBER ONLY with ZERO breakdown */}
              {!isContractor ? (
                <div style={styles.customerTotalBox} className="estimator-official-total-box">
                  <span style={styles.customerTotalSub}>Official Guaranteed Estimate Total</span>
                  <strong style={styles.customerTotalAmt} className="estimator-official-amt">
                    ${((applyMinJobPrice
                      ? Math.max(
                          officialEstimate.calculatedTotal ?? officialEstimate.rawTotal ?? officialEstimate.total,
                          officialEstimate.minJobAmount || 2500
                        )
                      : (officialEstimate.calculatedTotal ?? officialEstimate.rawTotal ?? officialEstimate.total)
                    )).toLocaleString()}
                  </strong>
                  <span style={styles.customerTotalSubNotice}>
                    {officialEstimate.status === 'needs_contractor_quote'
                      ? 'Provisional estimate • Repairs require on-site contractor confirmation'
                      : officialEstimate.needsPhotoReview
                      ? 'Preliminary quote • Subject to photo review or site visit confirmation'
                      : 'Comprehensive estimate based on Deck Restoration Plus quality standards'}
                  </span>

                  {/* USER REQUIREMENT: Minimum Job Notice & Default Unchecked Checkbox to Apply Min Job Price */}
                  <div style={styles.customerMinJobNoticeBox} className="estimator-minjob-box">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <strong style={{ color: '#92400E', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                        Important Note — Minimum Job Price:
                      </strong>
                      <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#78350F', lineHeight: 1.45 }}>
                        Deck Restoration Plus maintains a standard mobilization minimum of <strong>${(officialEstimate.minJobAmount || 2500).toLocaleString()}</strong> for this service tier.
                        By default, your estimate shows the pure calculated price (${(officialEstimate.calculatedTotal ?? officialEstimate.rawTotal ?? officialEstimate.total).toLocaleString()}) without the minimum job price applied.
                      </p>
                      <label style={styles.minJobCheckboxLabel}>
                        <input
                          type="checkbox"
                          checked={applyMinJobPrice}
                          onChange={(e) => handleToggleMinJobPrice(e.target.checked)}
                          style={styles.minJobCheckboxInput}
                        />
                        <span style={styles.minJobCheckboxText}>
                          Apply standard minimum job mobilization price (${(officialEstimate.minJobAmount || 2500).toLocaleString()})
                        </span>
                      </label>
                      {applyMinJobPrice && (
                        <span style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#B45309', fontWeight: '600' }}>
                          ✓ Minimum job mobilization price applied (${(Math.max(officialEstimate.calculatedTotal ?? officialEstimate.rawTotal ?? officialEstimate.total, officialEstimate.minJobAmount || 2500)).toLocaleString()}). Uncheck to return to pure calculated price.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* CONTRACTOR VIEW: Full Operational Estimation Summary (Matches customer box styling & full width) */
                <div style={styles.customerTotalBox}>
                  <span style={styles.customerTotalSub}>Contractor Quoted Total</span>

                  {(() => {
                    const pureBase = officialEstimate.calculatedTotal ?? officialEstimate.rawTotal ?? officialEstimate.total;
                    const contractorMinJobAmt = officialEstimate.minJobAmount || 2500;
                    const activeBase = applyMinJobPrice ? Math.max(pureBase, contractorMinJobAmt) : pureBase;
                    const discountedAmt = Math.max(0, Math.round(activeBase * (1 - contractorDiscountPercent / 100)));
                    const wholesaleSavings = Math.round(activeBase * (contractorDiscountPercent / 100));

                    return (
                      <>
                        {applyContractorDiscount ? (
                          <div style={{ margin: '8px 0 10px 0', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <span style={styles.strikePrice}>
                                ${activeBase.toLocaleString()}
                              </span>
                              <strong style={{ ...styles.customerTotalAmt, color: '#15803D', margin: 0 }}>
                                ${discountedAmt.toLocaleString()}
                              </strong>
                              <span style={styles.discountBadgePill}>
                                ✓ {contractorDiscountPercent}% Contractor Discount Applied
                              </span>
                            </div>
                            <span style={{ ...styles.discountSavingsSubtext, display: 'block', marginTop: '6px' }}>
                              Wholesale Savings: ${wholesaleSavings.toLocaleString()} deducted via active tier
                            </span>
                          </div>
                        ) : (
                          <div style={{ margin: '8px 0 10px 0', textAlign: 'center' }}>
                            <strong style={{ ...styles.customerTotalAmt, color: '#034EA2', margin: 0 }}>
                              ${activeBase.toLocaleString()}
                            </strong>
                            <span style={{ ...styles.discountSavingsSubtext, display: 'block', marginTop: '6px' }}>
                              Standard retail rate (Wholesale discount unchecked)
                            </span>
                          </div>
                        )}

                        {/* Interactive Contractor Wholesale Discount Checkbox */}
                        <label style={{ ...styles.contractorDiscountCheckboxLabel, margin: '8px 0 12px 0' }}>
                          <input
                            type="checkbox"
                            checked={applyContractorDiscount}
                            onChange={(e) => handleToggleContractorDiscount(e.target.checked)}
                            style={styles.contractorDiscountCheckboxInput}
                          />
                          <span style={styles.contractorDiscountCheckboxText}>
                            Apply {contractorDiscountPercent}% Contractor Partner Discount (Admin Wholesale Tier)
                          </span>
                        </label>

                        <span style={{ ...styles.resultRangeNotice, marginBottom: '14px' }}>
                          Calculated Range: $
                          {applyContractorDiscount
                            ? Math.round((officialEstimate.rawLow || Math.round(activeBase * 0.9)) * (1 - contractorDiscountPercent / 100)).toLocaleString()
                            : (officialEstimate.rawLow || Math.round(activeBase * 0.9)).toLocaleString()}{' '}
                          – $
                          {applyContractorDiscount
                            ? Math.round((officialEstimate.rawHigh || Math.round(activeBase * 1.15)) * (1 - contractorDiscountPercent / 100)).toLocaleString()
                            : (officialEstimate.rawHigh || Math.round(activeBase * 1.15)).toLocaleString()}
                        </span>

                        {/* CONTRACTOR IMPORTANT NOTE: Minimum Job Price */}
                        <div style={styles.customerMinJobNoticeBox}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <div style={{ flex: 1, textAlign: 'left' }}>
                            <strong style={{ color: '#0369A1', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                              Important Note — Minimum Job Price:
                            </strong>
                            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#0C4A6E', lineHeight: 1.45 }}>
                              Standard mobilization minimum is <strong>${contractorMinJobAmt.toLocaleString()}</strong>.
                              By default, this estimate shows the pure calculated price (${pureBase.toLocaleString()}) without minimum job price applied.
                            </p>
                            <label style={{ ...styles.minJobCheckboxLabel, backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }}>
                              <input
                                type="checkbox"
                                checked={applyMinJobPrice}
                                onChange={(e) => handleToggleMinJobPrice(e.target.checked)}
                                style={{ ...styles.minJobCheckboxInput, accentColor: '#0284C7' }}
                              />
                              <span style={{ ...styles.minJobCheckboxText, color: '#0369A1' }}>
                                Apply standard minimum job mobilization price (${contractorMinJobAmt.toLocaleString()})
                              </span>
                            </label>
                            {applyMinJobPrice && (
                              <span style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#0284C7', fontWeight: '600' }}>
                                ✓ Minimum job mobilization price applied (${activeBase.toLocaleString()}). Uncheck to return to pure calculated price.
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Action Buttons: 1. Inquiry this Estimation (Slightly decreased size, 100% lead convert), 2. + Another Estimation, 3. Manual Save, 4. Export PDF & Excel */}
              <div style={styles.resultActionRow} className="estimator-result-actions">
                <button
                  type="button"
                  onClick={handleConvertToLead}
                  disabled={leadLoading || leadCreated}
                  style={{
                    ...styles.convertLeadBtn,
                    maxWidth: '220px',
                    padding: '11px 16px',
                    backgroundColor: leadCreated ? '#166534' : '#15803D',
                    borderColor: '#15803D',
                    color: '#FFFFFF',
                    fontWeight: '700',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                  title="Submit inquiry as verified project lead"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>
                    {leadLoading
                      ? 'Submitting...'
                      : leadCreated
                      ? '✓ Inquiry Submitted'
                      : 'Inquiry this Estimation'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (!officialEstimate && floorArea > 0) {
                      await handleSave();
                    }
                    handleResetForNewEstimate();
                  }}
                  style={{
                    ...styles.startNewEstimateActionBtn,
                    fontWeight: '700',
                    fontSize: '13px',
                    padding: '11px 18px',
                  }}
                  title="Save current estimate and start a fresh calculation"
                >
                  + Another Estimation
                </button>

                {/* Manual Save Button for Safe Side */}
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={submitting}
                  style={{
                    ...styles.startNewEstimateActionBtn,
                    backgroundColor: '#FFFFFF',
                    borderColor: '#0284C7',
                    color: '#0284C7',
                    fontWeight: '700',
                    fontSize: '13px',
                    padding: '11px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  title="Manually save your current estimate"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>{submitting ? 'Saving...' : saveSuccessNotice ? '✓ Saved!' : 'Save'}</span>
                </button>

                {/* Export PDF Template Button */}
                <button
                  type="button"
                  onClick={() => handleExportOfficialEstimate('pdf')}
                  style={{
                    ...styles.talkSpecialistBtn,
                    backgroundColor: '#1E3A63',
                    borderColor: '#1E3A63',
                    color: '#FFFFFF',
                    fontWeight: '700',
                    fontSize: '13px',
                    padding: '11px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                  title="Download template-based PDF report"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Export PDF</span>
                </button>

                {/* Export Excel Button */}
                <button
                  type="button"
                  onClick={() => handleExportOfficialEstimate('excel')}
                  style={{
                    ...styles.talkSpecialistBtn,
                    backgroundColor: '#0F766E',
                    borderColor: '#0F766E',
                    color: '#FFFFFF',
                    fontWeight: '700',
                    fontSize: '13px',
                    padding: '11px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                  title="Download Excel spreadsheet summary"
                >
                  <span>Excel</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDEBAR: CIRCLE PROGRESS, PREVIEW, IMAGES & ESTIMATE */}
        {/* ======================================================== */}
        <aside className="estimator-sidebar-col" style={styles.fixedRightSidebar}>
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
                    stroke="#16A34A"
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
                  <strong style={{ fontSize: '16px', color: '#15803D' }}>{progressPercent}%</strong>
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
                <strong style={{ ...styles.specVal, color: '#15803D' }}>{totalBillableArea > 0 ? `${totalBillableArea} sq ft` : '—'}</strong>
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
              {uploadedPhotos.length > 0 && (
                <div style={styles.specRow}>
                  <span style={styles.specLabel}>Uploaded Photos</span>
                  <strong style={{ ...styles.specVal, color: '#D97706' }}>{uploadedPhotos.length} attached</strong>
                </div>
              )}
            </div>
          </div>

          {/* 3. MORE REFERENCES MINI-WINDOW / FRAME (DYNAMIC MULTI-IMAGE GALLERY) */}
          <div style={styles.sidebarCard} className="estimator-sidebar-card">
            <div style={styles.refWindowHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <h4 style={{ ...styles.sidebarHeading, color: '#1E3A63' }}>More References</h4>
              </div>
              <span className="estimator-mini-badge" style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#1E3A63', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {activeRefObj.category || 'Reference'}
              </span>
            </div>

            <div style={styles.refFrameContainer}>
              {/* Main Image in Frame with Image Counter Badge */}
              <div style={styles.refMainImageFrame} className="estimator-ref-main-frame">
                <img
                  src={(activeRefObj.images && activeRefObj.images[refImageIdx]) || (activeRefObj.images && activeRefObj.images[0]) || ''}
                  alt={activeRefObj.title || 'Deck Reference'}
                  style={{
                    ...styles.refMainImage,
                    objectFit: activeRefObj.isDiagram ? 'contain' : 'cover',
                    padding: activeRefObj.isDiagram ? '8px' : '0',
                    backgroundColor: activeRefObj.isDiagram ? '#F8FAFC' : '#0F172A',
                  }}
                />
                {activeRefObj.images && activeRefObj.images.length > 1 && (
                  <div style={styles.refImageCounterBadge} className="estimator-mini-badge">
                    {refImageIdx + 1} / {activeRefObj.images.length}
                  </div>
                )}
              </div>

              {/* Multiple Images Thumbnail Gallery */}
              {activeRefObj.images && activeRefObj.images.length > 1 && (
                <div style={styles.refThumbsRow}>
                  {activeRefObj.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="estimator-ref-thumb-btn"
                      onClick={() => setRefImageIdx(idx)}
                      style={{
                        ...styles.refThumbBtn,
                        borderColor: refImageIdx === idx ? '#1E3A63' : '#E2E8F0',
                        boxShadow: refImageIdx === idx ? '0 0 0 2px #1E3A63' : 'none',
                        opacity: refImageIdx === idx ? 1 : 0.72,
                      }}
                      title={`View image ${idx + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className={activeRefObj.isDiagram ? 'estimator-ref-thumb-img estimator-ref-thumb-img-diagram' : 'estimator-ref-thumb-img'}
                        style={{
                          ...styles.refThumbImg,
                          objectFit: activeRefObj.isDiagram ? 'contain' : 'cover',
                          padding: activeRefObj.isDiagram ? '2px' : '0',
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Title & Clear Architectural Description */}
              <div style={styles.refContentBlock}>
                <strong style={{ fontSize: '13px', color: '#1E3A63', fontWeight: '700', display: 'block' }}>
                  {activeRefObj.title}
                </strong>
                <p style={{ margin: '6px 0 0 0', fontSize: '11.5px', color: '#475569', lineHeight: 1.5 }}>
                  {activeRefObj.desc}
                </p>
              </div>
            </div>
          </div>

          {/* 4. GUIDANCE & IMPORTANT NOTES (ENHANCED LOOK WITH HIGHLIGHTED TEXT) */}
          <div id="sidebar-guidance-card" style={styles.sidebarCard} className="estimator-sidebar-card">
            {/* If officialEstimate exists or contractor pricing, show total header (Hidden on mobile where Official Estimate box is primary) */}
            {!isContractor ? (
              officialEstimate && (
                <div id="sidebar-guaranteed-estimate" className="estimator-mobile-hide-guaranteed" style={{ ...styles.customerSidebarResult, marginBottom: '16px' }}>
                  <span style={styles.customerResultLabel}>Guaranteed Estimate</span>
                  <strong style={styles.customerResultAmt}>${officialEstimate.total.toLocaleString()}</strong>
                  <span style={styles.customerResultSub}>Ref: {officialEstimate.ref}</span>
                  {officialEstimate.minJobApplies && (
                    <div style={styles.sidebarMinNotice}>
                      <span>Min Job Price (${officialEstimate.minJobAmount.toLocaleString()}) applies upon dispatch.</span>
                    </div>
                  )}
                </div>
              )
            ) : (
              contractorPricing ? (
                <div className="estimator-mobile-hide-guaranteed" style={{ ...styles.priceBreakdown, marginBottom: '16px' }}>
                  <div style={styles.priceRow}>
                    <span>Billable Surface Area:</span>
                    <strong>{contractorPricing.billableArea || contractorPricing.A || totalBillableArea} sq ft</strong>
                  </div>
                  <div style={styles.priceRow}>
                    <span>Unit Rate:</span>
                    <strong>${Number(contractorPricing.rate || 2.75).toFixed(2)} / sqft</strong>
                  </div>
                  <div style={styles.priceRow}>
                    <span>Base Labor Hours:</span>
                    <strong>{contractorPricing.baseHours || 0} hrs</strong>
                  </div>
                  <div style={styles.priceRow}>
                    <span>Labor Adjustment:</span>
                    <strong>${contractorPricing.labourAdj || 0}</strong>
                  </div>
                  <div style={styles.divider} />
                  <div style={styles.totalBox}>
                    <span style={styles.totalLabel}>Estimate Total</span>
                    <strong style={styles.totalAmount}>${Number(contractorPricing.total || contractorPricing.calculatedTotal || 2500).toLocaleString()}</strong>
                  </div>
                  <div style={styles.rangeRow}>
                    <span>Low – High Range:</span>
                    <strong>${Number(contractorPricing.low || contractorPricing.lowCalculated || 2500).toLocaleString()} – ${Number(contractorPricing.high || contractorPricing.highCalculated || 2500).toLocaleString()}</strong>
                  </div>
                </div>
              ) : null
            )}

            {/* Guidances & Important Notes Header */}
            <div style={styles.guidanceHeader}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <strong style={{ fontSize: '13px', color: '#1E3A63', fontWeight: '800' }}>Guidance & Important Notes</strong>
            </div>

            {/* Highlighted Notes Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <div style={{ padding: '10px 12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px' }}>
                <span className="estimator-mini-badge" style={{ display: 'inline-block', backgroundColor: '#1E3A63', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', marginBottom: '4px' }}>
                  $2,500 Floor
                </span>
                <p style={{ margin: 0, fontSize: '11px', color: '#1E3A63', lineHeight: 1.4 }}>
                  <strong>Standard Mobilization Minimum:</strong> Standard certified crew mobilization minimum applies to all project tiers.
                </p>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px' }}>
                <span className="estimator-mini-badge" style={{ display: 'inline-block', backgroundColor: '#D97706', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', marginBottom: '4px' }}>
                  Travel Over 45 Mins
                </span>
                <p style={{ margin: 0, fontSize: '11px', color: '#92400E', lineHeight: 1.4 }}>
                  <strong>Travel Mobilization:</strong> Minimum shifts to <strong>$3,000</strong> for remote locations to cover crew travel & transit time.
                </p>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <span className="estimator-mini-badge" style={{ display: 'inline-block', backgroundColor: '#475569', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', marginBottom: '4px' }}>
                  Elevated Decks (8ft+)
                </span>
                <p style={{ margin: 0, fontSize: '11px', color: '#334155', lineHeight: 1.4 }}>
                  Multi-story ladder rigging, harness anchors, and comprehensive safety protocols included.
                </p>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px' }}>
                <span className="estimator-mini-badge" style={{ display: 'inline-block', backgroundColor: '#15803D', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', marginBottom: '4px' }}>
                  1-Year Warranty
                </span>
                <p style={{ margin: 0, fontSize: '11px', color: '#166534', lineHeight: 1.4 }}>
                  Comprehensive workmanship warranty on all multi-coat restoration and premium penetrations.
                </p>
              </div>
            </div>

            {/* Support and Contact Us Buttons at Last of Box */}
            <div style={styles.guidanceActionsRow}>
              <button
                type="button"
                onClick={() => {
                  setReachOutSubject('Customer Support & Estimate Guidance');
                  setReachOutOpen(true);
                }}
                style={styles.guidanceSupportBtn}
              >
                <span>📞 Support</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setReachOutSubject('Contact Senior Estimator Consultation');
                  setReachOutOpen(true);
                }}
                style={styles.guidanceContactBtn}
              >
                <span>💬 Contact Us</span>
              </button>
            </div>
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
    padding: '10px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
    position: 'sticky',
    top: '65px',
    zIndex: 35,
  },
  topSectionBoxesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
    flex: '1 1 auto',
  },
  topSectionBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.16s ease',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  topSectionBoxName: {
    fontSize: '11px',
    fontWeight: '500',
  },
  topReachOutWrapper: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  topReachOutBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    backgroundColor: '#034EA2',
    backgroundImage: 'linear-gradient(135deg, #034EA2 0%, #0057B8 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '999px',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px rgba(3, 78, 162, 0.3)',
  },
  reachOutIconPill: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSelectedCheckBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.45)',
    zIndex: 10,
  },
  photoNoticeBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: '#FFFBEB',
    borderRadius: '8px',
    border: '1px solid #FDE68A',
    marginBottom: '16px',
  },
  photoDropzone: {
    border: '2px dashed #F59E0B',
    borderRadius: '12px',
    padding: '28px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '16px',
  },
  photoCloudIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#FEF3C7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 10px auto',
  },
  photoCategoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px',
    marginBottom: '16px',
  },
  photoCategoryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#FEF3C7',
    border: '1px solid #FDE68A',
    borderRadius: '8px',
  },
  photoCategoryTitle: {
    fontSize: '12px',
    color: '#78350F',
    fontWeight: '700',
  },
  photoTipsBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  uploadedPhotosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  photoPreviewCard: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  photoPreviewImg: {
    width: '100%',
    height: '110px',
    objectFit: 'cover',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },
  photoPreviewMeta: {
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  photoPreviewName: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#1E293B',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  photoPreviewSize: {
    fontSize: '10px',
    color: '#64748B',
  },
  photoCategorySelect: {
    fontSize: '11px',
    padding: '3px 6px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#F8FAFC',
    color: '#334155',
  },
  guidanceNotesBox: {
    marginTop: '16px',
    padding: '14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  guidanceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  guidanceList: {
    margin: '0 0 12px 0',
    paddingLeft: '18px',
    fontSize: '11px',
    color: '#475569',
    lineHeight: 1.5,
  },
  guidanceActionsRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
  },
  guidanceSupportBtn: {
    flex: 1,
    padding: '8px 10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '7px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#034EA2',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  guidanceContactBtn: {
    flex: 1,
    padding: '8px 10px',
    backgroundColor: '#034EA2',
    border: 'none',
    borderRadius: '7px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  reachOutTooltip: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: '0',
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    padding: '5px 11px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
    zIndex: 100,
    pointerEvents: 'none',
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
    top: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: 'calc(100vh - 40px)',
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
  cardImageFrame: {
    width: '100%',
    height: '96px',
    backgroundColor: '#F8FAFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderBottom: '1px solid #F1F5F9',
  },
  cardCoverImageContain: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
    padding: '8px',
  },
  cardCoverImage: {
    width: '100%',
    height: '100%',
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
  componentThumbFrame: {
    width: '100%',
    height: '84px',
    backgroundColor: '#F8FAFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderBottom: '1px solid #F1F5F9',
  },
  componentThumbImage: {
    width: '100%',
    height: '100%',
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
    padding: '16px 20px',
    boxShadow: '0 8px 24px -4px rgba(3, 78, 162, 0.12)',
    margin: '16px 0',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '8px',
  },
  verifiedCheck: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: '#15803D',
    color: '#FFFFFF',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: '13px',
    flexShrink: 0,
  },
  resultTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: '-0.2px',
  },
  refBadge: {
    padding: '3px 8px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
  },
  customerTotalBox: {
    textAlign: 'center',
    padding: '16px 16px',
    backgroundColor: '#F0F6FF',
    borderRadius: '10px',
    border: '1.5px solid #BFDBFE',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  customerTotalSub: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#034EA2',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '2px',
  },
  customerTotalAmt: {
    fontSize: '36px',
    fontWeight: '900',
    color: '#034EA2',
    margin: '4px 0',
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
    padding: '14px 18px',
    backgroundColor: '#FFFBEB',
    border: '1.5px solid #FDE68A',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    textAlign: 'left',
    maxWidth: '560px',
    width: '100%',
    boxSizing: 'border-box',
  },
  minJobCheckboxLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    backgroundColor: '#FEF3C7',
    padding: '7px 12px',
    borderRadius: '6px',
    border: '1.5px solid #FCD34D',
    userSelect: 'none',
    transition: 'all 0.15s ease',
  },
  minJobCheckboxInput: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    accentColor: '#D97706',
  },
  minJobCheckboxText: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#92400E',
  },
  contractorMinNoticeBox: {
    marginTop: '12px',
    padding: '14px 16px',
    backgroundColor: '#F0F9FF',
    border: '1.5px solid #BAE6FD',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    textAlign: 'left',
    width: '100%',
    boxSizing: 'border-box',
  },
  contractorMinJobCheckboxLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    backgroundColor: '#E0F2FE',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #BAE6FD',
    userSelect: 'none',
    transition: 'all 0.15s ease',
  },
  contractorBreakdownBox: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '14px',
  },
  resultContentRow: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '16px',
  },
  resultTotalBox: {
    backgroundColor: '#F0F6FF',
    border: '1.5px solid #BFDBFE',
    borderRadius: '10px',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    boxSizing: 'border-box',
  },
  resultTotalSub: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#034EA2',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '2px',
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
  strikePrice: {
    textDecoration: 'line-through',
    color: '#94A3B8',
    fontSize: '22px',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  discountBadgePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '800',
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    border: '1px solid #86EFAC',
    letterSpacing: '0.01em',
  },
  discountSavingsSubtext: {
    display: 'block',
    fontSize: '12px',
    color: '#64748B',
    marginTop: '3px',
    fontWeight: '500',
  },
  contractorDiscountCheckboxLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '10px',
    marginBottom: '10px',
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    cursor: 'pointer',
    userSelect: 'none',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    transition: 'all 0.15s ease',
  },
  contractorDiscountCheckboxInput: {
    width: '18px',
    height: '18px',
    accentColor: '#15803D',
    cursor: 'pointer',
  },
  contractorDiscountCheckboxText: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#1E3A63',
    lineHeight: 1.3,
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
  refFrameContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  refMainImageFrame: {
    position: 'relative',
    width: '100%',
    height: '145px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #CBD5E1',
    backgroundColor: '#0F172A',
  },
  refMainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  refImageCounterBadge: {
    position: 'absolute',
    bottom: '6px',
    right: '6px',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '4px',
    backdropFilter: 'blur(4px)',
  },
  refThumbsRow: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    paddingBottom: '2px',
  },
  refThumbBtn: {
    flex: '0 0 44px',
    height: '44px',
    padding: '0',
    border: '1.5px solid #E2E8F0',
    borderRadius: '6px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: '#FFFFFF',
    transition: 'all 0.15s ease',
  },
  refThumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  refContentBlock: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '10px 12px',
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
