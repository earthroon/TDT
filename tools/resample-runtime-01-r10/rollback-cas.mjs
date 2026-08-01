import {readPointerSet} from './pointer-reader.mjs';import {loadCandidate} from './create-promotion-intent.mjs';import {performCas} from './cas-common.mjs';
export function rollbackCas(){const p=readPointerSet().pointer;const previous={buildId:p.previousBuildId,packageContentId:p.previousPackageContentId,releaseProfileId:p.previousReleaseProfileId,qualificationReceipts:p.previousQualificationReceipts};return performCas('ROLLBACK','R10_ROLLBACK_INTENT.json','R10_ROLLBACK_CAS_RECEIPT.json',previous,previous);}
if(import.meta.url===`file://${process.argv[1]}`)rollbackCas();
