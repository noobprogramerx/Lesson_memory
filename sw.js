const CACHE_NAME = 'lesson-memory-cache-v16';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'lesmills_tracks.js',
  'icon.png',
  'manifest.json',
  'images/logos/bodycombat-logo.png',
  'images/logos/bodypump-logo.webp',
  'images/logos/bodyattack-logo.png',
  'images/logos/grit-strength-logo.png',
  'images/logos/grit-cardio-logo.png',
  'images/logos/grit-athletic-logo.png',
  'images/logos/strength-development-logo.webp',
  'images/logos/core-logo.png',
  'images/logos/trip-logo.webp',
  'images/logos/rpm-logo.webp',
  'images/logos/bodybalance-logo.png',
  'images/logos/bodyjam-logo.png',
  'images/logos/bodystep-logo.webp',
  'images/logos/dance-logo.jpg',
  'images/logos/pilates-logo.webp',
  'images/logos/shapes-logo.webp',
  'images/logos/sprint-logo.png',
  'images/logos/tone-logo.png',
  'images/logos/bodypump-heavy-logo.webp',
  'images/logos/ceremony-logo.webp',
  'images/logos/thrive-logo.png',
  'images/logos/yoga-logo.png'
];

// Install Event - Pre-cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching all static assets...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-first with cache fallback strategy
self.addEventListener('fetch', event => {
  // Only handle GET requests and local assets (skip chrome-extension:// etc)
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If successful response, cache it and return
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails (offline), return cached version
        return caches.match(event.request);
      })
  );
});
