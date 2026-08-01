import {check} from './lib.mjs';
import {SOURCE_STATE,CANDIDATE_STATE,PROMOTED_STATE,ROLLBACK_STATE,FINAL_RELEASE_STATE,FINAL_LINEAGE_STATE,REJECTED_STATE} from './identity.mjs';
export const ORDER=Object.freeze([SOURCE_STATE,CANDIDATE_STATE,PROMOTED_STATE,ROLLBACK_STATE,FINAL_RELEASE_STATE,FINAL_LINEAGE_STATE]);
export function transition(current,next){if(next===REJECTED_STATE)return next;const a=ORDER.indexOf(current),b=ORDER.indexOf(next);check(a>=0&&b>=0,'E_R10A_RECEIPT_SCHEMA_INVALID','unknown state',{current,next});check(b===a+1,'E_R10A_STATE_SKIP_FORBIDDEN','state transition must advance exactly one',{current,next});return next;}
export function assertNoRegression(current,next){const a=ORDER.indexOf(current),b=ORDER.indexOf(next);check(a>=0&&b>=a,'E_R10A_STATE_REGRESSION_FORBIDDEN','state regression forbidden',{current,next});return true;}
