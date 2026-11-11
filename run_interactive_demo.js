// ============================================================================
// DECK RESTORATION PLUS — AUTOMATED LIVE DEMO WITH AUDIO & VISUAL ANIMATION
// ============================================================================
// Launches a clean Google Chrome browser window, animates through every portal
// page-by-page as specified in the script, narrates with real-time audio speech,
// and shows clean presenter caption pills on screen.
// ============================================================================

const path = require('path');
const fs = require('fs');

// Use puppeteer-core from backend
const puppeteer = require(path.resolve(__dirname, 'backend/node_modules/puppeteer-core'));

const BASE_URL = 'http://localhost:5173';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// Helper for delays
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDemo() {
  console.log('====================================================');
  console.log('  STARTING DECK RESTORATION PLUS INTERACTIVE DEMO   ');
  console.log('====================================================');
  console.log('Launching clean Google Chrome with live audio narration...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-notifications',
      '--no-default-browser-check',
    ],
  });

  const [page] = await browser.pages();
  await page.setViewport({ width: 1920, height: 1080 });

  // Inject presenter overlay helper
  async function setupPresenterHUD() {
    await page.evaluate(() => {
      if (document.getElementById('demo-presenter-hud')) return;

      const hud = document.createElement('div');
      hud.id = 'demo-presenter-hud';
      hud.style.position = 'fixed';
      hud.style.bottom = '24px';
      hud.style.left = '50%';
      hud.style.transform = 'translateX(-50%)';
      hud.style.zIndex = '9999999';
      hud.style.backgroundColor = 'rgba(11, 36, 71, 0.94)';
      hud.style.backdropFilter = 'blur(12px)';
      hud.style.color = '#FFFFFF';
      hud.style.padding = '12px 28px';
      hud.style.borderRadius = '50px';
      hud.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.35), 0 0 0 1.5px rgba(224, 129, 49, 0.45)';
      hud.style.fontFamily = "'Inter', -apple-system, sans-serif";
      hud.style.display = 'flex';
      hud.style.alignItems = 'center';
      hud.style.gap = '16px';
      hud.style.maxWidth = '900px';
      hud.style.pointerEvents = 'none';
      hud.style.transition = 'all 0.3s ease';

      hud.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px #22c55e; animation:pulse 1.5s infinite;"></span>
          <span id="demo-hud-act" style="font-size:12px; font-weight:800; color:#E08131; letter-spacing:0.05em; text-transform:uppercase;">DEMO ACTIVE</span>
        </div>
        <div style="height:18px; width:1px; background:rgba(255,255,255,0.25);"></div>
        <span id="demo-hud-text" style="font-size:14px; font-weight:500; color:#F8FAFC; line-height:1.4;">Deck Restoration Plus Live Demonstration</span>
      `;
      document.body.appendChild(hud);
    });
  }

  // Speak and update HUD with real-time speech synthesis
  async function speak(actTitle, speechText, displayTimeMs = 3500) {
    console.log(`[${actTitle}] ${speechText}`);
    await setupPresenterHUD();

    await page.evaluate(
      (act, text) => {
        const actEl = document.getElementById('demo-hud-act');
        const textEl = document.getElementById('demo-hud-text');
        if (actEl) actEl.innerText = act;
        if (textEl) textEl.innerText = text;

        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      },
      actTitle,
      speechText
    );

    await sleep(displayTimeMs);
  }

  // Smooth auto-scroll helper
  async function smoothScrollTo(selectorOrY, durationMs = 1200) {
    await page.evaluate(async (target, duration) => {
      let targetY = 0;
      if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) targetY = el.getBoundingClientRect().top + window.pageYOffset - 90;
      } else {
        targetY = target;
      }

      const startY = window.pageYOffset;
      const diff = targetY - startY;
      const startTime = performance.now();

      await new Promise((resolve) => {
        function step(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
          window.scrollTo(0, startY + diff * ease);
          if (progress < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      });
    }, selectorOrY, durationMs);
    await sleep(400);
  }

  try {
    // ========================================================================
    // ACT I: THE LANDING PAGE WALKTHROUGH
    // ========================================================================
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    // Click page to allow audio playback policy
    await page.mouse.click(100, 100);

    await speak('ACT I: LANDING PAGE', 'Welcome to Deck Restoration Plus. We begin on our high-impact modern landing page.');
    await sleep(1000);

    await speak('ACT I: LANDING PAGE', 'Notice the full-screen Hero section with our official mascot and 100% SVG vector iconography.');
    await smoothScrollTo(350, 1000);

    await speak('ACT I: LANDING PAGE', 'Homeowners can use the instant Deck Calculator right here to calculate estimated prices.');
    // Interact with quick calculator
    await page.evaluate(() => {
      const selects = document.querySelectorAll('select');
      if (selects[0]) selects[0].value = '400 sq ft';
      if (selects[1]) selects[1].value = 'Cedar';
      if (selects[2]) selects[2].value = 'Full Restoration';
      selects.forEach((s) => s.dispatchEvent(new Event('change', { bubbles: true })));
    });
    await sleep(1500);

    await smoothScrollTo('#services', 1400);
    await speak('ACT I: LANDING PAGE', 'Here are our core architectural services: Deck Cleaning, Structural Restoration, and Protective Sealers.');

    await smoothScrollTo('#products', 1400);
    await speak('ACT I: LANDING PAGE', 'Our commercial-grade products gallery showcasing proprietary penetrating stains and restoration chemistry.');

    await smoothScrollTo('#projects', 1400);
    await speak('ACT I: LANDING PAGE', 'Recent projects with interactive before and after photo comparisons.');

    await smoothScrollTo('#how-it-works', 1400);
    await speak('ACT I: LANDING PAGE', 'Our 4-step workflow guiding the customer from estimation to a beautiful, weather-protected space.');

    await smoothScrollTo('#footer', 1400);
    await speak('ACT I: LANDING PAGE', 'And our official dark navy footer featuring verified partner badges and contact channels.');
    await sleep(1500);

    // ========================================================================
    // ACT II: CUSTOMER PORTAL & REAL-TIME ESTIMATOR
    // ========================================================================
    await smoothScrollTo(0, 800);
    await speak('ACT II: CUSTOMER PORTAL', 'Now let us sign in as a homeowner to explore the Customer Portal.');

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.mouse.click(100, 100);
    await sleep(800);

    // Fill customer login
    await page.type('input[type="email"]', 'customer@gmail.com', { delay: 40 });
    await page.type('input[type="password"]', 'Password123!', { delay: 40 });
    await sleep(600);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await sleep(1500);

    await speak('ACT II: CUSTOMER PORTAL', 'Welcome to the Customer Dashboard with shiny KPI summary cards and past project history.');
    await sleep(1000);

    // Navigate to Estimator
    await speak('ACT II: CONTINUOUS ESTIMATOR', 'Let us create a brand new estimate using our 7-step architectural calculation engine.');
    await page.goto(`${BASE_URL}/customer/decks/new`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    // Scroll through estimator sections
    await smoothScrollTo(450, 1000);
    await speak('ACT II: CONTINUOUS ESTIMATOR', 'Section 1: The customer enters exact dimensions and architectural deck shape.');

    await smoothScrollTo(950, 1000);
    await speak('ACT II: CONTINUOUS ESTIMATOR', 'Section 2 and 3: Selecting architectural railings, stairs, and premium wood species.');

    await smoothScrollTo(1700, 1200);
    await speak('ACT II: CONTINUOUS ESTIMATOR', 'Section 5 and 6: Choosing deep cleaning chemistry, stripping, and protective finishes.');

    // Scroll down to official estimate result box
    await smoothScrollTo(2600, 1400);
    await speak('ACT II: ESTIMATE RESULT BOX', 'Here is the Official Estimate Result Box. Notice there is ONE single price with zero confusing breakdown.');
    await sleep(1200);

    await speak('ACT II: MINIMUM JOB PRICE', 'Homeowners can apply the standard $2,500 mobilization floor with a single click.');
    await sleep(1500);

    // ========================================================================
    // ACT III: CROSS-PORTAL SYNC (CUSTOMER REQUEST -> ADMIN LEADS)
    // ========================================================================
    await speak('ACT III: CROSS-PORTAL SYNC', 'Now we click Request Booking and Reach-out. This immediately creates a HOT priority lead for the Admin.');

    // Click request booking button
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Request Booking') || b.innerText.includes('Reach-out')
      );
      if (btn) btn.click();
    });
    await sleep(2200);

    // Navigate to Customer Projects
    await page.goto(`${BASE_URL}/customer/projects`, { waitUntil: 'networkidle2' });
    await speak('ACT III: MY PROJECTS', 'In My Projects, the customer can search in real time, multi-select rows, and export official PDF dossiers.');
    await sleep(2000);

    // ========================================================================
    // ACT IV: CONTRACTOR PORTAL & APPROVAL WORKFLOW
    // ========================================================================
    await speak('ACT IV: CONTRACTOR PORTAL', 'Now let us log in as a Contractor to explore the partner portal and verification workflow.');

    // Logout
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await sleep(800);

    // Fill contractor login
    await page.type('input[type="email"]', 'alex.builder@gmail.com', { delay: 40 });
    await page.type('input[type="password"]', 'Password123!', { delay: 40 });
    await sleep(600);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await sleep(1800);

    await speak('ACT IV: CONTRACTOR DASHBOARD', 'Welcome to the Contractor Dashboard. Notice the high-visibility logo, 4 summary cards, and quick actions.');
    await sleep(1500);

    // Contractor Estimator
    await speak('ACT IV: CONTRACTOR ESTIMATOR', 'In the Contractor Estimator, partners enjoy our 10% wholesale tier discount deducted live.');
    await page.goto(`${BASE_URL}/contractor/decks/new`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    await smoothScrollTo(2600, 1400);
    await speak('ACT IV: CONTRACTOR ESTIMATOR', 'The official contractor estimate box cleanly displays wholesale savings and price ranges with zero blank gaps.');
    await sleep(2000);

    // Contractor Projects
    await page.goto(`${BASE_URL}/contractor/projects`, { waitUntil: 'networkidle2' });
    await speak('ACT IV: CONTRACTOR PROJECTS', 'In Contractor Projects, partners can convert estimates to bookings with zero validation errors, or export to Excel.');
    await sleep(2000);

    // ========================================================================
    // ACT V: ADMIN PORTAL DEEP DIVE
    // ========================================================================
    await speak('ACT V: ADMIN COMMAND CENTER', 'Now let us sign in as Administrator to examine central operations and lead management.');

    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
    await sleep(800);

    // Fill admin login
    await page.type('input[type="email"]', 'admin@deckestimator.com', { delay: 40 });
    await page.type('input[type="password"]', 'Admin@123456', { delay: 40 });
    await sleep(600);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await sleep(1800);

    await speak('ACT V: ADMIN DASHBOARD', 'The Admin Dashboard displays genuine database KPIs: platform users, active estimates, and live activity streams.');
    await sleep(2000);

    // User Management
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'networkidle2' });
    await speak('ACT V: USER MANAGEMENT', 'User Management features instant auto-search as you type and dedicated profile inspection with document preview.');
    await sleep(2000);

    // Verification & Progress
    await page.goto(`${BASE_URL}/admin/verifications`, { waitUntil: 'networkidle2' });
    await speak('ACT V: VERIFICATION & COMPLIANCE', 'In Verification and Progress, administrators review contractor licenses and approve partner applications.');
    await sleep(2000);

    // Lead Management
    await page.goto(`${BASE_URL}/admin/leads`, { waitUntil: 'networkidle2' });
    await speak('ACT V: LEAD MANAGEMENT', 'Lead Management captures incoming homeowner inquiries as HOT priority leads ready for dispatch and conversion.');
    await sleep(2000);

    // Project Management
    await page.goto(`${BASE_URL}/admin/projects`, { waitUntil: 'networkidle2' });
    await speak('ACT V: PROJECT MANAGEMENT', 'Project Management tracks milestone progress percentages from 0 to 100 percent with full audit history.');
    await sleep(2000);

    // Pricing & Discounts
    await page.goto(`${BASE_URL}/admin/pricing-discounts`, { waitUntil: 'networkidle2' });
    await speak('ACT V: PRICING CONFIGURATION', 'Pricing and Discounts allows tuning wholesale rate cards and assigning contractor-specific partner discounts.');
    await sleep(2000);

    // Reports & Analytics
    await page.goto(`${BASE_URL}/admin/reports`, { waitUntil: 'networkidle2' });
    await speak('ACT V: BUSINESS ANALYTICS', 'Reports and Analytics delivers real-time business insights powered directly by database aggregation pipelines.');
    await sleep(2000);

    // System Settings
    await page.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'networkidle2' });
    await speak('ACT V: SYSTEM SETTINGS', 'And System Settings synchronizes customer support channels, phone numbers, and WhatsApp dispatch across all portals.');
    await sleep(2500);

    // Conclusion
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await smoothScrollTo(0, 600);
    await speak('CONCLUSION', 'This concludes our end-to-end demonstration. Deck Restoration Plus is fully operational, verified, and production-ready. Thank you!');
    await sleep(4000);

    console.log('====================================================');
    console.log('  DEMO WALKTHROUGH COMPLETED SUCCESSFULLY!          ');
    console.log('====================================================');
  } catch (err) {
    console.error('Demo encountered an error:', err);
  } finally {
    // Keep browser open for 10 seconds so user can see completion
    await sleep(8000);
    await browser.close();
  }
}

runDemo().catch(console.error);
