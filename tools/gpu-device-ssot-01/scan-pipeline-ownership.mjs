import { AUTHORITY_FILE, listFiles, read, writeJson } from './lib.mjs';
const files = [...listFiles('app/src'), ...listFiles('app/legacy-runtime')];
const findings = [];
const methods = ['createShaderModule', 'createComputePipeline', 'createRenderPipeline', 'createComputePipelineAsync', 'createRenderPipelineAsync'];
for (const file of files) {
  const source = read(file);
  const lines = source.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const method of methods) {
      if (!line.includes(`.${method}(`)) continue;
      if (file === AUTHORITY_FILE) continue;
      if (line.includes(`__DADUM_GPU_AUTHORITY_BRIDGE__.${method}(`)) continue;
      findings.push({ file, line: i + 1, method, source: line.trim() });
    }
  }
}
const report = { schemaVersion: 1, filesScanned: files.length, methods, findings, pass: findings.length === 0 };
writeJson('pipeline-ownership-scan.json', report);
if (!report.pass) { console.error(JSON.stringify(report, null, 2)); process.exit(1); }
console.log(`PASS pipeline ownership scan files=${files.length} findings=0`);
