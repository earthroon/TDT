import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const TOOL_ROOT = path.join(ROOT, 'tools/resample-runtime-01-r3');
export const FIXTURE_ROOT = path.join(ROOT, 'fixtures/resample-runtime-01-r3');
export const FIXTURE_MANIFEST_REL = 'fixtures/resample-runtime-01-r3/TDT_RESAMPLE_RUNTIME_01_R3_FIXTURE_MANIFEST.json';
export const ARTIFACT_DIR = path.join(ROOT, 'artifacts/resample-runtime-01-r3/source-bake');
export const PATCH_ID = 'TDT-RESAMPLE-RUNTIME-01-R3';
export const PARENT_PATCH_ID = 'TDT-RESAMPLE-RUNTIME-01-R2';
export const PARENT_ZIP_SHA256 = '5f352059892cf3e061ebbcd1a4ee4b10634565351492d02d384a82f53c64199b';
export const COORDINATE_CONVENTION_ID = 'tdt.ewa.source-lattice.pixel-center-v2';
export const ORACLE_ID = 'tdt.ewa.oracle.f64.fractional-phase.v1';
export const NEGATIVE_CONTROL_ID = 'tdt.ewa.negative-control.round-centered-r2.v1';
export const FIXTURE_SCHEMA_ID = 'tdt.ewa.fractional-phase-fixtures.v1';
export const FIXTURE_MANIFEST_SCHEMA_ID = 'tdt.ewa.fractional-phase-fixture-manifest.v1';
export const REJECTION_SCHEMA_ID = 'tdt.ewa.current-product-rejection.r3.v1';
export const MAX_FIXTURE_DIMENSION = 64;
export const MAX_FIXTURE_COUNT = 512;
export const EPSILON_REACH = 1e-12;

export const PARENT_FILES = Object.freeze({
  productR4: ['app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r4_r2.wgsl', 'c2714270086eb1ad0a514e4850f01816b98890cfbd16755372001547b34aee24'],
  productR6: ['app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r6_r2.wgsl', '0d7cb8a26cb063708bb4f04e665f0ef8e6d44cb4db58d802b341ad220bea58a7'],
  validationR4: ['app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r4_r2.wgsl', 'f9f7efedde8ca7c547359ac91b175aabb0868be2d87a50d2680d7373c6e210fd'],
  validationR6: ['app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_validation_r6_r2.wgsl', '0c6bbbd8a3007f79bc7e1eb4dee0dec5ad2f4e7f20dfc1d095d7e16068eb7c8e'],
  directReference: ['app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v2_r1c.wgsl', 'bfd0e2d94e15467379b92c9c2ed4a3555be1d1b0a9a67b4f0f167eb550dbc4eb'],
  profileSelector: ['app/legacy-runtime/core/compute/qmap_webgpu/ewa_tiled_profile_r2.mjs', '07f1d65d5bc09b0f7231034ef85001ba4fdd6346cf93abe2cda441012ccd8b33'],
  parityRuntime: ['app/legacy-runtime/core/compute/qmap_webgpu/ewa_parity_runtime_r2.mjs', 'b787e6fffcf3c2c98d36cc6bb2fc34a2f67e460ae79b76bd3fa4144f4d768ba5'],
});

export const REQUIRED_ERROR_CODES = Object.freeze([
  'E_R3_PARENT_SHADER_IDENTITY_MISMATCH',
  'E_R3_COORDINATE_CONVENTION_MISMATCH',
  'E_R3_ORACLE_INPUT_INVALID',
  'E_R3_ORACLE_NONFINITE',
  'E_R3_ORACLE_ZERO_WEIGHT_SUM',
  'E_R3_ORACLE_SELF_TEST_FAILED',
  'E_R3_ORACLE_MATRIX_CROSSCHECK_FAILED',
  'E_R3_FIXTURE_SCHEMA_INVALID',
  'E_R3_FIXTURE_COVERAGE_INCOMPLETE',
  'E_R3_FIXTURE_REGEN_MISMATCH',
  'E_R3_NEGATIVE_CONTROL_NOT_DETECTED',
  'E_R3_NEGATIVE_CONTROL_IDENTITY_MISMATCH',
  'E_R3_SHARED_ERROR_SOURCE_NOT_FOUND',
  'E_R3_SHARED_ERROR_MODEL_MISMATCH',
  'E_R3_CURRENT_PRODUCT_NOT_REJECTED',
  'E_R3_RUNTIME_IMPORT_FORBIDDEN',
  'E_R3_CPU_FALLBACK_WIRING_DETECTED',
  'E_R3_ORACLE_EMITTED_IN_RENDERER',
  'E_R3_ORACLE_PACKAGED',
  'E_R3_ORACLE_USER_IMAGE_INGRESS_FORBIDDEN',
  'E_R3_PRODUCTION_POINTER_MUTATION_FORBIDDEN',
  'E_R3_PHYSICAL_GPU_CLAIM_UNSUPPORTED',
  'E_R3_PACKAGED_CLAIM_UNSUPPORTED',
  'E_R3_SOURCE_BAKE_INCOMPLETE',
]);

