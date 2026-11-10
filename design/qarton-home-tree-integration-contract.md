# QARTON home-tree integration contract

Status: implementation preparation; isolated from `main`.

This document records the safe integration boundary for the next UI implementation. It deliberately does not activate the retired premium-home prototype.

## Verified runtime contract

### Story
- The story engine owns the original home menu and its React event handlers.
- The Android bridge exposes `window.__carthageContinue()`, `window.__carthageStartPart3()`, and `window.__carthageCanStartPart3()`.
- The native menu container observed by the Android preparation runtime is `.home-actions.grid`.
- Part 3 must remain gated by `window.__carthageCanStartPart3()`; do not infer unlock state from visible labels.

### Progress and backups
- Continue: `#carthage-continue-last` (only mounted when a valid local save is detected).
- Export: `#carthage-export-backup`.
- Import: `#carthage-import-backup` (opens the original hidden file input).
- Existing storage keys: `shiganshina-slots-v1`, `shiganshina-autosave-v1`, and `shiganshina-autosave-time-v1`.
- Existing save slots: three. Do not initialize, clear, rename, or overwrite them while mounting home UI.

### In-game navigation
- `#carthage-home-return` saves before returning to the home menu.
- `#carthage-save-now` invokes the existing save bridge.
- These controls must remain untouched while the home-only navigation is active.

## Safe UI integration rules

1. Treat the original React tree as the source of truth. Never move, clone, or replace its controls.
2. If a new navigation card needs to invoke an existing action, locate the original element at click time and call its existing `click()`; do not copy its listener or business logic.
3. If an original element is absent, disabled, or not yet mounted, show a clear unavailable state instead of creating a fake control.
4. A section must have a working return action and must not cover gameplay.
5. The home viewport remains fixed and non-scrollable. Respect safe-area insets and reduced-motion preferences.
6. The World of Carthage card remains unavailable until real character, location, and map destinations exist.
7. The Settings card remains unavailable until the real audio controls and their handlers have been inspected. The presence of source markers alone is not proof that a settings screen exists.
8. Do not enable the redesign on `main` until the APK is tested on the target Android phone.

## Required runtime verification before UI activation

The current minified `index.html` is too large for the connected GitHub file reader to return its contents. Therefore the exact React markup and event ownership for the audio controls, difficulty selector, and story menu have not yet been inspected. Do not guess those selectors or alter the source HTML until that inspection is possible.

The next implementation pass must capture, from a running build:
- the rendered home DOM hierarchy and element bounds;
- the exact labels and IDs of original story controls;
- whether audio controls are mounted on the home screen or in a separate screen;
- whether save-slot controls are already present and how they are activated.

## Acceptance tests

- Existing smoke and save-recovery tests pass.
- No new code writes to save storage during initial render.
- Continue/export/import invoke the original controls and preserve their behavior.
- Starting a new game remains distinct from continuing a save.
- Part 3 lock behavior is unchanged.
- No navigation layer appears during gameplay.
- All active sections can return to the home screen.
- No horizontal or vertical home scrolling at supported portrait sizes.
