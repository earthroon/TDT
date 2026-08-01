import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  COORDINATE_CONVENTION_ID,
  FIXTURE_MANIFEST_REL,
  NEGATIVE_CONTROL_ID,
  ORACLE_ID,
  ROOT,
  arraysBitIdentical,
  check,
  loadFixtureManifest,
  maxAbsDiff,
  resolveFixture,
  writeJson,
} from './lib.mjs';
import { evaluateOracleFixture, evaluateOracleResolved, oracleEllipseQ, oracleWeight } from './ewa-f64-oracle.mjs';
import { matrixEllipseQ } from './ewa-f64-oracle-matrix-check.mjs';

const manifest = loadFixtureManifest();
const checks = [];
let maxConstantError = 0;
let maxMatrixQError = 0;
let maxTranslationError = 0;
let maxAxisSwapError = 0;
let maxTangentSignError = 0;
let maxIsotropicRotationError = 0;

const identity = {
  schemaVersion: 1,
  patchId: 'TDT-RESAMPLE-RUNTIME-01-R3',
  oracleId: ORACLE_ID,
  coordinateConventionId: COORDINATE_CONVENTION_ID,
  arithmetic: 'ieee754-binary64-js-number',
  accumulation: 'neumaier-fixed-order',
  candidateOrder: 'y-major-x-minor',
  borderMode: 'clamp-extension-logical-distance',
  productAuthority: false,
  runtimeFallbackAuthority: false,
  negativeControlId: NEGATIVE_CONTROL_ID,
};
writeJson('TDT_RESAMPLE_RUNTIME_01_R3_ORACLE_IDENTITY.json', identity);

const constantFixtures = manifest.fixtures.filter((fixture) => fixture.sourceId === 'source-constant-rgba').slice(0, 8);
if (constantFixtures.length === 0) {
  const template = manifest.fixtures[0];
  constantFixtures.push({ ...template, sourceId: 'source-constant-rgba', fixtureId: 'selftest-constant' });
}
for (const fixture of constantFixtures) {
  const source = manifest.sources.find((entry) => entry.sourceId === 'source-constant-rgba');
  const ellipse = manifest.ellipses.find((entry) => entry.ellipseId === fixture.ellipseId) ?? manifest.ellipses[0];
  const resolved = { fixture: { ...fixture, fixtureSchemaId: manifest.fixtureSchemaId, coordinateConventionId: COORDINATE_CONVENTION_ID }, source, ellipse: resolveFixture(manifest, manifest.fixtures.find((entry)=>entry.ellipseId===ellipse.ellipseId)).ellipse, position: fixture.position ?? [8.25,8.375] };
  const result = evaluateOracleResolved(resolved);
  maxConstantError = Math.max(maxConstantError, maxAbsDiff(result.rgba, [0.2,0.3,0.4,0.5]));
}
checks.push(check(maxConstantError <= 1e-14, 'SELF-01', 'constant conservation', { maxConstantError }));

const repeatFixture = manifest.fixtures.find((fixture) => fixture.semanticClasses.includes('phase-sensitive'));
const repeatA = evaluateOracleFixture(repeatFixture, manifest);
const repeatB = evaluateOracleFixture(repeatFixture, manifest);
checks.push(check(arraysBitIdentical(repeatA.rgba, repeatB.rgba) && Object.is(repeatA.weightSum, repeatB.weightSum), 'SELF-02', 'same-process bit-identical repeatability'));

for (const fixture of manifest.fixtures.slice(0, 48)) {
  const resolved = resolveFixture(manifest, fixture);
  const result = evaluateOracleFixture(fixture, manifest);
  for (const contribution of result.contributions) {
    const direct = oracleEllipseQ(contribution.delta, resolved.ellipse);
    const matrix = matrixEllipseQ(contribution.delta, resolved.ellipse);
    maxMatrixQError = Math.max(maxMatrixQError, Math.abs(direct - matrix));
  }
}
checks.push(check(maxMatrixQError <= 1e-13, 'SELF-03', 'dot and matrix ellipse crosscheck', { maxMatrixQError }));

