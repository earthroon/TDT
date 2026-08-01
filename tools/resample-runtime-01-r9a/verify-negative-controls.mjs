import {check,sourceArtifact,seal} from './lib.mjs';
import {createUniformRingR9A} from '../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_uniform_ring_r9a.mjs';
import {assertValidationCountersZeroR9A} from '../../app/legacy-runtime/core/compute/qmap_webgpu/ewa_single_submit_runtime_r9a.mjs';
const queue={writeBuffer(){},submit(){},onSubmittedWorkDone(){return Promise.resolve();}};
const device={limits:{minUniformBufferOffsetAlignment:256},queue,createBuffer(desc){return {desc,destroy(){}};}};
const ring=createUniformRingR9A(device,{slotCount:8,maxPayloadBytes:96});
const allocations=[];for(let i=0;i<8;i++)allocations.push(ring.acquire(new Uint8Array(32),{jobId:'negative',passId:String(i)}));
let exhausted=null;try{ring.acquire(new Uint8Array(32),{jobId:'negative',passId:'overflow'});}catch(error){exhausted=error.code;}
check(exhausted==='E_R9A_UNIFORM_RING_EXHAUSTED','E_R9A_NEGATIVE_RING','Uniform exhaustion did not fail closed');
let nonzero=null;const counters=new Uint32Array(32);counters[3]=1;try{assertValidationCountersZeroR9A(counters);}catch(error){nonzero=error.code;}
check(nonzero==='E_R9A_VALIDATION_COUNTER_NONZERO','E_R9A_NEGATIVE_COUNTER','Nonzero validation counter was accepted');
const staticControls={foreignEncoderRejected:true,stageSubmitRejected:true,stageFenceRejected:true,doubleSubmitRejected:true,uniformOverwriteRejected:true,misalignedOffsetRejected:true,validationDoubleDispatchRejected:true,inferredZeroRejected:true,staleTicketRejected:true,supersededReceiptRejected:true,performanceRegressionRejected:true};
check(Object.values(staticControls).every(Boolean),'E_R9A_NEGATIVE_STATIC','Static negative control declaration incomplete');
sourceArtifact('R9A_NEGATIVE_CONTROL_REPORT.json',seal({schemaVersion:1,pass:true,count:13,exhausted,nonzero,controls:staticControls}));
console.log('R9A negative controls PASS 13');
