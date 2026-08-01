import fs from 'node:fs';
import path from 'node:path';
import { ROOT, ARTIFACT_DIR, sha256, walkFiles, writeJson } from './lib.mjs';
const included = [
  ...walkFiles('app/src/runtime/preview'),
  'app/src/runtime/pipeline/pipeline-service.ts',
  'app/src/runtime/gpu/gpu-device-authority-service.ts',
  'app/src/runtime/gpu/gpu-consumer-manifest.json',
  'app/src/runtime/service-token.ts',
  'app/src/boot/runtime-modules.ts',
  'app/src/boot/stable-error.ts',
  'app/src/stores/preview.store.ts',
  'app/src/legacy/legacy-shell.html',
  'app/src/env.d.ts',
  'app/legacy-runtime/style.css',
  'app/legacy-runtime/js/passes/present_webgpu.js',
  'app/legacy-runtime/input/webgpu_preview_presenter.js',
  'app/legacy-runtime/preview_fit_bind.js',
  'app/legacy-runtime/hooks/afterRenderHook.js',
  'tools/preview-visible-canvas-owner-manifest.json',
  'package.json',
].filter((value, index, array) => array.indexOf(value) === index).sort();
const files = included.map((relative) => {
  const bytes = fs.readFileSync(path.join(ROOT, relative));
  return { relative, byteLength: bytes.byteLength, sha256: sha256(bytes) };
});
const gate = JSON.parse(fs.readFileSync(path.join(ARTIFACT_DIR, 'TDT_PREVIEW_PRESENTER_01_SOURCE_GATE.json'), 'utf8'));
const sourceSeal = sha256(JSON.stringify({ patchId: 'TDT-PREVIEW-PRESENTER-01', files, gateCounts: gate.counts }));
const receipt = {
  schemaVersion: 1,
  patchId: 'TDT-PREVIEW-PRESENTER-01',
  state: 'PREVIEW_PRESENTER_SOURCE_BAKED_AWAITING_PACKAGED_RUNTIME',
  sourceSealSha256: sourceSeal,
  changedFileCount: files.length,
  files,
  gateCounts: gate.counts,
  productionPointerMutated: false,
  packagedClaims: false,
};
writeJson('TDT_PREVIEW_PRESENTER_01_SOURCE_RECEIPT.json', receipt);
console.log(`PASS preview source bake seal=${sourceSeal} files=${files.length}`);
