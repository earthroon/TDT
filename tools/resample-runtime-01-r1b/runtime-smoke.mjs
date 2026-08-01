import fs from 'node:fs/promises';
import { writeJson, check } from './lib.mjs';
if(!globalThis.crypto) globalThis.crypto=(await import('node:crypto')).webcrypto;
Object.defineProperty(globalThis,'navigator',{value:{gpu:{}},configurable:true});
globalThis.GPUShaderStage={COMPUTE:4};
globalThis.GPUBufferUsage={COPY_DST:8,UNIFORM:64,MAP_READ:1};
globalThis.GPUTextureUsage={COPY_SRC:1,COPY_DST:2,TEXTURE_BINDING:4,STORAGE_BINDING:8};
globalThis.GPUMapMode={READ:1};
const nativeFetch=globalThis.fetch;
globalThis.fetch=async(url)=>{const u=url instanceof URL?url:new URL(String(url));if(u.protocol==='file:'){const text=await fs.readFile(u,'utf8');return {ok:true,status:200,text:async()=>text};}return nativeFetch(url);};

const metrics={texturesCreated:0,texturesDestroyed:0,buffersCreated:0,buffersDestroyed:0,uploads:0,bufferWrites:0,submits:0,fences:0,dispatches:0,copies:0,maps:0};
class MockBuffer{constructor(size){this.size=size;this.data=new ArrayBuffer(size);this.destroyed=false;}async mapAsync(){metrics.maps++;}getMappedRange(){return this.data;}unmap(){}destroy(){if(!this.destroyed){this.destroyed=true;metrics.buffersDestroyed++;}}}
class MockTexture{constructor(width,height,format,label=''){this.width=width;this.height=height;this.format=format;this.size=[width,height];this.label=label;this.destroyed=false;}createView(){return {texture:this};}destroy(){if(!this.destroyed){this.destroyed=true;metrics.texturesDestroyed++;}}}
const pipeline={getBindGroupLayout(){return {id:'layout'};}};
const device={
 limits:{maxComputeWorkgroupStorageSize:32768},
 queue:{writeBuffer(){metrics.bufferWrites++;},writeTexture(){metrics.uploads++;},submit(){metrics.submits++;},async onSubmittedWorkDone(){metrics.fences++;}},
 pushErrorScope(){},async popErrorScope(){return null;},
 createShaderModule(){return {async getCompilationInfo(){return {messages:[]};}};},
 createBindGroupLayout(d){return {descriptor:d};},createPipelineLayout(d){return {descriptor:d};},createComputePipeline(){return pipeline;},
 createSampler(){return {kind:'sampler'};},
 createBuffer({size}){metrics.buffersCreated++;return new MockBuffer(size);},
 createTexture({size,format,label}){metrics.texturesCreated++;return new MockTexture(Number(size.width??size[0]),Number(size.height??size[1]),format,label);},
 createBindGroup(d){return {descriptor:d};},
 createCommandEncoder(){return {beginComputePass(){return {setPipeline(){},setBindGroup(){},dispatchWorkgroups(){metrics.dispatches++;},end(){}};},copyTextureToBuffer(_s,d){metrics.copies++;if(d.buffer?.data)new Uint8Array(d.buffer.data).fill(17);},finish(){return {};}};},
};
let identity={state:'ACTIVE',runtimeEpoch:12,deviceEpoch:5,deviceIdentity:'mock-r1b-device'};
globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__=Object.freeze({
 getCurrentIdentity(){return {...identity};},
 async acquireLease(){return {runtimeEpoch:identity.runtimeEpoch,deviceEpoch:identity.deviceEpoch,deviceIdentity:identity.deviceIdentity,device,assertCurrent(){if(identity.state!=='ACTIVE')throw Object.assign(new Error('stale'),{code:'E_GPU_STALE_LEASE'});},release(){}};},
 registerRecoveryParticipant(){return ()=>{};},
 createShaderModule(_o,_i,d){return device.createShaderModule(d);},
 createComputePipeline(){return pipeline;},
});

const { createDeltaKStack, runDeltaKStack, getDeltaKEwaOutputMetadata, getDeltaKEwaR1BTelemetry } = await import('../../app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs');
const { registerEwaTextureMetadata } = await import('../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_contract.mjs');
const { downscaleRGBAWithWGSL, getExportEwaR1BReceipt } = await import('../../app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js');

