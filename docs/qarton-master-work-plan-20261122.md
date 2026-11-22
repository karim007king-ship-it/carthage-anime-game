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
| #23 | G4 read-only adapter, regression tests, architecture docs | based on #21 | Draft; do not merge before G4 event contract and QA |

## Ownership and no-overlap rules
- **GPT-6 / G4 and integration:** CI, source contracts, build stability, save/restore boundary, cross-PR review and final integration order.
- **Luna / L1:** character/background visual inventory, original asset paths, license provenance, no moves or deletion.
- **Sol / S1:** original 18 scenes' text inventory and stable localization IDs; Tunisian original remains authoritative.
- **Astra / G1:** 36-scene narrative proposal, coherence and endings; no production edits.
- Every worker uses a distinct branch and Draft PR. Do not cherry-pick or merge worker branches before mapping stable IDs and resolving conflicts.

## Phases and gates
### P0 — CI integrity (blocking)
1. Fix the new `qarton-prepare-web-hook-contract-test.cjs` syntax failure.
2. Confirm GitHub Actions passes at the current head; static checks alone do not prove production behavior.
3. Add clean-build output determinism verification without changing the original source.

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
- [ ] Corrective commit CI confirmed successful.
- [ ] Deterministic clean build confirmed.
- [ ] L1/S1/G1 reports reviewed and integrated.
- [ ] Android regression and production hook acceptance completed.
