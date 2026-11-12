# Legacy UI archive

This folder preserves the pre-isolation UI for rollback and reference.

- `index-legacy.html`: exact previous self-contained game document (same Git blob as the previous root `index.html`).
- `legacy-home-adapter.js`: previous QARTON DOM-decoration adapter.
- `legacy-home.css`: previous Carthage home stylesheet.
- `legacy-design-system.css`: previous shared QARTON design-system stylesheet.

The archive is not loaded by the Android build. The isolated QARTON home is rendered outside React and owns an explicit `HOME` / `TRANSITION` / `GAME` lifecycle. In `HOME`, the React root remains hidden even while native menu elements are still loading; during `TRANSITION`, the native menu actions are hidden while confirmation dialogs and a safe return control remain available; in `GAME`, the story root is shown. QARTON cards delegate to the original React controls, so the story engine, save schema, audio, and chapter navigation remain the source of truth.

Rollback: restore the archived adapter and stylesheet and remove the isolated runtime injection from `scripts/prepare-web.cjs`.
