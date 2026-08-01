import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ARTIFACT_ROOT, SPEC_ID, assert, assertCanonicalHost, readJson, run, seal, sha256File, writeFailure, writeJsonAtomic, parseArg } from './lib.mjs';

try {
  assertCanonicalHost();
  const phase = parseArg('phase', 'primary');
  assert(phase === 'primary' || phase === 'relaunch', 'P0C_E2E_PHASE_INVALID', { phase });
  const packageReceipt = readJson(path.join(ARTIFACT_ROOT, 'package', 'package-identity-receipt.json'));
  assert(packageReceipt.state === 'PACKAGE_CONTENT_IDENTITY_VERIFIED', 'P0C_PACKAGE_IDENTITY_NOT_VERIFIED');
  const appDir = String(packageReceipt.packageAPathLocal || '');
  const executable = path.join(appDir, 'DadumDadum.exe');
  assert(fs.existsSync(executable), 'P0C_PACKAGED_EXECUTABLE_MISSING', { executable });
  const root = path.join(ARTIFACT_ROOT, 'runtime', `e2e-${phase}`);
  fs.rmSync(root, { recursive: true, force: true });
  fs.mkdirSync(root, { recursive: true });
  const token = crypto.randomBytes(32).toString('hex');
  const command = run(executable, [], {
    cwd: appDir,
    env: {
      ...process.env,
      DADUM_E2E_MODE: '1',
      DADUM_E2E_RUN_TOKEN: token,
      DADUM_E2E_EXPORT_ROOT: root,
      DADUM_P0_E2E_PHASE: phase,
      ELECTRON_ENABLE_LOGGING: '1',
    },
    timeoutMs: 600_000,
  });
  assert(command.exitCode === 0, 'P0C_PACKAGED_RUNTIME_EXIT_FAILED', { phase, command });
  const harnessDir = path.join(root, 'promotion-baseline-00');
  assert(fs.existsSync(harnessDir), 'P0C_PACKAGED_HARNESS_RECEIPTS_MISSING', { phase, root });
  const failure = path.join(harnessDir, 'harness-failure.json');
  assert(!fs.existsSync(failure), 'P0C_PACKAGED_HARNESS_FAILED', { phase, failureReceipt: fs.existsSync(failure) ? readJson(failure) : null });
  const required = phase === 'primary'
    ? ['runtime-health.json','cross-format-save-smoke.json','worker-restart.json','harness-complete.json']
    : ['relaunch-runtime-health.json','relaunch.json'];
  for (const name of required) assert(fs.existsSync(path.join(harnessDir, name)), 'P0C_PACKAGED_HARNESS_RECEIPT_MISSING', { phase, name });
  const receipt = seal({
    schemaVersion: 1,
    specId: SPEC_ID,
    status: 'PASS',
    state: phase === 'primary' ? 'PACKAGED_RUNTIME_LAUNCHED' : 'PACKAGED_RUNTIME_RELAUNCHED',
    phase,
    packageContentId: packageReceipt.packageContentId,
    executableSha256: sha256File(executable),
    exportRootLocal: root,
    runTokenSha256: crypto.createHash('sha256').update(token).digest('hex'),
    command,
    createdAt: new Date().toISOString(),
  });
  writeJsonAtomic(path.join(ARTIFACT_ROOT, 'runtime', `${phase}-launch-receipt.json`), receipt);
  console.log(`PASS ${SPEC_ID} phase=${phase} state=${receipt.state}`);
} catch (error) {
  writeFailure(error.code ?? error.message ?? 'P0C_PACKAGED_LAUNCH_FAILED', error.detail ?? {}, error);
  console.error(error);
  process.exitCode = 1;
}
