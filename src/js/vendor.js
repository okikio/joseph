const { fetch } = window;
const { body } = document;

try {
    let script = document.createElement("script");
    let src = `./js/${window.isModern ? "modern" : "general"}.min.js`;

    /* Depending on the browser load two different type of js file, one that supports all the new ecmascript standards,
       and a general one that uses the ecmascript 5 standard by default.
       The modern js file is much smaller because it follows newer echmascript standards */
    if (window.isModern) {
        fetch(src, {
            headers: new Headers({'content-type': 'text/javascript; charset=utf-8'})
        })
            .then(res => {
                if (!res.ok) {
                    console.warn('Looks like there was a problem. Status Code: ', status);
                    return;
                }

                res.text().then(data => {
                    script.innerHTML = data;
                    body.appendChild(script);
                });
            })
            .catch(err => {
                script.setAttribute("src", src);
                body.appendChild(script);
                console.error('Fetch Error: ', err);
            });
    } else {
        script.setAttribute("src", src);
        body.appendChild(script);
    }
} catch (e) {
    let err = "Your browser is outdated, I suggest updating or upgrading to a new one.";
    console.warn(err);

    let _img = [...document.getElementsByClassName("load-animation")];
    let _navbar = [...document.getElementsByClassName("navbar")];
    _navbar.forEach(function (nav) {
        nav.classList.add("navbar-focus");
    });
    _img.forEach(function (img) {
        img.classList.remove("load-animation");
    });
}