import { createCinematicRuntime } from "@qarton/cinematic-engine/engine";
import { createSceneDefinition } from "@qarton/cinematic-engine/scene";

/**
 * Carthage-owned presentation bridge.
 *
 * This adapter deliberately accepts only a dedicated visual host and an asset
 * manifest. It has no access to story state, saves, inventory, choices, or
 * progression. The game must call mountScene() explicitly; importing or
 * registering the adapter never starts a scene or changes the current UI.
 */
export function createCarthageCinematicAdapter({
  root,
  assetManifest,
  device = {},
  lifecycleTarget = null,
  lifecyclePageTarget = lifecycleTarget,
  duration = 350,
  onError = () => {}
} = {}) {
  if (!root || typeof root.appendChild !== "function" || !root.ownerDocument) {
    throw new TypeError("Carthage cinematic adapter requires a dedicated DOM root");
  }
  if (!assetManifest || typeof assetManifest !== "object" || Array.isArray(assetManifest)) {
    throw new TypeError("Carthage cinematic adapter requires an asset manifest");
  }
  if (typeof onError !== "function") throw new TypeError("onError must be a function");

  const assets = Object.freeze({ ...assetManifest });
  const runtime = createCinematicRuntime({
    root,
    duration,
    device,
    lifecycleTarget,
    lifecyclePageTarget,
    loadAsset: async key => {
      const url = assets[key];
      if (typeof url !== "string" || !url.trim()) {
        throw new Error(`Unknown Carthage cinematic asset: ${key}`);
      }
      return url;
    },
    renderScene: async (scene, profile, { assets: assetManager }) => {
      const document = root.ownerDocument;
      const stage = document.createElement("div");
      stage.className = "carthage-engine-scene";
      Object.assign(stage.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none"
      });

      const layers = scene.layers
        .map((layer, index) => ({ ...layer, index }))
        .sort((a, b) => {
          const order = { background: 0, midground: 1, character: 2, foreground: 3, overlay: 4 };
          return order[a.role] - order[b.role] || a.depth - b.depth || a.index - b.index;
        });
      const backgroundBudget = Number.isInteger(profile.maxBackgroundLayers)
        ? profile.maxBackgroundLayers
        : 2;
      let backgroundCount = 0;

      for (const layer of layers) {
        const isBackground = layer.role === "background" || layer.role === "midground";
        if (isBackground && backgroundCount >= backgroundBudget) continue;
        if (isBackground) backgroundCount += 1;

        const url = await assetManager.load(layer.asset);
        const image = document.createElement("img");
        image.className = `carthage-engine-layer carthage-engine-layer--${layer.role}`;
        image.alt = "";
        image.draggable = false;
        image.decoding = "async";
        image.src = url;
        image.dataset.layerId = layer.id;
        Object.assign(image.style, {
          position: "absolute",
          inset: "0",
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: String(layer.opacity),
          zIndex: String(layers.indexOf(layer)),
          pointerEvents: "none"
        });
        stage.appendChild(image);
      }
      return stage;
    },
    onLifecycleError: error => onError(error, { phase: "lifecycle" }),
    onAudioError: error => onError(error, { phase: "audio" })
  });

  let destroyed = false;

  async function mountScene(config, options = {}) {
    if (destroyed) throw new Error("Carthage cinematic adapter has been destroyed");
    const scene = createSceneDefinition(config);
    return runtime.transitionTo(scene, {
      duration: options.duration ?? scene.durationMs ?? duration
    });
  }

  async function destroy() {
    if (destroyed) return;
    destroyed = true;
    await runtime.destroy();
  }

  return Object.freeze({
    mountScene,
    destroy,
    getProfile: runtime.getProfile,
    get isActive() { return runtime.isActive(); },
    setActive: runtime.setActive
  });
}
