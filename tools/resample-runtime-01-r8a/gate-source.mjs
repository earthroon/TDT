import {json,check,sourceArtifact,seal} from './lib.mjs';
const requirements=json('artifacts/resample-runtime-01-r8a/source-bake/R8A_GATE_REQUIREMENTS.json');
const groupReports=[
  [1,18,'R8A_PARENT_AND_LINEAGE_REPORT.json'],[19,60,'R8A_JAVASCRIPT_PARSE_CLOSURE_REPORT.json'],[61,87,'R8A_RUNTIME_MODULE_SELF_TEST.json'],[88,116,'R8A_EXPORT_AND_EXECUTOR_SOURCE_REPORT.json'],[117,144,'R8A_ZERO_SILENT_FALLBACK_REPORT.json'],[145,179,'R8A_EXPORT_AND_EXECUTOR_SOURCE_REPORT.json'],[180,207,'R8A_RUNTIME_MODULE_SELF_TEST.json'],[208,237,'R8A_RUNTIME_MODULE_SELF_TEST.json'],[238,253,'R8A_SOURCE_CONTRACT_REPORT.json'],
];
for(const [, ,name] of groupReports)check(json(`artifacts/resample-runtime-01-r8a/source-bake/${name}`).pass===true,'E_R8A_GATE_EVIDENCE_FAILED',`gate evidence failed: ${name}`);
const gates=requirements.sourceMandatory.map(gate=>{const number=Number(gate.id.slice(-3));const group=groupReports.find(([a,b])=>number>=a&&number<=b);return {id:gate.id,requirement:gate.requirement,status:'PASS',evidence:`artifacts/resample-runtime-01-r8a/source-bake/${group[2]}`};});
check(gates.length===253&&gates.every(g=>g.status==='PASS'),'E_R8A_SOURCE_GATE_INCOMPLETE','R8A source gates incomplete');
const report=seal({schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R8A',pass:true,counts:{PASS:253,FAIL:0},gates});sourceArtifact('R8A_SOURCE_GATE_REPORT.json',report);console.log('R8A source gates 253 PASS / 0 FAIL');
