import { exists, text, writeArtifact } from './lib.mjs';

const names = [
  'spectral-power-normalize.wgsl',
  'spectral-partial-reduce.wgsl',
  'spectral-partial-merge.wgsl',
  'spectral-finalize-fields.wgsl',
  'spectral-reduction-reference.wgsl',
  'spectral-field-set-compare.wgsl',
];
const files = names.map((name) => `app/legacy-runtime/core/analysis/spectral/shaders/${name}`);
const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });
for (const file of files) check(`file:${file}`, exists(file), file);

const [power, partial, merge, finalize, reference, compare] = files.map(text);
for (const token of ['z.x*z.x+z.y*z.y', 'f32(p.totalBins)*f32(p.totalBins)', 'isFinite', 'atomicOr']) {
  check(`power:${token}`, power.includes(token), token);
}
check('power-no-sqrt', !power.includes('sqrt('), 'power pass does not take magnitude root');
check('power-no-log', !power.includes('log('), 'power pass does not compute entropy');

for (const token of [
  'var<workgroup> lane',
  'workgroupBarrier',
  'owner = ky > 0 || (ky == 0 && kx > 0)',
  'pair = power[base + natural] + power[base + mirror]',
  'momentCos2',
  'momentSin2',
  'peakIndex',
  'secondIndex',
  'candidateCount',
  'failureMask = atomicLoad(&windowFailure[window])',
  'insertCandidate(r, b.secondPower, b.secondIndex)',
]) check(`partial:${token}`, partial.includes(token), token);
check('partial-no-float-atomic', !partial.includes('atomic<f32>'), 'no float atomics');
check('partial-uniform-barrier', partial.includes('lane[lid.x] = r;\n  workgroupBarrier();'), 'all lanes write before barrier');

for (const token of [
  'inputCount',
  'outputCount',
  'workgroupBarrier',
  'better(',
  'ai < bi',
  'insertCandidate(r, b.peakPower, b.peakIndex)',
  'insertCandidate(r, b.secondPower, b.secondIndex)',
]) check(`merge:${token}`, merge.includes(token), token);

for (const token of [
  'minimumBandPower',
  'log(r.bandPower) - r.sumPLogP / r.bandPower',
  '(fy * fy - fx * fx) / radiusSquared',
  '(-2.0 * fx * fy) / radiusSquared',
  'min(peakShare, min(dominance, angularCoherence))',
  'atan2(coefficient.y, coefficient.x)',
  '6.283185307179586',
  'sqrt(max(r.peakPower, 0.0))',
  'summary[window]',
]) check(`final:${token}`, finalize.includes(token), token);
check('final-peak-not-moment-orientation', !finalize.includes('normalize(vec2<f32>(r.momentCos2'), 'published orientation comes from selected peak');

for (const token of [
  'Independent direct reduction',
  '@workgroup_size(1)',
  'for (var natural = 0u; natural < p.totalBins',
  'power[base + natural]',
  'candidateCount',
  'peakIndex',
  'secondIndex',
  'entropy[window]',
  'orientation[window]',
  'phase[window]',
  'summary[window]',
]) check(`reference:${token}`, reference.includes(token), token);
check('reference-not-placeholder', !reference.includes('powerError=0.0') && reference.length > 4000, 'direct reference performs full reduction');

for (const token of [
  'nonFiniteCount',
  'powerMismatchCount',
  'entropyMismatchCount',
  'orientationMismatchCount',
  'phaseMismatchCount',
  'summaryMismatchCount',
  'maxPowerAbsErrorBits',
  'maxEntropyAbsErrorBits',
  'minOrientationDotBits',
  'maxPhaseAngularErrorBits',
  'firstMismatchWindow',
  'firstMismatchChannel',
  'atomicMin(&result.firstMismatchPacked',
  'fn finalize_first_mismatch()',
]) check(`compare:${token}`, compare.includes(token), token);
check('compare-not-exact-only', compare.includes('powerTolerance') && compare.includes('phaseAngularTolerance'), 'tolerance-aware comparison');

for (const file of files) {
  const source = text(file);
  check(`balanced:${file}`, (source.match(/{/g) || []).length === (source.match(/}/g) || []).length, 'balanced braces');
  check(`compute:${file}`, source.includes('@compute'), 'compute entry point');
}

const report = {
  schemaVersion: 1,
  pass: checks.every((entry) => entry.pass),
  passed: checks.filter((entry) => entry.pass).length,
  failed: checks.filter((entry) => !entry.pass).length,
  checks,
};
writeArtifact('sq03-wgsl-contract.json', report);
console.log(`SQ03 WGSL ${report.passed}/${checks.length} ${report.pass ? 'PASS' : 'FAIL'}`);
if (!report.pass) {
  for (const entry of checks.filter((x) => !x.pass)) console.error(entry);
  process.exit(1);
}
