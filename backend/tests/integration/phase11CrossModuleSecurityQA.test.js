// =============================================
// Deck Estimator — Phase 11 Integration, Security & QA Full Test Suite
// =============================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../src/app');
const User = require('../../src/modules/users/users.model');
const ContractorProfile = require('../../src/modules/contractors/contractorProfile.model');
const VerificationDocument = require('../../src/modules/contractors/verificationDocument.model');
const Deck = require('../../src/modules/decks/deck.model');
const DeckImage = require('../../src/modules/files/deckImage.model');
const MaterialCategory = require('../../src/modules/catalogs/materialCategory.model');
const Material = require('../../src/modules/catalogs/material.model');
const ServiceCategory = require('../../src/modules/catalogs/serviceCategory.model');
const Service = require('../../src/modules/catalogs/service.model');
const Estimate = require('../../src/modules/estimates/estimate.model');
const Lead = require('../../src/modules/leads/lead.model');
const Commission = require('../../src/modules/commissions/commission.model');
const CommissionPolicy = require('../../src/modules/commissions/commissionPolicy.model');
const CommissionPaymentRecord = require('../../src/modules/commissions/commissionPaymentRecord.model');
const PlatformSetting = require('../../src/modules/admin/platformSetting.model');
const AuditLog = require('../../src/shared/models/auditLog.model');
const { ROLES, ACCOUNT_STATUS, VERIFICATION_STATUS, LEAD_STATUS, COMMISSION_STATUS } = require('../../src/shared/constants');
const { env } = require('../../src/config/env');

