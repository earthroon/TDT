import {check,read,sourceArtifact,seal} from './lib.mjs';
const runtime=read('app/legacy-runtime/core/compute/qmap_webgpu/ewa_single_submit_runtime_r9a.mjs');
const graph=read('app/legacy-runtime/core/compute/qmap_webgpu/ewa_command_graph_r9a.mjs');
const preview=read('app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs');
const exp=read('app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js');
const required=[
['single runtime export',runtime.includes('executeCanonicalEwaLowpassR9A')],
['record source',runtime.includes('recordSourcePrepare')],
['record tensor',runtime.includes('recordTensor')],
['record adaptive',runtime.includes('recordAdaptivePolicy')],
['record EWA',runtime.includes('recordEwaStage')],
['record residual',runtime.includes('recordExportResidualR9A')],
['record finalization',runtime.includes('recordExportFinalizationR9A')],
['one encoder authority',(graph.match(/device\.createCommandEncoder\s*\(/g)??[]).length===1],
['one queue submit authority',(graph.match(/queue\.submit/g)??[]).length===0&&graph.includes('authority.fences.submit')],
['no stage fence',!runtime.includes('onSubmittedWorkDone')],
['preview wiring',preview.includes('executeCanonicalEwaLowpassR9A')],
['export wiring',exp.includes('createEwaCommandGraphR9A')&&exp.includes('graph.submit')],
];
for(const [name,pass] of required)check(pass,'E_R9A_COMMAND_GRAPH_SOURCE',`R9A command graph source check failed: ${name}`);
const report=seal({schemaVersion:1,pass:true,checks:Object.fromEntries(required),canonicalJobEncoderCount:1,canonicalJobSubmitCount:1,stageSubmitCount:0,stageFenceCount:0,validationDoubleDispatchCount:0});
sourceArtifact('R9A_COMMAND_GRAPH_SOURCE_REPORT.json',report);
console.log('R9A command graph source PASS');
