# QARTON — Standing organization decisions

This file records project architecture decisions so later development work keeps the same plan.

1. **Four independent content areas:** `story/`, `characters/`, `backgrounds/`, `locales/`. Current layout is a proposal; do not mistake it for already migrated production files.
2. **Tunisian dialect is the canonical authored story.** `ar`, `en`, `fr` are future translation layers; translated text must never become a game-state identifier.
3. **Presentation is read-only by default.** The cinematic renderer does not own saves, choices, unlocks or ending state.
4. **Keep the original game stable.** Avoid editing the monolithic `index.html` or changing `prepare-web.cjs` until tests verify equivalent behavior.
5. **Keep asset classes separate.** Character sprites, background artwork, intro video and localized voices need independent manifests and provenance.
6. **Small reversible PRs.** Inventory → schemas/fixtures → read-only extraction → opt-in integration → Android QA → approval. Do not mix content relocation, translation and runtime changes in one PR.
7. **Source of truth:** original 18 playable scenes and save semantics remain canonical; PR #20's 36-scene expansion is a proposal until approved.

Review this document together with [the content architecture](qarton-content-localization-architecture.md), [migration checklist](qarton-content-migration-checklist.md), and [QA coverage matrix](qa/coverage-matrix.md) before future restructuring.
