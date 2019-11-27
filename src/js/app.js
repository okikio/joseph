import { _is, _constrain, _map } from "./components/util";
import { on, toggleClass, each, find, get, addClass, removeClass, scrollTo, scrollTop, hasClass, height, style } from "./components/dom";

let _layer = ".layer";
let _navbar = '.navbar';
let _hero = ".layer-hero";
let _menu = '.navbar-menu';
let _backUp = '.back-to-top';
let _actioncenter = ".layer-action-center";
let _scrolldown = '.layer-hero-scroll-down';

let _height = height(_navbar);
let _focusPt = _height + 10;

//  touchstart
on(_menu, "click", () => {
    toggleClass(_navbar, "navbar-show");
});

// touchstart
on(_backUp, "click touchstart", () => {
    scrollTo("0px", "700s");
});

// touchstart
on(_scrolldown, "click touchstart", () => {
    scrollTo(height(_hero) + _focusPt, "700s");
});

let _images = [];
each(_layer, $layer => {
    let header = get(find($layer, ".layer-header"), 0);
    let footer = get(find($layer, ".layer-footer"), 0);
    let layer_image = find($layer, ".layer-image");
    
    each(layer_image, ($img, i) => {
        let load_img = get(find($img, ".load-img"), 0);
        let overlay = get(find($img, ".layer-image-overlay"), 0);
        let clientRect = $img.getBoundingClientRect();
        _images.push({
            header: i === 0 ? header : null,
            footer: i === 0 ? footer : null,
            overlay, load_img, 
            target: $img,
            clientRect
        });

        let _core_img = get(find($img, ".core-img"), 0);
        let _placeholder_img = find($img, ".placeholder-img");

        if (_is.def(_core_img)) {
            if (_core_img.complete) {
                addClass(_placeholder_img, "core-img-show");
            } else {
                on(_core_img, "load", function () {
                    addClass(_placeholder_img, "core-img-show");
                }, false);
            }
        }
    });
});

on(window, 'scroll', () => {
    let _scrollTop = scrollTop(window);
    hasClass(_navbar, "banner-mode") && addClass(_navbar, "navbar-focus") || toggleClass(_navbar, "navbar-focus", _scrollTop >= 5);
    hasClass(_navbar, "navbar-show") && removeClass(_navbar, "navbar-show");

    toggleClass(_actioncenter, "layer-action-center-show", _scrollTop > _focusPt * 2);
    toggleClass(_actioncenter, "layer-action-center-hide", _scrollTop <= _focusPt * 2);

    _images.forEach(data => {
        let { clientRect, load_img, overlay, header, footer } = data;
        let { top, height } = clientRect;
        let dist = _scrollTop - top + 60;

        if (dist >= -60 && dist <= height - 60) {
            let value = Math.round(_constrain(dist, 0, height) / height * 100) / 100;
            
            style(overlay, { opacity: _map(value, 0, 0.75, 0.15, 0.55) });
            style(load_img, {
                transform: `scale(${1 + _map(value, 0, 1, 0, 0.65)})`
            });

            if (header)
                style(header, {
                    transform: `translateY(${_constrain(_map(value, 0, 1, 0, height / 2), 0, height / 2 - 60)}px)`
                });

            if (footer)
                style(footer, { opacity: _map(value, 0, 0.5, 1, 0) });
        }
    });
});

/*
_load();
new swup({
    requestHeaders: {
        "X-Requested-With": "swup", // So we can tell request comes from swup
        "x-partial": "swup" // Request a partial html page
    },
    plugins: [new scrollPlugin({
        doScrollingRightAway: false,
        animateScroll: true,
        scrollFriction: 0.3,
        scrollAcceleration: 0.04,
    })] // new preload(),
})

// This event runs for every page view after initial load
.on('contentReplaced', _load);

// try {
} catch (e) {
let _img = [...document.getElementsByClassName("placeholder-img")];
let _navbar = [...document.getElementsByClassName("navbar")];
_navbar.forEach(function (nav) {
    nav.classList.add("navbar-focus");
});
_img.forEach(function (img) {
    img.classList.add("core-img-show");
});
} */