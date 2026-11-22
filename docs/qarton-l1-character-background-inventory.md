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
| `ryan` | `ryan` | ريان — البطل، 16 سنة | `S7` (WebP data URI) | Shared with Hadi and Karim |
| `sara` | `sara` | سارة — الأم | `UA` (WebP data URI) | Shared with Mariam |
| `lina` | `lina` | لينا — الأخت، 8 سنوات | `_A` (WebP data URI) | Shared with Yasmin |
| `salim` | `salim` | سليم — الصاحب الذكي | `$A` (WebP data URI) | One source ref |
| `mansour` | `mansour` | عم منصور — الجندي القديم | `fz` (WebP data URI) | One source ref |
| `noor` | `noor` | القائدة نور — قائدة البوابة، 29 سنة | `nz` (WebP data URI) | Trust key is `nour`; preserve as an alias |
| `youssef` | `youssef` | الأب يوسف — طبيب المستشفى، 42 سنة | `MH` (inline SVG data URI, 320×400) | Trust key is `father`; alias الأب |
| `elias` | `elias` | إيلاس — الغامض المقنّع | `vz` (WebP data URI) | One source ref |
| `amin` | `amin` | أمين — الناجي من وراء السور، 23 سنة | `G8` (inline SVG data URI, 240×300) | One source ref |
| `mariam` | `mariam` | مريم — المهندسة، 17 سنة | `UA` (WebP data URI) | Shared with Sara |
| `hadi` | `hadi` | عم الهادي — حارس الأرشيف، 62 سنة | `S7` (WebP data URI) | Shared with Ryan and Karim |
| `yasmin` | `yasmin` | ياسمين — اليتيمة، 10 سنوات | `_A` (WebP data URI) | Shared with Lina |
| `karim` | `karim` | القائد كريم — قائد المجموعة الثانية، 35 سنة | `S7` (WebP data URI) | Shared with Ryan and Hadi |

The source also has a name-label map whose trust keys and display aliases do not always match character IDs (for example `noor` / `nour`, `youssef` / `father`). Preserve those as aliases; never silently rename the original save keys. Three groups use the same portrait variable for multiple records: `S7` = Ryan/Hadi/Karim, `UA` = Sara/Mariam, and `_A` = Lina/Yasmin. This is confirmed source reuse, but intent (shared identity, placeholder, or accidental reuse) is not documented, so it is not labeled a defect.

### Other roles without a dedicated `Gt` record

The original scene dialogue and interaction text mention incidental people (including an older woman, a lost child, refugees, market residents, guards and patients). The current `Gt` table has no dedicated character record or separate portrait reference for these roles. Record them under an explicit role/ensemble ID only if a future extraction needs one; do not invent individual portrait IDs from dialogue mentions.

### Existing image, expression and movement variants

- **Portrait files in production:** each of the 13 character records points to one image variable in the monolithic source. There are 9 distinct base portrait refs: seven WebP data URIs and two inline SVGs (`MH`, 320×400, for Yusuf; `G8`, 240×300, for Amin). No standalone production portrait files or alternate portrait sheets exist in the tracked tree. Shared portrait refs are listed in the character table.
- **Named expression states in the source:** `KH` lists 11 non-normal states. Seven have their own WebP image data URI; four Amin states share his `G8` portrait and differ by tint/glow. `normal` reuses Ryan's `S7`. No separate expression file exists outside the bundle.

| Expression key | Display label | Character | Image ref | Distinct expression image? |
|---|---|---|---|---|
| `fear` | خايف | Ryan (`ryan`) | `ez` (WebP data URI) | Yes |
| `brave` | غاضب / شجاع | Ryan (`ryan`) | `tz` (WebP data URI) | Yes |
| `crying` | تبكي | Lina (`lina`) | `rz` (WebP data URI) | Yes |
| `sly` | ماكر | Elias (`elias`) | `Pz` (WebP data URI) | Yes |
| `worried` | قلقانة / حزينة | Sara (`sara`) | `Az` (WebP data URI) | Yes |
| `angry` | غاضبة / حازمة | Noor (`noor`) | `zz` (WebP data URI) | Yes |
| `wise` | حزين / حكيم | Mansour (`mansour`) | `Xz` (WebP data URI) | Yes |
| `aminCautious` | حذر | Amin (`amin`) | `G8` (inline SVG portrait) | No; shared portrait with tint/glow |
| `aminSad` | حزين | Amin (`amin`) | `G8` (inline SVG portrait) | No; shared portrait with tint/glow |
| `aminSerious` | جاد | Amin (`amin`) | `G8` (inline SVG portrait) | No; shared portrait with tint/glow |
| `aminShocked` | مصدوم | Amin (`amin`) | `G8` (inline SVG portrait) | No; shared portrait with tint/glow |
| `normal` | عادي | Ryan (`ryan`) | `S7` (WebP portrait) | No; reuses base portrait |

