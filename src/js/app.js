import { _is, _constrain, _map, _log } from "./components/util";
import { on, toggleClass, each, find, get, addClass, removeClass, scrollTo, scrollTop, hasClass, height, style, width, offset, attr } from "./components/dom";

import barba from '@barba/core';
import anime from 'animejs';
// import { statemanager } from './components/state-manager';

let _layer = ".layer";
let _navbar = '.navbar';
let _hero = ".layer-hero";
let _menu = '.navbar-menu';
let _backUp = '.back-to-top';
let _actioncenter = ".layer-action-center";
let _scrolldown = '.layer-hero-scroll-down';

// statemanager();

try {
    let _focusPt = height(_navbar) + 10;

    //  touchstart
    on(_menu, "click", () => {
        toggleClass(_navbar, "navbar-show");
    });

    // touchstart
    on(_backUp, "click", () => {
        scrollTo("0px", "1400ms");
    });

    // touchstart
    on(_scrolldown, "click", () => {
        scrollTo(height(_hero) + _focusPt, "800ms");
    });

    let _images = [];
    let onload = ([$load_anim, $load_img]) => function () {
        removeClass($load_anim, "load-animation");
        addClass($load_img, "core-img-show");
    };

    each(_layer, $layer => {
        let layer_image = find($layer, ".layer-image");
        let isHero = hasClass($layer, "layer-hero-id");
        
        each(layer_image, $img => {
            let load_img = get(find($img, ".load-img"), 0);
            let overlay = get(find($img, ".layer-image-overlay"), 0);
            let clientRect = offset($img);
            
            _images.push({
                overlay, load_img,
                target: $img,
                clientRect,
                isHero
            });

            let load_anim = get(find($img, ".layer-image-preview-img-card"), 0);
            let _core_img = get(find($img, ".core-img"), 0);
            if (_is.def(_core_img)) {
                if (_core_img.complete && _core_img.naturalWidth !== 0) {
                    onload([load_anim, load_img]) ();
                } else {
                    if (!window.isModern) {
                        let img = new Image(_core_img);
                        img.src = attr(_core_img, "src");
                        img.onload = onload([load_anim, load_img]);
                    } else {
                        on(_core_img, "load", onload([load_anim, load_img]));
                    }
                }
            }
        });
    });

    let _load, resize;
    on(window, 'resize', resize = () => {
        toggleClass(_backUp, "btn-expand", width(window) > 650);
        toggleClass(_scrolldown, "btn-expand", width(window) > 650);
    });

    on(window, 'scroll', _load = () => {
        let _scrollTop = scrollTop(window);
        resize();
        hasClass(_navbar, "banner-mode") && addClass(_navbar, "navbar-focus") || toggleClass(_navbar, "navbar-focus", _scrollTop >= 5);
        hasClass(_navbar, "navbar-show") && removeClass(_navbar, "navbar-show");

        toggleClass(_actioncenter, "layer-action-center-show", _scrollTop > _focusPt * 4);
        toggleClass(_actioncenter, "layer-action-center-hide", _scrollTop <= _focusPt * 4);

        if (width(window) > 500) {
            _images.forEach(data => {
                if (hasClass(data.target, "effect-parallax")) {
                    let { clientRect, load_img, overlay, isHero } = data;
                    let { top, height } = clientRect;
                    let dist = _scrollTop - top + 60;

                    if (dist >= -_focusPt && dist <= height - _focusPt) {
                        let value = Math.round(_map(_constrain(dist, 0, height), 0, height, 0, 1) * 100) / 100;

                        style(overlay, { opacity: _map(value, 0, 0.75, 0.35, 0.15) });
                        style(load_img, {
                            transform: `translateY(${_map(_constrain(value - _map(60, 0, height, 0, 1), 0, 1), 0, 1, 0, height / 2)}px)`,
                        });
                    }
                }
            });
        }
    });

    // basic default transition (with no rules and minimal hooks)
    barba.init({
        transitions: [{
            before({ current, next, trigger }) {
                const done = this.async();
                let url = next.url.path;

                anime.timeline()
                    .add({
                        targets: "#yellow-banner",
                        height: "100vh",
                        easing: "easeOutSine",
                        duration: 400,
                    })
                    .add({
                        targets: document.scrollingElement || document.body || document.documentElement,
                        scrollTop: 0,
                        easing: "easeOutSine",
                        delay: 200,
                        duration: 400,
                    })
                    .add({
                        targets: ".mobile-on",
                        height: "50px",
                        easing: "easeOutSine",
                        duration: 600,
                        complete() {
                            let mobileON = Page.ele(".mobile-on");
                            mobileON.each(el => {
                                mobileON.style(el, {
                                    height: "0"
                                });
                                el.classList.remove("mobile-on");
                            });
                        }
                    }, 0)
                    .add({
                        targets: "#yellow-banner",
                        easing: "easeOutSine",
                        delay: 400,
                        duration: 400,
                        complete() {
                            Util.pageSetup(url);
                            done();
                        },
                    });
            },
            enter({ current, next, trigger }) {
                const done = this.async();
                try {
                    document.title = next.container.getAttribute('title');
                    Page.base.call(base);
                } catch (e) {
                    console.log(e.message);
                }
                done();
            },
            after({ current, next, trigger }) {
                const done = this.async();
                anime.timeline()
                    .add({
                        targets: "#yellow-banner",
                        height: "0vh",
                        delay: 200,
                        easing: "easeOutSine",
                        duration: 400,
                        complete() {
                            done();
                        }
                    });
            },
        }]
    });
    _load();

} catch (e) {
    let _img = [...document.getElementsByClassName("load-animation")];
    let _navbar = [...document.getElementsByClassName("navbar")];
    _navbar.forEach(function (nav) {
        nav.classList.add("navbar-focus");
    });
    _img.forEach(function (img) {
        img.classList.remove("load-animation");
    });
}
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

 */
