import fs from 'node:fs';
import path from 'node:path';
import init, { serialize_psd_document_v2, request_codec_version, serializer_abi_version, serializer_backend_kind, serializer_capabilities, serializer_self_test_v2 } from '../app/legacy-runtime/libs/psd/pkg-v2/psd_exporter_wasm.js';
import { encodePsdDocumentPlanV2 } from '../app/legacy-runtime/libs/psd/request-codec-v2.js';

const td = new TextDecoder();
const u16 = (b,o) => (b[o]<<8)|b[o+1];
const i16 = (b,o) => { const v=u16(b,o); return v&0x8000?v-0x10000:v; };
const u32 = (b,o) => (((b[o]<<24)>>>0)|(b[o+1]<<16)|(b[o+2]<<8)|b[o+3])>>>0;
const ascii = (b,o,n) => String.fromCharCode(...b.subarray(o,o+n));
const even = (v) => (v+1)&~1;

function inspect(bytes) {
  if (ascii(bytes,0,4)!=='8BPS') throw new Error('signature');
  if (u16(bytes,4)!==1) throw new Error('version');
  const channels=u16(bytes,12),height=u32(bytes,14),width=u32(bytes,18),depth=u16(bytes,22),colorMode=u16(bytes,24);
  let off=26;off+=4+u32(bytes,off);const resLen=u32(bytes,off);off+=4;const resEnd=off+resLen;let resolution=0,icc=0;
  while(off<resEnd){if(ascii(bytes,off,4)!=='8BIM')throw new Error('resource signature');const id=u16(bytes,off+4);off+=6;const nameLen=bytes[off];off=even(off+1+nameLen);const len=u32(bytes,off);off+=4;if(id===1005)resolution++;if(id===1039)icc++;off=even(off+len);} if(off!==resEnd)throw new Error('resource boundary');
  const lmLen=u32(bytes,off);off+=4;const lmEnd=off+lmLen;let layerCount=0;if(lmLen){const liLen=u32(bytes,off);if(liLen){layerCount=Math.abs(i16(bytes,off+4));}}off=lmEnd;const compression=u16(bytes,off);off+=2;
  if(compression===0){off+=channels*width*height*(depth===16?2:1);} else if(compression===1){const rows=channels*height;let payload=0;for(let i=0;i<rows;i++)payload+=u16(bytes,off+i*2);off+=rows*2+payload;} else throw new Error('compression');
  if(off!==bytes.length)throw new Error(`eof ${off}/${bytes.length}`);
  return {channels,width,height,depth,colorMode,layerCount,compression,resolution,icc,byteLength:bytes.length,eofExact:true};
}

await init();
if(request_codec_version()!==2||serializer_abi_version()!==2)throw new Error('ABI');
const capabilities=JSON.parse(td.decode(serializer_capabilities()));
const selfTest=JSON.parse(td.decode(serializer_self_test_v2()));
if(!selfTest.pass)throw new Error('self test');
const plane=(id,values)=>({channelId:id,bytes:Uint8Array.from(values)});
const cases=[
  {id:'layered-rgb8-raw',plan:{documentMode:'layered-rgb8-single-layer',width:2,height:2,colorMode:'rgb',depth:8,compression:'raw',layerCount:1,layerName:'레이어 1',hasAlpha:true,mergedCompositeIncluded:true,dpiX:300,dpiY:300,iccPolicy:'forbidden',iccBytes:new Uint8Array(),planes:[plane(0,[1,2,3,4]),plane(1,[5,6,7,8]),plane(2,[9,10,11,12]),plane(-1,[255,128,64,0])]},expect:{layerCount:1,depth:8,colorMode:3,compression:0,icc:0}},
  {id:'flat-rgb8-rle',plan:{documentMode:'flattened-rgb8',width:3,height:2,colorMode:'rgb',depth:8,compression:'rle',layerCount:0,layerName:'',hasAlpha:false,mergedCompositeIncluded:true,dpiX:72,dpiY:72,iccPolicy:'forbidden',iccBytes:new Uint8Array(),planes:[plane(0,[1,1,1,2,2,2]),plane(1,[3,3,3,4,4,4]),plane(2,[5,5,5,6,6,6])]},expect:{layerCount:0,depth:8,colorMode:3,compression:1,icc:0}},
  {id:'flat-rgb16-raw',plan:{documentMode:'flattened-rgb16',width:2,height:1,colorMode:'rgb',depth:16,compression:'raw',layerCount:0,layerName:'',hasAlpha:false,mergedCompositeIncluded:true,dpiX:144,dpiY:144,iccPolicy:'forbidden',iccBytes:new Uint8Array(),planes:[plane(0,[0,1,0,2]),plane(1,[0,3,0,4]),plane(2,[0,5,0,6])]},expect:{layerCount:0,depth:16,colorMode:3,compression:0,icc:0}},
  {id:'flat-cmyk8-rle',plan:{documentMode:'flattened-cmyk8',width:2,height:2,colorMode:'cmyk',depth:8,compression:'rle',layerCount:0,layerName:'',hasAlpha:false,mergedCompositeIncluded:true,dpiX:300,dpiY:300,iccPolicy:'required',iccBytes:Uint8Array.from([1,2,3,4]),planes:[plane(0,[0,0,255,255]),plane(1,[1,1,254,254]),plane(2,[2,2,253,253]),plane(3,[3,3,252,252])]},expect:{layerCount:0,depth:8,colorMode:4,compression:1,icc:1}},
];
const results=[];
for(const item of cases){const request=encodePsdDocumentPlanV2(item.plan);const output=serialize_psd_document_v2(request);const evidence=inspect(output);for(const [key,value] of Object.entries(item.expect)){if(evidence[key]!==value)throw new Error(`${item.id} ${key}: ${evidence[key]} != ${value}`);}if(evidence.resolution!==1)throw new Error(`${item.id} resolution count`);results.push({id:item.id,requestByteLength:request.length,...evidence});}
const artifact={schema:'dadum-ew04-psd-source-reference-smoke-v1',status:'PASS',serializerBackendKind:serializer_backend_kind(),canonicalRustWasm:capabilities.canonicalRustWasm===true,requestCodecVersion:request_codec_version(),serializerAbiVersion:serializer_abi_version(),selfTest,caseCount:results.length,cases:results};
const out=path.resolve('artifacts/runtime/EW04_PSD_SOURCE_REFERENCE_SMOKE.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(artifact,null,2)+'\n');console.log(`PASS EW04 PSD source reference runtime smoke ${results.length}/4 backend=${artifact.serializerBackendKind}`);
