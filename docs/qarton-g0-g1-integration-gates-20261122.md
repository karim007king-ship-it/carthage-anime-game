# QARTON G0/G1 — Integration gate and cross-team handoff

**Status:** review checklist; no production integration authorized. Prepared while Luna works on the isolated G2 renderer in PR #21.

## Confirmed from existing G0 source audits
- The original 18-scene save index `sceneIdx` is zero-based and must remain unchanged.
- The 36-chapter display map is a presentation mapping, **not** a migration of persisted progress.
- A saved `sceneIdx=4` remains original Dar Mansour, displayed as chapter 7.
- No verified game-owned `onSceneChanged` hook exists yet. A DOM observer or minified React symbol must not be treated as a stable lifecycle API.
- The standalone chapter-27 pilot has three choice IDs; it cannot commit story effects or unlock Part III.
- Nine ending keys and original save storage must remain untouched.

## Workstreams and ownership
| Workstream | Owner | Output | Merge gate |
| --- | --- | --- | --- |
| G0 save/lifecycle audit | GPT-6 | verified event bridge call site and regression tests | original story source inspected |
| G1 narrative map, choices, continuity | Astra | 36-scene storyboard and branch-state specification | editor review and stable IDs |
| G2 character/camera rendering | Luna 6 | isolated 2D stage, animation and browser QA | Chromium, reduced motion, no-save checks |
| G3 assets/audio | Luna + creative review | original/licensed assets, audio cues | performance and rights audit |
| G4 story integration | GPT-6 after G0–G2 | game-owned adapter behind default-OFF flag | save migration and choice-once tests |
| G5 Android acceptance | GPT-6 + device QA | install/upgrade/resume/intro/endings tests | explicit approval |

## Blocking tests before touching production
1. Official home -> New game -> first original story scene; no old home flash.
2. Import legacy save with `sceneIdx=4`; Dar Mansour restored without new flags.
3. Save/export/import round trip, unchanged schema and original storage keys with cinematic feature OFF.
4. Missing cinematic scene package -> original story still playable, choices unchanged.
5. Pilot 27 remains opt-in and does not bypass Part III lock.
6. Pause/seek/replay and reduced motion cannot trigger story choices.
7. Each eventual game-owned choice callback executes at most once, including reload/resume.
8. Original nine endings are checked for reachability separately; do not conflate keys existing with routes working.
9. Android background/foreground and language changes dispose cinematic resources.
10. Official intro asset hash discrepancy is resolved **before** deleting or replacing any intro file.

## Handoff to Astra (G1)
Produce a per-scene contract for all 18 proposed insertions: `sceneId`, predecessor/successor, entry conditions, player-visible stakes, decision IDs, once-only state effects, fallback for missing characters, and ending dependencies. For chapter 27 preserve `prioritizeBridge`, `prioritizeClinic`, `splitWithLimits` and their canonical outcomes. Review the outdated placeholder insert titles in `docs/qarton-phase1-implementation.md` against `docs/qarton-g0-canonical-36-scene-map.md`.

## Handoff to Luna (G2)
Use the independent brief in PR #21: `docs/qarton-g2-luna-character-stage-brief.md`. Do not modify `prepare-web.cjs`, `www/`, original React routes, saves, or narrative decisions.

## Decision
Keep PR #20 (narrative/contracts) and PR #21 (visual pilot) separate. Neither is approved for production merge. The G0 integration gate stays open until the full original story bundle and the real decision lifecycle are inspected.
