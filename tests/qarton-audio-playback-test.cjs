'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createAudioPlayback}=require('../scripts/qarton-audio-playback.js');
const scene={durationMs:10000,audio:{cues:[
  {id:'wind',kind:'ambient',src:'assets/audio/wind.ogg',atMs:1000,durationMs:8000,gain:0.4,loop:true},
  {id:'knock',kind:'effect',src:'assets/audio/knock.ogg',atMs:3000,durationMs:1000,gain:0.8,loop:false}
]}};
class FakeAudio {
  static instances=[];
  constructor(src){this.src=src;this.loop=false;this.volume=1;this.currentTime=0;this.paused=true;FakeAudio.instances.push(this);}
  play(){this.paused=false;return Promise.resolve();}
  pause(){this.paused=true;}
}
test('silent by default, explicit unmute/play and pause cleanup',()=>{
  FakeAudio.instances=[];
  const a=createAudioPlayback(scene,{AudioCtor:FakeAudio});
  a.play(0);a.tick(3500);
  assert.equal(a.state.activeCount,0);
  a.setMuted(false);
  assert.equal(a.state.activeCount,1); // loop, not one-shot replay
  a.pause();
  assert.equal(a.state.activeCount,0);
  assert.ok(FakeAudio.instances.every(x=>x.paused));
  a.destroy();
  assert.equal(a.state.disposed,true);
});
test('forward crossing triggers cue once; seek never replays one-shot',()=>{
  FakeAudio.instances=[];
  const a=createAudioPlayback(scene,{AudioCtor:FakeAudio,muted:false});
  a.play(0);
  a.tick(1000);assert.equal(a.state.activeCount,1);
  a.tick(3000);assert.equal(a.state.activeCount,2);
  a.tick(3500);assert.equal(FakeAudio.instances.length,2);
  a.seek(3500);assert.equal(a.state.activeCount,1);
  a.setVolume(0.5);assert.equal(a.state.volume,0.5);
  a.replay();assert.equal(a.state.activeCount,0);
  a.destroy();
});
test('missing media and invalid positions fail safely',()=>{
  const a=createAudioPlayback(scene,{AudioCtor:null,muted:false});
  a.play(0);a.tick(3000);assert.equal(a.state.activeCount,0);
  assert.throws(()=>a.seek(-1),RangeError);
  assert.throws(()=>a.setVolume(2),RangeError);
  a.destroy();
});

test('audio ends exactly at scene boundary and releases loop media',()=>{
  FakeAudio.instances=[];
  const a=createAudioPlayback(scene,{AudioCtor:FakeAudio,muted:false});
  a.play(1500);
  assert.equal(a.state.activeCount,1);
  a.tick(9000);
  assert.equal(a.state.activeCount,0);
  assert.ok(FakeAudio.instances.every(x=>x.paused));
  a.pause();
  a.destroy();
  assert.equal(a.state.activeCount,0);
});
test('audio adapter ignores calls after disposal and does not mutate scene',()=>{
  const before=JSON.stringify(scene);
  const a=createAudioPlayback(scene,{AudioCtor:FakeAudio,muted:false});
  a.destroy();
  a.play(1000);a.seek(3000);a.tick(9000);a.replay();
  assert.equal(a.state.disposed,true);
  assert.equal(a.state.activeCount,0);
  assert.equal(JSON.stringify(scene),before);
});

test('duplicate overlapping cues never allocate a second audio element',()=>{
  FakeAudio.instances=[];
  const a=createAudioPlayback(scene,{AudioCtor:FakeAudio,muted:false});
  a.play(0);
  a.tick(1000);
  a.tick(3000);
  const count=FakeAudio.instances.length;
  a.tick(3500);
  assert.equal(FakeAudio.instances.length,count);
  a.destroy();
});
test('explicit null audio constructor keeps fallback silent',()=>{
  const a=createAudioPlayback(scene,{AudioCtor:null,muted:false});
  a.play(0);a.tick(4000);
  assert.equal(a.state.activeCount,0);
  a.destroy();
});
