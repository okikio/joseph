const { fetch } = window;
const { body } = document;
let slice = [].slice;

let loadImg = () => {
    let _img = slice.call(document.getElementsByClassName("loadimg"));
    let _navbar = slice.call(document.getElementsByClassName("n"));
    _navbar.forEach(function (nav) {
        nav.classList.add("nfs");
    });
    _img.forEach(function (img) {
        img.classList.add("coreimgshow");
    });
};

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
                    loadImg();
                    return;
                }

                res.text().then(data => {
                    script.innerHTML = data;
                    script.setAttribute("data-src", src);
                    body.appendChild(script);
                });
            })
            .catch(err => {
                script.setAttribute("src", src);
                body.appendChild(script);
                console.error('Fetch Error: ', err);
                loadImg();
            });
    } else {
        script.setAttribute("src", src);
        body.appendChild(script);
        // loadImg();
    }
} catch (e) {
    let err = "Your browser is outdated, I suggest updating or upgrading to a new one.";
    console.warn(err);
    loadImg();
}