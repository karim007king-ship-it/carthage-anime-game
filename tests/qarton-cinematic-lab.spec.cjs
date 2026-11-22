'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
test('chapter 27 lab renders JSON timeline and controls without errors', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:41739/examples/qarton-single-load-lab.html');
    await page.locator('h1').waitFor();
    assert.match(await page.locator('h1').innerText(), /حمولة واحدة/);
    assert.equal(await page.locator('[data-choice="prioritizeBridge"]').isDisabled(),true);
    await page.locator('#play').click();
    await page.waitForFunction(() => document.querySelector('#subtitle')?.textContent?.includes('نور'), { timeout: 5000 });
    assert.match(await page.locator('#subtitle').innerText(), /نور/);
    await page.locator('#pause').click();
    await page.locator('#replay').click();
    assert.equal(await page.locator('[data-choice="prioritizeBridge"]').isDisabled(),true);
    await page.locator('#seek').fill('20500');
    assert.equal(await page.locator('[data-choice="prioritizeBridge"]').isEnabled(),true);
    await page.locator('[data-choice="prioritizeBridge"]').click();
    assert.match(await page.locator('#result').innerText(),/الجسر/);
    await page.locator('#reduce').click();
    assert.equal(await page.locator('.stage').getAttribute('data-reduced-motion'),'true');
    assert.deepEqual(errors,[]);
  } finally { await browser.close(); }
});
