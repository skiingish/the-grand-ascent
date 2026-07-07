// Shared headless harness for smoke.js and playtest.js.
// Loads the BUILT index.html (repo root), installs browser stubs, evals the
// game script, and returns { T, fire, listeners }.
const fs = require('fs');
const path = require('path');

function loadGame(extraExports = '') {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

  const ctxStub = new Proxy({}, {
    get: (t, k) => {
      if (k === 'measureText') return () => ({ width: 10 });
      if (typeof k === 'string' && k.startsWith('create'))
        return () => ({ addColorStop() {}, getChannelData() { return new Float32Array(4); } });
      return typeof k === 'string' && ['fillStyle', 'strokeStyle', 'font', 'textAlign', 'lineWidth'].includes(k)
        ? undefined : () => {};
    },
    set: () => true,
  });
  const listeners = {};
  global.window = global;
  global.document = { getElementById: () => ({ getContext: () => ctxStub, style: {}, width: 0, height: 0, addEventListener() {} }) };
  global.addEventListener = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
  global.localStorage = { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } };
  global.innerWidth = 1200; global.innerHeight = 800;
  global.performance = { now: () => 0 };
  global.requestAnimationFrame = () => {};
  global.AudioContext = function () { return { currentTime: 0,
    createOscillator: () => ({ type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: () => ({ connect: () => {} }), start() {}, stop() {} }),
    createGain: () => ({ gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: () => ({ connect: () => {} }) }),
    createBuffer: () => ({ getChannelData: () => new Float32Array(100) }),
    createBufferSource: () => ({ connect: () => ({ connect: () => ({ connect: () => {} }) }), start() {} }),
    createBiquadFilter: () => ({ type: '', frequency: { value: 0 }, connect: () => ({ connect: () => ({ connect: () => {} }) }) }),
    destination: {}, sampleRate: 44100 }; };
  global.setTimeout = () => {}; // audio scheduling: skip

  // indirect eval keeps declarations out of this module's scope but on globalThis via the exports line
  (0, eval)(src + '\n;globalThis.T = { get G(){return G}, set G(v){G=v}, update, draw, reset, devCycleUpgrade' + (extraExports ? ',' + extraExports : '') + ' };');

  const fire = (ev, code) => listeners[ev].forEach(f => f({ code, preventDefault() {} }));
  return { T: globalThis.T, fire, listeners };
}

module.exports = { loadGame };
