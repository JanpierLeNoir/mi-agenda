const CACHE_NAME = 'mi-agenda-v3';

// ⚠️ RUTA BASE DE GITHUB PAGES
const BASE = '/mi-agenda/';

const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json'
];

// ===== INSTALACIÓN =====
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ===== ACTIVACIÓN =====
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ===== FETCH =====
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {

      // 1. Si está en cache
      if (cached) return cached;

      // 2. Si no, intenta red
      return fetch(event.request)
        .then(res => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, res.clone());
            return res;
          });
        })
              .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match(BASE + 'index.html');
        }
        return new Response("Offline", {
          status: 503,
          statusText: "Offline"
        });
      });

    })
  );
});
