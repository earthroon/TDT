import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createNativeDecoderAttestation, inspectPeBuffer } from '../app/electron/native-decoder-attestation.mjs';

export const ROOT = process.cwd();
export const ARTIFACT_DIR = path.join(ROOT, 'artifacts', 'runtime');
export const PATCH_ID = 'TDT-NATIVE-DECODER-01';
export const CANONICAL_FILENAME = 'decoder_rs.win32-x64-msvc.node';
export const ABI_VERSION = 'dadum-native-decoder-abi-v1';
export const EXPECTED_MACHINE = 0x8664;
export const REQUIRED_EXPORTS = Object.freeze(['status','self_test','abi_descriptor','decode_buffer','decode_path']);
export const REQUIRED_FACADE_EXPORTS = Object.freeze(['status','decodeBuffer','decodePath']);
export const CORE_FORMATS = Object.freeze(['png','jpeg','webp']);
export const EXACT_SURFACES = Object.freeze(['rgba8unorm-u8-v1','rgba16le-unorm-u16-v1']);
export const STABLE_ERRORS = Object.freeze(["E_NATIVE_TOOLCHAIN_PROFILE_MISSING","E_NATIVE_RUST_TOOLCHAIN_MISMATCH","E_NATIVE_NAPI_CLI_IDENTITY_MISMATCH","E_NATIVE_CARGO_LOCK_MUTATED","E_NATIVE_NPM_LOCK_MUTATED","E_NATIVE_BUILD_A_FAILED","E_NATIVE_BUILD_B_FAILED","E_NATIVE_BUILD_NONDETERMINISTIC","E_NATIVE_ADDON_MISSING","E_NATIVE_ADDON_MULTIPLE","E_NATIVE_ADDON_UNEXPECTED_NAME","E_NATIVE_ADDON_ARCH_MISMATCH","E_NATIVE_ADDON_DEBUG_BUILD","E_NATIVE_ADDON_SHA_MISMATCH","E_NATIVE_ADDON_IMPORT_POLICY_FAILED","E_NATIVE_ADDON_LOAD_FAILED","E_NATIVE_ABI_EXPORT_MISSING","E_NATIVE_ABI_VERSION_MISMATCH","E_NATIVE_NAPI_FEATURE_MISMATCH","E_NATIVE_SELF_TEST_FAILED","E_NATIVE_ATTESTATION_FAILED","E_NATIVE_INPUT_EMPTY","E_NATIVE_INPUT_TOO_LARGE","E_NATIVE_FORMAT_UNKNOWN","E_NATIVE_FORMAT_HINT_MISMATCH","E_NATIVE_DIMENSION_LIMIT","E_NATIVE_PIXEL_BUDGET_EXCEEDED","E_NATIVE_METADATA_BUDGET_EXCEEDED","E_NATIVE_ANIMATION_UNSUPPORTED","E_NATIVE_DECODE_FAILED","E_NATIVE_OUTPUT_SCHEMA_INVALID","E_NATIVE_OUTPUT_LENGTH_MISMATCH","E_NATIVE_OUTPUT_STORAGE_UNSUPPORTED","E_NATIVE_OUTPUT_DIGEST_MISMATCH","E_NATIVE_PNG16_EXACTNESS_FAILED","E_NATIVE_HIDDEN_RGB_FAILED","E_NATIVE_METADATA_PARSE_FAILED","E_NATIVE_DECODER_UNAVAILABLE","E_NATIVE_DECODER_NOT_ATTESTED","E_NATIVE_DECODER_FALLBACK_FORBIDDEN","E_NATIVE_DECODE_TIMEOUT","E_NATIVE_DECODE_STALE_RESULT","E_NATIVE_PATH_API_FORBIDDEN","E_NATIVE_PACKAGE_CONTENT_MISMATCH","E_NATIVE_PACKAGED_EXECUTION_FAILED"]);

export const canonicalize=(v)=>Array.isArray(v)?v.map(canonicalize):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonicalize(v[k])])):v;
export const canonicalJson=(v)=>JSON.stringify(canonicalize(v));
export const sha256Bytes=(v)=>crypto.createHash('sha256').update(v).digest('hex');
export const sha256File=(f)=>sha256Bytes(fs.readFileSync(f));
export const readJson=(f)=>JSON.parse(fs.readFileSync(f,'utf8'));
export function writeJson(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');}
export function seal(value,field='selfDigest'){const x={...value};delete x[field];x[field]=sha256Bytes(canonicalJson(x));return x;}
export function verifySeal(value,field='selfDigest'){const d=value?.[field];if(!/^[0-9a-f]{64}$/.test(String(d||'')))return false;const x={...value};delete x[field];return d===sha256Bytes(canonicalJson(x));}
export function walkFiles(dir){if(!fs.existsSync(dir))return[];const out=[];for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...walkFiles(p));else if(e.isFile())out.push(p);}return out;}

