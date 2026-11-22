# QARTON L1 — Character and Background Inventory

**Status:** read-only inventory; IDs are proposed registry values for review, not runtime/save IDs.  
**Reviewed:** 2026-11-22.  
**Production baseline:** `main` at `094a1246a17923d4bb788d30c8e9c09b5db77cd2`.  
**Experimental scope:** Draft PRs #19–#23 and the character/background-focused branches listed below.  
**Guardrail:** no production source or save format changed; no art files moved or deleted.

## Review against PR #23 organization decisions

Reviewed [`docs/qarton-organization-decisions.md`](qarton-organization-decisions.md) on PR #23, together with its [content architecture](qarton-content-localization-architecture.md) and [migration checklist](qarton-content-migration-checklist.md).

L1 follows the decisions: keep story, characters, backgrounds and locales as independent content areas; leave the monolithic original game and save format untouched; treat PR #20 story additions and PR #21 lab art as proposals/experiments; inventory and trace references before any later move. This PR only adds this report. It does not create or wire runtime `characters/` or `backgrounds/` folders.

## Scope and evidence

| Revision/branch | What was reviewed for visual content |
|---|---|
| `main` | Tracked-file tree, original `index.html` (3,850,335 bytes; monolithic), `scripts/prepare-web.cjs`, `tests/smoke-test.cjs`, and the original-scene mapping documented by G0 |
| PR #19 | File tree; official home/intro changes do not add character or background artwork files |
| PR #20 | Draft narrative and G0 scene map, kept separate from production canon |
| PR #21 | G2 brief, scene JSON, lab HTML, and all six SVGs in `examples/assets/` |
| PR #22 | Audio lifecycle changes; same six visual SVG blobs as PR #21 |
| PR #23 | Organization decisions, asset notes, and tree; same six visual SVG blobs as PR #21 |
| `fix/qarton-background-manager` | Background discovery/load manager and cinematic scene transition scripts; no background art catalog |
| `refactor/qarton-cleanup-cinematic` | Character performance styles; no character art catalog |
| `feat/qarton-engine-adapter-pilot`, `feature/qarton-adapter-pilot` | Validation/resolver code and tests; no production art files |

The production tree has no separate character or background asset directory. The original game renders its story visuals from the bundled `index.html`; the build/runtime code recognizes rendered story imagery, but does not provide a file-by-file art registry. Therefore this pass can record the original 18 scene/place labels and visual behavior, but cannot claim a complete count, source URL, resolution, or hash for every production-rendered image from the repository manifest alone.

The G0 map is a **proposed presentation mapping**, not a replacement for original `sceneIdx` and not proof that each scene has a unique background image. Its proposed chapter locations are used below only to seed a reviewable place-ID registry.

## Character inventory

### Characters referenced by the original-scene mapping / narrative audit

The IDs below are stable authoring candidates based on the reviewed names. Confirm spelling, aliases, and actual source occurrence against the original `Gt` character table before connecting any content loader. IDs must never be used as save keys or substitute original indices.

| Proposed ID | Display name | Alias/source note | Production portrait / expression / movement evidence |
|---|---|---|---|
| `char.ryan` | ريان | Main character; G0 narrative audit identifies Ryan as 16 | Original story portrait is rendered from the monolith; separate source file and expression sheet not inventoried |
| `char.lina` | لينا | Named in original-scene mapping and pilot | Same production evidence limit; lab has one static silhouette, `examples/assets/lina.svg` |
| `char.yusuf` | يوسف | G0 narrative audit identifies him as Ryan’s father; proposed alias: `father` / الأب | No standalone production portrait file found |
| `char.salim` | سليم | Also transliterated Salim in G0 draft | No standalone production portrait file found |
| `char.elias` | إيلاس | Also appears as Elias in the draft audit | No standalone production portrait file found |
| `char.nour` | نور | Also transliterated Noor/Noor in draft material; choose one display transliteration, keep ID | One static lab silhouette: `examples/assets/nour.svg`; no separate expressions/poses |
| `char.mansour` | منصور | Uncle Mansour / عم منصور | No standalone production portrait file found |
| `char.amin` | أمين | Also transliterated Amin | No standalone production portrait file found |
| `char.maryam` | مريم | Also transliterated Maryam | No standalone production portrait file found |
| `char.hadi` | الهادي | Also transliterated Hadi | No standalone production portrait file found |
| `char.yasmin` | ياسمين | Also transliterated Yasmin | No standalone production portrait file found |
| `char.karim` | كريم | Also transliterated Karim | No standalone production portrait file found |

### Unresolved names and roles

