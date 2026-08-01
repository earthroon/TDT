import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const ARTIFACT_DIR = path.join(ROOT, 'artifacts/resample-runtime-01-r6/source-bake');
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

export const PARENT_ZIP_SHA256 = '6b6d7e403d4d289c43c28956b74df5c272da7138055fd180df671a5a5298fa63';
export const CONTRACT_DIGEST = '18d413d630172515d463e6598d9f9e90c6a221c1fca41824defeae3e19da8909';
export const FROZEN = Object.freeze({
  'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r4_r5.wgsl': '7e2bc7b8f1daa181bf6bc13754b664d11a71a8cdb564745d8b7d652c5f333e52',
  'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r6_r5.wgsl': 'a40bea61442074b0a19bfad3ab96c8a21b436119c41832243e0049601d5c205d',
  'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r4_r5.wgsl': 'b0aeb90dca2a076d293e2907b91c541000258bb1784a50ce6261ea9e49f68535',
  'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r6_r5.wgsl': '8c85b53f78e4880f9ad03264478d184b7bab582cc2586b93fdbc9bcafcf7b6fd',
  'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v4_r5.wgsl': '4f8a4574ff9ad5fb0f5eeaad5e687e8d83d1639698f4d90ba4c146568d2bfd5b',
  'app/legacy-runtime/core/compute/qmap_webgpu/shaders/structure_tensor_axial_r5.wgsl': '2f00744b42416f0730682bdf397bca3fc05fce3d5dc10a2d2e27f32563725bca',
  'app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_params_v3.mjs': '7a46125442b519bd7b65b98b319260b1b7fcce5b46e98a4632f73d795accdc62',
  'app/legacy-runtime/core/compute/qmap_webgpu/ewa_tiled_profile_r4.mjs': '008c48ed1e326952ec42b0e7f101957759f17942a364b2a6241fa1156aa3536a',
  'app/legacy-runtime/core/compute/qmap_webgpu/ewa_axial_contract_r5.mjs': '80d49122501f83157c76107a78365079cab53061a61d0693cadadefe570b2705',
  'app/legacy-runtime/core/compute/qmap_webgpu/ewa_parity_runtime_r5.mjs': '582b68cea539e8a9c13811d81d3bbc2c1a6be6c3c8489e7d0fbcb8cc1ca76e3b',
  'specs/TDT-RESAMPLE-RUNTIME-01-R5_AXIAL_TENSOR_INTERPOLATION_SUBPIXEL_DIRECTION_CONTINUITY_DOUBLE_ANGLE_FIELD_SAMPLING_COHERENCE_EDGE_PHASE_CONTINUITY_SEAL_SPEC.md': '7d614934b3b688ee327c10eadfad2fc116ebda977d562a2ef939fea3b40a4c22',
  'README_TDT_RESAMPLE_RUNTIME_01_R5_APPLIED.md': '1333c1645c3ab8f99fb6907e68ba8db82363ff8a7ef40c0aa82eb8ac79f193fd',
});

export function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8').replace(/\r\n/g, '\n');
}
export function readJson(relative) { return JSON.parse(read(relative)); }
export function shaBytes(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
export function shaFile(relative) { return shaBytes(fs.readFileSync(path.join(ROOT, relative))); }
export function writeArtifact(name, value) {
  const target = path.join(ARTIFACT_DIR, name);
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + '\n');
  return target;
}
export function check(pass, name, detail = null) { return { name, pass: Boolean(pass), detail }; }
export function stableJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
}
