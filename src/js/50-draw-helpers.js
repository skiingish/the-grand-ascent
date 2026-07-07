/* ---------- drawing helpers ---------- */
function px(x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
function glow(x,y,r,c0){
  const g=ctx.createRadialGradient(x,y,1,x,y,r);
  g.addColorStop(0,c0); g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g; ctx.fillRect(x-r,y-r,r*2,r*2);
}
function sy(worldY){ return Math.round(VH-50-(worldY-G.camY)); } // screen y of a world height
const BX=100, BW=400;            // building x/width
const SHX=BX+BW-124, SHW=104;    // shaft
const HALLX=BX+12;
