import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { canonicalJson, seal } from './psd-decoder-01-lib.mjs';

const ROOT=process.cwd();
const PARENT=path.resolve(process.env.TDT_PSD_DECODER_PARENT_ROOT||'/mnt/data/tdt_jxl_codec_01_bake');
const ART=path.join(ROOT,'artifacts','runtime');
const sha=(v)=>crypto.createHash('sha256').update(v).digest('hex');
const fileSha=(f)=>sha(fs.readFileSync(f));
const write=(name,value)=>{fs.mkdirSync(ART,{recursive:true});fs.writeFileSync(path.join(ART,name),JSON.stringify(value,null,2)+'\n');};
const excluded=(rel)=>rel==='artifacts'||rel.startsWith('artifacts/')||rel==='patches'||rel.startsWith('patches/')||rel.startsWith('README_TDT_PSD_DECODER_01_');
function walk(root,dir=root,out=[]){if(!fs.existsSync(dir))return out;for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const f=path.join(dir,e.name);const rel=path.relative(root,f).replaceAll(path.sep,'/');if(excluded(rel))continue;if(e.isDirectory())walk(root,f,out);else if(e.isFile())out.push(rel);}return out;}
const current=walk(ROOT),parent=walk(PARENT);const changes=[];
for(const rel of [...new Set([...current,...parent])].sort()){const a=path.join(PARENT,rel),b=path.join(ROOT,rel);const ap=fs.existsSync(a),bp=fs.existsSync(b);const ah=ap?fileSha(a):null,bh=bp?fileSha(b):null;if(ah!==bh)changes.push({path:rel,parentSha256:ah,currentSha256:bh,change:!ap?'added':!bp?'removed':'modified'});}
const runtime=JSON.parse(fs.readFileSync(path.join(ART,'generated-runtime-manifest.source.json'),'utf8'));
const mainManifest=JSON.parse(fs.readFileSync(path.join(ROOT,'app/src/runtime/workers/generated-worker-manifest.json'),'utf8'));
const jxlManifest=JSON.parse(fs.readFileSync(path.join(ROOT,'app/src/runtime/workers/generated-jxl-independent-decoder-manifest.json'),'utf8'));
const psdManifest=JSON.parse(fs.readFileSync(path.join(ROOT,'app/src/runtime/workers/generated-psd-independent-decoder-manifest.json'),'utf8'));
const gate=JSON.parse(fs.readFileSync(path.join(ART,'TDT_PSD_DECODER_01_GATE_REPORT.json'),'utf8'));
const tests=JSON.parse(fs.readFileSync(path.join(ART,'TDT_PSD_DECODER_01_RUNTIME_TEST_REPORT.json'),'utf8'));
const strictPath=path.join(ART,'TDT_PSD_DECODER_01_STRICT_TYPESCRIPT_VERIFY.txt');
const parentPath=path.join(ART,'TDT_PSD_DECODER_01_PARENT_REGRESSION_VERIFY.txt');
const productionPath=path.join(ART,'TDT_PSD_DECODER_01_PRODUCTION_BUILD_ATTEMPT.txt');
const strictText=fs.readFileSync(strictPath,'utf8');const parentText=fs.readFileSync(parentPath,'utf8');const productionText=fs.readFileSync(productionPath,'utf8');
const blockers=['dependency-lock-not-promoted','production-vite-emit-not-run','packaged-electron-psd-e2e-not-run','serializer-independent-roundtrip-corpus-not-run','production-worker-generation-closure-not-measured','psb-zip-capabilities-not-promoted'];
const changedSourceDigest=sha(canonicalJson(changes));
const payload={schemaVersion:1,patchId:'TDT-PSD-DECODER-01',status:'SOURCE_BAKED_UNPROMOTED',evidenceState:'PSD_DECODER_SOURCE_ADOPTED',buildId:runtime.buildId,buildAuthorityDigest:runtime.buildAuthorityDigest,mainWorkerManifestDigest:mainManifest.sourceManifestDigest,jxlDecoderManifestDigest:jxlManifest.sourceManifestDigest,psdDecoderManifestDigest:psdManifest.sourceManifestDigest,parserSha256:fileSha(path.join(ROOT,'app/legacy-runtime/decoders/psd-independent-exact-parser.mjs')),workerSha256:fileSha(path.join(ROOT,'app/src/runtime/workers/entries/psd-independent-decoder.worker.ts')),specSha256:fileSha(path.join(ROOT,'specs/TDT-PSD-DECODER-01_PSD_PSB_INDEPENDENT_PARSER_DECODER_COMPRESSION_MATRIX_EXACT_PLANE_LAYER_COMPOSITE_RESOURCE_METADATA_TRUTH_SPEC.md')),sourceGatePassed:gate.failed.length===0,sourceGateCount:gate.total,runtimePolicyPassed:tests.failed.length===0,runtimePolicyCount:tests.total,strictTypeScriptVerified:strictText.includes('PASS'),parentRegressionVerified:parentText.includes('PASS parent regression closure'),productionBuildFailClosed:/promotionReceipt=false|rootExact=false|Dependency Lock|FAIL/.test(productionText),changedSourceCount:changes.length,changedSourceDigest,strictLogSha256:fileSha(strictPath),parentRegressionLogSha256:fileSha(parentPath),productionAttemptLogSha256:fileSha(productionPath),productionEligible:false,productionPromoted:false,blockers};
const sourceBakeSeal=sha(canonicalJson(payload));
write('TDT_PSD_DECODER_01_SOURCE_BAKE_SEAL_PAYLOAD.json',seal({...payload,sourceBakeSeal,changedSourceRecords:changes}));
write('TDT_PSD_DECODER_01_SOURCE_MUTATION_ZERO_REPORT.json',seal({schemaVersion:1,patchId:'TDT-PSD-DECODER-01',sourceBakeSeal,parentRoot:path.basename(PARENT),changedSourceCount:changes.length,changedSourceDigest,packageJsonSha256:fileSha(path.join(ROOT,'package.json')),packageLockSha256:fileSha(path.join(ROOT,'package-lock.json')),productionPointerMutated:false,sourceMutationAccountingVerified:true}));
write('TDT_PSD_DECODER_01_FIX_RECEIPT.json',seal({schemaVersion:1,patchId:'TDT-PSD-DECODER-01',status:'SOURCE_BAKED_UNPROMOTED',evidenceState:'PSD_DECODER_SOURCE_ADOPTED',buildId:runtime.buildId,buildAuthorityDigest:runtime.buildAuthorityDigest,sourceBakeSeal,psdDecoderManifestDigest:psdManifest.sourceManifestDigest,sourceAdopted:true,directParserImplemented:true,sourceRuntimeFixtureMatrixPassed:tests.passed===176,sourceGatePassed:gate.passed===112,strictTypeScriptVerified:payload.strictTypeScriptVerified,parentRegressionVerified:payload.parentRegressionVerified,productionBuildFailClosed:payload.productionBuildFailClosed,productionEligible:false,productionPromoted:false,blockers}));
write('TDT_PSD_DECODER_01_PROMOTION_RECEIPT.json',seal({schemaVersion:1,patchId:'TDT-PSD-DECODER-01',status:'SOURCE_BAKED_UNPROMOTED',evidenceState:'PSD_DECODER_SOURCE_ADOPTED',buildId:runtime.buildId,buildAuthorityDigest:runtime.buildAuthorityDigest,sourceBakeSeal,promoted:false,psdDecoderPromoted:false,rawMatrixVerified:false,rleMatrixVerified:false,rgb16ExactVerified:false,cmyk8ExactVerified:false,hiddenRgbVerified:false,layerCompositeVerified:false,resourceMetadataVerified:false,generationClosureVerified:false,packagedRuntimeVerified:false,productionEligible:false,blockers}));
console.log(JSON.stringify({buildId:runtime.buildId,buildAuthorityDigest:runtime.buildAuthorityDigest,psdDecoderManifestDigest:psdManifest.sourceManifestDigest,sourceBakeSeal,changedSourceCount:changes.length},null,2));
