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

The original bundle was read as a Git blob: `index.html` Git blob `db83f1d7bf8b5b457a82f6cd5c4f06fa14299b23`. Its `Gt` character table has 13 records, and its `an` array has 18 scene records with explicit place labels and image variables. Those references and aliases are catalogued below. The images are data URIs inside the monolithic source, not standalone production files. The original zero-based saved `sceneIdx` remains separate from each scene array's one-based `id`.

The G0 map remains a **proposed presentation mapping**, not a replacement for original `sceneIdx`. Where G0 labels differ from the original array, this inventory uses source labels from `an` and retains the G0 chapter only as a cross-reference.

## Character inventory

### Character records found in the original `Gt` table

The production source contains 13 character records and 9 distinct image variables. These are read-only catalog IDs based on the source `id` values. They are not save keys.

| Proposed ID | Original source ID | Display name / role | Embedded portrait ref | Repeat / notes |
|---|---|---|---|---|
| `char.ryan` | `ryan` | ريان — البطل، 16 سنة | `S7` (WebP data URI) | Shared with Hadi and Karim |
| `char.sara` | `sara` | سارة — الأم | `UA` (WebP data URI) | Shared with Mariam |
| `char.lina` | `lina` | لينا — الأخت، 8 سنوات | `_A` (WebP data URI) | Shared with Yasmin |
| `char.salim` | `salim` | سليم — الصاحب الذكي | `$A` (WebP data URI) | One source ref |
| `char.mansour` | `mansour` | عم منصور — الجندي القديم | `fz` (WebP data URI) | One source ref |
| `char.noor` | `noor` | القائدة نور — قائدة البوابة، 29 سنة | `nz` (WebP data URI) | Trust key is `nour`; preserve as an alias |
| `char.youssef` | `youssef` | الأب يوسف — طبيب المستشفى، 42 سنة | `MH` (inline SVG data URI, 320×400) | Trust key is `father`; alias الأب |
| `char.elias` | `elias` | إيلاس — الغامض المقنّع | `vz` (WebP data URI) | One source ref |
| `char.amin` | `amin` | أمين — الناجي من وراء السور، 23 سنة | `G8` (inline SVG data URI, 240×300) | One source ref |
| `char.mariam` | `mariam` | مريم — المهندسة، 17 سنة | `UA` (WebP data URI) | Shared with Sara |
| `char.hadi` | `hadi` | عم الهادي — حارس الأرشيف، 62 سنة | `S7` (WebP data URI) | Shared with Ryan and Karim |
| `char.yasmin` | `yasmin` | ياسمين — اليتيمة، 10 سنوات | `_A` (WebP data URI) | Shared with Lina |
| `char.karim` | `karim` | القائد كريم — قائد المجموعة الثانية، 35 سنة | `S7` (WebP data URI) | Shared with Ryan and Hadi |

The source also has a name-label map whose trust keys and display aliases do not always match character IDs (for example `noor` / `nour`, `youssef` / `father`). Preserve those as aliases; never silently rename the original save keys. Three groups use the same portrait variable for multiple records: `S7` = Ryan/Hadi/Karim, `UA` = Sara/Mariam, and `_A` = Lina/Yasmin. This is confirmed source reuse, but intent (shared identity, placeholder, or accidental reuse) is not documented, so it is not labeled a defect.

### Other roles without a dedicated `Gt` record

The original scene dialogue and interaction text mention incidental people (including an older woman, a lost child, refugees, market residents, guards and patients). The current `Gt` table has no dedicated character record or separate portrait reference for these roles. Record them under an explicit role/ensemble ID only if a future extraction needs one; do not invent individual portrait IDs from dialogue mentions.

### Existing image, expression and movement variants

- **Portrait files in production:** each character record points to one image variable in the monolithic source. Seven refs are WebP data URIs and two refs (`MH`, `G8`) are inline SVGs. No standalone production portrait files or alternate portrait sheets exist in the tracked tree. The shared portrait refs above are the only repeated character-image references observed.
- **Base portrait effects in original CSS:** `.stage-slide` enters over 0.4 s; `.stage-breath` scales gently on a 5.4 s cycle; `.stage-blink` applies a brief brightness dip around 94% of a 5.2 s cycle. The speaking portrait receives a border/highlight (`.stage-speaking`); the listening portrait dims (`.stage-listening`).
- **Android build presentation effects:** `scripts/prepare-web.cjs` applies idle breathing (4.8 s), grief when `.tear-drop` is present (3.8 s), tension on `.expression-shake` (0.65 s), and a memory/light variation when `.candle-flame` is present (6.2 s). Reduced-motion mode disables the added movement. These are CSS treatments over the same portrait, not alternate image files.
- **Scene backgrounds:** the pilot cinematic code adds slow drift (26 s) to the detected active background and a short transition when its URL changes. This is a camera/presentation effect, not a new background asset.
- **PR #21 lab characters:** Ryan, Lina and Nour each have one static SVG silhouette; those files contain simple fixed face shapes and no separate blink frame, expression sheet, hand-gesture frame or clothing/pose variant. The lab HTML adds CSS idle breathing/bobbing while playing. The G2 brief's blink/gesture requirements are future acceptance items, not included art variants.

## Place and background inventory

The following rows pair each original `an` record with its one-based scene `id`, zero-based legacy `sceneIdx` (= id − 1), G0 display chapter and exact image variable. A variable repeated in several rows is the same embedded image reference, not a separately stored variant.

