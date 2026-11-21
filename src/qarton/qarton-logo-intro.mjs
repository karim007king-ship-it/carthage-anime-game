/**
 * Optional QARTON logo intro. Never modifies gameplay, saves or navigation.
 * Caller owns the video asset and invokes start() after the host menu exists.
 */
export function createQartonLogoIntro({
  document: doc,
  src,
  mount,
  reducedMotion = false,
  onFinish = () => {},
  timeoutMs = 8000
} = {}) {
  if (!doc?.createElement || !mount?.appendChild || typeof onFinish !== "function") {
    throw new TypeError("A document, mount and onFinish callback are required");
  }
  if (typeof src !== "string" || !src.trim()) throw new TypeError("A local video URL is required");
  let active = false, done = false, video, overlay, timer;
  const clear = () => {
    if (timer !== undefined) { clearTimeout(timer); timer = undefined; }
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    overlay?.remove();
    overlay = undefined;
    video = undefined;
  };
  const finish = () => {
    if (done) return;
    done = true;
    active = false;
    clear();
    onFinish();
  };
  const onVisibility = () => {
    if (doc.hidden && video && !video.paused) video.pause();
  };
  function start() {
    if (done || active) return false;
    active = true;
    if (reducedMotion) { finish(); return true; }
    overlay = doc.createElement("div");
    overlay.className = "qarton-logo-intro";
    overlay.style.cssText = "position:absolute;inset:0;z-index:1000;background:#050307;display:grid;place-items:center;overflow:hidden";
    video = doc.createElement("video");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("preload", "auto");
    video.muted = true; // Reliable autoplay; never seize audio focus from game.
    video.autoplay = true;
    video.style.cssText = "width:100%;height:100%;object-fit:contain";
    video.src = src;
    video.addEventListener("ended", finish, { once: true });
    video.addEventListener("error", finish, { once: true });
    const skip = doc.createElement("button");
    skip.type = "button";
    skip.textContent = "تخطّي المقدمة";
    skip.setAttribute("aria-label", "تخطّي مقدمة QARTON");
    skip.style.cssText = "position:absolute;bottom:calc(20px + env(safe-area-inset-bottom, 0px));right:20px;z-index:1;padding:10px 16px;color:white;background:#311b20;border:1px solid #b88b44;border-radius:8px";
    skip.addEventListener("click", finish, { once: true });
    overlay.append(video, skip);
    mount.appendChild(overlay);
    doc.addEventListener("visibilitychange", onVisibility);
    timer = setTimeout(finish, timeoutMs);
    try {
      const promise = video.play();
      if (promise?.catch) promise.catch(finish);
    } catch { finish(); }
    return true;
  }
  function destroy() {
    if (done) return;
    done = true;
    active = false;
    clear();
    doc.removeEventListener("visibilitychange", onVisibility);
  }
  return Object.freeze({ start, skip: finish, destroy, get active() { return active; } });
}
