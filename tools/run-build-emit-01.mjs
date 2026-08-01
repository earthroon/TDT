import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  ARTIFACT_DIR, PATCH_ID, ROOT, buildInputManifest, contentManifest,
  discoverLegacyStaticAdmission, loadLockPromotionState, makeBlockedArtifact,
  seal, sha256File, writeJson,
} from './build-emit-01-lib.mjs';

const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
const mode = modeArg?.slice('--mode='.length) ?? 'source';
if (!['source', 'production-ab'].includes(mode)) throw new Error(`E_BUILD_EMIT_INPUT_MANIFEST_INVALID:${mode}`);

const packageBefore = sha256File(path.join(ROOT, 'package.json'));
const lockBefore = sha256File(path.join(ROOT, 'package-lock.json'));
const sourceBefore = contentManifest(ROOT, { excludes: ['dist','release','node_modules','artifacts','README_TDT_BUILD_EMIT_01_APPLIED.md','patches'] });
const input = buildInputManifest({ root: ROOT });
const lock = loadLockPromotionState({ root: ROOT });
const blockers = [...lock.blockers];
if (process.platform !== 'win32' || process.arch !== 'x64') blockers.push('E_BUILD_EMIT_NONCANONICAL_HOST');
if (!input.lockPromoted) blockers.push('E_BUILD_EMIT_LOCK_NOT_PROMOTED');
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_EMIT_01_BUILD_INPUT_MANIFEST.json'), input);

const admission = discoverLegacyStaticAdmission({ root: ROOT });
writeJson(path.join(ROOT, 'app', 'src', 'legacy', 'generated-legacy-static-admission.json'), admission);
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_EMIT_01_LEGACY_STATIC_ADMISSION_MANIFEST.json'), admission);

const artifactNames = [
  'TDT_BUILD_EMIT_01_BUILD_A_REPORT.json',
  'TDT_BUILD_EMIT_01_BUILD_B_REPORT.json',
  'TDT_BUILD_EMIT_01_VITE_ENTRY_GRAPH.json',
  'TDT_BUILD_EMIT_01_SOURCE_TO_EMITTED_MAPPING.json',
  'TDT_BUILD_EMIT_01_EMITTED_WORKER_MANIFEST.json',
  'TDT_BUILD_EMIT_01_WORKER_CLOSURE_REPORT.json',
  'TDT_BUILD_EMIT_01_ARTIFACT_OWNERSHIP_REPORT.json',
  'TDT_BUILD_EMIT_01_ORPHAN_ARTIFACT_REPORT.json',
  'TDT_BUILD_EMIT_01_STATIC_ROUTE_MANIFEST.json',
  'TDT_BUILD_EMIT_01_SYNTHETIC_COI_ROUTE_REPORT.json',
  'TDT_BUILD_EMIT_01_ELECTRON_COI_ROUTE_REPORT.json',
  'TDT_BUILD_EMIT_01_SERVER_PARITY_REPORT.json',
  'TDT_BUILD_EMIT_01_WASM_STREAMING_REPORT.json',
  'TDT_BUILD_EMIT_01_BUILD_REPRODUCIBILITY_RECEIPT.json',
  'TDT_BUILD_EMIT_01_PRODUCTION_RUNTIME_MANIFEST.json',
  'TDT_BUILD_EMIT_01_BUILD_PROVENANCE_RECEIPT.json',
  'TDT_BUILD_EMIT_01_EMITTED_ARTIFACT_IDENTITY_RECEIPT.json',
];

function writeBlockedArtifacts(reasonBlockers) {
  for (const name of artifactNames) {
    writeJson(path.join(ARTIFACT_DIR, name), makeBlockedArtifact(name, reasonBlockers, {
      evidenceState: 'BLOCKED_LOCK_NOT_PROMOTED',
      buildInputManifestDigest: input.selfDigest,
      legacyStaticAdmissionDigest: admission.digest,
      productionBytesObserved: false,
    }));
  }
}

