import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const GRAPH = path.join(ROOT, 'app/src/runtime/active-graph/generated-active-runtime-graph.json');
const OUT = path.join(ROOT, 'artifacts/resample-runtime-01-r8a/source-bake/TDT_RESAMPLE_RUNTIME_01_R8A_JAVASCRIPT_PARSE_REPORT.json');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const canonicalize = (value) => Array.isArray(value) ? value.map(canonicalize) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])])) : value;
const canonicalJson = (value) => JSON.stringify(canonicalize(value));

function safeRelative(relative) {
  const normalized = String(relative).replaceAll('\\', '/');
  if (normalized.startsWith('/') || normalized.split('/').includes('..')) throw Object.assign(new Error(`Unsafe graph path: ${relative}`), { code: 'E_R8A_PARSE_PATH_UNSAFE' });
  const absolute = path.resolve(ROOT, normalized);
  if (!absolute.startsWith(ROOT + path.sep)) throw Object.assign(new Error(`Graph path escapes root: ${relative}`), { code: 'E_R8A_PARSE_PATH_UNSAFE' });
  const stat = fs.lstatSync(absolute);
  if (stat.isSymbolicLink()) throw Object.assign(new Error(`Symlink parser target: ${relative}`), { code: 'E_R8A_PARSE_SYMLINK_FORBIDDEN' });
  return absolute;
}

function resolveImport(owner, literal) {
  if (!literal.startsWith('.') && !literal.startsWith('/')) return { external: true, resolved: null };
  if (literal.startsWith('/')) return { external: false, resolved: path.resolve(ROOT, 'app/legacy-runtime', literal.replace(/^\/legacy\//, '')) };
  const clean = literal.split(/[?#]/, 1)[0];
  const base = path.resolve(path.dirname(owner), clean);
  const candidates = [base, `${base}.js`, `${base}.mjs`, `${base}.cjs`, path.join(base, 'index.js'), path.join(base, 'index.mjs')];
  return { external: false, resolved: candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? null };
}

function literalImports(source) {
  const rows = [];
  const patterns = [
    ['static-import', /(?:import|export)\s+(?:[^'"`]*?\s+from\s+)?['"`]([^'"`]+)['"`]/g],
    ['dynamic-import', /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g],
  ];
  for (const [kind, regex] of patterns) {
    for (const match of source.matchAll(regex)) rows.push({ kind, literal: match[1], index: match.index ?? 0 });
  }
  return rows.sort((a, b) => a.index - b.index || a.literal.localeCompare(b.literal));
}

function parseModule(absolute) {
  const result = spawnSync(process.execPath, ['--check', absolute], { encoding: 'utf8' });
  if (result.status === 0) return { pass: true, parserId: `node-${process.versions.node}-check-esm`, diagnostic: null };
  return { pass: false, parserId: `node-${process.versions.node}-check-esm`, diagnostic: String(result.stderr || result.stdout).trim() };
}

function parseClassic(absolute, source) {
  try {
    if (/(^|[;\n])\s*(?:import\s+(?!\()|export\s+)/m.test(source)) throw Object.assign(new SyntaxError('Static import/export is forbidden in a classic script'), { code: 'E_R8A_CLASSIC_STATIC_IMPORT' });
    new vm.Script(source, { filename: absolute });
    return { pass: true, parserId: `node-${process.versions.node}-vm-script`, diagnostic: null };
  } catch (error) {
    return { pass: false, parserId: `node-${process.versions.node}-vm-script`, diagnostic: `${error?.name || 'Error'}: ${error?.message || String(error)}` };
  }
}

const graph = JSON.parse(fs.readFileSync(GRAPH, 'utf8'));
const candidateMap = new Map();
for (const node of graph.nodes.filter((item) => item.status === 'ACTIVE_REQUIRED' && /\.(?:js|mjs|cjs)$/i.test(item.sourceRelative))) {
  const previous = candidateMap.get(node.sourceRelative);
  if (!previous || String(node.javascriptSemantic || '').includes('module')) candidateMap.set(node.sourceRelative, node);
}
const candidates = [...candidateMap.values()].sort((a, b) => a.sourceRelative.localeCompare(b.sourceRelative));
const records = [];
for (const node of candidates) {
  const absolute = safeRelative(node.sourceRelative);
  const source = fs.readFileSync(absolute, 'utf8').replace(/\r\n/g, '\n');
  const semantic = node.javascriptSemantic || (node.kind === 'esm-module' ? 'esm-module' : node.kind === 'module-worker' ? 'module-worker' : node.kind === 'classic-worker' ? 'classic-worker' : 'classic-script');
  const parsed = semantic === 'classic-script' || semantic === 'classic-worker' ? parseClassic(absolute, source) : parseModule(absolute);
  const imports = literalImports(source).map((item) => {
    const resolution = resolveImport(absolute, item.literal);
    return { ...item, external: resolution.external, resolvedRelative: resolution.resolved ? path.relative(ROOT, resolution.resolved).replaceAll(path.sep, '/') : null, resolved: resolution.external || Boolean(resolution.resolved) };
  });
  const unresolved = imports.filter((item) => !item.resolved);
  const pass = parsed.pass;
  records.push({
    sourceRelative: node.sourceRelative,
    sourceSha256: sha256(source),
    ownerRootId: node.ownerRootId ?? null,
    loadingEdge: node.loadingEdge ?? null,
    semantic,
    parserId: parsed.parserId,
    parsePass: parsed.pass,
    imports,
    unresolvedImportCount: unresolved.length,
    unresolvedImportsAdvisoryOnly: true,
    pass,
    diagnostic: parsed.diagnostic,
  });
}
const unsigned = {
  schemaVersion: 1,
  patchId: 'TDT-RESAMPLE-RUNTIME-01-R8A',
  authority: 'tdt.active-runtime.javascript-parse-closure.r8a.v1',
  graphDigest: graph.graphDigest,
  activeRequiredJavaScriptCount: records.length,
  activeRequiredParsePassCount: records.filter((record) => record.pass).length,
  activeRequiredParseFailCount: records.filter((record) => !record.pass).length,
  activeRequiredUnparsedCount: records.filter((record) => !record.pass).length,
  records,
  reportDigest: null,
};
const report = { ...unsigned, reportDigest: sha256(canonicalJson(unsigned)) };
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(report, null, 2) + '\n');
if (report.activeRequiredUnparsedCount !== 0) {
  console.error(JSON.stringify(records.filter((record) => !record.pass), null, 2));
  process.exit(1);
}
console.log(`PASS R8A active-required JavaScript parse closure ${report.activeRequiredParsePassCount}/${report.activeRequiredJavaScriptCount}`);
