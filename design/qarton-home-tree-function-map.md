# QARTON home-tree function map

This map is based only on controls and runtime hooks verified in the current Android preparation script. It is a guard against creating decorative buttons with no real behavior.

| Proposed branch | Verified current capability | Integration rule |
|---|---|---|
| القصة | Existing native home menu, Part 1/Part 2 controls, Part 3 gated start, difficulty selector, one-tap continue | Preserve and invoke the original controls/handlers. Never recreate story-start logic in the new navigation layer. |
| عالم قرطاج | No independent encyclopedia, character index, or location browser has been verified in the current Android preparation script | Do not show an enabled card until real content and destinations are implemented. A future/locked card may be shown only if clearly labeled. |
| التقدم والحفظ | Existing three save slots, autosave, continue-last-save, JSON export/import, Drive recovery seed | Reuse existing handlers and storage keys. Never initialize or overwrite a save from the home UI. |
| الإعدادات | Main source includes audio-control and audio-volume markers, but the Android preparation script does not expose a verified settings-screen navigation API | Inspect the actual rendered controls and their handlers before wiring a settings card. Do not clone controls or fake settings. |

## Verified Android hooks
- `window.__carthageContinue()`: restores the newest valid local save.
- `window.__carthageSaveNow()`: writes the current in-game state.
- `window.__carthageStartPart3()`: starts Part 3 only after the existing completion gate.
- `window.__carthageCanStartPart3()`: reports the existing Part 3 unlock state.
- `#carthage-continue-last`: native continue action.
- `#carthage-export-backup` and `#carthage-import-backup`: backup transfer actions.
- `#carthage-home-return` and `#carthage-save-now`: in-game navigation/save controls.

## Safe implementation order
1. Capture the exact current home DOM and viewport measurements from an actual running Android build.
2. Create the four-card visual shell without moving or deleting React-owned controls.
3. Connect the Story card to the original story menu.
4. Connect the Progress & Saves card to the existing continue/export/import actions.
5. Inspect and implement Settings only after confirming the real audio controls and their event handlers.
6. Implement World of Carthage content as a real section before enabling its card.
7. Run smoke tests, save recovery tests, Android build, and on-device checks.

## Non-negotiable safeguards
- Do not alter `index.html` story source or the story runtime for a visual-only task.
- Do not move React-owned nodes between parents; use a React-owned screen or a non-invasive navigation layer.
- Do not clone buttons whose behavior depends on event listeners.
- Do not enable cards with missing destinations.
- Do not merge this branch into `main` until the user confirms the APK works on the phone.
