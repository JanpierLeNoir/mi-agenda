const CACHE_NAME = 'mi-agenda-v4';  

// RUTA BASE DE GITHUB PAGES
const BASE = '/mi-agenda/';

const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon-192.png'   // añadimos el icono para que también se actualice
];

// ===== INSTALACIÓN =====
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ===== ACTIVACIÓN (borra cachés antiguos) =====
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ===== FETCH (estrategia network-first para index.html + cache para el resto) =====
self.addEventListener('fetch', event => {
  // Para el index.html siempre intentamos traer la versión más nueva
  if (event.request.url.endsWith('index.html') || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Para el resto de archivos: cache-first (más rápido)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(res => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, res.clone());
            return res;
          });
        })
        .catch(() => new Response("Offline", { status: 503 }));
    })
  );
});