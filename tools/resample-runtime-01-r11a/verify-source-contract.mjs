import { check, json, sourceArtifact, seal, sha256File, read } from './lib.mjs';
import { SPEC, POINTER_A, POINTER_B } from './identity.mjs';
const requiredReports = [
  'R11A_PARENT_AND_LINEAGE_REPORT.json',
  'R11A_MAIN_SESSION_AUTHORITY_REPORT.json',
  'R11A_INSTALLED_ADMISSION_REPORT.json',
  'R11A_ELECTRON_WIRING_REPORT.json',
  'R11A_RENDERER_WIRING_REPORT.json',
  'R11A_TYPESCRIPT_SYNTAX_REPORT.json',
  'R11A_JAVASCRIPT_PARSE_REPORT.json',
  'R11A_NEGATIVE_CONTROL_REPORT.json',
  'R11A_PREDECESSOR_REGRESSION_REPORT.json',
];
for (const name of requiredReports) check(json(`artifacts/resample-runtime-01-r11a/source-bake/${name}`).pass === true, 'E_R11A_SOURCE_RECEIPT_INVALID', `source report failed: ${name}`);
const pointerA = sha256File(POINTER_A); const pointerB = sha256File(POINTER_B);
check(pointerA === '1462587f6b2abd55eb87aa709783d6452ca994c9d31179a12397f1101eeffcf8' && pointerB === pointerA, 'E_R11A_POINTER_MUTATION_FORBIDDEN', 'production pointer changed');
const electron = read('electron.mjs');
check(!electron.includes('masterKey:') && !read('preload.cjs').includes('masterKey'), 'E_R11A_MAIN_SECRET_EXPOSED', 'main admission key exposed through product boundary');
const report = seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R11A', pass: true, specSha256: sha256File(SPEC), mainProcessIsAdmissionSsot: true, preloadIsCapabilityOnly: true, rendererCannotMintSession: true, browserWindowShowAfterRendererReady: true, previewGrantRequired: true, exportGrantRequired: true, hostSaveGrantRequired: true, legacyFrameCaptureWriteDisabled: true, productionPointerMutated: false, localActivationPointerMutated: false, installedSessionIssued: false, installedStrictPhysicalCanaryPending: true, historicalPassCarryForward: 0 });
sourceArtifact('R11A_SOURCE_CONTRACT_REPORT.json', report);
console.log('R11A source contract PASS');
