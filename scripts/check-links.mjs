// Confere, sem rede, todo link e arquivo referenciado pelo site: href, src,
// âncoras (#id) e as URLs absolutas do próprio site (og:image, canonical).
// Links para outros domínios ficam de fora: o CI não pode depender deles.
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../site/', import.meta.url));
const BASE = '/SITEIPHONE/';
const SITE_URL = `https://tiagosaile.github.io${BASE}`;

const URL_ATTR =
  /\s(?:href|src)="([^"]*)"|<meta\s+property="og:(?:image|url)"\s+content="([^"]+)"/g;
const ID_ATTR = /\sid="([^"]+)"/g;
const BASE_TAG = /<base\s+href="([^"]+)"/;

async function listHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return listHtml(path);
      return extname(entry.name) === '.html' ? [path] : [];
    }),
  );
  return nested.flat();
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

const files = await listHtml(ROOT);
const ids = new Map();
const sources = new Map();
for (const file of files) {
  const html = await readFile(file, 'utf8');
  sources.set(file, html);
  ids.set(file, new Set([...html.matchAll(ID_ATTR)].map((match) => match[1])));
}

const problems = [];
let checked = 0;

for (const [file, html] of sources) {
  const baseHref = html.match(BASE_TAG)?.[1];
  const baseDir = baseHref ? join(ROOT, baseHref.slice(BASE.length)) : dirname(file);
  const where = relative(ROOT, file);

  for (const [, attr, meta] of html.matchAll(URL_ATTR)) {
    const raw = attr ?? meta;
    let url = raw;
    if (url.startsWith(SITE_URL)) url = join(ROOT, url.slice(SITE_URL.length));
    else if (url.startsWith(BASE)) url = join(ROOT, url.slice(BASE.length));
    else if (/^[a-z]+:/i.test(url)) continue;
    checked += 1;

    const [path, hash] = url.split('#');
    let target;
    if (path === '') target = baseHref ? join(baseDir, 'index.html') : file;
    else if (path.startsWith('/') && !path.startsWith(ROOT)) {
      problems.push(`${where}: "${raw}" sai de ${BASE} e quebra no GitHub Pages`);
      continue;
    } else target = resolve(baseDir, path);

    if (target.endsWith('/') || !extname(target)) target = join(target, 'index.html');

    if (relative(ROOT, target).startsWith('..')) {
      problems.push(`${where}: "${raw}" aponta para fora de site/`);
    } else if (!(await isFile(target))) {
      problems.push(`${where}: "${raw}" não existe (${relative(ROOT, target)})`);
    } else if (hash && !ids.get(target)?.has(hash)) {
      problems.push(
        `${where}: "${raw}" aponta para #${hash}, que não existe em ${relative(ROOT, target)}`,
      );
    }
  }
}

if (problems.length) {
  console.error(`${problems.length} problema(s) em ${checked} links:\n`);
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}
console.log(
  `✓ ${checked} links e arquivos conferidos em ${files.length} páginas, nenhum quebrado.`,
);
