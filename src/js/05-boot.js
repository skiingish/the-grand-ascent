"use strict";
/* ================= THE GRAND ASCENT =================
   Single-file 16-bit-fidelity prototype. All art programmatic. */

const VW=640, VH=400, FLOOR_H=84;
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
function fit(){
  const aw=innerWidth-30, ah=innerHeight-96;
  let s=Math.min(aw/VW, ah/VH);
  s=Math.max(1, Math.floor(s*4)/4);          // quarter-integer steps: crisp but near-full
  cv.width=VW; cv.height=VH;
  cv.style.width=VW*s+'px'; cv.style.height=VH*s+'px';
  ctx.imageSmoothingEnabled=false;
}
addEventListener('resize',fit); fit();
