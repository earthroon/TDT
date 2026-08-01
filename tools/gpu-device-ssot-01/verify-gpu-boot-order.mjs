import { read, writeJson } from './lib.mjs';
const source = read('app/src/boot/runtime-modules.ts');
const gpu = source.indexOf("id: 'dadum.module.gpu-authority-v1'");
const legacy = source.indexOf("id: 'dadum.module.legacy-adapter-v1'");
const dependency = source.includes("'dadum.module.gpu-authority-v1']") || source.includes("'dadum.module.gpu-authority-v1',");
const legacyBlock = source.slice(legacy, source.indexOf("module({ id: 'dadum.module.worker-v1'", legacy));
const legacyDepends = legacyBlock.includes("'dadum.module.gpu-authority-v1'");
const report = { schemaVersion: 1, gpuIndex: gpu, legacyIndex: legacy, gpuBeforeLegacy: gpu >= 0 && legacy >= 0 && gpu < legacy, legacyDependsOnGpuAuthority: legacyDepends, dependencyTokenObserved: dependency, pass: gpu >= 0 && legacy >= 0 && gpu < legacy && legacyDepends };
writeJson('gpu-boot-order.json', report);
if (!report.pass) { console.error(JSON.stringify(report, null, 2)); process.exit(1); }
console.log('PASS GPU Authority boots before Legacy Runtime');
