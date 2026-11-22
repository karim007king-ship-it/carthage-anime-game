# QARTON — Codebase audit and safe module organization (2026-11-22)

**Scope:** repository trees of `main` and PRs #19–#23, current PR #23 manifest and package scripts. This is a static architecture audit, not a claim of full line-by-line review or Android runtime verification. **Do not modify original `index.html`, existing save format, or merge draft PRs as part of this audit.**

## Inventory
| Revision | Tracked files | Notes |
|---|---:|---|
| main | 12 | Original game baseline |
| PR #19 | 18 | Official home and intro integration |
| PR #20 | 48 | Narrative expansion, including 32 files under docs |
| PR #21 | 45 | Isolated cinematic lab |
| PR #22 | 45 | Audio lifecycle fix |
| PR #23 | 46 | G4 read-only boundary and acceptance plan |

`index.html` is 3,850,335 bytes in these revisions. `scripts/prepare-web.cjs` is 44,644 bytes on PR #23 (49,389 on main). Both are high-risk, tightly coupled legacy integration points. Do **not** split or rewrite them before golden-master and save-compatibility tests exist.

## Ownership and proposed boundaries
| Current files | Owner / responsibility | Recommendation |
|---|---|---|
| `index.html` | Original game, story, saves, navigation | Freeze; avoid direct manual refactor |
| `scripts/prepare-web.cjs` | Legacy build-time injection and save/navigation patches | Eventually split into `build/legacy-hooks/` only after snapshot tests prove byte-compatible output |
| `scripts/qarton-home-v2.js`, `.css` | Official home UI | Keep paired; move only with adjusted import/build tests |
| `scripts/package-qarton-intro.cjs` | Intro asset packaging | Keep separate; verify approved video SHA/provenance before changes |
| `scripts/qarton-cinematic-pilot-contract.cjs`, `qarton-g4-legacy-presentation-adapter.cjs` | Pure presentation contracts | Keep isolated and default-OFF; no DOM/storage APIs |
| `scripts/qarton-timeline-player.js` | Scene clock and playback | Candidate for `cinematic/timeline/` after imports are mapped |
| `scripts/qarton-audio-cue-planner.js`, `qarton-audio-playback.js` | Audio scheduling and lifecycle | Candidate for `cinematic/audio/`; audio files/licenses remain separate |
| `examples/qarton-single-load-*`, `examples/assets/` | Nonproduction cinematic lab | Keep isolated; no automatic production packaging |
| `tests/qarton-*` | Unit/browser/contract tests | Group by `tests/unit/`, `tests/browser/`, `tests/contracts/` only after CI paths are updated |
| `docs/qarton-g*` and PR #20 story files | Integration plans and narrative canon | Add index/manifest; distinguish canonical, proposals, QA evidence |

## Findings ranked by risk
1. **High — monolithic original bundle.** Any direct split risks changing story state, choice order, save restoration, or ending reachability. Freeze until deterministic baseline and Android smoke tests.
2. **High — string-based build hooks.** `prepare-web.cjs` patches minified symbols and uses `replaceOnce`. A minifier rebuild may break hook detection. Add exact fixture/snapshot tests before refactoring.
3. **High — save and scene-entry lifecycle not yet proven end-to-end.** G4 adapter is not a real host event; a DOM observer is not a valid scene lifecycle hook.
4. **Medium — tests scattered and not uniformly listed in package.json scripts.** Current `npm test` invokes smoke, save recovery and intro packaging only; cinematic tests are run through dedicated workflows. Avoid claiming `npm test` covers everything.
5. **Medium — PR dependency graph.** PR #20 and #21 both depend on #19; PR #22 and #23 both depend on #21. Treat them as parallel drafts; avoid accidental merges and base confusion.
6. **Medium — narrative docs proliferate.** PR #20 contains 32 docs; create a canonical chapter index and distinguish drafts from approved scenes.
7. **Medium — asset traceability.** Cinematic demo SVGs are in `examples/assets`; real audio and approved intro provenance need a versioned asset manifest and hash checks.

## Safe cleanup sequence
- **Now (no production change):** keep this inventory and architecture ownership map; add a docs index and test coverage matrix; enforce default-OFF and immutable presentation snapshots; run CI.
- **Next (isolated PR):** add non-invasive fixture-based checks for the original save schema, production hook anchors and intro hash; document exact runtime entry paths.
- **Only after QA:** introduce game-owned, versioned read-only scene-entry events, verify restoration and all nine endings on Android, then consider extracting build modules.
- **After release gate:** reorganize source directories in small PRs with updated imports and workflows, one module group at a time. No bulk move or automatic deletion.

## Suggested future files (not yet created)
- `docs/INDEX.md`: canonical documentation navigation and authority labels.
- `docs/qa/coverage-matrix.md`: test case → script/workflow/device evidence mapping.
- `docs/assets/asset-manifest.json`: origin, license, SHA-256, role and usage for video/audio/art.
- `tests/fixtures/legacy-save-v1.json`: synthetic nonpersonal save fixture, validated against original schema.
- `tests/contracts/legacy-hook-anchors.test.cjs`: exact build-hook and no-duplicate contract.
- `scripts/build/legacy-hooks/`: future extraction target, **not** safe to create and wire yet.

## Release gate
Do not merge until production new game, save export/import, original `sceneIdx=4` restoration, Part III lock, all nine endings, and Android upgrade without uninstall pass. Current contract CI is necessary but not sufficient.
