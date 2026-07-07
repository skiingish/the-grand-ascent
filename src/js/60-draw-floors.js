/* ---------- floors ---------- */
function decoPattern(style,x,y,w,h){
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
  const a='rgba(255,255,255,.06)', b='rgba(0,0,0,.14)';
  if(style===0){ for(let i=x;i<x+w;i+=24){ for(let j=0;j<3;j++){ px(i+j*4,y+6+j*3,12,2,b); px(i+j*4+1,y+5+j*3,12,1,a);} } }
  else if(style===1){ for(let i=x;i<x+w;i+=20){ px(i+4,y+4,2,h-24,b); px(i+10,y+8,2,h-32,a); } }
  else if(style===2){ for(let i=x;i<x+w;i+=26){ for(let j=0;j<4;j++){ px(i+6+j*3,y+4+j*4,10-j*2,2,b);} px(i+8,y+2,6,2,a); } }
  else { for(let i=x;i<x+w;i+=22){ px(i+4,y+6,2,10,b); px(i+8,y+3,2,13,a); px(i+12,y+6,2,10,b); } }
  ctx.restore();
}
function drawBasementDecor(f,yt,yb){
  const b=BASEMENTS[-f-1]||BASEMENTS[0];
  // rough brick cellar walls
  px(BX,yt,BW,FLOOR_H,'#2a2320');
  ctx.fillStyle='rgba(0,0,0,.25)';
  for(let row=0;row<4;row++) for(let x=BX+((row%2)*10);x<BX+BW-14;x+=20)
    ctx.fillRect(x+4,yt+8+row*14,14,1);
  px(BX,yt,BW,2,'#12100d'); px(BX,yb-22,BW,14,'#211c17');
  // bare hanging bulb
  px(HALLX+40,yt+4,1,8,'#3a362f'); px(HALLX+39,yt+12,3,4,'#e0a83c');
  glow(HALLX+40,yt+14,16,'rgba(224,168,60,.22)');
  // the joint's sign, glowing faintly
  ctx.fillStyle=b.sign; ctx.font='9px monospace'; ctx.textAlign='left';
  ctx.fillText(b.name,HALLX+56,yt+22);
  px(HALLX+54,yt+26,b.name.length*6,1,b.sign);
  glow(HALLX+56+b.name.length*3,yt+20,22,'rgba(224,168,60,.08)');
  if(f===-1) drawLaundry(yt,yb);
  else if(f===-2) drawCasino(yt,yb);
  else drawSpeakeasy(yt,yb);
}

