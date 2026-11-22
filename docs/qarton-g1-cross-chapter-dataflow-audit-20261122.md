# QARTON G1 — Cross-chapter static dataflow and legacy save audit

**Scope:** PR #23 draft-only manifests, 18 original plus 18 proposed display chapters. No runtime migration or live playthrough was performed.

## Verified contract boundaries

- Original 18 chapters retain `sceneIdx` 0–17. Proposed 18 have `legacySaveIndex: null` and `runtimeIntegrated: false`.
- Display order is 1–36, and chapter 34 hands back to `legacy-17`, then `legacy-18`; display chapter number is never a save index.
- Choice effect keys are checked against declared outputs for the 14 newer schema contracts. The four earlier part-one contracts have legacy draft schema variants and need explicit normalization before any runtime integration.
- Canonical character registry uses `mariam`, not `maryam`. Six draft character lists were corrected without changing dialogue or trust keys.
- Chapter 22 has two independent decision groups; reload after the first group must not replay its effects.

## Explicit external / unresolved input provenance

| Input | Current static treatment | Runtime acceptance requirement |
| --- | --- | --- |
| `presentCharacters` | External game state | Verify presence against actual saved story flags; no absent character may speak |
| `legacyInventory` | External legacy inventory | Read-only mapping; never add new legacy item names automatically |
| `routeSafety` | External conditional route | Verify actual route evidence; do not infer safe passage |
| `signalDevice` | External conditional device | Broken device requires explicitly selected fallback, never a successful radio transmission |
| `noorManifest` | External document provenance | Require actual custody and consent; missing paper remains unknown |
| `smokeRescue` | External original-scene outcome | Confirm original smoke-door source flags before any dependent chapter runs |
| `familySignal`, `alleyFamilies` | Earlier proposed Part I choices | No inferred choice when importing a legacy v1 save |

These external names are **whitelisted for static audit only**. The whitelist is not proof that the production runtime exposes a corresponding safe API.

## Remaining blockers

1. Editorially approve all 18 decision contracts, guards, timing and missing-character branches; distinguish per-choice effects from outcomes needing later evidence.
2. Normalize four early draft schema variants without changing original source text, story events or save payloads.
3. Prove once-only choice group checkpoints on reload, including chapter 22 and chapter 11.
4. Validate legacy save v1 import/resume and the original Part III lock against actual production runtime.
5. Verify all nine endings by separate playthroughs; static ending-key tests are insufficient.
6. Confirm L1 location/art licenses, localized text coverage and Android behavior before integration.

**Decision:** Keep feature OFF, PR Draft, production untouched. Do not merge based solely on green Node tests.
