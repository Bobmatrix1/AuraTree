const CACHE_NAME = 'aura-tree-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only intercept same-origin navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If network fails, try to return index.html from cache if you implemented caching
        // For now, just let it fail naturally without crashing the SW
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
    );
    return;
  }

  // Strategy: Network only for everything else
  event.respondWith(fetch(event.request));
});
