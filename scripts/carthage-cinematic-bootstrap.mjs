import { createCarthageCinematicAdapter } from "./carthage-cinematic-adapter.mjs";

// Registration only: no scene, timer, audio, DOM overlay, or game-state mutation.
if (typeof window !== "undefined") {
  window.QARTON_CINEMATIC_ENGINE = Object.freeze({
    version: "0.1.0",
    createAdapter: createCarthageCinematicAdapter
  });
}
