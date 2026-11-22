// Included in the bundled React module by prepare-web.cjs.
// The card artwork and copy come from the QARTON four-section home.
const qartonCards = [
  { id: 'story', icon: '⚔︎', label: ['القصة', 'القصة', 'Story', 'Histoire'], subtitle: ['بداية جديدة • الأجزاء المتاحة', 'بداية جديدة • الأجزاء المتاحة', 'New game • Available parts', 'Nouvelle partie • Chapitres disponibles'] },
  { id: 'world', icon: '⌖', label: ['عالم قرطاج', 'عالم قرطاج', 'World of Carthage', 'Univers de Carthage'], subtitle: ['الشخصيات • الأماكن • دليل المدينة', 'الشخصيات • الأماكن • دليل المدينة', 'Characters • Places • City guide', 'Personnages • Lieux • Guide de la ville'] },
  { id: 'progress', icon: '▣', label: ['التقدم والحفظ', 'التقدم والحفظ', 'Progress and saves', 'Progression et sauvegardes'], subtitle: ['متابعة تقدمك • النسخ الاحتياطية', 'متابعة تقدمك • النسخ الاحتياطية', 'Resume • Backups', 'Reprendre • Copies de secours'] },
  { id: 'settings', icon: '⚙︎', label: ['الإعدادات', 'الإعدادات', 'Settings', 'Paramètres'], subtitle: ['الصوت السينمائي • مستوى الصوت', 'الصوت السينمائي • مستوى الصوت', 'Cinematic audio • Volume', 'Son cinématique • Volume'] }
];

const qartonLanguages = ['ar-TN', 'ar', 'en', 'fr'];
const qartonLanguageKey = 'qarton-home-language-v1';

