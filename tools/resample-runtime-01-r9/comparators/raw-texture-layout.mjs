import { binary16UlpDistance } from '../oracle/binary16.mjs';
export const RAW_LAYOUT_ID='tdt.r9.rgba16float.raw-layout.v1';
export function alignedBytesPerRow(width,bytesPerPixel=8){const raw=width*bytesPerPixel;return Math.ceil(raw/256)*256;}
export function stripTexturePadding(bytes,width,height,bytesPerPixel=8,bytesPerRow=alignedBytesPerRow(width,bytesPerPixel)){
  const source=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);const tightRow=width*bytesPerPixel;
  if(source.byteLength<bytesPerRow*height)throw Object.assign(new Error('texture readback shorter than layout'),{code:'E_R9_SOURCE_HARNESS_INCOMPLETE'});
  const out=new Uint8Array(tightRow*height);for(let y=0;y<height;y++)out.set(source.subarray(y*bytesPerRow,y*bytesPerRow+tightRow),y*tightRow);return out;
}
export function compareRawBinary16(aBytes,bBytes){
  const a=aBytes instanceof Uint16Array?aBytes:new Uint16Array(aBytes.buffer??aBytes,aBytes.byteOffset??0,Math.floor(aBytes.byteLength/2));
  const b=bBytes instanceof Uint16Array?bBytes:new Uint16Array(bBytes.buffer??bBytes,bBytes.byteOffset??0,Math.floor(bBytes.byteLength/2));
  if(a.length!==b.length)throw Object.assign(new Error('raw word length mismatch'),{code:'E_R9_PRODUCT_REFERENCE_MISMATCH',detail:{a:a.length,b:b.length}});
  let mismatchWordCount=0,positiveZero=0,negativeZero=0;const first=[];
  for(let i=0;i<a.length;i++){if(a[i]!==b[i]){mismatchWordCount++;if(first.length<16)first.push({index:i,a:a[i],b:b[i]});}if((a[i]&0x7fff)===0){if(a[i]&0x8000)negativeZero++;else positiveZero++;}}
  return {mismatchWordCount,firstMismatches:first,signedZeroCounts:{positiveZero,negativeZero},exact:mismatchWordCount===0};
}
export function compareOracleWords(actualWords,expectedWords,maxUlp=1){
  if(actualWords.length!==expectedWords.length)throw new Error('oracle word length mismatch');let maxObservedUlp=0,exceeded=0,nonfinite=0;const first=[];
  for(let i=0;i<actualWords.length;i++){const d=binary16UlpDistance(actualWords[i],expectedWords[i]);if(!Number.isFinite(d))nonfinite++;else maxObservedUlp=Math.max(maxObservedUlp,d);if(d>maxUlp){exceeded++;if(first.length<16)first.push({index:i,actual:actualWords[i],expected:expectedWords[i],ulp:d});}}
  return {maxUlpAllowed:maxUlp,maxObservedUlp,exceeded,nonfinite,pass:exceeded===0&&nonfinite===0,first};
}
export function rowPaddingNegativeControl(){const width=3,height=2,bpr=256;const padded=new Uint8Array(bpr*height);for(let i=0;i<24;i++){padded[i]=i+1;padded[bpr+i]=101+i;}const tight=stripTexturePadding(padded,width,height);return tight[24]===101&&tight.length===48;}
