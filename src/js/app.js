
// Imported external libraries
import swup from "swup";
import headPlugin from '@swup/head-plugin';
import preload from '@swup/preload-plugin';
import scrollPlugin from "@swup/scroll-plugin";

// Internal use components
import { _is, _constrain, _map, optimize } from "./components/util";
import { el, on, toggleClass, each, find, get, addClass, removeClass, scrollTo, scrollTop, hasClass, height, style, width, offset, attr } from "./components/dom";

const _layer = optimize('.layer');
const _navbar = optimize('.navbar');
const _hero = optimize('.layer-hero');
const _menu = optimize('.navbar-menu');
const _backUp = optimize('.back-to-top');
const _navLink = optimize('.navbar-link');
const _layer_img = optimize(".layer-image");
const _actioncenter = optimize(".layer-action-center");
const _scrolldown = optimize('.layer-hero-scroll-down');
const linkSelector = `a[href^="${window.location.origin}"]:not([data-no-pjax]), a[href^="/"]:not([data-no-pjax]), a[href^="../"]:not([data-no-pjax])`;

let scroll, ready, resize, href, init, _focusPt, _images = [], srcset;
let layer_image, isHero, load_img, overlay, clientRect, _core_img, img, $src, srcWid, header, main, _scrollTop, isBanner;
let onload = $load_img => function () {
    addClass($load_img, "core-img-show"); // Hide the image preview
};

// On navbar menu click (this will only occur on mobile), show navbar
on(_menu, "click", () => {
    toggleClass(_navbar, "navbar-show");
});

on(_navLink, "click", () => {
    if (width(window) <= 700) {
        removeClass(_navbar, "navbar-show");
    }
});

// On backup button click animate back to the top
on(_backUp, "click", () => {
    scrollTo("0px", "1400ms");
});

on(window, {
    // On window resize make sure the scroll down hero button, is expanded and visible
    'resize': resize = () => {
        toggleClass(_scrolldown, "action-btn-expand", width(window) <= 650);

        // Only on modern browsers
        if (window.isModern) {
            // Find the layer-images in each layer
            each(_layer_img, $img => {
                srcWid = Math.round(width($img));

                // Make sure the image that is loaded is the same size as its container
                each(el("source.webp", $img), $src => {
                    srcset = attr($src, "srcset");

                    attr($src, "srcset",
                        srcset.replace(/w_[\d]+/, `w_${srcWid}`)
                    );
                });
            });
        }
    },

    // On scroll accomplish a set of tasks
    'scroll': scroll = () => {
        _scrollTop = scrollTop(window);
        isBanner = hasClass(_hero, "banner-mode");

        // If the current page uses a banner ensure the navbar is still visible
        toggleClass(_navbar, "navbar-focus", isBanner || _scrollTop >= 5);

        // On mobile if the window is scrolled remove main navbar menu from view
        hasClass(_navbar, "navbar-show") && removeClass(_navbar, "navbar-show");

        // Hide and show the action-center if the window has been scrolled 10px past the height of the navbar
        toggleClass(_actioncenter, "layer-action-center-show", _scrollTop > _focusPt * 4);
        toggleClass(_actioncenter, "layer-action-center-hide", _scrollTop <= _focusPt * 4);

        // If device width is greater than 700px
        if (width(window) > 700) {
            _images.forEach(data => {
                // On scroll turn on parallax effect for images with the class "effect-parallax"
                if (hasClass(data.target, "effect-parallax")) {
                    let { clientRect, load_img, overlay, isHero, header, main } = data;
                    let { top, height } = clientRect;
                    let dist = _scrollTop - top + _focusPt * 2;

                    // Some complex math, I can't explain it very well, but it works
                    if (dist >= -_focusPt && dist <= height - _focusPt / 2) {
                        let value = _map(_constrain(dist - _focusPt, 0, height), 0, height, 0, 1);

                        isHero && style(overlay, { opacity: _map(value, 0, 0.75, 0.45, 0.7) });
                        style(load_img, {
                            transform: `translate3d(0, ${_map(_constrain(value - _map(60, 0, height, 0, 1), 0, 1), 0, 0.65, 0, height / 2)}px, 0)`,
                        });

                        let transform = `translate3d(0, ${_constrain(_map(value, 0, 0.85, 0, height * 5 / 16), 0, height * 5 / 16)}px, 0)`;
                        let opacity = _constrain(_map(_constrain(value - 0.15, 0, 1), 0, 0.40, 1, 0), 0, 1);

                        if (header) {
                            style(header, { transform });
                        }

                        if (main) {
                            style(main, { transform, opacity });
                        }
                    }
                }
            });
        }
    }
});