/* B1 — Wu's Laundry: tubs, drying line, irons on the stove, ticket counter... and one crate too many */
function drawLaundry(yt,yb){
  // sagging drying line with shirts and stiff collars pegged along it
  px(BX+14,yt+30,1,4,'#4a4038'); px(BX+188,yt+30,1,4,'#4a4038');
  for(let i=0;i<11;i++){ const lx=BX+16+i*16, sag=Math.round(Math.sin(i/10*Math.PI)*3); px(lx,yt+32+sag,16,1,'#5a5248'); }
  const hang=[[30,'shirt'],[62,'collar'],[86,'shirt'],[120,'collar'],[144,'shirt']];
  for(const [ox,kind] of hang){ const sag=Math.round(Math.sin((ox+8)/176*Math.PI)*3), hy2=yt+33+sag;
    if(kind==='shirt'){ px(BX+ox,hy2,10,12,'#e9e2d2'); px(BX+ox-2,hy2,3,6,'#e9e2d2'); px(BX+ox+9,hy2,3,6,'#e9e2d2'); px(BX+ox+4,hy2,2,3,'#c9bda6'); }
    else { px(BX+ox,hy2,7,4,'#f4e8cf'); px(BX+ox+2,hy2+1,3,2,'#d8cbb0'); }
    px(BX+ox+3,hy2-2,2,2,'#8a6540'); }                          // wooden peg
  // wooden wash tub with washboard, water, and rising steam
  px(BX+22,yb-20,26,14,'#6b4a2c'); px(BX+22,yb-20,26,2,'#8a6540');
  for(let x=BX+24;x<BX+46;x+=5) px(x,yb-18,1,12,'#523821');      // staves
  px(BX+24,yb-19,22,3,'#5a7a9a'); px(BX+26,yb-19,6,1,'#7495b3'); // water
  px(BX+48,yb-26,4,20,'#8a6540'); for(let k=0;k<5;k++) px(BX+48,yb-24+k*4,4,1,'#523821'); // washboard
  const st=Math.floor(G.t*2.5)%3;
  px(BX+30+st,yb-26-st*3,2,2,'rgba(244,232,207,.4)'); px(BX+36-st,yb-31-st*2,3,3,'rgba(244,232,207,.25)');
  // iron stove with flat irons heating on top
  px(BX+64,yb-18,20,12,'#1d1814'); px(BX+66,yb-16,4,3,'#d5533c'); glow(BX+68,yb-14,8,'rgba(213,83,60,.3)');
  px(BX+68,yb-21,7,3,'#33302a'); px(BX+77,yb-21,7,3,'#33302a');  // flat irons
  px(BX+70,yb-23,2,2,'#33302a'); px(BX+79,yb-23,2,2,'#33302a');  // handles
  // parcel shelf: brown-paper bundles tied with string, tickets tucked in
  px(BX+196,yt+44,84,2,'#4a3b2c');
  for(let i=0;i<4;i++){ const sx2=BX+200+i*20;
    px(sx2,yt+34,14,10,'#8a6540'); px(sx2,yt+38,14,1,'#f4e8cf'); px(sx2+6,yt+34,1,10,'#f4e8cf');
    px(sx2+2,yt+33,4,3,'#f4e8cf'); }                             // ticket stub
  // ticket counter with brass till
  px(BX+196,yb-26,54,20,'#5c4630'); px(BX+196,yb-26,54,3,'#7a5f43'); px(BX+198,yb-16,50,1,'#3a2e22');
  px(BX+204,yb-34,12,8,'#c9a227'); px(BX+206,yb-32,8,3,'#7a5f14'); // till
  px(BX+228,yb-30,6,4,'#f4e8cf');                                  // stack of tickets
  // behind the counter: a crate of "maple syrup" (wink) and the back-room door
  px(BX+256,yb-16,16,10,'#8a6540'); px(BX+256,yb-12,16,1,'#523821'); px(BX+260,yb-14,8,5,'#4a3320');
  px(BX+276,yb-44,22,38,'#3a2e22'); px(BX+278,yb-42,18,34,'#4a3b2c');
  px(BX+282,yb-32,10,3,'#1d1814');                                 // sliding peephole slot
}

/* B2 — The Velvet Room: roulette, faro table, chips, banker lamps, cigar smoke, the cashier's cage */
function drawCasino(yt,yb){
  // velvet wall panels with gold trim
  for(let i=0;i<3;i++){ const vx=BX+18+i*66;
    px(vx,yt+30,50,26,'#4a1c26'); px(vx+2,yt+32,46,22,'#5c2430');
    ctx.strokeStyle='#7a5f14'; ctx.strokeRect(vx+.5,yt+30.5,49,25); }
  // low-hung banker lamps pooling light on the tables
  for(const lx of [BX+48,BX+150]){
    px(lx,yt+2,1,16,'#3a362f'); px(lx-7,yt+18,15,4,'#2e6f5e'); px(lx-5,yt+22,11,1,'#4a9a83');
    glow(lx,yt+30,22,'rgba(255,220,150,.16)'); }
  // roulette table: green felt, wheel, dice
  px(BX+22,yb-18,52,12,'#2e6f5e'); px(BX+22,yb-18,52,2,'#3d8a72'); px(BX+24,yb-6,4,4,'#523821'); px(BX+68,yb-6,4,4,'#523821');
  px(BX+34,yb-24,16,8,'#1d1814'); px(BX+36,yb-22,12,5,'#7a2a22'); px(BX+41,yb-21,3,3,'#c9a227'); // wheel + hub
  px(BX+58,yb-21,3,3,'#f4e8cf'); px(BX+63,yb-20,3,3,'#f4e8cf'); px(BX+59,yb-20,1,1,'#1d1814');   // dice
  // faro table: fanned cards and chip stacks
  px(BX+120,yb-16,44,10,'#2e6f5e'); px(BX+120,yb-16,44,2,'#3d8a72'); px(BX+122,yb-6,4,4,'#523821'); px(BX+158,yb-6,4,4,'#523821');
  px(BX+126,yb-20,5,4,'#f4e8cf'); px(BX+130,yb-21,5,4,'#f4e8cf'); px(BX+128,yb-19,1,1,'#a63d2f');
  for(let i=0;i<3;i++){ const cx2=BX+142+i*6, ch=3+((i*7)%4);
    for(let k=0;k<ch;k++) px(cx2,yb-18-k*2,4,2,['#d5533c','#f4e8cf','#44586b'][(i+k)%3]); }
  // cigar smoke curling up through the lamplight
  const dr=Math.floor(G.t*2)%4;
  px(BX+136+dr,yb-30-dr*4,2,2,'rgba(200,200,216,.28)');
  px(BX+139-dr,yb-40-dr*3,3,2,'rgba(200,200,216,.18)'); px(BX+134,yb-48-dr*2,2,2,'rgba(200,200,216,.10)');
  // the cashier's cage: brass bars, a man who has seen everything
  px(BX+206,yb-46,44,40,'#211c17'); px(BX+208,yb-44,40,28,'#181310');
  for(let x=BX+212;x<BX+246;x+=6) px(x,yb-44,2,28,'#7a5f14');
  px(BX+208,yb-30,40,3,'#5c4630');                                // counter ledge
  px(BX+224,yb-40,6,7,'#c68f5f'); px(BX+223,yb-42,8,3,'#1d1814'); // cashier under a visor
  px(BX+214,yb-33,5,2,'#7fbf6a'); px(BX+236,yb-33,4,2,'#c9a227'); // bills and coin
}

