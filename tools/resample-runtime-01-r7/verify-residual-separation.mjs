import {read,report,capture,check} from './lib.mjs';
const runtime=read('app/legacy-runtime/modules/dk_resample/export_residual_runtime_r7.mjs');
const shader=read('app/legacy-runtime/modules/dk_resample/shaders/export_detail_residual_r7.wgsl');
const exp=read('app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js');
const finalize=read('app/legacy-runtime/modules/dk_resample/export_finalize_runtime_r7.mjs');
const checks=[
 capture('residual-id',()=>check(/tdt\.ewa\.detail-residual\.directional-r7\.v1/.test(runtime),'E_R7_RESIDUAL_ID_MISSING','Residual ID missing')),
 capture('residual-abi',()=>check(/PARAM_BYTES = 64/.test(runtime)&&/abiVersion/.test(shader),'E_R7_RESIDUAL_ABI_MISMATCH','Residual ABI mismatch')),
 capture('detail-zero-disabled',()=>check(/detailMix === 0/.test(runtime)&&/status: 'DISABLED'/.test(runtime),'E_R7_RESIDUAL_DISABLE_BROKEN','detailMix zero does not disable exactly')),
 capture('terminal-guard',()=>check(/stageIndex !== input\.stageCount - 1/.test(runtime),'E_R7_RESIDUAL_INTERMEDIATE_FORBIDDEN','Residual terminal guard missing')),
 capture('once-after-lowpass',()=>{const low=exp.indexOf('executeCanonicalEwaLowpassR7');const residual=exp.indexOf('executeExportResidualR7');check(low>=0&&residual>low,'E_R7_RESIDUAL_ORDER','Residual is not after lowpass');}),
 capture('separate-output',()=>check(/format: 'rgba16float'/.test(runtime)&&/outputTexture: output/.test(runtime),'E_R7_RESIDUAL_OUTPUT_NOT_SEPARATE','Residual does not use separate rgba16 output')),
 capture('logical-distance',()=>check(/let logical = base/.test(shader)&&/vec2<f32>\(logical\) - p/.test(shader),'E_R7_RESIDUAL_DISTANCE_WRONG','Residual does not use exact logical sample distance')),
 capture('finalize-separate',()=>check(/export_finalize_rgba8_r7\.wgsl/.test(finalize)&&/copyTextureToBuffer/.test(finalize),'E_R7_FINALIZATION_NOT_SEPARATE','Finalization/readback boundary missing')),
 capture('lowpass-id-not-residual',()=>check(!/phase-correct-parametric-r6/.test(runtime),'E_R7_RESIDUAL_IDENTITY_COLLISION','Residual claims R6 kernel identity')),
];
report('TDT_RESAMPLE_RUNTIME_01_R7_RESIDUAL_SEPARATION_REPORT.json',checks,{residualExecutionLimit:1});if(checks.some(x=>!x.pass))process.exit(1);
