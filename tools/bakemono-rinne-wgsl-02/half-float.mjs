const f32 = new Float32Array(1);
const u32 = new Uint32Array(f32.buffer);

export function float32ToFloat16Bits(value) {
  f32[0] = Number(value);
  const x = u32[0];
  const sign = (x >>> 16) & 0x8000;
  let mantissa = x & 0x007fffff;
  let exponent = (x >>> 23) & 0xff;
  if (exponent === 0xff) return sign | (mantissa ? 0x7e00 : 0x7c00);
  let halfExp = exponent - 127 + 15;
  if (halfExp >= 0x1f) return sign | 0x7c00;
  if (halfExp <= 0) {
    if (halfExp < -10) return sign;
    mantissa |= 0x00800000;
    const shift = 14 - halfExp;
    let halfMantissa = mantissa >>> shift;
    const remainderMask = (1 << shift) - 1;
    const remainder = mantissa & remainderMask;
    const halfway = 1 << (shift - 1);
    if (remainder > halfway || (remainder === halfway && (halfMantissa & 1))) halfMantissa++;
    return sign | halfMantissa;
  }
  let halfMantissa = mantissa >>> 13;
  const remainder = mantissa & 0x1fff;
  if (remainder > 0x1000 || (remainder === 0x1000 && (halfMantissa & 1))) {
    halfMantissa++;
    if (halfMantissa === 0x400) {
      halfMantissa = 0;
      halfExp++;
      if (halfExp >= 0x1f) return sign | 0x7c00;
    }
  }
  return sign | (halfExp << 10) | halfMantissa;
}

export function float16BitsToFloat32(bits) {
  const sign = (bits & 0x8000) << 16;
  let exponent = (bits >>> 10) & 0x1f;
  let mantissa = bits & 0x03ff;
  let word;
  if (exponent === 0) {
    if (mantissa === 0) word = sign;
    else {
      exponent = 1;
      while ((mantissa & 0x0400) === 0) { mantissa <<= 1; exponent--; }
      mantissa &= 0x03ff;
      word = sign | ((exponent + 127 - 15) << 23) | (mantissa << 13);
    }
  } else if (exponent === 0x1f) word = sign | 0x7f800000 | (mantissa << 13);
  else word = sign | ((exponent + 127 - 15) << 23) | (mantissa << 13);
  u32[0] = word >>> 0;
  return f32[0];
}

export function encodeF16(values) {
  const out = new Uint16Array(values.length);
  for (let i=0;i<values.length;i++) out[i]=float32ToFloat16Bits(values[i]);
  return out;
}
export function decodeF16(bits) {
  const out = new Float32Array(bits.length);
  for (let i=0;i<bits.length;i++) out[i]=float16BitsToFloat32(bits[i]);
  return out;
}
export function halfUlpDistance(aBits,bBits) {
  const order=(bits)=> (bits & 0x8000) ? 0x8000 - (bits & 0x7fff) : 0x8000 + bits;
  return Math.abs(order(aBits)-order(bBits));
}
