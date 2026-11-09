const fs = require('node:fs');
const html = fs.readFileSync('index.html', 'utf8');
const targets = [
  'X3=', 'P3=', 'vd=', 'Gu=', 'shiganshina-autosave-v1',
  'ابدأ الجزء', 'الجزء الثالث', 'ابدأ المغامرة', 'تابع من حيث وصلت',
  'القائمة الرئيسية', 'العودة للرئيسية', 'الرئيسية', 'الإعدادات',
  'n("home")', 'n("menu")', 'n("game")', 'f==="game"', 'f!=="game"',
  'onBackButton', 'App.addListener', 'history.pushState'
];
for (const target of targets) {
  let from = 0, count = 0, index;
  while ((index = html.indexOf(target, from)) !== -1 && count < 5) {
    console.log('\n### TARGET ' + target + ' OFFSET ' + index);
    console.log(html.slice(Math.max(0, index - 1400), Math.min(html.length, index + 2600)).replace(/\s+/g, ' '));
    from = index + target.length;
    count++;
  }
}
console.log('\n### TAIL RENDER WINDOW');
console.log(html.slice(3700000, 3720000).replace(/\s+/g, ' '));
