# QARTON Cinematic Engine adapter for Carthage

## Current integration state

The engine dependency is pinned to commit `c0583058c570c8b5c7fee7da8cbe5818b67612af` rather than a moving branch or tag. The Android preparation step bundles the adapter into `www/carthage-cinematic-adapter.js` and includes it as a separate script asset.

The browser bootstrap only registers `window.QARTON_CINEMATIC_ENGINE`. It does not instantiate a runtime, create an overlay, start audio, or mount a scene. This is intentional: the current game presentation remains the active renderer until a specific scene is approved for the pilot.

## Host contract

A caller must supply:

- A dedicated, isolated DOM root for the cinematic presentation. Do not pass the game root or any element containing React-managed story UI.
- An explicit asset manifest mapping stable asset keys to URLs.
- A scene definition with a unique ID and layers using the engine's supported roles.

Example (illustrative only; not called by the game yet):

```js
const host = document.createElement("div");
host.className = "carthage-cinematic-host";
host.style.cssText = "position:relative;overflow:hidden;isolation:isolate";
document.body.appendChild(host);

const cinematic = window.QARTON_CINEMATIC_ENGINE.createAdapter({
  root: host,
  assetManifest: {
    "pilot-background": "/assets/scenes/pilot-background.webp"
  },
  device: {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: navigator.connection?.saveData === true
  }
});

await cinematic.mountScene({
  id: "approved-pilot-scene",
  durationMs: 350,
  layers: [
    { id: "background", role: "background", asset: "pilot-background", depth: 0 }
  ]
});

// On scene teardown:
await cinematic.destroy();
host.remove();
```

The game must explicitly own the host element and call `mountScene()`. It must also call `destroy()` and remove the host when leaving the pilot.

## Non-negotiable boundaries

- The adapter does not import or read story state, chapter state, dialogue, choices, inventory, clues, trust, score, health, time, endings, or save records.
- Do not put engine objects, DOM nodes, image elements, runtime clocks, or audio elements into save data.
- Do not replace the current Great Wall effects as part of this integration.
- Do not enable the pilot in a production story scene until Android WebView rendering, scene teardown, save/load regression, reduced-motion, and real-device lifecycle checks pass.
- Keep the existing renderer as the fallback if adapter creation, asset resolution, scene rendering, or cleanup fails.

## Android WebView offline asset policy

The adapter passes manifest URLs to the WebView as image sources; it does not download, mirror, or package remote files. For an offline-capable Android pilot, every scene asset must be committed under the app's web asset directory (for example, `assets/cinematic/`) and referenced by a relative path such as `./assets/cinematic/carthage-wall.webp`. Do not use GitHub raw URLs, CDN URLs, or other remote hosts as the only copy of a scene asset.

A Node adapter test now verifies that a packaged relative path is preserved. This is a URL-contract test only: it does not prove that the image file exists in the APK or that Android WebView can decode it offline.

**Current limitation:** this repository revision has no cinematic asset manifest or committed `assets/cinematic/` files, and the game does not yet instantiate the adapter for a story scene. Therefore offline cinematic playback is not yet enabled or verified. Before enabling it, add the real local assets and manifest, make the Android packaging workflow fail if any manifest file is missing, then test airplane mode on the HONOR device. If an image fails to load or decode, the existing scene must remain visible and the game renderer must remain the fallback.

## Cinematic asset manifest contract

When the pilot receives approved artwork, add `assets/cinematic/manifest.json` with this shape:

```json
{
  "assets": [
    { "key": "carthage-wall", "path": "carthage-wall.webp" }
  ]
}
```

Paths are relative to `assets/cinematic/`. The validator accepts only local PNG, JPEG, WebP, or AVIF files; rejects remote URLs, absolute paths, traversal, duplicate keys, missing files, and symlinks; and emits the exact relative URL expected by the adapter (`./assets/cinematic/...`). The manifest and every referenced image must be included in the Android web bundle.

The validator runs against both the source web root and the Capacitor-packaged `public/` root. The current pilot intentionally treats a missing manifest as an informational skip, because no approved cinematic assets have been committed yet. Once real assets are approved, change the workflow invocation to include `--required`; do not enable that gate before the manifest and files are present.

## Validation still required

CI validates Node-level adapter behavior and verifies that the bundled adapter is copied into the Capacitor Android assets. It does not prove visual quality or audio behavior on a physical Android device. The HONOR 400 Pro / Android WebView check remains a separate release gate.

## Character animation contract test

The Carthage test suite imports the pinned engine package and mounts a single isolated test character through `createCharacterStage()`. It exercises the deterministic idle sampler, movement pose sampler, and sprite-frame sampler against a fake DOM host, verifies the configured sprite asset keys change as the shared clock advances, then verifies stage teardown removes the character element.

This is an integration contract test only. It does not mount a character in the live story, supply production anime artwork, or prove Android WebView rendering. The game still needs an approved local character sprite set and a dedicated story-scene host before a visual pilot can be enabled.

The Carthage adapter owns its small page-lifecycle bridge instead of depending on a runtime-specific `isActive()` or lifecycle-target API. It forwards activity changes through the stable `runtime.setActive()` method and retains listener ownership until every detach succeeds, allowing teardown retries across engine revisions.
