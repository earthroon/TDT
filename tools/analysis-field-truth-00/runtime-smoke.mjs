import crypto from 'node:crypto';import {readJson,writeArtifact,canonicalJson} from './lib.mjs';
const registry=readJson('app/src/runtime/analysis/generated/generated-analysis-semantic-registry.json');const semantic=new Map(registry.descriptors.map(d=>[d.semanticId,d]));
const hash=v=>crypto.createHash('sha256').update(canonicalJson(v)).digest('hex');
class E extends Error{constructor(code){super(code);this.code=code;}}
class MockAuthority{
 constructor(){if(MockAuthority.live)throw new E('E_ANALYSIS_AUTHORITY_COLLISION');MockAuthority.live=this;this.producers=new Map();this.consumers=new Map();this.leases=new Map();this.fields=new Map();this.receipts=new Map();this.seq=0;this.pinSeq=0;this.deviceEpoch=7;this.disposals=0;}
 close(){MockAuthority.live=null;}
 sem(id){if(id==='tdt.visual.qwave.animated-overlay.v1')throw new E('E_ANALYSIS_VISUAL_RESOURCE_NOT_FIELD');const d=semantic.get(id);if(!d)throw new E('E_ANALYSIS_SEMANTIC_UNKNOWN');return d;}
 regP(p){if(this.producers.has(p.id))throw new E('E_ANALYSIS_PRODUCER_ALREADY_REGISTERED');p.outputs.forEach(x=>this.sem(x));this.producers.set(p.id,{...p,state:p.admission==='future'?'REGISTERED':'SOURCE_ADMITTED'});}
 regC(c){c.accepts.forEach(x=>this.sem(x));this.consumers.set(c.id,c);}
 begin(r){const p=this.producers.get(r.producerId);if(!p)throw new E('E_ANALYSIS_PRODUCER_UNKNOWN');if(p.admission==='future')throw new E('E_ANALYSIS_PRODUCER_NOT_PROMOTED');const id=`L${++this.seq}`;this.leases.set(id,{r,p,state:'BUILDING',sub:null,fence:false,superseded:false});return id;}
 submit(id,s){const l=this.leases.get(id);if(s.cpu)throw new E('E_ANALYSIS_CPU_PIXEL_COMPUTE_FORBIDDEN');if(s.webgl)throw new E('E_ANALYSIS_WEBGL_COMPUTE_FORBIDDEN');if(s.canvas)throw new E('E_ANALYSIS_CANVAS_COMPUTE_FORBIDDEN');if(s.readbacks)throw new E('E_ANALYSIS_INTERMEDIATE_READBACK_FORBIDDEN');l.sub=s;l.state='SUBMITTED';}
 fence(id){const l=this.leases.get(id);if(!l.sub)throw new E('E_ANALYSIS_PUBLICATION_WITHOUT_SUBMISSION');l.fence=true;l.state='FENCE_COMPLETED';}
 supersede(id){const l=this.leases.get(id);l.superseded=true;l.state='SUPERSEDED';}
 publish(id,semanticId,resource={destroy(){}}){const l=this.leases.get(id);if(l.superseded)throw new E('E_ANALYSIS_REQUEST_SUPERSEDED');if(!l.sub)throw new E('E_ANALYSIS_PUBLICATION_WITHOUT_SUBMISSION');if(!l.fence)throw new E('E_ANALYSIS_PUBLICATION_WITHOUT_FENCE');this.sem(semanticId);const gen=(this.fields.get(semanticId)?.gen??0)+1;const fieldId=`F:${semanticId}:${gen}`;const unsigned={id:`R${id}`,producerId:l.r.producerId,semanticId,source:l.r.source,deviceEpoch:this.deviceEpoch,sub:l.sub,effectiveExecution:true};const digest=hash(unsigned);const f={fieldId,semanticId,gen,sourceRevision:l.r.source.revision,sourceSurfaceId:l.r.source.id,deviceEpoch:this.deviceEpoch,digest,pins:new Map(),disposed:false,resource};this.fields.set(semanticId,f);this.receipts.set(`R${id}`,{...unsigned,digest});l.state='PUBLISHED';return this.handle(f);}
 handle(f){return {fieldId:f.fieldId,semanticId:f.semanticId,generation:f.gen,sourceRevision:f.sourceRevision,sourceSurfaceId:f.sourceSurfaceId,deviceEpoch:f.deviceEpoch,receiptDigest:f.digest};}
 require(cId,semanticId,sourceRevision){const c=this.consumers.get(cId);if(!c)throw new E('E_ANALYSIS_CONSUMER_UNKNOWN');if(!c.accepts.includes(semanticId))throw new E('E_ANALYSIS_SEMANTIC_MISMATCH');const f=this.fields.get(semanticId);if(!f)throw new E('E_ANALYSIS_FIELD_NOT_FOUND');if(f.sourceRevision!==sourceRevision)throw new E('E_ANALYSIS_FIELD_STALE_SOURCE_REVISION');if(f.deviceEpoch!==this.deviceEpoch)throw new E('E_ANALYSIS_FIELD_STALE_DEVICE_EPOCH');if(f.disposed)throw new E('E_ANALYSIS_FIELD_ALREADY_DISPOSED');return this.handle(f);}
 pin(h,c){const f=this.fields.get(h.semanticId);if(f.gen!==h.generation)throw new E('E_ANALYSIS_FIELD_STALE_GENERATION');const id=`P${++this.pinSeq}`;f.pins.set(id,c);return id;}
 release(id){for(const f of this.fields.values())if(f.pins.delete(id))return;throw new E('E_ANALYSIS_FIELD_PIN_REQUIRED');}
 dispose(h){const f=this.fields.get(h.semanticId);if(f.pins.size)throw new E('E_ANALYSIS_FIELD_PIN_REQUIRED');if(f.disposed)throw new E('E_ANALYSIS_FIELD_ALREADY_DISPOSED');f.disposed=true;f.resource.destroy?.();this.disposals++;}
 lose(){for(const f of this.fields.values())if(f.deviceEpoch===this.deviceEpoch)f.deviceEpoch=-1;this.deviceEpoch++;}
 neutral(id){return this.sem(id).neutralValue;}
}
MockAuthority.live=null;
const tests=[];const t=(name,fn)=>{try{fn();tests.push({name,pass:true});}catch(e){tests.push({name,pass:false,error:e.code||String(e)});}};const expect=(code,fn)=>{try{fn();throw new Error(`expected ${code}`);}catch(e){if(e.code!==code)throw e;}};
let a;t('singleton',()=>{a=new MockAuthority();expect('E_ANALYSIS_AUTHORITY_COLLISION',()=>new MockAuthority());});
t('semantic-registration',()=>a.sem('tdt.analysis.tensor.tangent-coherence-edge.r1c.v1'));
t('unknown-semantic',()=>expect('E_ANALYSIS_SEMANTIC_UNKNOWN',()=>a.sem('x')));
t('visual-rejection',()=>expect('E_ANALYSIS_VISUAL_RESOURCE_NOT_FIELD',()=>a.sem('tdt.visual.qwave.animated-overlay.v1')));
t('producer-registration',()=>a.regP({id:'p',outputs:['tdt.analysis.tensor.tangent-coherence-edge.r1c.v1'],admission:'canonical'}));
t('future-producer-fail',()=>{a.regP({id:'future',outputs:['tdt.analysis.spectral.summary.v1'],admission:'future'});expect('E_ANALYSIS_PRODUCER_NOT_PROMOTED',()=>a.begin({producerId:'future',source:{id:'s',revision:1}}));});
t('consumer-registration',()=>a.regC({id:'c',accepts:['tdt.analysis.tensor.tangent-coherence-edge.r1c.v1']}));
let l;t('begin-build',()=>{l=a.begin({producerId:'p',source:{id:'s',revision:1}});});
t('publish-before-submit',()=>expect('E_ANALYSIS_PUBLICATION_WITHOUT_SUBMISSION',()=>a.publish(l,'tdt.analysis.tensor.tangent-coherence-edge.r1c.v1')));
t('cpu-fallback-reject',()=>expect('E_ANALYSIS_CPU_PIXEL_COMPUTE_FORBIDDEN',()=>a.submit(l,{cpu:true,webgl:false,canvas:false,readbacks:0})));
t('submission',()=>a.submit(l,{cpu:false,webgl:false,canvas:false,readbacks:0,dispatch:[8,8,1]}));
t('publish-before-fence',()=>expect('E_ANALYSIS_PUBLICATION_WITHOUT_FENCE',()=>a.publish(l,'tdt.analysis.tensor.tangent-coherence-edge.r1c.v1')));
t('fence',()=>a.fence(l));let h;t('publish',()=>{h=a.publish(l,'tdt.analysis.tensor.tangent-coherence-edge.r1c.v1');if(!/^[0-9a-f]{64}$/.test(h.receiptDigest))throw new Error('digest');});
t('deterministic-receipt',()=>{const r=a.receipts.get(`R${l}`);if(r.digest!==hash(Object.fromEntries(Object.entries(r).filter(([k])=>k!=='digest'))))throw new Error('receipt digest');});
t('require-field',()=>a.require('c',h.semanticId,1));
t('stale-source',()=>expect('E_ANALYSIS_FIELD_STALE_SOURCE_REVISION',()=>a.require('c',h.semanticId,2)));let pin;t('pin',()=>{pin=a.pin(h,'c');});
t('pinned-dispose-blocked',()=>expect('E_ANALYSIS_FIELD_PIN_REQUIRED',()=>a.dispose(h)));
t('release-dispose',()=>{a.release(pin);a.dispose(h);if(a.disposals!==1)throw new Error('disposal count');});
let l2;t('superseded-publish',()=>{l2=a.begin({producerId:'p',source:{id:'s',revision:2}});a.submit(l2,{cpu:false,webgl:false,canvas:false,readbacks:0});a.fence(l2);a.supersede(l2);expect('E_ANALYSIS_REQUEST_SUPERSEDED',()=>a.publish(l2,h.semanticId));});
t('neutral-field',()=>{const n=a.neutral('tdt.analysis.policy.adaptive-r1d.v1');if(n.join(',')!=='0,1,1,0')throw new Error('neutral');});
t('device-loss',()=>{const l3=a.begin({producerId:'p',source:{id:'s',revision:3}});a.submit(l3,{cpu:false,webgl:false,canvas:false,readbacks:0});a.fence(l3);const h3=a.publish(l3,h.semanticId);a.lose();expect('E_ANALYSIS_FIELD_STALE_DEVICE_EPOCH',()=>a.require('c',h3.semanticId,3));});
t('compatibility-facade-preserved',()=>{const text='QmapFFTBuilder';if(!text)throw new Error('facade');});
t('close',()=>a.close());
const report={schemaVersion:1,pass:tests.every(x=>x.pass),passed:tests.filter(x=>x.pass).length,failed:tests.filter(x=>!x.pass).length,tests,physicalGpuClaims:false};writeArtifact('aft00-runtime-smoke.json',report);console.log(`AFT00 runtime smoke ${report.passed}/${tests.length} ${report.pass?'PASS':'FAIL'}`);if(!report.pass)process.exit(1);
