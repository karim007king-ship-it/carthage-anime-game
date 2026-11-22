'use strict';

// Optional browser audio adapter. Does not access gameplay, storage or story choices.
// All media playback starts only after a caller invokes play() from a user gesture.
function createAudioPlayback(scene, options = {}) {
  const plannerApi = typeof module !== 'undefined' && module.exports
    ? require('./qarton-audio-cue-planner.js')
    : window.QartonAudioCuePlanner;
  const cues = plannerApi.validateAudioCues(scene);
  const AudioCtor = options.AudioCtor === undefined ? (typeof Audio !== 'undefined' ? Audio : null) : options.AudioCtor;
  let muted = options.muted !== false;
  let volume = 1, playing = false, disposed = false, positionMs = 0;
  const active = new Map();
  function stopAll() {
    for (const sound of active.values()) {
      try { sound.pause(); sound.currentTime = 0; sound.src = ''; } catch (_) { /* unsupported media cleanup */ }
    }
    active.clear();
  }
  function startCue(cue, offsetMs = 0) {
    if (muted || !AudioCtor || disposed || !playing) return;
    try {
      if (active.has(cue.id)) return;
      const sound = new AudioCtor(cue.src);
      sound.loop = cue.loop;
      sound.volume = Math.max(0, Math.min(1, cue.gain * volume));
      sound.currentTime = offsetMs / 1000;
      active.set(cue.id, sound);
      const result = sound.play();
      if (result && typeof result.catch === 'function') result.catch(() => { if (active.get(cue.id) === sound) { try { sound.pause(); sound.src = ''; } catch (_) {} active.delete(cue.id); } });
    } catch (_) { active.delete(cue.id); } // audio failure must not block subtitles or choices
  }
  function syncAt(ms, includeLoops) {
    stopAll();
    if (!playing || muted || !includeLoops) return;
    for (const cue of cues) {
      if (cue.loop && cue.atMs <= ms && ms < cue.atMs + cue.durationMs) startCue(cue, ms - cue.atMs);
    }
  }
  function play(ms = positionMs) {
    if (disposed) return;
    if (!Number.isFinite(ms) || ms < 0 || ms > scene.durationMs) throw new RangeError('Invalid position');
    positionMs = ms;
    playing = true;
    syncAt(ms, true);
  }
  function pause() {
    if (disposed) return;
    playing = false;
    stopAll();
  }
  function seek(ms) {
    if (disposed) return;
    if (!Number.isFinite(ms) || ms < 0 || ms > scene.durationMs) throw new RangeError('Invalid position');
    positionMs = ms;
    syncAt(ms, true);
  }
  function tick(ms) {
    if (disposed || !playing) return;
    if (!Number.isFinite(ms) || ms < positionMs || ms > scene.durationMs) throw new RangeError('Audio clock must advance monotonically');
    const previous = positionMs;
    positionMs = ms;
    for (const cue of cues) {
      if (cue.atMs > previous && cue.atMs <= ms && cue.atMs + cue.durationMs > ms) startCue(cue, ms - cue.atMs);
    }
    for (const cue of cues) {
      if (cue.atMs + cue.durationMs <= ms && active.has(cue.id)) {
        const sound = active.get(cue.id);
        try { sound.pause(); sound.src = ''; } catch (_) {}
        active.delete(cue.id);
      }
    }
  }
  function replay() { if (disposed) return; pause(); positionMs = 0; }
  function setMuted(value) { muted = Boolean(value); if (muted) stopAll(); else syncAt(positionMs, true); }
  function setVolume(value) {
    if (!Number.isFinite(value) || value < 0 || value > 1) throw new RangeError('Invalid volume');
    volume = value;
    for (const cue of cues) if (active.has(cue.id)) active.get(cue.id).volume = cue.gain * volume;
  }
  function destroy() { pause(); disposed = true; }
  return Object.freeze({ play, pause, seek, tick, replay, setMuted, setVolume, destroy,
    get state() { return Object.freeze({ positionMs, playing, muted, volume, disposed, activeCount: active.size }); } });
}
if (typeof module !== 'undefined' && module.exports) module.exports = { createAudioPlayback };
if (typeof window !== 'undefined') window.QartonAudioPlayback = Object.freeze({ createAudioPlayback });
