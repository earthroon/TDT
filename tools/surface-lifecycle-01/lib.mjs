import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const ARTIFACT_DIR = path.join(ROOT, 'artifacts/surface-lifecycle-01/source-bake');
export const SERVICE_FILE = 'app/src/runtime/surfaces/surface-registry-authority-service.ts';
export const TYPES_FILE = 'app/src/runtime/surfaces/surface-types.ts';
export const SPEC_FILE = 'specs/TDT-SURFACE-LIFECYCLE-01_CANONICAL_SURFACE_REGISTRY_OWNERSHIP_TRANSFER_TYPED_DISPOSAL_PEAK_RESIDENCY_DEVICE_EPOCH_BINDING_PREVIEW_EXPORT_PINNING_COMPATIBILITY_MIRROR_RETIREMENT_SPEC.md';
export const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
export const sha256 = (input) => crypto.createHash('sha256').update(input).digest('hex');
export function ensureArtifactDir() { fs.mkdirSync(ARTIFACT_DIR, { recursive: true }); }
export function writeJson(name, value) { ensureArtifactDir(); const target = path.join(ARTIFACT_DIR, name); fs.writeFileSync(target, JSON.stringify(value, null, 2) + '\n'); return target; }
export function listFiles(dir, extensions = new Set(['.ts', '.js', '.mjs'])) {
  const out = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name))) {
      if (entry.name === 'node_modules' || entry.name === 'legacy_quarantine' || entry.name === 'quarantine') continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (extensions.has(path.extname(entry.name))) out.push(path.relative(ROOT, full).replaceAll(path.sep, '/'));
    }
  };
  walk(path.join(ROOT, dir));
  return out;
}
