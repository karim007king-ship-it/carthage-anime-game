import { test } from "node:test";
import assert from "node:assert/strict";
import { createQartonLogoIntro } from "../src/qarton/qarton-logo-intro.mjs";

function fakeDOM(play = () => Promise.resolve()) {
  const nodes = [];
  function element(tag) {
    const listeners = new Map();
    return {
      tag, style: {}, paused: false,
      setAttribute() {}, removeAttribute() {}, load() {},
      addEventListener(name, fn) { listeners.set(name, fn); },
      emit(name) { listeners.get(name)?.(); },
      pause() { this.paused = true; },
      play,
      append(...children) { this.children = children; },
      remove() { this.removed = true; }
    };
  }
  const document = { hidden: false, createElement: tag => element(tag), addEventListener() {}, removeEventListener() {} };
  const mount = { appendChild(node) { nodes.push(node); } };
  return { document, mount, nodes };
}

test("reduced motion skips video and finishes once", () => {
  const { document, mount, nodes } = fakeDOM();
  let count = 0;
  const intro = createQartonLogoIntro({ document, mount, src: "assets/intro.mp4", reducedMotion: true, onFinish: () => count++ });
  assert.equal(intro.start(), true);
  intro.skip();
  assert.equal(count, 1);
  assert.equal(nodes.length, 0);
});

test("normal intro creates contain-fit muted video and skip action", () => {
  const { document, mount, nodes } = fakeDOM();
  let count = 0;
  const intro = createQartonLogoIntro({ document, mount, src: "assets/intro.mp4", onFinish: () => count++ });
  assert.equal(intro.start(), true);
  assert.equal(nodes.length, 1);
  const [video, skip] = nodes[0].children;
  assert.equal(video.muted, true);
  assert.match(video.style.cssText, /object-fit:contain/);
  skip.emit("click");
  assert.equal(count, 1);
  assert.equal(nodes[0].removed, true);
  intro.skip();
  assert.equal(count, 1);
});

test("autoplay rejection falls through to game", async () => {
  const { document, mount } = fakeDOM(() => Promise.reject(new Error("blocked")));
  let count = 0;
  const intro = createQartonLogoIntro({ document, mount, src: "assets/intro.mp4", onFinish: () => count++ });
  intro.start();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(count, 1);
});

test("destroy does not trigger game completion callback", () => {
  const { document, mount } = fakeDOM();
  let count = 0;
  const intro = createQartonLogoIntro({ document, mount, src: "assets/intro.mp4", onFinish: () => count++ });
  intro.start();
  intro.destroy();
  assert.equal(count, 0);
  assert.equal(intro.active, false);
});
