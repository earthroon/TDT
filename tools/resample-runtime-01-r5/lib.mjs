import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const ARTIFACT_DIR=path.join(ROOT,'artifacts/resample-runtime-01-r5/source-bake');
export const FIXTURE_REL='fixtures/resample-runtime-01-r5/TDT_RESAMPLE_RUNTIME_01_R5_AXIAL_FIXTURES.json';
export const PATCH_ID='TDT-RESAMPLE-RUNTIME-01-R5';
export const PARENT_ZIP_SHA256='5df4a248dd14947eca9ab275f824a8e670c423e0ab7dd8f1fe74c7086a5c6d9c';
export const IDS=Object.freeze({schema:'tdt.structure-tensor.axial-coherence-edge.r5.v1',representation:'tdt.axial.double-angle.algebraic-v1',interpolation:'tdt.ewa.axial-bilinear.coherence-weighted-r5.v1',reconstruction:'tdt.ewa.axial-half-angle.canonical-r5.v1',coherence:'tdt.ewa.axial-agreement-magnitude-r5.v1'});
export const FROZEN=Object.freeze({
 'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r4_r4.wgsl':'d743126cf2413b7591363db2ee52ad430fa14fcd3c4a0f07907a9392482046ca',
 'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r6_r4.wgsl':'1299c11260a188b0a5bfed7eabdc46c6c0c268db25bc372827cb6f839dd12948',
 'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r4_r4.wgsl':'2c573a4839ab6f30bfeee7da2a5336becfabd48230ea2acd5f2a06f835663ba1',
 'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r6_r4.wgsl':'6a8107db3922eec9598c924806d2c90ceccef0c6a7d47cc75cf2412092dc477b',
 'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v3_r4.wgsl':'4c0f978f48845f7af8c6c84b1b795f9a26bfc3ed8c043e66e034d206964da447',
 'app/legacy-runtime/core/compute/qmap_webgpu/ewa_tiled_profile_r4.mjs':'008c48ed1e326952ec42b0e7f101957759f17942a364b2a6241fa1156aa3536a',
 'app/legacy-runtime/core/compute/qmap_webgpu/ewa_parity_runtime_r4.mjs':'bbc73dd789353eb2fda95b4c24ec33f7711f81c2e8315027c0dab3f39db2c288',
 'app/legacy-runtime/core/compute/qmap_webgpu/shaders/structure_tensor_eigen_r1c.wgsl':'c4560743a9d42718e261c2cd2f069289aed6efabd341dc11b89c7c765ff38728'
});
export function read(rel){return fs.readFileSync(path.join(ROOT,rel),'utf8')}export function bytes(rel){return fs.readFileSync(path.join(ROOT,rel))}export function sha(data){return crypto.createHash('sha256').update(data).digest('hex')}export function shaFile(rel){return sha(bytes(rel))}export function writeJson(name,v){fs.mkdirSync(ARTIFACT_DIR,{recursive:true});fs.writeFileSync(path.join(ARTIFACT_DIR,name),JSON.stringify(v,null,2)+'\n')}export function check(pass,id,message,detail=null){return {id,pass:Boolean(pass),message,detail}};
