// Universe Classes — Service Worker v3
// Ye file CACHE BILKUL NAHI KAREGA — hamesha fresh content lega

const CACHE_NAME = 'universe-classes-v3';

// Install — purana cache delete karo
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  );
});

// Activate — turant active ho jao
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — HAMESHA network se lo, cache se nahi
self.addEventListener('fetch', event => {
  // Sirf same-origin requests handle karo
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    }).catch(() => {
      // Network fail hone par hi cache try karo
      return caches.match(event.request);
    })
  );
});
