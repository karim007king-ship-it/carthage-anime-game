# QARTON Cinematic Engine adapter for Carthage

## Current integration state

The engine dependency is pinned to commit `550cfa3f3439ce30dbc4454d2b6d8c9e8284e6d4` rather than a moving branch or tag. The Android preparation step bundles the adapter into `www/carthage-cinematic-adapter.js` and includes it as a separate script asset.

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

## Validation still required

CI validates Node-level adapter behavior and verifies that the bundled adapter is copied into the Capacitor Android assets. It does not prove visual quality or audio behavior on a physical Android device. The HONOR 400 Pro / Android WebView check remains a separate release gate.
