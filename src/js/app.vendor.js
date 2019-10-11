const { fetch } = window;
const { body } = document;

let _src = v => `./js/${v}.min.js`;
try {
    let script = document.createElement("script");
    let check = function () {
        "use strict";

        if (typeof window.Symbol === "undefined" || typeof window.Promise === "undefined") return false;
        try {
            Function("class Foo {}") ();
            Function("let bar = x => x+1;") ();
            Function("let bez = { a: 'b' }; let box = { b: 'a', ...bez };") ();
        } catch (e) { return false; }

        return true;
    };

    let isModern = check();
    let src = _src(`app${isModern ? ".modern" : ""}`);
    script.setAttribute("src", src);
    if (isModern) {
        fetch(src)
            .then(res => {
                if (!res.ok) {
                    console.log('Looks like there was a problem. Status Code: ', status);
                    return;
                }

                res.text().then(data => {
                    script.innerHTML = data;
                    body.appendChild(script);
                });
            })
            .catch(err => {
                console.log('Fetch Error: ', err);
            });
    } else {
        body.appendChild(script);
    }

    try {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.min.js', { scope: '/' })
                .then(function (registration) {
                    console.log('Registration successful, scope is:', registration.scope);
                })
                .catch(function (error) {
                    console.log('Service worker registration failed, error:', error);
                });
        }
    } catch (e) {
        let err = "There is an error in/with the service worker.";
        console.warn(err, e);
    }

} catch (e) {
    let err = "Your browser is outdated, I suggest updating or upgrading to a new one.";
    document.write(err);
    console.warn(err);
}