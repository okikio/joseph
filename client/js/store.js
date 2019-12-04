try {
    if ('serviceWorker' in navigator) {
        // navigator.serviceWorker.register('/sw.min.js', { scope: '/' })
        //     .then(function (registration) {
        //         console.log('Registration successful, scope is:', registration.scope);
        //     })
        //     .catch(function (error) {
        //         console.log('Service worker registration failed, error:', error);
        //     });
    }
} catch (e) {
    let err = "There is an error in/with the service worker.";
    console.warn(err, e);
}