import fs from 'node:fs';import path from 'node:path';import {ROOT,readJson,writeArtifact} from './lib.mjs';
const inventory=readJson('app/src/runtime/analysis/generated/generated-analysis-producer-inventory.json');const forbidden=[['requestAdapter',/navigator\.gpu\s*\.\s*requestAdapter|requestAdapter\s*\(/],['requestDevice',/requestDevice\s*\(/],['getImageData',/getImageData\s*\(/],['readPixels',/readPixels\s*\(/],['mapAsync',/\.mapAsync\s*\(/],['canvas-context',/getContext\s*\(\s*['"]2d['"]|getContext\s*\(\s*['"]webgl/]];
const allowlist=[
{file:'app/legacy-runtime/js/modules/fft_qmap_runtime.js',mode:'diagnostic-cpu-reference',symbols:['buildFFTMagnitudeTexture']},
{file:'app/legacy-runtime/ASH_QMAP_PostPatch_kit/js/qmap_fft.js',mode:'diagnostic-reference-only',symbols:['computeFFTQmapFromCanvas']},
{file:'app/legacy-runtime/phase/phase_field.js',mode:'compatibility-non-product',symbols:['computeRepresentativePhase']},
{file:'app/legacy-runtime/libs/atlas/atlasQmapRuntime.js',mode:'compatibility-non-product',symbols:['AtlasQmapRuntime']},
];
const findings=[];for(const producer of inventory.producers.filter(p=>p.productAdmission!=='future'))for(const file of producer.sourceFiles){const abs=path.join(ROOT,file);if(!fs.existsSync(abs)){findings.push({producerId:producer.producerId,file,kind:'missing-source'});continue;}const source=fs.readFileSync(abs,'utf8');for(const [kind,re] of forbidden)if(re.test(source))findings.push({producerId:producer.producerId,file,kind});}
const broadAllowlist=allowlist.some(a=>a.file.endsWith('/')||a.file.includes('*'));const report={schemaVersion:1,pass:findings.length===0&&!broadAllowlist,registeredProducerFindings:findings,compatibilityAllowlist:allowlist,broadAllowlist};writeArtifact('aft00-zero-cpu-product-audit.json',report);console.log(`AFT00 zero-CPU audit ${report.pass?'PASS':'FAIL'} findings=${findings.length}`);if(!report.pass)process.exit(1);