const source = manifest.sources.find((entry)=>entry.sourceId==='source-rgba-channel-separated-ramp');
const ellipse = resolveFixture(manifest, manifest.fixtures.find((entry)=>entry.ellipseId==='oblique-4x1.25')).ellipse;
const baseFixture = { fixtureSchemaId:manifest.fixtureSchemaId,coordinateConventionId:COORDINATE_CONVENTION_ID,fixtureId:'selftest-translation-a' };
const shiftedWidth = source.width + 4;
const shiftedHeight = source.height + 4;
const shiftedPixels = Array(shiftedWidth*shiftedHeight*4).fill(0);
for (let y=0;y<shiftedHeight;y+=1) for(let x=0;x<shiftedWidth;x+=1){
  const sx=Math.min(source.width-1,Math.max(0,x-2));
  const sy=Math.min(source.height-1,Math.max(0,y-2));
  const si=(sy*source.width+sx)*4,di=(y*shiftedWidth+x)*4;
  for(let c=0;c<4;c+=1) shiftedPixels[di+c]=source.pixels[si+c];
}
const resultT0=evaluateOracleResolved({fixture:baseFixture,source,ellipse,position:[7.25,8.375]});
const resultT1=evaluateOracleResolved({fixture:{...baseFixture,fixtureId:'selftest-translation-b'},source:{width:shiftedWidth,height:shiftedHeight,pixels:shiftedPixels},ellipse,position:[9.25,10.375]});
maxTranslationError=maxAbsDiff(resultT0.rgba,resultT1.rgba);
checks.push(check(maxTranslationError<=1e-14,'SELF-04','integer translation covariance',{maxTranslationError}));

const transposePixels=[];
for(let y=0;y<source.width;y+=1) for(let x=0;x<source.height;x+=1){const i=(x*source.width+y)*4;transposePixels.push(...source.pixels.slice(i,i+4));}
const axisA=evaluateOracleResolved({fixture:{...baseFixture,fixtureId:'selftest-axis-a'},source,ellipse,position:[7.25,8.375]});
const axisEllipse={...ellipse,tangentX:ellipse.tangentY,tangentY:ellipse.tangentX,majorRadius:ellipse.majorRadius,minorRadius:ellipse.minorRadius};
const axisB=evaluateOracleResolved({fixture:{...baseFixture,fixtureId:'selftest-axis-b'},source:{width:source.height,height:source.width,pixels:transposePixels},ellipse:axisEllipse,position:[8.375,7.25]});
maxAxisSwapError=maxAbsDiff(axisA.rgba,axisB.rgba);
checks.push(check(maxAxisSwapError<=1e-13,'SELF-05','axis swap covariance',{maxAxisSwapError}));

const signA=evaluateOracleResolved({fixture:{...baseFixture,fixtureId:'selftest-sign-a'},source,ellipse,position:[7.25,8.375]});
const signB=evaluateOracleResolved({fixture:{...baseFixture,fixtureId:'selftest-sign-b'},source,ellipse:{...ellipse,tangentX:-ellipse.tangentX,tangentY:-ellipse.tangentY},position:[7.25,8.375]});
maxTangentSignError=maxAbsDiff(signA.rgba,signB.rgba);
checks.push(check(maxTangentSignError<=1e-14,'SELF-06','tangent sign invariance',{maxTangentSignError}));

const isoBase=resolveFixture(manifest,manifest.fixtures.find((entry)=>entry.ellipseId==='isotropic-1')).ellipse;
const isoA=evaluateOracleResolved({fixture:{...baseFixture,fixtureId:'selftest-iso-a'},source,ellipse:isoBase,position:[7.25,8.375]});
const isoB=evaluateOracleResolved({fixture:{...baseFixture,fixtureId:'selftest-iso-b'},source,ellipse:{...isoBase,tangentX:Math.SQRT1_2,tangentY:Math.SQRT1_2},position:[7.25,8.375]});
maxIsotropicRotationError=maxAbsDiff(isoA.rgba,isoB.rgba);
checks.push(check(maxIsotropicRotationError<=1e-13,'SELF-07','isotropic rotation invariance',{maxIsotropicRotationError}));

