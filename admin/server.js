const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3333';
const ROOT = __dirname;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function serveStatic(req, res, urlPath) {
  let filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(ROOT, 'index.html');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
}

function proxyApi(req, res, urlPath) {
  const backend = new URL(BACKEND_URL + urlPath);
  const proxy = http.request(
    {
      hostname: backend.hostname,
      port: backend.port,
      path: backend.pathname + backend.search,
      method: req.method,
      headers: { ...req.headers, host: backend.host },
    },
    (remote) => {
      res.writeHead(remote.statusCode, remote.headers);
      remote.pipe(res);
    }
  );
  proxy.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend indisponível: ' + err.message }));
  });
  req.pipe(proxy);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const urlPath = url.pathname;

  if (urlPath.startsWith('/api')) {
    return proxyApi(req, res, urlPath + url.search);
  }
  return serveStatic(req, res, urlPath);
});

server.listen(PORT, () => {
  console.log(`[+Verde Admin] Painel rodando em http://localhost:${PORT}`);
  console.log(`[+Verde Admin] API backend: ${BACKEND_URL}`);
});