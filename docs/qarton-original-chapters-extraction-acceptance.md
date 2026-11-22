# QARTON — Original 18 chapter extraction acceptance

- Source: Sol S1 catalogue, PR #25, original source blob `db83f1d7bf8b5b457a82f6cd5c4f06fa14299b23`.
- Extracted: `game-content/story/chapters/legacy-01.json` through `legacy-18.json`.
- Each chapter retains S1 original fields (including `after`, `timed`, all dialogue references, hotspots, choice IDs and effect objects), plus draft-only display chapter and L1 location/background metadata.
- Automated `tests/qarton-s1-source-parity-test.cjs` requires all 18 files, exact structural parity with the pinned S1 scene snapshot, and exact L1 background crosswalk.
- **Important:** The snapshot is pinned to a source blob and is not a runtime translation dictionary. The 848 source text keys and actual Tunisian strings remain in S1's catalogue until the localization extraction is reviewed and approved. This stage does not claim text values were migrated.
- No runtime wiring, source assets moved, save keys modified, or PR merged.

## Remaining gates
1. Green CI at current PR #23 head.
2. Review S1 text value extraction and source-to-locale parity without changing original Tunisian text.
3. Compare G1 draft 18 new chapters against route/ending acceptance gates.
4. Art provenance and image rights; browser and Android restore/ending acceptance.
