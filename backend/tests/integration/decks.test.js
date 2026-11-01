// =============================================
// Deck Estimator — Decks & Secure File Uploads Tests (Phase 4)
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
const { ROLES, VERIFICATION_STATUS } = require('../../src/shared/constants');

describe('Phase 4 — Deck Input Management & Secure File Uploads', () => {
  let mongoServer;
  let server;
  let baseUrl;
  let customerAToken;
  let customerAId;
  let customerBToken;
  let customerBId;
  let pendingContractorToken;
  let approvedContractorToken;
  let adminToken;
  let customerADeckId;
  let uploadedImageId;

  // Minimal genuine headers for test image buffers
  const jpegHeader = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  ]);
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);
  const webpHeader = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  ]);
  const fakeExecutableHeader = Buffer.from([
    0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00,
  ]);

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

    // 1. Setup Customer A
    const resA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Customer Alice',
        email: 'alice.deck@deckestimator.com',
        password: 'Password123!',
        role: ROLES.CUSTOMER,
      }),
    });
    const dataA = await resA.json();
    customerAToken = dataA.data.token;
    customerAId = dataA.data.user.id;

    // 2. Setup Customer B (for isolation tests)
    const resB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Customer Bob',
        email: 'bob.deck@deckestimator.com',
        password: 'Password123!',
        role: ROLES.CUSTOMER,
      }),
    });
    const dataB = await resB.json();
    customerBToken = dataB.data.token;
    customerBId = dataB.data.user.id;

    // 3. Setup Pending Contractor
    const resC1 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Charlie Pending',
        email: 'charlie.pending@deckestimator.com',
        password: 'Password123!',
        role: ROLES.CONTRACTOR,
        phone: '123-456-7890',
        businessName: 'Charlie Decks Co',
        licenseNumber: 'LIC-PENDING-001',
        licenseJurisdiction: 'IL',
      }),
    });
    const dataC1 = await resC1.json();
    pendingContractorToken = dataC1.data.token;

    // 4. Setup Approved Contractor
    const resC2 = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Dave Approved',
        email: 'dave.approved@deckestimator.com',
        password: 'Password123!',
        role: ROLES.CONTRACTOR,
        phone: '987-654-3210',
        businessName: 'Dave Master Decks',
        licenseNumber: 'LIC-APPROVED-002',
        licenseJurisdiction: 'IL',
      }),
    });
    const dataC2 = await resC2.json();
    approvedContractorToken = dataC2.data.token;
    await ContractorProfile.findOneAndUpdate(
      { userId: dataC2.data.user.id },
      { verificationStatus: VERIFICATION_STATUS.APPROVED }
    );

    // 5. Setup Admin
    const adminUser = await User.create({
      fullName: 'Super Admin',
      email: 'admin.deck@deckestimator.com',
      passwordHash: 'dummy',
      role: ROLES.ADMIN,
      isEmailVerified: true,
    });
    const jwt = require('jsonwebtoken');
    const { env } = require('../../src/config/env');
    adminToken = jwt.sign(
      { id: adminUser._id.toString(), role: ROLES.ADMIN, email: adminUser.email },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  // ----------------------------------------------------
  // DECK CREATION & INPUT VALIDATION
  // ----------------------------------------------------

  it('1. POST /decks - Customer creates rectangle deck with auto-calculated area', async () => {
    const res = await fetch(`${baseUrl}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        projectName: 'Alice Backyard Oasis',
        projectDescription: 'Full renovation of backyard cedar deck',
        propertyAddress: {
          street: '123 Maple Street',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'USA',
        },
        measurementUnit: 'ft',
        dimensions: {
          length: 20,
          width: 15,
        },
        deckShape: 'rectangle',
        structureDetails: {
          levels: 1,
          isAttached: true,
          hasRailings: true,
          railingLength: 50,
          hasStairs: true,
          stairStepCount: 4,
          builtInFeatures: ['bench', 'pergola'],
        },
        surfaceDetails: {
          material: 'wood',
          coatingStatus: 'stained',
          previousTreatment: 'Semi-transparent oil stain 3 years ago',
        },
        visibleConditions: ['surface_wear', 'peeling_coating'],
        completionStatus: 'draft',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.deck.projectName, 'Alice Backyard Oasis');
    // Dimensions automatically calculated: 20 * 15 = 300
    assert.equal(data.data.deck.dimensions.area, 300);
    assert.equal(data.data.deck.dimensions.isManualArea, false);
    assert.equal(data.data.deck.ownerId, customerAId);

    customerADeckId = data.data.deck.id;
  });

  it('2. POST /decks - Rejects missing required projectName with 400', async () => {
    const res = await fetch(`${baseUrl}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        deckShape: 'rectangle',
        dimensions: { length: 10, width: 10 },
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'VALIDATION_ERROR');
  });

  it('3. POST /decks - Rejects negative or zero dimensions with 400', async () => {
    const res = await fetch(`${baseUrl}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        projectName: 'Negative Deck',
        dimensions: { length: -10, width: 20 },
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  it('4. POST /decks - Supports custom shape with manual area', async () => {
    const res = await fetch(`${baseUrl}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        projectName: 'Curved Pool Deck',
        deckShape: 'custom',
        dimensions: {
          area: 450.5,
          isManualArea: true,
        },
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.data.deck.deckShape, 'custom');
    assert.equal(data.data.deck.dimensions.area, 450.5);
    assert.equal(data.data.deck.dimensions.isManualArea, true);
  });

  // ----------------------------------------------------
  // DECK READ & PAGINATION
  // ----------------------------------------------------

  it('5. GET /decks - Customer lists only their own decks', async () => {
    const res = await fetch(`${baseUrl}/decks`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.decks.length, 2);
    assert.equal(data.data.pagination.total, 2);
    assert.ok(data.data.decks.every((d) => d.ownerId === customerAId));
  });

  it('6. GET /decks/:deckId - Retrieve deck details by ID', async () => {
    const res = await fetch(`${baseUrl}/decks/${customerADeckId}`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.data.deck.id, customerADeckId);
    assert.ok(Array.isArray(data.data.deck.images));
  });

  // ----------------------------------------------------
  // DECK UPDATE
  // ----------------------------------------------------

  it('7. PATCH /decks/:deckId - Owner updates dimensions and recalculates area', async () => {
    const res = await fetch(`${baseUrl}/decks/${customerADeckId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        dimensions: { length: 25, width: 15 },
        additionalNotes: 'Updated length from 20 to 25 ft',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    // 25 * 15 = 375
    assert.equal(data.data.deck.dimensions.area, 375);
    assert.equal(data.data.deck.additionalNotes, 'Updated length from 20 to 25 ft');
  });

  // ----------------------------------------------------
  // SECURE FILE UPLOADS & IMAGES MANAGEMENT
  // ----------------------------------------------------

  it('8. POST /decks/:deckId/images - Successfully upload genuine JPEG, PNG, and WebP photos', async () => {
    const formData = new FormData();
    formData.append(
      'images',
      new Blob([jpegHeader], { type: 'image/jpeg' }),
      'backyard_1.jpg'
    );
    formData.append(
      'images',
      new Blob([pngHeader], { type: 'image/png' }),
      'stairs_angle.png'
    );
    formData.append(
      'images',
      new Blob([webpHeader], { type: 'image/webp' }),
      'surface_wear.webp'
    );
    formData.append('description', 'High resolution survey photos');

    const res = await fetch(`${baseUrl}/decks/${customerADeckId}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: formData,
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.images.length, 3);
    assert.equal(data.data.images[0].originalFilename, 'backyard_1.jpg');
    assert.equal(data.data.images[0].mimeType, 'image/jpeg');
    assert.equal(data.data.images[1].mimeType, 'image/png');
    assert.equal(data.data.images[2].mimeType, 'image/webp');

    uploadedImageId = data.data.images[0].id;
  });

  it('9. POST /decks/:deckId/images - Rejects disguised non-image files with fake signatures', async () => {
    const formData = new FormData();
    // Executable masquerading as .jpg
    formData.append(
      'images',
      new Blob([fakeExecutableHeader], { type: 'image/jpeg' }),
      'malware.jpg'
    );

    const res = await fetch(`${baseUrl}/decks/${customerADeckId}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: formData,
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
  });

  it('10. GET /decks/:deckId/images - Retrieve all image metadata for deck', async () => {
    const res = await fetch(`${baseUrl}/decks/${customerADeckId}/images`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.data.images.length, 3);
  });

  it('11. GET /decks/:deckId/images/:imageId - Stream authenticated image binary with headers', async () => {
    const res = await fetch(
      `${baseUrl}/decks/${customerADeckId}/images/${uploadedImageId}`,
      {
        headers: { Authorization: `Bearer ${customerAToken}` },
      }
    );

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/jpeg');
    const buffer = await res.arrayBuffer();
    assert.ok(buffer.byteLength > 0);
  });

  it('12. POST /decks/:deckId/images - Enforces max quota limit of 10 images per deck', async () => {
    // Current count: 3. Attempting to add 8 more (total 11 > 10) must be rejected
    const formData = new FormData();
    for (let i = 0; i < 8; i++) {
      formData.append(
        'images',
        new Blob([jpegHeader], { type: 'image/jpeg' }),
        `photo_${i}.jpg`
      );
    }

    const res = await fetch(`${baseUrl}/decks/${customerADeckId}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: formData,
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
    assert.ok(data.error.message.includes('Maximum limit of 10 images exceeded'));
  });

  it('13. DELETE /decks/:deckId/images/:imageId - Delete specific photo', async () => {
    const res = await fetch(
      `${baseUrl}/decks/${customerADeckId}/images/${uploadedImageId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${customerAToken}` },
      }
    );

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);

    // Verify deletion in database
    const imgInDb = await DeckImage.findById(uploadedImageId);
    assert.equal(imgInDb, null);
  });

  // ----------------------------------------------------
  // HORIZONTAL ISOLATION & PRIVILEGE ESCALATION PREVENTION
  // ----------------------------------------------------

  it('14. Isolation: Customer B cannot view Customer A deck (returns 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/decks/${customerADeckId}`, {
      headers: { Authorization: `Bearer ${customerBToken}` },
    });

    const data = await res.json();
    assert.equal(res.status, 403);
    assert.equal(data.success, false);
  });

  it('15. Isolation: Customer B cannot update Customer A deck (returns 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/decks/${customerADeckId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerBToken}`,
      },
      body: JSON.stringify({ projectName: 'Hacked Project Name' }),
    });

    const data = await res.json();
    assert.equal(res.status, 403);
    assert.equal(data.success, false);
  });

  it('16. Isolation: Customer B cannot upload photos to Customer A deck (returns 403 Forbidden)', async () => {
    const formData = new FormData();
    formData.append(
      'images',
      new Blob([jpegHeader], { type: 'image/jpeg' }),
      'rogue.jpg'
    );

    const res = await fetch(`${baseUrl}/decks/${customerADeckId}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerBToken}` },
      body: formData,
    });

    const data = await res.json();
    assert.equal(res.status, 403);
    assert.equal(data.success, false);
  });

  it('17. Isolation: Customer B cannot delete Customer A deck (returns 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/decks/${customerADeckId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerBToken}` },
    });

    const data = await res.json();
    assert.equal(res.status, 403);
    assert.equal(data.success, false);
  });

  // ----------------------------------------------------
  // CONTRACTOR APPROVAL RESTRICTIONS
  // ----------------------------------------------------

  it('18. Contractor: Pending contractor is rejected from deck operations with 403 CONTRACTOR_NOT_VERIFIED', async () => {
    const res = await fetch(`${baseUrl}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pendingContractorToken}`,
      },
      body: JSON.stringify({
        projectName: 'Unverified Contractor Deck',
        dimensions: { length: 15, width: 10 },
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 403);
    assert.equal(data.error.code, 'CONTRACTOR_NOT_VERIFIED');
  });

  it('19. Contractor: Approved contractor can successfully create and manage decks', async () => {
    const res = await fetch(`${baseUrl}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${approvedContractorToken}`,
      },
      body: JSON.stringify({
        projectName: 'Commercial Boardwalk Renovation',
        dimensions: { length: 40, width: 20 },
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.deck.projectName, 'Commercial Boardwalk Renovation');
    assert.equal(data.data.deck.dimensions.area, 800);
  });

  // ----------------------------------------------------
  // DECK DELETION & CASCADE CLEANUP
  // ----------------------------------------------------

  it('20. DELETE /decks/:deckId - Owner deletes deck and cascades cleanup of all remaining images', async () => {
    // Check images remain before delete
    const remainingBefore = await DeckImage.countDocuments({ deckId: customerADeckId });
    assert.ok(remainingBefore > 0);

    const res = await fetch(`${baseUrl}/decks/${customerADeckId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerAToken}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);

    // Verify deck is deleted
    const deckInDb = await Deck.findById(customerADeckId);
    assert.equal(deckInDb, null);

    // Verify cascaded image cleanup
    const remainingAfter = await DeckImage.countDocuments({ deckId: customerADeckId });
    assert.equal(remainingAfter, 0);
  });
});
