# QARTON G0 — Build, WebView and intro verification

Date: 2026-11-22. GitHub read-only source and Actions verification. No production code modified.

## Verified CI execution

Run: https://github.com/karim007king-ship-it/carthage-anime-game/actions/runs/44968164146
Commit: `e963e9d53b93cd4cddd2637f5d1a83c75fa275b1` (PR #19).
Jobs API confirms **build: success** and **android-webview: success**, both completed. The build workflow executes `npm test`, `npm run prepare:web` with `QARTON_INTRO_ENABLE=1`, browser tests (`npm run test:home` on pull requests), verifies bundled assets and signed APK, then emulator job runs `tests/qarton-home-android-test.cjs` against the APK. These are observed workflow definitions and statuses, not physical-phone validation.

## Packaging details

`scripts/package-qarton-intro.cjs` fetches the following at build time from engine commit `e01128bdae28058b94169977f8679e7e39889582`:
- `official-intro.mp4`
- `src/runtime/official-intro-player.js`
- `src/runtime/official-intro.css`

It validates video SHA-256 `6b22dbc843affed208e066cb6c68044779683594e9826a52cb1f1619a53fe2ff` before writing all three assets under `www/qarton-intro/`. Runtime playback is local/offline; the packaging step requires network. Intro has skip/fallback, sessionStorage seen marker, and reduced-motion bypass. The workflow confirms copied assets and APK signature.

## Unresolved source-of-truth discrepancy

A previously selected user video was recorded with SHA-256 `5cb0ef23116547c5c2107ef59567d23d38facd9de2e8f5be58cd5f9258121061`. This differs from the currently packaged hash `6b22dbc843affed208e066cb6c68044779683594e9826a52cb1f1619a53fe2ff`. Do not claim they are the same. Before final release, compare actual video content and verify which is approved; avoid overwriting or deleting either without explicit confirmation.

## Important save behavior

The prepared build embeds a chapter-5 recovery seed on clean installs. `docs/qarton-official-intro-integration.md` correctly flags this as a migration risk: a clean install may show prefilled progress. Preserve existing saves; do not remove the seed without verified backup and migration tests. A new cinematic pilot must not alter save schema, storage keys, or restoration logic.

## Decision

**G0 build and emulator gate: PASS for PR #19 head.**
**G0 final release gate: OPEN**, pending source-of-truth for intro, scene lifecycle hook, full story-ID mapping, and physical Android upgrade/save test.
**Pilot candidate base:** `feature/qarton-official-intro-integration-20261121` @ `e963e9d53b93cd4cddd2637f5d1a83c75fa275b1`. Keep cinematic pilot behind feature flag, with separate story-owned adapter.
