# QARTON — Carthage Home Screen Tree

Status: approved design specification; no production UI changes in this commit.

## Product decisions
- Game title: آخر يوم في قرطاج
- Studio identity: QARTON — قرطون
- Navigation model: central home screen with four primary branches.
- Visual direction: hybrid cinematic realism + anime illustration.
- Home navigation presentation: four large cards in a 2 × 2 grid.
- Home viewport: one fixed screen; no vertical or horizontal scrolling.
- Language and direction: Arabic, RTL.
- Preserve the existing story, Tunisian dialogue, character names, choices, saves, recovery seed, and chapter locks.

## Central home screen
1. Brand header: QARTON mark and studio name.
2. Small upper-left identity badge: "أنمي سينمائي".
3. Main title hierarchy:
   - "قَرْطَاج"
   - "آخر يوم في قرطاج"
4. One short story summary line.
5. Cinematic background artwork: ancient Carthage, restrained atmospheric lighting and readable dark overlay.
6. Four primary navigation cards, arranged 2 × 2.
7. Small footer with version and QARTON identity.

## Four primary branches
### 01 — القصة
- بداية جديدة
- متابعة اللعبة / آخر حفظ صالح
- اختيار الفصل أو الجزء
- Preserve current difficulty selection and existing part-unlock rules.

### 02 — عالم قرطاج
- الشخصيات
- الأماكن
- خريطة العالم
- معلومات وأحداث تاريخية
- If any destination is not implemented yet, show it as a clearly marked future section; do not create fake content or dead controls.

### 03 — التقدم والحفظ
- متابعة آخر حفظ
- خانات الحفظ الحالية
- استيراد نسخة احتياطية
- تصدير نسخة احتياطية
- سجل القرارات والإنجازات where existing data supports them.
- Preserve the existing localStorage keys and confirmed recovery seed behavior.

### 04 — الإعدادات
- الصوت والموسيقى والمؤثرات
- خيارات العرض وإمكانية الوصول
- اللغة (only if an actual alternate language is supported)
- معلومات اللعبة والإصدار

## Interaction and navigation
- Each card opens its own section; each section has an obvious return-to-home action.
- Story actions remain connected to the existing game handlers; no duplicate or replacement story engine.
- During gameplay, hide the home-only brand/card layout and retain existing in-game save and return controls.
- The Part 3 lock must remain controlled by the existing completion check.
- Avoid decorative controls that do not perform a real action.

## Visual system
- Palette: charcoal / midnight navy, restrained antique gold, deep crimson, warm ivory.
- Cards: large touch targets, clear icon + title + short description, consistent spacing.
- Typography: legible Arabic display title and high-contrast body labels.
- Background: one coherent cinematic composition, not multiple competing panels.
- Motion: restrained fade/ambient movement only; honor prefers-reduced-motion.
- No emoji as primary icons; use a consistent icon set or simple inline vector artwork.

## Fixed-screen layout constraints
- Fit common Android portrait screens including safe-area insets.
- Use responsive sizing based on viewport height and width.
- Keep all four cards and the footer visible without scrolling.
- If screen height is short, reduce decorative spacing before reducing touch-target sizes or hiding required controls.
- No fixed overlay may cover the cards or story controls.

## Acceptance checks before enabling the new UI
1. Main screen fits the target phone viewport without scrolling or clipped controls.
2. All four cards open the correct section and return correctly.
3. New game, continue, difficulty selection, and chapter/part locks still work.
4. Save, restore, export, and import flows remain intact.
5. Existing save data is never overwritten by a visual initialization routine.
6. Gameplay UI is unaffected by home-screen styles.
7. Reduced-motion preference is respected.
8. `npm test` passes and the Android APK build succeeds.
9. Test the APK on the user's HONOR device before calling the redesign complete.

## Rollout strategy
- Work on a separate branch.
- First build and inspect the home-screen shell against the actual rendered DOM.
- Keep the current stable home as a fallback.
- Enable the new design only after the acceptance checks pass.
- Do not merge to `main` or replace the user's installed build until device testing confirms stability.
