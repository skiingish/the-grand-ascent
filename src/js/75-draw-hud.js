/* ---------- HUD ---------- */
function drawDial(){
  const cx=VW/2, cyd=46, R=38;
  // brass casing
  const bg=ctx.createLinearGradient(cx-R,cyd-R,cx+R,cyd);
  bg.addColorStop(0,P.brassHi); bg.addColorStop(.5,P.brass); bg.addColorStop(1,P.brassLo);
  ctx.fillStyle='#141110'; ctx.beginPath(); ctx.arc(cx,cyd,R+9,Math.PI,0); ctx.fill();
  ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(cx,cyd,R+6,Math.PI,0); ctx.fill();
  ctx.fillStyle='#221c14'; ctx.beginPath(); ctx.arc(cx,cyd,R,Math.PI,0); ctx.fill();
  const fg=ctx.createLinearGradient(0,cyd-R,0,cyd);
  fg.addColorStop(0,'#2e2618'); fg.addColorStop(1,'#191510');
  ctx.fillStyle=fg; ctx.beginPath(); ctx.arc(cx,cyd,R-2,Math.PI,0); ctx.fill();
  px(cx-R-14,cyd,R*2+28,4,P.brass); px(cx-R-14,cyd,R*2+28,1,P.brassHi);
  const top=G.floors-1, lo=-G.base, span=Math.max(1,top-lo);
  for(let f=lo;f<G.floors;f++){
    const a=Math.PI+((f-lo)/span)*Math.PI;
    const tx=cx+Math.cos(a)*(R-9), ty=cyd+Math.sin(a)*(R-9);
    ctx.fillStyle=f<0?'#c98a5a':P.cream; ctx.font='9px monospace'; ctx.textAlign='center';
    if(G.floors<=12||f%2===0||f===top||f<0) ctx.fillText(floorName(f),tx,ty+3);
    const ox=cx+Math.cos(a)*(R-3), oy=cyd+Math.sin(a)*(R-3);
    px(ox-1,oy-1,2,2,P.brassLo);
  }
  const a=Math.PI+((G.pos-lo)/span)*Math.PI;
  ctx.strokeStyle=P.rust; ctx.lineWidth=3; ctx.beginPath();
  ctx.moveTo(cx-Math.cos(a)*6,cyd-Math.sin(a)*6); ctx.lineTo(cx+Math.cos(a)*(R-6),cyd+Math.sin(a)*(R-6)); ctx.stroke();
  ctx.strokeStyle='#e0785f'; ctx.lineWidth=1; ctx.beginPath();
  ctx.moveTo(cx,cyd); ctx.lineTo(cx+Math.cos(a)*(R-7),cyd+Math.sin(a)*(R-7)); ctx.stroke();
  px(cx-3,cyd-3,6,4,P.brassHi); px(cx-2,cyd-2,3,2,'#fff8e0');
  // flush lamp
  const ok=flushFloor()!==-99;
  px(cx+R+18,cyd-13,12,12,ok?P.ok:'#332a20');
  if(ok) glow(cx+R+24,cyd-7,12,'rgba(127,191,106,.5)');
  ctx.strokeStyle=P.brassLo; ctx.strokeRect(cx+R+17.5,cyd-13.5,13,13);
  ctx.fillStyle=P.cream; ctx.font='8px monospace'; ctx.textAlign='center'; ctx.fillText('FLUSH',cx+R+24,cyd+9);
  // fine alignment gauge
  const off=G.pos-Math.round(G.pos), tol=flushTol();
  px(cx-R-58,cyd-11,34,10,'#141110'); ctx.strokeStyle=P.brassLo; ctx.strokeRect(cx-R-58.5,cyd-11.5,35,11);
  px(cx-R-42,cyd-10,2,8,'#4a3f2a');
  px(cx-R-58+16+Math.round(off*140),cyd-9,4,6,Math.abs(off)<tol?P.ok:P.warn);
  ctx.fillStyle=P.cream; ctx.fillText('LEVEL',cx-R-41,cyd+9);
}
function plaque(x,y,w,h){
  px(x,y,w,h,'rgba(13,11,9,.78)');
  px(x,y,w,1,P.brassLo); px(x,y+h-1,w,1,P.brassLo); px(x,y,1,h,P.brassLo); px(x+w-1,y,1,h,P.brassLo);
}
function drawHUD(){
  ctx.font='11px monospace';
  plaque(8,8,132,52);
  ctx.fillStyle=P.brassHi; ctx.textAlign='left';
  ctx.fillText('TIPS  $'+G.tips.toFixed(2),16,24);
  ctx.fillStyle=P.cream;
  ctx.fillText('CAR   '+riders().length+'/'+G.cap,16,39);
  ctx.fillText('BEST  $'+G.hs.tips.toFixed(2),16,54);
  // strikes (lamp count grows with Manager's Favor)
  const ns=maxStrikes(), sw=ns*24+16, sx=VW-8-sw;
  plaque(sx,8,sw,34);
  for(let i=0;i<ns;i++){
    px(sx+12+i*24,14,14,14,i<G.strikes?P.bad:'#2a231c');
    if(i<G.strikes) glow(sx+19+i*24,21,10,'rgba(213,83,60,.5)');
    ctx.strokeStyle=P.brassLo; ctx.strokeRect(sx+12.5+i*24,13.5,15,15);
  }
  ctx.fillStyle=P.cream; ctx.font='8px monospace'; ctx.textAlign='center'; ctx.fillText('STRIKES',sx+sw/2,38);
  drawDial();
  // minimap
  const mx=MINIMAP.x,mh=MINIMAP.h,my=MINIMAP.y;
  px(mx-4,my-4,20,mh+8,'rgba(13,11,9,.8)');
  ctx.strokeStyle=P.brassLo; ctx.strokeRect(mx-4.5,my-4.5,21,mh+9);
  px(mx+5,my,2,mh,P.rail);
  const mlo=-G.base, mspan=Math.max(1,G.floors-1-mlo);
  const lblStep=Math.max(1,Math.ceil(9/(mh/mspan)));   // label every floor while they fit, then thin out
  for(let f=mlo;f<G.floors;f++){
    const y=my+mh-((f-mlo)/mspan)*mh;
    px(mx,y-1,12,2,f<0?'#4a3320':P.rail);
    if(f%lblStep===0||f===G.floors-1||f===mlo){
      ctx.font='7px monospace'; ctx.textAlign='right';
      ctx.fillStyle=f<0?'#c98a5a':(f===0?P.brassHi:'rgba(244,232,207,.75)');
      ctx.fillText(floorName(f),mx-3,y+2);
    }
    const q=waitersAt(f);
    if(q.length){ const worst=Math.max(...q.map(p=>p.grump)); px(mx,y-6,Math.min(12,q.length*3),4,moodColor(worst)); }
  }
  const cy2=my+mh-((G.pos-mlo)/mspan)*mh;
  px(mx+2,cy2-4,8,8,P.brassHi); px(mx+4,cy2-2,4,4,P.brass);
  // message banner
  if(G.msgT>0&&G.msg){
    ctx.font='11px monospace';
    const w=G.msg.length*7+36;
    px(VW/2-w/2,VH-44,w,24,'rgba(13,11,9,.88)');
    px(VW/2-w/2,VH-44,w,2,P.brass); px(VW/2-w/2,VH-22,w,2,P.brass);
    px(VW/2-w/2-6,VH-38,4,12,P.brass); px(VW/2+w/2+2,VH-38,4,12,P.brass);
    ctx.fillStyle=P.brassHi; ctx.textAlign='center'; ctx.fillText(G.msg,VW/2,VH-28);
  }
}

