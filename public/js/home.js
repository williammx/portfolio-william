/* ============================================================
   HOME — animações exclusivas da página inicial
   Hero sticky · contador de slides · logo matricial no scroll ·
   galeria em anel 3D (Three.js) · parallax dos projetos
   ============================================================ */
(() => {
  'use strict';
  const S = window.SITE;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ============ FONTE MATRICIAL 3x5 ============ */
  const FONT = {
    A:['010','101','111','101','101'], B:['110','101','110','101','110'],
    C:['011','100','100','100','011'], D:['110','101','101','101','110'],
    E:['111','100','110','100','111'], F:['111','100','110','100','100'],
    G:['011','100','101','101','011'], H:['101','101','111','101','101'],
    I:['111','010','010','010','111'], J:['001','001','001','101','010'],
    K:['101','101','110','101','101'], L:['100','100','100','100','111'],
    M:['101','111','111','101','101'], N:['101','111','111','111','101'],
    O:['010','101','101','101','010'], P:['110','101','110','100','100'],
    Q:['010','101','101','111','011'], R:['110','101','110','101','101'],
    S:['011','100','010','001','110'], T:['111','010','010','010','010'],
    U:['101','101','101','101','111'], V:['101','101','101','101','010'],
    W:['101','101','111','111','101'], X:['101','101','010','101','101'],
    Y:['101','101','010','010','010'], Z:['111','001','010','100','111'],
    ' ':['000','000','000','000','000']
  };

  /* ============ 1. HERO ============ */
  function initHero() {
    // texto gigante entra de baixo
    gsap.from('.huge-text > div', {
      yPercent: 115, duration: 1.3, stagger: 0.08, ease: 'expo.out', delay: 0.15
    });
    gsap.from(['.small-tag', '.services-list li', '.hero-quick-links a', '.bottom-footer > div'], {
      opacity: 0, y: 18, duration: 0.9, stagger: 0.03, ease: 'power3.out', delay: 0.5
    });
    gsap.from('.bottom-ui-container', { opacity: 0, duration: 1, ease: 'power2.out', delay: 0.9 });

    // escala base: dá folga para o vídeo deslizar sem mostrar as bordas
    gsap.set('.hero-video', { scale: 1.1 });

    // saída: o hero encolhe e a máscara escura sobe
    const mask = $('.dark-wrapper-mask');
    if (mask) {
      gsap.timeline({
        scrollTrigger: {
          trigger: '.scroll-track', start: 'top top',
          end: '+=100%', scrub: true
        }
      })
        .to('.overlay-ui, .bottom-ui-container, .scroll-down', { opacity: 0, ease: 'none' }, 0)
        .to('.hero-video', { scale: 1.22, ease: 'none' }, 0)
        .to(mask, { clipPath: 'inset(0% 0 0 0)', ease: 'none' }, 0.25);
    }
  }

  /* ============ 1b. PARALLAX DO VÍDEO ============
     o vídeo desliza devagar na direção contrária ao cursor */
  function initHeroFx() {
    const hero  = $('.hero-section');
    const video = $('.hero-video');
    if (!hero || !video || reduce || matchMedia('(pointer: coarse)').matches) return;

    const AMPLITUDE = 34;     // quanto o vídeo anda, em px
    const EASE_VIDEO = 0.035; // bem lento = bem fluido

    let mx = innerWidth / 2, my = innerHeight / 2;
    let vx = 0, vy = 0;

    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    }, { passive: true });

    gsap.ticker.add(() => {
      const r = hero.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;   // fora da tela: não gasta frame

      const nx = (mx / r.width - 0.5) * 2;               // -1 a 1
      const ny = (my / r.height - 0.5) * 2;

      // sentido contrário ao cursor dá sensação de profundidade
      vx += (-nx * AMPLITUDE - vx) * EASE_VIDEO;
      vy += (-ny * AMPLITUDE * 0.6 - vy) * EASE_VIDEO;
      gsap.set(video, { x: vx, y: vy });
    });
  }

  /* ============ 1c. MALHA DE CRUZES (X GRID) ============
     Grade de marcas em X sobre o vídeo. A proximidade do ponteiro
     acende as marcas e desenha linhas entre as vizinhas acesas.
     Em repouso, uma onda senoidal percorre a grade de leve. */
  function initHeroGrid() {
    const hero   = $('.hero-section');
    const canvas = $('.hero-grid');
    if (!hero || !canvas || reduce) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* ---- ajuste fino ---- */
    const SPACING = 20;    // distância entre as marcas
    const RADIUS  = 340;   // alcance da influência do ponteiro
    const BASE_A  = 0.13;  // brilho das marcas em repouso
    const PEAK_A  = 0.92;  // brilho das marcas acesas
    const RGB     = '255,255,255';

    let marks = [], grid = [], cw = 0, ch = 0;
    let mx = -99999, my = -99999;
    let raf = 0, visible = true;
    const t0 = performance.now();

    function build() {
      const dpr  = Math.min(devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      cw = rect.width; ch = rect.height;
      if (!cw || !ch) return;

      canvas.width  = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      marks = []; grid = [];
      const cols = Math.floor(cw / SPACING) + 2;
      const rows = Math.floor(ch / SPACING) + 2;
      const ox = (cw % SPACING) / 2;
      const oy = (ch % SPACING) / 2;

      for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
          const m = { x: ox + c * SPACING, y: oy + r * SPACING, b: 0, col: c, row: r };
          marks.push(m); grid[r][c] = m;
        }
      }
    }

    function frame() {
      raf = requestAnimationFrame(frame);
      if (!visible || !cw) return;

      ctx.clearRect(0, 0, cw, ch);
      const r2 = RADIUS * RADIUS;
      const t = (performance.now() - t0) / 1000;

      /* As marcas são agrupadas por opacidade/espessura e desenhadas em
         lote com Path2D. Sem isso seriam ~5 mil trocas de estado por frame. */
      const buckets = new Map();

      for (let i = 0; i < marks.length; i++) {
        const d = marks[i];
        const dx = d.x - mx, dy = d.y - my;
        const dist2 = dx * dx + dy * dy;
        const tgt = dist2 < r2 ? Math.pow(1 - Math.sqrt(dist2) / RADIUS, 1.5) : 0;

        d.b += (tgt > d.b ? 0.16 : 0.05) * (tgt - d.b);
        if (d.b < 0.004) d.b = 0;

        const arm = 2 + d.b;
        const sw  = 0.5 + d.b * 0.3;
        const wave = Math.sin(d.col * 0.3 + d.row * 0.3 - t * 0.5);
        const resting = BASE_A * (1 + wave * 0.3);
        const alpha = resting + (PEAK_A - resting) * d.b;

        const key = (alpha * 60 | 0) * 100 + (sw * 20 | 0);
        let bk = buckets.get(key);
        if (!bk) { bk = { p: new Path2D(), a: alpha, w: sw }; buckets.set(key, bk); }

        bk.p.moveTo(d.x - arm, d.y - arm); bk.p.lineTo(d.x + arm, d.y + arm);
        bk.p.moveTo(d.x + arm, d.y - arm); bk.p.lineTo(d.x - arm, d.y + arm);
      }

      buckets.forEach(bk => {
        ctx.strokeStyle = `rgba(${RGB},${bk.a.toFixed(2)})`;
        ctx.lineWidth = bk.w;
        ctx.stroke(bk.p);
      });

      /* linhas ligando as vizinhas acesas */
      ctx.lineWidth = 0.5;
      const lines = new Map();
      for (let i = 0; i < marks.length; i++) {
        const d = marks[i];
        if (d.b < 0.05) continue;
        const row = grid[d.row], next = grid[d.row + 1];
        const nb = [row && row[d.col + 1], next && next[d.col],
                    next && next[d.col + 1], next && next[d.col - 1]];
        for (let k = 0; k < 4; k++) {
          const n = nb[k];
          if (!n || n.b < 0.05) continue;
          const a = Math.min(d.b, n.b) * 0.4;
          const key = a * 60 | 0;
          let p = lines.get(key);
          if (!p) { p = { p: new Path2D(), a }; lines.set(key, p); }
          p.p.moveTo(d.x, d.y); p.p.lineTo(n.x, n.y);
        }
      }
      lines.forEach(l => {
        ctx.strokeStyle = `rgba(${RGB},${l.a.toFixed(2)})`;
        ctx.stroke(l.p);
      });
    }

    hero.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    }, { passive: true });

    hero.addEventListener('pointerleave', () => { mx = my = -99999; });
    hero.addEventListener('touchmove', e => {
      const tch = e.touches[0]; if (!tch) return;
      const r = canvas.getBoundingClientRect();
      mx = tch.clientX - r.left; my = tch.clientY - r.top;
    }, { passive: true });
    hero.addEventListener('touchend', () => { mx = my = -99999; });

    // não gasta frame quando o hero sai da tela
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; })
        .observe(hero);
    }

    if ('ResizeObserver' in window) new ResizeObserver(build).observe(hero);
    else addEventListener('resize', build);

    build();
    frame();
    requestAnimationFrame(() => canvas.classList.add('is-ready'));
  }

  /* ============ 1d. FRASES DO HERO ============
     A frase central troca sozinha, na mesma tipografia do site.
     Sai por cima com máscara, a próxima entra por baixo. */
  function initHeroPhrases() {
    const h1 = $('.hero-claim h1');
    const list = S.heroPhrases;
    if (!h1 || !Array.isArray(list) || list.length < 2) return;

    h1.innerHTML = `<span>${list[0]}</span>`;
    if (reduce) return;

    const hold = (S.heroPhraseHold || 4200) / 1000;
    let i = 0, tl = null;

    /* setInterval continuava disparando com a aba em segundo plano enquanto
       o GSAP ficava pausado — na volta várias trocas rodavam de uma vez e as
       frases se acumulavam. gsap.delayedCall segue o mesmo relógio da
       animação, então uma troca só começa quando a anterior termina. */
    function swap() {
      if (tl) tl.kill();

      // sobra qualquer resto de uma troca interrompida
      const spans = [...h1.children];
      const out = spans.pop();
      spans.forEach(s => s.remove());

      i = (i + 1) % list.length;
      const next = document.createElement('span');
      next.innerHTML = list[i];
      h1.appendChild(next);

      tl = gsap.timeline({
        onComplete: () => {
          if (out) out.remove();
          gsap.delayedCall(hold, swap);
        }
      });
      if (out) tl.to(out, { yPercent: -60, opacity: 0, duration: 0.55, ease: 'power2.in' }, 0);
      tl.fromTo(next,
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out' }, 0.25);
    }

    gsap.delayedCall(hold, swap);
  }

  /* ============ 2. CONTADOR DE SLIDES ============ */
  function initSlides() {
    const cur   = $('.current-slide');
    const total = $('.total-slides');
    const title = $('.slide-title');
    const prev  = $('.prev-slide');
    const next  = $('.next-slide');
    if (!cur || !title) return;

    const slides = S.heroSlides;
    let i = 0;
    total.textContent = String(slides.length).padStart(2, '0');

    function render(dir) {
      cur.textContent = String(i + 1).padStart(2, '0');
      gsap.timeline()
        .to(title, { yPercent: dir > 0 ? -110 : 110, opacity: 0, duration: 0.3, ease: 'power2.in' })
        .add(() => { title.textContent = slides[i]; })
        .fromTo(title,
          { yPercent: dir > 0 ? 110 : -110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.5, ease: 'expo.out' });
    }

    const go = d => { i = (i + d + slides.length) % slides.length; render(d); };
    next && next.addEventListener('click', () => go(1));
    prev && prev.addEventListener('click', () => go(-1));

    cur.textContent = '01';
    title.textContent = slides[0];
    if (!reduce) setInterval(() => go(1), 5200);
  }

  /* ============ 3. LOGO MATRICIAL ============ */
  function buildMark() {
    const mark = $('.stm-mark');
    if (!mark) return [];
    const letters = (S.markLetters || S.brand).toUpperCase().split('');
    const dots = [];
    mark.innerHTML = '';

    letters.forEach(ch => {
      const rows = FONT[ch] || FONT[' '];
      const wrap = document.createElement('div');
      wrap.className = 'stm-letter';
      rows.forEach(row => {
        row.split('').forEach(bit => {
          const d = document.createElement('i');
          d.className = 'stm-dot';
          if (bit === '0') d.style.visibility = 'hidden';
          else dots.push(d);
          wrap.appendChild(d);
        });
      });
      mark.appendChild(wrap);
    });
    return dots;
  }

  function initMark() {
    const dots = buildMark();
    if (!dots.length) return;
    // embaralha para os pontos acenderem em ordem aleatória
    const shuffled = [...dots].sort(() => Math.random() - 0.5);

    gsap.to(shuffled, {
      opacity: 1, scale: 1, ease: 'none',
      stagger: { each: 0.5 / shuffled.length },
      scrollTrigger: {
        trigger: '.stm-section',
        start: 'top bottom', end: 'center center', scrub: 0.6
      }
    });

    // ao sair da seção, os pontos apagam
    gsap.to('.stm-mark', {
      opacity: 0, scale: 0.9, ease: 'none',
      scrollTrigger: { trigger: '.stm-section', start: 'bottom 75%', end: 'bottom 30%', scrub: true }
    });
  }

  /* ============ 4. COLUNAS DE CAPACIDADES ============ */
  function initStm() {
    const wrapL = $('.stm-col--left');
    const wrapR = $('.stm-col--right');
    if (!wrapL || !wrapR) return;

    const fill = (wrap, items) => {
      if (!wrap || !items) return;
      wrap.innerHTML = items.map(t => `
        <div class="stm-group"><h3>${t}</h3></div>`).join('');
    };
    fill(wrapL, S.capabilitiesLeft);
    fill(wrapR, S.capabilitiesRight);

    // cada linha acende ao cruzar o centro da tela
    $$('.stm-group').forEach(g => {
      ScrollTrigger.create({
        trigger: g, start: 'top 62%', end: 'bottom 38%',
        onToggle: self => g.classList.toggle('is-lit', self.isActive)
      });
      gsap.fromTo(g,
        { x: g.closest('.stm-col--right') ? 60 : -60, opacity: 0.25 },
        { x: 0, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: g, start: 'top bottom', end: 'top 45%', scrub: true } });
    });
  }

  /* ============ 4b. FRASES FIXAS NO CENTRO DO VÍDEO ============
     Ficam paradas no meio da tela e trocam conforme o scroll avança
     pela seção — entram por baixo, saem por cima. */
  function initVscrollMid() {
    const mid = $('.vscroll__mid');
    const host = mid && mid.closest('.vscroll');
    const caps = S.vscrollCaptions;
    if (!mid || !host || !Array.isArray(caps) || !caps.length) return;

    mid.innerHTML = caps.map(c => `
      <div class="vscroll__cap">${c.t}${c.sub ? `<small>${c.sub}</small>` : ''}</div>`).join('');

    const els = $$('.vscroll__cap', mid);
    const step = 100 / els.length;   // fatia do scroll de cada frase

    els.forEach((el, i) => {
      const from = i * step;
      // entra
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, ease: 'power2.out',
          scrollTrigger: {
            trigger: host, scrub: true,
            start: `top+=${from}% top`,
            end:   `top+=${from + step * 0.28}% top`
          }
        });
      // sai
      gsap.to(el, {
        opacity: 0, y: -40, ease: 'power2.in',
        scrollTrigger: {
          trigger: host, scrub: true,
          start: `top+=${from + step * 0.72}% top`,
          end:   `top+=${from + step}% top`
        }
      });
    });
  }

  /* ============ 5. GALERIA EM ANEL (Three.js) ============ */
  function initRing() {
    const host = $('#sketch');
    if (!host || typeof THREE === 'undefined' || reduce) return;

    const W = () => host.clientWidth;
    const H = () => host.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W() / H(), 0.1, 100);
    // a posição é ajustada logo abaixo, quando o raio do anel é calculado

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W(), H());
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    /* Os planos são 16:9, na mesma proporção das capas.
       A textura é ajustada em "cover" (recorta em vez de esticar),
       para qualquer imagem que você suba pelo CMS entrar sem deformar. */
    const PLANE_W = 3.9;
    const PLANE_H = PLANE_W * 9 / 16;
    const PLANE_RATIO = PLANE_W / PLANE_H;

    // o anel usa o catálogo completo, não só os destaques da home
    const pool = (S.allWorks && S.allWorks.length ? S.allWorks : S.works);
    const COUNT = Math.min(Math.max(pool.length, 8), 12);
    // raio calculado para os planos não se sobreporem
    const RADIUS = (COUNT * PLANE_W * 1.18) / (Math.PI * 2);
    // distância da câmera: menor = close maior. Levantada, o anel desce na tela.
    camera.position.set(0, 0.55, RADIUS + 6.2);
    camera.lookAt(0, 0, 0);
    const loader = new THREE.TextureLoader();
    const planes = [];

    /* recorte tipo object-fit: cover */
    function coverTexture(tex) {
      const img = tex.image;
      if (!img || !img.width || !img.height) return;
      const imgRatio = img.width / img.height;
      if (imgRatio > PLANE_RATIO) {
        const r = PLANE_RATIO / imgRatio;
        tex.repeat.set(r, 1);
        tex.offset.set((1 - r) / 2, 0);
      } else {
        const r = imgRatio / PLANE_RATIO;
        tex.repeat.set(1, r);
        tex.offset.set(0, (1 - r) / 2);
      }
    }

    for (let i = 0; i < COUNT; i++) {
      const src = pool[i % pool.length].img;
      const geo = new THREE.PlaneGeometry(PLANE_W, PLANE_H, 12, 12);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x777777, transparent: true, opacity: 0.92, side: THREE.DoubleSide
      });
      loader.load(src,
        tex => {
          tex.minFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
          coverTexture(tex);
          mat.map = tex; mat.color.set(0xffffff); mat.needsUpdate = true;
        },
        undefined,
        () => {} // sem imagem ainda: fica o plano cinza
      );
      const mesh = new THREE.Mesh(geo, mat);
      const a = (i / COUNT) * Math.PI * 2;
      mesh.position.set(Math.sin(a) * RADIUS, 0, Math.cos(a) * RADIUS);
      mesh.rotation.y = a;
      mesh.userData.src = src;
      mesh.userData.title = (pool[i % pool.length].title || '');
      group.add(mesh);
      planes.push(mesh);
    }

    // rotação contínua + rotação por scroll
    let auto = 0, speed = 0.0016, targetSpeed = 0.0016;
    /* O giro do scroll é guardado como ALVO e perseguido devagar.
       Antes eu aplicava a posição do scroll direto na rotação: enquanto
       você rolava ele disparava junto com o dedo e, ao parar, caía de
       repente para a velocidade automática. Daí a sensação de
       "rápido demais e depois lento". */
    let scrollRot = 0, scrollRotTarget = 0;
    ScrollTrigger.create({
      trigger: '.ccap-section', start: 'top bottom', end: 'bottom top',
      onUpdate: self => { scrollRotTarget = self.progress * Math.PI * 0.35; }
    });

    /* ---- passar o mouse acelera o giro ---- */
    const canvasEl = renderer.domElement;
    canvasEl.style.cursor = 'pointer';
    if (matchMedia('(hover: hover)').matches) {
      // com o mouse em cima ele desacelera, para você conseguir olhar
      canvasEl.addEventListener('mouseenter', () => { targetSpeed = 0.0002; });
      canvasEl.addEventListener('mouseleave', () => { targetSpeed = 0.0016; });
    }

    function render() {
      speed += (targetSpeed - speed) * 0.05;              // acelera e freia macio
      scrollRot += (scrollRotTarget - scrollRot) * 0.055; // persegue o scroll sem grudar nele
      auto += speed;
      group.rotation.y = auto + scrollRot;
      planes.forEach((p, i) => {
        p.position.y = Math.sin(auto * 2 + i) * 0.16;
      });
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    render();

    /* ---- clicar numa imagem abre em tela cheia ---- */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let down = null;

    canvasEl.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
    canvasEl.addEventListener('pointerup', e => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 8) return;                   // foi arrasto, não clique

      const r = canvasEl.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(planes)[0];
      if (hit) openLightbox(hit.object.userData.src, hit.object.userData.title);
    });

    addEventListener('resize', () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    });
  }

  /* ============ 5b. VISUALIZADOR EM TELA CHEIA ============ */
  let lb = null;
  function openLightbox(src, title) {
    if (!src) return;
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.innerHTML = `
        <button class="lightbox__close" aria-label="Fechar">&times;</button>
        <figure class="lightbox__fig">
          <img alt="">
          <figcaption></figcaption>
        </figure>`;
      document.body.appendChild(lb);

      const hide = () => {
        lb.classList.remove('is-on');
        document.body.classList.remove('is-locked');
        window.lenis && window.lenis.start();
      };
      lb.addEventListener('click', hide);          // clicar de novo fecha
      addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
    }

    $('img', lb).src = src;
    $('img', lb).alt = title || '';
    $('figcaption', lb).textContent = title || '';
    lb.classList.add('is-on');
    document.body.classList.add('is-locked');
    window.lenis && window.lenis.stop();
  }

  /* ============ 6. GALERIA DE PROJETOS ============ */
  function initGallery() {
    const grid = $('.pg-gallery');
    if (grid) {
      grid.innerHTML = S.works.map((w, i) => `
        <div class="pg-item pg-item-${i + 1}">
          <a href="${w.url}" data-cursor="ver projeto">
            <div class="pg-img-wrap">
              <img src="${w.img}" alt="${w.title}" loading="lazy">
            </div>
            <div class="pg-meta">
              <div>
                <div class="pg-title">${w.title}</div>
                <div class="pg-tag">${w.tag}</div>
              </div>
              <div class="pg-index">${String(i + 1).padStart(2, '0')}</div>
            </div>
          </a>
        </div>`).join('');
    }

    // parallax dentro da moldura + entrada com máscara
    $$('.pg-img-wrap').forEach(wrap => {
      const img = $('img', wrap);
      if (!img) return;
      gsap.fromTo(img, { yPercent: -8 }, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true }
      });
      gsap.from(wrap, {
        clipPath: 'inset(100% 0 0 0)', duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: wrap, start: 'top 85%', once: true }
      });
    });
  }

  /* ============ 7. NÚMEROS ============ */
  function initStats() {
    const host = $('.stats');
    if (!host) return;
    host.innerHTML = S.stats.map(s => `
      <div class="stat" data-fade>
        <div class="stat__num" data-scramble>${s.num}</div>
        <div class="stat__label">${s.label}</div>
      </div>`).join('');
  }

  /* ============ BOOT ============ */
  async function boot() {
    // espera o CMS responder antes de montar (cai no config.js se a API falhar)
    if (window.CMS_READY) { try { await window.CMS_READY; } catch (e) {} }
    initStats();
    initGallery();
    initStm();
    initVscrollMid();
    initMark();
    initHero();
    initHeroFx();
    initHeroGrid();
    initHeroPhrases();
    initSlides();
    initRing();
    // religa cursor / scramble / reveal no conteúdo que acabou de ser injetado
    window.SiteCore && window.SiteCore.rescan();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
