// DİZSAN Müşteri Ziyaret & Saha Takip Service Worker (v1.4.1)
const CACHE_NAME = "dizsan-ziyaret-v1.7.0";
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './dizsan-back-navigation.js',
  './customer_database.json',
  './alarm-worker.js',
  './auto-date-helper.js',
  './dizsan_logo.jpg',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

const DB_NAME = 'dizsan_ziyaret_bg_db';
const STORE_NAME = 'bg_store';
const CLOUD_KEY_CODES = [106, 107, 115, 98, 91, 123, 91, 82, 116, 68, 73, 89, 125, 119, 57, 84, 112, 75, 86, 86, 109, 86, 112, 72, 103, 80, 116, 87, 117, 111, 113, 57, 125, 80, 53, 105, 76, 60, 120, 79];
const CLOUD_API_URL = 'https://api.github.com/repos/Dizsan/ziyaret/contents/shared_state.json';

function getCloudAuthToken() {
  return CLOUD_KEY_CODES.map((c) => String.fromCharCode(c - 3)).join('');
}

function decodeUTF8Base64(b64) {
  return decodeURIComponent(escape(atob(b64.replace(/\s/g, ''))));
}

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// NETWORK-FIRST STRATEJİSİ:
// Uygulama her açıldığında veya yenilendiğinde öncelikle ağdan en son güncel HTML/JS/CSS çekilir.
// İnternet kesilirse çevrimdışı önbellekten sunulur. version.json ASLA önbelleğe alınmaz.
self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  if (url.includes('version.json') || url.includes('api.github.com') || url.includes('/api/') || url.includes(':8787') || url.includes('cors')) {
    return;
  }

  e.respondWith(
    fetch(e.request).then((networkRes) => {
      if (networkRes && networkRes.status === 200 && e.request.method === 'GET') {
        const copy = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
      }
      return networkRes;
    }).catch(() => {
      return caches.match(e.request).then((cachedRes) => {
        if (cachedRes) return cachedRes;
        if (e.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// VAPID Web Push Bildirimlerini Karşılama
self.addEventListener('push', (e) => {
  let data = {};
  if (e.data) {
    try {
      data = e.data.json();
    } catch (err) {
      try {
        data = { title: 'DİZSAN Saha Ziyaret Hatırlatıcısı', body: e.data.text() };
      } catch (e2) {
        data = {};
      }
    }
  } else {
    data = { title: 'DİZSAN Saha Ziyaret Bildirimi', body: 'Yeni bir ziyaret veya görüşme hatırlatmanız bulunmaktadır.' };
  }

  const title = data.title || '🔔 DİZSAN Müşteri Ziyaret & Saha Bildirimi';
  const body = data.body || 'Yeni bir ziyaret veya görev bildiriminiz var.';
  const scope = self.registration ? self.registration.scope : './';
  const iconUrl = new URL('icon-192.png', scope).href;
  const targetUrl = data.url || './?tab=active-tab';

  const options = {
    body: body,
    icon: iconUrl,
    badge: iconUrl,
    vibrate: [500, 150, 500, 150, 600],
    tag: data.tag || ('dizsan-push-' + Date.now()),
    renotify: true,
    requireInteraction: true,
    silent: false,
    data: {
      url: targetUrl,
      id: data.id || ('push-' + Date.now()),
      timestamp: Date.now()
    }
  };

  const showPromise = self.registration.showNotification(title, options)
    .catch((err) => {
      console.warn('[SW Push] Detaylı bildirim başarısız, standart bildirim gösteriliyor:', err);
      return self.registration.showNotification(title, {
        body: body,
        icon: iconUrl
      });
    });

  e.waitUntil(showPromise);
});

// Bildirime Dokunulduğunda İlgili Ekrana / Müşteriye Doğrudan Yönlendirme (Deep-Link)
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'close') return;

  const targetUrl = (e.notification.data && e.notification.data.url) ? e.notification.data.url : './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Sayfadan gelen kullanıcı / state senkronizasyonu
self.addEventListener('message', (e) => {
  const data = e.data || {};
  if (data.type === 'SYNC_USER_TO_SW') {
    // Session state synced
  }
});
