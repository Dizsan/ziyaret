const CACHE_NAME = 'dizsan-kredi-takip-v2.1.0';
const ASSETS = [
  './kredi-takip.html',
  './manifest-kredi.json',
  './auto-date-helper.js',
  './Dizsan Logo.JPG'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (
    event.request.method !== 'GET' ||
    url.includes('/api/') ||
    url.includes('api.github.com') ||
    url.includes('raw.githubusercontent.com') ||
    url.includes('kredi_shared_state.json')
  ) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
