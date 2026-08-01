import { R9_BINARY16_ID } from '../identity.mjs';
export const BINARY16_ID=R9_BINARY16_ID;
const f32=new Float32Array(1),u32=new Uint32Array(f32.buffer);
export function numberToBinary16(value){
  f32[0]=Number(value);const x=u32[0];const sign=(x>>>16)&0x8000;let exponent=(x>>>23)&0xff;let mantissa=x&0x7fffff;
  if(exponent===0xff)return sign|(mantissa?0x7e00:0x7c00);
  exponent=exponent-127+15;
  if(exponent>=0x1f)return sign|0x7c00;
  if(exponent<=0){
    if(exponent<-10)return sign;
    mantissa=(mantissa|0x800000)>>>0;const shift=14-exponent;const halfway=1<<(shift-1);let rounded=mantissa>>>shift;const rem=mantissa&((1<<shift)-1);if(rem>halfway||(rem===halfway&&(rounded&1)))rounded++;return sign|rounded;
  }
  let rounded=mantissa>>>13;const rem=mantissa&0x1fff;if(rem>0x1000||(rem===0x1000&&(rounded&1)))rounded++;
  if(rounded===0x400){rounded=0;exponent++;if(exponent>=0x1f)return sign|0x7c00;}
  return sign|(exponent<<10)|rounded;
}
export function binary16ToNumber(word){
  const sign=(word&0x8000)?-1:1,exp=(word>>>10)&0x1f,mant=word&0x3ff;
  if(exp===0)return sign*(mant?2**-14*(mant/1024):0);
  if(exp===0x1f)return mant?NaN:sign*Infinity;
  return sign*2**(exp-15)*(1+mant/1024);
}
export function encodeBinary16Array(values){const out=new Uint16Array(values.length);for(let i=0;i<values.length;i++)out[i]=numberToBinary16(values[i]);return out;}
export function orderedBinary16(word){return (word&0x8000)?0x8000-(word&0x7fff):0x8000+word;}
export function binary16UlpDistance(a,b){if((a&0x7fff)===0&&(b&0x7fff)===0)return 0;const av=binary16ToNumber(a),bv=binary16ToNumber(b);if(Number.isNaN(av)||Number.isNaN(bv))return Infinity;return Math.abs(orderedBinary16(a)-orderedBinary16(b));}
export function selfTestBinary16(){
  const cases=[[0,0x0000],[-0,0x8000],[1,0x3c00],[-2,0xc000],[Infinity,0x7c00]];
  for(const [value,word] of cases)if(numberToBinary16(value)!==word)throw Object.assign(new Error('binary16 self-test mismatch'),{code:'E_R9_SOURCE_HARNESS_INCOMPLETE',detail:{value,word,actual:numberToBinary16(value)}});
  if(binary16UlpDistance(0x3c00,0x3c01)!==1)throw new Error('binary16 ULP self-test mismatch');return true;
}
