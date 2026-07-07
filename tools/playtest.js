// Human-like playtest bot for The Grand Ascent.
// Plays the REAL built game at 60Hz with reaction latency, noisy braking,
// and imperfect greedy routing. Rebuild first: node tools/build.js.
const fs = require('fs');
const path = require('path');
const { loadGame } = require('./harness');
const { T, fire } = loadGame();
const DT = 1/60;

// ---------------- human-like player ----------------
function makePlayer(skill){
  // skill: { react, brakeErr, routeIQ } — react in s, brakeErr fraction, routeIQ 0..1
  return {
    held: null,            // 'ArrowUp' | 'ArrowDown' | null
    target: null,
    brakeMargin: 1,        // sampled per approach
    reactT: 0,             // pending action delay
    pending: null,         // fn to run when reactT elapses
    dwellT: 0,
    skill,
  };
}
function hold(pl, key){
  if (pl.held === key) return;
  if (pl.held) fire('keyup', pl.held);
  pl.held = key;
  if (key) fire('keydown', key);
}
function pressSpace(){ fire('keydown','Space'); fire('keyup','Space'); }

function chooseTarget(g, pl){
  const rs = g.pax.filter(p=>p.state==='riding');
  const waitFloors = {};
  g.pax.forEach(p=>{ if(p.state==='waiting'){ (waitFloors[p.from]=waitFloors[p.from]||[]).push(p); } });
  const here = g.pos;
  let cands = [];
  for (const p of rs) cands.push({f:p.dest, score: 3 + p.grump*4 - Math.abs(p.dest-here)*0.15, why:'dropoff'});
  for (const [fs, arr] of Object.entries(waitFloors)){
    const f = +fs;
    if (rs.length >= g.cap) continue;             // full, no point
    const worst = Math.max(...arr.map(p=>p.grump));
    cands.push({f, score: 1 + worst*6 + arr.length*0.4 - Math.abs(f-here)*0.12, why:'pickup'});
  }
  if (!cands.length) return null;
  cands.sort((a,b)=>b.score-a.score);
  // imperfect humans sometimes pick 2nd best
  const pick = (Math.random() > pl.skill.routeIQ && cands.length > 1) ? cands[1] : cands[0];
  return pick.f;
}

