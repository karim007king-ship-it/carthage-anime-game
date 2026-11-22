# QARTON G4 — verified production hook boundary (2026-11-22)

**Status:** BLOCKED for live integration. This is a source-level handoff, not approval to patch the game.

## Files actually inspected
- Production branch `feature/qarton-official-intro-integration-20261121`: `package.json`, `scripts/prepare-web.cjs`.
- Isolated pilot branch: `scripts/qarton-cinematic-pilot-contract.cjs` and `scripts/qarton-g4-legacy-presentation-adapter.cjs`.
- Canonical 36-scene map and G0/G1 gates in PR #20.

## Confirmed production save boundary
`prepare-web.cjs` replaces the original minified `ur=(P,z=!1)=>{` handler and saves `sceneIdx:T`, `lineIdx:B`, `state:L`, `flags:K`, `part:cu`, `choicesHistory:yu`, `endingsSeen:[...Zn]` to the existing `shiganshina-*` keys. Its autosave hook runs on React dependencies `[f,T,B,L,K,cu]`, not a stable public scene-change event. It also exports `window.__carthageSaveNow` and `window.__carthageContinue`; these are **mutating host operations** and must never be called by a presentation renderer.

`prepare-web.cjs` also patches `Bu=(P)=>{` for Part III entry. The existing lock checks ending keys `light` or `shadow`. The standalone chapter-27 pilot must never bypass this lock.

The `carthage-native-navigation` script detects `.game-timer` using a `MutationObserver`. This is a UI heuristic, **not** an authoritative scene lifecycle callback. Do not use it for G4 state changes.

## Verified adapter behavior
`createLegacyPresentationSnapshot(input, featureEnabled)` is default-OFF, read-only, and maps only original `sceneIdx=0..17` to stable `legacy-01..legacy-18`. It rejects inserted-scene indices, invalid locales, and malformed accessibility values. `getDisplayChapterForLegacySave` maps original `sceneIdx=4` to display chapter 7 (Dar Mansour). It never changes or writes a save.

## Still unverified — mandatory before runtime integration
1. Inspect the **actual original `index.html` game bundle** and identify where `an[T]` is read, where `rl` invokes `r6`, and how `T` advances after decisions. Do not assume names from the build patch are a stable API.
2. Add a game-owned, versioned, read-only lifecycle event at a verified source call site. No DOM polling, duplicate React root, or external state mutation.
3. Decide exact insertion transitions and once-only effects from Astra's 36-chapter branch; missing new-scene flags in old saves must mean **unknown**, not **completed**.
4. Run production new-game, Part III lock, import/export, resume of original `sceneIdx=4`, and all ending reachability tests, including Android upgrade tests.
5. Keep PR #20 and #21 separate until explicit merge approval.

**Decision:** continue isolated G4 contract tests; no production edits or merge.