if (mode === 'production-ab' && blockers.length === 0) {
  const frozenCache = process.env.DADUM_FROZEN_NPM_CACHE;
  if (!frozenCache || !fs.existsSync(frozenCache)) throw new Error('E_BUILD_EMIT_INPUT_MANIFEST_INVALID');
  const workRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dadum-build-emit-01-'));
  const buildReports = [];
  try {
    for (const label of ['A','B']) {
      const workspace = path.join(workRoot, `build-${label.toLowerCase()}`);
      fs.cpSync(ROOT, workspace, { recursive:true, filter:(source)=>!['node_modules','dist','release'].includes(path.basename(source)) && !source.includes(`${path.sep}artifacts${path.sep}runtime${path.sep}TDT_BUILD_EMIT_01_`) });
      const env = { ...process.env, npm_config_cache:frozenCache, npm_config_offline:'true', npm_config_ignore_scripts:'true', DADUM_BUILD_EMIT_TRANSACTION:'1' };
      const install = spawnSync('npm', ['ci','--offline','--ignore-scripts','--no-audit','--fund=false'], { cwd:workspace, env, encoding:'utf8' });
      if (install.status !== 0) throw new Error('E_VITE_PRODUCTION_BUILD_FAILED');
      const build = spawnSync('npm', ['run','build:renderer:emit'], { cwd:workspace, env, encoding:'utf8' });
      if (build.status !== 0) throw new Error('E_VITE_PRODUCTION_BUILD_FAILED');
      const distManifest = contentManifest(path.join(workspace,'dist','renderer'));
      const report = seal({ schemaVersion:1,patchId:PATCH_ID,label,status:'COMPLETED',distDigest:distManifest.digest,fileCount:distManifest.records.length });
      buildReports.push({ workspace, report, distManifest });
      writeJson(path.join(ARTIFACT_DIR, `TDT_BUILD_EMIT_01_BUILD_${label}_REPORT.json`), report);
    }
    const [a,b]=buildReports;
    process.env.DADUM_BUILD_EMIT_A=path.join(a.workspace,'dist','renderer');
    process.env.DADUM_BUILD_EMIT_B=path.join(b.workspace,'dist','renderer');
    const repro=spawnSync(process.execPath,['tools/verify-build-emit-reproducibility.mjs',process.env.DADUM_BUILD_EMIT_A,process.env.DADUM_BUILD_EMIT_B],{cwd:ROOT,stdio:'inherit'});
    if(repro.status!==0) throw new Error('E_BUILD_NONDETERMINISTIC');
  } finally {
    fs.rmSync(workRoot,{recursive:true,force:true});
  }
} else {
  writeBlockedArtifacts(blockers);
}

const packageAfter = sha256File(path.join(ROOT, 'package.json'));
const lockAfter = sha256File(path.join(ROOT, 'package-lock.json'));
const sourceAfter = contentManifest(ROOT, { excludes: ['dist','release','node_modules','artifacts','README_TDT_BUILD_EMIT_01_APPLIED.md','patches'] });
const mutation = seal({
  schemaVersion:1, patchId:PATCH_ID, status: packageBefore===packageAfter && lockBefore===lockAfter && sourceBefore.digest===sourceAfter.digest ? 'PASS':'BLOCKED',
  packageJsonBefore:packageBefore, packageJsonAfter:packageAfter,
  packageLockBefore:lockBefore, packageLockAfter:lockAfter,
  sourceTreeBefore:sourceBefore.digest, sourceTreeAfter:sourceAfter.digest,
  packageJsonMutationZero:packageBefore===packageAfter,
  packageLockMutationZero:lockBefore===lockAfter,
  sourceMutationZero:sourceBefore.digest===sourceAfter.digest,
});
writeJson(path.join(ARTIFACT_DIR,'TDT_BUILD_EMIT_01_SOURCE_MUTATION_ZERO_REPORT.json'),mutation);
if(mutation.status!=='PASS') throw new Error('E_BUILD_EMIT_SOURCE_MUTATED');

const provenance = seal({ schemaVersion:1,patchId:PATCH_ID,status:blockers.length?'BLOCKED_LOCK_NOT_PROMOTED':'BUILD_INPUT_SEALED',buildInputManifestDigest:input.selfDigest,legacyStaticAdmissionDigest:admission.digest,sourceMutationZeroDigest:mutation.selfDigest,productionBytesObserved:false,blockers:[...new Set(blockers)].sort() });
writeJson(path.join(ARTIFACT_DIR,'TDT_BUILD_EMIT_01_BUILD_PROVENANCE_RECEIPT.json'),provenance);
const fix = seal({ schemaVersion:1,patchId:PATCH_ID,status:'SOURCE_BAKED_UNPROMOTED',evidenceState:blockers.length?'BLOCKED_LOCK_NOT_PROMOTED':'BUILD_INPUT_SEALED',finalPromotionPassIssued:false,buildInputManifestDigest:input.selfDigest,legacyStaticAdmissionDigest:admission.digest,sourceMutationZeroDigest:mutation.selfDigest,blockers:[...new Set(blockers)].sort() });
writeJson(path.join(ARTIFACT_DIR,'TDT_BUILD_EMIT_01_FIX_RECEIPT.json'),fix);
console.log(`${blockers.length?'BLOCKED':'PASS'} BUILD-EMIT-01 ${fix.evidenceState} admission=${admission.recordCount}/${admission.fullLegacyFileCount}`);
