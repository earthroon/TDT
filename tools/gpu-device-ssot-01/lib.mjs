import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const AUTHORITY_FILE = 'app/src/runtime/gpu/gpu-device-authority-service.ts';
export const ARTIFACT_DIR = path.join(ROOT, 'artifacts/gpu-device-ssot-01/source-bake');
export const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
export const sha256 = (input) => crypto.createHash('sha256').update(input).digest('hex');
export const stable = (value) => JSON.stringify(value, Object.keys(value).sort(), 2);
export function listFiles(dir, extensions = new Set(['.ts', '.js', '.mjs'])) {
  const out = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name))) {
      if (entry.name === 'node_modules' || entry.name === 'quarantine') continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (extensions.has(path.extname(entry.name))) out.push(path.relative(ROOT, full).replaceAll(path.sep, '/'));
    }
  };
  walk(path.join(ROOT, dir));
  return out;
}
export function ensureArtifactDir() { fs.mkdirSync(ARTIFACT_DIR, { recursive: true }); }
export function writeJson(name, value) { ensureArtifactDir(); const target = path.join(ARTIFACT_DIR, name); fs.writeFileSync(target, JSON.stringify(value, null, 2) + '\n'); return target; }
