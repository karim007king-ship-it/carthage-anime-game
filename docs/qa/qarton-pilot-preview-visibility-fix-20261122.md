# QARTON PILOT — preview visibility regression and scoped cleanup

**Observed:** User installed and upgraded PILOT successfully, but did not find new chapters. This is a navigation/discoverability failure, not evidence that the static pages were absent from the APK.

## Root-cause audit

- The earlier installer added 144 HTML files at `www/pilot-preview/<locale>/<chapter>.html`, but the only entry point was a small fixed-position anchor inserted into the existing SPA `www/index.html`.
- The production-style cinematic interface can obscure this anchor. No chapter catalogue was exposed as the initial pilot screen. The earlier pages themselves contained no navigation to the other chapters.
- These previews are static read-only text pages; they do not implement the 36-chapter game. The original runtime and save handling must not be changed to solve a preview discoverability problem.

## Fix in isolated PILOT branch

- `scripts/qarton-pilot-preview-install.cjs` now generates a **separate** `www/pilot-preview/index.html` catalogue with 36 chapter links and a visible route to `../index.html?game=1`.
- Only the **isolated pilot copy** of `www/index.html` receives a launch redirect to the catalogue. The `?game=1` route allows the legacy game to run as before, and its fixed preview link now points to the catalogue.
- `tests/qarton-pilot-preview-install-test.cjs` verifies the landing route, all 36 links, 144 exported pages and the legacy-game escape route.
- Do not remove existing production files or delete original assets as part of this fix. Existing preview export guards still prohibit writing into checked-in source, production `www`, and Android directories.

## Verification and cleanup gates

1. Confirm isolated preflight and cinematic CI on the latest commit.
2. Manually dispatch `qarton-isolated-pilot-apk.yml` **from that commit**. Previous successful APK artifacts predate this fix.
3. Update PILOT on Android, launch it, confirm the catalogue is the first screen, open a new chapter and use the link to return to the original game.
4. Check Android back navigation, locale links and screen reader focus; record failures before release.
5. No production merge or mass deletion. Review unused files separately with evidence of reachability, references and license obligations.

**Status:** CI contract coverage is not an on-device validation. User must confirm the rebuilt APK actually displays the catalogue.