| Candidate | Why held separately |
|---|---|
| `char.sarah` — سارة | Named in the draft audit’s opening scene; confirm whether this is the same person as the player’s mother before aliasing |
| `char.mother` — الأم | Dialogue refers to “أمي”; relationship/name mapping needs source confirmation |
| `char.father` — الأب | Relationship alias appears in the narrative audit; map to `char.yusuf` only after confirming the original character object |
| Unnamed woman, child, refugees, market residents and other incidental roles | Mentioned in draft summaries; no individually verified production portrait IDs |

### Existing image and motion variants

- **Production characters:** current source/build code targets existing rendered portraits through `.stage-slide .stage-breath`; it does not identify portraits by stable character ID or provide an asset manifest. The injected presentation pass describes idle breathing (4.8 s), grief when `.tear-drop` is present (3.8 s), tension on `.expression-shake` (0.65 s), and memory/light treatment when `.candle-flame` is present (6.2 s). Reduced-motion mode disables these portrait animations. These are presentation effects over existing imagery, not alternate image files.
- **Production scene image:** the cinematic pilot code can apply slow drift to a loaded dominant scene image (26 s) and a short transition when the background URL changes. This does not establish which character or location asset is being shown.
- **PR #21 lab characters:** Ryan, Lina and Nour each have one SVG silhouette. They contain simple fixed face shapes; no alternate expression, blink frame, hand gesture, clothing variant or pose sheet is present. The G2 brief describes breathing/gesture work as acceptance requirements; the checked-in art files themselves do not supply those variants. The HTML applies CSS idle bob/breathing while playing.
- **Motion and picture distinction:** CSS movement does not count as a new character image or background version. Do not duplicate an SVG merely to represent an animation state; future animation metadata should refer to the same character ID and be kept separate from the source artwork.

## Place and background inventory

The first 18 rows are the original-scene names as mapped by G0, in original-scene order. Place IDs are proposed authoring IDs. Art availability means a separate, attributable file was found in the reviewed trees; it does not assert that the original scene has no rendered art.

| Original `sceneIdx` | G0 display chapter / place label | Proposed place ID | Separate production background file / visual versions |
|---:|---|---|---|
| 0 | 01 — الدار | `loc.home` | No separate file in tracked production tree; versions unverified |
| 1 | 03 — سوق قرطاج | `loc.market` | No separate file; versions unverified |
| 2 | 05 — السور العظيم | `loc.wall` | No separate file; versions unverified |
| 3 | 06 — شارع النار | `loc.fire-street` | No separate file; versions unverified |
| 4 | 07 — دار منصور | `loc.mansour-house` | No separate file; versions unverified |
| 5 | 08 — المستشفى | `loc.hospital` | No separate file; versions unverified |
| 6 | 09 — الجسر | `loc.bridge` | No separate production file; lab-only `examples/assets/bridge.svg` |
| 7 | 12 — البوابة | `loc.gate` | No separate file; versions unverified |
| 8 | 13 — العبور | `loc.crossing` | No separate file; versions unverified |
| 9 | 15 — الغابة | `loc.forest` | No separate file; versions unverified |
| 10 | 17 — السهول | `loc.plains` | No separate file; versions unverified |
| 11 | 18 — القرية | `loc.village` | No separate file; versions unverified |
| 12 | 20 — المختبر القديم | `loc.laboratory` | No separate file; versions unverified |
| 13 | 23 — أطلال قرطاج | `loc.ruins` | No separate file; versions unverified |
| 14 | 25 — ساحة قرطاج | `loc.square` | No separate file; versions unverified |
| 15 | 28 — الميناء البونيقي | `loc.punic-harbor` | No separate file; versions unverified |
| 16 | 35 — هضبة بيرصا / الفجر | `loc.byrsa-plateau` | Same place ID as scene 17; proposed visual variant `dawn`, not independently verified |
| 17 | 36 — هضبة بيرصا / الغروب | `loc.byrsa-plateau` | Proposed visual variant `sunset`, not independently verified |

Do not infer 18 unique production backdrops from the 18 scene indices: G0 repeats Byrsa for the last two scenes, and the original tree does not split pictures into location files.

### Pilot-only background and place artwork

The PR #21 scene package names its background as `procedural:crossroads`. The lab HTML creates sky, sun, hills, ground and road with CSS gradients/shapes, not an image asset. It layers bridge, clinic and wagon SVGs over that generated scene. These are test-lab visuals and are not production background variants.

Proposed pilot place ID: `loc.crossroads` (scope: `examples/qarton-single-load-lab.html` only).

## File inventory, repetition and missing evidence

