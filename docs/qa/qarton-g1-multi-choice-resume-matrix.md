# QARTON G1 — Draft multi-choice resume acceptance matrix

**Status:** proposal-only; PR #23; no production save writer, import parser, or runtime hook changed.

The legacy v1 save payload (`sceneIdx`, `lineIdx`, inventory, trust, flags) remains the authoritative game-owned record. Proposed G1 checkpoints, if approved later, require a separately versioned sidecar owned by the future runtime; **no sidecar implementation is authorized by this document**. An imported old save has no implied G1 decisions.

| Case | Entry | Required result | Acceptance proof still needed |
| --- | --- | --- | --- |
| A | Chapter 11, before seat choice | Seat group pending; custody group pending | Browser and Android replay |
| B | Chapter 11, seat chosen, before custody | Seat effect applied exactly once; custody remains pending | Save/reload with recorded event count |
| C | Chapter 11, both groups complete | No replay or duplicate trust/time changes | Repeat reload and back-navigation |
| D | Chapter 11, custodian absent | Present eligible custodian choices only; no fabricated custody | Character-presence permutations |
| E | Chapter 22, boat chosen, Elias present | Boat choice once; Elias page pending | Save/reload and event log |
| F | Chapter 22, boat chosen, Elias absent | Skip Elias page only; boat effect persists | Missing-character replay |
| G | Chapter 22, both groups complete | No duplicate boat allocation or testimony | Repeated resume/import |
| H | Old v1 save imported | All G1 decisions unknown, no auto-selected choices | Import byte-parity and resume |
| I | Corrupted / future sidecar | Fail closed; never overwrite legacy save or unlock Part III | Tamper tests and rollback |
| J | Part II resolution proposed light/shadow | No original ending granted by a preview; game-owned guard remains authoritative | Nine ending route playthroughs |
| K | Part III draft 34 handover | Returns to original legacy-17 then legacy-18; no synthetic sceneIdx | Real game navigation |

## Required future checkpoint semantics

- Stable checkpoint identity must include **draft chapter ID**, **choice group ID**, **selected choice ID**, and **schema version**; never use the display chapter number as a save index.
- Apply an effect only after an explicit user choice and durable commit; replay must be idempotent. Failure during a write must not yield a half-applied effect.
- A checkpoint is not proof of an external event: evacuation attempted is not evacuation confirmed, pending courier is not delivered, and a single radio receipt is not public publication.
- Conditional groups are resolved from **actual present-character state** at the decision boundary. A missing Elias cannot be resurrected by a restored checkpoint.
- Preserve original nine ending keys, Part III lock, dialogue and trust aliases (`nour`, `father`).

**Gate:** All rows require browser and Android acceptance before any production integration. Passing static manifest tests is not sufficient.
