import { normalizeTensorR1CParameters } from './structure_tensor_params.mjs';
import {
  EWA_R6_KERNEL_CONTRACT,EWA_R6_ABI_ID,EWA_R6_ABI_VERSION,EWA_R6_PARAM_BYTES,
  EWA_R6_PHASE_ID,EWA_R6_PHASE_ENUM,EWA_R6_BORDER_ID,EWA_R6_BORDER_ENUM,EWA_R6_BORDER_PUBLIC_NAME,
  EWA_R6_KERNEL_ID,EWA_R6_KERNEL_CONTRACT_ID,EWA_R6_CONTRACT_DIGEST,
} from './ewa_kernel_contract_v4.mjs';

export { EWA_R6_ABI_ID,EWA_R6_ABI_VERSION,EWA_R6_PARAM_BYTES,EWA_R6_KERNEL_ID,EWA_R6_KERNEL_CONTRACT_ID,EWA_R6_CONTRACT_DIGEST };
export const EWA_R6_MAX_SAMPLE_REACH=6.0;
function stableError(code,message,detail=null){return Object.assign(new Error(message),{code,detail});}
function own(o,k){return Object.prototype.hasOwnProperty.call(o??{},k)&&o[k]!==undefined;}
function finiteRange(value,fallback,range,name){const n=Number(value??fallback);if(!Number.isFinite(n))throw stableError('E_R6_KERNEL_PARAMETER_NONFINITE',`${name} must be finite`,{name,value});if(n<range[0]||n>range[1])throw stableError('E_R6_KERNEL_PARAMETER_RANGE',`${name} outside admitted range`,{name,n,min:range[0],max:range[1]});return n;}
function positiveInt(value,name){const n=Number(value);if(!Number.isSafeInteger(n)||n<=0)throw stableError('E_R6_ABI_SCHEMA_INVALID',`${name} must be a positive safe integer`,{name,value});return n;}
export function normalizeEwaR6KernelParameters(input={}){
  const d=EWA_R6_KERNEL_CONTRACT.kernel.defaults,r=EWA_R6_KERNEL_CONTRACT.kernel.ranges;
  const hasCanonical=own(input,'kernelTaperExponent'),hasAlias=own(input,'taperExponent');
  if(hasCanonical&&hasAlias&&Number(input.kernelTaperExponent)!==Number(input.taperExponent))throw stableError('E_R6_AMBIGUOUS_KERNEL_ALIAS','kernelTaperExponent and taperExponent disagree',{kernelTaperExponent:input.kernelTaperExponent,taperExponent:input.taperExponent});
  const kernelSharpness=finiteRange(input.kernelSharpness,d.kernelSharpness,r.kernelSharpness,'kernelSharpness');
  const kernelTaperExponent=finiteRange(hasCanonical?input.kernelTaperExponent:hasAlias?input.taperExponent:undefined,d.kernelTaperExponent,r.kernelTaperExponent,'kernelTaperExponent');
  if(own(input,'phaseConvention')&&Number(input.phaseConvention)!==EWA_R6_PHASE_ENUM)throw stableError('E_R6_PHASE_CONVENTION_UNSUPPORTED','Only pixel-center-v2 phase enum is admitted',{value:input.phaseConvention});
  if(own(input,'phaseConventionId')&&String(input.phaseConventionId)!==EWA_R6_PHASE_ID)throw stableError('E_R6_PHASE_CONVENTION_UNSUPPORTED','Only pixel-center-v2 phase identity is admitted',{value:input.phaseConventionId});
  let borderMode=EWA_R6_BORDER_ENUM;
  if(own(input,'borderMode')){const v=input.borderMode;if(v===EWA_R6_BORDER_ENUM||v===EWA_R6_BORDER_PUBLIC_NAME||v===EWA_R6_BORDER_ID)borderMode=EWA_R6_BORDER_ENUM;else throw stableError('E_R6_BORDER_MODE_UNSUPPORTED','Unsupported R6 border mode',{value:v});}
  return Object.freeze({kernelSharpness,kernelTaperExponent,phaseConvention:EWA_R6_PHASE_ENUM,phaseConventionId:EWA_R6_PHASE_ID,borderMode,borderId:EWA_R6_BORDER_ID,borderName:EWA_R6_BORDER_PUBLIC_NAME});
}
export function packEwaR6Params(input){
  const inW=positiveInt(input.inW,'inW'),inH=positiveInt(input.inH,'inH'),outW=positiveInt(input.outW,'outW'),outH=positiveInt(input.outH,'outH');
  const tensor=normalizeTensorR1CParameters(input);const kernel=normalizeEwaR6KernelParameters(input);
  const sigmaMain=Number(input.sigmaMain??1.25),sigmaCross=Number(input.sigmaCross??0.65);
  if(!Number.isFinite(sigmaMain)||sigmaMain<=0||!Number.isFinite(sigmaCross)||sigmaCross<=0)throw stableError('E_R6_KERNEL_PARAMETER_NONFINITE','sigma values must be finite and positive');
  const bytes=new ArrayBuffer(EWA_R6_PARAM_BYTES),u32=new Uint32Array(bytes),f32=new Float32Array(bytes);
  u32[0]=inW;u32[1]=inH;u32[2]=outW;u32[3]=outH;
  f32[4]=inW/outW;f32[5]=inH/outH;f32[6]=outW/inW;f32[7]=outH/inH;
  f32[8]=sigmaMain;f32[9]=sigmaCross;f32[10]=tensor.maxAnisotropy;f32[11]=EWA_R6_MAX_SAMPLE_REACH;
  f32[12]=tensor.edgeLow;f32[13]=tensor.edgeHigh;f32[14]=tensor.minorCoverageFactor;f32[15]=tensor.coherenceExponent;
  f32[16]=kernel.kernelSharpness;f32[17]=kernel.kernelTaperExponent;u32[18]=kernel.phaseConvention;u32[19]=kernel.borderMode;
  u32[20]=Number(input.stageIndex??0)>>>0;u32[21]=Number(input.stageCount??1)>>>0;u32[22]=Number(input.flags??0)>>>0;u32[23]=EWA_R6_ABI_VERSION;
  if(bytes.byteLength!==96)throw stableError('E_R6_PARAMETER_BUFFER_SIZE_MISMATCH','R6 parameter buffer must be exactly 96 bytes',{actual:bytes.byteLength});
  return bytes;
}
