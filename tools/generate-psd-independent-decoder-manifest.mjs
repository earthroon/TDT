import fs from 'node:fs';
import path from 'node:path';
import { canonicalJson, sha256Bytes, sha256File } from './runtime-manifest-lib.mjs';
const root=process.cwd();
const artifacts=[
 ['app/src/runtime/workers/entries/psd-independent-decoder.worker.ts','entry'],
 ['app/legacy-runtime/decoders/psd-independent-exact-parser.mjs','chunk'],
 ['app/src/runtime/decode/independent-decoder-profile.ts','asset'],
 ['app/src/runtime/codecs/psd/psd-structure-verifier-v2.ts','asset'],
].map(([url,role])=>{const file=path.join(root,url);if(!fs.existsSync(file))throw new Error(`E_PSD_DECODER_ARTIFACT_MISSING:${url}`);return{url,role,byteLength:fs.statSync(file).size,sha256:sha256File(file)}}).sort((a,b)=>a.url.localeCompare(b.url));
const worker={workerId:'dadum.worker.decoder.psd-independent-v1',ownerRuntimeEncoderIds:[],ownerRuntimeDecoderIds:['dadum.decoder.psd-independent-v1'],controlProtocolVersion:'dadum-independent-decoder-control-v1',codecProtocolVersion:'dadum-psd-independent-decoder-worker-v1',entrySourceIdentity:'vite:app/src/runtime/workers/entries/psd-independent-decoder.worker.ts',entryRelative:'app/src/runtime/workers/entries/psd-independent-decoder.worker.ts',transferPolicyId:'transfer-psd-input-exact-plane-output-v1',wasmPolicyId:'psd-independent-direct-parser-no-presentation-v1',workerType:'module',required:true,realization:'lazy',maxInstances:1,artifactVerificationMode:'source-graph-only',sourceGraphDigest:sha256Bytes(canonicalJson(artifacts)),entryAssetSha256:artifacts.find(x=>x.role==='entry').sha256,workerArtifactSetDigest:sha256Bytes(canonicalJson(artifacts)),artifacts};
const base={schema:'dadum-auxiliary-worker-manifest-source-v1',patchId:'TDT-PSD-DECODER-01',generatedBy:'tools/generate-psd-independent-decoder-manifest.mjs',artifactVerificationMode:'source-graph-only',workers:[worker]};
const out={...base,sourceManifestDigest:sha256Bytes(canonicalJson(base))};
const file=path.join(root,'app/src/runtime/workers/generated-psd-independent-decoder-manifest.json');fs.writeFileSync(file,JSON.stringify(out,null,2)+'\n');console.log(`PASS PSD-DECODER-01 source manifest ${out.sourceManifestDigest}`);
