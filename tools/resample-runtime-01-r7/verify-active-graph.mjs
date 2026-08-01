import {readJson,report,capture,check} from './lib.mjs';
const assets=readJson('app/src/runtime/assets/generated-runtime-asset-manifest.json');
const graph=readJson('app/src/runtime/active-graph/generated-active-runtime-graph.json');
const texts=JSON.stringify(assets)+JSON.stringify(graph);
const required=['ewa_canonical_lowpass_runtime_r7.mjs','export_residual_runtime_r7.mjs','export_finalize_runtime_r7.mjs','export_detail_residual_r7.wgsl','export_finalize_rgba8_r7.wgsl'];
const checks=required.map(name=>capture(name,()=>check(texts.includes(name),'E_R7_ACTIVE_GRAPH_ASSET_MISSING','R7 asset missing from active graph',{name})));
for(const legacy of ['export_ewa_lowpass.wgsl','export_ewa_recompose.wgsl','export_ewa_recompose_linear.wgsl'])checks.push(capture(`retired:${legacy}`,()=>check(!texts.includes(legacy),'E_R7_LEGACY_EXPORT_ASSET_ADMITTED','Retired Export shader remains admitted',{legacy})));
report('TDT_RESAMPLE_RUNTIME_01_R7_ACTIVE_GRAPH_REPORT.json',checks);if(checks.some(x=>!x.pass))process.exit(1);
