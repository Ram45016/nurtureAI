
const CACHE_NAME = 'nurture-ai-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Strategy: Cache First, falling back to Network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        // Cache external assets like DiceBear or Google Fonts as they are fetched
        if (event.request.url.includes('api.dicebear.com') || event.request.url.includes('fonts.gstatic.com')) {
           return caches.open(CACHE_NAME).then((cache) => {
             cache.put(event.request.url, fetchRes.clone());
             return fetchRes;
           });
        }
        return fetchRes;
      });
    }).catch(() => {
      // Return local index.html for navigation requests when offline
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
