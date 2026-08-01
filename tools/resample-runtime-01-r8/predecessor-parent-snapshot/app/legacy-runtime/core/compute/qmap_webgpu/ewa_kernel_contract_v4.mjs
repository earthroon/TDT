// TDT-RESAMPLE-RUNTIME-01-R6 kernel contract SSOT. Runtime-safe: no Node imports.
export const EWA_R6_KERNEL_CONTRACT = Object.freeze({
  "schemaVersion": 1,
  "abi": {
    "id": "tdt.delta-k-ewa.params.v4",
    "version": 65550,
    "bytes": 96,
    "fields": [
      {
        "name": "inSize",
        "offset": 0,
        "type": "vec2<u32>"
      },
      {
        "name": "outSize",
        "offset": 8,
        "type": "vec2<u32>"
      },
      {
        "name": "srcPerDst",
        "offset": 16,
        "type": "vec2<f32>"
      },
      {
        "name": "dstPerSrc",
        "offset": 24,
        "type": "vec2<f32>"
      },
      {
        "name": "sigmaMain",
        "offset": 32,
        "type": "f32"
      },
      {
        "name": "sigmaCross",
        "offset": 36,
        "type": "f32"
      },
      {
        "name": "maxAnisotropy",
        "offset": 40,
        "type": "f32"
      },
      {
        "name": "maxSampleReach",
        "offset": 44,
        "type": "f32"
      },
      {
        "name": "edgeLow",
        "offset": 48,
        "type": "f32"
      },
      {
        "name": "edgeHigh",
        "offset": 52,
        "type": "f32"
      },
      {
        "name": "minorCoverageFactor",
        "offset": 56,
        "type": "f32"
      },
      {
        "name": "coherenceExponent",
        "offset": 60,
        "type": "f32"
      },
      {
        "name": "kernelSharpness",
        "offset": 64,
        "type": "f32"
      },
      {
        "name": "kernelTaperExponent",
        "offset": 68,
        "type": "f32"
      },
      {
        "name": "phaseConvention",
        "offset": 72,
        "type": "u32"
      },
      {
        "name": "borderMode",
        "offset": 76,
        "type": "u32"
      },
      {
        "name": "stageIndex",
        "offset": 80,
        "type": "u32"
      },
      {
        "name": "stageCount",
        "offset": 84,
        "type": "u32"
      },
      {
        "name": "flags",
        "offset": 88,
        "type": "u32"
      },
      {
        "name": "abiVersion",
        "offset": 92,
        "type": "u32"
      }
    ]
  },
  "kernel": {
    "contractId": "tdt.ewa.kernel-contract.r6.v1",
    "id": "tdt.ewa.ellipse.phase-correct-parametric-r6.v1",
    "defaults": {
      "kernelSharpness": 1.65,
      "kernelTaperExponent": 1.0
    },
    "ranges": {
      "kernelSharpness": [
        0.25,
        4.0
      ],
      "kernelTaperExponent": [
        0.25,
        4.0
      ]
    },
    "support": {
      "qMin": 0.0,
      "qMax": 1.0
    },
    "radialExpression": "exp(-kernelSharpness*q)",
    "taperExpression": "pow(max(0,1-q),kernelTaperExponent)"
  },
  "phase": {
    "id": "tdt.ewa.source-lattice.pixel-center-v2",
    "enum": 2
  },
  "border": {
    "id": "tdt.ewa.border.clamp-extension-logical-distance-v1",
    "publicName": "clamp-extension-logical-distance",
    "enum": 1
  },
  "generator": {
    "id": "tdt.ewa.wgsl-generator.r6.v1",
    "manifestId": "tdt.ewa.generated-shader-manifest.r6.v1"
  }
});
export const EWA_R6_CONTRACT_CANONICAL_JSON = "{\"abi\":{\"bytes\":96,\"fields\":[{\"name\":\"inSize\",\"offset\":0,\"type\":\"vec2<u32>\"},{\"name\":\"outSize\",\"offset\":8,\"type\":\"vec2<u32>\"},{\"name\":\"srcPerDst\",\"offset\":16,\"type\":\"vec2<f32>\"},{\"name\":\"dstPerSrc\",\"offset\":24,\"type\":\"vec2<f32>\"},{\"name\":\"sigmaMain\",\"offset\":32,\"type\":\"f32\"},{\"name\":\"sigmaCross\",\"offset\":36,\"type\":\"f32\"},{\"name\":\"maxAnisotropy\",\"offset\":40,\"type\":\"f32\"},{\"name\":\"maxSampleReach\",\"offset\":44,\"type\":\"f32\"},{\"name\":\"edgeLow\",\"offset\":48,\"type\":\"f32\"},{\"name\":\"edgeHigh\",\"offset\":52,\"type\":\"f32\"},{\"name\":\"minorCoverageFactor\",\"offset\":56,\"type\":\"f32\"},{\"name\":\"coherenceExponent\",\"offset\":60,\"type\":\"f32\"},{\"name\":\"kernelSharpness\",\"offset\":64,\"type\":\"f32\"},{\"name\":\"kernelTaperExponent\",\"offset\":68,\"type\":\"f32\"},{\"name\":\"phaseConvention\",\"offset\":72,\"type\":\"u32\"},{\"name\":\"borderMode\",\"offset\":76,\"type\":\"u32\"},{\"name\":\"stageIndex\",\"offset\":80,\"type\":\"u32\"},{\"name\":\"stageCount\",\"offset\":84,\"type\":\"u32\"},{\"name\":\"flags\",\"offset\":88,\"type\":\"u32\"},{\"name\":\"abiVersion\",\"offset\":92,\"type\":\"u32\"}],\"id\":\"tdt.delta-k-ewa.params.v4\",\"version\":65550},\"border\":{\"enum\":1,\"id\":\"tdt.ewa.border.clamp-extension-logical-distance-v1\",\"publicName\":\"clamp-extension-logical-distance\"},\"generator\":{\"id\":\"tdt.ewa.wgsl-generator.r6.v1\",\"manifestId\":\"tdt.ewa.generated-shader-manifest.r6.v1\"},\"kernel\":{\"contractId\":\"tdt.ewa.kernel-contract.r6.v1\",\"defaults\":{\"kernelSharpness\":1.65,\"kernelTaperExponent\":1},\"id\":\"tdt.ewa.ellipse.phase-correct-parametric-r6.v1\",\"radialExpression\":\"exp(-kernelSharpness*q)\",\"ranges\":{\"kernelSharpness\":[0.25,4],\"kernelTaperExponent\":[0.25,4]},\"support\":{\"qMax\":1,\"qMin\":0},\"taperExpression\":\"pow(max(0,1-q),kernelTaperExponent)\"},\"phase\":{\"enum\":2,\"id\":\"tdt.ewa.source-lattice.pixel-center-v2\"},\"schemaVersion\":1}";
export const EWA_R6_CONTRACT_DIGEST = '18d413d630172515d463e6598d9f9e90c6a221c1fca41824defeae3e19da8909';
export const EWA_R6_ABI_ID = EWA_R6_KERNEL_CONTRACT.abi.id;
export const EWA_R6_ABI_VERSION = EWA_R6_KERNEL_CONTRACT.abi.version;
export const EWA_R6_PARAM_BYTES = EWA_R6_KERNEL_CONTRACT.abi.bytes;
export const EWA_R6_KERNEL_CONTRACT_ID = EWA_R6_KERNEL_CONTRACT.kernel.contractId;
export const EWA_R6_KERNEL_ID = EWA_R6_KERNEL_CONTRACT.kernel.id;
export const EWA_R6_GENERATOR_ID = EWA_R6_KERNEL_CONTRACT.generator.id;
export const EWA_R6_GENERATED_MANIFEST_ID = EWA_R6_KERNEL_CONTRACT.generator.manifestId;
export const EWA_R6_PHASE_ID = EWA_R6_KERNEL_CONTRACT.phase.id;
export const EWA_R6_PHASE_ENUM = EWA_R6_KERNEL_CONTRACT.phase.enum;
export const EWA_R6_BORDER_ID = EWA_R6_KERNEL_CONTRACT.border.id;
export const EWA_R6_BORDER_ENUM = EWA_R6_KERNEL_CONTRACT.border.enum;
export const EWA_R6_BORDER_PUBLIC_NAME = EWA_R6_KERNEL_CONTRACT.border.publicName;
export function stableCanonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableCanonicalJson).join(',')}]`;
  return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${stableCanonicalJson(value[k])}`).join(',')}}`;
}
