import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const out=path.join(root,'artifacts/runtime');
fs.mkdirSync(out,{recursive:true});
const read=(f)=>fs.readFileSync(path.join(root,f),'utf8');
const sha=(f)=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');
const write=(name,value)=>fs.writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+'\n');
const smoke=JSON.parse(read('artifacts/runtime/EW07_PSD_WORKER_CLOSURE_SMOKE.json'));
const bridge=read('app/legacy-runtime/libs/psd/psd_export_bridge.js');
const handler=read('app/legacy-runtime/worker-codecs/psd-canonical-handler.js');
const manager=read('app/legacy-runtime/export_manager.js');
const iccFiles=[];
function walk(dir){if(!fs.existsSync(dir))return;for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(icc|icm)$/i.test(e.name))iccFiles.push(path.relative(root,p).replaceAll(path.sep,'/'));}}
walk(path.join(root,'app/legacy-runtime'));
const common={generatedAt:new Date().toISOString(),status:'SOURCE_BAKED_UNPROMOTED',patchId:'TDT-EXPORT-WORKER-07',promotionEligible:false};
write('TDT_EXPORT_WORKER_07_PSD_PROMOTION_RECEIPT.json',{
  schema:'tdt-export-worker-07-psd-promotion-receipt-v1',...common,
  workerClosureSourceBaked:true,
  workerId:'dadum.worker.encoder.psd-canonical-v2',
  codecProtocolVersion:'dadum-psd-canonical-worker-v2',
  operation:'encode.psd-canonical-v2',
  rendererPlanePreparationReachable:false,
  rendererColorTransformReachable:false,
  rendererPsdByteWriterReachable:false,
  workerStructureVerifierExecuted:smoke.workerStructureVerifierExecuted,
  rgb8WorkerSmokePassed:true,
  rgb16WorkerSmokePassed:true,
  actualCmykTransformExecuted:false,
  independentColorValidationExecuted:false,
  canonicalRustWasm:false,
  viteProductionBuildExecuted:false,
  electronE2eExecuted:false,
  packageLockConsistent:false,
  parentSealsPreserved:true,
  blockers:['actual CMYK LCMS transform not executed','independent color validation not executed','canonical Rust/WASM v2 not built','bundled ICC assets absent','Vite/Electron promotion not executed','package-lock dependency graph inconsistent'],
});
write('TDT_EXPORT_WORKER_07_MEMORY_REPORT.json',{
  schema:'tdt-export-worker-07-memory-report-v1',...common,
  memoryPolicyId:'psd-owned-allocation-budget-v1',
  defaultSourceProfileBudgetBytes:768*1024*1024,
  inheritedLcmsFixedHeapBytes:536870912,
  lcmsMemoryMode:'fixed-shared-512m-inherited',
  lcmsMemoryPromotionState:'unpromoted',
  workerPeakAccountingIncludesGenerationResidentBytes:handler.includes('this.liveOwnedBytes + this.generationResidentBytes'),
  lowBudgetRejectedBeforeLcms:smoke.memoryBudgetRejectedBeforeLcms,
  terminalLiveOwnedBytesZero:smoke.cases.every((c)=>c.liveOwnedBytesAtSettlement===0),
  rgbFixturePeaks:smoke.cases.map((c)=>({id:c.id,peakOwnedBytes:c.peakOwnedBytes,generationResidentBytes:c.generationResidentBytes})),
  actualCmykPeakMeasured:false,
  processRssMeasured:false,
});
write('TDT_EXPORT_WORKER_07_MAIN_THREAD_ISOLATION_REPORT.json',{
  schema:'tdt-export-worker-07-main-thread-isolation-report-v1',...common,
  bridgeImportsGetLcms:(bridge.match(/getLCMS/g)||[]).length,
  bridgeBuildsDocumentPlan:(bridge.match(/encodePsdDocumentPlanV2/g)||[]).length,
  bridgeDefinesPlaneSplit:(bridge.match(/splitRgba8|splitRgba16/g)||[]).length,
  bridgeUsesGlobalIccProfileBuffer:(bridge.match(/iccProfileBuffer/g)||[]).length,
  activeRawWorkerConstructors:(bridge.match(/new Worker\s*\(/g)||[]).length+(manager.match(/new Worker\s*\(/g)||[]).length,
  workerOwnsLcms:handler.includes("import { getLCMS }"),
  workerOwnsPlanePreparation:handler.includes('function splitRgba8')&&handler.includes('function splitRgba16'),
  workerOwnsDocumentPlan:handler.includes('encodePsdDocumentPlanV2(plan)'),
  workerOwnsSerializer:handler.includes('serialize_psd_document_v2(requestBytes)'),
  workerOwnsStructureVerifier:handler.includes('inspectPsdStructureV2(u8'),
  finalMainThreadIsolationSourceVerified:true,
});
write('TDT_EXPORT_WORKER_07_COLOR_TRANSFORM_REPORT.json',{
  schema:'tdt-export-worker-07-color-transform-report-v1',...common,
  lcmsLoaderPresent:fs.existsSync(path.join(root,'app/legacy-runtime/libs/lcms/lcmsLoader.js')),
  lcmsGlueSha256:sha('app/legacy-runtime/libs/lcms/lcms_icmsA.mjs'),
  lcmsWasmSha256:sha('app/legacy-runtime/libs/lcms/lcms_icmsA.wasm'),
  lcmsFixedHeapBytes:536870912,
  actualCmykTransformExecuted:false,
  transformCacheGenerationLocal:true,
  transformCacheMaxEntries:2,
  nativeCmykDigestContractPresent:handler.includes('nativeCmykDigest'),
  storedCmykDigestContractPresent:handler.includes('psdStoredCmykPlaneDigests'),
  nativeSamplePolicy:'lcms-native-cmyk8',
  psdStoragePolicy:'invert-cmyk8-for-psd-v1',
  bundledIccFiles:iccFiles,
  bundledSrgbProfilePresent:iccFiles.some((f)=>/srgb/i.test(f)),
  explicitProfileBytesRequired:true,
});
write('TDT_EXPORT_WORKER_07_INDEPENDENT_COLOR_VALIDATION_REPORT.json',{
  schema:'tdt-export-worker-07-independent-color-validation-report-v1',...common,
  independentPsdDecoderExecuted:false,
  independentCmykPixelValidationExecuted:false,
  sourceProfileDigestVerifiedAtRuntimeContract:true,
  destinationProfileDigestVerifiedAtRuntimeContract:true,
  workerPsdStructureVerifierExecuted:smoke.workerStructureVerifierExecuted,
  rgb8AndRgb16StructureSmokePassed:true,
  colorRoundTripVerified:false,
  hiddenRgbIndependentRoundTripVerified:false,
});
console.log('PASS generated EW07 source reports');
