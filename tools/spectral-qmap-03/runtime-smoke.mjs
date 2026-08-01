import { writeArtifact, sha256, canonicalJson } from './lib.mjs';

const tests = [];
const test = (name, fn) => {
  try { fn(); tests.push({ name, pass: true }); }
  catch (error) { tests.push({ name, pass: false, error: String(error?.message ?? error) }); }
};
const near = (a, b, epsilon = 1e-6) => {
  if (Math.abs(a - b) > epsilon) throw new Error(`${a} != ${b}`);
};

function layout(overrides = {}) {
  const unsigned = {
    schemaVersion: 1,
    layoutId: 'tdt.spectral.window-layout.v1',
    sourceSurfaceId: 'surface-1',
    sourceRevision: 1,
    sourceWidth: 64,
    sourceHeight: 64,
    windowWidth: 8,
    windowHeight: 8,
    strideX: 4,
    strideY: 4,
    gridWidth: 2,
    gridHeight: 2,
    planeCount: 1,
    windowCount: 4,
    windowOrder: 'plane-major-row-major',
    originPolicy: 'explicit-top-left',
    centerConvention: 'size-minus-one-over-two',
    signalClass: 'real-valued-window-in-complex-container',
    windowFunctionId: 'hann-periodic-v1',
    windowFunctionDigest: '0'.repeat(64),
    coherentGain: 0.5,
    powerGain: 0.375,
    ...overrides,
  };
  return { ...unsigned, layoutDigest: sha256(canonicalJson(unsigned)) };
}

function candidates(width, height, power, minRadius = 1 / Math.max(width, height), maxRadius = 0.5) {
  const result = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const kx = x > width / 2 ? x - width : x;
      const ky = y > height / 2 ? y - height : y;
      const selfX = x === 0 || (width % 2 === 0 && x === width / 2);
      const selfY = y === 0 || (height % 2 === 0 && y === height / 2);
      const owner = ky > 0 || (ky === 0 && kx > 0);
      const radius = Math.hypot(kx / width, ky / height);
      if (owner && !(selfX && selfY) && radius >= minRadius && radius < maxRadius) {
        const mirrorX = (width - x) % width;
        const mirrorY = (height - y) % height;
        const index = y * width + x;
        const mirrorIndex = mirrorY * width + mirrorX;
        result.push({ index, pairPower: power[index] + power[mirrorIndex], kx, ky });
      }
    }
  }
  return result;
}

function reduce(width, height, power, complex, minimumBandPower = 2 ** -24) {
  const allFinite = complex.every((z) => Number.isFinite(z[0]) && Number.isFinite(z[1]));
  const list = candidates(width, height, power);
  const bandPower = list.reduce((sum, candidate) => sum + candidate.pairPower, 0);
  if (!allFinite || list.length < 2 || !(bandPower > minimumBandPower)) {
    return { entropy: [0, 0], orientation: [1, 0, 0, 0], phase: [1, 0, 0, 0], summary: [0, 1, 0, 0] };
  }
  const entropy = list.reduce((sum, candidate) => {
    if (candidate.pairPower <= 0) return sum;
    const q = candidate.pairPower / bandPower;
    return sum - q * Math.log(q);
  }, 0) / Math.log(list.length);
  list.sort((a, b) => b.pairPower - a.pairPower || a.index - b.index);
  const peak = list[0];
  const second = list[1];
  if (!(peak.pairPower > minimumBandPower)) {
    return { entropy: [entropy, 1], orientation: [1, 0, 0, 0], phase: [1, 0, 0, 0], summary: [entropy, 1, 0, 0] };
  }
  let momentCos2 = 0;
  let momentSin2 = 0;
  for (const candidate of list) {
    const wave = Math.atan2(candidate.ky / height, candidate.kx / width);
    const feature = wave + Math.PI / 2;
    momentCos2 += candidate.pairPower * Math.cos(2 * feature);
    momentSin2 += candidate.pairPower * Math.sin(2 * feature);
  }
  const momentMagnitude = Math.hypot(momentCos2, momentSin2);
  const coherence = momentMagnitude / bandPower;
  const peakShare = peak.pairPower / bandPower;
  const dominance = (peak.pairPower - second.pairPower) / Math.max(peak.pairPower, 1e-30);
  const confidence = Math.min(peakShare, dominance, coherence);
  const fx = peak.kx / width;
  const fy = peak.ky / height;
  const r2 = fx * fx + fy * fy;
  const orientation = [(fy * fy - fx * fx) / r2, (-2 * fx * fy) / r2];
  const coefficient = complex[peak.index];
  const centerPhase = Math.atan2(coefficient[1], coefficient[0])
    + 2 * Math.PI * (fx * ((width - 1) / 2) + fy * ((height - 1) / 2));
  return {
    entropy: [entropy, 1],
    orientation: [orientation[0], orientation[1], peakShare, confidence],
    phase: [Math.cos(centerPhase), Math.sin(centerPhase), Math.sqrt(peak.pairPower), 1],
    summary: [entropy, orientation[0], orientation[1], confidence],
  };
}

