# QARTON — QA coverage matrix

**Status:** planning and CI mapping only. No Android device test is claimed as passed.

| Case | Automated check | Manual/device gate | State |
|---|---|---|---|
| Original scene indices 0–17 | `tests/qarton-g4-legacy-presentation-adapter-test.cjs` | Restore all save variants | Contract passing at last verified commit |
| Immutable cinematic snapshots | G4 adapter tests | Confirm no save changes after playback | Contract passing at last verified commit |
| Malformed/accessor-backed indices | G4 adapter tests | Import malformed saves safely | Contract CI green through `3af8d96` |
| New game and official home | Home tests | Android new game from intro | Pending device |
| Original save export/import | `tests/save-recovery-test.cjs` | Round-trip exported JSON | Pending device |
| Dar Mansour save `sceneIdx=4` | G4 adapter tests | Android resume and exact state comparison | Pending device |
| Scene-entry lifecycle | Source audit only | Event log for choice, result and map | Blocked on game-owned hook |
| Part III lock | Source contract test | Locked/unlocked Android paths | Pending device |
| Nine endings | Original smoke coverage only, not full reachability proof | Complete all routes | Pending device |
| Audio lifecycle | `tests/qarton-audio-playback-test.cjs` | Mobile unlock, mute, background/resume | Pending device |
| APK upgrade | APK build/signature/version checks passed in PR #26 run `45020828677` | Upgrade without uninstall; retain save | CI green; device pending |

G1 draft-only checkpoint validation (chapters 11/22): `tests/qarton-g1-draft-checkpoint-validation-test.cjs` passed at `3af8d96`. This validates static checkpoint inspection, **not** persistence or once-only effect execution in the game.\n\nCI workflows: `.github/workflows/qarton-cinematic-pilot.yml` and `.github/workflows/qarton-cinematic-browser.yml`. `npm test` alone does not execute every cinematic test. See [runtime acceptance](../qarton-g4-save-restoration-runtime-acceptance.md).
