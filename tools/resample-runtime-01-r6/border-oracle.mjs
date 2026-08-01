export function clampFetch(logical,size){return Math.max(0,Math.min(size-1,logical));}
export function logicalDistance(logical,p){return logical-p;}
export function incorrectClampedDistance(logical,p,size){return clampFetch(logical,size)-p;}