const source=new MockTexture(64,64,'rgba16float','source');
const tensor=new MockTexture(64,64,'rgba16float','tensor');
registerEwaTextureMetadata(source,{width:64,height:64,format:'rgba16float'});
registerEwaTextureMetadata(tensor,{width:64,height:64,format:'rgba16float'});
const pipes=await createDeltaKStack(device);
let coreCount=0;
const finalTex=await runDeltaKStack({device,pipes,srcTex:source,tensorTex:tensor,scale:0.125,runtimeEpoch:12,deviceEpoch:5,jobId:'r1b-delta',runDeltaKCore:async()=>{coreCount++;}});
const deltaReceipt=getDeltaKEwaOutputMetadata(finalTex);
let cancelled=false;const controller=new AbortController();controller.abort();
try{await runDeltaKStack({device,pipes,srcTex:source,tensorTex:tensor,scale:0.125,runtimeEpoch:12,deviceEpoch:5,jobId:'r1b-cancel',abortSignal:controller.signal});}catch(e){cancelled=e.code==='E_R1B_CANCELLED';}

const rgba=new Uint8Array(64*64*4);for(let i=0;i<rgba.length;i+=4){rgba[i]=80;rgba[i+1]=120;rgba[i+2]=160;rgba[i+3]=255;}
const exportOut=await downscaleRGBAWithWGSL(rgba,64,64,8,8,{alphaMode:'premultiplied'});
const exportReceipt=getExportEwaR1BReceipt(exportOut);
const identityInput=new Uint8Array([1,2,3,4]);
const identityOut=await downscaleRGBAWithWGSL(identityInput,1,1,1,1,{});
const identityReceipt=getExportEwaR1BReceipt(identityOut);

const checks=[
 check(finalTex.width===8&&finalTex.height===8,'runtime-delta-final-size','Delta final exact'),
 check(deltaReceipt?.stageCount===3,'runtime-delta-stage-count','Delta multistage count',{actual:deltaReceipt?.stageCount}),
 check(deltaReceipt?.stages?.length===3,'runtime-delta-receipt-chain','Delta stage receipts'),
 check(coreCount===1,'runtime-delta-core-once','Delta core exactly once',{coreCount}),
 check(source.destroyed===false,'runtime-source-retained','caller source retained'),
 check(finalTex.destroyed===false,'runtime-final-transferred','final texture transferred'),
 check(cancelled,'runtime-cancelled','cancellation fail closed'),
 check(exportOut instanceof Uint8Array&&exportOut.length===8*8*4,'runtime-export-length','Export output exact'),
 check(exportReceipt?.stageCount>1,'runtime-export-multistage','Export multistage'),
 check(exportReceipt?.uploadCount===1,'runtime-export-upload-once','single upload'),
 check(exportReceipt?.readbackCount===1,'runtime-export-readback-once','single readback'),
 check(exportReceipt?.intermediateReadbackCount===0,'runtime-export-no-mid-readback','no intermediate readback'),
 check(exportReceipt?.stages?.slice(0,-1).every(s=>s.outputFormat==='rgba16float'),'runtime-export-mid-format','intermediate format'),
 check(exportReceipt?.stages?.at(-1)?.outputFormat==='rgba8unorm','runtime-export-final-format','final format'),
 check(identityOut!==identityInput&&identityOut[0]===1&&identityReceipt?.identityCopy===true,'runtime-identity-copy','identity copy'),
 check(metrics.uploads===1,'runtime-metric-upload','mock upload count',{actual:metrics.uploads}),
 check(metrics.copies===1&&metrics.maps===1,'runtime-metric-readback','mock final readback only',{copies:metrics.copies,maps:metrics.maps}),
];
const failed=checks.filter(x=>!x.pass);const report={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R1B',pass:failed.length===0,counts:{pass:checks.length-failed.length,fail:failed.length},checks,deltaReceipt,exportReceipt,identityReceipt,metrics,telemetry:getDeltaKEwaR1BTelemetry()};writeJson('r1b-runtime-smoke.json',report);if(failed.length){console.error(failed);process.exit(1);}console.log(`PASS R1B mock runtime ${checks.length}/${checks.length}`);