| `sceneIdx` | Scene / place from original source | G0 display chapter | Proposed place ID | Embedded background ref |
|---:|---|---:|---|---|
| 0 | 01 — الدار — قرطاج | 01 | `loc.home` | `N8` (WebP data URI) |
| 1 | 02 — سوق قرطاج — الصباح | 03 | `loc.market` | `ht` (WebP data URI) |
| 2 | 03 — السور العظيم — لحظة الكسر | 05 | `loc.wall` | `s8` (WebP data URI) |
| 3 | 04 — شارع النار — الهروب | 06 | `loc.fire-street` | `Wt` (WebP data URI) |
| 4 | 05 — دار عم منصور — الجندي القديم | 07 | `loc.mansour-house` | `C7` (WebP data URI) |
| 5 | 06 — المستشفى — الدخان والجرحى | 08 | `loc.hospital` | `E7` (WebP data URI) |
| 6 | 07 — الجسر — فوق النهر | 09 | `loc.bridge` | `F8` (WebP data URI) |
| 7 | 08 — البوابة — مكسورة، نار، عمالقة في البعيد | 12 | `loc.gate` | `n9` (WebP data URI) |
| 8 | 09 — العبور — ما وراء السور | 13 | `loc.crossing` | `I7` (WebP data URI) |
| 9 | 10 — الغابة — ضباب وظلال | 15 | `loc.forest` | `uz` (WebP data URI) |
| 10 | 11 — السهول المحطمة — الحقيقة الكبرى | 17 | `loc.plains` | `lz` (WebP data URI) |
| 11 | 12 — القرية المخفية — غابة زغوان | 18 | `loc.hidden-village` | `uz` (same as scene 10) |
| 12 | 13 — المختبر القديم — تحت قرطاج | 20 | `loc.laboratory` | `I7` (same as scene 8) |
| 13 | 14 — أطلال قرطاج — الرجوع للبوابة | 23 | `loc.ruins` | `lz` (same as scene 10) |
| 14 | 15 — ساحة قرطاج — ما بعد الحقيقة | 25 | `loc.square` | `lz` (same as scene 10) |
| 15 | 16 — الميناء البونيقي — البناء | 28 | `loc.punic-harbor` | `I7` (same as scene 8) |
| 16 | 17 — هضبة بيرصا — قرطاج الجديدة | 35 | `loc.byrsa-plateau` | `lz` (same as scene 10) |
| 17 | 18 — هضبة بيرصا — الغروب | 36 | `loc.byrsa-plateau` | `lz` (same as scene 10; same source ref) |

There are 18 scene records but only 11 distinct background image variables. Source reuse groups: `I7` is used for crossing, laboratory and harbor; `uz` for forest and hidden village; `lz` for broken plains, ruins, square and both Byrsa endings. Scene 17 has a sunset place label but the source points to the same `lz` data URI as scene 16; no separate sunset image variant is present in `an`. These repeated refs are confirmed in the original source. Do not delete or duplicate them until an art review determines whether they are intentional reuse or placeholders.

The ID `loc.crossroads` is reserved for the PR #21 pilot only. Its background is declared `procedural:crossroads` and drawn in the lab HTML with CSS sky, sun, hills, ground and road; it is not an original production scene.

### Production visuals embedded in the original bundle

- `Gt`: 13 character records, 9 distinct image variables (7 WebP data URIs and 2 inline SVG data URIs); repeated portrait refs are listed above.
- `an`: 18 scene records, 11 distinct WebP background variables. The per-scene mapping is listed above.
- The image variables are stored in the monolithic `index.html`, not as separately tracked production files. The source blob is `db83f1d7bf8b5b457a82f6cd5c4f06fa14299b23`. The source does not provide author, external source URL or license metadata for these embedded images.
- Repeated background refs are source-level reuse in several scene records, not unreferenced files. This inventory cannot infer whether reuse is artistic intent or a placeholder.

### Pilot SVGs

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

**Still unverified:** pixel dimensions and decoded SHA-256 per embedded production image; whether shared character portraits and repeated scene backgrounds are deliberate or placeholders; and the original author/source/license of production art. The G2 brief calls the six pilot SVGs original lightweight silhouettes, but no per-file license/author statement is checked in. Treat them as project-created per brief, lab-only, with formal license unspecified until recorded.

No production visual is labeled “unused” by this inventory: every source character record and scene record points to an image variable. No exact duplicate files exist among the separate pilot art in one reviewed branch.

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
| Original character portraits | `Gt` records in production `index.html`; seven WebP data URIs and two inline SVG data URIs referenced by 13 characters | Original author/source/license not recorded; pre-existing production use is not proof of a reusable license |
| Original scene backgrounds | `an` scene array in production `index.html`; 11 WebP data URIs referenced across 18 scenes | Original author/source/license not recorded; repeated refs are source-level reuse, not separate files |
| Six pilot SVGs | First tracked in PR #21 under `examples/assets/`; G2 brief requests original lightweight SVG silhouettes | Lab-only; brief supports project-created intent, but no explicit per-file license/author line; do not treat as cleared production art |
| CSS crossroads environment | Written in `examples/qarton-single-load-lab.html` for the pilot | Repository-authored lab code; no external media source identified |
| Background manager fallback gradients | `fix/qarton-background-manager` branch runtime code | Code-generated fallback, not a reusable background asset; no external image source |

Pilot Git blob IDs above are content identifiers, **not** SHA-256 checksums. The production image data URIs need a decode step to record each image's SHA-256 and pixel dimensions before any release or migration.

## Reviewed organization outcome and next gate

The current layout should remain unchanged. This inventory is the read-only prerequisite. Next, confirm names/aliases and production art references against the original bundle in a source-readable review; then approve the ID registry and a provenance manifest. Only after that should a separate, reversible extraction PR be considered, with all file usages mapped and production/save behavior covered by the existing gates.
