# Legacy UI archive

This folder preserves the pre-isolation UI for rollback and reference.

- `index-legacy.html`: exact previous self-contained game document (same Git blob as the previous root `index.html`).
- `legacy-home-adapter.js`: previous QARTON DOM-decoration adapter.
- `legacy-home.css`: previous Carthage home stylesheet.
- `legacy-design-system.css`: previous shared QARTON design-system stylesheet.

The archive is not loaded by the Android build. The new isolated home is rendered outside React, hides the old React home only while the native menu is active, and delegates clicks to the original React controls. The story engine, saves, audio, and chapter navigation remain unchanged.

Rollback: restore the archived adapter and stylesheet and remove the isolated runtime injection from `scripts/prepare-web.cjs`.
