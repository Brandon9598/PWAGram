// Triggered by the browser
self.addEventListener('install', function(event){
    console.log('[Service Worker] Installing Service Worker ...', event);
});

// If you have a tab open, it will register new SW but not activate it.
// Triggered by the browser
self.addEventListener('activate', function(event){
    console.log('[Service Worker] Activating Service Worker ...', event);
    return self.clients.claim();
});

//  Triggered by the web application
self.addEventListener('fetch', function(event){
    event.respondWith(fetch(event.request));
});