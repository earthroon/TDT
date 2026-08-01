import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { canonicalToLegacyWorking, legacyWorkingToCanonical, srgbToLinear } from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_color_contract.mjs';
import { evaluateBakemonoRinneLegacyF32 } from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_formula_contract.mjs';
import { normalizeBakemonoRinnePhase } from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_phase_contract.mjs';
import { canonicalBakemonoRinneJson } from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_contract_receipt.mjs';
import { encodeF16, decodeF16 } from './half-float.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const OUT_DIR=path.join(ROOT,'artifacts/bakemono-rinne-wgsl-02/source');
const MANIFEST=path.join(OUT_DIR,'fixture-manifest.json');
const CORPUS=path.join(OUT_DIR,'fixture-corpus.json');
const REPORT=path.join(OUT_DIR,'cpu-oracle-fixture-report.json');
const shaBytes=(v)=>createHash('sha256').update(v).digest('hex');
const shaJson=(v)=>shaBytes(canonicalBakemonoRinneJson(v));
const bytesOfU16=(a)=>Buffer.from(a.buffer,a.byteOffset,a.byteLength);
const f=(v)=>Math.fround(v);
const clamp=(v)=>Math.min(1,Math.max(0,v));

function phaseReceipt(origin){
  const base=normalizeBakemonoRinnePhase({mode:'STILL_EXPLICIT',phaseOrigin:origin});
  return Object.freeze({...base,receiptDigest:shaJson(base)});
}
function pixelOracle(baseBits,qBits,sBits,aBits,hBits,eBits,phase,power,neonBoost,alphaEpsilon){
  const base=[...decodeF16(baseBits)]; const q=decodeF16(qBits)[0],s=decodeF16(sBits)[0],alphaDepth=decodeF16(aBits)[0],highlight=decodeF16(hBits)[0],edge=decodeF16(eBits)[0];
  const working=canonicalToLegacyWorking(base,{alphaEpsilon});
  const result=evaluateBakemonoRinneLegacyF32({base:[...working.rgb,working.alpha],q:f(q),s:f(s),alphaDepth:f(alphaDepth),highlight:f(highlight),edge:f(edge),phaseBase:f(phase.wrappedPhaseBase),power:f(power),neonBoost:f(neonBoost)});
  const canonical=legacyWorkingToCanonical(result.outputEncodedStraight.map(f));
  return encodeF16(canonical.map(f));
}
function makeFixture({fixtureId,width=1,height=1,baseFn,qFn,sFn,alphaDepthFn,highlightFn,edgeFn,phaseOrigin=0,power=1,neonBoost=1,alphaEpsilon=1e-6,tags=[]}){
  const pixels=width*height;const baseLogical=[],qLogical=[],sLogical=[],aLogical=[],hLogical=[],eLogical=[];
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=y*width+x;const encoded=(baseFn?.(x,y,i,width,height)??[0.23,0.47,0.71,1]).map(Number);const alpha=clamp(encoded[3]);
    baseLogical.push(srgbToLinear(clamp(encoded[0]))*alpha,srgbToLinear(clamp(encoded[1]))*alpha,srgbToLinear(clamp(encoded[2]))*alpha,alpha);
    qLogical.push(clamp(qFn?.(x,y,i,width,height)??0.55));sLogical.push(clamp(sFn?.(x,y,i,width,height)??0.65));aLogical.push(clamp(alphaDepthFn?.(x,y,i,width,height)??alpha));hLogical.push(clamp(highlightFn?.(x,y,i,width,height)??0.7));eLogical.push(clamp(edgeFn?.(x,y,i,width,height)??0.4));
  }
  const baseBits=encodeF16(baseLogical),qBits=encodeF16(qLogical),sBits=encodeF16(sLogical),alphaBits=encodeF16(aLogical),highlightBits=encodeF16(hLogical),edgeBits=encodeF16(eLogical);const phase=phaseReceipt(phaseOrigin);const expected=new Uint16Array(pixels*4);
  for(let i=0;i<pixels;i++)expected.set(pixelOracle(baseBits.subarray(i*4,i*4+4),qBits.subarray(i,i+1),sBits.subarray(i,i+1),alphaBits.subarray(i,i+1),highlightBits.subarray(i,i+1),edgeBits.subarray(i,i+1),phase,power,neonBoost,alphaEpsilon),i*4);
  const parameterBody={width,height,power,neonBoost,alphaEpsilon,phaseReceiptDigest:phase.receiptDigest};
  const row={fixtureId,width,height,encodedStraightSourceDigest:shaJson({fixtureId,width,height,baseLogical}),canonicalBaseF16Digest:shaBytes(bytesOfU16(baseBits)),qmapF16Digest:shaBytes(bytesOfU16(qBits)),scalarF16Digest:shaBytes(bytesOfU16(sBits)),alphaDepthF16Digest:shaBytes(bytesOfU16(alphaBits)),highlightF16Digest:shaBytes(bytesOfU16(highlightBits)),edgeF16Digest:shaBytes(bytesOfU16(edgeBits)),phaseReceiptDigest:phase.receiptDigest,parameterDigest:shaJson(parameterBody),expectedCpuOracleDigest:shaBytes(bytesOfU16(expected)),pixelCount:pixels,tags};
  const corpus={fixtureId,width,height,power,neonBoost,alphaEpsilon,phaseReceipt:phase,baseF16:[...baseBits],qmapF16:[...qBits],scalarF16:[...sBits],alphaDepthF16:[...alphaBits],highlightF16:[...highlightBits],edgeF16:[...edgeBits],expectedOutputF16:[...expected],tags};
  return {row,corpus};
}

