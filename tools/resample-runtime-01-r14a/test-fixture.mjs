import fs from 'node:fs';
import { privateKeyFromPem, sha256Bytes, seal } from '../../app/features/resample-runtime/r14a/canonical-metadata.mjs';
import { createRootMetadata } from '../../app/features/resample-runtime/r14a/root-metadata.mjs';
import { createDelegatedMetadata } from '../../app/features/resample-runtime/r14a/role-delegation.mjs';
import { createSignedPackageManifestV2 } from '../../app/features/resample-runtime/r14a/signed-package-manifest-v2.mjs';
import { createTransparencyLeaf } from '../../app/features/resample-runtime/r14a/transparency-leaf.mjs';
import { buildMerkleTree, createInclusionProofFromTree } from '../../app/features/resample-runtime/r14a/merkle-tree.mjs';
import { createConsistencyProof } from '../../app/features/resample-runtime/r14a/consistency-proof.mjs';
import { createCheckpoint } from '../../app/features/resample-runtime/r14a/checkpoint.mjs';
import { createWitnessSignatureSet } from '../../app/features/resample-runtime/r14a/witness-quorum.mjs';
import { createReleaseEnvelope } from '../../app/features/resample-runtime/r14a/release-envelope.mjs';
import { verifyStreamingDownload } from '../../app/features/resample-runtime/r14a/streaming-download-verifier.mjs';
import { createLocalTrustState } from '../../app/features/resample-runtime/r14a/local-trust-state.mjs';
import { admitDistribution } from '../../app/features/resample-runtime/r14a/distribution-admission.mjs';
import { createMirrorFetchReceipt } from '../../app/features/resample-runtime/r14a/mirror-metadata.mjs';
import { reassembleRanges } from '../../app/features/resample-runtime/r14a/range-reassembly.mjs';
import { bindR12AStagingToDistribution } from '../../app/features/resample-runtime/r14a/r12a-distribution-adapter.mjs';
import { bindR13APlanToDistribution } from '../../app/features/resample-runtime/r14a/r13a-distribution-adapter.mjs';
import { createKeyRevocation } from '../../app/features/resample-runtime/r14a/key-revocation.mjs';
import { createKeyRotationReceipt } from '../../app/features/resample-runtime/r14a/key-rotation.mjs';
import { createRollbackPermit } from '../../app/features/resample-runtime/r14a/rollback-permit.mjs';

const keysFixture = JSON.parse(fs.readFileSync(new URL('./fixtures/test-keys.json', import.meta.url), 'utf8'));
const allRecords = Object.values(keysFixture.roles).flat();
const authorities = Object.fromEntries(Object.entries(keysFixture.roles).map(([role, records]) => [role, records.map((record) => ({ ...record, privateKey: privateKeyFromPem(record.privateKeyPem) }))]));
const publicRecords = allRecords.map(({ keyId, role, publicKeyPem }) => ({ keyId, role, publicKeyPem, status: 'ACTIVE', generation: 1 }));
const D = (label) => sha256Bytes(Buffer.from(`R14A:${label}`));
const NOW = Date.parse('2030-01-01T00:00:00.000Z');
const EXPIRES = '2040-01-01T00:00:00.000Z';

