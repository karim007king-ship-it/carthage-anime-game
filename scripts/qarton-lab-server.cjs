'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
http.createServer((req,res)=>{
  let pathname;
  try { pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404).end();return;}
    const ext=path.extname(file);
    res.setHeader('Content-Type',ext==='.html'?'text/html; charset=utf-8':ext==='.json'?'application/json':ext==='.js'?'text/javascript':'text/plain');
    res.end(data);
  });
}).listen(41739,'127.0.0.1',()=>console.log('QARTON lab: http://127.0.0.1:41739/examples/qarton-single-load-lab.html'));