The source chooses expression keys from dialogue text and has scene defaults for Sara (`worried`, sceneIdx 0), Noor (`angry`, 7), Mansour (`wise`, 4) and Amin (`aminCautious`, 8). Treat the expression keys and image refs as presentation data, not story or save identifiers.

- **Base portrait effects in original CSS:** `.stage-slide` enters over 0.4 s; `.stage-breath` scales gently on a 5.4 s cycle; `.stage-blink` applies a brief brightness dip around 94% of a 5.2 s cycle. The speaking portrait receives a border/highlight (`.stage-speaking`); the listening portrait dims (`.stage-listening`).
- **Expression overlays and movement:** fear/anger can apply `.expression-shake` (0.45 s loop in source CSS). Crying/worried states add animated tear overlays; wise scenes add a flickering candle and glow. The production source has reduced-motion rules for portrait movement, expression shake, tears and candle animation.
- **Android build presentation effects:** `scripts/prepare-web.cjs` applies idle breathing (4.8 s), grief when `.tear-drop` is present (3.8 s), tension on `.expression-shake` (0.65 s), and a memory/light variation when `.candle-flame` is present (6.2 s). Reduced-motion mode disables the added movement. These are CSS treatments over the same portrait, not alternate image files.
- **Scene backgrounds:** the pilot cinematic code adds slow drift (26 s) to the detected active background and a short transition when its URL changes. This is a camera/presentation effect, not a new background asset.
- **PR #21 lab characters:** Ryan, Lina and Nour each have one static SVG silhouette; those files contain simple fixed face shapes and no separate blink frame, expression sheet, hand-gesture frame or clothing/pose variant. The lab HTML adds CSS idle breathing/bobbing while playing. The G2 brief's blink/gesture requirements are future acceptance items, not included art variants.

## Place and background inventory

The following rows pair each original `an` record with its one-based scene `id`, zero-based legacy `sceneIdx` (= id − 1), G0 display chapter and exact image variable. A variable repeated in several rows is the same embedded image reference, not a separately stored variant.

| `sceneIdx` | Scene / place from original source | G0 display chapter | Proposed place ID | Embedded background ref |
|---:|---|---:|---|---|
| 0 | 01 — الدار — قرطاج | 01 | `home` | `N8` (WebP data URI) |
| 1 | 02 — سوق قرطاج — الصباح | 03 | `market` | `ht` (WebP data URI) |
| 2 | 03 — السور العظيم — لحظة الكسر | 05 | `wall` | `s8` (WebP data URI) |
| 3 | 04 — شارع النار — الهروب | 06 | `fire-street` | `Wt` (WebP data URI) |
| 4 | 05 — دار عم منصور — الجندي القديم | 07 | `mansour-house` | `C7` (WebP data URI) |
| 5 | 06 — المستشفى — الدخان والجرحى | 08 | `hospital` | `E7` (WebP data URI) |
| 6 | 07 — الجسر — فوق النهر | 09 | `bridge` | `F8` (WebP data URI) |
| 7 | 08 — البوابة — مكسورة، نار، عمالقة في البعيد | 12 | `gate` | `n9` (WebP data URI) |
| 8 | 09 — العبور — ما وراء السور | 13 | `crossing` | `I7` (WebP data URI) |
| 9 | 10 — الغابة — ضباب وظلال | 15 | `forest` | `uz` (WebP data URI) |
| 10 | 11 — السهول المحطمة — الحقيقة الكبرى | 17 | `plains` | `lz` (WebP data URI) |
| 11 | 12 — القرية المخفية — غابة زغوان | 18 | `hidden-village` | `uz` (same as scene 10) |
| 12 | 13 — المختبر القديم — تحت قرطاج | 20 | `laboratory` | `I7` (same as scene 8) |
| 13 | 14 — أطلال قرطاج — الرجوع للبوابة | 23 | `ruins` | `lz` (same as scene 10) |
| 14 | 15 — ساحة قرطاج — ما بعد الحقيقة | 25 | `square` | `lz` (same as scene 10) |
| 15 | 16 — الميناء البونيقي — البناء | 28 | `punic-harbor` | `I7` (same as scene 8) |
| 16 | 17 — هضبة بيرصا — قرطاج الجديدة | 35 | `byrsa-plateau` | `lz` (same as scene 10) |
| 17 | 18 — هضبة بيرصا — الغروب | 36 | `byrsa-plateau` | `lz` (same as scene 10; same source ref) |

