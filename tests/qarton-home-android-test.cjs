// Run against the signed debug APK installed on a booted Android emulator.
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { once } = require('node:events');
const { setTimeout: delay } = require('node:timers/promises');

const appId = 'com.qarton.carthage';
const endpoint = 'http://127.0.0.1:9222';
const adb = (...args) => execFileSync('adb', args, { encoding: 'utf8' }).trim();

async function waitFor(check, description) {
  const deadline = Date.now() + 35000;
  let error;
  do {
    try {
      const result = await check();
      if (result) return result;
    } catch (failure) {
      error = failure;
    }
    await delay(250);
  } while (Date.now() < deadline);
  throw new Error(`Timed out waiting for ${description}`, { cause: error });
}

async function run() {
  adb('shell', 'wm', 'size', '1080x2400');
  adb('shell', 'wm', 'density', '480');
  adb('shell', 'settings', 'put', 'system', 'accelerometer_rotation', '0');
  adb('shell', 'settings', 'put', 'system', 'user_rotation', '0');
  adb('install', process.argv[2]);
  adb('shell', 'am', 'start', '-W', '-n', `${appId}/.MainActivity`);

  const pid = await waitFor(() => adb('shell', 'pidof', appId), 'the Carthage app process');
  adb('forward', 'tcp:9222', `localabstract:webview_devtools_remote_${pid}`);
  const target = await waitFor(async () => {
    const response = await fetch(endpoint + '/json/list');
    const pages = await response.json();
    return pages.find(page => page.type === 'page' && page.url.startsWith('https://localhost'));
  }, 'the packaged Carthage page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await once(ws, 'open');
  try {
    let nextId = 0;
    async function send(method, params) {
      const id = ++nextId;
      const result = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          ws.removeEventListener('message', onMessage);
          reject(new Error(`WebView did not respond to ${method}`));
        }, 5000);
        function onMessage(event) {
          const data = JSON.parse(event.data);
          if (data.id !== id) return;
          clearTimeout(timeout);
          ws.removeEventListener('message', onMessage);
          if (data.error) reject(new Error(data.error.message));
          else resolve(data.result);
        }
        ws.addEventListener('message', onMessage);
      });
      ws.send(JSON.stringify({ id, method, params }));
      return result;
    }
    async function evaluate(expression) {
      const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, returnByValue: true });
      if (exceptionDetails) throw new Error(exceptionDetails.exception?.description || exceptionDetails.text);
      return result.value;
    }
    async function tap(selector) {
      const { x, y } = await waitFor(() => evaluate(`(() => {
        const item = document.querySelector(${JSON.stringify(selector)});
        if (!item) return null;
        const rect = item.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      })()`), selector);
      await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    const homeTree = '#root > #qarton-home-v2[data-qarton-view=home]';
    const menuReady = `document.querySelectorAll('${homeTree} .qv-card').length === 4 && !document.getElementById('root').inert`;
    const skip = await waitFor(() => evaluate(`document.querySelector('.qarton-intro-skip') ? 'skip' : (${menuReady}) ? 'home' : ''`), 'the intro or home');
    if (skip === 'skip') {
      const skipIsShowing = await evaluate("Boolean(document.querySelector('.qarton-intro-skip'))");
      if (skipIsShowing) {
        try { await tap('.qarton-intro-skip'); }
        catch (error) { if (!await evaluate(menuReady)) throw error; }
      }
    }
    await waitFor(() => evaluate(menuReady), 'the four-card home after the intro');

    const layout = await evaluate(`(() => {
      const home = document.querySelector('${homeTree}');
      const cards = [...home.querySelectorAll('.qv-card')].map(card => card.getBoundingClientRect().toJSON());
      const footer = home.querySelector('footer').getBoundingClientRect();
      const brand = home.querySelector('.qv-brand').getBoundingClientRect();
      return { width: innerWidth, height: innerHeight, cards, footer: footer.bottom, brand: brand.top,
        overflow: home.scrollHeight - home.clientHeight, legacy: Boolean(document.querySelector('.home-actions.grid')) };
    })()`);
    assert.ok(layout.width < layout.height, 'Android WebView must be in portrait');
    assert.equal(layout.legacy, false);
    assert.ok(layout.brand >= 23 && layout.footer <= layout.height - 12, 'branding and footer must leave room at the system bars');
    assert.ok(layout.overflow <= 1, 'the portrait home must fit without scrolling');
    const [story, world, progress, settings] = layout.cards;
    assert.ok(story.x > world.x && progress.x > settings.x && story.top === world.top && progress.top === settings.top);
    for (const card of ['story', 'world', 'progress', 'settings']) {
      await tap(`[data-qarton-card=${card}]`);
      await waitFor(() => evaluate(`Boolean(document.querySelector('#qarton-home-v2[data-qarton-view=${card}]'))`), card);
      await tap('#qarton-home-back');
      await waitFor(() => evaluate(menuReady), 'return to QARTON');
    }
    console.log(`PASS: Android WebView portrait ${layout.width}×${layout.height}, four working cards, no legacy menu or overflow.`);
  } finally {
    ws.close();
    adb('forward', '--remove', 'tcp:9222');
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
