# QARTON Lifecycle Regression Matrix

This document defines the browser/device scenarios required before changing either home observer or the story handoff. Static contract tests alone are not evidence that these scenarios pass.

## Preconditions
- Test only on `feat/qarton-engine-adapter-pilot`; never use `main` as a scratch branch.
- Use a fresh installation for clean-save scenarios and a second installation/profile with a valid save.
- Record the APK build/run ID, device, Android version, and whether the run is browser or WebView.

## Scenarios and expected outcomes

| ID | Scenario | Expected |
|---|---|---|
| L-01 | Open app with no save | QARTON main tree is visible; no legacy home overlay or vertical scroll |
| L-02 | Open app with valid save | Continue control appears only in Progress & Saves; save remains intact |
| L-03 | Open Story subview then start Part 1 | Original game handler is invoked; QARTON handoff stays visible until story intro appears |
| L-04 | Start new game when save exists; cancel | Original confirmation is dismissed; prior save is preserved |
| L-05 | Start new game when save exists; confirm | Story intro starts; prior save is not silently deleted before confirmation |
| L-06 | Story intro before timer exists | Intro counts as active story; QARTON home layer is removed |
| L-07 | Active gameplay and DOM updates | Home decoration/observers do not inject home controls into story content |
| L-08 | Return to home from story | Main tree is restored without exposing the legacy menu as the primary UI |
| L-09 | Continue last save | Correct saved chapter, state, inventory, clues, and trust are restored |
| L-10 | Export then import a valid backup | Export is readable; import restores data without duplicate or destructive side effects |
| L-11 | Import invalid backup | Clear error; existing save is preserved |
| L-12 | Settings audio toggle and volume | Controls reflect actual audio state and do not redraw the view unnecessarily |
| L-13 | Settings localization | All visible QARTON and original settings labels update in the selected language; no stale Arabic labels |
| L-14 | Part 3 gating | Part 3 stays locked until the original progression requirements are satisfied |
| L-15 | Short screen / safe areas | Main tree remains readable without clipping or vertical scrolling |

## Evidence ledger
- Static source-contract audit: covered by npm tests; not a browser simulation.
- CI packaging: recorded in GitHub Actions run.
- Device validation: record only when manually tested on the target phone.
- Any observer refactor: require L-01, L-03, L-06, L-07, and L-08 on browser/WebView before considering the change safe.

## Observer cleanup guardrails
1. Avoid overlapping observer responsibilities unless each has a documented owner.
2. Prefer a narrow root observer over document-wide observation where feasible, but do not disconnect permanently without a reliable reactivation path.
3. Keep observer teardown explicit and idempotent.
4. Batch rendering with a single animation frame; prevent duplicate scheduling.
5. Never alter save data or story-owned controls as a side effect of observer cleanup.
6. Do not claim browser/device coverage based on source-string assertions.

## Audit finding — home re-entry observer (open)

The current main-tree runtime sets `started=true` when it attaches, then `cleanupForGame()` disconnects the main observer and removes the overlay but does not reset `started` or install a lightweight home-return watcher. A later call to `attachToApp()` therefore exits immediately. The premium-home observer still manages fixed-home CSS, but it does not re-render the QARTON main tree. Consequently, L-08 (return to home) is not proven and may expose the legacy menu after an in-app return without a full page reload.

**Do not patch this by simply keeping the full subtree observer active during gameplay.** First add a browser-level regression harness that models the React root returning from story to home; then introduce a narrowly scoped re-entry watcher and verify L-01, L-03, L-06, L-07, and L-08. Keep the currently validated intro handoff and save behavior unchanged.
