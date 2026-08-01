import fs from 'node:fs';
import path from 'node:path';
import { sourceArtifact, seal, sha256File, digestCanonical, check } from './lib.mjs';
const toolDir = 'tools/build-lock-01-r2';
const files = fs.readdirSync(toolDir, { withFileTypes: true })
  .flatMap((entry) => {
    if (entry.isFile() && entry.name.endsWith('.mjs')) return [`${toolDir}/${entry.name}`];
    if (entry.isDirectory() && entry.name === 'schemas') {
      return fs.readdirSync(path.join(toolDir, 'schemas')).filter((name) => name.endsWith('.json')).map((name) => `${toolDir}/schemas/${name}`);
    }
    return [];
  });
files.push(
  'package.json',
  'tools/verify-dependency-lock.mjs',
  'tools/verify-toolchain-profile.mjs',
  'app/src/boot/stable-error.ts',
  'app/renderer/physical-r9a/physical-runner.mjs',
  'tools/resample-runtime-01-r10a/rebuild-authority.mjs',
  'tools/resample-runtime-01-r10a/verify-rebuild.mjs',
  'app/features/resample-runtime/r14a/signed-package-manifest-v2.mjs',
  'tools/resample-runtime-01-r14a/test-fixture.mjs',
  'specs/TDT-BUILD-LOCK-01-R2_EXACT_ROOT_DEPENDENCY_GRAPH_CANONICAL_NPM_CI_WIN32_X64_DUAL_INSTALL_CONTENT_DIGEST_NATIVE_TOOLCHAIN_CLOSURE_ZERO_LOCK_MUTATION_PRODUCTION_BUILD_ADMISSION_SEAL_SPEC.md'
);
const unique = [...new Set(files)].sort();
const records = unique.map((relativePath) => {
  check(fs.existsSync(relativePath), 'E_BUILD_LOCK_R2_FINAL_CHILD_MISSING', 'implementation file missing', relativePath);
  return { relativePath, sha256: sha256File(relativePath), byteLength: fs.statSync(relativePath).size };
});
sourceArtifact('BLR2_IMPLEMENTATION_MANIFEST.json', seal({
  schemaVersion: 1,
  receiptKind: 'build-lock-r2-implementation-manifest',
  recordCount: records.length,
  records,
  implementationDigest: digestCanonical(records)
}));
console.log(`BLR2 implementation manifest PASS ${records.length} files`);
