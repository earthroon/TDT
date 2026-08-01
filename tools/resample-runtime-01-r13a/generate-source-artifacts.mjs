
import { read, sourceArtifact, seal, sha256File, check } from './lib.mjs';
import { PATCH_ID, SPEC, SOURCE_PASS, FLEET_PENDING, SOURCE_STATE } from './identity.mjs';
const text=read(SPEC);
const rows=[...text.matchAll(/^#### (R13A-[SP]\d{3}) `([^`]+)`/gm)].map((m)=>({id:m[1],requirement:m[2].trim()}));
const sourceMandatory=rows.filter((r)=>r.id.startsWith('R13A-S'));
const fleetMandatory=rows.filter((r)=>r.id.startsWith('R13A-P'));
check(sourceMandatory.length===SOURCE_PASS,'E_R13A_FINALIZER_REVALIDATION_FAILED','source gate count mismatch',sourceMandatory.length);
check(fleetMandatory.length===FLEET_PENDING,'E_R13A_FINALIZER_REVALIDATION_FAILED','fleet gate count mismatch',fleetMandatory.length);
sourceArtifact('R13A_GATE_REQUIREMENTS.json',seal({schemaVersion:1,schemaId:'tdt.resample.gate-catalog.r13a.v1',patchId:PATCH_ID,specSha256:sha256File(SPEC),sourceMandatory,fleetMandatory}));
sourceArtifact('R13A_FLEET_GATE_STATUS.json',seal({schemaVersion:1,schemaId:'tdt.resample.fleet-gate-status.r13a.v1',patchId:PATCH_ID,state:'AWAITING_R9A_PHYSICAL_R10A_RELEASE_R11A_INSTALLED_R12A_INSTALLED_AND_QUALIFIED_FLEET',counts:{PASS:0,PENDING:FLEET_PENDING,DEFERRED:0,SKIPPED:0,FAIL:0},gates:fleetMandatory.map((gate)=>({...gate,status:'PENDING',evidence:null,reason:'requires-qualified-multi-installation-fleet-r12a-installed-chain-lease-claim-drain-permit-local-binding-evidence-ack-containment-and-recovery-replay'}))}));

const schemaFiles = [
  'rollout-plan-v2.schema.json','fleet-ledger-v2.schema.json','installation-admission.schema.json','update-lease-v2.schema.json','lease-claim.schema.json','drain-permit.schema.json','local-transition-binding.schema.json','local-completion.schema.json','post-update-evidence-v2.schema.json','evidence-ack.schema.json','exact-aggregate-v2.schema.json','privacy-report-v2.schema.json','containment-v2.schema.json','recovery-replay.schema.json','final-fleet-receipt.schema.json'
];
sourceArtifact('R13A_SCHEMA_MANIFEST.json', seal({ schemaVersion: 1, schemaId: 'tdt.resample.schema-manifest.r13a.v1', schemas: schemaFiles.map((name) => ({ name, sha256: sha256File(`tools/resample-runtime-01-r13a/schemas/${name}`) })) }));

sourceArtifact('R13A_SOURCE_EXPECTED_STATE.json',seal({schemaVersion:1,patchId:PATCH_ID,state:SOURCE_STATE,counts:{PASS:SOURCE_PASS,PENDING:FLEET_PENDING,DEFERRED:0,SKIPPED:0,FAIL:0}}));
console.log(`R13A gate catalog ${sourceMandatory.length} source / ${fleetMandatory.length} fleet`);
