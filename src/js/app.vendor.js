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

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.min.js')
            .then(function (registration) {
                console.log('Registration successful, scope is:', registration.scope);
            })
            .catch(function (error) {
                console.log('Service worker registration failed, error:', error);
            });

        navigator.serviceWorker.ready.then(function () {
            console.log("Offline data will be updated on reload.");
        });

        let deferredPrompt;
        const addBtn = document.querySelector('.add-button');
        addBtn.style.display = 'none';

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            deferredPrompt = e;
            // Update UI to notify the user they can add to home screen
            addBtn.style.display = 'block';

            addBtn.addEventListener('click', (e) => {
                // hide our user interface that shows our A2HS button
                addBtn.style.display = 'none';
                // Show the prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                    } else {
                    console.log('User dismissed the A2HS prompt');
                    }
                    deferredPrompt = null;
                });
            });
        });
    }
} catch (e) {
    let err = "Your browser is outdated, I suggest updating or upgrading to a new one.";
    document.write(err);
    console.warn(err);
}