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
    await page.addInitScript(() => {
      window.__qartonStartupVisibilityViolations = [];
      const inspect = () => {
        const root = document.getElementById('root');
        if (!root) return;
        const legacyMenu = root.querySelector('.home-actions');
        if (legacyMenu) {
          // Keep React's managed DOM intact: hide the old menu rather than detaching
          // a node that React may later reconcile during the intro transition.
          legacyMenu.style.setProperty('display', 'none', 'important');
          legacyMenu.setAttribute('data-qarton-test-hidden', 'true');
          window.__qartonLegacyMenuHidden = true;
        }
        const state = window.__QARTON_APP_STATE__ || 'BOOT';
        if (state !== 'HOME' && state !== 'TRANSITION' && state !== 'BOOT') return;
        const style = getComputedStyle(root);
        if (style.display !== 'none' || style.visibility !== 'hidden') {
          window.__qartonStartupVisibilityViolations.push({
            state, display: style.display, visibility: style.visibility,
            time: Math.round(performance.now())
          });
        }
      };
      const observer = new MutationObserver(inspect);
      observer.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
      document.addEventListener('DOMContentLoaded', inspect);
      window.addEventListener('qarton:statechange', () => queueMicrotask(inspect));
      inspect();
    });
    await page.goto('http://127.0.0.1:' + address.port + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });

    await page.waitForFunction(() => window.__QARTON_HOME_READY__ === true, { timeout: 25000 });
    await page.waitForFunction(() =>
      !document.getElementById('carthage-startup-watchdog') &&
      !document.getElementById('carthage-startup-error'),
    { timeout: 5000 });
    const homeState = await page.evaluate(() => ({
      state: window.__qartonGetAppState && window.__qartonGetAppState(),
      startupWatchdogPresent: !!document.getElementById('carthage-startup-watchdog'),
      startupErrorPresent: !!document.getElementById('carthage-startup-error'),
      rootDisplay: getComputedStyle(document.getElementById('root')).display,
      rootVisibility: getComputedStyle(document.getElementById('root')).visibility,
      rootHasHomeLock: document.getElementById('root').classList.contains('carthage-home-locked'),
      obsoleteHomeStylePresent: !!document.getElementById('qarton-premium-home-style'),
      homeVisible: !!document.querySelector('#qarton-home-screen') &&
        getComputedStyle(document.querySelector('#qarton-home-screen')).display !== 'none',
      treeReady: window.__QARTON_TREE_READY__ === true,
      treeCards: Array.from(document.querySelectorAll('#qarton-home-screen .qt-card')).map(button => button.getAttribute('aria-label')),
      hasPrimaryAction: !!document.querySelector('#qarton-home-screen .qh-action[data-kind="primary"]'),
      legacyMenuPresent: !!document.getElementById('root').querySelector('.home-actions'),
      legacyMenuHidden: !!document.getElementById('root').querySelector('.home-actions[data-qarton-test-hidden="true"]') &&
        getComputedStyle(document.getElementById('root').querySelector('.home-actions')).display === 'none',
      backupControlsInHome: ['carthage-export-backup','carthage-import-backup'].some(id => {
        const node = document.getElementById(id); return !!node && node.getBoundingClientRect().height > 0;
      }),
      moduleStarted: !!window.__CARTHAGE_MODULE_STARTED__,
      renderRequested: !!window.__CARTHAGE_RENDER_REQUESTED__,
      renderError: window.__CARTHAGE_RENDER_ERROR__ || null
    }));

    assert.equal(homeState.state, 'HOME', 'the actual app must start in QARTON HOME');
    assert.equal(homeState.startupWatchdogPresent, false, 'the startup fallback must be removed after QARTON HOME is ready');
    assert.equal(homeState.startupErrorPresent, false, 'the startup error panel must not cover a ready QARTON HOME');
    assert.equal(homeState.rootDisplay, 'none', 'the legacy React root must be hidden while QARTON HOME is active');
    assert.equal(homeState.rootVisibility, 'hidden', 'the legacy React root must not be visible behind QARTON HOME');
    assert.equal(homeState.rootHasHomeLock, false, 'the legacy React root must never receive the old home-layout class');
    assert.deepEqual(await page.evaluate(() => window.__qartonStartupVisibilityViolations), [], 'the legacy React root must never flash during BOOT, HOME, or TRANSITION');
    assert.equal(homeState.obsoleteHomeStylePresent, false, 'the old React-home stylesheet must not be loaded in the QARTON app');
    assert.equal(homeState.homeVisible, true, 'the QARTON home overlay must be visible');
    await page.waitForTimeout(250);
    assert.equal(await page.locator('#root').evaluate(el => getComputedStyle(el).display), 'none', 'viewport-lock initialization must not reveal the legacy React root after first paint');
    assert.equal(homeState.treeReady, true, 'the four-branch QARTON tree must be mounted');
    assert.deepEqual(homeState.treeCards, ['القصة','عالم قرطاج','التقدم والحفظ','الإعدادات'], 'the home must expose exactly the four agreed navigation branches');
    assert.equal(homeState.hasPrimaryAction, false, 'game operations must not be exposed directly on the main tree');
    assert.equal(homeState.legacyMenuPresent, true, 'the legacy React node remains mounted to protect React reconciliation');
    assert.equal(homeState.legacyMenuHidden, true, 'the browser test must make the old menu unavailable before QARTON readiness');
    assert.equal(homeState.backupControlsInHome, false, 'save backup controls must live inside Progress & Saves, not the main tree');

    // The QARTON home is intentionally a fixed, non-scrolling screen on short phones.
    await page.setViewportSize({ width: 360, height: 640 });
    const compactHome = await page.evaluate(() => {
      const overlay = document.getElementById('qarton-home-screen');
      const rect = overlay && overlay.getBoundingClientRect();
      return {
        viewportHeight: window.innerHeight,
        overlayHeight: rect ? rect.height : 0,
        documentHeight: document.documentElement.scrollHeight,
        bodyHeight: document.body.scrollHeight,
        treeCardsVisible: !!overlay && Array.from(overlay.querySelectorAll('.qt-card')).length === 4 &&
          Array.from(overlay.querySelectorAll('.qt-card')).every(button => button.getBoundingClientRect().height > 0 && button.getBoundingClientRect().top >= 0 && button.getBoundingClientRect().bottom <= window.innerHeight + 1),
        backupControlsVisible: ['carthage-export-backup','carthage-import-backup'].every(id => {
          const button = document.getElementById(id);
          const rect = button && button.getBoundingClientRect();
          return !!rect && rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight + 1;
        }),
        legacyHidden: getComputedStyle(document.getElementById('root')).display === 'none' &&
          getComputedStyle(document.getElementById('root')).visibility === 'hidden'
      };
    });
    assert.ok(compactHome.overlayHeight <= compactHome.viewportHeight + 1,
      'QARTON home must fit within a compact 360x640 viewport');
    assert.ok(compactHome.documentHeight <= compactHome.viewportHeight + 1 &&
      compactHome.bodyHeight <= compactHome.viewportHeight + 1,
      'QARTON home must not introduce vertical page scrolling on a compact phone');
    assert.equal(compactHome.treeCardsVisible, true, 'all four navigation cards must remain visible on a compact phone');
    assert.equal(compactHome.legacyHidden, true, 'the legacy root must remain isolated on a compact phone');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#qarton-home-screen .qt-card[aria-label="عالم قرطاج"]').click();
    assert.equal(await page.locator('#qarton-home-screen .qt-page-title').innerText(), 'عالم قرطاج', 'World branch must open its own page');
    assert.ok(await page.locator('#qarton-home-screen .qt-chip').count() >= 5, 'World branch must show its character and location guide');
    await page.locator('#qarton-home-screen .qt-back').click();
    await page.locator('#qarton-home-screen .qt-card[aria-label="الإعدادات"]').click();
    assert.equal(await page.locator('#qarton-home-screen .qt-page-title').innerText(), 'الإعدادات', 'Settings branch must open its own page');
    const soundToggle = page.locator('#qarton-home-screen .qt-setting input[type="checkbox"]').first();
    await soundToggle.uncheck();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('qarton-settings-v1')).sound), false,
      'settings must persist without changing story-save keys');
    await page.locator('#qarton-home-screen .qt-back').click();
    assert.equal(homeState.moduleStarted, true, 'the actual story module must have started');
    assert.equal(homeState.renderRequested, true, 'the actual React application must have rendered');

    await page.locator('#qarton-home-screen .qt-card[aria-label="التقدم والحفظ"]').click();
    await page.waitForSelector('#qarton-home-screen #carthage-export-backup', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('#qarton-home-screen #carthage-import-backup', { state: 'visible', timeout: 5000 });
    assert.ok(await page.locator('#qarton-home-screen').innerText().then(text => text.includes('سجل القرارات')), 'Progress branch must render saved decision history');
    assert.ok(await page.locator('#qarton-home-screen').innerText().then(text => text.includes('نبقى مع لينا ونحميها')), 'Progress branch must read real saved choices without rewriting them');
    await page.locator('#qarton-home-screen .qt-back').click();
    await page.locator('#qarton-home-screen .qt-card[aria-label="القصة"]').click();
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

    // Verify the gameplay exit path saves progress and restores the isolated QARTON HOME.
    const returnHome = page.locator('#carthage-home-return');
    await returnHome.waitFor({ state: 'visible', timeout: 10000 });
    await returnHome.click();
    await page.waitForFunction(() =>
      window.__qartonGetAppState && window.__qartonGetAppState() === 'HOME' &&
      window.__QARTON_HOME_READY__ === true &&
      !document.getElementById('carthage-home-return'),
    { timeout: 20000 });
    const returnedHome = await page.evaluate(() => {
      let autosave = null;
      try { autosave = JSON.parse(localStorage.getItem('shiganshina-autosave-v1') || 'null'); } catch {}
      return {
        state: window.__qartonGetAppState && window.__qartonGetAppState(),
        homeVisible: !!document.getElementById('qarton-home-screen'),
        legacyHidden: getComputedStyle(document.getElementById('root')).display === 'none' &&
          getComputedStyle(document.getElementById('root')).visibility === 'hidden',
        autosavePresent: !!autosave && Number.isInteger(autosave.sceneIdx),
        returnControlRemoved: !document.getElementById('carthage-home-return')
      };
    });
    assert.equal(returnedHome.state, 'HOME', 'returning from gameplay must restore the QARTON home state');
    assert.equal(returnedHome.homeVisible, true, 'the isolated QARTON home must be visible after leaving gameplay');
    assert.equal(returnedHome.legacyHidden, true, 'the legacy React menu must be hidden again after returning home');
    assert.equal(returnedHome.autosavePresent, true, 'leaving gameplay must persist the current story progress');
    assert.equal(returnedHome.returnControlRemoved, true, 'gameplay-only navigation controls must be removed at HOME');

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
