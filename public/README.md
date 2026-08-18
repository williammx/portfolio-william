# Portfólio — reconstrução do NUDOT

Site em **HTML + CSS + JavaScript puro**, sem build. Roda em qualquer hospedagem estática
(Vercel, Netlify, GitHub Pages, Hostinger, cPanel — é só subir a pasta).

---

## Como rodar

Abrir o `index.html` direto no navegador **não funciona bem** (os vídeos e o `fetch` de
texturas quebram no protocolo `file://`). Suba um servidor local:

```bash
# Python (já vem no Mac/Linux; no Windows instale pelo python.org)
python -m http.server 8000

# ou Node
npx serve .
```

Depois acesse `http://localhost:8000`.

---

## Estrutura

```
portfolio/
├── index.html          Home (hero sticky, logo matricial, anel 3D, projetos)
├── work.html           Lista de projetos com preview no hover
├── about.html          Bio, skills e trajetória
├── contact.html        Dados de contato + formulário
├── css/
│   ├── base.css        Reset, design tokens, tipografia
│   ├── layout.css      Loader, transições, cursor, grain, nav, menu, footer
│   ├── home.css        Seções da home
│   ├── pages.css       Work, About, Contact
│   └── sections.css    Os 10 módulos animados
├── js/
│   ├── config.js       ⚠️  O ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR
│   ├── core.js         Chrome global (compartilhado por todas as páginas)
│   ├── home.js         Animações da home
│   ├── pages.js        Comportamento das páginas internas
│   └── sections.js     Os 10 módulos animados
├── images/             Imagens (placeholders — troque pelas suas)
└── media/              Vídeos de fundo (opcional)
```

---

## Personalizar

**Tudo que é texto, link e projeto está em `js/config.js`.** Edite lá e o site inteiro
se atualiza — as quatro páginas leem do mesmo objeto.

```js
window.SITE = {
  brand: "CAMPELO",              // marca curta (nav, loader, footer)
  markLetters: "CAMPELO",        // letras do logo matricial que monta no scroll
  email: "seu@email.com",
  works: [ { title, tag, url, img }, ... ],
  ...
}
```

### Trocar as imagens

Substitua os arquivos em `images/` mantendo os nomes (`work-01.jpg` … `work-06.jpg`,
`footer-bg.jpg`, `about.jpg`), ou aponte outros caminhos no `config.js`.
Proporção recomendada: **4:5** (retrato) para os projetos.

### Vídeos de fundo

Vêm **desligados** por padrão — o fundo é um gradiente animado em CSS.
Para usar vídeo, coloque o arquivo em `media/` e aponte no config:

```js
heroVideo: "media/hero.mp4",
loaderVideo: "media/loading.mp4",
galleryVideo: "media/gallery.mp4",
```

Use MP4 (H.264), sem áudio, comprimido (< 3 MB) — ele carrega em loop.

### Adicionar mais projetos

É só acrescentar itens no array `works` do config. A home mostra os 6 primeiros no grid
escalonado; a página `work.html` lista todos automaticamente, com filtro por categoria.
Para passar de 6 na home, adicione as regras `.pg-item-7`, `.pg-item-8` … em `css/home.css`.

---

## O que foi reconstruído do original

| Efeito | Como está implementado |
|---|---|
| Loader com contador e reveal da marca | GSAP timeline (`core.js`) |
| Transição entre páginas (cortina) | Curtain com custom properties + GSAP |
| Scroll suave | Lenis 1.0.42 |
| Cursor customizado (ponto + anel + rastro) | 14 elementos com lerp por `gsap.ticker` |
| Film grain animado | Canvas 2D, 4 frames pré-gerados em loop |
| Hero sticky com saída mascarada | `position: sticky` + `clip-path` no scrub |
| Logo matricial montando no scroll | Fonte bitmap 3×5 própria (A–Z) + stagger aleatório |
| Colunas de capacidades que acendem | ScrollTrigger `onToggle` por linha |
| Galeria em anel 3D | Three.js r128 — planos em círculo, rotação por scroll |
| Grid de projetos escalonado | CSS Grid 12 colunas + parallax e reveal por `clip-path` |
| Marquee infinito | GSAP com `modifiers` (loop sem salto) |
| Parallax do footer | ScrollTrigger scrub |
| Scramble de texto | Implementação própria (o plugin oficial da GSAP é pago) |

**Stack idêntica ao original:** GSAP 3.12.2 + ScrollTrigger, Lenis 1.0.42, Three.js r128,
todos via CDN. Design tokens (cores, escala tipográfica, tracking) extraídos do site real.

---

## Módulos animados (inspirados em juanmora.co e trionn.com)

Tudo em `css/sections.css` + `js/sections.js`, alimentado pelo `config.js`.
Cada módulo só roda se o container existir na página — para mover um de página,
basta recortar o bloco HTML e colar em outra.

| Módulo | Onde está | Animação |
|---|---|---|
| Manifesto | Home | Texto pinado; cada palavra acende conforme o scroll |
| Serviços em acordeão | Home | Abre/fecha com altura animada, título desliza, miniatura |
| Números (odômetro) | Home | Cada dígito é um carretel 0–9 que rola até o alvo |
| Processo em 4 etapas | Home | Coluna fixa + trilho de progresso que preenche no scroll |
| CTA final | Home · Projetos · Sobre | Entrada escalonada + botão magnético que segue o mouse |
| Galeria horizontal | Projetos | Seção pinada; scroll vertical vira movimento horizontal |
| Depoimentos | Projetos | Carrossel arrastável com inércia (pointer events) |
| Por que trabalhar comigo | Sobre | Título revelando linha a linha + razões escalonadas |
| Clientes | Sobre | Marquee infinito; nome acende no hover |
| FAQ | Contato | Acordeão com ícone + → × |

Para editar qualquer conteúdo desses módulos, procure no `config.js` as chaves
`manifesto`, `servicesDetailed`, `stats`, `process`, `benefits`, `testimonials`,
`clients`, `faq` e `ctaTitle`.

**Fontes:** DM Sans, Zalando Sans SemiExpanded e Bitcount Grid Single — as mesmas do
original, servidas pelo Google Fonts. O original também usava um kit Typekit; se quiser
fidelidade total à tipografia paga, precisará da sua própria licença Adobe Fonts.

---

## Antes de publicar

- [ ] Editar `js/config.js` com seus dados reais
- [ ] Trocar as imagens em `images/`
- [ ] Trocar `images/og.jpg` (preview de compartilhamento, 1200×630)
- [ ] Ajustar `<title>` e `<meta name="description">` de cada página
- [ ] Adicionar um `favicon.ico` na raiz
- [ ] Conferir os links das redes sociais no config
- [ ] Se quiser formulário real (sem abrir o app de e-mail), plugar Formspree,
      Web3Forms ou Netlify Forms no `<form class="form">` do `contact.html`

---

## Compatibilidade

Chrome, Edge, Firefox e Safari atuais. `prefers-reduced-motion` é respeitado —
quem tem animação reduzida no sistema recebe a versão sem movimento.
