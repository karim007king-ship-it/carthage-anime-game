# QARTON — Content extraction checklist

**Persistent architecture rule:** separate story, characters, backgrounds and locales, while preserving the original game, Tunisian source dialogue, original saves, nine endings and Part III unlock. Re-check this checklist before every content PR.

## Required inventory before extraction
- [ ] Extract a read-only list of the original 18 scene IDs and their zero-based original indices; never substitute display chapter numbers for save indices.
- [ ] Record every original dialogue line with source position, speaker, and stable text key. Do not paraphrase or translate the canonical Tunisian original.
- [ ] Record each original choice with its original effect and transition; stable IDs must be approved before wiring.
- [ ] Inventory characters and aliases from actual source; do not infer names from demo SVG assets.
- [ ] Inventory backgrounds and location changes from actual source; mark unknowns instead of guessing.
- [ ] Map proposed 36-chapter additions from Draft PR #20 separately; no automatic production import.
- [ ] Create an approved source-of-truth registry and localization key parity tests.
- [ ] Verify the nine original endings and Part III gate with regression tests and Android acceptance.

## File review rules
- Keep content data separate from renderer, scene clock, audio lifecycle and game save state.
- A translation may change visible text and directionality only; it must never change a choice ID, effect, timer, unlock condition or save key.
- A character file may reference poses, sprites, expressions and localization keys, but cannot mutate story state.
- A background file may reference visual variants and ambience, but cannot define game outcomes.
- Every new asset must carry source, license and hash before release.
- No bulk moves of `index.html` or `prepare-web.cjs` without golden-master comparison.

## Review gate per proposed content module
1. Source lines/IDs accounted for and traceable.
2. No new `shiganshina-*` keys or migrations.
3. Stable ID references validated and locale keys complete.
4. Existing unit/browser tests and Android save/new-game smoke pass.
5. PR stays Draft until explicit approval.
