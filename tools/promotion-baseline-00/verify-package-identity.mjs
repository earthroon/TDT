import path from 'node:path';
import { ARTIFACT_ROOT, SPEC_ID, assert, readJson } from './lib.mjs';
const receipt = readJson(path.join(ARTIFACT_ROOT, 'package', 'package-identity-receipt.json'));
assert(receipt.specId === SPEC_ID && receipt.state === 'PACKAGE_CONTENT_IDENTITY_VERIFIED', 'P0C_PACKAGE_RECEIPT_REJECTED');
assert(receipt.packageABIdentity === true && receipt.packageAContentDigest === receipt.packageBContentDigest, 'P0C_PACKAGE_IDENTITY_MISMATCH', receipt);
console.log(`PASS ${SPEC_ID} package identity ${receipt.packageContentId}`);
