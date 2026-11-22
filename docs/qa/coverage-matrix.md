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

## G1 extended draft CI status (2026-11-22)

| Gate | Automated tests | Verified result | Remaining limit |
|---|---|---|---|
| 583 draft text markers / original locale namespace | `qarton-g1-global-text-namespace-test.cjs` | CI green `45037787164` | Translations and manuscript editorial approval pending |
| 13 character IDs, presence and duplicate protection | `qarton-g1-draft-character-resolver-test.cjs` | CI green `45038204681` | Actual 2D cast rendering on Android pending |
| 17 location IDs and unapproved art rejection | `qarton-g1-draft-location-resolver-test.cjs` | CI green `45038424312` | Art provenance and licensing pending |
| 18-chapter combined presentation boundary | `qarton-g1-all-draft-presentation-boundary-test.cjs` | CI green `45038563043` | Cinematic runtime pilot pending |
| Draft locale / visual release blockers | `qarton-g1-draft-asset-locale-readiness-test.cjs` | CI green `45038679995` | Source `tn` and `ar/en/fr` completion pending |
| Draft isolation from original save and nine endings | `qarton-g1-draft-save-ending-isolation-test.cjs` | CI green `45039035333` | Real runtime save import/export and ending reachability pending |
| Chapters 11/22 exhaustive multi-group resume combinations | `qarton-g1-exhaustive-multigroup-resume-matrix-test.cjs` | CI green `45039180419` | No persistence or effect replay integration yet |

**Interpretation:** These green results validate static, draft-only contracts. They do **not** certify release readiness, Android behavior, in-place APK updates or production save restoration. Keep PR #23 Draft until device and editorial gates pass.
