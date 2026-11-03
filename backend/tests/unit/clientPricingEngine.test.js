// =============================================
// Deck Estimator — Client Pricing Engine Unit & Integration Tests
// =============================================
// Verifies exact client formulas, mandatory numerical test, and edge cases.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateBillableArea,
  calculateBaseLaborHours,
  calculateFivePartLabor,
  calculateProductRequirements,
  calculateConfidenceRange,
  calculateClientPricing,
  getRailingStyleFactor,
  RAILING_STYLE_FACTORS,
  WOOD_SPECIES_FACTORS,
  ACCESS_MULTIPLIERS,
  COATING_MULTIPLIERS,
  CONDITION_FACTORS,
  CONFIDENCE_SPREADS,
  DEFAULT_PRODUCT_PRICES,
} = require('../../src/modules/pricing/pricingEngine');

function closeTo(actual, expected, tolerance = 0.001) {
  const diff = Math.abs(actual - expected);
  assert.ok(
    diff <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected} (diff: ${diff})`
  );
}

describe('Client Pricing Engine — Formulas & Worked Example Validation', () => {

  // =============================================
  // 1. MANDATORY NUMERICAL TEST (WORKED EXAMPLE)
  // =============================================
  describe('Mandatory Numerical Test — 400 sq ft Deck Worked Example', () => {
    it('Accurately matches all intermediate and final figures from client specification', () => {
      const inputs = {
        floorArea: 400,
        railingLength: 50,
        railingStyle: 'plain_2x2', // factor 5
        stairCount: 6,
        fasciaLength: 0,
        pergolaLength: 0,
        sidingArea: 0,
        includeJoists: false,
        woodSpecies: 'pressure_treated_pine', // Ms = 1.00, Cs = 175
        accessType: 'ground_level', // Ma = 1.00
        coatingType: 'oil_penetrating_one_coat', // Mc = 1.30
        coatingConfidence: 'medium', // spread ±20%
        conditionFlags: ['heavy_mildew', 'tannin_rust_bleed'], // 0.15 + 0.10 = 0.25
        billingRate: 75,
        floorProductionRate: 50,
        customPrices: {
          stain: 46.0,
          stripper: 38.0,
          brightener: 28.0,
          cleaner: 32.0,
        },
      };

      const result = calculateClientPricing(inputs);

      // 1. Billable Surface Area
      // A = 400 + (50 * 4) + (6 * 12) = 400 + 200 + 72 = 672 sq ft
      assert.equal(result.billableArea, 672);

      // 2. Base Labor Hours
      // Hb = 400/50 + 50/5 + (6 * 0.5) = 8 + 10 + 3 = 21.000 hours
      closeTo(result.baseLaborHours, 21.0);

      // 3. Five-Part Labor Breakdown
      // H1 (Base) = 21.000
      closeTo(result.laborBreakdown.H1_base, 21.0);
      // H2 (Coating) = 21 * (1.30 - 1) = 6.300
      closeTo(result.laborBreakdown.H2_coating, 6.3);
      // H3 (Species) = 21 * 1.30 * (1.00 - 1) = 0.000
      closeTo(result.laborBreakdown.H3_species, 0.0);
      // H4 (Access) = 21 * 1.30 * 1.00 * (1.00 - 1) = 0.000
      closeTo(result.laborBreakdown.H4_access, 0.0);
      // H5 (Condition) = 21 * 1.30 * 1.00 * 1.00 * 0.25 = 6.825
      closeTo(result.laborBreakdown.H5_condition, 6.825);
      // Total Labor Hours H = 21 + 6.3 + 0 + 0 + 6.825 = 34.125
      closeTo(result.laborBreakdown.totalHours, 34.125);

      // 4. Labor Cost
      // L = 34.125 * $75 = $2,559.375
      closeTo(result.laborCost, 2559.375);

      // 5. Product Quantities
      // Stain: 672 / 175 = 3.840 gal (display 3.9 gal)
      closeTo(result.productRequirements.stain.rawQuantity, 3.84);
      assert.equal(result.productRequirements.stain.displayQuantity, 3.9);
      closeTo(result.productRequirements.stain.cost, 176.64);

      // Stripper: 672 / 175 = 3.840 gal (display 3.9 gal)
      closeTo(result.productRequirements.stripper.rawQuantity, 3.84);
      assert.equal(result.productRequirements.stripper.displayQuantity, 3.9);
      closeTo(result.productRequirements.stripper.cost, 145.92);

      // Brightener: 672 / 400 = 1.680 gal (display 1.7 gal)
      closeTo(result.productRequirements.brightener.rawQuantity, 1.68);
      assert.equal(result.productRequirements.brightener.displayQuantity, 1.7);
      closeTo(result.productRequirements.brightener.cost, 47.04);

      // Cleaner: 672 / 500 = 1.344 gal (display 1.4 gal)
      closeTo(result.productRequirements.cleaner.rawQuantity, 1.344);
      assert.equal(result.productRequirements.cleaner.displayQuantity, 1.4);
      closeTo(result.productRequirements.cleaner.cost, 43.008);

      // 6. Total Material Cost
      // M = 176.64 + 145.92 + 47.04 + 43.008 = $412.608
      closeTo(result.totalMaterialCost, 412.608);

      // 7. Base Estimate
      // E = 412.608 + 2559.375 = $2,971.983
      closeTo(result.baseEstimate, 2971.983);

      // 8. Confidence Range (Medium ±20%)
      // E_low = 2971.983 * 0.80 = $2,377.5864
      closeTo(result.lowEstimate, 2377.5864);
      // E_high = 2971.983 * 1.20 = $3,566.3796
      closeTo(result.highEstimate, 3566.3796);

      // 9. Displayed Quote (Rounded whole dollars)
      assert.equal(result.displayQuote.low, 2378);
      assert.equal(result.displayQuote.high, 3566);
      assert.equal(result.displayQuote.formatted, '$2,378 – $3,566');

      // 10. Next Maintenance Reference (70%)
      // 2971.983 * 0.70 = $2,080.3881 ($2,080.39)
      closeTo(result.maintenanceReference, 2080.3881);
    });
  });

  // =============================================
  // 2. FORMULA 1 — BILLABLE SURFACE AREA TESTS
  // =============================================
  describe('Formula 1 — Billable Surface Area', () => {
    it('Calculates correctly with only floor area', () => {
      const area = calculateBillableArea({ floorArea: 300 });
      assert.equal(area, 300);
    });

    it('Calculates all components: floor + railing*4 + stairs*12 + fascia*1.5 + pergola*3 + siding*1', () => {
      const area = calculateBillableArea({
        floorArea: 250,
        railingLength: 40, // 40 * 4 = 160
        stairCount: 4,     // 4 * 12 = 48
        fasciaLength: 30,  // 30 * 1.5 = 45
        pergolaLength: 20, // 20 * 3 = 60
        sidingArea: 50,    // 50 * 1 = 50
      });
      // 250 + 160 + 48 + 45 + 60 + 50 = 613
      assert.equal(area, 613);
    });

    it('Rejects negative dimensions', () => {
      assert.throws(() => {
        calculateBillableArea({ floorArea: -100 });
      }, /Deck dimensions and component measurements cannot be negative/);
    });
  });

  // =============================================
  // 3. FORMULA 2 — BASE LABOR HOURS TESTS
  // =============================================
  describe('Formula 2 — Base Labor Hours', () => {
    it('Applies railing style factors correctly (plain=5, turned=3, panel=4, cable=12)', () => {
      // 100 sqft floor (at 50 sqft/hr = 2 hrs) + 60 ft railing
      const hPlain = calculateBaseLaborHours({ floorArea: 100, railingLength: 60, railingStyle: 'plain_2x2' });
      assert.equal(hPlain, 2 + 60 / 5); // 2 + 12 = 14

      const hTurned = calculateBaseLaborHours({ floorArea: 100, railingLength: 60, railingStyle: 'turned_spindles' });
      assert.equal(hTurned, 2 + 60 / 3); // 2 + 20 = 22

      const hPanel = calculateBaseLaborHours({ floorArea: 100, railingLength: 60, railingStyle: 'solid_panel' });
      assert.equal(hPanel, 2 + 60 / 4); // 2 + 15 = 17

      const hCable = calculateBaseLaborHours({ floorArea: 100, railingLength: 60, railingStyle: 'cable_glass' });
      assert.equal(hCable, 2 + 60 / 12); // 2 + 5 = 7
    });

    it('Adds 40% floor base labor when underside / joists is enabled', () => {
      const hWithoutJoists = calculateBaseLaborHours({ floorArea: 200, includeJoists: false });
      // 200 / 50 = 4 hrs
      assert.equal(hWithoutJoists, 4);

      const hWithJoists = calculateBaseLaborHours({ floorArea: 200, includeJoists: true });
      // 4 + (4 * 0.40) = 5.6 hrs
      closeTo(hWithJoists, 5.6);
    });
  });

  // =============================================
  // 4. FORMULA 3 — FIVE-PART LABOR CALCULATION
  // =============================================
  describe('Formula 3 — Five-Part Labor Calculation', () => {
    it('Computes all 4 condition flags simultaneously', () => {
      // Base hours: 10
      // Condition sum: 0.15 + 0.10 + 0.20 + 0.05 = 0.50
      const labor = calculateFivePartLabor({
        baseHours: 10,
        coatingType: 'bare_weathered', // Mc = 1.00
        woodSpecies: 'pressure_treated_pine', // Ms = 1.00
        accessType: 'ground_level', // Ma = 1.00
        conditionFlags: ['heavy_mildew', 'tannin_rust_bleed', 'pressure_damage_furring', 'mill_glaze_new_wood'],
        billingRate: 75,
      });

      assert.equal(labor.H1_base, 10);
      assert.equal(labor.H2_coating, 0); // 10 * (1 - 1) = 0
      assert.equal(labor.H3_species, 0); // 10 * 1 * (1 - 1) = 0
      assert.equal(labor.H4_access, 0);  // 10 * 1 * 1 * (1 - 1) = 0
      closeTo(labor.H5_condition, 10 * 1 * 1 * 1 * 0.50); // 5.0 hrs
      closeTo(labor.totalHours, 15.0);
      closeTo(labor.laborCost, 15.0 * 75); // $1,125.00
    });

    it('Computes all 4 access multipliers', () => {
      const ground = calculateFivePartLabor({ baseHours: 10, accessType: 'ground_level', coatingType: 'bare' });
      assert.equal(ground.H4_access, 0);

      const elevated = calculateFivePartLabor({ baseHours: 10, accessType: 'elevated_one_story', coatingType: 'bare' });
      // 10 * 1 * 1 * (1.15 - 1) = 1.5 hrs
      closeTo(elevated.H4_access, 1.5);

      const secondStory = calculateFivePartLabor({ baseHours: 10, accessType: 'second_story', coatingType: 'bare' });
      // 10 * 1 * 1 * (1.35 - 1) = 3.5 hrs
      closeTo(secondStory.H4_access, 3.5);

      const staging = calculateFivePartLabor({ baseHours: 10, accessType: 'staging_roof', coatingType: 'bare' });
      // 10 * 1 * 1 * (1.60 - 1) = 6.0 hrs
      closeTo(staging.H4_access, 6.0);
    });
  });

  // =============================================
  // 5. FORMULA 4 — PRODUCT QUANTITIES & MATERIALS
  // =============================================
  describe('Formula 4 — Product Quantities & Material Exceptions', () => {
    it('Bare wood suppresses stripper quantity', () => {
      const prod = calculateProductRequirements({
        billableArea: 350,
        woodSpecies: 'cedar',
        coatingType: 'bare_weathered_gray', // Mc = 1.00
      });
      assert.equal(prod.products.stripper.rawQuantity, 0);
      assert.equal(prod.products.stripper.cost, 0);
      assert.equal(prod.products.stripper.active, false);
      assert.ok(prod.products.stain.rawQuantity > 0);
    });

    it('Maintained penetrating stain suppresses stripper quantity', () => {
      const prod = calculateProductRequirements({
        billableArea: 350,
        woodSpecies: 'cedar',
        coatingType: 'maintained_penetrating_stain', // Mc = 0.70
      });
      assert.equal(prod.products.stripper.rawQuantity, 0);
      assert.equal(prod.products.stripper.cost, 0);
      assert.equal(prod.products.stripper.active, false);
    });

    it('Heavy oil build-up calculates stripper (area / 175)', () => {
      const prod = calculateProductRequirements({
        billableArea: 350,
        woodSpecies: 'cedar',
        coatingType: 'oil_heavy_buildup', // Mc = 1.90
      });
      // 350 / 175 = 2.0 gal
      assert.equal(prod.products.stripper.rawQuantity, 2.0);
      assert.equal(prod.products.stripper.cost, 2.0 * 38.0);
      assert.equal(prod.products.stripper.active, true);
    });

    it('Composite Trex is clean-only: suppresses stain, stripper and brightener', () => {
      const prod = calculateProductRequirements({
        billableArea: 500,
        woodSpecies: 'composite',
      });
      assert.equal(prod.products.stain.rawQuantity, 0);
      assert.equal(prod.products.stripper.rawQuantity, 0);
      assert.equal(prod.products.brightener.rawQuantity, 0);
      // Cleaner only: 500 / 500 = 1.0 gal
      assert.equal(prod.products.cleaner.rawQuantity, 1.0);
      assert.equal(prod.products.cleaner.cost, 32.0);
      assert.equal(prod.totalMaterialCost, 32.0);
    });
  });

  // =============================================
  // 6. CONFIDENCE RANGES & WARNINGS
  // =============================================
  describe('Formula 5 — Confidence Ranges & Warnings', () => {
    it('High confidence applies ±12%', () => {
      const range = calculateConfidenceRange({ baseEstimate: 1000, confidenceLevel: 'high' });
      assert.equal(range.lowEstimate, 880);
      assert.equal(range.highEstimate, 1120);
      assert.equal(range.displayQuote.formatted, '$880 – $1,120');
    });

    it('Medium confidence applies ±20%', () => {
      const range = calculateConfidenceRange({ baseEstimate: 1000, confidenceLevel: 'medium' });
      assert.equal(range.lowEstimate, 800);
      assert.equal(range.highEstimate, 1200);
      assert.equal(range.displayQuote.formatted, '$800 – $1,200');
    });

    it('Low confidence applies ±32% and triggers inspection warning', () => {
      const result = calculateClientPricing({
        floorArea: 200,
        coatingConfidence: 'low',
      });
      closeTo(result.spread, 0.32);
      const lowWarn = result.warnings.find((w) => w.code === 'LOW_CONFIDENCE_INSPECTION_REQUIRED');
      assert.ok(lowWarn, 'Low confidence warning must be returned');
    });

    it('Unknown coating triggers inspection warning', () => {
      const result = calculateClientPricing({
        floorArea: 200,
        coatingType: 'unknown_mixed',
      });
      const lowWarn = result.warnings.find((w) => w.code === 'LOW_CONFIDENCE_INSPECTION_REQUIRED');
      assert.ok(lowWarn, 'Unknown coating must trigger inspection warning');
    });

    it('Incomplete coating questionnaire flags estimate as provisional', () => {
      const result = calculateClientPricing({
        floorArea: 200,
        isCoatingIncomplete: true,
      });
      assert.equal(result.isProvisional, true);
      const provWarn = result.warnings.find((w) => w.code === 'PROVISIONAL_ESTIMATE_COATING_INCOMPLETE');
      assert.ok(provWarn, 'Provisional estimate warning must be returned');
    });
  });

  // =============================================
  // 7. INPUT VALIDATION & ZERO AREA CHECK
  // =============================================
  describe('Input Validation', () => {
    it('Rejects zero floor area', () => {
      assert.throws(() => {
        calculateClientPricing({ floorArea: 0 });
      }, /Deck floor area must be greater than 0/);
    });

    it('Rejects missing floor area', () => {
      assert.throws(() => {
        calculateClientPricing({});
      }, /Deck floor area must be greater than 0/);
    });
  });
});

