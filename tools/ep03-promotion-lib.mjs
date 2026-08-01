import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const EP03_PATCH_ID = 'TDT-EXPORT-PROMOTION-03';
export const POINTER_ID = 'dadum.export.production-pointer';
export const POINTER_SCHEMA_VERSION = 2;
export const RELEASE_PROFILES = Object.freeze(['core-raster-v1', 'psd-rgb-v1', 'psd-cmyk-v1', 'full-product-v1']);

export function sha256Bytes(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function sha256File(file) {
  return sha256Bytes(fs.readFileSync(file));
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

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

export function pointerPayload(pointer) {
  const { pointerSha256: _pointerSha256, ...payload } = pointer;
  return payload;
}

export function pointerDigest(pointer) {
  return sha256Bytes(canonicalJson(pointerPayload(pointer)));
}

export function verifyPointerShape(pointer) {
  if (pointer?.schemaVersion !== POINTER_SCHEMA_VERSION) throw new Error('E_EXPORT_ROLLBACK_POINTER_INVALID');
  if (pointer?.pointerId !== POINTER_ID) throw new Error('E_EXPORT_ROLLBACK_POINTER_INVALID');
  if (pointer?.rollbackUnit !== 'whole-build-only') throw new Error('E_EXPORT_ROLLBACK_POINTER_INVALID');
  if (pointer?.legacyFallbackAllowed !== false || pointer?.perEncoderRollbackAllowed !== false) throw new Error('E_EXPORT_ROLLBACK_POINTER_INVALID');
  if (!RELEASE_PROFILES.includes(pointer?.candidateReleaseProfileId) && pointer?.candidateReleaseProfileId !== null) throw new Error('E_EXPORT_ROLLBACK_POINTER_INVALID');
  const observed = pointerDigest(pointer);
  if (pointer.pointerSha256 !== observed) throw new Error('E_PROMOTION_POINTER_READBACK_MISMATCH');
  return observed;
}

export function atomicWriteJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}.${Date.now()}.tmp`);
  const fd = fs.openSync(temp, 'wx', 0o600);
  try {
    fs.writeFileSync(fd, JSON.stringify(value, null, 2) + '\n');
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(temp, file);
  const dirFd = fs.openSync(path.dirname(file), 'r');
  try { fs.fsyncSync(dirFd); } finally { fs.closeSync(dirFd); }
}

export function createSourceCandidatePointer({ previousPointer, candidateBuildId, candidateProfileId = 'full-product-v1', blockers = [] }) {
  const previousDigest = previousPointer?.schemaVersion === POINTER_SCHEMA_VERSION && previousPointer?.pointerMutationPerformed === false
    ? previousPointer.expectedPreviousPointerSha256
    : previousPointer?.pointerSha256 || (previousPointer ? sha256Bytes(canonicalJson(previousPointer)) : null);
  const pointer = {
    schemaVersion: POINTER_SCHEMA_VERSION,
    pointerId: POINTER_ID,
    activeBuildId: previousPointer?.activeBuildId ?? null,
    activePackageContentId: previousPointer?.activePackageContentId ?? null,
    activeReleaseProfileId: previousPointer?.activeReleaseProfileId ?? null,
    previousBuildId: previousPointer?.previousBuildId ?? null,
    previousPackageContentId: previousPointer?.previousPackageContentId ?? null,
    candidateBuildId,
    candidatePackageContentId: null,
    candidateReleaseProfileId: candidateProfileId,
    candidateState: 'SOURCE_BAKED_UNPROMOTED',
    expectedPreviousPointerSha256: previousDigest,
    promotionReceiptSha256: null,
    rollbackUnit: 'whole-build-only',
    legacyFallbackAllowed: false,
    perEncoderRollbackAllowed: false,
    pointerMutationPerformed: false,
    promotionEligible: false,
    blockers: [...new Set(blockers)].sort(),
  };
  return { ...pointer, pointerSha256: pointerDigest(pointer) };
}

export function promotePointerCas({ pointerFile, expectedPreviousPointerSha256, buildId, packageContentId, releaseProfileId, promotionReceiptSha256 }) {
  const current = JSON.parse(fs.readFileSync(pointerFile, 'utf8'));
  const currentSha = verifyPointerShape(current);
  if (currentSha !== expectedPreviousPointerSha256) throw new Error('E_PROMOTION_POINTER_CAS_MISMATCH');
  if (!RELEASE_PROFILES.includes(releaseProfileId)) throw new Error('E_EXPORT_PROMOTION_STATE_INVALID');
  for (const value of [buildId, packageContentId, promotionReceiptSha256]) {
    if (!/^[0-9a-f]{24,64}$/.test(String(value || ''))) throw new Error('E_EXPORT_PROMOTION_STATE_INVALID');
  }
  const next = {
    ...pointerPayload(current),
    activeBuildId: buildId,
    activePackageContentId: packageContentId,
    activeReleaseProfileId: releaseProfileId,
    previousBuildId: current.activeBuildId,
    previousPackageContentId: current.activePackageContentId,
    candidateBuildId: buildId,
    candidatePackageContentId: packageContentId,
    candidateReleaseProfileId: releaseProfileId,
    candidateState: 'PRODUCTION_PROMOTED',
    expectedPreviousPointerSha256: currentSha,
    promotionReceiptSha256,
    pointerMutationPerformed: true,
    promotionEligible: true,
    blockers: [],
  };
  const sealed = { ...next, pointerSha256: pointerDigest(next) };
  atomicWriteJson(pointerFile, sealed);
  const readback = JSON.parse(fs.readFileSync(pointerFile, 'utf8'));
  verifyPointerShape(readback);
  if (readback.pointerSha256 !== sealed.pointerSha256) throw new Error('E_PROMOTION_POINTER_READBACK_MISMATCH');
  return readback;
}

export function blockedReport(reportId, blockers, extra = {}) {
  return {
    schemaVersion: 1,
    patchId: EP03_PATCH_ID,
    reportId,
    status: blockers.length ? 'BLOCKED' : 'PASS',
    verified: blockers.length === 0,
    blockers: [...new Set(blockers)].sort(),
    ...extra,
  };
}
