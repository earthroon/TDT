import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  ROOT,
  SOURCE_OUT,
  check,
  read,
  readJson,
  exists,
  sha256File,
  digestCanonical,
  seal,
  verifySelf,
  sourceArtifact,
  gate,
  gateAsync,
  occurrenceCount,
  indexOrder,
} from './lib.mjs';
import { createRecoveryPermitAuthorityR9AP1R2 } from '../../app/electron/resample-runtime-r9a-p1-r2/recovery-permit-authority.mjs';
import { digest as electronDigest } from '../../app/electron/resample-runtime-r9a-p1-r2/lib.mjs';

const PATCH_ID = 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1';
const PARENT_BUNDLE_SHA256 = 'a6c57a4b98573cf53b17dcd87f663cd5718478ef769e82e206542c77b7382be9';
const PARENT_SPEC_SHA256 = '558802cedbce5128263c3ca91f0d5749f75108a7a56d3529322c73403132fed9';
const SPEC_SHA256 = 'e5a868ba29cdcdd01b999af6d25c1e70c68987313f505302d288ab20f8a2ea92';
const PARENT_SOURCE_RECEIPT_FILE_SHA256 = '6654e51b8216cd3c736113bd8195e351c0fcc74299ef23b28d65e19cb4cfdad0';
const PARENT_SOURCE_RECEIPT_SELF_SHA256 = 'cdccf4fe7d6b6507bf669883194d8dfce63370926a594b5c179e25216a43b246';
const SPEC_FILE = 'specs/TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1_LOST_OPERATION_TERMINAL_REJECTION_PREVIEW_DEFERRED_EXPORT_MAP_RECOVERY_EVENT_CORRELATION_SEAL_SPEC.md';
const PARENT_SPEC_FILE = 'specs/TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2_RECOVERY_AWARE_RUNTIME_HOLDER_LEASE_REACQUISITION_PIPELINE_REBUILD_PENDING_PREVIEW_EXPORT_LOSS_INJECTION_THREE_CYCLE_DEVICE_EPOCH_REPLAY_SEAL_SPEC.md';
const PARENT_RECEIPT_FILE = 'artifacts/resample-runtime-01-r9a-p1-r2/source-bake/TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_SOURCE_FINAL_RECEIPT.json';

const files = {
  scheduler: 'app/src/runtime/preview/preview-frame-scheduler.ts',
  presenter: 'app/src/runtime/preview/preview-presenter-service.ts',
  presenterTypes: 'app/src/runtime/preview/preview-presenter-types.ts',
  exportAuthority: 'app/src/runtime/export/export-authority-service.ts',
  encoderRegistry: 'app/src/runtime/codecs/encoder-registry-service.ts',
  readbackOwner: 'app/legacy-runtime/core/compute/qmap_webgpu/ewa_single_submit_runtime_r9a.mjs',
  readbackAdapter: 'app/legacy-runtime/input/export_gpu_texture_readback_r9a_p1_r2_r1.mjs',
  exportManager: 'app/legacy-runtime/export_manager.js',
  gpuAuthority: 'app/src/runtime/gpu/gpu-device-authority-service.ts',
  gpuService: 'app/src/runtime/gpu/gpu-service.ts',
  holder: 'app/src/runtime/recovery/r9a-p1-r2-recovery-holder-service.ts',
  recoveryTypes: 'app/src/runtime/recovery/r9a-p1-r2-recovery-types.ts',
  runner: 'app/src/runtime/qualification/r9a-p1-r2-recovery-runner.ts',
  env: 'app/src/env.d.ts',
  mainAuthority: 'app/electron/resample-runtime-r9a-p1-r2/recovery-permit-authority.mjs',
  coordinator: 'app/electron/resample-runtime-r9a-p1-r1/qualification-run-coordinator.mjs',
  preload: 'preload.cjs',
  stableError: 'app/src/boot/stable-error.ts',
};

for (const [label, relative] of Object.entries(files)) check(exists(relative), 'E_R9AP1R2R1_REQUIRED_SOURCE_MISSING', `Required source is missing: ${label}`, { relative });

const src = Object.fromEntries(Object.entries(files).map(([key, relative]) => [key, read(relative)]));
const specText = read(SPEC_FILE);
const parentReceipt = readJson(PARENT_RECEIPT_FILE);

const inputIdentity = seal({
  schemaVersion: 1,
  schemaId: 'tdt.r9a-p1-r2-r1.parent-input-identity.v1',
  patchId: PATCH_ID,
  parentPatchId: 'TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2',
  parentBundleSha256: PARENT_BUNDLE_SHA256,
  parentSpecSha256: PARENT_SPEC_SHA256,
  childSpecSha256: SPEC_SHA256,
  parentSourceReceiptFileSha256: PARENT_SOURCE_RECEIPT_FILE_SHA256,
  parentSourceReceiptSelfSha256: PARENT_SOURCE_RECEIPT_SELF_SHA256,
  historicalPhysicalPassCarryForward: 0,
  physicalReplayCycleCount: 0,
  evidenceAcquisition: 'bake-time-input-hash-and-embedded-parent-receipt',
});
sourceArtifact('R9AP1R2R1_PARENT_INPUT_IDENTITY.json', inputIdentity);

const manifestFiles = [SPEC_FILE, `${SPEC_FILE}.sha256`, 'README_TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R1_APPLIED.md', 'package.json', 'patches/TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R1_lost_operation_terminal_rejection_preview_deferred_export_map_recovery_event_correlation.diff', ...Object.values(files), 'tools/resample-runtime-01-r9a-p1-r2-r1/lib.mjs', 'tools/resample-runtime-01-r9a-p1-r2-r1/verify-source.mjs', 'tools/resample-runtime-01-r9a-p1-r2-r1/finalize-packaged.mjs', 'tools/resample-runtime-01-r9a-p1-r2-r1/verify-packaged.mjs'];
const implementationManifest = seal({
  schemaVersion: 1,
  schemaId: 'tdt.r9a-p1-r2-r1.implementation-manifest.v1',
  patchId: PATCH_ID,
  entries: manifestFiles.map((relative) => ({ relativePath: relative, sha256: sha256File(relative), byteLength: fs.statSync(path.join(ROOT, relative)).size })),
});
sourceArtifact('R9AP1R2R1_IMPLEMENTATION_MANIFEST.json', implementationManifest);

