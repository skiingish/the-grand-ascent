/* ---------- the manager: hand-set pixel portrait, 40x54 grid ----------
   16-bit portrait rules: 4-tone skin ramp lit from the left, warm brown
   (never black) lines inside the face, one highlight pixel per eye,
   dither on the coat only — skin stays smooth. */
const MGR_PAL={
  k:'#14100c', h:'#1d1814', i:'#3a3430', j:'#55504a',
  x:'#f4cf9e', s:'#e8b98a', a:'#d6a276', S:'#c68f5f', d:'#a3714a', n:'#b07a50', o:'#6b4526',
  e:'#f4e8cf', p:'#241b14', q:'#ffffff', b:'#2a2018',
  m:'#241b14', u:'#4a3428',
  w:'#f4e8cf', W:'#d8cbb0',
  c:'#33383f', C:'#262a30', l:'#4a515c', v:'#5c2430', V:'#4a1c26',
  t:'#8c1f2e', T:'#6d1723', g:'#c9a227', A:'#f0d68a', G:'#7495b3', F:'#a3c4d4', f:'#d5533c',
  R:'#8c1f2e',
};
const MGR=[
'............kkkkkkkkkkkkkkkk............',
'...........kiihhhhhhhhhhhhhhk...........',
'...........kiihhhhhhhhhhhhhhk...........',
'...........kiihhhhhhhhhhhhhhk...........',
'...........kiihhhhhhhhhhhhhhk...........',
'...........kiihhhhhhhhhhhhhhk...........',
'...........kiihhhhhhhhhhhhhhk...........',
'...........kiihhhhhhhhhhhhhhk...........',
'...........kRRRRRRRRRRRRRRRRk...........',
'...........kRRRRRRRggRRRRRRRk...........',
'.......kkkkkiihhhhhhhhhhhhhhkkkkk.......',
'......kiihhhhhhhhhhhhhhhhhhhhhhhhk......',
'.......kkkkkiihhhhhhhhhhhhhhkkkkk.......',
'..........kxxssssssssssssaaSSk..........',
'..........kxxssssssssssssaaSSk..........',
'.........kxxssssssssssssssaaSSk.........',
'.........kxxbbbbbssssssbbbbbSSk.........',
'.........kxbbbbbbssssssbbbbbbSk.........',
'.........kxxsbbbbbssssgggggaSSk.........',
'.........kxxseqppesssgGFepGgSSk.........',
'.........kxxseppeSsssgGGepGgSSk.........',
'.........kxxsSSSSSxssSGGGGGgSSk.........',
'.........kxxssssssxssSgggggaSSk.........',
'.........kxxssssssxssSssssaagSk.........',
'.........kxxssssssxssSssssaagSk.........',
'.........kxxssssdSssssSdssaaSgk.........',
'.........kmmssssssSSSSssssaammk.........',
'.........ksmmmmmmmmmmmmmmmmmmgk.........',
'.........ksmmmmmmmmmmmmmmmmmmSg.........',
'.........kssmmmmmmmmmmmmmmmmSSg.........',
'.........kssssssddddddddssaaSSg.........',
'.........kssssssssssssssssaaSSg.........',
'.........kssssssssssssssssaaSSg.........',
'..........kssssssssssssssaaSSg..........',
'...........kssssssssssssaaSSkg..........',
'............kknnnnnnnnnnnnkkg...........',
'......kkkkkwwkknnnnnnnnnnkkgwkkkkk......',
'....kkcccckwwwkkkkkkkkkkkkgwwkcCCCkk....',
'...kccccccckwwwkkttttttkkwwwkccccCCCk...',
'..kcccccccckwwkkkttttttkkkwwkcccccCCCk..',
'..kccccccccklkvvvkttttkvvvklkcccccCCCk..',
'.kccccccccclkvvvkttttttkvvvklccccccCCCk.',
'.kccccfcccclvvvvvkttttkvvvvvlccccccCCCk.',
'.kcccfffccclvvvvvkttttkvvvvvlccccccCCCk.',
'.kccccfcccclvvvvvkttttkvvvvvlccccccCCCk.',
'kcccccccccclvvvvvkttttkvvvvvlcccccccCCCk',
'kcccccccccclvvggvkttttkvgAvvlcccccccCCCk',
'kcccccccccclvgvvvkttttkvvvgvlcccccccCCCk',
'kcccccccccclvvvvvkttttkvvvvvlcccccccCCCk',
'kcccccccccclvvvvvkttttkvvvvvlcccccccCCCk',
'kcccccccccclvvvvkkttttkkvvvvlcccccccCCCk',
'kcccccccccclvvvvvkttttkvvvvvlcccccccCCCk',
'kcccccccccclvvvvvkttttkvvvvvlcccccccCCCk',
'kcccccccccclvvvvvkttttkvvvvvlcccccccCCCk',
];
function drawManager(x,y,s){
  for(let r=0;r<MGR.length;r++){
    const row=MGR[r];
    for(let c=0;c<row.length;c++){
      const col=MGR_PAL[row[c]];
      if(col) px(x+c*s,y+r*s,s,s,col);
    }
  }
}

