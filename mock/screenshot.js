const { chromium } = require('playwright-core');
const fs = require('fs');

function findChromium() {
  const base = '/opt/pw-browsers';
  const dir = fs.readdirSync(base).find((d) => d.startsWith('chromium-'));
  const candidates = [
    `${base}/${dir}/chrome-linux/chrome`,
    `${base}/${dir}/chrome-linux/headless_shell`,
  ];
  return candidates.find((p) => fs.existsSync(p));
}

(async () => {
  const exe = findChromium();
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
  const errors = [];
  const failed = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', (r) => failed.push(`${r.url()} :: ${r.failure()?.errorText}`));
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });

  const base = 'http://127.0.0.1:4200';

  // Home
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'mock/shot-home.png', fullPage: true });

  // Report with date filter
  await page.goto(base + '/AbstractTransReport', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  const submit = page.getByRole('button', { name: 'Submit' });
  if (await submit.count()) { await submit.first().click(); await page.waitForTimeout(1200); }
  await page.screenshot({ path: 'mock/shot-report-date.png', fullPage: true });

  // FPS Details (no filter, auto summary)
  await page.goto(base + '/dfso_fps_details', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'mock/shot-report-fps.png', fullPage: true });

  // Stock Details (month/year/district cascade)
  await page.goto(base + '/Stock_Register_Int', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'mock/shot-report-stock.png', fullPage: true });

  // Mobile viewport home
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'mock/shot-home-mobile.png', fullPage: true });

  console.log('CONSOLE_ERRORS:', JSON.stringify(errors, null, 1));
  console.log('FAILED_REQUESTS:', JSON.stringify([...new Set(failed)], null, 1));
  await browser.close();
})().catch((e) => { console.error('SCRIPT_ERROR', e); process.exit(1); });
