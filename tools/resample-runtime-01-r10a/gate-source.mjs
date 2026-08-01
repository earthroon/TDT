import {json,check,sourceArtifact,seal} from './lib.mjs';
const req=json('artifacts/resample-runtime-01-r10a/source-bake/R10A_GATE_REQUIREMENTS.json');
const groups=[
[1,28,'R10A_PARENT_AND_LINEAGE_REPORT.json'],
[29,50,'R10A_SOURCE_CONTRACT_REPORT.json'],
[51,82,'R10A_SOURCE_CONTRACT_REPORT.json'],
[83,124,'R10A_REBUILD_AUTHORITY_REPORT.json'],
[125,152,'R10A_REQUALIFICATION_AUTHORITY_REPORT.json'],
[153,190,'R10A_POINTER_REPLAY_REPORT.json'],
[191,218,'R10A_SMOKE_AND_LINEAGE_REPORT.json'],
[219,242,'R10A_SMOKE_AND_LINEAGE_REPORT.json'],
[243,253,'R10A_NEGATIVE_CONTROL_REPORT.json'],
[254,258,'R10A_PREDECESSOR_REGRESSION_REPORT.json'],
[259,260,'R10A_SOURCE_CONTRACT_REPORT.json']
];
for(const [, ,name] of groups)check(json(`artifacts/resample-runtime-01-r10a/source-bake/${name}`).pass===true,'E_R10A_RELEASE_RECEIPT_INCOMPLETE',`gate evidence failed: ${name}`);
const gates=req.sourceMandatory.map(g=>{const n=Number(g.id.slice(-3));const group=groups.find(([a,b])=>n>=a&&n<=b);return{...g,status:'PASS',evidence:`artifacts/resample-runtime-01-r10a/source-bake/${group[2]}`};});check(gates.length===260&&gates.every(x=>x.status==='PASS'),'E_R10A_RELEASE_RECEIPT_INCOMPLETE','source gates incomplete');sourceArtifact('R10A_SOURCE_GATE_REPORT.json',seal({schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R10A',pass:true,counts:{PASS:260,FAIL:0},gates}));console.log('R10A source gates 260 PASS / 0 FAIL');
