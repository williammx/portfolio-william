#!/usr/bin/env node
/* ============================================================
   Converte um vídeo em sequência de frames webp para a
   animação de scroll.

   Uso:
     npm run frames -- media/meu-video.mp4
     npm run frames -- media/meu-video.mp4 --count 140 --width 1600

   Requer ffmpeg no PATH.  Windows:  winget install Gyan.FFmpeg
   ============================================================ */

import { execFileSync, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';

const run = promisify(execFile);
const args = process.argv.slice(2);
const input = args.find(a => !a.startsWith('--'));

if (!input) {
  console.error(`
Uso:  npm run frames -- caminho/do/video.mp4  [--count 120] [--width 1600] [--quality 78] [--out frames2]

  --count    quantos frames gerar   (padrão 120)
  --width    largura máxima em px   (padrão 1600)
  --quality  qualidade do webp 0-100 (padrão 78)
`);
  process.exit(1);
}

const flag = (name, def) => {
  const i = args.indexOf('--' + name);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def;
};
const strFlag = (name, def) => {
  const i = args.indexOf('--' + name);
  return i >= 0 && args[i + 1] ? String(args[i + 1]) : def;
};

const COUNT   = flag('count', 120);
const WIDTH   = flag('width', 1600);
const QUALITY = flag('quality', 78);
const DIR     = strFlag('out', 'frames');   // pasta de saída em /public

const OUT = path.resolve('public', DIR);

/* ---------- checagens ---------- */
try {
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
} catch {
  console.error(`
ffmpeg não encontrado no PATH.

  Windows:  winget install Gyan.FFmpeg
  macOS:    brew install ffmpeg

Depois de instalar, feche e reabra o terminal.`);
  process.exit(1);
}

if (!fs.existsSync(input)) {
  console.error(`Arquivo não encontrado: ${input}`);
  process.exit(1);
}

/* ---------- duração do vídeo ---------- */
async function duration(file) {
  try {
    const { stdout } = await run('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', file
    ]);
    return parseFloat(stdout.trim());
  } catch {
    return null;
  }
}

/* ---------- execução ---------- */
console.log(`\nVídeo:    ${input}`);
console.log(`Frames:   ${COUNT}`);
console.log(`Largura:  ${WIDTH}px`);
console.log(`Saída:    ${OUT}\n`);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const dur = await duration(input);
if (!dur) {
  console.warn('Não consegui ler a duração — usando taxa de frames fixa.\n');
}

// fps necessário para extrair exatamente COUNT frames ao longo do vídeo
const fps = dur ? (COUNT / dur) : 12;

console.log('Extraindo… (pode levar um minuto)');
await run('ffmpeg', [
  '-y', '-i', input,
  '-vf', `fps=${fps.toFixed(6)},scale=${WIDTH}:-2:flags=lanczos`,
  '-vsync', '0',
  '-frames:v', String(COUNT),
  // sem -f image2 o ffmpeg escolhe o muxer webp e gera UM arquivo animado
  '-f', 'image2',
  '-c:v', 'libwebp',
  '-lossless', '0',
  '-quality', String(QUALITY),
  '-compression_level', '5',
  '-preset', 'picture',
  path.join(OUT, '%04d.webp')
], { maxBuffer: 1024 * 1024 * 64 });

const files = fs.readdirSync(OUT).filter(f => f.endsWith('.webp')).sort();
if (!files.length) {
  console.error('Nenhum frame foi gerado. Confira o arquivo de vídeo.');
  process.exit(1);
}

const bytes = files.reduce((a, f) => a + fs.statSync(path.join(OUT, f)).size, 0);

fs.writeFileSync(
  path.join(OUT, 'manifest.json'),
  JSON.stringify({ count: files.length, pad: 4, ext: 'webp', dir: DIR, width: WIDTH }, null, 2)
);

console.log(`
Pronto.
  ${files.length} frames
  ${(bytes / 1024 / 1024).toFixed(1)} MB no total
  ${(bytes / files.length / 1024).toFixed(0)} KB por frame

A seção .vscroll já vai encontrar os frames sozinha.
Se ficar pesado, rode de novo com  --count 90 --width 1280
`);