export class R3Error extends Error {
  constructor(code, message, detail = null) {
    super(message);
    this.name = 'R3Error';
    this.code = code;
    this.detail = detail;
  }
}

export function fail(code, message, detail = null) {
  throw new R3Error(code, message, detail);
}

export function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

export function readBytes(rel) {
  return fs.readFileSync(path.join(ROOT, rel));
}

export function readJson(rel) {
  return JSON.parse(read(rel));
}

export function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function sha256File(rel) {
  return sha256(readBytes(rel));
}

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = canonicalize(value[key]);
    return out;
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value), null, 2) + '\n';
}

export function writeCanonicalFile(absPath, value) {
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, canonicalJson(value), 'utf8');
}

export function writeJson(name, value) {
  writeCanonicalFile(path.join(ARTIFACT_DIR, name), value);
}

export function check(pass, id, message, detail = null) {
  return { id, pass: Boolean(pass), message, detail };
}

export function assertFinite(value, label) {
  if (!Number.isFinite(value)) fail('E_R3_ORACLE_NONFINITE', `${label} must be finite`, { label, value });
  return value;
}

export function assertInteger(value, label, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    fail('E_R3_ORACLE_INPUT_INVALID', `${label} must be a safe integer in range`, { label, value, min, max });
  }
  return value;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export class NeumaierSum {
  constructor() {
    this.sum = 0;
    this.compensation = 0;
  }
  add(value) {
    assertFinite(value, 'neumaier-value');
    const t = this.sum + value;
    if (Math.abs(this.sum) >= Math.abs(value)) this.compensation += (this.sum - t) + value;
    else this.compensation += (value - t) + this.sum;
    this.sum = t;
  }
  value() {
    const result = this.sum + this.compensation;
    assertFinite(result, 'neumaier-result');
    return result;
  }
}

export function maxAbsDiff(a, b) {
  if (a.length !== b.length) return Infinity;
  let max = 0;
  for (let i = 0; i < a.length; i += 1) max = Math.max(max, Math.abs(a[i] - b[i]));
  return max;
}

export function arraysBitIdentical(a, b) {
  if (a.length !== b.length) return false;
  const aa = new Float64Array(a);
  const bb = new Float64Array(b);
  return Buffer.compare(Buffer.from(aa.buffer), Buffer.from(bb.buffer)) === 0;
}

export function sourcePositionFromRasterMapping(mapping) {
  const { destinationX, destinationY, sourceWidth, sourceHeight, destinationWidth, destinationHeight } = mapping;
  for (const [value, label] of [[sourceWidth, 'sourceWidth'], [sourceHeight, 'sourceHeight'], [destinationWidth, 'destinationWidth'], [destinationHeight, 'destinationHeight']]) {
    assertInteger(value, label, 1, MAX_FIXTURE_DIMENSION);
  }
  assertInteger(destinationX, 'destinationX', 0, destinationWidth - 1);
  assertInteger(destinationY, 'destinationY', 0, destinationHeight - 1);
  return [
    (destinationX + 0.5) * (sourceWidth / destinationWidth) - 0.5,
    (destinationY + 0.5) * (sourceHeight / destinationHeight) - 0.5,
  ];
}

export function normalizeTangent(ellipse) {
  const tx = assertFinite(ellipse.tangentX, 'ellipse.tangentX');
  const ty = assertFinite(ellipse.tangentY, 'ellipse.tangentY');
  const length = Math.hypot(tx, ty);
  if (!(length > 0) || !Number.isFinite(length)) fail('E_R3_ORACLE_INPUT_INVALID', 'tangent length must be positive and finite');
  return [tx / length, ty / length];
}

export function validateEllipse(ellipse) {
  if (!ellipse || typeof ellipse !== 'object') fail('E_R3_ORACLE_INPUT_INVALID', 'ellipse is required');
  const [tangentX, tangentY] = normalizeTangent(ellipse);
  const majorRadius = assertFinite(ellipse.majorRadius, 'ellipse.majorRadius');
  const minorRadius = assertFinite(ellipse.minorRadius, 'ellipse.minorRadius');
  const kernelSharpness = assertFinite(ellipse.kernelSharpness, 'ellipse.kernelSharpness');
  const taperExponent = assertFinite(ellipse.taperExponent, 'ellipse.taperExponent');
  const maxReach = assertInteger(ellipse.maxReach, 'ellipse.maxReach', 0, 6);
  if (!(majorRadius > 0) || !(minorRadius > 0) || !(kernelSharpness >= 0) || !(taperExponent >= 0)) {
    fail('E_R3_ORACLE_INPUT_INVALID', 'ellipse radii must be positive and kernel parameters non-negative', ellipse);
  }
  if (maxReach < Math.ceil(Math.max(majorRadius, minorRadius) - EPSILON_REACH)) {
    fail('E_R3_ORACLE_INPUT_INVALID', 'ellipse reach is insufficient', { majorRadius, minorRadius, maxReach });
  }
  return { tangentX, tangentY, majorRadius, minorRadius, kernelSharpness, taperExponent, maxReach };
}

