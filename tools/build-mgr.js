// Build the manager portrait: symmetric geometry (left half mirrored),
// then a lighting pass (light from upper-left), then asymmetric overlays
// (monocle + cord on his left eye, carnation on his right lapel).
// Prints the final grid rows for src/js/80-screens.js (then: node tools/build.js).
const W = 40, H = 54, C = W / 2; // mirror axis between col 19 and 20

// ---- left-half geometry, 20 cols per row ('.' padding required) ----
// chars: k outline, h hat, R band, g gold, s skin, e eye-white, p pupil,
//        b brow, m mustache, w collar, t tie, v vest, c coat, l lapel-hi, n neck-shadow
const HALF = [
  '............kkkkkkkk',  // 0  hat crown top
  '...........khhhhhhhh',  // 1
  '...........khhhhhhhh',  // 2
  '...........khhhhhhhh',  // 3
  '...........khhhhhhhh',  // 4
  '...........khhhhhhhh',  // 5
  '...........khhhhhhhh',  // 6
  '...........khhhhhhhh',  // 7
  '...........kRRRRRRRR',  // 8  band
  '...........kRRRRRRRg',  // 9  band + buckle at centre
  '.......kkkkkhhhhhhhh',  // 10 brim
  '......khhhhhhhhhhhhh',  // 11 brim
  '.......kkkkkhhhhhhhh',  // 12 brim underside
  '..........ksssssssss',  // 13 forehead
  '..........ksssssssss',  // 14
  '.........kssssssssss',  // 15
  '.........kssbbbbbsss',  // 16 brow
  '.........ksbbbbbbsss',  // 17 brow heavy inner
  '.........kssssssssss',  // 18
  '.........kssssssssss',  // 19 (eyes overlaid)
  '.........kssssssssss',  // 20
  '.........kssssssssss',  // 21
  '.........kssssssssss',  // 22
  '.........kssssssssss',  // 23
  '.........kssssssssss',  // 24
  '.........kssssssssss',  // 25
  '.........kssssssssss',  // 26
  '.........ksmmmmmmmmm',  // 27a mustache top
  '.........ksmmmmmmmmm',  // 27 mustache full
  '.........kssmmmmmmmm',  // 28 mustache underside
  '.........kssssssdddd',  // 30 mouth line (stern)
  '.........kssssssssss',  // 31
  '.........kssssssssss',  // 32 chin
  '..........ksssssssss',  // 33
  '...........kssssssss',  // 34 jaw taper
  '............kknnnnnn',  // 35 neck shadow
  '......kkkkkwwkknnnnn',  // 36 collar wing
  '....kkcccckwwwkkkkkk',  // 37
  '...kccccccckwwwkkttt',  // 38
  '..kcccccccckwwkkkttt',  // 39
  '..kccccccccklkvvvktt',  // 40
  '.kccccccccclkvvvkttt',  // 41
  '.kccccccccclvvvvvktt',  // 42
  '.kccccccccclvvvvvktt',  // 43
  '.kccccccccclvvvvvktt',  // 44
  'kcccccccccclvvvvvktt',  // 45
  'kcccccccccclvvggvktt',  // 46 watch-chain arc
  'kcccccccccclvgvvvktt',  // 47
  'kcccccccccclvvvvvktt',  // 48
  'kcccccccccclvvvvvktt',  // 49
  'kcccccccccclvvvvkktt',  // 50
  'kcccccccccclvvvvvktt',  // 51
  'kcccccccccclvvvvvktt',  // 52
  'kcccccccccclvvvvvktt',  // 53
];

// mirror: right half is the left half reversed
let grid = HALF.map(r => {
  const row = r.padEnd(C, '.').slice(0, C);
  return (row + [...row].reverse().join('')).split('');
});

