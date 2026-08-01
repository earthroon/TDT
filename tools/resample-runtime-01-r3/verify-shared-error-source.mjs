import {
  COORDINATE_CONVENTION_ID,
  PARENT_FILES,
  REJECTION_SCHEMA_ID,
  check,
  loadFixtureManifest,
  maxAbsDiff,
  read,
  sha256File,
  writeJson,
} from './lib.mjs';
import { evaluateNegativeControlFixture } from './round-centered-negative-control.mjs';
import { evaluateR2SharedErrorFixture } from './r2-shared-error-model.mjs';

function normalizedTokens(source) {
  return source
    .replace(/\/\/.*$/gm, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\s+/g, '')
    .replace(/([(){}\[\],;:+*\/=-])/g, '$1');
}


const names=['productR4','productR6','validationR4','validationR6','directReference'];
const assets=[];
for(const name of names){
  const relative=PARENT_FILES[name][0];
  const source=read(relative);
  const normalized=normalizedTokens(source);
  const continuousPosition=normalized.includes('letp=(vec2<f32>(gid.xy)+vec2<f32>(0.5))*U.srcPerDst-vec2<f32>(0.5)');
  const roundAnchor=/(?:load|sampleTileStrict)\(vec2<i32>\(round\(p\)\)\+vec2<i32>\(x,y\)/.test(normalized);
  const offsetDistance=normalized.includes('letd=vec2<f32>(f32(x),f32(y))');
  const {createHash}=await import('node:crypto');
  assets.push({name,relative,sha256:sha256File(relative),continuousPosition,roundAnchor,offsetDistance,usesRoundCenteredCandidates:continuousPosition&&roundAnchor&&offsetDistance,normalizedSignatureSha256:createHash('sha256').update(normalized).digest('hex')});
}
const manifest=loadFixtureManifest();
let maxModelError=0;
let compared=0;
let firstMismatch=null;
for(const fixture of manifest.fixtures){
  const negative=evaluateNegativeControlFixture(fixture,manifest);
  const model=evaluateR2SharedErrorFixture(fixture,manifest);
  const error=maxAbsDiff(negative.rgba,model.rgba);
  maxModelError=Math.max(maxModelError,error);compared+=1;
  if(error>1e-14&&!firstMismatch)firstMismatch={fixtureId:fixture.fixtureId,error,negative:negative.rgba,model:model.rgba};
}
const checks=[
  ...assets.map((asset,index)=>check(asset.usesRoundCenteredCandidates,`SHARED-${String(index+1).padStart(2,'0')}`,`${asset.name} contains shared round-centered signature`,asset)),
  check(maxModelError<=1e-14,'SHARED-06','R2 shared-error model matches negative control',{maxModelError,compared,firstMismatch}),
];
const pass=checks.every((entry)=>entry.pass);
const receipt={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R3',pass,assets,productR4UsesRoundCenteredCandidates:assets.find((entry)=>entry.name==='productR4').usesRoundCenteredCandidates,productR6UsesRoundCenteredCandidates:assets.find((entry)=>entry.name==='productR6').usesRoundCenteredCandidates,validationR4UsesRoundCenteredCandidates:assets.find((entry)=>entry.name==='validationR4').usesRoundCenteredCandidates,validationR6UsesRoundCenteredCandidates:assets.find((entry)=>entry.name==='validationR6').usesRoundCenteredCandidates,directReferenceUsesRoundCenteredCandidates:assets.find((entry)=>entry.name==='directReference').usesRoundCenteredCandidates,sharedDistanceForm:'integer-offset-only',sharedFetchAnchor:'round(p)',independentCoordinateReferencePresent:false,modelComparison:{comparedCount:compared,maxAbsoluteError:maxModelError,tolerance:1e-14,firstMismatch},checks};
writeJson('TDT_RESAMPLE_RUNTIME_01_R3_SHARED_ERROR_SOURCE_RECEIPT.json',receipt);
const negativeReceipt=JSON.parse(read('artifacts/resample-runtime-01-r3/source-bake/TDT_RESAMPLE_RUNTIME_01_R3_NEGATIVE_CONTROL_RECEIPT.json'));
const rejected=pass&&negativeReceipt.negativeControlDetected===true&&negativeReceipt.mismatchCount>=16;
const rejection={schemaVersion:1,schemaId:REJECTION_SCHEMA_ID,patchId:'TDT-RESAMPLE-RUNTIME-01-R3',parentPatchId:'TDT-RESAMPLE-RUNTIME-01-R2',coordinateConventionId:COORDINATE_CONVENTION_ID,productR4Status:rejected?'REJECTED_SHARED_FRACTIONAL_PHASE_ERROR':'REJECTION_UNPROVEN',productR6Status:rejected?'REJECTED_SHARED_FRACTIONAL_PHASE_ERROR':'REJECTION_UNPROVEN',directReferenceStatus:rejected?'REJECTED_SHARED_FRACTIONAL_PHASE_ERROR':'REJECTION_UNPROVEN',productReferenceParitySufficiency:false,negativeControlDetected:negativeReceipt.negativeControlDetected===true,requiredRepairPatch:'TDT-RESAMPLE-RUNTIME-01-R4',productionPointerMutated:false,currentProductMathematicalStatus:rejected?'REJECTED_SHARED_FRACTIONAL_PHASE_ERROR':'REJECTION_UNPROVEN',physicalGpuExecutionClaim:false,filesR4MustVersion:Object.values(PARENT_FILES).slice(0,6).map((entry)=>entry[0])};
writeJson('TDT_RESAMPLE_RUNTIME_01_R3_CURRENT_PRODUCT_REJECTION_RECEIPT.json',rejection);
if(!pass||!rejected){console.error(checks.filter((entry)=>!entry.pass));process.exit(1);}console.log(`PASS R3 shared source error proof assets=${assets.length} modelError=${maxModelError}`);
