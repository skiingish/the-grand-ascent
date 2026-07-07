/* ---------- DEV level (hidden: type D-E-V at the title) ---------- */
function startDev(){
  const scheme=G.scheme; reset();
  G.scheme=scheme; G.dev=true; G.state='play';
  G.floors=20; G.base=3; G.cap=6; G.nextFloorAt=8;
  say('DEV LEVEL  ·  N GUEST · M WACKY · U UPGRADES',4);
}
function devCycleUpgrade(id){
  G.up[id]=(upLv(id)+1)%(UPGRADES[id].max+1);
  if(id==='cap') G.cap=3+G.up.cap;
  S.ding(1);
}
function devMenuRowAt(mx,my){
  const keys2=Object.keys(UPGRADES);
  for(let i=0;i<keys2.length;i++){
    const ry=DEVROW.y0+i*DEVROW.step;
    if(my>ry-14&&my<ry+6&&mx>VW/2-DEVROW.hw&&mx<VW/2+DEVROW.hw) return keys2[i];
  }
  return null;
}

