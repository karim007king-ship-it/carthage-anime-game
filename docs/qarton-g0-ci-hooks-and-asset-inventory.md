# QARTON G0 — CI, hooks and assets (verified)

Date: 2026-11-22. Read-only inspection of GitHub source and Actions records.

## CI evidence

- Carthage PR #19 head `e963e9d53b93cd4cddd2637f5d1a83c75fa275b1`: Android workflow run `44968164146` completed **success**: https://github.com/karim007king-ship-it/carthage-anime-game/actions/runs/44968164146
- Narrative PR #20: no branch workflow runs returned for `docs/astra-carthage-narrative-expansion` (not evidence of failure).
- QARTON cinematic engine `main` head `e01128bdae28058b94169977f8679e7e39889582`: test run `44950818245` completed **success**; Test Lab deployment `44950818177` completed **success**.
- These are CI statuses, **not** a local replay of tests, full scenario coverage, or a physical Android performance assessment.

## Source-proven runtime integration points

`scripts/prepare-web.cjs`:
1. Copies original `index.html` to `www/index.html`.
2. Replaces minified save export `X3=(P)=>{` and save handler `ur=(P,z=!1)=>{` with native export/autosave support.
3. Injects `window.__carthageSaveNow`, `window.__carthageContinue`, `window.__carthageStartPart3` and part-3 gating.
4. Replaces React `if(f==="start")return A("main",` up to `if(f==="intro")return A("main",` with `QartonHome` route. Injects `scripts/qarton-home-v2.js` before `function vu(){`, CSS in `<head>`.
5. Instruments ES module start and React root render, validates inline script syntax and checks expected hooks.
6. Recovery seed in prepared HTML contains chapter-5 fallback; `tests/save-recovery-test.cjs` verifies preservation of valid save slots and rejection of incomplete records.

**Implication:** cinematic integration must not change the original `f==="start"` route, original `index.html` minified identifiers, or `prepare-web.cjs` replacement needles. A separate opt-in presentation mount within the story route is safer. No stable public scene-change callback was proven yet.

## Verified tests in source

- `npm test` runs smoke, save-recovery and intro-package scripts.
- `npm run test:home` invokes `node --test tests/qarton-home-browser-test.cjs` and is **not included** in `npm test`.
- Browser test includes intro → home, four-card layout, no old home, 393×844 / 360×640 / 320×568, locale changes, backup export, Part 2/3 gating, restart/continue.
- Verify Android workflow explicitly runs browser test before claiming its coverage is enforced in CI; successful workflow alone is insufficient proof.

## Asset inventory scope

- Git tree for Carthage PR #20 contains 47 files, **zero tracked** `mp4/webp/png/jpg/svg/mp3/ogg/wav` files. It does not prove assets are absent from external packaging or Git LFS.
- Engine `main` tracks `official-intro.mp4` and several **SVG demo** frames/backgrounds in `examples/character-lab` and `examples/scene-lab`. These are test assets, not approved final Carthage character art.
- Carthage `scripts/package-qarton-intro.cjs` must be inspected to verify exact video provenance and binary hash. Do not assume the engine video is the user's selected original without hash confirmation.
- Avoid generating or embedding final character assets before a visual style bible is accepted.

## G0 readiness decision

**Candidate execution base:** PR #19 head `e963e9d53b93cd4cddd2637f5d1a83c75fa275b1`, because Android CI succeeded and it owns the current home. Keep PR #20 docs separate.

**Unresolved before coding integration:** precise scene lifecycle hook; official intro asset hash/provenance; workflow step coverage; story scene ID ↔ 36-chapter mapping; device-level save/recovery validation.

**Next action:** inspect Android workflow, packaging script, original story scene structure, and engine adapter API; then freeze G0 contract. Do not merge PR #20 as executable code (it is documents only).
