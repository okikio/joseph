// Serviceworkers file. This code gets installed in users browsers and runs code before the request is made.
const CACHE = "pwa-page-1.2";
const offlinePage = "/offline.html"; // Offline page
const offlineAssets = [
    offlinePage,
    "/js/modern.min.js",
    "/favicon/favicon.svg",

    "/favicon/favicon-16x16.png",
    "/favicon/favicon-32x32.png",
    "/favicon/favicon-96x96.png",

    "/favicon/android-icon-72x72.png",
    "/favicon/android-icon-144x144.png",
    "/favicon/android-icon-192x192.png",
    "/favicon/android-icon-512x512.png"
];

let urlsMap = new Map(
    offlineAssets.map(asset => {
        let url = new URL(asset, self.location);
        return [url.toString(), url]
    })
);

let urlSet = cache => {
    return cache.keys().then(requests => {
        return requests.map(request => request.url);
    }).then(requests => new Set(requests));
};

let parseResponse = response => {
    let { headers, status, statusText, redirected } = response;
    return redirected ?
        ("body" in response ? Promise.resolve(response.body) : response.blob())
            .then(body =>
                new Response(body, { headers, status, statusText })
            ) : Promise.resolve(response);
};


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

// Install stage sets up the offline page, and assets in the cache and opens a new cache
self.addEventListener("install", event => {
    console.log("[PWA] Install Event processing");

    event.waitUntil(
        caches.open(CACHE).then(cache => {
            return urlSet(cache).then(requestURLs => {
                console.log("[PWA] Cached offline page during install");

                return Promise.all(
                    Array.from(urlsMap.values()).map(url => {
                        if (!requestURLs.has(url)) {
                            let request = new Request(url, {
                                credentials: "same-origin"
                            });

                            return fetch(request).then(response => {
                                if (!response.ok)
                                    throw new Error(`Request for ${url} returned a response with status ${response.status}`);

                                return parseResponse(response).then(response => {
                                    return cache.put(url, response);
                                });
                            });
                        }
                    })
                );
            });
        }).then(() => self.skipWaiting())
    );
});

// The index page key is a /, to a avoid bug change it to index.html
let parseURL = (url, page = "index.html") => {
    let newURL = new URL(url);
    if ("/" === newURL.pathname.slice(-1))
        newURL.pathname += page;
    return newURL.toString();
};

self.addEventListener('activate', function (event) {
    // Delete all caches that aren't named in CACHE.
    // While there is only one cache in this example, the same logic will handle the case where
    // there are multiple versioned caches.

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (CACHE.indexOf(cacheName) === -1) {
                        // If this cache name isn't present in the array of "expected" cache names, then delete it.
                        console.log('[PWA] Deleting out of date cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function () {
            return self.clients.claim();
        }).then(function () {
            // After the activation and claiming is complete, send a message to each of the controlled
            // pages letting it know that it's active.
            // This will trigger navigator.serviceWorker.onmessage in each client.
            return self.clients.matchAll().then(function (clients) {
                return Promise.all(
                    clients.map(function (client) {
                        return client.postMessage('[PWA] The service worker has activated and taken control.');
                    }));
            });
        })
    );
});

// If any fetch fails, it will show the offline page.
self.addEventListener("fetch", event => {
    let { request } = event, url = new URL(request.url);
    console.log(`[PWA] Fetched resource ${url}`);
    url = parseURL(url);

    if (!url.match(/^(http|https):\/\//i))
        return;
    if (url.origin !== location.origin)
        return;
    if (request.method !== 'GET') return;
    if (request.mode === 'navigate' && navigator.onLine) {
        event.respondWith(
            fetch(request).then(async response => {
                const cache = await caches.open(CACHE);
                cache.put(request, response.clone());
                return response;
            })
        );
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(response => {
                console.warn(`[PWA] Either Network request Failed or you are currently offline. Serving offline page.`);
                return response || fetch(request).then(async response => {
                    const cache = await caches.open(CACHE);
                    cache.put(request, response.clone());
                    return response;
                });
            })
            .catch(() => {
                return caches.match(offlinePage);
            })
    );
});

self.addEventListener('message', event => {
    console.log('Handling message event:', event);

    switch (event.data.command) {
        // This command returns a list of the URLs corresponding to the Request objects
        // that serve as keys for the current cache.
        case 'message':
            console.log("[PWA] postMessage is working")
            break;

        default:
            // If the promise rejects, handle it by returning a standardized error message to the controlled page.
            console.error('Message handling failed, Unknown command: ', event.data.command);
            event.ports[0].postMessage({ error: 'Unknown command: ' + event.data.command });
            break;
    }
});