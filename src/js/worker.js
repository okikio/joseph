// Serviceworkers file. This code gets installed in users browsers and runs code before the request is made.
const CACHE = "pwa-page-1.2";
const offlinePage = "/offline.html"; // Offline page
// const offlineAssets = [
//     offlinePage,
//     "/favicon/favicon.svg",

//     "/favicon/favicon-16x16.png",
//     "/favicon/favicon-32x32.png",
//     "/favicon/favicon-96x96.png",

//     "/favicon/android-icon-72x72.png",
//     "/favicon/android-icon-144x144.png",
//     "/favicon/android-icon-192x192.png",
//     "/favicon/android-icon-512x512.png"
// ];

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
// let parseURL = (url, page = "index.html") => {
//     let newURL = new URL(url);
//     if ("/" === newURL.pathname.slice(-1))
//         newURL.pathname += page;
//     return newURL.toString();
// };

// Install stage sets up the offline page, and assets in the cache and opens a new cache
// self.addEventListener("activate", event => {
//     console.log("[PWA] Activate Event processing");

//     event.waitUntil(
//         caches.open(CACHE).then(cache => {
//             console.log("[PWA] Cached offline page during install");
//             return cache.addAll(offlineAssets);
//         })
//     );
// });

// If any fetch fails, it will show the offline page.
self.addEventListener("fetch", event => {
    // let { request } = event, url = new URL(request.url);
    // console.log(`[PWA] Fetched resource ${url}`);
    // url = parseURL(url);

    // if (!url.match(/^(http|https):\/\//i))
    //     return;
    // if (url.origin !== location.origin)
    //     return;
    // if (request.method !== 'GET') return;
    // if (request.mode === 'navigate' && !navigator.onLine) {
    //     event.respondWith(
    //         caches.match(request)
    //             .then(response => {
    //                 console.warn(`[PWA] Either Network request Failed or you are currently offline. Serving offline page.`);
    //                 return response || fetch(request).then(async response => {
    //                     const cache = await caches.open(CACHE);
    //                     cache.put(request, response.clone());
    //                     return response;
    //                 });
    //             })
    //             .catch(() => {
    //                 return caches.match(offlinePage);
    //             })
    //     );
    //     return;
    // }
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