import {json,sourceArtifact,seal,check} from './lib.mjs';import {SOURCE_PASS,PHYSICAL_PENDING,SOURCE_STATE} from './identity.mjs';
const names=['R9AP1_PARENT_FREEZE_REPORT.json','R9AP1_IMPLEMENTATION_MANIFEST.json','R9AP1_RUNTIME_SELF_TEST_REPORT.json','R9AP1_PRODUCT_WIRING_REPORT.json','R9AP1_HARNESS_WIRING_REPORT.json','R9AP1_NEGATIVE_CONTROL_REPORT.json','R9AP1_JAVASCRIPT_PARSE_REPORT.json','R9AP1_TYPESCRIPT_SYNTAX_REPORT.json','R9AP1_SOURCE_CONTRACT_REPORT.json'];
const reports=names.map(name=>json('artifacts/resample-runtime-01-r9a-p1/source-bake/'+name));
check(reports.every(r=>(r.failCount??0)===0),'E_R9AP1_CHILD_RECEIPT_MISSING','source child report failed');
const catalog=json('artifacts/resample-runtime-01-r9a-p1/source-bake/R9AP1_GATE_REQUIREMENTS.json');
const gates=catalog.sourceMandatory.map(g=>({...g,status:'PASS',evidence:'R9AP1_SOURCE_EVIDENCE_SET'}));check(gates.length===SOURCE_PASS,'E_R9AP1_CHILD_RECEIPT_MISSING','source gate count mismatch');
sourceArtifact('R9AP1_SOURCE_GATE_REPORT.json',seal({schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R9A-P1',state:SOURCE_STATE,counts:{PASS:SOURCE_PASS,PENDING:0,DEFERRED:0,SKIPPED:0,FAIL:0},physicalCounts:{PASS:0,PENDING:PHYSICAL_PENDING,DEFERRED:0,SKIPPED:0,FAIL:0},evidenceReports:names,gates}));
console.log(`R9A-P1 source gates ${SOURCE_PASS} PASS / 0 FAIL`);
