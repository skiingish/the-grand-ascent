// Human-like playtest bot for The Grand Ascent.
// Plays the REAL game code headless at 60Hz with reaction latency,
// noisy braking, and imperfect greedy routing.
const fs = require('fs');
const html = fs.readFileSync('C:/Users/seany/Projects/GameDev/lift-operator/index.html', 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

// --- browser stubs ---
const ctxStub = new Proxy({}, { get: (t, k) => {
  if (k === 'measureText') return () => ({ width: 10 });
  if (typeof k === 'string' && k.startsWith('create')) return () => ({ addColorStop(){}, getChannelData(){return new Float32Array(4)} });
  return () => {};
}, set: () => true });
const listeners = {};
global.window = global;
global.document = { getElementById: () => ({ getContext: () => ctxStub, style: {}, width: 0, height: 0 }) };
global.addEventListener = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
global.localStorage = { _d:{}, getItem(k){return this._d[k]||null}, setItem(k,v){this._d[k]=v} };
global.innerWidth = 1200; global.innerHeight = 800;
global.performance = { now: () => 0 };
global.requestAnimationFrame = () => {};
global.AudioContext = function(){ return { currentTime:0,
  createOscillator:()=>({type:'',frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect:o=>({connect:()=>{}}),start(){},stop(){}}),
  createGain:()=>({gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect:o=>({connect:()=>{}})}),
  createBuffer:()=>({getChannelData:()=>new Float32Array(100)}),
  createBufferSource:()=>({connect:o=>({connect:()=>({connect:()=>{}})}),start(){}}),
  createBiquadFilter:()=>({type:'',frequency:{value:0},connect:o=>({connect:()=>({connect:()=>{}})})}),
  destination:{}, sampleRate:44100 }; };
const realSetTimeout = setTimeout;
global.setTimeout = () => {};

eval(src + '\n;globalThis.T = { get G(){return G}, set G(v){G=v}, update, reset };');

const fire = (ev, code) => listeners[ev].forEach(f => f({ code, preventDefault(){} }));
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

function chooseTarget(g, pl, stats){
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
  fire('keydown','Space'); fire('keyup','Space');   // clock in
  fire('keyup','Space');
  const pl = makePlayer(skill);
  const stats = {
    name, deniedOpens:0, overshoots:0, stops:0, alignTime:0, alignSamples:0,
    strikeLog:[], floorAt:[], approachStart:0, approaching:false,
  };
  let lastStrikes = 0, lastDelivered = 0, tSim = 0;
  const ACC = 3.4, TOL = 0.07;

  while (g.state === 'play' && tSim < maxMinutes*60){
    tSim += DT;
    // --- perception & decisions at human cadence ---
    if (pl.reactT > 0){ pl.reactT -= DT; }
    else if (pl.pending){ const fn = pl.pending; pl.pending = null; fn(); }

    if (g.doorOpen || g.doorT > 0.05){
      // dwelling: close as soon as doorway clear and nothing left to do here
      hold(pl, null);
      const f = Math.round(g.pos);
      const moreOut = g.pax.some(p=>p.state==='riding' && (p.dest===f || p.angry));
      const moreIn  = g.pax.some(p=>p.state==='waiting' && p.from===f) &&
                      g.pax.filter(p=>p.state==='riding').length < g.cap;
      if (g.doorT===1 && !g.transfer && !moreOut && !moreIn && !pl.pending && !g.doorOpen===false){
        pl.pending = () => { if (g.doorOpen && !g.transfer) pressSpace(); pl.target = null; };
        pl.reactT = skill.react;
      }
      continue;
    }

    // pick target
    if (pl.target === null || (Math.floor(tSim*2) !== Math.floor((tSim-DT)*2) && Math.random()<0.1)){
      const t2 = chooseTarget(g, pl, stats);
      if (t2 !== null && t2 !== pl.target){
        pl.target = t2;
        pl.brakeMargin = 1 + (Math.random()*2-1)*skill.brakeErr;   // sampled once per approach
        stats.approaching = false;
      }
    }
    if (pl.target === null){ hold(pl, null); continue; }

    const d = pl.target - g.pos, ad = Math.abs(d), dir = Math.sign(d);
    const bd = (g.vel*g.vel)/(2*ACC);              // ideal braking distance

    if (!stats.approaching && ad < 0.6){ stats.approaching = true; stats.approachStart = tSim; }

    if (ad < TOL && Math.abs(g.vel) < 0.25){
      // flush enough: open (with reaction delay)
      hold(pl, null);
      if (!pl.pending){
        pl.pending = () => {
          const wasOpen = g.doorOpen;
          pressSpace();
          stats.stops++;
          if (!g.doorOpen && !wasOpen) stats.deniedOpens++;
          else { stats.alignTime += tSim - stats.approachStart; stats.alignSamples++; }
        };
        pl.reactT = skill.react;
      }
    } else if (ad < TOL && Math.abs(g.vel) >= 0.25){
      hold(pl, g.vel > 0 ? 'ArrowDown' : 'ArrowUp');   // kill speed
    } else if (Math.sign(g.vel) === dir && bd*pl.brakeMargin >= ad - 0.03){
      // brake zone (with human error margin)
      hold(pl, dir > 0 ? 'ArrowDown' : 'ArrowUp');
    } else if (Math.sign(g.vel) === -dir && Math.abs(g.vel) > 0.05){
      hold(pl, dir > 0 ? 'ArrowUp' : 'ArrowDown');     // moving away: reverse
    } else if (ad > TOL){
      // creep or cruise toward target
      const maxV = ad < 0.5 ? 0.55 : 99;
      hold(pl, Math.abs(g.vel) < maxV ? (dir > 0 ? 'ArrowUp' : 'ArrowDown') : null);
    }
    // overshoot detection
    if (stats.approaching && Math.sign(g.pos - pl.target) === dir && Math.abs(g.pos - pl.target) > 0.15){
      stats.overshoots++; stats.approaching = false; stats.approachStart = tSim;
    }

    T.update(DT);

    if (g.strikes > lastStrikes){
      lastStrikes = g.strikes;
      stats.strikeLog.push({ t:+tSim.toFixed(1), floors:g.floors, delivered:g.delivered });
    }
    if (g.delivered > lastDelivered){ lastDelivered = g.delivered; }
    // keep the physics stepping even during "thinking" frames handled above via continue...
  }
  // note: dwell branches `continue` without update — fix by stepping there too (see loop guard below)
  return { stats, g:{ time:+tSim.toFixed(1), floors:g.floors, maxFloor:g.maxFloor,
    delivered:g.delivered, tips:+g.tips.toFixed(2), strikes:g.strikes, state:g.state } };
}

// The dwell branch used `continue` without T.update — patch: wrap playRound loop instead.
// (Handled: we re-run update below if flagged.) — simpler: monkey-fix by re-defining loop?
// To keep it correct, we do the update inside the loop before decisions instead:
// [rewritten below]
function playRound2(name, skill, maxMinutes=30){
  T.reset();
  const g = T.G;
  fire('keydown','Space'); fire('keyup','Space');
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
    const ACC = 3.4*(1+0.10*((g.up && g.up.speed) || 0));
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
      const t2 = chooseTarget(g, pl, stats);
      if (t2 !== null){
        pl.target = t2;
        pl.brakeMargin = 1 + (Math.random()*2-1)*skill.brakeErr;
        stats.approaching = false;
      } else { hold(pl, null); continue; }
    } else if (Math.random() < 0.02){
      // occasional re-evaluation mid-flight (humans change their mind)
      const t2 = chooseTarget(g, pl, stats);
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
  const r = playRound2(name, skill);
  all.push(r);
  const s = r.stats, o = r.res;
  const avgAlign = s.alignSamples ? (s.alignTime/s.alignSamples).toFixed(2) : '-';
  console.log('\n=== ' + name + ' ===');
  console.log(`  survived ${o.time} min | tower ${o.floors} floors | reached FL ${o.maxFloor} | delivered ${o.delivered} | tips $${o.tips} | ${o.ended}`);
  console.log(`  stops ${s.stops} | denied opens ${s.deniedOpens} | overshoots ${s.overshoots} | avg approach->doors ${avgAlign}s | first wacky guest ${s.firstWacky ? s.firstWacky+'m' : 'never'}`);
  console.log(`  strikes: hall ${s.waitStorms} / car ${s.rideStorms}  at ` + s.strikeLog.map(k=>`${(k.t/60).toFixed(1)}m(fl${k.floors},d${k.delivered})`).join(', '));
}
fs.writeFileSync('C:/Users/seany/AppData/Local/Temp/claude/C--Users-seany-Projects-GameDev/78f0bf01-559e-4e64-844c-fb364cce97be/scratchpad/playtest-results.json', JSON.stringify(all,null,1));
