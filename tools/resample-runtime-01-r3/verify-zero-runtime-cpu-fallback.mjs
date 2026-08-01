import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT,
  check,
  relative,
  walkFiles,
  writeJson,
} from './lib.mjs';

const runtimeRoots=['app','native','workers'].map((entry)=>path.join(ROOT,entry)).filter(fs.existsSync);
for(const single of ['electron.mjs','preload.cjs'])if(fs.existsSync(path.join(ROOT,single)))runtimeRoots.push(path.join(ROOT,single));
const files=[];
for(const root of runtimeRoots){if(fs.statSync(root).isFile())files.push(root);else files.push(...walkFiles(root,(file)=>/\.(?:[cm]?[jt]s|json|html|wgsl)$/i.test(file)));}
const oracleMarkers=['resample-runtime-01-r3','ewa-f64-oracle','fractional-phase-oracle','round-centered-negative-control'];
const forbiddenApiMarkers=['runEwaOracleForProduct','cpuEwaFallback','fallbackToOracle','oracleResample','referenceResampleOnCpu'];
const importMatches=[];
const apiMatches=[];
const fallbackWiringMatches=[];
for(const file of files){
  const source=fs.readFileSync(file,'utf8');
  for(const marker of oracleMarkers)if(source.includes(marker))importMatches.push({relative:relative(file),marker});
  for(const marker of forbiddenApiMarkers)if(source.includes(marker))apiMatches.push({relative:relative(file),marker});
  const mentionsR3Oracle=oracleMarkers.some((marker)=>source.includes(marker))||forbiddenApiMarkers.some((marker)=>source.includes(marker));
  if(mentionsR3Oracle&&/(?:WebGPU|GPU).{0,120}(?:fail|unavailable).{0,200}(?:canvas|webgl|cpu.*ewa|reference.*fallback)/is.test(source))fallbackWiringMatches.push({relative:relative(file),kind:'r3-oracle-fallback-branch'});
}

function scanOutputRoots(candidates,markers){
  const existing=candidates.map((entry)=>path.join(ROOT,entry)).filter(fs.existsSync);
  const matches=[];
  for(const root of existing){for(const file of walkFiles(root)){let source;try{source=fs.readFileSync(file,'utf8');}catch{continue;}for(const marker of markers)if(source.includes(marker))matches.push({relative:relative(file),marker});}}
  return {existing:existing.map(relative),matches};
}
const renderer=scanOutputRoots(['dist','app/dist','dist-renderer'],oracleMarkers);
const packaged=scanOutputRoots(['release','dist-electron','out','packaged'],oracleMarkers);
const assetFiles=['app/src/runtime/assets/generated-runtime-asset-manifest.json','app/src/runtime/assets/generated-runtime-asset-manifest.ts'];
const activeFiles=['app/src/runtime/active-graph/generated-active-runtime-graph.json','app/src/runtime/active-graph/generated-active-runtime-graph.ts'];
const runtimeAssetMatches=assetFiles.filter((file)=>fs.existsSync(path.join(ROOT,file))&&oracleMarkers.some((marker)=>fs.readFileSync(path.join(ROOT,file),'utf8').includes(marker)));
const activeGraphMatches=activeFiles.filter((file)=>fs.existsSync(path.join(ROOT,file))&&oracleMarkers.some((marker)=>fs.readFileSync(path.join(ROOT,file),'utf8').includes(marker)));
const checks=[
  check(importMatches.length===0,'ISO-01','runtime roots import no R3 oracle module',importMatches),
  check(apiMatches.length===0,'ISO-02','no public runtime CPU oracle selector',apiMatches),
  check(fallbackWiringMatches.length===0,'ISO-03','no WebGPU failure branch invokes CPU/Canvas/WebGL EWA fallback',fallbackWiringMatches),
  check(runtimeAssetMatches.length===0,'ISO-04','no R3 runtime asset authority entry',runtimeAssetMatches),
  check(activeGraphMatches.length===0,'ISO-05','no R3 active production graph node',activeGraphMatches),
  check(renderer.matches.length===0,'ISO-06','oracle absent from renderer output when output exists',renderer),
  check(packaged.matches.length===0,'ISO-07','oracle absent from packaged content when package exists',packaged),
];
const pass=checks.every((entry)=>entry.pass);
const receipt={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R3',pass,runtimeScannedFileCount:files.length,runtimeForbiddenImportCount:importMatches.length,publicForbiddenApiCount:apiMatches.length,cpuFallbackWiringMatchCount:fallbackWiringMatches.length,rendererEmitStatus:renderer.existing.length?'PASS':'DEFERRED_NO_EMIT_INPUT',rendererEmitOracleMatchCount:renderer.matches.length,packagedContentStatus:packaged.existing.length?'PASS':'DEFERRED_NO_PACKAGE_INPUT',packagedOracleMatchCount:packaged.matches.length,userImageIngressStatus:'SEALED_FIXTURE_ONLY_MAX_64X64',runtimeAssetAuthorityMatchCount:runtimeAssetMatches.length,activeGraphMatchCount:activeGraphMatches.length,checks};
writeJson('TDT_RESAMPLE_RUNTIME_01_R3_ZERO_RUNTIME_CPU_FALLBACK_RECEIPT.json',receipt);
if(!pass){console.error(checks.filter((entry)=>!entry.pass));process.exit(1);}console.log(`PASS R3 zero runtime CPU fallback scan files=${files.length}`);
