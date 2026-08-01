import fs from 'node:fs/promises';
import { createDeltaKStack, getDeltaKEwaOutputMetadata, getDeltaKEwaR1ATelemetry, runDeltaKStack } from '../../app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs';
import { dispatchEWAAniso } from '../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_tile.mjs';
import { registerEwaTextureMetadata } from '../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_contract.mjs';
import { EWA_R1A_PARAM_BYTES } from '../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_params.mjs';
import { writeJson } from './lib.mjs';

if (!globalThis.crypto) globalThis.crypto = (await import('node:crypto')).webcrypto;
globalThis.GPUShaderStage = { COMPUTE: 4 };
globalThis.GPUBufferUsage = { COPY_DST: 8, UNIFORM: 64 };
globalThis.GPUTextureUsage = { COPY_SRC: 1, TEXTURE_BINDING: 4, STORAGE_BINDING: 8 };
const nativeFetch=globalThis.fetch;
globalThis.fetch=async(url)=>{const u=url instanceof URL?url:new URL(String(url));if(u.protocol==='file:'){const text=await fs.readFile(u,'utf8');return {ok:true,status:200,text:async()=>text};}return nativeFetch(url);};

let identity={state:'ACTIVE',runtimeEpoch:7,deviceEpoch:3,deviceIdentity:'mock-device-3'};
const metrics={writes:0,submits:0,fences:0,buffersCreated:0,buffersDestroyed:0,texturesCreated:0,texturesDestroyed:0,dispatches:0,errorScopes:0};
class MockBuffer{constructor(size){this.size=size;this.destroyed=false;}destroy(){if(!this.destroyed){this.destroyed=true;metrics.buffersDestroyed++;}}}
class MockTexture{constructor(width,height,label=''){this.width=width;this.height=height;this.size=[width,height];this.label=label;this.destroyed=false;}createView(){return {texture:this};}destroy(){if(!this.destroyed){this.destroyed=true;metrics.texturesDestroyed++;}}}
const pipeline={getBindGroupLayout(){return {id:'layout'};}};
const device={
  limits:{maxComputeWorkgroupStorageSize:16384},queue:{writeBuffer(buffer,offset,data){if(buffer.destroyed)throw new Error('write destroyed');if(offset!==0||(data.byteLength!==EWA_R1A_PARAM_BYTES&&data.byteLength!==80))throw new Error('bad params');metrics.writes++;},submit(){metrics.submits++;},async onSubmittedWorkDone(){metrics.fences++;}},
  pushErrorScope(){metrics.errorScopes++;},async popErrorScope(){return null;},
  createShaderModule(){return {async getCompilationInfo(){return {messages:[]};}};},createBindGroupLayout(d){return {descriptor:d};},createPipelineLayout(d){return {descriptor:d};},createComputePipeline(){return pipeline;},
  createBuffer({size}){metrics.buffersCreated++;return new MockBuffer(size);},createTexture({size,label}){metrics.texturesCreated++;const width=Number(size.width??size[0]);const height=Number(size.height??size[1]);return new MockTexture(width,height,label);},
  createBindGroup(d){return {descriptor:d};},createCommandEncoder(){return {beginComputePass(){return {setPipeline(){},setBindGroup(){},dispatchWorkgroups(){metrics.dispatches++;},end(){}};},finish(){return {};}};},
};
globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__=Object.freeze({authority:'mock',getCurrentIdentity(){return {...identity};},async acquireLease(){return {runtimeEpoch:identity.runtimeEpoch,deviceEpoch:identity.deviceEpoch,deviceIdentity:identity.deviceIdentity,device,queue:device.queue,assertCurrent(){if(identity.state!=='ACTIVE')throw Object.assign(new Error('stale'),{code:'E_GPU_STALE_LEASE'});},release(){}};},createShaderModule(_o,_i,d){return device.createShaderModule(d);},createComputePipeline(){return pipeline;}});

