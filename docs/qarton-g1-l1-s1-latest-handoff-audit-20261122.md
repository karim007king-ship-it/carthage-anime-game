# QARTON — Latest G1 / L1 / S1 handoff audit (2026-11-22)

Scope: read-only cross-review of draft PR #20 (Astra), #24 (Luna), #25 (Sol) against draft PR #23. This document does not authorize merging, modifying the legacy runtime, or treating proposed content as approved production data.

## Confirmed handoffs

- G1 has 18 new chapter manuscripts and a 36-display-chapter plan. Its editorial review reports 57 choices and proposed balance caps of 8, 11 and 16 additional time units across parts 1–3; these remain editorial candidates, not runtime-approved costs.
- L1 maps all 18 new chapter visual requirements, including P0 smoke-door, gate queue, sea gate, survivor school, crossroads, clinic and hearing yard. Its reuse and image-identity assumptions remain unapproved; production art provenance/licenses remain unverified.
- S1 indexes 848 original Tunisian text values and 562 UI text occurrences, and explicitly protects legacy inventory values, scene names, choice history and other text-derived logic. ar/en/fr translations are not completed.
- PR #23 has draft chapter contracts, pure draft checkpoint/resume inspection and static continuity checks. Neither successful CI nor a draft manifest demonstrates on-device save restoration or actual ending reachability.

## Cross-team discrepancies requiring reconciliation

1. **G1/S1 new text-key counts:** latest G1 editorial report says 589 unique new keys, while S1's chapter-key report documents 583 keys against an earlier G1 revision. The two snapshots are not equivalent. Before generating locale packs, compare actual key sets by ID and manuscript revision; classify missing, retired and renamed keys. Do not silently renumber or infer that the six-key difference is the complete delta.
2. **Draft locations versus production art:** G1 location names and L1 candidate loc.* IDs are proposals. The current 17 original location IDs are stable, but no new background should be auto-aliased to an original background on geographic similarity alone.
3. **Identity and legacy aliases:** char.noor is associated with legacy trust key nour; char.youssef with father. S1's narrator/elderly-woman role IDs are not named-character art approvals. Avoid fabricating portraits for unnamed witnesses.
4. **Narrative ending acceptance:** G1 still requests editorial decisions on continuation after the truth gate, survivor gallery-versus-scene inconsistency and eligibility to start part 3. Keep all nine original endings unchanged until a real-playthrough acceptance matrix is signed off.
5. **Save safety:** original sceneIdx 0–17 and stored Tunisian strings must remain untouched. The chapter 11 seat/custody and chapter 22 boat/conditional Elias groups need real reload and one-time-effect tests; PR #23's pure resume planner is only a draft model.
6. **Release blockers:** art provenance and permission, complete translations, browser/device rendering and memory measurements, real nine-ending routes, APK in-place update with preserved saves.

## Proposed next gates

- G1 and S1 reconcile actual key lists (not just counts) and submit an additive/retired key report; keep Tunisian originals immutable.
- L1 submit production asset license/provenance evidence and mark P0 visual gaps separately from lab-only graphics.
- G1 editorial owner decide truth-gate continuation, survivor wording and hard-mode costs.
- GPT-6 verify schema/locale/ID alignment in isolated tests, then prepare a **separate opt-in prototype** for resume and presentation tests, with no production save access.
- Only after those gates: Android playthrough, nine-ending reachability, save import/reload, Part III lock and signed APK upgrade verification.

All referenced PRs must remain Draft. No merge is requested.