export function sourceAudit(){
  const nativeDir=path.join(ROOT,'native/decoder-rs');
  const canonicalPath=path.join(nativeDir,CANONICAL_FILENAME);
  const nodes=walkFiles(nativeDir).filter(f=>f.endsWith('.node')).sort();
  const rust=fs.readFileSync(path.join(nativeDir,'src/lib.rs'),'utf8');
  const loader=fs.readFileSync(path.join(nativeDir,'index.cjs'),'utf8');
  const electron=fs.readFileSync(path.join(ROOT,'electron.mjs'),'utf8');
  const preload=fs.readFileSync(path.join(ROOT,'preload.cjs'),'utf8');
  const registry=fs.readFileSync(path.join(ROOT,'app/src/runtime/decode/decoder-registry-service.ts'),'utf8');
  const pkg=readJson(path.join(ROOT,'package.json'));
  const nativePkg=readJson(path.join(nativeDir,'package.json'));
  return Object.freeze({
    canonicalPath: path.relative(ROOT,canonicalPath).replaceAll(path.sep,'/'),
    canonicalPresent: fs.existsSync(canonicalPath),
    canonicalSha256: fs.existsSync(canonicalPath)?sha256File(canonicalPath):null,
    canonicalByteLength: fs.existsSync(canonicalPath)?fs.statSync(canonicalPath).size:0,
    nodeFiles:nodes.map(f=>path.relative(ROOT,f).replaceAll(path.sep,'/')),
    releaseAddonCount:nodes.filter(f=>!/(?:debug|target\/debug)/i.test(f)).length,
    debugAddonCount:nodes.filter(f=>/(?:debug|target\/debug)/i.test(f)).length,
    exactU16Source:rust.includes('rgba16le-unorm-u16-v1')&&rust.includes('sample.to_le_bytes()')&&!rust.includes('f16::from_f32'),
    metadataSource:['parse_png_metadata','parse_jpeg_metadata','parse_webp_metadata','iCCP','ICC_PROFILE','pHYs','ICCP'].every(t=>rust.includes(t)),
    limitsSource:['max_input_bytes','max_pixels','max_metadata_bytes','E_NATIVE_PIXEL_BUDGET_EXCEEDED'].every(t=>rust.includes(t)),
    canonicalLoader:loader.includes(CANONICAL_FILENAME)&&!loader.includes("target', 'debug")&&!loader.includes('findFirstNodeBinary'),
    pathDecodeRendererExposed:preload.includes('decodePath')||electron.includes("dadum:native-decode-path"),
    registryAttestationGate:registry.includes('status.attestationVerified === true')&&registry.includes("status.abiVersion === 'dadum-native-decoder-abi-v1'"),
    packageExactAddon:(pkg.build.files||[]).includes(`native/decoder-rs/${CANONICAL_FILENAME}`)&&JSON.stringify(pkg.build.asarUnpack)===JSON.stringify([`native/decoder-rs/${CANONICAL_FILENAME}`]),
    rootNapiCli:pkg.devDependencies?.['@napi-rs/cli']||null,
    nativeOwnCli:nativePkg.devDependencies?.['@napi-rs/cli']||null,
  });
}

export function syntheticPe({machine=EXPECTED_MACHINE,characteristics=0x2002}={}){
  const b=Buffer.alloc(512);b.writeUInt16LE(0x5a4d,0);b.writeUInt32LE(0x80,0x3c);b.write('PE\0\0',0x80,'ascii');b.writeUInt16LE(machine,0x84);b.writeUInt16LE(characteristics,0x80+22);return b;
}

export async function syntheticAttestationFixture(){
  const dir=fs.mkdtempSync(path.join('/tmp','tdt-native-decoder-01-'));
  const entryPath=path.join(dir,'index.cjs');
  const addonPath=path.join(dir,CANONICAL_FILENAME);
  fs.writeFileSync(entryPath,'module.exports={}\n');
  fs.writeFileSync(addonPath,syntheticPe());
  const digest=sha256File(addonPath);
  const loader={
    status:async()=>({available:true,abiVersion:ABI_VERSION,napiFeatureLevel:'napi6',selfTestVerified:true,artifactSha256:digest,exports:[...REQUIRED_EXPORTS]}),
    decodeBuffer:async()=>null,
    decodePath:async()=>null,
  };
  const pass=await createNativeDecoderAttestation({entryPath,loader,platform:'win32',arch:'x64',packaged:true});
  const wrongMachinePath=path.join(dir,'wrong.node');fs.writeFileSync(wrongMachinePath,syntheticPe({machine:0x14c}));
  const pe=inspectPeBuffer(fs.readFileSync(addonPath));
  fs.rmSync(dir,{recursive:true,force:true});
  return {pass,pe};
}