function drawIntro(){
  ctx.fillStyle='rgba(13,11,9,.94)'; ctx.fillRect(0,0,VW,VH);
  ctx.strokeStyle=P.brass; ctx.lineWidth=2; ctx.strokeRect(36,26,VW-72,VH-52);
  ctx.strokeStyle=P.brassLo; ctx.lineWidth=1; ctx.strokeRect(42,32,VW-84,VH-64);
  // portrait in a gilded frame
  const fx=76,fy=80,fw=146,fh=186;
  px(fx-6,fy-6,fw+12,fh+12,P.brassLo); px(fx-4,fy-4,fw+8,fh+8,P.brass);
  px(fx-1,fy-1,fw+2,fh+2,P.brassDk); px(fx,fy,fw,fh,'#181310');
  const gg=ctx.createLinearGradient(0,fy,0,fy+fh);
  gg.addColorStop(0,'#241d16'); gg.addColorStop(1,'#12100c');
  ctx.fillStyle=gg; ctx.fillRect(fx,fy,fw,fh);
  glow(fx+fw/2,fy+50,60,'rgba(201,162,39,.06)');
  drawManager(fx+(fw-40*3)/2,fy+12,3);
  // nameplate
  px(fx+fw/2-44,fy+fh+8,88,16,P.brass); px(fx+fw/2-42,fy+fh+10,84,12,'#221c14');
  ctx.fillStyle=P.brassHi; ctx.font='9px monospace'; ctx.textAlign='center';
  ctx.fillText('THE MANAGER',fx+fw/2,fy+fh+19);
  // his welcome
  const tx=270;
  ctx.fillStyle=P.brassHi; ctx.font='20px Limelight, monospace'; ctx.textAlign='left';
  ctx.fillText('YOUR EMPLOYER',tx,104);
  px(tx,114,150,1,P.brassLo);
  ctx.font='11px monospace'; ctx.fillStyle=P.cream;
  [
    '"So. You\'re the new operator."',
    '',
    '"The last one walked out mid-shift.',
    ' You\'ll find out why soon enough."',
    '',
    '"Rules of this building: nobody waits.',
    ' Three storm-offs and you\'re finished.',
    ' Guests tip in honest coin — earn well',
    ' and we build higher."',
    '',
    '"Your car awaits. Don\'t embarrass me."',
  ].forEach((l,i)=>ctx.fillText(l,tx,132+i*17));
  if(Math.floor(G.t*2)%2===0){
    ctx.fillStyle=P.brass; ctx.font='11px monospace'; ctx.textAlign='center';
    ctx.fillText('— CLICK OR PRESS ANY KEY TO CLOCK IN —',VW/2,VH-52);
  }
}

