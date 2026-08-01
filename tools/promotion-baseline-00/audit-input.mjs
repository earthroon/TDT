import path from 'node:path';
import { ARTIFACT_ROOT, SPEC_ID, ROOT, baselineInputManifest, currentToolchain, dependencyRootParity, productionPointerPreflight, seal, writeJsonAtomic, writeFailure, exactSemver, readJson } from './lib.mjs';

try {
  const generated = baselineInputManifest({ requirePromotedChildren: false });
  const toolchain = currentToolchain();
  const parity = dependencyRootParity();
  const pkg = readJson(path.join(ROOT, 'package.json'));
  const directVersionsExact = [...Object.values(pkg.dependencies ?? {}), ...Object.values(pkg.devDependencies ?? {})].every(exactSemver);
  const canonicalHost = toolchain.platform === 'win32' && toolchain.arch === 'x64';
  const canonicalToolchain = toolchain.nodeVersion === '22.16.0' && toolchain.npmVersion === '10.9.2';
  const receipt = seal({
    schemaVersion: 1,
    specId: SPEC_ID,
    state: parity.exact && canonicalHost && canonicalToolchain ? 'BASELINE_INPUT_AUDITED' : 'SOURCE_INPUT_AUDITED_UNPROMOTED',
    status: parity.exact && canonicalHost && canonicalToolchain ? 'PASS' : 'BLOCKED',
    canonicalHost,
    canonicalToolchain,
    directVersionsExact,
    rootGraphExact: parity.exact,
    rootGraphMismatches: parity.mismatches,
    nonExactDirectVersions: parity.nonExact,
    productionPointerPreflight: productionPointerPreflight(),
    canonicalInputDigest: generated.manifest.selfDigest,
    createdAt: new Date().toISOString(),
  });
  writeJsonAtomic(path.join(ARTIFACT_ROOT, 'input', 'canonical-baseline-input.json'), generated.manifest);
  writeJsonAtomic(path.join(ARTIFACT_ROOT, 'input', 'input-audit-receipt.json'), receipt);
  console.log(`${receipt.status} ${SPEC_ID} input state=${receipt.state} canonicalInput=${generated.manifest.selfDigest}`);
  if (process.argv.includes('--require-canonical') && receipt.status !== 'PASS') process.exitCode = 1;
} catch (error) {
  writeFailure(error.code ?? 'P0A_INPUT_AUDIT_FAILED', error.detail ?? {}, error);
  console.error(error);
  process.exitCode = 1;
}
