/* ============================================================
   PÁGINA DE PROJETO — lê ?p=slug, busca na API e monta o case.
   Se a API não responder, cai no catálogo do config.js.
   ============================================================ */
(() => {
  'use strict';
  const S = window.SITE;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const img = k => (window.cmsImage ? window.cmsImage(k) : k);

  const slug = new URLSearchParams(location.search).get('p');

  function notFound(msg) {
    $('.case').innerHTML = `
      <div class="case__empty">
        <div class="sec-label">( 404 )</div>
        <h1 class="page-head__title">Projeto não<br>encontrado</h1>
        <p class="page-head__intro">${esc(msg || 'Esse endereço não corresponde a nenhum projeto publicado.')}</p>
        <a class="btn" href="work.html"><span>Ver todos os projetos</span></a>
      </div>`;
    document.title = 'Projeto não encontrado · ' + S.brandFull;
  }

  function render(p, siblings) {
    const images = (p.images || []).map(i => (typeof i === 'string' ? i : i.key));
    const cover = p.cover || images[0];
    const rest = images.filter(k => k !== cover);

    document.title = `${p.title} · ${S.brandFull}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && p.summary) meta.content = p.summary;

    $('.case').innerHTML = `
      <header class="case__head">
        <div class="sec-label">${esc(p.category || 'Projeto')}</div>
        <h1 class="case__title">${esc(p.title)}</h1>
        ${p.summary ? `<p class="case__summary">${esc(p.summary)}</p>` : ''}
        <dl class="case__meta">
          ${p.client ? `<div><dt>Cliente</dt><dd>${esc(p.client)}</dd></div>` : ''}
          ${p.tag    ? `<div><dt>Escopo</dt><dd>${esc(p.tag)}</dd></div>` : ''}
          ${p.year   ? `<div><dt>Ano</dt><dd>${esc(p.year)}</dd></div>` : ''}
          ${p.url && p.url !== '#' ? `<div><dt>Link</dt><dd><a href="${esc(p.url)}" target="_blank" rel="noopener">visitar ↗</a></dd></div>` : ''}
        </dl>
      </header>

      ${cover ? `<figure class="case__cover"><img src="${img(cover)}" alt="${esc(p.title)}"></figure>` : ''}

      ${p.body ? `<div class="case__body"><p>${esc(p.body).replace(/\n{2,}/g, '</p><p>')}</p></div>` : ''}

      ${rest.length ? `<div class="case__gallery">
        ${rest.map(k => `<figure><img src="${img(k)}" alt="${esc(p.title)}" loading="lazy"></figure>`).join('')}
      </div>` : ''}

      ${siblings ? `<nav class="case__nav">
        ${siblings.prev ? `<a class="case__nav-item case__nav-item--prev" href="projeto.html?p=${encodeURIComponent(siblings.prev.slug)}">
            <span>Anterior</span><strong>${esc(siblings.prev.title)}</strong></a>` : '<span></span>'}
        ${siblings.next ? `<a class="case__nav-item case__nav-item--next" href="projeto.html?p=${encodeURIComponent(siblings.next.slug)}">
            <span>Próximo</span><strong>${esc(siblings.next.title)}</strong></a>` : '<span></span>'}
      </nav>` : ''}
    `;

    animate();
  }

  function animate() {
    if (typeof gsap === 'undefined') return;
    gsap.from('.case__head > *', { y: 28, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out', delay: 0.25 });
    gsap.from('.case__cover', { clipPath: 'inset(100% 0 0 0)', duration: 1.3, ease: 'expo.out', delay: 0.35 });

    $$('.case__gallery figure').forEach(f => {
      gsap.from(f, {
        clipPath: 'inset(100% 0 0 0)', duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: f, start: 'top 85%', once: true }
      });
      const im = $('img', f);
      if (im) gsap.fromTo(im, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    window.SiteCore && window.SiteCore.rescan();
  }

  /* vizinhos para a navegação anterior/próximo */
  function neighbours(list, i) {
    if (!list.length) return null;
    return {
      prev: i > 0 ? list[i - 1] : list[list.length - 1],
      next: i < list.length - 1 ? list[i + 1] : list[0]
    };
  }

  async function boot() {
    if (!slug) { notFound('Nenhum projeto foi informado no endereço.'); return; }

    // 1) tenta a API
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(slug)}`, { headers: { accept: 'application/json' } });
      if (res.ok) {
        const { project } = await res.json();
        let sib = null;
        try {
          const all = await (await fetch('/api/projects?limit=100')).json();
          const list = all.projects || [];
          const i = list.findIndex(x => x.slug === slug);
          if (i >= 0) sib = neighbours(list, i);
        } catch {}
        render(project, sib);
        return;
      }
    } catch {}

    // 2) fallback: catálogo local do config.js
    const list = S.allWorks || S.works || [];
    const i = list.findIndex(w => w.slug === slug);
    if (i < 0) { notFound(); return; }
    const w = list[i];
    render({
      title: w.title, tag: w.tag, category: (w.tag || '').split(' / ')[0],
      summary: w.summary || '', body: '', cover: w.img, images: [], url: ''
    }, neighbours(list, i));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