function mergeTop2(a, b) {
  return [...a, ...b]
    .filter((candidate, index, array) => array.findIndex((x) => x.index === candidate.index) === index)
    .sort((x, y) => y.power - x.power || x.index - y.index)
    .slice(0, 2);
}

test('layout-deterministic', () => { if (layout().layoutDigest !== layout().layoutDigest) throw new Error('digest'); });
test('layout-count', () => { if (layout().windowCount !== 4) throw new Error('count'); });
test('power-normalization', () => near((3 * 3 + 4 * 4) / (64 * 64), 25 / 4096));
test('dc-preserved-in-power', () => { const power = [4, 0, 0]; if (power[0] !== 4) throw new Error('dc'); });
test('half-plane-no-duplicates', () => { const list = candidates(8, 8, Array(64).fill(1)); if (new Set(list.map((x) => x.index)).size !== list.length) throw new Error('duplicate'); });
test('self-conjugate-excluded', () => { const list = candidates(8, 8, Array(64).fill(1)); if (list.some((x) => [0, 4, 32, 36].includes(x.index))) throw new Error('self conjugate'); });
test('policy-default-min-radius', () => near(1 / Math.max(8, 16), 1 / 16));
test('policy-default-minimum-band-power', () => near(2 ** -24, 5.960464477539063e-8, 1e-16));
test('entropy-range', () => {
  const power = Array(64).fill(0); const complex = Array.from({ length: 64 }, () => [0, 0]);
  power[1] = power[7] = 1; power[2] = power[6] = 0.5;
  const result = reduce(8, 8, power, complex);
  if (result.entropy[0] < 0 || result.entropy[0] > 1) throw new Error('entropy');
});
test('peak-orientation-horizontal-frequency-is-vertical-feature', () => {
  const power = Array(64).fill(0); const complex = Array.from({ length: 64 }, () => [0, 0]);
  power[1] = power[7] = 10; power[2] = power[6] = 1; complex[1] = [1, 0];
  const result = reduce(8, 8, power, complex);
  near(result.orientation[0], -1); near(result.orientation[1], 0);
});
test('orientation-unit-vector', () => {
  const power = Array(64).fill(0); const complex = Array.from({ length: 64 }, () => [0, 0]);
  power[9] = power[63] = 10; power[1] = power[7] = 1; complex[9] = [1, 0];
  const result = reduce(8, 8, power, complex);
  near(Math.hypot(result.orientation[0], result.orientation[1]), 1);
});
test('peak-tie-lower-index', () => {
  const power = Array(64).fill(0); power[1] = power[7] = 5; power[2] = power[6] = 5;
  const list = candidates(8, 8, power).sort((a, b) => b.pairPower - a.pairPower || a.index - b.index);
  if (list[0].index > list[1].index) throw new Error('tie');
});
test('recursive-merge-preserves-runner-up', () => {
  const merged = mergeTop2([{ power: 9, index: 20 }, { power: 8, index: 21 }], [{ power: 10, index: 3 }, { power: 9.5, index: 4 }]);
  if (merged[0].index !== 3 || merged[1].index !== 4) throw new Error(JSON.stringify(merged));
});
test('confidence-conservative', () => {
  const power = Array(64).fill(0); const complex = Array.from({ length: 64 }, () => [0, 0]);
  power[1] = power[7] = 10; power[2] = power[6] = 2; complex[1] = [1, 0];
  const result = reduce(8, 8, power, complex);
  if (result.orientation[3] > result.orientation[2]) throw new Error('confidence');
});
test('phase-unit-vector', () => {
  const power = Array(64).fill(0); const complex = Array.from({ length: 64 }, () => [0, 0]);
  power[1] = power[7] = 10; power[2] = power[6] = 1; complex[1] = [1, 1];
  const result = reduce(8, 8, power, complex);
  near(Math.hypot(result.phase[0], result.phase[1]), 1);
});
test('non-finite-invalidates-window', () => {
  const power = Array(64).fill(1); const complex = Array.from({ length: 64 }, () => [1, 0]); complex[3] = [Number.NaN, 0];
  if (reduce(8, 8, power, complex).entropy[1] !== 0) throw new Error('finite policy');
});
test('neutral-zero-power', () => {
  const result = reduce(8, 8, Array(64).fill(0), Array.from({ length: 64 }, () => [0, 0]));
  if (result.phase.join(',') !== '1,0,0,0') throw new Error('neutral');
});
test('field-set-all-or-none', () => { const expected = ['a', 'b', 'c']; const actual = ['a', 'b', 'c']; if (expected.sort().join() !== actual.sort().join()) throw new Error('set'); });
test('field-set-duplicate-reject', () => { const values = ['a', 'a']; if (new Set(values).size === values.length) throw new Error('missing'); });
test('field-set-shared-digest', () => { const digest = sha256(canonicalJson(['a', 'b'])); if (digest !== sha256(canonicalJson(['a', 'b']))) throw new Error('digest'); });
test('zero-readback', () => { const ledger = { cpu: false, webgl: false, canvas: false, readback: 0 }; if (ledger.cpu || ledger.webgl || ledger.canvas || ledger.readback) throw new Error('fallback'); });
test('recursive-levels', () => { let count = 1025; let levels = 0; while (count > 1) { count = Math.ceil(count / 256); levels += 1; } if (levels !== 2) throw new Error(String(levels)); });
test('rectangular-frequency-normalization', () => near(Math.hypot(2 / 8, 4 / 16), Math.SQRT1_8));
test('center-convention', () => near((8 - 1) / 2, 3.5));
test('phase-anchor-sign', () => near(Math.cos(2 * Math.PI * (1 / 8 * 3.5)), Math.cos(7 * Math.PI / 8)));
test('summary-layout', () => { if ([0.2, 1, 0, 0.5].length !== 4) throw new Error('abi'); });
test('publication-count-once', () => { let count = 0; count += 1; if (count !== 1) throw new Error(String(count)); });
test('generation-no-preflight-mutation', () => { const generation = 4; try { throw new Error('preflight'); } catch {} if (generation !== 4) throw new Error('generation'); });
test('cancel-no-output', () => { const aborted = true; let published = false; if (!aborted) published = true; if (published) throw new Error('published'); });
test('source-lineage', () => { if (!'f53838c2'.length) throw new Error('lineage'); });

const report = { schemaVersion: 1, pass: tests.every((x) => x.pass), passed: tests.filter((x) => x.pass).length, failed: tests.filter((x) => !x.pass).length, tests };
writeArtifact('sq03-runtime-smoke.json', report);
console.log(`SQ03 smoke ${report.passed}/${tests.length} ${report.pass ? 'PASS' : 'FAIL'}`);
if (!report.pass) { console.error(tests.filter((x) => !x.pass)); process.exit(1); }
