// ============================================================================
// Deck Estimator - Batch 3 (APIs 061 - 090) Automated Live HTTP Verification
// ============================================================================

const fs = require('fs');

async function testThird30Apis() {
  const baseUrl = 'http://localhost:5000/api/v1';
  console.log('========================================================================');
  console.log('--- EXECUTING LIVE HTTP VERIFICATION: API-061 TO API-090 ---');
  console.log('Server Base URL: ' + baseUrl);
  console.log('========================================================================\n');

  const results = [];

  async function call(apiId, name, method, endpoint, headers = {}, body = null) {
    const opts = { method, headers: { ...headers } };
    if (body) {
      if (Buffer.isBuffer(body)) {
        opts.body = body;
      } else if (typeof body === 'object') {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      } else {
        opts.body = body;
      }
    }

    const start = Date.now();
    let res, data;
    try {
      res = await fetch(baseUrl + endpoint, opts);
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }
    } catch (err) {
      return { apiId, name, method, endpoint, status: 'ERROR', error: err.message, ok: false };
    }
    const elapsed = Date.now() - start;

    const ok = res.status >= 200 && res.status < 300;
    const record = { apiId, name, method, endpoint, status: res.status, ok, elapsed, data };
    results.push(record);

    console.log(`[${ok ? 'PASS' : 'FAIL'}] ${apiId}: ${method} ${endpoint} -> Status ${res.status} (${elapsed}ms)`);
    if (!ok) {
      console.log('   Error Detail:', JSON.stringify(data));
    }
    return record;
  }

  // --- 1. Admin Authentication ---
  const adminLogin = await call('SETUP', 'Admin Auth', 'POST', '/auth/login', {}, {
    email: 'admin@deckestimator.com',
    password: 'AdminPass123!'
  });
  const adminToken = adminLogin.data?.data?.token;
  const adminHeader = { 'Authorization': 'Bearer ' + adminToken };

  // --- 2. Customer Authentication & Prerequisites ---
  const custEmail = 'customer_b3_' + Date.now() + '@example.com';
  const custReg = await call('SETUP', 'Customer Reg', 'POST', '/auth/register', {}, {
    fullName: 'Batch3 Customer Tester',
    email: custEmail,
    password: 'SecurePassword123!',
    phone: '+1-555-333-4444',
    role: 'customer'
  });
  const customerToken = custReg.data?.data?.token;
  const custHeader = { 'Authorization': 'Bearer ' + customerToken };

  // Customer Deck
  const deckRes = await call('SETUP', 'Create Deck', 'POST', '/decks', custHeader, {
    projectName: 'Batch3 Primary Deck ' + Date.now(),
    deckShape: 'rectangle',
    dimensions: { length: 22, width: 14 }
  });
  const deckId = deckRes.data?.data?.deck?.id || deckRes.data?.data?.id;

  // Upload an image to the deck for condition analysis check
  const validPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82
  ]);
  const imgBoundary = '----WebKitFormBoundaryImg' + Math.random().toString(36).substring(2);
  const imgPart1 = '--' + imgBoundary + '\r\n' +
    'Content-Disposition: form-data; name="images"; filename="deck_analysis_photo.png"\r\n' +
    'Content-Type: application/octet-stream\r\n\r\n';
  const imgPart2 = '\r\n--' + imgBoundary + '--\r\n';
  const imgBody = Buffer.concat([Buffer.from(imgPart1, 'utf-8'), validPng, Buffer.from(imgPart2, 'utf-8')]);
  await call('SETUP', 'Upload Deck Photo', 'POST', `/decks/${deckId}/images`, {
    ...custHeader,
    'Content-Type': 'multipart/form-data; boundary=' + imgBoundary
  }, imgBody);

  // --- 3. Contractor Registration ---
  const contEmail = 'contractor_b3_' + Date.now() + '@example.com';
  const contReg = await call('SETUP', 'Contractor Reg', 'POST', '/auth/register', {}, {
    fullName: 'Bob Contractor Builder',
    email: contEmail,
    password: 'SecurePassword123!',
    phone: '+1-555-999-0000',
    role: 'contractor',
    businessName: 'Apex Deck Masters LLC',
    licenseNumber: 'LIC-TX-2026-B3'
  });
  const contractorToken = contReg.data?.data?.token;
  const contHeader = { 'Authorization': 'Bearer ' + contractorToken };
  const contractorUserId = contReg.data?.data?.user?.id;

  // ==========================================================================
  // PHASE 7: CONDITION ANALYSIS (API-061 to API-066)
  // (Scheduled for removal per user instructions)
  // ==========================================================================

  // API-061: ML Microservice Health Check
  await call('API-061', 'ML Service Health Check', 'GET', '/condition-analyses/ml-health', custHeader);

  // API-062: Run AI Condition Analysis for Deck (Invokes Python ML service - expected 500 when offline)
  await call('API-062', 'Run AI Condition Analysis', 'POST', `/condition-analyses/decks/${deckId}/analyses`, custHeader, {
    notes: 'Triggered condition assessment in batch 3'
  });

  // API-063: List Deck Condition Analyses
  const analysesRes = await call('API-063', 'List Deck Analyses', 'GET', `/condition-analyses/decks/${deckId}/analyses`, custHeader);
  const realAnalysisId = analysesRes.data?.data?.analyses?.[0]?.id || analysesRes.data?.data?.[0]?.id;
  const analysisIdToUse = realAnalysisId || '6ae8ce800000000000000001';

  // API-064: Get Condition Analysis by ID
  await call('API-064', 'Get Condition Analysis by ID', 'GET', `/condition-analyses/${analysisIdToUse}`, custHeader);

  // API-065: Retry Failed Condition Analysis
  await call('API-065', 'Retry Condition Analysis', 'POST', `/condition-analyses/${analysisIdToUse}/retry`, custHeader);

  // API-066: Review / Override AI Condition Analysis
  await call('API-066', 'Review Condition Analysis', 'PATCH', `/condition-analyses/${analysisIdToUse}/review`, adminHeader, {
    reviewStatus: 'RESOLVED',
    reviewNotes: 'Admin manual review evaluation'
  });

  // ==========================================================================
  // PHASE 8: CONTRACTOR VERIFICATION & PROFILE (API-067 to API-076)
  // ==========================================================================

  // API-067: Get Current Contractor Profile
  const profileRes = await call('API-067', 'Get Contractor Profile', 'GET', '/contractors/me', contHeader);
  const contractorProfileId = profileRes.data?.data?.profile?.id || profileRes.data?.data?.id;

  // API-068: Update Contractor Profile
  await call('API-068', 'Update Contractor Profile', 'PATCH', '/contractors/me', contHeader, {
    businessDescription: 'Expert residential deck builder with 15 years experience',
    yearsOfExperience: 15,
    supportedSurfaceTypes: ['wood', 'composite']
  });

  // API-069: Submit Contractor Verification Application
  await call('API-069', 'Submit Verification Application', 'POST', '/contractors/me/verification/submit', contHeader, {
    notes: 'Submitted trade license and insurance documentation for review'
  });

  // API-070: Upload Contractor Verification Document (With documentType in form-data)
  const docBuffer = Buffer.from('Mock PDF Content for Trade License LIC-TX-2026-B3');
  const boundary = '----WebKitFormBoundaryDoc' + Math.random().toString(36).substring(2);
  const part1 = '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="documentType"\r\n\r\n' +
    'contractor_license\r\n';
  const part2 = '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="document"; filename="trade_license.pdf"\r\n' +
    'Content-Type: application/pdf\r\n\r\n';
  const part3 = '\r\n--' + boundary + '--\r\n';
  const docMultipart = Buffer.concat([
    Buffer.from(part1, 'utf-8'),
    Buffer.from(part2, 'utf-8'),
    docBuffer,
    Buffer.from(part3, 'utf-8')
  ]);

  const docUploadRes = await call(
    'API-070',
    'Upload Verification Document',
    'POST',
    '/contractors/me/verification/documents',
    { ...contHeader, 'Content-Type': 'multipart/form-data; boundary=' + boundary },
    docMultipart
  );
  const uploadedDoc = docUploadRes.data?.data?.document || docUploadRes.data?.data;
  const uploadedDocId = uploadedDoc?.id || uploadedDoc?._id;

  // API-071: List Contractor Uploaded Documents
  await call('API-071', 'List Verification Documents', 'GET', '/contractors/me/verification/documents', contHeader);

  // API-072: Serve Contractor Verification Document File
  if (uploadedDocId) {
    await call('API-072', 'Download Verification Document', 'GET', `/contractors/documents/${uploadedDocId}/file`, contHeader);
  }

  // API-073: List Eligible Approved Contractors
  await call('API-073', 'List Eligible Contractors', 'GET', '/contractors/eligible', adminHeader);

  // API-074: Admin List Contractor Verification Applications
  await call('API-074', 'Admin List Verifications', 'GET', '/contractors/admin/verifications', adminHeader);

  // API-075: Admin Get Contractor Verification Details
  await call('API-075', 'Admin Get Verification Details', 'GET', `/contractors/admin/verifications/${contractorProfileId}`, adminHeader);

  // API-076: Admin Review & Approve Contractor
  await call('API-076', 'Admin Approve Contractor', 'POST', `/contractors/admin/verifications/${contractorProfileId}/review`, adminHeader, {
    action: 'APPROVE',
    reviewNotes: 'Verified license against state registry. Approved.'
  });

  // Re-login contractor so token reflects approved verification status
  const contLogin2 = await call('SETUP', 'Contractor Re-Auth', 'POST', '/auth/login', {}, {
    email: contEmail,
    password: 'SecurePassword123!'
  });
  const approvedContToken = contLogin2.data?.data?.token;
  const approvedContHeader = { 'Authorization': 'Bearer ' + approvedContToken };

  // ==========================================================================
  // PHASE 8: LEADS & WORKFLOW (API-077 to API-090)
  // ==========================================================================

  // API-077: Create Customer Lead (Quote Inquiry)
  const leadRes = await call('API-077', 'Create Customer Lead', 'POST', '/leads', custHeader, {
    deckId: deckId,
    enquiry: {
      subject: 'Inquiry for Full Cedar Deck Staining',
      message: 'Looking for a reliable contractor to complete staining next week.',
      preferredContactMethod: 'email',
      preferredContactTime: 'morning'
    }
  });
  const primaryLead = leadRes.data?.data?.lead || leadRes.data?.data;
  const primaryLeadId = primaryLead?.id || primaryLead?._id;

  // Secondary Lead for rejection test
  const leadTempRes = await call('SETUP', 'Create Secondary Lead', 'POST', '/leads', custHeader, {
    deckId: deckId,
    enquiry: {
      subject: 'Secondary Deck Repair Inquiry',
      message: 'Need power washing and board inspection.',
      preferredContactMethod: 'phone'
    }
  });
  const secondaryLead = leadTempRes.data?.data?.lead || leadTempRes.data?.data;
  const secondaryLeadId = secondaryLead?.id || secondaryLead?._id;

  // API-078: Customer List Own Leads
  await call('API-078', 'Customer List Own Leads', 'GET', '/leads/my-leads', custHeader);

  // API-079: Admin List All Platform Leads
  await call('API-079', 'Admin List All Leads', 'GET', '/leads/admin/all', adminHeader);

  // API-080: Admin Lead Analytics & Metrics
  await call('API-080', 'Admin Lead Analytics', 'GET', '/leads/admin/analytics', adminHeader);

  // API-081: Admin Assign Lead to Contractor (Assign both primary and secondary)
  await call('API-081', 'Admin Assign Primary Lead', 'POST', `/leads/admin/${primaryLeadId}/assign`, adminHeader, {
    contractorId: contractorUserId,
    assignmentReason: 'Matched by zip code and wood specialty'
  });
  await call('SETUP', 'Admin Assign Secondary Lead', 'POST', `/leads/admin/${secondaryLeadId}/assign`, adminHeader, {
    contractorId: contractorUserId,
    assignmentReason: 'Assignment for rejection testing'
  });

  // API-084: Contractor Lead Inbox
  await call('API-084', 'Contractor Lead Inbox', 'GET', '/leads/contractor/inbox', approvedContHeader);

  // API-086: Contractor Reject Secondary Lead
  await call('API-086', 'Contractor Reject Lead', 'POST', `/leads/contractor/${secondaryLeadId}/reject`, approvedContHeader, {
    reason: 'Fully booked during requested timeframe'
  });

  // API-085: Contractor Accept Primary Lead
  await call('API-085', 'Contractor Accept Lead', 'POST', `/leads/contractor/${primaryLeadId}/accept`, approvedContHeader);

  // API-087: Contractor Update Lead Operational Status
  await call('API-087', 'Contractor Update Status', 'PATCH', `/leads/contractor/${primaryLeadId}/status`, approvedContHeader, {
    status: 'contacted',
    notes: 'Left message with customer regarding schedule'
  });

  // API-088: Get Lead Details by ID
  await call('API-088', 'Get Lead Details by ID', 'GET', `/leads/${primaryLeadId}`, approvedContHeader);

  // API-089: Get Lead Activity Stream
  await call('API-089', 'Get Lead Activity Stream', 'GET', `/leads/${primaryLeadId}/activities`, approvedContHeader);

  // API-090: Add Communication Note to Lead
  await call('API-090', 'Add Note to Lead', 'POST', `/leads/${primaryLeadId}/notes`, approvedContHeader, {
    description: 'Customer confirmed availability for Wednesday site visit',
    visibility: 'INTERNAL'
  });

  // API-082: Admin Close Lead
  await call('API-082', 'Admin Close Lead', 'POST', `/leads/admin/${primaryLeadId}/close`, adminHeader, {
    action: 'CLOSE',
    reason: 'Job completed and verified'
  });

  // API-083: Admin Get Lead Lifecycle History
  await call('API-083', 'Admin Get Lead History', 'GET', `/leads/admin/${primaryLeadId}/history`, adminHeader);

  console.log('\n========================================================================');
  const passed = results.filter(r => r.ok && r.apiId.startsWith('API-')).length;
  const total = results.filter(r => r.apiId.startsWith('API-')).length;
  console.log(`--- BATCH 3 EXECUTION COMPLETE: ${passed} / ${total} APIS PASSED ---`);
  console.log('========================================================================\n');

  return results;
}

testThird30Apis().catch(console.error);
