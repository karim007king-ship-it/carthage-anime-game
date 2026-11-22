# QARTON — Stable ID integration gates (2026-11-22)

## Verified
- The proposal registry and its four contract tests passed on GitHub Actions run [45014046840](https://github.com/karim007king-ship-it/carthage-anime-game/actions/runs/45014046840) at commit `eed0b77bb1`.
- Original 18 `legacy-01..18` entries keep `sceneIdx=0..17`; all proposed 18 G1 chapters have no legacy save index.
- Character identities use unprefixed canonical IDs in their typed manifest (`noor`), with qualified references (`char.noor`) for cross-manifest links. Legacy trust key `nour` is unchanged. `youssef` likewise retains `father`.

## Pending reconciliation before manifest extraction
1. **L1 places:** registry currently lists 17 *semantic* legacy location IDs, while original game has 18 scenes and only 11 distinct background payloads. This is not a one-to-one image map. Add explicit scene-to-location and scene-to-image crosswalk sourced from L1; do not infer images from IDs.
2. **G1 proposed locations:** 18 proposed chapter locations are described in PR #24. Several are new and have no production art. Add draft-only location entries with approval and provenance states before enabling the renderer. Keep `loc.*` qualified refs and unprefixed IDs in separate manifests.
3. **S1 dialogue:** 20 displayed speaker labels correspond to 13 named character records plus narration/incidental roles. Resolve per-line `speakerId` and retain raw labels for old save/display compatibility.
4. **G1 route gates:** nine ending keys are not nine verified playable routes. Require executable route tests, restore at chapter 11/22 and chapter 25 shadow opening, and preserve the Part III lock.
5. **Art provenance:** production WebP and SVG author/license evidence is still missing; checksums alone do not grant reuse rights.
6. **Translations:** the `tn/ar/en/fr` fixture in PR #25 is contract-only; do not publish untranslated null placeholders as complete translations.

## Proposed independent content structure (not yet wired)
```
game-content/
  story/manifest.json
  story/chapters/<scene-id>.json
  characters/manifest.json
  backgrounds/manifest.json
  locales/tn.json
  locales/ar.json
  locales/en.json
  locales/fr.json
  schemas/
```

## Release criteria
- All original source values and choice effects preserved.
- No source save keys, `sceneIdx`, `lineIdx`, `part`, `choicesHistory`, inventory, flags, or ending conditions rewritten.
- No asset moves until all usage references and licenses checked.
- CI green on *current* head; clean build determinism tested; Chromium and Android restore/new game/ending smoke passed.
- PR #20/#24/#25 remain Draft until editorial and rights acceptance.
