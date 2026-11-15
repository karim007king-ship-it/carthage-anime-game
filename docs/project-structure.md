# QARTON — Project Structure and Maintenance Guide

## 1. Runtime architecture

The game is split into five ownership layers:

1. **Game source — `index.html`**
   - Original React game, story data, scene markup, progression, choices, and save engine.
   - This remains the only source of truth for story and game state.

2. **QARTON presentation — `styles/` and `scripts/qarton-*.js`**
   - `styles/qarton-design-system.css`: shared QARTON tokens and reusable primitives.
   - `styles/qarton-carthage-gameplay.css`: Carthage gameplay-only visual rules.
   - `scripts/qarton-isolated-home.js`: HOME / INTRO / GAME / TRANSITION lifecycle and isolated home shell.
   - `scripts/qarton-main-tree.js`: four home branches and placement of original engine controls.
   - `scripts/qarton-premium-home.js`: gameplay styling adapter only.
   - `scripts/qarton-scene-backgrounds.cjs`: the single owner of scene-art discovery, image load states, CSS background/pseudo-element checks, and a non-black fallback.
   - `scripts/qarton-cinematic-scenes.cjs`: presentation effects only; consumes the active artwork published by the background manager and never performs its own DOM-wide image discovery.

3. **Android preparation — `scripts/prepare-web.cjs`**
   - Copies the canonical game HTML into `www/`.
   - Applies guarded compatibility/save/navigation patches.
   - Loads and injects the QARTON styles and runtime adapters in a deterministic order.
   - Parses every executable inline script before writing the prepared page.

4. **Android packaging**
   - Capacitor syncs the prepared `www/` assets.
   - `scripts/apply-android-branding.cjs` owns launcher resources and manifest icon references.
   - GitHub Actions builds and uploads the APK.

5. **Verification — `tests/`**
   - Source contracts, save recovery, QARTON lifecycle/navigation, cinematic injection, and Chromium integration.
   - CI and browser tests do not replace the final Android WebView/device check.

## 2. Source-of-truth and compatibility rules

- Edit `index.html` for story and game-engine changes. Never hand-edit generated `www/` or `android/` output.
- Keep shared QARTON tokens in the design system; keep Carthage-only presentation rules in Carthage adapters.
- Keep the original engine responsible for story progression, choices, and save operations. QARTON may move existing controls but must not clone their handlers.
- Android-only compatibility behavior belongs in the preparation layer until it can be moved safely into the shared source.
- Save keys such as `shiganshina-slots-v1` and `shiganshina-autosave-v1` are compatibility contracts. Never rename, clear, or silently replace them during visual cleanup.
- Cinematic adapters are presentation-only. They must not mutate story state, timers, choices, or saves.

## 3. File ownership

| File | Owns | Must not own |
| --- | --- | --- |
| `index.html` | Story, React game engine, scene markup, save logic | QARTON-wide design tokens |
| `styles/qarton-design-system.css` | Shared studio tokens and primitives | Story progression or Carthage-only layout |
| `styles/qarton-carthage-gameplay.css` | Carthage gameplay skin | Story state or save logic |
| `scripts/qarton-isolated-home.js` | Home shell and app lifecycle | Story progression or save schema |
| `scripts/qarton-main-tree.js` | Four-branch navigation and original control placement | Recreated game/save handlers |
| `scripts/qarton-premium-home.js` | Gameplay presentation adapter | Competing home implementation |
| `scripts/qarton-scene-backgrounds.cjs` | Active scene-art discovery, load state, fallback, background-change events | Story progression, cinematic motion, or save mutation |
| `scripts/qarton-cinematic-scenes.cjs` | Motion and scene transitions driven by the background manager | Image discovery, story progression, or save mutation |
| `scripts/prepare-web.cjs` | Build-time patches and ordered runtime injection | Manual generated assets |
| `scripts/apply-android-branding.cjs` | Launcher artwork and manifest branding | Game UI or save behavior |
| `tests/` | Regression and integration checks | Production runtime behavior |
| `docs/` | Architecture and maintenance guidance | Duplicate executable configuration |

## 4. Safe change sequence

1. Identify the owning file before editing.
2. Keep changes narrow; do not extract or rewrite the bundled game engine as part of visual cleanup.
3. Guard every source-string patch with unique-match checks. Missing or duplicate anchors must fail the build.
4. Add a regression test for every repaired behavior, including background-ready, pending, missing, and scene-change states.
5. Run `npm test`.
6. Run `npm run prepare:web`; inspect the prepared HTML and confirm all runtime markers are present.
7. Run `node tests/qarton-browser-integration-test.cjs`.
8. Build the APK and verify the packaged HTML matches `www/index.html`.
9. On Android, verify new game, continue, saves, Part 2/Part 3 gating, scene backgrounds, scene transitions, audio, and return-to-home.

## 5. Known technical debt

- There is no committed npm lockfile. Transitive dependency versions can drift; add and review a lockfile before switching CI to `npm ci`.
- The original game is a large bundled HTML file. Module extraction is high-risk because story state, React hooks, and save handlers are tightly coupled. Do not blindly reformat or split it.
- `prepare-web.cjs` still contains guarded string-based patches. Long-term, migrate stable engine hooks into explicit source-level APIs rather than adding more textual replacements.
- The cinematic scene adapter detects image elements and CSS background URLs on DOM elements. It does not currently inspect CSS pseudo-element artwork; add that only with a representative scene test.
- Chromium verifies browser rendering and DOM behavior, not Android WebView device-specific loading, touch, or audio.

## 6. Cleanup definition of done

- Story text, order, choices, and save schema remain unchanged.
- No duplicate HTML IDs.
- All executable inline scripts parse.
- Existing saves survive startup and recovery.
- Cinematic image and CSS-background discovery tests pass.
- Prepared and packaged HTML are identical.
- CI passes and a real-device smoke test is recorded.
