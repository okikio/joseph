const { body } = document;
let slice = [].slice;

let loadImg = () => {
    let _img = slice.call(document.getElementsByClassName("load-img"));
    let _navbar = slice.call(document.getElementsByClassName("n"));
    _navbar.forEach(function (nav) {
        nav.classList.add("n-f-s");
    });
    _img.forEach(function (img) {
        img.classList.add("core-img-show");
    });
};

try {
    let script = document.createElement("script");
    let src = `/js/${window.isModern ? "modern" : "general"}.min.js`;
    
    if (window.isModern) {
        try {
            let srcset, box;
            let _img = slice.call(document.getElementsByClassName("load-img"));
            _img.forEach(function (img) {
                box = img.getBoundingClientRect();

                slice.call(img.querySelectorAll("source.webp")).forEach(el => {
                    srcset = el.getAttribute("data-srcset");
                    el.setAttribute("data-srcset",
                        srcset.replace(/w_[\d]+/, `w_${Math.round(box.width)}`)
                    );
                });
            });
        } catch (e) {
            console.warn("Error setting image width in vendor.js.");
            loadImg();
        }
    } 

    /* Depending on the browser load two different type of js file, one that supports all the new ecmascript standards,
    and a general one that uses the ecmascript 5 standard by default.
    The modern js file is much smaller because it follows newer echmascript standards */
    script.setAttribute("src", src);
    body.appendChild(script);
} catch (e) {
    let err = "Your browser is outdated, I suggest updating or upgrading to a new one.";
    console.warn(err);
    loadImg();
}