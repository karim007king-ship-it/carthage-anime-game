'use strict';
// Export static pilot previews only into an explicitly supplied isolated directory.
// Never write into production www, index.html, or Android sources.
const fs=require('node:fs');
const path=require('node:path');
const {createPilotChapterNavigator}=require('./qarton-pilot-chapter-navigator.cjs');
const {renderPilotChapterHtml}=require('./qarton-pilot-preview-html.cjs');
const {SUPPORTED}=require('./qarton-pilot-preview-text.cjs');
const ROOT=path.resolve(__dirname,'..');
function exportPilotPreview(outputDir,root=ROOT){
 if(typeof outputDir!=='string'||!outputDir.trim()) throw new Error('Explicit output directory required');
 const target=path.resolve(outputDir);
 const forbidden=[root,path.join(root,'www'),path.join(root,'android'),path.join(root,'app')].map(p=>path.resolve(p));
 if(forbidden.some(p=>target===p||target.startsWith(p+path.sep))) throw new Error('Refusing to export inside source or production directories');
 const nav=createPilotChapterNavigator(root);
 const files=[];
 for(const entry of nav.entries){
  for(const locale of SUPPORTED){
   const filename=locale+'/'+entry.id+'.html';
   files.push({filename,html:renderPilotChapterHtml(entry.id,locale,root)});
  }
 }
 if(fs.existsSync(target)&&fs.readdirSync(target).length) throw new Error('Output directory must be empty');
 for(const item of files){
  const dest=path.join(target,item.filename);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.writeFileSync(dest,item.html,'utf8');
 }
 return Object.freeze({directory:target,chapters:nav.entries.length,locales:SUPPORTED.length,files:files.length});
}
if(require.main===module){
 const dir=process.argv[2];
 if(!dir) {console.error('Usage: node scripts/qarton-pilot-preview-export.cjs <empty-directory-outside-repo>');process.exitCode=2;}
 else console.log(JSON.stringify(exportPilotPreview(dir),null,2));
}
module.exports={exportPilotPreview};
