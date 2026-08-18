/* ============================================================
   Worker principal
   · serve o site estático (binding ASSETS)
   · /api/*  → CMS de projetos (D1)
   · /m/:key → imagens do R2 com cache longo
   · /admin  → protegido por Cloudflare Access
   ============================================================ */

import { verifyAccess } from './access.js';

/* ---------- helpers ---------- */
const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra }
  });

const bad = (message, status = 400) => json({ error: message }, status);

const slugify = s => String(s).toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')  // remove acentos
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '').slice(0, 80) || 'projeto';

/* aceita apenas imagens, com teto de tamanho */
const ALLOWED_MIME = new Set(['image/webp', 'image/jpeg', 'image/png', 'image/avif']);
const MAX_UPLOAD = 8 * 1024 * 1024; // 8 MB

/* ---------- rotas públicas ---------- */

async function listProjects(env, url) {
  const featured = url.searchParams.get('featured');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 100);

  let sql = `SELECT id, slug, title, tag, category, year, client, summary, cover, url, featured, position
             FROM projects WHERE published = 1`;
  const binds = [];
  if (featured === '1') sql += ' AND featured = 1';
  sql += ' ORDER BY position ASC, id DESC LIMIT ?';
  binds.push(limit);

  const { results } = await env.DB.prepare(sql).bind(...binds).all();
  return json({ projects: results ?? [] }, 200, { 'cache-control': 'public, max-age=60' });
}

async function getProject(env, slug) {
  const p = await env.DB.prepare(
    'SELECT * FROM projects WHERE slug = ? AND published = 1'
  ).bind(slug).first();
  if (!p) return bad('Projeto não encontrado', 404);

  const { results: images } = await env.DB.prepare(
    'SELECT key, alt, position FROM project_images WHERE project_id = ? ORDER BY position ASC'
  ).bind(p.id).all();

  return json({ project: { ...p, images: images ?? [] } }, 200, { 'cache-control': 'public, max-age=60' });
}

/* serve arquivo do R2 */
async function serveMedia(env, key, request) {
  if (!key || key.includes('..')) return bad('Chave inválida', 400);

  const obj = await env.MEDIA.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const etag = obj.httpEtag;
  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers: { etag } });
  }

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', etag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  return new Response(obj.body, { headers });
}

/* ---------- rotas protegidas (CMS) ---------- */

