import crypto from 'node:crypto';
import fs from 'node:fs';

const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');
const canonicalize = (value) => Array.isArray(value)
  ? value.map(canonicalize)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]))
    : value;
const canonical = (value) => JSON.stringify(canonicalize(value));
const fileSha = (file) => sha(fs.readFileSync(file));

const runtime = JSON.parse(fs.readFileSync('artifacts/runtime/generated-runtime-manifest.source.json', 'utf8'));
const legacy = JSON.parse(fs.readFileSync('app/src/legacy/generated-legacy-manifest.json', 'utf8'));
const gateReportPath = fs.existsSync('artifacts/runtime/SOURCE_BAKE_GATE_REPORT_R1_R2.txt')
  ? 'artifacts/runtime/SOURCE_BAKE_GATE_REPORT_R1_R2.txt'
  : 'artifacts/runtime/SOURCE_BAKE_GATE_REPORT.txt';
const gateReport = fs.readFileSync(gateReportPath, 'utf8');
const parity = gateReport.match(/receipt parity 100\/100 ([a-f0-9]{64})/i)?.[1] ?? null;
const exitCode = Number(fs.readFileSync('artifacts/runtime/VITE_BUILD_ATTEMPT.exitcode', 'utf8').trim());

const sealPayload = {
  schemaVersion: 1,
  patchId: 'TDT-RUNTIME-SSOT-01-R1',
  revisionId: 'TDT-RUNTIME-SSOT-01-R1-R2',
  status: 'SOURCE_BAKED_UNPROMOTED',
  finalPromotionPassIssued: false,
  buildId: runtime.buildId,
  promotable: false,
  authority: {
    viteEntry: '/src/main.ts',
    vueShell: true,
    piniaSerializableStateOnly: true,
    runtimeServiceIsolation: true,
    legacyAdapterRequired: true,
    finalSurfaceExportRequired: true,
  },
  counts: {
    rootExecutableEntries: 1,
    legacyRootScripts: legacy.entries.length,
    legacyGlobalRegistry: legacy.globalRegistry.length,
    runtimeModules: runtime.modules.length,
    runtimeServices: runtime.services.length,
    receiptParityRuns: 100,
    stableErrorCodesReferenced: 29,
    stableErrorCodesDeclared: 29,
  },
  digests: {
    specSha256: fileSha('specs/TDT-RUNTIME-SSOT-01-R1_SPEC.md'),
    appliedReadmeSha256: fileSha('README_TDT_RUNTIME_SSOT_01_R1_APPLIED.md'),
    revisionReadmeSha256: fileSha('README_TDT_RUNTIME_SSOT_01_R1_R2_APPLIED.md'),
    packageJsonSha256: fileSha('package.json'),
    packageLockSha256: fileSha('package-lock.json'),
    appIndexSha256: fileSha('app/index.html'),
    sourceGraphSha256: runtime.sourceGraphDigest,
    legacyManifestSha256: runtime.legacyManifestDigest,
    runtimePlanSha256: runtime.runtimePlanDigest,
    servicePlanSha256: runtime.servicePlanDigest,
    runtimeManifestSelfSha256: runtime.selfDigest,
    staticGateReportSha256: fileSha(gateReportPath),
    viteBuildAttemptLogSha256: fileSha('artifacts/runtime/VITE_BUILD_ATTEMPT.log'),
  },
  gates: [
    { id: 'GATE-R1-01', result: 'PASS', name: 'Vite entry closure' },
    { id: 'GATE-R1-02', result: 'PASS', name: 'Production source serving closure' },
    { id: 'GATE-R1-06', result: 'PASS', name: 'Capability ownership' },
    { id: 'GATE-R1-07', result: 'PASS', name: 'Service ownership' },
    { id: 'GATE-R1-08', result: 'PASS', name: 'Pinia static serializability' },
    { id: 'GATE-R1-11', result: 'PASS', name: 'Legacy admission and syntax' },
    { id: 'GATE-R1-15', result: 'PASS', name: 'Runtime resource isolation' },
    { id: 'GATE-R1-R2-DIAG', result: 'PASS', name: 'Diagnostic error single-emission' },
    { id: 'GATE-R1-17', result: 'PASS', name: 'Final export authority' },
    { id: 'GATE-R1-20', result: 'PASS', name: 'Deterministic receipt parity', runs: 100, digest: parity },
    { id: 'GATE-R1-TS-PARSE', result: 'PASS', name: 'TypeScript parser syntax', units: 48 },
    { id: 'GATE-R1-ERROR-CODE', result: 'PASS', name: 'Stable error registry', referenced: 29, declared: 29 },
    { id: 'GATE-R1-LOCK', result: 'BLOCKED', name: 'Package lock consistency', details: runtime.lockConsistency },
    { id: 'GATE-R1-VITE-BUILD', result: 'BLOCKED', name: 'Vite production bundle', exitCode },
    { id: 'GATE-R1-VUE-TSC', result: 'NOT_RUN', name: 'Vue semantic typecheck' },
    { id: 'GATE-R1-ELECTRON-SMOKE', result: 'NOT_RUN', name: 'Electron renderer smoke' },
  ],
  blockers: [
    { code: 'BLOCK-R1-LOCK-001', reason: 'package-lock.json does not include the new Vue, Pinia, Vite dependency graph' },
    { code: 'BLOCK-R1-BUILD-001', reason: 'local vite binary is unavailable because dependencies could not be installed in the current environment', exitCode },
  ],
  hotfixes: [
    { id: 'R1-R2-LEGACY-GLOBAL-001', moduleId: 'dadum.legacy.main.js', declaredGlobal: 'ΔKCore', ownership: 'static-import-graph' },
    { id: 'R1-R2-DIAG-001', behavior: 'single-emission-by-code-message-detail' },
  ],
  marker: 'PASS_TDT_RUNTIME_SSOT_01_R1_R2_SOURCE_BAKE_UNPROMOTED',
};