// ---- lighting pass: light from upper-left ----
const isSkin = ch => ch === 's';
for (let y = 13; y <= 35; y++) {
  const row = grid[y];
  // find skin spans
  let xs = [];
  for (let x = 0; x < W; x++) if (isSkin(row[x])) xs.push(x);
  if (!xs.length) continue;
  const lo = Math.min(...xs), hi = Math.max(...xs);
  for (let x = lo; x <= hi; x++) {
    if (!isSkin(row[x])) continue;
    if (x <= lo + 1 && y <= 26) row[x] = 'x';            // left rim light
    else if (x >= hi - 1) row[x] = 'S';                  // right core shadow
    else if (x >= hi - 3) row[x] = row[x] === 's' ? 'a' : row[x]; // half-step
  }
}
// hat shine: leftmost two interior hat columns per row
for (let y = 0; y <= 12; y++) {
  const row = grid[y];
  let seen = 0;
  for (let x = 0; x < W && seen < 2; x++) if (row[x] === 'h') { row[x] = 'i'; seen++; }
}
// coat shading: rightmost two coat columns darken
for (let y = 36; y < H; y++) {
  const row = grid[y];
  for (let x = W - 1, seen = 0; x >= 0 && seen < 3; x--) if (row[x] === 'c') { row[x] = 'C'; seen++; }
}

// ---- asymmetric overlays ----
// monocle on his left eye (viewer right): gold rim ring rows 18-22, lens fill, glint
const MONO = [
  [18, 22, 'ggggg'], [19, 21, 'g'], [19, 27, 'g'],
  [20, 21, 'g'], [20, 27, 'g'], [21, 21, 'g'], [21, 27, 'g'], [22, 22, 'ggggg'],
];
for (const [y, x, str] of MONO) for (let i = 0; i < str.length; i++) grid[y][x + i] = str[i];
for (let y = 19; y <= 21; y++) for (let x = 22; x <= 26; x++) {
  if ('epk'.includes(grid[y][x]) || grid[y][x] === 's' || grid[y][x] === 'a' || grid[y][x] === 'S') grid[y][x] = 'G';
}
grid[19][23] = 'F';                                   // lens glint
grid[19][24] = 'e'; grid[19][25] = 'p';               // eye visible through lens
grid[20][24] = 'e'; grid[20][25] = 'p';
// cord: from rim (28,22) down the cheek to the vest pocket
const CORD = [[23,28],[24,28],[25,29],[26,29],[27,29],[28,30],[29,30],[30,30],[31,30],[32,30],[33,29],[34,29],[35,28],[36,27],[37,26]];
for (const [y, x] of CORD) grid[y][x] = 'g';
// pocket watch peeking at the vest, cord end
grid[46][24] = 'g'; grid[46][25] = 'A';
// carnation on his right lapel (viewer left)
grid[42][6] = 'f'; grid[43][5] = 'f'; grid[43][6] = 'f'; grid[43][7] = 'f'; grid[44][6] = 'f';
// eye pupils: put highlight pixel top-left of each pupil

// left eye (his right), centered to match the monocle distance from axis
for (let x=13; x<=17; x++) grid[18][x]='b';           // lash/lid line
grid[19][13]='e'; grid[19][14]='q'; grid[19][15]='p'; grid[19][16]='p'; grid[19][17]='e';
grid[20][13]='e'; grid[20][14]='p'; grid[20][15]='p'; grid[20][16]='e'; grid[20][17]='S';
for (let x=13; x<=17; x++) grid[21][x]='S';           // lower lid shade
// nose: bridge highlight left, shade right, nostrils, under-shadow
for (let y=21; y<=24; y++){ grid[y][18]='x'; grid[y][21]='S'; }
grid[25][16]='d'; grid[25][17]='S'; grid[25][22]='S'; grid[25][23]='d';
for (let x=18; x<=21; x++) grid[26][x]='S';
// waxed mustache tips curl up and out
grid[26][10]='m'; grid[26][11]='m'; grid[26][28]='m'; grid[26][29]='m';

const rows = grid.map(r => "'" + r.join('') + "',");
console.log(rows.join('\n'));
