import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { evaluateBakemonoRinneLegacyF32, evaluateBakemonoRinneLegacyF64, BKR01_LEGACY_TAU_LITERAL } from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_formula_contract.mjs';
import { srgbToLinear } from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_color_contract.mjs';
import { canonicalBakemonoRinneJson } from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_contract_receipt.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const OUT=path.join(ROOT,'artifacts/bakemono-rinne-wgsl-01/formula-oracle-report.json');
const sha=(v)=>createHash('sha256').update(typeof v==='string'?v:canonicalBakemonoRinneJson(v)).digest('hex');
const maxDiff=(a,b)=>Math.max(...a.map((v,i)=>Math.abs(v-b[i])));
const baseFixtures=[
 ['black-opaque',[0,0,0,1]],['white-opaque',[1,1,1,1]],['middle-gray',[0.5,0.5,0.5,1]],['red',[1,0,0,1]],['green',[0,1,0,1]],['blue',[0,0,1,1]],['cyan',[0,1,1,1]],['magenta',[1,0,1,1]],['yellow',[1,1,0,1]],['alpha-zero',[0.8,0.2,0.6,0]],['alpha-near-epsilon',[0.2,0.4,0.6,1e-7]],
];
const controls=[
 ['neutral',0,0,0,0,0,0],['q-low',0.3,0.5,1,1,0,0],['q-mid',0.6,0.5,1,0,1,0.4],['q-one',1,1,1,1,1,1.57075],['s-zero',0.7,0,1,1,1,0],['mask-zero',0.8,0.8,1,0,0,0],['highlight-only',0.8,0.8,1,1,0,0],['edge-only',0.8,0.8,1,0,1,0],['phase-boundary',0.2,1,1,1,1,6.283],
];
const fixtures=[];
for(const [id,base] of baseFixtures)fixtures.push({fixtureId:id,input:{base,q:0.55,s:0.65,alphaDepth:base[3],highlight:0.7,edge:0.4,phaseBase:0.25,power:1,neonBoost:1}});
for(const [id,q,s,alphaDepth,highlight,edge,phaseBase] of controls)fixtures.push({fixtureId:id,input:{base:[0.23,0.47,0.71,0.9],q,s,alphaDepth,highlight,edge,phaseBase,power:1,neonBoost:1}});
function correctedMatrixMutant(input){
  const base=input.base.slice(0,3);const xyz=[0.4124*base[0]+0.3576*base[1]+0.1805*base[2],0.2126*base[0]+0.7152*base[1]+0.0722*base[2],0.0193*base[0]+0.1192*base[1]+0.9505*base[2]];
  return xyz;
}
export async function runFormulaOracle(){
  const rows=[];let maxF32F64=0;let nonfiniteCount=0;
  for(const fixture of fixtures){const f64=evaluateBakemonoRinneLegacyF64(fixture.input);const f32=evaluateBakemonoRinneLegacyF32(fixture.input);const diff=maxDiff(f64.outputEncodedStraight,f32.outputEncodedStraight);maxF32F64=Math.max(maxF32F64,diff);const values=[...f64.effectiveXyz,...f64.lab0,...f64.cmyk0,f64.phase,...f64.rinneRgb,...f64.bakemonoRgb,f64.fusionRatio,f64.finalMix,...f64.outputEncodedStraight,...f32.outputEncodedStraight];nonfiniteCount+=values.filter(v=>!Number.isFinite(v)).length;const body={fixtureId:fixture.fixtureId,input:fixture.input,f64,f32,absoluteOutputDifference:diff};rows.push({...body,rowDigest:sha(body)});}
  const probe=fixtures.find(x=>x.fixtureId==='middle-gray').input;const compat=evaluateBakemonoRinneLegacyF64(probe);
  const correctedXyz=correctedMatrixMutant(probe);const matrixMutationDifference=maxDiff(compat.effectiveXyz,correctedXyz);
  const decodedInput={...probe,base:[...probe.base.slice(0,3).map(srgbToLinear),probe.base[3]]};const hiddenDecodeDifference=maxDiff(compat.outputEncodedStraight,evaluateBakemonoRinneLegacyF64(decodedInput).outputEncodedStraight);
  const tauProbe=fixtures.find(x=>x.fixtureId==='phase-boundary').input;const legacy=evaluateBakemonoRinneLegacyF64(tauProbe);const trueTauEquivalent={...tauProbe,phaseBase:tauProbe.phaseBase+tauProbe.q*(Math.PI*2-BKR01_LEGACY_TAU_LITERAL)};const trueTauDifference=maxDiff(legacy.outputEncodedStraight,evaluateBakemonoRinneLegacyF64(trueTauEquivalent).outputEncodedStraight);
  const repeatA=evaluateBakemonoRinneLegacyF32(probe),repeatB=evaluateBakemonoRinneLegacyF32(probe);const deterministic=canonicalBakemonoRinneJson(repeatA)===canonicalBakemonoRinneJson(repeatB);
  const body={schemaVersion:1,schemaId:'tdt.effect.bakemono-rinne.formula-oracle-report.v1',patchId:'TDT-BAKEMONO-RINNE-WGSL-01',status:nonfiniteCount===0&&deterministic&&matrixMutationDifference>1e-3&&hiddenDecodeDifference>1e-3&&trueTauDifference>1e-9?'PASS':'FAIL',fixtureCount:rows.length,rows,maxF32F64Difference:maxF32F64,nonfiniteCount,deterministic,negativeControls:{matrixTransposeCorrectionDetected:matrixMutationDifference>1e-3,matrixMutationDifference,hiddenSrgbDecodeDetected:hiddenDecodeDifference>1e-3,hiddenDecodeDifference,trueTauReplacementDetected:trueTauDifference>1e-9,trueTauDifference}};
  const report={...body,selfSha256:sha(body)};fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');return report;
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){const r=await runFormulaOracle();console.log(`${r.status} formula-oracle fixtures=${r.fixtureCount} maxF32F64=${r.maxF32F64Difference}`);if(r.status!=='PASS')process.exitCode=1;}
