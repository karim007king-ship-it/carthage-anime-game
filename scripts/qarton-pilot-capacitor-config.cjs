'use strict';
// Opt-in pilot configuration generator. Does not modify production capacitor.config.json.
const fs=require('node:fs');
const path=require('node:path');
const PROD_ID='com.qarton.carthage';
const PILOT_ID='com.qarton.carthage.pilot';
function createPilotConfig(base){
 if(!base||typeof base!=='object'||Array.isArray(base)||base.appId!==PROD_ID||base.webDir!=='www')
  throw new Error('Unexpected production Capacitor configuration');
 return {...base,appId:PILOT_ID,appName:'QARTON قرطاج PILOT'};
}
function writePilotConfig(basePath,outPath){
 const source=path.resolve(basePath),dest=path.resolve(outPath);
 if(source===dest||dest===path.resolve(process.cwd(),'capacitor.config.json'))
  throw new Error('Refusing to overwrite production Capacitor config');
 const config=createPilotConfig(JSON.parse(fs.readFileSync(source,'utf8')));
 if(fs.existsSync(dest))throw new Error('Refusing to overwrite existing pilot config');
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 fs.writeFileSync(dest,JSON.stringify(config,null,2)+'\n',{flag:'wx'});
 return dest;
}
if(require.main===module){
 if(process.argv.length!==4)throw new Error('Usage: node scripts/qarton-pilot-capacitor-config.cjs <production-config.json> <new-output.json>');
 console.log(writePilotConfig(process.argv[2],process.argv[3]));
}
module.exports={createPilotConfig,writePilotConfig,PROD_ID,PILOT_ID};
