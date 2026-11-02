/**
 * Batch 4 API Live HTTP Verification: API-091 through API-127
 * 
 * Scope:
 * Phase 9: Contractor Discounts & Commission Management (API-091 to API-110)
 * Phase 10: Administrative Dashboard & Platform Management (API-111 to API-127)
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000/api/v1';

async function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    };

    let bodyStr = null;
    if (body !== null && typeof body === 'object' && !(body instanceof Buffer)) {
      bodyStr = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    } else if (body instanceof Buffer) {
      options.headers['Content-Length'] = body.length;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', reject);

    if (bodyStr) {
      req.write(bodyStr);
    } else if (body instanceof Buffer) {
      req.write(body);
    }
    req.end();
  });
}

let passedCount = 0;
let failedCount = 0;
const results = [];

async function call(apiId, name, method, path, headers = {}, body = null, expectedStatus = [200, 201]) {
  const start = Date.now();
  const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  try {
    const res = await request(method, path, headers, body);
    const duration = Date.now() - start;
    const ok = expected.includes(res.status);
    if (ok) {
      passedCount++;
      console.log(`[PASS] ${apiId}: ${method} ${path} -> Status ${res.status} (${duration}ms)`);
    } else {
      failedCount++;
      console.log(`[FAIL] ${apiId}: ${method} ${path} -> Status ${res.status} (${duration}ms)`);
      console.log(`   Error Detail: ${typeof res.data === 'object' ? JSON.stringify(res.data) : res.data?.substring?.(0, 200)}`);
    }
    results.push({ apiId, name, method, path, status: res.status, ok, duration, data: res.data });
    return res;
  } catch (err) {
    const duration = Date.now() - start;
    failedCount++;
    console.log(`[ERROR] ${apiId}: ${method} ${path} -> Network/Server Exception: ${err.message}`);
    results.push({ apiId, name, method, path, status: 0, ok: false, duration, error: err.message });
    return { status: 0, data: null };
  }
}

async function run() {
  console.log('========================================================================');
  console.log('--- EXECUTING LIVE HTTP VERIFICATION: API-091 TO API-127 ---');
  console.log(`Server Base URL: ${BASE_URL}`);
  console.log('========================================================================\n');

  // --- SETUP: Login Admin ---
  const adminLogin = await call('SETUP', 'Admin Login', 'POST', '/auth/login', {}, {
    email: 'admin@deckestimator.com',
    password: 'AdminPass123!'
  });
  const adminToken = adminLogin.data?.data?.token;
  const adminHeader = { 'Authorization': 'Bearer ' + adminToken };

  // --- SETUP: Register / Login Contractor ---
  const contEmail = 'contractor_b4_' + Date.now() + '@example.com';
  const contReg = await call('SETUP', 'Contractor Register', 'POST', '/auth/register', {}, {
    fullName: 'David Premier Contractor',
    email: contEmail,
    password: 'SecurePassword123!',
    phone: '+1-555-777-8888',
    role: 'contractor',
    businessName: 'David Pro Decking LLC',
    licenseNumber: 'LIC-TX-2026-B4'
  });
  const contractorToken = contReg.data?.data?.token;
  const contHeader = { 'Authorization': 'Bearer ' + contractorToken };
  const contractorUserId = contReg.data?.data?.user?.id;

  // Contractor profile and verification
  const profRes = await call('SETUP', 'Get Contractor Profile', 'GET', '/contractors/me', contHeader);
  const contractorProfileId = profRes.data?.data?.profile?.id || profRes.data?.data?.id;

  // Contractor submits verification and admin approves it
  await call('SETUP', 'Submit Contractor Verification', 'POST', '/contractors/me/verification/submit', contHeader);
  await call('SETUP', 'Admin Approve Contractor', 'POST', `/contractors/admin/verifications/${contractorProfileId}/review`, adminHeader, {
    action: 'APPROVE',
    reviewNotes: 'Auto approved for batch 4 verification'
  });

  // --- SETUP: Register Customer & Create Deck + Estimate ---
  const custEmail = 'customer_b4_' + Date.now() + '@example.com';
  const custReg = await call('SETUP', 'Customer Register', 'POST', '/auth/register', {}, {
    fullName: 'Sarah Customer',
    email: custEmail,
    password: 'SecurePassword123!',
    phone: '+1-555-444-3333',
    role: 'customer'
  });
  const customerToken = custReg.data?.data?.token;
  const custHeader = { 'Authorization': 'Bearer ' + customerToken };

  const deckRes = await call('SETUP', 'Create Customer Deck', 'POST', '/decks', custHeader, {
    projectName: 'Batch 4 Discount Test Deck',
    dimensions: { length: 20, width: 15 },
    deckShape: 'rectangle',
    surfaceDetails: { material: 'wood', coatingStatus: 'none' },
    structureDetails: { isAttached: true }
  });
  const deckId = deckRes.data?.data?.deck?.id || deckRes.data?.data?.id;

  // Get active materials and services for estimate
  const matsRes = await call('SETUP', 'Get Materials', 'GET', '/catalog/materials', custHeader);
  const materialId = matsRes.data?.data?.materials?.[0]?.id || matsRes.data?.data?.[0]?.id;
  const srvRes = await call('SETUP', 'Get Services', 'GET', '/catalog/services', custHeader);
  const serviceId = srvRes.data?.data?.services?.[0]?.id || srvRes.data?.data?.[0]?.id;

  const estRes = await call('SETUP', 'Create Estimate', 'POST', '/estimates', custHeader, {
    deckId,
    estimateName: 'Batch 4 Estimate with Discount',
    materialIds: materialId ? [materialId] : [],
    serviceIds: serviceId ? [serviceId] : [],
    numberOfCoats: 2
  });
  const estimateId = estRes.data?.data?.estimate?.id || estRes.data?.data?.id;

  // Setup lead for commission workflow
  const leadRes = await call('SETUP', 'Create Lead', 'POST', '/leads', custHeader, {
    deckId,
    estimateId,
    leadSource: 'customer_estimator',
    enquiry: {
      subject: 'Batch 4 Commission Test Project',
      message: 'Ready to proceed with verified contractor',
      preferredContactMethod: 'email'
    }
  });
  const leadId = leadRes.data?.data?.lead?.id || leadRes.data?.data?.id;

  // Admin assigns lead to contractor, contractor accepts, then contractor marks converted
  await call('SETUP', 'Admin Assign Lead', 'POST', `/leads/admin/${leadId}/assign`, adminHeader, {
    contractorId: contractorUserId,
    assignmentNotes: 'Assigned for commission generation'
  });
  await call('SETUP', 'Contractor Accept Lead', 'POST', `/leads/contractor/${leadId}/accept`, contHeader);
  await call('SETUP', 'Contractor Convert Lead', 'PATCH', `/leads/contractor/${leadId}/status`, contHeader, {
    status: 'converted',
    notes: 'Homeowner signed contract'
  });

  console.log('\n--- STARTING PHASE 9: CONTRACTOR DISCOUNTS (API-091 TO API-099) ---\n');

  // API-094: Admin Create Discount Policy
  const policyCode = 'DISC_B4_' + Math.floor(Math.random() * 9000 + 1000);
  const createPolicyRes = await call('API-094', 'Admin Create Discount Policy', 'POST', '/discounts/admin/policies', adminHeader, {
    name: 'Preferred Contractor Partner 10%',
    code: policyCode,
    description: '10% discount on deck restoration services',
    discountType: 'percentage',
    discountValue: 10,
    applicability: 'all',
    minimumEstimateAmount: 50,
    isGeneralEligibility: false,
    status: 'active'
  });
  const discountPolicyId = createPolicyRes.data?.data?.policy?.id || createPolicyRes.data?.data?.id;

  // API-095: Admin List Discount Policies
  await call('API-095', 'Admin List Discount Policies', 'GET', '/discounts/admin/policies', adminHeader);

  // API-096: Admin Get Discount Policy by ID
  await call('API-096', 'Admin Get Discount Policy by ID', 'GET', `/discounts/admin/policies/${discountPolicyId}`, adminHeader);

  // API-097: Admin Patch Discount Policy
  await call('API-097', 'Admin Patch Discount Policy', 'PATCH', `/discounts/admin/policies/${discountPolicyId}`, adminHeader, {
    description: 'Updated 10% partner discount description'
  });

  // API-098: Admin Update Discount Policy Status
  await call('API-098', 'Admin Update Discount Policy Status', 'PATCH', `/discounts/admin/policies/${discountPolicyId}/status`, adminHeader, {
    status: 'active'
  });

  // API-099: Admin Assign Discount Policy to Contractor
  await call('API-099', 'Admin Assign Discount to Contractor', 'POST', '/discounts/admin/assignments', adminHeader, {
    contractorId: contractorUserId,
    discountPolicyId: discountPolicyId,
    notes: 'Assigned for high volume performance'
  });

  // API-091: Contractor View Eligible Partner Discounts
  await call('API-091', 'Contractor View Eligible Discounts', 'GET', '/discounts/contractor', contHeader);

  // API-092: Apply Contractor Discount to Estimate
  await call('API-092', 'Apply Discount to Estimate', 'POST', `/discounts/estimates/${estimateId}/apply`, adminHeader, {
    discountPolicyId: discountPolicyId
  });

  // API-093: Get Estimate Discount History
  await call('API-093', 'Get Estimate Discount History', 'GET', `/discounts/estimates/${estimateId}/history`, custHeader);

  console.log('\n--- STARTING PHASE 9: COMMISSIONS WORKFLOW (API-100 TO API-110) ---\n');

  // API-104: Admin Create Commission Policy
  const commPolicyCode = 'COM_B4_' + Math.floor(Math.random() * 9000 + 1000);
  const commPolicyRes = await call('API-104', 'Admin Create Commission Policy', 'POST', '/commissions/admin/policies', adminHeader, {
    name: 'Standard Contractor 10% Commission',
    code: commPolicyCode,
    description: '10% platform commission on completed leads',
    commissionType: 'percentage',
    commissionValue: 10,
    calculationBasis: 'converted_estimate',
    status: 'active'
  });
  const commPolicyId = commPolicyRes.data?.data?.policy?.id || commPolicyRes.data?.data?.id;

  // API-105: Admin List Commission Policies
  await call('API-105', 'Admin List Commission Policies', 'GET', '/commissions/admin/policies', adminHeader);

  // API-106: Admin Get Commission Policy by ID
  await call('API-106', 'Admin Get Commission Policy by ID', 'GET', `/commissions/admin/policies/${commPolicyId}`, adminHeader);

  // API-107: Admin Patch Commission Policy
  await call('API-107', 'Admin Patch Commission Policy', 'PATCH', `/commissions/admin/policies/${commPolicyId}`, adminHeader, {
    description: 'Updated 10% commission policy terms'
  });

  // API-108: Admin Generate Commission from Converted Lead
  const genCommRes = await call('API-108', 'Admin Generate Commission', 'POST', '/commissions/admin/generate', adminHeader, {
    leadId: leadId,
    commissionPolicyId: commPolicyId,
    verifiedContractAmount: 1500,
    conversionReference: 'JOB-2026-B4'
  });
  const commissionId = genCommRes.data?.data?.commission?.id || genCommRes.data?.data?.id;

  // API-100: Contractor Commission Summary Metrics
  await call('API-100', 'Contractor Commission Summary', 'GET', '/commissions/summary', contHeader);

  // API-101: Contractor List Own Commissions
  await call('API-101', 'Contractor List Commissions', 'GET', '/commissions', contHeader);

  // API-102: Get Commission by ID
  await call('API-102', 'Get Commission by ID', 'GET', `/commissions/${commissionId}`, contHeader);

  // API-103: Get Commission Lifecycle History
  await call('API-103', 'Get Commission History', 'GET', `/commissions/${commissionId}/history`, contHeader);

  // API-109: Admin Review & Approve Commission (APPROVE, then MARK_PAYABLE)
  await call('API-109', 'Admin Review & Approve Commission', 'POST', `/commissions/admin/${commissionId}/review`, adminHeader, {
    action: 'APPROVE',
    notes: 'Verified homeowner completion signature'
  });
  await call('API-109b', 'Admin Mark Commission Payable', 'POST', `/commissions/admin/${commissionId}/review`, adminHeader, {
    action: 'MARK_PAYABLE',
    notes: 'Approved for payout processing'
  });

  // API-110: Admin Record Atomic Commission Payment
  await call('API-110', 'Admin Record Commission Payment', 'POST', `/commissions/admin/${commissionId}/record-payment`, adminHeader, {
    paymentReference: 'PAY-TX-998877',
    paymentMethod: 'DIRECT_DEPOSIT',
    amount: 150,
    currency: 'USD',
    notes: 'Settled via automated ACH transfer'
  });

  console.log('\n--- STARTING PHASE 10: ADMINISTRATIVE DASHBOARD & PLATFORM MANAGEMENT (API-111 TO API-127) ---\n');

  // API-111: Get Public Platform Settings
  await call('API-111', 'Get Public Platform Settings', 'GET', '/settings/public');

  // API-112: Admin Dashboard Operations Summary
  await call('API-112', 'Admin Dashboard Summary', 'GET', '/admin/dashboard/summary', adminHeader);

  // API-113: Admin Dashboard Recent Activity Stream
  await call('API-113', 'Admin Dashboard Recent Activity', 'GET', '/admin/dashboard/activity', adminHeader);

  // API-114: Admin List All Users
  await call('API-114', 'Admin List All Users', 'GET', '/admin/users?page=1&limit=10', adminHeader);

  // API-115: Admin Get User by ID
  await call('API-115', 'Admin Get User by ID', 'GET', `/admin/users/${contractorUserId}`, adminHeader);

  // API-116: Admin Create User (Administrative Provisioning)
  const provEmail = 'staff_' + Date.now() + '@deckestimator.com';
  const createUserRes = await call('API-116', 'Admin Create User', 'POST', '/admin/users', adminHeader, {
    fullName: 'Support Staff Specialist',
    email: provEmail,
    password: 'StaffSecure123!',
    role: 'customer',
    accountStatus: 'active'
  });
  const createdUserId = createUserRes.data?.data?.user?.id || createUserRes.data?.data?.id;

  // API-117: Admin Update User Profile
  await call('API-117', 'Admin Update User Profile', 'PATCH', `/admin/users/${createdUserId}`, adminHeader, {
    fullName: 'Support Staff Specialist (Promoted)',
    phone: '+1-555-123-4567'
  });

  // API-118: Admin Update User Account Status (Suspend / Reactivate)
  await call('API-118', 'Admin Update User Status', 'PATCH', `/admin/users/${createdUserId}/status`, adminHeader, {
    accountStatus: 'suspended',
    reason: 'Temporary administrative audit hold'
  });

  // API-119: Admin List All Deck Records
  await call('API-119', 'Admin List All Decks', 'GET', '/admin/decks?page=1&limit=10', adminHeader);

  // API-120: Admin List All Estimates
  await call('API-120', 'Admin List All Estimates', 'GET', '/admin/estimates?page=1&limit=10', adminHeader);

  // API-121: Admin List All AI Condition Analyses
  await call('API-121', 'Admin List All AI Analyses', 'GET', '/admin/analyses?page=1&limit=10', adminHeader);

  // API-122: Admin List Platform Settings
  await call('API-122', 'Admin List Platform Settings', 'GET', '/admin/settings', adminHeader);

  // API-124: Admin Create Platform Setting
  const settingKey = 'SETTING_' + Math.floor(Math.random() * 9000 + 1000);
  await call('API-124', 'Admin Create Platform Setting', 'POST', '/admin/settings', adminHeader, {
    key: settingKey,
    category: 'GENERAL',
    label: 'Platform Notification Toggle',
    description: 'Enables realtime contractor notifications',
    valueType: 'BOOLEAN',
    value: true,
    isPublic: true,
    isActive: true
  });

  // API-123: Admin Get Platform Setting by Key
  await call('API-123', 'Admin Get Setting by Key', 'GET', `/admin/settings/${settingKey}`, adminHeader);

  // API-125: Admin Update / Toggle Platform Setting
  await call('API-125', 'Admin Update Platform Setting', 'PATCH', `/admin/settings/${settingKey}`, adminHeader, {
    value: false,
    description: 'Disabled for maintenance window'
  });

  // API-126: Admin Query Forensic Audit Trail
  await call('API-126', 'Admin Query Audit Logs', 'GET', '/admin/audit-logs?page=1&limit=10', adminHeader);

  // API-127: Admin Export Analytical Report (CSV / JSON)
  await call('API-127', 'Admin Export CSV Report', 'GET', '/admin/reports/users?format=csv', adminHeader);

  console.log('\n========================================================================');
  console.log(`--- BATCH 4 EXECUTION COMPLETE: ${passedCount} / ${passedCount + failedCount} CHECKS PASSED ---`);
  console.log('========================================================================\n');
}

run().catch(console.error);