async function createProject(env, body) {
  const title = String(body.title || '').trim();
  if (!title) return bad('Título é obrigatório');

  let slug = body.slug ? slugify(body.slug) : slugify(title);
  // garante unicidade
  const exists = await env.DB.prepare('SELECT 1 FROM projects WHERE slug = ?').bind(slug).first();
  if (exists) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const max = await env.DB.prepare('SELECT COALESCE(MAX(position), 0) AS m FROM projects').first();

  const r = await env.DB.prepare(
    `INSERT INTO projects (slug, title, tag, category, year, client, summary, body, cover, url, featured, position, published)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    slug, title,
    String(body.tag || ''), String(body.category || ''), String(body.year || ''),
    String(body.client || ''), String(body.summary || ''), String(body.body || ''),
    String(body.cover || ''), String(body.url || ''),
    body.featured === false ? 0 : 1,
    (max?.m ?? 0) + 1,
    body.published === false ? 0 : 1
  ).run();

  return json({ ok: true, id: r.meta.last_row_id, slug }, 201);
}

async function updateProject(env, id, body) {
  const cur = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
  if (!cur) return bad('Projeto não encontrado', 404);

  const f = (k, fallback) => (body[k] === undefined ? fallback : body[k]);
  let slug = body.slug ? slugify(body.slug) : cur.slug;
  if (slug !== cur.slug) {
    const clash = await env.DB.prepare('SELECT 1 FROM projects WHERE slug = ? AND id <> ?')
      .bind(slug, id).first();
    if (clash) return bad('Já existe outro projeto com esse endereço (slug)');
  }

  await env.DB.prepare(
    `UPDATE projects SET slug=?, title=?, tag=?, category=?, year=?, client=?,
       summary=?, body=?, cover=?, url=?, featured=?, published=?, updated_at=datetime('now')
     WHERE id=?`
  ).bind(
    slug,
    String(f('title', cur.title)), String(f('tag', cur.tag)), String(f('category', cur.category)),
    String(f('year', cur.year)), String(f('client', cur.client)),
    String(f('summary', cur.summary)), String(f('body', cur.body)),
    String(f('cover', cur.cover)), String(f('url', cur.url)),
    f('featured', cur.featured) ? 1 : 0,
    f('published', cur.published) ? 1 : 0,
    id
  ).run();

  return json({ ok: true, slug });
}

async function deleteProject(env, id) {
  const imgs = await env.DB.prepare('SELECT key FROM project_images WHERE project_id = ?').bind(id).all();
  // remove os arquivos órfãos do R2
  for (const row of imgs.results ?? []) {
    const used = await env.DB.prepare(
      'SELECT 1 FROM project_images WHERE key = ? AND project_id <> ?'
    ).bind(row.key, id).first();
    if (!used) { await env.MEDIA.delete(row.key); await env.DB.prepare('DELETE FROM media WHERE key = ?').bind(row.key).run(); }
  }
  await env.DB.prepare('DELETE FROM project_images WHERE project_id = ?').bind(id).run();
  await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
  return json({ ok: true });
}

async function reorder(env, ids) {
  if (!Array.isArray(ids)) return bad('Esperava uma lista de ids');
  const stmt = env.DB.prepare('UPDATE projects SET position = ? WHERE id = ?');
  await env.DB.batch(ids.map((id, i) => stmt.bind(i + 1, id)));
  return json({ ok: true });
}

/* upload: o admin já manda o arquivo redimensionado em webp */
async function upload(env, request) {
  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') return bad('Nenhum arquivo enviado');
  if (file.size > MAX_UPLOAD) return bad('Arquivo acima de 8 MB', 413);

  const mime = file.type || 'application/octet-stream';
  if (!ALLOWED_MIME.has(mime)) return bad(`Tipo não permitido: ${mime}`, 415);

  const ext = mime === 'image/webp' ? 'webp'
            : mime === 'image/avif' ? 'avif'
            : mime === 'image/png' ? 'png' : 'jpg';

  const base = slugify((form.get('name') || file.name || 'imagem').toString().replace(/\.[^.]+$/, ''));
  const key = `img/${new Date().toISOString().slice(0, 7)}/${base}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: mime, cacheControl: 'public, max-age=31536000, immutable' }
  });

  await env.DB.prepare(
    'INSERT INTO media (key, filename, mime, width, height, size, alt) VALUES (?,?,?,?,?,?,?)'
  ).bind(
    key, file.name || base, mime,
    parseInt(form.get('width') || '0', 10) || 0,
    parseInt(form.get('height') || '0', 10) || 0,
    file.size, String(form.get('alt') || '')
  ).run();

  return json({ ok: true, key, url: `/m/${key}` }, 201);
}

async function listMedia(env) {
  const { results } = await env.DB.prepare(
    'SELECT key, filename, width, height, size, alt, created_at FROM media ORDER BY created_at DESC LIMIT 200'
  ).all();
  return json({ media: results ?? [] });
}

async function deleteMedia(env, key) {
  const inUse = await env.DB.prepare(
    'SELECT 1 FROM project_images WHERE key = ? UNION SELECT 1 FROM projects WHERE cover = ?'
  ).bind(key, key).first();
  if (inUse) return bad('Essa imagem está em uso por um projeto', 409);
  await env.MEDIA.delete(key);
  await env.DB.prepare('DELETE FROM media WHERE key = ?').bind(key).run();
  return json({ ok: true });
}

