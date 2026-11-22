# QARTON — QA coverage matrix

**Status:** planning and CI mapping only. No Android device test is claimed as passed.

| Case | Automated check | Manual/device gate | State |
|---|---|---|---|
| Original scene indices 0–17 | `tests/qarton-g4-legacy-presentation-adapter-test.cjs` | Restore all save variants | Contract passing at last verified commit |
| Immutable cinematic snapshots | G4 adapter tests | Confirm no save changes after playback | Contract passing at last verified commit |
| Malformed/accessor-backed indices | G4 adapter tests | Import malformed saves safely | CI pending latest changes |
| New game and official home | Home tests | Android new game from intro | Pending device |
| Original save export/import | `tests/save-recovery-test.cjs` | Round-trip exported JSON | Pending device |
| Dar Mansour save `sceneIdx=4` | G4 adapter tests | Android resume and exact state comparison | Pending device |
| Scene-entry lifecycle | Source audit only | Event log for choice, result and map | Blocked on game-owned hook |
| Part III lock | Source contract test | Locked/unlocked Android paths | Pending device |
| Nine endings | Original smoke coverage only, not full reachability proof | Complete all routes | Pending device |
| Audio lifecycle | `tests/qarton-audio-playback-test.cjs` | Mobile unlock, mute, background/resume | Pending device |
| APK upgrade | No automated evidence yet | Upgrade without uninstall; retain save | Pending device |

CI workflows: `.github/workflows/qarton-cinematic-pilot.yml` and `.github/workflows/qarton-cinematic-browser.yml`. `npm test` alone does not execute every cinematic test. See [runtime acceptance](../qarton-g4-save-restoration-runtime-acceptance.md).
