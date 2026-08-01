import { oracleSourcePosition, oracleCandidateBase, oracleCandidateCoordinate, oracleDistance, oracleWeight } from '../../resample-runtime-01-r3/ewa-f64-oracle.mjs';
import { numberToBinary16 } from './binary16.mjs';
import { R9_ORACLE_ID } from '../identity.mjs';
export const ORACLE_ID=R9_ORACLE_ID;
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
function pixel(field,width,height,x,y){const cx=clamp(x,0,width-1),cy=clamp(y,0,height-1),i=(cy*width+cx)*4;return [field[i],field[i+1],field[i+2],field[i+3]];}
function axialAt(axial,width,height,p){
  const bx=Math.floor(p[0]),by=Math.floor(p[1]),fx=p[0]-bx,fy=p[1]-by;const ws=[(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy];const coords=[[0,0],[1,0],[0,1],[1,1]];
  let ax=0,ay=0,mass=0,edge=0;
  for(let i=0;i<4;i++){let s=pixel(axial,width,height,bx+coords[i][0],by+coords[i][1]);let qx=s[0],qy=s[1],q=Math.hypot(qx,qy);if(!Number.isFinite(q)||q<=1e-6){qx=1;qy=0;}else{qx/=q;qy/=q;}const c=clamp(s[2],0,1),e=clamp(s[3],0,1),w=ws[i];ax+=w*c*qx;ay+=w*c*qy;mass+=w*c;edge+=w*e;}
  const mag=Math.hypot(ax,ay);if(!Number.isFinite(mag)||mag<=1e-6)return [1,0,0,clamp(edge,0,1)];return [ax/mag,ay/mag,clamp(Math.min(mag,mass),0,1),clamp(edge,0,1)];
}
function tangentFromAxial(q){let qx=q[0],qy=q[1],n=Math.hypot(qx,qy);if(!Number.isFinite(n)||n<=1e-6)return [1,0];qx/=n;qy/=n;const tx=Math.sqrt(Math.max(0,.5*(1+qx)));if(tx<=1e-6)return [0,1];let ty=qy/(2*tx),tn=Math.hypot(tx,ty);let x=tx/tn,y=ty/tn;if(x<0||(Math.abs(x)<=1e-6&&y<0)){x=-x;y=-y;}return [x,y];}
function smoothstep(a,b,x){const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
export function evaluateR9Oracle({source,axial,width,height,outWidth,outHeight,params,policy=[0,1,1,1]}){
  const out=new Float64Array(outWidth*outHeight*4);const words=new Uint16Array(out.length);const srcPerDst=[width/outWidth,height/outHeight];
  for(let oy=0;oy<outHeight;oy++)for(let ox=0;ox<outWidth;ox++){
    const p=[oracleSourcePosition(ox,srcPerDst[0]),oracleSourcePosition(oy,srcPerDst[1])],base=oracleCandidateBase(p),a=axialAt(axial,width,height,p),t=tangentFromAxial(a),normal=[-t[1],t[0]];
    const scaleT=Math.max(1,Math.hypot(t[0]*srcPerDst[0],t[1]*srcPerDst[1])),scaleN=Math.max(1,Math.hypot(normal[0]*srcPerDst[0],normal[1]*srcPerDst[1]));
    const edge=smoothstep(params.edgeLow,params.edgeHigh,clamp(a[3],0,1));const gate=clamp(a[2],0,1)**Math.max(params.coherenceExponent,.0001)*edge*clamp(policy[1],0,1)*clamp(policy[3],0,1);const anisotropy=2**(gate*Math.log2(Math.max(params.maxAnisotropy,1))),root=Math.sqrt(anisotropy),footprint=Math.max(policy[2],.75);
    const ellipse={tangentX:t[0],tangentY:t[1],majorRadius:Math.max(1,scaleT*Math.max(params.sigmaMain,.0001)*root*footprint),minorRadius:Math.max(params.minorCoverageFactor,scaleN*Math.max(params.sigmaCross,.0001)/root*footprint),kernelSharpness:params.kernelSharpness,taperExponent:params.kernelTaperExponent,maxReach:params.maxSampleReach};
    let sum=0,acc=[0,0,0,0];for(let dy=-params.maxSampleReach;dy<=params.maxSampleReach;dy++)for(let dx=-params.maxSampleReach;dx<=params.maxSampleReach;dx++){
      const logical=oracleCandidateCoordinate(base,dx,dy),delta=oracleDistance(logical,p);const nx=-ellipse.tangentY,ny=ellipse.tangentX,along=(delta[0]*ellipse.tangentX+delta[1]*ellipse.tangentY)/ellipse.majorRadius,across=(delta[0]*nx+delta[1]*ny)/ellipse.minorRadius,q=along*along+across*across,w=oracleWeight(q,ellipse);if(!(w>0))continue;const s=pixel(source,width,height,logical[0],logical[1]);sum+=w;for(let c=0;c<4;c++)acc[c]+=s[c]*w;
    }
    const oi=(oy*outWidth+ox)*4;if(!(sum>1e-6))throw Object.assign(new Error('oracle zero mass'),{code:'E_R9_ORACLE_ULP_EXCEEDED'});for(let c=0;c<4;c++){out[oi+c]=acc[c]/sum;words[oi+c]=numberToBinary16(out[oi+c]);}
  }
  return {oracleId:ORACLE_ID,values:out,words};
}
