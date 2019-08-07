// REFERENCE: 
// * https://angular.io/guide/service-worker-config

var CACHE_STATIC_NAME = 'static-v5';
var CACHE_DYNAMIC_NAME = 'dynamic-v5';

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll([
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
        ]);
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
                            cache.put(event.request, res.clone());
                            return res;
                        });
                })
        );
    } 
    else 
    {
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
                            cache.put(event.request.url, res.clone());
                            return res;
                        })
                    })
                    .catch(function(err) {
                        return caches.open(CACHE_STATIC_NAME)
                        .then(function(cache) {
                            // Using routing for specific cache strategies
                            if(event.request.url.indexOf('/help')){
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