function drawOverlay(title,lines){
  ctx.fillStyle='rgba(13,11,9,.9)'; ctx.fillRect(0,0,VW,VH);
  ctx.strokeStyle=P.brass; ctx.lineWidth=2; ctx.strokeRect(46,42,VW-92,VH-84);
  ctx.strokeStyle=P.brassLo; ctx.lineWidth=1; ctx.strokeRect(52,48,VW-104,VH-96);
  // deco corners
  for(const [cx2,cy3,dx,dy] of [[46,42,1,1],[VW-46,42,-1,1],[46,VH-42,1,-1],[VW-46,VH-42,-1,-1]]){
    ctx.fillStyle=P.brass;
    ctx.beginPath(); ctx.moveTo(cx2,cy3); ctx.lineTo(cx2+dx*22,cy3); ctx.lineTo(cx2,cy3+dy*22); ctx.fill();
    ctx.fillStyle='#0d0b09';
    ctx.beginPath(); ctx.moveTo(cx2,cy3); ctx.lineTo(cx2+dx*12,cy3); ctx.lineTo(cx2,cy3+dy*12); ctx.fill();
  }
  ctx.fillStyle=P.brassHi; ctx.font='26px Limelight, monospace'; ctx.textAlign='center';
  ctx.fillText(title,VW/2,96);
  px(VW/2-90,108,180,1,P.brassLo); px(VW/2-50,111,100,1,P.brassLo);
  ctx.font='12px monospace'; ctx.fillStyle=P.cream;
  lines.forEach((l,i)=>ctx.fillText(l,VW/2,136+i*20));
  if(Math.floor(G.t*2)%2===0){
    ctx.fillStyle=P.brass; ctx.font='12px monospace';
    ctx.fillText(G.state==='title'?'— PRESS 1, 2 OR 3 TO CLOCK IN —':
                 G.state==='pause'?'— PRESS ESC TO RESUME —':'— PRESS ENTER FOR A NEW SHIFT —',VW/2,VH-66);
  }
}

