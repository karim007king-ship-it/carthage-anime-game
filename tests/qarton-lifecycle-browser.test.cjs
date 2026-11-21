const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844}});
    await page.setContent(`<!doctype html><html><head></head><body>
      <div id="root"><div class="home-actions flex"><div class="home-actions grid">
        <button id="start">ابدأ الجزء الأول</button>
      </div></div></div>
    </body></html>`);
    await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'../scripts/qarton-main-tree.js'),'utf8')});
    await page.waitForSelector('#qarton-main-tree');
    assert.equal(await page.locator('#qarton-main-tree').isVisible(),true,'QARTON home should mount on initial app home');

    await page.evaluate(() => {
      document.getElementById('start').addEventListener('click',() => {
        document.getElementById('root').innerHTML='<main><section><h1>مقدمة القصة</h1><button>كمّل...</button></section></main>';
      });
      document.getElementById('start').click();
    });
    await page.waitForFunction(() => !document.getElementById('qarton-main-tree'));
    assert.equal(await page.locator('#root main').innerText(),'مقدمة القصة\nكمّل...','story intro must remain visible after the QARTON handoff');

    await page.evaluate(() => {
      document.getElementById('root').innerHTML='<main><div class="home-actions flex"><div class="home-actions grid"><button id="start-again">ابدأ الجزء الأول</button></div></div></main>';
    });
    await page.waitForSelector('#qarton-main-tree',{timeout:3000});
    assert.equal(await page.locator('#qarton-main-tree').isVisible(),true,'QARTON home must be restored after React returns from gameplay');
    assert.match(await page.locator('#qarton-main-tree').innerText(),/القصة|آخر يوم في قرطاج/,'restored overlay must render the QARTON home tree');
    console.log('PASS: browser lifecycle home -> story intro -> home return');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode=1; });
