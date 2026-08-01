import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('app/src/legacy/generated-legacy-manifest.json', 'utf8'));
const auditSource = fs.readFileSync('app/src/legacy/legacy-global-audit.ts', 'utf8');
const adapterSource = fs.readFileSync('app/src/legacy/legacy-runtime-adapter.ts', 'utf8');
const receiptSource = fs.readFileSync('app/src/boot/runtime-receipt.ts', 'utf8');
const failures = [];

const delayedNames = [
  'Buffer',
  'PureRenderer',
  'deltaEGain',
  'emotionCanvases',
  'falloffRadius',
  'generateDeltaKQMap',
  'getDeltaKThreshold',
  'initWebP',
  'initWebP_initialized',
  'toBuffer',
];
const mainIndex = manifest.entries.findIndex((entry) => entry.id === 'dadum.legacy.main.js');
const brushedIndex = manifest.entries.findIndex((entry) => entry.id === 'dadum.legacy.engine-passes-brushedMetalPass.js');
const brushed = manifest.entries[brushedIndex];

if (mainIndex < 0) failures.push('main.js manifest entry missing');
if (brushedIndex < 0) failures.push('brushedMetalPass.js manifest entry missing');
if (!(mainIndex >= 0 && brushedIndex > mainIndex)) failures.push('main.js is not ordered before brushedMetalPass.js');

for (const globalName of delayedNames) {
  const owners = manifest.entries
    .map((entry, loadIndex) => ({ entry, loadIndex }))
    .filter(({ entry }) => entry.declaredGlobalWrites.includes(globalName));
  if (owners.length !== 1 || owners[0].entry.id !== 'dadum.legacy.main.js') {
    failures.push(`${globalName} does not have one unique main.js owner`);
  }
  if (brushed?.declaredGlobalWrites.includes(globalName)) {
    failures.push(`brushedMetalPass.js incorrectly owns delayed global ${globalName}`);
  }
}

for (const required of [
  'owners.length === 1',
  'pendingClaim !== null',
  'pendingClaim.moduleId === owners[0].moduleId',
  'pendingClaim.loadIndex < loadIndex',
  'ownershipEvidence',
]) {
  if (!auditSource.includes(required)) failures.push(`audit condition missing: ${required}`);
}
if (!adapterSource.includes('buildLegacyGlobalOwnershipIndex')) failures.push('ownership index is not constructed');
if (!adapterSource.includes('I_LEGACY_DEFERRED_GLOBAL_ATTRIBUTED')) failures.push('deferred attribution diagnostic missing');
if (!adapterSource.includes('#registerPendingDeferredClaims')) failures.push('pending deferred claim registration missing');
if (!adapterSource.includes('Object.prototype.hasOwnProperty.call(window, globalName)')) failures.push('pending claim does not require the global to be absent after owner activation');
if (!adapterSource.includes('this.#pendingDeferredGlobalClaims.delete(publication.globalName)')) failures.push('consumed delayed claim is not retired');
if (!receiptSource.includes('deferredGlobalPublications')) failures.push('boot receipt omits deferred global attribution evidence');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('PASS GATE-R1-R5-DEFERRED-GLOBAL-ATTRIBUTION unique prior owner / owner-finished-while-absent claim / one-shot claim consumption / receipt evidence');
