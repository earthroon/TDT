import { sourceArtifact, seal, sha256File } from './lib.mjs';
const receipt = seal({
  schemaVersion: 1,
  receiptKind: 'build-lock-r2-downstream-invalidation',
  patchId: 'TDT-BUILD-LOCK-01-R2',
  parentR14ASourceReceiptSha256: sha256File('artifacts/resample-runtime-01-r14a/source-bake/TDT_RESAMPLE_RUNTIME_01_R14A_SOURCE_FINAL_RECEIPT.json'),
  historicalPassCarryForward: 0,
  algorithmSourceStatus: {
    r1aThroughR8a: 'ALGORITHM_SOURCE_UNCHANGED',
    note: 'Build authority patch does not claim new GPU algorithm evidence.'
  },
  evidenceStatus: [
    { authority: 'TDT-BUILD-LOCK-01', status: 'SUPERSEDED_BY_R2' },
    { authority: 'TDT-RESAMPLE-RUNTIME-01-R9A-PHYSICAL', status: 'REPLAY_REQUIRED_AFTER_R2_FINAL_ADMISSION' },
    { authority: 'TDT-RESAMPLE-RUNTIME-01-R10A-RELEASE', status: 'REPLAY_REQUIRED_AFTER_R2_FINAL_ADMISSION' },
    { authority: 'TDT-RESAMPLE-RUNTIME-01-R11A-INSTALLED', status: 'REPLAY_REQUIRED_AFTER_R10A' },
    { authority: 'TDT-RESAMPLE-RUNTIME-01-R12A-INSTALLED', status: 'REPLAY_REQUIRED_AFTER_R11A' },
    { authority: 'TDT-RESAMPLE-RUNTIME-01-R13A-FLEET', status: 'REPLAY_REQUIRED_AFTER_R12A' },
    { authority: 'TDT-RESAMPLE-RUNTIME-01-R14A-DISTRIBUTION', status: 'REPLAY_REQUIRED_AFTER_R13A_AND_R2_SIGNED_BUILD' }
  ],
  productionPointerMutationCount: 0,
  localActivationPointerMutationCount: 0
});
sourceArtifact('BLR2_DOWNSTREAM_INVALIDATION_RECEIPT.json', receipt);
console.log('BLR2 downstream invalidation receipt PASS');
