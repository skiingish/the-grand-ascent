/* ---------- upgrades (drafted 1-of-2 when a floor opens) ---------- */
const UPGRADES={
  cap:   {name:'WIDER CAR',     desc:'One more guest fits aboard',        max:5},
  speed: {name:'NEW WINCH',     desc:'The car pulls 12% faster',          max:4},
  gate:  {name:'OILED GATE',    desc:'Gate & boarding move quicker',      max:3},
  magnet:{name:'FLOOR MAGNET',  desc:'Car settles itself level',          max:2},
  music: {name:'GRAMOPHONE',    desc:'Riders stay calm 25% longer',       max:3},
  clerk: {name:'DESK CLERK',    desc:'Hall guests fret 15% slower',       max:3},
  tipjar:{name:'BRASS TIP JAR', desc:'All tips grow by 15%',              max:3},
  favor: {name:"MANAGER'S FAVOR",desc:'One more strike allowed',          max:2},
  counter:{name:'COUNTERWEIGHT', desc:'Fuller car, faster winch',         max:2},
  bellboy:{name:'LOBBY BELLBOY', desc:'Swift boarding at the lobby',      max:2},
};
function maxStrikes(){ return 3+upLv('favor'); }
function upLv(id){ return G.up[id]||0; }
function rollOffers(){
  const pool=Object.keys(UPGRADES).filter(id=>upLv(id)<UPGRADES[id].max);
  for(let i=pool.length-1;i>0;i--){ const j=rnd(i+1); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0,2);
}
function pickUpgrade(i){
  const id=G.offers&&G.offers[i]; if(!id) return;
  G.up[id]=upLv(id)+1;
  if(id==='cap') G.cap=Math.min(9,G.cap+1);
  G.offers=null; G.state='play'; G.graceT=8; S.ding(2);
  if(G.justDug){ G.justDug=false; say('WORD IS '+BASEMENTS[G.base-1].name+' JUST OPENED BELOW THE STREET...',3.5); }
  else say('FLOOR '+floorName(G.floors-1)+' OPEN  ·  '+UPGRADES[id].name+' INSTALLED',3);
}

/* flush tolerance: how far off a floor the gate still opens (magnet widens it) */
function flushTol(){ return 0.085*(1+0.25*upLv('magnet')); }
function xferTime(){
  let t=(G.silk?0.24:XFER_BASE)*Math.pow(0.88,upLv('gate'));
  if(Math.round(G.pos)===0) t*=Math.pow(0.78,upLv('bellboy'));   // the bellboy hustles
  return t;
}
