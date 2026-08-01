import path from 'node:path';
import {ROOT,walk,sourceArtifact,seal,sha256File,check} from './lib.mjs';
const roots=['app/electron/resample-runtime-r9a-p1','app/renderer/physical-r9a-p1','tools/resample-runtime-01-r9a-p1'];
const extra=['electron.mjs','preload.cjs','package.json','vite.config.ts','app/src/runtime/gpu/gpu-device-qualification-observer.ts','app/src/runtime/gpu/gpu-device-authority-service.ts','app/legacy-runtime/core/compute/qmap_webgpu/ewa_command_graph_r9a.mjs','app/legacy-runtime/core/compute/qmap_webgpu/ewa_uniform_ring_r9a.mjs','app/legacy-runtime/core/compute/qmap_webgpu/ewa_submission_fence_registry_r9a.mjs','app/legacy-runtime/core/compute/qmap_webgpu/ewa_single_submit_runtime_r9a.mjs','app/legacy-runtime/core/compute/qmap_webgpu/ewa_physical_observation_r9a_p1.mjs','app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js'];
const files=[...new Set([...roots.flatMap(r=>walk(path.join(ROOT,r)).map(f=>path.relative(ROOT,f).replaceAll('\\','/'))),...extra])].sort();
for(const f of files)check(!f.includes('/artifacts/'),'E_R9AP1_IMPLEMENTATION_MANIFEST','artifact included in implementation manifest',{file:f});
const entries=files.map(file=>({file,sha256:sha256File(file)}));
sourceArtifact('R9AP1_IMPLEMENTATION_MANIFEST.json',seal({schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R9A-P1',fileCount:entries.length,entries}));
console.log(`R9A-P1 implementation manifest PASS ${entries.length} files`);