There are 18 scene records but only 11 distinct background image variables. Source reuse groups: `I7` is used for crossing, laboratory and harbor; `uz` for forest and hidden village; `lz` for broken plains, ruins, square and both Byrsa endings. Scene 17 has a sunset place label but the source points to the same `lz` data URI as scene 16; no separate sunset image variant is present in `an`. These repeated refs are confirmed in the original source. Do not delete or duplicate them until an art review determines whether they are intentional reuse or placeholders.

The ID `crossroads` is reserved for the PR #21 pilot only. Its background is declared `procedural:crossroads` and drawn in the lab HTML with CSS sky, sun, hills, ground and road; it is not an original production scene.

### Production visuals embedded in the original bundle

- `Gt`: 13 character records, 9 distinct base portrait refs (7 WebP data URIs and 2 inline SVG data URIs). The expression map adds 7 distinct WebP data URIs; Amin's 4 named moods and Ryan's normal state reuse portrait refs. Total distinct embedded character-art refs: 16.
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

**Still unverified:** whether shared character portraits and repeated scene backgrounds are deliberate or placeholders; and the original author/source/license of production art. Decoded dimensions and SHA-256 values are now recorded below. The G2 brief calls the six pilot SVGs original lightweight silhouettes, but no per-file license/author statement is checked in. Treat them as project-created per brief, lab-only, with formal license unspecified until recorded.

No production visual is labeled “unused” by this inventory: every source character record and scene record points to an image variable. No exact duplicate files exist among the separate pilot art in one reviewed branch.

## Stable ID proposal and safe folder shape

IDs are lowercase ASCII slugs without class prefixes, matching the `speakerId: "mansour"` / `locationId: "mansour-house"` examples in PR #23 and scene IDs in PR #20. Record type is carried by the separate `characters/` and `backgrounds/` registries, not by the ID string. Once approved, IDs are immutable and independent of localized spelling, display order, `sceneIdx`, paths and translated titles. Names and aliases belong in metadata/locales. Never write these IDs into the original save format as part of L1.

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
| Original expression artwork | Expression map in production `index.html`; seven additional WebP data URIs for fear, brave, crying, sly, worried, angry and wise states | Original author/source/license not recorded; pre-existing production use is not proof of a reusable license |
| Original scene backgrounds | `an` scene array in production `index.html`; 11 WebP data URIs referenced across 18 scenes | Original author/source/license not recorded; repeated refs are source-level reuse, not separate files |
| Six pilot SVGs | First tracked in PR #21 under `examples/assets/`; G2 brief requests original lightweight SVG silhouettes | Lab-only; brief supports project-created intent, but no explicit per-file license/author line; do not treat as cleared production art |
| CSS crossroads environment | Written in `examples/qarton-single-load-lab.html` for the pilot | Repository-authored lab code; no external media source identified |
| Background manager fallback gradients | `fix/qarton-background-manager` branch runtime code | Code-generated fallback, not a reusable background asset; no external image source |

Pilot Git blob IDs above are content identifiers, **not** SHA-256 checksums. Decoded media dimensions and raw-byte SHA-256 values are recorded in the L1 follow-up tables below.

## Reviewed organization outcome and next gate

The current layout should remain unchanged. This inventory is the read-only prerequisite. Next, confirm names/aliases and production art references against the original bundle in a source-readable review; then approve the ID registry and a provenance manifest. Only after that should a separate, reversible extraction PR be considered, with all file usages mapped and production/save behavior covered by the existing gates.


