import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const ROOT=process.cwd();
export const ARTIFACT_DIR=path.join(ROOT,'artifacts','runtime');
export const PATCH_ID='TDT-JXL-CODEC-01';
export const ENCODER_WASM='app/legacy-runtime/encoders/jxl_bindings.wasm';
export const DECODER_WASM='app/legacy-runtime/vendor/jxl_wgpu_bridge/jxl_wgpu_bridge_bg.wasm';
export const ENCODER_WASM_SHA256='2536b058983c2fbc14d37f438a742fa01ed24c2b06951b8552d7f7830c560f31';
export const DECODER_WASM_SHA256='0f2524ed35343520f3492dea6a12cf50ea3d1d25023b0617ded65beff8bab7b3';
export const REPORT_FILES=Object.freeze([
'TDT_JXL_CODEC_01_SOURCE_INPUT_REPORT.json','TDT_JXL_CODEC_01_ARTIFACT_IDENTITY_REPORT.json','TDT_JXL_CODEC_01_ABI_PRESERVATION_REPORT.json','TDT_JXL_CODEC_01_ENCODER_PTHREAD_REPORT.json','TDT_JXL_CODEC_01_ENCODER_GENERATION_REPORT.json','TDT_JXL_CODEC_01_DECODER_ARTIFACT_REPORT.json','TDT_JXL_CODEC_01_DECODER_WORKER_REPORT.json','TDT_JXL_CODEC_01_DECODER_GENERATION_REPORT.json','TDT_JXL_CODEC_01_INDEPENDENCE_REPORT.json','TDT_JXL_CODEC_01_EXACT_RGBA8_REPORT.json','TDT_JXL_CODEC_01_HIDDEN_RGB_REPORT.json','TDT_JXL_CODEC_01_CONTAINER_STRUCTURE_REPORT.json','TDT_JXL_CODEC_01_METADATA_REPORT.json','TDT_JXL_CODEC_01_COLOR_ENCODING_REPORT.json','TDT_JXL_CODEC_01_CANCELABILITY_REPORT.json','TDT_JXL_CODEC_01_OUTPUT_IDENTITY_REPORT.json','TDT_JXL_CODEC_01_REPEATABILITY_REPORT.json','TDT_JXL_CODEC_01_BUILD_EMIT_CLOSURE_REPORT.json','TDT_JXL_CODEC_01_COI_ROUTE_REPORT.json','TDT_JXL_CODEC_01_EP03_INTEGRATION_REPORT.json','TDT_JXL_CODEC_01_PROMOTION_RECEIPT.json','TDT_JXL_CODEC_01_FIX_RECEIPT.json']);
export const canonicalize=(v)=>Array.isArray(v)?v.map(canonicalize):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonicalize(v[k])])):v;
export const canonicalJson=(v)=>JSON.stringify(canonicalize(v));
export const sha256Bytes=(v)=>crypto.createHash('sha256').update(v).digest('hex');
export const sha256File=(f)=>sha256Bytes(fs.readFileSync(f));
export const readJson=(f)=>JSON.parse(fs.readFileSync(f,'utf8'));
export function writeJson(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');}
export function seal(value,field='selfDigest'){const out={...value};delete out[field];out[field]=sha256Bytes(canonicalJson(out));return out;}
export function verifySeal(value,field='selfDigest'){const expected=value?.[field];if(!/^[0-9a-f]{64}$/.test(String(expected||'')))return false;const base={...value};delete base[field];return expected===sha256Bytes(canonicalJson(base));}
export function jxlStableErrors(){const source=fs.readFileSync('app/src/boot/stable-error.ts','utf8');return [...source.matchAll(/\|\s*'(E_JXL_[A-Z0-9_]+)'/g)].map(x=>x[1]);}
export function wasmDescriptor(relative){const bytes=fs.readFileSync(relative);const module=new WebAssembly.Module(bytes);return{path:relative,byteLength:bytes.byteLength,sha256:sha256Bytes(bytes),imports:WebAssembly.Module.imports(module),exports:WebAssembly.Module.exports(module)};}
export function sourceAudit(){
 const encoder=fs.readFileSync('app/legacy-runtime/encoders/jxl-canonical-adapter.mjs','utf8');
 const tracker=fs.readFileSync('app/legacy-runtime/encoders/jxl-child-worker-tracker.mjs','utf8');
 const decoder=fs.readFileSync('app/legacy-runtime/decoders/jxl-independent-rgba8-adapter.mjs','utf8');
 const decoderWorker=fs.readFileSync('app/src/runtime/workers/entries/jxl-independent-decoder.worker.ts','utf8');
 const profile=fs.readFileSync('app/src/runtime/decode/independent-decoder-profile.ts','utf8');
 const registry=fs.readFileSync('app/src/runtime/decode/decoder-registry-service.ts','utf8');
 const authority=fs.readFileSync('app/src/runtime/export/export-authority-service.ts','utf8');
 const emit=fs.readFileSync('tools/generate-emitted-worker-manifest-v2.mjs','utf8');
 const auxiliary=readJson('app/src/runtime/workers/generated-jxl-independent-decoder-manifest.json');
 const encoderWasm=wasmDescriptor(ENCODER_WASM);const decoderWasm=wasmDescriptor(DECODER_WASM);
 return Object.freeze({
  encoderWasm,decoderWasm,artifactsDistinct:encoderWasm.sha256!==decoderWasm.sha256,
  encoderAbiPreserved:encoder.includes("const ABI_SYMBOL = '_jxl_encode_qmap_ex'")&&encoder.includes("const FREE_SYMBOL = '_jxl_free'"),
  encoderPthreadPool4:encoder.includes('const PTHREAD_POOL_SIZE = 4')&&encoder.includes('emscripten-pthread-pool-4-canonical-v1'),
  encoderTracker:tracker.includes('expectedPoolSize = 4')&&tracker.includes('terminateAll')&&tracker.includes('restore'),
  encoderCoi:encoder.includes('crossOriginIsolated !== true')&&encoder.includes('sharedMemory: true'),
  decoderExact:decoder.includes('decode_jxl_ex(bytes, OutputKind.Rgba8, false)')&&decoder.includes("sampleEncoding: 'rgba8unorm-u8-v1'")&&decoder.includes('decoded?.free?.()'),
  decoderNoCanvas:!decoder.includes('createElement("canvas")')&&!decoder.includes('createImageBitmap')&&!decoder.includes('Rgba16F'),
  decoderCopy:decoder.includes('const rgba = new Uint8Array(expected)')&&decoder.includes('rgba.set(wasmView)'),
  decoderWorker:decoderWorker.includes("WORKER_ID = 'dadum.worker.decoder.jxl-independent-v1'")&&decoderWorker.includes("protocol: PROTOCOL"),
  decoderGeneration:profile.includes('let jxlGeneration = 0')&&profile.includes('rejectJxlGeneration')&&profile.includes('disposeIndependentJxlDecoder'),
  registryDispose:registry.includes('disposeIndependentJxlDecoder')&&registry.includes('disposeIndependentPsdDecoder'),
  authorityAdoption:authority.includes("artifactAdoptionId !== 'TDT-JXL-CODEC-01'")&&authority.includes("childWorkerClosurePolicyId !== 'tracked-worker-generation-termination-v1'"),
  auxiliaryManifest:auxiliary.workers?.length===1&&auxiliary.workers[0]?.workerId==='dadum.worker.decoder.jxl-independent-v1',
  emittedClosure:emit.includes('auxiliarySourceManifestDigest')&&emit.includes('allSourceWorkers'),
  stableErrors:jxlStableErrors(),
 });
}
export function inspectContainer(bytes){
 const u8=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);const read=(o)=>(((u8[o]<<24)>>>0)|(u8[o+1]<<16)|(u8[o+2]<<8)|u8[o+3])>>>0;const ascii=(o,n)=>String.fromCharCode(...u8.subarray(o,o+n));
 if(u8.length<12||read(0)!==12||ascii(4,4)!=='JXL ')throw new Error('E_JXL_CONTAINER_INVALID');
 const boxes=[];let offset=0;while(offset<u8.length){if(offset+8>u8.length)throw new Error('E_JXL_CONTAINER_BOX_TRUNCATED');const lbox=read(offset);const type=ascii(offset+4,4);let size=lbox,header=8;if(lbox===1){if(offset+16>u8.length||read(offset+8)!==0)throw new Error('E_JXL_CONTAINER_BOX_TRUNCATED');size=read(offset+12);header=16;}else if(lbox===0)size=u8.length-offset;if(size<header||offset+size>u8.length)throw new Error('E_JXL_CONTAINER_BOX_TRUNCATED');boxes.push({type,offset,size,dataOffset:offset+header,dataLength:size-header});offset+=size;if(lbox===0)break;}
 if(offset!==u8.length)throw new Error('E_JXL_CONTAINER_INVALID');const count=(t)=>boxes.filter(b=>b.type===t).length;const jxlc=count('jxlc'),jxlp=count('jxlp');if(!((jxlc===1&&jxlp===0)||(jxlc===0&&jxlp>0)))throw new Error('E_JXL_CONTAINER_CARRIER_CONFLICT');
 return{boxes,boxTypes:boxes.map(b=>b.type),ftypCount:count('ftyp'),jxlcCount:jxlc,jxlpCount:jxlp,exifCount:count('Exif'),xmlCount:count('xml '),eofExact:true};
}
export function hiddenRgbFixture(){return new Uint8Array([255,0,0,0,0,255,0,0,0,0,255,0,17,33,65,0,1,2,3,255,254,253,252,128]);}
export function compareExact(expected,actual,width){if(expected.length!==actual.length)return{ok:false,code:'E_JXL_ROUNDTRIP_MISMATCH',byteIndex:-1};for(let i=0;i<expected.length;i++){if(expected[i]!==actual[i]){const pixel=Math.floor(i/4),channel=i%4;return{ok:false,code:expected[pixel*4+3]===0&&channel<3?'E_JXL_HIDDEN_RGB_MISMATCH':'E_JXL_ROUNDTRIP_MISMATCH',byteIndex:i,pixel,x:pixel%width,y:Math.floor(pixel/width),channel:['R','G','B','A'][channel],expected:expected[i],actual:actual[i]};}}return{ok:true,comparedByteLength:expected.length};}
