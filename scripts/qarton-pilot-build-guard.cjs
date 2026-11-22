'use strict';
// Fail-closed, read-only guard for a future isolated pilot build.
const fs=require('node:fs');
const path=require('node:path');
const {PROD_ID,PILOT_ID}=require('./qarton-pilot-capacitor-config.cjs');
function assertPilotBuildConfig(pilot,production){
 if(!pilot||typeof pilot!=='object'||Array.isArray(pilot)||!production||typeof production!=='object'||Array.isArray(production))throw Error('Invalid configuration');
 if(production.appId!==PROD_ID)throw Error('Unexpected production app identity');
 if(pilot.appId!==PILOT_ID||pilot.appId===production.appId)throw Error('Unsafe pilot app identity');
 if(pilot.webDir!=='www'||production.webDir!=='www')throw Error('Unexpected webDir');
 if(typeof pilot.appName!=='string'||!pilot.appName.includes('PILOT'))throw Error('Missing visible pilot label');
 return {safe:true,pilotAppId:pilot.appId};
}
function guardFiles(pilotPath,productionPath){
 const pilot=path.resolve(pilotPath),prod=path.resolve(productionPath);
 if(pilot===prod)throw Error('Pilot config must be a separate file');
 return assertPilotBuildConfig(JSON.parse(fs.readFileSync(pilot,'utf8')),JSON.parse(fs.readFileSync(prod,'utf8')));
}
if(require.main===module){
 if(process.argv.length!==4)throw Error('Usage: node scripts/qarton-pilot-build-guard.cjs <pilot-config.json> <production-config.json>');
 console.log(JSON.stringify(guardFiles(process.argv[2],process.argv[3])));
}
module.exports={assertPilotBuildConfig,guardFiles};