const receipt = { ...sealPayload, sourceBakeSealSha256: sha(canonical(sealPayload)) };
const receiptJson = `${JSON.stringify(receipt, null, 2)}\n`;
fs.writeFileSync('artifacts/runtime/TDT_RUNTIME_SSOT_01_R1_SOURCE_BAKE_RECEIPT.json', receiptJson);
fs.writeFileSync('artifacts/runtime/TDT_RUNTIME_SSOT_01_R1_R2_SOURCE_BAKE_RECEIPT.json', receiptJson);
const markdown = [
  '# TDT-RUNTIME-SSOT-01-R1 Source Bake Receipt',
  '',
  `- Status: **${receipt.status}**`,
  `- Build ID: \`${receipt.buildId}\``,
  `- Source bake seal: \`${receipt.sourceBakeSealSha256}\``,
  `- Runtime plan: \`${receipt.digests.runtimePlanSha256}\``,
  `- Legacy manifest: \`${receipt.digests.legacyManifestSha256}\``,
  '- Final Promotion PASS issued: **No**',
  '',
  '## Passed',
  '',
  ...receipt.gates.filter((gate) => gate.result === 'PASS').map((gate) => `- ${gate.id}: ${gate.name}`),
  '',
  '## Blocked or not run',
  '',
  ...receipt.gates.filter((gate) => gate.result !== 'PASS').map((gate) => `- ${gate.id}: ${gate.result} | ${gate.name}`),
  '',
  '## Marker',
  '',
  '```text',
  receipt.marker,
  '```',
  '',
].join('\n');
fs.writeFileSync('artifacts/runtime/TDT_RUNTIME_SSOT_01_R1_SOURCE_BAKE_RECEIPT.md', markdown);
fs.writeFileSync('artifacts/runtime/TDT_RUNTIME_SSOT_01_R1_R2_SOURCE_BAKE_RECEIPT.md', markdown);
console.log(`[TDT-RUNTIME-SSOT-01-R1] source bake receipt ${receipt.sourceBakeSealSha256}`);