/* B3 — The Blind Tiger: the bar, teacups (in case of a raid), piano, barrels, and the peephole door */
function drawSpeakeasy(yt,yb){
  // string of edison bulbs
  for(let i=0;i<4;i++){ const bx2=BX+30+i*54;
    px(bx2-27,yt+12,54,1,'#3a362f'); px(bx2-1,yt+13,2,3,'#3a362f'); px(bx2-1,yt+16,3,4,'#ffd970');
    if((i+Math.floor(G.t*1.3))%4) glow(bx2,yt+18,12,'rgba(255,217,112,.18)'); }
  // backbar: mirror, shelves of bottles, one ornamental owl
  px(BX+16,yt+30,74,26,'#3a2e22'); px(BX+20,yt+32,66,14,'#4a4652');
  px(BX+18,yt+46,70,2,'#5c4630');
  const bottles=['#2e6f5e','#a63d2f','#e0a83c','#4a9a83','#8c1f2e','#44586b','#2e6f5e','#e0a83c'];
  bottles.forEach((c,i)=>{ const bx3=BX+22+i*8; px(bx3,yt+38,4,8,c); px(bx3+1,yt+35,2,3,c); });
  px(BX+80,yt+36,5,4,'#8a6540'); px(BX+81,yt+34,3,2,'#8a6540'); px(BX+81,yt+37,1,1,'#e0a83c'); px(BX+83,yt+37,1,1,'#e0a83c'); // the owl
  // the bar itself, brass foot rail, teacups standing by
  px(BX+12,yb-26,82,20,'#4a3320'); px(BX+12,yb-26,82,3,'#6b4a2c'); px(BX+14,yb-8,78,2,'#c9a227');
  for(let i=0;i<3;i++){ const tx2=BX+22+i*22; px(tx2,yb-29,5,3,'#f4e8cf'); px(tx2+5,yb-28,2,1,'#f4e8cf'); }
  // upright piano, lid open, sheet music going
  px(BX+118,yb-40,40,34,'#1d1814'); px(BX+120,yb-38,36,6,'#2e2a24');
  px(BX+120,yb-24,36,4,'#f4e8cf'); for(let x=BX+122;x<BX+154;x+=4) px(x,yb-24,1,4,'#1d1814');
  px(BX+130,yb-36,10,6,'#f4e8cf'); px(BX+132,yb-34,6,1,'#1d1814'); px(BX+132,yb-32,6,1,'#1d1814');
  // barrels of "maple syrup", properly hooped
  for(const [ox,oy] of [[172,-22],[188,-22],[180,-40]]){
    px(BX+ox,yb+oy,14,18,'#6b4a2c'); px(BX+ox+2,yb+oy,10,18,'#7a5636');
    px(BX+ox,yb+oy+3,14,1,'#3a2e22'); px(BX+ox,yb+oy+13,14,1,'#3a2e22'); px(BX+ox+6,yb+oy+6,2,5,'#3a2e22'); }
  // the famous door: oak, iron bands, sliding peephole — someone's checking
  px(BX+236,yb-48,28,42,'#3a2e22'); px(BX+238,yb-46,24,38,'#4a3b2c');
  px(BX+238,yb-38,24,2,'#33302a'); px(BX+238,yb-20,24,2,'#33302a');
  px(BX+244,yb-40,12,4,'#1d1814');
  if(Math.floor(G.t/2.5)%3===0){ px(BX+246,yb-39,2,2,'#e0a83c'); px(BX+251,yb-39,2,2,'#e0a83c'); } // eyes at the slot
  px(BX+259,yb-31,2,3,'#c9a227');                                 // handle
}