export function buildBakemonoRinneWgsl02Fixtures(){
  const defs=[];const colors=[['transparent-black',[0,0,0,0]],['black',[0,0,0,1]],['white',[1,1,1,1]],['red',[1,0,0,1]],['green',[0,1,0,1]],['blue',[0,0,1,1]],['cyan',[0,1,1,1]],['magenta',[1,0,1,1]],['yellow',[1,1,0,1]],['gray018',[.18,.18,.18,1]],['gray05',[.5,.5,.5,1]],['near-black',[1/255,1/255,1/255,1]],['near-white',[254/255,254/255,254/255,1]]];
  const alphas=[0,1/255,.25,.5,.75,1],qs=[0,.299,.3,.45,.6,.601,1],ss=[0,.125,.5,1],phases=[0,6.283/4,6.283/2,3*6.283/4,6.283-1e-5,-0.25];
  for(let i=0;i<72;i++){const [colorId,color]=colors[i%colors.length],alpha=alphas[Math.floor(i/colors.length)%alphas.length],q=qs[i%qs.length],s=ss[Math.floor(i/qs.length)%ss.length],phase=phases[i%phases.length];defs.push({fixtureId:`unit-${String(i).padStart(3,'0')}-${colorId}`,baseFn:()=>[color[0],color[1],color[2],i===0?0:alpha],qFn:()=>q,sFn:()=>s,alphaDepthFn:()=>i%6===0?0:1,highlightFn:()=>i%4===1?1:i%4===3?1:0,edgeFn:()=>i%4===2?1:i%4===3?1:0,phaseOrigin:phase,power:i%5===0?2:1,neonBoost:i%7===0?3:1,tags:['formula-unit',colorId]});}
  const dims=[[2,2],[7,5],[17,13],[33,33]];for(const [w,h] of dims)defs.push({fixtureId:`surface-${w}x${h}`,width:w,height:h,baseFn:(x,y)=>[x/Math.max(1,w-1),y/Math.max(1,h-1),(x+y)/Math.max(1,w+h-2),((x+y)%7===0)?0:(x+1)/(w+1)],qFn:(x)=>x/Math.max(1,w-1),sFn:(_,y)=>y/Math.max(1,h-1),alphaDepthFn:(x,y)=>((x+y)%5)/4,highlightFn:(x)=>x%2,edgeFn:(_,y)=>y%2,phaseOrigin:.25,tags:['surface','odd-dimension']});
  defs.push({fixtureId:'ramp-alpha-33x1',width:33,height:1,baseFn:(x)=>[.6,.2,.8,x/32],qFn:()=>.8,sFn:()=>.8,alphaDepthFn:(x)=>x/32,highlightFn:()=>1,edgeFn:()=>1,phaseOrigin:.5,tags:['alpha-ramp']});
  defs.push({fixtureId:'ramp-q-threshold-33x1',width:33,height:1,baseFn:()=>[.23,.47,.71,1],qFn:(x)=>.25+x*(.4/32),sFn:()=>.7,alphaDepthFn:()=>1,highlightFn:()=>1,edgeFn:()=>1,phaseOrigin:0,tags:['q-threshold-ramp']});
  defs.push({fixtureId:'ramp-scalar-33x1',width:33,height:1,baseFn:()=>[.3,.6,.2,1],qFn:()=>.65,sFn:(x)=>x/32,alphaDepthFn:()=>1,highlightFn:()=>1,edgeFn:()=>1,phaseOrigin:0,tags:['scalar-ramp']});
  defs.push({fixtureId:'grid-phase-quadrants-8x8',width:8,height:8,baseFn:(x,y)=>[x/7,y/7,.5,1],qFn:()=>.7,sFn:()=>.8,alphaDepthFn:()=>1,highlightFn:()=>1,edgeFn:()=>1,phaseOrigin:6.283/4,tags:['phase-quadrant']});
  defs.push({fixtureId:'grid-mask-combinations-4x4',width:4,height:4,baseFn:()=>[.4,.3,.8,1],qFn:()=>.8,sFn:()=>.9,alphaDepthFn:(x,y)=>(x+y)%2,highlightFn:(x)=>x%2,edgeFn:(_,y)=>y%2,phaseOrigin:1.1,tags:['mask-combination']});
  const stress=[
    ['stress-cmyk-black',[0,0,0,1],1,1,1,1,1,0,8,8,['cmyk-black-branch']],
    ['stress-lab-threshold',[.008856,.008856,.008856,1],.7,.8,1,1,1,.2,2,2,['lab-threshold']],
    ['stress-out-of-gamut',[1,.01,.8,1],1,1,1,1,1,4.71,8,8,['out-of-gamut']],
    ['stress-tiny-alpha-below',[.8,.2,.6,5e-7],1,1,1,1,1,.5,8,8,['alpha-epsilon']],
    ['stress-tiny-alpha-above',[.8,.2,.6,2e-6],1,1,1,1,1,.5,8,8,['alpha-epsilon']],
  ];
  for(const [id,base,q,s,a,h,e,powerPhase,power,neonBoost,tags] of stress)defs.push({fixtureId:id,baseFn:()=>base,qFn:()=>q,sFn:()=>s,alphaDepthFn:()=>a,highlightFn:()=>h,edgeFn:()=>e,phaseOrigin:powerPhase,power,neonBoost,tags:['stress',...tags]});
  const built=defs.map(makeFixture);const rows=built.map(x=>x.row),corpusRows=built.map(x=>x.corpus);const body={schemaVersion:1,schemaId:'tdt.effect.bakemono-rinne.wgsl02.fixture-manifest.v1',patchId:'TDT-BAKEMONO-RINNE-WGSL-02',fixtureCount:rows.length,pixelCount:rows.reduce((n,r)=>n+r.pixelCount,0),rows};const manifest={...body,manifestDigest:shaJson(body)};
  let nonfiniteCount=0,alphaMismatchCount=0,hiddenRgbLeakCount=0;for(const fixture of corpusRows){const base=decodeF16(Uint16Array.from(fixture.baseF16)),out=decodeF16(Uint16Array.from(fixture.expectedOutputF16));for(let i=0;i<fixture.width*fixture.height;i++){for(let c=0;c<4;c++)if(!Number.isFinite(out[i*4+c]))nonfiniteCount++;if(fixture.expectedOutputF16[i*4+3]!==fixture.baseF16[i*4+3])alphaMismatchCount++;if(out[i*4+3]<=fixture.alphaEpsilon&&(out[i*4]!==0||out[i*4+1]!==0||out[i*4+2]!==0))hiddenRgbLeakCount++;}}
  const reportBody={schemaVersion:1,schemaId:'tdt.effect.bakemono-rinne.wgsl02.cpu-oracle-fixture-report.v1',patchId:'TDT-BAKEMONO-RINNE-WGSL-02',status:nonfiniteCount===0&&alphaMismatchCount===0&&hiddenRgbLeakCount===0&&rows.length>=64?'PASS':'FAIL',physicalComparisonPerformed:false,fixtureManifestDigest:manifest.manifestDigest,fixtureCount:rows.length,pixelCount:body.pixelCount,nonfiniteCount,alphaMismatchCount,hiddenRgbLeakCount,maxAbsoluteError:null,meanAbsoluteError:null,p99AbsoluteError:null,maxHalfUlpDistance:null,pixelsOver1Ulp:null,pixelsOver2Ulp:null,pixelsOver4Ulp:null,firstMismatch:null,oracleAuthority:'WGSL-01_PARENT_F32_F16_AWARE'};const report={...reportBody,selfSha256:shaJson(reportBody)};
  return {manifest,corpus:{schemaVersion:1,schemaId:'tdt.effect.bakemono-rinne.wgsl02.fixture-corpus.v1',patchId:'TDT-BAKEMONO-RINNE-WGSL-02',fixtureManifestDigest:manifest.manifestDigest,fixtures:corpusRows},report};
}

export function writeBakemonoRinneWgsl02Fixtures(){const {manifest,corpus,report}=buildBakemonoRinneWgsl02Fixtures();fs.mkdirSync(OUT_DIR,{recursive:true});fs.writeFileSync(MANIFEST,JSON.stringify(manifest,null,2)+'\n');fs.writeFileSync(CORPUS,JSON.stringify(corpus)+'\n');fs.writeFileSync(REPORT,JSON.stringify(report,null,2)+'\n');return {manifest,corpus,report};}
if(import.meta.url===pathToFileURL(process.argv[1]).href){const r=writeBakemonoRinneWgsl02Fixtures();console.log(`${r.report.status} fixtures=${r.manifest.fixtureCount} pixels=${r.manifest.pixelCount}`);if(r.report.status!=='PASS')process.exitCode=1;}
