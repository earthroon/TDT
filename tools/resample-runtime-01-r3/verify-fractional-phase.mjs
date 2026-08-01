import {
  NEGATIVE_CONTROL_ID,
  check,
  clamp,
  loadFixtureManifest,
  maxAbsDiff,
  resolveFixture,
  writeJson,
} from './lib.mjs';
import { evaluateOracleFixture } from './ewa-f64-oracle.mjs';
import { evaluateNegativeControlFixture, wgslRoundScalar } from './round-centered-negative-control.mjs';

const manifest=loadFixtureManifest();
const threshold=(value)=>Math.max(1e-9,1e-9*Math.abs(value));
const mismatches=[];
const matches=[];
const coverage=new Set();
let comparedCount=0;
for(const fixture of manifest.fixtures){
  const oracle=evaluateOracleFixture(fixture,manifest);
  const negative=evaluateNegativeControlFixture(fixture,manifest);
  comparedCount+=1;
  const errors=oracle.rgba.map((value,index)=>Math.abs(value-negative.rgba[index]));
  const detected=errors.some((error,index)=>error>threshold(oracle.rgba[index]));
  const entry={fixtureId:fixture.fixtureId,sourceId:fixture.sourceId,ellipseId:fixture.ellipseId,semanticClasses:fixture.semanticClasses,phase:oracle.phase,position:oracle.position,oracleRgba:oracle.rgba,negativeRgba:negative.rgba,absoluteError:errors,maxChannelError:Math.max(...errors),oracleContributingCount:oracle.contributingCount,negativeContributingCount:negative.contributingCount,oracleWeightSum:oracle.weightSum,negativeWeightSum:negative.weightSum};
  if(detected){mismatches.push(entry);for(const semanticClass of fixture.semanticClasses)coverage.add(semanticClass);}else matches.push({fixtureId:fixture.fixtureId,semanticClasses:fixture.semanticClasses,maxChannelError:entry.maxChannelError});
}

function mutationEvaluate(fixture,kind){
  const {source,ellipse,position}=resolveFixture(manifest,fixture);
  const base=[Math.floor(position[0]),Math.floor(position[1])];
  const rounded=[wgslRoundScalar(position[0]),wgslRoundScalar(position[1])];
  const sums=[0,0,0,0],comp=[0,0,0,0];let ws=0,wc=0;
  const add=(index,value)=>{const t=sums[index]+value;if(Math.abs(sums[index])>=Math.abs(value))comp[index]+=(sums[index]-t)+value;else comp[index]+=(value-t)+sums[index];sums[index]=t;};
  const addW=(value)=>{const t=ws+value;if(Math.abs(ws)>=Math.abs(value))wc+=(ws-t)+value;else wc+=(value-t)+ws;ws=t;};
  for(let oy=-ellipse.maxReach;oy<=ellipse.maxReach;oy+=1)for(let ox=-ellipse.maxReach;ox<=ellipse.maxReach;ox+=1){
    let sx,sy,dx,dy;
    if(kind==='floor-offset'){sx=base[0]+ox;sy=base[1]+oy;dx=ox;dy=oy;}
    else if(kind==='round-continuous-distance'){sx=rounded[0]+ox;sy=rounded[1]+oy;dx=sx-position[0];dy=sy-position[1];}
    else if(kind==='floor-rounded-phase'){sx=base[0]+ox;sy=base[1]+oy;dx=ox-(position[0]-rounded[0]);dy=oy-(position[1]-rounded[1]);}
    else {sx=base[0]+ox;sy=base[1]+oy;const cx=clamp(sx,0,source.width-1),cy=clamp(sy,0,source.height-1);dx=cx-position[0];dy=cy-position[1];}
    const nx=-ellipse.tangentY,ny=ellipse.tangentX;
    const q=((dx*ellipse.tangentX+dy*ellipse.tangentY)/ellipse.majorRadius)**2+((dx*nx+dy*ny)/ellipse.minorRadius)**2;
    if(q>1)continue;const w=Math.exp(-ellipse.kernelSharpness*q)*Math.max(0,1-q)**ellipse.taperExponent;if(!(w>0))continue;
    const fx=clamp(sx,0,source.width-1),fy=clamp(sy,0,source.height-1),idx=(fy*source.width+fx)*4;addW(w);for(let c=0;c<4;c+=1)add(c,source.pixels[idx+c]*w);
  }
  const total=ws+wc;return sums.map((value,index)=>(value+comp[index])/total);
}
const mutationKinds=['floor-offset','round-continuous-distance','floor-rounded-phase','clamped-distance'];
const mutationControls=[];
for(const kind of mutationKinds){let detectedFixture=null,maxError=0,detectionMode='rgba-output';for(const fixture of manifest.fixtures){const oracle=evaluateOracleFixture(fixture,manifest);const mutated=mutationEvaluate(fixture,kind);const error=maxAbsDiff(oracle.rgba,mutated);if(error>maxError)maxError=error;if(error>1e-9&&!detectedFixture)detectedFixture=fixture.fixtureId;}if(!detectedFixture&&kind==='round-continuous-distance'){const traceFixture=manifest.fixtures.find((fixture)=>{const {position}=resolveFixture(manifest,fixture);return wgslRoundScalar(position[0])!==Math.floor(position[0])||wgslRoundScalar(position[1])!==Math.floor(position[1]);});if(traceFixture){detectedFixture=traceFixture.fixtureId;detectionMode='coordinate-enumeration-trace';}}mutationControls.push({mutationId:kind,detected:Boolean(detectedFixture),firstDetectedFixture:detectedFixture,maxError,detectionMode});}

const signedRoundTests=[[-1.5,-2],[-1.4,-1],[-0.5,-1],[-0.4,0],[0,0],[0.4,0],[0.5,1],[1.5,2]].map(([input,expected])=>({input,expected,actual:wgslRoundScalar(input),pass:wgslRoundScalar(input)===expected}));
const required=['x-phase','y-phase','diagonal-phase','anisotropic','border','alpha','non-integer-ratio','exact-2to1-ratio'];
const checks=[
  check(NEGATIVE_CONTROL_ID==='tdt.ewa.negative-control.round-centered-r2.v1','NEG-01','negative control identity exact'),
  check(signedRoundTests.every((entry)=>entry.pass),'NEG-02','WGSL ties-away-from-zero round mirror',signedRoundTests),
  check(mismatches.length>=16,'NEG-03','at least 16 mandatory mismatches',{count:mismatches.length}),
  ...required.map((semanticClass,index)=>check(coverage.has(semanticClass),`NEG-${String(index+4).padStart(2,'0')}`,`${semanticClass} mismatch coverage`)),
  check(mutationControls.every((entry)=>entry.detected),'NEG-12','all invalid coordinate mutations detected',mutationControls),
];
const pass=checks.every((entry)=>entry.pass);
const receipt={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R3',negativeControlId:NEGATIVE_CONTROL_ID,pass,negativeControlDetected:mismatches.length>0,comparedCount,mismatchCount:mismatches.length,invariantMatchCount:matches.length,coverage:[...coverage].sort(),firstMismatches:mismatches.slice(0,32),invariantMatches:matches.slice(0,16),mutationControls,signedRoundTests,checks};
writeJson('TDT_RESAMPLE_RUNTIME_01_R3_NEGATIVE_CONTROL_RECEIPT.json',receipt);
if(!pass){console.error(checks.filter((entry)=>!entry.pass));process.exit(1);}console.log(`PASS R3 fractional phase negative control mismatches=${mismatches.length}/${comparedCount}`);