function drawFloor(f){
  const yb=sy(f*FLOOR_H);                    // baseline (walkable)
  const yt=yb-FLOOR_H;
  if(yb<-10||yt>VH+10) return;
  const th=f===0?['#5a4a28','#4c3e21','#c9a227','#3a3018']:THEMES[((f%THEMES.length)+THEMES.length)%THEMES.length];
  if(f<0){ drawBasementDecor(f,yt,yb); }
  else {
  // wall with vertical light falloff
  const wg=ctx.createLinearGradient(0,yt,0,yb);
  wg.addColorStop(0,th[1]); wg.addColorStop(.4,th[0]); wg.addColorStop(1,th[0]);
  ctx.fillStyle=wg; ctx.fillRect(BX,yt,BW,FLOOR_H);
  decoPattern(f%4,BX,yt,BW,FLOOR_H-26);
  // ceiling molding + wainscot
  px(BX,yt,BW,3,th[3]); px(BX,yt+3,BW,1,'rgba(255,255,255,.12)');
  px(BX,yb-24,BW,2,th[2]); px(BX,yb-22,BW,16,th[3]);
  for(let x=BX+6;x<BX+BW-8;x+=26) px(x,yb-19,18,10,'rgba(255,255,255,.05)');
  if(f===0){ // gilded lobby
    px(BX,yt+6,BW,2,P.brass); px(BX,yb-27,BW,3,P.brass);
    for(let x=BX+22;x<SHX-30;x+=76){                       // marble columns
      px(x,yt+8,12,FLOOR_H-14,'#d8cdb4'); px(x,yt+8,3,FLOOR_H-14,'#f0e8d4');
      px(x+9,yt+8,3,FLOOR_H-14,'#b3a78c'); px(x-3,yt+6,18,4,P.brass); px(x-3,yb-10,18,4,P.brass);
    }
    // chandelier
    const chx=BX+150;
    px(chx-1,yt+3,2,8,P.brassLo);
    px(chx-10,yt+11,20,3,P.brass); px(chx-6,yt+14,12,3,P.brassHi);
    glow(chx,yt+16,26,'rgba(255,217,112,.30)');
    px(chx-12,yt+13,2,3,'#ffd970'); px(chx+10,yt+13,2,3,'#ffd970'); px(chx-1,yt+16,2,3,'#ffe9a8');
    // red carpet
    px(BX+8,yb-8,SHX-BX-20,5,'#7a2a22'); px(BX+8,yb-8,SHX-BX-20,1,'#a34a3c');
  }
  // sconce with glow
  px(HALLX+4,yt+26,6,10,P.brass); px(HALLX+5,yt+23,4,4,'#ffd970');
  glow(HALLX+7,yt+26,18,'rgba(255,217,112,.28)');
  }
  // slab (floor plate)
  px(BX,yb-6,BW,6,P.slab); px(BX,yb-6,BW,1,P.slabHi); px(BX,yb-1,BW,1,P.slabLo);
  // call panel by the shaft
  px(SHX-14,yt+34,6,9,'#221c14'); px(SHX-13,yt+36,4,2,waitersAt(f).length?'#ffd970':'#4a3f2a');
  // floor plaque
  px(SHX-38,yt+18,26,16,'#181310');
  px(SHX-37,yt+19,24,14,P.brass); px(SHX-36,yt+20,22,12,'#221c14'); px(SHX-35,yt+21,20,10,P.brass);
  ctx.fillStyle='#1d1814'; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText(floorName(f),SHX-25,yt+30);
  // waiting queue
  const q=waitersAt(f);
  q.forEach((p,i)=>{
    drawPerson(p.x,yb-6,p,Math.floor(p.walk));
    bubble(p.x+7,yb-42,floorName(p.dest),p.grump);
    px(p.x,yb-4,14,2,'#0007'); px(p.x,yb-5,Math.round(14*Math.min(1,p.grump)),2,moodColor(p.grump));
  });
  // storming out
  G.pax.filter(p=>p.state==='storming'&&p.from===f).forEach(p=>{
    drawPerson(p.x,yb-6,p,Math.floor(G.t*10));
  });
}
