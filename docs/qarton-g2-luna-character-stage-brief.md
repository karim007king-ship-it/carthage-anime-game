# QARTON G2 — Luna 6: Character Stage & Camera Pilot

**Repository:** `karim007king-ship-it/carthage-anime-game`
**Working branch:** `feature/qarton-cinematic-pilot-foundation-20261122` (PR #21)
**Scene:** chapter 27, `p3-single-load`, 21 seconds.

## Objective
Improve the **isolated** `examples/qarton-single-load-lab.html` into a cinematic 2D stage, without modifying the game's production UI, story, persistence, or Android package. The scene package is `examples/qarton-single-load-scene.json`; deterministic clock is `scripts/qarton-timeline-player.js`.

## Luna owns
1. Replace emoji wagon and generic labels with **original, lightweight** 2D SVG/CSS silhouettes: wagon, bridge, clinic, Ryan, Lina, Nour. Avoid third-party or unlicensed imagery.
2. Add named character stage elements and low-cost idle poses (blink, breathing, hand gesture). Animate only while playing, and stop on pause. Respect `prefers-reduced-motion` and the manual reduced-motion toggle.
3. Implement data-driven camera target and shot changes from the existing JSON timeline: wide/medium and target. Apply bounded transforms and 2D parallax to depth layers. No 3D requirement.
4. Preserve seek/replay determinism: rendering at time T must not depend on frames previously rendered. Never advance story or change trust, health, inventory, or save.
5. Keep the layout responsive in Android portrait 360–430 CSS px. No vertical overflow inside the stage, readable Tunisian subtitles, keyboard/touch controls.
6. If assets or new animation metadata are needed, keep them inside `examples/` or a clearly isolated pilot module, document schema changes and tests.

## Acceptance criteria
- The 21-second scene and all three chapter-27 decisions still work.
- `node --test tests/qarton-cinematic-lab.spec.cjs` passes in CI's Chromium container; contract tests stay green.
- Pause freezes character/camera motion; seek to 20500ms enables the three choices; replay resets the choice gate.
- Reduced motion eliminates nonessential animation and parallax, including CSS animations.
- No `localStorage`, `sessionStorage`, save APIs, `prepare-web.cjs`, production `www/`, or official QARTON home edits.
- No regressions to the official intro video or existing saves.

## Collaboration boundary
- **Astra** owns story/dialogue and any changes to choice outcomes; Luna must not rewrite canonical narrative.
- **GPT-6** reviews PR, integration contract, browser CI and save isolation.
- **Luna** owns visual stage implementation and visual QA.
- Do not merge PR #21 into main without explicit review.

## Deliverables
- Visual stage source + original pilot assets.
- Browser tests for pause, seek, replay, reduced motion and viewport.
- Before/after screenshots or documented visual QA.
- Summary of modified files, commits, and outstanding limitations.