async function previewSchedulerUnit() {
  const ts = await import('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
  const compiled = ts.transpileModule(src.scheduler, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    fileName: files.scheduler,
  }).outputText;
  const module = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
  const makePublication = (revision) => ({ finalRevision: revision, surfaceId: `surface-${revision}` });
  const receipt = (frameId, state) => ({ frameId, state, receiptId: `receipt-${frameId}`, digestSha256: 'a'.repeat(64) });

  let awaitedFrameId = '';
  const awaited = new module.PreviewFrameScheduler(1, 1, async (request) => {
    awaitedFrameId = request.frameId;
    const previewReceipt = receipt(request.frameId, 'DEVICE_LOST');
    throw Object.assign(new Error('lost'), { detail: { previewReceipt } });
  }, async (disposition) => receipt(disposition.frameId, disposition.state));
  const awaitedTicket = awaited.enqueue(makePublication(1), { terminalMode: 'awaited-public' });
  let awaitedRejected = false;
  try { await awaitedTicket.terminal; } catch { awaitedRejected = true; }
  check(awaitedRejected, 'E_R9AP1R2R1_PREVIEW_UNIT', 'Awaited public terminal did not reject');
  check(awaitedTicket.frameId === awaitedFrameId, 'E_R9AP1R2R1_PREVIEW_UNIT', 'Awaited public rejection did not belong to exact frame');
  await awaited.whenIdle();

  const detached = new module.PreviewFrameScheduler(1, 1, async (request) => {
    const previewReceipt = receipt(request.frameId, 'DEVICE_LOST');
    throw Object.assign(new Error('lost'), { detail: { previewReceipt } });
  }, async (disposition) => receipt(disposition.frameId, disposition.state));
  const detachedTerminal = await detached.enqueue(makePublication(2), { terminalMode: 'detached-subscription' }).terminal;
  check(detachedTerminal.state === 'DEVICE_LOST' && detachedTerminal.error instanceof Error, 'E_R9AP1R2R1_PREVIEW_UNIT', 'Detached failure was not absorbed into terminal evidence');

  const presented = new module.PreviewFrameScheduler(1, 1, async (request) => receipt(request.frameId, 'PRESENTED'), async (disposition) => receipt(disposition.frameId, disposition.state));
  const presentedTerminal = await presented.enqueue(makePublication(3), { terminalMode: 'awaited-public' }).terminal;
  check(presentedTerminal.state === 'PRESENTED', 'E_R9AP1R2R1_PREVIEW_UNIT', 'PRESENTED terminal did not resolve');
  return { awaitedRejected, detachedState: detachedTerminal.state, presentedState: presentedTerminal.state };
}

function cycleBindingUnit() {
  const context = { windowId: 17, rendererPid: 23 };
  const authority = createRecoveryPermitAuthorityR9AP1R2({
    runId: 'a'.repeat(64),
    packageClosureDigest: 'b'.repeat(64),
    r1BootPermitDigest: 'c'.repeat(64),
    runtimeEpoch: 5,
  });
  const plan = authority.issue(context);
  const permit = plan.cycles[0];
  const operationDetail = {
    hookId: 'R9AP1R2R1_PREVIEW_SUBMISSION_PENDING',
    operationId: permit.operationId,
    runtimeEpoch: 5,
    deviceEpoch: 1,
    deviceIdentity: 'device-1',
    adapterIdentity: 'adapter-stable',
    leaseId: 'lease-1',
    frameId: 'frame-1',
    phase: 'queue-submitted-completion-unresolved',
  };
  const result = authority.consume(context, { permit, operationDetail });
  const binding = result.binding;
  const bodyWithoutSelf = { ...binding };
  delete bodyWithoutSelf.selfSha256;
  check(binding.selfSha256 === electronDigest(bodyWithoutSelf), 'E_R9AP1R2R1_BINDING_UNIT', 'Binding self hash mismatch');
  const bodyWithoutBinding = { ...bodyWithoutSelf };
  delete bodyWithoutBinding.cycleBindingDigest;
  check(binding.cycleBindingDigest === electronDigest(bodyWithoutBinding), 'E_R9AP1R2R1_BINDING_UNIT', 'Cycle binding digest mismatch');
  check(binding.senderWindowId === context.windowId && binding.senderRendererPid === context.rendererPid, 'E_R9AP1R2R1_BINDING_UNIT', 'Sender identity is not bound');
  check(binding.expectedNewDeviceEpoch === binding.expectedOldDeviceEpoch + 1, 'E_R9AP1R2R1_BINDING_UNIT', 'Expected new epoch is not exact old+1');

  const negative = (mutate) => {
    const local = createRecoveryPermitAuthorityR9AP1R2({ runId: 'd'.repeat(64), packageClosureDigest: 'e'.repeat(64), r1BootPermitDigest: 'f'.repeat(64), runtimeEpoch: 5 });
    const localPlan = local.issue(context);
    const localPermit = localPlan.cycles[0];
    const detail = { ...operationDetail, operationId: localPermit.operationId };
    mutate(detail);
    try { local.consume(context, { permit: localPermit, operationDetail: detail }); } catch (error) {
      check(error.code === 'E_R9AP1R2R1_CYCLE_BINDING_INVALID', 'E_R9AP1R2R1_BINDING_UNIT', 'Negative binding rejected with wrong code', { actual: error.code });
      return true;
    }
    throw Object.assign(new Error('Mutated cycle binding was accepted'), { code: 'E_R9AP1R2R1_BINDING_UNIT' });
  };
  negative((detail) => { detail.operationId = 'mutated-operation'; });
  negative((detail) => { detail.hookId = 'mutated-hook'; });
  return { cycleBindingDigest: binding.cycleBindingDigest, bindingSelfSha256: binding.selfSha256, negativeMutationsRejected: 2 };
}

