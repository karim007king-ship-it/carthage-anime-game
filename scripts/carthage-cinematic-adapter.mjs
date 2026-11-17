import { buildLayerPlan } from "@qarton/cinematic-engine";
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
  lifecycleTarget = typeof document !== "undefined" ? document : null,
  lifecyclePageTarget = typeof window !== "undefined" ? window : lifecycleTarget,
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

  // The adapter owns this dedicated presentation root. Establish a containing
  // block and stacking context so absolute scene layers cannot escape into the
  // story UI or attach themselves to an unrelated ancestor.
  if (root.style) {
    if (!root.style.position) root.style.position = "relative";
    if (!root.style.overflow) root.style.overflow = "hidden";
    if (!root.style.isolation) root.style.isolation = "isolate";
  }

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

      const layers = buildLayerPlan(scene, profile);

      for (const [index, layer] of layers.entries()) {
        const url = await assetManager.load(layer.asset);
        const image = document.createElement("img");
        image.className = `carthage-engine-layer carthage-engine-layer--${layer.role}`;
        image.alt = "";
        image.draggable = false;
        image.decoding = "async";
        image.src = url;
        if (typeof image.decode === "function") await image.decode();
        image.dataset.layerId = layer.id;
        Object.assign(image.style, {
          position: "absolute",
          inset: "0",
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: String(layer.opacity),
          zIndex: String(index),
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
    const transitionDuration = options.duration
      ?? (Number.isFinite(config.durationMs) ? config.durationMs : duration);
    return runtime.transitionTo(scene, { duration: transitionDuration });
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