// Initialize images
init = () => {
    // Find the layer-images in each layer
    each(_layer, $layer => {
        layer_image = find($layer, ".layer-image");
        isHero = hasClass($layer, "layer-hero-id");

        if (isHero) {
            header = get(find($layer, ".layer-header"), 0);
            main = get(find($layer, ".layer-main"), 0);
        }

        // In each layer-image find load-img image container and store all key info. important for creating a parallax effect
        each(layer_image, $img => {
            load_img = get(find($img, ".load-img"), 0);
            overlay = get(find($img, ".layer-image-overlay"), 0);
            clientRect = offset($img);

            _images.push({
                overlay, load_img,
                target: $img,
                clientRect,
                header,
                isHero,
                main
            });

            // Find the core-img in the load-img container, ensure the image has loaded, then replace the small preview
            _core_img = get(find($img, ".core-img"), 0);
            if (_is.def(_core_img)) {
                if (_core_img.complete && _core_img.naturalWidth !== 0) {
                    onload(load_img)();
                } else if (!window.isModern) {
                    $src = get(find($img, "source.webp"), 0);
                    img = new Image(_core_img);
                    img.src = attr($src, "srcset");
                    img.onload = onload(load_img);
                } else {
                    on(_core_img, "load", onload(load_img));
                }
            }
        });
    });
};

// Run once each page, this is put into SWUP, so for every new page, all the images transition without having to maually rerun all the scripts on the page
ready = () => {
    _focusPt = height(_navbar) + 10; // The focus pt., 10px past the height of the navbar
    _images = [];

    // On scroll down button click animate scroll to the height of the hero layer
    on(_scrolldown, "click", () => {
        scrollTo(height(_hero), "800ms");
    });

    init();
    resize();
    scroll();
};

// Ready to get started
ready();

on(document, "ready", () => {
    console.log("%cDocument loaded, SWUP starting...", "color: #00c300");

    // SWUP library
    try {
        // To avoid bugs in older browser, SWUP can only run if the browser supports modern es6 features is defined
        if (window.isModern) {
            // Page transition manager SWUP for faster page loads
            const Swup = new swup({
                linkSelector,
                animateHistoryBrowsing: true,
                containers: ["[data-container]"],
                plugins: [
                    new preload(), // Preload pages
                    new headPlugin(), // Replace the contents of the head elements

                    // For every new page, scroll to the top smoothly
                    new scrollPlugin({
                        doScrollingRightAway: false,
                        animateScroll: false,
                        scrollFriction: 0.3,
                        scrollAcceleration: 0.04,
                    })
                ]
            });

            // Remove initial cache, the inital cache is always incomplete
            Swup.cache.remove(window.location.href);

            // This event runs for every page view after initial load
            Swup.on('contentReplaced', ready);
            Swup.on('willReplaceContent', () => {
                href = window.location.href;
                removeClass(_navLink, "navbar-link-focus");
                each(_navLink, _link => {
                    href == _link.href && addClass(_link, "navbar-link-focus");
                });
            });
        }
    } catch (e) {
        // Swup isn't very good at handling errors in page transitions, so to avoid errors blocking the site from working properly; if the Swup crashes it should fallback to normal page linking
        on(linkSelector, 'click', e => {
            window.location.href = e.currentTarget.href;
        });

        console.error(`Swup Error: ${e.message}`);
    }
});