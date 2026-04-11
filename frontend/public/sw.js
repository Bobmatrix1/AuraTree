self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Strategy: Network only (can be expanded to cache-first later)
  event.respondWith(fetch(event.request));
});
