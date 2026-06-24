import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const staticDir = join(projectRoot, '.vercel', 'output', 'static');
const browserDir = join(projectRoot, 'dist', 'frontend', 'browser');

mkdirSync(staticDir, { recursive: true });
cpSync(browserDir, staticDir, { recursive: true });

writeFileSync(
  join(projectRoot, '.vercel', 'output', 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: '/(.*)', dest: '/index.html' },
      ],
    },
    null,
    2,
  ),
);

console.log('Vercel prebuilt output ready in .vercel/output');
