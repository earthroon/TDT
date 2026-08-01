import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('bkr02Qualification',Object.freeze({readText:(rel)=>ipcRenderer.invoke('bkr02:read-text',rel),readJson:(rel)=>ipcRenderer.invoke('bkr02:read-json',rel),complete:(result)=>ipcRenderer.send('bkr02:complete',result)}));