let positivity=true,monotonicity=true,previous=Infinity;
for(let i=0;i<=100;i+=1){const q=i/100;const w=oracleWeight(q,ellipse);if(w<0)positivity=false;if(w>previous+1e-15)monotonicity=false;previous=w;}
checks.push(check(positivity&&oracleWeight(0,ellipse)>0,'SELF-08','weight positivity'));
checks.push(check(monotonicity,'SELF-09','radial weight monotonicity'));

let invalidNonFinite=false,zeroWeight=false;
try{evaluateOracleResolved({fixture:{...baseFixture,fixtureId:'selftest-invalid'},source,ellipse:{...ellipse,majorRadius:NaN},position:[7,7]});}catch(error){invalidNonFinite=error.code==='E_R3_ORACLE_NONFINITE'||error.code==='E_R3_ORACLE_INPUT_INVALID';}
try{evaluateOracleResolved({fixture:{...baseFixture,fixtureId:'selftest-zero'},source,ellipse:{tangentX:1,tangentY:0,majorRadius:0.1,minorRadius:0.1,kernelSharpness:1.65,taperExponent:1,maxReach:1},position:[7.5,7.5]});}catch(error){zeroWeight=error.code==='E_R3_ORACLE_ZERO_WEIGHT_SUM';}
checks.push(check(invalidNonFinite,'SELF-10','non-finite input rejected'));
checks.push(check(zeroWeight,'SELF-11','zero weight support rejected without center fallback'));

const temp=fs.mkdtempSync(path.join(os.tmpdir(),'tdt-r3-fixtures-'));
try{
  const out=path.join(temp,'manifest.json');
  const digestOut=path.join(temp,'sources.json');
  const run=spawnSync(process.execPath,[path.join(ROOT,'tools/resample-runtime-01-r3/generate-phase-fixtures.mjs')],{cwd:ROOT,env:{...process.env,R3_FIXTURE_OUTPUT:out,R3_SOURCE_DIGEST_OUTPUT:digestOut},encoding:'utf8'});
  if(run.status!==0) throw new Error(run.stderr||run.stdout);
  const checked=fs.readFileSync(path.join(ROOT,FIXTURE_MANIFEST_REL));
  const regenerated=fs.readFileSync(out);
  checks.push(check(Buffer.compare(checked,regenerated)===0,'SELF-12','fixture regeneration byte-identical'));
} finally { fs.rmSync(temp,{recursive:true,force:true}); }

const pass=checks.every((entry)=>entry.pass);
const receipt={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R3',oracleId:ORACLE_ID,coordinateConventionId:COORDINATE_CONVENTION_ID,pass,checks,invariants:{constantConservation:{maxError:maxConstantError,tolerance:1e-14},matrixCrosscheck:{maxError:maxMatrixQError,tolerance:1e-13},translationCovariance:{maxError:maxTranslationError,tolerance:1e-14},axisSwapCovariance:{maxError:maxAxisSwapError,tolerance:1e-13},tangentSignInvariance:{maxError:maxTangentSignError,tolerance:1e-14},isotropicRotationInvariance:{maxError:maxIsotropicRotationError,tolerance:1e-13}},fixtureManifestDigest:manifest.manifestDigest,physicalGpuClaim:false,packagedElectronClaim:false};
writeJson('TDT_RESAMPLE_RUNTIME_01_R3_ORACLE_SELF_TEST_RECEIPT.json',receipt);
if(!pass){console.error(checks.filter((entry)=>!entry.pass));process.exit(1);}console.log(`PASS R3 oracle self tests ${checks.length}/${checks.length}`);
