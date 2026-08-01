import path from 'node:path';
import { ARTIFACT_ROOT, SPEC_ID, assert, dependencyRootParity, readJson, sha256File, ROOT } from './lib.mjs';

const file = path.join(ARTIFACT_ROOT, 'lock', 'dependency-lock-promotion-receipt.json');
const receipt = readJson(file);
const parity = dependencyRootParity();
assert(receipt.specId === SPEC_ID && receipt.state === 'DEPENDENCY_LOCK_PROMOTED' && receipt.promoted === true, 'P0A_CHILD_RECEIPT_REJECTED');
assert(receipt.promotedPackageLockSha256 === sha256File(path.join(ROOT, 'package-lock.json')), 'P0A_LOCK_READBACK_MISMATCH');
assert(parity.exact, 'P0A_ROOT_GRAPH_MISMATCH', parity);
assert(receipt.offlineReplayCount === 2 && receipt.installGraphParity === true && receipt.lockMutationZero === true, 'P0A_OFFLINE_REPLAY_FAILED');
console.log(`PASS ${SPEC_ID} lock receipt ${receipt.selfDigest}`);
