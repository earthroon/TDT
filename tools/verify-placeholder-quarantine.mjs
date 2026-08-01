import fs from 'node:fs';

const failures = [];
const pipeline = fs.readFileSync('app/src/runtime/pipeline/pipeline-service.ts', 'utf8');
const container = fs.readFileSync('app/src/runtime/service-container.ts', 'utf8');
const receipt = fs.readFileSync('app/src/boot/runtime-receipt.ts', 'utf8');
const composition = fs.readFileSync('app/src/boot/runtime-modules.ts', 'utf8');
const guard = fs.readFileSync('app/legacy-runtime/pipeline_bind_guard.js', 'utf8');

if (!guard.includes('window.pipeline.__dk_placeholder = true')) failures.push('legacy guard no longer marks placeholder identity');
if (!pipeline.includes("'PLACEHOLDER_QUARANTINED'")) failures.push('placeholder quarantine disposition missing');
if (!pipeline.includes('I_RUNTIME_LEGACY_PLACEHOLDER_QUARANTINED')) failures.push('placeholder quarantine diagnostic missing');
if (!pipeline.includes("authorityModel: 'runtime-service-only'")) failures.push('runtime-service-only authority evidence missing');
if (!pipeline.includes('placeholderAdopted: false')) failures.push('receipt does not prove placeholder non-adoption');
if (!pipeline.includes('Legacy placeholder pipeline cannot be published as an authoritative final surface')) failures.push('placeholder publication rejection missing');
if (/initialize[\s\S]{0,900}E_RUNTIME_PLACEHOLDER_REJECTED/.test(pipeline)) failures.push('pipeline initialize still rejects a quarantined legacy placeholder');
if (!container.includes('receiptEvidence?(): Record<string, unknown>')) failures.push('runtime service receipt evidence contract missing');
if (!receipt.includes('evidence: service.receiptEvidence?.() ?? null')) failures.push('boot receipt omits service evidence');
if (!composition.includes('new PipelineService(resources, diagnostics)')) failures.push('pipeline service diagnostics dependency not wired');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('PASS GATE-R1-R6-PLACEHOLDER-QUARANTINE non-authoritative legacy placeholder isolation and receipt evidence');
