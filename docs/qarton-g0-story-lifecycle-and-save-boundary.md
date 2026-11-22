# QARTON G0 — Story lifecycle and save boundary

**2026-11-22 — verified from source, not a runtime implementation.**

## Source references

Game: `scripts/prepare-web.cjs` at `feature/qarton-official-intro-integration-20261121`, `tests/save-recovery-test.cjs`. Engine: `docs/CARTHAGE_ADAPTER_CONTRACT.md` on `qarton-cinematic-engine/main`.

### Verified lifecycle observations

- `prepare-web.cjs` hooks the original React route `if(f==="start")return A("main",` to render `QartonHome`; the next route is `if(f==="intro")return A("main",`. Do not insert a cinematic mount by replacing the start route.
- The autosave hook is injected in React scope and checks `f!=="game"`, then schedules `ur(cz,!0)`. Its dependencies include `[f,T,B,L,K,cu]`. These identifiers are minified and must not be assumed stable scene APIs.
- `window.__carthageSaveNow=()=>ur(cz,!1)` and `window.__carthageContinue` are existing host functions, **not** presentation event signals.
- Navigation helper detects `.game-timer` using a MutationObserver and adds home/save controls. This DOM observation is a heuristic, **not** a safe source of scene identity or narrative state.
- No stable `onSceneChanged(sceneId)` event is proven from the inspected integration code. A proper game-owned bridge must be explicitly introduced and tested rather than fabricated in the engine.

### Verified save behavior

- `tests/save-recovery-test.cjs` asserts chapter 5 has `sceneIdx=4`, that full saves are preserved, and incomplete saves trigger the embedded fallback.
- Storage keys include `shiganshina-slots-v1`, `shiganshina-autosave-v1`, `shiganshina-autosave-time-v1`.
- A **fresh install currently seeds a real chapter-5 save**. This is intentional legacy recovery behavior but conflicts with expected empty progress. Do not silently remove it or use it as a model for new players. A separate explicit migration project is required.
- The save test does not cover every possible malformed JSON record or device-upgrade scenario.

## Proposed safe interface (not yet implemented)

The game, from within its existing React/story scope, should emit a **read-only presentation snapshot** only after a real scene/line transition:

```js
{
  version: 1,
  sceneId: "legacy-05", // or "p3-single-load"
  locale: "tn",
  visualVariant: "default",
  accessibility: { reducedMotion: false }
}
```

The bridge sends this snapshot to a game-owned adapter; the adapter resolves a QARTON scene package and passes presentation-only data to the engine. Engine callbacks may report completion, errors and skip status but **must not** call choice handlers, update `sceneIdx`, mutate flags, or write `shiganshina-*` storage.

**Fallback:** feature flag OFF by default; missing scene package, asset failure or timeout must leave original gameplay and decisions accessible.

## Implementation gate

Before Luna writes the bridge, inspect the full source of the story render route and the `rl → r6` decision/advance path, then identify the narrowest stable in-scope call site. The current GitHub file reader did not return the large `index.html` content; do **not** claim this final call site has been verified. Avoid relying on DOM scraping or a second React root for authoritative story state.

## Pilot acceptance tests

1. New game from official home.
2. Existing save `sceneIdx=4` resumes Dar Mansour, no unexpected new scene.
3. Save/export/import is byte-equivalent in schema with cinematic flag OFF.
4. Cinematic flag ON shows one **standalone** chapter-27 pilot without altering story progress.
5. Three decisions update game-owned state exactly once only when pilot is integrated later.
6. Skipping animation does not skip a decision.
7. Reduced motion, missing assets and engine exception fall back to playable story.
8. Returning home, background/resume and locale change clean up cinematic resources.
9. Existing Part III gate and nine ending keys remain untouched.

## Decision

The base PR #19 passes GitHub CI and emulator, but **G0 story lifecycle gate remains open** pending full game bundle inspection and a real integration test. Astra may draft storyboards independently; Luna may prepare a standalone renderer behind a flag but must not modify save/choice logic or merge it into the live story yet.
