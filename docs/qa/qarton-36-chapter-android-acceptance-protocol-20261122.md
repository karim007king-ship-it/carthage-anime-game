# QARTON — Android acceptance protocol for isolated 36-chapter pilot

**Status:** Proposed manual protocol only. This document is not evidence of device execution. PR #23 stays Draft; no merge, original game/save/ending logic unchanged.

## Preconditions

- Use a **separate opt-in pilot build**, not the production game or the currently installed APK. Record pilot commit, build artifact, package ID, signing certificate fingerprint and Android/WebView version.
- Export an existing original-game save JSON before testing. Keep the original installed app and export untouched.
- Pilot must not write draft chapter identifiers into original `sceneIdx` (0–17) or overwrite original `lineIdx`, `trust`, `inventory`, flags or ending keys.
- Log a non-sensitive test run ID, chapter ID, event ID, choice group and result; do not log the entire save or personal files.

## Device matrix

| Case | Steps | Required result |
|---|---|---|
| Intro and home | Cold-start, play official QARTON intro, open New Game, back, continue | Only official home appears; no legacy menu or transition dead end |
| 18 legacy chapters | Load original save snapshots at early, middle and final chapters | Exact original chapter, dialogue, trust and inventory values; no forced migration |
| 36 display chapters | Traverse all chapter IDs in documented order in opt-in pilot | Correct next/previous scene, no draft index written as legacy `sceneIdx` |
| Chapter 11 partial choice | Select seat, suspend app, force-close, restore | Seat remains completed exactly once; custody pending; no duplicate time/trust effect |
| Chapter 11 reverse partial | Select custody first, suspend, restore | Custody completed once; seat pending; invalid cross-group choice rejected |
| Chapter 22 Elias present | Complete boat, restore with Elias explicitly present | Boat not replayed; testimony offered once |
| Chapter 22 Elias absent | Complete boat, restore with Elias explicitly absent | Testimony skipped; no Elias dialogue, portrait, evidence or trust effect |
| Chapter 22 unknown Elias | Restore with no reliable presence flag | Fail closed, do not invent testimony or silently skip an unresolved decision |
| Background rights | Visit chapters with missing/unapproved art | Clear missing-art placeholder; no guessed image or unlicensed fallback |
| Character visibility | Test absent/present character branches | No absent portrait, speaker, evidence or fabricated presence |
| Languages | Switch `tn/ar/en/fr` on first settings opening and after relaunch | No mixed-language UI, missing key visibly reported, no translated logic keys |
| Nine endings | Execute all original ending routes from original save fixtures | Original ending identifiers and conditions unchanged; no draft choice directly unlocks one |
| Memory/audio | Repeatedly enter/exit cinematic scenes, background/foreground, mute/unmute | Images/audio cleaned up; no growing memory trend, black-screen deadlock or audio overlap |
| Save export/import | Export original save, import and resume in original build | Exact original state restored; unknown draft checkpoint rejected by original game |
| Signed APK upgrade | Upgrade a previously signed stable-key APK without uninstalling | Same application ID/signing certificate, higher versionCode, original save preserved |

## Evidence collection

For each case record: build commit, device/Android version, test input ID, expected versus observed result, screenshot or concise log, pass/fail and reproduction steps. **Do not mark PASS until observed on a physical Android device.** Failed cases block production merge.

## Stop conditions

Stop and preserve the original installation if the pilot attempts to overwrite a production save, changes an original ending, displays unapproved art, or requires uninstall to upgrade a stable-key APK. Fix only in an isolated branch and rerun relevant CI plus the device case.

## Current gate

Static contract CI is green through run `45039373747`. Device acceptance is **NOT RUN**. G1 editorial, L1 asset licensing, S1 localization, production save compatibility and Android APK update acceptance remain open.
