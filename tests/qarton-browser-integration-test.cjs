'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const webRoot = path.resolve(__dirname, '..', 'www');
const htmlPath = path.join(webRoot, 'index.html');
if (!fs.existsSync(htmlPath)) throw new Error('www/index.html is missing; run npm run prepare:web first.');

const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.wav': 'audio/wav'
};

const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
  catch { res.writeHead(400).end('Bad request'); return; }
  if (pathname === '/') pathname = '/index.html';
  const file = path.resolve(webRoot, '.' + pathname);
  if (!file.startsWith(webRoot + path.sep) && file !== htmlPath) {
    res.writeHead(403).end('Forbidden'); return;
  }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'content-type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
});

(async () => {
  let browser;
  let page;
  const pageErrors = [];
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    page = await context.newPage();
    page.on('pageerror', error => pageErrors.push(error.stack || error.message));
    await page.goto('http://127.0.0.1:' + address.port + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    await page.waitForFunction(() => window.__QARTON_HOME_READY__ === true && window.__CARTHAGE_RENDER_REQUESTED__ === true, { timeout: 25000 });
    const home = await page.evaluate(() => {
      const root = document.getElementById('root');
      const overlay = document.getElementById('qarton-home-screen');
      return {
        state: window.__qartonGetAppState && window.__qartonGetAppState(),
        rootDisplay: root ? getComputedStyle(root).display : null,
        rootVisibility: root ? getComputedStyle(root).visibility : null,
        overlayVisible: !!overlay && getComputedStyle(overlay).display !== 'none' &&
          overlay.getBoundingClientRect().width > 0 && overlay.getBoundingClientRect().height > 0,
        overlayText: overlay ? overlay.innerText : '',
        newGameButton: !!document.querySelector('#qarton-home-screen .qh-actions button'),
        moduleStarted: !!window.__CARTHAGE_MODULE_STARTED__,
        renderRequested: !!window.__CARTHAGE_RENDER_REQUESTED__,
        renderError: window.__CARTHAGE_RENDER_ERROR__ || null,
        hasSave: !!(window.__carthageHasSave && window.__carthageHasSave()),
        hasFreeSlot: !!(window.__carthageHasFreeSlot && window.__carthageHasFreeSlot())
      };
    });

    assert.equal(home.state, 'HOME', 'app must start in explicit QARTON HOME state');
    assert.equal(home.rootDisplay, 'none', 'legacy React root must be hidden at startup');
    assert.equal(home.rootVisibility, 'hidden', 'legacy React root must not be visible behind QARTON HOME');
    assert.equal(home.overlayVisible, true, 'QARTON HOME must be visible in the real browser');
    assert.match(home.overlayText, /QARTON|آخر يوم في قرطاج/, 'the visible home must be QARTON, not the legacy menu');
    assert.equal(home.moduleStarted, true, 'real story module must start');
    assert.equal(home.renderRequested, true, 'real React application must render behind the isolated home');
    assert.equal(home.renderError, null, 'React startup must not report a synchronous render error');
    assert.equal(home.hasFreeSlot, true, 'new game must have a free save slot');

    const startButton = page.locator('#qarton-home-screen .qh-actions button').filter({ hasText: 'لعبة جديدة' }).first();
    await startButton.waitFor({ state: 'visible', timeout: 5000 });
    await startButton.click();

    const confirmation = page.locator('#qarton-home-screen [role="dialog"]');
    if (await confirmation.count()) {
      const confirmButton = confirmation.getByRole('button', { name: 'ابدأ من جديد' });
      await confirmButton.waitFor({ state: 'visible', timeout: 5000 });
      assert.equal(await confirmButton.isEnabled(), true, 'new-game confirmation must be enabled when a free slot exists');
      await confirmButton.click();
    }

    await page.waitForFunction(() =>
      window.__qartonGetAppState && window.__qartonGetAppState() === 'INTRO' &&
      document.body.classList.contains('qarton-intro-active'), { timeout: 20000 });

    const intro = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        state: window.__qartonGetAppState && window.__qartonGetAppState(),
        display: root ? getComputedStyle(root).display : null,
        visibility: root ? getComputedStyle(root).visibility : null,
        height: root ? Math.round(root.getBoundingClientRect().height) : 0,
        qartonOverlayPresent: !!document.getElementById('qarton-home-screen'),
        introText: (root && root.innerText || '').slice(0, 1800),
        continueButtonPresent: !!root && Array.from(root.querySelectorAll('button')).some(button => /كمّل|متابعة/.test(button.innerText || ''))
      };
    });

    assert.equal(intro.state, 'INTRO', 'real new-game handler must enter INTRO');
    assert.notEqual(intro.display, 'none', 'real intro root must be visible');
    assert.notEqual(intro.visibility, 'hidden', 'real intro root must not remain hidden');
    assert.ok(intro.height > 100, 'real intro root must occupy the viewport');
    assert.equal(intro.qartonOverlayPresent, false, 'QARTON home overlay must be removed after intro starts');
    assert.match(intro.introText, /كان صباح عادي في قرطاج/, 'actual first Carthage intro scene must render');
    assert.equal(intro.continueButtonPresent, true, 'actual intro continue control must render');
    assert.deepEqual(pageErrors, [], 'real browser flow must not throw uncaught JavaScript errors');

    console.log('PASS: Chromium verified QARTON HOME, hidden legacy root, real new-game handler, and visible Carthage INTRO.');
    console.log(JSON.stringify({ home, intro }, null, 2));
  } catch (error) {
    if (page) {
      fs.mkdirSync(path.resolve(__dirname, '..', 'test-results'), { recursive: true });
      await page.screenshot({ path: path.resolve(__dirname, '..', 'test-results', 'qarton-browser-failure.png'), fullPage: true }).catch(() => {});
      const diagnostics = await page.evaluate(() => ({
        state: window.__QARTON_APP_STATE__ || null,
        ready: window.__QARTON_HOME_READY__ || false,
        moduleStarted: !!window.__CARTHAGE_MODULE_STARTED__,
        renderRequested: !!window.__CARTHAGE_RENDER_REQUESTED__,
        renderError: window.__CARTHAGE_RENDER_ERROR__ || null,
        rootText: (document.getElementById('root')?.innerText || '').slice(0, 1400),
        overlayText: (document.getElementById('qarton-home-screen')?.innerText || '').slice(0, 700)
      })).catch(() => ({}));
      console.error('QARTON browser diagnostics:', JSON.stringify({ diagnostics, pageErrors }, null, 2));
    }
    throw error;
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