/* galeria de um projeto */
async function setProjectImages(env, id, images) {
  if (!Array.isArray(images)) return bad('Esperava uma lista de imagens');
  await env.DB.prepare('DELETE FROM project_images WHERE project_id = ?').bind(id).run();
  if (images.length) {
    const stmt = env.DB.prepare('INSERT INTO project_images (project_id, key, alt, position) VALUES (?,?,?,?)');
    await env.DB.batch(images.map((im, i) => stmt.bind(id, String(im.key), String(im.alt || ''), i)));
  }
  return json({ ok: true });
}

/* ---------- roteador ---------- */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    try {
      /* --- mídia do R2 --- */
      if (pathname.startsWith('/m/')) {
        if (method !== 'GET' && method !== 'HEAD') return bad('Método não permitido', 405);
        return serveMedia(env, decodeURIComponent(pathname.slice(3)), request);
      }

      /* --- API --- */
      if (pathname.startsWith('/api/')) {
        const isWrite = method !== 'GET' && method !== 'HEAD';
        const isAdminRead = pathname.startsWith('/api/admin/');

        if (isWrite || isAdminRead) {
          const auth = await verifyAccess(request, env);
          if (!auth.ok) return json({ error: auth.message }, auth.status);
        }

        // públicas
        if (pathname === '/api/projects' && method === 'GET') return listProjects(env, url);

        const mSlug = pathname.match(/^\/api\/projects\/([^/]+)$/);
        if (mSlug && method === 'GET') return getProject(env, decodeURIComponent(mSlug[1]));

        // protegidas
        if (pathname === '/api/projects' && method === 'POST')
          return createProject(env, await request.json());

        if (pathname === '/api/projects/reorder' && method === 'POST')
          return reorder(env, (await request.json()).ids);

        const mId = pathname.match(/^\/api\/projects\/(\d+)$/);
        if (mId && method === 'PUT')    return updateProject(env, +mId[1], await request.json());
        if (mId && method === 'DELETE') return deleteProject(env, +mId[1]);

        const mImgs = pathname.match(/^\/api\/projects\/(\d+)\/images$/);
        if (mImgs && method === 'PUT')
          return setProjectImages(env, +mImgs[1], (await request.json()).images);

        if (pathname === '/api/admin/projects' && method === 'GET') {
          const { results } = await env.DB.prepare(
            'SELECT * FROM projects ORDER BY position ASC, id DESC'
          ).all();
          return json({ projects: results ?? [] });
        }

        if (pathname === '/api/upload' && method === 'POST') return upload(env, request);
        if (pathname === '/api/media' && method === 'GET')  return listMedia(env);

        const mKey = pathname.match(/^\/api\/media\/(.+)$/);
        if (mKey && method === 'DELETE') return deleteMedia(env, decodeURIComponent(mKey[1]));

        if (pathname === '/api/me' && method === 'GET') {
          const auth = await verifyAccess(request, env);
          return json({ ok: auth.ok, email: auth.email || null, dev: !!auth.dev });
        }

        return bad('Rota não encontrada', 404);
      }

      /* --- painel admin: exige Access --- */
      if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        const auth = await verifyAccess(request, env);
        if (!auth.ok) {
          return new Response(
            `<!doctype html><meta charset="utf-8">
             <title>Acesso restrito</title>
             <style>body{background:#000;color:#fff;font:16px/1.6 system-ui;display:grid;
             place-items:center;min-height:100vh;margin:0;text-align:center;padding:2rem}
             code{background:#111;padding:.2em .4em;border-radius:4px}</style>
             <div><h1>Acesso restrito</h1><p>${auth.message}</p>
             <p style="opacity:.6">Configure o Cloudflare Access para a rota <code>/admin</code>.</p></div>`,
            { status: auth.status, headers: { 'content-type': 'text/html; charset=utf-8' } }
          );
        }
      }

      /* --- site estático --- */
      return env.ASSETS.fetch(request);

    } catch (err) {
      console.error('Erro no Worker:', err && err.stack || err);
      return json({ error: 'Erro interno' }, 500);
    }
  }
};
