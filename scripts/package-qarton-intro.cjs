// Optional QARTON intro packaging pass. Run after prepare-web.cjs.
// Requires internet only at build time; all runtime assets are bundled for offline Android use.
const fs = require('node:fs/promises');
const path = require('node:path');
const https = require('node:https');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'www');
const base = 'https://raw.githubusercontent.com/karim007king-ship-it/qarton-cinematic-engine/e01128bdae28058b94169977f8679e7e39889582/';
const expected = '6b22dbc843affed208e066cb6c68044779683594e9826a52cb1f1619a53fe2ff';
function download(url, redirects = 3) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 30000 }, response => {
      if ([301,302,307,308].includes(response.statusCode) && response.headers.location && redirects) {
        response.resume(); download(response.headers.location, redirects - 1).then(resolve, reject); return;
      }
      if (response.statusCode !== 200) { response.resume(); reject(new Error('Download HTTP ' + response.statusCode)); return; }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('timeout', function () { this.destroy(new Error('QARTON download timed out')); }).on('error', reject);
  });
}
async function main() {
  if (process.env.QARTON_INTRO_ENABLE !== '1') {
    console.log('QARTON intro packaging disabled (set QARTON_INTRO_ENABLE=1 to enable).');
    return;
  }
  const [video, runtime, css] = await Promise.all([
    download(base + 'official-intro.mp4'),
    download(base + 'src/runtime/official-intro-player.js'),
    download(base + 'src/runtime/official-intro.css')
  ]);
  const digest = crypto.createHash('sha256').update(video).digest('hex');
  if (digest !== expected) throw new Error('QARTON intro SHA-256 mismatch: ' + digest);
  const htmlPath = path.join(out, 'index.html');
  let html = await fs.readFile(htmlPath, 'utf8');
  if (!html.includes('</body>')) throw new Error('Missing </body> in prepared Carthage page');
  if (html.includes('id="qarton-official-intro-bootstrap"')) throw new Error('QARTON intro already installed');
  const dir = path.join(out, 'qarton-intro');
  await fs.mkdir(dir, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(dir, 'official-intro.mp4'), video),
    fs.writeFile(path.join(dir, 'official-intro-player.js'), runtime),
    fs.writeFile(path.join(dir, 'official-intro.css'), css)
  ]);
  const bootstrap = `<link rel="stylesheet" href="./qarton-intro/official-intro.css">
<script id="qarton-official-intro-bootstrap" type="module">
import { createOfficialIntroPlayer } from './qarton-intro/official-intro-player.js';
try {
  const key='qarton-official-intro-seen-v1';
  // A reload used to return from gameplay must not replay the video.
  const seen=sessionStorage.getItem(key)==='1';
  if (!seen && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sessionStorage.setItem(key,'1');
    const player=createOfficialIntroPlayer({
      mount:document.body,
      src:'./qarton-intro/official-intro.mp4',
      timeoutMs:10000,
      onComplete:()=>{}
    });
    player.start().catch(()=>player.skip());
  }
} catch(error) { console.warn('Optional QARTON intro unavailable',error); }
</script>`;
  html = html.replace('</body>', bootstrap + '\n</body>');
  await fs.writeFile(htmlPath, html);
  console.log('QARTON official intro bundled locally; verified SHA-256 ' + digest);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
