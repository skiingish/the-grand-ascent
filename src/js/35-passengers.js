/* ---------- passengers ---------- */
function rnd(n){ return Math.floor(Math.random()*n); }

/* ---- the cast: named characters, tiered by tower height (see CHARACTERS.md) ---- */
const TIER_UNLOCK={1:7,2:12,3:17}, CELEB_UNLOCK=15;
const ARCH={
  bellhop:  {tier:1,w:3,pat:0.8, tip:0.6,rule:'cross',    lady:false},
  flapper:  {tier:1,w:2,pat:1.1, tip:1.3,rule:'top2',     lady:true},
  salesman: {tier:1,w:2,pat:0.7, tip:0.7,rule:'nextfloor',lady:false},
  chef:     {tier:1,w:2,pat:1.3, tip:1.6,rule:'kitchen',  lady:false},
  aviatrix: {tier:2,w:2,pat:0.85,tip:1.5,rule:'roof',     lady:true, pants:true},
  zora:     {tier:2,w:1,pat:0.6, tip:1.2,rule:'floor13',  lady:true, gown:true, needs:14},
  flint:    {tier:2,w:2,pat:0.75,tip:1.0,rule:'shadow',   lady:false},
  bootlegger:{tier:2,w:1,pat:1.15,tip:2.0,rule:'cellar',   lady:false},
  professor:{tier:2,w:2,pat:0.55,tip:1.1,rule:'reroll',   lady:false},
  diva:     {tier:3,w:2,pat:1.8, tip:3.0,rule:'lobbytop3',lady:true, gown:true},
  boone:    {tier:3,w:2,pat:0.7, tip:1.8,rule:'gig',      lady:false},
  baroness: {tier:3,w:2,pat:1.2, tip:2.2,rule:'audit',    lady:true},
  colonel:  {tier:3,w:2,pat:0.4, tip:1.0,rule:'longhaul', lady:false, needs:7},
  gloria:   {tier:9,w:1,pat:1.5, tip:4.0,rule:'penthouse',lady:true, gown:true, celeb:true, announce:'GLORIA DELACROIX HAS ARRIVED'},
  magnifico:{tier:9,w:1,pat:1.4, tip:2.5,rule:'cross',    lady:false, celeb:true, vanish:true, announce:'IL MAGNIFICO GRACES THE BUILDING'},
  duchess:  {tier:9,w:1,pat:0.9, tip:2.0,rule:'promenade',lady:true, celeb:true, announce:'THE DUCHESS OF MARLOW & BIJOU'},
};
function pickWeighted(keys){
  const tot=keys.reduce((s,k)=>s+ARCH[k].w,0); let r=Math.random()*tot;
  for(const k of keys){ r-=ARCH[k].w; if(r<=0) return k; }
  return keys[keys.length-1];
}
function archEligible(k){ const a=ARCH[k]; return !a.needs||G.floors>=a.needs; }
function routeFor(rule){
  const top=G.floors-1;
  switch(rule){
    case 'cross':    { const f=rnd(G.floors); let d; do{d=rnd(G.floors);}while(d===f); return [f,d]; }
    case 'top2':     return [0, top-rnd(Math.min(2,top))];
    case 'nextfloor':{ const f=rnd(G.floors); return [f, f===0?1:(f===top?top-1:(Math.random()<0.5?f-1:f+1))]; }
    case 'kitchen':  { const u=2+rnd(Math.max(1,top-1)); return Math.random()<0.5?[1,Math.min(top,u)]:[Math.min(top,u),1]; }
    case 'roof':     return [0,top];
    case 'floor13':  { let f; do{f=rnd(G.floors);}while(f===13); return [f,13]; }
    case 'shadow':   { const last=[...G.pax].reverse().find(p=>p.state==='waiting'); return last?[last.from,last.dest]:null; }
    case 'cellar':   { const from=G.base>0?-1-rnd(G.base):2;           // runs crates up from the speakeasy once it exists
                       const d=Math.min(top,3+rnd(Math.max(1,top-2))); return d===from?null:[from,d]; }
    case 'reroll':   return null;                      // normal roll; quirk fires while waiting
    case 'lobbytop3':{ const t3=top-rnd(Math.min(3,top)); return Math.random()<0.5?[0,t3]:[t3,0]; }
    case 'gig':      return Math.random()<0.6?[0,top]:[top,0];
    case 'audit':    { let best=0,n=-1; for(let f2=-G.base;f2<G.floors;f2++){ const c=waitersAt(f2).length; if(c>n){n=c;best=f2;} }
                       if(n<=0) return null; let f; do{f=rnd(G.floors);}while(f===best); return [f,best]; }
    case 'longhaul': { const f=rnd(G.floors), ups=top-f>=6, downs=f>=6;
                       if(!ups&&!downs) return null;
                       const up=ups&&(!downs||Math.random()<0.5);
                       return [f, up? f+6+rnd(top-f-5) : f-6-rnd(f-5)]; }
    case 'penthouse':return [0,top];
    case 'promenade':{ const f=rnd(G.floors), hop=2+rnd(2);
                       const d=(f+hop<=top&&(Math.random()<0.5||f-hop<0))?f+hop:Math.max(0,f-hop);
                       return d===f?null:[f,d]; }
  }
  return null;
}
/* ordinary-guest wardrobe grows with the tower */
const COATS9 =[['#5a3a5e','#472e4a','#735079'],['#3a5a3e','#2d4630','#4e7253']];
const COATS13=[['#a3852e','#836a24','#bd9f4a'],['#5a7a9a','#47617b','#7495b3']];
const COATS17=[['#d8cbb0','#b5a98f','#f4e8cf'],['#26221e','#1a1714','#38332d']];
const ARCH_COATS={
  bellhop:['#a63d2f','#7d2e23','#c25a4a'], flapper:['#1f7a8c','#155e6d','#3aa0b5'],
  salesman:['#8a7440','#6e5c33','#a48f5c'], chef:['#f4e8cf','#d8cbb0','#ffffff'],
  aviatrix:['#6b4a2c','#523821','#8a6540'], zora:['#3d2b52','#2c1f3d','#584175'],
  flint:['#4a453c','#3a362f','#5d574c'], bootlegger:['#33383f','#262a30','#4a515c'],
  professor:['#5c5a3e','#4a4832','#757352'], diva:['#8c1f2e','#6d1723','#b03a4a'],
  boone:['#f4e8cf','#d8cbb0','#ffffff'], baroness:['#1d1814','#12100d','#33302a'],
  colonel:['#9a8a5c','#7e7049','#b5a677'], gloria:['#ffffff','#dcdcdc','#f4e8cf'],
  magnifico:['#1d1814','#12100d','#2e2a24'], duchess:['#8a8578','#6f6b60','#a5a094'],
};

