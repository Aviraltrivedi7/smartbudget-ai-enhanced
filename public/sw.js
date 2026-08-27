const CACHE_NAME = 'dhansetu-shell-v3';
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/favicon-32.png',
  '/favicon-48.png',
  '/dhansetu-logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/pwa-assets/dhansetu-splash.png',
];

const isNavigationRequest = (request) =>
  request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');

const cacheShellResponse = async (response) => {
  if (!response.ok) return response;
  const cache = await caches.open(CACHE_NAME);
  await cache.put('/', response.clone());
  return response;
};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  if (requestUrl.pathname.startsWith('/api') || requestUrl.pathname.startsWith('/socket.io')) return;

  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(cacheShellResponse)
        .catch(() => caches.match(event.request).then((cachedResponse) => cachedResponse || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok && requestUrl.pathname.startsWith('/assets/')) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => caches.match('/'));
    })
  );
});
