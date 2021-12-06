var cacheName = 'mathEditor';
var filesToCache = [
  '/',
  '/editor.html',
  '/css/maed.css',
  '/js/remarkable.min.js',
  '/js/katex/katex.min.js',
  '/js/katex/katex.min.css',
  '/js/katex/fonts/KaTeX_AMS-Regular.woff2',
  '/js/util.js',
  '/js/d3.min.js',
  '/js/editor.js',
  '/js/filehandling.js',
  '/js/algebrite.min.js',
  '/js/function-plot.js',
  '/js/mathlex.min.js',
  '/js/Minos.js',
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
  self.skipWaiting();
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});