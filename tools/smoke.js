// Headless smoke test for The Grand Ascent
const fs = require('fs');
const html = fs.readFileSync('C:/Users/seany/Projects/GameDev/lift-operator/index.html', 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

// --- browser stubs ---
const ctxStub = new Proxy({}, { get: (t, k) => {
  if (k === 'measureText') return () => ({ width: 10 });
  if (typeof k === 'string' && k.startsWith('create')) return () => ({ addColorStop(){}, getChannelData(){return new Float32Array(4)} });
  return typeof k === 'string' && ['fillStyle','strokeStyle','font','textAlign','lineWidth'].includes(k) ? undefined : () => {};
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
global.setTimeout = (fn) => {}; // audio scheduling, skip

eval(src + '\n;globalThis.T = { get G(){return G}, set G(v){G=v}, update, draw };');
const H = {
  get G(){ return global.T.G },
};

const fire = (ev, code) => listeners[ev].forEach(f => f({ code, preventDefault(){} }));
const step = (dt=0.016) => { T.update(dt); };
const run = (secs, heldKeys=[]) => {
  heldKeys.forEach(k => fire('keydown', k));
  for (let i = 0; i < secs/0.016; i++) step();
  heldKeys.forEach(k => fire('keyup', k));
};

let fails = 0;
const check = (name, cond) => { console.log((cond?'PASS':'FAIL') + '  ' + name); if(!cond) fails++; };

// start game
fire('keydown','Space'); fire('keyup','Space');
check('game starts', T.G.state==='play');

// physics: hold up, car should move and keep coasting after release
run(0.5, ['ArrowUp']);
const vAfterHold = T.G.vel;
check('car accelerates up', T.G.pos > 0 && vAfterHold > 0);
run(0.2);
check('car coasts after release (momentum)', T.G.pos > 0 && T.G.vel > 0 && T.G.vel < vAfterHold);

// force a known passenger: lobby -> floor 2
T.G.pax = []; T.G.spawnT = 999;
T.G.pax.push({id:99, from:0, dest:2, state:'waiting', grump:0, angry:false, struck:false, x:0, walk:0, coat:'#000', hat:true, lady:false, skin:'#000'});

// gate refuses while misaligned/moving
T.G.pos = 1.4; T.G.vel = 1.0;
fire('keydown','Space'); fire('keyup','Space');
check('gate refuses when not flush', T.G.doorOpen === false);

// stop flush at lobby, open gate, passenger boards
T.G.pos = 0.02; T.G.vel = 0;
fire('keydown','Space'); fire('keyup','Space');
check('gate opens when flush', T.G.doorOpen === true);
run(3);
check('passenger boarded', T.G.pax[0].state === 'riding');

// interlock: try to drive with gate open
const posBefore = T.G.pos;
run(0.5, ['ArrowUp']);
check('interlock: no movement with gate open', Math.abs(T.G.pos - posBefore) < 0.001);

// close gate, drive to floor 2, stop flush, open, deliver
fire('keydown','Space'); fire('keyup','Space');
run(0.5);
check('gate closed again', T.G.doorT < 0.5);
T.G.pos = 2.0; T.G.vel = 0;   // teleport to skip manual driving
fire('keydown','Space'); fire('keyup','Space');
check('gate opens at floor 2', T.G.doorOpen === true);
run(3);
check('passenger delivered & tipped', T.G.delivered === 1 && T.G.tips > 0);
check('max floor recorded', T.G.maxFloor === 2);

// grumpiness -> storm off -> strike
fire('keydown','Space'); fire('keyup','Space'); // close
T.G.pax = [{id:100, from:4, dest:0, state:'waiting', grump:0.99, angry:false, struck:false, x:50, walk:0, coat:'#000', hat:true, lady:false, skin:'#000'}];
run(2);
check('impatient waiter storms off -> strike', T.G.strikes === 1);

// three strikes -> game over
T.G.pax = [
 {id:101, from:4, dest:0, state:'waiting', grump:0.99, angry:false, struck:false, x:50, walk:0, coat:'#000', hat:true, lady:false, skin:'#000'},
 {id:102, from:3, dest:0, state:'waiting', grump:0.99, angry:false, struck:false, x:50, walk:0, coat:'#000', hat:true, lady:false, skin:'#000'},
];
run(2);
check('three strikes ends the run', T.G.state === 'over' && T.G.strikes === 3);
check('high score saved', JSON.parse(localStorage.getItem('grandAscentHS')).floor === 2);

// floor growth + upgrade draft
fire('keydown','Enter'); fire('keyup','Enter');
check('restart works', T.G.state === 'play' && T.G.strikes === 0);
check('starts at 3 floors, cap 3', T.G.floors === 3 && T.G.cap === 3);
T.G.delivered = 7; T.G.nextFloorAt = 8; T.G.tips = 0;
T.G.pax = [{id:103, from:0, dest:1, state:'riding', grump:0, angry:false, struck:false, x:0, walk:0, coat:'#000', hat:true, lady:false, skin:'#000'}];
T.G.pos = 1.0; T.G.vel = 0;
fire('keydown','Space'); fire('keyup','Space');
run(3);
check('8th delivery opens floor 4 + offers upgrade draft', T.G.floors === 4 && T.G.delivered === 8 && T.G.state === 'pick' && T.G.offers.length === 2);
fire('keydown','Digit1'); fire('keyup','Digit1');
check('upgrade installs, play resumes with grace period', T.G.state === 'play' && Object.keys(T.G.up).length === 1 && T.G.graceT > 0);

// commendation: 20 flawless deliveries removes a strike
T.G.strikes = 1; T.G.flawless = 19; T.G.graceT = 0;
T.G.pax = [{id:104, from:0, dest:1, state:'riding', grump:0, angry:false, struck:false, x:0, walk:0, coat:'#000', hat:true, lady:false, skin:'#000'}];
T.G.pos = 1.0; T.G.vel = 0; T.G.doorOpen = false; T.G.doorT = 0; T.G.transfer = null;
fire('keydown','Space'); fire('keyup','Space');
run(3);
check('commendation withdraws a strike', T.G.strikes === 0 && T.G.flawless === 0);

// boarding relief: picked-up guests calm down
T.G.pax = [{id:105, from:1, dest:0, state:'waiting', grump:0.6, angry:false, struck:false, x:200, walk:0, coat:'#000', hat:true, lady:false, skin:'#000'}];
T.G.graceT = 0; T.G.doorOpen = false; T.G.doorT = 0; T.G.pos = 1.0; T.G.vel = 0;
fire('keydown','Space'); fire('keyup','Space');
run(2);
check('boarding relief lowers grump', T.G.pax[0].state === 'riding' && T.G.pax[0].grump < 0.6);

// draw() must not throw in any state
try {
  T.draw(); T.G.state="title"; T.draw(); T.G.state="over"; T.draw();
  T.G.state="pick"; T.G.offers=['cap','speed']; T.draw();
  console.log('PASS  draw() renders all states');
} catch(e){ console.log('FAIL  draw() threw: ' + e.message); fails++; }

console.log(fails === 0 ? '\nALL CHECKS PASSED' : '\n' + fails + ' CHECK(S) FAILED');
process.exit(fails ? 1 : 0);
