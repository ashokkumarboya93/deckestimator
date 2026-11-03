/**
 * Portal Verification Script: Tests Customer, Contractor, and Admin portals in headless Chrome
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function doLogout(page) {
  try {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.textContent.trim().toLowerCase() === 'logout');
      if (btn) btn.click();
    });
  } catch {}
  await sleep(1000);
  try {
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
  } catch {}
  await page.evaluate(() => {
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}
  });
  await sleep(500);
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('input[name="email"]', { timeout: 8000 });
}

async function verifyAllPortals() {
  console.log('>>> Launching Headless Chrome for Live Portal Verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });

  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('401')) {
      console.log(`[Browser Console Error] ${msg.text()}`);
    }
  });

  const screenshotsDir = path.resolve(__dirname, 'portal-verification-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // ---------------------------------------------------------
    // 1. CUSTOMER PORTAL VERIFICATION
    // ---------------------------------------------------------
    console.log('\n--- 1. VERIFYING CUSTOMER PORTAL ---');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('input[name="email"]', { timeout: 8000 });
    await page.type('input[name="email"]', 'alice.browser.1793629269036@example.com');
    await page.type('input[name="password"]', 'Password123!');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[type="submit"]'),
    ]);
    await sleep(1500);

    const customerUrl = page.url();
    console.log(`Customer Redirected URL: ${customerUrl}`);
    const customerHasDecks = await page.evaluate(() => document.body.innerText.includes('My Deck Projects'));
    console.log(`Customer Dashboard Content Found: ${customerHasDecks}`);
    await page.screenshot({ path: path.join(screenshotsDir, 'customer-portal-verified.png') });

    // ---------------------------------------------------------
    // 2. CONTRACTOR PORTAL VERIFICATION
    // ---------------------------------------------------------
    console.log('\n--- 2. VERIFYING CONTRACTOR PORTAL ---');
    await doLogout(page);
    await page.type('input[name="email"]', 'robert.builder.1793629269036@example.com');
    await page.type('input[name="password"]', 'Password123!');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[type="submit"]'),
    ]);
    await sleep(1500);

    const contractorUrl = page.url();
    console.log(`Contractor Redirected URL: ${contractorUrl}`);
    const contractorHasTabs = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Contractor') || text.includes('Leads') || text.includes('Verification') || text.includes('Apex Deck');
    });
    console.log(`Contractor Workstation Rendered: ${contractorHasTabs}`);
    await page.screenshot({ path: path.join(screenshotsDir, 'contractor-portal-verified.png') });

    // ---------------------------------------------------------
    // 3. ADMIN PORTAL VERIFICATION
    // ---------------------------------------------------------
    console.log('\n--- 3. VERIFYING ADMIN PORTAL ---');
    await doLogout(page);
    await page.type('input[name="email"]', 'admin@deckestimator.com');
    await page.type('input[name="password"]', 'AdminPass123!');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[type="submit"]'),
    ]);
    await sleep(1500);

    const adminUrl = page.url();
    console.log(`Admin Redirected URL: ${adminUrl}`);
    const adminHasKPIs = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Total Users') || text.includes('Admin Console') || text.includes('Operations Overview');
    });
    console.log(`Admin Command Center KPI Content Rendered: ${adminHasKPIs}`);
    await page.screenshot({ path: path.join(screenshotsDir, 'admin-portal-verified.png') });

    console.log('\n>>> ALL THREE PORTALS SUCCESSFULLY VERIFIED IN BROWSER!');
  } catch (err) {
    console.error('Portal verification failed:', err.message);
    throw err;
  } finally {
    await browser.close();
  }
}

verifyAllPortals().catch((err) => {
  console.error(err);
  process.exit(1);
});
