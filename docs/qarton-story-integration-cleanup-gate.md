# QARTON — Story integration and cleanup gate

## Verified baseline
- Production package is `carthage-anime-pilot` 17.3.0; `npm test` currently runs smoke and save-recovery tests.
- `scripts/prepare-web.cjs` copies `index.html` to `www/index.html` and patches minified runtime handlers using string matches.
- Existing third-part entry is wired to legacy scene index 14. A 36-chapter *display mapping* is not equivalent to 36 playable scenes.
- PR #20 is editorial; PR #21 isolated cinematic pilot; PR #23 read-only presentation tests; PR #24 asset inventory; PR #25 localization inventory. None establishes production integration of 18 new playable scenes.

## Release blocker: playable chapters
1. Inventory production scene array in `index.html` and enumerate each scene's stable ID, original index, transitions, dialogue, choices, conditions and ending routes.
2. Compare with canonical 36-chapter map and G1 manuscripts from PR #20, then distinguish original, manuscript-only, implemented and playable chapters.
3. Introduce new story content behind a feature flag with a stable ID-to-scene resolver; do not renumber legacy scene indices or mutate old save payloads.
4. Verify all chapter entries, branch destinations, time/trust changes, character/asset refs, all nine original endings, and old save import/export.
5. Require Android browser/WebView smoke tests for new game, continue, part unlocking, chapter navigation, ending reachability and in-place APK upgrade before release.

## Cleanup boundaries
- Refactor `prepare-web.cjs` incrementally: extract named, testable transforms instead of adding more opaque string substitutions; preserve byte-for-byte legacy behavior unless covered by regression tests.
- Audit duplicate UI mounts, stale CSS, dead assets, and injected overlays; only delete files after usage checks across HTML, scripts, CI and Android packaging.
- Keep QARTON intro asset/hash, signature/versionCode and save keys unchanged.
- Never merge narrative, visual, translation and engine drafts automatically; review their compatibility first.

## Current acceptance status
- Baseline reviewed: **yes**.
- 36 chapters playable: **not demonstrated**.
- Code cleanup implemented: **not yet**.
- Full CI and Android verification: **pending**.

This file is an audit gate, not a claim that the story expansion has shipped.
