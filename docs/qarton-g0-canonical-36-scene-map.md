# QARTON G0 — Canonical 36-scene display map

**Status:** integration contract, not runtime data. Based on narrative branch drafts and the original `an` array inventory. Preserve original zero-based `sceneIdx` and all nine ending keys. The `legacy-NN` identifiers below are proposed adapter aliases, not verified exported game IDs.

| Display chapter | Proposed stable ID | Source | Name |
|---|---|---|---|
| 01 | `legacy-01` | original | الدار |
| 02 | `p1-family-promise` | new draft | الوعد |
| 03 | `legacy-02` | original | السوق |
| 04 | `p1-family-alley` | new draft | زقاق العائلة |
| 05 | `legacy-03` | original | السور |
| 06 | `legacy-04` | original | شارع النار |
| 07 | `legacy-05` | original | دار منصور |
| 08 | `legacy-06` | original | المستشفى |
| 09 | `legacy-07` | original | الجسر |
| 10 | `p1-smoke-door` | new draft | باب الدخان |
| 11 | `p1-gate-manifest` | new draft | قائمة البوابة |
| 12 | `legacy-08` | original | البوابة |
| 13 | `legacy-09` | original | العبور |
| 14 | `p2-relay-hut` | new draft | كوخ الإشارة |
| 15 | `legacy-10` | original | الغابة |
| 16 | `p2-names-consent` | new draft | إذن الأسماء |
| 17 | `legacy-11` | original | السهول |
| 18 | `legacy-12` | original | القرية |
| 19 | `p2-yasmin-drawing` | new draft | رسمة ياسمين |
| 20 | `legacy-13` | original | المختبر |
| 21 | `p2-last-signal` | new draft | الإشارة الأخيرة |
| 22 | `p2-protection-cost` | new draft | ثمن الحماية |
| 23 | `legacy-14` | original | الأطلال |
| 24 | `p2-truth-gate` | new draft | باب الحقيقة |
| 25 | `legacy-15` | original | الساحة |
| 26 | `p3-survivor-register` | new draft | سجل الناجين |
| 27 | `p3-single-load` | new draft | حمولة واحدة |
| 28 | `legacy-16` | original | الميناء |
| 29 | `p3-karim-key` | new draft | مفتاح كريم |
| 30 | `p3-house-without-number` | new draft | دار بلا رقم |
| 31 | `p3-medicine-cost` | new draft | ثمن الدواء |
| 32 | `p3-mark-on-stone` | new draft | علامة الحجر |
| 33 | `p3-hadi-hearing` | new draft | جلسة الهادي |
| 34 | `p3-key-handover` | new draft | تسليم المفتاح |
| 35 | `legacy-17` | original | بيرصا الفجر |
| 36 | `legacy-18` | original | بيرصا الغروب |

## Legacy index adapter

The original 18 scenes remain in their original array order. Proposed display mapping: `legacy sceneIdx 0..17` -> chapters `[1,3,5,6,7,8,9,12,13,15,17,18,20,23,25,28,35,36]` (display chapter numbers, 1-based). This mapping is presentation-only. Never persist a display chapter as `sceneIdx` and never infer that a missing new-scene flag means a scene was played.

## Save and navigation invariants

- `shiganshina-*` keys and original save fields remain unchanged. Add namespaced versioned cinematic progress only after migration tests and explicit approval.
- Original chapter-5 save (`sceneIdx=4`) must still restore original Dar Mansour (display chapter 07), not a new scene.
- New scenes require stable IDs, explicit eligibility and once-only choice effects. Legacy saves should use `unknown` defaults for absent new flags.
- Story presentation may render a new scene before the next original chapter but must not alter original progression/endings until an approved adapter provides the transition.
- The first cinematic pilot `p3-single-load` is a **standalone opt-in test scene** until Part III progression is correctly integrated; do not auto-unlock it in production.
- Nine original endings remain accessible; verify route reachability rather than assuming all nine were accessible in the old gameplay (the narrative audit flags several gaps).

## Pilot chapter 27 branch contract

`storyId=p3-single-load`; inputs `registryMethod`, `boatDecision`, `presentCharacters`; choice IDs `prioritizeBridge`, `prioritizeClinic`, `splitWithLimits`; outputs `supplyAllocation`, `bridgeRepair`, `clinicShelter`. Output table:

| Choice | supplyAllocation | bridgeRepair | clinicShelter |
|---|---|---|---|
| prioritizeBridge | bridge | started | improvised |
| prioritizeClinic | clinic | delayed | reinforced |
| splitWithLimits | split | footpathOnly | partial |

No path confirms rescued households, completed bridge, or fully restored clinic. Chapter 29 and 31 check outcomes; no double resource deduction on reload. Optional Karim/Yusuf require conditional presence or substitutes.

## Blocking integration checks

1. Identify actual `an` scene lifecycle and `rl → r6` choice path in the original bundle, then specify an event bridge without mutating React state externally.
2. Reconcile draft `docs/qarton-phase1-implementation.md` outdated insert titles against this canonical table; do not implement its placeholder «الإنذار / قافلة الجرحى / آخر مقعد» as additional chapters.
3. Verify source mapping and draft titles with narrative editor before integrating.
4. Complete intro hash discrepancy review and physical Android save upgrade testing.

**G0 status:** mapping proposed and documented, integration still gated.
