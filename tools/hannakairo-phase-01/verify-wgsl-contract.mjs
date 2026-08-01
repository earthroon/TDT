import {exists,text,readJson,writeArtifact,sha256File} from './lib.mjs';
const files=['hannakairo-axial-convert.wgsl','hannakairo-phase-coherence.wgsl','hannakairo-wrapped-circulation.wgsl','hannakairo-fixture-generator.wgsl','hannakairo-reference.wgsl','hannakairo-compare.wgsl'].map(n=>`app/legacy-runtime/core/analysis/hannakairo/shaders/${n}`);const checks=[];const check=(id,ok,detail='')=>checks.push({id,pass:Boolean(ok),detail});
for(const f of files){check(`${f}:exists`,exists(f));if(!exists(f))continue;const s=text(f);check(`${f}:brace`,[...s].filter(x=>x==='{').length===[...s].filter(x=>x==='}').length);check(`${f}:entry`,s.includes('@compute')&&s.includes('fn main'));check(`${f}:no-map`,!s.includes('MAP_READ')&&!s.includes('mapAsync'));}
const axial=text(files[0]),coh=text(files[1]),wind=text(files[2]),ref=text(files[4]),cmp=text(files[5]);
for(const t of ['t.x*t.x - t.y*t.y','2.0*t.x*t.y','inverseSqrt','vec4<f32>(0.0)'])check(`axial:${t}`,axial.includes(t));
for(const t of ['for (var oy:i32=-1','length(sum)','valid_count','min_valid_weight'])check(`coherence:${t}`,coh.includes(t));
for(const t of ['a00.xy,a01.xy','a01.xy,a11.xy','a11.xy,a10.xy','a10.xy,a00.xy','round_half_away','0.5*winding','snap_tolerance'])check(`winding:${t}`,wind.includes(t));
check('reference-independent-angle',ref.includes('atan2(a1.y,a1.x)-atan2(a0.y,a0.x)')&&!ref.includes('fn wrapped'));
for(const t of ['mismatch_count','nonfinite_count','max_abs_error_bits','first_mismatch'])check(`compare:${t}`,cmp.includes(t));
const manifest=readJson('app/src/runtime/assets/generated-runtime-asset-manifest.json');for(const f of files){const rel=f;check(`manifest:${rel}`,manifest.assets.some(x=>x.sourceRelative===rel));}
const report={schemaVersion:1,pass:checks.every(x=>x.pass),count:checks.length,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass),checks,digests:Object.fromEntries(files.filter(exists).map(f=>[f,sha256File(f)]))};writeArtifact('hp01-wgsl-contract.json',report);console.log(`HP01 WGSL ${report.passed}/${report.count} ${report.pass?'PASS':'FAIL'}`);if(!report.pass)process.exit(1);
