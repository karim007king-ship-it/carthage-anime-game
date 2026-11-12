# Project Structure and Maintenance Guide

## Architecture at a glance

The project currently has four layers:

1. **Game source** — `index.html` contains the original self-contained React game, story data, scene rendering, and core save behavior.
2. **QARTON presentation** — `styles/qarton-design-system.css` defines reusable studio tokens/components. `scripts/qarton-premium-home.js` adapts the existing game DOM to those components without replacing its event handlers.
3. **Android preparation** — `scripts/prepare-web.cjs` copies the source into `www/`, applies the Android-specific compatibility and save/navigation patches, embeds the QARTON stylesheet/runtime, and parses the resulting inline scripts.
4. **Android packaging** — Capacitor syncs the prepared web assets; `scripts/apply-android-branding.cjs` creates launcher resources and updates the generated manifest; GitHub Actions builds and uploads the APK.

## Source-of-truth rules

- `index.html` is the source of truth for the original game. `www/` and `android/` are generated build outputs, ignored by Git, and must not become competing hand-edited sources.
- The QARTON stylesheet is the canonical home for shared design tokens and reusable component primitives.
- The QARTON runtime may add presentation classes and wrappers, but must preserve the original buttons, callbacks, story data, and save keys.
- Android-only behavior belongs in the preparation/build layer until it can be implemented safely in the shared game source.
- Save keys such as `shiganshina-slots-v1` and `shiganshina-autosave-v1` are compatibility contracts. Never rename or clear them as part of visual cleanup.

## File ownership

| File or folder | Owns | Must not own |
| --- | --- | --- |
| `index.html` | Original story and game engine | QARTON-wide design tokens |
| `styles/qarton-design-system.css` | Shared QARTON visual primitives | Story progression or save logic |
| `scripts/qarton-premium-home.js` | DOM presentation adapter and home/game lifecycle styling | Reimplementation of story actions |
| `scripts/prepare-web.cjs` | Deterministic Android preparation and compatibility patches | Manual edits to generated Android assets |
| `scripts/apply-android-branding.cjs` | Launcher artwork and manifest icon references | Game UI or save behavior |
| `tests/` | Regression checks for source, saves, and build helpers | Runtime production behavior |
| `docs/` | Architecture, design decisions, and maintenance rules | Duplicate executable configuration |

## Safe change sequence

1. Identify the owning layer before editing.
2. Keep each cleanup change narrow and preserve existing public hooks.
3. Add a regression test for behavior that previously failed.
4. Run `npm test`.
5. Run `npm run prepare:web` and inspect the generated output.
6. Build the Android APK in CI and verify the packaged `index.html` matches `www/index.html`.
7. Test new game, continue, save/export, Part 2, locked/unlocked Part 3, return-to-home, scene audio, and short-screen layout on a real phone.
8. Only after these checks, consider removing duplicated legacy markup or old runtime patches.

## Known technical debt

- There is currently no committed npm lockfile; the direct Capacitor dependency versions are pinned in `package.json`, but transitive versions can still drift between clean builds. Add a reviewed `package-lock.json` and switch CI to `npm ci` before treating builds as fully reproducible.
- The original game source is a large bundled HTML file. Splitting it into modules may improve maintainability, but it is a high-risk structural change because story state, React hooks, and save handlers are tightly coupled. Do not perform a blind minifier/de-minifier or module extraction.
- `scripts/prepare-web.cjs` contains several string-based patches against exact source fragments. Keep each patch guarded by a unique-match check; a missing or duplicated anchor must fail the build rather than silently create a partial APK.
- The QARTON home runtime contains game-specific layout rules alongside shared component classes. Move only genuinely reusable rules into the design system; keep Carthage-specific selectors in the adapter.
- DOM/VM tests cover important contracts but cannot prove Android WebView lifecycle, touch behavior, or actual audio playback. Device testing remains mandatory.

## Definition of done for cleanup

- No accidental change to story text, story order, save schema, or save keys.
- No duplicate HTML IDs.
- All executable inline scripts parse.
- Save recovery preserves a valid existing save.
- Android branding manifest references are updated exactly once.
- The prepared APK contains the current game and QARTON assets.
- CI passes and the real-device smoke test is recorded.