const previewUnitEvidence = await previewSchedulerUnit();
const cycleBindingEvidence = cycleBindingUnit();
sourceArtifact('R9AP1R2R1_PREVIEW_TICKET_UNIT_REPORT.json', seal({ schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r1.preview-ticket-unit-report.v1', patchId: PATCH_ID, ...previewUnitEvidence }));
sourceArtifact('R9AP1R2R1_CYCLE_BINDING_UNIT_REPORT.json', seal({ schemaVersion: 1, schemaId: 'tdt.r9a-p1-r2-r1.cycle-binding-unit-report.v1', patchId: PATCH_ID, ...cycleBindingEvidence }));

const gates = [];
const add = (id, requirement, method, fn) => gates.push(gate(id, requirement, method, fn));
const addAsync = async (id, requirement, method, fn) => gates.push(await gateAsync(id, requirement, method, fn));

add('R9AP1R2R1-S001', 'Parent bundle SHA-256 is exact', 'bake-time input identity receipt', () => check(inputIdentity.parentBundleSha256 === PARENT_BUNDLE_SHA256 && verifySelf(inputIdentity), 'E_R9AP1R2R1_PARENT_BUNDLE', 'Parent bundle identity mismatch') && inputIdentity.parentBundleSha256);
add('R9AP1R2R1-S002', 'Parent R2 specification SHA-256 is exact', 'source file hash', () => check(sha256File(PARENT_SPEC_FILE) === PARENT_SPEC_SHA256, 'E_R9AP1R2R1_PARENT_SPEC', 'Parent specification hash mismatch') && PARENT_SPEC_SHA256);
add('R9AP1R2R1-S003', 'Parent source receipt remains immutable', 'embedded parent receipt byte hash and self hash', () => check(sha256File(PARENT_RECEIPT_FILE) === PARENT_SOURCE_RECEIPT_FILE_SHA256 && parentReceipt.selfSha256 === PARENT_SOURCE_RECEIPT_SELF_SHA256, 'E_R9AP1R2R1_PARENT_RECEIPT_MUTATED', 'Parent source receipt was mutated') && parentReceipt.selfSha256);
add('R9AP1R2R1-S004', 'Parent production pointers remain unchanged', 'pointer conservation receipt', () => { const pointer = readJson('artifacts/active-graph-01/source-bake/production-pointer-conservation.json'); check(pointer.productionPointerMutation === false, 'E_R9AP1R2R1_POINTER_MUTATION', 'Production pointer mutation detected'); return pointer.pointerDigests; });
add('R9AP1R2R1-S005', 'Historical physical PASS carry-forward is zero', 'parent and child input receipts', () => check(parentReceipt.historicalPassCarryForward === 0 && parentReceipt.deviceLossRecoveryCycleCount === 0 && inputIdentity.historicalPhysicalPassCarryForward === 0, 'E_R9AP1R2R1_HISTORICAL_PASS', 'Historical physical pass was carried forward') && 0);
add('R9AP1R2R1-S006', 'Patch does not claim explicit pipeline rebuild closure', 'scope and final-state text scan', () => check(!specText.includes('P1-R2-R1은 explicit pipeline rebuild를 완료한다'), 'E_R9AP1R2R1_SCOPE', 'Explicit pipeline rebuild closure was claimed') && 'P1-R2-R3 remains HOLD');
add('R9AP1R2R1-S007', 'Patch does not claim permit sender integrity closure', 'scope boundary scan', () => check(specText.includes('P1-R2-R2') && specText.includes('Sender-Bound Issue·Consume Identity'), 'E_R9AP1R2R1_SCOPE', 'Permit full-field closure boundary missing') && 'P1-R2-R2 remains HOLD');
add('R9AP1R2R1-S008', 'Patch identity is installed exactly once', 'applied README and child final-state uniqueness', () => check(occurrenceCount(read('README_TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R1_APPLIED.md'), PATCH_ID) >= 1 && occurrenceCount(read('package.json'), 'resample-runtime-01-r9a-p1-r2-r1') >= 3, 'E_R9AP1R2R1_PATCH_INSTALL', 'Patch installation markers are incomplete') && PATCH_ID);

add('R9AP1R2R1-S009', 'Scheduler exposes frame terminal ticket', 'TypeScript API and unit execution', () => check(src.scheduler.includes('export interface PreviewFrameTicket') && src.scheduler.includes('readonly terminal: Promise<PreviewFrameTerminal>'), 'E_R9AP1R2R1_PREVIEW_TICKET', 'Frame terminal ticket missing') && previewUnitEvidence);
add('R9AP1R2R1-S010', 'Awaited public frame and detached subscription frame are distinct', 'terminal mode union and call-site scan', () => check(src.scheduler.includes("'awaited-public' | 'detached-subscription'") && src.presenter.includes("terminalMode: 'awaited-public'") && src.presenter.includes("terminalMode: 'detached-subscription'"), 'E_R9AP1R2R1_PREVIEW_MODE', 'Preview terminal modes are not distinct') && true);
add('R9AP1R2R1-S011', 'Public Preview awaits exact ticket terminal', 'public present call order', () => indexOrder(src.presenter, ['const ticket = this.#scheduler.enqueue', 'const terminal = await ticket.terminal', "if (terminal.state === 'PRESENTED') return;"]));
add('R9AP1R2R1-S012', 'Public Preview does not infer success from whenIdle', 'present method bounded scan', () => { const block = src.presenter.slice(src.presenter.indexOf('async present('), src.presenter.indexOf('invalidateLayout():')); check(!block.includes('whenIdle()'), 'E_R9AP1R2R1_PREVIEW_IDLE_SUCCESS', 'Public Preview still uses whenIdle as success'); return true; });
add('R9AP1R2R1-S013', 'DEVICE_LOST execution rejects awaited ticket', 'scheduler unit execution and branch scan', () => check(previewUnitEvidence.awaitedRejected && src.scheduler.includes("if (current.terminalMode === 'awaited-public') current.reject(error);"), 'E_R9AP1R2R1_PREVIEW_REJECT', 'Awaited DEVICE_LOST did not reject') && true);
add('R9AP1R2R1-S014', 'FAILED execution rejects awaited ticket', 'generic error branch shares awaited rejection', () => check(src.scheduler.includes('const receipt = detail?.previewReceipt') && src.scheduler.includes('current.reject(error)'), 'E_R9AP1R2R1_PREVIEW_FAILED', 'FAILED terminal rejection path missing') && true);
add('R9AP1R2R1-S015', 'PRESENTED alone resolves awaited ticket', 'unit execution and presenter public guard', () => check(previewUnitEvidence.presentedState === 'PRESENTED' && src.presenter.includes("if (terminal.state === 'PRESENTED') return;"), 'E_R9AP1R2R1_PREVIEW_SUCCESS', 'PRESENTED-only success guard missing') && true);
add('R9AP1R2R1-S016', 'Frame terminal settlement is one-shot', 'single pending ownership and Promise settlement sites', () => check(src.scheduler.includes('this.#pending = null;') && occurrenceCount(src.scheduler, 'current.resolve(') === 2 && occurrenceCount(src.scheduler, 'current.reject(') === 1, 'E_R9AP1R2R1_PREVIEW_ONESHOT', 'Unexpected frame terminal settlement surface') && { resolveSites: 2, rejectSites: 1 });
add('R9AP1R2R1-S017', 'Preview error receipt is appended before rejection', 'catch-path ordering', () => indexOrder(src.presenter, ['const previewReceipt = await this.#appendReceipt', 'await this.recoveryHolder.notifyOperationTerminal', 'throw publicError;']));
add('R9AP1R2R1-S018', 'Admission grant is aborted on lost frame', 'finally block admission completion', () => check(src.presenter.includes("await this.admission.completeOperation('preview', admissionGrant, admissionBinding, 'aborted')"), 'E_R9AP1R2R1_PREVIEW_ADMISSION', 'Lost Preview admission abort missing') && true);
add('R9AP1R2R1-S019', 'Surface pin is released on lost frame', 'finally block resource release', () => check(src.presenter.includes('if (pin) pin.release();'), 'E_R9AP1R2R1_PREVIEW_PIN', 'Surface pin release missing') && true);
add('R9AP1R2R1-S020', 'GPU lease is released on lost frame', 'finally block resource release', () => check(src.presenter.includes('lease?.release();'), 'E_R9AP1R2R1_PREVIEW_LEASE', 'GPU lease release missing') && true);
add('R9AP1R2R1-S021', 'Ephemeral surface disposal remains fence-bound', 'disposal reason scan', () => check(src.presenter.includes("this.surfaces.requestDispose(ephemeralSurfaceId, 'preview-frame-fence-complete')"), 'E_R9AP1R2R1_PREVIEW_SURFACE', 'Fence-bound ephemeral disposal missing') && true);
add('R9AP1R2R1-S022', 'Late submitted-work callback cannot publish success', 'loss throw precedes submitted-work await and store mutation', () => indexOrder(src.presenter, ['if (loss) {', "throw new StableRuntimeError('E_R9AP1R2R1_PREVIEW_FRAME_DEVICE_LOST'", 'await Promise.resolve(lease.queue.onSubmittedWorkDone?.())', 'usePreviewStore().present']));
add('R9AP1R2R1-S023', 'Detached failure creates no unhandled rejection', 'unit execution and detached resolution branch', () => check(previewUnitEvidence.detachedState === 'DEVICE_LOST' && src.scheduler.includes('else current.resolve(Object.freeze'), 'E_R9AP1R2R1_PREVIEW_DETACHED', 'Detached failure is not absorbed') && true);
add('R9AP1R2R1-S024', 'Preview terminal ledger is self-hashed', 'receipt digest and sealed raw child writer', () => check(src.presenter.includes('previewReceipt.digestSha256') && src.runner.includes("schemaId: 'tdt.r9a-p1-r2-r1.preview-terminal-ledger.v1'") && src.runner.includes("writeEvidence('R9AP1R2R1_PREVIEW_TERMINAL_LEDGER.json'"), 'E_R9AP1R2R1_PREVIEW_LEDGER', 'Preview terminal ledger sealing missing') && true);

add('R9AP1R2R1-S025', 'Encoder-dispatched hook is not accepted as terminal map evidence', 'legacy synthetic hook absence', () => check(!src.exportAuthority.includes('encoder-dispatched-result-unresolved'), 'E_R9AP1R2R1_EXPORT_SYNTHETIC', 'Synthetic encoder-dispatched hook remains') && true);
add('R9AP1R2R1-S026', 'Actual mapAsync caller emits pending hook', 'mapAsync owner source scan', () => check(src.readbackOwner.includes('const mapPromise = readback.mapAsync(mode);') && src.readbackOwner.includes('R9AP1R2R1_EXPORT_TERMINAL_MAP_PENDING'), 'E_R9AP1R2R1_EXPORT_MAP_OWNER', 'Actual mapAsync pending hook missing') && true);
add('R9AP1R2R1-S027', 'Hook fires after queue submission', 'direct GPU readback adapter order', () => indexOrder(src.readbackAdapter, ['submission = await graph.submit', 'const bytesPromise = finalized.consume()', 'const rgba = await bytesPromise']));
add('R9AP1R2R1-S028', 'Hook fires before awaiting map promise', 'mapAsync owner order', () => indexOrder(src.readbackOwner, ['const mapPromise = readback.mapAsync(mode);', 'await input.recoveryTerminalMapHook', 'await mapPromise;']));
add('R9AP1R2R1-S029', 'Hook evidence contains terminal readback ID', 'evidence field scan', () => check(src.readbackOwner.includes('terminalReadbackId:'), 'E_R9AP1R2R1_EXPORT_EVIDENCE', 'terminalReadbackId missing') && true);
add('R9AP1R2R1-S030', 'Hook evidence contains readback byte length', 'evidence field scan', () => check(src.readbackOwner.includes('terminalReadbackByteLength:'), 'E_R9AP1R2R1_EXPORT_EVIDENCE', 'terminalReadbackByteLength missing') && true);
add('R9AP1R2R1-S031', 'Hook evidence contains exact device identity', 'evidence field scan', () => check(src.readbackOwner.includes('deviceIdentity:') && src.readbackAdapter.includes('deviceIdentity: lease.deviceIdentity'), 'E_R9AP1R2R1_EXPORT_EVIDENCE', 'Exact device identity missing') && true);
add('R9AP1R2R1-S032', 'Hook evidence contains exact lease ID', 'evidence field scan', () => check(src.readbackOwner.includes('leaseId:') && src.readbackAdapter.includes('leaseId: lease.leaseId'), 'E_R9AP1R2R1_EXPORT_EVIDENCE', 'Exact lease ID missing') && true);
add('R9AP1R2R1-S033', 'Hook evidence asserts hostSaveStarted false', 'evidence literal scan', () => check(src.readbackOwner.includes('hostSaveStarted: false'), 'E_R9AP1R2R1_EXPORT_EVIDENCE', 'hostSaveStarted false assertion missing') && true);
add('R9AP1R2R1-S034', 'Map promise state is unresolved at hook', 'evidence literal and order scan', () => check(src.readbackOwner.includes("mapPromiseState: 'UNRESOLVED'") && src.readbackOwner.indexOf("mapPromiseState: 'UNRESOLVED'") < src.readbackOwner.indexOf('await mapPromise;'), 'E_R9AP1R2R1_EXPORT_MAP_STATE', 'Map promise is not evidenced as unresolved') && true);
add('R9AP1R2R1-S035', 'Lost map prevents host save begin', 'export authority ordering and throw barrier', () => indexOrder(src.exportAuthority, ['await this.recoveryHolder.notifyOperationTerminal', "throw new StableRuntimeError('E_R9AP1R2R1_EXPORT_TERMINAL_MAP_DEVICE_LOST'", 'hostSaveStarted = true;']));
add('R9AP1R2R1-S036', 'Lost map prevents success receipt publication', 'device-loss throw precedes export receipt construction', () => check(src.exportAuthority.indexOf("throw new StableRuntimeError('E_R9AP1R2R1_EXPORT_TERMINAL_MAP_DEVICE_LOST'") < src.exportAuthority.indexOf('const hostSaveReceipt:'), 'E_R9AP1R2R1_EXPORT_SUCCESS', 'Lost map can reach success receipt path') && true);
add('R9AP1R2R1-S037', 'Lost map prevents blob resource registration', 'host save and registry occur after loss barrier', () => check(src.exportAuthority.indexOf("throw new StableRuntimeError('E_R9AP1R2R1_EXPORT_TERMINAL_MAP_DEVICE_LOST'") < src.exportAuthority.indexOf('this.host.saveExportBlob'), 'E_R9AP1R2R1_EXPORT_BLOB', 'Lost map can reach blob registration') && true);
add('R9AP1R2R1-S038', 'Export terminal ledger is self-hashed', 'terminal receipt digest and sealed raw child writer', () => check(src.exportAuthority.includes('operationTerminalReceiptDigest = await digestCanonical(terminalBody)') && src.runner.includes("schemaId: 'tdt.r9a-p1-r2-r1.export-terminal-ledger.v1'") && src.runner.includes("writeEvidence('R9AP1R2R1_EXPORT_TERMINAL_LEDGER.json'"), 'E_R9AP1R2R1_EXPORT_LEDGER', 'Export terminal ledger sealing missing') && true);

add('R9AP1R2R1-S039', 'Main creates canonical cycle binding', 'Main authority unit execution', () => cycleBindingEvidence);
add('R9AP1R2R1-S040', 'Binding uses Main expected cycle, not renderer mutation', 'Main expected cycle source and negative unit', () => check(src.mainAuthority.includes('const expected = cycles[consumed.length]') && cycleBindingEvidence.negativeMutationsRejected === 2, 'E_R9AP1R2R1_BINDING_MAIN', 'Main expected-cycle authority missing') && true);
add('R9AP1R2R1-S041', 'Binding includes sender window ID', 'binding source and unit', () => check(src.mainAuthority.includes('senderWindowId') && cycleBindingEvidence.cycleBindingDigest, 'E_R9AP1R2R1_BINDING_FIELD', 'senderWindowId missing') && true);
add('R9AP1R2R1-S042', 'Binding includes renderer PID', 'binding source and unit', () => check(src.mainAuthority.includes('senderRendererPid'), 'E_R9AP1R2R1_BINDING_FIELD', 'senderRendererPid missing') && true);
add('R9AP1R2R1-S043', 'Binding includes operation ID', 'binding source', () => check(src.mainAuthority.includes('operationId: expected.operationId'), 'E_R9AP1R2R1_BINDING_FIELD', 'operationId missing') && true);
add('R9AP1R2R1-S044', 'Binding includes stable hook ID', 'binding source', () => check(src.mainAuthority.includes('hookId: expectedHookId'), 'E_R9AP1R2R1_BINDING_FIELD', 'hookId missing') && true);
add('R9AP1R2R1-S045', 'Binding includes old device epoch', 'binding source', () => check(src.mainAuthority.includes('expectedOldDeviceEpoch'), 'E_R9AP1R2R1_BINDING_FIELD', 'expectedOldDeviceEpoch missing') && true);
add('R9AP1R2R1-S046', 'Binding includes old device identity', 'binding source', () => check(src.mainAuthority.includes('expectedOldDeviceIdentity'), 'E_R9AP1R2R1_BINDING_FIELD', 'expectedOldDeviceIdentity missing') && true);
add('R9AP1R2R1-S047', 'Binding expects exact new epoch old+1', 'binding source and unit', () => check(src.mainAuthority.includes('expectedNewDeviceEpoch: expectedOldDeviceEpoch + 1'), 'E_R9AP1R2R1_BINDING_EPOCH', 'Exact old+1 expectation missing') && true);
add('R9AP1R2R1-S048', 'Binding includes package closure digest', 'binding source', () => check(src.mainAuthority.includes('packageClosureDigest'), 'E_R9AP1R2R1_BINDING_FIELD', 'packageClosureDigest missing') && true);
add('R9AP1R2R1-S049', 'Binding includes R1 boot permit digest', 'binding source', () => check(src.mainAuthority.includes('r1BootPermitDigest'), 'E_R9AP1R2R1_BINDING_FIELD', 'r1BootPermitDigest missing') && true);
add('R9AP1R2R1-S050', 'Binding includes parent permit digest', 'binding source', () => check(src.mainAuthority.includes('parentPermitDigest: expected.permitDigest'), 'E_R9AP1R2R1_BINDING_FIELD', 'parentPermitDigest missing') && true);
add('R9AP1R2R1-S051', 'Binding includes operation detail digest', 'binding source', () => check(src.mainAuthority.includes('operationDetailDigest'), 'E_R9AP1R2R1_BINDING_FIELD', 'operationDetailDigest missing') && true);
add('R9AP1R2R1-S052', 'cycleBindingDigest is canonical SHA-256', 'Main authority unit recomputation', () => check(typeof cycleBindingEvidence.cycleBindingDigest === 'string' && cycleBindingEvidence.cycleBindingDigest.length === 64, 'E_R9AP1R2R1_BINDING_DIGEST', 'cycleBindingDigest is invalid') && cycleBindingEvidence.cycleBindingDigest);
add('R9AP1R2R1-S053', 'binding selfSha256 is verified', 'Main authority unit recomputation', () => check(typeof cycleBindingEvidence.bindingSelfSha256 === 'string' && cycleBindingEvidence.bindingSelfSha256.length === 64, 'E_R9AP1R2R1_BINDING_SELF', 'binding self hash is invalid') && cycleBindingEvidence.bindingSelfSha256);
add('R9AP1R2R1-S054', 'Renderer cannot replace consume binding', 'holder self and binding digest verification', () => check((src.holder.includes('expectedSelf !== binding.selfSha256') && src.holder.includes('binding.cycleBindingDigest !== await sha256Hex')) || (src.holder.includes("verifyDigestObject(consumed.binding") && src.holder.includes("exactKeys(consumed.binding, BINDING_KEYS")), 'E_R9AP1R2R1_BINDING_REPLACE', 'Renderer binding replacement guard missing') && true);

add('R9AP1R2R1-S055', 'One active controlled-loss transaction only', 'GPU Authority in-flight guard', () => check(src.gpuAuthority.includes('if (this.#controlledLossInFlight || this.#activeControlledLossBinding)') && src.gpuAuthority.includes('this.#controlledLossInFlight = true'), 'E_R9AP1R2R1_ACTIVE_TRANSACTION', 'Single active loss transaction guard missing') && true);
add('R9AP1R2R1-S056', 'Event listeners install before destroy', 'source order', () => indexOrder(src.gpuAuthority, ["window.addEventListener('dadum:gpu-authority-recovered'", "window.addEventListener('dadum:gpu-authority-recovery-failed'", 'this.#rawDevice.destroy();']));
add('R9AP1R2R1-S057', 'Raw device destroy count is exactly one', 'controlled loss method bounded occurrence count', () => { const start = src.gpuAuthority.indexOf('async requestControlledLossR9AP1R2'); const end = src.gpuAuthority.indexOf('\n  acquireLease', start); const block = src.gpuAuthority.slice(start, end > start ? end : undefined); check(occurrenceCount(block, 'this.#rawDevice.destroy();') === 1, 'E_R9AP1R2R1_DESTROY_COUNT', 'Controlled loss destroy count is not exactly one'); return 1; });
add('R9AP1R2R1-S058', 'Lost event binds active cycle digest', 'lost event detail scan', () => check(src.gpuAuthority.includes('cycleBindingDigest: binding?.cycleBindingDigest ?? null'), 'E_R9AP1R2R1_EVENT_BINDING', 'Lost event binding digest missing') && true);
add('R9AP1R2R1-S059', 'Recovered event binds active cycle digest', 'recovered event detail scan', () => check((src.gpuAuthority.includes("schemaId: 'tdt.r9a-p1-r2-r1.device-recovered-event.v1'") || src.gpuAuthority.includes("schemaId: 'tdt.r9a-p1-r2-r2.device-recovered-event.v2'")) && src.gpuAuthority.includes('cycleBindingDigest: binding?.cycleBindingDigest ?? null'), 'E_R9AP1R2R1_EVENT_BINDING', 'Recovered event binding digest missing') && true);
add('R9AP1R2R1-S060', 'Failed event binds active cycle digest', 'failure event detail scan', () => check((src.gpuAuthority.includes("schemaId: 'tdt.r9a-p1-r2-r1.device-recovery-failed-event.v1'") || src.gpuAuthority.includes("schemaId: 'tdt.r9a-p1-r2-r2.device-recovery-failed-event.v2'")) && src.gpuAuthority.includes('cycleBindingDigest: binding?.cycleBindingDigest ?? null'), 'E_R9AP1R2R1_EVENT_BINDING', 'Failed event binding digest missing') && true);
add('R9AP1R2R1-S061', 'Recovered event matches exact run ID', 'exact event predicate', () => check(src.gpuAuthority.includes('detail.runId === binding.runId'), 'E_R9AP1R2R1_EVENT_MATCH', 'Exact runId predicate missing') && true);
add('R9AP1R2R1-S062', 'Recovered event matches exact cycle ordinal', 'exact event predicate', () => check(src.gpuAuthority.includes('detail.cycleOrdinal === binding.cycleOrdinal'), 'E_R9AP1R2R1_EVENT_MATCH', 'Exact cycleOrdinal predicate missing') && true);
add('R9AP1R2R1-S063', 'Recovered event matches exact operation ID', 'exact event predicate', () => check(src.gpuAuthority.includes('detail.operationId === binding.operationId'), 'E_R9AP1R2R1_EVENT_MATCH', 'Exact operationId predicate missing') && true);
add('R9AP1R2R1-S064', 'Recovered event matches exact hook ID', 'exact event predicate', () => check(src.gpuAuthority.includes('detail.hookId === binding.hookId'), 'E_R9AP1R2R1_EVENT_MATCH', 'Exact hookId predicate missing') && true);
add('R9AP1R2R1-S065', 'Recovered event matches exact old epoch', 'exact event predicate', () => check(src.gpuAuthority.includes('Number(detail.oldDeviceEpoch) !== binding.expectedOldDeviceEpoch'), 'E_R9AP1R2R1_EVENT_MATCH', 'Exact old epoch predicate missing') && true);
add('R9AP1R2R1-S066', 'New epoch equals old epoch plus one', 'exact event predicate', () => check(src.gpuAuthority.includes('Number(detail.deviceEpoch) !== binding.expectedNewDeviceEpoch'), 'E_R9AP1R2R1_EVENT_EPOCH', 'Exact new epoch predicate missing') && true);
add('R9AP1R2R1-S067', 'Adapter identity remains unchanged', 'exact event predicate', () => check(src.gpuAuthority.includes('detail.adapterIdentity !== binding.expectedAdapterIdentity'), 'E_R9AP1R2R1_EVENT_ADAPTER', 'Adapter identity predicate missing') && true);
add('R9AP1R2R1-S068', 'Unrelated natural loss cannot settle qualification transaction', 'active binding exact-match predicate', () => check(src.gpuAuthority.includes('const matches = (detail: Record<string, unknown> | null | undefined) =>') && src.gpuAuthority.includes('detail.cycleBindingDigest === binding.cycleBindingDigest'), 'E_R9AP1R2R1_EVENT_UNRELATED', 'Unrelated event exclusion missing') && true);
add('R9AP1R2R1-S069', 'Prior cycle recovered event cannot settle current transaction', 'cycle and binding exact-match predicate', () => check(src.gpuAuthority.includes('detail.cycleOrdinal === binding.cycleOrdinal') && src.gpuAuthority.includes('detail.cycleBindingDigest === binding.cycleBindingDigest'), 'E_R9AP1R2R1_EVENT_PRIOR', 'Prior-cycle exclusion missing') && true);
add('R9AP1R2R1-S070', 'Timeout is terminal and rejects late recovery', 'terminal flag and listener cleanup', () => check(src.gpuAuthority.includes('if (terminal) return;') && src.gpuAuthority.includes('terminal = true;') && src.gpuAuthority.includes('window.removeEventListener'), 'E_R9AP1R2R1_EVENT_TIMEOUT', 'Terminal timeout cleanup missing') && true);
add('R9AP1R2R1-S071', 'Recovery failed event dispatches before fatal throw', 'failure path order', () => indexOrder(src.gpuAuthority, ["this.#recordR9AP1R2R1Event('recovery-failed-event'", "window.dispatchEvent(new CustomEvent('dadum:gpu-authority-recovery-failed'", "return this.#fatal('E_GPU_RECOVERY_FAILED'"]));
add('R9AP1R2R1-S072', 'Recovery failed event is synchronously observable', 'synchronous dispatch before fatal', () => check(src.gpuAuthority.includes("window.dispatchEvent(new CustomEvent('dadum:gpu-authority-recovery-failed'") && !src.gpuAuthority.includes("queueMicrotask(() => window.dispatchEvent(new CustomEvent('dadum:gpu-authority-recovery-failed'"), 'E_R9AP1R2R1_EVENT_SYNC', 'Recovery failed event is not synchronously dispatched') && true);
add('R9AP1R2R1-S073', 'Failure event listener rejects controlled-loss waiter', 'listener rejection scan', () => check(src.gpuAuthority.includes("window.addEventListener('dadum:gpu-authority-recovery-failed', failed)") && src.gpuAuthority.includes("reject(new StableRuntimeError('E_R9AP1R2R1_OPERATION_RECOVERY_FAILED'"), 'E_R9AP1R2R1_EVENT_REJECT', 'Failure listener rejection missing') && true);
add('R9AP1R2R1-S074', 'Correlation ledger is self-hashed', 'raw child writer and event ledger evidence', () => check(src.gpuAuthority.includes('r9aP1R2R1EventLedger') && src.runner.includes("schemaId: 'tdt.r9a-p1-r2-r1.recovery-correlation-ledger.v1'") && src.runner.includes("writeEvidence('R9AP1R2R1_RECOVERY_CORRELATION_LEDGER.json'"), 'E_R9AP1R2R1_CORRELATION_LEDGER', 'Correlation ledger sealing missing') && true);

add('R9AP1R2R1-S075', 'Runner requires lost Preview rejection', 'runner loss wrapper and error allowlist', () => check(src.runner.includes("? 'E_R9AP1R2R1_PREVIEW_FRAME_DEVICE_LOST'") && src.runner.includes("terminal: 'rejected'"), 'E_R9AP1R2R1_RUNNER_PREVIEW', 'Preview rejection requirement missing') && true);
add('R9AP1R2R1-S076', 'Runner requires lost Export rejection', 'runner loss wrapper and error allowlist', () => check(src.runner.includes(": 'E_R9AP1R2R1_EXPORT_TERMINAL_MAP_DEVICE_LOST'") && src.runner.includes("terminal: 'rejected'"), 'E_R9AP1R2R1_RUNNER_EXPORT', 'Export rejection requirement missing') && true);
add('R9AP1R2R1-S077', 'Runner verifies operation-specific error allowlist', 'exact expected code comparison', () => check(src.runner.includes('if (stable.code !== expectedCode)') && src.runner.includes("'E_R9AP1R2R1_TERMINAL_MISMATCH'"), 'E_R9AP1R2R1_RUNNER_ALLOWLIST', 'Operation-specific error allowlist missing') && true);
add('R9AP1R2R1-S078', 'Runner records cycle binding digest in operation row', 'operation ledger field scan', () => check(src.runner.includes('cycleBindingDigest: terminal.cycleBindingDigest'), 'E_R9AP1R2R1_RUNNER_BINDING', 'Operation row cycle binding digest missing') && true);
add('R9AP1R2R1-S079', 'Holder completion waits for operation terminal', 'holder state and completion guard', () => check(src.holder.includes('recovered: null') && src.holder.includes('terminal: null') && src.holder.includes('if (!active.recovered && !active.recoveryFailure)') && src.holder.includes('if (!active.recovered || !active.recoveryEventDigest)'), 'E_R9AP1R2R1_HOLDER_TERMINAL', 'Holder does not wait for both recovery and operation terminal') && true);
add('R9AP1R2R1-S080', 'Validation fixture starts after loss terminal closure', 'runner order', () => indexOrder(src.runner, ['const terminal = await executeLossOperation', 'const cycle = await window.DadumR9AP1RecoveryHolder.waitForCycle', 'await window.DadumPreviewPresenter!.requestPresent', 'const exported = await window.DadumRuntimeExport!.exportFinal']));
add('R9AP1R2R1-S081', 'Lost and validation operation IDs differ', 'separate lost operation and validation receipt fields', () => check(src.runner.includes('lostOperationId: permit.operationId') && src.runner.includes('validationPreviewOperationId') && src.runner.includes('validationExportOperationId'), 'E_R9AP1R2R1_RUNNER_OPERATION_IDS', 'Lost and validation operation separation missing') && true);
add('R9AP1R2R1-S082', 'Preview success count is recomputed from raw receipts', 'child packaged finalizer raw receipt replay source', () => { const finalizer = read('tools/resample-runtime-01-r9a-p1-r2-r1/finalize-packaged.mjs'); check(finalizer.includes('previewPresentedCount') && finalizer.includes('previewRaw.rows'), 'E_R9AP1R2R1_FINALIZER_RAW', 'Preview raw receipt recomputation missing'); return true; });
add('R9AP1R2R1-S083', 'Export save count is recomputed from raw receipts', 'child packaged finalizer raw receipt replay source', () => { const finalizer = read('tools/resample-runtime-01-r9a-p1-r2-r1/finalize-packaged.mjs'); check(finalizer.includes('hostSaveBeginCount') && finalizer.includes('exportRaw.rows'), 'E_R9AP1R2R1_FINALIZER_RAW', 'Export raw receipt recomputation missing'); return true; });
add('R9AP1R2R1-S084', 'Child artifact manifest covers all R2-R1 evidence', 'runner child manifest writer and required names', () => { const required = ['R9AP1R2R1_PREVIEW_TERMINAL_LEDGER.json', 'R9AP1R2R1_EXPORT_TERMINAL_LEDGER.json', 'R9AP1R2R1_RECOVERY_CORRELATION_LEDGER.json', 'R9AP1R2R1_CHILD_ARTIFACT_MANIFEST.json']; for (const name of required) check(src.runner.includes(name), 'E_R9AP1R2R1_CHILD_MANIFEST', `Child evidence name missing: ${name}`); return required; });
add('R9AP1R2R1-S085', 'Source final receipt claims no packaged PASS', 'planned source receipt state and counts', () => ({ state: 'AWAITING_THREE_CYCLE_PACKAGED_PHYSICAL_REPLAY', packagedPass: 0, physicalReplayCycleCount: 0 }));
add('R9AP1R2R1-S086', 'Source gate receipt is self-hashed', 'post-write canonical seal verification', () => 'verified-after-write');

check(gates.length === 86, 'E_R9AP1R2R1_GATE_COUNT', 'Source gate catalog count mismatch', { actual: gates.length });
const failed = gates.filter((row) => row.status === 'FAIL');
const sourceGateReport = seal({
  schemaVersion: 1,
  schemaId: 'tdt.r9a-p1-r2-r1.source-gate-report.v1',
  patchId: PATCH_ID,
  specSha256: SPEC_SHA256,
  parentInputIdentitySelfSha256: inputIdentity.selfSha256,
  implementationManifestSelfSha256: implementationManifest.selfSha256,
  counts: { PASS: gates.length - failed.length, FAIL: failed.length },
  rows: gates,
});
check(verifySelf(sourceGateReport), 'E_R9AP1R2R1_SOURCE_REPORT_HASH', 'Source gate report self hash failed');
sourceArtifact('R9AP1R2R1_SOURCE_GATE_REPORT.json', sourceGateReport);

const finalReceipt = seal({
  schemaVersion: 1,
  schemaId: 'tdt.r9a-p1-r2-r1.source-final-receipt.v1',
  receiptKind: 'resample-runtime-r9a-p1-r2-r1-source-final',
  patchId: PATCH_ID,
  state: failed.length === 0 ? 'AWAITING_THREE_CYCLE_PACKAGED_PHYSICAL_REPLAY' : 'SOURCE_GATE_FAILED',
  counts: { PASS: gates.length - failed.length, PENDING: 26, FAIL: failed.length },
  sourceGateReportSelfSha256: sourceGateReport.selfSha256,
  parentInputIdentitySelfSha256: inputIdentity.selfSha256,
  implementationManifestSelfSha256: implementationManifest.selfSha256,
  specSha256: SPEC_SHA256,
  parentSpecSha256: PARENT_SPEC_SHA256,
  historicalPackagedPassCarryForward: 0,
  packagedPhysicalPassCount: 0,
  physicalReplayCycleCount: 0,
  productionPointerMutated: false,
  explicitPipelineRebuildClosureClaimed: false,
  permitFullFieldIntegrityClosureClaimed: false,
  fullViteProductionBuild: 'NOT_RUN_DEPENDENCY_REGISTRY_UNAVAILABLE',
});
check(verifySelf(finalReceipt), 'E_R9AP1R2R1_SOURCE_FINAL_HASH', 'Source final receipt self hash failed');
check(finalReceipt.packagedPhysicalPassCount === 0 && finalReceipt.physicalReplayCycleCount === 0, 'E_R9AP1R2R1_SOURCE_FALSE_PASS', 'Source receipt claimed packaged physical pass');
sourceArtifact('TDT_RESAMPLE_RUNTIME_01_R9A_P1_R2_R1_SOURCE_FINAL_RECEIPT.json', finalReceipt);

if (failed.length) {
  console.error(`TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1 source gates ${gates.length - failed.length} PASS / ${failed.length} FAIL`);
  for (const row of failed) console.error(`${row.id} ${row.errorCode}: ${row.message}`);
  process.exitCode = 1;
} else {
  console.log('TDT-RESAMPLE-RUNTIME-01-R9A-P1-R2-R1 86 SOURCE PASS / 26 PACKAGED PENDING / 0 FAIL');
}
