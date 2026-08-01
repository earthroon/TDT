import {runArtifact,readExternalJson,check,runId} from './lib.mjs';
export function createRollbackTrigger(){const x=readExternalJson('DADUM_R10_FAILURE_INJECTION_RECEIPT','E_R10_PROMOTED_SMOKE_FAILED');check(x.value.controlledFailureObserved===true,'E_R10_PROMOTED_SMOKE_FAILED','controlled failure not observed');const out={schemaVersion:1,runId:runId(),controlledFailureObserved:true,packageMutationPerformed:false,receiptPath:x.path,receiptSha256:x.sha256};runArtifact('R10_ROLLBACK_TRIGGER_RECEIPT.json',out);return out;}
if(import.meta.url===`file://${process.argv[1]}`)createRollbackTrigger();
