import fs from 'node:fs';
import path from 'node:path';
import { ROOT, walkFiles, read, writeJson } from './lib.mjs';

const ownerManifest = JSON.parse(read('tools/preview-visible-canvas-owner-manifest.json'));
const allowed = new Set(ownerManifest.allowedWriters);
const files = [
  ...walkFiles('app/src', new Set(['.ts','.vue','.html','.css'])),
  ...walkFiles('app/legacy-runtime', new Set(['.js','.mjs','.html','.css'])),
];
const patterns = [
  /dadumPreviewCanvas/g,
  /canvasWGPUOverlay/g,
  /__DK_WGPU_PRESENT_STATE__/g,
  /getContext\(\s*['"]webgpu['"]\s*\)/g,
  /getImageData\s*\(/g,
  /toBlob\s*\(/g,
  /toDataURL\s*\(/g,
];
const findings = [];
for (const relative of files) {
  const text = fs.readFileSync(path.join(ROOT, relative), 'utf8');
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      findings.push({ relative, token: match[0], index: match.index ?? -1, allowedWriter: allowed.has(relative) });
    }
  }
}
const canonicalHits = findings.filter((item) => item.token === 'dadumPreviewCanvas');
const forbiddenOverlay = findings.filter((item) => item.token === 'canvasWGPUOverlay' || item.token === '__DK_WGPU_PRESENT_STATE__');
const canonicalReadback = findings.filter((item) => ['getImageData(', 'toBlob(', 'toDataURL('].some((prefix) => item.token.startsWith(prefix)) && allowed.has(item.relative));
const allWebGpuContextOwners = findings.filter((item) => item.token.includes("getContext('webgpu')") || item.token.includes('getContext("webgpu")'));
const canonicalContextOwners = allWebGpuContextOwners.filter((item) => item.relative === 'app/src/runtime/preview/preview-presenter-service.ts');
const pass = canonicalHits.some((item) => item.relative === 'app/src/legacy/legacy-shell.html')
  && canonicalHits.every((item) => allowed.has(item.relative) || item.relative === 'app/src/legacy/legacy-shell.html' || item.relative === 'app/legacy-runtime/style.css')
  && forbiddenOverlay.length === 0
  && canonicalReadback.length === 0
  && canonicalContextOwners.length === 1;
const report = { schemaVersion: 1, patchId: 'TDT-PREVIEW-PRESENTER-01', scannedFiles: files.length, canonicalCanvasId: ownerManifest.canonicalCanvasId, canonicalHits, forbiddenOverlay, canonicalReadback, canonicalContextOwners, nonCanonicalWebGpuContextOwners: allWebGpuContextOwners.filter((item) => item.relative !== 'app/src/runtime/preview/preview-presenter-service.ts'), pass };
writeJson('preview-visible-canvas-audit.json', report);
if (!pass) { console.error(JSON.stringify(report, null, 2)); process.exit(1); }
console.log(`PASS preview visible canvas audit files=${files.length} overlay=0 readback=0`);
