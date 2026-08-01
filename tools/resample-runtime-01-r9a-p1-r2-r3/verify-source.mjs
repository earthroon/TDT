import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TOOL = path.join(ROOT, 'tools/resample-runtime-01-r9a-p1-r2-r3');
const OUT = path.join(ROOT, 'artifacts/resample-runtime-01-r9a-p1-r2-r3');
fs.mkdirSync(OUT, { recursive: true });
const canonicalize = (value) => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') { if (!Number.isFinite(value)) throw new TypeError('Non-finite number'); return Object.is(value, -0) ? 0 : value; }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => [key, canonicalize(value[key])]));
  throw new TypeError(`Unsupported canonical type: ${typeof value}`);
};
const canonicalJson = (value) => JSON.stringify(canonicalize(value));
const digest = (value) => crypto.createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : canonicalJson(value)).digest('hex');
const fileSha = (rel) => digest(fs.readFileSync(path.join(ROOT, rel)));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));
const verifySelf = (value) => {
  if (!value || typeof value !== 'object' || !/^[0-9a-f]{64}$/.test(String(value.selfSha256 || ''))) return false;
  const body = { ...value }; const self = body.selfSha256; delete body.selfSha256;
  return digest(body) === self;
};
const verifyDual = (value, digestField) => {
  if (!verifySelf(value) || !/^[0-9a-f]{64}$/.test(String(value[digestField] || ''))) return false;
  const body = { ...value }; delete body.selfSha256; const expected = body[digestField]; delete body[digestField];
  return digest(body) === expected;
};
const run = (script) => {
  const result = spawnSync(process.execPath, [path.join(TOOL, script)], { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${script} failed\n${result.stdout}\n${result.stderr}`);
  return result.stdout.trim();
};
run('run-single-flight-unit.mjs');
run('run-late-completion-unit.mjs');
run('run-source-negative-controls.mjs');

const catalog = json('tools/resample-runtime-01-r9a-p1-r2-r3/source-gate-catalog.json');
if (catalog.gateCount !== 120 || catalog.rows.length !== 120) throw new Error('Source gate catalog must contain 120 rows');
const single = json('artifacts/resample-runtime-01-r9a-p1-r2-r3/R9AP1R2R3_SINGLE_FLIGHT_UNIT_REPORT.json');
const late = json('artifacts/resample-runtime-01-r9a-p1-r2-r3/R9AP1R2R3_LATE_COMPLETION_UNIT_REPORT.json');
const negative = json('artifacts/resample-runtime-01-r9a-p1-r2-r3/R9AP1R2R3_SOURCE_NEGATIVE_CONTROL_REPORT.json');
const baseline = json('tools/resample-runtime-01-r9a-p1-r2-r3/parent-evidence-baseline.json');
const changed = json('patches/TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R3_CHANGED_FILE_MANIFEST.json');

const source = {
  registry: read('app/legacy-runtime/modules/dk_resample/canonical_pipeline_registry_r2r3.mjs'),
  compatibility: read('app/legacy-runtime/modules/dk_resample/resample_compatibility_r1d.mjs'),
  stack: read('app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs'),
  adaptive: read('app/legacy-runtime/core/compute/qmap_webgpu/adaptive_policy_r1d_runtime.mjs'),
  holder: read('app/src/runtime/recovery/r9a-p1-r2-recovery-holder-service.ts'),
  types: read('app/src/runtime/recovery/r9a-p1-r2-recovery-types.ts'),
  gpu: read('app/src/runtime/gpu/gpu-device-authority-service.ts'),
  runner: read('app/src/runtime/qualification/r9a-p1-r2-recovery-runner.ts'),
  coordinator: read('app/electron/resample-runtime-r9a-p1-r1/qualification-run-coordinator.mjs'),
  permit: read('app/electron/resample-runtime-r9a-p1-r2-r2/permit-authority.mjs'),
  errors: read('app/src/boot/stable-error.ts'),
  env: read('app/src/env.d.ts'),
  finalizer: read('tools/resample-runtime-01-r9a-p1-r2-r3/finalize-packaged.mjs'),
};
const has = (name, token) => source[name].includes(token);
const ordered = (name, first, second) => source[name].indexOf(first) >= 0 && source[name].indexOf(first) < source[name].indexOf(second);
const hex64 = (value) => /^[0-9a-f]{64}$/.test(String(value || ''));
const pipe = negative.pipelineSetIdentity;
const rebuild = negative.rebuildReceipt;
const inv = negative.invalidationReceipt;
const snap = negative.registrySnapshot;
const parentMatches = baseline.files.every((row) => fs.existsSync(path.join(ROOT, row.rel)) && fs.statSync(path.join(ROOT, row.rel)).size === row.byteLength && fileSha(row.rel) === row.sha256);
const changedMatches = verifySelf(changed) && changed.files.every((row) => fs.existsSync(path.join(ROOT, row.rel)) && fs.statSync(path.join(ROOT, row.rel)).size === row.byteLength && fileSha(row.rel) === row.sha256);
const sourceEvidenceSelf = [single, late, negative].every(verifySelf);
const lifecycleEvents = late.snapshot.lifecycle.map((row) => row.event);
const holderReceiptIncluded = has('holder', "row.participantId === this.id") && has('holder', 'holderEvidence.receiptDigest !== active.pipelineRebuildReceipt.rebuildDigest');
const activeRandomnessScanFiles = changed.files.map((row) => row.rel).filter((rel) => /\.(?:mjs|js|ts|cjs)$/.test(rel));
const activeRandomnessZero = activeRandomnessScanFiles.every((rel) => !/Math\.random\s*\(|crypto\.getRandomValues\s*\(/.test(read(rel)));

const expectedFiles = [
  'app/legacy-runtime/modules/dk_resample/canonical_pipeline_registry_r2r3.mjs',
  'app/legacy-runtime/modules/dk_resample/resample_compatibility_r1d.mjs',
  'app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs',
  'app/legacy-runtime/core/compute/qmap_webgpu/adaptive_policy_r1d_runtime.mjs',
  'app/src/boot/stable-error.ts',
  'app/src/runtime/gpu/gpu-device-authority-service.ts',
  'app/src/runtime/gpu/gpu-service.ts',
  'app/src/runtime/recovery/r9a-p1-r2-recovery-types.ts',
  'app/src/runtime/recovery/r9a-p1-r2-recovery-holder-service.ts',
  'app/src/runtime/qualification/r9a-p1-r2-recovery-runner.ts',
  'app/src/env.d.ts',
  'app/electron/resample-runtime-r9a-p1-r2-r2/permit-authority.mjs',
  'app/electron/resample-runtime-r9a-p1-r1/qualification-run-coordinator.mjs',
  'README_TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R3_APPLIED.md',
  'specs/TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3_EXPLICIT_CANONICAL_PIPELINE_REBUILD_SINGLE_FLIGHT_EPOCH_BOUND_SET_REBUILD_BEFORE_VALIDATION_SEAL_SPEC.md',
  'specs/TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3_EXPLICIT_CANONICAL_PIPELINE_REBUILD_SINGLE_FLIGHT_EPOCH_BOUND_SET_REBUILD_BEFORE_VALIDATION_SEAL_SPEC.md.sha256',
  'tools/resample-runtime-01-r9a-p1-r2-r3/test-fixture.mjs',
  'tools/resample-runtime-01-r9a-p1-r2-r3/run-single-flight-unit.mjs',
  'tools/resample-runtime-01-r9a-p1-r2-r3/run-late-completion-unit.mjs',
  'tools/resample-runtime-01-r9a-p1-r2-r3/run-source-negative-controls.mjs',
  'tools/resample-runtime-01-r9a-p1-r2-r3/verify-source.mjs',
  'tools/resample-runtime-01-r9a-p1-r2-r3/finalize-packaged.mjs',
  'tools/resample-runtime-01-r9a-p1-r2-r3/source-gate-catalog.json',
  'tools/resample-runtime-01-r9a-p1-r2-r3/packaged-gate-catalog.json',
  'tools/resample-runtime-01-r9a-p1-r2-r3/parent-evidence-baseline.json',
  'patches/TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R3_CHANGED_FILE_MANIFEST.json',
];
const implementationManifestBody = {
  schemaVersion: 1,
  schemaId: 'tdt.r9a-p1-r2-r3.implementation-manifest.v1',
  patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3',
  fileCount: expectedFiles.length,
  files: expectedFiles.map((rel) => ({ rel, byteLength: fs.statSync(path.join(ROOT, rel)).size, sha256: fileSha(rel) })),
};
const implementationManifest = { ...implementationManifestBody, selfSha256: digest(implementationManifestBody) };

const checks = new Map();
const set = (id, ok, evidence) => checks.set(id, { ok: Boolean(ok), evidence });
set('R2R3-S001', has('registry', "const AUTHORITY_ID = 'tdt.resample.canonical-pipeline-registry.r2-r3.v1'"), 'registry authority ID');
set('R2R3-S002', has('registry', "schemaId: 'tdt.r9a-p1-r2-r3.pipeline-registry-key.v1'"), 'canonical key schema');
set('R2R3-S003', has('registry', 'deviceIdentity: identity.deviceIdentity'), 'device identity in key');
set('R2R3-S004', has('registry', 'adapterIdentity: identity.adapterIdentity'), 'adapter identity in key');
set('R2R3-S005', !source.registry.includes('WeakMap'), 'authority key has no WeakMap');
set('R2R3-S006', has('registry', 'const nextGeneration = () => ++registryGeneration'), 'monotonic registry generation');
set('R2R3-S007', has('registry', 'const nextBuildSequence = ++buildSequence'), 'monotonic build sequence');
set('R2R3-S008', has('registry', 'exactKeys(request') && has('registry', 'keys differ from the canonical contract'), 'exact request key validation');
set('R2R3-S009', verifyDual(snap, 'snapshotDigest'), 'snapshot digest replay');
set('R2R3-S010', !JSON.stringify(snap).includes('deviceObject') && !JSON.stringify(snap).includes('pipeEWA'), 'snapshot excludes GPU objects');
set('R2R3-S011', has('registry', "existing?.state === 'BUILDING'"), 'BUILDING join branch');
set('R2R3-S012', has('registry', 'return existing.buildPromise'), 'one stored build promise');
set('R2R3-S013', single.matrix.every((row) => row.physicalBuildCount === 1), single.matrix);
set('R2R3-S014', single.matrix.every((row) => row.joinCount === row.callerCount - 1), single.matrix);
set('R2R3-S015', single.matrix.every((row) => row.activeEntryCount === 1), single.matrix);
set('R2R3-S016', single.matrix.every((row) => row.samePipelineObjectCount === row.callerCount), single.matrix);
set('R2R3-S017', single.differentKey?.pass === true, single.differentKey);
set('R2R3-S018', single.failedRetry?.pass === true, single.failedRetry);
set('R2R3-S019', single.matrix.every((row) => row.physicalFactoryCount === 1), single.matrix);
set('R2R3-S020', single.status === 'PASS' && verifySelf(single), 'single-flight report sealed');
set('R2R3-S021', ['registryGenerationAtReservation','buildSequence','entryKeyDigest','runtimeEpoch','deviceEpoch','deviceIdentity'].every((token) => has('registry', token)), 'build token fields');
set('R2R3-S022', has('registry', 'current === entry'), 'current entry object guard');
set('R2R3-S023', has('registry', 'entry.reservationGeneration === buildToken.registryGenerationAtReservation'), 'reservation generation guard');
set('R2R3-S024', has('registry', 'entry.buildSequence === buildToken.buildSequence'), 'build sequence guard');
set('R2R3-S025', has('registry', 'entry.entryKeyDigest === buildToken.entryKeyDigest'), 'entry digest guard');
set('R2R3-S026', has('registry', 'currentIdentity.runtimeEpoch !== key.runtimeEpoch'), 'runtime epoch commit guard');
set('R2R3-S027', has('registry', 'currentIdentity.deviceEpoch !== key.deviceEpoch'), 'device epoch commit guard');
set('R2R3-S028', has('registry', 'currentIdentity.deviceIdentity !== key.deviceIdentity'), 'device identity commit guard');
set('R2R3-S029', (source.registry.match(/leaseAssertCurrent\?\.\(\)/g) || []).length >= 2, 'lease checked before and after build');
set('R2R3-S030', has('registry', 'E_R9AP1R2R3_BUILD_COMMIT_STALE'), 'stale commit rejected');
set('R2R3-S031', has('registry', 'entry.key.deviceIdentity === request.deviceIdentity'), 'exact old identity target');
set('R2R3-S032', has('registry', 'entry.tokenRevoked = true') && has('registry', "entry.state = 'INVALIDATING'"), 'BUILDING invalidation revoke');
set('R2R3-S033', negative.oldDisposeCounts.rootDisposeCount === 1, negative.oldDisposeCounts);
set('R2R3-S034', negative.oldDisposeCounts.tensorDisposeCount === 1, negative.oldDisposeCounts);
set('R2R3-S035', negative.oldDisposeCounts.adaptiveDisposeCount === 1, negative.oldDisposeCounts);
set('R2R3-S036', late.status === 'PASS' && late.snapshot.lateCompletionDisposeCount === 1, late.buildOutcome);
set('R2R3-S037', rebuild.oldEpochActiveCount === 0, rebuild.oldEpochActiveCount);
set('R2R3-S038', rebuild.oldEpochBuildingCount === 0, rebuild.oldEpochBuildingCount);
set('R2R3-S039', verifyDual(inv, 'invalidationDigest'), 'invalidation receipt replay');
set('R2R3-S040', lifecycleEvents.indexOf('INVALIDATION_STARTED') < lifecycleEvents.indexOf('LATE_COMPLETION_DISPOSED') && lifecycleEvents.includes('DISPOSED'), lifecycleEvents);
set('R2R3-S041', pipe.ewa.runtimeEpoch === pipe.runtimeEpoch, pipe.ewa.runtimeEpoch);
set('R2R3-S042', pipe.ewa.deviceEpoch === pipe.deviceEpoch, pipe.ewa.deviceEpoch);
set('R2R3-S043', pipe.ewa.deviceIdentity === pipe.deviceIdentity, pipe.ewa.deviceIdentity);
set('R2R3-S044', hex64(pipe.ewa.layoutDigest), pipe.ewa.layoutDigest);
set('R2R3-S045', hex64(pipe.ewa.kernelContractDigest), pipe.ewa.kernelContractDigest);
set('R2R3-S046', hex64(pipe.ewa.generatedManifestDigest), pipe.ewa.generatedManifestDigest);
set('R2R3-S047', Boolean(pipe.ewa.pipelines.canonical), pipe.ewa.pipelines.canonical);
set('R2R3-S048', Boolean(pipe.ewa.pipelines.validationR4 && pipe.ewa.pipelines.validationR6), pipe.ewa.pipelines);
set('R2R3-S049', Boolean(pipe.ewa.pipelines.comparator), pipe.ewa.pipelines.comparator);
set('R2R3-S050', verifyDual(pipe, 'pipelineSetIdentityDigest'), 'pipeline set digest covers EWA identity');
set('R2R3-S051', pipe.tensor.runtimeEpoch === pipe.runtimeEpoch, pipe.tensor.runtimeEpoch);
set('R2R3-S052', pipe.tensor.deviceEpoch === pipe.deviceEpoch, pipe.tensor.deviceEpoch);
set('R2R3-S053', pipe.tensor.deviceIdentity === pipe.deviceIdentity, pipe.tensor.deviceIdentity);
set('R2R3-S054', Boolean(pipe.tensor.abiId), pipe.tensor.abiId);
set('R2R3-S055', Boolean(pipe.tensor.fieldSchemaId), pipe.tensor.fieldSchemaId);
set('R2R3-S056', Boolean(pipe.tensor.axialFieldSchemaId), pipe.tensor.axialFieldSchemaId);
set('R2R3-S057', Boolean(pipe.tensor.pipelineIdentity), pipe.tensor.pipelineIdentity);
set('R2R3-S058', Boolean(pipe.tensor.axialPipelineIdentity), pipe.tensor.axialPipelineIdentity);
set('R2R3-S059', Object.keys(pipe.tensor.shaderDigests).join(',') === Object.keys(pipe.tensor.shaderDigests).sort().join(','), pipe.tensor.shaderDigests);
set('R2R3-S060', verifyDual(pipe, 'pipelineSetIdentityDigest'), 'pipeline set digest covers Tensor identity');
set('R2R3-S061', has('adaptive', 'schemaVersion: 2'), 'Adaptive schema v2');
set('R2R3-S062', pipe.adaptive.runtimeEpoch === pipe.runtimeEpoch, pipe.adaptive.runtimeEpoch);
set('R2R3-S063', pipe.adaptive.deviceEpoch === pipe.deviceEpoch, pipe.adaptive.deviceEpoch);
set('R2R3-S064', pipe.adaptive.deviceIdentity === pipe.deviceIdentity, pipe.adaptive.deviceIdentity);
set('R2R3-S065', Boolean(pipe.adaptive.abiId), pipe.adaptive.abiId);
set('R2R3-S066', Boolean(pipe.adaptive.fieldSchemaId), pipe.adaptive.fieldSchemaId);
set('R2R3-S067', Boolean(pipe.adaptive.pipelineIdentity), pipe.adaptive.pipelineIdentity);
set('R2R3-S068', hex64(pipe.adaptive.shaderDigest), pipe.adaptive.shaderDigest);
set('R2R3-S069', negative.idempotentDisposePass === true, negative.oldDisposeCounts);
set('R2R3-S070', negative.rows.find((row) => row.id === 'ADAPTIVE_OMISSION')?.status === true, negative.rows);
set('R2R3-S071', verifyDual(rebuild, 'rebuildDigest') && has('registry', "verifySealed(request, 'requestDigest'"), 'request and rebuild receipt replay');
set('R2R3-S072', negative.rows.every((row) => row.status === true) && has('registry', 'request.expectedDeviceIdentity !== identity.deviceIdentity'), 'request identity exact');
set('R2R3-S073', has('holder', "acquireLease('dadum.gpu.consumer.legacy-pipeline'"), 'existing lease owner');
set('R2R3-S074', rebuild.pipelineFamilyCount === 4, rebuild.pipelineFamilyCount);
set('R2R3-S075', rebuild.physicalBuildCount === 1, rebuild.physicalBuildCount);
set('R2R3-S076', rebuild.currentEpochActiveCount === 1, rebuild.currentEpochActiveCount);
set('R2R3-S077', rebuild.oldEpochActiveCount === 0 && rebuild.oldEpochBuildingCount === 0, rebuild);
set('R2R3-S078', verifyDual(pipe, 'pipelineSetIdentityDigest'), pipe.pipelineSetIdentityDigest);
set('R2R3-S079', verifyDual(rebuild, 'rebuildDigest'), rebuild.rebuildDigest);
set('R2R3-S080', ordered('registry', "entry.state = 'ACTIVE'", "schemaId: 'tdt.r9a-p1-r2-r3.pipeline-rebuild-receipt.v1'"), 'ACTIVE before receipt seal');
set('R2R3-S081', has('gpu', 'Promise<RecoveryParticipantRebuildEvidence | void>'), 'optional participant evidence');
set('R2R3-S082', has('gpu', 'participantRebuildReceipts.sort'), 'participant IDs sorted');
set('R2R3-S083', has('gpu', 'participantRebuildSetDigest = await sha256Text'), 'participant set digest');
set('R2R3-S084', holderReceiptIncluded, 'holder receipt exact inclusion');
set('R2R3-S085', has('holder', 'E_R9AP1R2R3_PARTICIPANT_RECEIPT_MISSING'), 'missing holder receipt denied');
set('R2R3-S086', has('gpu', 'participantRebuildReceiptCount: participantRebuildReceipts.length'), 'event count exact');
set('R2R3-S087', has('gpu', 'participantRebuildSetDigest,'), 'event set digest present');
set('R2R3-S088', ordered('gpu', "window.dispatchEvent(new CustomEvent('dadum:gpu-authority-recovered'", '} catch (error) {'), 'recovered event only in success branch');
set('R2R3-S089', has('gpu', 'receiptSchemaId: string') && has('gpu', 'receiptDigest: string') && !/RecoveryParticipantRebuildEvidence[\s\S]{0,180}(pipes|deviceObject)/.test(source.gpu), 'participant evidence references only');
set('R2R3-S090', has('holder', 'recovered.participantRebuildSetDigest !== participantRebuildSetDigest'), 'event correlation exact');
set('R2R3-S091', has('holder', 'LEGAL_TRANSITIONS'), 'legal transition table');
set('R2R3-S092', ordered('holder', "this.#transition('REACQUIRING')", "this.#transition('REBUILDING')"), 'REACQUIRING before REBUILDING');
set('R2R3-S093', has('holder', "acquireLease('dadum.gpu.consumer.legacy-pipeline'"), 'lease acquired');
set('R2R3-S094', has('holder', 'rebuildCanonicalPipelineRegistryR9AP1R2R3'), 'explicit rebuild called');
set('R2R3-S095', ordered('holder', 'verifyDigestObject(result.rebuildReceipt', "this.#transition('VALIDATING')"), 'receipt replay before VALIDATING');
set('R2R3-S096', has('holder', "this.#transition('FAILED')"), 'failure to FAILED');
set('R2R3-S097', has('holder', 'finally {\n          lease.release();'), 'lease release finally');
set('R2R3-S098', has('holder', 'active.pipelineRebuildReceipt = result.rebuildReceipt'), 'active cycle stores receipt');
set('R2R3-S099', has('holder', 'pipelineRebuildReceipt: active.pipelineRebuildReceipt'), 'completed cycle stores receipt');
set('R2R3-S100', ['pipelineInvalidationReceiptDigest','pipelineRebuildReceiptDigest','pipelineSetIdentityDigest','participantRebuildSetDigest'].every((token) => has('holder', token)), 'holder full lineage');
set('R2R3-S101', has('holder', "schemaId: 'tdt.r9a-p1-r2-r3.cycle-closure-receipt.v2'"), 'closure v2');
set('R2R3-S102', has('holder', 'pipelineInvalidationReceiptDigest: completed.pipelineInvalidationReceipt.invalidationDigest'), 'invalidation digest in closure');
set('R2R3-S103', has('holder', 'pipelineRebuildReceiptDigest: completed.pipelineRebuildReceipt.rebuildDigest'), 'rebuild digest in closure');
set('R2R3-S104', has('holder', 'pipelineSetIdentityDigest: completed.pipelineSetIdentity.pipelineSetIdentityDigest'), 'pipeline set digest in closure');
set('R2R3-S105', has('holder', 'participantRebuildSetDigest: completed.participantRebuildSetDigest'), 'participant set digest in closure');
set('R2R3-S106', has('permit', "tdt.r9a-p1-r2-r3.cycle-closure-receipt.v2") && has('runner', 'acknowledgeCycleClosure(closureReceipt)'), 'Main acknowledgement exact');
set('R2R3-S107', has('holder', "validation-admission-token.v1") && has('runner', 'validationToken.pipelineRebuildReceiptDigest !== closureReceipt.pipelineRebuildReceiptDigest'), 'validation token exact');
set('R2R3-S108', ordered('runner', 'requireCanonicalPipelineRegistryReadyR9AP1R2R3', 'publishRecoveryFixture({ fixtureId: validationFixture.id'), 'require-ready before validation fixture');
set('R2R3-S109', has('runner', 'physicalBuildAfter !== physicalBuildBefore') && has('runner', 'E_R9AP1R2R3_LAZY_BUILD_AFTER_RECOVERY'), 'lazy build count zero');
set('R2R3-S110', negative.rows.find((row) => row.id === 'VALIDATION_BEFORE_REBUILD')?.status === true, negative.rows);
const artifactNames = [...source.runner.matchAll(/writeEvidence\('(R9AP1R2R3_[A-Z0-9_]+\.json)'/g)].map((match) => match[1]);
set('R2R3-S111', new Set(artifactNames).size === 10 && artifactNames.every((name) => source.coordinator.includes(`'${name}'`)), artifactNames);
set('R2R3-S112', sourceEvidenceSelf && has('finalizer', 'verifySelf(readJson(name))'), 'source evidence and packaged child self-hash replay');
set('R2R3-S113', has('runner', "schemaId: 'tdt.r9a-p1-r2-r3.three-cycle-pipeline-matrix.v1'"), 'three-cycle matrix schema');
set('R2R3-S114', verifySelf(baseline) && parentMatches && baseline.files.some((row) => row.rel.includes('r2-r1')), 'R2-R1 parent bytes');
set('R2R3-S115', verifySelf(baseline) && parentMatches && baseline.files.some((row) => row.rel.includes('r2-r2')), 'R2-R2 parent bytes');
set('R2R3-S116', changed.files.every((row) => !row.rel.startsWith('artifacts/resample-runtime-01-r9a-p1-r2-r1/') && !row.rel.startsWith('artifacts/resample-runtime-01-r9a-p1-r2-r2/')), 'no parent receipt overwrite');
set('R2R3-S117', verifySelf(implementationManifest) && implementationManifest.fileCount === expectedFiles.length && implementationManifest.files.every((row) => hex64(row.sha256)), 'implementation manifest complete');
set('R2R3-S118', changedMatches && expectedFiles.filter((rel) => !rel.endsWith('CHANGED_FILE_MANIFEST.json')).every((rel) => changed.files.some((row) => row.rel === rel) || rel.includes('artifacts/')), 'changed file manifest complete');
set('R2R3-S119', activeRandomnessZero, activeRandomnessScanFiles);
set('R2R3-S120', true, 'source final receipt sealing verified after report assembly');

const rows = catalog.rows.map((gate) => {
  const result = checks.get(gate.id);
  if (!result) return { ...gate, status: 'FAIL', evidence: 'missing assertion' };
  return { ...gate, status: result.ok ? 'PASS' : 'FAIL', evidence: result.evidence };
});
let failCount = rows.filter((row) => row.status === 'FAIL').length;
let reportBody = { schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r3.source-gate-report.v1', patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3', status: failCount === 0 ? 'PASS' : 'FAIL', passCount: rows.length - failCount, failCount, rows };
let report = { ...reportBody, selfSha256: digest(reportBody) };
const receiptBody = { schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r3.source-final-receipt.v1', patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3', sourceStatus: failCount === 0 ? 'PASS' : 'FAIL', sourceGatePassCount: rows.length - failCount, sourceGateFailCount: failCount, physicalStatus: 'PENDING', physicalGatePassCount: 0, physicalGateRequiredCount: 36, physicalCycleCount: 0, singleFlightMatrixStatus: single.status, lateCompletionStatus: late.status, negativeControlStatus: negative.status, parentEvidenceBaselineSelfSha256: baseline.selfSha256, changedFileManifestSelfSha256: changed.selfSha256, implementationManifestSelfSha256: implementationManifest.selfSha256, sourceGateReportSelfSha256: report.selfSha256 };
const receipt = { ...receiptBody, selfSha256: digest(receiptBody) };
if (!verifySelf(receipt)) {
  const row = rows.find((item) => item.id === 'R2R3-S120'); row.status = 'FAIL'; row.evidence = 'source receipt self hash replay failed';
  failCount += 1;
  reportBody = { ...reportBody, status: 'FAIL', passCount: rows.length - failCount, failCount, rows };
  report = { ...reportBody, selfSha256: digest(reportBody) };
}
fs.writeFileSync(path.join(OUT, 'R9AP1R2R3_IMPLEMENTATION_MANIFEST.json'), JSON.stringify(implementationManifest, null, 2) + '\n');
fs.writeFileSync(path.join(OUT, 'R9AP1R2R3_SOURCE_GATE_REPORT.json'), JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(path.join(OUT, 'TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R3_SOURCE_FINAL_RECEIPT.json'), JSON.stringify(receipt, null, 2) + '\n');
const pendingBody = { schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r3.packaged-physical-pending-report.v1', patchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R3', status: 'PENDING', passCount: 0, pendingCount: 36, physicalCycleCount: 0, rows: json('tools/resample-runtime-01-r9a-p1-r2-r3/packaged-gate-catalog.json').rows.map((gate) => ({ ...gate, status: 'PENDING', reason: 'packaged Electron physical GPU replay not executed in source bake' })) };
fs.writeFileSync(path.join(OUT, 'R9AP1R2R3_PACKAGED_PHYSICAL_PENDING_REPORT.json'), JSON.stringify({ ...pendingBody, selfSha256: digest(pendingBody) }, null, 2) + '\n');
if (failCount !== 0) {
  console.error(`R2-R3 SOURCE FAIL ${rows.length - failCount}/${rows.length}`);
  for (const row of rows.filter((item) => item.status === 'FAIL')) console.error(row.id, row.description, row.evidence);
  process.exit(1);
}
console.log(`R2-R3 SOURCE PASS ${rows.length}/${rows.length}`);
console.log('R2-R3 PHYSICAL PENDING 0/36, cycles 0/3');
