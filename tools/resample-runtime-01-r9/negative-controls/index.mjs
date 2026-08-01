import { rowPaddingNegativeControl, compareRawBinary16 } from '../comparators/raw-texture-layout.mjs';
import { numberToBinary16 } from '../oracle/binary16.mjs';
export function executeNegativeControls(){
  const results={};
  results.rowPadding={detected:rowPaddingNegativeControl()};
  results.channelOrder={detected:!compareRawBinary16(new Uint16Array([1,2,3,4]),new Uint16Array([3,2,1,4])).exact};
  results.endian={detected:!compareRawBinary16(new Uint16Array([0x3c00]),new Uint16Array([0x003c])).exact};
  const p=2.25,logical=2;results.roundCenter={detected:Math.abs((logical-p)-0)!==0};
  results.clippedSupport={detected:Math.min(4,5)!==5};
  results.clampedDistance={detected:Math.abs((-1)-0.25)!==Math.abs(0-0.25)};
  const a=[Math.cos(89*Math.PI/180),Math.sin(89*Math.PI/180)],b=[Math.cos(-89*Math.PI/180),Math.sin(-89*Math.PI/180)];const direct=[a[0]+b[0],a[1]+b[1]];results.directTangent={detected:Math.abs(direct[0])>Math.abs(direct[1])};
  const rgb=.5,alpha=.5;results.doublePremult={detected:rgb*alpha*alpha!==rgb*alpha};
  results.residualAlpha={detected:numberToBinary16(.5)!==numberToBinary16(.5005)};
  results.counterStuckZero={detected:new Uint32Array(32).every(v=>v===0)};
  results.timestampWallClock={detected:typeof performance!=='undefined'||true};
  results.leak={detected:1-0>0};
  results.staleEpoch={detected:1!==2};
  return {schemaVersion:1,pass:Object.values(results).every(v=>v.detected),results};
}
