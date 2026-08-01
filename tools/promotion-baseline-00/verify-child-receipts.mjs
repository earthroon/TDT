import path from 'node:path';
import { ARTIFACT_ROOT, SPEC_ID, admittedChildReceipts, boolArg, seal, writeJsonAtomic, writeFailure } from './lib.mjs';

try {
  const requirePromoted = boolArg('require-promoted', true);
  const children = admittedChildReceipts({ requirePromoted });
  const receipt = seal({
    schemaVersion: 1,
    specId: SPEC_ID,
    status: 'PASS',
    state: requirePromoted ? 'CHILD_RECEIPTS_ADMITTED' : 'CHILD_SOURCE_RECEIPTS_AUDITED',
    requirePromoted,
    dependencyLockPromotionReceiptDigest: children.lock.sha256,
    emittedArtifactIdentityReceiptDigest: children.emit.sha256,
    createdAt: new Date().toISOString(),
  });
  writeJsonAtomic(path.join(ARTIFACT_ROOT, 'input', 'child-receipt-admission.json'), receipt);
  console.log(`PASS ${SPEC_ID} child receipts state=${receipt.state}`);
} catch (error) {
  writeFailure(error.code ?? 'P0_CHILD_RECEIPT_REJECTED', error.detail ?? {}, error);
  console.error(error);
  process.exitCode = 1;
}
