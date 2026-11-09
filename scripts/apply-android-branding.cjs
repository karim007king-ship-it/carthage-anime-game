const fs = require('node:fs');
const path = require('node:path');
const root = path.join('android','app','src','main');
const res = path.join(root,'res');
const write = (p, s) => { fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p,s); };
const foreground = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#8F1724" android:pathData="M0,0h108v108h-108z"/>
    <path android:fillColor="#B9272F" android:pathData="M9,9h90v90h-90z"/>
    <path android:strokeColor="#F4C76B" android:strokeWidth="4" android:fillColor="#00000000"
        android:pathData="M22,86V49C22,29 36,16 54,16C72,16 86,29 86,49V86"/>
    <path android:fillColor="#F4C76B" android:pathData="M26,82h12V49c0,-10 7,-18 16,-18s16,8 16,18v33h12V49C82,31 70,19 54,19S26,31 26,49z"/>
    <path android:fillColor="#17243D" android:pathData="M42,82V52c0,-7 5,-12 12,-12s12,5 12,12v30z"/>
    <path android:fillColor="#F4C76B" android:pathData="M18,84h72v7H18zM22,92h64v4H22z"/>
    <path android:fillColor="#F4C76B" android:pathData="M18,34l5,-8 5,8 -5,8zM80,34l5,-8 5,8 -5,8z"/>
    <path android:fillColor="#FFFFFF" android:pathData="M72,17a10,10 0,1 0,12 14a8,8 0,1 1,-12 -14z"/>
    <path android:fillColor="#FFFFFF" android:pathData="M87,20l2,5 5,0 -4,3 1,5 -4,-3 -4,3 1,-5 -4,-3 5,0z"/>
</vector>`;
const adaptive = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/carthage_icon_background"/>
    <foreground android:drawable="@drawable/ic_carthage_foreground"/>
</adaptive-icon>`;
const legacy = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <path android:fillColor="#17243D" android:pathData="M0,0h108v108h-108z"/>
    <path android:fillColor="#8F1724" android:pathData="M10,10h88v88h-88z"/>
    <path android:strokeColor="#F4C76B" android:strokeWidth="5" android:fillColor="#00000000" android:pathData="M24,85V49C24,29 37,17 54,17C71,17 84,29 84,49V85"/>
    <path android:fillColor="#F4C76B" android:pathData="M27,82h12V50c0,-9 6,-16 15,-16s15,7 15,16v32h12V50C81,31 69,20 54,20S27,31 27,50z"/>
    <path android:fillColor="#17243D" android:pathData="M43,82V52c0,-7 4,-12 11,-12s11,5 11,12v30z"/>
    <path android:fillColor="#F4C76B" android:pathData="M17,85h74v7H17zM22,93h64v4H22z"/>
    <path android:fillColor="#FFFFFF" android:pathData="M73,17a10,10 0,1 0,12 14a8,8 0,1 1,-12 -14z"/>
    <path android:fillColor="#FFFFFF" android:pathData="M88,20l2,5 5,0 -4,3 1,5 -4,-3 -4,3 1,-5 -4,-3 5,0z"/>
</vector>`;
write(path.join(res,'drawable','ic_carthage_foreground.xml'),foreground);
write(path.join(res,'values','carthage_icon.xml'),`<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="carthage_icon_background">#17243D</color></resources>\n`);
for (const name of ['ic_launcher','ic_launcher_round']) {
  write(path.join(res,'mipmap-anydpi-v26',name+'.xml'),adaptive);
  write(path.join(res,'mipmap-anydpi',name+'.xml'),legacy);
}
const manifestPath = path.join(root,'AndroidManifest.xml');
let manifest = fs.readFileSync(manifestPath,'utf8');
manifest = manifest.replace(/<application\\b([^>]*)>/, (all, attrs) => {
  let next = attrs.replace(/\\s+android:icon="[^"]*"/,'').replace(/\\s+android:roundIcon="[^"]*"/,'');
  return '<application'+next+' android:icon="@mipmap/ic_launcher" android:roundIcon="@mipmap/ic_launcher_round">';
});
fs.writeFileSync(manifestPath,manifest);
console.log('Android launcher icon applied: Carthage red, gold, and navy adaptive icon.');
