# QARTON official intro — Carthage integration contract

Approved source: `karim007king-ship-it/qarton-cinematic-engine/official-intro.mp4` on `main`.
Approved SHA-256: `6b22dbc843affed208e066cb6c68044779683594e9826a52cb1f1619a53fe2ff`.
The mobile playback, audio and skip button were confirmed manually in QARTON Test Lab.

## Implementation gates

1. Bundle the approved MP4 **locally** in the Android `www` output; avoid relying on a network connection at game launch. Verify its SHA-256 before packaging.
2. Reuse the engine's `createOfficialIntroPlayer` runtime, and its CSS, without copying a second independent implementation.
3. Add the intro as a **nonblocking optional overlay** after the existing startup page is ready. Do not rewrite the React app or replace its root.
4. Skip, media error, autoplay rejection and timeout must all leave the home menu usable. Preserve an explicit Play action for mobile autoplay restrictions.
5. Do not read, overwrite or migrate `shiganshina-*` localStorage keys or alter save slots, chapters, story content, or the Part 3 gate.
6. Avoid showing the intro on an internal home-navigation reload unless the product explicitly opts in. Respect reduced-motion preference and offer skip.
7. Add regression tests for the packaged MP4, source hash, skip, error and offline startup. Verify Android and browser separately.

## Current status

Implemented on PR #19. The approved video is packaged by `scripts/package-qarton-intro.cjs`, and the four-card home is mounted within React via `scripts/prepare-web.cjs` and `scripts/qarton-home-v2.js`. Browser and Android WebView checks passed in GitHub Actions run #44966971460; the user also confirmed the game works on their Android phone. Keep PR #19 unmerged until final release review.

## Stabilization and cleanup roadmap

### P0 — Protect saved games before any migration
- Preserve `shiganshina-*` storage keys, import/export, chapters, difficulty, language settings and Part 3 unlock logic.
- **Audit the embedded `carthage-drive-recovery-seed` in `scripts/prepare-web.cjs`:** it currently inserts a hard-coded chapter-5 save if no valid save exists. Do not delete or change this behavior until a verified backup and a migration regression test exist.
- After backup validation, move legacy recovery to an explicit, opt-in import path; a clean install should start with empty save slots.
- Test clean install, existing valid save, malformed save, export/import, new game, and upgrade without clearing app data.

### P1 — Reduce maintenance risk
- Split the large `prepare-web.cjs` patch pipeline into named, independently tested transforms, preserving byte-for-byte generated behavior initially.
- Centralize save-record validation to avoid divergent acceptance rules between recovery, import, and continue flows.
- Keep one React home source of truth; avoid restoring overlay-based legacy menus.
- Update docs and remove dead scripts only after references and build consumers are checked.

### P2 — Game experience improvements (proposals, not implemented)
- Add a story progress map with completed chapters, current chapter, and locked content.
- Improve world encyclopedia entries for characters and Carthage locations.
- Add accessibility checks for 4 languages, small screens, reduced motion and screen readers.
- Add a user-visible save/restore confirmation and a manual backup verification flow.

### P3 — Cinematic engine integration (proposals, not implemented)
- Integrate the reusable QARTON scene clock and cinematic director behind a feature flag, first in one pilot scene.
- Profile 2D animation, layered backgrounds, audio synchronization and Android memory usage before expanding.
- Keep the engine isolated from save format and navigation until compatibility tests pass.

## Release gate
Do not merge solely because tests are green. Require a signed APK build, browser regression, Android WebView regression, and a manual upgrade test on a device with an existing save.
