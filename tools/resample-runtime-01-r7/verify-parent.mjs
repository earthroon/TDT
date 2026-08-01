import {sha256File,report,capture,check} from './lib.mjs';
const frozen={
'specs/TDT-RESAMPLE-RUNTIME-01-R6_KERNEL_ABI_V4_SHARPNESS_TAPER_BORDER_SSOT_GENERATED_WGSL_KERNEL_IDENTITY_SEAL_SPEC.md':'4b94274d8d5db8b73c5ea236e6b699481bd14c5640b1b03fabc8415e158ced26',
'README_TDT_RESAMPLE_RUNTIME_01_R6_APPLIED.md':'1a5e0ed9b33a426c4aaebb9c7e42ac84a1d72d35553ed0d90684f8c1d7be4610',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_params_v4.mjs':'e8880cc46d2eec796e360c44f326e87692db9b25c23d788c6dff30c0e357fcf6',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_kernel_contract_v4.mjs':'ae644228f72503f8d751a24bcf97ed0eafd446361380fbe572cce5254bf8f56e',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_aniso_tile.mjs':'58ba24e685caa4d40f2ed81b184963b175104f25166d53717bc9b3406ed741ed',
'app/legacy-runtime/core/compute/qmap_webgpu/structure_tensor_runtime.mjs':'097d8a9cc5fc292df53e7db71e7598d05701d16569d8c978aae298ec852e9708',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_axial_contract_r5.mjs':'80d49122501f83157c76107a78365079cab53061a61d0693cadadefe570b2705',
'app/legacy-runtime/core/compute/qmap_webgpu/ewa_tiled_profile_r6.mjs':'9cba998b53c84345a34d43f6451968b0d27989ea38998f5c693b7b01e9b67382',
'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r4_r6.wgsl':'c8f1a893b6ea0f3cf7c7b0fab4a4fcfbbf24a77627517f5fb30fd7b0446c65a8',
'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_tile_r6_r6.wgsl':'4c1229695396f4c11dc14502f99e2c25242924fd83a9fcb52f7169abb3912b71',
'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_aniso_reference_v5_r6.wgsl':'70ae9edc4c5fd221a46ed546e8bbb3935b4176277aad62948078c2270892e81f',
'app/legacy-runtime/core/compute/qmap_webgpu/shaders/ewa_generated_manifest_r6.json':'11f3bcca8ee3540a30f48433e1a9f2a5ea2f5bfa04dbf8ac9de14d3bc8669a47',
'app/legacy-runtime/core/compute/qmap_webgpu/shaders/structure_tensor_axial_r5.wgsl':'2f00744b42416f0730682bdf397bca3fc05fce3d5dc10a2d2e27f32563725bca',
};
const checks=Object.entries(frozen).map(([p,h])=>capture(p,()=>{const actual=sha256File(p);check(actual===h,'E_R7_PARENT_ASSET_MUTATED','Frozen parent asset changed',{p,h,actual});return actual;}));
report('TDT_RESAMPLE_RUNTIME_01_R7_PARENT_REPORT.json',checks,{parentBundle:'61_TDT_RESAMPLE_RUNTIME_01_R6_KERNEL_ABI_V4_SHARPNESS_TAPER_BORDER_SSOT_GENERATED_WGSL_KERNEL_IDENTITY_BAKED_AWAITING_PHYSICAL_GPU.zip',parentBundleSha256:'0adaaa54ee02badc5851d86a6633123874b04f05b082d6c2c9d91c3419a0c005',frozenCount:Object.keys(frozen).length});
if(checks.some(x=>!x.pass))process.exit(1);
