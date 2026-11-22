# QARTON G4 — verified production hook boundary (2026-11-22)

**Status:** original bundle lifecycle call sites inspected; BLOCKED for live integration pending approved game-owned event hook and Android regression. This is a source-level handoff, not approval to patch the game.

## Files actually inspected
- Production branch `feature/qarton-official-intro-integration-20261121`: `package.json`, `scripts/prepare-web.cjs`, and full original `index.html` blob SHA `db83f1d7bf8b5b457a82f6cd5c4f06fa14299b23` (3,812,987 characters).
- Isolated pilot branch: `scripts/qarton-cinematic-pilot-contract.cjs` and `scripts/qarton-g4-legacy-presentation-adapter.cjs`.
- Canonical 36-scene map and G0/G1 gates in PR #20.

## Confirmed production save boundary
`prepare-web.cjs` replaces the original minified `ur=(P,z=!1)=>{` handler and saves `sceneIdx:T`, `lineIdx:B`, `state:L`, `flags:K`, `part:cu`, `choicesHistory:yu`, `endingsSeen:[...Zn]` to the existing `shiganshina-*` keys. Its autosave hook runs on React dependencies `[f,T,B,L,K,cu]`, not a stable public scene-change event. It also exports `window.__carthageSaveNow` and `window.__carthageContinue`; these are **mutating host operations** and must never be called by a presentation renderer.

`prepare-web.cjs` also patches `Bu=(P)=>{` for Part III entry. The existing lock checks ending keys `light` or `shadow`. The standalone chapter-27 pilot must never bypass this lock.

The `carthage-native-navigation` script detects `.game-timer` using a `MutationObserver`. This is a UI heuristic, **not** an authoritative scene lifecycle callback. Do not use it for G4 state changes.

## Verified adapter behavior
`createLegacyPresentationSnapshot(input, featureEnabled)` is default-OFF, read-only, and maps only original `sceneIdx=0..17` to stable `legacy-01..legacy-18`. It rejects inserted-scene indices, invalid locales, and malformed accessibility values. `getDisplayChapterForLegacySave` maps original `sceneIdx=4` to display chapter 7 (Dar Mansour). It never changes or writes a save.

## Actual original bundle lifecycle — verified
- The story is the original `an=[...]` array embedded in `index.html` (around character offset 3,595,353). `j` is the active scene and `T` is its original zero-based index.
- `L9=(P)=>{...m(P),x(0),p("dialogue"),Q8(...),n("game")...}` is the **scene-entry function** (around offset 3,659,185). It also triggers the wall/bridge/gate cinematic interstitials; a presentation event must not interfere with those.
- `rl=(P,z=!1)=>{...}` is the **choice handler** (around offset 3,661,043). It updates health/time/trust/inventory/clues, flags, and choice history before navigation. For early scenes it schedules `L9(T+1)` or map; for `j.id>=7` it writes a result payload `h({choice:P,text:fd(P),dest:R})` and enters result mode.
- `r6=()=>{...}` is the **result continuation handler** (around offset 3,663,335). It resolves `gateSearch`, `ending`, `gameover`, `choices`, `next` (calling `L9(T+1)`), or `map`. Therefore **not every choice immediately advances a scene**, and no cinematic layer may infer that it does.
- `t6=(P)=>{...L9(P)...}` handles manual map travel and time deduction; `el=(P)=>{...if(P==="intro")L9(0)}` handles the opening interstitial. A hook only in `rl` would miss these entry paths.

## Still unverified — mandatory before runtime integration
1. Implement a **game-owned**, versioned, read-only scene-entry signal at the verified `L9` lifecycle, with separate handling for save restoration and first render. Do not assume the minified function names are a stable API across rebuilds.
2. Verify actual source references to `L9` for imported-save restoration and any alternate navigation paths; no DOM polling, duplicate React root, or external state mutation.
3. Decide exact insertion transitions and once-only effects from Astra's 36-chapter branch; missing new-scene flags in old saves must mean **unknown**, not **completed**.
4. Run production new-game, Part III lock, import/export, resume of original `sceneIdx=4`, and all ending reachability tests, including Android upgrade tests.
5. Keep PR #20 and #21 separate until explicit merge approval.

**Decision:** continue isolated G4 contract tests; no production edits or merge.
