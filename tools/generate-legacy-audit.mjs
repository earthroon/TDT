import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'app/src/legacy/generated-legacy-manifest.json');
const legacyRoot = path.join(root, 'app/legacy-runtime');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// ECMAScript identifiers are Unicode-aware. ASCII-only matching truncated
// names containing the Greek delta character, for example
// window.__ΔK_webpLazyInit -> "__".
const IDENTIFIER = String.raw`(?:[$_]|\p{ID_Start})(?:[$_\u200C\u200D]|\p{ID_Continue})*`;

function collectGlobals(source, kind) {
  const out = new Set();
  const patterns = [
    new RegExp(String.raw`\b(?:window|globalThis|self|global|root|g|w)\.(${IDENTIFIER})`, 'gu'),
    /\b(?:window|globalThis|self|global|root|g|w)\s*\[\s*['"]([^'"]+)['"]\s*\]/gu,
    /Object\.defineProperty\s*\(\s*(?:window|globalThis|self|global|root|g|w)\s*,\s*['"]([^'"]+)['"]/gu,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) out.add(match[1]);
  }
  if (kind === 'classic') {
    const varPattern = new RegExp(String.raw`(?:^|[;{}\n])\s*var\s+(${IDENTIFIER})`, 'gmu');
    const functionPattern = new RegExp(String.raw`(?:^|[;{}\n])\s*function\s+(${IDENTIFIER})\s*\(`, 'gmu');
    for (const match of source.matchAll(varPattern)) out.add(match[1]);
    for (const match of source.matchAll(functionPattern)) out.add(match[1]);
  }
  return [...out].sort();
}

function collectStaticImportSpecifiers(source) {
  const out = new Set();
  const pattern = /(?:^|\n)\s*(?:import\s+(?:[^'";]*?\s+from\s*)?|export\s+(?:[^'";]*?\s+from\s*))['"]([^'"]+)['"]/gm;
  for (const match of source.matchAll(pattern)) out.add(match[1]);
  return [...out];
}

function resolveModuleFile(importer, specifier) {
  if (!specifier || /^(?:node:|https?:|data:)/.test(specifier)) return null;
  const clean = specifier.split(/[?#]/, 1)[0];
  let candidate;
  if (clean.startsWith('/legacy/')) candidate = path.join(legacyRoot, clean.slice('/legacy/'.length));
  else if (clean.startsWith('./') || clean.startsWith('../')) candidate = path.resolve(path.dirname(importer), clean);
  else return null;

  const relative = path.relative(legacyRoot, candidate);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  const candidates = [candidate, `${candidate}.js`, `${candidate}.mjs`, path.join(candidate, 'index.js'), path.join(candidate, 'index.mjs')];
  return candidates.find((file) => fs.existsSync(file) && fs.statSync(file).isFile()) || null;
}

function collectModuleGraphGlobals(entryFile) {
  const out = new Set();
  const visited = new Set();
  const visit = (file) => {
    const normalized = path.resolve(file);
    if (visited.has(normalized)) return;
    visited.add(normalized);
    const source = fs.readFileSync(normalized, 'utf8');
    const kind = normalized.endsWith('.mjs') ? 'module' : 'module';
    for (const name of collectGlobals(source, kind)) out.add(name);
    for (const specifier of collectStaticImportSpecifiers(source)) {
      const imported = resolveModuleFile(normalized, specifier);
      if (imported) visit(imported);
    }
  };
  visit(entryFile);
  return [...out].sort();
}

const globalRegistry = new Set();
const executableFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(?:js|mjs|cjs)$/.test(entry.name)) executableFiles.push(file);
  }
};
walk(legacyRoot);

// globalRegistry is diagnostic inventory only. Runtime admission is always
// checked against each root module's declaredGlobalWrites.
for (const file of executableFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const kind = file.endsWith('.mjs') ? 'module' : 'classic';
  for (const name of collectGlobals(source, kind)) globalRegistry.add(name);
}
manifest.globalRegistry = [...globalRegistry].sort();
manifest.globalRegistryPolicy = 'inventory-only';

for (const entry of manifest.entries) {
  const filePath = path.join(legacyRoot, entry.path);
  const source = fs.readFileSync(filePath, 'utf8');
  const direct = collectGlobals(source, entry.kind);
  const graph = entry.kind === 'module' ? collectModuleGraphGlobals(filePath) : direct;
  entry.declaredGlobalWrites = [...new Set(graph)].sort();
  entry.globalWriteScope = entry.kind === 'module' ? 'static-module-graph' : 'root-script';
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`[legacy-audit] ${manifest.entries.length} entries annotated; global inventory ${manifest.globalRegistry.length}; Unicode identifiers enabled; per-module admission enabled`);
