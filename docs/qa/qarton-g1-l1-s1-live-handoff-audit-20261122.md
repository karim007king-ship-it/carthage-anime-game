# QARTON — Live G1/L1/S1 handoff audit (2026-11-22)

**Scope:** Cross-PR read-only integration review on Draft PR #23. This report does not change production game, original story, save system, or any other PR. No merge is authorized.

## Source revisions checked

| Workstream | PR / head | Source | Status |
| --- | --- | --- | --- |
| G1 narrative / Astra | #20 `cc48f570c` | `docs/qarton-g1-editorial-review.md` | Draft |
| L1 visual inventory / Luna | #24 `51a344908` | `docs/qarton-l1-character-background-inventory.md` | Draft |
| S1 localization / Sol | #25 `f186843f4` | `docs/s1/README.md` | Draft |
| G4 / integration QA | #23 `18329ac14` before this audit | `docs/qa/qarton-36-chapter-android-acceptance-protocol-20261122.md` | Draft |

## Verified reconciliation and blockers

### 1. Localization snapshot drift — ACTION REQUIRED

G1 editorial review at #20 head reports **589 unique new-story text keys** after adding eight keys to the previous 581. S1 README at #25 head reports **583 new-story keys** based on Astra revision `c507bb3` and #23 revision `cb4127f`. Thus S1's expansion inventory is **six keys behind the current G1 total**. This is a comparison of documented totals, not yet a per-key diff; do not assume which six keys are missing. Re-run S1's chapter-key extraction against the current #20 head, compare exact key sets, identify added/removed/renamed IDs, and refresh coverage tests. Keep the original 848 Tunisian inventory keys and 562 UI source occurrences distinct from new-story keys.

**Gate:** exact new-story key-set parity between current G1 and S1, with zero collisions with original keys, before claiming translation coverage. The `ar/en/fr` values remain untranslated; a placeholder `null` is not a completed translation.

### 2. Character IDs — PROVISIONALLY ALIGNED

G1 and S1 both use the 13-character `char.*` registry proposed in #23 and L1. Preserve legacy `noor` / trust `nour`, and `youssef` / trust `father`. S1 narrator and elderly-woman are **roles**, not new portrait identities. L1 reports shared portraits for distinct named characters, so ID agreement does **not** prove correct visual identity.

**Gate:** resolve/approve shared-image identity assignments and any draft-only named roles before loading artwork in production.

### 3. Locations and art — NOT PRODUCTION READY

L1 documents visual requirements for all 36 display chapters and identifies P0 settings including smoke-door, gate queue, sea gate, survivor school, crossroads, and clinic. It reports unresolved creator/source/license evidence for existing production artwork and missing distinct assets for new locations. Existing embedded art must not be moved, deleted, or automatically reused across narratively distinct places.

**Gate:** approved provenance/license records, scene-specific location IDs, and Android decode/memory profiling; L1's 71.4 MiB all-raster decoded estimate is not a device measurement.

### 4. Narrative approvals — STILL OPEN

G1's 18 added chapters and 57 choice-effect rows are editorial drafts. G1 explicitly leaves editor approval pending for (a) continuation policy after the truth ending, (b) survivor scene vs gallery-summary contradiction, (c) chapter 22 boat/testimony timing and consent conditions, and (d) third-part eligibility. The nine original ending keys remain immutable; static route checks cannot establish actual gameplay reachability.

**Gate:** signed-off editorial decisions, then real new-game/resume playthroughs for all nine endings and branch-dependent attendance.

### 5. Save, runtime, and Android — NOT VERIFIED BY CROSS-PR DOCUMENTATION

The 36 display positions must not overwrite original `sceneIdx` 0–17, `lineIdx`, trust/flags, or existing saved text values. Chapters 11 and 22 have multiple choice groups; a partial checkpoint must apply each group's effects exactly once after reload. Chapter 30 is mandatory even when optional characters are absent. Pilot assets and static contracts are not proof that 18 new chapters run in the original Android WebView.

**Gate:** isolated integration build, original-save import/restore, multi-choice checkpoints, nine-ending real-playthrough coverage, four-locale UI behavior, and on-device performance. See `docs/qa/qarton-36-chapter-android-acceptance-protocol-20261122.md`.

## Immediate owners and sequence

1. **Sol / #25:** compare exact new-story keys against current Astra #20 head and report six-key documented-count drift; update tests only on #25.
2. **Astra / #20:** confirm final 589-key manifest, resolve editorial choices, publish explicit decisions without changing original endings.
3. **Luna / #24:** mark unresolved visual identity collisions and P0 art/provenance blockers; no unlicensed asset promotion.
4. **GPT-6 / #23:** keep read-only QA, cross-check new source revisions, prepare isolated acceptance tests; do not change the production runtime or merge Draft PRs.

**Current decision:** NO-GO for production merge or declaring 36-chapter Android completion. GO for independent Draft reviews and isolated test preparation.
