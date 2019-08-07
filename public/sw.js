// REFERENCE: 
// * https://angular.io/guide/service-worker-config

var CACHE_STATIC_NAME = 'static-v6';
var CACHE_DYNAMIC_NAME = 'dynamic-v6';

var STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/promise.js',
    '/src/js/fetch.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]

// function trimCache(cacheName, maxItems){
//     caches.open(cacheName)
//         .then(function(cache){
//             return cache.keys().then(function(keys){
//                 if(keys.length > maxItems){
//                     cache.delete(keys[0])
//                         .then(trimCache(cacheName, maxItems));
//                 }
//             });
//         })
// }

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll(STATIC_FILES);
      })
  )
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

function isInArray(string, array){
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
        console.log('matched ', string);
        cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
        cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}


// Cache, then populate with network
self.addEventListener('fetch', function(event) {
    var url = 'https://httpbin.org/get';
    // Cache, then network part for a specific url where we get our feed
    if(event.request.url.indexOf(url) > -1){
        event.respondWith(
            caches.open(CACHE_DYNAMIC_NAME)
                .then(function(cache){
                    return fetch(event.request)
                        .then(function(res){
                            // trimCache(CACHE_DYNAMIC_NAME, 3)
                            cache.put(event.request, res.clone());
                            return res;
                        });
                })
        );
    } 
    else if (isInArray(event.request.url, STATIC_FILES)){
        event.respondWith(
            caches.match(event.request)
        );
    } 
    else {
        // Use cache with network fallback for all other parts of the website 
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                if (response) {
                    return response;
                } else {
                    return fetch(event.request)
                    .then(function(res) {
                        return caches.open(CACHE_DYNAMIC_NAME)
                        .then(function(cache) {
                            // trimCache(CACHE_DYNAMIC_NAME, 3);
                            cache.put(event.request.url, res.clone());
                            return res; 
                        })
                    })
                    .catch(function(err) {
                        return caches.open(CACHE_STATIC_NAME)
                        .then(function(cache) {
                            // Using routing for specific cache strategies
                            if(event.request.headers.get('accept').includes('text/html')){
                                return cache.match('/offline.html');
                            }
                        });
                   });
                }
            }) );
        }
});

// Cache with network fallback
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//             })
//             .catch(function(err) {
//               return caches.open(CACHE_STATIC_NAME)
//                 .then(function(cache) {
//                   return cache.match('/offline.html');
//                 });
//             });
//         }
//       })
//   );
// });

// Cache only strategy
// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         caches.match(event.request)
//     );
// });

// Network only strategy
// self.addEventListener('fetch', function(event) {
//     fetch(event.request)
// });

// Network with Cache fallback
// Doesn't take advantage of speed loading of caching
// If on a super sload network, have to wait 60 seconds for the page to time out
// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         fetch(event.request)
//             .then(function(res){
//                 // TODO: Dynamic caching.
//             })
//             .catch(function(err){
//                 return caches.match(even.request);
//             })
//     );
// });

// Cache, then Network
// Always present something to user super fast
// self.addEventListener('fetch', function(event){
    
// })