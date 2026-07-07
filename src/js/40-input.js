/* ---------- input: keyboard, wheel, mouse ---------- */
const keys={};
addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','Space'].includes(e.code)) e.preventDefault();
  if(keys[e.code]) return; keys[e.code]=true; ac();
  if(G.state==='title'){
    if(/^Key[A-Z]$/.test(e.code)){                       // hidden: type DEV for the test level
      G.devBuf=(G.devBuf+e.code[3]).slice(-3);
      if(G.devBuf==='DEV'){ startDev(); return; }
    }
    if(e.code==='KeyI'){                                 // scroll direction preference
      toggleWheelInv(); return;
    }
    if(e.code==='Digit1') G.scheme='manual';
    else if(e.code==='Digit2') G.scheme='auto';
    else if(e.code!=='Space'&&e.code!=='Enter') return;
    startShift(G.scheme);
    return;
  }
  if(G.state==='intro'){ introSeen=true; beginPlay(); return; }   // any key clocks in
  if(G.state==='over'&&e.code==='Enter'){ reset(); G.state='play'; return; }
  if(e.code==='Escape'){
    if(G.state==='play'){ G.state='pause'; for(const k in keys) keys[k]=false; return; }
    if(G.state==='pause'){ G.state='play'; return; }
  }
  if(G.state==='pause') return;
  if(G.state==='devmenu'){ if(e.code==='KeyU'||e.code==='Escape') G.state='play'; return; }
  if(G.state==='play'&&G.dev){
    if(e.code==='KeyN'){ spawnPassenger('normal'); return; }
    if(e.code==='KeyM'){ spawnPassenger('wacky'); return; }
    if(e.code==='KeyU'){ G.state='devmenu'; return; }
  }
  if(G.state==='pick'){
    if(e.code==='ArrowLeft'||e.code==='ArrowRight'){ G.pickSel=1-G.pickSel; S.denied(); }
    else if(e.code==='Digit1') pickUpgrade(0);
    else if(e.code==='Digit2') pickUpgrade(1);
    else if(e.code==='Enter') pickUpgrade(G.pickSel);  // NOT Space — that's the gate key; mis-presses were installing upgrades
    return;
  }
  if(G.state!=='play') return;
  if(e.code==='Space') toggleGate();
});
addEventListener('keyup',e=>keys[e.code]=false);

/* scroll-wheel lever (manual mode): each notch is a shove; momentum still rules */
cv.addEventListener('wheel',e=>{
  if(G.scheme!=='manual'||G.state!=='play') return;
  e.preventDefault(); ac();
  if(G.doorT>0.02) return;                              // interlock holds
  let dir=-Math.sign(e.deltaY);
  if(wheelInv) dir=-dir;
  G.vel+=dir*0.38;
},{passive:false});

/* mouse: menus are clickable everywhere; in auto mode, floors too */
const mouse={x:-1,y:-1};
function inBtn(b){ return mouse.x>b.x&&mouse.x<b.x+b.w&&mouse.y>b.y&&mouse.y<b.y+b.h; }
function pickCardAt(mx,my){
  const {w,h,y0,gap}=PICK_CARD;
  for(let i=0;i<(G.offers||[]).length;i++){
    const x=VW/2+(i===0?-w-gap:gap);
    if(mx>x&&mx<x+w&&my>y0&&my<y0+h) return i;
  }
  return -1;
}
cv.addEventListener('mousemove',e=>{
  const r=cv.getBoundingClientRect();
  mouse.x=(e.clientX-r.left)/r.width*VW; mouse.y=(e.clientY-r.top)/r.height*VH;
  let ptr=false;
  if(G.state==='title') ptr=inBtn(BTN.manual)||inBtn(BTN.auto)||inBtn(BTN.invert);
  else if(G.state==='pick') ptr=pickCardAt(mouse.x,mouse.y)>=0;
  else if(G.state==='over'||G.state==='pause') ptr=true;
  else if(G.state==='play'&&G.scheme==='auto') ptr=true;
  cv.style.cursor=ptr?'pointer':'default';
});
let introSeen=false;
function beginPlay(){
  G.state='play';
  say('GOOD MORNING, OPERATOR  ·  '+(G.scheme==='auto'?'AUTO':'MANUAL')+' CONTROLS',2.5);
}
function startShift(scheme){
  G.scheme=scheme;
  if(introSeen) beginPlay();
  else G.state='intro';
}
cv.addEventListener('mousedown',e=>{
  ac();
  const r=cv.getBoundingClientRect();
  const mx=(e.clientX-r.left)/r.width*VW, my=(e.clientY-r.top)/r.height*VH;
  mouse.x=mx; mouse.y=my;
  if(G.state==='title'){
    if(inBtn(BTN.manual)) startShift('manual');
    else if(inBtn(BTN.auto)) startShift('auto');
    else if(inBtn(BTN.invert)){
      toggleWheelInv();
    }
    return;
  }
  if(G.state==='intro'){ introSeen=true; beginPlay(); return; }
  if(G.state==='over'){ reset(); G.state='play'; return; }
  if(G.state==='pause'){ G.state='play'; return; }
  if(G.state==='pick'){
    const i=pickCardAt(mx,my);
    if(i>=0) pickUpgrade(i);
    return;
  }
  if(G.state==='devmenu'){
    const hit=devMenuRowAt(mx,my);
    if(hit) devCycleUpgrade(hit);
    return;
  }
  if(G.state==='play'&&G.scheme==='auto'){
    let f;
    if(mx>MINIMAP.x-8){                                  // minimap strip
      const mlo=-G.base,mspan=Math.max(1,G.floors-1-mlo);
      f=Math.round(((MINIMAP.y+MINIMAP.h-my)/MINIMAP.h)*mspan+mlo);
    } else {
      f=Math.floor(worldYAt(my)/FLOOR_H);
    }
    if(f>=-G.base&&f<G.floors){
      G.autoTarget=f;
      if(G.doorOpen&&!G.transfer) toggleGate();          // close up and go
    }
  }
});
