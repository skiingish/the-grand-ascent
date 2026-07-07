/* ---------- simulation: gate, physics, patience, spawning, camera ---------- */
function flushFloor(){
  const f=Math.round(G.pos);
  if(f<-G.base||f>=G.floors) return -99;
  return (Math.abs(G.pos-f)<flushTol() && Math.abs(G.vel)<0.3) ? f : -99;
}
/* all door-open bookkeeping in ONE place — auto-arrival and toggleGate share it */
function openDoorsAt(f,silk){
  G.pos=f; G.vel=0; G.silk=silk;
  G.doorOpen=true; S.gate(true);
  if(f>G.maxFloor) G.maxFloor=f;
}
function toggleGate(){
  if(G.doorOpen){
    if(G.transfer){ S.denied(); return; }             // someone in the doorway
    G.doorOpen=false; S.gate(false);
    // snub: whoever is left waiting here takes it personally
    const f=Math.round(G.pos), full=riders().length>=G.cap;
    waitersAt(f).forEach(p=>p.grump=Math.min(1.2,p.grump+(full?0.25:0.12)));
  } else {
    const f=flushFloor();
    if(f===-99){ S.denied(); say('LINE UP THE CAR, OPERATOR!',1.2); return; }
    const silk=Math.abs(G.pos-f)<0.035&&G.scheme!=='auto'; // no silk bonus when the car parks itself
    openDoorsAt(f,silk);
    if(G.silk){ S.ding(3); say('SILK STOP — SWIFT SERVICE!',1); }
  }
}