export function validateSource(source) {
  if (!source || typeof source !== 'object') fail('E_R3_FIXTURE_SCHEMA_INVALID', 'source is required');
  const width = assertInteger(source.width, 'source.width', 1, MAX_FIXTURE_DIMENSION);
  const height = assertInteger(source.height, 'source.height', 1, MAX_FIXTURE_DIMENSION);
  if (!Array.isArray(source.pixels) || source.pixels.length !== width * height * 4) {
    fail('E_R3_FIXTURE_SCHEMA_INVALID', 'source pixel length mismatch', { width, height, length: source.pixels?.length });
  }
  for (let i = 0; i < source.pixels.length; i += 1) assertFinite(source.pixels[i], `source.pixels[${i}]`);
  return { width, height, pixels: source.pixels };
}

export function sourceDigestPayload(source) {
  return {
    schemaId: 'tdt.ewa.source-payload.v1',
    patternId: source.patternId,
    width: source.width,
    height: source.height,
    pixels: source.pixels,
  };
}

export function computeSourceDigest(source) {
  return sha256(canonicalJson(sourceDigestPayload(source)));
}

export function fixtureDigestPayload(fixture, source, ellipse) {
  return {
    fixtureSchemaId: fixture.fixtureSchemaId,
    fixtureId: fixture.fixtureId,
    fixtureClass: fixture.fixtureClass,
    source: {
      sourceId: source.sourceId,
      patternId: source.patternId,
      width: source.width,
      height: source.height,
      pixels: source.pixels,
    },
    position: fixture.position ?? null,
    rasterMapping: fixture.rasterMapping ?? null,
    ellipse,
    borderMode: fixture.borderMode,
    semanticClasses: fixture.semanticClasses,
  };
}

export function computeFixtureDigest(fixture, source, ellipse) {
  return sha256(canonicalJson(fixtureDigestPayload(fixture, source, ellipse)));
}

export function loadFixtureManifest() {
  const manifest = readJson(FIXTURE_MANIFEST_REL);
  if (manifest.schemaId !== FIXTURE_MANIFEST_SCHEMA_ID || manifest.fixtureSchemaId !== FIXTURE_SCHEMA_ID) {
    fail('E_R3_FIXTURE_SCHEMA_INVALID', 'fixture manifest schema mismatch');
  }
  if (!Array.isArray(manifest.fixtures) || manifest.fixtures.length > MAX_FIXTURE_COUNT) {
    fail('E_R3_FIXTURE_SCHEMA_INVALID', 'fixture count is invalid', { count: manifest.fixtures?.length });
  }
  return manifest;
}

export function resolveFixture(manifest, fixtureOrId) {
  const fixture = typeof fixtureOrId === 'string' ? manifest.fixtures.find((entry) => entry.fixtureId === fixtureOrId) : fixtureOrId;
  if (!fixture || fixture.fixtureSchemaId !== FIXTURE_SCHEMA_ID || typeof fixture.fixtureDigest !== 'string') {
    fail('E_R3_FIXTURE_SCHEMA_INVALID', 'sealed fixture is required');
  }
  const source = manifest.sources.find((entry) => entry.sourceId === fixture.sourceId);
  const ellipse = manifest.ellipses.find((entry) => entry.ellipseId === fixture.ellipseId);
  if (!source || !ellipse) fail('E_R3_FIXTURE_SCHEMA_INVALID', 'fixture references unknown source or ellipse', fixture);
  validateSource(source);
  const normalizedEllipse = validateEllipse(ellipse);
  if (source.sourceDigest !== computeSourceDigest(source)) fail('E_R3_FIXTURE_SCHEMA_INVALID', 'source digest mismatch', { sourceId: source.sourceId });
  const digest = computeFixtureDigest(fixture, source, ellipse);
  if (fixture.fixtureDigest !== digest) fail('E_R3_FIXTURE_SCHEMA_INVALID', 'fixture digest mismatch', { fixtureId: fixture.fixtureId });
  const p = fixture.fixtureClass === 'raster-mapped' ? sourcePositionFromRasterMapping(fixture.rasterMapping) : fixture.position;
  if (!Array.isArray(p) || p.length !== 2) fail('E_R3_FIXTURE_SCHEMA_INVALID', 'fixture position invalid', fixture);
  assertFinite(p[0], 'position.x');
  assertFinite(p[1], 'position.y');
  return { fixture, source, ellipse: normalizedEllipse, rawEllipse: ellipse, position: p };
}

export function walkFiles(root, predicate = () => true) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile() && predicate(absolute)) out.push(absolute);
    }
  };
  walk(root);
  return out.sort();
}

export function relative(absolute) {
  return path.relative(ROOT, absolute).split(path.sep).join('/');
}

export function ensureCleanArtifactDir() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

export function receiptDigest(value) {
  return sha256(canonicalJson(value));
}
