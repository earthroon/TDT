import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const ARTIFACT_DIR = path.join(ROOT, 'artifacts/preview-presenter-01/source-bake');
export const SPEC_FILE = 'specs/TDT-PREVIEW-PRESENTER-01_CANONICAL_FINAL_SURFACE_PRESENTER_GPU_TEXTURE_DIRECT_PRESENTATION_PIPELINE_SUBSCRIPTION_FRAME_FENCE_DISPLAY_TRANSFORM_SEPARATION_LEGACY_CANVAS_RETIREMENT_SPEC.md';
export const SERVICE_FILE = 'app/src/runtime/preview/preview-presenter-service.ts';
export const PIPELINE_FILE = 'app/src/runtime/pipeline/pipeline-service.ts';
export const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
export const sha256 = (input) => crypto.createHash('sha256').update(input).digest('hex');
export function ensureArtifactDir() { fs.mkdirSync(ARTIFACT_DIR, { recursive: true }); }
export function writeJson(name, value) { ensureArtifactDir(); const target = path.join(ARTIFACT_DIR, name); fs.writeFileSync(target, JSON.stringify(value, null, 2) + '\n'); return target; }
export function walkFiles(relative, extensions = null) {
  const out = [];
  const root = path.join(ROOT, relative);
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name))) {
      if (['node_modules','dist','release','artifacts','.git'].includes(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (!extensions || extensions.has(path.extname(entry.name))) out.push(path.relative(ROOT, full).replaceAll(path.sep, '/'));
    }
  };
  visit(root);
  return out;
}