function update(dt){
  G.t+=dt;
  if(G.msgT>0) G.msgT-=dt;
  if(G.shake>0) G.shake-=dt;
  if(G.state!=='play'){ return; }

  /* --- lever & physics --- */
  const locked=G.doorT>0.02;
  const load=riders().length/Math.max(1,G.cap);                 // counterweight pulls harder when loaded
  const cw=1+0.15*upLv('counter')*load;
  const ACC=3.4*(1+0.10*upLv('speed'))*cw, MAX=2.7*(1+0.12*upLv('speed'))*cw, DRAG=0.85;
  let input=0;
  if(!locked){
    if(G.scheme==='auto'){
      // autopilot: the routing IS the game — car drives itself to the clicked floor
      if(G.autoTarget!==null){
        const d=G.autoTarget-G.pos, ad=Math.abs(d), dir=Math.sign(d);
        const bd=(G.vel*G.vel)/(2*ACC);
        if(ad<0.02&&Math.abs(G.vel)<0.15){
          const f=G.autoTarget; G.autoTarget=null;
          openDoorsAt(f,false); G.doorT=Math.max(G.doorT,0.02);   // doors open themselves
        }
        else if(Math.sign(G.vel)===dir&&bd>=ad-0.02) input=-dir;
        else if(Math.abs(G.vel)<(ad<0.5?0.55:MAX)) input=dir;
      }
    } else {
      if(keys.ArrowUp||keys.KeyW)input+=1;
      if(keys.ArrowDown||keys.KeyS)input-=1;
    }
  }
  G.vel+=input*ACC*dt;
  if(!input) G.vel*=Math.exp(-DRAG*dt);          // coast — momentum is the game
  if(!input && Math.abs(G.vel)<0.04) G.vel=0;
  G.vel=Math.max(-MAX,Math.min(MAX,G.vel));
  G.pos+=G.vel*dt;
  const top=G.floors-1;
  if(G.pos<-G.base){ G.pos=-G.base; if(G.vel<-0.5)S.clank(); G.vel=0; }
  if(G.pos>top){ G.pos=top; if(G.vel>0.5)S.clank(); G.vel=0; }
  // floor magnet: settles the last inch, but only once you've all but stopped yourself
  if(upLv('magnet')&&!input&&!locked){
    const nf=Math.round(G.pos), off=G.pos-nf;
    if(nf>=-G.base&&nf<G.floors&&Math.abs(off)<0.09&&Math.abs(G.vel)<0.22){
      G.pos-=off*Math.min(1,dt*1.3*upLv('magnet'));
      G.vel*=Math.exp(-2*upLv('magnet')*dt);
    }
  }

  /* --- gate anim --- */
  G.doorT+=((G.doorOpen?1:0)-G.doorT)*Math.min(1,dt*(7+2.5*upLv('gate')));
  if(G.doorOpen&&G.doorT>0.99) G.doorT=1;

  /* --- doorway traffic (one at a time) --- */
  if(G.doorT===1){
    const f=Math.round(G.pos);
    if(G.transfer){
      G.transferT-=dt;
      if(G.transferT<=0){
        const p=G.transfer; G.transfer=null;
        if(p.state==='exiting'){
          p.state='gone';
          if(!p.angry){
            // 1926 rates: a nickel from a sour guest, a quarter from a delighted one
            let tip=(0.05+0.20*Math.pow(Math.max(0,1-p.grump),1.4))*(1+0.15*upLv('tipjar'))*(p.tipMul||1);
            if(G.silk) tip*=1.25;                       // silk stops pay better
            if(p.from<0||p.dest<0) tip*=1.5;            // hush money from below the street
            G.tips+=tip; G.delivered++; S.coin();
            /* commendations: flawless streaks buy back strikes */
            G.flawless++;
            if(G.flawless>=20){
              G.flawless=0;
              if(G.strikes>0){ G.strikes--; S.fanfare(); say('COMMENDATION! THE MANAGER WITHDRAWS A STRIKE',3); }
              else { G.tips+=1; S.ding(1); say('COMMENDATION! A CRISP DOLLAR FROM THE MANAGER',3); }
            }
            /* the tower grows — pause for an upgrade draft */
            if(G.delivered>=G.nextFloorAt){
              G.nextFloorAt+=8; G.floors++;
              if(G.base<3&&Math.random()<0.3){ G.base++; G.justDug=true; }  // something stirs below
              G.offers=rollOffers(); G.pickSel=0; S.fanfare();
              if(G.offers.length) G.state='pick';
              else { G.graceT=8; say('FLOOR '+floorName(G.floors-1)+' NOW OPEN',3); }
            }
          }
        }
        else if(p.state==='boarding'){
          p.state='riding'; p.grump=Math.max(0,p.grump-0.2);
          if(p.arch==='boone') S.fanfare();             // the bandleader boards with a flourish
        }
      }
    } else {
      const out=riders().find(p=>p.dest===f||p.angry);
      if(out){ out.state='exiting'; G.transfer=out; G.transferDur=xferTime(); G.transferT=G.transferDur; }
      else if(riders().length<G.cap){
        const inn=waitersAt(f)[0];
        if(inn){ inn.state='boarding'; G.transfer=inn; G.transferDur=xferTime(); G.transferT=G.transferDur; }
      }
    }
  }

  /* --- patience --- */
  if(G.graceT>0) G.graceT-=dt;                        // ribbon-cutting breather
  const diff=Math.min(2.4,1+(G.floors-2)*0.05);       // difficulty follows the tower
  const calm=G.graceT>0?0.5:1;
  for(const p of G.pax){
    if(p.puffT>0) p.puffT-=dt;
    if(p.state==='waiting'){
      p.waitT=(p.waitT||0)+dt;
      // named guests ride odd routes, so they carry longer fuses — chaos, not emergencies
      p.grump+=dt/(p.arch?52:42)*diff*calm*(p.patMul||1)*Math.pow(0.85,upLv('clerk'));
      // the professor remembers it was a different floor after all
      if(p.arch==='professor'&&!p.rerolled&&p.waitT>10){
        p.rerolled=true; let d; do{d=rnd(G.floors);}while(d===p.from||d===p.dest); p.dest=d;
      }
      if(p.grump>=1&&p.vanish){ p.state='gone'; say("HE'S GONE! ...HOW?",2.5); continue; }
      if(p.grump>=1&&!p.struck){ p.state='storming'; p.walk=0; strike(p); }
    } else if(p.state==='riding'){
      // longer trips come with longer fuses — guests know the penthouse is far
      p.grump+=dt/((p.arch?100:88)*(1+0.12*Math.abs(p.dest-p.from)))*diff*calm*(p.patMul||1)*Math.pow(0.75,upLv('music'));
      if(p.grump>=1&&p.vanish){ p.state='gone'; say('HE HAS VANISHED FROM A MOVING LIFT!',2.5); continue; }
      if(p.grump>=1&&!p.angry){ p.angry=true; strike(p); say('A GUEST IS FUMING IN THE CAR!',2); }
    } else if(p.state==='storming'){
      p.walk+=dt; if(p.walk>1.6) p.state='gone';
    }
  }
  G.pax=G.pax.filter(p=>p.state!=='gone');

  /* --- hall movement: queue shuffle + storm-off walks (was in draw(), frame-rate dependent) --- */
  const qIdx={};
  for(const p of G.pax){
    if(p.state==='waiting'){
      const i2=qIdx[p.from]=(qIdx[p.from]??0); qIdx[p.from]++;
      const targetX=SHX-58-i2*24;
      if(p.x===0) p.x=HALLX-14;
      p.x+=(targetX-p.x)*Math.min(1,dt*3.75);
      if(Math.abs(targetX-p.x)>1) p.walk+=dt*12.5;
    } else if(p.state==='storming'){ p.x-=90*dt; }
  }

  /* --- spawning (paused during the ribbon-cutting; manual-only in dev) --- */
  if(G.graceT<=0&&!G.dev) G.spawnT-=dt;
  if(G.spawnT<=0){
    spawnPassenger();
    const base=Math.max(3.05,7.2-0.32*G.floors);      // plateau above lift throughput
    G.spawnT=base*(0.7+Math.random()*0.6);
  }

  /* --- camera --- */
  const buildingH=G.floors*FLOOR_H+60;
  const carWorldY=G.pos*FLOOR_H;
  let target=carWorldY-VH/2+FLOOR_H;
  target=Math.max(-30-G.base*FLOOR_H,Math.min(buildingH-VH,target));
  G.camY+=(target-G.camY)*Math.min(1,dt*5);
}
