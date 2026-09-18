// Servidor estático sem dependências que imita o GitHub Pages: o site fica em
// /SITEIPHONE/, endereço inexistente devolve o 404.html com status 404 e a
// raiz redireciona para o site. Usado pelos testes, pelo Lighthouse e no dia a dia.
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../site/', import.meta.url));
const BASE = '/SITEIPHONE/';
const PORT = Number(process.env.PORT ?? 4173);
const HOST = process.env.HOST ?? '127.0.0.1';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

async function resolveFile(pathname) {
  const file = join(ROOT, decodeURIComponent(pathname.slice(BASE.length)));
  // Bloqueia /SITEIPHONE/../../algo: nada fora de site/ é servido.
  const inside = relative(ROOT, file);
  if (inside.startsWith('..') || isAbsolute(inside)) return null;
  try {
    const info = await stat(file);
    if (info.isDirectory()) return resolveFile(`${pathname.replace(/\/?$/, '/')}index.html`);
    return file;
  } catch {
    return null;
  }
}

function send(res, status, file) {
  res.writeHead(status, {
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  createReadStream(file).pipe(res);
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname === '/' || pathname === BASE.slice(0, -1)) {
    res.writeHead(301, { Location: BASE });
    res.end();
    return;
  }

  const file = pathname.startsWith(BASE) ? await resolveFile(pathname) : null;
  if (file) send(res, 200, file);
  else send(res, 404, join(ROOT, '404.html'));
});

server.listen(PORT, HOST, () => {
  console.log(`Servindo site/ em http://${HOST}:${PORT}${BASE}`);
});
