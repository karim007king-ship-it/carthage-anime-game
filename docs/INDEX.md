- [Stable ID integration gates](qarton-id-integration-gates-20261122.md) — verified tests, unresolved crosswalks and release conditions.
# Project coordination
- [Master work plan and cross-PR audit](qarton-master-work-plan-20261122.md) — owners, phases, CI and integration gates.

# QARTON documentation index

**Authority:** this index is organizational, not an approval to merge experimental branches or rewrite the original game.

## Production-facing and release constraints
- [Original home structure](qarton-home-structure.md) — legacy/home requirements.
- [Official intro integration](qarton-official-intro-integration.md) — intro/home integration plan; PR #19 remains Draft.
- [G4 verified production hook boundary](qarton-g4-verified-production-hook-boundary.md) — source-verified integration hazards; no live hook approved.
- [G4 save-restoration acceptance](qarton-g4-save-restoration-runtime-acceptance.md) — Android and save QA cases, **not yet executed**.
- [Codebase audit and module plan](qarton-codebase-audit-and-module-plan-20261122.md) — inventory and safe cleanup sequence.

## Experimental pilot — not production-ready
- [G2 Luna character-stage brief](qarton-g2-luna-character-stage-brief.md) — visual staging.
- [G3 cinematic audio/assets brief](qarton-g3-cinematic-audio-assets-brief.md) — missing assets and provenance.
- [Single-load lab](../examples/qarton-single-load-lab.html) — browser-only cinematic demo.

## Narrative canon — maintained in separate Draft PR #20
- `docs/qarton-g0-canonical-36-scene-map.md` — proposed 36-scene mapping (PR #20, not in this branch).
- `docs/qarton-g0-g1-integration-gates-20261122.md` — narrative integration gates (PR #20, not in this branch).
- `docs/story/` — proposed story chapters (PR #20, not in this branch).

## Legacy build safety
- [prepare-web safe refactor boundary](qarton-prepare-web-safe-refactor-boundary.md) — staged extraction and golden-master gates; no production refactor yet.

## Standing organization policy
- [Organization decisions](qarton-organization-decisions.md) — persistent module boundaries and no-regression rules.
- [Content migration checklist](qarton-content-migration-checklist.md) — review gates before extracting any original data.

## Future game-content organization
- [Story, characters, backgrounds and localization architecture](qarton-content-localization-architecture.md) — proposed contracts, not a production migration.

## Quality and asset tracking
- [QA coverage matrix](qa/coverage-matrix.md) — automated coverage versus outstanding device checks.
- [Asset provenance inventory](assets/README.md) — intro, lab art and audio provenance gates.

## Test entry points
- `npm test` — original smoke, save recovery and intro packaging only.
- `.github/workflows/qarton-cinematic-pilot.yml` — pilot/contract checks.
- `.github/workflows/qarton-cinematic-browser.yml` — Chromium lab checks.
- `tests/qarton-g4-legacy-presentation-adapter-test.cjs` — read-only adapter contract.

**Never use experimental pilot scene IDs as saved original `sceneIdx` values.**