function drawMenuButton(b,hover,title,lines){
  px(b.x,b.y,b.w,b.h,hover?'rgba(46,38,24,.96)':'rgba(20,17,14,.94)');
  ctx.strokeStyle=hover?P.brassHi:P.brassLo; ctx.lineWidth=hover?2:1;
  ctx.strokeRect(b.x+.5,b.y+.5,b.w-1,b.h-1);
  if(hover){ ctx.strokeStyle=P.brass; ctx.strokeRect(b.x+4.5,b.y+4.5,b.w-9,b.h-9); }
  ctx.fillStyle=hover?P.brassHi:P.brass; ctx.font='16px Limelight, monospace'; ctx.textAlign='center';
  ctx.fillText(title,b.x+b.w/2,b.y+30);
  px(b.x+b.w/2-34,b.y+38,68,1,P.brassLo);
  ctx.font='10px monospace'; ctx.fillStyle=P.cream;
  lines.forEach((l,i)=>ctx.fillText(l,b.x+b.w/2,b.y+56+i*13));
}
function drawTitle(){
  ctx.fillStyle='rgba(13,11,9,.9)'; ctx.fillRect(0,0,VW,VH);
  ctx.strokeStyle=P.brass; ctx.lineWidth=2; ctx.strokeRect(36,26,VW-72,VH-52);
  ctx.strokeStyle=P.brassLo; ctx.lineWidth=1; ctx.strokeRect(42,32,VW-84,VH-64);
  for(const [cx2,cy3,dx,dy] of [[36,26,1,1],[VW-36,26,-1,1],[36,VH-26,1,-1],[VW-36,VH-26,-1,-1]]){
    ctx.fillStyle=P.brass;
    ctx.beginPath(); ctx.moveTo(cx2,cy3); ctx.lineTo(cx2+dx*22,cy3); ctx.lineTo(cx2,cy3+dy*22); ctx.fill();
    ctx.fillStyle='#0d0b09';
    ctx.beginPath(); ctx.moveTo(cx2,cy3); ctx.lineTo(cx2+dx*12,cy3); ctx.lineTo(cx2,cy3+dy*12); ctx.fill();
  }
  ctx.fillStyle=P.brassHi; ctx.font='30px Limelight, monospace'; ctx.textAlign='center';
  ctx.fillText('THE GRAND ASCENT',VW/2,86);
  px(VW/2-110,98,220,1,P.brassLo); px(VW/2-60,101,120,1,P.brassLo);
  ctx.font='11px monospace'; ctx.fillStyle=P.cream;
  ctx.fillText('Deliver guests before they boil over — three walk-outs and',VW/2,124);
  ctx.fillText('the management lets you go. Happy guests tip in good honest coin.',VW/2,140);
  drawMenuButton(BTN.manual,inBtn(BTN.manual),'MANUAL',
    ['Arrow keys or scroll wheel','drive the lever.','SPACE works the gate.']);
  drawMenuButton(BTN.auto,inBtn(BTN.auto),'AUTO',
    ['Click a floor —','the car does the driving.','Pure routing.']);
  // scroll-direction toggle
  const b=BTN.invert,h=inBtn(b);
  px(b.x,b.y,b.w,b.h,h?'rgba(46,38,24,.96)':'rgba(20,17,14,.9)');
  ctx.strokeStyle=h?P.brassHi:P.brassLo; ctx.lineWidth=1; ctx.strokeRect(b.x+.5,b.y+.5,b.w-1,b.h-1);
  ctx.fillStyle=h?P.brassHi:P.cream; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText('SCROLL DIRECTION:  '+(wheelInv?'SCROLL DOWN = UP (INVERTED)':'SCROLL UP = UP')+'   ⟲',b.x+b.w/2,b.y+17);
  ctx.fillStyle=P.cream; ctx.font='11px monospace';
  ctx.fillText('BEST: $'+G.hs.tips.toFixed(2)+'  ·  FLOOR '+floorName(G.hs.floor),VW/2,VH-46);
  if(Math.floor(G.t*2)%2===0){
    ctx.fillStyle=P.brass; ctx.fillText('— CLICK A MODE TO CLOCK IN —',VW/2,VH-64);
  }
}

function draw(){
  ctx.save();
  if(G.shake>0) ctx.translate(rnd(4)-2,rnd(4)-2);
  drawBuilding();
  drawHUD();
  ctx.restore();
  if(G.dev&&G.state!=='devmenu'){
    ctx.fillStyle=P.bad; ctx.font='10px monospace'; ctx.textAlign='center';
    ctx.fillText('· DEV ·',VW/2,VH-8);
  }
  if(G.state==='devmenu'){ drawDevMenu(); }
  else if(G.state==='pick'){ drawPickOverlay(); }
  else if(G.state==='pause'){
    drawOverlay('INTERMISSION',[
      'The car rests between floors.',
      '',
      'Guests are frozen in time — even the grumpy ones.',
    ]);
  }
  else if(G.state==='title'){ drawTitle(); }
  else if(G.state==='intro'){ drawIntro(); }
  else if(G.state==='over'){
    drawOverlay('SHIFT TERMINATED',[
      'The revolving door hits you on the way out.',
      '',
      'TIPS EARNED:  $'+G.tips.toFixed(2),
      'HIGHEST FLOOR REACHED:  '+floorName(G.maxFloor),
      'GUESTS DELIVERED:  '+G.delivered,
      '',
      'HOUSE BEST: $'+G.hs.tips.toFixed(2)+'  ·  FLOOR '+floorName(G.hs.floor),
    ]);
  }
}
