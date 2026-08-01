import { ARTIFACT_DIR, inspectCanonicalArtifact, seal, writeJson } from './modjpeg-01-lib.mjs';
const artifact=inspectCanonicalArtifact();
const report=seal({
 schemaVersion:2,patchId:'TDT-MODJPEG-01',status:'SOURCE_BAKED_UNPROMOTED',artifactAdoptionId:'TDT-MODJPEG-01',
 artifactContractId:'dadum.modjpeg-pthread-pool-8-canonical-v1',canonicalPthreadArtifact:true,canonicalSingleThread:false,
 threadMode:'emscripten-pthread-pool-8-canonical-v1',...artifact,
 canonicalAdoptionEligible:artifact.pthreadPoolSize===8&&artifact.pthreadSymbolCount>0&&artifact.childWorkerReferenceCount>0&&artifact.sharedMemory&&artifact.abiPreserved&&artifact.artifactBytesPreserved,
 blockers:['production emitted child-worker closure not yet verified','packaged Electron COI E2E not yet executed'],
});
writeJson(`${ARTIFACT_DIR}/TDT_MODJPEG_01_CANONICAL_ARTIFACT_REPORT.json`,report);
if(!report.canonicalAdoptionEligible) process.exit(1);
console.log(`PASS TDT-MODJPEG-01 canonical pthread artifact ${report.wasmSha256}`);
