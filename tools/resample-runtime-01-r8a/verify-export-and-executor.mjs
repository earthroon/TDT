import {pathToFileURL} from 'node:url';
import ts from '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js';
import fs from 'node:fs';
import {abs,check,read,sourceArtifact,seal} from './lib.mjs';
const originalWindow=globalThis.window,originalDocument=globalThis.document,originalCustomEvent=globalThis.CustomEvent,originalRAF=globalThis.requestAnimationFrame;
try{
  globalThis.window={dispatchEvent(){},addEventListener(){},__DK_EXPORT_FORMAT:'png'};
  globalThis.document={getElementById(){return null;},addEventListener(){},querySelector(){return null;}};
  globalThis.CustomEvent=class{constructor(type,init={}){this.type=type;this.detail=init.detail;}};
  const module=await import(pathToFileURL(abs('app/legacy-runtime/js/export/wgpu_export_install.js')).href+`?r8a=${Date.now()}`);
  check(module.mapUIExportFormatToWGPU('png16')==='png','E_R8A_WGPU_FORMAT_POLICY','PNG16 mapping failed');
  check(module.mapUIExportFormatToWGPU('webp-lossless')==='webp','E_R8A_WGPU_FORMAT_POLICY','WebP mapping failed');
  let jpegRejected=false;try{module.mapUIExportFormatToWGPU('jpeg');}catch(error){jpegRejected=error?.code==='E_R8A_WGPU_EXPORT_FORMAT_UNSUPPORTED';}
  check(jpegRejected,'E_R8A_WGPU_FORMAT_COERCION','JPEG was silently coerced');
  const receipt=module.wgpuExportModuleReceipt();check(receipt.implicitPngCoercionCount===0&&receipt.supportedFormats.join(',')==='jxl,png,webp','E_R8A_WGPU_FORMAT_POLICY','WGPU module receipt invalid');
} finally {globalThis.window=originalWindow;if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;globalThis.CustomEvent=originalCustomEvent;globalThis.requestAnimationFrame=originalRAF;}
const changedTs=[
'app/src/runtime/resample/canonical-resample-executor-r8a.ts',
'app/src/runtime/resample/resample-compatibility-types.ts',
'app/src/runtime/resample/resample-worker-broker-service.ts',
'app/src/boot/runtime-modules.ts',
'app/src/runtime/active-graph/active-graph-service.ts',
];
const transpile=[];
for(const rel of changedTs){const result=ts.transpileModule(read(rel),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,strict:true},reportDiagnostics:true,fileName:rel});const errors=(result.diagnostics||[]).filter(item=>item.category===ts.DiagnosticCategory.Error);check(errors.length===0,'E_R8A_TYPESCRIPT_PARSE_FAILED',`TypeScript transpile failed: ${rel}`,errors.map(item=>ts.flattenDiagnosticMessageText(item.messageText,' ')));transpile.push(rel);}
const broker=read('app/src/runtime/resample/resample-worker-broker-service.ts');
const executor=read('app/src/runtime/resample/canonical-resample-executor-r8a.ts');
const runtime=read('app/src/boot/runtime-modules.ts');
check(broker.includes('createCanonicalResampleExecutorR8A')&&broker.includes('this.registerExecutor('),'E_R8A_EXECUTOR_REGISTRATION_MISSING','canonical executor registration missing');
check(broker.includes('this.#unregisterExecutor?.()')&&broker.includes('E_RUNTIME_SERVICE_COLLISION'),'E_R8A_EXECUTOR_LIFECYCLE_INVALID','executor unregister or collision guard missing');
check(executor.includes('executeCanonicalAdaptiveR1D')&&!executor.includes('CPU')&&executor.includes("outputMode !== 'surface'"),'E_R8A_CANONICAL_EXECUTOR_INVALID','canonical executor path invalid');
check(executor.includes('sha256Json(compatibility.resampleReceipt)')&&broker.includes('sha256Json(result.resampleReceipt)'),'E_R8A_RECEIPT_DIGEST_NOT_RECOMPUTED','receipt digest is not recomputed at executor and broker');
check(runtime.includes('ResampleWorkerBrokerService')&&runtime.includes('new ResampleWorkerBrokerService(gpu, surfaces, diagnostics)'),'E_R8A_EXECUTOR_BOOTSTRAP_MISSING','runtime composition does not provide broker dependencies');
const report=seal({schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R8A',pass:true,wgpuSupportedFormats:['jxl','png','webp'],jpegRejected:true,implicitPngCoercionCount:0,canonicalExecutorRegistered:true,executorAuthority:'tdt.resample.canonical-executor-registration.r8a.v1',receiptDigestRecomputedAt:['executor','broker'],typescriptTranspilePassCount:transpile.length,fullVueTypecheckPerformed:false,fullVueTypecheckReason:'node_modules unavailable in source bake environment'});
sourceArtifact('R8A_EXPORT_AND_EXECUTOR_SOURCE_REPORT.json',report);
console.log('PASS R8A export module and canonical executor source closure');
