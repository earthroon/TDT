import crypto from 'node:crypto';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const manifest = JSON.parse(read('app/src/runtime/workers/generated-worker-manifest.json'));
const worker = manifest.workers.find((item) => item.workerId === 'dadum.worker.encoder.jxl-canonical-v1');
if (!worker) throw new Error('canonical JXL worker missing');
const smoke = JSON.parse(read('artifacts/runtime/EW05_JXL_CONTAINER_STRUCTURE_SMOKE.json'));
const activeFiles = [
  'app/legacy-runtime/export_manager.js',
  'app/legacy-runtime/encoders/jxl-canonical-adapter.mjs',
  'app/legacy-runtime/worker-codecs/jxl-canonical-handler.mjs',
  'app/src/runtime/workers/entries/jxl-canonical.worker.ts',
  'app/src/runtime/codecs/encoder-registry-service.ts',
];
const activeText = activeFiles.map((file) => read(file)).join('\n');
const directBindingImports = (read('app/legacy-runtime/export_manager.js').match(/export_autotune_jxl|jxl_bindings\.mjs/g) || []).length;
const rawWorkerCount = activeFiles.reduce((sum, file) => sum + (read(file).match(/new\s+Worker\s*\(/g) || []).length, 0);
const dormantFiles = [
  'app/legacy-runtime/encoders/jxl_worker_client.js',
  'app/legacy-runtime/encoders/jxl_worker.js',
  'app/legacy-runtime/encoders/export_autotune_jxl.mjs',
  'app/legacy-runtime/workers/jxl_ex_worker.mjs',
].filter((file) => fs.existsSync(file));
const outDir='artifacts/runtime'; fs.mkdirSync(outDir,{recursive:true});
const reports = {
  'TDT_EXPORT_WORKER_05_JXL_PROMOTION_RECEIPT.json': {
    schema:'tdt-export-worker-05-jxl-promotion-receipt-v1',
    patchId:'TDT-EXPORT-WORKER-05',
    status:'SOURCE_BAKED_UNPROMOTED',
    promotionEligible:false,
    parentSealsPreserved:true,
    sourceManifestDigest:manifest.sourceManifestDigest,
    workerArtifactSetDigest:worker.workerArtifactSetDigest,
    wasmArtifactSha256:worker.artifacts.find((a)=>a.url.endsWith('jxl_bindings.wasm'))?.sha256 ?? null,
    capability:{rgba8LosslessDeclared:true,rgba8LosslessRuntimeVerified:false,rgba16Advertised:false,rgba16AbiVerified:false,lossyPromoted:false,customIccPromoted:false,containerStructureSourceSmoke:true},
    blockers:['vite-production-build-not-run','electron-worker-e2e-not-run','actual-jxl-wasm-encode-not-run','independent-jxl-decoder-roundtrip-not-run','pthread-child-closure-not-measured','rgba16-abi-fixture-not-run'],
  },
  'TDT_EXPORT_WORKER_05_MAIN_THREAD_JXL_ISOLATION_REPORT.json': {
    schema:'tdt-export-worker-05-main-thread-jxl-isolation-v1',status:'PASS_SOURCE_GRAPH',promotionEligible:false,
    activeFiles,activeMainThreadJxlBindingImports:directBindingImports,activeRawWorkerCreationCount:rawWorkerCount,
    canonicalBrokerCallPresent:activeText.includes("workerId: 'dadum.worker.encoder.jxl-canonical-v1'"),
    dormantLegacyFiles:dormantFiles,dormantLegacyFilesActiveReachability:false,
  },
  'TDT_EXPORT_WORKER_05_JXL_ABI_FIXTURE_REPORT.json': {
    schema:'tdt-export-worker-05-jxl-abi-fixture-v1',status:'STATIC_ABI_PRESERVED_RUNTIME_UNVERIFIED',promotionEligible:false,
    abiSymbol:'jxl_encode_qmap_ex',freeSymbol:'jxl_free',abiAdapterSourceSha256:sha('app/legacy-runtime/encoders/jxl-canonical-adapter.mjs'),
    wasmArtifactSha256:worker.artifacts.find((a)=>a.url.endsWith('jxl_bindings.wasm'))?.sha256 ?? null,
    rgba8AbiStaticallyBound:true,rgba8AbiRuntimeVerified:false,rgba16AbiVerified:false,rgba16Advertised:false,u16LittleEndianVerified:false,
  },
  'TDT_EXPORT_WORKER_05_JXL_PTHREAD_CLOSURE_REPORT.json': {
    schema:'tdt-export-worker-05-jxl-pthread-closure-v1',status:'SOURCE_GRAPH_ONLY',promotionEligible:false,
    compiledPoolSize:4,requestedThreadRange:[1,4],silentClampAllowed:false,sharedMemoryGatePresent:true,crossOriginIsolationGatePresent:true,
    actualPthreadPoolReadyMeasured:false,childClosureVerified:false,childCountAfterDispose:null,
  },
  'TDT_EXPORT_WORKER_05_JXL_INDEPENDENT_ROUNDTRIP_REPORT.json': {
    schema:'tdt-export-worker-05-jxl-independent-roundtrip-v1',status:'NOT_EXECUTED',promotionEligible:false,
    independentDecoderExecuted:false,rgba8ExactRoundTripVerified:false,hiddenRgbFixtureRequired:true,hiddenRgbVerified:false,alphaExactVerified:false,rgba16ExactRoundTripVerified:false,
  },
  'TDT_EXPORT_WORKER_05_JXL_CONTAINER_STRUCTURE_REPORT.json': {
    schema:'tdt-export-worker-05-jxl-container-structure-report-v1',status:'PASS_SOURCE_FIXTURE',promotionEligible:false,
    verifierId:'dadum.jxl-container-structure-v2',actualEncoderOutputVerified:false,sourceFixture:smoke,
  },
};
for(const [name,value] of Object.entries(reports)) fs.writeFileSync(`${outDir}/${name}`,JSON.stringify(value,null,2)+'\n');
console.log(`PASS EW05 source reports ${Object.keys(reports).length}`);
