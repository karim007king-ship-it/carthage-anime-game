# QARTON — prepare-web safe refactor boundary

**Scope:** static inspection of `scripts/prepare-web.cjs` on PR #23; **no production refactor authorized**.

## Verified observations
- The file contains 432 lines in the inspected revision and roughly 42.9k text characters.
- The build script uses `replaceOnce` nine times and references the existing `shiganshina-slots-v1` and `shiganshina-autosave-v1` keys.
- The original `__carthageSaveNow` and `__carthageContinue` integration references are present. Their use is not permission for a read-only cinematic renderer to invoke them.

## Suggested extraction boundaries — after golden-master tests
1. **Build input and validation:** paths, asset presence, immutable source fingerprints.
2. **Legacy hook anchors:** versioned, explicitly asserted original code patterns; fail closed on absent or duplicate matches.
3. **Home/intro injection:** official home and intro packaging kept distinct from save restoration.
4. **Save compatibility:** original slot/autosave schema and import/export contracts remain unchanged.
5. **Build output verification:** assert expected hooks exactly once, no unintended duplicate UI or runtime initialization.

## Regression gate before any move
- Save the current generated output as a reproducible golden-master fixture (or hash plus structured anchor assertions), with explicit exclusions for intentionally variable build fields.
- Run `npm test`, cinematic contract and Chromium browser workflows, and Android new-game/resume/import/export checks.
- Prove original 18 scene indices, Part III gate, and all nine endings are unchanged.
- Extract one module at a time with stable imports; never combine directory moves with gameplay changes.

## Outstanding questions
- Are all nine `replaceOnce` calls strict one-hit checks? Verify each input and replacement count before extraction.
- Is output deterministic for repeated clean builds? Confirm with two isolated builds and compare hashes.
- Are old QARTON home injections still reachable after the official intro? Verify on Android and Chromium.
- Does save restoration emit a first-render event only after game state is committed? G4 currently has no approved host event.

This document is a safety plan, not proof that runtime or Android acceptance has passed.
