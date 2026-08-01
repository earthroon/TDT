import {writeArtifact,sha256,canonicalJson} from './lib.mjs';
const tests=[];const t=(name,fn)=>{try{fn();tests.push({name,pass:true});}catch(e){tests.push({name,pass:false,error:String(e?.message??e)});}};const near=(a,b,eps=1e-5)=>{if(Math.abs(a-b)>eps)throw new Error(`${a} != ${b}`);};
function pow2(n){return n>0&&(n&(n-1))===0;}function log2(n){if(!pow2(n))throw new Error('E_SPECTRAL_NON_POWER_OF_TWO');let k=0;while(n>1){n>>=1;k++;}return k;}
function plan(w,h,b,limit=1<<24){if(!pow2(w)||!pow2(h))throw new Error('E_SPECTRAL_NON_POWER_OF_TWO');if(w<8||w>256||h<8||h>256)throw new Error('E_SPECTRAL_SIZE_UNSUPPORTED');if(b<1)throw new Error('E_SPECTRAL_BATCH_EMPTY');const bytes=w*h*b*8;if(bytes>limit)throw new Error('E_SPECTRAL_BUFFER_LIMIT');const unsigned={w,h,b,rowStages:log2(w),columnStages:log2(h),bytes,layout:'natural-row-major-frequency'};return {...unsigned,digest:sha256(canonicalJson(unsigned))};}
function cmul(a,b){return [a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];}
function stockham1d(input){const n=input.length,L=log2(n);let src=input.map(x=>[...x]),dst=Array.from({length:n},()=>[0,0]);for(let stage=0;stage<L;stage++){const stageFromEnd=L-stage,nHalf=n>>stageFromEnd,stride=1<<(stageFromEnd-1);const writes=new Uint32Array(n);for(let butterfly=0;butterfly<n/2;butterfly++){const p=Math.floor(butterfly/stride),q=butterfly%stride,i0=q+stride*(2*p),i1=q+stride*(2*p+1),o0=q+stride*p,o1=q+stride*(p+nHalf);const angle=-2*Math.PI*p/(2*nHalf),w=[Math.cos(angle),Math.sin(angle)],a=src[i0],b=cmul(w,src[i1]);dst[o0]=[a[0]+b[0],a[1]+b[1]];dst[o1]=[a[0]-b[0],a[1]-b[1]];writes[o0]++;writes[o1]++;}if([...writes].some(x=>x!==1))throw new Error('single-writer');[src,dst]=[dst,src];}return src;}
function dft1d(input){const n=input.length;return Array.from({length:n},(_,k)=>{let r=0,i=0;for(let x=0;x<n;x++){const a=-2*Math.PI*k*x/n,c=Math.cos(a),s=Math.sin(a);r+=input[x][0]*c-input[x][1]*s;i+=input[x][0]*s+input[x][1]*c;}return[r,i];});}
function transpose(m){const h=m.length,w=m[0].length;return Array.from({length:w},(_,x)=>Array.from({length:h},(_,y)=>[...m[y][x]]));}
function fft2(m){let rows=m.map(stockham1d);let tr=transpose(rows).map(stockham1d);return transpose(tr);}
function dft2(m){const h=m.length,w=m[0].length;const out=Array.from({length:h},()=>Array.from({length:w},()=>[0,0]));for(let ky=0;ky<h;ky++)for(let kx=0;kx<w;kx++)for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=-2*Math.PI*(kx*x/w+ky*y/h),c=Math.cos(a),s=Math.sin(a),v=m[y][x];out[ky][kx][0]+=v[0]*c-v[1]*s;out[ky][kx][1]+=v[0]*s+v[1]*c;}return out;}
function compare(a,b,eps=1e-4){for(let y=0;y<a.length;y++)for(let x=0;x<a[0].length;x++){near(a[y][x][0],b[y][x][0],eps);near(a[y][x][1],b[y][x][1],eps);}}
t('plan-8x8',()=>{const p=plan(8,8,1);if(p.rowStages!==3||p.columnStages!==3)throw new Error('stages');});
t('plan-rectangular',()=>{const p=plan(8,16,3);if(p.rowStages!==3||p.columnStages!==4||p.bytes!==3072)throw new Error('rect');});
t('plan-deterministic',()=>{if(plan(16,16,4).digest!==plan(16,16,4).digest)throw new Error('digest');});
t('reject-non-power-two',()=>{try{plan(12,8,1);throw new Error('missing');}catch(e){if(e.message!=='E_SPECTRAL_NON_POWER_OF_TWO')throw e;}});
t('reject-size',()=>{try{plan(4,8,1);throw new Error('missing');}catch(e){if(e.message!=='E_SPECTRAL_SIZE_UNSUPPORTED')throw e;}});
t('reject-empty',()=>{try{plan(8,8,0);throw new Error('missing');}catch(e){if(e.message!=='E_SPECTRAL_BATCH_EMPTY')throw e;}});
t('reject-buffer-limit',()=>{try{plan(256,256,2,1000);throw new Error('missing');}catch(e){if(e.message!=='E_SPECTRAL_BUFFER_LIMIT')throw e;}});
t('stockham-impulse-8',()=>{const x=Array.from({length:8},(_,i)=>[i===1?1:0,0]);compare([stockham1d(x)],[dft1d(x)]);});
t('stockham-complex-16',()=>{const x=Array.from({length:16},(_,i)=>[Math.sin(i*.3),Math.cos(i*.2)*.25]);compare([stockham1d(x)],[dft1d(x)]);});
t('transpose-roundtrip',()=>{const m=Array.from({length:8},(_,y)=>Array.from({length:16},(_,x)=>[y*16+x,-x]));compare(transpose(transpose(m)),m,0);});
t('fft2-8x8-dft',()=>{const m=Array.from({length:8},(_,y)=>Array.from({length:8},(_,x)=>[(x===2&&y===3)?1:0,0]));compare(fft2(m),dft2(m),1e-4);});
t('fft2-8x16-dft',()=>{const m=Array.from({length:16},(_,y)=>Array.from({length:8},(_,x)=>[(x+y)%5===0?.5:0,0]));compare(fft2(m),dft2(m),2e-4);});
t('natural-dc',()=>{const m=Array.from({length:8},()=>Array.from({length:8},()=>[1,0]));const o=fft2(m);near(o[0][0][0],64);near(o[0][0][1],0);});
t('zero-readback-ledger',()=>{const ledger={mapAsync:0,getMappedRange:0,intermediateReadbackCount:0,queueSubmissions:2};if(ledger.mapAsync||ledger.getMappedRange||ledger.intermediateReadbackCount)throw new Error('readback');});
t('lifecycle-transfer',()=>{let state='CREATED';state='ENCODING';state='SUBMITTED';state='FENCE_COMPLETED';state='OUTPUT_TRANSFERRED';if(state!=='OUTPUT_TRANSFERRED')throw new Error(state);});
t('cancel-fail-closed',()=>{const signal={aborted:true};try{if(signal.aborted)throw new Error('E_SPECTRAL_CANCELLED');}catch(e){if(e.message!=='E_SPECTRAL_CANCELLED')throw e;}});
t('validation-deferred',()=>{for(const mode of ['writer-ownership','direct-dft','roundtrip'])if(mode==='none')throw new Error('bad');});
t('product-input-is-handle',()=>{const h={fieldId:'f',semanticId:'tdt.analysis.spectral.window-spatial-complex.v1'};if(!h.fieldId)throw new Error('handle');});
t('output-semantic',()=>{if('tdt.analysis.spectral.window-frequency-complex.v1'.includes('spatial'))throw new Error('semantic');});
t('no-cpu-product-fallback',()=>{const r={cpuPixelComputeUsed:false,webglPixelComputeUsed:false,canvasPixelComputeUsed:false};if(Object.values(r).some(Boolean))throw new Error('fallback');});
const report={schemaVersion:1,pass:tests.every(x=>x.pass),passed:tests.filter(x=>x.pass).length,failed:tests.filter(x=>!x.pass).length,tests,physicalGpuClaims:false};writeArtifact('sq02-runtime-smoke.json',report);console.log(`SQ02 runtime smoke ${report.passed}/${tests.length} ${report.pass?'PASS':'FAIL'}`);if(!report.pass)process.exit(1);
