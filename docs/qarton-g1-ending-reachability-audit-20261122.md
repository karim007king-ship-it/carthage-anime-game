# QARTON G1 — Ending reachability and narrative continuity audit

**Status:** editorial/technical review only; no runtime integration. Sources: Astra PR #20 `docs/qarton-g1-routes.md`, original source audit, S1 inventory, and the 36 draft chapter contracts in PR #23.

## Important distinction
The nine ending keys exist in the original gallery, but this **does not** establish nine reachable endings from a fresh playthrough. Astra's source audit reports five local action-to-ending routes, and four ending keys represented by summaries without corresponding original choice routes. These claims require full playthrough tests before any production approval.

| Ending | Original source audit | Proposed G1 acceptance | Gate |
| --- | --- | --- | --- |
| `hero` | `gateOpenAlone` at original gate; gate search bypasses choice lock | At display 12 require protected Lina, saved father, helped Mansour, courage >70, time >5; test boundary 70/5 | **Open:** original lock bypass must be resolved without changing save schema |
| `survivor` | `gateWithMansour`; original text differs on Lina/Mansour presence | Confirm gate crossing, account for actual presence; no unverified fate | **Open:** reconcile contradictory narrative lines |
| `sacrifice` | Six-line ending scene but no confirmed original action | `lastSeat=yielded` at 11 permits independent confirmation at 12; declining preserves gate options | **Open:** new explicit route and once-only confirmation |
| `traitor` | Gallery key, no confirmed original action; listening to Elias goes to secret | Explicit close-gate decision with Elias after informed choice | **Open:** distinguish investigation from betrayal |
| `secret` | `gateListenElias`; original gate handler bypasses five-clue lock | Require `crack,alley,stone,oldmap,file` and explicit confirmation at 12 | **Open:** test four vs five clues, lock bypass |
| `light` | Summary; publication choices not mapped to ending | Authorized public hearing at 24, oral fallback if equipment fails | **Open:** evidence consent and end trigger |
| `shadow` | Summary; concealment choices not mapped to ending | Named escrow custodian and review deadline at 24; later reversal tracked | **Open:** authorization and end trigger |
| `rebuild` | `finalRebuild2` at original 18; no enforced Amin trust lock | Civic responsibility at 35, final choice at 36 | **Open:** narrative consistency with trust hint |
| `guardian` | `finalGuardian2` at original 18 | Final watch duty at 36 regardless of earlier council exploration | **Open:** ensure both final options remain possible |

## Cross-chapter dependencies

1. **02 → 10 → 32:** `familySignal=knocks|mother|unknown` maps to `smokeRescue=knocks|mother|improvised`; missing Sara must not materialize her. A 32 flashback must not claim the family signal caused rescue when rescue was improvised.
2. **04 → 11:** `alleyFamilies=escorted|guided|unknown` yields respectively eyewitness of the route, delayed message, or no verified witness. None proves who crossed Elias's name off the manifest.
3. **10 → 11:** `smokeAftercare=warnNoor|helpNearby|missing` yields guard warning, extra survivor with limited knowledge, or no additional witness. A rescued person cannot testify about the Elias order without independent evidence.
4. **11 → 12:** `lastSeat=yielded` is **eligibility only**, not a terminal ending. The holder group `keepWithNoor|entrustSalim|entrustSara` must be decided separately and conditioned on actual presence; no inventory item is created.
5. **16 → 21 → 23 → 24:** consent, transmission and evidence scope must be checked before a `light` public hearing; escrow ownership and review deadline must be checked before `shadow`.
6. **22 → 23 → 24:** boat and Elias-page choices are independent once-only groups; absent Elias does not create a statement. A return/reload cannot reapply time, trust, custody or consent.
7. **27 → 29 → 31 → 34:** `prioritizeBridge|prioritizeClinic|splitWithLimits|unknown` must propagate without retroactive attribution. Key authorization and medical triage remain independent; open requests are carried forward, not rewritten.
8. **35 → 36:** the original two final options `rebuild` and `guardian` must remain reachable regardless of draft custody variants; Part III lock remains unchanged.

## Mandatory runtime acceptance (not yet executed)

- Nine **fresh-playthrough** ending tests, not gallery previews; boundary cases for hero and secret.
- Save/resume before and after each choice group in 11 and 22, and missing-state import for original v1 saves.
- Optional chapter bypasses 04, 19 and 30, and direct arrival at gate without a played smoke-door rescue.
- Every conditional speaker must be gated by presence; old saves must never gain inferred flags or achievements.
- Confirm original ending content and any contradictions in a story editor review; preserve the original text until approved.
- G4 bridge must be game-owned and default OFF; no change to original `sceneIdx`, legacy storage or `index.html` during this review.

**Decision:** editorial contract coverage is complete, but nine-ending runtime reachability is **not verified**. Do not merge content into production until these gates pass.
