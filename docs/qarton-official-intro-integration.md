# QARTON official intro — Carthage integration contract

Approved source: `karim007king-ship-it/qarton-cinematic-engine/official-intro.mp4` on `main`.
Approved SHA-256: `6b22dbc843affed208e066cb6c68044779683594e9826a52cb1f1619a53fe2ff`.
The mobile playback, audio and skip button were confirmed manually in QARTON Test Lab.

## Implementation gates

1. Bundle the approved MP4 **locally** in the Android `www` output; avoid relying on a network connection at game launch. Verify its SHA-256 before packaging.
2. Reuse the engine's `createOfficialIntroPlayer` runtime, and its CSS, without copying a second independent implementation.
3. Add the intro as a **nonblocking optional overlay** after the existing startup page is ready. Do not rewrite the React app or replace its root.
4. Skip, media error, autoplay rejection and timeout must all leave the home menu usable. Preserve an explicit Play action for mobile autoplay restrictions.
5. Do not read, overwrite or migrate `shiganshina-*` localStorage keys or alter save slots, chapters, story content, or the Part 3 gate.
6. Avoid showing the intro on an internal home-navigation reload unless the product explicitly opts in. Respect reduced-motion preference and offer skip.
7. Add regression tests for the packaged MP4, source hash, skip, error and offline startup. Verify Android and browser separately.

## Current status

Planning branch only. The MP4 and runtime have **not** yet been copied into Carthage, and the game does **not** play the intro yet. No changes to the game or saves.
