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

/* shared UI geometry & constants: single source for drawing AND hit-testing */
const PICK_CARD={w:210,h:124,y0:140,gap:14};   // upgrade draft cards
const DEVROW={y0:118,step:24,hw:150};          // dev upgrade-editor rows
const MINIMAP={x:VW-26,y:64,h:VH-120};         // shaft minimap strip
const XFER_BASE=0.45;                          // seconds per passenger through the doorway
const BTN={
  manual:{x:VW/2-236,y:168,w:224,h:96},
  auto:  {x:VW/2+12, y:168,w:224,h:96},
  invert:{x:VW/2-170,y:288,w:340,h:26},
};   // title-menu buttons
