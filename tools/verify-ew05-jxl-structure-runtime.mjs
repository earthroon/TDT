import fs from 'node:fs';
import { injectResolutionIntoJxl } from '../app/legacy-runtime/metadata/resolution_ssot.js';

function readU32BE(bytes, offset) {
  return (((bytes[offset] << 24) >>> 0) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}
function ascii(bytes, offset, length) { return String.fromCharCode(...bytes.subarray(offset, offset + length)); }
function parse(bytes) {
  if (bytes.length < 12 || readU32BE(bytes, 0) !== 12 || ascii(bytes, 4, 4) !== 'JXL ') throw new Error('signature');
  const boxes=[]; let offset=0;
  while(offset<bytes.length){
    if(offset+8>bytes.length) throw new Error('truncated-header');
    const lbox=readU32BE(bytes,offset); const type=ascii(bytes,offset+4,4); let size=lbox; let header=8;
    if(lbox===1){ if(offset+16>bytes.length) throw new Error('truncated-xlbox'); const high=readU32BE(bytes,offset+8); const low=readU32BE(bytes,offset+12); if(high!==0) throw new Error('large-box'); size=low; header=16; }
    else if(lbox===0) size=bytes.length-offset;
    if(size<header||offset+size>bytes.length) throw new Error(`truncated-${type}`);
    boxes.push({type,size}); offset+=size; if(lbox===0) break;
  }
  if(offset!==bytes.length) throw new Error('trailing');
  const count=(type)=>boxes.filter((b)=>b.type===type).length;
  if(count('ftyp')!==1||count('jxlc')!==1||count('jxlp')!==0||count('Exif')!==1||count('xml ')!==1) throw new Error('cardinality');
  return {boxTypes:boxes.map((b)=>b.type),ftypCount:count('ftyp'),jxlcCount:count('jxlc'),jxlpCount:count('jxlp'),exifCount:count('Exif'),xmlCount:count('xml '),eofExact:true};
}

const raw = new Uint8Array([0xff,0x0a,0x00,0x01,0x02,0x03,0x04,0x05]);
const container = injectResolutionIntoJxl(raw, { dpiX: 300, dpiY: 240, unit: 'inch', source: 'ew05-smoke' });
const evidence = parse(container);
let truncatedRejected=false;
try { parse(container.subarray(0, container.length-1)); } catch { truncatedRejected=true; }
let carrierConflictRejected=false;
try {
  const extra = new Uint8Array(8+2); extra.set([0,0,0,10,0x6a,0x78,0x6c,0x70,0,0]);
  const bad = new Uint8Array(container.length+extra.length); bad.set(container); bad.set(extra,container.length); parse(bad);
} catch { carrierConflictRejected=true; }
if(!truncatedRejected||!carrierConflictRejected) throw new Error('negative fixture rejection failed');
const report={schema:'tdt-export-worker-05-jxl-container-structure-smoke-v1',status:'PASS',sourceBakeOnly:true,actualJxlEncodeExecuted:false,independentDecoderExecuted:false,containerByteLength:container.byteLength,...evidence,truncatedRejected,carrierConflictRejected};
fs.mkdirSync('artifacts/runtime',{recursive:true});
fs.writeFileSync('artifacts/runtime/EW05_JXL_CONTAINER_STRUCTURE_SMOKE.json',JSON.stringify(report,null,2)+'\n');
console.log(`PASS RT-EW05-CONTAINER-SMOKE boxes=${evidence.boxTypes.join(',')} bytes=${container.byteLength}`);
