import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const PATCH_ID = 'TDT-PSD-DECODER-01';
export const APP_ID = 'com.dadumdadum.app';

export function sha256Bytes(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function sha256File(filePath) {
  return sha256Bytes(fs.readFileSync(filePath));
}

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function walkFiles(rootDir, { exclude = [] } = {}) {
  const out = [];
  if (!fs.existsSync(rootDir)) return out;
  const excluded = new Set(exclude);
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      if (excluded.has(entry.name)) continue;
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) out.push(absolute);
    }
  };
  visit(rootDir);
  return out;
}

export function lockConsistency(projectRoot) {
  const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package-lock.json'), 'utf8'));
  const root = lock.packages?.[''] ?? {};
  const groups = ['dependencies', 'devDependencies'];
  const mismatches = [];
  for (const group of groups) {
    const expected = pkg[group] ?? {};
    const actual = root[group] ?? {};
    const names = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort();
    for (const name of names) {
      if (expected[name] !== actual[name]) mismatches.push({ group, name, expected: expected[name] ?? null, actual: actual[name] ?? null });
    }
  }
  const exact = (value) => typeof value === 'string' && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value);
  const directVersionsExact = groups.every((group) => Object.values(pkg[group] ?? {}).every(exact));
  const packages = Object.entries(lock.packages ?? {}).filter(([name]) => name !== '');
  const integrityMissing = packages.filter(([, record]) => !record.link && !record.integrity && !record.inBundle).map(([name]) => name);
  const resolvedMissing = packages.filter(([, record]) => !record.link && !record.resolved).map(([name]) => name);
  return {
    consistent: mismatches.length === 0 && directVersionsExact && integrityMissing.length === 0 && resolvedMissing.length === 0,
    rootGraphExact: mismatches.length === 0,
    directVersionsExact,
    mismatches,
    integrityMissing,
    resolvedMissing,
  };
}

