# QARTON G3 — Original cinematic audio and asset pipeline

**Status:** scoped implementation brief, not a production integration approval. **Target:** isolated chapter-27 pilot in PR #21 or a new branch based on it after review. G0 save/lifecycle gate remains open.

## Source baseline (verified)
- Pilot scene: `examples/qarton-single-load-scene.json`, `sceneId=p3-single-load`, `durationMs=21000`, Tunisian dialogue, three decisions at 20500ms.
- Current scene package audio fields are `music:null`, `ambient:null`, `voice:null`; therefore **no cinematic soundtrack or dialogue audio is currently delivered by the JSON contract**.
- Luna's six original SVG pilot assets are isolated under `examples/assets/`. G2 Chromium and contract CI passed at `9cad0b48`.
- Current visual pilot is not the official Android gameplay route.

## G3 deliverables
1. **Asset inventory:** file path, origin, creator/license, SHA-256, duration/size, usage scope, and whether redistribution is permitted. Never treat an unknown file as licensed.
2. **Original audio cues:** optional ambience (wind, wagon, distant bridge work, clinic rain), short original transitions, and character voice only if legitimately produced/authorized. Do not reuse commercial music or third-party voice samples.
3. **Data contract:** add versioned, optional `audio.cues` with `id`, `atMs`, `src`, `kind`, `gain`, `durationMs` and `loop`; validate timing, paths, and safe gain ranges. Preserve compatibility with `music/ambient/voice:null`.
4. **Playback ownership:** one presentation clock controls cue start/seek/pause/replay. Audio unlock requires a user gesture on mobile. On pause and destroy, stop/suspend all sources and release resources. Seek must not duplicate a one-shot cue.
5. **Accessibility:** mute toggle, adjustable audio level, readable subtitles with audio disabled, reduced motion independent of mute; no autoplay with sound.
6. **Fallback:** missing/corrupt audio, denied autoplay, or suspended AudioContext must never block subtitles, choices, or the original game.
7. **Performance:** mobile-first compressed assets; no unbounded audio preload; asset budgets and fallback documented before integration.
8. **Verification:** browser tests for mute, pause, seek, replay, unavailable asset, resource cleanup and zero story/save mutation; Android device smoke test before any merge.

## Ownership
- **Luna:** cinematic visual polish and cue presentation/UI, only after G2 review.
- **Astra:** dialogue text and any editorial voice direction; no alteration of canonical choice outcomes.
- **GPT-6:** audio contract, test gates, integration and provenance audit.
- **User:** approves any final music/voice and official intro asset changes.

## Non-negotiable boundaries
- Do not change `prepare-web.cjs`, `index.html` production story, `www/`, official intro, `shiganshina-*` storage, existing saves, or original nine endings.
- Do not replace the approved intro video; its packaged hash discrepancy is unresolved.
- Do not merge PR #20 or #21 into `main` without explicit approval and G0/G5 checks.
- Pilot must remain opt-in and `presentationOnly:true`. Choice resolution stays game-owned after future integration.

## Acceptance gate
G3 is complete only after source/license inventory, original audio files (or documented intentional silence), deterministic cue behavior, browser QA, and mobile smoke. This document alone does **not** complete G3.
