const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

const app = require('../../src/app');
const User = require('../../src/modules/users/users.model');
const ContractorProfile = require('../../src/modules/contractors/contractorProfile.model');
const DiscountPolicy = require('../../src/modules/discounts/discountPolicy.model');
const DiscountAssignment = require('../../src/modules/discounts/discountAssignment.model');
const discountService = require('../../src/modules/discounts/discount.service');
const Estimate = require('../../src/modules/estimates/estimate.model');
const Notification = require('../../src/modules/notifications/notification.model');
const {
  ROLES,
  ACCOUNT_STATUS,
  VERIFICATION_STATUS,
  DISCOUNT_POLICY_STATUS,
} = require('../../src/shared/constants');
const { generateToken: generateAccessToken } = require('../../src/modules/auth/auth.service');

describe('P0 Security & Correctness Regression Suite', () => {
  let mongoServer;
  let server;
  let baseUrl;
  let rootUrl;

  let adminUser;
  let adminToken;
  let customerA;
  let customerAToken;
  let customerB;
  let customerBToken;
  let blockedCustomer;
  let blockedCustomerToken;
  let inactiveCustomer;
  let inactiveCustomerToken;
  let blockedAdmin;
  let contractorA;
  let contractorAToken;
  let contractorB;
  let contractorBToken;

  const tempCatalogFile = path.join(__dirname, '../../uploads/catalog/p0-verify-test.txt');

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    fs.mkdirSync(path.dirname(tempCatalogFile), { recursive: true });
    fs.writeFileSync(tempCatalogFile, 'catalog-ok', 'utf8');

    const passwordHash = await bcrypt.hash('TestPass123!', 10);

    adminUser = await User.create({
      fullName: 'P0 Admin',
      email: 'p0admin@example.com',
      passwordHash,
      role: ROLES.ADMIN,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    });
    adminToken = generateAccessToken(adminUser);

    blockedAdmin = await User.create({
      fullName: 'P0 Blocked Admin',
      email: 'p0blockedadmin@example.com',
      passwordHash,
      role: ROLES.ADMIN,
      accountStatus: ACCOUNT_STATUS.BLOCKED,
    });

    customerA = await User.create({
      fullName: 'Customer A',
      email: 'p0custa@example.com',
      passwordHash,
      role: ROLES.CUSTOMER,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    });
    customerAToken = generateAccessToken(customerA);

    customerB = await User.create({
      fullName: 'Customer B',
      email: 'p0custb@example.com',
      passwordHash,
      role: ROLES.CUSTOMER,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    });
    customerBToken = generateAccessToken(customerB);

    blockedCustomer = await User.create({
      fullName: 'Blocked Customer',
      email: 'p0blocked@example.com',
      passwordHash,
      role: ROLES.CUSTOMER,
      accountStatus: ACCOUNT_STATUS.BLOCKED,
    });
    blockedCustomerToken = generateAccessToken(blockedCustomer);

    inactiveCustomer = await User.create({
      fullName: 'Inactive Customer',
      email: 'p0inactive@example.com',
      passwordHash,
      role: ROLES.CUSTOMER,
      accountStatus: ACCOUNT_STATUS.INACTIVE,
    });
    inactiveCustomerToken = generateAccessToken(inactiveCustomer);

    contractorA = await User.create({
      fullName: 'Contractor A',
      email: 'p0contra@example.com',
      passwordHash,
      role: ROLES.CONTRACTOR,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    });
    await ContractorProfile.create({
      userId: contractorA._id,
      businessName: 'Alpha Decks LLC',
      licenseNumber: 'LIC-P0-ALPHA',
      verificationStatus: VERIFICATION_STATUS.APPROVED,
    });
    contractorAToken = generateAccessToken(contractorA);

    contractorB = await User.create({
      fullName: 'Contractor B',
      email: 'p0contrb@example.com',
      passwordHash,
      role: ROLES.CONTRACTOR,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
    });
    await ContractorProfile.create({
      userId: contractorB._id,
      businessName: 'Beta Decks LLC',
      licenseNumber: 'LIC-P0-BETA',
      verificationStatus: VERIFICATION_STATUS.APPROVED,
    });
    contractorBToken = generateAccessToken(contractorB);

    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, () => {
        const { port } = server.address();
        rootUrl = `http://localhost:${port}`;
        baseUrl = `${rootUrl}/api/v1`;
        resolve();
      });
    });
  });

  after(async () => {
    try {
      if (fs.existsSync(tempCatalogFile)) fs.unlinkSync(tempCatalogFile);
    } catch {
      // ignore cleanup error
    }
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  it('1. Authentication & Account Status policy checks', async () => {
    const inactiveLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'p0inactive@example.com', password: 'TestPass123!' }),
    });
    assert.equal(inactiveLogin.status, 403);

    const inactiveMe = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${inactiveCustomerToken}` },
    });
    assert.equal(inactiveMe.status, 403);

    const blockedAdminLogin = await fetch(`${baseUrl}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: blockedAdmin.email, password: 'TestPass123!' }),
    });
    assert.equal(blockedAdminLogin.status, 403);

    const blockedLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'p0blocked@example.com', password: 'TestPass123!' }),
    });
    assert.equal(blockedLogin.status, 200);

    const blockedMe = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${blockedCustomerToken}` },
    });
    assert.equal(blockedMe.status, 200);

    const blockedAppealStatus = await fetch(`${baseUrl}/users/unblock-request/status`, {
      headers: { Authorization: `Bearer ${blockedCustomerToken}` },
    });
    assert.equal(blockedAppealStatus.status, 200);

    const blockedEstimates = await fetch(`${baseUrl}/estimates`, {
      headers: { Authorization: `Bearer ${blockedCustomerToken}` },
    });
    assert.equal(blockedEstimates.status, 403);
    const blockedEstimatesJson = await blockedEstimates.json();
    assert.equal(blockedEstimatesJson.error?.code, 'ACCOUNT_BLOCKED');
  });

  it('2. Joi validation rejects malformed payloads on normalized schemas', async () => {
    const invalidLead = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({ subject: 'ab', message: 'short' }),
    });
    assert.equal(invalidLead.status, 400);
    const invalidLeadJson = await invalidLead.json();
    assert.equal(invalidLeadJson.error?.code, 'VALIDATION_ERROR');

    const invalidDiscount = await fetch(`${baseUrl}/discounts/admin/policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: 'X' }),
    });
    assert.equal(invalidDiscount.status, 400);
    const invalidDiscountJson = await invalidDiscount.json();
    assert.equal(invalidDiscountJson.error?.code, 'VALIDATION_ERROR');
  });

  it('3. Discount eligibility isolates non-general policies and respects effectiveEndDate', async () => {
    const now = Date.now();
    const past = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const future = new Date(now + 7 * 24 * 60 * 60 * 1000);

    const generalActive = await DiscountPolicy.create({
      name: 'General Active',
      code: 'GEN_ACTIVE',
      discountType: 'percentage',
      discountValue: 10,
      isGeneralEligibility: true,
      status: DISCOUNT_POLICY_STATUS.ACTIVE,
      effectiveStartDate: past,
      effectiveEndDate: future,
      createdBy: adminUser._id,
    });

    const generalExpired = await DiscountPolicy.create({
      name: 'General Expired',
      code: 'GEN_EXPIRED',
      discountType: 'percentage',
      discountValue: 15,
      isGeneralEligibility: true,
      status: DISCOUNT_POLICY_STATUS.ACTIVE,
      effectiveStartDate: new Date(now - 14 * 24 * 60 * 60 * 1000),
      effectiveEndDate: past,
      createdBy: adminUser._id,
    });

    const exclusivePolicy = await DiscountPolicy.create({
      name: 'Alpha Exclusive',
      code: 'ALPHA_ONLY',
      discountType: 'percentage',
      discountValue: 25,
      isGeneralEligibility: false,
      status: DISCOUNT_POLICY_STATUS.ACTIVE,
      effectiveStartDate: past,
      effectiveEndDate: future,
      createdBy: adminUser._id,
    });

    await DiscountAssignment.create({
      contractorId: contractorA._id,
      discountPolicyId: exclusivePolicy._id,
      assignedBy: adminUser._id,
      effectiveStartDate: past,
      effectiveEndDate: future,
      status: 'active',
    });

    const aPolicies = await discountService.getContractorApplicableDiscounts(contractorA._id);
    const bPolicies = await discountService.getContractorApplicableDiscounts(contractorB._id);

    const aCodes = aPolicies.map((p) => p.code);
    const bCodes = bPolicies.map((p) => p.code);

    assert.ok(aCodes.includes(generalActive.code));
    assert.ok(aCodes.includes(exclusivePolicy.code));
    assert.ok(!aCodes.includes(generalExpired.code), 'Expired general policy must not apply');

    assert.ok(bCodes.includes(generalActive.code));
    assert.ok(!bCodes.includes(exclusivePolicy.code), 'Contractor B must not inherit A exclusive policy');
    assert.ok(!bCodes.includes(generalExpired.code), 'Expired general policy must not apply to B');
  });

  it('4. Estimate ownership in requestProjectEstimate & Notification ownership in markAsRead', async () => {
    const estimate = await Estimate.create({
      estimateNumber: 'EST-P0-TEST-001',
      estimateType: 'CUSTOMER',
      deckId: new mongoose.Types.ObjectId(),
      createdBy: customerA._id,
      ownerId: customerA._id,
      deckDetails: {
        projectName: 'P0 Back Deck',
        areaSqFt: 250,
      },
      pricingSnapshot: { laborRatePerSqFt: 5 },
      totalAmount: 1850,
    });

    const forbiddenReq = await fetch(`${baseUrl}/estimates/${estimate._id}/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerBToken}`,
      },
      body: JSON.stringify({ message: 'Trying unauthorized booking' }),
    });
    assert.equal(forbiddenReq.status, 403);

    const ownerReq = await fetch(`${baseUrl}/estimates/${estimate._id}/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({ message: 'Ready to book project' }),
    });
    assert.equal(ownerReq.status, 200);
    const ownerReqJson = await ownerReq.json();
    assert.equal(ownerReqJson.data.project.customerId, customerA._id.toString());

    const notifForA = await Notification.create({
      recipientType: 'specific',
      userId: customerA._id,
      targetRole: 'customer',
      title: 'Private Notice',
      message: 'Only for Customer A',
    });

    const notifContractorBroadcast = await Notification.create({
      recipientType: 'contractor',
      userId: null,
      targetRole: 'contractor',
      title: 'Contractor Broadcast',
      message: 'Only for Contractors',
    });

    const badIdRes = await fetch(`${baseUrl}/notifications/not-an-id/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    assert.equal(badIdRes.status, 400);

    const otherUserNotifRes = await fetch(`${baseUrl}/notifications/${notifForA._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customerBToken}` },
    });
    assert.equal(otherUserNotifRes.status, 403);

    const wrongRoleBroadcastRes = await fetch(`${baseUrl}/notifications/${notifContractorBroadcast._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    assert.equal(wrongRoleBroadcastRes.status, 403);

    const ownNotifRes = await fetch(`${baseUrl}/notifications/${notifForA._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    assert.equal(ownNotifRes.status, 200);

    const matchingBroadcastRes = await fetch(`${baseUrl}/notifications/${notifContractorBroadcast._id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${contractorAToken}` },
    });
    assert.equal(matchingBroadcastRes.status, 200);
  });

  it('5. Multer errors return 400 & contractor document access is strictly authenticated/authorized', async () => {
    const blockedDocStatic = await fetch(`${rootUrl}/uploads/contractor-documents/secret.pdf`);
    assert.equal(blockedDocStatic.status, 403);

    const blockedDeckStatic = await fetch(`${rootUrl}/uploads/decks/photo.jpg`);
    assert.equal(blockedDeckStatic.status, 403);

    const allowedCatalogStatic = await fetch(`${rootUrl}/uploads/catalog/p0-verify-test.txt`);
    assert.equal(allowedCatalogStatic.status, 200);
    assert.equal(await allowedCatalogStatic.text(), 'catalog-ok');

    const badForm = new FormData();
    badForm.append('documentType', 'contractor_license');
    badForm.append('document', new Blob(['#!/bin/sh\necho bad'], { type: 'text/plain' }), 'bad.sh');
    const badMimeRes = await fetch(`${baseUrl}/contractors/me/verification/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${contractorAToken}` },
      body: badForm,
    });
    assert.equal(badMimeRes.status, 400);

    const bigForm = new FormData();
    bigForm.append('documentType', 'contractor_license');
    const bigBuf = Buffer.alloc(10 * 1024 * 1024 + 128, 0x41);
    bigForm.append('document', new Blob([bigBuf], { type: 'application/pdf' }), 'huge.pdf');
    const bigRes = await fetch(`${baseUrl}/contractors/me/verification/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${contractorAToken}` },
      body: bigForm,
    });
    assert.equal(bigRes.status, 400);
    const bigJson = await bigRes.json();
    assert.equal(bigJson.error?.code, 'FILE_TOO_LARGE');

    const validForm = new FormData();
    validForm.append('documentType', 'contractor_license');
    validForm.append(
      'document',
      new Blob(['%PDF-1.4\n%Valid test license pdf\n'], { type: 'application/pdf' }),
      'license.pdf'
    );
    const uploadRes = await fetch(`${baseUrl}/contractors/me/verification/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${contractorAToken}` },
      body: validForm,
    });
    assert.equal(uploadRes.status, 201);
    const uploadJson = await uploadRes.json();
    const docId = uploadJson.data._id || uploadJson.data.id;
    assert.ok(docId);

    const unauthDownload = await fetch(`${baseUrl}/contractors/documents/${docId}/file`);
    assert.equal(unauthDownload.status, 401);

    const otherDownload = await fetch(`${baseUrl}/contractors/documents/${docId}/file`, {
      headers: { Authorization: `Bearer ${contractorBToken}` },
    });
    assert.equal(otherDownload.status, 403);

    const ownerDownload = await fetch(`${baseUrl}/contractors/documents/${docId}/file`, {
      headers: { Authorization: `Bearer ${contractorAToken}` },
    });
    assert.equal(ownerDownload.status, 200);
    assert.match(ownerDownload.headers.get('cache-control') || '', /no-store/);

    const adminDownload = await fetch(`${baseUrl}/contractors/documents/${docId}/file`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminDownload.status, 200);
  });
});

