#!/usr/bin/env node
/* ============================================================
   Observa a pasta do projeto e publica na Cloudflare sozinho.

   Uso:   npm run watch

   Fica rodando no terminal. Toda vez que você salvar um arquivo
   em public/ ou src/, espera 4 segundos (para juntar várias
   alterações seguidas) e roda `wrangler deploy`.

   Ctrl+C para parar.
   ============================================================ */

import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const DIRS = ['public', 'src'];
const DEBOUNCE = 4000;
const IGNORE = /(^|[\\/])(\.|node_modules|_qa|\.wrangler)/;

let timer = null;
let running = false;
let pending = false;

const stamp = () => new Date().toLocaleTimeString('pt-BR');

function deploy() {
  if (running) { pending = true; return; }
  running = true;

  console.log(`\n[${stamp()}] publicando…`);
  const p = spawn('npx', ['wrangler', 'deploy'], { stdio: 'inherit', shell: true });

  p.on('close', code => {
    running = false;
    if (code === 0) console.log(`[${stamp()}] no ar\n`);
    else console.error(`[${stamp()}] falhou (código ${code}) — corrija e salve de novo\n`);
    if (pending) { pending = false; schedule(); }
  });
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(deploy, DEBOUNCE);
}

for (const dir of DIRS) {
  const full = path.resolve(dir);
  if (!fs.existsSync(full)) continue;
  watch(full, { recursive: true }, (_event, filename) => {
    if (!filename || IGNORE.test(filename)) return;
    console.log(`[${stamp()}] alterado: ${dir}/${filename}`);
    schedule();
  });
  console.log(`observando ${dir}/`);
}

console.log(`\nSalve qualquer arquivo e eu publico ${DEBOUNCE / 1000}s depois.`);
console.log('Ctrl+C para parar.\n');