## L1 follow-up — decoded fingerprints, ID reconciliation and G1 places

This follow-up records the missing image evidence requested in the PR #24 review. Dimensions are intrinsic decoded raster dimensions; the two production SVG portraits and pilot SVGs use their declared `viewBox` dimensions. SHA-256 is computed over the decoded image/file bytes (not the base64 text or Git blob ID). Production images remain embedded in the original source and were not extracted into the repository.

### Character artwork fingerprints

| Source ref | Used by / state | Format | Dimensions | Bytes | SHA-256 |
|---|---|---|---:|---:|---|
| `S7` | Ryan, Hadi, Karim; Ryan normal | WebP | 550×1100 | 36,426 | `0454237b885e59503d4f95223f37c906ee42672ebe505a3eb31077c7074cfaf5` |
| `UA` | Sara, Mariam | WebP | 960×960 | 65,754 | `a8e664b85fefb2416bb07d0995a4b09f8f8c4bd8e7eff5320ed2057a6c6b8855` |
| `_A` | Lina, Yasmin | WebP | 960×960 | 51,586 | `8cb0c530f57c0a4db0f1c81919d805f9bf6e6da261320dacaad67465d17785bc` |
| `$A` | Salim | WebP | 960×960 | 75,936 | `66445acb7a635efbbaec38aba3be07002edb83c63f23bff9f888fd332437dd3b` |
| `fz` | Mansour | WebP | 550×1100 | 49,796 | `773cab08bb82ae707d31492ff84b9f0a41554de97821310c4e6d954e21ff2555` |
| `nz` | Noor | WebP | 960×960 | 48,608 | `f3ef718de80fc34a367ed0fd2dd59babe4964daaab2f65b82b6f3fb6d30dd1b4` |
| `MH` | Youssef | SVG | 320×400 | 4,443 | `8779427d5db2bf059058cefdfeb4a8d262a3383bb6df9d966f888ab08b3d990d` |
| `vz` | Elias | WebP | 960×960 | 69,134 | `3ca984294b025095b5e092cd3393da5da923136ae3466f3be58cd99541871902` |
| `G8` | Amin and four tinted/glow moods | SVG | 240×300 | 1,612 | `a308590bdaf340cd2ac7e6b6a937b368c4580705714c15729083d68b713b5552` |
| `ez` | Ryan fear | WebP | 960×960 | 68,668 | `afa395a19aa355b9e7ab44547f559ca47c7eed01d643f61aced764b388636512` |
| `tz` | Ryan brave | WebP | 960×960 | 53,526 | `3056c3c5085098f4fc45ba2051a4cd87ee25b49960abeadd0c2f81518f3efb83` |
| `rz` | Lina crying | WebP | 960×960 | 49,492 | `a639595cfb50d0368c7715bfef425a7551429760270d2fa6a67c797d057d3f01` |
| `Pz` | Elias sly | WebP | 960×960 | 52,494 | `868d8a8fd21e4992aaf1c301f11b69b64e3d440481d24a005d880b910c2013f7` |
| `Az` | Sara worried | WebP | 960×960 | 63,062 | `baf86f6864b075c436373c2b632f1e7b612ae894f246f741cda47ab950cc4b9c` |
| `zz` | Noor angry | WebP | 960×960 | 69,518 | `dad8f1fe968e505bfa6981169e13e3fd5c9ef17ac2ab1cc08e3c1d7565854001` |
| `Xz` | Mansour wise | WebP | 550×1100 | 51,002 | `af9644216ee2b4779f3bfa77e81b2ec313921f1f68cd3030c530d7438294e7f8` |

There are 16 distinct production character-art byte payloads: 9 base portrait refs and 7 separate expression images. The four Amin mood keys and Ryan normal do not add distinct payloads.

### Original background fingerprints

All 11 distinct original background payloads decode as 960×640 WebP. The complete source-scene mapping is above; this table records each unique payload once.

