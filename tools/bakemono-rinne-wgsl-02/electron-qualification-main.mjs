import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'node:fs';import path from 'node:path';import { fileURLToPath } from 'node:url';
const TOOL_DIR=path.dirname(fileURLToPath(import.meta.url));const ROOT=path.resolve(TOOL_DIR,'../..');const OUT=process.env.BKR02_PHYSICAL_RESULT??path.join(ROOT,'artifacts/bakemono-rinne-wgsl-02/physical/electron-result.json');
const safe=(rel)=>{const p=path.resolve(ROOT,String(rel));if(!p.startsWith(ROOT+path.sep))throw new Error('path denied');return p;};
ipcMain.handle('bkr02:read-text',(_e,rel)=>fs.readFileSync(safe(rel),'utf8'));ipcMain.handle('bkr02:read-json',(_e,rel)=>JSON.parse(fs.readFileSync(safe(rel),'utf8')));
await app.whenReady();const win=new BrowserWindow({show:false,width:320,height:240,webPreferences:{preload:path.join(TOOL_DIR,'electron-qualification-preload.mjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}});
let finished=false;const timer=setTimeout(()=>{if(finished)return;finished=true;fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,JSON.stringify({status:'PENDING',reason:'E_BKR02_WEBGL_CONTEXT_UNAVAILABLE',detail:'qualification timeout'},null,2)+'\n');app.exit(2);},120000);
ipcMain.once('bkr02:complete',(_e,result)=>{if(finished)return;finished=true;clearTimeout(timer);fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,JSON.stringify(result,null,2)+'\n');app.exit(result?.status==='PASS'?0:2);});
await win.loadFile(path.join(TOOL_DIR,'qualification-page.html'));
