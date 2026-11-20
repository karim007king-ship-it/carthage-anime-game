const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { validateManifest } = require("../scripts/validate-cinematic-assets.cjs");

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "qarton-assets-"));
  const directory = path.join(root, "assets", "cinematic");
  fs.mkdirSync(directory, { recursive: true });
  return {
    root,
    directory,
    writeManifest(value) {
      fs.writeFileSync(path.join(directory, "manifest.json"), typeof value === "string" ? value : JSON.stringify(value));
    },
    cleanup() { fs.rmSync(root, { recursive: true, force: true }); }
  };
}

test("accepts an existing local packaged image", t => {
  const f = fixture(); t.after(f.cleanup);
  fs.writeFileSync(path.join(f.directory, "wall.webp"), "image");
  f.writeManifest({ assets: [{ key: "wall", path: "wall.webp" }] });
  const result = validateManifest(f.root);
  assert.equal(result.configured, true);
  assert.deepEqual(result.files, [{ key: "wall", path: "./assets/cinematic/wall.webp" }]);
});

test("optional missing manifest is reported as not configured", t => {
  const f = fixture(); t.after(f.cleanup);
  fs.rmSync(path.join(f.root, "assets"), { recursive: true, force: true });
  assert.deepEqual(validateManifest(f.root), { configured: false, count: 0, files: [] });
  assert.throws(() => validateManifest(f.root, { required: true }), /manifest is missing/);
});

test("rejects missing files", t => {
  const f = fixture(); t.after(f.cleanup);
  f.writeManifest({ assets: [{ key: "wall", path: "missing.webp" }] });
  assert.throws(() => validateManifest(f.root), /Missing cinematic asset file/);
});

test("rejects duplicate keys", t => {
  const f = fixture(); t.after(f.cleanup);
  fs.writeFileSync(path.join(f.directory, "a.webp"), "a");
  f.writeManifest({ assets: [{ key: "same", path: "a.webp" }, { key: "same", path: "a.webp" }] });
  assert.throws(() => validateManifest(f.root), /Duplicate cinematic asset key/);
});

test("rejects traversal, absolute paths, and remote URLs", t => {
  const f = fixture(); t.after(f.cleanup);
  for (const unsafe of ["../secret.webp", "folder/../../secret.webp", "https://example.test/a.webp", "//cdn.test/a.webp", "/absolute.webp", "folder\\wall.webp"]) {
    f.writeManifest({ assets: [{ key: "unsafe", path: unsafe }] });
    assert.throws(() => validateManifest(f.root), /local relative path|Unsafe/);
  }
});

test("rejects invalid JSON and unsupported file extensions", t => {
  const f = fixture(); t.after(f.cleanup);
  f.writeManifest("{broken");
  assert.throws(() => validateManifest(f.root), /Invalid cinematic manifest JSON/);
  f.writeManifest({ assets: [{ key: "movie", path: "clip.mp4" }] });
  assert.throws(() => validateManifest(f.root), /Unsupported image extension/);
});

test("rejects symbolic links inside the asset directory", t => {
  const f = fixture(); t.after(f.cleanup);
  const outside = path.join(f.root, "outside.webp");
  fs.writeFileSync(outside, "outside");
  fs.symlinkSync(outside, path.join(f.directory, "linked.webp"));
  f.writeManifest({ assets: [{ key: "linked", path: "linked.webp" }] });
  assert.throws(() => validateManifest(f.root), /Symlink is not allowed/);
});
