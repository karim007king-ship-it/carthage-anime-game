# QARTON G1/G4 — Save/resume decision acceptance matrix

**Status:** pre-integration acceptance plan. This is not a test report. No production save migration or story integration is authorized.

## Shared invariant

A committed choice is identified by **run + scene ID + choice group**. Resuming a saved decision must render the committed outcome without applying time, trust, evidence, custody, or consent a second time. These are proposed semantics for the future game-owned bridge, not fields to add to the original v1 save now. The original `sceneIdx` (0–17), `lineIdx`, nine ending keys, and legacy storage remain unchanged.

| Scenario | Precondition | Resume point | Required behavior | Blocker |
| --- | --- | --- | --- | --- |
| 02 family promise | `familySignal=knocks` or `mother` | before/after decision | Only the chosen signal persists; no duplicated effect | Future choice-once bridge |
| 02 old save | `familySignal` absent | start of 10 | `unknown` resolves to improvised rescue; no invented Sara or retroactive choice | Future old-save adapter |
| 04 escorted | `alleyFamilies=escorted` | start of 11 | Route eyewitness only; not an Elias forgery witness | Future conditional dialogue |
| 04 guided | `alleyFamilies=guided` | start of 11 | Delayed message; Salim not assumed present | Future presence checks |
| 04 bypass | no `alleyFamilies` | start of 11 | Uncertain outcome, no rescue credit | Future optional bypass |
| 10 warning | `smokeAftercare=warnNoor` | start of 11 | Noor remembers two guards; time and trust not reapplied | Future choice-once bridge |
| 10 help | `smokeAftercare=helpNearby` | start of 11 | Extra survivor is not a witness to Elias order | Future conditional dialogue |
| 11 seat | `lastSeat=yielded` | after seat, before holder | Seat decision retained; no sacrifice ending until explicit confirmation in 12 | Future independent confirmation |
| 11 holder | `manifestHolder=noor/salim/sara` | after holder | Preserve holder; never transfer due to later absence; no inventory duplication | Future custody group |
| 11 old save | no seat/holder flags | at gate | Neutral entry; no seat sacrifice or custody inferred | Future v1 adapter |
| 22 boat | first group committed | before Elias page | Do not replay boat cost; offer second group only if Elias is present | Future two-group checkpoint |
| 22 page | both groups committed | after page | Preserve scoped permission; do not invent an Elias statement | Future two-group checkpoint |
| 24 publication | authorized evidence only | hearing | Show only permitted names; equipment failure may use oral hearing | Editorial consent approval |
| 24 escrow | named custodian and review date | escrow | Do not expose confidential names through later display | Editorial consent approval |
| 27 bridge | `prioritizeBridge` | 29 and 31 | Same load allocation; separate key and care decisions | Future cross-scene state |
| 27 clinic | `prioritizeClinic` | 29 and 31 | Same allocation, no assumed delivery | Future cross-scene state |
| 27 split | `splitWithLimits` | 29 and 31 | Pedestrian-only bridge limitation preserved | Future cross-scene state |
| 27 unknown | old save lacks load choice | 29 and 31 | No retroactive credit or resource assignment | Future v1 adapter |
| 29/31 custody + triage | any authorized combination | after each group | Authorization and care are independent; carry unresolved requests to 34 | Future 27-combination matrix |
| 35/36 final | original end decision | gallery / new run | Rebuild and guardian remain distinct; gallery preview does not count as a run | Nine fresh-playthrough tests |

## Mandatory repetitions

- Repeat resume **twice** at every decision boundary; compare state, time, trust, consent and custody before/after.
- Repeat after changing among `tn/ar/en/fr`; display language must not change decision identity.
- Import a v1 save with `sceneIdx=4`; it must restore original Dar Mansour (display chapter 07), not the draft chapter 04.
- Repeat optional bypasses at 04, 19, 30 and direct-to-gate arrival with no chapter-10 smoke flag.
- Run 3 × 3 × 3 combinations of load, key authorization, and care decision (27 cases), plus unknown state.
- Run all nine endings **from a new playthrough**, not from gallery preview, including the exact `hero` boundaries (courage 70/time 5) and `secret` four-vs-five clue cases.

## Android acceptance after G4 implementation

Install and upgrade without package conflict or save loss; verify official intro, home → new game → original first scene, save/export/import, foreground/background, reduced motion, sound lifecycle, four-language settings and nine ending routes. Capture device/build/commit evidence. **None of these device tests have been executed by this document.**
