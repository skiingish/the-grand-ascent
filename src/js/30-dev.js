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
    const ry=118+i*24;
    if(my>ry-14&&my<ry+6&&mx>VW/2-150&&mx<VW/2+150) return keys2[i];
  }
  return null;
}

function xferTime(){
  let t=(G.silk?0.24:0.45)*Math.pow(0.88,upLv('gate'));
  if(Math.round(G.pos)===0) t*=Math.pow(0.78,upLv('bellboy'));   // the bellboy hustles
  return t;
}
