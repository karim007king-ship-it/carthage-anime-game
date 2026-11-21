# QARTON cinematic logo intro — integration contract

Status: **reference pending source review**. The previously shared QARTON logo video (reported filename `1000040710.mp4`) is the user's chosen visual reference. The original video was not available for inspection in this implementation pass. Do not claim to have matched its timing, frames, audio, or color grading.

## Goal
A reusable optional QARTON logo intro for Carthage and future QARTON games, without changing gameplay, save format, locale state or startup reliability.

## Integration rules
- Treat the user-approved original video as the baseline; improvements must be reviewed against the actual source, not a reconstructed guess.
- Keep branding in a separate intro module/assets directory. Never splice video bytes or branding logic into the minified self-contained story bundle.
- Do not make game startup depend on video loading or autoplay permissions. A failed, blocked or missing video must fall through to the game.
- Support skip, reduced motion, muted autoplay fallback, pause/resume and document visibility changes.
- Audio must only start after an appropriate user gesture when required by Android WebView/browser policy. Avoid concurrent soundtrack playback.
- Keep all assets local/offline for Android. Preserve `com.qarton.carthage`, save keys and original game boot.
- The brand intro is **not** a scene package and must not change chapter, story choices, save slots or the Part 3 lock.
- Default disabled during the adapter pilot. Enable only after actual video inspection, asset rights/format review, and mobile testing.

## Acceptance checks
1. Video present: intro can play, skip and hand off to the existing menu.
2. Video missing/corrupt: normal startup remains usable.
3. Reduced motion: static logo or immediate handoff.
4. Android back/home/resume: no black screen, stale audio or double startup.
5. Existing game tests and Android build still pass.
6. Test on a physical Android device before enabling by default.

## Follow-up
Retrieve the original reference video for frame-by-frame review. Confirm logo proportions, transitions, typography, sound, duration and end-frame before any creative enhancement.