function playRound(name, skill, maxMinutes=30){
  T.reset();
  const g = T.G;
  fire('keydown','Space'); fire('keyup','Space');
  if (g.state === 'intro'){ fire('keydown','Space'); fire('keyup','Space'); }   // dismiss the manager's welcome
  const pl = makePlayer(skill);
  const stats = { name, deniedOpens:0, overshoots:0, stops:0, alignTime:0, alignSamples:0,
    strikeLog:[], approachStart:0, approaching:false, waitStorms:0, rideStorms:0 };
  let lastStrikes = 0, tSim = 0;
  const TOL = 0.07;
  // upgrade preference: throughput first (a decent human's instinct)
  const PREF = ['speed','counter','gate','bellboy','cap','magnet','favor','music','clerk','tipjar'];

  while ((g.state === 'play' || g.state === 'pick') && tSim < maxMinutes*60){
    if (g.state === 'pick'){
      const ranked = g.offers.map(id => { const r = PREF.indexOf(id); return r < 0 ? 99 : r; });
      let i = (ranked.length > 1 && ranked[1] < ranked[0]) ? 1 : 0;
      if (!g.offers[i]) i = 0;
      (stats.upgrades = stats.upgrades || []).push(g.offers[i]);
      fire('keydown','Digit'+(i+1)); fire('keyup','Digit'+(i+1));
      pl.target = null;
      continue;
    }
    // MUST mirror the physics in src/js/45-update.js (ACC base, speed AND counterweight)
    const load = g.pax.filter(q=>q.state==='riding').length/Math.max(1,g.cap);
    const cw = 1+0.15*((g.up&&g.up.counter)||0)*load;
    const ACC = 3.4*(1+0.10*((g.up&&g.up.speed)||0))*cw;
    tSim += DT;
    T.update(DT);

    if (!stats.firstWacky && g.pax.some(p=>p.arch)) stats.firstWacky = +(tSim/60).toFixed(2);

    if (g.strikes > lastStrikes){
      lastStrikes = g.strikes;
      const storming = g.pax.find(p=>p.struck && p.state==='storming');
      if (storming) stats.waitStorms++; else stats.rideStorms++;
      stats.strikeLog.push({ t:+tSim.toFixed(1), floors:g.floors, delivered:g.delivered,
        kind: storming ? 'hall' : 'car' });
    }

    if (pl.reactT > 0){ pl.reactT -= DT; continue; }
    if (pl.pending){ const fn = pl.pending; pl.pending = null; fn(); }

    if (g.doorOpen || g.doorT > 0.05){
      hold(pl, null);
      const f = Math.round(g.pos);
      const moreOut = g.pax.some(p=>p.state==='riding' && (p.dest===f || p.angry));
      const moreIn  = g.pax.some(p=>p.state==='waiting' && p.from===f) &&
                      g.pax.filter(p=>p.state==='riding').length < g.cap;
      if (g.doorT===1 && !g.transfer && !moreOut && !moreIn && g.doorOpen){
        pl.pending = () => { if (g.doorOpen && !g.transfer) pressSpace(); pl.target = null; };
        pl.reactT = skill.react;
      }
      continue;
    }

    if (pl.target === null){
      const t2 = chooseTarget(g, pl);
      if (t2 !== null){
        pl.target = t2;
        pl.brakeMargin = 1 + (Math.random()*2-1)*skill.brakeErr;
        stats.approaching = false;
      } else { hold(pl, null); continue; }
    } else if (Math.random() < 0.02){
      // occasional re-evaluation mid-flight (humans change their mind)
      const t2 = chooseTarget(g, pl);
      if (t2 !== null && t2 !== pl.target && Math.random() < skill.routeIQ){
        pl.target = t2; pl.brakeMargin = 1 + (Math.random()*2-1)*skill.brakeErr;
      }
    }

    const d = pl.target - g.pos, ad = Math.abs(d), dir = Math.sign(d);
    const bd = (g.vel*g.vel)/(2*ACC);
    if (!stats.approaching && ad < 0.6){ stats.approaching = true; stats.approachStart = tSim; }

    if (ad < TOL && Math.abs(g.vel) < 0.25){
      hold(pl, null);
      pl.pending = () => {
        pressSpace(); stats.stops++;
        if (!g.doorOpen) stats.deniedOpens++;
        else { stats.alignTime += tSim - stats.approachStart; stats.alignSamples++; }
      };
      pl.reactT = skill.react;
    } else if (ad < TOL){
      hold(pl, g.vel > 0 ? 'ArrowDown' : 'ArrowUp');
    } else if (Math.sign(g.vel) === dir && bd*pl.brakeMargin >= ad - 0.03){
      hold(pl, dir > 0 ? 'ArrowDown' : 'ArrowUp');
    } else if (Math.sign(g.vel) === -dir && Math.abs(g.vel) > 0.05){
      hold(pl, dir > 0 ? 'ArrowUp' : 'ArrowDown');
    } else {
      const maxV = ad < 0.5 ? 0.55 : 99;
      hold(pl, Math.abs(g.vel) < maxV ? (dir > 0 ? 'ArrowUp' : 'ArrowDown') : null);
    }
    if (stats.approaching && Math.sign(g.pos - pl.target) === dir && Math.abs(g.pos - pl.target) > 0.15){
      stats.overshoots++; stats.approachStart = tSim;
    }
  }
  hold(pl, null);
  return { stats, res:{ time:+(tSim/60).toFixed(1), floors:g.floors, maxFloor:g.maxFloor,
    delivered:g.delivered, tips:+g.tips.toFixed(2), strikes:g.strikes,
    ended: g.state==='over' ? 'fired' : 'survived cap' } };
}

// ---- 4 rounds, learning curve ----
const rounds = [
  ['ROUND 1 (first shift, sloppy)',   { react:0.30, brakeErr:0.40, routeIQ:0.55 }],
  ['ROUND 2 (getting the hang)',      { react:0.24, brakeErr:0.28, routeIQ:0.70 }],
  ['ROUND 3 (competent)',             { react:0.20, brakeErr:0.16, routeIQ:0.85 }],
  ['ROUND 4 (skilled operator)',      { react:0.16, brakeErr:0.08, routeIQ:0.95 }],
];
const all = [];
for (const [name, skill] of rounds){
  const r = playRound(name, skill);
  all.push(r);
  const s = r.stats, o = r.res;
  const avgAlign = s.alignSamples ? (s.alignTime/s.alignSamples).toFixed(2) : '-';
  console.log('\n=== ' + name + ' ===');
  console.log(`  survived ${o.time} min | tower ${o.floors} floors | reached FL ${o.maxFloor} | delivered ${o.delivered} | tips $${o.tips} | ${o.ended}`);
  console.log(`  stops ${s.stops} | denied opens ${s.deniedOpens} | overshoots ${s.overshoots} | avg approach->doors ${avgAlign}s | first wacky guest ${s.firstWacky ? s.firstWacky+'m' : 'never'}`);
  console.log(`  strikes: hall ${s.waitStorms} / car ${s.rideStorms}  at ` + s.strikeLog.map(k=>`${(k.t/60).toFixed(1)}m(fl${k.floors},d${k.delivered})`).join(', '));
}
fs.mkdirSync(path.join(__dirname,'..','dist'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'..','dist','playtest-results.json'), JSON.stringify(all,null,1));
