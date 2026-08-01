import {loadCandidate} from './create-promotion-intent.mjs';import {performCas} from './cas-common.mjs';
export function promoteCas(){return performCas('PROMOTE','R10_PROMOTION_INTENT.json','R10_PROMOTION_CAS_RECEIPT.json',loadCandidate(),null);}
if(import.meta.url===`file://${process.argv[1]}`)promoteCas();