describe('Phase 11 — Integration, Security and Quality Assurance Validation', () => {
  let mongoServer;
  let server;
  let baseUrl;

  // Test principals
  let adminToken, customerAToken, customerBToken, contractorAToken, contractorBToken, unverifiedContractorToken;
  let adminUser, customerAUser, customerBUser, contractorAUser, contractorBUser, unverifiedContractorUser;
  let contractorAProfile;

  // Reusable artifacts
  let customerADeck, customerBDeck;
  let sampleMaterial, sampleService;
  let sampleDocA;

  // Image buffers
  const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const fakeExeHeader = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);

  async function api(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const headers = { ...(options.headers || {}) };
    if (!options.isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    if (options.token) headers['Authorization'] = `Bearer ${options.token}`;

    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body
        ? options.isFormData
          ? options.body
          : JSON.stringify(options.body)
        : undefined,
    });

    const contentType = res.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    return {
      status: res.status,
      headers: res.headers,
      body,
    };
  }

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;

    const standardPasswordHash = await User.hashPassword('ValidP@ssw0rd123!');

    // 1. Seed Admin
    adminUser = await User.create({
      fullName: 'Super Admin',
      email: 'admin.phase11@test.com',
      passwordHash: standardPasswordHash,
      role: ROLES.ADMIN,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      isEmailVerified: true,
    });
    adminToken = jwt.sign(
      { id: adminUser._id.toString(), role: ROLES.ADMIN, email: adminUser.email },
      env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // 2. Seed Customer A
    customerAUser = await User.create({
      fullName: 'Alice Customer',
      email: 'customer.a@test.com',
      passwordHash: standardPasswordHash,
      role: ROLES.CUSTOMER,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      isEmailVerified: true,
    });
    customerAToken = jwt.sign(
      { id: customerAUser._id.toString(), role: ROLES.CUSTOMER, email: customerAUser.email },
      env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // 3. Seed Customer B
    customerBUser = await User.create({
      fullName: 'Bob Customer',
      email: 'customer.b@test.com',
      passwordHash: standardPasswordHash,
      role: ROLES.CUSTOMER,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      isEmailVerified: true,
    });
    customerBToken = jwt.sign(
      { id: customerBUser._id.toString(), role: ROLES.CUSTOMER, email: customerBUser.email },
      env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // 4. Seed Contractor A (Approved)
    contractorAUser = await User.create({
      fullName: 'Charlie Contractor',
      email: 'contractor.a@test.com',
      passwordHash: standardPasswordHash,
      role: ROLES.CONTRACTOR,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      isEmailVerified: true,
    });
    contractorAToken = jwt.sign(
      { id: contractorAUser._id.toString(), role: ROLES.CONTRACTOR, email: contractorAUser.email },
      env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    contractorAProfile = await ContractorProfile.create({
      userId: contractorAUser._id,
      businessName: 'Charlie Deck Builders LLC',
      licenseNumber: 'LIC-CH-001',
      insurancePolicyNumber: 'INS-CH-001',
      verificationStatus: VERIFICATION_STATUS.APPROVED,
      verifiedAt: new Date(),
    });

    // 5. Seed Contractor B (Approved)
    contractorBUser = await User.create({
      fullName: 'Dave Contractor',
      email: 'contractor.b@test.com',
      passwordHash: standardPasswordHash,
      role: ROLES.CONTRACTOR,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      isEmailVerified: true,
    });
    contractorBToken = jwt.sign(
      { id: contractorBUser._id.toString(), role: ROLES.CONTRACTOR, email: contractorBUser.email },
      env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    await ContractorProfile.create({
      userId: contractorBUser._id,
      businessName: 'Dave Construction Inc',
      licenseNumber: 'LIC-DV-002',
      insurancePolicyNumber: 'INS-DV-002',
      verificationStatus: VERIFICATION_STATUS.APPROVED,
      verifiedAt: new Date(),
    });

    // 6. Seed Unverified Contractor
    unverifiedContractorUser = await User.create({
      fullName: 'Eve Unverified',
      email: 'contractor.pending@test.com',
      passwordHash: standardPasswordHash,
      role: ROLES.CONTRACTOR,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      isEmailVerified: true,
    });
    unverifiedContractorToken = jwt.sign(
      { id: unverifiedContractorUser._id.toString(), role: ROLES.CONTRACTOR, email: unverifiedContractorUser.email },
      env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    await ContractorProfile.create({
      userId: unverifiedContractorUser._id,
      businessName: 'Eve Unverified Carpentry',
      licenseNumber: 'LIC-EV-003',
      insurancePolicyNumber: 'INS-EV-003',
      verificationStatus: VERIFICATION_STATUS.PENDING,
    });

    // 7. Seed Catalog categories and items
    const matCat = await MaterialCategory.create({
      name: 'Decking Boards & Finishes',
      slug: `deck-boards-${Date.now()}`,
      displayOrder: 1,
      status: 'active',
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    });

    sampleMaterial = await Material.create({
      materialName: 'Olympic Standard Wood Stain',
      materialCode: `MAT-PINE-${Date.now()}`,
      categoryId: matCat._id,
      materialType: 'stain',
      brandName: 'Standard Pine',
      compatibleSurfaces: ['wood', 'composite'],
      measurement: { quantityUnit: 'gallon' },
      coverage: { coverageValue: 200, coverageAreaUnit: 'square_foot' },
      cost: { unitCost: 45.50, currency: 'USD' },
      status: 'active',
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    });

    const srvCat = await ServiceCategory.create({
      name: 'Deck Staining & Painting',
      slug: `staining-${Date.now()}`,
      displayOrder: 1,
      status: 'active',
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    });

    sampleService = await Service.create({
      serviceName: 'Full Deck Staining & Sealing',
      serviceCode: `SRV-STAIN-${Date.now()}`,
      categoryId: srvCat._id,
      serviceType: 'staining',
      measurement: { unit: 'square_foot' },
      operationalDetails: {
        estimatedDuration: 2.0,
        durationUnit: 'hour',
        laborNotes: 'Complete installation',
      },
      status: 'active',
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    });

    // 8. Seed Customer A Deck
    customerADeck = await Deck.create({
      ownerId: customerAUser._id,
      projectName: "Alice's Cedar Deck",
      deckShape: 'rectangle',
      dimensions: { length: 20, width: 15, area: 300, isManualArea: false },
      surfaceDetails: { material: 'wood' },
    });

    // 9. Seed Customer B Deck
    customerBDeck = await Deck.create({
      ownerId: customerBUser._id,
      projectName: "Bob's Composite Deck",
      deckShape: 'rectangle',
      dimensions: { length: 25, width: 20, area: 500, isManualArea: false },
      surfaceDetails: { material: 'composite' },
    });

    // 10. Seed Contractor A Verification Doc
    sampleDocA = await VerificationDocument.create({
      contractorId: contractorAProfile._id,
      userId: contractorAUser._id,
      documentType: 'contractor_license',
      originalFileName: 'lic_charlie_001.pdf',
      storedFileName: 'stored_lic_charlie_001.pdf',
      storageKey: 'licenses/lic_charlie_001.pdf',
      mimeType: 'application/pdf',
      fileSize: 102400,
    });
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  // ============================================================
  // SECTION A: AUTHENTICATION & AUTHORIZATION (SEC-AUTH)
  // ============================================================
  describe('A. Authentication & Authorization Security (SEC-AUTH)', () => {
    it('SEC-AUTH-001: Customer cannot access Admin dashboard (403 Forbidden)', async () => {
      const res = await api('/admin/dashboard', { token: customerAToken });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('SEC-AUTH-002: Contractor cannot access Admin dashboard (403 Forbidden)', async () => {
      const res = await api('/admin/dashboard', { token: contractorAToken });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('SEC-AUTH-003: Unverified contractor blocked from operational endpoints (403 Forbidden)', async () => {
      const res = await api('/leads/contractor/inbox', { token: unverifiedContractorToken });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'CONTRACTOR_NOT_VERIFIED');
    });

    it('SEC-AUTH-004: Expired token rejected with 401 TOKEN_EXPIRED', async () => {
      const expiredToken = jwt.sign(
        { id: customerAUser._id.toString(), role: ROLES.CUSTOMER },
        env.JWT_SECRET,
        { expiresIn: '-10s' }
      );
      const res = await api('/decks', { token: expiredToken });
      assert.equal(res.status, 401);
      assert.equal(res.body.error.code, 'TOKEN_EXPIRED');
    });

    it('SEC-AUTH-005: Invalid/malformed token rejected with 401 INVALID_TOKEN', async () => {
      const res = await api('/decks', { token: 'invalid.tampered.jwttokenhere' });
      assert.equal(res.status, 401);
      assert.equal(res.body.error.code, 'INVALID_TOKEN');
    });

    it('SEC-AUTH-006: User cannot escalate role via profile update', async () => {
      const res = await api('/users/me', {
        method: 'PATCH',
        token: customerAToken,
        body: { role: 'admin' },
      });
      if (res.status === 200) {
        assert.equal(res.body.data.role, ROLES.CUSTOMER);
      } else {
        assert.ok([400, 403].includes(res.status));
      }

      const user = await User.findById(customerAUser._id);
      assert.equal(user.role, ROLES.CUSTOMER);
    });

    it('SEC-AUTH-007 [Hardened]: Deactivated/suspended user cannot reuse existing token session', async () => {
      const tempUser = await User.create({
        fullName: 'Suspended Account User',
        email: 'suspended.test@test.com',
        passwordHash: await User.hashPassword('TempPass123!'),
        role: ROLES.CUSTOMER,
        accountStatus: ACCOUNT_STATUS.ACTIVE,
      });
      const validToken = jwt.sign(
        { id: tempUser._id.toString(), role: ROLES.CUSTOMER, email: tempUser.email },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Admin suspends the user in database
      tempUser.accountStatus = ACCOUNT_STATUS.SUSPENDED;
      await tempUser.save();

      // Suspended user attempts to make request with existing token
      const res = await api('/decks', { token: validToken });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'ACCOUNT_SUSPENDED');
    });
  });

  // ============================================================
  // SECTION B: OWNERSHIP & DATA ISOLATION (IDOR)
  // ============================================================
  describe('B. Ownership and Data Isolation / IDOR (SEC-IDOR)', () => {
    it("SEC-IDOR-001: Customer A cannot view Customer B's deck (403 Forbidden)", async () => {
      const res = await api(`/decks/${customerBDeck._id}`, { token: customerAToken });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it("SEC-IDOR-002: Customer A cannot modify Customer B's deck (403 Forbidden)", async () => {
      const res = await api(`/decks/${customerBDeck._id}`, {
        method: 'PATCH',
        token: customerAToken,
        body: { projectName: 'Hacked Deck Name' },
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    it("SEC-IDOR-003: Customer A cannot view Customer B's estimate (403 / 404)", async () => {
      // Create estimate for Customer B using the API
      const estRes = await api('/estimates', {
        method: 'POST',
        token: customerBToken,
        body: {
          deckId: customerBDeck._id,
          estimateName: "Bob's Summer Estimate",
          materialIds: [sampleMaterial._id],
        },
      });
      assert.equal(estRes.status, 201);
      const bEstimateId = estRes.body.data.estimate._id || estRes.body.data.estimate.id;

      // Customer A attempts to view Customer B's estimate
      const res = await api(`/estimates/${bEstimateId}`, { token: customerAToken });
      assert.ok([403, 404].includes(res.status));
      assert.equal(res.body.success, false);
    });

    it("SEC-IDOR-004: Contractor A cannot view Contractor B's assigned lead (403 Forbidden)", async () => {
      const bLead = await Lead.create({
        leadNumber: `LEAD-ISO-B-${Date.now()}`,
        customerId: customerBUser._id,
        deckId: customerBDeck._id,
        assignedContractorId: contractorBUser._id,
        status: LEAD_STATUS.ASSIGNED,
        deckSnapshot: { projectName: "Bob's Deck", deckAreaSqFt: 500 },
        customerSnapshot: { name: 'Bob Customer', email: 'bob@test.com' },
        enquiry: { subject: 'Deck Inquiry', message: 'Build this deck' },
      });

      const res = await api(`/leads/${bLead._id}`, { token: contractorAToken });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('SEC-IDOR-005: Contractor cannot view unassigned lead (403 Forbidden)', async () => {
      const unassignedLead = await Lead.create({
        leadNumber: `LEAD-ISO-UN-${Date.now()}`,
        customerId: customerAUser._id,
        deckId: customerADeck._id,
        status: LEAD_STATUS.NEW,
        deckSnapshot: { projectName: "Alice's Deck", deckAreaSqFt: 300 },
        customerSnapshot: { name: 'Alice Customer', email: 'alice@test.com' },
        enquiry: { subject: 'Unassigned Inquiry', message: 'Need estimate review' },
      });

      const res = await api(`/leads/${unassignedLead._id}`, { token: contractorAToken });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'FORBIDDEN');
    });

    it('SEC-IDOR-006: Customer cannot access contractor verification documents (403 Forbidden)', async () => {
      const res = await api(`/contractors/documents/${sampleDocA._id}/file`, { token: customerAToken });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    it("SEC-IDOR-007: Contractor B cannot access Contractor A's verification document (403 Forbidden)", async () => {
      const res = await api(`/contractors/documents/${sampleDocA._id}/file`, { token: contractorBToken });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });
  });

  // ============================================================
  // SECTION C: SECURE FILE UPLOAD & IMAGE ACCESS (SEC-FILE)
  // ============================================================
  describe('C. Secure File Upload & Private Image Access (SEC-FILE)', () => {
    it('SEC-FILE-001: Reject executable disguised as image (.jpg with PE binary header) (400 Bad Request)', async () => {
      const formData = new FormData();
      formData.append(
        'images',
        new Blob([fakeExeHeader], { type: 'image/jpeg' }),
        'malicious_payload.jpg'
      );

      const res = await api(`/decks/${customerADeck._id}/images`, {
        method: 'POST',
        token: customerAToken,
        isFormData: true,
        body: formData,
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.error.message.includes('valid JPEG, PNG, or WebP'));
    });

    it('SEC-FILE-002: Path traversal filename is safely sanitized during upload', async () => {
      const formData = new FormData();
      formData.append(
        'images',
        new Blob([jpegHeader], { type: 'image/jpeg' }),
        '../../../../etc/passwd.jpg'
      );

      const res = await api(`/decks/${customerADeck._id}/images`, {
        method: 'POST',
        token: customerAToken,
        isFormData: true,
        body: formData,
      });

      assert.equal(res.status, 201);
      assert.ok(res.body.data);
      const uploaded = res.body.data.images ? res.body.data.images[0] : (res.body.data[0] || res.body.data);
      assert.ok(!uploaded.storageKey.includes('../'));
      assert.ok(!uploaded.storageKey.includes('..\\'));
    });

    it("SEC-FILE-003: Customer A cannot view or download Customer B's deck images (403 Forbidden)", async () => {
      const bImage = await DeckImage.create({
        deckId: customerBDeck._id,
        ownerId: customerBUser._id,
        originalFilename: 'b_deck_photo.jpg',
        storageKey: 'decks/test_b_deck_photo.jpg',
        storageProvider: 'local',
        mimeType: 'image/jpeg',
        fileSize: 1024,
      });

      const res = await api(`/decks/${customerBDeck._id}/images/${bImage._id}`, {
        token: customerAToken,
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    it('SEC-FILE-004: Assigned contractor can access deck images while unassigned contractor is blocked', async () => {
      // 1. Upload an image to Customer A's deck
      const formData = new FormData();
      formData.append(
        'images',
        new Blob([jpegHeader], { type: 'image/jpeg' }),
        'deck_inspection_a.jpg'
      );
      const uploadRes = await api(`/decks/${customerADeck._id}/images`, {
        method: 'POST',
        token: customerAToken,
        isFormData: true,
        body: formData,
      });
      assert.equal(uploadRes.status, 201);

      // 2. Create lead on Customer A's deck assigned to Contractor A
      await Lead.create({
        leadNumber: `LEAD-IMG-${Date.now()}`,
        customerId: customerAUser._id,
        deckId: customerADeck._id,
        assignedContractorId: contractorAUser._id,
        status: LEAD_STATUS.ASSIGNED,
        deckSnapshot: { projectName: "Alice's Deck", deckAreaSqFt: 300 },
        customerSnapshot: { name: 'Alice Customer', email: 'alice@test.com' },
        enquiry: { subject: 'Image inspection', message: 'Inspect deck photos' },
      });

      // 3. Contractor A (assigned) requests deck images
      const assignedRes = await api(`/decks/${customerADeck._id}/images`, { token: contractorAToken });
      assert.equal(assignedRes.status, 200);
      assert.ok(assignedRes.body.data.images.length >= 1);

      // 4. Contractor B (unassigned) requests Customer A deck images -> 403 Forbidden
      const unassignedRes = await api(`/decks/${customerADeck._id}/images`, { token: contractorBToken });
      assert.equal(unassignedRes.status, 403);
      assert.equal(unassignedRes.body.error.code, 'FORBIDDEN');
    });
  });

  // ============================================================
  // SECTION D & E: PRICING & ESTIMATE INTEGRITY (SEC-PRICE)
  // ============================================================
  describe('D & E. Pricing & Estimate Integrity (SEC-PRICE)', () => {
    it('SEC-PRICE-001: Client cannot inject arbitrary material prices or labor rates into estimates', async () => {
      const res = await api('/estimates', {
        method: 'POST',
        token: customerAToken,
        body: {
          deckId: customerADeck._id,
          estimateName: 'Tampered Price Test',
          materialIds: [sampleMaterial._id],
          serviceIds: [sampleService._id],
          materialCost: 0.01,
          laborRate: 1.00,
          totalAmount: 5.00,
          subtotal: 5.00,
        },
      });

      // Strict Joi validation schema rejects client-injected pricing fields with 400 Bad Request
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.error.message.includes('is not allowed') || res.body.error.details.some((d) => d.message.includes('not allowed')));
    });

    it('SEC-PRICE-002: Catalog price changes do not rewrite existing estimate snapshot', async () => {
      const createRes = await api('/estimates', {
        method: 'POST',
        token: customerAToken,
        body: {
          deckId: customerADeck._id,
          estimateName: 'Snapshot Preservation Test',
          materialIds: [sampleMaterial._id],
        },
      });
      assert.equal(createRes.status, 201);
      const originalTotal = createRes.body.data.estimate.totalAmount;
      const estimateId = createRes.body.data.estimate._id || createRes.body.data.estimate.id;

      // Update material price in catalog
      sampleMaterial.cost.unitCost = 999.99;
      await sampleMaterial.save();

      const fetchRes = await api(`/estimates/${estimateId}`, { token: customerAToken });
      assert.equal(fetchRes.status, 200);
      assert.equal(fetchRes.body.data.estimate.totalAmount, originalTotal, 'Historical snapshot must remain identical');

      // Restore
      sampleMaterial.cost.unitCost = 45.50;
      await sampleMaterial.save();
    });

    it('SEC-PRICE-003: Rejects negative deck dimensions or negative area', async () => {
      const res = await api('/decks', {
        method: 'POST',
        token: customerAToken,
        body: {
          projectName: 'Negative Dimensions Deck',
          deckShape: 'rectangle',
          dimensions: { length: -20, width: 10 },
        },
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });

  // ============================================================
  // SECTION F: AI CONDITION ANALYSIS RESILIENCE (SEC-AI)
  // ============================================================
  describe('F. AI Condition Analysis Resilience (SEC-AI)', () => {
    it('SEC-AI-001: AI service offline/unreachable handles error without crashing', async () => {
      // 1. Upload genuine photo to disk storage
      const formData = new FormData();
      formData.append(
        'images',
        new Blob([jpegHeader], { type: 'image/jpeg' }),
        'deck_wood_ai.jpg'
      );
      const uploadRes = await api(`/decks/${customerADeck._id}/images`, {
        method: 'POST',
        token: customerAToken,
        isFormData: true,
        body: formData,
      });
      assert.equal(uploadRes.status, 201);
      const imageId = uploadRes.body.data.images[0].id || uploadRes.body.data.images[0]._id;

      // 2. Request condition analysis (ML service is offline on port 8000 in test)
      const res = await api(`/condition-analyses/decks/${customerADeck._id}/analyses`, {
        method: 'POST',
        token: customerAToken,
        body: { imageId },
      });

      // Application should handle failure gracefully without crashing
      assert.ok([200, 201, 500, 502, 503].includes(res.status));
      if ([200, 201].includes(res.status)) {
        assert.equal(res.body.data.analysisStatus, 'FAILED');
      }

      // Deck must remain intact
      const deck = await Deck.findById(customerADeck._id);
      assert.ok(deck);
      assert.equal(deck.ownerId.toString(), customerAUser._id.toString());
    });
  });

  // ============================================================
  // SECTION G & H: FINANCIAL INTEGRITY & CONCURRENCY (SEC-FIN)
  // ============================================================
  describe('G & H. Financial Integrity & Commission Concurrency (SEC-FIN)', () => {
    let testPolicy, testLead, testCommission;

    before(async () => {
      testPolicy = await CommissionPolicy.create({
        name: 'Standard Lead Conversion Policy',
        code: `POL-${Date.now()}`,
        commissionType: 'percentage',
        commissionValue: 10,
        status: 'active',
        createdBy: adminUser._id,
      });

      testLead = await Lead.create({
        leadNumber: `LEAD-${Date.now()}`,
        customerId: customerAUser._id,
        deckId: customerADeck._id,
        assignedContractorId: contractorAUser._id,
        assignedContractorProfileId: contractorAProfile._id,
        status: LEAD_STATUS.CONVERTED,
        convertedAt: new Date(),
        deckSnapshot: { projectName: "Alice's Deck", deckAreaSqFt: 300 },
        customerSnapshot: { name: 'Alice Customer', email: 'alice@test.com' },
        estimateSnapshot: { totalAmount: 5000, currency: 'USD' },
        enquiry: { subject: 'Conversion Complete', message: 'Lead converted successfully' },
      });

      // 3. Generate commission via API
      const genRes = await api('/commissions/admin/generate', {
        method: 'POST',
        token: adminToken,
        body: {
          leadId: testLead._id,
          commissionPolicyId: testPolicy._id,
          conversionReference: 'CONV-TEST-001',
        },
      });
      assert.equal(genRes.status, 201);
      testCommission = genRes.body.data.commission;

      // 4. Advance commission to payable
      await api(`/commissions/admin/${testCommission.id}/review`, {
        method: 'POST',
        token: adminToken,
        body: { action: 'APPROVE' },
      });
      await api(`/commissions/admin/${testCommission.id}/review`, {
        method: 'POST',
        token: adminToken,
        body: { action: 'MARK_PAYABLE' },
      });
    });

    it('SEC-FIN-001 [Hardened]: Atomic conditional payment prevents duplicate concurrent payments', async () => {
      const commId = testCommission.id || testCommission._id;
      const [res1, res2] = await Promise.all([
        api(`/commissions/admin/${commId}/record-payment`, {
          method: 'POST',
          token: adminToken,
          body: {
            paymentReference: `PAY-CONC-1-${Date.now()}`,
            paymentMethod: 'bank_transfer',
            amount: testCommission.calculatedAmount,
          },
        }),
        api(`/commissions/admin/${commId}/record-payment`, {
          method: 'POST',
          token: adminToken,
          body: {
            paymentReference: `PAY-CONC-2-${Date.now()}`,
            paymentMethod: 'bank_transfer',
            amount: testCommission.calculatedAmount,
          },
        }),
      ]);

      const statuses = [res1.status, res2.status].sort();
      // Exactly one succeeds with 200, the other fails with 400 (Cannot record payment for commission with status "paid")
      assert.deepEqual(statuses, [200, 400]);

      // Verify only 1 payment record was created
      const paymentCount = await CommissionPaymentRecord.countDocuments({ commissionId: commId });
      assert.equal(paymentCount, 1);
    });

    it('SEC-FIN-002: Contractor cannot approve own commission (403 Forbidden)', async () => {
      const commId = testCommission.id || testCommission._id;
      const res = await api(`/commissions/admin/${commId}/review`, {
        method: 'POST',
        token: contractorAToken,
        body: { action: 'APPROVE' },
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });

    it('SEC-FIN-003: Rejects commission generation for unconverted lead (400 Bad Request)', async () => {
      const unconvertedLead = await Lead.create({
        leadNumber: `LEAD-UNCONV-${Date.now()}`,
        customerId: customerAUser._id,
        deckId: customerADeck._id,
        assignedContractorId: contractorAUser._id,
        status: LEAD_STATUS.ASSIGNED,
        deckSnapshot: { projectName: "Alice's Deck", deckAreaSqFt: 300 },
        customerSnapshot: { name: 'Alice Customer', email: 'alice@test.com' },
        enquiry: { subject: 'Pending Followup', message: 'Not converted yet' },
      });

      const res = await api('/commissions/admin/generate', {
        method: 'POST',
        token: adminToken,
        body: {
          leadId: unconvertedLead._id,
          commissionPolicyId: testPolicy._id,
        },
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.error.message.includes('must be CONVERTED'));
    });
  });

  // ============================================================
  // SECTION I: ADMIN DASHBOARD & PLATFORM MANAGEMENT (SEC-ADM)
  // ============================================================
  describe('I. Admin Security & Platform Settings (SEC-ADM)', () => {
    it('SEC-ADM-001: Public settings endpoint never leaks private/sensitive keys', async () => {
      await PlatformSetting.create({
        key: 'STRIPE_SECRET_KEY',
        value: 'sk_live_very_secret_api_key',
        isPublic: false,
        category: 'SECURITY',
        label: 'Stripe Secret Key',
        updatedBy: adminUser._id,
      });

      const res = await api('/settings/public');
      assert.equal(res.status, 200);
      const keys = Object.keys(res.body.data || {});
      assert.ok(!keys.includes('STRIPE_SECRET_KEY'), 'Private setting must not leak in public endpoint');
      assert.ok(!keys.includes('JWT_SECRET'));
    });

    it('SEC-ADM-002: Last-Admin concurrency protection prevents deactivating the only Admin', async () => {
      // 1. Attempt to self-deactivate (forbidden)
      const resSelf = await api(`/admin/users/${adminUser._id}/status`, {
        method: 'PATCH',
        token: adminToken,
        body: { accountStatus: 'disabled' },
      });
      assert.equal(resSelf.status, 400);
      assert.ok(resSelf.body.error.message.includes('Administrators cannot modify their own'));

      // 2. Create a second admin to test mutex concurrency on remaining admin
      const secondAdmin = await User.create({
        fullName: 'Second Administrator',
        email: 'admin2.phase11@test.com',
        passwordHash: await User.hashPassword('ValidP@ssw0rd123!'),
        role: ROLES.ADMIN,
        accountStatus: ACCOUNT_STATUS.ACTIVE,
      });
      const secondAdminToken = jwt.sign(
        { id: secondAdmin._id.toString(), role: ROLES.ADMIN, email: secondAdmin.email },
        env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      // Admin 1 deactivates Admin 2 (reducing count from 2 to 1)
      const deactRes = await api(`/admin/users/${secondAdmin._id}/status`, {
        method: 'PATCH',
        token: adminToken,
        body: { accountStatus: 'disabled' },
      });
      assert.equal(deactRes.status, 200);

      // Now only 1 admin remains active. Deactivated Admin 2 attempting to deactivate Admin 1 is rejected by revoked session (403)
      const blockedRes = await api(`/admin/users/${adminUser._id}/status`, {
        method: 'PATCH',
        token: secondAdminToken,
        body: { accountStatus: 'disabled' },
      });
      assert.equal(blockedRes.status, 403);
      assert.equal(blockedRes.body.error.code, 'ACCOUNT_DISABLED');

      // Verify at least one active admin remains in the database at all times
      const activeAdminCount = await User.countDocuments({
        role: ROLES.ADMIN,
        accountStatus: ACCOUNT_STATUS.ACTIVE,
      });
      assert.ok(activeAdminCount >= 1, 'Platform must always preserve at least one active administrator');

      // Clean up second admin
      await User.findByIdAndDelete(secondAdmin._id);
    });
  });

  // ============================================================
  // SECTION J & K: APPLICATION SECURITY REVIEWS (SEC-APP)
  // ============================================================
  describe('J & K. API & Application Security Tests (SEC-APP)', () => {
    it('SEC-APP-001: NoSQL injection attempt in auth payload handled safely', async () => {
      const res = await api('/auth/login', {
        method: 'POST',
        body: {
          email: { $ne: null },
          password: { $gt: '' },
        },
      });
      assert.ok([400, 401].includes(res.status));
      assert.equal(res.body.success, false);
    });

    it('SEC-APP-002: Mass assignment protection - unexpected internal fields are rejected by schema validator', async () => {
      const res = await api('/decks', {
        method: 'POST',
        token: customerAToken,
        body: {
          projectName: 'Mass Assignment Deck',
          deckShape: 'rectangle',
          dimensions: { length: 15, width: 10 },
          ownerId: customerBUser._id,
        },
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.error.details.some((d) => d.field === 'ownerId'));
    });

    it('SEC-APP-003: Security headers (Helmet) enforced on HTTP responses', async () => {
      const res = await api('/health');
      assert.equal(res.status, 200);
      const nosniff = res.headers.get('x-content-type-options');
      assert.equal(nosniff, 'nosniff');
    });

    it('SEC-APP-004: CORS configuration permits approved headers', async () => {
      const url = `${baseUrl}/health`;
      const res = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'GET',
        },
      });
      assert.ok([200, 204].includes(res.status));
    });

    it('SEC-APP-005: Auth cookie security configuration flags (HttpOnly, SameSite)', async () => {
      const res = await api('/auth/login', {
        method: 'POST',
        body: {
          email: 'customer.a@test.com',
          password: 'ValidP@ssw0rd123!',
        },
      });
      assert.equal(res.status, 200);
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        assert.ok(setCookie.includes('HttpOnly'));
        assert.ok(setCookie.includes('SameSite'));
      }
    });

    it('SEC-APP-006: Server errors do not expose internal stack traces or connection strings', async () => {
      const res = await api('/decks/invalid-object-id-format', { token: customerAToken });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(!JSON.stringify(res.body).includes('mongodb+srv://'));
    });

    it('SEC-APP-007: Audit logs cannot be tampered with or modified via API', async () => {
      const log = await AuditLog.create({
        performedBy: adminUser._id,
        action: 'SECURITY_TEST',
        entityType: 'PLATFORM_SETTING',
        entityId: new mongoose.Types.ObjectId(),
        status: 'SUCCESS',
      });

      const resDelete = await api(`/admin/audit-logs/${log._id}`, {
        method: 'DELETE',
        token: customerAToken,
      });
      assert.ok([403, 404].includes(resDelete.status));

      const resAdminDelete = await api(`/admin/audit-logs/${log._id}`, {
        method: 'DELETE',
        token: adminToken,
      });
      assert.ok([404, 405].includes(resAdminDelete.status));
    });
  });

  // ============================================================
  // SECTION L: CROSS-MODULE END-TO-END WORKFLOWS (INT-E2E)
  // ============================================================
  describe('L. Cross-Module End-to-End Workflows (INT-E2E)', () => {
    it('INT-E2E-001: Customer Journey: Register -> Deck -> Upload Photo -> Estimate -> Enquiry (Lead)', async () => {
      // 1. Customer registration
      const regRes = await api('/auth/register', {
        method: 'POST',
        body: {
          fullName: 'Grace Hopper',
          email: `grace.${Date.now()}@test.com`,
          password: 'SecureP@ssw0rd999!',
          role: ROLES.CUSTOMER,
        },
      });
      assert.equal(regRes.status, 201);
      const graceToken = regRes.body.data.token;

      // 2. Create Deck
      const deckRes = await api('/decks', {
        method: 'POST',
        token: graceToken,
        body: {
          projectName: "Grace's Custom Deck",
          deckShape: 'rectangle',
          dimensions: { length: 18, width: 12 },
          surfaceDetails: { material: 'wood' },
        },
      });
      assert.equal(deckRes.status, 201);
      const graceDeckId = deckRes.body.data.deck._id || deckRes.body.data.deck.id;

      // 3. Upload Photo
      const formData = new FormData();
      formData.append(
        'images',
        new Blob([jpegHeader], { type: 'image/jpeg' }),
        'deck_grace_main.jpg'
      );
      const uploadRes = await api(`/decks/${graceDeckId}/images`, {
        method: 'POST',
        token: graceToken,
        isFormData: true,
        body: formData,
      });
      assert.equal(uploadRes.status, 201);

      // 4. Create Estimate
      const estRes = await api('/estimates', {
        method: 'POST',
        token: graceToken,
        body: {
          deckId: graceDeckId,
          estimateName: "Grace's First Estimate",
          materialIds: [sampleMaterial._id],
          serviceIds: [sampleService._id],
        },
      });
      assert.equal(estRes.status, 201);
      const graceEstId = estRes.body.data.estimate._id || estRes.body.data.estimate.id;

      // 5. Submit Customer Enquiry (creates a Lead)
      const leadRes = await api('/leads', {
        method: 'POST',
        token: graceToken,
        body: {
          deckId: graceDeckId,
          estimateId: graceEstId,
          enquiry: {
            subject: 'Spring Deck Build',
            message: 'Looking for a certified contractor to build this spring.',
            preferredContactMethod: 'email',
          },
        },
      });
      assert.equal(leadRes.status, 201);
      assert.ok(leadRes.body.data.leadNumber);
      assert.equal(leadRes.body.data.status, LEAD_STATUS.NEW);
    });

    it('INT-E2E-002: Lead & Commission Lifecycle: Assign -> Accept -> Convert -> Commission -> Approve -> Pay', async () => {
      // 1. Create a lead
      const lead = await Lead.create({
        leadNumber: `LEAD-E2E-${Date.now()}`,
        customerId: customerAUser._id,
        deckId: customerADeck._id,
        status: LEAD_STATUS.NEW,
        deckSnapshot: { projectName: "Alice's Deck", deckAreaSqFt: 300 },
        customerSnapshot: { name: 'Alice Customer', email: 'alice@test.com' },
        estimateSnapshot: { totalAmount: 4000, currency: 'USD' },
        enquiry: { subject: 'Ready to build', message: 'Please assign contractor' },
      });

      // 2. Admin assigns contractor
      const assignRes = await api(`/leads/admin/${lead._id}/assign`, {
        method: 'POST',
        token: adminToken,
        body: {
          contractorId: contractorAUser._id,
          assignmentReason: 'Top rated contractor in region',
        },
      });
      assert.equal(assignRes.status, 200);

      // 3. Contractor accepts lead
      const acceptRes = await api(`/leads/contractor/${lead._id}/accept`, {
        method: 'POST',
        token: contractorAToken,
        body: {
          notes: 'Accepted by contractor',
        },
      });
      assert.equal(acceptRes.status, 200);

      // 4. Mark lead as CONVERTED
      const convertRes = await api(`/leads/contractor/${lead._id}/status`, {
        method: 'PATCH',
        token: contractorAToken,
        body: {
          status: 'converted',
          notes: 'Contract signed.',
        },
      });
      assert.equal(convertRes.status, 200);
      assert.equal(convertRes.body.data.status, LEAD_STATUS.CONVERTED);

      // 5. Admin generates commission for lead
      const activePolicy = await CommissionPolicy.findOne({ status: 'active' });
      const commGenRes = await api('/commissions/admin/generate', {
        method: 'POST',
        token: adminToken,
        body: {
          leadId: lead._id,
          commissionPolicyId: activePolicy._id,
        },
      });
      assert.equal(commGenRes.status, 201);
      const commissionId = commGenRes.body.data.commission.id;

      // 6. Admin approves commission
      const reviewRes = await api(`/commissions/admin/${commissionId}/review`, {
        method: 'POST',
        token: adminToken,
        body: { action: 'APPROVE', notes: 'Approved for payout' },
      });
      assert.equal(reviewRes.status, 200);

      // 7. Admin marks PAYABLE
      const payableRes = await api(`/commissions/admin/${commissionId}/review`, {
        method: 'POST',
        token: adminToken,
        body: { action: 'MARK_PAYABLE' },
      });
      assert.equal(payableRes.status, 200);

      // 8. Admin records payment
      const payRes = await api(`/commissions/admin/${commissionId}/record-payment`, {
        method: 'POST',
        token: adminToken,
        body: {
          paymentReference: `E2E-PAY-${Date.now()}`,
          paymentMethod: 'ach',
          amount: commGenRes.body.data.commission.calculatedAmount,
        },
      });
      assert.equal(payRes.status, 200);
      assert.equal(payRes.body.data.commission.status, COMMISSION_STATUS.PAID);
    });
  });
});
