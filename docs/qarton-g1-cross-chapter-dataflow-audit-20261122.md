# QARTON G1 — Cross-chapter static dataflow and legacy save audit

**Scope:** PR #23 draft-only manifests, 18 original plus 18 proposed display chapters. No runtime migration or live playthrough was performed.

## Verified contract boundaries

- Original 18 chapters retain `sceneIdx` 0–17. Proposed 18 have `legacySaveIndex: null` and `runtimeIntegrated: false`.
- Display order is 1–36, and chapter 34 hands back to `legacy-17`, then `legacy-18`; display chapter number is never a save index.
- Choice text keys and choice effect keys are now checked against declared text/output lists for **all 18** proposed chapter contracts, including four normalized early Part I manifests. This is static metadata consistency, not runtime state application.
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
| `smokeRescue` | Declared output of proposed `p1-smoke-door` (not assigned by its two choice effects) | Confirm original smoke-door source flags and how the draft output is computed; a declared output is not a proven value |
| `familySignal`, `alleyFamilies` | Declared effects of earlier proposed Part I choices | Verify the earlier choice was actually made; no inferred choice when importing a legacy v1 save |

Only `presentCharacters`, `legacyInventory`, `routeSafety`, `signalDevice`, and `noorManifest` remain on the **static external-input allowlist**. The other three keys must resolve to earlier draft producers. An output declaration alone does not guarantee a runtime value. The allowlist is not proof that production exposes a corresponding safe API.

## Remaining blockers

1. Editorially approve all 18 decision contracts, guards, timing and missing-character branches; distinguish per-choice effects from outcomes needing later evidence.
2. [x] Normalize four early draft `choiceTextKeys` and `outputs` declarations without changing original source text, story events or save payloads. [ ] Editorially verify missing conditional output values (notably `smokeRescue`) and all optionality semantics.
3. Prove once-only choice group checkpoints on reload, including chapter 22 and chapter 11.
4. Validate legacy save v1 import/resume and the original Part III lock against actual production runtime.
5. Verify all nine endings by separate playthroughs; static ending-key tests are insufficient.
6. Confirm L1 location/art licenses, localized text coverage and Android behavior before integration.

**Decision:** Keep feature OFF, PR Draft, production untouched. Do not merge based solely on green Node tests.

## Static provenance hardening — 2026-11-22

- CI run `45021310096` passed the uniform choice/output contract on commit `cc895e7c0`.
- CI run `45021659528` passed stricter input provenance and chapter display-order checks on commit `faf761b6a`.
- `familySignal` now resolves to chapter 2 `p1-family-promise`; `alleyFamilies` to chapter 4 `p1-family-alley`; `smokeRescue` to chapter 10 `p1-smoke-door`. This is declaration order only, **not** proof that a value is present after a conditional choice or when loading an older save.
- Chapter 30 `optional:true` currently describes an entire draft chapter despite a 36-chapter display sequence. Whether only Yasmin's participation is optional is an **editorial decision pending manuscript confirmation**; do not silently change scene routing or the test assertion.
