const fs = require('node:fs');
const html = fs.readFileSync('index.html', 'utf8');
const targets = [
  'Bu=', 'Zu=', 'Vv=', 'Bu(', 'Zu(', 'Vv(',
  'useState("home")', 'useState("menu")', 'useState("intro")', 'useState("start")', 'useState("select")',
  'n("home")', 'n("menu")', 'n("start")', 'n("select")',
  'part1', 'part2', 'part3', 'الجزء الأول', 'الجزء الثاني', 'الجزء الثالث',
  'ابدأ الجزء', 'الجزء 3', 'الفصل 15', 'العودة إلى الرئيسية',
  'شاشة البداية', 'متابعة اللعبة', 'حفظ قرطاج'
];
for (const target of targets) {
  let from = 0, count = 0, index;
  while ((index = html.indexOf(target, from)) !== -1 && count < 4) {
    console.log('\n### TARGET ' + target + ' OFFSET ' + index);
    console.log(html.slice(Math.max(0, index - 1600), Math.min(html.length, index + 3000)).replace(/\s+/g, ' '));
    from = index + target.length;
    count++;
  }
}
for (const re of [/useState\(["'][^"']+["']\)/g, /n\(["'][^"']+["']\)/g]) {
  console.log('\n### SCREEN STATE MATCHES ' + re);
  console.log([...html.matchAll(re)].slice(-35).map(m=>m[0]+' @'+m.index).join('\n'));
}
console.log('\n### HTML size ' + html.length);
