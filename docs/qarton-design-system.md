# QARTON Design System
Version: 1.0  
Status: shared foundation — adopted by QARTON Carthage; intended for every future QARTON game.

## Brand contract
- Brand: **QARTON — قرطون**
- Tagline: **CULTURE • POWER • CINEMA**
- Core palette: royal gold, deep red, midnight navy/black, warm cream.
- Visual character: cinematic, premium, readable, culturally adaptable.
- The studio identity is shared; each game retains its own world, art direction, language, and interaction model.

## Shared tokens
The canonical CSS tokens and legacy-compatible aliases (`--q-gold`, `--q-cream`, `--q-ink`) live in `styles/qarton-design-system.css`. Adapters consume these aliases; they must not redefine them. Do not duplicate or redefine the palette in each game. Game-specific themes may override semantic tokens only inside a game-scoped root, without changing the QARTON brand values.

## Shared components
- `.qarton-ui`: typography and foreground baseline.
- `.qarton-card`: premium panel/card surface.
- `.qarton-button`: accessible touch target and interaction baseline.
- `.qarton-button--primary`, `--secondary`, `--locked`: semantic button variants.
- `.qarton-game-card`: shared surface primitive for dialogue, theatre, and search panels.
- `.qarton-game-control`: shared accessible control primitive for story choices, HUD actions, and map controls.

## Rules for every QARTON game
1. Keep the QARTON logo/tagline consistent across game launch and home surfaces.
2. Keep game title, world art, story text, and game-specific navigation owned by that game.
3. Use semantic colors and shared component classes; avoid one-off hex values for shared UI.
4. Touch targets must be at least 44px high where practical; keyboard focus must remain visible.
5. Respect safe areas, short screens, and `prefers-reduced-motion`.
6. Do not apply home-screen scroll locks to story, cutscene, settings, or save screens.
7. Preserve game state, save keys, and existing action handlers when replacing presentation.
8. A legacy UI element may be removed only after its action has a tested QARTON replacement.

## Carthage adapter
Carthage is the first implementation adapter. It maps the existing native home actions, dialogue surfaces, story choices, HUD controls, and map controls to shared QARTON components while preserving their handlers. The QARTON adapter must detect the actual home menu using both the Part 1 and Part 2 selectors; generic story buttons such as “ابدأ” or “متابعة” are never sufficient evidence that the user is on the home screen.

## Validation before removing legacy UI
- Confirm menu detection against the real rendered DOM.
- Confirm new game, continue, Part 2, locked Part 3, settings, and save tools.
- Confirm scene transitions and audio continue independently of home UI.
- Confirm save slots and autosave remain unchanged.
- Run `npm test` and build the Android APK.
- Complete a real-device smoke test before deleting the legacy menu structure.
