# QARTON Carthage — Execution Roadmap

## Goal

Make QARTON the deterministic Android app entry experience. The legacy home menu must never flash during startup or story transitions. Preserve the existing story engine, chapter flow, audio, and save data.

## Guardrails

- Work on `fix/qarton-deterministic-boot-state`; do not modify `main` directly.
- Do not delete story data, scene definitions, save keys, or recovery data.
- Keep the original home implementation available until every required action has a verified QARTON replacement.
- Every stage must have a test or explicit manual acceptance check before proceeding.
- Do not claim device-level verification from static or CI checks.

## Stage 1 — Baseline and route audit

Status: **Completed (code inspection)**

- Identified the Android web preparation entry point: `scripts/prepare-web.cjs`.
- Identified the QARTON home adapter: `scripts/qarton-premium-home.js`.
- Identified the home stylesheet: `styles/qarton-carthage-home.css`.
- Confirmed the old React home remains the source of the native action buttons.
- Confirmed the QARTON stylesheet was initially disabled and activated only after DOM-based home detection.
- Confirmed multiple independent observers infer home/game state from DOM elements.

Acceptance evidence: repository source review. This stage is not a phone runtime test.

## Stage 2 — Deterministic startup and transition cover

Status: **Implemented; isolated lifecycle simulation passed; full repository test pending**

- Added `scripts/qarton-boot.js` as an early boot gate.
- Inject the boot gate in the document head during Android web preparation.
- Hide the React root behind a QARTON branded cover until the home adapter confirms `HOME` or `GAME`.
- Publish explicit `HOME` and `GAME` readiness events from the QARTON adapter.
- Cover the menu during a start/part-selection transition.
- Keep a safe diagnostic cover if startup or transition readiness is not reported within 15 seconds.
- Add a Node VM test for boot, home-ready, transition, and game-ready lifecycle.
- Verify the boot runtime is present in the packaged Android HTML.
- Executed an isolated runtime simulation: initial cover, HOME release, TRANSITION cover, and GAME release all passed.

Acceptance:
- [ ] `npm test` passes.
- [ ] `npm run prepare:web` succeeds.
- [ ] Packaged HTML contains the boot gate and readiness runtime.
- [ ] Android startup shows no legacy menu flash.
- [ ] A stalled transition shows a diagnostic cover instead of exposing the legacy UI.

## Stage 3 — One authoritative navigation state

Status: **In progress — visibility ownership centralized; React action routing still pending**

- Added mutually exclusive `qarton-state-home` and `qarton-state-game` classes, with both cleared during `TRANSITION`.
- The boot controller now owns release of the startup/transition cover and publishes one state value.
- Establish one explicit navigation controller for `HOME`, `TRANSITION`, and `GAME`.
- Make the controller the sole owner of screen visibility.
- Replace duplicate DOM heuristics where possible.
- Keep DOM observation only as a compatibility bridge while React is being migrated.
- Define legal state transitions and reject invalid or duplicate transitions.

Acceptance:
- [ ] Only one screen state can be active.
- [ ] React rerenders do not restore legacy visibility.
- [ ] Home-to-game and game-to-home transitions are deterministic.

## Stage 4 — New game and continue flow

Status: **Pending**

- Trace the actual React action handlers for New Game, Continue, and Part 2.
- Bind QARTON actions to the real story-engine commands rather than cloned or guessed handlers.
- Ensure New Game starts the intended opening scene and resets only new-run state.
- Ensure Continue validates and restores the latest valid save without overwriting it.
- Verify Part 3 remains locked until the required Part 2 ending is present.

Acceptance:
- [ ] New Game opens the correct first scene.
- [ ] Continue restores the same chapter and story state.
- [ ] Invalid save data fails safely.
- [ ] Part 3 gate is preserved.

## Stage 5 — Legacy UI isolation and code cleanup

Status: **Pending**

- Separate legacy home presentation from story-engine logic.
- Remove obsolete home presentation code only after all its actions are accounted for.
- Consolidate duplicated observers and CSS activation logic.
- Keep save recovery, audio, accessibility, and chapter transitions intact.
- Document the final module boundaries.

Acceptance:
- [ ] No production startup path renders the legacy home.
- [ ] No duplicate navigation controller remains.
- [ ] Story and save integrity tests pass.

## Stage 6 — Regression and performance tests

Status: **Pending**

- Run syntax and smoke tests.
- Test first launch, repeat launch, New Game, Continue, chapter changes, and return home.
- Test short and tall phone viewports and reduced-motion settings.
- Check for duplicate event listeners, mutation-observer loops, and console errors.
- Verify startup and transition timing on a real Android device.

Acceptance:
- [ ] Automated tests pass.
- [ ] No duplicate home controls.
- [ ] No stuck transition.
- [ ] No save regression.
- [ ] Real-device test confirms no legacy flash.

## Stage 7 — Android release candidate

Status: **Pending**

- Run the complete GitHub Actions build.
- Verify the generated web asset and packaged APK match.
- Inspect build logs and APK artifact.
- Install over a test installation only after save backup is confirmed.
- Provide the APK and a concise test report.

Acceptance:
- [ ] Android build succeeds.
- [ ] APK artifact exists and is installable.
- [ ] First-launch and New Game device checks pass.
- [ ] Existing save data remains intact.

## Current implementation notes

The boot gate is a protective visibility layer and the first owner of screen visibility, not yet the final navigation architecture. The current QARTON adapter still discovers the legacy React home menu and styles its native controls. Stage 3 must move route changes into the application action layer and reduce DOM discovery to a temporary compatibility bridge; Stage 2 alone does not complete legacy UI isolation. Isolated boot-state simulation passed, but full Node tests, Android packaging, and phone verification have not yet run.
