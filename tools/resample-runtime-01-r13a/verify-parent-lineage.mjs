
import { check, exists, json, sha256File, sourceArtifact, seal } from './lib.mjs';
import { PARENT_SPEC, PARENT_SPEC_SHA256, PARENT_RECEIPT, PARENT_RECEIPT_SHA256, OLD_R13_RECEIPT, OLD_R13_RECEIPT_SHA256, POINTER_A, POINTER_B, POINTER_SHA256, PARENT_BUNDLE_SHA256 } from './identity.mjs';
check(exists(PARENT_SPEC),'E_R13A_PARENT_FREEZE_MISMATCH','parent R12A spec missing'); check(sha256File(PARENT_SPEC)===PARENT_SPEC_SHA256,'E_R13A_PARENT_FREEZE_MISMATCH','parent R12A spec hash mismatch');
check(exists(PARENT_RECEIPT),'E_R13A_PARENT_FREEZE_MISMATCH','parent R12A source receipt missing'); check(sha256File(PARENT_RECEIPT)===PARENT_RECEIPT_SHA256,'E_R13A_PARENT_FREEZE_MISMATCH','parent R12A receipt hash mismatch');
check(exists(OLD_R13_RECEIPT),'E_R13A_SUPERSEDED_R13_EVIDENCE','old R13 receipt missing'); check(sha256File(OLD_R13_RECEIPT)===OLD_R13_RECEIPT_SHA256,'E_R13A_SUPERSEDED_R13_EVIDENCE','old R13 receipt hash mismatch');
check(sha256File(POINTER_A)===POINTER_SHA256&&sha256File(POINTER_B)===POINTER_SHA256,'E_R13A_POINTER_MUTATION_ATTEMPT','Production Pointer changed');
const parent=json(PARENT_RECEIPT); check(parent.state==='RESAMPLE_RUNTIME_R12A_ATOMIC_UPDATE_MAIN_INTEGRATION_SOURCE_SEALED_AWAITING_R11A_INSTALLED_AND_R10A_RELEASE','E_R13A_PARENT_FREEZE_MISMATCH','parent state mismatch');
sourceArtifact('R13A_PARENT_FREEZE_RECEIPT.json',seal({schemaVersion:1,parentBundleSha256:PARENT_BUNDLE_SHA256,parentSpecSha256:PARENT_SPEC_SHA256,parentReceiptSha256:PARENT_RECEIPT_SHA256,parentState:parent.state,parentCounts:parent.counts,productionPointerSha256:POINTER_SHA256,productionPointerMutated:false,localActivationPointerMutated:false}));
sourceArtifact('R13A_R13_SUPERSESSION_RECEIPT.json',seal({schemaVersion:1,oldR13ReceiptSha256:OLD_R13_RECEIPT_SHA256,status:'SUPERSEDED_BY_R13A',historicalPassCarryForward:0,currentLineageHead:'TDT-RESAMPLE-RUNTIME-01-R13A'}));
console.log('R13A parent and lineage PASS');
