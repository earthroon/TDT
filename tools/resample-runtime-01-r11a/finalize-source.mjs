import { json, check, sourceArtifact, seal, sha256File } from './lib.mjs';
import { SOURCE_STATE, SPEC, POINTER_A } from './identity.mjs';
const gate = json('artifacts/resample-runtime-01-r11a/source-bake/R11A_SOURCE_GATE_REPORT.json');
const installed = json('artifacts/resample-runtime-01-r11a/source-bake/R11A_INSTALLED_GATE_STATUS.json');
const parent = json('artifacts/resample-runtime-01-r11a/source-bake/R11A_PARENT_AND_LINEAGE_REPORT.json');
check(gate.counts.PASS === 332 && gate.counts.FAIL === 0, 'E_R11A_SOURCE_RECEIPT_INVALID', 'source gate incomplete');
check(installed.counts.PENDING === 400 && installed.counts.PASS === 0 && installed.counts.FAIL === 0, 'E_R11A_SOURCE_RECEIPT_INVALID', 'installed state must remain pending');
const receipt = seal({
  schemaVersion: 1,
  schemaId: 'tdt.resample.startup-admission-wiring.r11a.v1',
  patchId: 'TDT-RESAMPLE-RUNTIME-01-R11A',
  state: SOURCE_STATE,
  counts: { PASS: 332, PENDING: 400, DEFERRED: 0, SKIPPED: 0, FAIL: 0 },
  sourcePass: 332,
  installedPass: 0,
  pending: 400,
  deferred: 0,
  skipped: 0,
  fail: 0,
  sourceGates: gate.gates,
  installedGates: installed.gates,
  mainProcessAdmissionSsot: true,
  browserWindowHiddenUntilAdmission: true,
  installedSessionHmacMainOnly: true,
  previewAdmissionWired: true,
  exportAdmissionWired: true,
  hostSaveAdmissionWired: true,
  crashDeviceLossQuarantineWired: true,
  productionPointerMutated: false,
  localActivationPointerMutated: false,
  installedSessionIssued: false,
  r10aReleaseCurrent: false,
  historicalPassCarryForward: 0,
  currentPointerRawSha256: sha256File(POINTER_A),
  parentSourceReceiptSha256: parent.parentSourceReceiptSha256,
  nextAuthority: 'TDT-RESAMPLE-RUNTIME-01-R12A',
  specSha256: sha256File(SPEC),
});
sourceArtifact('TDT_RESAMPLE_RUNTIME_01_R11A_SOURCE_FINAL_RECEIPT.json', receipt);
console.log('TDT-RESAMPLE-RUNTIME-01-R11A 332 SOURCE PASS / 400 INSTALLED PENDING / 0 FAIL');
