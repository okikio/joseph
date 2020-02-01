import { _is, _constrain, _map, _log } from "./components/util";
import { on, toggleClass, each, find, get, addClass, removeClass, scrollTo, scrollTop, hasClass, height, style, width, offset, attr } from "./components/dom";

import swup from "swup";
import headPlugin from '@swup/head-plugin';
import preload from '@swup/preload-plugin';
import scrollPlugin from "@swup/scroll-plugin";

let _layer = '.layer';
let _navbar = '.navbar';
let _hero = '.layer-hero';
let _menu = '.navbar-menu';
let _backUp = '.back-to-top';
let _navLink = '.navbar-link';
let _actioncenter = ".layer-action-center";
let _scrolldown = '.layer-hero-scroll-down';

let scroll, ready, resize, href, _images = [];
let _focusPt = height(_navbar) + 10;
let onload = $load_img => function () {
    addClass($load_img, "core-img-show");
};

on(_menu, "click", () => {
    toggleClass(_navbar, "navbar-show");
});

on(_backUp, "click", () => {
    scrollTo("0px", "1400ms");
});

on(window, {
    'resize': resize = () => {
        toggleClass(_scrolldown, "action-btn-expand", width(window) <= 650);
    },
    'scroll': scroll = () => {
        let _scrollTop = scrollTop(window);
        hasClass(_hero, "banner-mode") && addClass(_navbar, "navbar-focus") || toggleClass(_navbar, "navbar-focus", _scrollTop >= 5);
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

                        isHero && style(overlay, { opacity: _map(value, 0, 0.75, 0.55, 0.15) });
                        style(load_img, {
                            transform: `translateY(${_map(_constrain(value - _map(60, 0, height, 0, 1), 0, 1), 0, 1, 0, height / 2)}px)`,
                        });
                    }
                }
            });
        }
    }
});

ready = () => {
    _focusPt = height(_navbar) + 10;
    _images = [];

    on(_scrolldown, "click", () => {
        scrollTo(height(_hero) - _focusPt, "800ms");
    });

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

            let _core_img = get(find($img, ".core-img"), 0);
            if (_is.def(_core_img)) {
                if (_core_img.complete && _core_img.naturalWidth !== 0) {
                    onload(load_img)();
                } else if (!window.isModern) {
                    let img = new Image(_core_img);
                    img.src = attr(_core_img, "src");
                    img.onload = onload(load_img);
                } else {
                    on(_core_img, "load", onload(load_img));
                }
            }
        });
    });

    resize();
    scroll();
};

ready();

try {
    const Swup = new swup({
        animateHistoryBrowsing: true,
        containers: ["[data-container]"],
        linkSelector: `a[href^="${window.location.origin}"]:not([data-no-transition]), a[href^="/"]:not([data-no-transition])`,
        plugins: [
            new preload(),
            new headPlugin(),
            new scrollPlugin({
                doScrollingRightAway: false,
                animateScroll: true,
                scrollFriction: 0.3,
                scrollAcceleration: 0.04,
            })
        ]
    });

    // This event runs for every page view after initial load
    Swup.on('contentReplaced', ready);
    Swup.on('willReplaceContent', () => {
        href = window.location.href;
        removeClass(_navLink, "navbar-link-focus");
        each(_navLink, _link => {
            href == _link.href && addClass(_link, "navbar-link-focus");
        });
    });
} catch (e) {
    _log(`Swup Error: ${e.message}`);
}