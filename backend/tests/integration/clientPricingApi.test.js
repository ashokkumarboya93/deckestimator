// =============================================
// Deck Estimator — Client Pricing API & Persistence Tests
// =============================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/modules/users/users.model');
const Deck = require('../../src/modules/decks/deck.model');
const Estimate = require('../../src/modules/estimates/estimate.model');
const { ROLES } = require('../../src/shared/constants');

function closeTo(actual, expected, tolerance = 0.01) {
  const diff = Math.abs(actual - expected);
  assert.ok(
    diff <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected} (diff: ${diff})`
  );
}

describe('Client Pricing API & MongoDB Persistence', () => {
  let mongoServer;
  let server;
  let baseUrl;
  let customerToken;
  let customerId;
  let testDeckId;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, () => {
        const { port } = server.address();
        baseUrl = `http://localhost:${port}/api/v1`;
        resolve();
      });
    });

    // Register a Customer
    const resAuth = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Jane Homeowner',
        email: 'jane.homeowner@example.com',
        password: 'Password123!',
        role: ROLES.CUSTOMER,
        phone: '5551234567',
      }),
    });
    const dataAuth = await resAuth.json();
    if (!resAuth.ok) {
      console.error('REGISTER ERROR:', JSON.stringify(dataAuth, null, 2));
    }
    customerToken = dataAuth.data?.token;
    customerId = dataAuth.data?.user?.id;

    // Create a 400 sq ft Deck
    const resDeck = await fetch(`${baseUrl}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        projectName: 'Worked Example Backyard Deck',
        measurementUnit: 'ft',
        dimensions: { length: 20, width: 20, area: 400 },
        deckShape: 'rectangle',
        surfaceDetails: { material: 'wood' },
      }),
    });
    const dataDeck = await resDeck.json();
    testDeckId = dataDeck.data.deck.id;
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  // 1. API Preview Calculation Test
  it('POST /pricing/calculate - Returns exact worked example calculations via API', async () => {
    const payload = {
      floorArea: 400,
      railingLength: 50,
      railingStyle: 'plain_2x2',
      stairCount: 6,
      fasciaLength: 0,
      pergolaLength: 0,
      sidingArea: 0,
      includeJoists: false,
      woodSpecies: 'pressure_treated_pine',
      accessType: 'ground_level',
      coatingType: 'oil_penetrating_one_coat',
      coatingConfidence: 'medium',
      conditionFlags: ['heavy_mildew', 'tannin_rust_bleed'],
      billingRate: 75,
      floorProductionRate: 50,
      customPrices: { stain: 46, stripper: 38, brightener: 28, cleaner: 32 },
    };

    const res = await fetch(`${baseUrl}/pricing/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify(payload),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    const d = json.data;

    assert.equal(d.billableArea, 672);
    closeTo(d.baseLaborHours, 21.0);
    closeTo(d.laborBreakdown.totalHours, 34.125);
    closeTo(d.totalMaterialCost, 412.608);
    closeTo(d.laborCost, 2559.375);
    closeTo(d.baseEstimate, 2971.983);
    closeTo(d.lowEstimate, 2377.5864);
    closeTo(d.highEstimate, 3566.3796);
    assert.equal(d.displayQuote.low, 2378);
    assert.equal(d.displayQuote.high, 3566);
    assert.equal(d.displayQuote.formatted, '$2,378 – $3,566');
    closeTo(d.maintenanceReference, 2080.3881);
  });

  // 2. Estimate Creation & MongoDB Persistence Test
  it('POST /estimates - Persists client restoration estimate with snapshot in MongoDB', async () => {
    const payload = {
      deckId: testDeckId,
      estimateName: 'Jane Official Restoration Estimate',
      floorArea: 400,
      railingLength: 50,
      railingStyle: 'plain_2x2',
      stairCount: 6,
      woodSpecies: 'pressure_treated_pine',
      accessType: 'ground_level',
      coatingType: 'oil_penetrating_one_coat',
      coatingConfidence: 'medium',
      conditionFlags: ['heavy_mildew', 'tannin_rust_bleed'],
      billingRate: 75,
      notes: 'Customer approved oil penetrating one coat treatment',
    };

    const res = await fetch(`${baseUrl}/estimates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify(payload),
    });

    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.success, true);
    const est = json.data.estimate;

    assert.ok(est.id);
    assert.ok(est.estimateNumber.startsWith('EST-'));
    closeTo(est.totalAmount, 2971.983);
    assert.equal(est.minimumAdjustment, 0); // No artificial adjustment

    // Verify snapshot in MongoDB directly
    const dbDoc = await Estimate.findById(est.id);
    assert.ok(dbDoc);
    assert.equal(dbDoc.pricingSnapshot.billableArea, 672);
    closeTo(dbDoc.pricingSnapshot.laborBreakdown.totalHours, 34.125);
    closeTo(dbDoc.pricingSnapshot.baseEstimate, 2971.983);
    assert.equal(dbDoc.pricingSnapshot.displayQuote.formatted, '$2,378 – $3,566');
  });
});
