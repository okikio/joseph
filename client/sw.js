let CACHE = 'sw-v1';

// Open a cache and use addAll() with an array of assets to add all of them to the cache. Return a promise resolving when all the assets are added.
const precache = () => {
    return caches.open(CACHE)
        .then(cache => cache.addAll(['/404', '/index', '/', '/about', '/projects', '/contact', '/sw.min.js', '/js/app.vendor.min.js', '/js/app.modern.min.js']))
        .catch((e) => {
            console.log("sw.min.js can't find files to cache, err:", e);
        });
};

// On install, cache some resources.
// self.addEventListener('install', function (evt) {
//     console.log('The service worker is being installed.');

//     // Ask the service worker to keep installing until the returning promise resolves.
//     evt.waitUntil(precache());
// });

// Update consists in opening the cache, performing a network request and storing the new response data.
const update = request => {
    return caches.open(CACHE).then(function(cache) {
        return fetch(request).then(function(response) {
            return cache.put(request, response);
        }).catch(function () {});
    });
};

// Open the cache where the assets were stored and search for the requested resource. Notice that in case of no matching, the promise still resolves but it does with undefined as value.
const fromCache = request => {
    return caches.open(CACHE).then(function(cache) {
        return cache.match(request).then(function(matching) {
            return matching || Promise.reject('no-match');
        });
    });
};

// On fetch, use cache but update the entry with the latest contents from the server.
// self.addEventListener('fetch', function(evt) {
//     if (evt.request.method === 'GET') {
//         console.log('The service worker is serving the asset.');

//         // …and waitUntil() to prevent the worker from being killed until the cache is updated.
//         update(evt.request);

//         // You can use respondWith() to answer immediately, without waiting for the network response to reach the service worker…
//         evt.respondWith(fromCache(evt.request));
//     }
// });
