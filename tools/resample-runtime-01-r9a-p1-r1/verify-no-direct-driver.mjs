import { check, read, seal, sourceArtifact } from './lib.mjs';
const runner = read('app/src/runtime/qualification/r9a-p1-r1-qualification-runner.ts');
const service = read('app/src/runtime/qualification/r9a-p1-r1-qualification-service.ts');
const vite = read('vite.config.ts');
const electron = read('electron.mjs');
const forbidden = [
  'deltaK_stack_autoEWA.mjs', 'export_wgsl_downscale.js', 'createEwaCommandGraphR9A', 'createDeltaKStack',
  'runDeltaKStack', 'executeCanonicalEwaLowpassR9A', 'new GpuDeviceAuthorityService', 'publishLegacyFinalSurface',
];
const active = `${runner}\n${service}`;
const violations = forbidden.filter((token) => active.includes(token));
check(violations.length === 0, 'E_R9AP1R1_DIRECT_KERNEL_DRIVER', 'qualification active graph imports a direct driver', { violations });
check(!vite.includes('physical-r9a-p1/index.html'), 'E_R9AP1R1_DIRECT_ENTRY_ACTIVE', 'legacy P1 HTML is still a Vite entry');
check(!electron.includes("renderer', 'physical-r9a-p1'"), 'E_R9AP1R1_DIRECT_ENTRY_ACTIVE', 'legacy P1 HTML is still loaded by Electron');
const quarantined = ['app/renderer/physical-r9a-p1/product-runtime.mjs','app/renderer/physical-r9a-p1/preview-product-driver.mjs','app/renderer/physical-r9a-p1/export-product-driver.mjs','app/renderer/physical-r9a-p1/index.html'];
sourceArtifact('R9AP1R1_NO_DIRECT_DRIVER_SOURCE_REPORT.json', seal({ schemaVersion: 1, receiptKind: 'r9a-p1-r1-no-direct-driver-source', forbiddenImportCount: 0, activeLegacyEntryCount: 0, quarantined, sourceRetired: false }));
console.log('R9A-P1-R1 no direct kernel driver PASS');
