const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { createServer } = require('node:http');
const { resolve } = require('node:path');
const { test } = require('node:test');
const { chromium } = require('playwright');

const web = resolve(__dirname, '../www');
const assets = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/qarton-intro/official-intro.css': ['qarton-intro/official-intro.css', 'text/css'],
  '/qarton-intro/official-intro-player.js': ['qarton-intro/official-intro-player.js', 'text/javascript'],
  '/qarton-intro/official-intro.mp4': ['qarton-intro/official-intro.mp4', 'video/mp4']
};

async function officialHome(page) {
  const home = page.locator('#root > #qarton-home-v2[data-qarton-view=home]');
  await home.waitFor();
  assert.equal(await home.locator('.qv-card').count(), 4);
  assert.equal(await page.locator('.home-actions.grid, .qarton-home-shell, #qarton-home-screen').count(), 0);
  return home;
}

async function openCard(page, card) {
  await page.locator(`[data-qarton-card=${card}]`).tap();
  await page.locator(`#qarton-home-v2[data-qarton-view=${card}]`).waitFor();
  assert.equal(await page.locator('.home-actions.grid').count(), 0);
}

async function back(page) {
  await page.locator('#qarton-home-back').tap();
  return officialHome(page);
}

test('prepared Carthage keeps one QARTON home across intro, sections, story and saves', { timeout: 90000 }, async t => {
  const files = await Promise.all(Object.entries(assets).map(async ([url, [file, type]]) =>
    [url, { bytes: await readFile(resolve(web, file)), type }]));
  const bundle = new Map(files);
  const server = createServer((req, res) => {
    const asset = bundle.get(req.url);
    if (!asset) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': asset.type, 'Content-Length': asset.bytes.length }).end(asset.bytes);
  });
  await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).once('error', reject));
  t.after(() => server.close());
  const origin = `http://127.0.0.1:${server.address().port}`;
  const executablePath = process.env.QARTON_BROWSER_EXECUTABLE;
  const args = ['--autoplay-policy=no-user-gesture-required'];
  if (process.env.QARTON_BROWSER_SINGLE_PROCESS === '1') args.push('--single-process', '--no-zygote');
  const browser = await chromium.launch({ executablePath, args });
  t.after(() => browser.close());

  const context = await browser.newContext({ viewport: { width: 393, height: 844 }, isMobile: true, hasTouch: true });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const errors = [];
  async function appPage() {
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.introEnded = false;
      document.addEventListener('ended', event => {
        if (event.target.closest('.qarton-intro')) window.introEnded = true;
      }, true);
    });
    return page;
  }

  let page = await appPage();
  await page.goto(origin);
  await page.locator('.qarton-intro video').waitFor();
  assert.equal(await page.locator('#root').getAttribute('inert'), '');
  await page.waitForFunction(() => window.introEnded);
  await page.locator('.qarton-intro').waitFor({ state: 'detached' });
  let home = await officialHome(page);
  assert.equal(await page.locator('#root').getAttribute('inert'), null);
  assert.equal(await page.locator('body').evaluate(body => body.scrollHeight <= innerHeight + 1), true);
  for (const [width, height] of [[393, 844], [360, 640], [320, 568]]) {
    await page.setViewportSize({ width, height });
    const layout = await home.evaluate(root => {
      const cards = [...root.querySelectorAll('.qv-card')].map(card => card.getBoundingClientRect().toJSON());
      return { cards, scroll: root.scrollHeight - root.clientHeight, footer: root.querySelector('footer').getBoundingClientRect().bottom };
    });
    const [story, world, progress, settings] = layout.cards;
    assert.equal(story.y, world.y);
    assert.equal(progress.y, settings.y);
    assert.ok(story.x > world.x && progress.x > settings.x && progress.y > story.y);
    assert.ok(layout.scroll <= 1 && layout.footer <= height, `${width}×${height} home should fit without scrolling`);
  }
  await page.setViewportSize({ width: 393, height: 844 });

  await openCard(page, 'world');
  for (const section of ['characters', 'places', 'guide']) {
    const details = page.locator(`#qarton-${section}`);
    await details.locator('summary').tap();
    assert.ok(await details.locator('li').count() > 0);
    await details.locator('summary').tap();
  }
  await back(page);

  await openCard(page, 'settings');
  const sound = page.locator('#qarton-cinematic-sound');
  const oldSound = await sound.getAttribute('aria-pressed');
  await sound.tap();
  assert.notEqual(await sound.getAttribute('aria-pressed'), oldSound);
  await page.locator('#qarton-cinematic-volume').focus();
  await page.keyboard.press('End');
  assert.equal(await page.evaluate(() => window.__CARTHAGE_V17_PILOT_API__.getState().volume), 1);
  await page.locator('#qarton-language').selectOption({ label: 'Français' });
  assert.equal(await page.locator('#qarton-home-back').textContent(), 'Retour à l’accueil');
  home = await back(page);
  assert.equal(await home.getAttribute('lang'), 'fr');
  assert.match(await home.locator('[data-qarton-card=story]').textContent(), /Histoire/);
  await openCard(page, 'settings');
  await page.locator('#qarton-language').selectOption({ label: 'التونسية' });
  await back(page);

  await openCard(page, 'progress');
  await page.locator('#qarton-save-slots').tap();
  await page.getByRole('dialog', { name: 'خانات الجلسة' }).waitFor();
  await page.getByRole('button', { name: 'سكّر', exact: true }).tap();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#carthage-export-backup').tap();
  const download = await downloadPromise;
  const save = JSON.parse(await readFile(await download.path(), 'utf8'));
  assert.equal(save.sceneIdx, 4, 'clean install retains the existing chapter 5 recovery');
  await back(page);

  await openCard(page, 'story');
  assert.equal(await page.locator('#carthage-part3-start').isDisabled(), true);
  await page.locator('#btn-part2').tap();
  await page.getByRole('dialog', { name: 'الجزء الثاني مقفل' }).waitFor();
  await page.locator('#btn-part2-close').tap();
  assert.equal(await page.locator('.home-actions.grid').count(), 0);
  await page.locator('#qarton-start').tap();
  await page.getByRole('dialog', { name: 'لعبة جديدة؟' }).getByRole('button', { name: 'رجوع للقائمة' }).tap();
  await officialHome(page);

  // Reopen the app with the same profile. Session state resets and local progress persists.
  await page.close();
  page = await appPage();
  await page.goto(origin);
  await page.locator('.qarton-intro-skip').tap();
  await page.locator('.qarton-intro').waitFor({ state: 'detached' });
  await officialHome(page);
  assert.equal(await page.evaluate(() => window.introEnded), false);
  assert.equal(await page.evaluate(() => window.__CARTHAGE_V17_PILOT_API__.getState().volume), 1);
  await openCard(page, 'progress');
  assert.equal(await page.locator('#carthage-continue-last').isEnabled(), true);
  await page.locator('#carthage-continue-last').tap();
  await page.locator('.game-timer').waitFor();
  assert.equal(await page.locator('#qarton-home-v2').count(), 0);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('shiganshina-autosave-v1')).sceneIdx), 4);
  await page.locator('#carthage-save-now').tap();
  await page.locator('#carthage-home-return').tap();
  await officialHome(page);
  assert.equal(await page.locator('.qarton-intro').count(), 0);

  await openCard(page, 'progress');
  await page.locator('#carthage-import-file').setInputFiles({
    name: 'carthage-backup.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ ...save, slot: 2 }))
  });
  await page.getByText(/تم استيراد الحفظ بنجاح/).waitFor();
  await officialHome(page);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('shiganshina-slots-v1'))[1].sceneIdx), 4);

  await openCard(page, 'story');
  await page.locator('#qarton-start').tap();
  await page.locator('#qarton-confirm-start').tap();
  await page.locator('#qarton-home-v2').waitFor({ state: 'detached' });
  await page.getByRole('button', { name: 'تخطي المشهد' }).tap();
  await page.locator('.game-timer').waitFor();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('shiganshina-autosave-v1')).sceneIdx === 0);
  await page.locator('#carthage-home-return').tap();
  await officialHome(page);

  await page.route('**/official-intro-player.js', route => route.abort());
  await page.evaluate(() => sessionStorage.removeItem('qarton-official-intro-seen-v1'));
  await page.reload();
  assert.equal(await page.locator('#root').getAttribute('inert'), null);
  await officialHome(page);
  assert.deepEqual(errors, []);
});
