/* ============================================================
   CMS — busca os projetos da API e injeta no window.SITE
   antes das demais animações rodarem.

   Se a API não responder (site aberto direto do disco, Worker fora
   do ar, banco vazio), o site continua funcionando com o conteúdo
   do config.js. Nunca fica quebrado.
   ============================================================ */
(() => {
  'use strict';

  const TIMEOUT = 3500;

  async function fetchJSON(url) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    } finally {
      clearTimeout(t);
    }
  }

  /* Resolve o caminho da imagem.
     · "images/..."   → arquivo estático que já veio junto com o site
     · "http..."      → URL externa
     · qualquer outro → chave no R2, servida pelo Worker em /m/ */
  const imgUrl = key => {
    if (!key) return 'images/work-01.jpg';
    if (/^(https?:)?\/\//.test(key) || key.startsWith('/')) return key;
    if (key.startsWith('images/')) return '/' + key;
    return `/m/${key}`;
  };
  window.cmsImage = imgUrl;

  /* converte a linha do banco no formato que o front já usa */
  const toWork = p => ({
    title: p.title,
    tag: p.tag || p.category || '',
    url: p.url || (p.slug ? `projeto.html?p=${encodeURIComponent(p.slug)}` : '#'),
    img: imgUrl(p.cover),
    slug: p.slug,
    summary: p.summary || '',
    client: p.client || '',
    year: p.year || ''
  });

  window.CMS_READY = (async () => {
    const data = await fetchJSON('/api/projects?limit=50');
    if (!data || !Array.isArray(data.projects) || !data.projects.length) {
      console.info('[CMS] usando o conteúdo local do config.js');
      return { source: 'config', projects: [] };
    }

    const all = data.projects.map(toWork);
    const featured = data.projects.filter(p => p.featured).map(toWork);

    // a home mostra os destacados; a página de projetos mostra tudo
    window.SITE.works = (featured.length ? featured : all);
    window.SITE.allWorks = all;

    console.info(`[CMS] ${all.length} projeto(s) carregado(s) da API`);
    return { source: 'api', projects: all };
  })();
})();
