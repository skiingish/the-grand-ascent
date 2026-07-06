// Tiny static server for playing The Grand Ascent over the LAN.
// Usage: node tools/serve.js [port]   (default 8080, binds 0.0.0.0)
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.argv[2], 10) || 8080;
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
  '.md':'text/plain; charset=utf-8', '.json':'application/json', '.png':'image/png', '.ico':'image/x-icon' };

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.normalize(path.join(ROOT, urlPath));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
                         'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log('The Grand Ascent is serving on:');
  console.log('  local:  http://localhost:' + PORT + '/');
  for (const [name, addrs] of Object.entries(os.networkInterfaces()))
    for (const a of addrs)
      if (a.family === 'IPv4' && !a.internal)
        console.log('  LAN:    http://' + a.address + ':' + PORT + '/   (' + name + ')');
});
