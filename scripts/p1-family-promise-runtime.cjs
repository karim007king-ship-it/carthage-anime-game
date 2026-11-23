'use strict';

// Append-only runtime data and transitions for the first playable expansion scene.
// The same small module is required by tests and embedded by prepare-web.cjs.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.__qartonStoryRuntime = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  const KEY = 'p1-family-promise';
  const SIGNAL_PREFIX = 'familySignal:';
  const choiceIds = new Set(['knocks', 'mother', 'continue']);

  const openingLines = [
    ['لينا — 8 سنوات', 'ريان... تسمع؟ حتى الدار ولات تتنفّس بصعوبة.'],
    ['ريان', 'نسمع. أما توّا أهم حاجة ما نتفرّقوش.'],
    ['سارة — الأم', 'ما تخوّفهاش. السوق قريب، وترجعوا قبل ما تبرد القهوة.'],
    ['لينا — 8 سنوات', 'ماما، كان الباب تسكّر؟ كان ما عادش نسمع صوت خويا؟'],
    ['ريان', 'نعملوا علامة بيناتنا. علامة ما يفهمها حدّ كان إحنا.']
  ];
  const branchLines = {
    knocks: [
      ['ريان', 'اسمعي: دقّة... دقّة... دقّة. كان نتفرّقوا، ندقّ ثلاث مرّات ونستناو الجواب.'],
      ['لينا — 8 سنوات', 'ونجاوبك كيفاش؟'],
      ['ريان', 'دقّتين. هكّا نعرف اللي إنتِ لاباس.'],
      ['سارة — الأم', 'أما ما تقربوش لباب مسكّر كان ما تعرفوش شكون وراه.'],
      ['لينا — 8 سنوات', 'ثلاثة منك، واثنين منّي. ما ننساهمش.']
    ],
    mother: [
      ['ريان', 'لينا، كان نغيب عليك، ما تجريش وحدك. شدّي يد ماما وخليكم جنب الباب الكبير.'],
      ['سارة — الأم', 'ونعلّق الخيط الأحمر في المكان اللي نستناو فيه. هكّا تلقانا.'],
      ['لينا — 8 سنوات', 'حتى كان الناس الكل تجري؟'],
      ['ريان', 'حتى وقتها. ما تتبعيش صوت ما تعرفيهش.'],
      ['الراوي', 'سارة تربط الخيط الأحمر في معصم لينا وتضغط على يدها.']
    ]
  };
  const closingLines = [
    ['سارة — الأم', 'اللي تسمعوه من الحيط... ما تقولوش مجرد ريح. امشوا بعينيكم محلولين.'],
    ['ريان', 'وإنتِ يا ماما؟'],
    ['سارة — الأم', 'أنا نعرف الدار هاذي. توّا امشي... أما ما تنساش وعدك.']
  ];
  const lineObjects = (pairs, offset) => pairs.map(([who, text], index) => ({
    who,
    text,
    id: `story.${KEY}.line-${String(offset + index).padStart(3, '0')}`
  }));

  function createScene(image) {
    return {
      id: 19,
      storyKey: KEY,
      displayChapter: 2,
      title: 'الفصل 2 — الوعد',
      place: 'سلم الدار — قرطاج',
      image,
      after: 'linear',
      hint: 'اختاروا علامة تعاون ريان ولينا على التعرّف لبعضهم إذا تفرّقوا.',
      durationMinutes: 1,
      lines: lineObjects(openingLines, 1),
      hotspots: [],
      choices: [
        { id: 'knocks', label: 'نعلّم لينا ثلاث نقرات', sub: 'ثلاثة منك، واثنين منها', time: 1 },
        { id: 'mother', label: 'نخلّي لينا تشدّ يد سارة', sub: 'الخيط الأحمر يردّهم لبعضهم', time: 1 }
      ]
    };
  }

  function signalFrom(flags) {
    const found = (Array.isArray(flags) ? flags : []).find(flag => typeof flag === 'string' && flag.startsWith(SIGNAL_PREFIX));
    const signal = found && found.slice(SIGNAL_PREFIX.length);
    return signal === 'knocks' || signal === 'mother' ? signal : 'unknown';
  }

  function resolveScene(scene, flags) {
    if (!scene || scene.storyKey !== KEY) return scene;
    const signal = signalFrom(flags);
    if (signal === 'unknown') return scene;
    return {
      ...scene,
      lines: [...lineObjects(branchLines[signal], signal === 'knocks' ? 6 : 11), ...lineObjects(closingLines, 15)],
      choices: [{ id: 'continue', label: 'نمشيوا للسوق', sub: 'نكمّلوا طريقنا من غير ما ننسوا الوعد', time: 0 }]
    };
  }

  function selectChoice(choiceId, flags, time) {
    const currentFlags = Array.isArray(flags) ? [...flags] : [];
    if (!choiceIds.has(choiceId)) return { accepted: false, reason: 'unknown-choice', flags: currentFlags, time };
    if (choiceId === 'continue') {
      if (signalFrom(currentFlags) === 'unknown') return { accepted: false, reason: 'signal-required', flags: currentFlags, time };
      return { accepted: true, kind: 'continue', flags: currentFlags, time };
    }
    if (signalFrom(currentFlags) !== 'unknown') return { accepted: false, reason: 'signal-already-selected', flags: currentFlags, time };
    const nextTime = Math.max(0, (Number.isFinite(time) ? time : 0) - 1);
    currentFlags.push(`${SIGNAL_PREFIX}${choiceId}`);
    return { accepted: true, kind: 'branch', signal: choiceId, flags: currentFlags, time: nextTime };
  }

  function displayChapter(engineIndex) {
    if (engineIndex === 0) return 1;
    if (engineIndex === 18) return 2;
    return engineIndex > 0 && engineIndex < 18 ? engineIndex + 2 : engineIndex + 1;
  }

  function resolveNext(engineIndex, choiceId) {
    if (engineIndex === 0) return 18;
    if (engineIndex === 18 && choiceId === 'continue') return 1;
    if (engineIndex >= 1 && engineIndex < 17) return engineIndex + 1;
    return null;
  }

  function restoreProgress(save, scenes) {
    if (!save || !Number.isInteger(save.sceneIdx) || save.sceneIdx < 0 || save.sceneIdx >= scenes.length) {
      throw new Error('invalid sceneIdx');
    }
    const resolved = resolveScene(scenes[save.sceneIdx], save.flags || []);
    const lineIdx = Math.min(Math.max(0, Number.isInteger(save.lineIdx) ? save.lineIdx : 0), Math.max(0, resolved.lines.length - 1));
    return { sceneIdx: save.sceneIdx, lineIdx, flags: Array.isArray(save.flags) ? [...save.flags] : [], state: save.state };
  }

  return { KEY, SIGNAL_PREFIX, createScene, resolveScene, selectChoice, signalFrom, displayChapter, resolveNext, restoreProgress };
});
