import {json,hashFile,check,sourceArtifact,seal,runNode,read} from './lib.mjs';
runNode('tools/active-graph-01/verify-javascript-parse-closure-r8a.mjs');
const report=json('artifacts/resample-runtime-01-r8a/source-bake/TDT_RESAMPLE_RUNTIME_01_R8A_JAVASCRIPT_PARSE_REPORT.json');
check(report.authority==='tdt.active-runtime.javascript-parse-closure.r8a.v1','E_R8A_PARSER_AUTHORITY_MISMATCH','parse report authority mismatch');
check(report.activeRequiredParseFailCount===0&&report.activeRequiredUnparsedCount===0,'E_R8A_ACTIVE_REQUIRED_PARSE_FAILED','active required JavaScript parse closure failed');
check(report.activeRequiredParsePassCount===report.activeRequiredJavaScriptCount&&report.activeRequiredJavaScriptCount>0,'E_R8A_ACTIVE_REQUIRED_INVENTORY_INCOMPLETE','active required JavaScript inventory incomplete');
const paths=report.records.map(row=>row.sourceRelative);check(paths.every((value,index)=>index===0||paths[index-1].localeCompare(value)<=0),'E_R8A_PARSE_INVENTORY_NON_CANONICAL','parse inventory not canonical');
const byPath=new Map(report.records.map(row=>[row.sourceRelative,row]));
for(const rel of ['app/legacy-runtime/encoders/webp_api_forced.js','app/legacy-runtime/js/export/wgpu_export_install.js']){
 const row=byPath.get(rel);check(row?.semantic==='esm-module'&&row.parsePass,'E_R8A_ACTIVE_REQUIRED_PARSE_FAILED',`${rel} is not admitted as parsed ESM`,row);
}
const pkg=json('package.json');
check(String(pkg.scripts?.['verify:renderer']||'').includes('verify:resample-runtime-01-r8a:parser'),'E_R8A_PARSER_GATE_NOT_IN_RENDERER_CHAIN','parser gate missing from verify:renderer');
check(String(pkg.scripts?.['build:renderer:emit']||'').includes('verify:resample-runtime-01-r8a:parser'),'E_R8A_PARSER_GATE_NOT_IN_BUILD_CHAIN','parser gate missing from build emit');
const evidence=seal({schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R8A',pass:true,authority:report.authority,activeRequiredJavaScriptCount:report.activeRequiredJavaScriptCount,activeRequiredParsePassCount:report.activeRequiredParsePassCount,activeRequiredParseFailCount:0,activeRequiredUnparsedCount:0,parseReportSha256:hashFile('artifacts/resample-runtime-01-r8a/source-bake/TDT_RESAMPLE_RUNTIME_01_R8A_JAVASCRIPT_PARSE_REPORT.json'),activeGraphDigest:report.graphDigest,staticAdmissionDigest:json('app/src/legacy/generated-legacy-static-admission.json').digest??null,runtimeAssetManifestDigest:json('app/src/runtime/assets/generated-runtime-asset-manifest.json').manifestDigest??null});
sourceArtifact('R8A_JAVASCRIPT_PARSE_CLOSURE_REPORT.json',evidence);
console.log(`PASS R8A JavaScript parse closure ${report.activeRequiredParsePassCount}/${report.activeRequiredJavaScriptCount}`);
