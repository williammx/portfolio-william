/* ============================================================
   CONFIG — ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR
   Troque os valores abaixo pelos seus dados e o site inteiro
   (todas as páginas) se atualiza.
   ============================================================ */

window.SITE = {
  /* ---------- identidade ---------- */
  brand: "WILLIAM",              // marca curta, aparece na nav e no loader
  brandFull: "William",          // nome por extenso (ex.: "William Campelo")
  role: "Motion Designer & Designer Web",
  tagline: "Estratégia, design e desenvolvimento.",
  year: "2026",
  city: "Rio de Janeiro, RJ",

  /* letras do logo matricial que se monta no scroll (3x5 dots por letra)
     Máx. recomendado: 8 letras. Só A–Z e espaço. */
  markLetters: "WILLIAM",

  /* ---------- contato ---------- */
  email: "supremoesportesmt@gmail.com",
  phone: "+55 (21) 90000-0000",
  socials: [
    { label: "Instagram", url: "#" },
    { label: "Behance",   url: "#" },
    { label: "LinkedIn",  url: "#" },
    { label: "GitHub",    url: "#" }
  ],

  /* ---------- serviços (hero) ---------- */
  servicesPt: [
    "Branding", "Identidade visual", "Direção criativa",
    "Motion design", "Landing pages", "Social media", "Design de interface"
  ],
  servicesEn: [
    "Branding", "Visual Identity", "Creative Direction",
    "Motion Design", "Landing Pages", "Social Media", "UI Design"
  ],

  /* ---------- frases que se alternam no centro do hero ----------
     Mesma tipografia do resto do site. Use <br> para quebrar linha. */
  heroPhrases: [
    "Estratégia, design<br>e desenvolvimento",
    "Marca que fica<br>na memória",
    "Movimento que<br>vende",
    "Feito à mão,<br>no código"
  ],
  heroPhraseHold: 4200,   // ms que cada frase fica na tela

  /* ---------- carrossel do hero ---------- */
  heroSeries: "SÉRIE COSMIC",
  heroSlides: [
    "Harmonia Cósmica",
    "Camada Fluida",
    "Ruído Estático",
    "Deriva Orbital",
    "Núcleo Profundo"
  ],

  /* ---------- capacidades (faixa STM) ---------- */
  capabilitiesLeft: [
    "Branding", "Identidade Visual", "Direção Criativa", "Motion Design",
    "Landing Pages", "Social Media", "Design de Interface", "Site Institucional",
    "Animação 2D", "Visual Gen-AI", "Pixel Perfect", "Arte Digital"
  ],
  capabilitiesRight: [
    "Estratégia", "Design", "Movimento", "Criação", "Marca", "Conteúdo",
    "Conversão", "Tecnologia", "Sistema", "Visão", "Futuro", "Ofício"
  ],
  /* frases fixas no centro do vídeo, trocando conforme o scroll.
     'sub' é opcional e aparece menor embaixo. */
  vscrollCaptions: [
    { t: "Conceito", sub: "Antes do pixel, a ideia que sustenta tudo." },
    { t: "Ritmo",    sub: "Pausa, respiro e corte — movimento é edição." },
    { t: "Acabamento", sub: "O que separa bonito de memorável." },
    { t: "Impacto",  sub: "Design que o cliente lembra depois de fechar a aba." }
  ],

  /* ---------- tags do anel 3D ---------- */
  ringTitle: "Redefinindo o pensamento visual da marca",
  ringSub: "Protegendo o núcleo estético, definindo o ponto digital",
  ringTags: ["Branding", "Motion", "Landing Pages", "Social Media", "UI / UX"],

  /* ---------- projetos ---------- */
  worksLabel: "ARQUIVO DE TRABALHOS SELECIONADOS",
  worksTitle: ["Ponto de", "liberação da", "energia visual"],
  worksIntro: "Uma seleção de projetos onde estratégia, estética e código se encontram.",
  works: [
    { title: "Scope", tag: "Branding / Inteligência Geoespacial", url: "projeto.html?p=scope", slug: "scope", img: "images/work/scope/01.webp" },
    { title: "Fiveasy", tag: "Branding / Produto Digital", url: "projeto.html?p=fiveasy", slug: "fiveasy", img: "images/work/fiveasy/01.webp" },
    { title: "Bilhetou", tag: "Branding / Plataforma de Ingressos", url: "projeto.html?p=bilhetou", slug: "bilhetou", img: "images/work/bilhetou/01.webp" },
    { title: "Atrai", tag: "Branding / Marketing e Growth", url: "projeto.html?p=atrai", slug: "atrai", img: "images/work/atrai/01.webp" },
    { title: "Ágil", tag: "Branding / Logística", url: "projeto.html?p=agil", slug: "agil", img: "images/work/agil/01.webp" },
    { title: "Spark", tag: "Branding / Energia e Inovação", url: "projeto.html?p=spark", slug: "spark", img: "images/work/spark/01.webp" },
    { title: "Evolve Sales", tag: "Branding / Consultoria de Vendas", url: "projeto.html?p=evolve-sales", slug: "evolve-sales", img: "images/work/evolve-sales/01.webp" },
    { title: "Carsure", tag: "Branding / Seguros", url: "projeto.html?p=carsure", slug: "carsure", img: "images/work/carsure/01.webp" }
  ],

  allWorks: [
    { title: "Scope", tag: "Branding / Inteligência Geoespacial", url: "projeto.html?p=scope", slug: "scope", img: "images/work/scope/01.webp" },
    { title: "Fiveasy", tag: "Branding / Produto Digital", url: "projeto.html?p=fiveasy", slug: "fiveasy", img: "images/work/fiveasy/01.webp" },
    { title: "Bilhetou", tag: "Branding / Plataforma de Ingressos", url: "projeto.html?p=bilhetou", slug: "bilhetou", img: "images/work/bilhetou/01.webp" },
    { title: "Atrai", tag: "Branding / Marketing e Growth", url: "projeto.html?p=atrai", slug: "atrai", img: "images/work/atrai/01.webp" },
    { title: "Ágil", tag: "Branding / Logística", url: "projeto.html?p=agil", slug: "agil", img: "images/work/agil/01.webp" },
    { title: "Spark", tag: "Branding / Energia e Inovação", url: "projeto.html?p=spark", slug: "spark", img: "images/work/spark/01.webp" },
    { title: "Evolve Sales", tag: "Branding / Consultoria de Vendas", url: "projeto.html?p=evolve-sales", slug: "evolve-sales", img: "images/work/evolve-sales/01.webp" },
    { title: "Carsure", tag: "Branding / Seguros", url: "projeto.html?p=carsure", slug: "carsure", img: "images/work/carsure/01.webp" },
    { title: "Total Led", tag: "Branding / Iluminação Industrial", url: "projeto.html?p=total-led", slug: "total-led", img: "images/work/total-led/01.webp" },
    { title: "GBS", tag: "Branding / Distribuição", url: "projeto.html?p=gbs", slug: "gbs", img: "images/work/gbs/01.webp" },
    { title: "Vivamente", tag: "Branding / Saúde e Bem-estar", url: "projeto.html?p=vivamente", slug: "vivamente", img: "images/work/vivamente/01.webp" },
    { title: "Dani Molino", tag: "Branding / Marca Pessoal", url: "projeto.html?p=dani-molino", slug: "dani-molino", img: "images/work/dani-molino/01.webp" },
    { title: "Memórias que Ficam", tag: "Branding / Produto Editorial", url: "projeto.html?p=memorias-que-ficam", slug: "memorias-que-ficam", img: "images/work/memorias-que-ficam/01.webp" },
    { title: "Post Stenci", tag: "Social Media / Saúde", url: "projeto.html?p=post-stenci", slug: "post-stenci", img: "images/work/post-stenci/01.webp" },
    { title: "AppleSpace", tag: "Branding / Varejo de Tecnologia", url: "projeto.html?p=applespace", slug: "applespace", img: "images/work/applespace/01.webp" },
    { title: "Lava Jato", tag: "Branding / Estética Automotiva", url: "projeto.html?p=lava-jato", slug: "lava-jato", img: "images/work/lava-jato/01.webp" },
    { title: "Luz Casting", tag: "Branding / Audiovisual", url: "projeto.html?p=luz-casting", slug: "luz-casting", img: "images/work/luz-casting/01.webp" },
    { title: "JUSP 2025", tag: "Direção Criativa / Evento", url: "projeto.html?p=jusp-2025", slug: "jusp-2025", img: "images/work/jusp-2025/01.webp" },
    { title: "Shinkai Race", tag: "Direção Criativa / Automobilismo", url: "projeto.html?p=shinkairace", slug: "shinkairace", img: "images/work/shinkairace/01.webp" },
    { title: "Twinkfighter", tag: "Direção Criativa / Esports", url: "projeto.html?p=twinkfighter", slug: "twinkfighter", img: "images/work/twinkfighter/01.webp" },
    { title: "Star Games", tag: "Branding / Games", url: "projeto.html?p=star-games", slug: "star-games", img: "images/work/star-games/01.webp" },
    { title: "EVO", tag: "Direção Criativa / Cultura Automotiva", url: "projeto.html?p=evo", slug: "evo", img: "images/work/evo/01.webp" },
    { title: "GRP City", tag: "Direção Criativa / Comunidade", url: "projeto.html?p=grp-city", slug: "grp-city", img: "images/work/grp-city/01.webp" },
    { title: "Baixada", tag: "Direção Criativa / Comunidade", url: "projeto.html?p=baixada", slug: "baixada", img: "images/work/baixada/01.webp" },
    { title: "Barra", tag: "Branding / Streetwear", url: "projeto.html?p=barra", slug: "barra", img: "images/work/barra/01.webp" },
    { title: "Acalmarsi", tag: "Branding / Vestuário e Causa", url: "projeto.html?p=acalmarsi", slug: "acalmarsi", img: "images/work/acalmarsi/01.webp" },
    { title: "NOVA", tag: "Direção Criativa / Universo Digital", url: "projeto.html?p=nova", slug: "nova", img: "images/work/nova/01.webp" },
    { title: "Pousada Maya", tag: "Landing Page / Hospitalidade", url: "projeto.html?p=pousada-maya", slug: "pousada-maya", img: "images/work/pousada-maya/01.webp" },
    { title: "LP Programmer", tag: "Landing Page / Tecnologia", url: "projeto.html?p=lp-programmer", slug: "lp-programmer", img: "images/work/lp-programmer/01.webp" }
  ],

  /* ---------- números (odômetro) ----------
     'num' aceita dígitos + sufixo/prefixo. Ex.: "500+", "1.5K+", "90%" */
  statsLabel: "Números",
  statsIntro: "Um retrato da experiência e do impacto.",
  stats: [
    { num: "14",   label: "Anos de domínio visual" },
    { num: "400+", label: "Projetos entregues" },
    { num: "90%",  label: "Clientes que voltam para um segundo projeto" },
    { num: "100%", label: "Feito à mão, no código" }
  ],

  /* ---------- manifesto (revelação palavra a palavra) ---------- */
  manifestoLabel: "( manifesto )",
  manifesto:
    "Marca não é logo. É a soma de tudo que a pessoa sente antes de decidir. " +
    "Meu trabalho é controlar essa soma — no design, no movimento e no código.",

  /* ---------- serviços em acordeão ---------- */
  servicesLabel: "O que eu faço",
  servicesTitle: "Disciplinas diferentes. Um só padrão de acabamento.",
  servicesDetailed: [
    { title: "Branding",
      desc: "Identidade visual completa: logo, sistema de cores, tipografia e manual de uso. Sua marca com uma linguagem que ninguém confunde.",
      img: "images/work-01.jpg" },
    { title: "Direção criativa",
      desc: "Conceito, referência e direção de arte para campanhas e lançamentos. Eu defino o território visual e garanto que tudo saia no mesmo tom.",
      img: "images/work-05.jpg" },
    { title: "Motion design",
      desc: "Animação 2D, vinhetas, aberturas e microinterações. Movimento como linguagem, não como enfeite.",
      img: "images/work-02.jpg" },
    { title: "Landing pages",
      desc: "Páginas de conversão rápidas e bem escritas, do wireframe ao código. Feitas para vender, não só para impressionar.",
      img: "images/work-03.jpg" },
    { title: "Social media",
      desc: "Direção de conteúdo, feed, stories e reels. Templates editáveis para o time manter o padrão sem depender de mim.",
      img: "images/work-04.jpg" },
    { title: "Design de interface",
      desc: "UI e UX para produtos digitais, com design system escalável e entrega pronta para o time de desenvolvimento.",
      img: "images/work-06.jpg" }
  ],

  /* ---------- processo ---------- */
  processLabel: "Como eu trabalho",
  processTitle: "Quatro etapas, zero surpresa",
  process: [
    { step: "01", title: "Descoberta",
      desc: "Entendo o negócio, o público e o que trava a decisão de compra. Sem isso, design vira chute caro." },
    { step: "02", title: "Direção",
      desc: "Território visual, referências e conceito. Você aprova o rumo antes de eu gastar uma hora de execução." },
    { step: "03", title: "Execução",
      desc: "Design, movimento e código. Entregas parciais para você acompanhar e ajustar no caminho." },
    { step: "04", title: "Entrega",
      desc: "Arquivos organizados, manual de uso e handoff. Você sai com autonomia, não com dependência." }
  ],

  /* ---------- por que trabalhar comigo ---------- */
  benefitsLabel: "( por que eu )",
  benefitsTitle: ["Design bom", "leva tempo —", "e trabalhar comigo", "economiza o seu"],
  benefitsIntro: "Empresas me procuram pela perspectiva e pelo instinto afiado.",
  benefits: [
    "Trago uma direção visual premium que faz a marca se destacar de verdade.",
    "Cuido do acabamento, do conceito até a última peça entregue.",
    "Defino sistemas de design escaláveis que mantêm a marca consistente.",
    "Alinho os seus objetivos com a minha experiência para tomar as decisões certas."
  ],

  /* ---------- depoimentos ---------- */
  testimonialsLabel: "Depoimentos",
  testimonialsTitle: "Trabalho bom nasce de parceria.",
  testimonials: [
    { quote: "Entregou uma identidade que finalmente parece do tamanho da empresa. Recebemos elogio de cliente na primeira semana.",
      name: "Nome do Cliente", role: "CEO", company: "Empresa", tag: "Branding" },
    { quote: "A landing subiu numa quinta e no fim do mês a taxa de conversão tinha dobrado. Direto ao ponto, sem enrolação.",
      name: "Nome do Cliente", role: "Head de Marketing", company: "Empresa", tag: "Landing Page" },
    { quote: "O motion deu outro patamar para as campanhas. O feed inteiro passou a ter cara de marca grande.",
      name: "Nome do Cliente", role: "Sócia", company: "Empresa", tag: "Motion" },
    { quote: "Prazo cumprido, arquivo organizado e manual que o time consegue usar sozinho. Raro.",
      name: "Nome do Cliente", role: "Diretor de Arte", company: "Empresa", tag: "Design System" },
    { quote: "Já é o terceiro projeto junto. Não procuro mais ninguém para esse tipo de trabalho.",
      name: "Nome do Cliente", role: "Fundador", company: "Empresa", tag: "Direção Criativa" }
  ],

  /* ---------- clientes ---------- */
  clientsLabel: "Confiaram no trabalho",
  clients: ["Cliente Um", "Cliente Dois", "Cliente Três", "Cliente Quatro",
            "Cliente Cinco", "Cliente Seis", "Cliente Sete", "Cliente Oito"],

  /* ---------- perguntas frequentes ---------- */
  faqLabel: "Dúvidas comuns",
  faq: [
    { q: "Quanto custa um projeto?",
      a: "Depende do escopo. Identidade visual completa e landing page têm faixas bem diferentes. Me manda o que você precisa que eu devolvo um orçamento fechado, sem surpresa no meio do caminho." },
    { q: "Qual o prazo médio?",
      a: "Landing page: 2 a 3 semanas. Identidade visual: 4 a 6 semanas. Motion varia muito com a duração e a complexidade. Sempre combino o prazo antes de começar." },
    { q: "Você trabalha com contrato?",
      a: "Sempre. Contrato com escopo, prazo, número de revisões e forma de pagamento. Protege os dois lados." },
    { q: "Quantas revisões estão incluídas?",
      a: "Duas rodadas de ajuste em cada etapa. Como você aprova a direção antes da execução, na prática raramente chega a usar as duas." },
    { q: "Atende fora do Rio de Janeiro?",
      a: "Sim. A maior parte dos projetos é remota — reuniões por chamada e entregas online. Estar no Rio só ajuda quando o projeto pede presença." },
    { q: "O que você precisa de mim para começar?",
      a: "Um briefing simples: o que a empresa faz, quem é o público, o que já existe de material e uma referência do que você gosta. O resto eu puxo em conversa." }
  ],

  /* ---------- CTA final ---------- */
  ctaTitle: "Vamos construir algo que as pessoas lembrem",
  ctaSub: "De startup em começo de vida a empresa consolidada.",
  ctaButton: "Falar comigo",

  /* ---------- textos longos ---------- */
  footerBlurb:
    "Toda experiência digital forte nasce de um núcleo preciso. Trabalho com branding, " +
    "identidade visual, motion design, landing pages e social media para transformar " +
    "cada peça em valor real para o negócio.",

  /* ---------- navegação ---------- */
  nav: [
    { label: "Início",    url: "index.html" },
    { label: "Projetos",  url: "work.html" },
    { label: "Sobre",     url: "about.html" },
    { label: "Contato",   url: "contact.html" }
  ],

  /* ---------- mídia ----------
     Deixe "" para usar o fundo animado em CSS (padrão).
     Coloque seu arquivo em media/ e aponte aqui, ex: "media/hero.mp4" */
  heroVideo: "media/hero.mp4",
  heroPoster: "media/hero-poster.webp",
  loaderVideo: "",
  galleryVideo: "",
  footerImage: "images/footer-bg.jpg"
};
