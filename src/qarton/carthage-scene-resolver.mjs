/**
 * Resolve game-owned scene IDs to presentation-only packages.
 * The manifest is explicit and inert: it cannot access gameplay state,
 * localStorage, navigation or any of the Carthage save handlers.
 */
export function createCarthageSceneResolver(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new TypeError("A scene manifest object is required");
  }
  const entries = new Map();
  for (const [id, definition] of Object.entries(manifest)) {
    if (!id.trim() || !definition || typeof definition !== "object" || Array.isArray(definition)) {
      throw new TypeError("Scene manifest entries must be non-empty objects");
    }
    entries.set(id, structuredClone(definition));
  }
  return async function resolveScenePackage(snapshot) {
    if (!snapshot || typeof snapshot.sceneId !== "string") return null;
    const definition = entries.get(snapshot.sceneId);
    if (!definition) return null;
    // Always return a private copy so the engine cannot mutate the manifest.
    return structuredClone(definition);
  };
}
