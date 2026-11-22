# QARTON G4 — Save restoration and scene-entry acceptance protocol

**Status:** QA specification only; no runtime hook, save migration, or production integration approved.

## Source facts verified
- The original scene index is zero-based `sceneIdx`; `sceneIdx=4` is Dar Mansour, shown as display chapter 7 only.
- `scripts/prepare-web.cjs` preserves the original save fields and writes `shiganshina-slots-v1` and `shiganshina-autosave-v1`.
- The original scene entry function is `L9`; choice handling is `rl`, result continuation is `r6`, and map travel is `t6`. These minified symbols are build-specific, not stable APIs.
- Existing Part III gate requires original `light` or `shadow` ending; pilot `p3-single-load` cannot unlock it.

## Manual/device acceptance matrix
| ID | Starting state | Action | Expected result | Evidence required |
|---|---|---|---|---|
| G4-R01 | Clean install, no saves | Official home > New game | First original scene appears; no legacy home flash | Android recording + console/errors |
| G4-R02 | Original save at `sceneIdx=4` | Import and resume | Dar Mansour loads at original scene index 4, display chapter 7; same inventory/trust/time | Before/after exported JSON |
| G4-R03 | Existing save slot | Export > import > resume | All original fields, ending keys and choice history retained | Diff of canonicalized JSON |
| G4-R04 | Original scene active | Advance through choice/result | Scene-entry signal emitted only when scene actually changes; no duplicate choice effects | Event log with monotonic sequence |
| G4-R05 | Original scene active | Travel via map | Scene-entry event corresponds to destination; original time cost unchanged | Event log + save diff |
| G4-R06 | No qualifying ending | Open Part III | Locked; pilot chapter 27 inaccessible | Screenshot + save diff |
| G4-R07 | `light` or `shadow` completed | Open Part III | Existing game unlock rules apply; no additional cinematic unlock | Screenshot + ending evidence |
| G4-R08 | Active scene | Background > foreground, rotate, change locale | No duplicate effects, no stale audio resources, original scene resumes | Android recording + error log |
| G4-R09 | Original save on previous APK | Upgrade without uninstall | Save remains loadable, same original index and fields | APK versions + before/after exports |
| G4-R10 | All original ending routes | Reach each ending | Nine ending keys and paths tested individually; any unreachable route filed as a defect | Per-route reproducible steps |

## Proposed event boundary (not implemented)
A future game-owned event should be emitted **after** the game commits a new scene entry, using a versioned, immutable, presentation-only payload such as `{version:1,sceneId:'legacy-05',locale:'tn',accessibility:{reducedMotion:false}}`. It must not include `sceneIdx`, flags, health, inventory, choice history or storage keys. The adapter remains default-OFF until the host provides a verified lifecycle event. Save restoration must have an explicit first-render signal; never infer it from `.game-timer` or DOM polling.

## Release gate
No merge into the production branch until G4-R01..R10 are executed, failures triaged, source hook reviewed, and Android upgrade verified. This document is not a claim that device tests have run.
