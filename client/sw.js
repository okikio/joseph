
const cacheName = 'josephojo-v1.0.1';
const startPage = '/';
const offlinePage = '/offline.html';
const filesToCache = ["/index.html", startPage, offlinePage];

// Install
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        }).then(() => {
            self.skipWaiting();
        })
    );
});

// // Activate
// self.addEventListener('activate', function (e) {
//     e.waitUntil(
//         caches.keys().then(function (keyList) {
//             return Promise.all(keyList.map(function (key) {
//                 if (key !== cacheName) {
//                     return caches.delete(key);
//                 }
//             }));
//         })
//     );
//     return self.clients.claim();
// });

// let _online = e => fetch(e.request)
//     .then(function (response) {
//         return e.request.method !== 'GET' ? response : caches.open(cacheName).then(function (cache) {
//             cache.put(e.request, response.clone());
//             return response;
//         });
//     }).catch(function () {
//         return caches.match(offlinePage);
//     });

// // Fetch
// self.addEventListener('fetch', function (e) {
//     // Return if request url protocal isn't http or https
//     // if (!e.request.url.match(/^(http|https):\/\//i))
//     //     return;

//     // // For POST requests, do not use the cache. Serve offline page if offline.
//     // if (e.request.method !== 'GET') {
//     //     e.respondWith(
//     //         fetch(e.request).catch(function () {
//     //             return caches.match(offlinePage);
//     //         })
//     //     );
//     //     return;
//     // }
//     // // Revving strategy
//     // if (e.request.mode === 'navigate' && navigator.onLine) {
//     //     fetch(e.request).then(function (response) {
//     //         return caches.open(cacheName).then(function (cache) {
//     //             cache.put(e.request, response.clone());
//     //             return response;
//     //         });

//     //     });
//     //     return;
//     // } 
    
//     if (filesToCache.includes(e.request.url)) {
//         e.respondWith(
//             caches
//                 .open(cacheName)
//                 .then(cache => cache.match(e.request))
//                 .then(response => {
//                     if (response) return response;
//                     return caches.match(offlinePage);
//                 })
//         );
//     } else {
//         e.respondWith(_online(e));
//     }

//     // e.respondWith(
//     //     caches.match(e.request).then(function (response) {
//     //         return response || fetch(e.request).then(function (response) {
//     //             return caches.open(cacheName).then(function (cache) {
//     //                 cache.put(e.request, response.clone());
//     //                 return response;
//     //             });
//     //         });
//     //     }).catch(function () {
//     //         return caches.match(offlinePage);
//     //     })
//     // );
// }); */

// const imgURLS = [/res.cloudinary.com\/okikio-assets/g, /polyfill.com/g];
// const urlsToCache = [
//     '/',
//     '/offline',
//     '/favicon.ico',
//     '/manifest.webmanifest',
//     '/android-icon-144x144.png',
//     '/android-icon-192x192.png',
//     '/android-icon-512x512.png',
//     '/app.modern.min.js',
// ];

// self.addEventListener('install', event => {
//     self.skipWaiting();

//     event.waitUntil(
//         caches.open(cacheName).then(cache => cache.addAll(urlsToCache)),
//     );
// });

// self.addEventListener('activate', event => {
//     event.waitUntil((async () => {
//         const keys = await caches.keys();
//         const jobs = keys.map(key => key !== cacheName ? caches.delete(key) : Promise.resolve());
//         return Promise.all(jobs);
//     })());
// });

// self.addEventListener('fetch', event => {
//     event.respondWith((async () => {
//         const cachedResponse = await caches.match(event.request);
//         if (cachedResponse) return cachedResponse;

//         try {
//             const response = await fetch(event.request);
//             return response;
//         } catch (err) {
//             const url = new URL(event.request.url);

//             const pathname = url.pathname;
//             const filename = pathname.substr(1 + pathname.lastIndexOf('/')).split(/\#|\?/g)[0];
//             const extensions = ['.html', '.css', '.js', '.json', '.png', '.ico', '.svg', '.xml'];

//             if (url.origin === location.origin && !extensions.some(ext => filename.endsWith(ext))) {
//                 const cachedIndex = await caches.match('/');
//                 if (cachedIndex) return cachedIndex;
//             }

//             throw err;
//         }
//     })());
// });
