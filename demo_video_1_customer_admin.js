// ============================================================================
// VIDEO 1: CUSTOMER JOURNEY & ADMIN LEAD MANAGEMENT LIVE DEMO
// ============================================================================
// 1. Landing Page & Live Calculator Test
// 2. Customer Sign In
// 3. 7-Step Continuous Estimator Walkthrough & Single-Price Estimate Box
// 4. Request Booking & Reach-out
// 5. Customer Projects Dossier
// 6. Cross-Portal Admin Synchronization: Hot Lead Captured & Accepted
// ============================================================================

const { createDemoSession, sleep } = require('./demo_engine');

async function runVideo1() {
  const session = await createDemoSession('VIDEO 1: CUSTOMER & ADMIN SYNC');
  const { page, BASE_URL, speak, smoothScrollTo, spotlight, centerActiveForm, clearSession, browser } = session;

  try {
    // ------------------------------------------------------------------------
    // SCENE 1: LANDING PAGE & CALCULATOR TRIAL
    // ------------------------------------------------------------------------
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.mouse.click(100, 100); // Unblock audio policy
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

    await speak('LANDING PAGE', 'Welcome to Deck Restoration Plus. In this demonstration, we showcase our complete Homeowner and Admin live workflow.');
    await sleep(600);

    await speak('HERO SECTION', 'Our landing page features an immersive full-screen hero, official mascot portrait, and clean SVG vector icons with zero emojis.');
    await sleep(600);

    // Scroll to interactive calculator
    await smoothScrollTo(360, 1000);
    await speak('QUICK CALCULATOR', 'Let us test our instant Deck Restoration Calculator directly on the landing page.');
    await spotlight('section, [class*="calculator"], div[style*="border-radius: 24px"]', 3000);

    // Live interaction with calculator
    await page.evaluate(() => {
      const selects = document.querySelectorAll('select');
      if (selects[0]) selects[0].value = '400 sq ft';
      if (selects[1]) selects[1].value = 'Cedar';
      if (selects[2]) selects[2].value = 'Full Restoration';
      selects.forEach((s) => s.dispatchEvent(new Event('change', { bubbles: true })));
    });
    await sleep(1000);

    await speak('ACCURATE PRICING', 'Notice the instant accurate price range calculation updating dynamically based on wood type, square footage, and service level.');
    await sleep(1000);

    // ------------------------------------------------------------------------
    // SCENE 2: CUSTOMER AUTHENTICATION
    // ------------------------------------------------------------------------
    await clearSession();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.mouse.click(100, 100);
    await centerActiveForm();

    await speak('CUSTOMER LOGIN', 'Now let us sign in as a registered homeowner to access the interactive customer workspace.');

    await page.type('input[type="email"]', 'customer@gmail.com', { delay: 35 });
    await page.type('input[type="password"]', 'Password123!', { delay: 35 });
    await sleep(500);
    await page.click('button[type="submit"]');

    await page.waitForFunction(() => window.location.pathname.includes('/customer/'), { timeout: 6000 }).catch(() => {});
    await sleep(1200);

    // ------------------------------------------------------------------------
    // SCENE 3: CUSTOMER DASHBOARD & 7-STEP CONTINUOUS ESTIMATOR
    // ------------------------------------------------------------------------
    await speak('CUSTOMER DASHBOARD', 'Here is the Customer Dashboard, featuring KPI project summaries and immediate access to past blueprints.');
    await sleep(800);

    await speak('NEW ESTIMATE', 'Let us create a new estimate using our continuous architectural calculation engine.');
    await page.goto(`${BASE_URL}/customer/decks/new`, { waitUntil: 'networkidle2' });
    await sleep(1200);

    // Step 1: Dimensions
    await smoothScrollTo(420, 1000);
    await speak('STEP 1: DIMENSIONS', 'Step 1: The homeowner inputs exact deck dimensions, ground elevation, and structural layout.');
    await sleep(800);

    // Step 2 & 3: Railings & Wood Species
    await smoothScrollTo(950, 1000);
    await speak('STEP 2 & 3: SPECIFICATIONS', 'Step 2 and 3: Selecting architectural railing styles, stair configurations, and premium wood species.');
    await sleep(800);

    // Step 5 & 6: Chemistry & Finishes
    await smoothScrollTo(1680, 1200);
    await speak('STEP 5 & 6: FINISHES', 'Step 5 and 6: Choosing deep cleaning wash chemistry, stripping, and long-lasting protective finishes.');
    await sleep(800);

    // Step 7: Official Estimate Result Box
    await smoothScrollTo(2600, 1400);
    await spotlight('[style*="box-shadow"], [style*="border: 2px solid"]', 3500);
    await speak('OFFICIAL ESTIMATE', 'Here is the Official Estimate Box. It presents ONE clear, transparent total price with zero confusing cost breakdown.');
    await sleep(1000);

    await speak('MINIMUM JOB FLOOR', 'Homeowners can apply our standard $2,500 mobilization floor with a single click.');
    await sleep(1000);

    // ------------------------------------------------------------------------
    // SCENE 4: BOOKING REQUEST & DOSSIER
    // ------------------------------------------------------------------------
    await speak('BOOKING REQUEST', 'The homeowner clicks Request Booking and Reach-out to submit their project directly to our dispatch team.');

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Request Booking') || b.innerText.includes('Reach-out')
      );
      if (btn) btn.click();
    });
    await sleep(2200);

    await page.goto(`${BASE_URL}/customer/projects`, { waitUntil: 'networkidle2' });
    await speak('MY PROJECTS DOSSIER', 'In My Projects, the customer can track real-time milestone status, filter records, and export official PDF project dossiers.');
    await sleep(2000);

    // ------------------------------------------------------------------------
    // SCENE 5: CROSS-PORTAL ADMIN SYNCHRONIZATION
    // ------------------------------------------------------------------------
    await speak('ADMIN DISPATCH', 'Now let us see the magic of real-time synchronization on the Administrator side.');

    await clearSession();
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
    await centerActiveForm();

    await page.type('input[type="email"]', 'admin@deckestimator.com', { delay: 35 });
    await page.type('input[type="password"]', 'Admin@123456', { delay: 35 });
    await sleep(500);
    await page.click('button[type="submit"]');

    await page.waitForFunction(() => window.location.pathname.includes('/admin/'), { timeout: 6000 }).catch(() => {});
    await sleep(1200);

    // Navigate to Lead Management
    await page.goto(`${BASE_URL}/admin/leads`, { waitUntil: 'networkidle2' });
    await sleep(1000);

    await spotlight('table, tr, [class*="lead"]', 3000);
    await speak('HOT LEAD CAPTURED', 'Instantly, the homeowner request appears inside Admin Lead Management as a HOT priority lead with location and date stamps.');
    await sleep(1000);

    // Open Preview and Accept Request
    await page.evaluate(() => {
      const previewBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.innerText.includes('Preview') || b.innerText.includes('View')
      );
      if (previewBtn) previewBtn.click();
    });
    await sleep(1500);

    await speak('ACCEPT REQUEST', 'The administrator opens the lead preview and clicks Accept Request. This automatically advances the project status to In Progress.');
    await sleep(1500);

    // Close preview or confirm
    await page.evaluate(() => {
      const acceptBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.innerText.includes('Accept') || b.innerText.includes('Close')
      );
      if (acceptBtn) acceptBtn.click();
    });
    await sleep(1500);

    await speak('CONCLUSION', 'This concludes Video 1. We have seen seamless homeowner estimation, booking requests, and instantaneous Admin lead synchronization.');
    await sleep(3000);

    console.log('Video 1 finished successfully.');
  } catch (err) {
    console.error('Error in Video 1:', err);
  } finally {
    await sleep(4000);
    await browser.close();
  }
}

runVideo1().catch(console.error);

