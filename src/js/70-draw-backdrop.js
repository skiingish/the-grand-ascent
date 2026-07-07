/* ---------- backdrop ---------- */
function drawBackdrop(){
  const g=ctx.createLinearGradient(0,0,0,VH);
  g.addColorStop(0,'#0a0912'); g.addColorStop(.6,'#141019'); g.addColorStop(1,'#1c130f');
  ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
  // stars
  for(let i=0;i<70;i++){
    const x=(i*137)%VW, y=(i*211+((i%5)*77))%(VH-80);
    if((i+Math.floor(G.t))%11>0) px(x,y,1,1,'rgba(244,232,207,'+(i%3?.22:.4)+')');
  }
  // moon: lives in the far background, drifting gently with the camera
  const par=G.camY*0.25;
  const moonY=96+par*0.2;
  glow(VW-88,moonY+10,34,'rgba(240,232,210,.16)');
  px(VW-96,moonY,16,16,'#e8e0cc'); px(VW-94,moonY+2,5,5,'#cfc7b2'); px(VW-88,moonY+8,4,4,'#cfc7b2');
  // city skyline, slight parallax
  const sk=[[0,120,34],[30,88,26],[58,140,30],[86,70,22],[470,110,40],[512,150,34],[548,92,30],[580,130,44]];
  for(const [bx,bh,bw] of sk){
    const byTop=VH-46-bh+par*0.3;
    px(bx,byTop,bw,VH-byTop,'#191420');
    px(bx,byTop,bw,2,'#241d2e');
    for(let wx=bx+4;wx<bx+bw-4;wx+=8) for(let wy=byTop+6;wy<VH-60;wy+=12)
      if(((wx*7+wy*13)%17)<4) px(wx,wy,3,4,'rgba(255,214,120,.34)');
  }
}

function drawBuilding(){
  drawBackdrop();
  for(let f=-G.base;f<G.floors;f++) drawFloor(f);
  // roof / construction of next floor
  const ry=sy(G.floors*FLOOR_H);
  if(ry>-30){
    px(BX-6,ry-6,BW+12,8,P.slab); px(BX-6,ry-6,BW+12,2,P.slabHi);
    px(BX+14,ry-30,5,24,'#4a3b2c'); px(BX+BW-80,ry-30,5,24,'#4a3b2c');
    px(BX+6,ry-33,BW-58,4,'#4a3b2c'); px(BX+6,ry-33,BW-58,1,'#6b5844');
    for(let x=BX+30;x<BX+BW-90;x+=34) px(x,ry-29,2,23,'#3a2e22');
    ctx.fillStyle='rgba(244,232,207,.4)'; ctx.font='10px monospace'; ctx.textAlign='left';
    ctx.fillText('FLOOR '+floorName(G.floors)+' — OPENING SOON  ('+(G.nextFloorAt-G.delivered)+' GUESTS TO GO)',BX+18,ry-40);
  }
  // outer wall faces (down through the cellars)
  const wallBot=sy(-G.base*FLOOR_H-14);
  px(BX-6,sy(G.floors*FLOOR_H)-6,6,wallBot-sy(G.floors*FLOOR_H)+6,'#1b1512');
  px(BX-6,sy(G.floors*FLOOR_H)-6,2,wallBot-sy(G.floors*FLOOR_H)+6,'#2a221c');
  drawShaft();
  // dispatcher target marker: pulsing chevron beside the shaft
  if(G.scheme==='auto'&&G.autoTarget!==null){
    const tym=sy(G.autoTarget*FLOOR_H), pulse=Math.floor(G.t*4)%2;
    px(SHX-12-pulse*2,tym-14,8,3,P.warn); px(SHX-10-pulse*2,tym-11,6,3,P.warn); px(SHX-8-pulse*2,tym-8,4,3,P.warn);
  }
  // street flanks the building; below it, bedrock wraps the cellars
  const gy=sy(0);
  if(gy<VH){
    px(0,gy,BX-6,VH-gy,'#12100d'); px(BX+BW,gy,VW-BX-BW,VH-gy,'#12100d');
    px(0,gy-1,BX-6,2,'#000'); px(BX+BW,gy-1,VW-BX-BW,2,'#000');
    px(0,gy+8,BX-6,2,'#1f1b16'); px(BX+BW,gy+8,VW-BX-BW,2,'#1f1b16');
    for(let x=8;x<BX-30;x+=52) px(x,gy+4,26,2,'#241f18');
    for(let x=BX+BW+8;x<VW-26;x+=52) px(x,gy+4,26,2,'#241f18');
  }
  const rockY=sy(-G.base*FLOOR_H);
  px(BX-6,rockY,BW+12,Math.max(0,VH-rockY),'#0a0806');
}
