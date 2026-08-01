import fs from 'node:fs';
import path from 'node:path';
import { canonicalJson, sha256Bytes, sha256File } from './runtime-manifest-lib.mjs';
const root=process.cwd();
const artifacts=[
 ['app/src/runtime/workers/entries/jxl-independent-decoder.worker.ts','entry'],
 ['app/legacy-runtime/decoders/jxl-independent-rgba8-adapter.mjs','chunk'],
 ['app/legacy-runtime/vendor/jxl_wgpu_bridge/jxl_wgpu_bridge.js','chunk'],
 ['app/legacy-runtime/vendor/jxl_wgpu_bridge/jxl_wgpu_bridge_bg.wasm','wasm'],
 ['app/src/runtime/codecs/jxl/jxl-roundtrip-verifier-v1.ts','asset'],
 ['app/src/runtime/codecs/jxl/jxl-container-metadata-verifier-v1.ts','asset'],
].map(([url,role])=>{const file=path.join(root,url);if(!fs.existsSync(file))throw new Error(`E_JXL_DECODER_ARTIFACT_MISMATCH:${url}`);return{url,role,byteLength:fs.statSync(file).size,sha256:sha256File(file)}}).sort((a,b)=>a.url.localeCompare(b.url));
const worker={
 workerId:'dadum.worker.decoder.jxl-independent-v1',
 ownerRuntimeEncoderIds:[],
 ownerRuntimeDecoderIds:['dadum.decoder.jxl-independent-v1'],
 controlProtocolVersion:'dadum-independent-decoder-control-v1',
 codecProtocolVersion:'dadum-jxl-independent-decoder-worker-v1',
 entrySourceIdentity:'vite:app/src/runtime/workers/entries/jxl-independent-decoder.worker.ts',
 entryRelative:'app/src/runtime/workers/entries/jxl-independent-decoder.worker.ts',
 transferPolicyId:'transfer-jxl-input-transfer-rgba8-output-v1',
 wasmPolicyId:'jxl-independent-wasm-no-encoder-sharing-v1',
 workerType:'module',required:true,realization:'lazy',maxInstances:1,
 artifactVerificationMode:'source-graph-only',
 sourceGraphDigest:sha256Bytes(canonicalJson(artifacts)),
 entryAssetSha256:artifacts.find(x=>x.role==='entry').sha256,
 workerArtifactSetDigest:sha256Bytes(canonicalJson(artifacts)),
 artifacts,
};
const base={schema:'dadum-auxiliary-worker-manifest-source-v1',patchId:'TDT-JXL-CODEC-01',generatedBy:'tools/generate-jxl-independent-decoder-manifest.mjs',artifactVerificationMode:'source-graph-only',workers:[worker]};
const out={...base,sourceManifestDigest:sha256Bytes(canonicalJson(base))};
const file=path.join(root,'app/src/runtime/workers/generated-jxl-independent-decoder-manifest.json');
fs.writeFileSync(file,JSON.stringify(out,null,2)+'\n');
console.log(`PASS JXL-CODEC-01 decoder source manifest ${out.sourceManifestDigest}`);
