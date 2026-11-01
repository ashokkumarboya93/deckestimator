// =============================================
// Deck Estimator — Phase 8 Integration Test Suite
// =============================================
// Comprehensive testing of Contractor Verification & Lead Management:
// 1. Contractor profile update and document upload
// 2. Contractor verification lifecycle (submit -> under_review -> request_info -> approve -> suspend)
// 3. Customer enquiry & lead creation (ownership checks, snapshots)
// 4. Admin lead management, eligible contractor matching, assignment & reassignment
// 5. Contractor lead inbox, accept, operational status progression
// 6. Data isolation, activity logging, and audit tracking

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
const { ROLES, VERIFICATION_STATUS, LEAD_STATUS } = require('../../src/shared/constants');

describe('Phase 8 — Contractor Verification & Lead Management', () => {
  let mongoServer;
  let server;
  let baseUrl;

  let adminToken;
  let adminUserId;

  let customerAToken;
  let customerAId;
  let customerBToken;

  let contractorToken;
  let contractorUserId;
  let contractorProfileId;

  let unapprovedContractorToken;
  let unapprovedContractorUserId;

  let testDeckId;
  let testEstimateId;
  let createdLeadId;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, () => {
        const { port } = server.address();
        baseUrl = `http://localhost:${port}/api/v1`;
        resolve();
      });
    });

    // 1. Register & Promote Admin
    const adminRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Lead Admin',
        email: 'admin.lead.test@deckestimator.com',
        password: 'Password123!',
      }),
    });
    const adminData = await adminRes.json();
    adminToken = adminData.data.token;
    adminUserId = adminData.data.user.id;
    await User.findByIdAndUpdate(adminUserId, {
      role: ROLES.ADMIN,
      accountStatus: 'active',
    });
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin.lead.test@deckestimator.com',
        password: 'Password123!',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    adminToken = adminLoginData.data.token;

    // 2. Register Customer A
    const custARes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Alpha Customer',
        email: 'customer.alpha@test.com',
        password: 'Password123!',
      }),
    });
    const custAData = await custARes.json();
    customerAToken = custAData.data.token;
    customerAId = custAData.data.user.id;

    // 3. Register Customer B
    const custBRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Beta Customer',
        email: 'customer.beta@test.com',
        password: 'Password123!',
      }),
    });
    const custBData = await custBRes.json();
    customerBToken = custBData.data.token;

    // 4. Register Contractor (to be verified)
    const contRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Paul Builder',
        email: 'contractor.pro@test.com',
        password: 'Password123!',
        role: ROLES.CONTRACTOR,
        businessName: 'Paul Pro Decking LLC',
        licenseNumber: 'LIC-PHASE8-999',
      }),
    });
    const contData = await contRes.json();
    contractorToken = contData.data.token;
    contractorUserId = contData.data.user.id;
    const profile = await ContractorProfile.findOne({ userId: contractorUserId });
    contractorProfileId = profile._id.toString();

    // 5. Register an unapproved contractor
    const unappRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Pending Guy',
        email: 'contractor.unapproved@test.com',
        password: 'Password123!',
        role: ROLES.CONTRACTOR,
        businessName: 'Pending Decking',
        licenseNumber: 'LIC-PENDING-001',
      }),
    });
    const unappData = await unappRes.json();
    unapprovedContractorToken = unappData.data.token;
    unapprovedContractorUserId = unappData.data.user.id;

    // 6. Create Deck owned by Customer A
    const deck = await Deck.create({
      ownerId: customerAId,
      projectName: 'Alpha Lakehouse Deck',
      dimensions: {
        length: 20,
        width: 15,
        area: 300,
      },
      surfaceDetails: {
        material: 'wood',
      },
      location: {
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
      },
    });
    testDeckId = deck._id.toString();

    // 7. Create Estimate for Customer A's deck
    const est = await Estimate.create({
      estimateNumber: `EST-${Date.now()}`,
      estimateName: 'Deck Restoration Estimate',
      estimateType: 'CUSTOMER',
      deckId: deck._id,
      createdBy: customerAId,
      ownerId: customerAId,
      deckDetails: {
        deckId: deck._id,
        projectName: 'Alpha Lakehouse Deck',
        areaSqFt: 300,
      },
      totalAmount: 4500,
      pricingSnapshot: {
        rulesApplied: [],
      },
      version: 1,
      status: 'CALCULATED',
    });
    testEstimateId = est._id.toString();
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // ----------------------------------------------------
  // 1. Contractor Self-Service & Verification Submission
  // ----------------------------------------------------
  describe('Contractor Self-Service & Verification Submission', () => {
    it('1. GET /contractors/me - Contractor can retrieve their business profile', async () => {
      const res = await fetch(`${baseUrl}/contractors/me`, {
        headers: { Authorization: `Bearer ${contractorToken}` },
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.success, true);
      assert.equal(data.data.businessName, 'Paul Pro Decking LLC');
      assert.equal(data.data.verificationStatus, VERIFICATION_STATUS.PENDING);
    });

    it('2. PATCH /contractors/me - Contractor updates permitted business information', async () => {
      const res = await fetch(`${baseUrl}/contractors/me`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${contractorToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessPhone: '555-019-2834',
          businessDescription: 'Expert deck restoration with over 12 years of experience.',
          yearsOfExperience: 12,
          supportedSurfaceTypes: ['Cedar Wood', 'Redwood', 'Composite'],
          businessAddress: {
            street: '123 Timber Lane',
            city: 'Seattle',
            state: 'WA',
            zipCode: '98101',
          },
        }),
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.data.yearsOfExperience, 12);
      assert.equal(data.data.businessAddress.city, 'Seattle');
    });

    it('3. POST /contractors/me/verification/documents - Upload verification document', async () => {
      const form = new FormData();
      form.append('documentType', 'contractor_license');
      form.append('notes', 'State of WA contractor license');
      const blob = new Blob(['%PDF-1.4 dummy contractor license content'], {
        type: 'application/pdf',
      });
      form.append('document', blob, 'license.pdf');

      const res = await fetch(`${baseUrl}/contractors/me/verification/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${contractorToken}` },
        body: form,
      });
      const data = await res.json();

      assert.equal(res.status, 201);
      assert.equal(data.success, true);
      assert.equal(data.data.documentType, 'contractor_license');
      assert.equal(data.data.documentStatus, 'pending_review');
    });

    it('4. Customer is blocked from accessing contractor self-service (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/contractors/me`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      assert.equal(res.status, 403);
    });
  });

  // ----------------------------------------------------
  // 2. Admin Contractor Review & Approval Lifecycle
  // ----------------------------------------------------
  describe('Admin Contractor Verification Lifecycle', () => {
    it('5. GET /contractors/admin/verifications - Admin lists contractor applications', async () => {
      const res = await fetch(`${baseUrl}/contractors/admin/verifications`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.success, true);
      assert.ok(data.data.length >= 2);
    });

    it('6. POST /contractors/admin/verifications/:id/review - Admin starts review', async () => {
      const res = await fetch(
        `${baseUrl}/contractors/admin/verifications/${contractorProfileId}/review`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'START_REVIEW',
            notes: 'Checking state license database',
          }),
        }
      );
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.data.profile.verificationStatus, VERIFICATION_STATUS.UNDER_REVIEW);
    });

    it('7. POST /contractors/admin/verifications/:id/review - Admin requests additional info', async () => {
      const res = await fetch(
        `${baseUrl}/contractors/admin/verifications/${contractorProfileId}/review`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'REQUEST_INFORMATION',
            reason: 'Please upload proof of general liability insurance.',
          }),
        }
      );
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(
        data.data.profile.verificationStatus,
        VERIFICATION_STATUS.ADDITIONAL_INFORMATION_REQUIRED
      );
    });

    it('8. POST /contractors/me/verification/submit - Contractor resubmits application', async () => {
      const res = await fetch(`${baseUrl}/contractors/me/verification/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${contractorToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: 'Uploaded insurance doc and resubmitted' }),
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.data.verificationStatus, VERIFICATION_STATUS.PENDING);
    });

    it('9. POST /contractors/admin/verifications/:id/review - Admin approves contractor', async () => {
      const res = await fetch(
        `${baseUrl}/contractors/admin/verifications/${contractorProfileId}/review`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'APPROVE',
            notes: 'All documents verified and compliant.',
          }),
        }
      );
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.data.profile.verificationStatus, VERIFICATION_STATUS.APPROVED);
    });

    it('10. GET /contractors/eligible - Eligible contractors includes approved contractor', async () => {
      const res = await fetch(
        `${baseUrl}/contractors/eligible?surfaceMaterial=Cedar`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.ok(data.data.some((c) => c.businessName === 'Paul Pro Decking LLC'));
    });
  });

  // ----------------------------------------------------
  // 3. Customer Lead Creation & Enquiry Submission
  // ----------------------------------------------------
  describe('Customer Lead Creation & Data Isolation', () => {
    it('11. POST /leads - Customer A submits enquiry and creates lead with estimate snapshot', async () => {
      const res = await fetch(`${baseUrl}/leads`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${customerAToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deckId: testDeckId,
          estimateId: testEstimateId,
          leadSource: 'estimate_enquiry',
          enquiry: {
            subject: 'Requesting Cedar Deck Restoration in June',
            message: 'Looking to start work next month. Need full sanding and stain application.',
            preferredContactMethod: 'phone',
            preferredContactTime: 'weekday afternoons',
          },
        }),
      });
      const data = await res.json();

      assert.equal(res.status, 201);
      assert.equal(data.success, true);
      assert.ok(data.data.leadNumber.startsWith('LEAD-'));
      assert.equal(data.data.status, LEAD_STATUS.NEW);
      assert.equal(data.data.estimateSnapshot.totalAmount, 4500);
      assert.equal(data.data.deckSnapshot.projectName, 'Alpha Lakehouse Deck');

      createdLeadId = data.data.id || data.data._id;
    });

    it('12. POST /leads - Rejects enquiry for a deck not owned by requesting customer (403)', async () => {
      const res = await fetch(`${baseUrl}/leads`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${customerBToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deckId: testDeckId,
          enquiry: {
            subject: 'Intruder enquiry',
            message: 'Should be rejected',
          },
        }),
      });

      assert.equal(res.status, 403);
    });

    it('13. GET /leads/my-leads - Customer A lists their leads', async () => {
      const res = await fetch(`${baseUrl}/leads/my-leads`, {
        headers: { Authorization: `Bearer ${customerAToken}` },
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.data.length, 1);
      assert.equal(data.data[0].id, createdLeadId);
    });

    it('14. GET /leads/:id - Customer B cannot access Customer A lead (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/leads/${createdLeadId}`, {
        headers: { Authorization: `Bearer ${customerBToken}` },
      });
      assert.equal(res.status, 403);
    });
  });

  // ----------------------------------------------------
  // 4. Admin Lead Assignment & Contractor Eligibility
  // ----------------------------------------------------
  describe('Admin Lead Management & Contractor Assignment', () => {
    it('15. GET /leads/admin/analytics - Admin gets lead status counts', async () => {
      const res = await fetch(`${baseUrl}/leads/admin/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.success, true);
      assert.ok(data.data.totalLeads >= 1);
    });

    it('16. POST /leads/admin/:id/assign - Rejects assignment to unapproved contractor (400)', async () => {
      const res = await fetch(`${baseUrl}/leads/admin/${createdLeadId}/assign`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractorId: unapprovedContractorUserId,
          assignmentReason: 'Test unapproved assignment',
        }),
      });
      const data = await res.json();

      assert.equal(res.status, 400);
      assert.equal(data.error.code, 'CONTRACTOR_NOT_ELIGIBLE');
    });

    it('17. POST /leads/admin/:id/assign - Successfully assigns lead to approved contractor', async () => {
      const res = await fetch(`${baseUrl}/leads/admin/${createdLeadId}/assign`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractorId: contractorUserId,
          assignmentReason: 'Approved local specialist for cedar wood restoration',
        }),
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.data.status, LEAD_STATUS.ASSIGNED);
      assert.equal(
        data.data.assignedContractorId.id || data.data.assignedContractorId._id,
        contractorUserId
      );
    });

    it('18. GET /leads/admin/:id/history - Assignment history is recorded', async () => {
      const res = await fetch(`${baseUrl}/leads/admin/${createdLeadId}/history`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.data.length, 1);
      assert.equal(data.data[0].assignmentStatus, 'ASSIGNED');
    });
  });

  // ----------------------------------------------------
  // 5. Contractor Lead Management & Status Workflow
  // ----------------------------------------------------
  describe('Contractor Lead Workflow & Operational Progress', () => {
    it('19. GET /leads/contractor/inbox - Assigned contractor views lead in inbox', async () => {
      const res = await fetch(`${baseUrl}/leads/contractor/inbox`, {
        headers: { Authorization: `Bearer ${contractorToken}` },
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.data.length, 1);
      assert.equal(data.data[0].id, createdLeadId);
    });

    it('20. POST /leads/contractor/:id/accept - Contractor accepts the assigned lead', async () => {
      const res = await fetch(`${baseUrl}/leads/contractor/${createdLeadId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${contractorToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: 'Accepted lead, preparing initial outreach' }),
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.data.status, LEAD_STATUS.ACCEPTED);
    });

    it('21. PATCH /leads/contractor/:id/status - Contractor marks lead as CONTACTED', async () => {
      const res = await fetch(`${baseUrl}/leads/contractor/${createdLeadId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${contractorToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: LEAD_STATUS.CONTACTED,
          notes: 'Spoke with customer over phone, scheduled site visit for Friday',
        }),
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.data.status, LEAD_STATUS.CONTACTED);
    });

    it('22. PATCH /leads/contractor/:id/status - Contractor progresses lead to SITE_VISIT_SCHEDULED', async () => {
      const res = await fetch(`${baseUrl}/leads/contractor/${createdLeadId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${contractorToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: LEAD_STATUS.SITE_VISIT_SCHEDULED,
          notes: 'Site visit confirmed for Friday 2 PM',
        }),
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.data.status, LEAD_STATUS.SITE_VISIT_SCHEDULED);
    });

    it('23. GET /leads/:id/activities - Activity timeline reflects complete audit trail', async () => {
      const res = await fetch(`${baseUrl}/leads/${createdLeadId}/activities`, {
        headers: { Authorization: `Bearer ${contractorToken}` },
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.ok(data.data.length >= 4);
    });

    it('24. POST /leads/admin/:id/close - Admin closes lead with reason', async () => {
      const res = await fetch(`${baseUrl}/leads/admin/${createdLeadId}/close`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'CLOSE',
          reason: 'Project successfully completed by contractor.',
        }),
      });
      const data = await res.json();

      assert.equal(res.status, 200);
      assert.equal(data.data.status, LEAD_STATUS.CLOSED);
      assert.equal(data.data.closureReason, 'Project successfully completed by contractor.');
    });
  });
});
