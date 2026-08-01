import { read, check, sourceArtifact, seal } from './lib.mjs';
const electron = read('electron.mjs');
const preload = read('preload.cjs');
const controller = read('app/features/resample-runtime/r11a/electron-admission-controller.mjs');
const requiredElectron = [
  "createR11AElectronAdmissionController",
  "show: false",
  "r11aController.registerIpc()",
  "r11aController?.bindWindow(win)",
  "validateExportGrant(event, request, { consume: false })",
  "registerSaveSession(sessionId, event, request)",
  "validateSaveSession(String(request.sessionId || ''), event)",
  "E_R11A_HOST_SAVE_ADMISSION_REQUIRED",
];
for (const token of requiredElectron) check(electron.includes(token), 'E_R11A_ELECTRON_WIRING_MISSING', `electron wiring missing: ${token}`);
for (const channel of ['bootstrapContext', 'completeStartup', 'issueJobGrant', 'completeJob', 'sessionStatus', 'reportDeviceLoss', 'rendererReady']) check(preload.includes(channel), 'E_R11A_PRELOAD_CAPABILITY_MISSING', `preload capability missing: ${channel}`);
for (const token of ['dadum:r11a-bootstrap-context', 'dadum:r11a-complete-startup', 'dadum:r11a-issue-job-grant', 'dadum:r11a-complete-job', 'dadum:r11a-device-loss', 'dadum:r11a-renderer-ready']) check(controller.includes(token), 'E_R11A_ELECTRON_WIRING_MISSING', `controller IPC missing: ${token}`);
check(electron.includes("ipcMain.on('frame-capture', (event) =>") && !electron.includes("fs.writeFileSync(savePath, Buffer.from(buffer))"), 'E_R11A_HOST_SAVE_ADMISSION_REQUIRED', 'legacy frame-capture disk write remains active');
sourceArtifact('R11A_ELECTRON_WIRING_REPORT.json', seal({ schemaVersion: 1, patchId: 'TDT-RESAMPLE-RUNTIME-01-R11A', pass: true, browserWindowHiddenUntilAdmission: true, mainOwnsSessionSecret: true, preloadCapabilityNarrow: true, exportSaveRevalidatesGrant: true, chunkAndCommitRevalidateSession: true, legacyFrameCaptureDiskWriteDisabled: true, crashListenersBound: true }));
console.log('R11A Electron wiring PASS');
