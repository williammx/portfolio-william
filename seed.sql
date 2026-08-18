-- ============================================================
-- Projetos de exemplo, para o CMS não começar vazio.
-- Aplicar com:  npm run cf:d1:seed        (produção)
--               npm run cf:d1:seed:local  (local)
--
-- As capas ficam vazias de propósito: você sobe as imagens
-- pelo painel em /admin e elas vão para o R2.
-- ============================================================

INSERT OR IGNORE INTO projects (slug, title, tag, category, year, client, summary, featured, position, published) VALUES
  ('projeto-um',    'Projeto Um',    'Branding / Identidade',    'Branding',        '2026', 'Cliente', 'Identidade visual completa, do conceito ao manual de marca.', 1, 1, 1),
  ('projeto-dois',  'Projeto Dois',  'Motion / Campanha',        'Motion',          '2026', 'Cliente', 'Peças animadas para campanha de lançamento.',                1, 2, 1),
  ('projeto-tres',  'Projeto Três',  'Landing Page / Conversão', 'Landing Page',    '2026', 'Cliente', 'Página de conversão do wireframe ao código.',                1, 3, 1),
  ('projeto-quatro','Projeto Quatro','Social Media / Conteúdo',  'Social Media',    '2025', 'Cliente', 'Direção de conteúdo e templates editáveis para o time.',     1, 4, 1),
  ('projeto-cinco', 'Projeto Cinco', 'Direção Criativa / Web',   'Direção Criativa','2025', 'Cliente', 'Território visual e direção de arte do site institucional.', 1, 5, 1),
  ('projeto-seis',  'Projeto Seis',  'Interface / Produto',      'Interface',       '2025', 'Cliente', 'UI e design system para produto digital.',                   1, 6, 1);
