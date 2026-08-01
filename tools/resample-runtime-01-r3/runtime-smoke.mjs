import {
  COORDINATE_CONVENTION_ID,
  FIXTURE_SCHEMA_ID,
  arraysBitIdentical,
  check,
  loadFixtureManifest,
  maxAbsDiff,
  resolveFixture,
  sourcePositionFromRasterMapping,
  writeJson,
} from './lib.mjs';
import { evaluateOracleFixture } from './ewa-f64-oracle.mjs';
import { evaluateNegativeControlFixture, wgslRoundScalar } from './round-centered-negative-control.mjs';
import { evaluateR2SharedErrorFixture } from './r2-shared-error-model.mjs';

const manifest=loadFixtureManifest();
const checks=[];
const selected=manifest.fixtures.filter((fixture)=>fixture.semanticClasses.includes('phase-sensitive')).slice(0,24);
let repeatable=true,modelMatch=true,maxModelError=0;
for(const fixture of selected){
  const a=evaluateOracleFixture(fixture,manifest),b=evaluateOracleFixture(fixture,manifest);
  repeatable&&=arraysBitIdentical(a.rgba,b.rgba)&&Object.is(a.weightSum,b.weightSum);
  const n=evaluateNegativeControlFixture(fixture,manifest),m=evaluateR2SharedErrorFixture(fixture,manifest);
  const error=maxAbsDiff(n.rgba,m.rgba);maxModelError=Math.max(maxModelError,error);modelMatch&&=error<=1e-14;
}
checks.push(check(repeatable,'SMOKE-01','bounded oracle repeatability'));
checks.push(check(modelMatch,'SMOKE-02','R2 model equals negative control',{maxModelError}));
let mappingError=0;
for(const fixture of manifest.fixtures.filter((entry)=>entry.fixtureClass==='raster-mapped')){
  const resolved=resolveFixture(manifest,fixture);
  const p=sourcePositionFromRasterMapping(fixture.rasterMapping);
  mappingError=Math.max(mappingError,maxAbsDiff(p,resolved.position));
}
checks.push(check(mappingError===0,'SMOKE-03','raster mapping formula exact',{mappingError}));
const roundCases=[[-2.5,-3],[-1.5,-2],[-0.5,-1],[0,0],[0.5,1],[1.5,2],[2.5,3]];
checks.push(check(roundCases.every(([value,expected])=>wgslRoundScalar(value)===expected),'SMOKE-04','signed WGSL round mirror'));
let missingDigestRejected=false,oversizedRejected=false,nonfiniteRejected=false;
try{resolveFixture({...manifest,fixtures:[{...manifest.fixtures[0],fixtureDigest:undefined}]},{...manifest.fixtures[0],fixtureDigest:undefined});}catch(error){missingDigestRejected=error.code==='E_R3_FIXTURE_SCHEMA_INVALID';}
try{
  const source={...manifest.sources[0],width:65,height:1,pixels:Array(65*4).fill(0)};
  resolveFixture({...manifest,sources:[source],ellipses:manifest.ellipses,fixtures:[{...manifest.fixtures[0],sourceId:source.sourceId}]},{...manifest.fixtures[0],sourceId:source.sourceId});
}catch(error){oversizedRejected=error.code==='E_R3_ORACLE_INPUT_INVALID';}
try{
  const fake=structuredClone(manifest);fake.sources[0].pixels[0]=Infinity;resolveFixture(fake,fake.fixtures.find((entry)=>entry.sourceId===fake.sources[0].sourceId));
}catch(error){nonfiniteRejected=error.code==='E_R3_ORACLE_NONFINITE';}
checks.push(check(missingDigestRejected,'SMOKE-05','missing fixture digest rejected'));
checks.push(check(oversizedRejected,'SMOKE-06','oversized fixture rejected at 64x64 bound'));
checks.push(check(nonfiniteRejected,'SMOKE-07','non-finite source rejected'));
const alphaFixtures=manifest.fixtures.filter((entry)=>entry.semanticClasses.includes('alpha')&&!entry.semanticClasses.includes('hidden-rgb-diagnostic-only'));
let alphaValid=true,maxPremulExcess=0;
for(const fixture of alphaFixtures){const result=evaluateOracleFixture(fixture,manifest);for(let c=0;c<3;c+=1){maxPremulExcess=Math.max(maxPremulExcess,result.rgba[c]-result.rgba[3]);if(result.rgba[c]<-1e-12||result.rgba[c]>result.rgba[3]+1e-12)alphaValid=false;}if(result.rgba[3]<-1e-12||result.rgba[3]>1+1e-12)alphaValid=false;}
checks.push(check(alphaValid,'SMOKE-08','premultiplied alpha relation preserved',{maxPremulExcess,fixtureCount:alphaFixtures.length}));
checks.push(check(manifest.fixtures.length<=512&&manifest.sources.every((source)=>source.width<=64&&source.height<=64),'SMOKE-09','fixture count and dimensions bounded',{fixtureCount:manifest.fixtures.length}));
checks.push(check(COORDINATE_CONVENTION_ID==='tdt.ewa.source-lattice.pixel-center-v2'&&FIXTURE_SCHEMA_ID==='tdt.ewa.fractional-phase-fixtures.v1','SMOKE-10','stable identities exact'));
const peakFixtureBytes=Math.max(...manifest.sources.map((source)=>source.pixels.length*8));
const pass=checks.every((entry)=>entry.pass);
writeJson('r3-runtime-smoke.json',{schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R3',pass,checks,oracleFixtureCount:manifest.fixtures.length,selectedFixtureCount:selected.length,peakFixtureBytes,diagnosticOnlyMemoryEvidence:true,physicalGpuClaim:false,packagedElectronClaim:false});
if(!pass){console.error(checks.filter((entry)=>!entry.pass));process.exit(1);}console.log(`PASS R3 bounded runtime smoke ${checks.length}/${checks.length}`);
