import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createE2EConfig, resolveE2EExportTarget } from '../app/electron/ep03-e2e-guard.mjs';
import { createSourceCandidatePointer, pointerDigest, promotePointerCas, writeJson } from './ep03-promotion-lib.mjs';

const shaText=(value)=>crypto.createHash('sha256').update(value).digest('hex');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'dadum-ep03-source-smoke-'));
try {
  const token='ab'.repeat(32);
  const root=path.join(temp,'exports');
  const config=createE2EConfig({DADUM_E2E_MODE:'1',DADUM_E2E_RUN_TOKEN:token,DADUM_E2E_EXPORT_ROOT:root},shaText);
  const target=resolveE2EExportTarget(config,token,'fixture.png');
  if(target.targetPath!==path.join(root,'fixture.png')) throw new Error('E_E2E_EXPORT_ROOT_ESCAPE');
  let tokenRejected=false; try{resolveE2EExportTarget(config,'00'.repeat(32),'x.png');}catch(e){tokenRejected=String(e.message)==='E_E2E_HARNESS_TOKEN_INVALID';}
  if(!tokenRejected) throw new Error('invalid token not rejected');
  let escapeRejected=false; try{resolveE2EExportTarget(config,token,'../escape.png');}catch(e){escapeRejected=String(e.message)==='E_E2E_EXPORT_ROOT_ESCAPE';}
  if(!escapeRejected) throw new Error('root escape not rejected');

  const source=createSourceCandidatePointer({previousPointer:null,candidateBuildId:'1'.repeat(24),candidateProfileId:'core-raster-v1',blockers:['source-only']});
  const pointerFile=path.join(temp,'pointer.json'); writeJson(pointerFile,source);
  const receiptFile=path.join(temp,'receipt.json'); writeJson(receiptFile,{status:'PASS',receiptConservationVerified:true});
  const promoted=promotePointerCas({pointerFile,expectedPreviousPointerSha256:source.pointerSha256,buildId:'2'.repeat(24),packageContentId:'3'.repeat(64),releaseProfileId:'core-raster-v1',promotionReceiptSha256:'4'.repeat(64)});
  if(promoted.activeBuildId!=='2'.repeat(24)||promoted.pointerSha256!==pointerDigest(promoted)) throw new Error('pointer promotion mismatch');
  let casRejected=false; try{promotePointerCas({pointerFile,expectedPreviousPointerSha256:source.pointerSha256,buildId:'5'.repeat(24),packageContentId:'6'.repeat(64),releaseProfileId:'core-raster-v1',promotionReceiptSha256:'7'.repeat(64)});}catch(e){casRejected=String(e.message)==='E_PROMOTION_POINTER_CAS_MISMATCH';}
  if(!casRejected) throw new Error('stale pointer CAS not rejected');
  console.log('PASS EP03 source runtime smoke: E2E guard + pointer CAS/readback');
} finally {
  fs.rmSync(temp,{recursive:true,force:true});
}