function spawnPassenger(force){
  const top=G.floors-1;
  /* --- who arrives? --- */
  let arch=null;
  if(force==='wacky'){
    const pool=Object.keys(ARCH).filter(archEligible);
    arch=pool[rnd(pool.length)];
  }
  else if(force!=='normal'&&G.floors>=CELEB_UNLOCK && Math.random()<1/25 && !G.pax.some(p=>p.arch&&ARCH[p.arch].celeb)){
    const pool=Object.keys(ARCH).filter(k=>ARCH[k].celeb&&archEligible(k));
    if(pool.length) arch=pickWeighted(pool);
  }
  if(!arch&&force!=='normal'&&force!=='wacky'){
    const t1=G.floors>=TIER_UNLOCK[1]?0.18:0, t2=G.floors>=TIER_UNLOCK[2]?0.15:0, t3=G.floors>=TIER_UNLOCK[3]?0.10:0;
    const r=Math.random(); let tier=0;
    if(r<t3) tier=3; else if(r<t3+t2) tier=2; else if(r<t3+t2+t1) tier=1;
    if(tier>0){
      const pool=Object.keys(ARCH).filter(k=>ARCH[k].tier===tier&&archEligible(k));
      if(pool.length) arch=pickWeighted(pool);
    }
  }
  const a=arch?ARCH[arch]:null;
  /* --- where to? --- */
  let from,dest,route=a?routeFor(a.rule):null;
  if(route){ [from,dest]=route; }
  else if(G.base>0&&Math.random()<0.15){
    // underworld traffic: to or from the joints below the street
    const b=-1-rnd(G.base);
    if(Math.random()<0.5){ from=b; dest=Math.random()<0.6?0:1+rnd(top); }
    else { from=Math.random()<0.6?0:1+rnd(top); dest=b; }
  }
  else {
    const r=Math.random();
    if(r<0.5){ from=0; dest=1+rnd(top); }
    else if(r<0.85){ from=1+rnd(top); dest=0; }
    else { from=rnd(G.floors); do{dest=rnd(G.floors);}while(dest===from); }
  }
  const evening=G.floors>=13;
  const coats=COATS.concat(G.floors>=9?COATS9:[], G.floors>=13?COATS13:[], G.floors>=17?COATS17:[]);
  G.pax.push({
    id:G.spawnId++, from, dest, state:'waiting',
    grump:0, angry:false, struck:false, waitT:0, rerolled:false,
    arch, patMul:a?a.pat:0.85+Math.random()*0.3, tipMul:a?a.tip:1,
    vanish:!!(a&&a.vanish), puffT:(arch==='magnifico')?0.5:0,
    x:0, walk:0, coat:arch?ARCH_COATS[arch]:coats[rnd(coats.length)],
    hat:a?false:Math.random()<(evening?.75:.6), lady:a?!!a.lady:Math.random()<.4,
    pants:!!(a&&a.pants), gown:!!(a&&a.gown),
    skin:SKINS[rnd(SKINS.length)], hair:HAIRS[rnd(HAIRS.length)],
    bag:a?false:Math.random()<.3,
  });
  if(a&&a.celeb){ say(a.announce,3); S.fanfare(); }
}
function waitersAt(f){ return G.pax.filter(p=>p.state==='waiting'&&p.from===f); }
function riders(){ return G.pax.filter(p=>p.state==='riding'); }

function strike(p){
  if(p.struck) return;
  p.struck=true; G.strikes++; G.shake=.35; S.huff();
  if(G.dev){ say('DEV: STORM-OFF ('+G.strikes+') — NO CONSEQUENCES',2); return; }
  say(G.strikes>=maxStrikes()?'THE MANAGEMENT HAS SEEN ENOUGH':'A GUEST STORMS OFF!  ('+G.strikes+'/'+maxStrikes()+')');
  if(G.strikes>=maxStrikes()){
    G.state='over';
    if(G.tips>G.hs.tips||(G.tips===G.hs.tips&&G.maxFloor>G.hs.floor)){
      G.hs={floor:G.maxFloor,tips:G.tips};
      localStorage.setItem(HS_KEY,JSON.stringify(G.hs));
    }
  }
}
