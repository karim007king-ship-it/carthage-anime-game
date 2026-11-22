# QARTON Android — in-place APK update compatibility

The Android package identity is `com.qarton.carthage`. To update an installed APK **without uninstalling**, Android requires **the same package ID**, **the same signing certificate**, and **a strictly higher versionCode**. Matching `versionName` alone is not enough.

The existing GitHub workflow already requires `CARTHAGE_KEYSTORE_BASE64`, validates the `androiddebugkey` alias, and uses that keystore for `assembleDebug`. **Do not regenerate or rotate this keystore**. Keep the existing secret stable. The key and passwords are never committed.

This PR adds `scripts/set-android-update-version.cjs` after Capacitor generates Android, and sets `versionCode = 100000 + GITHUB_RUN_NUMBER * 10 + GITHUB_RUN_ATTEMPT` (attempt 1–9), while retaining the configured package ID and `package.json` versionName. The build fails if the generated Gradle identity is unexpected. The workflow verifies the final APK package metadata and signing certificate using Android SDK tools.

**Critical limitation:** If an older APK was signed with a *different* debug certificate (for example, GitHub's ephemeral debug keystore before the stable secret was installed), Android cannot update it in place using the new stable key. There is no safe code-only workaround. Before replacing such an installation, export the in-game backup JSON, verify it can be imported, and only then consider uninstall/reinstall. Do not promise preservation of private app data after uninstall.

**Acceptance checklist:**
1. On a test device with an APK signed by the current stable keystore, save a game, install a newer workflow APK over it, and verify save and settings persist.
2. Compare certificate SHA-256 of the installed APK and new APK; both must match.
3. Verify newer APK versionCode exceeds installed versionCode. Rebuilds with a new run number should increase monotonically; attempts beyond 9 intentionally fail closed.
4. Test an APK with different certificate: installation must be rejected; no silent data loss or forced uninstall.
5. Test normal game startup, story, and save export/import after upgrade.

**Status:** Draft PR only; not merged. Actual on-device upgrade has not yet been verified.
