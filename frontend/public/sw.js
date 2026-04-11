// PropellerAds Configuration
self.options = {
    "domain": "3nbf4.com",
    "zoneId": 10864322
}
self.lary = ""
importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw')

// PWA & Navigation Configuration
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
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
    );
    return;
  }

  // Strategy: Network only for everything else
  event.respondWith(fetch(event.request));
});
