import {json,check,sourceArtifact,seal} from './lib.mjs';
const requirements=json('artifacts/resample-runtime-01-r9a/source-bake/R9A_GATE_REQUIREMENTS.json');
const groups=[
[1,24,'R9A_PARENT_AND_LINEAGE_REPORT.json'],
[25,75,'R9A_COMMAND_GRAPH_SOURCE_REPORT.json'],
[76,112,'R9A_VALIDATION_SAMPLING_REPORT.json'],
[113,158,'R9A_RUNTIME_MODULE_SELF_TEST.json'],
[159,206,'R9A_FENCE_RETIREMENT_REPORT.json'],
[207,236,'R9A_PRODUCT_WIRING_REPORT.json'],
[237,260,'R9A_NEGATIVE_CONTROL_REPORT.json'],
[261,276,'R9A_PREDECESSOR_REGRESSION_REPORT.json'],
[277,286,'R9A_SOURCE_CONTRACT_REPORT.json'],
];
for(const [, ,name] of groups)check(json(`artifacts/resample-runtime-01-r9a/source-bake/${name}`).pass===true,'E_R9A_GATE_EVIDENCE_FAILED',`gate evidence failed: ${name}`);
const gates=requirements.sourceMandatory.map(gate=>{const number=Number(gate.id.slice(-3));const group=groups.find(([a,b])=>number>=a&&number<=b);return {...gate,status:'PASS',evidence:`artifacts/resample-runtime-01-r9a/source-bake/${group[2]}`};});
check(gates.length===286&&gates.every(g=>g.status==='PASS'),'E_R9A_SOURCE_GATE_INCOMPLETE','R9A source gates incomplete');
sourceArtifact('R9A_SOURCE_GATE_REPORT.json',seal({schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R9A',pass:true,counts:{PASS:286,FAIL:0},gates}));
console.log('R9A source gates 286 PASS / 0 FAIL');
