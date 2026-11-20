#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const MANIFEST_RELATIVE = path.join("assets", "cinematic", "manifest.json");
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

function fail(message) {
  throw new Error(message);
}

function validateManifest(rootDirectory, options = {}) {
  const root = path.resolve(rootDirectory);
  const assetsRoot = path.join(root, "assets", "cinematic");
  const manifestPath = path.join(assetsRoot, "manifest.json");
  const required = options.required === true;

  if (!fs.existsSync(manifestPath)) {
    if (required) fail("Required cinematic asset manifest is missing: " + MANIFEST_RELATIVE);
    return { configured: false, count: 0, files: [] };
  }

  const rootStat = fs.lstatSync(root);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) fail("Web root must be a real directory.");
  const assetsStat = fs.lstatSync(assetsRoot);
  if (assetsStat.isSymbolicLink() || !assetsStat.isDirectory()) fail("Cinematic assets directory must not be a symlink.");

  const manifestStat = fs.lstatSync(manifestPath);
  if (manifestStat.isSymbolicLink() || !manifestStat.isFile()) fail("Cinematic manifest must be a regular file.");

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    fail("Invalid cinematic manifest JSON: " + error.message);
  }

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest) || !Array.isArray(manifest.assets)) {
    fail('Cinematic manifest must be an object with an "assets" array.');
  }

  const keys = new Set();
  const files = [];
  for (const [index, asset] of manifest.assets.entries()) {
    if (!asset || typeof asset !== "object" || Array.isArray(asset)) fail("Asset #" + (index + 1) + " must be an object.");
    const key = asset.key;
    const relativePath = asset.path;
    if (typeof key !== "string" || !key.trim()) fail("Asset #" + (index + 1) + " has an empty or invalid key.");
    if (keys.has(key)) fail('Duplicate cinematic asset key: "' + key + '".');
    keys.add(key);
    if (typeof relativePath !== "string" || !relativePath.trim()) fail('Asset "' + key + '" has an empty or invalid path.');
    if (/[\u0000-\u001f\u007f\\]/.test(relativePath)) fail('Unsafe characters in path for asset "' + key + '".');
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(relativePath)) fail('Asset "' + key + '" must use a local relative path.');
    const segments = relativePath.split("/");
    if (segments.some(segment => !segment || segment === "." || segment === "..")) fail('Unsafe path segments for asset "' + key + '".');
    const extension = path.posix.extname(relativePath).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(extension)) fail('Unsupported image extension for asset "' + key + '": ' + extension);

    let current = assetsRoot;
    for (const segment of segments) {
      current = path.join(current, segment);
      let stat;
      try {
        stat = fs.lstatSync(current);
      } catch {
        fail('Missing cinematic asset file for "' + key + '": ' + relativePath);
      }
      if (stat.isSymbolicLink()) fail('Symlink is not allowed in cinematic asset path for "' + key + '".');
    }
    const fileStat = fs.lstatSync(current);
    if (!fileStat.isFile()) fail('Cinematic asset is not a regular file for "' + key + '".');
    const resolved = fs.realpathSync(current);
    if (resolved !== current && !resolved.startsWith(assetsRoot + path.sep)) fail('Cinematic asset escapes its asset directory: ' + relativePath);
    files.push({ key, path: "./assets/cinematic/" + segments.join("/") });
  }

  return { configured: true, count: files.length, files };
}

function main(argv) {
  const rootIndex = argv.indexOf("--root");
  const root = rootIndex >= 0 ? argv[rootIndex + 1] : process.cwd();
  if (!root || root.startsWith("--")) fail("--root requires a directory path.");
  const result = validateManifest(root, { required: argv.includes("--required") });
  if (!result.configured) {
    console.log("NOTICE: cinematic assets are not configured; optional pilot check skipped.");
    return;
  }
  console.log("PASS: validated " + result.count + " local cinematic asset(s).");
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error("CINEMATIC ASSET VALIDATION FAILED: " + error.message);
    process.exitCode = 1;
  }
}

module.exports = { validateManifest };
