const CACHE_NAME = 'dikas-finans-cache-v1.0.6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './mobil.html',
  './style.css',
  './app.js',
  './manifest.json',
  './version.json',
  './dizsan_logo.jpg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './auto-date-helper.js',
  './dizsan-auto-updater.js',
  './dizsan-back-navigation.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.hostname.includes('github.com') || url.hostname.includes('githubusercontent.com') || url.pathname.includes('/api/') || url.pathname.endsWith('version.json') || url.pathname.endsWith('shared_state.json')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
