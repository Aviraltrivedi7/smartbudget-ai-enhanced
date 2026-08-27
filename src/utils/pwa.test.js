import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../../', import.meta.url);
const readText = (path) => fs.readFileSync(new URL(path, root), 'utf8');

const fileExists = (path) => fs.existsSync(new URL(path, root));

test('PWA manifest and app-shell assets are install-ready', () => {
  const manifest = JSON.parse(readText('public/manifest.json'));

  assert.equal(manifest.name, 'DhanSetu AI - Aapke Paiso Ka Smart Saathi');
  assert.equal(manifest.short_name, 'DhanSetu AI');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.start_url, '/?source=pwa');
  assert.ok(manifest.icons.some((icon) => icon.src === '/icon-192.png' && icon.sizes === '192x192' && icon.purpose.includes('any')));
  assert.ok(manifest.icons.some((icon) => icon.src === '/icon-512.png' && icon.sizes === '512x512' && icon.purpose.includes('any')));
  assert.ok(manifest.icons.some((icon) => icon.src === '/icon-512.png' && icon.sizes === '512x512' && icon.purpose.includes('maskable')));
  assert.ok(fileExists('public/icon-192.png'));
  assert.ok(fileExists('public/icon-512.png'));
  assert.ok(fileExists('public/apple-touch-icon.png'));
  assert.ok(fileExists('public/pwa-assets/dhansetu-splash.png'));
  assert.ok(fileExists('public/sw.js'));
  assert.match(readText('src/main.tsx'), /serviceWorker\.register\('\/sw\.js'(?:,\s*\{ scope: '\/' \})?\)/);
});

test('PWA install prompt is captured before the React splash completes', () => {
  const hook = readText('src/hooks/usePWAInstall.ts');
  const promptListener = hook.indexOf("window.addEventListener('beforeinstallprompt'");
  const moduleCapture = hook.indexOf('let deferredPrompt');
  const eventPrevented = hook.includes('event.preventDefault()');
  const appInstalledListener = hook.includes("window.addEventListener('appinstalled'");

  assert.ok(moduleCapture >= 0, 'install event state should live outside the component lifecycle');
  assert.ok(promptListener > moduleCapture, 'the global install listener should be declared with the module state');
  assert.equal(eventPrevented, true);
  assert.equal(appInstalledListener, true);
});

test('install prompt exposes a direct action and an honest fallback guide', () => {
  const prompt = readText('src/components/PWAInstallPrompt.tsx');

  assert.match(prompt, /onClick=\{handleInstall\}/);
  assert.match(prompt, /Install app/);
  assert.match(prompt, /How to install/);
  assert.match(prompt, /Add to Home Screen/);
  assert.match(prompt, /Install DhanSetu AI/);
});
