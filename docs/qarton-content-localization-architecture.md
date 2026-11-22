# QARTON — Content separation and future localization architecture

**Status:** proposed structure and contracts only; no production data migration or save-schema changes. The original Tunisian dialogue remains the canonical authored source.

## Current state verified
- PR #20 has proposed chapter manuscripts under `docs/story/`, plus a canonical 36-scene map. These are not yet merged or runtime content files.
- PR #23 has experimental SVG assets under `examples/assets/` (including Lina, Nour, Ryan, bridge, clinic and wagon); these are **lab-only**, not a complete production character/background catalog.
- Original `index.html` remains a monolithic production bundle; extracting story text from it is a separate, gated migration.

## Proposed content layout (future, not created by this document)
```text
game-content/
  story/manifest.json
  story/chapters/<stable-scene-id>.json
  characters/manifest.json
  characters/<character-id>.json
  backgrounds/manifest.json
  backgrounds/<location-id>.json
  locales/tn.json
  locales/ar.json
  locales/en.json
  locales/fr.json
  schemas/story.schema.json
  schemas/character.schema.json
  schemas/background.schema.json
```

## Contract
- **Story:** immutable scene ID, part, entry conditions, speaker IDs, dialogue **translation keys**, choice IDs, original gameplay effect references, next-scene IDs. Never store a translated label as a choice ID or save key.
- **Characters:** immutable character ID, display-name translation key, approved portrait/pose/expression asset references, attribution. No narrative branching logic in character files.
- **Backgrounds:** immutable location ID, artwork variants (day/night/damage), aspect/size requirements, credits/license, optional ambience cue. No gameplay state mutation in background files.
- **Locales:** `tn` (canonical Tunisian Arabic), `ar` (Modern Standard Arabic), `en`, `fr`; identical keys for dialogue/UI/choices. Missing translation falls back to `tn` **with a QA warning**, never silently alters scene order. RTL for `tn`/`ar`; LTR for `en`/`fr`.
- **Audio:** localized voice assets can be referenced by dialogue key and locale; music and SFX are separate from language packs.

## Example only (not runtime)
```json
{
  "sceneId": "legacy-05",
  "locationId": "mansour-house",
  "lines": [{"id": "legacy-05-line-001", "speakerId": "mansour", "textKey": "story.legacy-05.line-001"}],
  "choices": [{"id": "legacy-05-choice-001", "textKey": "story.legacy-05.choice-001", "effectRef": "original-game-defined"}]
}
```

## Migration and verification order
1. Inventory all original 18 scenes, dialogue, character and location references **without modifying** `index.html`.
2. Approve immutable ID registry and canonical chapter mapping from PR #20.
3. Extract a **read-only** content manifest and synthetic fixtures; compare line order, choice IDs and nine endings against original behavior.
4. Add schema and locale-key parity tests, then translate small pilot chapters with human review of Tunisian cultural context.
5. Introduce an opt-in content loader only after Android new-game, save restoration, import/export, Part III lock and nine endings pass. Preserve existing `sceneIdx` saves and all original gameplay effects.

## Guardrails
No bulk relocation, automatic translation of canonical Tunisian dialogue, or generated story replacements without review. Do not make `docs/story/` from PR #20 production-authoritative before narrative approval. Maintain asset provenance and licensing as documented in `docs/assets/README.md`.
