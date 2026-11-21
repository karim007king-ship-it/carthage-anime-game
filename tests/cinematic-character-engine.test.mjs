import test from "node:test";
import assert from "node:assert/strict";
import {
  createCharacterController,
  createCharacterStage,
  createIdleAnimation,
  createSpriteFrameAnimation,
  createWalkAnimation
} from "@qarton/cinematic-engine";

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName;
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.style = {};
    this.dataset = {};
    this.parentNode = null;
    this.className = "";
    this.src = "";
    this.alt = "";
  }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index !== -1) this.children.splice(index, 1);
    child.parentNode = null;
    return child;
  }
  remove() {
    this.parentNode?.removeChild(this);
  }
}

class FakeDocument {
  createElement(tagName) {
    return new FakeElement(tagName, this);
  }
}

test("Carthage can use deterministic idle, walk and sprite-frame APIs from its pinned engine", async () => {
  const document = new FakeDocument();
  const root = new FakeElement("section", document);
  const controller = createCharacterController({
    id: "pilot-hero",
    initial: { x: 12, y: 24, state: "moving" },
    motions: [{
      id: "pilot-walk",
      path: { points: [{ x: 12, y: 24 }, { x: 112, y: 24 }] },
      startMs: 0,
      durationMs: 1000,
      state: "moving"
    }]
  });

  const idle = createIdleAnimation({
    periodMs: 2400,
    blinkIntervalMs: 3600,
    phaseOffsetMs: 900
  });
  const walk = createWalkAnimation({ stepPeriodMs: 400 });
  const sprite = createSpriteFrameAnimation({
    frames: ["walk-a", "walk-b"],
    frameDurationMs: 100,
    idleFrame: "idle"
  });

  const stage = createCharacterStage({
    root,
    resolveSprite: key => `asset://${key}`,
    characters: [{
      controller,
      sprites: {
        idle: "idle",
        "walk-a": "walk-a",
        "walk-b": "walk-b"
      }
    }],
    idleAnimations: { "pilot-hero": idle },
    walkAnimations: { "pilot-hero": walk },
    spriteAnimations: { "pilot-hero": sprite }
  });

  assert.equal(await stage.mount(), true);
  assert.equal(root.children.length, 1);
  const character = root.children[0];
  const image = character.children[0];
  assert.equal(image.src, "asset://walk-a");
  assert.match(character.style.transform, /translate3d\(/);

  assert.equal(await stage.update(120), true);
  assert.equal(image.src, "asset://walk-b");
  assert.equal(character.dataset.state, "moving");

  assert.equal(await stage.update(1200), true);
  assert.equal(image.src, "asset://idle");
  assert.equal(character.dataset.state, "idle");

  stage.destroy();
  assert.equal(root.children.length, 0);
});
