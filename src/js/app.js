import { _is, _constrain, _map, _log } from "./components/util";
import { on, toggleClass, each, find, get, addClass, removeClass, scrollTo, scrollTop, hasClass, height, style, width, offset, attr } from "./components/dom";

let _layer = ".layer";
let _navbar = '.navbar';
let _hero = ".layer-hero";
let _menu = '.navbar-menu';
let _backUp = '.back-to-top';
let _actioncenter = ".layer-action-center";
let _scrolldown = '.layer-hero-scroll-down';

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
    let onload = $load_img => function () {
        removeClass($load_img, "load-animation");
    };

    each(_layer, $layer => {
        let header = get(find($layer, ".layer-header"), 0);
        let main = get(find($layer, ".layer-main"), 0);
        let layer_image = find($layer, ".layer-image");
        let isHero = hasClass($layer, "layer-hero-id");
        
        each(layer_image, $img => {
            let load_img = get(find($img, ".load-img"), 0);
            let overlay = get(find($img, ".layer-image-overlay"), 0);
            let clientRect = offset($img);
            
            _images.push({
                header: isHero ? header : null,
                main: isHero ? main : null,
                overlay, load_img,
                target: $img,
                clientRect,
                isHero
            });

            let load_anim = get(find($img, ".layer-image-preview-img-card"), 0);
            let _core_img = get(find($img, ".core-img"), 0);
            if (_is.def(_core_img)) {
                if (_core_img.complete && _core_img.naturalWidth !== 0) {
                    onload(load_anim) ();
                } else {
                    if (!window.isModern) {
                        let img = new Image(_core_img);
                        img.src = attr(_core_img, "src");
                        img.onload = onload(load_anim);
                    } else {
                        on(_core_img, "load", onload(load_anim));
                    }
                }
            }
        });
    });

    let _load, resize;
    on(window, 'resize', resize = () => {
        toggleClass(_backUp, "btn-expand", width(window) > 500);
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
                    let { clientRect, load_img, overlay, header, main, isHero } = data;
                    let { top, height } = clientRect;
                    let dist = _scrollTop - top + 60;

                    if (dist >= -_focusPt && dist <= height - _focusPt) {
                        let value = Math.round(_map(_constrain(dist, 0, height), 0, height, 0, 1) * 100) / 100;

                        style(overlay, { opacity: _map(value, 0, 0.75, 0.35, 0.15) });
                        style(load_img, {
                            transform: `translateY(${_map(_constrain(value - _map(60, 0, height, 0, 1), 0, 1), 0, 1, 0, height / 2)}px)`,
                        });
                        
                        if (isHero) {
                            let translate = _constrain(_map(value, 0, 0.75, 0, height * 5 / 16), 0, height * 5 / 16);
                            let opacity = _constrain(_map(_constrain(value - 0.15, 0, 1), 0, 0.40, 1, 0), 0, 1);

                            header && style(header, {
                                transform: `translateY(${translate}px)`,
                                opacity
                            });
                            
                            main && style(main, {
                                transform: `translateY(${translate}px)`,
                                opacity
                            });
                        }
                    }
                }
            });
        }
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

// / global location, XMLHttpRequest, Location, requestAnimationFrame, cancelAnimationFrame, history, HTMLElement, HTMLScriptElement, HTMLAnchorElement, HTMLDocument, DOMParser, Event, getComputedStyle

// /
//  * Export.
//  /
const pjax = {

    // /
    //  * Configuration.


    // Disables pjax globally.
    disabled: false,

    // How long until we run loading indicators.
    loadIndicatorDelay: 250,

    // Called when loading takes longer than `loadIndicatorDelay`. Should
    // visibly indicate the loading.
    onIndicateLoadStart() {
        document.documentElement.style.transition = 'opacity linear 0.05s'
        document.documentElement.style.opacity = '0.8'
    },

    // Called when transition is finished. Should roll back the effects of
    // `onIndicateLoadStart`.
    onIndicateLoadEnd() {
        document.documentElement.style.transition = ''
        document.documentElement.style.opacity = ''
    },

    // If a CSS selector is provided, it's checked every time when scrolling to an
    // element (e.g. via data-scroll-to-id). If an element with the {position:
    // 'fixed', top: '0px'} computed style properties is found, the scroll
    // position will be offset by that element's height.
    scrollOffsetSelector: '',

    // If a value is provided, it will be used as the default id for the
    // `[data-scroll-to-id]` attribute.
    defaultMainId: '',

    // /
    //  * Methods.
    //  /

    // Triggers a pjax transition to the current page, reloading it without
    // destroying the JavaScript runtime and other assets.
    reload() {
        transitionTo(createConfig(location, {
            'data-noscroll': true,
            'data-force-reload': true
        }))
    }
}

// Export in a CommonJS environment, otherwise assign to window.
if (typeof module === 'object' && module !== null &&
    typeof module.exports === 'object' && module.exports !== null) {
    module.exports = pjax
} else {
    window.simplePjax = pjax
}
 */
