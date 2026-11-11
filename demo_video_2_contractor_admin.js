// ============================================================================
// VIDEO 2: CONTRACTOR PORTAL & ADMIN VERIFICATION/COMPLIANCE LIVE DEMO
// ============================================================================
// 1. Landing Page & Live Calculator Test
// 2. Contractor Authentication & Pending Verification State
// 3. Wholesale Contractor Estimator with Live 10% Partner Discount
// 4. Contractor Projects Management & Conversion (Zero Validation Errors)
// 5. Cross-Portal Admin Verification: Contractor Details, Timestamp & Doc Preview
// 6. Admin 1-Click Contractor Approval
// ============================================================================

const { createDemoSession, sleep } = require('./demo_engine');

async function runVideo2() {
  const session = await createDemoSession('VIDEO 2: CONTRACTOR & ADMIN VERIFICATION');
  const { page, BASE_URL, speak, smoothScrollTo, spotlight, centerActiveForm, clearSession, browser } = session;

  try {
    // ------------------------------------------------------------------------
    // SCENE 1: LANDING PAGE & CALCULATOR TRIAL
    // ------------------------------------------------------------------------
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.mouse.click(100, 100);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

    await speak('CONTRACTOR DEMO', 'Welcome to Video 2. Here we demonstrate our Contractor Partner Portal and Administrative Verification pipeline.');
    await sleep(600);

    // Test quick calculator on landing page
    await smoothScrollTo(360, 1000);
    await speak('LANDING CALCULATOR', 'Before signing in, contractors and clients can benchmark public retail pricing using our live landing page calculator.');
    await spotlight('section, [class*="calculator"], div[style*="border-radius: 24px"]', 3000);

    await page.evaluate(() => {
      const selects = document.querySelectorAll('select');
      if (selects[0]) selects[0].value = '600 sq ft';
      if (selects[1]) selects[1].value = 'Pressure Treated';
      if (selects[2]) selects[2].value = 'Wash & Seal';
      selects.forEach((s) => s.dispatchEvent(new Event('change', { bubbles: true })));
    });
    await sleep(1200);

    await speak('RETAIL BENCHMARK', 'The calculator instantly computes commercial labor and materials so contractors can reference standard retail rates.');
    await sleep(1000);

    // ------------------------------------------------------------------------
    // SCENE 2: CONTRACTOR AUTHENTICATION & PENDING ONBOARDING
    // ------------------------------------------------------------------------
    await clearSession();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="email"]', { visible: true, timeout: 15000 });
    await page.mouse.click(100, 100);
    await centerActiveForm();

    await speak('CONTRACTOR LOGIN', 'Now let us sign in as a certified contractor to explore the wholesale contractor experience.');

    await page.type('input[type="email"]', 'alex.builder@gmail.com', { delay: 35 });
    await page.type('input[type="password"]', 'Password123!', { delay: 35 });
    await sleep(500);
    await page.click('button[type="submit"]');

    await page.waitForFunction(() => window.location.pathname.includes('/contractor/'), { timeout: 6000 }).catch(() => {});
    await sleep(1400);

    // ------------------------------------------------------------------------
    // SCENE 3: CONTRACTOR DASHBOARD & WHOLESALE ESTIMATOR
    // ------------------------------------------------------------------------
    await speak('CONTRACTOR DASHBOARD', 'Welcome to the Contractor Dashboard, featuring our high-visibility logo, 4 summary KPI cards, and quick actions.');
    await spotlight('div[style*="grid-template-columns"], [class*="kpi"]', 3000);
    await sleep(1000);

    await speak('WHOLESALE RATE CARD', 'Partners unlock our wholesale trade pricing. Let us open the Contractor Estimator.');
    await page.goto(`${BASE_URL}/contractor/decks/new`, { waitUntil: 'networkidle2' });
    await sleep(1400);

    // Scroll to wholesale price box
    await smoothScrollTo(2600, 1400);
    await spotlight('[style*="box-shadow"], [style*="border: 2px solid"]', 3500);
    await speak('WHOLESALE DISCOUNT', 'Notice our contractor estimate box: wholesale savings of 10 percent are deducted live with zero blank space.');
    await sleep(1200);

    // ------------------------------------------------------------------------
    // SCENE 4: CONTRACTOR PROJECTS & CONVERSION
    // ------------------------------------------------------------------------
    await page.goto(`${BASE_URL}/contractor/projects`, { waitUntil: 'networkidle2' });
    await speak('CONTRACTOR PROJECTS', 'In Contractor Projects, partners convert estimates into active bookings with zero validation errors, or export to Excel.');
    await spotlight('table, tr, [class*="project"]', 3000);
    await sleep(1800);

    // ------------------------------------------------------------------------
    // SCENE 5: CROSS-PORTAL ADMIN VERIFICATION & DOCUMENT PREVIEW
    // ------------------------------------------------------------------------
    await speak('ADMIN VERIFICATION', 'Now let us examine how the Administrator verifies and approves contractor credentials in real time.');

    await clearSession();
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[type="email"]', { visible: true, timeout: 15000 });
    await centerActiveForm();

    await page.type('input[type="email"]', 'admin@deckestimator.com', { delay: 35 });
    await page.type('input[type="password"]', 'Admin@123456', { delay: 35 });
    await sleep(500);
    await page.click('button[type="submit"]');

    await page.waitForFunction(() => window.location.pathname.includes('/admin/'), { timeout: 6000 }).catch(() => {});
    await sleep(1200);

    // Navigate to Verification & Progress
    await page.goto(`${BASE_URL}/admin/verification-progress`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    await speak('VERIFICATION PIPELINE', 'Here is the Verification and Progress hub. In the Verifications tab, clicking View displays contractor details with exact timestamp and location.');
    await spotlight('table, tr, button', 2800);

    // Open view popup
    await page.evaluate(() => {
      const viewBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('View'));
      if (viewBtn) viewBtn.click();
    });
    await sleep(2000);

    // Close popup
    await page.evaluate(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Close') || b.innerText.includes('×'));
      if (closeBtn) closeBtn.click();
    });
    await sleep(1000);

    // Switch to Contractor Documents tab
    await speak('LIVE DOCUMENT PREVIEW', 'In Contractor Documents, the admin inspects trade licenses and liability certificates in live preview mode before approving.');
    await page.evaluate(() => {
      const docsTab = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Contractor Documents') || b.innerText.includes('Documents'));
      if (docsTab) docsTab.click();
    });
    await sleep(2000);
    await spotlight('div[style*="overflow"], [class*="document"]', 3000);

    await speak('1-CLICK APPROVAL', 'With a single click, the administrator approves the contractor, immediately granting active job dispatch and wholesale tier discounts.');
    await sleep(1500);

    await speak('CONCLUSION', 'This concludes Video 2. We have demonstrated the contractor wholesale estimator, project conversion, and administrative compliance verification.');
    await sleep(3000);

    console.log('Video 2 finished successfully.');
  } catch (err) {
    console.error('Error in Video 2:', err);
  } finally {
    await sleep(4000);
    await browser.close();
  }
}

runVideo2().catch(console.error);

