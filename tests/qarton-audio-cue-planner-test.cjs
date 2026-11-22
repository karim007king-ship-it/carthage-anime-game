'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateAudioCues, createAudioCuePlanner } = require('../scripts/qarton-audio-cue-planner.js');
const scene = { durationMs: 21000, audio: { music: null, ambient: null, voice: null } };
const withCue = cue => ({ durationMs: 21000, audio: { cues: [cue] } });
const cue = { id:'wind-1', kind:'ambient', src:'assets/audio/wind.ogg', atMs:1000, durationMs:3000, gain:0.35, loop:false };
test('legacy silent scene is valid and produces no audio commands', () => {
  assert.deepEqual(validateAudioCues(scene), []);
  const planner=createAudioCuePlanner(scene);
  assert.deepEqual(planner.advance(21000),[]);
  planner.destroy();
  assert.equal(planner.disposed,true);
});
test('cue fires once on forward clock advance, never on seek or pause', () => {
  const planner=createAudioCuePlanner(withCue(cue));
  assert.deepEqual(planner.advance(999),[]);
  assert.equal(planner.advance(1000)[0].id,'wind-1');
  assert.deepEqual(planner.advance(2000),[]);
  assert.deepEqual(planner.seek(500),[]);
  assert.deepEqual(planner.advance(2000).map(c=>c.id),['wind-1']);
  planner.replay();
  assert.deepEqual(planner.advance(1000).map(c=>c.id),['wind-1']);
  planner.destroy();
  assert.deepEqual(planner.advance(21000),[]);
});
test('rejects invalid paths, gains, duplicate ids and out-of-range cues', () => {
  for (const invalid of [
    { ...cue, src:'https://example.com/track.mp3' },
    { ...cue, src:'assets/../private.wav' },
    { ...cue, gain:1.1 },
    { ...cue, atMs:21000 },
    { ...cue, durationMs:22000 },
    { ...cue, loop:'yes' }
  ]) assert.throws(()=>validateAudioCues(withCue(invalid)));
  assert.throws(()=>validateAudioCues({durationMs:21000,audio:{cues:[cue,cue]}}));
});
