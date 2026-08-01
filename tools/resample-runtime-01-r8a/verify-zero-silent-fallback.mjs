import {pathToFileURL} from 'node:url';
import {abs,check,read,sourceArtifact,seal} from './lib.mjs';
const listeners=new Map();const events=[];
const canvas={getContext(){return {};}};
globalThis.CustomEvent=class{constructor(type,init={}){this.type=type;this.detail=init.detail;}};
globalThis.document={querySelector(selector){return selector==='canvas'?canvas:null;},getElementById(id){return id==='canvas'?canvas:null;}};
globalThis.requestAnimationFrame=()=>0;
globalThis.window={
  addEventListener(type,handler){listeners.set(type,handler);},
  dispatchEvent(event){events.push(event);return true;},
  DK_afterFinalColor:async()=>null,
  __DK_EXPORT_BACKEND:'wgpu',
  __DK_EXPORT_USE_WGPU:true,
  __DK_EXPORT_WGPU_ONLY:true,
  exportImage:async()=>({legacy:true}),
};
await import(pathToFileURL(abs('app/legacy-runtime/js/passes/dk_autowire.js')).href+`?r8a=${Date.now()}`);
check(window.exportImage?.__dk_r8a_wrapped===true,'E_R8A_AUTOWIRE_NOT_INSTALLED','export function was not wrapped');
let wgpuOnlyRejected=false;try{await window.exportImage();}catch(error){wgpuOnlyRejected=error?.code==='E_R8A_WGPU_PREPASS_FAILED';}
check(wgpuOnlyRejected,'E_R8A_WGPU_ONLY_FAILURE_SILENCED','WGPU-only failure did not reject');
check(window.__DK_LAST_EXPORT_OUTCOME__?.status==='FAILED'&&window.__DK_LAST_EXPORT_OUTCOME__?.silent===false,'E_R8A_EXPORT_FAILURE_RECEIPT_MISSING','failure outcome receipt missing');
window.__DK_EXPORT_WGPU_ONLY=false;window.__DK_EXPORT_FALLBACK_POLICY='legacy-explicit';
const fallback=await window.exportImage();
check(fallback?.status==='FALLBACK_SUCCESS'&&fallback.fallbackPolicy==='legacy-explicit'&&fallback.fallbackUsed===true,'E_R8A_FALLBACK_RECEIPT_MISSING','explicit fallback receipt missing');
const counters=window.DadumR8AExportOutcomeAuthority.snapshot();
check(counters.failure>=2&&counters.explicitFallback===1&&counters.silentFallback===0,'E_R8A_EXPORT_COUNTER_MISMATCH','export outcome counters invalid',counters);
const source=read('app/legacy-runtime/js/passes/dk_autowire.js');
check(!/__DK_EXPORT_WGPU_ONLY[^\n]*\{[\s\S]{0,80}\breturn\s*;/.test(source),'E_R8A_WGPU_ONLY_FAILURE_SILENCED','bare return remains in WGPU-only branch');
check(source.includes('legacy-explicit')&&source.includes('dadum:export-fallback-authorized'),'E_R8A_FALLBACK_POLICY_MISSING','explicit fallback policy missing');
const report=seal({schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R8A',pass:true,wgpuOnlyFailurePropagated:true,failureCode:'E_R8A_WGPU_PREPASS_FAILED',explicitFallbackPassed:true,fallbackPolicy:'legacy-explicit',eventCount:events.length,counters,silentFallbackCount:0});
sourceArtifact('R8A_ZERO_SILENT_FALLBACK_REPORT.json',report);
console.log('PASS R8A zero silent export fallback');
