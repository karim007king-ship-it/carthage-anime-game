'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const prepare=fs.readFileSync(path.join(__dirname,'../scripts/prepare-web.cjs'),'utf8');
assert.ok(prepare.includes('if(f!=="game"&&f!=="ending")return;'), 'Autosave must also cover ending screen');
assert.ok(prepare.includes('[f,T,B,L,K,cu,k,Zn]'), 'Ending and seen-ending state must trigger autosave');
assert.ok(!prepare.includes('if(f!=="game")return;let timer=window.setTimeout(()=>{try{ur(cz,!0)}'), 'Old ending-excluding autosave hook must be gone');
console.log('Android ending autosave hook: PASS (source guard; device behavior unverified)');
