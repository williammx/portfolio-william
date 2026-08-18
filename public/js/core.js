/* ============================================================
   CORE — chrome global compartilhado por todas as páginas
   Loader · Lenis · cursor · film grain · transição de página ·
   menu · nav · footer · marquee · scramble
   ============================================================ */
(() => {
  'use strict';
  const S = window.SITE;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  gsap.registerPlugin(ScrollTrigger);

  /* ============ 1. SMOOTH SCROLL (Lenis) ============ */
  let lenis = null;
  function initLenis() {
    if (reduce || typeof Lenis === 'undefined') return;
    lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }

  /* ============ 2. FILM GRAIN ============ */
  function initGrain() {
    const cv = $('#film-grain-canvas');
    if (!cv || reduce) return;
    const ctx = cv.getContext('2d', { alpha: true });
    let w, h, frames = [], i = 0, raf;

    function build() {
      w = cv.width = Math.ceil(innerWidth / 2);
      h = cv.height = Math.ceil(innerHeight / 2);
      cv.style.width = innerWidth + 'px';
      cv.style.height = innerHeight + 'px';
      frames = [];
      for (let f = 0; f < 4; f++) {
        const img = ctx.createImageData(w, h);
        const d = img.data;
        for (let p = 0; p < d.length; p += 4) {
          const v = Math.random() * 255;
          d[p] = d[p + 1] = d[p + 2] = v;
          d[p + 3] = 255;
        }
        frames.push(img);
      }
    }
    function loop() {
      ctx.putImageData(frames[i = (i + 1) % frames.length], 0, 0);
      raf = setTimeout(() => requestAnimationFrame(loop), 55);
    }
    build();
    loop();
    addEventListener('resize', () => { clearTimeout(raf); build(); loop(); });
  }

  /* ============ 3. CURSOR ============ */
  function initCursor() {
    if (isTouch) return;
    const dot  = $('#cursor-dot');
    const ring = $('#cursor-ring');
    const label = $('.cursor-label');
    if (!dot || !ring) return;

    // rastro de pontos
    const TRAIL = 14;
    const trail = [];
    for (let i = 0; i < TRAIL; i++) {
      const el = document.createElement('div');
      el.className = 'mouse-tracker';
      el.style.opacity = (1 - i / TRAIL) * 0.4;
      el.style.transform = 'translate3d(-100px,-100px,0)';
      document.body.appendChild(el);
      trail.push({ el, x: 0, y: 0 });
    }

    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;

    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

    gsap.ticker.add(() => {
      gsap.set(dot, { x: mx, y: my });
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      gsap.set(ring, { x: rx, y: ry });
      if (label) gsap.set(label, { x: rx, y: ry + 52 });

      let px = mx, py = my;
      trail.forEach(t => {
        t.x += (px - t.x) * 0.38;
        t.y += (py - t.y) * 0.38;
        t.el.style.transform = `translate3d(${t.x}px,${t.y}px,0) translate(-50%,-50%)`;
        px = t.x; py = t.y;
      });
    });

    // estados de hover (rebindável para conteúdo injetado depois)
    bindCursorTargets = () => {
      $$('a, button, .counter-nav, [data-cursor]').forEach(el => {
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = '1';
        el.addEventListener('mouseenter', () => {
          ring.classList.add('is-hover');
          const txt = el.dataset.cursor;
          if (txt && label) { label.textContent = txt; label.classList.add('is-visible'); }
        });
        el.addEventListener('mouseleave', () => {
          ring.classList.remove('is-hover');
          if (label) label.classList.remove('is-visible');
        });
      });
    };
    bindCursorTargets();
  }
  let bindCursorTargets = () => {};

  /* ============ 4. TRANSIÇÃO DE PÁGINA ============ */
  function initPageTransition() {
    const shell   = $('.page-transition-shell');
    const curtain = $('.page-transition-curtain');
    const frame   = $('.page-transition-frame');
    if (!shell) return;

    // entrada
    gsap.set(curtain, { '--pt-top': '-102%', '--pt-bottom': '102%' });

    // saída ao clicar em link interno
    $$('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('mailto') || href.startsWith('tel') || a.target === '_blank') return;

      a.addEventListener('click', e => {
        e.preventDefault();
        document.documentElement.classList.add('is-page-transitioning');
        shell.classList.add('is-active');
        if (frame) frame.textContent = S.brand;

        gsap.timeline({ onComplete: () => { location.href = href; } })
          .to(curtain, { '--pt-top': '0%', '--pt-bottom': '0%', duration: 0.75, ease: 'expo.inOut' })
          .to(frame, { opacity: 1, duration: 0.35 }, '-=0.3');
      });
    });

    // ao voltar pelo histórico
    addEventListener('pageshow', ev => {
      if (ev.persisted) {
        document.documentElement.classList.remove('is-page-transitioning');
        shell.classList.remove('is-active');
        gsap.set(curtain, { '--pt-top': '-102%', '--pt-bottom': '102%' });
        gsap.set(frame, { opacity: 0 });
      }
    });
  }

  /* ============ 5. MENU OVERLAY ============ */
  function initMenu() {
    const toggle  = $('.menu-toggle');
    const overlay = $('.menu-overlay');
    if (!toggle || !overlay) return;
    const links = $$('.menu-nav__link', overlay);
    let open = false;

    const tl = gsap.timeline({ paused: true })
      .to(overlay, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' })
      .to(links, { y: '0%', duration: 0.7, stagger: 0.06, ease: 'expo.out' }, '-=0.35')
      .from('.menu-foot > *', { y: 20, opacity: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }, '-=0.4');

    function set(state) {
      open = state;
      document.body.classList.toggle('menu-open', open);
      overlay.classList.toggle('is-open', open);
      overlay.setAttribute('aria-hidden', String(!open));
      toggle.setAttribute('aria-expanded', String(open));
      if (open) { tl.play(); lenis && lenis.stop(); }
      else { tl.reverse(); lenis && lenis.start(); }
    }

    toggle.addEventListener('click', () => set(!open));
    $$('.menu-nav__link', overlay).forEach(l => l.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape' && open) set(false); });
  }

  /* ============ 6. BARRA DE PROGRESSO ============ */
  function initProgress() {
    const bar = $('#scroll-progress');
    if (!bar) return;
    gsap.to(bar, {
      width: '100%', ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
    });
  }

  /* ============ 7. SCRAMBLE DE TEXTO ============ */
  const GLYPHS = '▚▞█▓▒░/\\<>{}[]#*+=-_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function scramble(el, finalText, duration = 900) {
    const chars = finalText.split('');
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const locked = Math.floor(p * chars.length);
      el.textContent = chars
        .map((c, i) => (i < locked || c === ' ')
          ? c
          : GLYPHS[(Math.random() * GLYPHS.length) | 0])
        .join('');
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = finalText;
    }
    requestAnimationFrame(tick);
  }
  window.scrambleText = scramble;

  function initScramble() {
    $$('[data-scramble]').forEach(el => {
      if (el.dataset.scrambleBound) return;
      el.dataset.scrambleBound = '1';
      const final = el.textContent.trim();
      el.textContent = '';
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => scramble(el, final, 800)
      });
    });
  }

  /* ============ 8. REVELAÇÃO DE LINHAS ============ */
  function initReveal() {
    $$('.reveal-line > span, .gh-line > span').forEach(span => {
      if (span.dataset.revealBound) return;
      span.dataset.revealBound = '1';
      gsap.from(span, {
        yPercent: 115, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: span.parentElement, start: 'top 88%', once: true }
      });
    });
    $$('[data-fade]').forEach((el, i) => {
      if (el.dataset.revealBound) return;
      el.dataset.revealBound = '1';
      gsap.from(el, {
        y: 28, opacity: 0, duration: 0.9, ease: 'power3.out',
        delay: (i % 4) * 0.06,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
  }

  /* rescan: chamado depois de injetar HTML dinamicamente */
  window.SiteCore = {
    rescan() {
      bindCursorTargets();
      initScramble();
      initReveal();
      ScrollTrigger.refresh();
    }
  };

  /* ============ 9. MARQUEE ============ */
  /* Faixa infinita à prova de falha.
     A versão anterior media a largura uma vez e usava módulo — se a fonte
     carregasse depois, a medida saía errada e abria um buraco no meio.
     Aqui montamos exatamente DUAS cópias iguais e deslocamos 50%:
     não há medida a errar, o emenda é sempre perfeita. */
  function loopStrip(track, speed = 70, dir = -1) {
    if (!track || track.dataset.looping) return;
    track.dataset.looping = '1';

    const base = track.innerHTML;
    let unit = base;
    track.innerHTML = unit;

    // repete o conteúdo até uma cópia cobrir a tela inteira
    let guard = 0;
    while (track.scrollWidth < innerWidth * 1.2 && guard++ < 20) {
      unit += base;
      track.innerHTML = unit;
    }
    const unitWidth = track.scrollWidth;
    track.innerHTML = unit + unit;      // duas cópias exatas

    gsap.set(track, { xPercent: dir === 1 ? -50 : 0 });
    gsap.to(track, {
      xPercent: dir === 1 ? 0 : -50,
      duration: Math.max(12, unitWidth / speed),
      ease: 'none', repeat: -1
    });
  }

  function initMarquee() {
    const start = () => {
      $$('.marquee').forEach(m =>
        loopStrip($('.marquee__track', m), 70, m.dataset.dir === 'right' ? 1 : -1));
      $$('.cli__row').forEach(r => loopStrip($('.cli__track', r), 55, -1));
    };
    // espera a fonte para a medida não sair curta
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    else start();
  }

  /* ============ 10. PARALLAX DO FOOTER ============ */
  function initFooterParallax() {
    const bg = $('#footer-parallax-bg');
    if (!bg) return;
    if (S.footerImage) bg.style.backgroundImage = `url(${S.footerImage})`;
    gsap.to(bg, {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '.footer-parallax-section', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  /* ============ 11. LOADER ============ */
  function initLoader(onDone) {
    const loader = $('.loader');
    if (!loader) { onDone && onDone(); return; }
    const bar   = $('.loader__bar i', loader);
    const count = $('.loader__count', loader);
    const marks = $$('.loader__mark span', loader);
    const state = { v: 0 };

    document.body.classList.add('is-locked');

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.classList.remove('is-locked');
        loader.remove();
        ScrollTrigger.refresh();
        onDone && onDone();
      }
    });

    tl.to(marks, { y: '0%', opacity: 1, duration: 0.9, stagger: 0.05, ease: 'expo.out' })
      .to(state, {
        v: 100, duration: 2.1, ease: 'power2.inOut',
        onUpdate: () => {
          const n = Math.round(state.v);
          if (count) count.textContent = String(n).padStart(3, '0');
          if (bar) bar.style.width = n + '%';
        }
      }, 0.2)
      .to(marks, { y: '-110%', opacity: 0, duration: 0.6, stagger: 0.04, ease: 'expo.in' }, '+=0.15')
      .to(loader, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.35');
  }

  /* ============ 12. PREENCHIMENTO A PARTIR DO CONFIG ============ */
  function hydrate() {
    $$('[data-site]').forEach(el => {
      const val = S[el.dataset.site];
      if (typeof val === 'string') el.textContent = val;
    });

    // letras do loader geradas a partir do config
    const mark = $('.loader__mark');
    if (mark) mark.innerHTML = S.brand.toUpperCase().split('')
      .map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    $$('[data-site-href]').forEach(el => {
      const k = el.dataset.siteHref;
      if (k === 'email') el.href = 'mailto:' + S.email;
      else if (k === 'phone') el.href = 'tel:' + S.phone.replace(/\D/g, '');
    });

    // nav (barra + menu + footer)
    const navBar = $('.nav-bar__right .nav-links');
    if (navBar) navBar.innerHTML = S.nav
      .map(n => `<a class="nav-bar__link" href="${n.url}">${n.label}</a>`).join('');

    const menuNav = $('.menu-nav');
    if (menuNav) menuNav.innerHTML = S.nav.map((n, i) => `
      <div class="menu-nav__item">
        <a class="menu-nav__link" href="${n.url}">
          <span class="menu-nav__num">0${i + 1}</span>${n.label}
        </a>
      </div>`).join('');

    const fNav = $('.footer-nav');
    if (fNav) fNav.innerHTML = S.nav.map(n => `<a href="${n.url}">${n.label}</a>`).join('');

    const socials = $$('.js-socials');
    socials.forEach(c => c.innerHTML = S.socials
      .map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`).join(''));
  }

  /* ============ BOOT ============ */
  function boot() {
    hydrate();
    initLenis();
    initGrain();
    initCursor();
    initPageTransition();
    initMenu();
    initProgress();
    initMarquee();
    initFooterParallax();
    initScramble();
    initReveal();

    initLoader(() => {
      document.dispatchEvent(new CustomEvent('site:ready'));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
