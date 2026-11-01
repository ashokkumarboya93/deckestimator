// =============================================
// Deck Estimator — Phase 9 Integration Test Suite
// =============================================
// Comprehensive testing of Contractor Discounts & Commission Management:
// 1. Admin discount policy CRUD, validation & status toggling
// 2. Contractor discount eligibility, assignments & contractor policy discovery
// 3. Discount calculation integration with pricing engine, snapshots & limits
// 4. Admin commission policy CRUD
// 5. Commission generation for eligible converted leads with duplicate prevention
// 6. Commission lifecycle: review, approval, payable, payment recording & reversals
// 7. Data isolation, contractor summary metrics & audit history

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../src/app');
const User = require('../../src/modules/users/users.model');
const ContractorProfile = require('../../src/modules/contractors/contractorProfile.model');
const Deck = require('../../src/modules/decks/deck.model');
const Estimate = require('../../src/modules/estimates/estimate.model');
const Lead = require('../../src/modules/leads/lead.model');
const PricingConfiguration = require('../../src/modules/pricing/pricingConfiguration.model');
const {
  ROLES,
  VERIFICATION_STATUS,
  LEAD_STATUS,
  DISCOUNT_POLICY_STATUS,
  COMMISSION_STATUS,
} = require('../../src/shared/constants');

