'use strict';

// Pure audio-cue schedule: no sound device, browser API, game state, or storage.
// A separate opt-in renderer may consume these commands after a user gesture.
const KINDS = new Set(['ambient', 'music', 'effect', 'voice']);
function validateAudioCues(scene) {
  if (!scene || !Number.isFinite(scene.durationMs) || scene.durationMs <= 0) throw new TypeError('Invalid scene duration');
  const cues = scene.audio?.cues ?? [];
  if (!Array.isArray(cues)) throw new TypeError('audio.cues must be an array');
  const ids = new Set();
  return Object.freeze(cues.map(cue => {
    if (!cue || typeof cue.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(cue.id) || ids.has(cue.id)) throw new TypeError('Invalid or duplicate cue id');
    ids.add(cue.id);
    if (!KINDS.has(cue.kind)) throw new TypeError('Invalid cue kind');
    if (typeof cue.src !== 'string' || !/^assets\/[a-zA-Z0-9/_-]+\.(?:ogg|mp3|wav)$/.test(cue.src) || cue.src.includes('..')) throw new TypeError('Invalid local audio source');
    if (!Number.isInteger(cue.atMs) || cue.atMs < 0 || cue.atMs >= scene.durationMs) throw new RangeError('Invalid cue start');
    if (!Number.isInteger(cue.durationMs) || cue.durationMs <= 0 || cue.atMs + cue.durationMs > scene.durationMs) throw new RangeError('Invalid cue duration');
    if (typeof cue.gain !== 'number' || !Number.isFinite(cue.gain) || cue.gain < 0 || cue.gain > 1) throw new RangeError('Invalid gain');
    if (typeof cue.loop !== 'boolean') throw new TypeError('Invalid loop flag');
    return Object.freeze({ id: cue.id, kind: cue.kind, src: cue.src, atMs: cue.atMs, durationMs: cue.durationMs, gain: cue.gain, loop: cue.loop });
  }));
}
function createAudioCuePlanner(scene) {
  const cues = validateAudioCues(scene);
  let previousMs = 0, disposed = false;
  function seek(ms) {
    if (disposed) return Object.freeze([]);
    if (!Number.isFinite(ms) || ms < 0 || ms > scene.durationMs) throw new RangeError('Invalid position');
    // Seeking never fires one-shots; caller may synchronize active loops separately.
    previousMs = ms;
    return Object.freeze([]);
  }
  function advance(ms) {
    if (disposed) return Object.freeze([]);
    if (!Number.isFinite(ms) || ms < previousMs || ms > scene.durationMs) throw new RangeError('Audio clock must advance monotonically');
    const fired = cues.filter(c => c.atMs > previousMs && c.atMs <= ms);
    previousMs = ms;
    return Object.freeze(fired);
  }
  function replay() { if (!disposed) previousMs = 0; }
  function destroy() { disposed = true; }
  return Object.freeze({ seek, advance, replay, destroy, get disposed() { return disposed; } });
}
if (typeof module !== 'undefined' && module.exports) module.exports = { validateAudioCues, createAudioCuePlanner };
if (typeof window !== 'undefined') window.QartonAudioCuePlanner = Object.freeze({ validateAudioCues, createAudioCuePlanner });
