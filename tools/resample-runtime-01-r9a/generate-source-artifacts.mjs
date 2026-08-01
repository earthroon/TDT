import fs from 'node:fs';
import {read,sourceArtifact,seal,sha256File,check} from './lib.mjs';
import {PATCH_ID,SPEC,SOURCE_PASS,PHYSICAL_PENDING,SOURCE_STATE} from './identity.mjs';
const text=read(SPEC);
const rows=[...text.matchAll(/\| `((?:R9A-S|R9A-P)\d{3})` \| ([^|]+) \|/g)].map(match=>({id:match[1],requirement:match[2].trim()}));
const sourceMandatory=rows.filter(row=>row.id.startsWith('R9A-S'));
const physicalMandatory=rows.filter(row=>row.id.startsWith('R9A-P'));
check(sourceMandatory.length===SOURCE_PASS,'E_R9A_SOURCE_GATE_COUNT','R9A source gate count mismatch',{actual:sourceMandatory.length});
check(physicalMandatory.length===PHYSICAL_PENDING,'E_R9A_PHYSICAL_GATE_COUNT','R9A physical gate count mismatch',{actual:physicalMandatory.length});
sourceArtifact('R9A_GATE_REQUIREMENTS.json',seal({schemaVersion:1,patchId:PATCH_ID,specSha256:sha256File(SPEC),sourceMandatory,physicalMandatory}));
sourceArtifact('R9A_PHYSICAL_GATE_STATUS.json',seal({schemaVersion:1,patchId:PATCH_ID,state:'AWAITING_PACKAGED_WINDOWS_D3D12_EXECUTION',counts:{PASS:0,PENDING:PHYSICAL_PENDING,DEFERRED:0,SKIPPED:0,FAIL:0},gates:physicalMandatory.map(gate=>({...gate,status:'PENDING',evidence:null}))}));

sourceArtifact('R9A_DOWNSTREAM_INVALIDATION_RECEIPT.json',seal({schemaVersion:1,schemaId:'tdt.resample.downstream-invalidation.r9a.v1',patchId:PATCH_ID,currentAuthority:'TDT-RESAMPLE-RUNTIME-01-R9A',supersededReceipts:['TDT-RESAMPLE-RUNTIME-01-R9','TDT-RESAMPLE-RUNTIME-01-R10','TDT-RESAMPLE-RUNTIME-01-R11','TDT-RESAMPLE-RUNTIME-01-R12','TDT-RESAMPLE-RUNTIME-01-R13'],reason:'R9A changes canonical command submission, validation, uniform allocation, and performance identity',replayOrder:['TDT-RESAMPLE-RUNTIME-01-R10A','TDT-RESAMPLE-RUNTIME-01-R11A','TDT-RESAMPLE-RUNTIME-01-R12A','TDT-RESAMPLE-RUNTIME-01-R13A'],historicalReceiptsDeleted:false,historicalPassCarryForward:0,productionPointerMutated:false,localActivationPointerMutated:false}));
sourceArtifact('R9A_SOURCE_EXPECTED_STATE.json',seal({schemaVersion:1,patchId:PATCH_ID,state:SOURCE_STATE,counts:{PASS:SOURCE_PASS,PENDING:PHYSICAL_PENDING,DEFERRED:0,SKIPPED:0,FAIL:0}}));
console.log(`R9A gate catalog ${sourceMandatory.length} source / ${physicalMandatory.length} physical`);
