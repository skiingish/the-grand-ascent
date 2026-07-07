// Build: concatenate src/js/*.js (sorted) into src/template.html -> index.html
// Zero dependencies. The root index.html is the committed build artifact that
// GitHub Pages serves and the itch.io zip contains.
//
//   node tools/build.js          build index.html
//   node tools/build.js --check  verify index.html matches src (CI / pre-commit)
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const jsDir = path.join(ROOT, 'src', 'js');
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort();
const banner =
  '/* ============================================================\n' +
  '   GENERATED FILE — do not edit directly.\n' +
  '   Source lives in src/js/*.js; rebuild with: node tools/build.js\n' +
  '   ============================================================ */\n';
const js = banner + files.map(f => fs.readFileSync(path.join(jsDir, f), 'utf8').replace(/\s+$/, '')).join('\n\n');

const template = fs.readFileSync(path.join(ROOT, 'src', 'template.html'), 'utf8');
if (!template.includes('/*INJECT:JS*/')) { console.error('template.html missing /*INJECT:JS*/ marker'); process.exit(1); }
const out = template.replace('/*INJECT:JS*/', () => js);

const target = path.join(ROOT, 'index.html');
if (process.argv.includes('--check')) {
  const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (current.replace(/\r\n/g, '\n') !== out.replace(/\r\n/g, '\n')) {
    console.error('STALE: index.html does not match src/ — run: node tools/build.js');
    process.exit(1);
  }
  console.log('index.html is up to date with src/');
} else {
  fs.writeFileSync(target, out);
  console.log('built index.html from', files.length, 'modules (' + out.length + ' bytes)');
}