| Source ref | Original scenes using it | Dimensions | Bytes | SHA-256 |
|---|---|---:|---:|---|
| `N8` | 01 — Home | 960×640 | 64,818 | `3bcaf22aab46e43a08e9ad1dd20161f84f294b324188eb1f2c481eefa66b65be` |
| `ht` | 02 — Carthage market | 960×640 | 93,006 | `812e57792e5f0565a43897d51d86222600ba308c0161a9cd5172440c666d8113` |
| `s8` | 03 — Great Wall | 960×640 | 92,190 | `8b2e17486eb04265e82fb824f8d6855df6466dff97fdbbe53574100d98a61dba` |
| `Wt` | 04 — Fire Street | 960×640 | 122,880 | `c0132f2caaba0d2fa9b647526395224950124d3de0f77adeaab98983402d639e` |
| `C7` | 05 — Mansour house | 960×640 | 60,264 | `e763fba48fdeec4a7ef846fb03cdedd793ebc6a3955ddfeff403124effda80b1` |
| `E7` | 06 — Hospital | 960×640 | 73,010 | `e8e5ca668f40a58d1f2d329cd6ab87596773550ee9d6aa9acf06dd1862f459c2` |
| `F8` | 07 — Bridge | 960×640 | 110,556 | `14cf8d073a89ff25214f15837f63a284706e0585e01cf698ed25d25fc9cf8f1e` |
| `n9` | 08 — Gate | 960×640 | 97,462 | `c4224aab7d52fca27a2096d47d0049e3976498e77bd3b625fbc10876a40f4d9a` |
| `I7` | 09 Crossing, 13 Laboratory, 16 Harbor | 960×640 | 89,136 | `ee8258c0e74d0355f5a3837c339297f099019a98068521cbd5b68d49d93835f4` |
| `uz` | 10 Forest, 12 Hidden village | 960×640 | 88,016 | `7cf1f997e9e0e2adc9fee31abd64bfa57ecb3d69e5d823e66369896ae2114355` |
| `lz` | 11 Plains, 14 Ruins, 15 Square, 17–18 Byrsa | 960×640 | 63,282 | `f437b596977f54f7048ea2fa2ab7a2cdf50c784c6d8ee568f11f7a69b1de6c43` |

### Pilot SVG fingerprints

These records apply only to the six lab files listed earlier. Dimensions come from each SVG `viewBox`; SHA-256 covers exact UTF-8 file bytes including the tracked final newline.

| File | Dimensions | Bytes | SHA-256 |
|---|---:|---:|---|
| `examples/assets/ryan.svg` | 100×230 | 669 | `c5fd136658c79d8f85e7f64358f68ed348c5575762624a5d0a9e0d36b971ff64` |
| `examples/assets/lina.svg` | 90×190 | 514 | `3135e43b326339198593ba5e349a685e5458985e48d0e3f5ae563f7064de23c0` |
| `examples/assets/nour.svg` | 110×240 | 565 | `6dff5fd2fa51a1b77bdb68ed0ee19d0ad7b0c0f02119b714eecf3c3641f6c19f` |
| `examples/assets/bridge.svg` | 230×150 | 421 | `a9b4f0e0e398a54628c918366d2b2a48b4107b2f02080d4bfc3ce9545275f7c7` |
| `examples/assets/clinic.svg` | 210×180 | 478 | `2b0f61df3ce8c282ef501a72b965ab303a25716174b0825918cc00d326a36105` |
| `examples/assets/wagon.svg` | 180×120 | 556 | `a1dfa91d4d07b3c216f3944acbd5365c89641d65aa858c4c74fa169987038500` |

### PR #20 proposed locations compared with original places

PR #20 is a draft story expansion. These mappings are editorial proposals, not approved production art assignments. “Reuse area” means a story location may be under an existing place ID; it does not assert the existing background image is visually adequate.