export async function createValidFixture() {
  const packageBytes = Buffer.from('TDT-R14A-FIXTURE-PACKAGE-V1\n');
  const packageContentId = sha256Bytes(packageBytes);
  const root = createRootMetadata({ version: 1, expiresAt: EXPIRES, keys: publicRecords }, authorities.root.slice(0, 2));
  const targets = createDelegatedMetadata({ role: 'targets', version: 1, expiresAt: EXPIRES, payload: { releaseId: 'release-r14a-5', packageContentId } }, authorities.targets.slice(0, 2));
  const snapshot = createDelegatedMetadata({ role: 'snapshot', version: 1, expiresAt: EXPIRES, payload: { targetsVersion: 1, targetsSha256: targets.signedSha256 } }, authorities.snapshot.slice(0, 1));
  const timestamp = createDelegatedMetadata({ role: 'timestamp', version: 1, expiresAt: EXPIRES, payload: { snapshotVersion: 1, snapshotSha256: snapshot.signedSha256 } }, authorities.timestamp.slice(0, 1));
  const manifest = createSignedPackageManifestV2({
    releaseId: 'release-r14a-5', releaseSequence: 5, releaseEpoch: 1, buildId: 'fixture-build-r14a', packageContentId, packageByteLength: packageBytes.length, platformTuple: 'win32-x64-electron',
    runtimeClosureDigest: D('runtime-closure'), installedClosureDigest: D('installed-closure'), activeGraphDigest: D('active-graph'), javascriptParseDigest: D('javascript-parse'), generatedWgslManifestDigest: D('wgsl'),
    r8aSourceReceiptSha256: D('r8a'), r9aPhysicalReceiptSha256: D('r9a'), r10aReleaseReceiptSha256: D('r10a'), r11aInstalledReceiptSha256: D('r11a'), r12aInstalledReceiptSha256: D('r12a'), r13aFleetReceiptSha256: D('r13a'), buildLockR2AdmissionReceiptSha256: D('blr2'),
    rootVersion: 1, targetsVersion: 1, snapshotVersion: 1, revocationGeneration: 0, minimumInstallerVersion: 1, minimumLauncherVersion: 1, expiresAt: EXPIRES,
  }, authorities.release.slice(0, 2));
  const leaf = createTransparencyLeaf({ leafType: 'PACKAGE_RELEASE', logIndex: 0, body: { manifestSha256: manifest.manifestSha256, packageContentId, releaseSequence: 5 } });
  const tree = buildMerkleTree([leaf.merkleLeafHash]);
  const inclusionProof = createInclusionProofFromTree(tree, 0);
  const consistencyProof = createConsistencyProof([], [leaf.merkleLeafHash]);
  const checkpoint = createCheckpoint({ treeSize: tree.treeSize, rootHash: tree.rootHash, logGeneration: 1, issuedAt: '2030-01-01T00:00:00.000Z' }, authorities['transparency-log'].slice(0, 1));
  const witnessSet = createWitnessSignatureSet(checkpoint, authorities.witness.slice(0, 2));
  const envelope = createReleaseEnvelope({ manifest, targetsMetadata: targets, snapshotMetadata: snapshot, timestampMetadata: timestamp, checkpoint });
  const streamReceipt = await verifyStreamingDownload([packageBytes.subarray(0, 8), packageBytes.subarray(8)], { expectedSha256: packageContentId, expectedByteLength: packageBytes.length, sourceKind: 'MIRROR', objectGeneration: 'fixture-object-v1' });
  const trustState = createLocalTrustState();
  const distributionInput = { root, trustedRoot: null, targets, snapshot, timestamp, manifest, envelope, leaf, inclusionProof, consistencyProof, checkpoint, witnessSet, trustState, streamReceipt, withdrawals: [], now: NOW };
  const distributionAdmission = admitDistribution(distributionInput);
  const stagedPackageReceipt = seal({ schemaVersion: 1, schemaId: 'tdt.resample-runtime.staged-package-receipt.r12a.v1', packageContentId, buildId: manifest.signed.buildId, closureDigest: manifest.signed.installedClosureDigest, canaryDigest: D('canary'), pass: true }, 'receiptSha256');
  const r12aBinding = bindR12AStagingToDistribution({ distributionAdmission, stagedPackageReceipt });
  const r13aRolloutPlan = seal({ schemaVersion: 2, schemaId: 'tdt.resample.fleet-rollout-plan.r13a.v2', rolloutId: 'a'.repeat(48), targetPackageContentId: packageContentId, r14aManifestSha256: manifest.manifestSha256, r14aCheckpointSha256: checkpoint.checkpointSha256, r14aRootVersion: 1, r14aReleaseSequence: 5, r14aRevocationGeneration: 0 }, 'planSha256');
  const r13aBinding = bindR13APlanToDistribution({ rolloutPlan: r13aRolloutPlan, distributionAdmission, manifest, checkpoint });
  const mirrorFetchReceipts = ['ORIGIN','MIRROR','CDN'].map((sourceKind) => createMirrorFetchReceipt({ sourceKind, objectGeneration: 'fixture-object-v1', bytes: packageBytes }));
  const ranges = [
    { rangeStart: 0, rangeEnd: 8, bytes: packageBytes.subarray(0, 8), chunkSha256: sha256Bytes(packageBytes.subarray(0, 8)), objectGeneration: 'fixture-object-v1' },
    { rangeStart: 8, rangeEnd: packageBytes.length, bytes: packageBytes.subarray(8), chunkSha256: sha256Bytes(packageBytes.subarray(8)), objectGeneration: 'fixture-object-v1' },
  ];
  const rangeReassembly = reassembleRanges(ranges, { expectedSha256: packageContentId, expectedByteLength: packageBytes.length });
  const newRoot = createRootMetadata({ version: 2, expiresAt: EXPIRES, keys: publicRecords, previousRootSha256: root.signedSha256 }, authorities.root.slice(0, 2));
  const rotationLeaf = createTransparencyLeaf({ leafType: 'ROOT_ROTATION', logIndex: 1, body: { oldRootSha256: root.signedSha256, newRootSha256: newRoot.signedSha256 } });
  const rotationTree = buildMerkleTree([leaf.merkleLeafHash, rotationLeaf.merkleLeafHash]);
  const rotationCheckpoint = createCheckpoint({ treeSize: 2, rootHash: rotationTree.rootHash, logGeneration: 1, issuedAt: '2030-01-02T00:00:00.000Z' }, authorities['transparency-log'].slice(0, 1));
  const rotationReceipt = createKeyRotationReceipt({ oldRoot: root, newRoot, transparencyLeaf: rotationLeaf, checkpoint: rotationCheckpoint });
  const revocationRecord = createKeyRevocation({ keyId: publicRecords.find((item) => item.role === 'timestamp').keyId, role: 'timestamp', revocationGeneration: 1, effectiveLogIndex: 2, reasonCode: 'fixture-compromise', compromiseSeverity: 'HIGH', replacementKeyId: publicRecords.filter((item) => item.role === 'timestamp')[1].keyId }, authorities.revocation.slice(0, 2));
  const oldPackageBytes = Buffer.from('TDT-R14A-FIXTURE-PACKAGE-V0\n');
  const oldManifest = createSignedPackageManifestV2({ ...manifest.signed, releaseId: 'release-r14a-4', releaseSequence: 4, packageContentId: sha256Bytes(oldPackageBytes), packageByteLength: oldPackageBytes.length }, authorities.release.slice(0, 2));
  const rollbackPermit = createRollbackPermit({ fromReleaseSequence: 5, toReleaseSequence: 4, fromPackageContentId: packageContentId, toPackageContentId: oldManifest.signed.packageContentId, r10aRollbackReceiptSha256: D('r10a-rollback'), permitGeneration: 1, singleUseNonce: 'fixture-rollback-nonce-0001', expiresAt: EXPIRES }, authorities['rollback-permit'].slice(0, 2));
  return { NOW, EXPIRES, authorities, publicRecords, packageBytes, packageContentId, root, newRoot, targets, snapshot, timestamp, manifest, oldManifest, leaf, tree, inclusionProof, consistencyProof, checkpoint, witnessSet, envelope, streamReceipt, trustState, distributionInput, distributionAdmission, stagedPackageReceipt, r12aBinding, r13aRolloutPlan, r13aBinding, mirrorFetchReceipts, ranges, rangeReassembly, rotationLeaf, rotationCheckpoint, rotationReceipt, revocationRecord, rollbackPermit };
}
