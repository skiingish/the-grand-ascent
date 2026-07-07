/* ---------- loop ---------- */
let last=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000); last=now;
  update(dt); draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
