/* ============================================================
   SECTIONS — módulos animados, montados a partir do config.
   Cada função só roda se o container existir na página.
   ============================================================ */
(() => {
  'use strict';
  const S = window.SITE;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

  /* ============ 1. MANIFESTO — revelação palavra a palavra ============ */
  function manifesto() {
    const host = $('.manifesto');
    if (!host) return;
    $('.manifesto__label', host).textContent = S.manifestoLabel;
    const box = $('.manifesto__text', host);
    box.innerHTML = S.manifesto.split(/\s+/)
      .map(w => `<span class="w">${esc(w)}</span>`).join('');

    const words = $$('.w', box);
    if (reduce) { gsap.set(words, { color: '#fff' }); return; }
    gsap.to(words, {
      color: '#ffffff', ease: 'none',
      stagger: { each: 0.5 / words.length },
      scrollTrigger: {
        trigger: host, start: 'top top', end: 'bottom bottom', scrub: 0.5
      }
    });
  }

  /* ============ 2. SERVIÇOS EM ACORDEÃO ============ */
  function services() {
    const host = $('.svc');
    if (!host) return;
    $('.sec-label', host).textContent = S.servicesLabel;
    $('.sec-title', host).textContent = S.servicesTitle;

    const list = $('.svc__list', host);
    list.innerHTML = S.servicesDetailed.map((s, i) => `
      <div class="svc__item">
        <button class="svc__head" aria-expanded="false">
          <span class="svc__num">${String(i + 1).padStart(2, '0')}</span>
          <span class="svc__title">${esc(s.title)}</span>
          <span class="svc__plus" aria-hidden="true"></span>
        </button>
        <div class="svc__panel">
          <div class="svc__panel-in">
            <div class="svc__gutter" aria-hidden="true"></div>
            <div class="svc__body">
              <p class="svc__desc">${esc(s.desc)}</p>
              <a class="svc__cta" href="contact.html">Falar sobre isso</a>
            </div>
            <div class="svc__thumb"><img src="${s.img}" alt="${esc(s.title)}" loading="lazy"></div>
          </div>
        </div>
      </div>`).join('');

    const items = $$('.svc__item', list);
    const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

    // o acordeão muda a altura da página; recalcula os gatilhos sem
    // disparar a cada movimento do mouse
    let refreshT = 0;
    const refresh = () => {
      clearTimeout(refreshT);
      refreshT = setTimeout(() => ScrollTrigger.refresh(), 260);
    };

    const close = el => {
      if (!el.classList.contains('is-open')) return;
      el.classList.remove('is-open');
      $('.svc__head', el).setAttribute('aria-expanded', 'false');
      gsap.to($('.svc__panel', el), {
        height: 0, duration: 0.45, ease: 'expo.inOut', overwrite: 'auto'
      });
    };

    const open = item => {
      if (item.classList.contains('is-open')) return;
      items.forEach(o => { if (o !== item) close(o); });
      item.classList.add('is-open');
      $('.svc__head', item).setAttribute('aria-expanded', 'true');
      gsap.to($('.svc__panel', item), {
        height: $('.svc__panel-in', item).offsetHeight,
        duration: 0.6, ease: 'expo.out', overwrite: 'auto',
        onComplete: refresh
      });
    };

    items.forEach((item, i) => {
      const head = $('.svc__head', item);

      // toque e teclado seguem no clique
      head.addEventListener('click', e => {
        e.preventDefault();
        item.classList.contains('is-open') ? close(item) : open(item);
      });

      // no desktop, só passar o mouse já abre
      if (canHover) {
        let hoverT = 0;
        head.addEventListener('mouseenter', () => {
          clearTimeout(hoverT);
          hoverT = setTimeout(() => open(item), 60);   // evita abrir de raspão
        });
        head.addEventListener('mouseleave', () => clearTimeout(hoverT));
      }

      if (i === 0) requestAnimationFrame(() => open(item)); // primeiro já aberto
    });

    // o último item visitado continua aberto quando o mouse sai da lista

    addEventListener('resize', () => {
      const cur = items.find(el => el.classList.contains('is-open'));
      if (cur) gsap.set($('.svc__panel', cur), { height: $('.svc__panel-in', cur).offsetHeight });
    });

    gsap.from(items, {
      y: 30, opacity: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out',
      scrollTrigger: { trigger: list, start: 'top 85%', once: true }
    });
  }

  /* ============ 3. PROCESSO ============ */
  function process() {
    const host = $('.proc');
    if (!host) return;
    $('.sec-label', host).textContent = S.processLabel;
    $('.sec-title', host).textContent = S.processTitle;

    const steps = $('.proc__steps', host);
    steps.innerHTML = S.process.map(p => `
      <div class="proc__step">
        <div class="proc__step-num">${esc(p.step)}</div>
        <h3 class="proc__step-title">${esc(p.title)}</h3>
        <p class="proc__step-desc">${esc(p.desc)}</p>
      </div>`).join('');

    $$('.proc__step', steps).forEach(st => {
      ScrollTrigger.create({
        trigger: st, start: 'top 70%', end: 'bottom 40%',
        onToggle: self => st.classList.toggle('is-on', self.isActive)
      });
    });

    const rail = $('.proc__rail i', host);
    if (rail) gsap.to(rail, {
      height: '100%', ease: 'none',
      scrollTrigger: { trigger: steps, start: 'top 70%', end: 'bottom 60%', scrub: 0.4 }
    });
  }

  /* ============ 4. ODÔMETRO ============ */
  function odometer() {
    const host = $('.odo');
    if (!host) return;

    // separa dígitos de prefixo/sufixo (ex.: "1.5K+" → 1,.,5,K,+)
    const roll = '0123456789'.split('').map(n => `<span>${n}</span>`).join('');
    host.innerHTML = S.stats.map(s => {
      const parts = String(s.num).split('').map(ch =>
        /[0-9]/.test(ch)
          ? `<span class="odo__reel"><span class="odo__roll">${roll}</span></span>`
          : `<span class="odo__fixed">${esc(ch)}</span>`
      ).join('');
      return `<div class="odo__item" data-num="${esc(String(s.num))}">
        <div class="odo__num">${parts}</div>
        <div class="odo__label">${esc(s.label)}</div>
      </div>`;
    }).join('');

    /* Conta de 0 até o número final conforme a seção sobe:
       zerado quando entra pela base da tela, cheio ao chegar no meio. */
    $$('.odo__item', host).forEach(item => {
      const digits = String(item.dataset.num).replace(/\D/g, '');
      const reels = $$('.odo__roll', item);
      if (!digits || !reels.length) return;

      const target = parseInt(digits, 10);
      const pad = digits.length;

      const apply = v => {
        const s = String(Math.round(v)).padStart(pad, '0').slice(-pad);
        reels.forEach((r, i) => gsap.set(r, { yPercent: -10 * (+s[i] || 0) }));
      };

      apply(0);
      if (reduce) { apply(target); return; }

      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, ease: 'none',
        onUpdate: () => apply(obj.v),
        scrollTrigger: {
          trigger: item,
          start: 'top bottom',      // zerado quando aparece embaixo
          end: 'top 50%',           // cheio ao chegar no meio da tela
          scrub: 0.6
        }
      });
    });

    gsap.from('.odo__item', {
      y: 26, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: host, start: 'top 92%', once: true }
    });
  }

  /* ============ 5. DEPOIMENTOS — carrossel arrastável ============ */
  function testimonials() {
    const host = $('.tst');
    if (!host) return;
    $('.sec-label', host).textContent = S.testimonialsLabel;
    $('.sec-title', host).textContent = S.testimonialsTitle;

    const track = $('.tst__track', host);
    track.innerHTML = S.testimonials.map(t => `
      <article class="tst__card">
        <div class="tst__tag">${esc(t.tag)}</div>
        <p class="tst__quote">${esc(t.quote)}</p>
        <div class="tst__who">
          <div class="tst__name">${esc(t.name)}</div>
          <div class="tst__role">${esc(t.role)} · ${esc(t.company)}</div>
        </div>
      </article>`).join('');

    const vp = $('.tst__viewport', host);
    let x = 0, target = 0, min = 0, dragging = false, startX = 0, startTarget = 0;

    const bounds = () => { min = Math.min(0, vp.clientWidth - track.scrollWidth); };
    bounds();
    addEventListener('resize', bounds);

    const clamp = v => Math.max(min, Math.min(0, v));

    vp.addEventListener('pointerdown', e => {
      dragging = true; startX = e.clientX; startTarget = target;
      vp.classList.add('is-drag'); vp.setPointerCapture(e.pointerId);
    });
    vp.addEventListener('pointermove', e => {
      if (!dragging) return;
      target = clamp(startTarget + (e.clientX - startX) * 1.4);
    });
    const stop = () => { dragging = false; vp.classList.remove('is-drag'); };
    vp.addEventListener('pointerup', stop);
    vp.addEventListener('pointercancel', stop);

    // roda do mouse na horizontal
    vp.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        target = clamp(target - e.deltaX);
      }
    }, { passive: false });

    gsap.ticker.add(() => {
      x += (target - x) * 0.11;
      gsap.set(track, { x });
    });

    // deriva suave na entrada, para sinalizar que arrasta
    ScrollTrigger.create({
      trigger: host, start: 'top 70%', once: true,
      onEnter: () => { if (!reduce) { target = clamp(-60); setTimeout(() => { target = 0; }, 700); } }
    });
  }

  /* ============ 6. GALERIA HORIZONTAL (pin) ============ */
  function hscroll() {
    const host = $('.hsc');
    if (!host) return;
    const track = $('.hsc__track', host);

    track.insertAdjacentHTML('beforeend', S.works.map((w, i) => `
      <a class="hsc__card" href="${w.url}" data-cursor="ver projeto">
        <div class="hsc__img"><img src="${w.img}" alt="${esc(w.title)}" loading="lazy"></div>
        <div class="hsc__meta">
          <span class="hsc__name">${esc(w.title)}</span>
          <span class="hsc__tag">${String(i + 1).padStart(2, '0')}</span>
        </div>
      </a>`).join(''));

    if (reduce || innerWidth < 720) {
      // no mobile vira scroll horizontal nativo
      $('.hsc__pin', host).style.overflowX = 'auto';
      return;
    }
    const dist = () => track.scrollWidth - innerWidth + 40;
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: host, start: 'top top',
        end: () => '+=' + dist(),
        pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1
      }
    });
  }

  /* ============ 7. CLIENTES ============ */
  function clients() {
    const host = $('.cli');
    if (!host) return;
    const track = $('.cli__track', host);
    const row = S.clients.map(c => `<span>${esc(c)}</span>`).join('');
    track.innerHTML = row + row + row;
    if (reduce) return;
    const w = track.scrollWidth / 3;
    gsap.to(track, {
      x: -w, duration: 30, ease: 'none', repeat: -1,
      modifiers: { x: gsap.utils.unitize(v => parseFloat(v) % w) }
    });
  }

  /* ============ 8. BENEFÍCIOS ============ */
  function benefits() {
    const host = $('.ben');
    if (!host) return;
    $('.ben__label', host).textContent = S.benefitsLabel;
    $('.ben__title', host).innerHTML = S.benefitsTitle
      .map(l => `<span class="reveal-line"><span>${esc(l)}</span></span>`).join('');
    $('.ben__intro', host).innerHTML = esc(S.benefitsIntro)
      .replace('perspectiva', '<em>perspectiva</em>')
      .replace('instinto afiado', '<em>instinto afiado</em>');

    $('.ben__list', host).innerHTML = S.benefits.map((b, i) => `
      <div class="ben__item"><i>0${i + 1}</i><p>${esc(b)}</p></div>`).join('');

    $$('.ben__title .reveal-line > span', host).forEach(sp => {
      gsap.from(sp, {
        yPercent: 115, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: sp.parentElement, start: 'top 88%', once: true }
      });
    });
    gsap.from('.ben__item', {
      y: 30, opacity: 0, duration: 0.85, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.ben__list', start: 'top 85%', once: true }
    });
  }

  /* ============ 9. FAQ ============ */
  function faq() {
    const host = $('.faq');
    if (!host) return;
    $('.sec-label', host).textContent = S.faqLabel;

    const list = $('.faq__list', host);
    list.innerHTML = S.faq.map(f => `
      <div class="faq__item">
        <button class="faq__q" aria-expanded="false">
          <span>${esc(f.q)}</span><span class="faq__ic" aria-hidden="true"></span>
        </button>
        <div class="faq__a"><p>${esc(f.a)}</p></div>
      </div>`).join('');

    $$('.faq__item', list).forEach(item => {
      const btn = $('.faq__q', item);
      const box = $('.faq__a', item);
      const p = $('p', box);
      btn.addEventListener('click', () => {
        const open = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
        gsap.to(box, {
          height: open ? p.offsetHeight : 0,
          duration: open ? 0.55 : 0.4,
          ease: open ? 'expo.out' : 'expo.inOut',
          onComplete: () => ScrollTrigger.refresh()
        });
      });
    });
  }

  /* ============ 10. CTA FINAL ============ */
  function cta() {
    const host = $('.cta');
    if (!host) return;
    $('.cta__title', host).textContent = S.ctaTitle;
    $('.cta__sub', host).textContent = S.ctaSub;

    const mail = $('.cta__mail', host);
    mail.textContent = S.email;
    mail.href = 'mailto:' + S.email;

    const btn = $('.cta__btn span', host);
    if (btn) btn.textContent = S.ctaButton;
    const btnEl = $('.cta__btn', host);
    if (btnEl) btnEl.href = 'contact.html';

    gsap.from(['.cta__title', '.cta__sub', '.cta__mail', '.cta__btn'], {
      y: 34, opacity: 0, duration: 0.95, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: host, start: 'top 80%', once: true }
    });

    // botão magnético
    if (btnEl && !matchMedia('(pointer: coarse)').matches && !reduce) {
      btnEl.addEventListener('mousemove', e => {
        const r = btnEl.getBoundingClientRect();
        gsap.to(btnEl, {
          x: (e.clientX - r.left - r.width / 2) * 0.28,
          y: (e.clientY - r.top - r.height / 2) * 0.4,
          duration: 0.5, ease: 'power3.out'
        });
      });
      btnEl.addEventListener('mouseleave', () => {
        gsap.to(btnEl, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    }
  }

  /* ============ BOOT ============ */
  async function boot() {
    // espera o CMS responder antes de montar (cai no config.js se a API falhar)
    if (window.CMS_READY) { try { await window.CMS_READY; } catch (e) {} }
    manifesto(); services(); process(); odometer();
    testimonials(); hscroll(); clients(); benefits(); faq(); cta();
    window.SiteCore && window.SiteCore.rescan();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
