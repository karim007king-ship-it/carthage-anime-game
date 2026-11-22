# QARTON — Master work plan and audit (2026-11-22)

## Status and scope
This is a coordination document, not a production release or evidence of device acceptance. Keep original `index.html`, `scripts/prepare-web.cjs`, save keys, nine endings and Part III unlock unchanged until verified integration approval.

## Current PR boundaries
| PR | Workstream | Base / integration role | Decision |
| --- | --- | --- | --- |
| #19 | Official intro and home | base main | Draft; verify mobile navigation and new game before merge |
| #20 | G1 narrative 36-scene proposal | based on #19 | Draft; reconcile source text, choices and nine endings; no runtime merge |
| #21 | G2 cinematic pilot | based on #19 | Draft; standalone lab, no production scene hooks |
| #22 | Audio lifecycle review | based on #21 | Draft; verify mobile audio gesture and teardown |
| #23 | G4 read-only adapter, G1 dataflow/choice/checkpoint tests, architecture docs | based on #21 | Draft; static contract CI green; no runtime integration or merge |
| #24 | L1 visual inventory | based on #21 | Draft; no asset moves/deletions |
| #25 | S1 text inventory | based on main | Draft; original Tunisian text canonical |
| #26 | Android APK in-place update packaging | based on main | Draft; APK CI green; device upgrade and installed certificate match pending |

## Ownership and no-overlap rules
- **GPT-6 / G4 and integration:** CI, source contracts, build stability, save/restore boundary, cross-PR review and final integration order.
- **Luna / L1:** character/background visual inventory, original asset paths, license provenance, no moves or deletion.
- **Sol / S1:** original 18 scenes' text inventory and stable localization IDs; Tunisian original remains authoritative.
- **Astra / G1:** 36-scene narrative proposal, coherence and endings; no production edits.
- Every worker uses a distinct branch and Draft PR. Do not cherry-pick or merge worker branches before mapping stable IDs and resolving conflicts.

## Phases and gates
### P0 — CI integrity (blocking)
1. [x] Earlier `qarton-prepare-web-hook-contract-test.cjs` syntax failure corrected.
2. [x] G4/G1 static contract CI green through commit `59dfb7b3d` (2026-11-22).
3. [ ] Verify deterministic clean-build output without changing original source.
4. [x] Separate Android update packaging into PR #26; Android APK workflow succeeded at `2518b5ac7` (run 45020828677).
5. [ ] Verify real in-place install and preservation of saved progress on Android; CI cannot prove certificate continuity with an already installed APK.

### P1 — Read-only inventories (parallel)
1. Luna L1 inventory characters/backgrounds/poses/locations, path references and licenses.
2. Sol S1 inventory canonical Tunisian dialogues, choices, speaker IDs and translation key mapping.
3. Astra G1 narrative audit and 36-chapter plan; label proposed chapters separately.
4. GPT-6 compare all inventories, resolve aliases and ID collisions in a shared registry.

### P2 — Module boundaries (no production integration)
1. Define story/characters/backgrounds/locales manifests and schemas as standalone data.
2. Separate visual assets from audio, story state and runtime renderer.
3. Keep existing save sceneIdx semantics; display chapter IDs are never persisted as sceneIdx.
4. Validate stable IDs, missing references, locale parity and asset provenance in CI.

### P3 — Controlled integration
1. Introduce game-owned, versioned, read-only scene-entry event at verified host lifecycle point.
2. Validate all six entry paths, import/export, resume and Part III gate.
3. Verify nine endings and run Chromium + Android smoke on device, including update install and saved data.
4. Only then consider small reversible code extraction PRs and staged merge.

## Critical risks
- Large minified `index.html` and string-patching `prepare-web.cjs` make blind refactoring unsafe.
- PR #20/#21/#23 have stacked bases; merging out of order risks misleading diffs.
- #23 contains documentation beyond its G4 test focus; consider separate follow-up PR for content architecture if integration review requires it.
- Actual translation files and production asset manifests do not exist yet; architecture docs are proposals, not delivered features.
- Device audio, intro asset hash/license, real voice/ambient/music and first-render restore acceptance remain unverified.

## Definition of done for this audit
- [x] PR workstreams and ownership recorded.
- [x] CI failure isolated to a newly added test syntax error; corrective commit made.
- [x] Corrective commits and later G1/G4 static CI confirmed successful.
- [ ] Deterministic clean build confirmed.
- [ ] L1/S1/G1 reports reviewed and integrated.
- [ ] Android regression and production hook acceptance completed.

## 2026-11-22 workstream freeze and handoff

- **Do not mix #26 with #23:** #26 owns Android packaging (`android-apk.yml`, generated Gradle versionCode, APK signature checks). #23 owns proposed content contracts, read-only adapter, and non-production regression tests. Avoid cherry-picking Android changes into the G4 branch.
- **APK update:** Existing stable signing secret is required. An APK signed with a different historical key cannot update in place; back up the save before any uninstall. Current GitHub APK CI success is build evidence, not device installation evidence.
- **Content gate:** 18 proposed chapters structured, 18 original scenes and nine ending keys retained. No new chapter has an original `sceneIdx`; all draft checkpoints remain outside the production save.
- **Next isolated G4 action:** inspect missing input provenance and test contracts, without editing `index.html`, `scripts/prepare-web.cjs`, or Android workflow.
