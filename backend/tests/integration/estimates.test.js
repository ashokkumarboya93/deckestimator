// =============================================
// Deck Estimator — Pricing Engine & Estimates Tests (Phase 6)
// =============================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/modules/users/users.model');
const ContractorProfile = require('../../src/modules/contractors/contractorProfile.model');
const Deck = require('../../src/modules/decks/deck.model');
const MaterialCategory = require('../../src/modules/catalogs/materialCategory.model');
const Material = require('../../src/modules/catalogs/material.model');
const ServiceCategory = require('../../src/modules/catalogs/serviceCategory.model');
const Service = require('../../src/modules/catalogs/service.model');
const MaterialServiceCompatibility = require('../../src/modules/catalogs/materialServiceCompatibility.model');
const PricingConfiguration = require('../../src/modules/pricing/pricingConfiguration.model');
const Estimate = require('../../src/modules/estimates/estimate.model');
const EstimateRevision = require('../../src/modules/estimates/estimateRevision.model');
const AuditLog = require('../../src/shared/models/auditLog.model');
const { ROLES, VERIFICATION_STATUS } = require('../../src/shared/constants');

describe('Phase 6 — Pricing Calculation Engine & Estimate Management', () => {
  let mongoServer;
  let server;
  let baseUrl;

  let customerAToken;
  let customerAId;
  let customerBToken;
  let contractorToken;
  let pendingContractorToken;
  let adminToken;

  let deckAId;
  let deckCompositeId;
  let materialWoodStainId;
  let materialCompositeWashId;
  let servicePowerWashId;
  let serviceChemicalStripId;
  let pricingConfigId;
  let createdEstimateId;

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

    // 1. Register Customer A
    const resA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Alice Customer',
        email: 'alice.estimates@deckestimator.com',
        password: 'Password123!',
        role: ROLES.CUSTOMER,
        phone: '1234567890',
      }),
    });
    const dataA = await resA.json();
    customerAToken = dataA.data.token;
    customerAId = dataA.data.user.id;

    // 2. Register Customer B
    const resB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Bob Customer',
        email: 'bob.estimates@deckestimator.com',
        password: 'Password123!',
        role: ROLES.CUSTOMER,
        phone: '1234567891',
      }),
    });
    const dataB = await resB.json();
    customerBToken = dataB.data.token;

    // 3. Register Pending Contractor
    const resPending = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Dan Pending',
        email: 'dan.pending@deckestimator.com',
        password: 'Password123!',
        role: ROLES.CONTRACTOR,
        phone: '1234567892',
        businessName: 'Pending Deck Pros',
        licenseNumber: 'LIC-PEND-001',
      }),
    });
    const dataPending = await resPending.json();
    pendingContractorToken = dataPending.data.token;

    // 4. Register Approved Contractor
    const resApproved = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Carl Approved Contractor',
        email: 'carl.approved@deckestimator.com',
        password: 'Password123!',
        role: ROLES.CONTRACTOR,
        phone: '1234567893',
        businessName: 'Approved Deck Masters',
        licenseNumber: 'LIC-APP-001',
      }),
    });
    const dataApproved = await resApproved.json();
    contractorToken = dataApproved.data.token;
    await ContractorProfile.findOneAndUpdate(
      { userId: dataApproved.data.user.id },
      { verificationStatus: VERIFICATION_STATUS.APPROVED }
    );

    // 5. Register Admin
    const resAdmin = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Pricing Administrator',
        email: 'admin.pricing@deckestimator.com',
        password: 'Password123!',
        role: ROLES.CUSTOMER,
        phone: '1234567894',
      }),
    });
    const dataAdmin = await resAdmin.json();
    await User.findByIdAndUpdate(dataAdmin.data.user.id, { role: ROLES.ADMIN });

    const loginAdmin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin.pricing@deckestimator.com',
        password: 'Password123!',
      }),
    });
    const loginAdminData = await loginAdmin.json();
    adminToken = loginAdminData.data.token;

    // 6. Setup Test Deck for Customer A (Rectangular: 20x15 = 300 sqft, wood)
    const deckRes = await fetch(`${baseUrl}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        projectName: 'Alice Backyard Pine Deck',
        measurementUnit: 'ft',
        dimensions: {
          length: 20,
          width: 15,
        },
        deckShape: 'rectangle',
        surfaceDetails: {
          material: 'wood',
        },
      }),
    });
    const deckData = await deckRes.json();
    deckAId = deckData.data.deck.id;

    // 7. Setup Composite Deck for Surface Incompatibility Testing
    const compDeckRes = await fetch(`${baseUrl}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        projectName: 'Alice Composite Deck',
        measurementUnit: 'ft',
        dimensions: {
          length: 16,
          width: 12,
        },
        deckShape: 'rectangle',
        surfaceDetails: {
          material: 'composite',
        },
      }),
    });
    const compDeckData = await compDeckRes.json();
    deckCompositeId = compDeckData.data.deck.id;

    // 8. Create Material Category & Materials
    const matCat = await MaterialCategory.create({
      name: 'Deck Stains & Finishes',
      slug: 'deck-stains-finishes',
      displayOrder: 1,
      status: 'active',
      createdBy: dataAdmin.data.user.id,
      updatedBy: dataAdmin.data.user.id,
    });

    const matWood = await Material.create({
      materialName: 'Olympic Wood Stain Standard',
      materialCode: 'OLY-WOOD-01',
      categoryId: matCat._id,
      materialType: 'stain',
      brandName: 'Olympic',
      compatibleSurfaces: ['wood'],
      measurement: { quantityUnit: 'gallon' },
      coverage: { coverageValue: 200, coverageAreaUnit: 'square_foot' },
      cost: { unitCost: 40.0, currency: 'USD' },
      status: 'active',
      createdBy: dataAdmin.data.user.id,
      updatedBy: dataAdmin.data.user.id,
    });
    materialWoodStainId = matWood._id.toString();

    const matComp = await Material.create({
      materialName: 'Composite Clean Solution',
      materialCode: 'COMP-CLN-01',
      categoryId: matCat._id,
      materialType: 'cleaner',
      brandName: 'DeckShield',
      compatibleSurfaces: ['composite'],
      measurement: { quantityUnit: 'gallon' },
      coverage: { coverageValue: 400, coverageAreaUnit: 'square_foot' },
      cost: { unitCost: 25.0, currency: 'USD' },
      status: 'active',
      createdBy: dataAdmin.data.user.id,
      updatedBy: dataAdmin.data.user.id,
    });
    materialCompositeWashId = matComp._id.toString();

    // 9. Create Service Category & Services
    const srvCat = await ServiceCategory.create({
      name: 'Deck Washing & Stripping',
      slug: 'deck-washing-stripping',
      displayOrder: 1,
      status: 'active',
      createdBy: dataAdmin.data.user.id,
      updatedBy: dataAdmin.data.user.id,
    });

    const srvWash = await Service.create({
      serviceName: 'Pressure Washing Service',
      serviceCode: 'SRV-PW-01',
      categoryId: srvCat._id,
      serviceType: 'cleaning',
      measurement: { unit: 'square_foot' },
      operationalDetails: {
        estimatedDuration: 1.5,
        durationUnit: 'hour',
        laborNotes: 'Full deep clean',
      },
      status: 'active',
      createdBy: dataAdmin.data.user.id,
      updatedBy: dataAdmin.data.user.id,
    });
    servicePowerWashId = srvWash._id.toString();

    const srvStrip = await Service.create({
      serviceName: 'Chemical Stripping Incompatible',
      serviceCode: 'SRV-STRIP-01',
      categoryId: srvCat._id,
      serviceType: 'preparation',
      measurement: { unit: 'square_foot' },
      status: 'active',
      createdBy: dataAdmin.data.user.id,
      updatedBy: dataAdmin.data.user.id,
    });
    serviceChemicalStripId = srvStrip._id.toString();

    // 10. Compatibility Rule: Chemical Strip is INCOMPATIBLE with Composite Wash
    await MaterialServiceCompatibility.create({
      materialId: matComp._id,
      serviceId: srvStrip._id,
      compatibilityStatus: 'incompatible',
      compatibilityNotes: 'Chemical stripping causes thermal discoloration on composite decking.',
      createdBy: dataAdmin.data.user.id,
      updatedBy: dataAdmin.data.user.id,
    });
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  // =============================================
  // 1. PRICING CONFIGURATION API
  // =============================================
  describe('Pricing Configuration Management', () => {
    it('Admin can create an active pricing configuration', async () => {
      const res = await fetch(`${baseUrl}/pricing/configurations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          configurationName: 'Approved Standard 2026 Pricing',
          minimumJobPrice: 250,
          basePricePerSqFt: 0.5,
          laborRate: 40,
          wastePercentage: 10,
          travelCharge: 35,
          taxPercentage: 5,
          taxName: 'State Sales Tax',
          isActive: true,
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.configuration.configurationName, 'Approved Standard 2026 Pricing');
      assert.equal(json.data.configuration.minimumJobPrice, 250);
      assert.equal(json.data.configuration.basePricePerSqFt, 0.5);
      assert.equal(json.data.configuration.laborRate, 40);
      assert.equal(json.data.configuration.wastePercentage, 10);
      assert.equal(json.data.configuration.travelCharge, 35);
      assert.equal(json.data.configuration.taxPercentage, 5);
      assert.equal(json.data.configuration.isActive, true);
      pricingConfigId = json.data.configuration.id;
    });

    it('Non-admin cannot create pricing configuration (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/pricing/configurations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({
          configurationName: 'Hacker Pricing',
          minimumJobPrice: 10,
        }),
      });

      assert.equal(res.status, 403);
    });

    it('Authenticated user can read active pricing configuration', async () => {
      const res = await fetch(`${baseUrl}/pricing/configurations/active`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.configuration.isActive, true);
      assert.equal(json.data.configuration.minimumJobPrice, 250);
    });

    it('Admin can update pricing configuration', async () => {
      const res = await fetch(`${baseUrl}/pricing/configurations/${pricingConfigId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          notes: 'Updated seasonal promotional pricing',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.configuration.notes, 'Updated seasonal promotional pricing');
    });
  });

  // =============================================
  // 2. ESTIMATE GENERATION & CALCULATION ENGINE
  // =============================================
  describe('Estimate Generation & Calculation Engine', () => {
    it('Customer A can generate an estimate with verified mathematical breakdown', async () => {
      // Deck Area: 300 sqft
      // Material: Olympic Wood Stain (Coverage: 200 sqft/gal, Cost: $40/gal, Waste: 10%)
      // Base qty = 300 / 200 = 1.5 gal. With 10% waste = 1.65 gal -> 2 gallons purchase qty.
      // Material Cost = 2 * $40 = $80.
      // Service: Pressure Wash (300 sqft * $0.50/sqft = $150).
      // Labor: 1.5 hrs * $40/hr = $60.
      // Additional: Travel charge = $35.
      // Subtotal = $80 + $150 + $60 + $35 = $325.
      // Minimum Job Price: $250 -> subtotal $325 > $250, so minimum adjustment = $0.
      // Pre-tax Total = $325.
      // Tax: 5% of $325 = $16.25.
      // Total Amount = $325 + $16.25 = $341.25.

      const res = await fetch(`${baseUrl}/estimates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({
          deckId: deckAId,
          estimateName: 'Alice Backyard Restoration Estimate',
          materialIds: [materialWoodStainId],
          serviceIds: [servicePowerWashId],
          notes: 'Customer requested eco-friendly wash',
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      const est = json.data.estimate;

      assert.ok(est.estimateNumber.startsWith('EST-'));
      assert.equal(est.deckDetails.areaSqFt, 300);
      assert.equal(est.selectedMaterials.length, 1);
      assert.equal(est.selectedMaterials[0].quantity, 2);
      assert.equal(est.selectedMaterials[0].subtotal, 80);

      assert.equal(est.selectedServices.length, 1);
      assert.equal(est.selectedServices[0].subtotal, 150);

      assert.equal(est.laborBreakdown.enabled, true);
      assert.equal(est.laborBreakdown.subtotal, 60);

      assert.equal(est.additionalCharges.subtotal, 35);

      assert.equal(est.subtotal, 325);
      assert.equal(est.minimumAdjustment, 0);
      assert.equal(est.preTaxTotal, 325);
      assert.equal(est.taxAmount, 16.25);
      assert.equal(est.totalAmount, 341.25);
      assert.equal(est.estimateStatus, 'DRAFT');
      assert.equal(est.version, 1);

      createdEstimateId = est.id;
    });

    it('Rejects estimate when material is incompatible with deck surface (400)', async () => {
      // Composite wash applied on wood deck should be rejected
      const res = await fetch(`${baseUrl}/estimates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({
          deckId: deckAId, // wood deck
          materialIds: [materialCompositeWashId], // only compatible with composite
        }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.ok(json.error.message.includes('incompatible'));
    });

    it('Rejects estimate when material and service are mutually incompatible (400)', async () => {
      // Composite deck + Composite material + Chemical stripping service (marked incompatible)
      const res = await fetch(`${baseUrl}/estimates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({
          deckId: deckCompositeId,
          materialIds: [materialCompositeWashId],
          serviceIds: [serviceChemicalStripId],
        }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.ok(json.error.message.includes('Incompatible combination'));
    });

    it('Customer cannot create estimate for a deck owned by another user (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/estimates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerBToken}`, // Bob trying to estimate Alice's deck
        },
        body: JSON.stringify({
          deckId: deckAId,
          materialIds: [materialWoodStainId],
        }),
      });

      assert.equal(res.status, 403);
    });

    it('Unverified / Pending contractor cannot create estimates (403 CONTRACTOR_NOT_VERIFIED)', async () => {
      const res = await fetch(`${baseUrl}/estimates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pendingContractorToken}`,
        },
        body: JSON.stringify({
          deckId: deckAId,
          materialIds: [materialWoodStainId],
        }),
      });

      assert.equal(res.status, 403);
    });
  });

  // =============================================
  // 3. ESTIMATE RETRIEVAL & ACCESS ISOLATION
  // =============================================
  describe('Estimate Retrieval & Isolation', () => {
    it('Customer A can retrieve their own estimate', async () => {
      const res = await fetch(`${baseUrl}/estimates/${createdEstimateId}`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.estimate.id, createdEstimateId);
      assert.equal(json.data.estimate.totalAmount, 341.25);
    });

    it('Customer B cannot retrieve Customer A estimate (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/estimates/${createdEstimateId}`, {
        headers: { Authorization: `Bearer ${customerBToken}` },
      });

      assert.equal(res.status, 403);
    });

    it('Admin can retrieve any customer estimate for platform oversight', async () => {
      const res = await fetch(`${baseUrl}/estimates/${createdEstimateId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.equal(res.status, 200);
    });

    it('Listing estimates strictly isolates customer data', async () => {
      const resA = await fetch(`${baseUrl}/estimates`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      const dataA = await resA.json();
      assert.ok(dataA.data.estimates.length >= 1);
      assert.equal(dataA.data.estimates[0].ownerId.id, customerAId);

      const resB = await fetch(`${baseUrl}/estimates`, {
        headers: { Authorization: `Bearer ${customerBToken}` },
      });
      const dataB = await resB.json();
      assert.equal(dataB.data.estimates.length, 0); // Bob has no estimates
    });
  });

  // =============================================
  // 4. ESTIMATE RECALCULATION & HISTORICAL REVISIONS
  // =============================================
  describe('Estimate Recalculation & Revision Preservation', () => {
    it('Customer can recalculate estimate, creating an immutable revision snapshot (version increments)', async () => {
      // Recalculate without material (services only)
      const res = await fetch(`${baseUrl}/estimates/${createdEstimateId}/recalculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({
          materialIds: [], // remove materials
          serviceIds: [servicePowerWashId],
          revisionReason: 'Customer decided to provide their own stain',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      const updated = json.data.estimate;

      assert.equal(updated.version, 2); // Version incremented
      assert.equal(updated.selectedMaterials.length, 0);
      assert.equal(updated.selectedServices.length, 1);

      // Verify revision history collection retained previous snapshot
      const historyRes = await fetch(`${baseUrl}/estimates/${createdEstimateId}/history`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });

      assert.equal(historyRes.status, 200);
      const histJson = await historyRes.json();
      assert.equal(histJson.data.revisions.length, 1);
      assert.equal(histJson.data.revisions[0].version, 1);
      assert.equal(histJson.data.revisions[0].totalAmount, 341.25); // Original amount preserved
      assert.equal(
        histJson.data.revisions[0].revisionReason,
        'Customer decided to provide their own stain'
      );
    });

    it('Customer can update estimate status to SUBMITTED', async () => {
      const res = await fetch(`${baseUrl}/estimates/${createdEstimateId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({
          estimateStatus: 'SUBMITTED',
          notes: 'Ready for contractor review',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.estimate.estimateStatus, 'SUBMITTED');
    });
  });

  // =============================================
  // 5. AUDIT LOGGING VERIFICATION
  // =============================================
  describe('Audit Logging Verification', () => {
    it('Audit log recorded CREATE_PRICING, CREATE_ESTIMATE, and RECALCULATE_ESTIMATE', async () => {
      const logs = await AuditLog.find({
        action: { $in: ['CREATE_PRICING', 'CREATE_ESTIMATE', 'RECALCULATE_ESTIMATE'] },
      });

      assert.ok(logs.length >= 3, `Expected at least 3 audit logs, found ${logs.length}`);
      const actions = logs.map((l) => l.action);
      assert.ok(actions.includes('CREATE_PRICING'));
      assert.ok(actions.includes('CREATE_ESTIMATE'));
      assert.ok(actions.includes('RECALCULATE_ESTIMATE'));
    });
  });
});
