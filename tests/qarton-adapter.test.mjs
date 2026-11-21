import assert from "node:assert/strict";
import { test } from "node:test";
import { createCarthagePresentationAdapter } from "../src/qarton/carthage-presentation-adapter.mjs";

function session(log, name) {
  return {
    async mount() { log.push("mount:" + name); },
    async destroy() { log.push("destroy:" + name); },
    async pause() { log.push("pause:" + name); },
    async resume() { log.push("resume:" + name); },
    async seek(ms) { log.push("seek:" + name + ":" + ms); }
  };
}

test("renders opt-in scene, supports transport and disposes old scene", async () => {
  const log = [];
  const adapter = createCarthagePresentationAdapter({
    resolveScenePackage: async snapshot => ({ id: snapshot.sceneId }),
    createSession: async pack => session(log, pack.id)
  });
  assert.equal(await adapter.show({ sceneId: "pilot" }), true);
  assert.equal(await adapter.pause(), true);
  assert.equal(await adapter.resume(), true);
  assert.equal(await adapter.seek(120), true);
  assert.equal(await adapter.show({ sceneId: "next" }), true);
  await adapter.destroy();
  assert.deepEqual(log, ["mount:pilot", "pause:pilot", "resume:pilot", "seek:pilot:120", "mount:next", "destroy:pilot", "destroy:next"]);
});

test("failure does not destroy working scene or mutate caller snapshot", async () => {
  const log = [], errors = [];
  const snapshot = { sceneId: "good", locale: "tn", state: { health: 100 } };
  const adapter = createCarthagePresentationAdapter({
    resolveScenePackage: async s => {
      assert.equal("state" in s, false);
      if (s.sceneId === "bad") throw new Error("missing asset");
      return { id: s.sceneId };
    },
    createSession: async pack => session(log, pack.id),
    onError: e => errors.push(e.message)
  });
  assert.equal(await adapter.show(snapshot), true);
  assert.equal(await adapter.show({ sceneId: "bad" }), false);
  assert.equal(await adapter.pause(), true);
  assert.deepEqual(snapshot.state, { health: 100 });
  assert.deepEqual(errors, ["missing asset"]);
  await adapter.destroy();
  assert.deepEqual(log, ["mount:good", "pause:good", "destroy:good"]);
});

test("stale asynchronous scene load never mounts after hide", async () => {
  let finish;
  const log = [];
  const adapter = createCarthagePresentationAdapter({
    resolveScenePackage: () => new Promise(resolve => { finish = resolve; }),
    createSession: async pack => session(log, pack.id)
  });
  const pending = adapter.show({ sceneId: "slow" });
  await adapter.hide();
  finish({ id: "slow" });
  assert.equal(await pending, false);
  assert.deepEqual(log, []);
  await adapter.destroy();
});

test("invalid inputs and destroyed lifecycle are rejected", async () => {
  assert.throws(() => createCarthagePresentationAdapter(), TypeError);
  const adapter = createCarthagePresentationAdapter({
    resolveScenePackage: async () => null,
    createSession: async () => session([], "none")
  });
  await assert.rejects(adapter.show({}), TypeError);
  assert.throws(() => adapter.seek(-1), TypeError);
  assert.equal(await adapter.show({ sceneId: "unmapped" }), false);
  await adapter.destroy();
  await assert.rejects(adapter.show({ sceneId: "later" }), /destroyed/);
});

test("a superseded mount is disposed and cannot replace the newer scene", async () => {
  const log = [];
  let releaseMount;
  const adapter = createCarthagePresentationAdapter({
    resolveScenePackage: async snapshot => ({ id: snapshot.sceneId }),
    createSession: async pack => ({
      ...session(log, pack.id),
      async mount() {
        log.push("mount:" + pack.id);
        if (pack.id === "slow") await new Promise(resolve => { releaseMount = resolve; });
      }
    })
  });
  const slow = adapter.show({ sceneId: "slow" });
  // Let the asynchronous resolver and session factory reach mount.
  for (let i = 0; i < 10 && !releaseMount; i++) await Promise.resolve();
  assert.equal(typeof releaseMount, "function");
  assert.equal(await adapter.show({ sceneId: "fast" }), true);
  releaseMount();
  assert.equal(await slow, false);
  assert.equal(await adapter.pause(), true);
  await adapter.destroy();
  assert.deepEqual(log, ["mount:slow", "mount:fast", "destroy:slow", "pause:fast", "destroy:fast"]);
});

test("mount failure cleans candidate and preserves the existing session", async () => {
  const log = [], errors = [];
  const adapter = createCarthagePresentationAdapter({
    resolveScenePackage: async snapshot => ({ id: snapshot.sceneId }),
    createSession: async pack => ({
      ...session(log, pack.id),
      async mount() {
        log.push("mount:" + pack.id);
        if (pack.id === "broken") throw new Error("mount failed");
      }
    }),
    onError: error => errors.push(error.message)
  });
  assert.equal(await adapter.show({ sceneId: "good" }), true);
  assert.equal(await adapter.show({ sceneId: "broken" }), false);
  assert.equal(await adapter.pause(), true);
  await adapter.destroy();
  assert.deepEqual(errors, ["mount failed"]);
  assert.deepEqual(log, ["mount:good", "mount:broken", "destroy:broken", "pause:good", "destroy:good"]);
});
