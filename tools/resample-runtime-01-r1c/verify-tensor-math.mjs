import {check,writeJson} from './lib.mjs';
function eigen(jxx,jxy,jyy){const trace=jxx+jyy;const delta=Math.sqrt(Math.max(0,(jxx-jyy)**2+4*jxy*jxy));const l1=.5*(trace+delta),l2=.5*(trace-delta);if(l1<=1e-12)return {t:[1,0],c:0,e:0,l1,l2};let n=[jxy,l1-jxx];let m=Math.hypot(...n);if(m<=1e-12)n=jxx>=jyy?[1,0]:[0,1];else n=n.map(v=>v/m);let t=[-n[1],n[0]];if(t[0]<0||(Math.abs(t[0])<1e-12&&t[1]<0))t=t.map(v=>-v);return {t,c:(l1-l2)/(l1+l2+1e-12),e:Math.sqrt(l1),l1,l2};}
function ellipse(field,sx,sy,{maxAnisotropy=3,coherenceExponent=1.25,minorCoverageFactor=.82,sigmaMain=1.25,sigmaCross=.65}={}){const [tx,ty]=field.t;const nx=-ty,ny=tx;const st=Math.max(1,Math.hypot(tx*sx,ty*sy));const sn=Math.max(1,Math.hypot(nx*sx,ny*sy));const gate=Math.pow(Math.max(0,Math.min(1,field.c)),coherenceExponent)*Math.max(0,Math.min(1,field.edge??1));const a=2**(gate*Math.log2(maxAnisotropy)),r=Math.sqrt(a);return {major:Math.min(6,Math.max(1,st*sigmaMain*r)),minor:Math.max(minorCoverageFactor,sn*sigmaCross/r),a};}
const flat=eigen(0,0,0),vertical=eigen(4,0,.01),horizontal=eigen(.01,0,4),diag=eigen(2,1.9,2),corner=eigen(2,0,2);
const iso=ellipse({...vertical,c:0,edge:1},2,2),aniso=ellipse({...vertical,c:1,edge:1},2,2),weak=ellipse({...vertical,c:1,edge:0},2,2),rot=ellipse({...horizontal,c:1,edge:1},3,1);
const checks=[
 check(flat.c===0&&flat.t[0]===1,'math-flat','flat isotropic'),
 check(Math.abs(vertical.t[0])<.01&&vertical.t[1]>0,'math-vertical-edge','vertical edge tangent vertical',vertical),
 check(horizontal.t[0]>.99&&Math.abs(horizontal.t[1])<.01,'math-horizontal-edge','horizontal edge tangent horizontal',horizontal),
 check(diag.c>.9,'math-diagonal-coherence','diagonal rank-one coherent',diag),
 check(Math.abs(corner.c)<1e-9,'math-corner-isotropic','equal eigenvalues low coherence',corner),
 check(vertical.l1>=vertical.l2&&horizontal.l1>=horizontal.l2,'math-order','eigen ordering'),
 check(aniso.a>iso.a,'math-aniso-sensitive','coherence changes anisotropy',{iso,aniso}),
 check(weak.a===1,'math-edge-gate','edge gate disables anisotropy',weak),
 check(aniso.major>iso.major,'math-major-sensitive','major grows'),
 check(aniso.minor<iso.minor,'math-minor-sensitive','minor contracts'),
 check(aniso.minor>=.82,'math-coverage-floor','minor floor'),
 check(aniso.major<=6,'math-reach-bound','major reach bounded'),
 check(rot.major!==aniso.major||rot.minor!==aniso.minor,'math-scale-projection','axis scale projection'),
 check(ellipse({...vertical,c:1,edge:1},2,2,{maxAnisotropy:1}).a===1,'math-aniso-one','max anisotropy one isotropic'),
 check(Number.isFinite(aniso.major)&&Number.isFinite(aniso.minor),'math-finite','finite ellipse'),
];
const failed=checks.filter(x=>!x.pass);const report={schemaVersion:1,patchId:'TDT-RESAMPLE-RUNTIME-01-R1C',pass:failed.length===0,counts:{pass:checks.length-failed.length,fail:failed.length},checks,fixtures:{flat,vertical,horizontal,diag,corner,iso,aniso,weak,rot}};writeJson('r1c-tensor-math.json',report);if(failed.length){console.error(failed);process.exit(1);}console.log(`PASS R1C tensor math ${checks.length}/${checks.length}`);
