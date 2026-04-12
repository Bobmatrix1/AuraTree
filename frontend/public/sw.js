// PropellerAds MultiTag Configuration
self.options = {
    "domain": "5gvci.com",
    "zoneId": 10864376
}
self.lary = ""
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')

// PWA & Navigation Configuration
const CACHE_NAME = 'aura-tree-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
    );
    return;
  }
  event.respondWith(fetch(event.request));
});
