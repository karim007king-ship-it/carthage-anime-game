const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'carthage-branding-'));
const manifestPath = path.join(
  temporaryRoot,
  'android',
  'app',
  'src',
  'main',
  'AndroidManifest.xml'
);
const scriptPath = path.join(__dirname, '..', 'scripts', 'apply-android-branding.cjs');

try {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(
    manifestPath,
    `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application android:label="Carthage" android:icon="@mipmap/old_icon"
      android:roundIcon="@mipmap/old_round_icon">
  </application>
</manifest>`
  );

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: temporaryRoot,
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const manifest = fs.readFileSync(manifestPath, 'utf8');

  assert.match(manifest, /android:icon="@mipmap\/ic_launcher"/);
  assert.match(manifest, /android:roundIcon="@mipmap\/ic_launcher_round"/);
  assert.doesNotMatch(manifest, /old_icon|old_round_icon/);

  for (const file of [
    'res/drawable/ic_carthage_foreground.xml',
    'res/values/carthage_icon.xml',
    'res/mipmap-anydpi-v26/ic_launcher.xml',
    'res/mipmap-anydpi-v26/ic_launcher_round.xml',
    'res/mipmap-anydpi/ic_launcher.xml',
    'res/mipmap-anydpi/ic_launcher_round.xml'
  ]) {
    assert.ok(
      fs.existsSync(path.join(temporaryRoot, 'android', 'app', 'src', 'main', file)),
      `branding asset should be generated: ${file}`
    );
  }

  console.log('PASS: Android branding assets and manifest icon references.');
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