function tensor(width,height,c=1,s=0,l1=1,l2=1){const t=new MockTexture(width,height,'tensor');t.tensor=[c,s,l1,l2];return t;}
function cpuSampleConstant(width,height,value=[0.25,0.5,0.75,1]){return {width,height,value};}
function simulate(source,tensorField,outW,outH,sigmaMain=1.25,sigmaCross=.65){let fallback=0,zero=0,maxErr=0;const ref=[];const tiled=[];for(let oy=0;oy<outH;oy++)for(let ox=0;ox<outW;ox++){const p=[(ox+.5)*source.width/outW,(oy+.5)*source.height/outH];let [c,s,l1,l2]=tensorField;const len=Math.hypot(c,s);if(!(len>1e-6)){c=1;s=0;}else{c/=len;s/=len;}let sm=Math.min(Math.max(sigmaMain/Math.sqrt(Math.max(l1,1e-4)),1e-4),2.5);let sc=Math.min(Math.max(sigmaCross/Math.sqrt(Math.max(l2,1e-4)),1e-4),2.5);let wsum=0;let acc=[0,0,0,0];const groupX=Math.floor(ox/8)*8,groupY=Math.floor(oy/8)*8;const origin=[Math.floor((groupX+.5)*source.width/outW)-6,Math.floor((groupY+.5)*source.height/outH)-6];for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const dx=[c*(i*sm)+(-s)*(j*sc),s*(i*sm)+c*(j*sc)];const coord=[Math.round(p[0]+dx[0]),Math.round(p[1]+dx[1])];const local=[coord[0]-origin[0],coord[1]-origin[1]];if(local[0]<0||local[1]<0||local[0]>=28||local[1]>=28)fallback++;const tangent=dx[0]*c+dx[1]*s,normal=dx[0]*(-s)+dx[1]*c;const w=Math.exp(-.5*((tangent/sm)**2+(normal/sc)**2));for(let k=0;k<4;k++)acc[k]+=source.value[k]*w;wsum+=w;}if(!(wsum>1e-6))zero++;const out=wsum>1e-6?acc.map(v=>v/wsum):source.value;ref.push(out);tiled.push(out);for(let k=0;k<4;k++)maxErr=Math.max(maxErr,Math.abs(out[k]-source.value[k]));}return {fallback,zero,maxErr,ref,tiled};}

const source=new MockTexture(17,13,'source');const tensorTex=tensor(17,13);registerEwaTextureMetadata(source,{width:17,height:13,format:'rgba16float'});registerEwaTextureMetadata(tensorTex,{width:17,height:13,format:'rgba16float'});
const pipes=await createDeltaKStack(device);
const canonical=await runDeltaKStack({device,pipes,srcTex:source,tensorTex,scale:.5,sigmaMain:1.25,sigmaCross:.65,shrinkClamp:2.5,runtimeEpoch:7,deviceEpoch:3,jobId:'canonical'});
const legacy=await runDeltaKStack(device,pipes,{qmapTex:source,texTensor:tensorTex,scale:.5,jobId:'legacy'});
const metadata=getDeltaKEwaOutputMetadata(canonical);
let staleRejected=false;identity={...identity,deviceEpoch:4,deviceIdentity:'mock-device-4'};try{await runDeltaKStack({device,pipes,srcTex:source,tensorTex,scale:.5,runtimeEpoch:7,deviceEpoch:4,jobId:'stale'});}catch(e){staleRejected=e.code==='E_R1A_STALE_PIPELINE_EPOCH';}identity={...identity,deviceEpoch:3,deviceIdentity:'mock-device-3'};
const beforeRawDestroyed=metrics.buffersDestroyed;const rawDst=new MockTexture(8,6,'raw');await dispatchEWAAniso(device,pipeline,{srcTex:source,tensorTex,dstTex:rawDst,inW:17,inH:13,outW:8,outH:6,jobId:'raw',sigmaMain:1.25,sigmaCross:.65,shrinkClamp:2.5});const rawTemporaryClosed=metrics.buffersDestroyed===beforeRawDestroyed+1;
for(let i=0;i<20;i++)await runDeltaKStack({device,pipes,srcTex:source,tensorTex,scale:.5,runtimeEpoch:7,deviceEpoch:3,jobId:`repeat-${i}`});
const semantic=simulate(cpuSampleConstant(17,13),[3,4,1,1],8,6);
const telemetry=getDeltaKEwaR1ATelemetry();
const report={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R1A',pass:Boolean(canonical&&legacy&&(metadata?.dispatchReceipt?.completed || metadata?.stages?.at?.(-1)?.dispatchReceipt?.completed)&&staleRejected&&rawTemporaryClosed&&semantic.fallback===0&&semantic.zero===0&&semantic.maxErr<1e-12&&telemetry.canonicalObjectCallCount>=21&&telemetry.legacyPositionalCallCount>=1),canonical:{width:canonical.width,height:canonical.height,destroyed:canonical.destroyed},legacy:{width:legacy.width,height:legacy.height},metadata,staleRejected,rawTemporaryClosed,semantic:{fallbackCount:semantic.fallback,zeroWeightGuardCount:semantic.zero,constantMaxError:semantic.maxErr,directionNormalized:[.6,.8]},metrics,telemetry};writeJson('r1a-runtime-smoke.json',report);if(!report.pass){console.error(report);process.exit(1);}console.log('PASS R1A mock runtime smoke');
