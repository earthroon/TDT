import {loadCandidate} from './create-promotion-intent.mjs';import {performCas} from './cas-common.mjs';
export function repromoteCas(){return performCas('REPROMOTE','R10_REPROMOTION_INTENT.json','R10_REPROMOTION_CAS_RECEIPT.json',loadCandidate(),null);}
if(import.meta.url===`file://${process.argv[1]}`)repromoteCas();
