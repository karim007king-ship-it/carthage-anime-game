'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const webRoot = path.resolve(__dirname, '..', 'www');
if (!fs.existsSync(path.join(webRoot, 'index.html'))) {
  throw new Error('www/index.html is missing. Run npm run prepare:web before this test.');
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
  catch { res.writeHead(400).end('Bad request'); return; }
  if (pathname === '/') pathname = '/index.html';
  const file = path.resolve(webRoot, '.' + pathname);
  if (!file.startsWith(webRoot + path.sep) && file !== path.join(webRoot, 'index.html')) {
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

    await page.waitForFunction(() => window.__QARTON_HOME_READY__ === true, { timeout: 25000 });
    const homeState = await page.evaluate(() => ({
      state: window.__qartonGetAppState && window.__qartonGetAppState(),
      rootDisplay: getComputedStyle(document.getElementById('root')).display,
      rootVisibility: getComputedStyle(document.getElementById('root')).visibility,
      homeVisible: !!document.querySelector('#qarton-home-screen') &&
        getComputedStyle(document.querySelector('#qarton-home-screen')).display !== 'none',
      hasPrimaryAction: !!document.querySelector('#qarton-home-screen .qh-action[data-kind="primary"]'),
      moduleStarted: !!window.__CARTHAGE_MODULE_STARTED__,
      renderRequested: !!window.__CARTHAGE_RENDER_REQUESTED__,
      renderError: window.__CARTHAGE_RENDER_ERROR__ || null
    }));

    assert.equal(homeState.state, 'HOME', 'the actual app must start in QARTON HOME');
    assert.equal(homeState.rootDisplay, 'none', 'the legacy React root must be hidden while QARTON HOME is active');
    assert.equal(homeState.rootVisibility, 'hidden', 'the legacy React root must not be visible behind QARTON HOME');
    assert.equal(homeState.homeVisible, true, 'the QARTON home overlay must be visible');
    assert.equal(homeState.hasPrimaryAction, true, 'the QARTON home must expose its real primary action');
    assert.equal(homeState.moduleStarted, true, 'the actual story module must have started');
    assert.equal(homeState.renderRequested, true, 'the actual React application must have rendered');

    const primary = page.locator('#qarton-home-screen .qh-action[data-kind="primary"]').first();
    await primary.click();

    const confirmation = page.locator('#qarton-home-screen .qh-confirm-backdrop');
    if (await confirmation.isVisible().catch(() => false)) {
      const confirmButton = confirmation.getByRole('button', { name: 'ابدأ من جديد' });
      await confirmButton.waitFor({ state: 'visible', timeout: 5000 });
      assert.equal(await confirmButton.isEnabled(), true, 'a new game must not be blocked when an empty save slot exists');
      await confirmButton.click();
    }

    await page.waitForFunction(() =>
      window.__qartonGetAppState && window.__qartonGetAppState() === 'INTRO' &&
      document.body.classList.contains('qarton-intro-active'),
    { timeout: 15000 });

    const intro = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        state: window.__qartonGetAppState && window.__qartonGetAppState(),
        display: getComputedStyle(root).display,
        visibility: getComputedStyle(root).visibility,
        height: Math.round(root.getBoundingClientRect().height),
        qartonOverlayPresent: !!document.getElementById('qarton-home-screen'),
        introTextPresent: (root.innerText || '').includes('كان صباح عادي في قرطاج'),
        continueButtonPresent: Array.from(root.querySelectorAll('button')).some(button => (button.innerText || '').includes('كمّل'))
      };
    });

    assert.equal(intro.state, 'INTRO', 'the real new-game handler must transition to INTRO');
    assert.notEqual(intro.display, 'none', 'the actual intro must be visible');
    assert.notEqual(intro.visibility, 'hidden', 'the actual intro must not remain hidden');
    assert.ok(intro.height > 100, 'the actual intro root must occupy the screen');
    assert.equal(intro.qartonOverlayPresent, false, 'the QARTON home overlay must be removed when the intro starts');
    assert.equal(intro.introTextPresent, true, 'the real Carthage intro scene must render, not only change a state flag');
    assert.equal(intro.continueButtonPresent, true, 'the real intro continue control must render');

    // The Carthage opening is a five-beat interactive sequence. Advance each
    // visible "continue" control until React reports GAME; one click is not enough.
    const introProgress = [];
    for (let beat = 0; beat < 8; beat++) {
      const currentState = await page.evaluate(() => window.__qartonGetAppState && window.__qartonGetAppState());
      if (currentState === 'GAME') break;
      // Some intro beats pause on a full-screen "enter the house" scene.
      // That overlay intentionally intercepts the underlying continue button.
      const houseEntry = page.getByRole('button', { name: /ادخل للدار/ }).first();
      if (await houseEntry.isVisible().catch(() => false)) {
        await houseEntry.click();
        await page.waitForTimeout(350);
        continue;
      }
      const candidates = page.locator('#root button:visible');
      let clicked = false;
      for (let i = 0; i < await candidates.count(); i++) {
        const button = candidates.nth(i);
        const label = (await button.innerText().catch(() => '')).replace(/\\s+/g, ' ').trim();
        if (/كمّل/.test(label) && await button.isEnabled()) {
          introProgress.push(label);
          await button.click();
          clicked = true;
          await page.waitForTimeout(350);
          break;
        }
      }
      if (!clicked) break;
    }
    await page.waitForFunction(() =>
      window.__qartonGetAppState && window.__qartonGetAppState() === 'GAME' &&
      document.getElementById('root')?.getAttribute('data-qarton-gameplay-skin') === 'active',
    { timeout: 10000 });
    const gameplay = await page.evaluate(() => {
      const root = document.getElementById('root');
      const button = root && root.querySelector('button');
      const style = button ? getComputedStyle(button) : null;
      return {
        state: window.__qartonGetAppState && window.__qartonGetAppState(),
        skinActive: root?.getAttribute('data-qarton-gameplay-skin') === 'active',
        rootClass: root?.className || '',
        bodyGameActive: document.body.classList.contains('qarton-game-active'),
        controlsStyled: Array.from(document.querySelectorAll('#root.qarton-game-ui button')).length,
        buttonBackground: style ? style.backgroundImage + ' ' + style.backgroundColor : '',
        buttonBorderRadius: style ? style.borderRadius : ''
      };
    });
    assert.equal(gameplay.state, 'GAME', 'the complete opening sequence must enter the real gameplay state');
    assert.equal(gameplay.skinActive, true, 'QARTON gameplay adapter must activate in GAME state');
    assert.equal(gameplay.bodyGameActive, true, 'the native gameplay root must be released only in GAME state');
    assert.ok(gameplay.controlsStyled > 0, 'gameplay controls must receive the QARTON skin');
    assert.match(gameplay.buttonBorderRadius, /13px/, 'gameplay button must use the QARTON visual treatment');
    await page.screenshot({ path: path.resolve(__dirname, '..', 'test-results', 'qarton-gameplay.png'), fullPage: true });

    assert.deepEqual(pageErrors, [], 'the real browser run must not throw JavaScript page errors');
    console.log('PASS: real Chromium integration — QARTON HOME, new game, full five-beat intro, GAME state, and computed QARTON gameplay styling.');
    console.log(JSON.stringify({ home: homeState, intro, introProgress, gameplay }, null, 2));
  } catch (error) {
    if (page) {
      fs.mkdirSync(path.resolve(__dirname, '..', 'test-results'), { recursive: true });
      await page.screenshot({ path: path.resolve(__dirname, '..', 'test-results', 'qarton-browser-failure.png'), fullPage: true }).catch(() => {});
      const diagnostics = await page.evaluate(() => ({
        state: window.__QARTON_APP_STATE__ || null,
        ready: window.__QARTON_HOME_READY__ || false,
        moduleStarted: window.__CARTHAGE_MODULE_STARTED__ || false,
        renderRequested: window.__CARTHAGE_RENDER_REQUESTED__ || false,
        renderError: window.__CARTHAGE_RENDER_ERROR__ || null,
        rootText: (document.getElementById('root')?.innerText || '').slice(0, 1200),
        overlayText: (document.getElementById('qarton-home-screen')?.innerText || '').slice(0, 600)
      })).catch(() => ({}));
      console.error('Browser diagnostics:', JSON.stringify({ diagnostics, pageErrors }, null, 2));
    }
    throw error;
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});

// Regression guard: the house-entry overlay must be activated before advancing its hidden beat.
