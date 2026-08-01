import fs from 'node:fs';
import crypto from 'node:crypto';
const file = 'artifacts/runtime/TDT_EXPORT_PROMOTION_POINTER.json';
if (!fs.existsSync(file)) throw new Error('promotion pointer missing');
const p = JSON.parse(fs.readFileSync(file, 'utf8'));
const canonicalize=(value)=>Array.isArray(value)?value.map(canonicalize):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map((key)=>[key,canonicalize(value[key])])):value;
const sha=(value)=>crypto.createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
if (p.pointerId !== 'dadum.export.production-pointer') throw new Error('pointer id mismatch');
if (p.rollbackUnit !== 'whole-build-only') throw new Error('rollback unit mismatch');
if (p.legacyFallbackAllowed !== false || p.perEncoderRollbackAllowed !== false) throw new Error('forbidden rollback fallback');
if (p.candidateState !== 'SOURCE_BAKED_UNPROMOTED' || p.promotionEligible !== false || p.pointerMutationPerformed !== false) throw new Error('source candidate truth mismatch');
if (p.schemaVersion === 2) {
  const { pointerSha256, ...payload } = p;
  if (sha(payload) !== pointerSha256) throw new Error('pointer v2 digest mismatch');
  if (p.activeBuildId !== null || p.activePackageContentId !== null || p.activeReleaseProfileId !== null) throw new Error('source pointer must not activate candidate');
  if (!p.expectedPreviousPointerSha256 || !/^[0-9a-f]{64}$/.test(p.expectedPreviousPointerSha256)) throw new Error('pointer v2 expected previous digest missing');
  console.log('PASS EP03 promotion pointer v2 source truth');
} else if (p.schemaVersion === 1) {
  console.log('PASS EP01 promotion pointer v1 source truth');
} else {
  throw new Error('unsupported pointer schema');
}
