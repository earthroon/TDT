import { writeJson } from './lib.mjs';
class Model {
  constructor() { this.runtimeEpoch=7; this.deviceEpoch=0; this.state='UNINITIALIZED'; this.cache=new Map(); this.leases=[]; }
  activate() { this.state='ACTIVE'; this.deviceEpoch+=1; }
  lease(owner) { const r={owner,epoch:this.deviceEpoch,released:false}; this.leases.push(r); return { assertCurrent:()=>{ if(r.released||this.state!=='ACTIVE'||r.epoch!==this.deviceEpoch) throw new Error('E_GPU_STALE_LEASE'); }, release:()=>{r.released=true;} }; }
  pipeline(key) { const k=`${this.deviceEpoch}|${key}`; if(!this.cache.has(k)) this.cache.set(k,{key:k}); return this.cache.get(k); }
  recover() { this.state='INVALIDATING'; for(const l of this.leases) l.released=true; this.cache.clear(); this.state='RECOVERING'; this.deviceEpoch+=1; this.state='ACTIVE'; }
}
const m=new Model(); m.activate(); const lease=m.lease('qmap'); const a=m.pipeline('p'); const b=m.pipeline('p'); const sameEpochDedup=a===b; m.recover(); let staleRejected=false; try{lease.assertCurrent();}catch(e){staleRejected=String(e.message).includes('E_GPU_STALE_LEASE');} const c=m.pipeline('p');
const report={schemaVersion:1,modelOnly:true,runtimeEpochPreserved:m.runtimeEpoch===7,deviceEpochIncremented:m.deviceEpoch===2,sameEpochDedup,staleRejected,crossEpochReuse:a===c,pass:m.runtimeEpoch===7&&m.deviceEpoch===2&&sameEpochDedup&&staleRejected&&a!==c};
writeJson('gpu-authority-contract-smoke.json', report);
if(!report.pass){console.error(JSON.stringify(report,null,2));process.exit(1);} console.log('PASS GPU Authority contract model smoke');
