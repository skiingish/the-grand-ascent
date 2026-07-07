// Render the manager pixel grid from index.html to a PNG (no deps: hand-rolled PNG encoder)
const fs = require('fs');
const zlib = require('zlib');

const html = fs.readFileSync('C:/Users/seany/Projects/GameDev/lift-operator/index.html', 'utf8');
const palM = html.match(/const MGR_PAL=\{([\s\S]*?)\};/);
const gridM = html.match(/const MGR=\[([\s\S]*?)\];/);
const PAL = {};
for (const m of palM[1].matchAll(/(\w):'(#[0-9a-fA-F]{6})'/g)) PAL[m[1]] = m[2];
const GRID = [...gridM[1].matchAll(/'([^']*)'/g)].map(m => m[1]);

const SCALE = 8, BGCOL = [24, 19, 16];
const W = Math.max(...GRID.map(r => r.length)) * SCALE, H = GRID.length * SCALE;

// raw RGBA scanlines with filter byte 0
const raw = Buffer.alloc(H * (1 + W * 4));
for (let y = 0; y < H; y++) {
  const row = GRID[Math.floor(y / SCALE)] || '';
  const off = y * (1 + W * 4);
  raw[off] = 0;
  for (let x = 0; x < W; x++) {
    const ch = row[Math.floor(x / SCALE)];
    const hex = PAL[ch];
    let r = BGCOL[0], g = BGCOL[1], b = BGCOL[2];
    if (hex) { r = parseInt(hex.slice(1, 3), 16); g = parseInt(hex.slice(3, 5), 16); b = parseInt(hex.slice(5, 7), 16); }
    const p = off + 1 + x * 4;
    raw[p] = r; raw[p + 1] = g; raw[p + 2] = b; raw[p + 3] = 255;
  }
}
function crc32(buf) {
  let c, table = [];
  for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; table[n] = c; }
  let crc = 0xFFFFFFFF;
  for (const byte of buf) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw)),
  chunk('IEND', Buffer.alloc(0)),
]);
const out = process.argv[2] || 'C:/Users/seany/AppData/Local/Temp/claude/C--Users-seany-Projects-GameDev/78f0bf01-559e-4e64-844c-fb364cce97be/scratchpad/manager.png';
fs.writeFileSync(out, png);
console.log('wrote', out, W + 'x' + H);
