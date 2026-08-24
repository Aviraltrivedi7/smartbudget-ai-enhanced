import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../../', import.meta.url);
const readText = (path) => fs.readFileSync(new URL(path, root), 'utf8');

test('PWA manifest and app-shell assets are install-ready', () => {
  const manifest = JSON.parse(readText('public/manifest.json'));

  assert.equal(manifest.name, 'DhanSetu AI - Aapke Paiso Ka Smart Saathi');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.scope, '/');
  assert.ok(manifest.icons.some((icon) => icon.src === '/icon-192.png' && icon.sizes === '192x192'));
  assert.ok(manifest.icons.some((icon) => icon.src === '/icon-512.png' && icon.sizes === '512x512'));
  assert.ok(fs.existsSync(new URL('public/icon-192.png', root)));
  assert.ok(fs.existsSync(new URL('public/icon-512.png', root)));
  assert.ok(fs.existsSync(new URL('public/sw.js', root)));
  assert.match(readText('src/main.tsx'), /serviceWorker\.register\('\/sw\.js'\)/);
});
