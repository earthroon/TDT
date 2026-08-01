import path from 'node:path';
import { ARTIFACT_ROOT, SPEC_ID, assert, readJson } from './lib.mjs';
const receipt = readJson(path.join(ARTIFACT_ROOT, 'emit', 'emitted-artifact-identity-receipt.json'));
assert(receipt.specId === SPEC_ID && receipt.state === 'EMITTED_ARTIFACT_IDENTITY_VERIFIED', 'P0B_CHILD_RECEIPT_REJECTED');
assert(receipt.productionBytesObserved === true && typeof receipt.emittedArtifactIdentityDigest === 'string', 'P0B_EMITTED_IDENTITY_MISSING');
console.log(`PASS ${SPEC_ID} emitted identity ${receipt.emittedArtifactIdentityDigest}`);
