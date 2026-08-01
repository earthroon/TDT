import {createIntent,loadCandidate} from './create-promotion-intent.mjs';
export function createRepromotionIntent(){return createIntent('REPROMOTE',loadCandidate(),null);}
if(import.meta.url===`file://${process.argv[1]}`)createRepromotionIntent();
