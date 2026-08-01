import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const PARENT=path.resolve(process.env.TDT_NATIVE_DECODER_PARENT_ROOT||'/mnt/data/tdt_modjpeg_01_bake');
const ART=path.join(ROOT,'artifacts','runtime');
const sha=(v)=>crypto.createHash('sha256').update(v).digest('hex');
const fileSha=(p)=>sha(fs.readFileSync(p));
const canonicalize=(v)=>Array.isArray(v)?v.map(canonicalize):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonicalize(v[k])])):v;
const canonical=(v)=>JSON.stringify(canonicalize(v));
const write=(name,value)=>{fs.mkdirSync(ART,{recursive:true});fs.writeFileSync(path.join(ART,name),JSON.stringify(value,null,2)+'\n');};
const excluded=(rel)=>rel==='artifacts'||rel.startsWith('artifacts/')||rel==='patches'||rel.startsWith('patches/')||rel.startsWith('README_TDT_NATIVE_DECODER_01_');
function walk(root,dir=root,out=[]){if(!fs.existsSync(dir))return out;for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const p=path.join(dir,e.name);const rel=path.relative(root,p).replaceAll(path.sep,'/');if(excluded(rel))continue;if(e.isDirectory())walk(root,p,out);else if(e.isFile())out.push(rel);}return out;}
const currentFiles=walk(ROOT);const parentFiles=walk(PARENT);const all=[...new Set([...currentFiles,...parentFiles])].sort();
const changed=[];
for(const rel of all){const a=path.join(PARENT,rel),b=path.join(ROOT,rel);const ap=fs.existsSync(a),bp=fs.existsSync(b);const as=ap?fileSha(a):null,bs=bp?fileSha(b):null;if(as!==bs)changed.push({path:rel,parentSha256:as,currentSha256:bs,change:!ap?'added':!bp?'removed':'modified'});}
const runtime=JSON.parse(fs.readFileSync(path.join(ART,'generated-runtime-manifest.source.json'),'utf8'));
const worker=JSON.parse(fs.readFileSync(path.join(ROOT,'app/src/runtime/workers/generated-worker-manifest.json'),'utf8'));
const gate=JSON.parse(fs.readFileSync(path.join(ART,'TDT_NATIVE_DECODER_01_GATE_REPORT.json'),'utf8'));
const tests=JSON.parse(fs.readFileSync(path.join(ART,'TDT_NATIVE_DECODER_01_RUNTIME_TEST_REPORT.json'),'utf8'));
const addonPath=path.join(ROOT,'native/decoder-rs/decoder_rs.win32-x64-msvc.node');
const spec='specs/TDT-NATIVE-DECODER-01_RELEASE_NODE_ADDON_ABI_ARCHITECTURE_EXACT_SURFACE_METADATA_PACKAGING_INDEPENDENT_RASTER_DECODE_TRUTH_SPEC.md';
const payload={
  schemaVersion:1,
  patchId:'TDT-NATIVE-DECODER-01',
  status:'SOURCE_BAKED_UNPROMOTED',
  evidenceState:'BLOCKED_RELEASE_ADDON_MISSING',
  buildId:runtime.buildId,
  buildAuthorityDigest:runtime.buildAuthorityDigest,
  sourceRuntimeManifestDigest:fileSha(path.join(ART,'generated-runtime-manifest.source.json')),
  sourceWorkerManifestDigest:worker.manifestDigest||worker.sourceManifestDigest||worker.digest,
  specSha256:fileSha(path.join(ROOT,spec)),
  abiVersion:'dadum-native-decoder-abi-v1',
  canonicalAddonFilename:'decoder_rs.win32-x64-msvc.node',
  releaseAddonPresent:fs.existsSync(addonPath),
  releaseAddonSha256:fs.existsSync(addonPath)?fileSha(addonPath):null,
  exactSurfaces:['rgba8unorm-u8-v1','rgba16le-unorm-u16-v1'],
  sourceGatePassed:gate.passed===gate.total,
  sourceGateCount:gate.total,
  runtimePolicyPassed:tests.passed===tests.total,
  runtimePolicyCount:tests.total,
  strictTypeScriptVerified:fs.existsSync(path.join(ART,'TDT_NATIVE_DECODER_01_STRICT_TYPESCRIPT_VERIFY.txt')),
  nativeBuildExecuted:false,
  packagedExecutionVerified:false,
  productionPromoted:false,
  blockers:['release-addon-missing','rust-toolchain-missing','napi-cli-install-missing','win32-x64-release-build-not-run','packaged-electron-execution-not-run','independent-raster-roundtrip-not-run'],
  changedSourceRecords:changed,
};
const sourceBakeSeal=sha(canonical(payload));
write('TDT_NATIVE_DECODER_01_SOURCE_BAKE_SEAL_PAYLOAD.json',{...payload,sourceBakeSeal});
const receiptBase={
  schemaVersion:1,patchId:'TDT-NATIVE-DECODER-01',status:payload.status,evidenceState:payload.evidenceState,
  buildId:payload.buildId,buildAuthorityDigest:payload.buildAuthorityDigest,sourceWorkerManifestDigest:payload.sourceWorkerManifestDigest,
  sourceBakeSeal,abiVersion:payload.abiVersion,canonicalAddonFilename:payload.canonicalAddonFilename,
  releaseAddonCount:payload.releaseAddonPresent?1:0,debugAddonCount:0,exactU16SourceContract:true,
  metadataExtractionSourceContract:true,nativeAttestationSourceContract:true,registryAdmissionFailClosed:true,
  sourceGatePassed:payload.sourceGatePassed,sourceGateCount:payload.sourceGateCount,runtimePolicyPassed:payload.runtimePolicyPassed,runtimePolicyCount:payload.runtimePolicyCount,
  productionEligible:false,productionPromoted:false,blockers:payload.blockers,
};
const receiptDigest=sha(canonical(receiptBase));
write('TDT_NATIVE_DECODER_01_FIX_RECEIPT.json',{...receiptBase,receiptDigest,selfDigest:sha(canonical({...receiptBase,receiptDigest}))});
const promotionBase={schemaVersion:1,patchId:'TDT-NATIVE-DECODER-01',status:'BLOCKED_RELEASE_ADDON_MISSING',promoted:false,nativeDecoderPromoted:false,buildId:payload.buildId,sourceBakeSeal,releaseAddonCount:payload.releaseAddonPresent?1:0,attestationVerified:false,packagedExecutionVerified:false,browserFallbackUsed:false,blockers:payload.blockers};
write('TDT_NATIVE_DECODER_01_PROMOTION_RECEIPT.json',{...promotionBase,selfDigest:sha(canonical(promotionBase))});
console.log(JSON.stringify({buildId:payload.buildId,buildAuthorityDigest:payload.buildAuthorityDigest,sourceWorkerManifestDigest:payload.sourceWorkerManifestDigest,sourceBakeSeal,changedSourceCount:changed.length},null,2));
