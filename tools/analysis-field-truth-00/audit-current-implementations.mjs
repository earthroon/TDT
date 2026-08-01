import fs from 'node:fs';import path from 'node:path';import {ROOT,listFiles,sha256File,writeJson,writeArtifact,canonicalJson,sha256} from './lib.mjs';
const graph=JSON.parse(fs.readFileSync(path.join(ROOT,'app/src/runtime/active-graph/generated-active-runtime-graph.json'),'utf8'));const graphMap=new Map(graph.nodes.map(n=>[n.sourceRelative,n]));
const all=listFiles('app/legacy-runtime').filter(f=>/(fft|atlas|phase|qwave|hannakairo)/i.test(path.basename(f))||/(\/atlas\/|\/phase\/|\/qwave\/)/i.test(f));
const exact=new Map([
['app/legacy-runtime/ASH_QMAP_PostPatch_kit/js/qmap_fft.js',['COMPATIBILITY_CPU_REFERENCE','forbidden','diagnostic-reference-only']],
['app/legacy-runtime/core/qmap/dk_fft_qmap_webgpu_v2.js',['COMPATIBILITY_GPU_FACADE','compatibility','TDT-SPECTRAL-QMAP-02']],
['app/legacy-runtime/js/modules/qmapFFTBuilder.js',['COMPATIBILITY_GPU_FACADE','compatibility','spectral-field-handle-adapter']],
['app/legacy-runtime/workers/fft_peak_worker.js',['STUB_WORKER','forbidden','renderer-gpu-broker']],
['app/legacy-runtime/shaders/phase_gate_hannakairo.frag',['DIRECTIONAL_GATE_COMPATIBILITY_SHADER','compatibility','TDT-HANNAKAIRO-GATE-02']],
['app/legacy-runtime/phase/phase_field.js',['CPU_SCALAR_COMPATIBILITY_HELPER','forbidden','GPU-topology-producer']],
['app/legacy-runtime/js/passes/qwave_builder_webgpu_compute.js',['GPU_EFFECTIVE_COMPATIBILITY_PRODUCER','compatibility','TDT-QWAVE-PHASE-03']],
['app/legacy-runtime/qwave/qwave_system.js',['VISUAL_EFFECT_ONLY','visual-only','visual-runtime']],
['app/legacy-runtime/gl/atlas/textureAtlas.js',['LEGACY_WEBGL_FIXED_GRID_PROTOTYPE','forbidden','TDT-GPU-TILE-ATLAS-01']],
['app/legacy-runtime/libs/atlas/atlasQmapRuntime.js',['CPU_SPATIAL_QUALITY_LUT_COMPATIBILITY','forbidden','GPU-spatial-lut']],
['app/legacy-runtime/gl_atlas_cache.js',['LEGACY_WEBGL_FULL_FRAME_CACHE','forbidden','content-digest-cache']],
['app/legacy-runtime/atlas/build_quality_atlas.js',['LITERAL_STUB','forbidden','future-quality-atlas']],
['app/legacy-runtime/atlas/sample_quality_atlas.frag',['LITERAL_STUB','forbidden','future-quality-atlas']],
['app/legacy-runtime/atlas/lut_atlas_sampler.frag',['LITERAL_STUB','forbidden','future-quality-atlas']],
]);
function classify(file){if(exact.has(file))return exact.get(file);if(/backup|\.bak$|_merged|_patch_bundle|patches\//i.test(file))return ['ARCHIVED_OR_PATCH_REFERENCE','forbidden','none'];if(/worker/i.test(file))return ['COMPATIBILITY_WORKER_OR_STUB','forbidden','renderer-broker-review'];if(/\.wgsl$|\.frag$|\.glsl$/i.test(file))return ['UNADMITTED_SHADER_ASSET','forbidden','semantic-review'];if(/qwave/i.test(file))return ['QWAVE_COMPATIBILITY_SOURCE','compatibility','semantic-split'];if(/fft/i.test(file))return ['FFT_COMPATIBILITY_SOURCE','forbidden','spectral-roadmap'];if(/atlas/i.test(file))return ['ATLAS_LABELLED_COMPATIBILITY_SOURCE','forbidden','atlas-taxonomy-migration'];if(/phase/i.test(file))return ['PHASE_LABELLED_COMPATIBILITY_SOURCE','forbidden','phase-semantic-migration'];return ['REVIEWED_NONCANONICAL','forbidden','none'];}
const entries=all.map(file=>{const [classification,productAdmission,futureRoute]=classify(file);const node=graphMap.get(file);return {sourceRelative:file,sha256:sha256File(file),byteLength:fs.statSync(path.join(ROOT,file)).size,classification,productAdmission,futureRoute,activeGraphStatus:node?.status??'NOT_IN_ACTIVE_GRAPH',activeGraphNodeId:node?.nodeId??null,effectiveExecutionClaim:false};});
const output={schemaVersion:1,patchId:'TDT-ANALYSIS-FIELD-TRUTH-00',entryCount:entries.length,entries,classificationDigest:sha256(canonicalJson(entries))};
writeJson('app/src/runtime/analysis/generated/generated-analysis-compatibility-classification.json',output);writeArtifact('TDT_ANALYSIS_FIELD_TRUTH_00_IMPLEMENTATION_CLASSIFICATION.json',output);
console.log(`AFT00 classified ${entries.length} files ${output.classificationDigest}`);
