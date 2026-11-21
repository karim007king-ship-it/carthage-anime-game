# QARTON intro asset delivery

The user supplied the original vertical MP4 `1000040083.mp4` (4.8 s, 1512 × 2688, 30 fps, H.264/AAC, approximately 9.8 MB).

Two derived Android-oriented exports were generated outside the repository:
- `qarton_intro_mobile_audio.mp4`: 540 × 960, 24 fps, H.264/AAC, approximately 908 KiB.
- `qarton_intro_mobile_muted.mp4`: 540 × 960, 24 fps, H.264, approximately 895 KiB.

**Neither binary is committed to GitHub yet.** The local outputs are available in the conversation for review. Preserve the original separately.

## Proposed app packaging
1. After visual/audio approval, add the selected export at `assets/branding/qarton-intro.mp4` on the pilot branch.
2. Explicitly copy it into `www/assets/branding/` in the Android preparation process. Do not rely on runtime network fetches.
3. Only enable the intro after the main app boot is stable; optional feature flag defaults OFF.
4. Call `createQartonLogoIntro` from a stable host-owned menu lifecycle; never insert it into the minified story module.
5. Use muted playback by default; audio-enabled intro requires a user gesture and explicit soundtrack coordination.
6. Test skip, video errors, background/resume, low memory, screen aspect ratio, reduced motion, and existing saves.

## QA
The conversion was completed with FFmpeg; no physical Android playback QA or game integration has yet been performed.
