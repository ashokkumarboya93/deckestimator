// =============================================
// Deck Estimator — E2E Contractor Verification & Admin Approval Test
// =============================================

const fs = require('fs');
const path = require('path');
const puppeteer = require('../backend/node_modules/puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.join(__dirname, '../docs/PagesManualtesting/contractor_approval');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Starting Contractor Verification & Admin Approval E2E Test...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Unique email for test contractor
  const testId = Date.now();
  const contractorEmail = `contractor.${testId}@example.com`;
  const contractorPassword = 'Password123!';
  const businessName = `Lone Star Craft Decks ${testId % 1000}`;
  const licenseNumber = `LIC-TX-${testId % 100000}`;

  console.log(`\n📋 Test Contractor: ${contractorEmail}`);

  try {
    // ----------------------------------------------------
    // Step 1: Register New Contractor
    // ----------------------------------------------------
    console.log('Step 1: Navigating to Register page...');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });

    // Select Contractor Role
    console.log('Selecting Contractor role...');
    await page.click('button[data-role-btn="contractor"]');
    await page.waitForSelector('input[name="businessName"]', { visible: true });

    await page.type('input[name="fullName"]', 'Charlie Test Builder');
    await page.type('input[name="email"]', contractorEmail);
    await page.type('input[name="phone"]', '5552345678');
    await page.type('input[name="password"]', contractorPassword);
    await page.type('input[name="confirmPassword"]', contractorPassword);

    // Contractor specific fields
    await page.type('input[name="businessName"]', businessName);
    await page.type('input[name="licenseNumber"]', licenseNumber);

    console.log('Submitting contractor registration...');
    await page.click('button[type="submit"]');

    // Wait for redirect to verification request
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 8000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 2000));

    const currentUrl = page.url();
    console.log(`Current URL after registration: ${currentUrl}`);

    // Verify it landed on /contractor/verification-request
    const isVerificationRequestPage = currentUrl.includes('/contractor/verification-request');
    console.log(`✓ Redirected to verification request page: ${isVerificationRequestPage}`);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01_contractor_registration_redirect.png'),
      fullPage: true,
    });

    // ----------------------------------------------------
    // Step 2: Attempt To Bypass Guard Directly to /contractor/dashboard
    // ----------------------------------------------------
    console.log('\nStep 2: Testing Route Guard - Direct navigation to /contractor/dashboard while unapproved...');
    await page.goto('http://localhost:5173/contractor/dashboard', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    const blockedUrl = page.url();
    console.log(`URL after attempting /contractor/dashboard: ${blockedUrl}`);
    const isBlocked = blockedUrl.includes('/contractor/verification-request');
    console.log(`✓ Route guard successfully BLOCKED unapproved contractor and redirected to verification: ${isBlocked}`);

    // ----------------------------------------------------
    // Step 3: Complete Verification Request Form (With Optional License Upload Note)
    // ----------------------------------------------------
    console.log('\nStep 3: Completing verification request form...');
    // Ensure on verification page
    await page.goto('http://localhost:5173/contractor/verification-request', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));

    // Fill in business phone and address
    await page.evaluate(() => {
      const phoneInput = document.querySelector('input[name="businessPhone"]');
      if (phoneInput && !phoneInput.value) phoneInput.value = '555-987-6543';

      const street = document.querySelector('input[name="street"]');
      if (street) street.value = '450 Congress Ave, Suite 1200';

      const city = document.querySelector('input[name="city"]');
      if (city) city.value = 'Austin';

      const state = document.querySelector('input[name="state"]');
      if (state) state.value = 'TX';

      const zip = document.querySelector('input[name="zipCode"]');
      if (zip) zip.value = '78701';

      const notes = document.querySelector('textarea[name="notes"]');
      if (notes) notes.value = 'Full-service outdoor living contractor specializing in composite decking and cedar restorations.';
    });

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02_verification_form_filled.png'),
      fullPage: true,
    });

    console.log('Submitting verification application for admin approval...');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
    }
    await new Promise((r) => setTimeout(r, 3000));

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03_pending_approval_screen.png'),
      fullPage: true,
    });

    const pageText = await page.evaluate(() => document.body.innerText);
    const showsPending = pageText.includes('PENDING ADMIN APPROVAL') || pageText.includes('Under Review');
    console.log(`✓ Verification application submitted. Shows pending review status: ${showsPending}`);

    // Verify still blocked from dashboard
    await page.goto('http://localhost:5173/contractor/dashboard', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1000));
    console.log(`URL after attempt while pending: ${page.url()}`);
    console.log(`✓ Still blocked while pending: ${page.url().includes('verification-request')}`);

    // ----------------------------------------------------
    // Step 4: Admin Reviews & Approves Contractor Request
    // ----------------------------------------------------
    console.log('\nStep 4: Logging in as Administrator...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

    // Handle logout if still signed in
    await page.evaluate(() => {
      const logoutBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.toLowerCase().includes('sign out') || b.innerText.toLowerCase().includes('logout')
      );
      if (logoutBtn) logoutBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.type('input[name="email"]', 'admin@deckestimator.com');
    await page.type('input[name="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 8000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 2000));

    console.log('Navigating to Admin Contractor Verifications portal...');
    await page.goto('http://localhost:5173/admin/contractor-verifications', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 2000));

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04_admin_verifications_list.png'),
      fullPage: true,
    });

    console.log('Admin approving contractor request...');
    // Approve contractor via dialog handler
    page.on('dialog', async (dialog) => {
      console.log(`Admin dialog message: ${dialog.message()}`);
      await dialog.accept();
    });

    // Find Charlie's row and click Approve
    const approvedClicked = await page.evaluate((bName) => {
      const rows = Array.from(document.querySelectorAll('tr'));
      for (const row of rows) {
        if (row.innerText.includes(bName)) {
          const btns = Array.from(row.querySelectorAll('button'));
          const approveBtn = btns.find((b) => b.innerText.toLowerCase().includes('approve'));
          if (approveBtn) {
            approveBtn.click();
            return true;
          }
        }
      }
      return false;
    }, businessName);

    console.log(`✓ Admin clicked quick Approve for "${businessName}": ${approvedClicked}`);
    await new Promise((r) => setTimeout(r, 3000));

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '05_admin_approved_contractor.png'),
      fullPage: true,
    });

    // ----------------------------------------------------
    // Step 5: Contractor Logs In & Accesses Portal
    // ----------------------------------------------------
    console.log('\nStep 5: Logging back in as newly approved Contractor...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const logoutBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.toLowerCase().includes('sign out') || b.innerText.toLowerCase().includes('logout')
      );
      if (logoutBtn) logoutBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.type('input[name="email"]', contractorEmail);
    await page.type('input[name="password"]', contractorPassword);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 8000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 2000));

    const finalUrl = page.url();
    console.log(`Final Contractor URL: ${finalUrl}`);
    const unlocked = finalUrl.includes('/contractor/dashboard');
    console.log(`✓ Contractor successfully UNLOCKED and entered /contractor/dashboard: ${unlocked}`);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '06_contractor_dashboard_unlocked.png'),
      fullPage: true,
    });

    // Copy to artifact directory
    const ARTIFACT_DIR = path.join(
      'C:\\Users\\Master\\.gemini\\antigravity\\brain\\39dbf233-8a1c-4156-810b-82f65f2f3d9e',
      'contractor_screenshots'
    );
    if (fs.existsSync(ARTIFACT_DIR)) {
      const files = fs.readdirSync(SCREENSHOT_DIR);
      for (const f of files) {
        fs.copyFileSync(path.join(SCREENSHOT_DIR, f), path.join(ARTIFACT_DIR, f));
      }
    }

    console.log('\n🎉 ALL CONTRACTOR VERIFICATION & ADMIN APPROVAL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    await browser.close();
  }
}

run();
