/**
 * Service Worker for Pathways PWA
 * Caches app shell and provides offline fallback for activity payloads.
 */

const CACHE_NAME = 'pathways-pwa-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/styles/main.css',
  './src/styles/a11y.css',
  './src/main.js',
  './src/db/offline_store.js',
  './src/api/client.js',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Some assets could not be pre-cached, proceeding:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Network first for APIs
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Stale-while-revalidate for static files
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(networkRes => {
        if (networkRes && networkRes.status === 200) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, networkRes.clone()));
        }
        return networkRes;
      }).catch(() => null);
      return cached || fetchPromise;
    })
  );
});