| PR #20 scene ID | Proposed place / description | Original place relation | Stable place ID proposal | Review state |
|---|---|---|---|---|
| `p1-family-promise` | Stair inside family home | Home | `home-stair` | Reuse home area; stair-specific art not confirmed |
| `p1-family-alley` | Alley outside the market | Market | `market-alley` | New sublocation/visual needed |
| `p1-smoke-door` | Road toward gate and collapsed warehouse door | Fire Street / Gate | `smoke-door` | New sublocation; exact continuity uncertain |
| `p1-gate-manifest` | Gate square | Gate | `gate` | Reuse candidate |
| `p2-relay-hut` | Relay hut in wet forest | Forest | `relay-hut` | New sublocation/visual needed |
| `p2-names-consent` | Shaded forest path | Forest | `forest` | Reuse candidate |
| `p2-yasmin-drawing` | Small house in hidden village | Hidden village | `hidden-village-home` | New sublocation; existing scene only names village |
| `p2-last-signal` | Room above abandoned workshop / antenna | None exact | `signal-workshop` | New place and visual needed |
| `p2-protection-cost` | Stone quay at village edge | Punic harbor is original but elsewhere | `village-quay` | New place; do not equate to original harbor |
| `p2-truth-gate` | Sea gate at night | Gate | `sea-gate` | Separate ID pending story continuity approval |
| `p3-survivor-register` | Temporary school near square | Square | `survivor-school` | New place/visual needed |
| `p3-single-load` | Crossroads between bridge route and medicine quay | Pilot has procedural crossroads only | `crossroads` | New production visual needed; pilot is not production art |
| `p3-karim-key` | Iron dock gate / boat-storage passage | Village quay / harbor vicinity uncertain | `dock-gate` | New visual; parent location unresolved |
| `p3-house-without-number` | Old sea-side street, unnumbered house | No exact original place | `unnumbered-house` | New place/visual needed |
| `p3-medicine-cost` | Temporary quay-side clinic | Hospital / village quay | `temporary-clinic` | New visual; not established as original hospital |
| `p3-mark-on-stone` | Stone steps between school and square | Square / proposed school | `school-steps` | New sublocation; visual needed |
| `p3-hadi-hearing` | School yard used for a hearing | Proposed survivor school | `survivor-school` | Reuse school area with a hearing-yard state |
| `p3-key-handover` | Room between school and quay | Proposed school / quay | `handover-room` | New sublocation; parent and art unresolved |

G1 names Hala (هالة) as Ryan's missing sister in the survivor registry, but the original `Gt` table has no Hala record or portrait. Candidate character ID: `hala` (draft-only until story approval and art exist). Backgrounds needed for the proposed new G1 places are not present as distinct original refs. The current 11 original backgrounds are not evidence that suitable visuals exist for these new locations.

### ID alignment and safe classification

The source character IDs are retained as unprefixed lowercase IDs: `ryan`, `sara`, `lina`, `salim`, `mansour`, `noor`, `youssef`, `elias`, `amin`, `mariam`, `hadi`, `yasmin`, `karim`. The existing architecture's examples use `mansour` and `mansour-house`, and PR #20 scene IDs are already stable slugs. Use separate character and place registries to distinguish namespaces; do not introduce `char.`/`loc.` prefixes. Aliases `nour` for trust-facing Noor and `father` for Youssef remain aliases, not replacement IDs. Proposed new place slugs above remain unapproved until G1 continuity review. No save identifier or original scene index was changed.

### Updated findings and open evidence

- **Confirmed duplicates/reuse:** three character portrait groups and three repeated-background groups are aliases to identical source payloads. They are referenced, not orphan files. Their design intent remains **unconfirmed**.
- **Missing/needs new art:** no original distinct sunset background exists for Byrsa scene 18; PR #20 locations marked new above lack dedicated production art. The pilot crossroads drawing is experimental and is not approved as a production replacement.
- **Missing character asset:** Hala is named only in G1 and has no source character record or portrait. Other unnamed crowd/ensemble roles lack dedicated portrait assets.
- **Unused assets:** none identified among the 16 distinct production character payloads, 11 background payloads, or six referenced pilot SVGs. No deletion is proposed.
- **Provenance/licensing:** no source URL, creator, or license evidence is present for the embedded production art. The pilot brief describes original silhouettes but gives no file-level author/license statement. All rights remain unverified; existing use is not treated as license evidence.
- **Checksums and dimensions:** recorded above for 16 production character-art payloads, 11 production backgrounds, and six pilot SVG files.
- **PR #23 cross-review note:** PR #24's GPT-6 comment points to `docs/qarton-l1-s1-g1-cross-review-20261122.md`, but that path is absent from the reviewed PR #23, PR #20, PR #24 and PR #19 snapshots checked. This report therefore follows the available PR #23 organization decisions and the comment itself; any unpublished Sol/Astra registry not attached to those snapshots remains unverified.
