// =============================================
// Deck Restoration Plus — Specification Test Suite
// =============================================
// Verifies:
// 1. Core Specification Cases A–F with subtotal, base price, hours, adjustments & totals
// 2. No-finish low-rate rule & mid-rate rule
// 3. Edge Cases: zero area, missing travel time, Trex lock, sanding without stripping
// 4. Client Gaps: Semi-Solid Stain (Q4), Mahogany & Teak (Q2), Exact height in feet (Q7)
// 5. Damage Condition Overlap Prevention: Good Condition, Crack+Loose, Rotted+Water Damaged,
//    Peeling+Stripping, Weathered 5% & Mold 15% Admin switches

const assert = require('assert');
const {
  calculateRestorationEstimate,
  calculateRepairEstimate,
  mapHeightFeetToAccessKey,
  DEFAULT_PRICING_CONFIG,
} = require('../pricingEngine');

console.log('===============================================================');
console.log('   DECK RESTORATION PLUS — COMPREHENSIVE SPEC TEST SUITE       ');
console.log('===============================================================');

let testCount = 0;
function test(name, fn) {
  testCount++;
  try {
    fn();
    console.log(`  ✓ Test ${testCount}: ${name}`);
  } catch (err) {
    console.error(`  ✗ Test ${testCount} FAILED: ${name}`);
    throw err;
  }
}

// -------------------------------------------------------------
// GROUP 1: Core Specification Benchmark Cases A through F
// -------------------------------------------------------------

test('Case A: 200 sqft Strip Only, Cedar, First Story (Assert Subtotal $850 & Min Job $2500)', () => {
  const res = calculateRestorationEstimate({
    deckArea: 200,
    services: ['stain_stripping'],
    wood: 'cedar',
    access: 'first',
    travelMinutes: 30,
  });

  // No-finish rule: uses lo rate of strip/sealer = 3.0
  assert.strictEqual(res.A, 200);
  assert.strictEqual(res.rate, 3.0);
  assert.strictEqual(res.basePrice, 600);
  assert.strictEqual(res.baseHours, 4.0); // 200 / 50 = 4h
  assert.strictEqual(res.woodHours, 0.4); // 4h * 10% = 0.4h
  assert.strictEqual(res.accessHours, 0.6); // 4h * 15% = 0.6h
  assert.strictEqual(res.addHours, 1.0); // 0.4 + 0.6 = 1.0h
  assert.strictEqual(res.labourAdj, 250); // 1h * $250 = $250
  assert.strictEqual(res.travelFee, 0);
  assert.strictEqual(res.calculatedTotal, 850);
  assert.strictEqual(res.total, 2500); // Minimum job floor
  assert.strictEqual(res.minJobApplied, true);
  assert.strictEqual(res.customerOutput.total, 850); // Customer sees pure calculated total
});

test('Case B: 500 sqft Clean + Strip + Stain (Semi), Cedar, First Story (Target $3125)', () => {
  const res = calculateRestorationEstimate({
    deckArea: 500,
    services: ['cleaning', 'stain_stripping', 'staining'],
    stainType: 'semi',
    wood: 'cedar',
    access: 'first',
    travelMinutes: 30,
  });

  assert.strictEqual(res.A, 500);
  assert.strictEqual(res.rate, 3.75); // strip/semi [3.5, 4.0] midpoint = 3.75
  assert.strictEqual(res.basePrice, 1875); // 500 * 3.75
  assert.strictEqual(res.baseHours, 20); // 500/100 + 500/50 + 500/100 = 5 + 10 + 5 = 20h
  assert.strictEqual(res.woodHours, 2); // 20h * 10% = 2h
  assert.strictEqual(res.accessHours, 3); // 20h * 15% = 3h
  assert.strictEqual(res.addHours, 5); // 2 + 3 = 5h
  assert.strictEqual(res.labourAdj, 1250); // 5h * $250 = $1250
  assert.strictEqual(res.calculatedTotal, 3125);
  assert.strictEqual(res.total, 3125);
  assert.strictEqual(res.low, 3000);
  assert.strictEqual(res.high, 3250);
});

