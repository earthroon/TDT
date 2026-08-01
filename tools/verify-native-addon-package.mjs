import fs from 'node:fs';
import path from 'node:path';
import { ARTIFACT_DIR, ROOT, sha256File, writeJson, walkFiles } from './ep02-build-lib.mjs';
const appDir=path.resolve(process.env.DADUM_PACKAGED_APP_DIR||path.join(ROOT,'release','win-unpacked'));
const canonicalRel='resources/app.asar.unpacked/native/decoder-rs/decoder_rs.win32-x64-msvc.node';
const canonicalPath=path.join(appDir,...canonicalRel.split('/'));
const candidates=walkFiles(appDir).filter((file)=>file.endsWith('.node'));
function peMachine(file){
  const b=fs.readFileSync(file);
  if(b.length<0x40||b.readUInt16LE(0)!==0x5a4d) return null;
  const off=b.readUInt32LE(0x3c);
  if(off+6>b.length||b.toString('ascii',off,off+4)!=='PE\0\0') return null;
  return b.readUInt16LE(off+4);
}
const records=candidates.map((file)=>({path:path.relative(appDir,file).replaceAll(path.sep,'/'),sha256:sha256File(file),byteLength:fs.statSync(file).size,machine:peMachine(file)}));
const release=records.filter((x)=>!/(?:debug|target\/debug)/i.test(x.path));
const debug=records.filter((x)=>/(?:debug|target\/debug)/i.test(x.path));
const expectedMachine=0x8664;
const canonicalRecord=records.find((x)=>x.path===canonicalRel);
const unexpected=records.filter((x)=>x.path!==canonicalRel);
const ok=records.length===1&&release.length===1&&debug.length===0&&unexpected.length===0&&!!canonicalRecord&&canonicalRecord.machine===expectedMachine;
const report={schemaVersion:1,patchId:'TDT-EXPORT-PROMOTION-02',status:ok?'NATIVE_ADDON_VERIFIED':'BLOCKED',appDir,expectedMachine,releaseCount:release.length,debugCount:debug.length,canonicalRel,canonicalPresent:fs.existsSync(canonicalPath),unexpectedCount:unexpected.length,records};
writeJson(path.join(ARTIFACT_DIR,'TDT_EXPORT_PROMOTION_02_NATIVE_ADDON_REPORT.json'),report);
console.log(`${ok?'PASS':'FAIL'} EP02 native addon release=${release.length} debug=${debug.length} machine=${release[0]?.machine??'missing'}`);
if(!ok) process.exit(1);
