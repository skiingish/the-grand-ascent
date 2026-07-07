/* ---------- audio (synth, created on first input) ---------- */
let AC=null;
function ac(){ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); return AC; }
function env(g,t,a,d,v){ g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(v,t+a); g.gain.exponentialRampToValueAtTime(.0001,t+a+d); }
function tone(freq,type,a,d,v,slide){
  const c=ac(),t=c.currentTime,o=c.createOscillator(),g=c.createGain();
  o.type=type; o.frequency.setValueAtTime(freq,t);
  if(slide) o.frequency.exponentialRampToValueAtTime(slide,t+a+d);
  env(g,t,a,d,v); o.connect(g).connect(c.destination); o.start(t); o.stop(t+a+d+.05);
}
function noise(d,v,f){
  const c=ac(),t=c.currentTime,len=c.sampleRate*d,buf=c.createBuffer(1,len,c.sampleRate),ch=buf.getChannelData(0);
  for(let i=0;i<len;i++)ch[i]=Math.random()*2-1;
  const s=c.createBufferSource(),g=c.createGain(),lp=c.createBiquadFilter();
  lp.type='lowpass'; lp.frequency.value=f; s.buffer=buf; env(g,t,.005,d,v);
  s.connect(lp).connect(g).connect(c.destination); s.start(t);
}
const S={
  gate(open){ noise(.14,.25,open?900:600); tone(open?220:170,'square',.005,.1,.06); },
  clank(){ noise(.08,.3,400); tone(90,'square',.005,.12,.12); },
  ding(n=0){ tone(880*Math.pow(1.25,n),'sine',.005,.6,.16); tone(1760*Math.pow(1.25,n),'sine',.005,.3,.05); },
  coin(){ tone(1245,'square',.003,.07,.07); setTimeout(()=>tone(1660,'square',.003,.2,.07),60); },
  huff(){ noise(.22,.22,300); tone(140,'sawtooth',.02,.18,.05,80); },
  fanfare(){ [523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,'triangle',.01,.35,.12),i*110)); },
  denied(){ tone(120,'square',.005,.09,.08); },
};
