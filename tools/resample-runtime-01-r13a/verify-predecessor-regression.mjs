
import { check, sha256File, sourceArtifact, seal } from './lib.mjs'; import { PARENT_RECEIPT, PARENT_RECEIPT_SHA256, OLD_R13_RECEIPT, OLD_R13_RECEIPT_SHA256 } from './identity.mjs';
check(sha256File(PARENT_RECEIPT)===PARENT_RECEIPT_SHA256,'E_R13A_PARENT_FREEZE_MISMATCH','R12A parent receipt changed'); check(sha256File(OLD_R13_RECEIPT)===OLD_R13_RECEIPT_SHA256,'E_R13A_SUPERSEDED_R13_EVIDENCE','old R13 historical receipt changed');
sourceArtifact('R13A_PREDECESSOR_REGRESSION_REPORT.json',seal({schemaVersion:1,isolatedRun:true,parentSnapshot:'immutable-hash-snapshot',passed:2,failed:0,parentReceiptSha256:PARENT_RECEIPT_SHA256,oldR13ReceiptSha256:OLD_R13_RECEIPT_SHA256})); console.log('PASS R13A isolated R12A and historical R13 predecessor snapshot regression 2/2');
