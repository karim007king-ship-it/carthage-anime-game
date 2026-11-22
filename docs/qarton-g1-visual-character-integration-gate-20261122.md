# QARTON — G1 character and visual integration gate (2026-11-22)

**Status:** Draft-only review, no production integration. Source: current PR #23 manifests and chapter 27 contract, L1 PR #24 visual inventory, S1 PR #25 locale inventory, G1 PR #20 manuscripts.

## Verified contract boundaries

- Canonical named characters: 13 original records in `game-content/characters/manifest.json`. Stable qualified references are `char.<id>`; the original trust aliases `noor → nour` and `youssef → father` are not locale strings and must never be translated or rewritten in saves.
- Original places: 17 legacy location records in `game-content/backgrounds/manifest.json`, qualified as `loc.<id>`. The 18 proposed chapters may require new visual locations, but geographic similarity does **not** approve reuse of an old background.
- Chapter 27 (`p3-single-load`) currently has `characters: ["ryan","lina","noor","karim","youssef"]` using **unqualified** IDs, while the chapter 2 contract uses `char.ryan` etc. Existing PR #23 validation accepts either form. Before a cinematic renderer consumes chapter data, define an explicit *read-only normalization* step, then validate against the canonical manifest. Do not silently change source records or legacy IDs.
- Proposed characters such as `char.hala` are not approved production portraits. The narrator and elderly woman are roles, not automatic named-character identities.
- Text IDs are presentation references. Narrative choice IDs, legacy inventory strings, original speaker strings and save values are logic-bearing data and cannot be replaced by translated labels.

## Required adapter contract (future opt-in pilot)

1. Resolve a draft chapter character reference by accepting only a known unprefixed ID or its `char.` qualified form; reject unknown IDs and duplicate canonical identities. This resolution must not mutate input data.
2. Use `presentCharacters` (if explicitly supplied) only to select **visible** characters and alternate lines. Absence/unknown presence must not fabricate a speaker, portrait, testimony or trust effect.
3. Resolve locations only against an explicitly approved art mapping. If `locationRef:null` or `artStatus:not-approved`, return a missing-art state; do not guess a production background or use lab-only SVG as a fallback.
4. Resolve text via `tn` first; non-Tunisian locales are future presentation overlays. Do not route translated text into original regex, voice/emotion matching or save serialization.
5. Preserve the original 18 `sceneIdx` values and nine ending keys; no draft chapter may claim a legacy save index or enable part 3.
6. Android acceptance: verify actual image decode and cleanup, 36-chapter navigation in a separate opt-in build, save reload in chapters 11 and 22, and every original ending route before any production merge.

## Known blockers

- L1 reports shared/duplicated portraits, missing chapter-critical P0 art and unverified rights provenance.
- G1 requires editorial signoff on post-truth continuation, survivor wording and chapter time/trust balance.
- The source chapter 27 unqualified character IDs versus chapter 2 qualified IDs require adapter-level normalization or a deliberate schema migration; neither is a runtime change in this PR.
- Existing CI tests prove static data and isolated pilot contracts, not on-device runtime presentation or safe APK updates.

**Decision:** Keep PR #23 Draft and isolated. Do not merge or alter original game, original save keys, or original ending logic.
