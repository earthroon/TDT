import fs from 'node:fs';

const failures = [];
const mainSource = fs.readFileSync('app/legacy-runtime/main.js', 'utf8');
const patchSource = fs.readFileSync('app/legacy-runtime/patches/icc_default_loader.js', 'utf8');
const manifest = JSON.parse(fs.readFileSync('app/src/legacy/generated-legacy-manifest.json', 'utf8'));

const reserveIndex = mainSource.indexOf('window.icmsLittle = runtime;');
const importIndex = mainSource.indexOf("await import('./libs/icms_little/icmsLittleBridge.js')");
if (reserveIndex < 0) failures.push('main.js does not synchronously reserve window.icmsLittle');
if (importIndex < 0) failures.push('main.js ICMS bridge dynamic import is missing');
if (reserveIndex >= 0 && importIndex >= 0 && reserveIndex > importIndex) {
  failures.push('window.icmsLittle is reserved after the dynamic import');
}
if (/window\.icmsLittle\s*=\s*\{/.test(mainSource)) {
  failures.push('main.js replaces window.icmsLittle after async activation instead of mutating the reserved shell');
}
if (/window\.icmsLittle\s*=/.test(patchSource)) {
  failures.push('icc_default_loader.js must not own window.icmsLittle');
}

const mainEntry = manifest.entries.find((entry) => entry.id === 'dadum.legacy.main.js');
const patchEntry = manifest.entries.find((entry) => entry.id === 'dadum.legacy.patches-icc_default_loader.js');
if (!mainEntry?.declaredGlobalWrites?.includes('icmsLittle')) {
  failures.push('dadum.legacy.main.js does not declare icmsLittle ownership');
}
if (patchEntry?.declaredGlobalWrites?.includes('icmsLittle')) {
  failures.push('icc_default_loader.js incorrectly declares icmsLittle ownership');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('PASS GATE-R1-R4-ASYNC-GLOBAL-RESERVATION icmsLittle reserved synchronously by main.js; late dynamic import mutates the owned shell; no temporal misattribution to icc_default_loader.js');