function QartonHome({ game }) {
  const h = y.createElement;
  const [view, setView] = y.useState('home');
  const [dialog, setDialog] = y.useState(null);
  const [language, setLanguage] = y.useState(() => {
    try {
      return Math.max(0, qartonLanguages.indexOf(localStorage.getItem(qartonLanguageKey)));
    } catch {
      return 0;
    }
  });
  const audio = window.__CARTHAGE_V17_PILOT_API__;
  const [sound, setSound] = y.useState(() => audio?.getState());
  const scroll = y.useRef(null);
  const importInput = y.useRef(null);
  const modalRef = y.useRef(null);
  y.useLayoutEffect(() => {
    const element = modalRef.current;
    if (!dialog || !element) return;
    if (!element.open) element.showModal();
    return () => { if (element.open) element.close(); };
  }, [dialog]);
  const heading = y.useRef(null);
  const lastView = y.useRef('home');

  y.useLayoutEffect(() => {
    scroll.current.scrollTop = 0;
    if (view !== lastView.current) heading.current.focus({ preventScroll: true });
    lastView.current = view;
  }, [view]);

  const tr = (tn, ar, en, fr) => [tn, ar, en, fr][language];
  const button = (label, onClick, props = {}) => h('button', {
    type: 'button', className: 'qv-action', onClick, ...props
  }, label);
  const details = (id, label, content) => h('details', { id, key: id }, h('summary', null, label), content);
  const backText = tr('رجوع للقائمة', 'العودة إلى القائمة', 'Back to home', 'Retour à l’accueil');
  const returnHome = () => { setDialog(null); setView('home'); };
  const headingProps = { ref: heading, tabIndex: -1 };
  const title = tr('آخر يوم في قرطاج', 'آخر يوم في قرطاج', 'The Last Day in Carthage', 'Le Dernier Jour à Carthage');
  const part1 = tr('ابدأ الجزء الأول', 'ابدأ الجزء الأول', 'Start Part 1', 'Commencer la partie 1');
  let content;

  if (view === 'home') {
    content = h('div', { className: 'qv-wrap' },
      h('header', { className: 'qv-hero' },
        h('div', { className: 'qv-brand', dir: 'ltr' },
          h('span', { className: 'qv-mark', 'aria-hidden': true }, 'Q'),
          h('div', null, h('div', { className: 'qv-brand-name' }, 'QARTON'),
            h('div', { className: 'qv-tag' }, 'CULTURE • POWER • CINEMA'))),
        h('h1', { ...headingProps, className: 'qv-title' },
          h('span', { className: 'qv-arabic-mark', lang: 'ar' }, 'قَرْطَاج'),
          h('span', null, title)),
        h('p', { className: 'qv-description' }, tr(
          'حكاية تفاعلية من التاريخ… قراراتك ترسم الطريق ومصير قرطاج.',
          'حكاية تفاعلية من التاريخ… قراراتك ترسم الطريق ومصير قرطاج.',
          'An interactive tale from history… Your decisions shape the journey and the fate of Carthage.',
          'Un récit historique interactif… Vos décisions tracent la route et le destin de Carthage.'))),
      h('div', { className: 'qv-grid' }, qartonCards.map((card, index) =>
        button([
          h('span', { key: 'num', className: 'qv-card-num', 'aria-hidden': true }, `0${index + 1}`),
          h('span', { key: 'icon', className: 'qv-card-icon', 'aria-hidden': true }, card.icon),
          h('strong', { key: 'title', className: 'qv-card-title' }, card.label[language]),
          h('span', { key: 'sub', className: 'qv-card-sub' }, card.subtitle[language])
        ], () => setView(card.id), { key: card.id, className: 'qv-card', 'data-qarton-card': card.id }))),
      h('footer', { className: 'qv-footer' }, tr(
        'QARTON — رحلتك • اختياراتك • مصيرك', 'QARTON — رحلتك • اختياراتك • مصيرك',
        'QARTON — Your journey • Your choices • Your fate',
        'QARTON — Votre voyage • Vos choix • Votre destin')));
  } else {
    let panel;
    if (view === 'story') {
      panel = [
        button(part1, () => game.hasSave ? setDialog('new') : game.start(), { id: 'qarton-start', key: 'start' }),
        button(tr('الجزء الثاني — ما وراء السور', 'الجزء الثاني — ما وراء السور', 'Part 2 — Beyond the Wall', 'Partie 2 — Au-delà du mur'),
          game.startPart2, { id: 'btn-part2', key: 'part2' }),
        button(game.canStartPart3 ?
          tr('الجزء الثالث — ما بعد الحقيقة', 'الجزء الثالث — ما بعد الحقيقة', 'Part 3 — Beyond the Truth', 'Partie 3 — Au-delà de la vérité') :
          tr('الجزء الثالث — يفتح بعد إتمام الجزء الثاني', 'الجزء الثالث — يُفتح بعد إتمام الجزء الثاني', 'Part 3 — Complete Part 2 to unlock', 'Partie 3 — Terminez la partie 2 pour débloquer'),
          game.startPart3, { id: 'carthage-part3-start', key: 'part3', disabled: !game.canStartPart3 }),
        h('fieldset', { key: 'difficulty' },
          h('legend', null, tr('الصعوبة', 'الصعوبة', 'Difficulty', 'Difficulté')),
          ['normal', 'easy', 'hard'].map((level, index) => button(
            [tr('عادية', 'عادية', 'Normal', 'Normale'), tr('سهلة', 'سهلة', 'Easy', 'Facile'), tr('صعيبة', 'صعبة', 'Hard', 'Difficile')][index],
            () => game.setDifficulty(level), { key: level, 'aria-pressed': game.difficulty === level })))
      ];
    } else if (view === 'world') {
      panel = [
        details('qarton-characters', tr('الشخصيات', 'الشخصيات', 'Characters', 'Personnages'),
          h('ul', { lang: 'ar-TN', dir: 'rtl' }, game.characters.map(person =>
            h('li', { key: person.id }, h('strong', null, `${person.name} — ${person.role}`), h('p', null, person.desc))))),
        details('qarton-places', tr('أماكن قرطاج', 'أماكن قرطاج', 'Places', 'Lieux'),
          h('ul', { lang: 'ar-TN', dir: 'rtl' }, game.places.map((place, index) =>
            h('li', { key: index }, place)))),
        details('qarton-guide', tr('دليل المدينة', 'دليل المدينة', 'City guide', 'Guide de la ville'),
          h('ul', { lang: 'ar-TN', dir: 'rtl' }, [
            'عندك 60 دقيقة. كل اختيار ينقص من الوقت.',
            'اضغط على النقاط المضيئة باش تلقى أدوات وأسرار.',
            'اقرا الحوار، اضغط عليه باش تكمل.',
            'في السوق والجسر عندك ثواني معدودة برك (حسب الصعوبة).'
          ].map(line => h('li', { key: line }, line)))),
        details('qarton-endings', tr('النهايات', 'النهايات', 'Endings', 'Fins'),
          h('ul', { lang: 'ar-TN', dir: 'rtl' }, game.endings.map(ending =>
            h('li', { key: ending.key }, h('strong', null, ending.title), ' — ', ending.desc))))
      ];
    } else if (view === 'progress') {
      panel = [
        button(tr('متابعة آخر حفظ', 'متابعة آخر حفظ', 'Continue last save', 'Reprendre la dernière sauvegarde'),
          game.continue, { id: 'carthage-continue-last', key: 'continue', disabled: !game.hasSave }),
        button(tr('خانات الجلسة', 'خانات الحفظ', 'Save slots', 'Emplacements de sauvegarde'),
          () => setDialog('slots'), { id: 'qarton-save-slots', key: 'slots', disabled: !game.slots.some(Boolean) }),
        button(tr('تصدير نسخة احتياطية', 'تصدير نسخة احتياطية', 'Export backup', 'Exporter une sauvegarde'),
          window.__carthageSaveTransfer.exportSave, { id: 'carthage-export-backup', key: 'export', disabled: !game.hasSave }),
        h('input', { key: 'file', id: 'carthage-import-file', ref: importInput, hidden: true, type: 'file',
          accept: '.json,application/json', onChange: event => {
            window.__carthageSaveTransfer.importFile(event.currentTarget.files[0], game.importLegacy);
            event.currentTarget.value = '';
          } }),
        button(tr('استيراد ملف حفظ سابق', 'استيراد ملف حفظ سابق', 'Import save file', 'Importer une sauvegarde'),
          () => importInput.current.click(), { id: 'carthage-import-backup', key: 'import' }),
        h('p', { key: 'achievements' }, tr('إنجازاتي', 'الإنجازات', 'Achievements', 'Succès'), ` ${game.achievements.length}/7`)
      ];
    } else {
      panel = [
        h('label', { key: 'language', className: 'qv-field' },
          tr('لغة القوائم', 'لغة القوائم', 'Menu language', 'Langue des menus'),
          h('select', { id: 'qarton-language', value: language, onChange: event => {
            const next = Number(event.target.value);
            setLanguage(next);
            try { localStorage.setItem(qartonLanguageKey, qartonLanguages[next]); } catch {}
          } }, ['التونسية', 'العربية', 'English', 'Français'].map((name, index) =>
            h('option', { key: name, value: index, lang: qartonLanguages[index] }, name)))),
        sound && button(tr('الصوت السينمائي', 'الصوت السينمائي', 'Cinematic sound', 'Son cinématique'), () => {
          audio.setEnabled(!sound.enabled);
          setSound(audio.getState());
        }, { id: 'qarton-cinematic-sound', key: 'sound', 'aria-pressed': sound.enabled }),
        sound && h('label', { key: 'volume', className: 'qv-field' },
          tr('مستوى الصوت السينمائي', 'مستوى الصوت السينمائي', 'Cinematic volume', 'Volume cinématique'),
          h('input', { id: 'qarton-cinematic-volume', type: 'range', min: 0, max: 100, value: Math.round(sound.volume * 100),
            onChange: event => { audio.setVolume(Number(event.target.value)); setSound(audio.getState()); } }),
          h('output', null, `${Math.round(sound.volume * 100)}%`)),
        h('div', { key: 'options', lang: 'ar-TN', dir: 'rtl' }, game.audioControls, game.motionControls,
          button('خط كبير', game.toggleLargeText, { 'aria-pressed': game.largeText }),
          button('أقل اهتزاز', game.toggleReducedShake, { 'aria-pressed': game.reducedShake }),
          button('وضع الاختبار 🧪', game.test, { id: 'btn-test' }))
      ];
    }
    const card = qartonCards.find(item => item.id === view);
    content = h('div', { className: 'qv-panel' },
      button(backText, returnHome, { id: 'qarton-home-back' }),
      h('h1', headingProps, card.label[language]),
      h('div', { className: 'qv-actions' }, y.Children.toArray(panel)));
  }

  let modal;
  if (dialog === 'new') {
    modal = h('dialog', { ref: modalRef, className: 'qv-dialog', onCancel: () => setDialog(null), 'aria-labelledby': 'qarton-dialog-title' },
      h('h2', { id: 'qarton-dialog-title' }, tr('لعبة جديدة؟', 'لعبة جديدة؟', 'Start a new game?', 'Commencer une nouvelle partie ?')),
      button(tr('إيه، ابدأ', 'نعم، ابدأ', 'Start', 'Commencer'), game.start, { id: 'qarton-confirm-start' }),
      button(backText, returnHome));
  } else if (dialog === 'slots') {
    modal = h('dialog', { ref: modalRef, className: 'qv-dialog', onCancel: () => setDialog(null), 'aria-labelledby': 'qarton-dialog-title' },
      h('h2', { id: 'qarton-dialog-title' }, tr('خانات الجلسة', 'خانات الحفظ', 'Save slots', 'Emplacements de sauvegarde')),
      game.slots.map((slot, index) => slot ?
        button(`${index + 1} — ${slot.sceneName}`, () => game.restore(slot), { key: index }) :
        h('p', { key: index }, `${index + 1} — ${tr('فارغة', 'فارغة', 'Empty', 'Vide')}`)),
      button(tr('سكّر', 'إغلاق', 'Close', 'Fermer'), () => setDialog(null)));
  }

  return h('main', { id: 'qarton-home-v2', dir: language < 2 ? 'rtl' : 'ltr', lang: qartonLanguages[language],
    ref: scroll, 'data-qarton-view': view },
    content,
    modal,
    game.part2Dialog,
    game.notice && h('div', { className: 'qv-notice', role: 'status' }, game.notice));
}
