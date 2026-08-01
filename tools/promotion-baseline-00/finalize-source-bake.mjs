import path from 'node:path';
import { ARTIFACT_ROOT, ROOT, SPEC_ID, currentToolchain, dependencyRootParity, readJson, run, seal, writeCanonicalBaselineInput, writeJsonAtomic } from './lib.mjs';

writeCanonicalBaselineInput({ requirePromotedChildren: false });
run(process.execPath, ['tools/promotion-baseline-00/audit-input.mjs'], { cwd: ROOT, timeoutMs: 120_000, stdio: 'inherit' });
const gate = run(process.execPath, ['tools/promotion-baseline-00/gate-source.mjs'], { cwd: ROOT, timeoutMs: 300_000, stdio: 'inherit' });
if (gate.exitCode !== 0) process.exit(gate.exitCode ?? 1);
const parity = dependencyRootParity();
const toolchain = currentToolchain();
const sourceGate = readJson(path.join(ARTIFACT_ROOT, 'receipts', 'source-gate-report.json'));
const receipt = seal({
  schemaVersion: 1,
  specId: SPEC_ID,
  status: 'SOURCE_BAKED_UNPROMOTED',
  state: 'SOURCE_BAKED_UNPROMOTED',
  sourceImplementationComplete: true,
  packagedBaselineVerified: false,
  productionPointerMutationPerformed: false,
  productPromotionPerformed: false,
  sourceGateDigest: sourceGate.selfDigest,
  observedHost: { platform: toolchain.platform, arch: toolchain.arch, nodeVersion: toolchain.nodeVersion, npmVersion: toolchain.npmVersion },
  blockers: [
    ...(parity.exact ? [] : ['canonical-dependency-lock-not-promoted']),
    ...(toolchain.platform === 'win32' && toolchain.arch === 'x64' ? [] : ['canonical-win32-x64-package-run-not-executed']),
    'dual-clean-production-emit-not-executed-in-this-bake-environment',
    'packaged-electron-e2e-not-executed-in-this-bake-environment',
    'production-pointer-change-intentionally-forbidden',
  ],
  nextCommand: 'npm run verify:promotion-baseline-00',
  createdAt: new Date().toISOString(),
});
writeJsonAtomic(path.join(ARTIFACT_ROOT, 'receipts', 'source-bake-receipt.json'), receipt);
console.log(`PASS ${SPEC_ID} state=${receipt.state} sourceGate=${receipt.sourceGateDigest}`);
