import fs from 'node:fs/promises';import {writeJson,check} from './lib.mjs';
if(!globalThis.crypto)globalThis.crypto=(await import('node:crypto')).webcrypto;Object.defineProperty(globalThis,'navigator',{value:{gpu:{}},configurable:true});globalThis.GPUShaderStage={COMPUTE:4};globalThis.GPUBufferUsage={COPY_DST:8,UNIFORM:64,MAP_READ:1};globalThis.GPUTextureUsage={COPY_SRC:1,COPY_DST:2,TEXTURE_BINDING:4,STORAGE_BINDING:8};globalThis.GPUMapMode={READ:1};
const nativeFetch=globalThis.fetch;globalThis.fetch=async(url)=>{const u=url instanceof URL?url:new URL(String(url));if(u.protocol==='file:'){const text=await fs.readFile(u,'utf8');return{ok:true,status:200,text:async()=>text};}return nativeFetch(url);};
const metrics={texturesCreated:0,texturesDestroyed:0,buffersCreated:0,buffersDestroyed:0,uploads:0,bufferWrites:0,submits:0,fences:0,dispatches:0,copies:0,maps:0};
class MockBuffer{constructor(size){this.size=size;this.data=new ArrayBuffer(size);this.destroyed=false;}async mapAsync(){metrics.maps++;}getMappedRange(){return this.data;}unmap(){}destroy(){if(!this.destroyed){this.destroyed=true;metrics.buffersDestroyed++;}}}
class MockTexture{constructor(width,height,format,label=''){this.width=width;this.height=height;this.format=format;this.size=[width,height];this.label=label;this.destroyed=false;}createView(){return{texture:this};}destroy(){if(!this.destroyed){this.destroyed=true;metrics.texturesDestroyed++;}}}
const pipeline={getBindGroupLayout(){return{id:'layout'};}};
const device={limits:{maxComputeWorkgroupStorageSize:32768},queue:{writeBuffer(){metrics.bufferWrites++;},writeTexture(){metrics.uploads++;},submit(){metrics.submits++;},async onSubmittedWorkDone(){metrics.fences++;}},pushErrorScope(){},async popErrorScope(){return null;},createShaderModule(){return{async getCompilationInfo(){return{messages:[]};}};},createBindGroupLayout(d){return{descriptor:d};},createPipelineLayout(d){return{descriptor:d};},createComputePipeline(){return pipeline;},createSampler(){return{kind:'sampler'};},createBuffer({size}){metrics.buffersCreated++;return new MockBuffer(size);},createTexture({size,format,label}){metrics.texturesCreated++;return new MockTexture(Number(size.width??size[0]),Number(size.height??size[1]),format,label);},createBindGroup(d){return{descriptor:d};},createCommandEncoder(){return{beginComputePass(){return{setPipeline(){},setBindGroup(){},dispatchWorkgroups(){metrics.dispatches++;},end(){}};},copyTextureToBuffer(_s,d){metrics.copies++;if(d.buffer?.data)new Uint8Array(d.buffer.data).fill(23);},finish(){return{};}};}};
let gpuIdentity={state:'ACTIVE',runtimeEpoch:17,deviceEpoch:9,deviceIdentity:'mock-r1c-device'};
globalThis.__DADUM_GPU_AUTHORITY_BRIDGE__=Object.freeze({getCurrentIdentity(){return{...gpuIdentity};},async acquireLease(){return{runtimeEpoch:gpuIdentity.runtimeEpoch,deviceEpoch:gpuIdentity.deviceEpoch,deviceIdentity:gpuIdentity.deviceIdentity,device,assertCurrent(){if(gpuIdentity.state!=='ACTIVE')throw Object.assign(new Error('stale'),{code:'E_GPU_STALE_LEASE'});},release(){}};},registerRecoveryParticipant(){return()=>{};},createShaderModule(_o,_i,d){return device.createShaderModule(d);},createComputePipeline(){return pipeline;}});
const {createDeltaKStack,runDeltaKStack,getDeltaKEwaOutputMetadata,getDeltaKEwaR1CTelemetry}=await import('../../app/legacy-runtime/core/compute/qmap_webgpu/deltaK_stack_autoEWA.mjs');
const {registerEwaTextureMetadata}=await import('../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_contract.mjs');
const {downscaleRGBAWithWGSL,getExportEwaR1BReceipt}=await import('../../app/legacy-runtime/modules/dk_resample/export_wgsl_downscale.js');
const source=new MockTexture(64,64,'rgba16float','source');const legacyTensor=new MockTexture(64,64,'rgba16float','legacy-tensor');registerEwaTextureMetadata(source,{width:64,height:64,format:'rgba16float'});registerEwaTextureMetadata(legacyTensor,{width:64,height:64,format:'rgba16float'});
const pipes=await createDeltaKStack(device);let coreCount=0;
const canonicalOut=await runDeltaKStack({device,pipes,srcTex:source,tensorTex:legacyTensor,scale:.125,runtimeEpoch:17,deviceEpoch:9,jobId:'r1c-canonical',runDeltaKCore:async()=>{coreCount++;},tensorSigma:1.2,maxAnisotropy:3.2,coherenceExponent:1.4});
const canonicalReceipt=getDeltaKEwaOutputMetadata(canonicalOut);
const legacyOut=await runDeltaKStack(device,pipes,{srcTex:source,tensorTex:legacyTensor,scale:.5,runtimeEpoch:17,deviceEpoch:9,jobId:'r1c-legacy'});
const legacyReceipt=getDeltaKEwaOutputMetadata(legacyOut);
const rgba=new Uint8Array(64*64*4);for(let i=0;i<rgba.length;i+=4){rgba[i]=60;rgba[i+1]=130;rgba[i+2]=190;rgba[i+3]=255;}
const exportOut=await downscaleRGBAWithWGSL(rgba,64,64,8,8,{alphaMode:'premultiplied',tensorSigma:1.3,maxAnisotropy:3.5,coherenceExponent:1.5});const exportReceipt=getExportEwaR1BReceipt(exportOut);const telemetry=getDeltaKEwaR1CTelemetry();
const canonicalStages=canonicalReceipt?.stages??[],legacyStages=legacyReceipt?.stages??[],exportStages=exportReceipt?.stages??[];
const checks=[
 check(canonicalOut.width===8&&canonicalOut.height===8,'runtime-canonical-size','canonical final exact'),
 check(canonicalReceipt?.tensorTruthClaim===true,'runtime-canonical-truth','canonical chain truth'),
 check(canonicalStages.length===3&&canonicalStages.every(s=>s.tensorMode==='canonical-stage-local-r1c'),'runtime-canonical-stage-mode','all canonical stages'),
 check(canonicalStages.every(s=>s.tensorReceipt?.tensorFieldSchemaId==='tdt.structure-tensor.field.v1'),'runtime-field-schema','field schema receipts'),
 check(canonicalStages.every(s=>s.tensorReceipt?.tensorFieldWidth===s.sourceWidth&&s.tensorReceipt?.tensorFieldHeight===s.sourceHeight),'runtime-stage-local-size','field is stage-local'),
 check(canonicalStages.every(s=>s.legacyTensorInputPresent===true&&s.legacyTensorInputConsumed===false),'runtime-old-input-not-consumed','old object tensor accepted but ignored'),
 check(canonicalStages.every(s=>s.tensorTemporaryDestroyCount===5),'runtime-canonical-disposal','five tensor textures disposed per stage'),
 check(coreCount===1,'runtime-core-once','DeltaK core exactly once'),
 check(legacyReceipt?.tensorTruthClaim===false,'runtime-legacy-no-truth','legacy truth false'),
 check(legacyStages.every(s=>s.tensorMode==='legacy-external-v1'&&s.legacyTensorInputConsumed===true),'runtime-legacy-consumed','legacy tensor consumed'),
 check(exportOut.length===8*8*4,'runtime-export-length','export exact'),
 check(exportStages.length>1&&exportStages.every(s=>s.tensorTruthClaim===true),'runtime-export-tensor','export stage tensor truth'),
 check(exportStages.every(s=>s.tensorFieldWidth===s.sourceWidth&&s.tensorFieldHeight===s.sourceHeight),'runtime-export-stage-local','export stage-local tensor'),
 check(exportReceipt?.uploadCount===1&&exportReceipt?.readbackCount===1&&exportReceipt?.intermediateReadbackCount===0,'runtime-io-conservation','R1B IO conserved'),
 check(telemetry.canonicalStageCount===canonicalStages.length+exportStages.length,'runtime-canonical-telemetry','canonical stage telemetry',telemetry),
 check(telemetry.legacyStageCount===legacyStages.length,'runtime-legacy-telemetry','legacy stage telemetry',telemetry),
 check(metrics.dispatches>=canonicalStages.length*6+exportStages.length*7,'runtime-dispatch-depth','tensor and EWA dispatches executed',metrics),
 check(source.destroyed===false&&legacyTensor.destroyed===false,'runtime-caller-inputs-retained','caller inputs retained'),
];
const failed=checks.filter(x=>!x.pass);const report={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R1C',pass:failed.length===0,counts:{pass:checks.length-failed.length,fail:failed.length},checks,canonicalReceipt,legacyReceipt,exportReceipt,telemetry,metrics};writeJson('r1c-runtime-smoke.json',report);if(failed.length){console.error(failed);process.exit(1);}console.log(`PASS R1C mock runtime ${checks.length}/${checks.length}`);
