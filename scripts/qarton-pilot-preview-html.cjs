'use strict';
// Standalone offline HTML preview: no JavaScript, no original game hooks, no save access.
const {createPilotChapterNavigator}=require('./qarton-pilot-chapter-navigator.cjs');
const {resolvePilotPreviewText,SUPPORTED}=require('./qarton-pilot-preview-text.cjs');
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderPilotChapterHtml(chapterId,locale='tn',root){
  if(!SUPPORTED.includes(locale)) throw new Error('Unsupported locale');
  const nav=createPilotChapterNavigator(root);
  const chapter=nav.resolve(chapterId);
  const preview=resolvePilotPreviewText(chapterId,locale,root);
  const dir=['tn','ar'].includes(locale)?'rtl':'ltr';
  const items=preview.lines.map(line=>'<li><small>'+escapeHtml(line.key)+'</small><p>'+escapeHtml(line.missing?'[Translation pending]':line.text)+'</p></li>').join('');
  const heading=chapter.kind==='draft'?'Draft chapter preview':'Original chapter — preview disabled';
  return '<!doctype html><html lang="'+locale+'" dir="'+dir+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QARTON PILOT Preview</title><style>body{font:16px system-ui,sans-serif;background:#12131a;color:#f5f1e8;max-width:720px;margin:auto;padding:24px;line-height:1.7}h1{color:#e8c17a}li{border-bottom:1px solid #48444a;padding:12px 0;overflow-wrap:anywhere}small{color:#b9b3ac}p{white-space:pre-wrap}aside{border:1px solid #947b55;padding:12px}</style></head><body><h1>QARTON PILOT</h1><aside>Read-only / preview only — no choices, no save writes, no production integration.</aside><h2>'+escapeHtml(heading)+' #'+chapter.displayChapter+'</h2><p>'+escapeHtml(chapter.id)+' · '+escapeHtml(locale)+' · '+preview.translatedCount+'/'+preview.lines.length+' translated</p><ol>'+items+'</ol></body></html>';
}
module.exports={renderPilotChapterHtml,escapeHtml};
