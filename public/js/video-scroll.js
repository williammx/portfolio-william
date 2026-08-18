/* ============================================================
   VÍDEO EM SCROLL — sequência de frames em canvas
   O scroll controla qual frame aparece. É a técnica que a Apple usa
   nas páginas de produto: fluidez total e funciona no iPhone, onde
   controlar o currentTime de um <video> engasga.

   Cada seção .vscroll aponta para a própria pasta de frames pelo
   atributo data-frames (padrão: "frames").

   Gerar os frames:
     npm run frames -- public/media/seu-video.mp4 --out frames2
   ============================================================ */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.vscroll').forEach(setup);

  function setup(host) {
    const canvas = host.querySelector('.vscroll__canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    const status = host.querySelector('.vscroll__status');
    const DIR = host.dataset.frames || 'frames';

    let frames = [], total = 0, loaded = 0, current = -1, ready = false;

    /* ---------- carregamento ---------- */
    async function init() {
      let manifest;
      try {
        // 'no-cache' revalida sempre. Com 'force-cache' o navegador guardava
        // o 404 de quando os frames ainda não existiam e nunca mais
        // consultava o servidor — nem com recarga forçada.
        const res = await fetch(`${DIR}/manifest.json`, { cache: 'no-cache' });
        if (!res.ok) throw new Error('manifest ' + res.status);
        manifest = await res.json();
        if (!manifest || !manifest.count) throw new Error('manifest vazio');
      } catch (err) {
        // sem frames: a seção some por completo, sem deixar buraco
        console.warn(`[vscroll:${DIR}] frames indisponíveis —`, err.message);
        host.classList.add('is-empty');
        if (status) status.textContent = `Sem frames em /${DIR}`;
        return false;
      }

      total = manifest.count;
      const pad = manifest.pad || 4;
      const ext = manifest.ext || 'webp';
      frames = new Array(total);

      // primeiro 1 de cada 8 para a animação já responder,
      // depois preenche o resto em segundo plano
      const order = [];
      for (let s = 8; s >= 1; s = Math.floor(s / 2)) {
        for (let i = 0; i < total; i += s) if (!order.includes(i)) order.push(i);
        if (s === 1) break;
      }

      let firstDrawn = false;
      const onLoaded = (i, img) => {
        if (img._done) return;          // não conta duas vezes (cache + onload)
        img._done = true;
        frames[i] = img;
        loaded++;
        if (!firstDrawn) {
          firstDrawn = true; ready = true;
          resize(); draw(0);
          host.classList.add('is-ready');
        }
        if (loaded >= total && status) status.textContent = '';
      };

      for (let k = 0; k < order.length; k++) {
        const i = order[k];
        const img = new Image();
        img.decoding = 'async';
        // handlers ANTES do src: com a imagem em cache o load dispara na hora
        img.onload = () => onLoaded(i, img);
        img.onerror = () => { loaded++; };
        img.src = `${DIR}/${String(i + 1).padStart(pad, '0')}.${ext}`;
        if (img.complete && img.naturalWidth) onLoaded(i, img);
        if (k % 12 === 11) await new Promise(r => setTimeout(r, 0));
      }
      return true;
    }

    /* ---------- desenho ---------- */
    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = host.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      canvas.style.width = r.width + 'px';
      canvas.style.height = innerHeight + 'px';
      current = -1;
      draw(lastProgress);
    }

    function nearest(i) {
      if (frames[i]) return frames[i];
      for (let d = 1; d < 24; d++) {
        if (frames[i - d]) return frames[i - d];
        if (frames[i + d]) return frames[i + d];
      }
      return null;
    }

    let lastProgress = 0;

    function paint(img) {
      // cover: preenche a tela mantendo a proporção
      const cw = canvas.width, ch = canvas.height;
      const scale = Math.max(cw / img.width, ch / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    }

    function draw(p) {
      if (!ready) return;
      lastProgress = p;
      // um frame por vez. Misturar dois deixava fantasma na imagem.
      const i = Math.max(0, Math.min(total - 1, Math.round(p * (total - 1))));
      if (i === current) return;
      const img = nearest(i);
      if (!img) return;
      current = i;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      paint(img);
    }

    /* ---------- scroll ---------- */
    function bind(ok) {
      if (!ok || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

      ScrollTrigger.create({
        trigger: host,
        // começa assim que a seção aparece, sem espera parada
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: self => draw(reduce ? 0 : self.progress)
      });

      /* entra bem apagado e vai ganhando corpo — dá uma mescla com
         a seção de cima em vez de trocar de tela na marra */
      if (!reduce) {
        gsap.fromTo(canvas,
          { opacity: 0.12 },
          {
            opacity: 1, ease: 'none',
            scrollTrigger: {
              trigger: host, scrub: true,
              start: 'top bottom', end: 'top 20%'
            }
          });
      }

      addEventListener('resize', () => { resize(); ScrollTrigger.refresh(); });
    }

    init().then(bind);
  }
})();