export function runtimeModulePlan() {
  return [
    { id: 'dadum.module.foundation-v1', version: '1.0.0', phase: 'foundation', required: true, dependsOn: [], provides: ['dadum.diagnostics', 'dadum.receipt'], ownsServices: ['dadum.runtime.diagnostics', 'dadum.runtime.receipt'] },
    { id: 'dadum.module.host-v1', version: '1.0.0', phase: 'host', required: true, dependsOn: ['dadum.module.foundation-v1'], provides: ['dadum.host.bridge'], ownsServices: ['dadum.runtime.host-bridge'] },
    { id: 'dadum.module.state-v1', version: '1.0.0', phase: 'state', required: true, dependsOn: ['dadum.module.foundation-v1'], provides: ['dadum.state.serializable'], ownsServices: [] },
    { id: 'dadum.module.active-graph-v1', version: '1.0.0', phase: 'resources', required: true, dependsOn: ['dadum.module.foundation-v1'], provides: ['dadum.active-graph', 'dadum.runtime-assets', 'dadum.side-effects', 'dadum.deterministic-sequence'], ownsServices: ['dadum.runtime.active-graph', 'dadum.runtime.runtime-assets', 'dadum.runtime.side-effects', 'dadum.runtime.deterministic-sequence'] },
    { id: 'dadum.module.resources-v1', version: '1.0.0', phase: 'resources', required: true, dependsOn: ['dadum.module.foundation-v1'], provides: ['dadum.resource.registry'], ownsServices: ['dadum.runtime.resource-registry'] },
    { id: 'dadum.module.legacy-adapter-v1', version: '1.0.0', phase: 'resources', required: true, dependsOn: ['dadum.module.host-v1', 'dadum.module.state-v1', 'dadum.module.active-graph-v1'], provides: ['dadum.legacy.runtime'], ownsServices: ['dadum.runtime.legacy-adapter'] },
    { id: 'dadum.module.gpu-v1', version: '1.0.0', phase: 'pipeline', required: true, dependsOn: ['dadum.module.resources-v1', 'dadum.module.legacy-adapter-v1'], provides: ['dadum.gpu.device'], ownsServices: ['dadum.runtime.gpu'] },
    { id: 'dadum.module.worker-v1', version: '1.0.0', phase: 'pipeline', required: true, dependsOn: ['dadum.module.resources-v1'], provides: ['dadum.worker.registry'], ownsServices: ['dadum.runtime.worker-registry'] },
    { id: 'dadum.module.encoder-worker-v1', version: '1.0.0', phase: 'pipeline', required: true, dependsOn: ['dadum.module.foundation-v1', 'dadum.module.resources-v1', 'dadum.module.worker-v1', 'dadum.module.legacy-adapter-v1', 'dadum.module.active-graph-v1'], provides: ['dadum.encoder.worker-broker'], ownsServices: ['dadum.runtime.encoder-worker-broker'] },
    { id: 'dadum.module.decode-v1', version: '1.1.0', phase: 'decode', required: true, dependsOn: ['dadum.module.host-v1', 'dadum.module.resources-v1'], provides: ['dadum.decode.registry', 'dadum.decode.independent-matrix'], ownsServices: ['dadum.runtime.decoder-registry'] },
    { id: 'dadum.module.encode-v1', version: '2.1.0', phase: 'export', required: true, dependsOn: ['dadum.module.resources-v1', 'dadum.module.legacy-adapter-v1', 'dadum.module.encoder-worker-v1'], provides: ['dadum.encode.registry'], ownsServices: ['dadum.runtime.encoder-registry'] },
    { id: 'dadum.module.pipeline-v1', version: '1.7.0', phase: 'pipeline', required: true, dependsOn: ['dadum.module.gpu-v1', 'dadum.module.decode-v1', 'dadum.module.legacy-adapter-v1'], provides: ['dadum.pipeline.authority', 'dadum.pipeline.legacy-final-bridge'], ownsServices: ['dadum.runtime.pipeline', 'dadum.runtime.legacy-final-surface-bridge'] },
    { id: 'dadum.module.installed-admission-r11a', version: '1.0.0', phase: 'pipeline', required: true, dependsOn: ['dadum.module.host-v1', 'dadum.module.active-graph-v1'], provides: ['dadum.installed-admission.r11a'], ownsServices: ['dadum.runtime.installed-admission-r11a'] },
    { id: 'dadum.module.release-distribution-r14a', version: '1.0.0', phase: 'pipeline', required: true, dependsOn: ['dadum.module.host-v1'], provides: ['dadum.release-distribution.r14a'], ownsServices: ['dadum.runtime.release-distribution-r14a'] },
    { id: 'dadum.module.atomic-update-r12a', version: '1.1.0', phase: 'pipeline', required: true, dependsOn: ['dadum.module.installed-admission-r11a', 'dadum.module.release-distribution-r14a'], provides: ['dadum.atomic-update.r12a'], ownsServices: ['dadum.runtime.update-coordinator-r12a'] },
    { id: 'dadum.module.fleet-rollout-r13a', version: '1.1.0', phase: 'pipeline', required: true, dependsOn: ['dadum.module.atomic-update-r12a', 'dadum.module.release-distribution-r14a'], provides: ['dadum.fleet-rollout.r13a'], ownsServices: ['dadum.runtime.fleet-rollout-r13a'] },
    { id: 'dadum.module.r9a-p1-r2-recovery-v1', version: '1.0.0', phase: 'pipeline', required: true, dependsOn: ['dadum.module.pipeline-v1', 'dadum.module.installed-admission-r11a'], provides: ['dadum.r9a-p1-r2.recovery-holder'], ownsServices: ['dadum.runtime.r9a-p1-r2-recovery-holder'] },
    { id: 'dadum.module.preview-v1', version: '2.2.0', phase: 'preview', required: true, dependsOn: ['dadum.module.r9a-p1-r2-recovery-v1', 'dadum.module.pipeline-v1', 'dadum.module.installed-admission-r11a', 'dadum.module.atomic-update-r12a'], provides: ['dadum.preview.presenter', 'dadum.preview.layout', 'dadum.preview.receipt-ledger'], ownsServices: ['dadum.runtime.preview-presenter'] },
    { id: 'dadum.module.export-v1', version: '3.3.0', phase: 'export', required: true, dependsOn: ['dadum.module.r9a-p1-r2-recovery-v1', 'dadum.module.pipeline-v1', 'dadum.module.encode-v1', 'dadum.module.installed-admission-r11a', 'dadum.module.atomic-update-r12a'], provides: ['dadum.export.authority', 'dadum.export.receipts'], ownsServices: ['dadum.runtime.export-receipts', 'dadum.runtime.export-authority'] },
    { id: 'dadum.module.ui-finalize-v1', version: '1.0.0', phase: 'ui-finalize', required: true, dependsOn: ['dadum.module.preview-v1', 'dadum.module.export-v1'], provides: ['dadum.ui.workspace'], ownsServices: [] }
  ];
}

export function servicePlan() {
  return [
    'dadum.runtime.active-graph',
    'dadum.runtime.runtime-assets',
    'dadum.runtime.deterministic-sequence',
    'dadum.runtime.host-bridge',
    'dadum.runtime.installed-admission-r11a',
    'dadum.runtime.update-coordinator-r12a',
    'dadum.runtime.fleet-rollout-r13a',
    'dadum.runtime.release-distribution-r14a',
    'dadum.runtime.resource-registry',
    'dadum.runtime.side-effects',
    'dadum.runtime.gpu',
    'dadum.runtime.worker-registry',
    'dadum.runtime.encoder-worker-broker',
    'dadum.runtime.decoder-registry',
    'dadum.runtime.encoder-registry',
    'dadum.runtime.pipeline',
    'dadum.runtime.r9a-p1-r2-recovery-holder',
    'dadum.runtime.legacy-final-surface-bridge',
    'dadum.runtime.preview-presenter',
    'dadum.runtime.export-authority',
    'dadum.runtime.export-receipts',
    'dadum.runtime.receipt',
    'dadum.runtime.diagnostics',
    'dadum.runtime.legacy-adapter'
  ].sort();
}
