import fs from 'node:fs';
import path from 'node:path';
import { runtimeModulePlan, servicePlan } from './runtime-manifest-lib.mjs';
const failures = [];
const modules = runtimeModulePlan();
const moduleIds = new Set(); const capabilityOwners = new Map(); const serviceOwners = new Map();
for (const module of modules) {
  if (moduleIds.has(module.id)) failures.push(`duplicate module ${module.id}`); moduleIds.add(module.id);
  for (const capability of module.provides) { if (capabilityOwners.has(capability)) failures.push(`capability collision ${capability}`); capabilityOwners.set(capability, module.id); }
  for (const service of module.ownsServices) { if (serviceOwners.has(service)) failures.push(`service collision ${service}`); serviceOwners.set(service, module.id); }
}
for (const service of servicePlan()) if (!serviceOwners.has(service)) failures.push(`service has no module owner: ${service}`);
for (const dir of ['app/src/components', 'app/src/views']) {
  for (const name of fs.readdirSync(dir)) {
    const source = fs.readFileSync(path.join(dir, name), 'utf8');
    for (const pattern of [/navigator\.gpu/, /new\s+Worker\s*\(/, /GPUTexture/, /GPUDevice/, /DadumExportManager/, /exportImage\s*\(/]) if (pattern.test(source)) failures.push(`${dir}/${name}: component crosses runtime boundary ${pattern}`);
  }
}
const pipeline = fs.readFileSync('app/src/runtime/pipeline/pipeline-service.ts', 'utf8');
if (!pipeline.includes('E_RUNTIME_PLACEHOLDER_REJECTED')) failures.push('placeholder pipeline rejection missing');
const exporter = fs.readFileSync('app/src/runtime/export/export-authority-service.ts', 'utf8');
if (!exporter.includes('requireFinal')) failures.push('export authority does not require final surface');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('PASS GATE-R1-06 capability ownership; GATE-R1-07 service ownership; GATE-R1-15 resource isolation; GATE-R1-17 export authority');
