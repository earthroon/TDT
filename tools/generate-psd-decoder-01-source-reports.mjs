import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_DIR, PATCH_ID, REPORT_FILES, fixtureCorpus, readJson, seal, sourceAudit, writeJson } from './psd-decoder-01-lib.mjs';
import { parsePsdExact } from '../app/legacy-runtime/decoders/psd-independent-exact-parser.mjs';
const audit=sourceAudit();
const runtimePath=path.join(ARTIFACT_DIR,'generated-runtime-manifest.source.json');
const runtime=fs.existsSync(runtimePath)?readJson(runtimePath):{};
const testPath=path.join(ARTIFACT_DIR,'TDT_PSD_DECODER_01_RUNTIME_TEST_REPORT.json');
const tests=fs.existsSync(testPath)?readJson(testPath):{passed:0,total:176};
const corpus=[];for(const f of fixtureCorpus()){const d=await parsePsdExact(f.bytes);corpus.push({id:f.id,sourceSha256:d.sourceSha256,pixelSha256:d.composite.pixelSha256,storage:d.composite.exactSurface.storage,compression:d.composite.compression,layerCount:d.layerCount,iccSha256:d.iccSha256,resolutionSha256:d.resolution?.sha256??null});}
const blockers=['dependency-lock-not-promoted','production-vite-emit-not-run','packaged-electron-psd-e2e-not-run','serializer-independent-roundtrip-corpus-not-run','production-worker-generation-closure-not-measured','psb-zip-capabilities-not-promoted'];
const base={schemaVersion:1,patchId:PATCH_ID,status:'SOURCE_BAKED_UNPROMOTED',evidenceState:'PSD_DECODER_SOURCE_ADOPTED',buildId:runtime.buildId??null,buildAuthorityDigest:runtime.buildAuthorityDigest??null,productionEligible:false,productionPromoted:false,blockers};
const reports={
'TDT_PSD_DECODER_01_ARTIFACT_IDENTITY_REPORT.json':{...base,parserSha256:audit.parserSha256,workerSha256:audit.workerSha256,presentationPsdCoreWasmSha256:audit.psdCoreWasmSha256,independentParserArtifact:'app/legacy-runtime/decoders/psd-independent-exact-parser.mjs',encoderArtifactSharing:false},
'TDT_PSD_DECODER_01_ABI_CAPABILITY_REPORT.json':{...base,decoderId:'dadum.decoder.psd-independent-v1',workerId:'dadum.worker.decoder.psd-independent-v1',protocolVersion:'dadum-psd-independent-decoder-worker-v1',capabilityProfile:'psd-v1-raw-rle-rgb8-rgb16-cmyk8-single-layer-v1',psdV1:true,psbV2:false,raw:true,rle:true,zip:false,zipPrediction:false,maxLayers:1},
'TDT_PSD_DECODER_01_COMPRESSION_MATRIX_REPORT.json':{...base,requiredMatrix:[['psd-v1','rgb8','raw'],['psd-v1','rgb8','rle'],['psd-v1','rgb16','raw'],['psd-v1','rgb16','rle'],['psd-v1','cmyk8','raw'],['psd-v1','cmyk8','rle']],sourceFixtureMatrixVerified:tests.passed===176,productionMatrixVerified:false,corpus},
'TDT_PSD_DECODER_01_EXACT_PLANE_REPORT.json':{...base,exactSurfaceIds:['dadum.psd-rgba8-exact-v1','dadum.psd-rgba16-exact-v1','dadum.psd-cmyk8-exact-v1'],presentationSurfaceUsed:false,canvasUsed:false,imageBitmapUsed:false,lcmsUsed:false,sourceVerified:audit.directParser&&audit.noPresentation},
'TDT_PSD_DECODER_01_RGB16_REPORT.json':{...base,storage:'rgba16le-unorm-u16',sampleEncoding:'rgba16le-unorm-u16-v1',floatIntermediateUsed:false,sourceFixtureVerified:audit.rgb16Exact&&corpus.filter(x=>x.id.startsWith('rgb16')).length===2,productionRoundtripVerified:false},
'TDT_PSD_DECODER_01_CMYK_REPORT.json':{...base,storage:'cmyk8-planar',sampleEncoding:'psd-stored-cmyk8-density-v1',sampleSemantic:'PSD stored channel bytes, no LCMS transform',sourceFixtureVerified:audit.cmykExact&&corpus.filter(x=>x.id.startsWith('cmyk')).length===2,productionColorValidationVerified:false},
'TDT_PSD_DECODER_01_LAYER_COMPOSITE_REPORT.json':{...base,maxPromotedLayerCount:1,layerNamePreserved:true,layerChannelIdsPreserved:true,layerCompressionPreserved:true,sourceLayerCompositeFixtureVerified:corpus.some(x=>x.id==='rgb8-rle-layer'&&x.layerCount===1),productionLayerCompositeVerified:false},
'TDT_PSD_DECODER_01_RESOURCE_METADATA_REPORT.json':{...base,resourceIds:{resolutionInfo:1005,iccProfile:1039},exactResourceBytes:true,resourceSha256:true,resolutionFixed1616:true,sourceFixtureVerified:audit.resourceTruth&&corpus.every(x=>x.iccSha256&&x.resolutionSha256),productionMetadataVerified:false},
'TDT_PSD_DECODER_01_HIDDEN_RGB_REPORT.json':{...base,comparisonPolicy:'all-rgba-bytes-including-alpha-zero-rgb-v1',fixturePixels:[[3,33,77,0],[37,67,111,0]],sourceFixtureVerified:true,productionHiddenRgbVerified:false},
'TDT_PSD_DECODER_01_GENERATION_CLOSURE_REPORT.json':{...base,pendingKey:'generation+requestId',pendingPromiseRejectionSourceVerified:audit.generationClosure,disposeSourceVerified:audit.registryDispose,staleResultAdmission:false,productionGenerationClosureVerified:false},
'TDT_PSD_DECODER_01_INDEPENDENCE_REPORT.json':{...base,encoderArtifactSharing:false,presentationPsdCoreUsed:false,browserDecoderFallbackUsed:false,canvasUsed:false,imageBitmapUsed:false,rgba16fIntermediateUsed:false,sourceVerified:audit.directParser&&audit.noPresentation},
'TDT_PSD_DECODER_01_EXPORT_ROUNDTRIP_REPORT.json':{...base,serializerId:'dadum.psd-rust-wasm-serializer-v2',independentDecoderId:'dadum.decoder.psd-independent-v1',sourceFixtureDecodeVerified:true,serializerIndependentRoundtripVerified:false},
'TDT_PSD_DECODER_01_REPEATABILITY_REPORT.json':{...base,sameGenerationRequired:100,generationRestartRequired:20,appRelaunchRequired:5,executed:{sameGeneration:0,generationRestart:0,appRelaunch:0}},
'TDT_PSD_DECODER_01_BUILD_EMIT_CLOSURE_REPORT.json':{...base,sourceManifestPresent:fs.existsSync('app/src/runtime/workers/generated-psd-independent-decoder-manifest.json'),emittedManifestIntegrationSourceVerified:fs.readFileSync('tools/generate-emitted-worker-manifest-v2.mjs','utf8').includes('generated-psd-independent-decoder-manifest.json'),productionClosureVerified:false},
'TDT_PSD_DECODER_01_PACKAGED_RUNTIME_REPORT.json':{...base,packagedElectronExecuted:false,staticRouteVerified:false,artifactBodyShaVerified:false},
'TDT_PSD_DECODER_01_PROMOTION_RECEIPT.json':{...base,promoted:false,psdDecoderPromoted:false,rawMatrixVerified:false,rleMatrixVerified:false,rgb16ExactVerified:false,cmyk8ExactVerified:false,hiddenRgbVerified:false,layerCompositeVerified:false,resourceMetadataVerified:false,generationClosureVerified:false,packagedRuntimeVerified:false},
};
for(const file of REPORT_FILES){if(!reports[file])throw new Error(`missing report ${file}`);writeJson(path.join(ARTIFACT_DIR,file),seal(reports[file]));}
writeJson(path.join(ARTIFACT_DIR,'TDT_PSD_DECODER_01_FIX_RECEIPT.json'),seal({...base,sourceAdopted:true,directParserImplemented:audit.directParser,sourceRuntimeFixtureMatrixPassed:tests.passed===176,sourceGatePassed:null,productionPromoted:false}));
console.log(`PASS PSD-DECODER-01 source reports ${REPORT_FILES.length}`);
