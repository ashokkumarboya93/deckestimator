const { calculateRestorationEstimate, DEFAULT_PRICING_CONFIG } = require('../pricingEngine');

console.log('--- RUNNING DECK RESTORATION PLUS SPECIFICATION TEST CASES ---');

// Case A: 200 sqft, Stain Stripping only, Cedar, First Story, 30 min
const caseA = calculateRestorationEstimate({
  deckArea: 200,
  services: ['stain_stripping'],
  wood: 'cedar',
  access: 'first',
  travelMinutes: 30,
});
console.log('Case A (Target: Total $2500, Low-High 2500-2500):', {
  total: caseA.total,
  low: caseA.low,
  high: caseA.high,
  rate: caseA.rate,
  basePrice: caseA.basePrice,
  labourAdj: caseA.labourAdj,
  minJobApplied: caseA.minJobApplied,
});

// Case B: 500 sqft, Cleaning + Stain Stripping + Staining (Semi), Cedar, First Story, 30 min
const caseB = calculateRestorationEstimate({
  deckArea: 500,
  services: ['cleaning', 'stain_stripping', 'staining'],
  stainType: 'semi',
  wood: 'cedar',
  access: 'first',
  travelMinutes: 30,
});
console.log('Case B (Target: Total $3125, Low-High 3000-3250):', {
  total: caseB.total,
  low: caseB.low,
  high: caseB.high,
  baseHours: caseB.baseHours,
  addHours: caseB.addHours,
  labourAdj: caseB.labourAdj,
});

// Case B-fixed: Same with fixed_hours
const caseBFixed = calculateRestorationEstimate(
  {
    deckArea: 500,
    services: ['cleaning', 'stain_stripping', 'staining'],
    stainType: 'semi',
    wood: 'cedar',
    access: 'first',
    travelMinutes: 30,
  },
  { ...DEFAULT_PRICING_CONFIG, accessMode: 'fixed_hours' }
);
console.log('Case B-fixed (Target: Total $3375, Low-High 3250-3500):', {
  total: caseBFixed.total,
  low: caseBFixed.low,
  high: caseBFixed.high,
  accessHours: caseBFixed.accessHours,
  addHours: caseBFixed.addHours,
  labourAdj: caseBFixed.labourAdj,
});

// Case C: 300 sqft, Cleaning + Sealing, PT pine, Ground, 60 min
const caseC = calculateRestorationEstimate({
  deckArea: 300,
  services: ['cleaning', 'sealing'],
  wood: 'pt_pine',
  access: 'ground',
  travelMinutes: 60,
});
console.log('Case C (Target: Total $3000, Low-High 3000-3000):', {
  total: caseC.total,
  low: caseC.low,
  high: caseC.high,
  travelFee: caseC.travelFee,
  minJob: caseC.minJob,
});

// Case D: 400 sqft, Cleaning only, Trex, Ground, 30 min
const caseD = calculateRestorationEstimate({
  deckArea: 400,
  services: ['cleaning'],
  wood: 'trex',
  access: 'ground',
  travelMinutes: 30,
});
console.log('Case D (Target: Total $2500, Low-High 2500-2500):', {
  total: caseD.total,
  low: caseD.low,
  high: caseD.high,
  woodHours: caseD.woodHours,
  labourAdj: caseD.labourAdj,
});

// Case E: 600 floor + 100 railing sqft, Pressure Washing + Paint Removal + Sanding + Staining (Solid) + Sealing + Waterproofing, Cedar, First Story, 30 min
const caseE = calculateRestorationEstimate({
  deckArea: 600,
  railingSqft: 100,
  services: ['pressure_washing', 'paint_removal', 'sanding', 'staining', 'sealing', 'waterproofing'],
  stainType: 'solid',
  wood: 'cedar',
  access: 'first',
  travelMinutes: 30,
});
console.log('Case E (Target: Total $9173, Low-High 8823-9523):', {
  total: caseE.total,
  low: caseE.low,
  high: caseE.high,
  rate: caseE.rate,
  baseHours: caseE.baseHours,
  addHours: caseE.addHours,
  labourAdj: caseE.labourAdj,
});

// Case F: Floor 600, rail 40 lf, 6 steps, fascia 30 lf, 4 posts, joists, Cleaning + Sealing, PT pine, Ground, 30 min
const caseF = calculateRestorationEstimate({
  deckArea: 600,
  railingLf: 40,
  stairSteps: 6,
  fasciaLf: 30,
  postCount: 4,
  joists: true,
  services: ['cleaning', 'sealing'],
  wood: 'pt_pine',
  access: 'ground',
  travelMinutes: 30,
});
console.log('Case F (Target: Total $3138, Low-High 2853-3423):', {
  A: caseF.A,
  total: caseF.total,
  low: caseF.low,
  high: caseF.high,
  basePrice: caseF.basePrice,
});
