import {check,json,sourceArtifact,seal,sha256File} from './lib.mjs';
const reports=['R9A_PARENT_AND_LINEAGE_REPORT.json','R9A_COMMAND_GRAPH_SOURCE_REPORT.json','R9A_RUNTIME_MODULE_SELF_TEST.json','R9A_VALIDATION_SAMPLING_REPORT.json','R9A_FENCE_RETIREMENT_REPORT.json','R9A_NEGATIVE_CONTROL_REPORT.json','R9A_PRODUCT_WIRING_REPORT.json','R9A_PREDECESSOR_REGRESSION_REPORT.json'];
for(const name of reports)check(json(`artifacts/resample-runtime-01-r9a/source-bake/${name}`).pass===true,'E_R9A_SOURCE_REPORT_FAILED',`R9A report failed: ${name}`);
const report=seal({schemaVersion:1,pass:true,reports,sourcePassExpected:286,physicalPendingExpected:214,productionPointerMutated:false,localActivationPointerMutated:false,specSha256:sha256File('specs/TDT-RESAMPLE-RUNTIME-01-R9A_PRODUCTION_VALIDATION_COUNTER_SAMPLING_SINGLE_SUBMIT_MULTI_STAGE_COMMAND_GRAPH_UNIFORM_RING_ALLOCATION_QUEUE_FENCE_RETIREMENT_PHYSICAL_GPU_PERFORMANCE_CLOSURE_SEAL_SPEC.md')});
sourceArtifact('R9A_SOURCE_CONTRACT_REPORT.json',report);
console.log('R9A source contract PASS');
