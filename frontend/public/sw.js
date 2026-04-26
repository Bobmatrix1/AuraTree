// PWA & Navigation Configuration
const CACHE_NAME = 'aura-tree-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // SILENT SHIELD: Physically block ad domains from ever reaching the network
  // and return a "204 No Content" so the browser doesn't log an error.
  if (
    url.includes('6opo.com') || 
    url.includes('pl254321.top') || 
    url.includes('quge5.com') || 
    url.includes('5gvci.com') ||
    url.includes('proproads')
  ) {
    event.respondWith(new Response(null, { status: 204 }));
    return;
  }

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
