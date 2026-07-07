/* ---------- shaft & car ---------- */
function drawShaft(){
  const topY=sy(G.floors*FLOOR_H), botY=sy(-G.base*FLOOR_H-14);
  const sg=ctx.createLinearGradient(SHX,0,SHX+SHW,0);
  sg.addColorStop(0,P.shaft); sg.addColorStop(.5,P.shaft2); sg.addColorStop(1,P.shaft);
  ctx.fillStyle=sg; ctx.fillRect(SHX,topY,SHW,botY-topY);
  for(let f=-G.base;f<=G.floors;f++){ const y=sy(f*FLOOR_H); px(SHX,y-6,SHW,3,'#050403'); }
  px(SHX+4,topY,3,botY-topY,P.rail); px(SHX+SHW-7,topY,3,botY-topY,P.rail);
  px(SHX+5,topY,1,botY-topY,'#4a4038'); px(SHX+SHW-6,topY,1,botY-topY,'#4a4038');
  // car
  const cy=sy(G.pos*FLOOR_H);              // car floor baseline
  const carX=SHX+12,carW=SHW-24,carH=64;
  // cables
  px(carX+carW/2-9,topY,2,cy-carH-6-topY,'#5a5248'); px(carX+carW/2+7,topY,2,cy-carH-6-topY,'#5a5248');
  px(carX+carW/2-9,topY,1,cy-carH-6-topY,'#7a7268'); px(carX+carW/2+7,topY,1,cy-carH-6-topY,'#7a7268');
  // crossbeam + housing
  px(carX-5,cy-carH-8,carW+10,6,P.brassLo); px(carX-5,cy-carH-8,carW+10,2,P.brass);
  // interior (warm light)
  const ig=ctx.createLinearGradient(0,cy-carH,0,cy);
  ig.addColorStop(0,'#3d3120'); ig.addColorStop(.5,'#57452a'); ig.addColorStop(1,'#2e2517');
  ctx.fillStyle=ig; ctx.fillRect(carX,cy-carH,carW,carH-5);
  glow(carX+carW/2,cy-carH+10,30,'rgba(255,220,150,.20)');
  px(carX+carW/2-4,cy-carH+2,8,3,'#ffe9a8');                       // ceiling lamp
  // wood paneling
  for(let x=carX+3;x<carX+carW-4;x+=12) px(x,cy-26,9,20,'rgba(0,0,0,.15)');
  px(carX,cy-carH,carW,2,P.brassHi);
  // riders inside
  const rs=riders();
  rs.forEach((p,i)=>{
    const rx=carX+5+i*((carW-22)/Math.max(1,G.cap-1||1));
    drawPerson(rx,cy-7,p,0);
    ctx.fillStyle=p.angry?P.bad:P.cream; ctx.font='9px monospace'; ctx.textAlign='center';
    ctx.fillText(floorName(p.dest),rx+7,cy-carH+13);
  });
  // doorway transfer walker
  if(G.transfer){
    const p=G.transfer, prog=1-G.transferT/(G.transferDur||XFER_BASE);
    const fromX=p.state==='boarding'?SHX-20:carX+carW/2, toX=p.state==='boarding'?carX+carW/2:SHX-26;
    drawPerson(fromX+(toX-fromX)*prog,cy-7,p,Math.floor(G.t*10));
  }
  // car frame + kick plate
  px(carX-2,cy-6,carW+4,4,'#6b531f'); px(carX-4,cy-3,carW+8,3,P.brassLo);
  px(carX-2,cy-6,carW+4,1,P.brass);
  // accordion gate (scissor lattice)
  const open=G.doorT, gw=Math.round(carW*(1-open));
  if(gw>2){
    ctx.save(); ctx.beginPath(); ctx.rect(carX,cy-carH+3,gw,carH-11); ctx.clip();
    for(let x=0;x<gw;x+=6){ px(carX+x,cy-carH+3,2,carH-11,P.brass); px(carX+x,cy-carH+3,1,carH-11,P.brassHi); }
    ctx.strokeStyle=P.brassLo; ctx.lineWidth=1; ctx.beginPath();
    for(let x=-carH;x<gw;x+=12){
      ctx.moveTo(carX+x,cy-carH+3); ctx.lineTo(carX+x+carH,cy-8);
      ctx.moveTo(carX+x+carH,cy-carH+3); ctx.lineTo(carX+x,cy-8);
    }
    ctx.stroke();
    px(carX,cy-carH+30,gw,2,P.brassLo);
    ctx.restore();
  }
  // shaft brass edges
  px(SHX-3,topY,3,botY-topY,P.brassLo); px(SHX+SHW,topY,3,botY-topY,P.brassLo);
  px(SHX-3,topY,1,botY-topY,P.brass); px(SHX+SHW+2,topY,1,botY-topY,P.brass);
}
