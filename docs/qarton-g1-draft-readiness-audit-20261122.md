# QARTON G1 — Draft chapter readiness and integration blockers

**Scope:** 18 proposed chapters in PR #23; source is Astra PR #20. This is a static manifest audit, not an in-game playthrough or approval to integrate.

## Verified inventory

- 18/18 proposed chapter JSON files exist, with stable IDs, display order, predecessor/successor links and original manuscript text-marker inventories.
- 18/18 proposed chapters have `status=draft-not-runtime`, `runtimeIntegrated=false` and `legacySaveIndex=null`.
- **4/18** part-one chapters have structured `choices[]` with proposed state effects; **14/18** part-two/three chapters currently expose `choiceTextKeys[]` only. These 14 chapters **cannot yet execute narrative decisions**.
- **2/18** have a `location` field (02, 04); **4/18** have a `characters` field (02, 04, 10, 11); **2/18** have explicit `inputs` and `outputs` (10, 11). Missing fields do not imply the manuscript lacks characters or locations; it means the machine-readable contract is incomplete.
- Existing contracts have not been evaluated for runtime cost, once-only effect application, conditional speaker presence or ending unlocks. Static passing tests do **not** establish gameplay readiness.

## Blocking issues by priority

| Priority | Scope | Blocker | Required next step |
| --- | --- | --- | --- |
| P0 | Chapters 14,16,19,21,22,24,26,27,29,30,31,32,33,34 | Only text/choice IDs; no executable choice-state contracts | Editorially approve decision groups, effects, costs, guards and unknown-state fallbacks, then add draft-only data |
| P0 | All 18 drafts | No stable game-owned runtime choice bridge | Keep content feature OFF until verified lifecycle callback and once-only checkpoint tests |
| P0 | Nine endings | Gallery keys do not prove reachability | Nine fresh-playthrough tests, explicit sacrifice/traitor/light/shadow paths, original hero/secret lock audit |
| P0 | Save v1 | No authorized migration of `sceneIdx` or legacy storage | Preserve original 0–17 index and test resume/import without inferred flags |
| P1 | All 18 drafts | Missing explicit character presence/conditional speaker guards | Cross-check manuscript roles and L1 character registry; do not resurrect absent characters |
| P1 | 16 drafts | Missing machine-readable location reference | Align with L1 place IDs or flag proposed art/location pending; do not fabricate assets |
| P1 | Chapter 10 | Missing explicit smoke-rescue branch table and conditional Sara fallback | Record `knocks/mother/unknown` outcomes and absence handling after editor approval |
| P1 | Chapters 11 and 22 | Multiple independent choice groups and reload boundaries | Define group IDs and once-only effects; test resume before/after each group |
| P1 | Chapters 27,29,31,34 | 27 allocation/authorization/triage combinations and carry-forward | Add data-driven acceptance matrix; unknown state remains neutral |
| P1 | All drafts | Text IDs are inventoried but not all draft texts translated | Preserve Tunisian canonical manuscript; defer `ar/en/fr` until approved |
| P2 | Android | Device performance, audio, intro, lifecycle, accessibility | Run G5 after production bridge approval; record device/build evidence |

## Readiness decision

**Extraction complete; integration not ready.** Treat PR #23 as a draft staging/verification branch only. Do not merge, relocate assets, alter the original 18 scenes or nine endings, or modify `index.html`, `scripts/prepare-web.cjs`, or saved data. The next safe unit of work is editorially grounded choice-state contracts for chapter 14 onward, not a runtime migration.
