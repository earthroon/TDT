import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_DIR, ROOT, canonicalJson, readJson, sha256Bytes, sha256File, writeJson } from './build-emit-01-lib.mjs';
const file = path.join(ARTIFACT_DIR, 'TDT_BUILD_EMIT_01_EMITTED_WORKER_MANIFEST.json');
if (!fs.existsSync(file)) throw new Error('E_PRODUCTION_WORKER_MANIFEST_INVALID');
const manifest = readJson(file);
const checks = [];
const base = { ...manifest }; delete base.manifestDigest;
checks.push({ id: 'schema', ok: manifest.schemaVersion === 2 });
checks.push({ id: 'mode', ok: manifest.artifactVerificationMode === 'emitted-artifact-sha256' });
checks.push({ id: 'digest', ok: manifest.manifestDigest === sha256Bytes(canonicalJson(base)) });
checks.push({ id: 'workers', ok: manifest.workers?.length === 6 });
for (const worker of manifest.workers ?? []) {
  for (const artifact of worker.closure ?? []) {
    const absolute = path.join(ROOT, 'dist', 'renderer', artifact.url.replace(/^\//, ''));
    checks.push({ id: `${worker.workerId}:${artifact.url}`, ok: fs.existsSync(absolute) && fs.statSync(absolute).size === artifact.byteLength && sha256File(absolute) === artifact.sha256 });
  }
  checks.push({ id: `${worker.workerId}:set`, ok: worker.emittedArtifactSetDigest === sha256Bytes(canonicalJson(worker.closure)) });
  checks.push({ id: `${worker.workerId}:entry`, ok: worker.closure?.filter((x)=>x.role==='worker-entry').length === 1 });
  if (worker.workerId === 'dadum.worker.decoder.jxl-independent-v1') {
    checks.push({ id: `${worker.workerId}:wasm`, ok: worker.closure?.filter((x)=>x.role==='wasm').length === 1 });
    checks.push({ id: `${worker.workerId}:separate-artifact`, ok: worker.closure?.some((x)=>x.sourceIdentities?.includes('app/legacy-runtime/vendor/jxl_wgpu_bridge/jxl_wgpu_bridge_bg.wasm')) === true });
  }
  if (worker.workerId === 'dadum.worker.encoder.modjpeg-canonical-v1' || worker.workerId === 'dadum.worker.encoder.jxl-canonical-v1') {
    checks.push({ id: `${worker.workerId}:pthread-child-bootstrap`, ok: worker.closure?.filter((x)=>x.role==='pthread-child-bootstrap').length === 1 });
    checks.push({ id: `${worker.workerId}:pthread-child-edge`, ok: worker.closure?.some((x)=>x.role==='pthread-child-bootstrap' && x.edgeKinds?.includes('pthread-child')) === true });
  }
}
const failed = checks.filter((x)=>!x.ok);
const report = { schemaVersion: 1, patchId: 'TDT-BUILD-EMIT-01', status: failed.length ? 'BLOCKED' : 'WORKER_CLOSURE_VERIFIED', checks, failedCount: failed.length };
writeJson(path.join(ARTIFACT_DIR, 'TDT_BUILD_EMIT_01_WORKER_CLOSURE_REPORT.json'), report);
if (failed.length) throw new Error('E_WORKER_ARTIFACT_SET_DIGEST_MISMATCH');
console.log(`PASS BUILD-EMIT-01 worker closure ${checks.length}`);
