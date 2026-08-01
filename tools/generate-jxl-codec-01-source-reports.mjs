import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_DIR, PATCH_ID, REPORT_FILES, ENCODER_WASM_SHA256, DECODER_WASM_SHA256, seal, sourceAudit, writeJson } from './jxl-codec-01-lib.mjs';
const audit=sourceAudit();
const runtimePath=path.join(ARTIFACT_DIR,'generated-runtime-manifest.source.json');
const runtime=fs.existsSync(runtimePath)?JSON.parse(fs.readFileSync(runtimePath,'utf8')):{};
const blockers=['dependency-lock-not-promoted','production-vite-emit-not-run','packaged-electron-jxl-e2e-not-run','independent-jxl-roundtrip-corpus-not-run','pthread-generation-closure-not-measured-in-production'];
const base={schemaVersion:1,patchId:PATCH_ID,status:'SOURCE_BAKED_UNPROMOTED',evidenceState:'JXL_CODEC_SOURCE_ADOPTED',buildId:runtime.buildId??null,buildAuthorityDigest:runtime.buildAuthorityDigest??null,productionEligible:false,productionPromoted:false,blockers};
const reports={
'TDT_JXL_CODEC_01_SOURCE_INPUT_REPORT.json':{...base,specPresent:fs.existsSync('specs/TDT-JXL-CODEC-01_JXL_ENCODE_DECODE_RUNTIME_CLOSURE_ABI_INDEPENDENT_RGBA8_HIDDEN_RGB_CONTAINER_METADATA_PTHREAD_GENERATION_TRUTH_SPEC.md')},
'TDT_JXL_CODEC_01_ARTIFACT_IDENTITY_REPORT.json':{...base,encoderWasmSha256:audit.encoderWasm.sha256,decoderWasmSha256:audit.decoderWasm.sha256,encoderExpectedSha256:ENCODER_WASM_SHA256,decoderExpectedSha256:DECODER_WASM_SHA256,artifactsDistinct:audit.artifactsDistinct},
'TDT_JXL_CODEC_01_ABI_PRESERVATION_REPORT.json':{...base,abiSymbol:'jxl_encode_qmap_ex',freeSymbol:'jxl_free',abiVersion:1,abiPreserved:audit.encoderAbiPreserved},
'TDT_JXL_CODEC_01_ENCODER_PTHREAD_REPORT.json':{...base,threadMode:'emscripten-pthread-pool-4-canonical-v1',pthreadPoolSize:4,sharedMemory:true,initialMemoryBytes:16777216,maximumMemoryBytes:2147483648,sourceVerified:audit.encoderPthreadPool4&&audit.encoderCoi},
'TDT_JXL_CODEC_01_ENCODER_GENERATION_REPORT.json':{...base,childWorkerTrackerPresent:audit.encoderTracker,childWorkerCountExpected:4,productionGenerationClosureVerified:false},
'TDT_JXL_CODEC_01_DECODER_ARTIFACT_REPORT.json':{...base,decoderId:'dadum.decoder.jxl-independent-v1',decoderWasmSha256:audit.decoderWasm.sha256,decodeJxlExExportPresent:audit.decoderWasm.exports.some(x=>x.name==='decode_jxl_ex'),encoderArtifactSharing:false},
'TDT_JXL_CODEC_01_DECODER_WORKER_REPORT.json':{...base,workerId:'dadum.worker.decoder.jxl-independent-v1',protocolVersion:'dadum-jxl-independent-decoder-worker-v1',sourceManifestVerified:audit.auxiliaryManifest,productionEmittedWorkerVerified:false},
'TDT_JXL_CODEC_01_DECODER_GENERATION_REPORT.json':{...base,generationOwnershipSourceVerified:audit.decoderGeneration,disposeSourceVerified:audit.registryDispose,productionGenerationClosureVerified:false},
'TDT_JXL_CODEC_01_INDEPENDENCE_REPORT.json':{...base,encoderDecoderArtifactDistinct:audit.artifactsDistinct,encoderArtifactSharing:false,canvasUsed:false,imageBitmapUsed:false,rgba16fIntermediateUsed:false,browserFallbackUsed:false,sourceVerified:audit.decoderNoCanvas&&audit.decoderExact},
'TDT_JXL_CODEC_01_EXACT_RGBA8_REPORT.json':{...base,surfaceId:'dadum.jxl-decoded-rgba8-exact-v1',storage:'rgba8unorm',sampleEncoding:'rgba8unorm-u8-v1',alphaMode:'straight',sourceVerified:audit.decoderExact&&audit.decoderCopy,productionRoundtripVerified:false},
'TDT_JXL_CODEC_01_HIDDEN_RGB_REPORT.json':{...base,fixturePixels:[[255,0,0,0],[0,255,0,0],[0,0,255,0],[17,33,65,0]],comparisonPolicy:'all-rgba-bytes-including-alpha-zero-rgb-v1',sourceVerifierPresent:true,productionHiddenRgbVerified:false},
'TDT_JXL_CODEC_01_CONTAINER_STRUCTURE_REPORT.json':{...base,verifierIds:['dadum.jxl-container-structure-v2','dadum.jxl-container-metadata-verifier-v1'],requiredBoxes:['JXL ','ftyp','jxlc|jxlp','Exif','xml '],productionContainerVerified:false},
'TDT_JXL_CODEC_01_METADATA_REPORT.json':{...base,exifCardinality:1,xmpCardinality:1,resolutionRequired:true,exactEofRequired:true,productionMetadataVerified:false},
'TDT_JXL_CODEC_01_COLOR_ENCODING_REPORT.json':{...base,allowedColorEncodingIds:['srgb','linear-srgb'],customIccSupported:false,productionColorEncodingVerified:false},
'TDT_JXL_CODEC_01_CANCELABILITY_REPORT.json':{...base,cancelabilityClass:'worker-termination-required-during-native-call',cooperativeNativeCancelClaimed:false,productionCancelCrashClosureVerified:false},
'TDT_JXL_CODEC_01_OUTPUT_IDENTITY_REPORT.json':{...base,sourceArtifactIdentityVerified:true,encodedOutputIdentityVerified:false,decodedPixelIdentityVerified:false},
'TDT_JXL_CODEC_01_REPEATABILITY_REPORT.json':{...base,sameGenerationRequired:100,generationRestartRequired:20,appRelaunchRequired:5,executed:{sameGeneration:0,generationRestart:0,appRelaunch:0}},
'TDT_JXL_CODEC_01_BUILD_EMIT_CLOSURE_REPORT.json':{...base,auxiliaryManifestVerified:audit.auxiliaryManifest,emittedManifestIntegrationVerified:audit.emittedClosure,productionClosureVerified:false},
'TDT_JXL_CODEC_01_COI_ROUTE_REPORT.json':{...base,coop:'same-origin',coep:'require-corp',corp:'same-origin',encoderSharedMemoryRequired:true,productionRouteVerified:false},
'TDT_JXL_CODEC_01_EP03_INTEGRATION_REPORT.json':{...base,decoderId:'dadum.decoder.jxl-independent-v1',sourceDecoderPathImplemented:true,ep03ProductionRoundtripVerified:false},
'TDT_JXL_CODEC_01_PROMOTION_RECEIPT.json':{...base,promoted:false,jxlCodecPromoted:false,independentDecodeVerified:false,hiddenRgbVerified:false,pthreadClosureVerified:false,metadataVerified:false},
'TDT_JXL_CODEC_01_FIX_RECEIPT.json':{...base,sourceAdopted:true,abiPreserved:audit.encoderAbiPreserved,canonicalPthreadPoolSize:4,independentDecoderSourceImplemented:audit.decoderExact&&audit.decoderWorker,sourceGatePassed:null,runtimePolicyPassed:null},
};
for(const file of REPORT_FILES){if(!reports[file])throw new Error(`missing report ${file}`);writeJson(path.join(ARTIFACT_DIR,file),seal(reports[file]));}
console.log(`PASS JXL-CODEC-01 source reports ${REPORT_FILES.length}`);
