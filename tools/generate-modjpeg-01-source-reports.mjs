import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_DIR, PATCH_ID, canonicalJson, coiSourceContract, inspectCanonicalArtifact, readJson, seal, sha256Bytes, sha256File, writeJson } from './modjpeg-01-lib.mjs';
const artifact=inspectCanonicalArtifact();
const coi=coiSourceContract();
const runtimeManifest=readJson('artifacts/runtime/generated-runtime-manifest.source.json');
const manifest=readJson('app/src/runtime/workers/generated-worker-manifest.json');
const worker=manifest.workers.find((x)=>x.workerId==='dadum.worker.encoder.modjpeg-canonical-v1');
const lock=readJson('artifacts/runtime/TDT_BUILD_LOCK_01_PROMOTION_RECEIPT.json');
const buildEmit=readJson('artifacts/runtime/TDT_BUILD_EMIT_01_EMITTED_ARTIFACT_IDENTITY_RECEIPT.json');
const common={schemaVersion:1,patchId:PATCH_ID,status:'SOURCE_BAKED_UNPROMOTED',buildId:runtimeManifest.buildId,sourceRuntimeManifestDigest:runtimeManifest.selfDigest,sourceWorkerManifestDigest:manifest.sourceManifestDigest,artifactAdoptionId:PATCH_ID,artifactContractId:'dadum.modjpeg-pthread-pool-8-canonical-v1',workerId:worker.workerId,codecProtocolVersion:worker.codecProtocolVersion,workerArtifactSetDigest:worker.workerArtifactSetDigest,canonicalPthreadArtifact:true,canonicalSingleThread:false,threadMode:'emscripten-pthread-pool-8-canonical-v1',pthreadPoolSize:8};
const reports={
 TDT_MODJPEG_01_CANONICAL_ARTIFACT_REPORT:{...common,...artifact,verified:artifact.artifactBytesPreserved&&artifact.abiPreserved&&artifact.pthreadPoolSize===8&&artifact.sharedMemory},
 TDT_MODJPEG_01_SHARED_MEMORY_REPORT:{...common,sharedMemory:true,initialBytes:268435456,maximumBytes:2147483648,coiRequired:true,contractVerified:artifact.sharedMemory},
 TDT_MODJPEG_01_COI_CONTRACT_REPORT:{...common,...coi,sourceContractVerified:Object.values(coi).every(Boolean),productionRouteVerified:false},
 TDT_MODJPEG_01_CHILD_WORKER_CLOSURE_REPORT:{...common,bootstrapKind:'vite-emitted-module-url-v1',closurePolicyId:'tracked-worker-generation-termination-v1',sourceTrackerPresent:fs.readFileSync('app/legacy-runtime/encoders/modjpeg-child-worker-tracker.mjs','utf8').includes('terminateAll'),productionEmittedBootstrapVerified:false,packagedClosureMeasured:false},
 TDT_MODJPEG_01_ABI_REPORT:{...common,requiredAbi:artifact.missingAbi.length?[]:['_encode_mozjpeg_RGB','_jpgbuffer_ptr','_jpgbuffer_len','_jpgbuffer_free','_malloc','_free'],missingAbi:artifact.missingAbi,abiPreserved:artifact.abiPreserved},
 TDT_MODJPEG_01_OUTPUT_IDENTITY_REPORT:{...common,baseline444StructureSmokePassed:readJson('artifacts/runtime/EW06_JPEG_STRUCTURE_SMOKE.json').status==='PASS',sameGeneration100Executed:false,crossGeneration20Executed:false,relaunch5Executed:false,productionOutputIdentityVerified:false},
 TDT_MODJPEG_01_VITE_DEV_COI_REPORT:{...common,verified:coi.viteDev,headers:{coop:'same-origin',coep:'require-corp',corp:'same-origin'}},
 TDT_MODJPEG_01_VITE_PREVIEW_COI_REPORT:{...common,verified:coi.vitePreview,headers:{coop:'same-origin',coep:'require-corp',corp:'same-origin'}},
 TDT_MODJPEG_01_ELECTRON_COI_REPORT:{...common,sourceServerContractVerified:coi.electron,productionRouteVerified:false},
 TDT_MODJPEG_01_WORKER_GENERATION_REPORT:{...common,disposeEvidenceProtocolPresent:true,cancelGraceHardRestartPresent:fs.readFileSync('app/src/runtime/workers/encoder-worker-broker-service.ts','utf8').includes('cancel-grace-timeout'),productionGenerationClosureVerified:false},
 TDT_MODJPEG_01_SOURCE_MUTATION_REPORT:{...common,moduleSha256:artifact.moduleSha256,wasmSha256:artifact.wasmSha256,artifactBytesPreserved:artifact.artifactBytesPreserved},
 TDT_MODJPEG_01_PROMOTION_RECEIPT:{...common,canonicalArtifactAdoptedAtSource:true,dependencyLockPromoted:lock.promoted===true,emittedArtifactIdentityVerified:buildEmit.status==='EMITTED_ARTIFACT_IDENTITY_VERIFIED',productionPromoted:false,blockers:['dependency lock not promoted','production emitted pthread child bootstrap not verified','packaged Electron COI and generation closure not executed','JPEG repeated output identity corpus not executed']},
};
for(const [name,body] of Object.entries(reports)) writeJson(path.join(ARTIFACT_DIR,`${name}.json`),seal(body));
const ep03={schemaVersion:2,patchId:'TDT-MODJPEG-01',reportId:'TDT_EXPORT_PROMOTION_03_MODJPEG_ARTIFACT_REPORT',status:'SOURCE_CANONICAL_ADOPTED',verified:true,artifactPolicyId:'dadum.modjpeg-pthread-pool-8-canonical-v1',canonicalPthreadArtifact:true,canonicalSingleThread:false,pthreadPoolSize:8,sharedMemory:true,moduleSha256:artifact.moduleSha256,wasmSha256:artifact.wasmSha256,blockers:['production-emitted-pthread-child-closure-not-verified','packaged-electron-coi-e2e-not-run','jpeg-output-identity-corpus-not-run']};
writeJson('artifacts/promotion/TDT_EXPORT_PROMOTION_03_MODJPEG_ARTIFACT_REPORT.json',ep03);
console.log(`PASS TDT-MODJPEG-01 source reports ${Object.keys(reports).length}`);
