# QARTON — Cross-review of L1, S1, G1 (2026-11-22)

**Verdict: inventory/editorial deliverables received; production integration NOT approved.** This report compares Draft PR #24 (L1), #25 (S1), #20 (G1), and organization policy on #23. No production file or save is changed.

## Evidence and coverage
- **L1 / PR #24:** one read-only report; 13 original character records, 9 base portrait refs, 7 distinct expression images, 18 scene records using 11 distinct background refs, 6 lab SVGs. Source images remain embedded in original index; licensing and decoded SHA-256 unresolved.
- **S1 / PR #25:** `catalogue.json`, `ui-source-inventory.json`, README; 18 original scenes, 134 dialogue/narrative lines, 54 hotspots, 42 choices, 9 ending keys, 848 indexed text keys and 73 duplicate groups. UI scan has 562 Arabic-bearing entries: 250 direct display, 287 contextual, 8 logic comparisons, 17 developer text. No localization runtime or translation parity CI yet.
- **G1 / PR #20:** 18 proposed new chapter manuscripts and canonical 36-chapter display map. Editorial review flags chapter 25 opening after shadow route, conditional chapter 11/22 and chapter 24/34 logic, and unverified reachability of all nine endings.

## Cross-team findings requiring resolution
1. **Character aliases:** L1 canonical `char.noor` maps to original source `noor` while trust save uses `nour`; `char.youssef` maps to `father`. S1 must preserve both source keys and aliases; translations cannot rename saved fields.
2. **Speaker inventory mismatch by design:** L1 has 13 character records; S1 counts 20 display speaker labels and 15 character-related entries. Resolve labels, narrators and incidental roles in a separate registry; do not equate counts or invent new portrait assets.
3. **Location registry:** L1 records 18 original scenes but only 11 unique background images; G1 proposes new shooting locations. Proposed G1 locations need `draft` scope, with no automatic reuse or claim that production art exists.
4. **Legacy index contract:** S1 and L1 original `sceneIdx=0..17`; G1's 36 display positions are presentation-only. Saved `sceneIdx=4` must continue to restore Dar Mansour, not display chapter 7 as an index.
5. **Nine endings:** S1 identifies nine ending keys, but narrative review states route reachability unverified; some endings have summary only rather than full dialogue scenes. Do not claim nine playable complete cinematic endings.
6. **Localization boundary:** S1 notes original text is also used for mood/audio and some save fields. Extract only presentation strings first; leave game logic, inventory and original saved text unchanged.
7. **Provenance:** L1 cannot establish rights for embedded art. Do not redistribute extracted assets or approve release until authorship/license is documented.
8. **CI:** No PR-head workflow runs were returned by the commit-specific PR-run lookup for #20, #24, #25; this is not proof of passing tests. Their reports are documentation and data, not Android runtime validation.

## Required follow-up owners
| Owner | Required deliverable | Release gate |
| --- | --- | --- |
| Luna / L1 | source/author/license ledger, decoded art SHA-256 and dimensions, reused-portrait/background review, reconcile G1 draft locations | asset provenance and exact reference mapping |
| Sol / S1 | validate 848-key catalogue and 562 UI entries against original source; flag context-sensitive strings and logic strings; define stable ID parity test and speaker aliases | no save key/choice effect changes |
| Astra / G1 | resolve chapter 25 shadow opening and conditional handoffs; route-by-route nine-ending reachability plan, confirm chapter/choice IDs against S1 and L1 | editor approval and branch/ending acceptance |
| GPT-6 / integration | publish unified immutable ID registry after owner reviews; add read-only schema/CI; deterministic build; host event; Android save/new-game tests | all tests green before integration |

## Integration order
1. Keep PRs #20/#24/#25 Draft; return review findings to owners.
2. Approve unified character, location, scene, choice and text IDs without changing original saves.
3. Build read-only manifests/schemas and validation tests in separate PR.
4. Only after G4 lifecycle and mobile acceptance, propose controlled production wiring.

**Status:** Audit complete at document/report level; follow-up work and runtime acceptance remain open.
