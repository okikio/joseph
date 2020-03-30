// Serviceworkers file. This code gets installed in users browsers and runs code before the request is made.
const CACHE = "pwa-page-1.2";
const errPage = "/404.html"; // Offline page
const offlinePage = "/offline.html"; // Offline page
const offlineAssets = [
    "/",
    errPage,
    offlinePage,
    "/js/modern.min.js",
    "/favicon/favicon.svg",
    "/fonts/roboto--regular_latin.woff2",
    "/fonts/montserrat--extrabold_latin.woff2",
    "/fonts/montserrat--bold_latin.woff2",
    "/fonts/frank-ruhl-libre--black_latin.woff2",
];

// This is a somewhat contrived example of using client.postMessage() to originate a message from
// the service worker to each client (i.e. controlled page).
// Here, we send a message when the service worker starts up, prior to when it's ready to start
// handling events.
// self.clients.matchAll().then(clients => {
//     clients.forEach(function (client) {
//         console.log(client);
//         client.postMessage('The service worker just started up.');
//     });
// });

// The index page key is a /, to a avoid bug change it to index.html
// let parseURL = (url, page = "index.html") => {
//     let newURL = new URL(url);
//     if ("/" === newURL.pathname.slice(-1))
//         newURL.pathname += page;
//     return newURL.toString();
// };

// Install stage sets up the offline page, and assets in the cache and opens a new cache
self.addEventListener("install", event => {
    console.log("[PWA] Install Event processing");

    // console.log("[PWA] Skip waiting on install");
    // self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE).then(cache => {
            console.log('[PWA] Cached offline assets during install: ', offlineAssets);
            return cache.addAll(offlineAssets);
        })
    );
});

// Check to see if you have it in the cache, return response
// If not in the cache, then reject promise
let fromCache = request => {
    return caches.open(CACHE).then(cache => {
        return cache.match(request).then(matching => {
            if (!matching || matching.status === 404) {
                return Promise.reject(cache);
            }

            return matching;
        });
    });
};

// If any fetch fails, it will show the offline page.
self.addEventListener("fetch", event => {
    let { request } = event;
    // console.log(`[PWA] Fetched resource ${url}, ${request.mode}`);

    event.respondWith(
        fetch(request)
            .catch(() => {
                console.log("[PWA] Network request failed, serving offline asset.");
                return fromCache(request)
                    .catch(err => {
                        console.log(`[PWA] No offline asset found, serving offline page. `, err);
                        return fromCache(offlinePage);
                    });
            })
    );
});
/*
let updateCache = (request, response) => {
    return caches.open(CACHE).then(cache => {
        return cache.put(request, response);
    });
};

// Allow service-worker.js to control of current page
// self.addEventListener("activate", event => {
//     console.log("[PWA] Claiming clients for current page");
//     event.waitUntil(self.clients.claim());
// });

// This is an event that can be fired from your page to tell the Service Worker to update the offline page
self.addEventListener('refreshOffline', response => {
    console.log("[PWA] Offline page updated from refreshOffline event: ", response.url);
    return updateCache(offlinePage, response);
});

self.addEventListener('message', event => {
    console.log('Handling message event:', event);

    switch (event.data.command) {
        // This command returns a list of the URLs corresponding to the Request objects
        // that serve as keys for the current cache.
        case 'refresh':
            event.waitUntil(
                // eslint-disable-next-line no-unused-vars
                caches.open(CACHE).then(cache => {
                    return fetch(offlinePage).then(async response => {
                        const cache = await caches.open(CACHE);
                        console.log("[PWA] Cached offline page again");
                        cache.put(offlinePage, response.clone());
                        return response;
                    });
                })
            );
            break;

        default:
            // If the promise rejects, handle it by returning a standardized error message to the controlled page.
            console.error('Message handling failed, Unknown command: ', event.data.command);
            event.ports[0].postMessage({ error: 'Unknown command: ' + event.data.command });
            break;
    }
});*/