test('Case B-fixed: Fixed hours mode for access (Target $3375, Range $3250–$3500)', () => {
  const res = calculateRestorationEstimate(
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

  assert.strictEqual(res.accessHours, 4); // first_story fixed = 4h
  assert.strictEqual(res.addHours, 6); // 2h wood + 4h access = 6h
  assert.strictEqual(res.labourAdj, 1500); // 6h * $250 = $1500
  assert.strictEqual(res.calculatedTotal, 3375);
  assert.strictEqual(res.total, 3375);
  assert.strictEqual(res.low, 3250);
  assert.strictEqual(res.high, 3500);
});

test('Case C: 300 sqft Clean + Seal, Far Travel 60 min (Assert Subtotal $1025 & Travel $200, Min Job $3000)', () => {
  const res = calculateRestorationEstimate({
    deckArea: 300,
    services: ['cleaning', 'sealing'],
    wood: 'pt_pine',
    access: 'ground',
    travelMinutes: 60,
  });

  assert.strictEqual(res.A, 300);
  assert.strictEqual(res.rate, 2.75); // clean/sealer [2.5, 3.0] midpoint = 2.75
  assert.strictEqual(res.basePrice, 825); // 300 * 2.75 = 825
  assert.strictEqual(res.baseHours, 6); // 300/100 + 300/100 = 6h
  assert.strictEqual(res.labourAdj, 0); // pine 0%, ground 0%
  assert.strictEqual(res.travelFee, 200); // Far travel (>45 min)
  assert.strictEqual(res.calculatedTotal, 1025); // 825 + 0 + 200 = 1025
  assert.strictEqual(res.minJob, 3000);
  assert.strictEqual(res.total, 3000); // Far travel min job floor
  assert.strictEqual(res.low, 3000);
  assert.strictEqual(res.high, 3000);
});

test('Case D: 400 sqft Clean Only, Trex Composite (Assert Subtotal $450 & Trex Discount -$550)', () => {
  const res = calculateRestorationEstimate({
    deckArea: 400,
    services: ['cleaning'],
    wood: 'trex',
    access: 'ground',
    travelMinutes: 30,
  });

  assert.strictEqual(res.A, 400);
  assert.strictEqual(res.rate, 2.5); // clean/sealer lo = 2.5 (no finish rule)
  assert.strictEqual(res.basePrice, 1000); // 400 * 2.5 = 1000
  assert.strictEqual(res.baseHours, 4); // 400 / 100 = 4h
  assert.strictEqual(res.woodHours, -2.2); // 4h * -55% = -2.2h
  assert.strictEqual(res.labourAdj, -550); // -2.2h * $250 = -$550
  assert.strictEqual(res.calculatedTotal, 450); // 1000 - 550 = 450
  assert.strictEqual(res.total, 2500); // Min job floor
});

test('Case E: 700 sqft Multi-service Stacked Finishes, Cedar, First (Target $9173)', () => {
  const res = calculateRestorationEstimate({
    deckArea: 600,
    railingSqft: 100,
    services: ['pressure_washing', 'paint_removal', 'sanding', 'staining', 'sealing', 'waterproofing'],
    stainType: 'solid',
    wood: 'cedar',
    access: 'first',
    travelMinutes: 30,
  });

  assert.strictEqual(res.A, 700);
  assert.strictEqual(res.rate, 8.0); // strip_sand/solid [5.5, 6.5] mid 6.0 + 2 stacked finishes ($2) = 8.0
  assert.strictEqual(res.basePrice, 5600);
  assert.strictEqual(Math.round(res.baseHours * 100) / 100, 57.17);
  assert.strictEqual(Math.round(res.addHours * 100) / 100, 14.29);
  assert.strictEqual(Math.round(res.labourAdj * 100) / 100, 3572.92);
  assert.strictEqual(res.calculatedTotal, 9173);
  assert.strictEqual(res.total, 9173);
  assert.strictEqual(res.low, 8823);
  assert.strictEqual(res.high, 9523);
});

test('Case F: Complex Footprint 1,141 sqft Billable Area (Target $3138)', () => {
  const res = calculateRestorationEstimate({
    deckArea: 600,
    railingLf: 40,      // 40 * 4 = 160 sqft
    stairSteps: 6,      // 6 * 12 = 72 sqft
    fasciaLf: 30,       // 30 * 1.5 = 45 sqft
    postCount: 4,       // 4 * 6 = 24 sqft
    joists: true,       // 600 * 0.4 = 240 sqft
    services: ['cleaning', 'sealing'],
    wood: 'pt_pine',
    access: 'ground',
    travelMinutes: 30,
  });

  assert.strictEqual(res.A, 1141);
  assert.strictEqual(res.rate, 2.75);
  assert.strictEqual(res.basePrice, 3137.75);
  assert.strictEqual(res.calculatedTotal, 3138);
  assert.strictEqual(res.total, 3138);
  assert.strictEqual(res.low, 2853);
  assert.strictEqual(res.high, 3423);
});

// -------------------------------------------------------------
// GROUP 2: Edge Cases & Validation Rigor
// -------------------------------------------------------------

test('Edge Case: Zero Area throws BadRequestError', () => {
  assert.throws(
    () => {
      calculateRestorationEstimate({ deckArea: 0, services: ['cleaning'] });
    },
    (err) => err.statusCode === 400 && err.message.includes('greater than 0')
  );
});

test('Edge Case: Missing Travel Time defaults to free local range (0 fee)', () => {
  const res = calculateRestorationEstimate({
    deckArea: 500,
    services: ['cleaning'],
    wood: 'pt_pine',
  });
  assert.strictEqual(res.travelMinutes, 30);
  assert.strictEqual(res.travelFee, 0);
});

test('Edge Case: Trex with disallowed staining triggers exclusion flag', () => {
  const res = calculateRestorationEstimate({
    deckArea: 300,
    wood: 'trex',
    services: ['cleaning', 'staining'],
  });
  assert.ok(res.flags.includes('trex_disallowed_services_excluded'));
});

test('Edge Case: Sanding without Stripping adds differential to Clean rate', () => {
  // clean/sealer [2.5, 3.0], strip_sand [3.5, 4.5], strip [3.0, 3.5]
  // diff: lo += (3.5 - 3.0) = +0.5 -> lo = 3.0, hi += (4.5 - 3.5) = +1.0 -> hi = 4.0
  const res = calculateRestorationEstimate({
    deckArea: 100,
    services: ['cleaning', 'sanding'],
    wood: 'pt_pine',
    access: 'ground',
  });
  // finish is none, so uses lo = 3.0
  assert.strictEqual(res.rate, 3.0);
  assert.strictEqual(res.basePrice, 300);
});

// -------------------------------------------------------------
// GROUP 3: Client Gaps (Q2, Q4, Q7)
// -------------------------------------------------------------

test('Client Gap Q4: Semi-Solid Stain rate card column', () => {
  const res = calculateRestorationEstimate({
    deckArea: 1000,
    services: ['cleaning', 'staining'],
    stainType: 'semi_solid',
    wood: 'pt_pine',
    access: 'ground',
  });
  // clean semi_solid is [3.25, 3.75], midpoint = 3.50
  assert.strictEqual(res.rate, 3.5);
  assert.strictEqual(res.basePrice, 3500);
});

test('Client Gap Q2: Mahogany (+20%) and Teak (+35%)', () => {
  const resMahogany = calculateRestorationEstimate({
    deckArea: 500,
    services: ['cleaning'],
    wood: 'mahogany',
    access: 'ground',
  });
  assert.strictEqual(resMahogany.baseHours, 5);
  assert.strictEqual(resMahogany.woodHours, 1.0); // 5h * 20% = 1.0h
  assert.strictEqual(resMahogany.labourAdj, 250); // 1.0h * $250 = $250

  const resTeak = calculateRestorationEstimate({
    deckArea: 500,
    services: ['cleaning'],
    wood: 'teak',
    access: 'ground',
  });
  assert.strictEqual(resTeak.woodHours, 1.75); // 5h * 35% = 1.75h
  assert.strictEqual(resTeak.labourAdj, 437.5); // 1.75h * $250 = $437.50
});

test('Client Gap Q7: Exact Height in Feet mapping', () => {
  assert.strictEqual(mapHeightFeetToAccessKey(1.5), 'ground');
  assert.strictEqual(mapHeightFeetToAccessKey(3.5), 'low');
  assert.strictEqual(mapHeightFeetToAccessKey(7.0), 'first');
  assert.strictEqual(mapHeightFeetToAccessKey(10.0), 'second');
  assert.strictEqual(mapHeightFeetToAccessKey(15.0), 'roof');

  const res = calculateRestorationEstimate({
    deckArea: 400,
    services: ['cleaning'],
    wood: 'pt_pine',
    exactHeightFt: 6, // maps to 'first' (15%)
  });
  assert.strictEqual(res.accessHours, 0.6); // 4h * 15% = 0.6h
  assert.strictEqual(res.labourAdj, 150);
});

// -------------------------------------------------------------
// GROUP 4: Section 8 Damage Condition Overlap Prevention
// -------------------------------------------------------------

test('Damage Overlap 1: Good Condition is exclusive (suppresses all other repair charges)', () => {
  const repair = calculateRepairEstimate({
    condition: 'good',
    crackCount: 5,
    rottedCount: 3,
  });
  assert.strictEqual(repair.repairTotal, 0);
  assert.strictEqual(repair.structuralInspectionRequired, false);
  assert.strictEqual(repair.overlapDeductions[0].rule, 'Good Condition Exclusive');
});

test('Damage Overlap 2: Crack & Loose Board on same board charges replacement only ($45 vs $15+$12)', () => {
  const repair = calculateRepairEstimate({
    damageConditions: ['crack', 'loose_board'],
    crackBoardCount: 4,
    looseBoardCount: 4,
    crackLooseOverlapCount: 4, // All 4 boards are both cracked and loose
  });

  // 4 boards replaced at $45 each = $180
  assert.strictEqual(repair.repairTotal, 180);
  const repLine = repair.lineItems.find((l) => l.item.includes('Replacement Only'));
  assert.ok(repLine);
  assert.strictEqual(repLine.totalCost, 180);

  const overlap = repair.overlapDeductions.find((o) => o.rule.includes('Crack + Loose Board'));
  assert.ok(overlap);
  assert.strictEqual(overlap.saving, 4 * (15 + 12)); // $108 avoided
});

test('Damage Overlap 3: Rotted & Water Damaged share single inspection fee ($150 total, not $300)', () => {
  const repair = calculateRepairEstimate({
    damageConditions: ['rotted', 'water_damaged'],
    rottedBoardCount: 2, // 2 * $45 = $90
    waterDamagedBoardCount: 1, // 1 * $45 = $45
  });

  // 1 single inspection fee ($150) + $90 + $45 = $285
  assert.strictEqual(repair.repairTotal, 285);
  assert.strictEqual(repair.structuralInspectionRequired, true);

  const overlap = repair.overlapDeductions.find((o) => o.rule.includes('Shared Inspection'));
  assert.ok(overlap);
  assert.strictEqual(overlap.saving, 150);
});

test('Damage Overlap 4: Peeling coating covered by Stripping scope ($0 duplicate)', () => {
  const repairWithStripping = calculateRepairEstimate(
    { damageConditions: ['peeling'] },
    { isStripping: true, baseHours: 10 }
  );
  assert.strictEqual(repairWithStripping.repairTotal, 0);
  assert.ok(repairWithStripping.overlapDeductions.some((d) => d.rule.includes('Peeling Overlap')));

  const repairWithoutStripping = calculateRepairEstimate(
    { damageConditions: ['peeling'] },
    { isStripping: false, baseHours: 10 }
  );
  assert.strictEqual(repairWithoutStripping.repairTotal, 100);
});

test('Damage Overlap 5: Weathered (5%) and Mold (15%) Admin Switches OFF by default, ON when active', () => {
  // Off by default
  const repairDefault = calculateRepairEstimate(
    { damageConditions: ['weathered', 'mold'] },
    { isStripping: false, baseHours: 20 }
  );
  assert.strictEqual(repairDefault.repairTotal, 0);
  assert.strictEqual(repairDefault.adminSwitches.weatheredApplied, false);
  assert.strictEqual(repairDefault.adminSwitches.moldApplied, false);

  // Enabled via admin switches
  const customCfg = {
    ...DEFAULT_PRICING_CONFIG,
    switches: {
      applyWeatheredLabor: true,
      applyMoldLabor: true,
    },
  };
  const repairEnabled = calculateRepairEstimate(
    { damageConditions: ['weathered', 'mold'] },
    { isStripping: false, baseHours: 20 },
    customCfg
  );

  // Weathered: 20h * 0.05 * $250 = $250
  // Mold: 20h * 0.15 * $250 = $750
  // Total: $1000
  assert.strictEqual(repairEnabled.repairTotal, 1000);
  assert.strictEqual(repairEnabled.adminSwitches.weatheredApplied, true);
  assert.strictEqual(repairEnabled.adminSwitches.moldApplied, true);
});

console.log('===============================================================');
console.log(`   ALL ${testCount} TEST SUITE CASES PASSED WITH 100% SUCCESS! `);
console.log('===============================================================');
