// Nombre del cache (cámbialo si actualizas la app)
const CACHE_NAME = 'mi-agenda-v2';

// Archivos esenciales de tu app
const ASSETS = [
  '/',
  '/mi_agenda.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'
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
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ===== FETCH (MAGIA OFFLINE) =====
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {

      // 1. Si existe en cache → úsalo
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Si no → intenta red
      return fetch(event.request)
        .then(networkResponse => {

          // Guardar en cache para futuro
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });

        })
        .catch(() => {

          // 3. Si falla (offline total) → fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/mi_agenda.html');
          }

        });

    })
  );
});