# QARTON adapter pilot — integration inventory (2026-11-21)

Status: read-only source inspection; **no engine adapter wired into the game yet**. This document belongs to the isolated `feature/qarton-adapter-pilot` branch.

## Inspected sources
- `README.md`: story/game ownership and existing cinematic pilot.
- `package.json`: Node >=22, `npm test`, `npm run prepare:web`, Capacitor 8.
- `scripts/prepare-web.cjs`: Android output generation and legacy save/navigation patches.
- `tests/smoke-test.cjs` and `tests/save-recovery-test.cjs`: existing invariants and save recovery expectations.
- `capacitor.config.json`: `webDir: "www"`, Android app ID `com.qarton.carthage`.

## Existing boundaries
1. `index.html` is the self-contained web game. The Android pipeline copies it to `www/index.html` and then rewrites exact strings in `scripts/prepare-web.cjs`.
2. The Android build injects several presentation layers already: cinematic scene, scene transitions, wall impact, character motion, and a startup watchdog. A new QARTON mount must **not** layer effects over these by default.
3. Current save persistence uses `shiganshina-slots-v1`, `shiganshina-autosave-v1` and `shiganshina-autosave-time-v1`. The recovery test requires preservation of valid existing saves and fallback for invalid records.
4. Existing public window hooks include `__carthageSaveNow`, `__carthageContinue`, `__carthageStartPart3`, `__carthageCanStartPart3`. These are not stable scene lifecycle hooks.
5. Existing tests explicitly guard the story, reduced-motion behavior, transitions, Part 3 lock, and Android boot instrumentation.

## Recommended integration seam
- Add a **separate optional adapter module** and a dedicated presentation mount root, never modifying story state or localStorage.
- The game must publish a read-only stable scene ID and a scene-enter/leave signal. No reliable hook was established by this inventory, so **do not guess one**.
- A host-owned scene manifest resolves stable IDs to `createScenePackage({version:1,...})` data and external assets. The engine never imports Carthage story code.
- Default OFF via explicit opt-in. Keep the legacy renderer and all injected effects unchanged until a pilot proves safe.
- When the adapter cannot load, fall back to the existing scene view without blocking interaction or save operations.
- For Android, verify ESM imports and assets inside generated `www` and WebView; direct `file://` opening is not a valid substitute for the app runtime.

## Validation gates before enabling
1. Baseline `npm test` and `npm run prepare:web` with logs; no runs were executed during this inventory.
2. Inspect the actual game runtime for a safe scene lifecycle seam and add a targeted regression test.
3. Compare old and new `www/index.html` behavior with feature flag OFF.
4. Opt-in pilot for **one** visual scene with clear fallback and teardown.
5. Real Android: new game, continue, save/import/export, settings/locales, choices, endings, home, background/resume, audio unlock, reduced motion.
6. Preserve all old save fields and keys byte-for-byte unless a separate, explicitly approved migration is designed.

## Next change
Implement only a generic, side-effect-free scene presentation adapter and isolated tests on this branch. Do not alter `prepare-web.cjs` or the self-contained `index.html` until the runtime seam is verified.
