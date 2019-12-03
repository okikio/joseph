
const cacheName = 'josephojo-v1.0.0';
const startPage = '/';
const offlinePage = '/offline.html';
const filesToCache = ["/index.html", startPage, offlinePage];

// Install
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        }).then(function () {
            // `skipWaiting()` forces the waiting ServiceWorker to become the
            // active ServiceWorker, triggering the `onactivate` event.
            // Together with `Clients.claim()` this allows a worker to take effect
            // immediately in the client(s).
            return self.skipWaiting();
        })
    );
});

// Activate
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName) {
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

let _online = e => fetch(e.request)
    .then(function (response) {
        return e.request.method !== 'GET' ? response : caches.open(cacheName).then(function (cache) {
            cache.put(e.request, response.clone());
            return response;
        });
    }).catch(function () {
        return caches.match(offlinePage);
    });

// Fetch
self.addEventListener('fetch', function (e) {
    // Return if request url protocal isn't http or https
    // if (!e.request.url.match(/^(http|https):\/\//i))
    //     return;

    // // For POST requests, do not use the cache. Serve offline page if offline.
    // if (e.request.method !== 'GET') {
    //     e.respondWith(
    //         fetch(e.request).catch(function () {
    //             return caches.match(offlinePage);
    //         })
    //     );
    //     return;
    // }
    // // Revving strategy
    // if (e.request.mode === 'navigate' && navigator.onLine) {
    //     fetch(e.request).then(function (response) {
    //         return caches.open(cacheName).then(function (cache) {
    //             cache.put(e.request, response.clone());
    //             return response;
    //         });

    //     });
    //     return;
    // } 
    
    if (filesToCache.includes(e.request.url) && !navigator.onLine) {
            e.respondWith(
                caches
                    .open(cacheName)
                    .then(cache => cache.match(e.request))
                    .then(response => {
                        if (response) return response;
                        return _online(e);
                    })
            );
        } else {
            e.respondWith(_online(e));
        }

    // e.respondWith(
    //     caches.match(e.request).then(function (response) {
    //         return response || fetch(e.request).then(function (response) {
    //             return caches.open(cacheName).then(function (cache) {
    //                 cache.put(e.request, response.clone());
    //                 return response;
    //             });
    //         });
    //     }).catch(function () {
    //         return caches.match(offlinePage);
    //     })
    // );
});

