// Serviceworkers file. This code gets installed in users browsers and runs code before the request is made.
const CACHE = "pwa-page-1.2";
const errPage = "/404"; // Offline page
const offlinePage = "/offline"; // Offline page
const offlineAssets = [
    "/",
    errPage,
    offlinePage,
    "/js/modern.min.js",
    "/favicon/favicon.svg"
];

// This is a somewhat contrived example of using client.postMessage() to originate a message from
// the service worker to each client (i.e. controlled page).
// Here, we send a message when the service worker starts up, prior to when it's ready to start
// handling events.
self.clients.matchAll().then(clients => {
    clients.forEach(function (client) {
        console.log(client);
        client.postMessage('The service worker just started up.');
    });
});

// The index page key is a /, to a avoid bug change it to index.html
let parseURL = (url, page = "index.html") => {
    let newURL = new URL(url);
    if ("/" === newURL.pathname.slice(-1))
        newURL.pathname += page;
    return newURL.toString();
};

// Install stage sets up the offline page, and assets in the cache and opens a new cache
self.addEventListener("install", event => {
    console.log("[PWA] Install Event processing");

    console.log("[PWA] Skip waiting on install");
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE).then(cache => {
            console.log('[PWA] Cached offline assets during install: ', offlineAssets);
            return cache.addAll(offlineAssets);
        })
    );
});

// Allow service-worker.js to control of current page
self.addEventListener("activate", event => {
    console.log("[PWA] Claiming clients for current page");
    event.waitUntil(self.clients.claim());
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

let updateCache = (request, response) => {
    return caches.open(CACHE).then(cache => {
        return cache.put(request, response);
    });
};

// If any fetch fails, it will show the offline page.
self.addEventListener("fetch", event => {
    let { request } = event, url = new URL(request.url);
    console.log(`[PWA] Fetched resource ${url}, ${request.mode}`);
    url = parseURL(url);

    if (!url.match(/^(http|https):\/\//i))
        return;
    if (url.origin !== location.origin)
        return;
    if (request.method !== 'GET') return;
    if (!navigator.onLine) {
        return event.respondWith(
            fromCache(request)
            .catch(cache => {
                console.warn('[PWA] Client not online. Serving offline page.');
                return cache.match(offlinePage);
            })
        );
    }

    // The following validates that the request was for a navigation to a new document
    return event.respondWith(
        fromCache(request)
            .then(response => {
                // The response was found in the cache so we respond with it and update the entry
                // This is where we call the server to get the newest version of the
                // file to use the next time we show view
                event.waitUntil(
                    fetch(request).then(response => updateCache(request, response))
                );

                return response;
            }, () => {
                // The response was not found in the cache so we look for it on the server
                return fetch(request)
                    .then(response => {
                        // If request was success, add or update it in the cache
                        event.waitUntil(updateCache(request, response.clone()));
                        return response;
                    })
                    .catch(error => {
                        console.log("[PWA] Network request failed and no cache.", error);
                        return fromCache(errPage);
                    });
            })
    );

    // if (request.destination === "document" || request.mode === "navigate") {}
});

// This is an event that can be fired from your page to tell the Service Worker to update the offline page
self.addEventListener('refreshOffline', response => {
    return caches.open(CACHE).then(cache => {
        console.log("[PWA] Offline page updated from refreshOffline event: ", response.url);
        return cache.put(offlinePage, response);
    });
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
});