describe('Phase 9 — Contractor Discounts & Commission Management', () => {
  let mongoServer;
  let server;
  let baseUrl;

  let adminToken;
  let adminUserId;

  let customerToken;
  let customerUserId;

  let contractorToken;
  let contractorUserId;
  let contractorProfileId;

  let contractorBToken;
  let contractorBUserId;

  let unapprovedContractorToken;
  let unapprovedContractorUserId;

  let testDeckId;
  let testEstimateId;
  let convertedLeadId;

  let percentageDiscountPolicyId;
  let fixedDiscountPolicyId;
  let commissionPolicyId;
  let createdCommissionId;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    // 1. Register & Setup Admin
    const adminReg = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'phase9_admin@example.com',
        password: 'Password123!',
        fullName: 'Phase9 Admin User',
        role: 'customer',
      }),
    });
    const adminData = await adminReg.json();
    adminUserId = adminData.data.user.id;
    await User.findByIdAndUpdate(adminUserId, { role: 'admin', accountStatus: 'active' });

    const adminLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'phase9_admin@example.com', password: 'Password123!' }),
    });
    const adminLoginData = await adminLogin.json();
    adminToken = adminLoginData.data.token;

    // 2. Setup Pricing Configuration
    await PricingConfiguration.create({
      configurationName: 'Phase 9 Standard Pricing Config',
      basePricePerSqFt: 5.0,
      laborRate: 60.0,
      minimumJobPrice: 500.0,
      wastePercentage: 10.0,
      travelCharge: 50.0,
      taxPercentage: 8.5,
      status: 'active',
      isDefault: true,
      createdBy: adminUserId,
    });

    // 3. Register Customer
    const custReg = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'phase9_customer@example.com',
        password: 'Password123!',
        fullName: 'Phase9 Customer Alice',
        role: 'customer',
      }),
    });
    const custData = await custReg.json();
    customerUserId = custData.data.user.id;
    customerToken = custData.data.token;

    // 4. Register Approved Contractor A
    const contReg = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'phase9_contractor@example.com',
        password: 'Password123!',
        fullName: 'Phase9 Pro Contractor',
        role: 'contractor',
        businessName: 'Apex Deck Builders',
        licenseNumber: 'LIC-PH9-001',
      }),
    });
    const contData = await contReg.json();
    contractorUserId = contData.data.user.id;

    // Update contractor profile to APPROVED and account to active
    const contProfile = await ContractorProfile.findOne({ userId: contractorUserId });
    contProfile.verificationStatus = VERIFICATION_STATUS.APPROVED;
    contProfile.reviewedBy = adminUserId;
    contProfile.reviewedAt = new Date();
    await contProfile.save();
    contractorProfileId = contProfile._id;
    await User.findByIdAndUpdate(contractorUserId, { accountStatus: 'active' });

    const contLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'phase9_contractor@example.com', password: 'Password123!' }),
    });
    const contLoginData = await contLogin.json();
    contractorToken = contLoginData.data.token;

    // 5. Register Approved Contractor B
    const contBReg = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'phase9_contractor_b@example.com',
        password: 'Password123!',
        fullName: 'Contractor Bob',
        role: 'contractor',
        businessName: 'Bob Decks LLC',
        licenseNumber: 'LIC-PH9-002',
      }),
    });
    const contBData = await contBReg.json();
    contractorBUserId = contBData.data.user.id;
    await ContractorProfile.findOneAndUpdate(
      { userId: contractorBUserId },
      { verificationStatus: VERIFICATION_STATUS.APPROVED }
    );
    await User.findByIdAndUpdate(contractorBUserId, { accountStatus: 'active' });

    const contBLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'phase9_contractor_b@example.com', password: 'Password123!' }),
    });
    const contBLoginData = await contBLogin.json();
    contractorBToken = contBLoginData.data.token;

    // 6. Register Unapproved Contractor
    const unappReg = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'phase9_unapproved@example.com',
        password: 'Password123!',
        fullName: 'Unapproved Contractor',
        role: 'contractor',
        businessName: 'Unverified Co',
        licenseNumber: 'LIC-PH9-UNVER',
      }),
    });
    const unappData = await unappReg.json();
    unapprovedContractorUserId = unappData.data.user.id;
    unapprovedContractorToken = unappData.data.token;

    // 7. Setup Test Deck and Estimate
    const testDeck = await Deck.create({
      ownerId: customerUserId,
      ownerType: 'CUSTOMER',
      projectName: 'Phase 9 Test Cedar Deck',
      deckShape: 'rectangle',
      measurementUnit: 'ft',
      dimensions: { length: 20, width: 15, area: 300 },
      surfaceDetails: { material: 'wood', condition: 'good' },
      completionStatus: 'complete',
    });
    testDeckId = testDeck._id;

    const testEstimate = await Estimate.create({
      estimateNumber: `EST-PH9-${Date.now().toString().slice(-6)}`,
      deckId: testDeckId,
      createdBy: contractorUserId,
      ownerId: customerUserId,
      estimateType: 'CONTRACTOR',
      subtotal: 2000.0,
      totalAmount: 2170.0,
      deckDetails: { areaSqFt: 300, projectName: 'Phase 9 Test Cedar Deck' },
      pricingSnapshot: {
        materialsSubtotal: 1000.0,
        servicesSubtotal: 600.0,
        laborSubtotal: 400.0,
        calculatedSubtotal: 2000.0,
        taxAmount: 170.0,
        finalTotal: 2170.0,
      },
      estimateStatus: 'DRAFT',
      version: 1,
    });
    testEstimateId = testEstimate._id;

    // 8. Setup Converted Lead
    const testLead = await Lead.create({
      leadNumber: `LEAD-PH9-${Date.now().toString().slice(-6)}`,
      customerId: customerUserId,
      deckId: testDeckId,
      estimateId: testEstimateId,
      leadSource: 'customer_estimator',
      status: LEAD_STATUS.CONVERTED,
      assignedContractorId: contractorUserId,
      assignedContractorProfileId: contractorProfileId,
      assignedAt: new Date(),
      enquiry: {
        subject: 'Cedar Deck Full Restoration',
        message: 'Ready to proceed with restoration quote.',
      },
      customerSnapshot: {
        name: 'Phase9 Customer Alice',
        email: 'phase9_customer@example.com',
      },
      deckSnapshot: {
        projectName: 'Phase 9 Test Cedar Deck',
        area: 300,
        shape: 'rectangle',
      },
      estimateSnapshot: {
        totalAmount: 2170.0,
        currency: 'USD',
      },
    });
    convertedLeadId = testLead._id;
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    await new Promise((resolve) => server.close(resolve));
  });

  // =============================================
  // 1. DISCOUNT POLICY MANAGEMENT (ADMIN)
  // =============================================
  describe('Admin Discount Policy Management', () => {
    it('1. POST /admin/policies - Admin creates percentage discount policy', async () => {
      const res = await fetch(`${baseUrl}/api/v1/discounts/admin/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Preferred Contractor 10% Off',
          code: 'CONTRACTOR-10',
          description: '10% discount on entire estimate for approved contractors',
          discountType: 'percentage',
          discountValue: 10,
          applicability: 'all',
          minimumEstimateAmount: 500,
          maximumDiscountAmount: 300,
          status: 'draft',
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.policy.code, 'CONTRACTOR-10');
      assert.equal(json.data.policy.discountValue, 10);
      percentageDiscountPolicyId = json.data.policy.id;
    });

    it('2. POST /admin/policies - Rejects creation from non-admin role (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/discounts/admin/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${contractorToken}`,
        },
        body: JSON.stringify({
          name: 'Unauthorized Policy',
          code: 'UNAUTH-10',
          discountType: 'percentage',
          discountValue: 10,
        }),
      });

      assert.equal(res.status, 403);
    });

    it('3. POST /admin/policies - Rejects duplicate policy code (409 Conflict)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/discounts/admin/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Duplicate Code Policy',
          code: 'CONTRACTOR-10',
          discountType: 'percentage',
          discountValue: 10,
        }),
      });

      assert.equal(res.status, 409);
    });

    it('4. PATCH /admin/policies/:id/status - Admin activates discount policy', async () => {
      const res = await fetch(
        `${baseUrl}/api/v1/discounts/admin/policies/${percentageDiscountPolicyId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: 'active' }),
        }
      );

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.policy.status, 'active');
    });

    it('5. POST /admin/policies - Admin creates fixed-amount discount policy with general eligibility', async () => {
      const res = await fetch(`${baseUrl}/api/v1/discounts/admin/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'General Restoration $100 Discount',
          code: 'RESTORE-100',
          description: '$100 fixed discount for all verified contractors',
          discountType: 'fixed',
          discountValue: 100,
          applicability: 'all',
          isGeneralEligibility: true,
          status: 'active',
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.data.policy.code, 'RESTORE-100');
      fixedDiscountPolicyId = json.data.policy.id;
    });
  });

  // =============================================
  // 2. CONTRACTOR ELIGIBILITY & ASSIGNMENTS
  // =============================================
  describe('Contractor Discount Eligibility & Assignments', () => {
    it('6. POST /admin/assignments - Rejects assigning discount to unapproved contractor (400 Bad Request)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/discounts/admin/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          contractorId: unapprovedContractorUserId,
          discountPolicyId: percentageDiscountPolicyId,
          notes: 'Test unapproved assignment',
        }),
      });

      assert.equal(res.status, 400);
    });

    it('7. POST /admin/assignments - Successfully assigns individual discount to approved Contractor A', async () => {
      const res = await fetch(`${baseUrl}/api/v1/discounts/admin/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          contractorId: contractorUserId,
          discountPolicyId: percentageDiscountPolicyId,
          notes: 'Assigned for stellar quality history',
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.data.assignment.status, 'active');
    });

    it('8. GET /contractor - Contractor A discovers both assigned and general policies', async () => {
      const res = await fetch(`${baseUrl}/api/v1/discounts/contractor`, {
        headers: { Authorization: `Bearer ${contractorToken}` },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.policies.length >= 2);
      const codes = json.data.policies.map((p) => p.code);
      assert.ok(codes.includes('CONTRACTOR-10'));
      assert.ok(codes.includes('RESTORE-100'));
    });

    it('9. GET /contractor - Contractor B only sees general policy (not individual assignment of Contractor A)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/discounts/contractor`, {
        headers: { Authorization: `Bearer ${contractorBToken}` },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      const codes = json.data.policies.map((p) => p.code);
      assert.ok(codes.includes('RESTORE-100'));
      assert.ok(!codes.includes('CONTRACTOR-10'));
    });
  });

  // =============================================
  // 3. DISCOUNT APPLICATION & PRICING ENGINE
  // =============================================
  describe('Discount Application & Calculation Integrity', () => {
    it('10. POST /estimates/:id/apply - Applies percentage discount to estimate', async () => {
      const res = await fetch(
        `${baseUrl}/api/v1/discounts/estimates/${testEstimateId}/apply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${contractorToken}`,
          },
          body: JSON.stringify({
            discountPolicyCode: 'CONTRACTOR-10',
          }),
        }
      );

      assert.equal(res.status, 200);
      const json = await res.json();
      const estimate = json.data.estimate;

      // Original subtotal was 2000. 10% of 2000 = 200. Discount capped at max 300, so discount is 200.
      assert.equal(estimate.discountBreakdown.applied, true);
      assert.equal(estimate.discountBreakdown.policyCode, 'CONTRACTOR-10');
      assert.equal(estimate.discountBreakdown.discountAmount, 200);
      assert.equal(estimate.discountBreakdown.originalSubtotal, 2000);
      assert.equal(estimate.discountBreakdown.discountedSubtotal, 1800);

      // Tax is 8.5% of 1800 = 153. Total = 1800 + 153 = 1953.
      assert.equal(estimate.totalAmount, 1953);
    });

    it('11. GET /estimates/:id/history - Retrieves immutable discount application history', async () => {
      const res = await fetch(
        `${baseUrl}/api/v1/discounts/estimates/${testEstimateId}/history`,
        {
          headers: { Authorization: `Bearer ${contractorToken}` },
        }
      );

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.history.length, 1);
      assert.equal(json.data.history[0].policySnapshot.code, 'CONTRACTOR-10');
      assert.equal(json.data.history[0].discountAmount, 200);
    });

    it('12. POST /estimates/:id/apply - Unauthorized contractor cannot apply unassigned policy (403 Forbidden)', async () => {
      const res = await fetch(
        `${baseUrl}/api/v1/discounts/estimates/${testEstimateId}/apply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${contractorBToken}`,
          },
          body: JSON.stringify({
            discountPolicyCode: 'CONTRACTOR-10',
          }),
        }
      );

      assert.equal(res.status, 403);
    });
  });

  // =============================================
  // 4. COMMISSION POLICY MANAGEMENT (ADMIN)
  // =============================================
  describe('Admin Commission Policy Management', () => {
    it('13. POST /admin/policies - Admin creates percentage commission policy', async () => {
      const res = await fetch(`${baseUrl}/api/v1/commissions/admin/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Standard Lead Conversion Commission',
          code: 'COMM-5-PCT',
          description: '5% commission incentive for verified lead conversion',
          commissionType: 'percentage',
          commissionValue: 5,
          calculationBasis: 'converted_estimate',
          minimumCommissionAmount: 50,
          maximumCommissionAmount: 500,
          status: 'active',
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.data.policy.code, 'COMM-5-PCT');
      commissionPolicyId = json.data.policy.id;
    });

    it('14. POST /admin/policies - Rejects creation from contractor role (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/commissions/admin/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${contractorToken}`,
        },
        body: JSON.stringify({
          name: 'Contractor Fake Commission',
          code: 'FAKE-COMM',
          commissionType: 'percentage',
          commissionValue: 50,
        }),
      });

      assert.equal(res.status, 403);
    });
  });

  // =============================================
  // 5. COMMISSION GENERATION & INTEGRITY
  // =============================================
  describe('Commission Generation & Eligibility Integrity', () => {
    it('15. POST /admin/generate - Successfully generates commission for converted lead', async () => {
      const res = await fetch(`${baseUrl}/api/v1/commissions/admin/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          leadId: convertedLeadId.toString(),
          commissionPolicyId,
          conversionReference: 'CONV-VERIFIED-001',
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      const commission = json.data.commission;

      // Converted estimate total is 2170 (or updated 1953). 5% of 2170 = 108.50.
      assert.equal(commission.status, 'pending');
      assert.ok(commission.calculatedAmount > 0);
      assert.equal(commission.commissionType, 'percentage');
      assert.ok(commission.commissionReference.startsWith('COM-'));
      createdCommissionId = commission.id;
    });

    it('16. POST /admin/generate - Prevents duplicate commission generation for same lead & policy (409 Conflict)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/commissions/admin/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          leadId: convertedLeadId.toString(),
          commissionPolicyId,
        }),
      });

      assert.equal(res.status, 409);
    });

    it('17. POST /admin/generate - Rejects commission generation for unconverted lead (400 Bad Request)', async () => {
      const unconvertedLead = await Lead.create({
        leadNumber: `LEAD-NEW-${Date.now().toString().slice(-6)}`,
        customerId: customerUserId,
        deckId: testDeckId,
        leadSource: 'customer_estimator',
        status: LEAD_STATUS.NEW,
        enquiry: { subject: 'Unconverted Project', message: 'Just asking.' },
        customerSnapshot: { name: 'Customer X', email: 'x@example.com' },
        deckSnapshot: { projectName: 'Deck X' },
      });

      const res = await fetch(`${baseUrl}/api/v1/commissions/admin/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          leadId: unconvertedLead._id.toString(),
          commissionPolicyId,
        }),
      });

      assert.equal(res.status, 400);
    });
  });

  // =============================================
  // 6. COMMISSION LIFECYCLE & APPROVALS
  // =============================================
  describe('Commission Approval Lifecycle & Payment Recording', () => {
    it('18. POST /admin/:id/review - Contractor cannot approve own commission (403 Forbidden)', async () => {
      const res = await fetch(
        `${baseUrl}/api/v1/commissions/admin/${createdCommissionId}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${contractorToken}`,
          },
          body: JSON.stringify({ action: 'APPROVE' }),
        }
      );

      assert.equal(res.status, 403);
    });

    it('19. POST /admin/:id/review - Admin approves commission', async () => {
      const res = await fetch(
        `${baseUrl}/api/v1/commissions/admin/${createdCommissionId}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            action: 'APPROVE',
            notes: 'Verified signed customer contract and completed deck restoration.',
          }),
        }
      );

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.commission.status, 'approved');
      assert.ok(json.data.commission.approvedAmount > 0);
    });

    it('20. POST /admin/:id/review - Admin marks approved commission as PAYABLE', async () => {
      const res = await fetch(
        `${baseUrl}/api/v1/commissions/admin/${createdCommissionId}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            action: 'MARK_PAYABLE',
            notes: 'Batching for Friday disbursement cycle.',
          }),
        }
      );

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.commission.status, 'payable');
    });

    it('21. POST /admin/:id/record-payment - Admin records payment confirmation', async () => {
      const res = await fetch(
        `${baseUrl}/api/v1/commissions/admin/${createdCommissionId}/record-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            paymentReference: 'ACH-TRANS-990812',
            paymentMethod: 'ACH_TRANSFER',
            amount: 108.5,
            notes: 'Transferred via company payroll portal.',
          }),
        }
      );

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.commission.status, 'paid');
      assert.equal(json.data.paymentRecord.paymentReference, 'ACH-TRANS-990812');
    });

    it('22. POST /admin/:id/record-payment - Prevents duplicate payment recording (400 / 409)', async () => {
      const res = await fetch(
        `${baseUrl}/api/v1/commissions/admin/${createdCommissionId}/record-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            paymentReference: 'ACH-TRANS-990812',
            paymentMethod: 'ACH_TRANSFER',
            amount: 108.5,
          }),
        }
      );

      assert.ok(res.status >= 400);
    });
  });

  // =============================================
  // 7. DATA ISOLATION & HISTORY
  // =============================================
  describe('Commission Data Isolation & Summary Metrics', () => {
    it('23. GET /:id - Contractor A can view their own commission', async () => {
      const res = await fetch(`${baseUrl}/api/v1/commissions/${createdCommissionId}`, {
        headers: { Authorization: `Bearer ${contractorToken}` },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.commission.id, createdCommissionId);
      assert.equal(json.data.commission.status, 'paid');
    });

    it('24. GET /:id - Contractor B cannot view Contractor A commission (404 / 403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/api/v1/commissions/${createdCommissionId}`, {
        headers: { Authorization: `Bearer ${contractorBToken}` },
      });

      assert.ok(res.status === 404 || res.status === 403);
    });

    it('25. GET /summary - Contractor A retrieves financial summary metrics', async () => {
      const res = await fetch(`${baseUrl}/api/v1/commissions/summary`, {
        headers: { Authorization: `Bearer ${contractorToken}` },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.summary.totalRecords, 1);
      assert.equal(json.data.summary.byStatus.paid.count, 1);
    });

    it('26. GET /:id/history - Timeline tracks complete lifecycle from generate to paid', async () => {
      const res = await fetch(
        `${baseUrl}/api/v1/commissions/${createdCommissionId}/history`,
        {
          headers: { Authorization: `Bearer ${contractorToken}` },
        }
      );

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.ok(json.data.history.length >= 4);
      const actions = json.data.history.map((h) => h.action);
      assert.ok(actions.includes('GENERATE'));
      assert.ok(actions.includes('APPROVE'));
      assert.ok(actions.includes('MARK_PAYABLE'));
      assert.ok(actions.includes('RECORD_PAYMENT'));
    });
  });
});
