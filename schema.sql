-- ============================================================
-- Esquema do CMS de projetos (Cloudflare D1 / SQLite)
-- Aplicar com:  npm run cf:d1:schema
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT    NOT NULL UNIQUE,
  title        TEXT    NOT NULL,
  tag          TEXT    NOT NULL DEFAULT '',      -- ex.: "Branding / Identidade"
  category     TEXT    NOT NULL DEFAULT '',      -- usado no filtro da página Projetos
  year         TEXT    NOT NULL DEFAULT '',
  client       TEXT    NOT NULL DEFAULT '',
  summary      TEXT    NOT NULL DEFAULT '',      -- 1 linha, aparece nos cards
  body         TEXT    NOT NULL DEFAULT '',      -- descrição longa do case
  cover        TEXT    NOT NULL DEFAULT '',      -- chave da imagem no R2
  url          TEXT    NOT NULL DEFAULT '',      -- link externo, se houver
  featured     INTEGER NOT NULL DEFAULT 1,       -- 1 = aparece na home
  position     INTEGER NOT NULL DEFAULT 0,       -- ordem de exibição
  published    INTEGER NOT NULL DEFAULT 1,       -- 0 = rascunho
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_order
  ON projects (published, featured, position);

-- Galeria: várias imagens por projeto
CREATE TABLE IF NOT EXISTS project_images (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  key         TEXT    NOT NULL,                  -- chave no R2
  alt         TEXT    NOT NULL DEFAULT '',
  position    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_images_project
  ON project_images (project_id, position);

-- Biblioteca de mídia: tudo que foi enviado pelo CMS,
-- para você reaproveitar imagens em qualquer lugar do site
CREATE TABLE IF NOT EXISTS media (
  key         TEXT PRIMARY KEY,                  -- chave no R2
  filename    TEXT NOT NULL,
  mime        TEXT NOT NULL DEFAULT 'image/webp',
  width       INTEGER NOT NULL DEFAULT 0,
  height      INTEGER NOT NULL DEFAULT 0,
  size        INTEGER NOT NULL DEFAULT 0,
  alt         TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Blocos de conteúdo editáveis do site (chave → valor JSON).
-- Permite trocar textos da home pelo CMS sem mexer no código.
CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