function drawPickOverlay(){
  ctx.fillStyle='rgba(13,11,9,.82)'; ctx.fillRect(0,0,VW,VH);
  ctx.fillStyle=P.brassHi; ctx.font='20px Limelight, monospace'; ctx.textAlign='center';
  ctx.fillText('FLOOR '+floorName(G.floors-1)+' NOW OPEN',VW/2,86);
  ctx.font='11px monospace'; ctx.fillStyle=P.cream;
  ctx.fillText('THE MANAGER OFFERS AN IMPROVEMENT — CHOOSE ONE',VW/2,110);
  const cw=210, ch=124, cy0=140;
  (G.offers||[]).forEach((id,i)=>{
    const u=UPGRADES[id], x=VW/2+(i===0?-cw-14:14), sel=G.pickSel===i;
    px(x,cy0,cw,ch,sel?'rgba(46,38,24,.95)':'rgba(20,17,14,.95)');
    ctx.strokeStyle=sel?P.brassHi:P.brassLo; ctx.lineWidth=sel?2:1;
    ctx.strokeRect(x+.5,cy0+.5,cw-1,ch-1);
    if(sel){ ctx.strokeStyle=P.brass; ctx.strokeRect(x+4.5,cy0+4.5,cw-9,ch-9); }
    ctx.fillStyle=sel?P.brassHi:P.brass; ctx.font='15px Limelight, monospace'; ctx.textAlign='center';
    ctx.fillText(u.name,x+cw/2,cy0+38);
    px(x+cw/2-40,cy0+50,80,1,P.brassLo);
    ctx.fillStyle=P.cream; ctx.font='11px monospace';
    ctx.fillText(u.desc,x+cw/2,cy0+72);
    // level pips
    for(let k=0;k<u.max;k++){
      const owned=k<upLv(id);
      px(x+cw/2-(u.max*12)/2+k*12,cy0+90,8,8,owned?P.brass:'#2a231c');
      ctx.strokeStyle=P.brassLo; ctx.strokeRect(x+cw/2-(u.max*12)/2+k*12+.5,cy0+90.5,8,8);
    }
    ctx.fillStyle=sel?P.brassHi:'rgba(244,232,207,.5)'; ctx.font='10px monospace';
    ctx.fillText('PRESS '+(i+1),x+cw/2,cy0+ch-10);
  });
  if(Math.floor(G.t*2)%2===0){
    ctx.fillStyle=P.brass; ctx.font='11px monospace';
    ctx.fillText('←/→ CHOOSE  ·  ENTER TO INSTALL',VW/2,cy0+ch+34);
  }
}

function drawDevMenu(){
  ctx.fillStyle='rgba(13,11,9,.86)'; ctx.fillRect(0,0,VW,VH);
  ctx.fillStyle=P.brassHi; ctx.font='18px Limelight, monospace'; ctx.textAlign='center';
  ctx.fillText('DEV — UPGRADE EDITOR',VW/2,74);
  ctx.font='10px monospace'; ctx.fillStyle=P.cream;
  ctx.fillText('CLICK A ROW TO CYCLE ITS LEVEL  ·  U OR ESC TO CLOSE',VW/2,94);
  const keys2=Object.keys(UPGRADES);
  keys2.forEach((id,i)=>{
    const u=UPGRADES[id], ry=DEVROW.y0+i*DEVROW.step;
    px(VW/2-DEVROW.hw,ry-14,DEVROW.hw*2,20,'rgba(30,25,20,.9)');
    ctx.strokeStyle=P.brassLo; ctx.strokeRect(VW/2-DEVROW.hw-.5,ry-14.5,DEVROW.hw*2+1,21);
    ctx.fillStyle=P.brass; ctx.font='10px monospace'; ctx.textAlign='left';
    ctx.fillText(u.name,VW/2-140,ry);
    for(let k=0;k<u.max;k++){
      px(VW/2+60+k*14,ry-8,10,10,k<upLv(id)?P.brass:'#2a231c');
      ctx.strokeStyle=P.brassLo; ctx.strokeRect(VW/2+60.5+k*14,ry-8.5,10,10);
    }
  });
  ctx.fillStyle='rgba(244,232,207,.6)'; ctx.textAlign='center';
  ctx.fillText('FLOORS '+G.floors+'  ·  BASEMENTS '+G.base+'  ·  CAP '+G.cap+'  ·  N/M SPAWN GUESTS IN PLAY',VW/2,DEVROW.y0+keys2.length*DEVROW.step+6);
}
