'use strict';

// Pure, deterministic presentation clock. No game-state, storage or audio access.
function createTimelinePlayer(scene, onFrame) {
  if (!scene || !Array.isArray(scene.timeline) || !Number.isFinite(scene.durationMs) || scene.durationMs <= 0) throw new TypeError('Invalid scene');
  if (typeof onFrame !== 'function') throw new TypeError('onFrame required');
  const timeline = scene.timeline.slice().sort((a, b) => a.atMs - b.atMs);
  let positionMs = 0, playing = false, disposed = false;
  function snapshot(atMs) {
    const active = timeline.filter(e => e.atMs <= atMs);
    const latest = type => [...active].reverse().find(e => e.type === type) || null;
    return Object.freeze({ sceneId: scene.sceneId, positionMs: atMs, durationMs: scene.durationMs,
      camera: latest('camera'), dialogue: latest('dialogue'),
      choices: latest('choice-prompt'), ended: atMs >= scene.durationMs });
  }
  function render() { if (!disposed) onFrame(snapshot(positionMs)); }
  function seek(ms) {
    if (disposed) return null;
    if (!Number.isFinite(ms)) throw new TypeError('Position must be finite');
    positionMs = Math.max(0, Math.min(scene.durationMs, ms));
    if (positionMs >= scene.durationMs) playing = false;
    render();
    return positionMs;
  }
  function play() { if (disposed) return; if (positionMs >= scene.durationMs) positionMs = 0; playing = true; render(); }
  function pause() { playing = false; }
  function tick(deltaMs) {
    if (disposed || !playing) return;
    if (!Number.isFinite(deltaMs) || deltaMs < 0) throw new TypeError('Delta must be nonnegative');
    seek(positionMs + deltaMs);
  }
  function replay() { if (disposed) return; playing = false; seek(0); play(); }
  function destroy() { disposed = true; playing = false; }
  render();
  return Object.freeze({ play, pause, seek, tick, replay, destroy,
    get state() { return Object.freeze({ playing, disposed, positionMs }); } });
}
if (typeof module !== 'undefined' && module.exports) module.exports = { createTimelinePlayer };
if (typeof window !== 'undefined') window.QartonTimelinePlayer = Object.freeze({ createTimelinePlayer });
