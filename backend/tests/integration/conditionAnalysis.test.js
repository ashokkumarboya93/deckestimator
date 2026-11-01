// =============================================
// Deck Estimator — AI Condition Analysis Tests (Phase 7)
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
const DeckImage = require('../../src/modules/files/deckImage.model');
const storageProvider = require('../../src/modules/files/storageProvider');
const ConditionAnalysis = require('../../src/modules/condition-analysis/conditionAnalysis.model');
const { mlClient } = require('../../src/modules/condition-analysis/mlClient');
const AuditLog = require('../../src/shared/models/auditLog.model');
const { ROLES, VERIFICATION_STATUS } = require('../../src/shared/constants');

describe('Phase 7 — AI-Based Deck Condition Analysis', () => {
  let mongoServer;
  let server;
  let baseUrl;

  let customerAToken;
  let customerAId;
  let customerBToken;
  let contractorToken;
  let contractorId;
  let pendingContractorToken;
  let adminToken;

  let deckAId;
  let deckNoPhotosId;
  let imageAId;
  let testAnalysisId;

  // Preserve original analyzeImage function for restoring later
  const originalAnalyzeImage = mlClient.analyzeImage;

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
        fullName: 'Alice Analysis',
        email: 'alice.ai@deckestimator.com',
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
        fullName: 'Bob Analysis',
        email: 'bob.ai@deckestimator.com',
        password: 'Password123!',
        role: ROLES.CUSTOMER,
        phone: '1234567890',
      }),
    });
    const dataB = await resB.json();
    customerBToken = dataB.data.token;

    // 3. Register & Approve Contractor
    const resC = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Charlie AI Pro',
        email: 'charlie.ai@contractor.com',
        password: 'Password123!',
        role: ROLES.CONTRACTOR,
        phone: '1234567890',
        businessName: 'Charlie Deck AI Restorations',
        licenseNumber: 'LIC-APP-007',
      }),
    });
    const dataC = await resC.json();
    contractorToken = dataC.data.token;
    contractorId = dataC.data.user.id;

    await ContractorProfile.findOneAndUpdate(
      { userId: contractorId },
      { verificationStatus: VERIFICATION_STATUS.APPROVED }
    );

    // 4. Register Unapproved Contractor
    const resP = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Pending Pete AI',
        email: 'pete.ai@contractor.com',
        password: 'Password123!',
        role: ROLES.CONTRACTOR,
        phone: '1234567890',
        businessName: 'Pete Unverified Decking',
        licenseNumber: 'LIC-PEND-008',
      }),
    });
    const dataP = await resP.json();
    pendingContractorToken = dataP.data.token;

    // 5. Create Admin
    const resAdmin = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'AI Administrator',
        email: 'admin.ai@deckestimator.com',
        password: 'Password123!',
        role: ROLES.CUSTOMER,
        phone: '1234567894',
      }),
    });
    const dataAdmin = await resAdmin.json();
    await User.findByIdAndUpdate(dataAdmin.data.user.id, { role: ROLES.ADMIN });

    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin.ai@deckestimator.com',
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    adminToken = loginData.data.token;

    // 6. Setup Decks for Customer A
    const deckA = await Deck.create({
      ownerId: customerAId,
      ownerType: 'CUSTOMER',
      projectName: 'Alice AI Inspection Deck',
      deckShape: 'rectangle',
      measurementUnit: 'ft',
      dimensions: { length: 20, width: 15, area: 300 },
      surfaceDetails: { material: 'wood', condition: 'good' },
      completionStatus: 'complete',
    });
    deckAId = deckA._id.toString();

    const deckNoPhotos = await Deck.create({
      ownerId: customerAId,
      ownerType: 'CUSTOMER',
      projectName: 'Empty Deck Without Photos',
      deckShape: 'rectangle',
      measurementUnit: 'ft',
      dimensions: { length: 15, width: 10, area: 150 },
      surfaceDetails: { material: 'composite' },
      completionStatus: 'complete',
    });
    deckNoPhotosId = deckNoPhotos._id.toString();

    // 7. Save a physical test image & create DeckImage record
    const saved = await storageProvider.saveFile(
      Buffer.from('fake image binary content for testing'),
      'alice-deck-photo.jpg',
      'image/jpeg'
    );

    const deckImg = await DeckImage.create({
      deckId: deckA._id,
      ownerId: customerAId,
      originalFilename: 'alice-deck-photo.jpg',
      storageKey: saved.storageKey,
      storageProvider: 'local',
      mimeType: 'image/jpeg',
      fileSize: 1024,
      imageDescription: 'Main floorboards showing peeling',
    });
    imageAId = deckImg._id.toString();
  });

  after(async () => {
    mlClient.analyzeImage = originalAnalyzeImage;
    if (server) await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  describe('ML Health Endpoint', () => {
    it('GET /api/v1/condition-analyses/ml-health returns health status', async () => {
      const res = await fetch(`${baseUrl}/condition-analyses/ml-health`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.status);
    });
  });

  describe('Analysis Creation & Validation', () => {
    it('Rejects analysis request when deck has no uploaded photographs (400 NO_IMAGES_AVAILABLE)', async () => {
      const res = await fetch(`${baseUrl}/decks/${deckNoPhotosId}/analyses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({}),
      });

      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.error?.code, 'NO_IMAGES_AVAILABLE');
    });

    it('Rejects Customer B trying to analyze Customer A deck (403 FORBIDDEN)', async () => {
      const res = await fetch(`${baseUrl}/decks/${deckAId}/analyses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerBToken}`,
        },
        body: JSON.stringify({}),
      });

      assert.equal(res.status, 403);
    });

    it('Rejects unapproved contractor from requesting condition analysis (403 CONTRACTOR_NOT_VERIFIED)', async () => {
      const res = await fetch(`${baseUrl}/decks/${deckAId}/analyses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pendingContractorToken}`,
        },
        body: JSON.stringify({}),
      });

      assert.equal(res.status, 403);
    });

    it('Customer A successfully requests AI condition analysis (COMPLETED status)', async () => {
      // Mock successful ML inference response matching spec §12.3
      mlClient.analyzeImage = async () => ({
        status: 'COMPLETED',
        imageQuality: {
          label: 'GOOD',
          confidence: 0.96,
          blurScore: 145.2,
          brightness: 128.4,
          resolution: '1920x1080',
        },
        condition: {
          level: 3,
          label: 'MODERATE_DETERIORATION',
          confidence: 0.88,
        },
        defects: [
          { label: 'PEELING_COATING', confidence: 0.93, detected: true },
          { label: 'FADING_DISCOLORATION', confidence: 0.82, detected: true },
          { label: 'CRACKS', confidence: 0.15, detected: false },
        ],
        manualReview: {
          required: false,
          reason: null,
        },
        model: {
          name: 'MobileNetV3-DeckCondition',
          version: '1.0.0',
          datasetVersion: 'pilot-v1',
        },
        limitations: [
          'Assessment is based only on visible image content.',
          'Structural safety cannot be determined from this photograph.',
        ],
      });

      const res = await fetch(`${baseUrl}/decks/${deckAId}/analyses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({
          imageId: imageAId,
          notes: 'Customer observed surface peeling after winter',
        }),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      const analysis = body.data.analysis;

      testAnalysisId = analysis.id || analysis._id;
      assert.equal(analysis.analysisStatus, 'COMPLETED');
      assert.equal(analysis.conditionLevel, 3);
      assert.equal(analysis.conditionLabel, 'MODERATE_DETERIORATION');
      assert.equal(analysis.imageQuality.label, 'GOOD');
      assert.equal(analysis.defects.length, 3);
      assert.equal(analysis.manualReview.required, false);
      assert.equal(analysis.model.name, 'MobileNetV3-DeckCondition');
    });

    it('Correctly handles UNABLE_TO_ASSESS when photo quality is poor (Spec §6.2)', async () => {
      mlClient.analyzeImage = async () => ({
        status: 'UNABLE_TO_ASSESS',
        imageQuality: {
          label: 'POOR',
          confidence: 0.95,
          blurScore: 22.1,
          brightness: 20.4,
          resolution: '320x240',
        },
        condition: null,
        defects: [],
        manualReview: {
          required: true,
          reason: 'Heavy optical blur and severe underexposure detected.',
        },
        model: {
          name: 'MobileNetV3-DeckCondition',
          version: '1.0.0',
        },
      });

      const res = await fetch(`${baseUrl}/decks/${deckAId}/analyses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({}),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      const analysis = body.data.analysis;

      assert.equal(analysis.analysisStatus, 'UNABLE_TO_ASSESS');
      assert.equal(analysis.conditionLevel, null);
      assert.equal(analysis.imageQuality.label, 'POOR');
      assert.equal(analysis.manualReview.required, true);
    });

    it('Correctly flags REQUIRES_MANUAL_REVIEW on Level 5 Wood Damage (Spec §4)', async () => {
      mlClient.analyzeImage = async () => ({
        status: 'REQUIRES_MANUAL_REVIEW',
        imageQuality: { label: 'GOOD', confidence: 0.94 },
        condition: {
          level: 5,
          label: 'SIGNIFICANT_WOOD_DAMAGE',
          confidence: 0.91,
        },
        defects: [
          { label: 'SPLINTERING', confidence: 0.89, detected: true },
          { label: 'VISIBLE_WOOD_DAMAGE', confidence: 0.95, detected: true },
        ],
        manualReview: {
          required: true,
          reason: 'Photographs exhibit potential significant visible wood damage. On-site inspection advised.',
        },
        model: { name: 'MobileNetV3-DeckCondition', version: '1.0.0' },
      });

      const res = await fetch(`${baseUrl}/decks/${deckAId}/analyses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({}),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      const analysis = body.data.analysis;

      assert.equal(analysis.analysisStatus, 'REQUIRES_MANUAL_REVIEW');
      assert.equal(analysis.conditionLevel, 5);
      assert.equal(analysis.manualReview.required, true);
    });
  });

  describe('Analysis Retrieval & Access Control', () => {
    it('Customer A can retrieve their deck analysis list', async () => {
      const res = await fetch(`${baseUrl}/decks/${deckAId}/analyses`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.ok(Array.isArray(body.data.analyses));
      assert.ok(body.data.analyses.length >= 3);
    });

    it('Customer A can retrieve specific analysis by ID', async () => {
      const res = await fetch(`${baseUrl}/condition-analyses/${testAnalysisId}`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.analysis.id || body.data.analysis._id, testAnalysisId);
    });

    it('Customer B cannot retrieve Customer A analysis (403 FORBIDDEN)', async () => {
      const res = await fetch(`${baseUrl}/condition-analyses/${testAnalysisId}`, {
        headers: { Authorization: `Bearer ${customerBToken}` },
      });
      assert.equal(res.status, 403);
    });

    it('Admin can view Customer A analysis for platform monitoring', async () => {
      const res = await fetch(`${baseUrl}/condition-analyses/${testAnalysisId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.analysis.id || body.data.analysis._id, testAnalysisId);
    });
  });

  describe('Retry & Manual Review Workflows', () => {
    it('Admin or Contractor can update manual review evaluation', async () => {
      const res = await fetch(`${baseUrl}/condition-analyses/${testAnalysisId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          reviewStatus: 'RESOLVED',
          reviewNotes: 'Verified on-site: moderate surface wear confirmed, joists sound.',
          conditionLevel: 3,
          conditionLabel: 'MODERATE_DETERIORATION',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.data.analysis.manualReview.reviewStatus, 'RESOLVED');
      assert.equal(body.data.analysis.manualReview.reviewNotes, 'Verified on-site: moderate surface wear confirmed, joists sound.');
    });

    it('Customer cannot override manual review evaluation (403 FORBIDDEN)', async () => {
      const res = await fetch(`${baseUrl}/condition-analyses/${testAnalysisId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerAToken}`,
        },
        body: JSON.stringify({
          reviewStatus: 'RESOLVED',
        }),
      });

      assert.equal(res.status, 403);
    });
  });

  describe('Audit Logging Verification', () => {
    it('Audit logs successfully recorded for condition analysis actions', async () => {
      const logs = await AuditLog.find({
        action: { $in: ['CREATE_CONDITION_ANALYSIS', 'UPDATE_ANALYSIS_REVIEW'] },
      });
      assert.ok(logs.length >= 2);
      const actions = logs.map((l) => l.action);
      assert.ok(actions.includes('CREATE_CONDITION_ANALYSIS'));
      assert.ok(actions.includes('UPDATE_ANALYSIS_REVIEW'));
    });
  });
});
