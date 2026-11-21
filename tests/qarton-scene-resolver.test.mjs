import assert from "node:assert/strict";
import { test } from "node:test";
import { createCarthageSceneResolver } from "../src/qarton/carthage-scene-resolver.mjs";

test("only explicitly mapped scene IDs can resolve", async () => {
  const resolve = createCarthageSceneResolver({
    "pilot-scene": { version: 1, scene: { id: "pilot-scene", layers: [] } }
  });
  assert.equal(await resolve({ sceneId: "unknown" }), null);
  assert.equal(await resolve({ sceneId: "pilot-scene" }).then(x => x.scene.id), "pilot-scene");
});

test("manifest and returned packages are isolated from mutation", async () => {
  const original = { version: 1, scene: { id: "pilot", layers: [] } };
  const resolve = createCarthageSceneResolver({ pilot: original });
  original.scene.id = "modified externally";
  const first = await resolve({ sceneId: "pilot", state: { health: 99 } });
  assert.equal(first.scene.id, "pilot");
  first.scene.id = "mutated by renderer";
  assert.equal((await resolve({ sceneId: "pilot" })).scene.id, "pilot");
});

test("invalid scene manifests fail closed", () => {
  assert.throws(() => createCarthageSceneResolver(null), TypeError);
  assert.throws(() => createCarthageSceneResolver({ bad: null }), TypeError);
  assert.throws(() => createCarthageSceneResolver({ "": {} }), TypeError);
});
