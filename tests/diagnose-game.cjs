const fs = require('node:fs');
const html = fs.readFileSync('index.html', 'utf8');
const patterns = [
  /localStorage/ig, /sessionStorage/ig, /indexedDB/ig,
  /saveGame|saveState|saveProgress|loadGame|loadState|loadProgress/ig,
  /الجزء\s*[123]|الفصل\s*[123]|ابدأ الجزء|متابعة|استكمال|الرئيسية|القائمة الرئيسية/ig,
  /homeScreen|mainMenu|home-menu|episode|chapter|partSelect|startGame|continueGame/ig,
  /history\.back|popstate|backbutton|backButton/ig
];
for (const re of patterns) {
  const hits = [...html.matchAll(re)].slice(0, 12);
  console.log('\n### ' + re);
  for (const m of hits) {
    const start = Math.max(0, m.index - 350);
    const end = Math.min(html.length, m.index + m[0].length + 550);
    console.log('\n--- offset ' + m.index + ' ---\n' + html.slice(start, end).replace(/\s+/g, ' ').slice(0, 1000));
  }
}
console.log('\n### HTML size ' + html.length);
