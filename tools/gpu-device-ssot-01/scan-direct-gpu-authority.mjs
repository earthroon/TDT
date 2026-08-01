import { AUTHORITY_FILE, listFiles, read, writeJson } from './lib.mjs';
const files = [...listFiles('app/src'), ...listFiles('app/legacy-runtime')];
const findings = [];
const patterns = [
  ['requestAdapter', /\brequestAdapter\s*\(/g],
  ['requestDevice', /\brequestDevice\s*\(/g],
  ['rawDeviceAlias', /__DADUM_WEBGPU_(?:DEVICE|ADAPTER)__/g],
  ['deviceLostObserver', /\.lost\s*\.then\s*\(/g],
  ['legacyLostEvent', /dadum:webgpu-device-lost/g],
];
for (const file of files) {
  const source = read(file);
  for (const [kind, regex] of patterns) {
    for (const match of source.matchAll(regex)) {
      if ((kind === 'requestAdapter' || kind === 'requestDevice' || kind === 'deviceLostObserver') && file === AUTHORITY_FILE) continue;
      findings.push({ file, kind, offset: match.index });
    }
  }
}
const report = { schemaVersion: 1, authorityFile: AUTHORITY_FILE, filesScanned: files.length, findings, pass: findings.length === 0 };
writeJson('direct-gpu-authority-scan.json', report);
if (!report.pass) { console.error(JSON.stringify(report, null, 2)); process.exit(1); }
console.log(`PASS direct GPU authority scan files=${files.length} findings=0`);
