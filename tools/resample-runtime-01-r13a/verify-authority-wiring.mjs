
import { check, exists, read, sourceArtifact, seal } from './lib.mjs';
const required=['r13a-contract.mjs','key-registry-v2.mjs','rollout-plan-v2.mjs','fleet-ledger-v2.mjs','installation-admission.mjs','update-lease-v2.mjs','lease-claim.mjs','drain-permit.mjs','local-transition-binding.mjs','local-rollout-agent.mjs','r12a-fleet-adapter.mjs','local-completion-receipt.mjs','evidence-outbox.mjs','evidence-publisher.mjs','evidence-acknowledgement.mjs','fleet-ingestion.mjs','exact-aggregator-v2.mjs','privacy-view-v2.mjs','ring-controller-v2.mjs','containment-v2.mjs','recovery-replay.mjs','fleet-finalizer-v2.mjs'];
for(const name of required) check(exists(`app/features/resample-runtime/r13a/${name}`),'E_R13A_FINALIZER_REVALIDATION_FAILED',`missing R13A module ${name}`);
const all=required.map((n)=>read(`app/features/resample-runtime/r13a/${n}`)).join('\n');
check(!/writeProductionPointer|commitProductionPointer|compareAndSwapProductionPointer/.test(all),'E_R13A_POINTER_MUTATION_ATTEMPT','R13A contains Production Pointer writer');
check(!/commitLocalActivationPointer\s*\(/.test(all),'E_R13A_POINTER_MUTATION_ATTEMPT','R13A contains Local Pointer writer');
check(read('electron.mjs').includes('createElectronLocalRolloutAgentR13A'),'E_R13A_FLEET_BINDING_MISSING','Electron main R13A wiring absent');
check(read('preload.cjs').includes('runtimeFleet: Object.freeze'),'E_R13A_FLEET_BINDING_MISSING','preload R13A capability absent');
check(read('app/src/boot/runtime-modules.ts').includes('dadum.module.fleet-rollout-r13a'),'E_R13A_FLEET_BINDING_MISSING','runtime module R13A absent');
sourceArtifact('R13A_AUTHORITY_SEPARATION_REPORT.json',seal({schemaVersion:1,requiredModuleCount:required.length,productionPointerWriterCount:0,localPointerWriterCount:0,electronMainImport:true,preloadNarrowCapability:true,runtimeModuleDeclared:true}));
console.log('R13A authority and wiring PASS');
