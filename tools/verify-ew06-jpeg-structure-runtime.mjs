import fs from 'node:fs';

const u16 = (n) => Uint8Array.of((n >>> 8) & 255, n & 255);
const concat = (chunks) => { const out = new Uint8Array(chunks.reduce((s,c)=>s+c.length,0)); let o=0; for(const c of chunks){out.set(c,o);o+=c.length;} return out; };
const segment = (marker, payload) => concat([Uint8Array.of(0xff,marker),u16(payload.length+2),payload]);
const jfif = segment(0xe0, Uint8Array.of(0x4a,0x46,0x49,0x46,0,1,2,1,1,44,0,72,0,0));
const dqt = segment(0xdb, Uint8Array.of(0,...new Uint8Array(64).fill(1)));
const sofPayload = Uint8Array.of(8,0,2,0,3,3,1,0x11,0,2,0x11,1,3,0x11,1);
const sof0 = segment(0xc0, sofPayload);
const dht = segment(0xc4, Uint8Array.of(0,...new Uint8Array(16),0));
const sos = segment(0xda, Uint8Array.of(3,1,0,2,0x11,3,0x11,0,63,0));
const entropy = Uint8Array.of(0x11,0x22,0xff,0x00,0x33);
const fixture = concat([Uint8Array.of(0xff,0xd8),jfif,dqt,sof0,dht,sos,entropy,Uint8Array.of(0xff,0xd9)]);

function parse(bytes){
  if(bytes[0]!==0xff||bytes[1]!==0xd8) throw new Error('soi');
  let o=2, sof=null, sosCount=0, eoi=0, jfifCount=0;
  while(o<bytes.length){
    if(bytes[o]!==0xff) throw new Error('prefix');
    while(bytes[o]===0xff)o++;
    const m=bytes[o++];
    if(m===0xd9){eoi++; if(o!==bytes.length) throw new Error('trailing'); break;}
    if(m===0xd8||m===1||(m>=0xd0&&m<=0xd7))continue;
    const len=(bytes[o]<<8)|bytes[o+1]; const p=o+2; const end=o+len;
    if(len<2||end>bytes.length)throw new Error('length');
    if(m===0xe0&&String.fromCharCode(...bytes.subarray(p,p+5))==='JFIF\0')jfifCount++;
    if(m===0xc2)throw new Error('progressive');
    if(m===0xc0){
      const precision=bytes[p], height=(bytes[p+1]<<8)|bytes[p+2], width=(bytes[p+3]<<8)|bytes[p+4], components=bytes[p+5];
      const sampling=[bytes[p+7],bytes[p+10],bytes[p+13]];
      if(precision!==8||components!==3||!sampling.every(v=>v===0x11))throw new Error('sof');
      sof={precision,height,width,components,sampling,frame:'SOF0',subsampling:'4:4:4'};
    }
    if(m===0xda){
      sosCount++; o=end;
      let found=false;
      while(o<bytes.length){
        if(bytes[o]!==0xff){o++;continue;}
        let c=o+1; while(bytes[c]===0xff)c++;
        const sm=bytes[c];
        if(sm===0||(sm>=0xd0&&sm<=0xd7)){o=c+1;continue;}
        if(sm===0xd9){eoi++;o=c+1;if(o!==bytes.length)throw new Error('trailing');found=true;break;}
        throw new Error('entropy-marker');
      }
      if(!found)throw new Error('eoi');
      break;
    }
    o=end;
  }
  if(!sof||sosCount!==1||eoi!==1||jfifCount!==1)throw new Error('cardinality');
  return {...sof,sosCount,eoiCount:eoi,jfifCount,eofExact:true};
}

const evidence=parse(fixture);
const badSubsampling=fixture.slice();
const sofIndex=badSubsampling.findIndex((_,i)=>badSubsampling[i]===0xff&&badSubsampling[i+1]===0xc0);
badSubsampling[sofIndex+11]=0x22;
let subsamplingRejected=false;try{parse(badSubsampling);}catch{subsamplingRejected=true;}
const progressive=fixture.slice();progressive[sofIndex+1]=0xc2;
let progressiveRejected=false;try{parse(progressive);}catch{progressiveRejected=true;}
const trailing=concat([fixture,Uint8Array.of(0)]);
let trailingRejected=false;try{parse(trailing);}catch{trailingRejected=true;}
if(!subsamplingRejected||!progressiveRejected||!trailingRejected)throw new Error('negative JPEG fixture failed');
const report={schema:'tdt-export-worker-06-jpeg-structure-smoke-v1',status:'PASS',sourceBakeOnly:true,actualModjpegEncodeExecuted:false,independentDecoderExecuted:false,lossyMetricExecuted:false,fixtureByteLength:fixture.length,...evidence,subsamplingRejected,progressiveRejected,trailingRejected};
fs.mkdirSync('artifacts/runtime',{recursive:true});
fs.writeFileSync('artifacts/runtime/EW06_JPEG_STRUCTURE_SMOKE.json',JSON.stringify(report,null,2)+'\n');
console.log(`PASS RT-EW06-JPEG-STRUCTURE bytes=${fixture.length} ${evidence.frame}/${evidence.subsampling}`);
