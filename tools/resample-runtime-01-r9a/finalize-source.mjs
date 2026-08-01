import {json,check,sourceArtifact,seal,sha256File} from './lib.mjs';
import {SOURCE_STATE} from './identity.mjs';
const gate=json('artifacts/resample-runtime-01-r9a/source-bake/R9A_SOURCE_GATE_REPORT.json');
const physical=json('artifacts/resample-runtime-01-r9a/source-bake/R9A_PHYSICAL_GATE_STATUS.json');
check(gate.counts.PASS===286&&gate.counts.FAIL===0,'E_R9A_FINAL_SOURCE_GATE','R9A source gate not complete');
check(physical.counts.PENDING===214&&physical.counts.PASS===0,'E_R9A_FINAL_PHYSICAL_STATE','R9A physical state must remain pending');
const receipt=seal({schemaVersion:1,schemaId:'tdt.resample.single-submit-validation-performance.r9a.v1',patchId:'TDT-RESAMPLE-RUNTIME-01-R9A',state:SOURCE_STATE,counts:{PASS:286,PENDING:214,DEFERRED:0,SKIPPED:0,FAIL:0},sourcePass:286,physicalPass:0,pending:214,deferred:0,skipped:0,fail:0,sourceGates:gate.gates,physicalGates:physical.gates,canonicalJobEncoderCount:1,canonicalJobSubmitCount:1,previewQueueFenceAwaitCount:0,physicalPreviewOnSubmittedWorkDoneCount:null,exportPreMapFenceAwaitCount:0,physicalExportOnSubmittedWorkDoneCount:null,validationDoubleDispatchCount:0,uniformInFlightOverwriteCount:0,productionPointerMutated:false,localActivationPointerMutated:false,r8aReceiptCurrent:true,r10ThroughR13ReceiptsCurrent:false,nextAuthority:'TDT-RESAMPLE-RUNTIME-01-R10A',specSha256:sha256File('specs/TDT-RESAMPLE-RUNTIME-01-R9A_PRODUCTION_VALIDATION_COUNTER_SAMPLING_SINGLE_SUBMIT_MULTI_STAGE_COMMAND_GRAPH_UNIFORM_RING_ALLOCATION_QUEUE_FENCE_RETIREMENT_PHYSICAL_GPU_PERFORMANCE_CLOSURE_SEAL_SPEC.md')});
sourceArtifact('TDT_RESAMPLE_RUNTIME_01_R9A_SOURCE_FINAL_RECEIPT.json',receipt);
console.log('TDT-RESAMPLE-RUNTIME-01-R9A 286 SOURCE PASS / 214 PHYSICAL PENDING / 0 FAIL');
