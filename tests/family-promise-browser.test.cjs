'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  // The shared Codex test environment has Playwright preinstalled outside this repo.
  ({ chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
}

const webRoot = path.resolve(__dirname, '..', 'www');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

async function main() {
  assert.ok(fs.existsSync(path.join(webRoot, 'index.html')), 'run npm run prepare:web before browser test');
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const file = path.resolve(webRoot, relative);
    if (!file.startsWith(webRoot + path.sep) && file !== path.join(webRoot, 'index.html')) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(file, (error, body) => {
      if (error) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

  async function startFresh(context) {
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`http://127.0.0.1:${address.port}`, { waitUntil: 'domcontentloaded' });
    const start = page.getByRole('button', { name: /ابدأ الجزء الأول/ });
    await start.waitFor({ state: 'visible', timeout: 30000 });
    await start.click();
    const skipIntro = page.getByRole('button', { name: /تخطي المقدمة/ });
    if (await skipIntro.count()) await skipIntro.click();
    await page.getByText(/قرطاج\.\.\. 10:00 صباحا/).waitFor({ state: 'visible', timeout: 15000 });
    return { page, pageErrors };
  }

  async function revealChoice(page, expectedLabel) {
    for (let step = 0; step < 32; step++) {
      const target = page.getByRole('button', { name: new RegExp(expectedLabel) });
      if (await target.count()) return target.first();
      const dialogue = page.locator('.dialogue-panel button').first();
      if (!(await dialogue.count())) throw new Error(`dialogue control missing while waiting for ${expectedLabel}`);
      await dialogue.click({ timeout: 5000 });
      await page.waitForTimeout(340);
    }
    throw new Error(`choice ${expectedLabel} did not appear`);
  }

  try {
    // Route the existing opening scene into the inserted scene, then choose the knocks branch.
    const context = await browser.newContext({ viewport: { width: 412, height: 915 } });
    const { page, pageErrors } = await startFresh(context);
    const originalChoice = await revealChoice(page, 'نبقى مع لينا ونحميها');
    await originalChoice.click();
    await page.getByText('ريان... تسمع؟ حتى الدار ولات تتنفّس بصعوبة.').waitFor({ state: 'visible', timeout: 15000 });
    await revealChoice(page, 'نعلّم لينا ثلاث نقرات');
    const beforeBranch = await page.evaluate(() => JSON.parse(localStorage.getItem('shiganshina-autosave-v1')));
    assert.equal(beforeBranch.sceneIdx, 18, 'new scene uses appended save index 18');
    assert.ok(!beforeBranch.flags.some(flag => flag.startsWith('familySignal:')));
    await page.getByRole('button', { name: /نعلّم لينا ثلاث نقرات/ }).click();
    await page.getByText('اسمعي: دقّة... دقّة... دقّة.', { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
    const secondLine = page.locator('.dialogue-panel button').first();
    await secondLine.click();
    await page.waitForTimeout(350);
    await secondLine.click();
    await page.waitForTimeout(350);
    await page.locator('#carthage-save-now').click();
    const midSave = await page.evaluate(() => JSON.parse(localStorage.getItem('shiganshina-autosave-v1')));
    assert.equal(midSave.sceneIdx, 18);
    assert.equal(midSave.lineIdx, 1, 'the midchapter line pointer is saved');
    assert.deepEqual(midSave.flags.filter(flag => flag.startsWith('familySignal:')), ['familySignal:knocks']);
    assert.equal(midSave.state.time, beforeBranch.state.time - 1, 'choice charge is recorded once');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /متابعة آخر حفظ/ }).click();
    await page.getByText('ونجاوبك كيفاش؟', { exact: false }).waitFor({ state: 'visible', timeout: 15000 });
    const afterReload = await page.evaluate(() => JSON.parse(localStorage.getItem('shiganshina-autosave-v1')));
    assert.equal(afterReload.sceneIdx, 18);
    assert.equal(afterReload.lineIdx, 1);
    assert.equal(afterReload.state.time, midSave.state.time, 'restoring does not charge the branch again');
    await revealChoice(page, 'نمشيوا للسوق');
    await page.getByRole('button', { name: /نمشيوا للسوق/ }).click();
    await page.getByText(/السوق — قرطاج/).waitFor({ state: 'visible', timeout: 15000 });
    assert.deepEqual(pageErrors, [], 'browser run has no uncaught runtime errors');
    await context.close();

    // A separate new game verifies the alternate mother/string branch and the shared exit.
    const secondContext = await browser.newContext({ viewport: { width: 412, height: 915 } });
    const secondRun = await startFresh(secondContext);
    await (await revealChoice(secondRun.page, 'نبقى مع لينا ونحميها')).click();
    await secondRun.page.getByText('ريان... تسمع؟ حتى الدار ولات تتنفّس بصعوبة.').waitFor({ state: 'visible', timeout: 15000 });
    await revealChoice(secondRun.page, 'نخلّي لينا تشدّ يد سارة');
    await secondRun.page.getByRole('button', { name: /نخلّي لينا تشدّ يد سارة/ }).click();
    await secondRun.page.getByText('ونعلّق الخيط الأحمر', { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
    const motherSave = await secondRun.page.evaluate(() => JSON.parse(localStorage.getItem('shiganshina-autosave-v1')));
    assert.equal(motherSave.sceneIdx, 18);
    assert.deepEqual(motherSave.flags.filter(flag => flag.startsWith('familySignal:')), ['familySignal:mother']);
    await revealChoice(secondRun.page, 'نمشيوا للسوق');
    await secondRun.page.getByRole('button', { name: /نمشيوا للسوق/ }).click();
    await secondRun.page.getByText(/السوق — قرطاج/).waitFor({ state: 'visible', timeout: 15000 });
    assert.deepEqual(secondRun.pageErrors, [], 'alternate browser route has no uncaught runtime errors');
    await secondContext.close();

    console.log('Family promise browser run: PASS (new game → original scene 1 → promise → both branches, save/reload midchapter, original scene 2)');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
