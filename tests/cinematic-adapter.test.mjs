import test from "node:test";
import assert from "node:assert/strict";
import { createCarthageCinematicAdapter } from "../scripts/carthage-cinematic-adapter.mjs";

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName;
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.style = {};
    this.dataset = {};
    this.className = "";
    this.parentNode = null;
    this.classList = { add() {}, remove() {} };
  }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  removeChild(child) {
    this.children = this.children.filter(item => item !== child);
    child.parentNode = null;
    return child;
  }
}
class FakeDocument {
  createElement(tagName) { return new FakeElement(tagName, this); }
}

function setup(options = {}) {
  const document = new FakeDocument();
  const root = new FakeElement("main", document);
  const adapter = createCarthageCinematicAdapter({
    root,
    assetManifest: { "pilot-bg": "https://assets.example/pilot.webp" },
    device: { quality: "low", reducedMotion: true },
    duration: 0,
    ...options
  });
  return { adapter, root };
}

test("adapter requires an isolated presentation root and explicit asset manifest", () => {
  assert.throws(() => createCarthageCinematicAdapter(), /dedicated DOM root/);
  const document = new FakeDocument();
  assert.throws(() => createCarthageCinematicAdapter({
    root: new FakeElement("main", document)
  }), /asset manifest/);
});

test("adapter mounts a declared scene without touching game state", async () => {
  const { adapter, root } = setup();
  const scene = {
    id: "carthage-pilot-neutral",
    durationMs: 0,
    layers: [{ id: "sky", role: "background", asset: "pilot-bg", depth: 0 }]
  };
  assert.equal(root.style.position, "relative");
  assert.equal(root.style.overflow, "hidden");
  assert.equal(root.style.isolation, "isolate");
  assert.equal(await adapter.mountScene(scene), true);
  assert.equal(root.children.length, 1);
  assert.equal(root.children[0].children[0].children[0].src, "https://assets.example/pilot.webp");
  assert.equal(root.dataset.gameSave, undefined);
  await adapter.destroy();
  assert.equal(root.children.length, 0);
  await assert.rejects(adapter.mountScene(scene), /destroyed/);
});

test("adapter rejects missing assets and invalid scene layers without corrupting current scene", async () => {
  const { adapter, root } = setup();
  const good = {
    id: "good",
    layers: [{ id: "sky", role: "background", asset: "pilot-bg" }]
  };
  await adapter.mountScene(good);
  const current = root.children[0];
  await assert.rejects(adapter.mountScene({
    id: "bad-asset",
    layers: [{ id: "unknown", role: "background", asset: "missing" }]
  }), /Unknown Carthage cinematic asset/);
  assert.equal(root.children.includes(current), true);
  await assert.rejects(adapter.mountScene({
    id: "invalid",
    layers: [{ id: "duplicate", role: "background", asset: "pilot-bg" }, { id: "duplicate", role: "foreground", asset: "pilot-bg" }]
  }), /unique id/);
  await adapter.destroy();
});

test("adapter lifecycle can pause and resume without auto-starting a scene", async () => {
  const { adapter, root } = setup();
  assert.equal(root.children.length, 0);
  assert.equal(adapter.isActive, true);
  adapter.setActive(false);
  assert.equal(adapter.isActive, false);
  adapter.setActive(true);
  assert.equal(adapter.isActive, true);
  await adapter.destroy();
});

class FakeEventTarget {
  constructor(visibilityState = "visible") {
    this.visibilityState = visibilityState;
    this.listeners = new Map();
  }
  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }
  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }
  dispatch(type) {
    for (const listener of this.listeners.get(type) ?? []) listener({ type });
  }
  count() {
    return [...this.listeners.values()].reduce((sum, listeners) => sum + listeners.size, 0);
  }
}

test("adapter bridges page visibility and pagehide/pageshow, then removes listeners on destroy", async () => {
  const documentTarget = new FakeEventTarget("visible");
  const pageTarget = new FakeEventTarget();
  const { adapter } = setup({
    lifecycleTarget: documentTarget,
    lifecyclePageTarget: pageTarget
  });
  assert.equal(adapter.isActive, true);
  pageTarget.dispatch("pagehide");
  assert.equal(adapter.isActive, false);
  pageTarget.dispatch("pageshow");
  assert.equal(adapter.isActive, true);
  documentTarget.visibilityState = "hidden";
  documentTarget.dispatch("visibilitychange");
  assert.equal(adapter.isActive, false);
  documentTarget.visibilityState = "visible";
  documentTarget.dispatch("visibilitychange");
  assert.equal(adapter.isActive, true);
  await adapter.destroy();
  assert.equal(documentTarget.count(), 0);
  assert.equal(pageTarget.count(), 0);
});
