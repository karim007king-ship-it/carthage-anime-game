import { buildLayerPlan } from "@qarton/cinematic-engine";
import { createCinematicRuntime } from "@qarton/cinematic-engine/engine";
import { createSceneDefinition } from "@qarton/cinematic-engine/scene";

function createHostPageLifecycle({ target, pageTarget = target, setActive, onError }) {
  const validTarget = value => value
    && typeof value.addEventListener === "function"
    && typeof value.removeEventListener === "function";
  if (!validTarget(target) || !validTarget(pageTarget)) {
    throw new TypeError("Page lifecycle requires document and page EventTargets");
  }

  let started = false;
  let active = true;
  const report = error => {
    try { onError(error, { phase: "lifecycle" }); } catch { /* diagnostics must not break lifecycle */ }
  };
  const apply = next => {
    if (active === next) return;
    try {
      setActive(next);
      active = next;
    } catch (error) {
      report(error);
    }
  };
  const sync = () => apply(target.visibilityState !== "hidden");
  const listeners = [
    [target, "visibilitychange", sync],
    [pageTarget, "pagehide", () => apply(false)],
    [pageTarget, "pageshow", sync]
  ];

  function start() {
    if (started) return false;
    const attached = [];
    try {
      for (const [eventTarget, type, listener] of listeners) {
        eventTarget.addEventListener(type, listener);
        attached.push([eventTarget, type, listener]);
      }
      started = true;
      sync();
      return true;
    } catch (error) {
      for (const [eventTarget, type, listener] of attached.reverse()) {
        try { eventTarget.removeEventListener(type, listener); } catch { /* best effort rollback */ }
      }
      throw error;
    }
  }

  function stop() {
    if (!started) return false;
    const errors = [];
    for (const [eventTarget, type, listener] of listeners) {
      try { eventTarget.removeEventListener(type, listener); } catch (error) { errors.push(error); }
    }
    if (errors.length === 1) throw errors[0];
    if (errors.length > 1) throw new AggregateError(errors, "Page lifecycle listeners could not all be removed");
    started = false;
    return true;
  }

  return Object.freeze({
    start,
    stop,
    getState: () => Object.freeze({ started, active })
  });
}

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

  const originalStyles = root.style ? {
    position: root.style.position,
    overflow: root.style.overflow,
    isolation: root.style.isolation
  } : null;
  const appliedStyles = { position: "relative", overflow: "hidden", isolation: "isolate" };
  if (root.style) {
    for (const [key, value] of Object.entries(appliedStyles)) {
      if (!root.style[key]) root.style[key] = value;
    }
  }

  const assets = Object.freeze({ ...assetManifest });
  const runtime = createCinematicRuntime({
    root,
    duration,
    device,
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
    }
  });

  let active = true;
  let destroyStarted = false;
  let destroyed = false;
  let destroyPromise = null;
  const setActive = next => {
    if (destroyStarted) throw new Error("Carthage cinematic adapter has been destroyed");
    if (typeof next !== "boolean") throw new TypeError("Activity state must be boolean");
    runtime.setActive(next);
    active = next;
    return active;
  };
  const pageLifecycle = lifecycleTarget
    ? createHostPageLifecycle({
      target: lifecycleTarget,
      pageTarget: lifecyclePageTarget ?? lifecycleTarget,
      setActive,
      onError
    })
    : null;
  pageLifecycle?.start();

  async function mountScene(config, options = {}) {
    if (destroyStarted) throw new Error("Carthage cinematic adapter has been destroyed");
    const scene = createSceneDefinition(config);
    const transitionDuration = options.duration
      ?? (Number.isFinite(config.durationMs) ? config.durationMs : duration);
    return runtime.transitionTo(scene, { duration: transitionDuration });
  }

  function restoreHostStyles() {
    if (!root.style || !originalStyles) return;
    for (const key of Object.keys(appliedStyles)) {
      if (root.style[key] === appliedStyles[key]) {
        root.style[key] = originalStyles[key] ?? "";
      }
    }
  }

  function destroy() {
    if (destroyed) return Promise.resolve();
    if (destroyPromise) return destroyPromise;
    destroyStarted = true;
    destroyPromise = (async () => {
      const errors = [];
      for (const cleanup of [
        () => pageLifecycle?.stop(),
        () => runtime.destroy()
      ]) {
        try { await cleanup(); } catch (error) { errors.push(error); }
      }
      if (errors.length === 1) throw errors[0];
      if (errors.length > 1) {
        throw new AggregateError(errors, "Carthage cinematic adapter teardown failed");
      }
      restoreHostStyles();
      destroyed = true;
    })().finally(() => {
      destroyPromise = null;
    });
    return destroyPromise;
  }

  return Object.freeze({
    mountScene,
    destroy,
    getProfile: runtime.getProfile,
    get isActive() { return active && !destroyed; },
    setActive
  });
}
