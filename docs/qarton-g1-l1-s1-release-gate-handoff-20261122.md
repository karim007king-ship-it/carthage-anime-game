# QARTON — Release-gate handoff after draft presentation tests (2026-11-22)

**Scope:** PR #23 only, Draft, no production runtime/save/ending changes.

## Verified baseline

- GitHub Actions run `45038679995` succeeded for commit `9b2b9c0` (draft asset and locale readiness tests).
- PR #20 (G1 Astra) head `cc48f570cddb`, PR #24 (L1 Luna) head `51a344908bd6`, PR #25 (S1 Sol) head `f186843f4286` when checked on 2026-11-22. All remain Draft.
- 18 new chapters are `draft-not-runtime`, without legacy save indices. Their 583 unique text markers are absent from the original `tn.json` locale catalogue. The 848 original locale keys remain a separate namespace.
- 13 canonical original characters, 17 legacy location IDs. New draft characters and backgrounds are not approved for production by registry membership alone.
- Read-only adapters normalize character and location references and refuse unknown IDs, unknown character presence and unapproved artwork. Full 18-chapter static presentation-boundary tests passed.

## Owner handoffs (no automatic cross-PR edits)

### Astra — G1 / PR #20

1. Reconcile editorial count `589` with the **583 directly observed chapter manuscript markers**, documenting whether six IDs exist outside the 18 chapter manuscripts or whether the report count needs correction. Do not add artificial markers.
2. Resolve pending time/trust costs and continuity decisions for chapters 11, 22, 24, 27 and 34; ensure optional witness attendance never silently creates evidence.
3. Keep the nine original ending conditions and legacy scene text untouched; publish an editorial signoff checklist.

### Luna — L1 / PR #24

1. Provide explicit scene-to-background and character-to-expression mapping for all 18 proposed chapters, using approved canonical IDs.
2. Distinguish `existing`, `reuse-proposed`, `missing`, `license-unverified`, and `approved`; do not mark an asset approved without documented source/license.
3. Prioritize smoke-door, gate-queue, sea-gate, survivor-school, crossroads, clinic and hearing-yard; audit Android memory/decode cost and cleanup.

### Sol — S1 / PR #25

1. Verify `docs/s1/locales/chapter-keys.json` against the current G1 manuscripts (583 observed markers; zero missing or stale in prior direct comparison). Re-run after any G1 editorial changes.
2. Prepare `tn` source strings for each draft marker and track `ar`, `en`, `fr` completion independently; never infer that source key existence means translation is complete.
3. Preserve original save, inventory and trust keys (`nour`, `father`) and do not translate story logic or original dialogue.

## Integration gates before a production proposal

- All three owners sign off on IDs, source text, visual rights and content continuity.
- Opt-in pilot renderer must be isolated from production and pass device tests for Android memory, pause/resume, scene navigation, chapter 11/22 partial-choice restoration and original nine ending routes.
- Signed APK in-place upgrade and preservation of existing save data must be verified on an actual Android device; CI packaging alone is not sufficient.
- PR #23 remains Draft; no merges without explicit approval.
