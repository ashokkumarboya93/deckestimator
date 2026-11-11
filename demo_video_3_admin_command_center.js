// ============================================================================
// VIDEO 3: ADMIN COMMAND CENTER COMPLETE OPERATIONAL WALKTHROUGH
// ============================================================================
// 1. Admin Sign In & Real-Time KPI Dashboard
// 2. User Management with Auto-Search & Dedicated Profile Inspection
// 3. Verification & Compliance with Location/Timestamp & Document Preview
// 4. Lead Management: Hot Leads, Location & Accept Request Action
// 5. Project Management: Single-Row KPIs, 0-100% Progress Update & CSV Export
// 6. Pricing & Discounts with Individual Contractor Discount Tuning
// 7. Reports & Business Analytics with Live Aggregation Data
// 8. System Settings: Contact Channels (Phone/WhatsApp) & Notification Dispatcher
// 9. Admin Profile: Parent/Child Admin Roles & Photo Upload
// ============================================================================

const { createDemoSession, sleep } = require('./demo_engine');

async function runVideo3() {
  const session = await createDemoSession('VIDEO 3: ADMIN COMMAND CENTER DEEP DIVE');
  const { page, BASE_URL, speak, smoothScrollTo, spotlight, centerActiveForm, clearSession, browser } = session;

  try {
    // ------------------------------------------------------------------------
    // SCENE 1: ADMIN LOGIN & COMMAND DASHBOARD
    // ------------------------------------------------------------------------
    await clearSession();
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
    await page.mouse.click(100, 100);
    await centerActiveForm();

    await speak('ADMIN COMMAND CENTER', 'Welcome to Video 3: A comprehensive walkthrough of the Deck Restoration Plus Administrative Command Center.');
    await sleep(600);

    await page.type('input[type="email"]', 'admin@deckestimator.com', { delay: 35 });
    await page.type('input[type="password"]', 'Admin@123456', { delay: 35 });
    await sleep(500);
    await page.click('button[type="submit"]');

    await page.waitForFunction(() => window.location.pathname.includes('/admin/'), { timeout: 6000 }).catch(() => {});
    await sleep(1400);

    await speak('REAL-TIME DASHBOARD', 'The Admin Dashboard delivers 100% genuine database metrics: verified users, active estimates, and live activity streams.');
    await spotlight('div[style*="grid-template-columns"], [class*="kpi"], [class*="stat"]', 3500);
    await sleep(1000);

    // ------------------------------------------------------------------------
    // SCENE 2: USER MANAGEMENT & PROFILE INSPECTION
    // ------------------------------------------------------------------------
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    await speak('USER MANAGEMENT', 'User Management features dedicated tabs for All Users, Customers, and Contractors with instant auto-search as you type.');
    await spotlight('input[type="text"], input[placeholder*="Search"]', 2500);

    // Auto-search demonstration
    await page.type('input[type="text"]', 'alex', { delay: 80 });
    await sleep(1200);
    await speak('AUTO-SEARCH', 'Notice that results filter immediately as you enter characters, with zero need for a search button.');

    // Clear search
    await page.evaluate(() => {
      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await sleep(800);

    await speak('DEDICATED PROFILE VIEW', 'Clicking Profile reveals a dedicated profile dossier displaying contact info, photos, past estimations, and contractor documents.');
    await spotlight('button', 2500);
    await sleep(1200);

    // ------------------------------------------------------------------------
    // SCENE 3: VERIFICATION & COMPLIANCE
    // ------------------------------------------------------------------------
    await page.goto(`${BASE_URL}/admin/verifications`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    await speak('VERIFICATION & PROGRESS', 'In Verification and Progress, the View button opens contractor details complete with exact timestamp and geographic location.');
    await spotlight('table, tr', 2500);
    await sleep(1000);

    await page.evaluate(() => {
      const docsTab = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Contractor Documents') || b.innerText.includes('Documents'));
      if (docsTab) docsTab.click();
    });
    await sleep(1200);
    await speak('DOCUMENT PREVIEW MODE', 'In the Contractor Documents tab, administrators inspect real contractor license files in live preview mode before approving.');
    await sleep(1500);

    // ------------------------------------------------------------------------
    // SCENE 4: LEAD MANAGEMENT
    // ------------------------------------------------------------------------
    await page.goto(`${BASE_URL}/admin/leads`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    await speak('HOT LEAD MANAGEMENT', 'Lead Management tracks incoming homeowner inquiries with exact date, time, location, and clean icon status indicators.');
    await spotlight('table, tr, [class*="lead"]', 3000);
    await sleep(1200);

    await speak('ACCEPT REQUEST ACTION', 'Opening any lead preview allows administrators to accept the request, updating project status directly to In Progress.');
    await sleep(1400);

    // ------------------------------------------------------------------------
    // SCENE 5: PROJECT MANAGEMENT
    // ------------------------------------------------------------------------
    await page.goto(`${BASE_URL}/admin/projects`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    await speak('SINGLE-ROW SUMMARY CARDS', 'In Project Management, compact KPI summary cards are organized in a single sleek row, showing 100% genuine database projects.');
    await spotlight('div[style*="display: flex"], [class*="summary"]', 3000);
    await sleep(1200);

    await speak('PROGRESS UPDATES & CSV EXPORT', 'Administrators can update milestone progress from 0 to 100% with full audit trails, or export all project rows to CSV and Excel.');
    await sleep(1800);

    // ------------------------------------------------------------------------
    // SCENE 6: PRICING & DISCOUNTS
    // ------------------------------------------------------------------------
    await page.goto(`${BASE_URL}/admin/pricing-discounts`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    await speak('PRICING CONFIGURATION', 'Pricing and Discounts allows tuning master architectural rate cards and setting material cost multipliers.');
    await sleep(1200);

    // Contractor discount tuning
    await page.evaluate(() => {
      const tuningTab = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Contractor Discount') || b.innerText.includes('Discount'));
      if (tuningTab) tuningTab.click();
    });
    await sleep(1200);

    await speak('CONTRACTOR DISCOUNT TUNING', 'In the Contractor Discount Tuning tab, administrators can search, filter, and adjust wholesale discounts specifically per partner with live Save capability.');
    await spotlight('div[style*="overflow"], table, input', 3000);
    await sleep(1500);

    // ------------------------------------------------------------------------
    // SCENE 7: BUSINESS ANALYTICS & REPORTS
    // ------------------------------------------------------------------------
    await page.goto(`${BASE_URL}/admin/reports`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    await speak('BUSINESS ANALYTICS', 'Reports and Business Analytics renders real-time performance curves, revenue aggregates, and conversion analytics with zero mock data.');
    await spotlight('canvas, svg, div[style*="height"]', 3500);
    await sleep(1500);

    // ------------------------------------------------------------------------
    // SCENE 8: SYSTEM SETTINGS & COMMUNICATIONS
    // ------------------------------------------------------------------------
    await page.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    await speak('CONTACT CHANNELS SYNC', 'In System Settings, administrators configure customer and contractor contact channels—including phone number, WhatsApp, and office address—synchronized live across all portals.');
    await spotlight('form, div[style*="background"]', 3000);
    await sleep(1500);

    await speak('NOTIFICATION DISPATCHER', 'Our Targeted Notification Dispatcher enables instant system-wide broadcasts to customers, contractors, or all registered accounts.');
    await sleep(1500);

    // ------------------------------------------------------------------------
    // SCENE 9: ADMIN PROFILE & ROLES
    // ------------------------------------------------------------------------
    await page.goto(`${BASE_URL}/admin/profile`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    await speak('ADMIN PROFILE & HIERARCHY', 'The Admin Profile allows personal details updating, photo uploads, and parent-child administrator role delegation.');
    await spotlight('form, [class*="profile"]', 3000);
    await sleep(1800);

    // Conclusion
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await speak('CONCLUSION', 'This concludes the full Admin Command Center demonstration. The Deck Restoration Plus platform is secure, synchronized, and ready for production.');
    await sleep(4000);

    console.log('Video 3 finished successfully.');
  } catch (err) {
    console.error('Error in Video 3:', err);
  } finally {
    await sleep(4000);
    await browser.close();
  }
}

runVideo3().catch(console.error);

