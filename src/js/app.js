// import swup from "swup";
// import { el } from "./components/ele";
import { _log, _is, _constrain, _map, assign } from "./components/util";
// import Rellax from "rellax";
// import rallax from 'rallax.js';
// import preload from '@swup/preload-plugin';
// import scrollPlugin from "@swup/scroll-plugin";
// import { _is } from "./components/util";
// import anime from 'animejs';
import { on, toggleClass, each, find, get, addClass, removeClass, scrollTo, scrollTop, hasClass, height, style, off } from "./components/dom";
// import parallax from "./components/parallax";

let _img = ".layer-image";
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
each(_img, ($img, i) => {
    let load_img = get(find($img, ".load-img"), 0);
    let overlay = get(find($img, ".layer-image-overlay"), 0);
    let clientRect = $img.getBoundingClientRect();
    _images[i] = {
        overlay, load_img,
        target: $img,
        clientRect
    };

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

on(window, 'scroll', () => {
    let _scrollTop = scrollTop(window);
    hasClass(_navbar, "banner-mode") && addClass(_navbar, "navbar-focus") || toggleClass(_navbar, "navbar-focus", _scrollTop >= 5);
    hasClass(_navbar, "navbar-show") && removeClass(_navbar, "navbar-show");

    toggleClass(_actioncenter, "layer-action-center-show", _scrollTop > _focusPt * 2);
    toggleClass(_actioncenter, "layer-action-center-hide", _scrollTop <= _focusPt * 2);

    _images.forEach(data => {
        let { clientRect, load_img, overlay } = data;
        let { top, height } = clientRect;
        let dist = _scrollTop - top;

        if (dist >= 0) {
            let value = _constrain(dist, 0, height) / height;
            
            style(overlay, { opacity: _map(value, 0, 1, 0.15, 0.65) });
            style(load_img, {
                transform: `translateY(${value * height / 2}px) scale(${1 + value})`
            });
        }
    });
});

// let observer = new IntersectionObserver(entries => {
//     entries.forEach(entry => {
//         const { intersectionRect, boundingClientRect, target } = entry;
//         const { top, bottom, height } = boundingClientRect;
//         // const { top } = intersectionRect;
//         let load_img = find(target, ".load-img");
//         let overlay = find(target, ".layer-image-overlay");
//         let value = Math.max(Math.round((bottom - top) / height * 100) / 100, 0);

//         style(overlay, { opacity: _constrain(value, 0, 0.65) });
//         style(load_img, {
//             transform: `scale(${1 + value})`
//         });
//         _log(boundingClientRect);
//     });
// }, {
//     root: null,
//     rootMargin: "0px",
//     threshold: Array.from(Array(101), (_, x) => x / 100)
// });


// parallax('.load-img', {
//     play: true,
//     speed: -6,
//     center: true,
//     round: true,
// });




    // each('.load-img', ($el, i) => {
    //     if (inWin($el) && width(window) >= 600) {
    //         images[i].refresh();
    //     } else { images[i].destroy(); }

    //     i == 1 && console.log("Top: " + $el.getBoundingClientRect().top + " < Bottom: " + (height(window)));
    //     _log("In Window: " + inWin($el));
    // });

// new Rellax('.load-img', {
//     speed: width(window) > 600 ? 2 : 0,
//     center: false,
//     round: false,
//     vertical: true,
//     horizontal: false
// })

/*
    // let options = {
    //     root: null,
    //     rootMargin: '0px',
    //     threshold: 0,
    //     // threshold: Array.from(Array(101), (_, x) => x / 100)
    // };

    // let observer = new IntersectionObserver(entries => {
    //     entries.forEach((entry, i) => {
    //         // if (entry.isIntersecting) {
    //         if (entry.intersectionRatio > 0) {
    //             // this.onScreen(entry)

    //             anime({
    //                 targets: entry.target,
    //                 translateY: 0,
    //                 opacity: 1,
    //                 duration: 1000,
    //                 easing: 'easeInOutExpo',
    //                 delay: i * 500,
    //                 begin() {
    //                     observer.unobserve(entry.target);
    //                 }
    //             });
    //         } else {
    //             // this.offScreen(entry)
    //         }
    //         // }
    //     });
    // }, options);

    // el(".layer").forEach(_el => {
    //     observer.observe(_el);
    // });
};

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