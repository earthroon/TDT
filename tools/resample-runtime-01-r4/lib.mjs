import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const ARTIFACT_DIR = path.join(ROOT, 'artifacts/resample-runtime-01-r4/source-bake');
export const FIXTURE_REL = 'fixtures/resample-runtime-01-r4/TDT_RESAMPLE_RUNTIME_01_R4_TILE_PROOF_FIXTURES.json';
export const PATCH_ID = 'TDT-RESAMPLE-RUNTIME-01-R4';
export const PARENT_PATCH_ID = 'TDT-RESAMPLE-RUNTIME-01-R3';
export const PARENT_ZIP_SHA256 = '706033b69dd076eecb76de2c46ce9eeb543db40b969f338d285ad927c7266e7d';
export const COORDINATE_CONVENTION_ID = 'tdt.ewa.source-lattice.pixel-center-v2';
export const PRODUCT_COORDINATE_ID = 'tdt.ewa.product-coordinate.phase-correct-r4.v1';
export const TILE_COVERAGE_PROOF_ID = 'tdt.ewa.tile-coverage.phase-aware-r4.v1';
export const PROFILE_SCHEMA_ID = 'tdt.ewa.tiled-profile.r4.v1';
export const PARAMETER_ABI_ID = 'tdt.delta-k-ewa.params.v3';
export const PARAMETER_BYTES = 80;
export const PARENT_RUNTIME_SHA256 = '43f2d3b2b08006ef581ac16992a6ca7cd2c358d37180d0bb58fa6ccd2220592c';
export const PARENT_FILES = Object.freeze({
  productR4: ['app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r4_r2.wgsl', 'c2714270086eb1ad0a514e4850f01816b98890cfbd16755372001547b34aee24'],
  productR6: ['app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r6_r2.wgsl', '0d7cb8a26cb063708bb4f04e665f0ef8e6d44cb4db58d802b341ad220bea58a7'],
  validationR4: ['app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r4_r2.wgsl', 'f9f7efedde8ca7c547359ac91b175aabb0868be2d87a50d2680d7373c6e210fd'],
  validationR6: ['app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r6_r2.wgsl', '0c6bbbd8a3007f79bc7e1eb4dee0dec5ad2f4e7f20dfc1d095d7e16068eb7c8e'],
  directReference: ['app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v2_r1c.wgsl', 'bfd0e2d94e15467379b92c9c2ed4a3555be1d1b0a9a67b4f0f167eb550dbc4eb'],
  profileSelector: ['app/legacy-runtime/core/compute/qmap_webgpu/ewa_tiled_profile_r2.mjs', '07f1d65d5bc09b0f7231034ef85001ba4fdd6346cf93abe2cda441012ccd8b33'],
  parityRuntime: ['app/legacy-runtime/core/compute/qmap_webgpu/ewa_parity_runtime_r2.mjs', 'b787e6fffcf3c2c98d36cc6bb2fc34a2f67e460ae79b76bd3fa4144f4d768ba5'],
});
export const R3_EVIDENCE = Object.freeze({
  "fixtures/resample-runtime-01-r3/TDT_RESAMPLE_RUNTIME_01_R3_FIXTURE_MANIFEST.json": "50680a02de0bcef84caf0d9f501fa3c3a63aab4e5855f90d2d982cf8ab4cf907",
  "artifacts/resample-runtime-01-r3/source-bake/TDT_RESAMPLE_RUNTIME_01_R3_ORACLE_IDENTITY.json": "9d4bf3ef540b3df638252631ebebf437840476beba4c6b38d5b8ca3d226bbca0",
  "artifacts/resample-runtime-01-r3/source-bake/TDT_RESAMPLE_RUNTIME_01_R3_ORACLE_SELF_TEST_RECEIPT.json": "7e84ddd9b3196fda13c47540cb83959c88aaa7a85f9770ade46a45da659522ba",
  "artifacts/resample-runtime-01-r3/source-bake/TDT_RESAMPLE_RUNTIME_01_R3_NEGATIVE_CONTROL_RECEIPT.json": "5c2e0678760af8ec8116c8661ac8e716a4377507a41655930e4f997b40cd1bef",
  "artifacts/resample-runtime-01-r3/source-bake/TDT_RESAMPLE_RUNTIME_01_R3_CURRENT_PRODUCT_REJECTION_RECEIPT.json": "ab2af3ffcef50f62af5ffce5560253d96fd64ea4811e6b84ad60dd0bcf9aa092",
  "artifacts/resample-runtime-01-r3/source-bake/TDT_RESAMPLE_RUNTIME_01_R3_ZERO_RUNTIME_CPU_FALLBACK_RECEIPT.json": "c831e6367e05efaa3f4ef990ade826b4aa9f69058d0c70e99c8c249deb526ceb"
});
export const R4_FILES = Object.freeze({
  productR4: 'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r4_r4.wgsl',
  productR6: 'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r6_r4.wgsl',
  validationR4: 'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r4_r4.wgsl',
  validationR6: 'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r6_r4.wgsl',
  reference: 'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v3_r4.wgsl',
  profile: 'app/legacy-runtime/core/compute/qmap_webgpu/ewa_tiled_profile_r4.mjs',
  parity: 'app/legacy-runtime/core/compute/qmap_webgpu/ewa_parity_runtime_r4.mjs',
  receipt: 'app/legacy-runtime/core/compute/qmap_webgpu/ewa_optimization_receipt_r4.mjs',
  runtime: 'app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_tile.mjs',
});
export function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
export function readBytes(rel) { return fs.readFileSync(path.join(ROOT, rel)); }
export function readJson(rel) { return JSON.parse(read(rel)); }
export function sha256(data) { return crypto.createHash('sha256').update(data).digest('hex'); }
export function sha256File(rel) { return sha256(readBytes(rel)); }
export function canonicalize(value) { if (Array.isArray(value)) return value.map(canonicalize); if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])])); return value; }
export function canonicalJson(value) { return JSON.stringify(canonicalize(value), null, 2) + '\n'; }
export function writeJson(name, value) { fs.mkdirSync(ARTIFACT_DIR, { recursive: true }); fs.writeFileSync(path.join(ARTIFACT_DIR, name), canonicalJson(value), 'utf8'); }
export function writeFile(rel, text) { const target = path.join(ROOT, rel); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, text, 'utf8'); }
export function check(pass, id, message, detail = null) { return { id, pass: Boolean(pass), message, detail }; }
export function stableError(code, message, detail = null) { return Object.assign(new Error(message), { code, detail }); }
export function loadR3Manifest() { return readJson('fixtures/resample-runtime-01-r3/TDT_RESAMPLE_RUNTIME_01_R3_FIXTURE_MANIFEST.json'); }
