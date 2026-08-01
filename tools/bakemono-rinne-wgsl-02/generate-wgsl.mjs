import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  BKR02_PATCH_ID,BKR02_KERNEL_ID,BKR02_KERNEL_ABI_ID,BKR02_PIPELINE_FAMILY_ID,
  BKR02_FORMULA_ID,BKR02_COLOR_CONTRACT_ID,
} from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_wgsl_02_contract.mjs';
import { canonicalBakemonoRinneJson } from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_contract_receipt.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const TEMPLATE_REL='tools/bakemono-rinne-wgsl-02/templates/compat-kernel.wgsl.tmpl';
const OUT_REL='app/legacy-runtime/core/compute/qmap_webgpu/shaders/bakemono_rinne_fusion_compat_v1.generated.wgsl';
const MANIFEST_REL='app/legacy-runtime/core/compute/qmap_webgpu/shaders/generated-bakemono-rinne-wgsl-02-manifest.json';
const SOURCE_MANIFEST_REL='artifacts/bakemono-rinne-wgsl-02/source/generated-wgsl-manifest.json';
const shaBytes=(v)=>createHash('sha256').update(v).digest('hex');
const shaJson=(v)=>shaBytes(canonicalBakemonoRinneJson(v));
const fileBytes=(rel)=>fs.readFileSync(path.join(ROOT,rel));
const fileSha=(rel)=>shaBytes(fileBytes(rel));

export const BKR02_GENERATOR_RUNTIME='node-22.16.0';

export function renderBakemonoRinneWgsl02() {
  let text=fs.readFileSync(path.join(ROOT,TEMPLATE_REL),'utf8').replace(/\r\n/g,'\n');
  const replacements={KERNEL_ID:BKR02_KERNEL_ID,KERNEL_ABI_ID:BKR02_KERNEL_ABI_ID,PIPELINE_FAMILY_ID:BKR02_PIPELINE_FAMILY_ID,FORMULA_ID:BKR02_FORMULA_ID,COLOR_CONTRACT_ID:BKR02_COLOR_CONTRACT_ID};
  for(const [key,value] of Object.entries(replacements))text=text.replaceAll(`{{${key}}}`,value);
  if (/\{\{[A-Z0-9_]+\}\}/.test(text)) throw Object.assign(new Error('Unresolved WGSL template token'),{code:'E_BKR02_GENERATOR_INPUT_DRIFT'});
  if (!text.endsWith('\n')) text+='\n';
  return text;
}

export function createBakemonoRinneWgsl02GeneratorManifest(wgsl) {
  const body={schemaVersion:1,patchId:BKR02_PATCH_ID,kernelId:BKR02_KERNEL_ID,kernelAbiId:BKR02_KERNEL_ABI_ID,formulaId:BKR02_FORMULA_ID,formulaContractDigest:fileSha('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_formula_contract.mjs'),colorContractDigest:fileSha('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_color_contract.mjs'),scalarProfileDigest:fileSha('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_scalar_profiles.mjs'),phaseContractDigest:fileSha('app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_phase_contract.mjs'),generatorSourceDigest:fileSha('tools/bakemono-rinne-wgsl-02/generate-wgsl.mjs'),templateDigest:fileSha(TEMPLATE_REL),generatedWgslDigest:shaBytes(wgsl),generatedByteLength:Buffer.byteLength(wgsl),generatedLineCount:wgsl.split('\n').length-1,generatorRuntime:BKR02_GENERATOR_RUNTIME};
  return Object.freeze({...body,manifestDigest:shaJson(body)});
}

export function writeBakemonoRinneWgsl02GeneratedSource() {
  const a=renderBakemonoRinneWgsl02();
  const b=renderBakemonoRinneWgsl02();
  if (a!==b) throw Object.assign(new Error('WGSL generator produced different bytes'),{code:'E_BKR02_GENERATED_SOURCE_NONDETERMINISTIC'});
  const manifest=createBakemonoRinneWgsl02GeneratorManifest(a);
  for(const rel of [OUT_REL,MANIFEST_REL,SOURCE_MANIFEST_REL])fs.mkdirSync(path.dirname(path.join(ROOT,rel)),{recursive:true});
  fs.writeFileSync(path.join(ROOT,OUT_REL),a);
  fs.writeFileSync(path.join(ROOT,MANIFEST_REL),JSON.stringify(manifest,null,2)+'\n');
  fs.writeFileSync(path.join(ROOT,SOURCE_MANIFEST_REL),JSON.stringify(manifest,null,2)+'\n');
  return {wgsl:a,manifest};
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){const {manifest}=writeBakemonoRinneWgsl02GeneratedSource();console.log(`PASS generated WGSL ${manifest.generatedWgslDigest} bytes=${manifest.generatedByteLength}`);}
