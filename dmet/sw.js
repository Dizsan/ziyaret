/**
 * D-Met // Dizsan Entegre Medya Takip
 * Service Worker & Offline Cache Engine
 */

const CACHE_NAME = "dizsan-dmet-v1.0.7";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./mobil.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./version.json",
  "./dizsan_logo.jpg",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./inc1.jpg",
  "./inc2.jpg",
  "./inc3.jpg",
  "./inc4.jpg",
  "./inc5.jpg",
  "./inc6.jpg",
  "./auto-date-helper.js",
  "./dizsan-auto-updater.js",
  "./dizsan-back-navigation.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (url.pathname.endsWith("version.json")) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
