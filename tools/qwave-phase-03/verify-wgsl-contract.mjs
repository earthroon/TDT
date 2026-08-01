import {read,exists,write,sha256,canonical} from './lib.mjs';
const dir='app/legacy-runtime/core/analysis/qwave/shaders/';const names=['qwave-imag-local-aniso.wgsl','qwave-imag-spectral-project.wgsl','qwave-imag-defect-project.wgsl','qwave-imag-curvature.wgsl','qwave-imag-hilbert.wgsl','qwave-analytic-principal-sqrt.wgsl','qwave-analytic-to-rg-compat.wgsl','qwave-analytic-fixture-generator.wgsl','qwave-analytic-reference-polar.wgsl','qwave-analytic-compare.wgsl','qwave-source-selection-counter.wgsl'];const checks=[];const c=(name,pass,detail)=>checks.push({name,pass:Boolean(pass),detail:String(detail)});
for(const n of names){const f=dir+n;c(`exists:${n}`,exists(f),f);const s=read(f);c(`compute:${n}`,s.includes('@compute'),n);c(`balanced:${n}`,(s.match(/{/g)||[]).length===(s.match(/}/g)||[]).length,n);}
const allShaders=names.map(n=>read(dir+n)).join('\n');c('all-wgsl-no-host-readback-api',!/(MAP_READ|mapAsync|getMappedRange|readPixels|getImageData)/.test(allShaders),'WGSL assets contain no host readback API tokens');
const local=read(dir+names[0]),spectral=read(dir+names[1]),defect=read(dir+names[2]),sqrt=read(dir+names[5]),compat=read(dir+names[6]),ref=read(dir+names[8]),cmp=read(dir+names[9]),counter=read(dir+names[10]);
for(const t of ['abs(gx)+abs(gy)','p.scale','p.gain','p.clampValue','textureStore'])c(`local:${t}`,local.replaceAll(' ','').includes(t.replaceAll(' ','')),t);
for(const t of ['var v=vec2<f32>(0.)','s.xy*w','s.z*w','q.y','window'])c(`spectral:${t}`,spectral.includes(t)||t==='window'&&spectral.includes('p.ww'),t);
for(const t of ['signed','d.r*d.b','sum/conf','p.defectScale','textureStore'])c(`defect:${t}`,t==='signed'?defect.includes('sum=0.'):defect.includes(t),t);
for(const t of ['r=sqrt(a.r*a.r+b.r*b.r)','u=sqrt(max(0.,.5*(r+a.r)))','select(-1.,1.,b.r>=0.)','sqrt(max(r,0.))','vec4<f32>(0.,1.,0.,0.)','min(a.g,b.b)'])c(`sqrt:${t}`,sqrt.includes(t),t);
for(const t of ['atan2(a.b,a.g)','phase01','b.g','clamp(a.r,0.,1.)'])c(`compat:${t}`,compat.includes(t),t);
for(const t of ['atan2(z.y,z.x)','sqrt(length(z))','.5*atan2','cos(t)','sin(t)'])c(`reference:${t}`,ref.includes(t),t);
for(const t of ['atomicAdd','atomicMin','isFinite','1e-5'])c(`compare:${t}`,cmp.includes(t),t);
for(const t of ['p.mode<5u','atomicAdd(&counts[p.mode],1u)'])c(`counter:${t}`,counter.includes(t),t);
c('principal-no-atan2',!sqrt.includes('atan2'),'product root independent from polar reference');c('reference-no-closed-form',!ref.includes('r+a')&&!ref.includes('r-a'),'independent polar reference');
if(checks.length!==72)throw new Error(`E_QP03_WGSL_CHECK_COUNT:${checks.length}`);const report={schemaVersion:1,pass:checks.every(x=>x.pass),count:checks.length,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass),checks,digest:sha256(canonical(checks))};write('qp03-wgsl-contract.json',report);console.log(`QP03 WGSL ${report.passed}/${report.count} ${report.pass?'PASS':'FAIL'}`);if(!report.pass){console.error(report.failed);process.exit(1);}