All six pilot SVG files have direct references from the lab HTML and are also listed in the scene JSON. None is an unreferenced/orphaned file in the reviewed PR #21 package.

| File | Role | Size | Git blob SHA | Repeated across reviewed PRs |
|---|---|---:|---|---|
| `examples/assets/ryan.svg` | Lab character | 669 B | `c3641d2` | PR #21, #22, #23: identical blob |
| `examples/assets/lina.svg` | Lab character | 514 B | `e225270` | PR #21, #22, #23: identical blob |
| `examples/assets/nour.svg` | Lab character | 565 B | `107a2f9` | PR #21, #22, #23: identical blob |
| `examples/assets/bridge.svg` | Lab location prop | 421 B | `d7ed589` | PR #21, #22, #23: identical blob |
| `examples/assets/clinic.svg` | Lab location prop | 478 B | `14283d6` | PR #21, #22, #23: identical blob |
| `examples/assets/wagon.svg` | Lab transport prop | 556 B | `1f46725` | PR #21, #22, #23: identical blob |

“Repeated across PRs” means the same tracked path/content occurs in each branch snapshot; it is not evidence of duplicate files in one checkout. Git reports identical blob objects, so there is no reason to delete or consolidate these files.

**Not found / incomplete, rather than declared missing:** a production character/background directory or manifest; individually attributable production images; a complete list of production scene image URLs and variants; character-ID-to-image mapping; alternate expression/pose artwork; image dimensions and SHA-256 values; source/license statements for the original production visuals; formal license metadata for the six lab SVGs. The PR #21 G2 brief calls for original, lightweight SVG silhouettes, but the repository does not include a per-file author/license statement. Treat provenance as project-created per brief but license as **unspecified** until recorded.

The original production images may be referenced or embedded inside the monolithic bundle. Their exact bytes, URLs, duplicates and non-use cannot be proven from the tracked file tree. No production art is labeled “unused” by this inventory.

## Stable ID proposal and safe folder shape

IDs are lowercase ASCII slugs with class prefixes: `char.<slug>` and `loc.<slug>`. Once approved, IDs are immutable and independent of spelling/localization, display order, `sceneIdx`, file paths and translated titles. Names and aliases belong in metadata/locales. Never write these IDs into the original save format as part of L1.

Future organization target (not created or wired by this PR):

```text
game-content/
  characters/
    manifest.json
    ryan.json
    lina.json
    ...
    assets/
      production/        # only after source, license and reference audit
      pilot/             # optional; or keep pilot art isolated under examples/
  backgrounds/
    manifest.json
    home.json
    market.json
    ...
    assets/
      production/
      pilot/             # or keep examples/assets as lab-only
```

Manifests should reference, not copy, media. Each record should keep: stable ID, canonical display key, aliases, scope (`production` / `pilot` / `draft`), source scene IDs, relative asset references, visual variant, dimensions, file SHA-256, author/source, license, approval state and verified use locations. Character records may list pose/expression references; background records may list day/night/damage/time variants. Neither record should contain story state or save effects.

No file should be moved until a repository-wide exact-path and content-reference search has been reviewed, including HTML/CSS/JS/JSON, build scripts, workflows and generated package rules. Then move one asset group in a separate PR, update every import, and compare the packaged output. This inventory has not performed or authorized such a migration.

## Source and licensing ledger

| Asset group | Source evidence | License / use status |
|---|---|---|
| Original production visuals | Runtime story visuals are part of or referenced by the `index.html` application; no standalone catalog or attribution ledger found in reviewed production tree | Source and license not recorded here; production use pre-exists, reuse/extraction needs a provenance review |
| Six pilot SVGs | First tracked in PR #21 under `examples/assets/`; G2 brief requests original lightweight SVG silhouettes | Lab-only; brief supports project-created intent, but no explicit per-file license/author line; do not treat as cleared production art |
| CSS crossroads environment | Written in `examples/qarton-single-load-lab.html` for the pilot | Repository-authored lab code; no external media source identified |
| Background manager fallback gradients | `fix/qarton-background-manager` branch runtime code | Code-generated fallback, not a reusable background asset; no external image source |

Git blob IDs above are content identifiers, **not** SHA-256 checksums. Compute and record SHA-256 plus dimensions from the exact files before any release or migration.

## Reviewed organization outcome and next gate

The current layout should remain unchanged. This inventory is the read-only prerequisite. Next, confirm names/aliases and production art references against the original bundle in a source-readable review; then approve the ID registry and a provenance manifest. Only after that should a separate, reversible extraction PR be considered, with all file usages mapped and production/save behavior covered by the existing gates.
