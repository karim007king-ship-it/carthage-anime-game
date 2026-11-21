/**
 * Opt-in, presentation-only bridge for QARTON scene packages.
 * No imports from Carthage gameplay and no storage access.
 * A host supplies its own engine session factory and asset mapping.
 */
export function createCarthagePresentationAdapter({
  createSession,
  resolveScenePackage,
  onError = () => {}
} = {}) {
  if (typeof createSession !== "function" || typeof resolveScenePackage !== "function" || typeof onError !== "function") {
    throw new TypeError("A session factory, scene resolver and error callback are required");
  }

  let generation = 0;
  let current = null;
  let destroyed = false;

  async function dispose(session) {
    if (session && typeof session.destroy === "function") await session.destroy();
  }

  async function show(snapshot) {
    if (destroyed) throw new Error("Presentation adapter has been destroyed");
    if (!snapshot || typeof snapshot.sceneId !== "string" || !snapshot.sceneId.trim()) {
      throw new TypeError("A stable sceneId is required");
    }
    const token = ++generation;
    let candidate = null;
    try {
      const pack = await resolveScenePackage(Object.freeze({
        sceneId: snapshot.sceneId,
        locale: snapshot.locale,
        visualVariant: snapshot.visualVariant,
        reducedMotion: snapshot.accessibility?.reducedMotion === true
      }));
      if (token !== generation || destroyed) return false;
      if (!pack) {
        await hide();
        return false;
      }
      candidate = await createSession(pack);
      if (token !== generation || destroyed) {
        await dispose(candidate);
        return false;
      }
      if (!candidate || typeof candidate.mount !== "function" || typeof candidate.destroy !== "function") {
        throw new TypeError("Session requires mount() and destroy()");
      }
      await candidate.mount();
      if (token !== generation || destroyed) {
        await dispose(candidate);
        return false;
      }
      const previous = current;
      current = candidate;
      candidate = null;
      await dispose(previous);
      return true;
    } catch (error) {
      if (candidate) {
        try { await dispose(candidate); } catch (cleanupError) { onError(cleanupError); }
      }
      if (token === generation && !destroyed) {
        try { onError(error); } catch { /* diagnostics cannot block gameplay */ }
      }
      return false;
    }
  }

  async function hide() {
    ++generation;
    const previous = current;
    current = null;
    await dispose(previous);
  }

  async function command(name, ...args) {
    if (destroyed || !current || typeof current[name] !== "function") return false;
    await current[name](...args);
    return true;
  }

  async function destroy() {
    if (destroyed) return;
    destroyed = true;
    await hide();
  }

  return Object.freeze({
    show, hide, destroy,
    pause: () => command("pause"),
    resume: () => command("resume"),
    seek: ms => {
      if (!Number.isFinite(ms) || ms < 0) throw new TypeError("seek time must be finite and non-negative");
      return command("seek", ms);
    }
  });
}
