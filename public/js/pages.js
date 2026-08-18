/* ============================================================
   PAGES — comportamento de Work · About · Contact
   ============================================================ */
(() => {
  'use strict';
  const S = window.SITE;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- WORK: lista + preview seguindo o mouse ---------- */
  function initWorkList() {
    const list = $('.work-list');
    if (!list) return;

    const works = S.allWorks || S.works;
    list.innerHTML = works.map((w, i) => `
      <a class="work-row" href="${w.url}" data-img="${w.img}" data-tag="${w.tag}">
        <div class="work-row__idx">${String(i + 1).padStart(2, '0')}</div>
        <div class="work-row__title">${w.title}</div>
        <div class="work-row__tag">${w.tag}</div>
        <div class="work-row__year">${S.year}</div>
      </a>`).join('');

    // filtros por categoria
    const cats = ['Todos', ...new Set(works.map(w => (w.tag || '').split(' / ')[0]).filter(Boolean))];
    const filter = $('.work-filter');
    if (filter) {
      filter.innerHTML = cats.map((c, i) =>
        `<button class="${i === 0 ? 'is-on' : ''}" data-cat="${c}">${c}</button>`).join('');
      filter.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        $$('button', filter).forEach(x => x.classList.toggle('is-on', x === b));
        const cat = b.dataset.cat;
        $$('.work-row', list).forEach(r => {
          const on = cat === 'Todos' || r.dataset.tag.startsWith(cat);
          gsap.to(r, { opacity: on ? 1 : 0.18, duration: 0.4, ease: 'power2.out' });
        });
      });
    }

    // preview flutuante
    const prev = $('.work-preview');
    if (prev && !matchMedia('(pointer: coarse)').matches) {
      const img = $('img', prev);
      let x = 0, y = 0, tx = 0, ty = 0;
      addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
      gsap.ticker.add(() => {
        x += (tx - x) * 0.11; y += (ty - y) * 0.11;
        prev.style.left = x + 'px'; prev.style.top = y + 'px';
      });
      $$('.work-row', list).forEach(row => {
        row.addEventListener('mouseenter', () => { img.src = row.dataset.img; prev.classList.add('is-on'); });
        row.addEventListener('mouseleave', () => prev.classList.remove('is-on'));
      });
    }

    // entrada escalonada
    gsap.from('.work-row', {
      y: 40, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'expo.out',
      scrollTrigger: { trigger: list, start: 'top 82%', once: true }
    });
  }

  /* ---------- ABOUT: parallax do retrato ---------- */
  function initAbout() {
    const img = $('.about-portrait img');
    if (!img) return;
    gsap.fromTo(img, { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: '.about-portrait', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.from('.about-portrait', {
      clipPath: 'inset(100% 0 0 0)', duration: 1.3, ease: 'expo.out',
      scrollTrigger: { trigger: '.about-portrait', start: 'top 85%', once: true }
    });
  }

  /* ---------- CONTACT: formulário via mailto ---------- */
  function initForm() {
    const form = $('.form');
    if (!form) return;
    const note = $('.form-note', form.parentElement) || $('.form-note');

    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(form);
      const nome = (d.get('nome') || '').toString().trim();
      const email = (d.get('email') || '').toString().trim();
      const assunto = (d.get('assunto') || 'Contato pelo site').toString();
      const msg = (d.get('mensagem') || '').toString().trim();

      if (!nome || !email || !msg) {
        if (note) { note.textContent = 'Preencha nome, e-mail e mensagem.'; note.style.color = '#e0a0a0'; }
        return;
      }
      const body = `Nome: ${nome}\nE-mail: ${email}\n\n${msg}`;
      location.href = `mailto:${S.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(body)}`;
      if (note) { note.textContent = 'Abrindo seu app de e-mail…'; note.style.color = ''; }
    });
  }

  /* ---------- cabeçalho de página ---------- */
  function initPageHead() {
    gsap.from('.page-head__label, .page-head__intro, .page-head__meta > *', {
      y: 24, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'power3.out', delay: 0.3
    });
    gsap.from('.page-head__title', { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', delay: 0.2 });
  }

  async function boot() {
    // espera o CMS responder antes de montar (cai no config.js se a API falhar)
    if (window.CMS_READY) { try { await window.CMS_READY; } catch (e) {} }
    initPageHead();
    initWorkList();
    initAbout();
    initForm();
    window.SiteCore && window.SiteCore.rescan();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
