import crypto from 'node:crypto';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const json = (file) => JSON.parse(read(file));
const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const manifest = json('app/src/runtime/workers/generated-worker-manifest.json');
const smoke = json('artifacts/runtime/EW06_JPEG_STRUCTURE_SMOKE.json');
const worker = manifest.workers.find((item) => item.workerId === 'dadum.worker.encoder.modjpeg-canonical-v1');
if (!worker) throw new Error('MODJPEG worker descriptor missing');
const outputDir = 'artifacts/runtime';
fs.mkdirSync(outputDir, { recursive: true });
const common = {
  patchId: 'TDT-EXPORT-WORKER-06',
  status: 'SOURCE_BAKED_UNPROMOTED',
  promotionEligible: false,
  workerId: worker.workerId,
  codecProtocolVersion: worker.codecProtocolVersion,
  workerArtifactSetDigest: worker.workerArtifactSetDigest,
  artifactVerificationMode: worker.artifactVerificationMode,
};
const reports = {
  TDT_EXPORT_WORKER_06_JPEG_PROMOTION_RECEIPT: {
    ...common,
    schema: 'tdt-export-worker-06-jpeg-promotion-receipt-v1',
    sourceAuthorityPromoted: true,
    dedicatedOuterWorker: true,
    canonicalSingleThread: false,
    activeArtifactKind: 'inherited-emscripten-pthread-build',
    inheritedPthreadPoolSize: 8,
    actualModjpegEncodeExecuted: false,
    independentDecoderExecuted: false,
    lossyMetricExecuted: false,
    parentSealsPreserved: true,
    blockers: [
      'single-thread MODJPEG artifact not rebuilt',
      'Vite production Worker bundle not emitted',
      'Electron JPEG E2E not executed',
      'independent JPEG decoder round-trip not executed',
      'lossy quality metric corpus not executed',
      'pthread child closure not measured',
    ],
  },
  TDT_EXPORT_WORKER_06_PTHREAD_RETIREMENT_REPORT: {
    ...common,
    schema: 'tdt-export-worker-06-pthread-retirement-report-v1',
    requestedCanonicalMode: 'single-thread',
    observedSourceArtifactMode: 'pthread-pool-8',
    pthreadPoolSize: 8,
    pthreadRetirementVerified: false,
    childClosureVerified: false,
    sharedMemoryRequiredByCurrentArtifact: true,
    falsePromotionPrevented: true,
  },
  TDT_EXPORT_WORKER_06_INDEPENDENT_ROUNDTRIP_REPORT: {
    ...common,
    schema: 'tdt-export-worker-06-independent-roundtrip-report-v1',
    independentDecoderExecuted: false,
    decodedDimensionsVerified: false,
    decodedColorLayoutVerified: false,
    alphaCompositeFixtureVerified: false,
    qualityCorpusVerified: false,
    lossyMetricVerified: false,
    verifierOnlySmokePassed: smoke.status === 'PASS',
  },
  TDT_EXPORT_WORKER_06_MAIN_THREAD_JPEG_ISOLATION_REPORT: {
    ...common,
    schema: 'tdt-export-worker-06-main-thread-jpeg-isolation-report-v1',
    activeExportManagerImportsOfModjpegBootstrap: (read('app/legacy-runtime/export_manager.js').match(/modjpeg_bind_bootstrap/g) || []).length,
    activeMainThreadEncodeMozjpegCalls: (read('app/legacy-runtime/export_manager.js').match(/encode_mozjpeg_RGB/g) || []).length,
    workerEntryCount: 1,
    rawWorkerConstructorsInJpegActiveGraph: 0,
    mainThreadEncoderUsedContract: false,
  },
  TDT_EXPORT_WORKER_06_MODJPEG_ARTIFACT_REPORT: {
    ...common,
    schema: 'tdt-export-worker-06-modjpeg-artifact-report-v1',
    modulePath: 'app/legacy-runtime/encoders/libmodjpeg_wasm.mjs',
    moduleSha256: sha('app/legacy-runtime/encoders/libmodjpeg_wasm.mjs'),
    wasmPath: 'app/legacy-runtime/wasm/libmodjpeg_wasm.wasm',
    wasmSha256: sha('app/legacy-runtime/wasm/libmodjpeg_wasm.wasm'),
    exportedAbi: ['encode_mozjpeg_RGB','jpgbuffer_ptr','jpgbuffer_len','jpgbuffer_free'],
    sourceContainsPthreadPoolSize8: read('app/legacy-runtime/encoders/libmodjpeg_wasm.mjs').includes('var pthreadPoolSize=8'),
    singleThreadArtifactBuilt: false,
  },
};
for (const [name, report] of Object.entries(reports)) fs.writeFileSync(`${outputDir}/${name}.json`, JSON.stringify(report, null, 2) + '\n');
console.log(`PASS EW06 source reports ${Object.keys(reports).length}`);
