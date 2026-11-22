# QARTON — Isolated Android pilot build specification

**Status:** Engineering handoff; NOT an APK, NOT a claim of on-device testing. Applies to Draft PR #23 and future opt-in pilot branch only. Production game and original save schema remain unchanged.

## Verified existing build path

- `capacitor.config.json` uses production `appId: com.qarton.carthage`, `appName: قرطاج`, and `webDir: www`.
- `.github/workflows/android-apk.yml` runs `npm test`, `npm run prepare:web`, `npx cap add android`, `npx cap sync android`, Gradle debug assembly and emulator tests. It requires the `CARTHAGE_KEYSTORE_BASE64` repository secret and verifies the stable Carthage signing certificate.
- That workflow creates the **production-ID** APK; it is **not** an isolated 36-chapter pilot builder. Do not dispatch it as a pilot, or distribute its output as the pilot.
- PR #23 has 132 changed files (checked across both GitHub pagination pages) and none are `index.html`, `scripts/prepare-web.cjs`, `android/`, or `app/`. CI run `45043126296` succeeded after the protected-file boundary gate was introduced.

## Required opt-in pilot separation

1. Use a **separate future pilot branch/PR** and a separate workflow; do not modify the production build workflow in this Draft PR.
2. After copying the prepared `www` assets into an isolated workspace, generate a **pilot-only Capacitor config** with a distinct application ID such as `com.qarton.carthage.pilot` and a clearly different launcher name. Never overwrite the checked-in production `capacitor.config.json`.
3. Use a **dedicated pilot signing key**; never reuse, expose, or rotate the stable production signing secret. Keep signing material in repository secrets and avoid logging it.
4. Require an explicit opt-in feature flag to load draft chapters. The default route must keep the 18 original chapters. Do not silently alter `sceneIdx`, `lineIdx`, original endings, or the legacy save JSON.
5. Store draft checkpoints only in a **pilot namespace**. Do not import pilot checkpoint fields into original saves. Export original saves first and verify their hashes and critical fields before/after the trial.
6. Add a visible PILOT label and distinct package ID to any generated artifact; confirm via Android tooling that both apps can be installed simultaneously without uninstalling the original.
7. Run existing HTML/home and static contract tests, then emulator tests on the actual pilot APK. Only after those pass, test on a physical Android device.
8. Preserve the official QARTON intro and licensed assets only; never promote missing or rights-unverified draft art as production imagery.

## Implementation gates

| Gate | Acceptance |
| --- | --- |
| Package isolation | `applicationId` differs from `com.qarton.carthage`; installed production app remains untouched |
| Build reproducibility | Commit SHA, Node/Java/SDK versions, asset hashes and signing certificate fingerprint recorded |
| Draft gating | No draft chapters when opt-in flag is off; pilot cannot mutate original save storage |
| Save integrity | Export/import original save, including chapter 5; compare `sceneIdx`, `lineIdx`, trust, inventory, flags, history and ending state |
| Partial checkpoint | Chapter 11 seat/custody and chapter 22 boat/Elias groups survive process death without applying a choice twice |
| Content and visuals | 36 display positions mapped, absent characters hidden, missing/unlicensed art visibly marked |
| Ending authorization | All nine original ending routes tested without draft shortcuts |
| Language | First-open and reopened settings in `tn/ar/en/fr`, including mixed-language regression |
| Android lifecycle | Background/foreground, forced termination, repeated scene navigation, memory and audio cleanup |

## Stop/go

**Current decision: NO-GO for building/distributing a 36-chapter pilot from PR #23.** It contains static contracts and draft content, not a fully wired runtime. A separate opt-in implementation and approval of G1/L1/S1 handoff gates are required. The existing `android-apk.yml` output must not be represented as the 36-chapter pilot.

When pilot implementation exists, run `docs/qa/qarton-36-chapter-android-acceptance-protocol-20261122.md` and attach actual test evidence. Keep PR #23 Draft; do not merge automatically.

## First isolated APK build evidence (2026-11-22)

- Workflow: [QARTON isolated pilot APK run 45055616995](https://github.com/karim007king-ship-it/carthage-anime-game/actions/runs/45055616995), commit `cb0f06c8c`, **success**.
- Published artifact: `qarton-pilot-legacy-runtime-debug`, artifact ID `14766694817`, ZIP size `9,153,900` bytes at inspection; not expired then.
- The workflow passed the `aapt dump badging` check for `com.qarton.carthage.pilot` and a visible `PILOT` label, and uploaded the experimental debug APK.
- The separate cinematic contract and isolated preflight workflows also passed for that commit.
- **Not tested:** physical-device installation, Android WebView functionality, coexistence with the installed production app, save import/export, process death, 36-chapter runtime integration, or nine-ending reachability. The artifact is an isolated package containing the current legacy runtime, not a 36-chapter build.
- Download from the run's **Artifacts** section (GitHub login may be required). Do not replace the production APK.

## User-reported physical Android smoke test (2026-11-22)

- User confirms the isolated QARTON PILOT APK **installs and launches** on their Android phone.
- User separately confirms **both the production Carthage app and QARTON PILOT are installed concurrently** on the same device. This is user-reported coexistence evidence, not an automated Android instrumentation result.
- This closes the manual install/launch/coexistence smoke-test gate only. It does **not** establish save-data integrity, all gameplay paths, nine ending reachability, or 36-chapter runtime integration.
- Next implementation must be opt-in, pilot-only, and preserve original save fields and original production workflow.

## Static preview isolation follow-up (2026-11-22, commit `cb7e98ba8`)

- Latest verified PR #23 checks: isolated preflight run `45071219600` and cinematic contract run `45071219642`, both successful.
- A new manual-only workflow, `.github/workflows/qarton-isolated-pilot-apk.yml`, generates a separate `com.qarton.carthage.pilot` debug APK in a temporary workspace and validates its package label before uploading.
- Its build process inserts **144 static preview HTML files** into the isolated pilot workspace; the checked-in production source and its normal APK workflow are not the preview destination.
- These static HTML previews are **not playable chapter runtime integration**. A successful preflight does not prove that the manual APK workflow completed or that the latest APK was installed on a device.
- Do not treat previous physical-device installation of an earlier pilot APK as a test of this later preview build. A fresh workflow dispatch and separate device verification are needed.
- Next manual gate: dispatch the isolated pilot APK workflow from the intended branch, verify artifact ID and package metadata, install alongside the production app, inspect preview links and verify original save remains unchanged. Never uninstall the production app for this test.
