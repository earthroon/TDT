import { spawnSync } from 'node:child_process';
import { PATCH_ID, projectRoot, writeCanonicalReceipt } from './lib.mjs';
const commands = [
  ['legacy-manifest', ['tools/verify-legacy-manifest.mjs']],
  ['legacy-global-ownership', ['tools/verify-legacy-global-ownership.mjs']],
  ['async-global-reservation', ['tools/verify-async-global-reservation.mjs']],
  ['deferred-global-attribution', ['tools/verify-deferred-global-attribution.mjs']],
  ['placeholder-quarantine', ['tools/verify-placeholder-quarantine.mjs']],
  ['runtime-ownership', ['tools/verify-runtime-ownership.mjs']],
  ['boot-determinism', ['tools/verify-boot-determinism.mjs']],
  ['r7-export-truth', ['tools/verify-r7-export-truth.mjs']],
  ['export-worker-01', ['tools/gate-export-worker-01.mjs']],
  ['export-worker-02', ['tools/gate-export-worker-02.mjs']],
  ['export-worker-03', ['tools/gate-export-worker-03.mjs']],
  ['export-worker-04', ['tools/gate-export-worker-04.mjs']],
  ['export-worker-05', ['tools/gate-export-worker-05.mjs']],
  ['export-worker-06', ['tools/gate-export-worker-06.mjs']],
  ['export-worker-07', ['tools/gate-export-worker-07.mjs']],
  ['export-promotion-01', ['tools/gate-export-promotion-01.mjs']],
  ['modjpeg-01', ['tools/gate-modjpeg-01.mjs']],
  ['jxl-codec-01', ['tools/gate-jxl-codec-01.mjs']],
  ['psd-decoder-01', ['tools/gate-psd-decoder-01.mjs']],
];
const records = commands.map(([id, args]) => {
  const result = spawnSync(process.execPath, args, { cwd: projectRoot, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  return { id, status: result.status === 0 ? 'PASS' : 'FAIL', exitCode: result.status ?? 1, outputTail: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim().split(/\r?\n/).slice(-8) };
});
const receipt = writeCanonicalReceipt('artifacts/active-graph-01/source-bake/regression-suite-receipt.json', {
  schemaVersion: 1, patchId: PATCH_ID, status: records.every((record) => record.status === 'PASS') ? 'PASS' : 'FAIL', passCount: records.filter((record) => record.status === 'PASS').length, checkCount: records.length, records,
});
if (receipt.status !== 'PASS') { console.error(JSON.stringify(receipt, null, 2)); process.exit(1); }
console.log(`PASS ${PATCH_ID} regression suite ${receipt.passCount}/${receipt.checkCount}`);
