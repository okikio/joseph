
// Imported external libraries
import swup from "swup";
import headPlugin from '@swup/head-plugin';
// import preload from '@swup/preload-plugin';
import scrollPlugin from "@swup/scroll-plugin";

// Internal use components
import { _constrain, _map, optimize, toFixed } from "./components/util";
import { on, off, toggleClass, each, find, get, addClass, removeClass, scrollTo, scrollTop, hasClass, height, style, width, offset, attr } from "./components/dom";

// fpsCounter();
const _layer = optimize('.layer');
const _navbar = optimize('.navbar');
const _hero = optimize('.layer-hero');
const _menu = optimize('.navbar-menu');
const _backUp = optimize('.back-to-top');
const _skipMain = optimize(".skip-main");
const _navLink = optimize('.navbar-link');
const _layer_img = optimize(".layer-image");
const _actioncenter = optimize(".layer-action-center");
const _scrolldown = optimize('.layer-hero-scroll-down');
const linkSelector = `a[href^="${window.location.origin}"]:not([data-no-pjax]), a[href^="/"]:not([data-no-pjax])`;

let scroll, resize, href, init, _focusPt, _images = [], srcset, src, goDown;
let layer_image, isHero, load_img, overlay, clientRect, _core_img, srcWid, header, main, _scrollTop, isBanner, _isbanner, windowWid;
let _isMobile, _fixedPt, dist, value, maxMove, transform, opacity;

_focusPt = height(_navbar) + 10; // The focus pt., 10px past the height of the navbar
windowWid = width(window); // Window Width should stay pretty constant

let onload = $load_img => function () {
    addClass($load_img, "core-img-show"); // Hide the image preview
};

// On navbar menu click (this will only occur on mobile), show navbar
on(_menu, "click", () => {
    toggleClass(_navbar, "navbar-show");
});

// On backup button click animate back to the top
on(_backUp, "click", () => {
    scrollTo("0px", "1400ms");
});

// On skip main button click, animate to the main content
on(_skipMain, "click", e => {
    e.preventDefault();
    let { top } = offset("#content");
    scrollTo(top, "1400ms");
});

on(window, {
    // On window resize make sure the scroll down hero button, is expanded and visible
    'resize': resize = () => {
        // Prevent layout-thrashing: [wilsonpage.co.uk/preventing-layout-thrashing/]
        requestAnimationFrame(() => {
            windowWid = width(window);
            toggleClass(_scrolldown, "action-btn-expand", windowWid <= 650);

            // Only on modern browsers
            if (window.isModern) {
                // Find the layer-images in each layer
                each(_layer_img, $img => {
                    load_img = get(find($img, ".load-img"), 0);
                    srcWid = Math.round(width($img));

                    // Find the core-img in the layer-image container
                    _core_img = get(find(load_img, ".core-img"), 0);

                    // Make sure the image that is loaded is the same size as its container
                    srcset = attr(get(find(load_img, ".webp"), 0), "data-srcset");

                    // On larger screens load smaller images, for faster image load times
                    src = srcset.replace(/w_[\d]+/, `w_${srcWid > 550 ? srcWid - 200 : srcWid}`);

                    // Safari still doesn't support WebP
                    if (!window.WebpSupport) {
                        src = src.replace(".webp", ".jpg");
                        console.log("Using JPG instead, of WEBP");
                    }

                    // Ensure the image has loaded, then replace the small preview
                    attr(_core_img, "src", src);
                    on(_core_img, "load", onload(load_img));
                });
            }
        });
    },

    // On scroll accomplish a set of tasks
    'scroll': scroll = () => {
        // Prevent layout-thrashing: [wilsonpage.co.uk/preventing-layout-thrashing/]
        requestAnimationFrame(() => {
            windowWid = width(window);
            _scrollTop = scrollTop(window);
            isBanner = hasClass(_layer, "banner-mode");

            // If the current page uses a banner ensure the navbar is still visible
            toggleClass(_navbar, "navbar-focus", isBanner || _scrollTop >= 5);

            // On mobile if the window is scrolled remove main navbar menu from view
            hasClass(_navbar, "navbar-show") && removeClass(_navbar, "navbar-show");

            // Hide and show the action-center if the window has been scrolled 10px past the height of the navbar
            toggleClass(_actioncenter, "layer-action-center-show", _scrollTop > _focusPt * 4);
            toggleClass(_actioncenter, "layer-action-center-hide", _scrollTop <= _focusPt * 4);

            // If device width is greater than 700px
            if (windowWid > 300 && window.isModern) {
                _isMobile = windowWid < 650;
                _fixedPt = _isMobile ? 2 : 4;
                _images.forEach(data => {
                    // On scroll turn on parallax effect for images with the class "effect-parallax"
                    if (hasClass(data.target, "effect-parallax")) {
                        let { clientRect, load_img, overlay, isHero, _isBanner, header, main } = data;
                        let { top, height } = clientRect;
                        dist = _scrollTop - top + _focusPt * 2;

                        // Some complex math, I can't explain it very well, but it works
                        if (dist >= -_focusPt && dist <= height - _focusPt / 2) {
                            value = _constrain(dist - _focusPt, 0, height);
                            isHero && style(overlay, { opacity: toFixed(_map(value, 0, height * 0.75, 0.45, 0.7), _fixedPt) });

                            // Ensure moblie devices can handle smooth animation, or else the parallax effect is pointless
                            // FPS Counter test: !(fpsCounter.fps < 24 && windowWid < 500)
                            if (!_isMobile) {
                                style(load_img, {
                                    transform: `translate3d(0, ${toFixed(_map(
                                        _constrain(value - (_isBanner ? _focusPt * 2 : 20), 0, height),
                                    0, height * 0.75, 0, height / 2), _fixedPt)}px, 0)`,
                                });
                            }

                            maxMove = _isBanner ? 6 : 5;
                            transform = `translate3d(0, ${toFixed(
                                _constrain(
                                    _map(value - (_isBanner ? _focusPt : 0), 0, height * 0.65, 0, height * maxMove / 16),
                                0, height * maxMove / 16),
                            _fixedPt)}px, 0)`;
                            opacity = toFixed(
                                _constrain(
                                    _map(_constrain(value - (height * 0.15), 0, height), 0, height * 0.40, 1, 0),
                                0, 1),
                            _fixedPt + 2);

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
        });
    }
});

// Method to run on scroll down button click
goDown = () => {
    scrollTo(height(_hero), "800ms");
};

// Initialize images
init = () => {
    // Clear images efficiently [smashingmagazine.com/2012/11/writing-fast-memory-efficient-javascript/]
    while (_images.length > 0) _images.pop();

    // On scroll down button click animate scroll to the height of the hero layer
    on(_scrolldown, "click", goDown);

    // Prevent layout-thrashing: [wilsonpage.co.uk/preventing-layout-thrashing/]
    requestAnimationFrame(() => {
        // Find the layer-images in each layer
        each(_layer, $layer => {
            layer_image = find($layer, _layer_img);
            isHero = hasClass($layer, "layer-hero-id");

            if (isHero) {
                _isbanner = hasClass($layer, "banner-mode");
                header = get(find($layer, ".layer-header"), 0);
                main = get(find($layer, ".layer-main"), 0);
            }

            // In each layer-image find load-img image container and store all key info. important for creating a parallax effect
            each(layer_image, $img => {
                load_img = get(find($img, ".load-img"), 0);
                overlay = get(find($img, ".layer-image-overlay"), 0);
                clientRect = offset($img);

                _images.push({
                    _isBanner: _isbanner,
                    overlay, load_img,
                    target: $img,
                    clientRect,
                    header,
                    isHero,
                    main
                });
            });
        });
    });
};

// Run once each page, this is put into SWUP, so for every new page, all the images transition without having to maually rerun all the scripts on the page
init();
scroll();
resize();

on(document, "ready", () => {
    // SWUP library
    try {
        // To avoid bugs in older browser, SWUP can only run if the browser supports modern es6 features or supports webp (most browser that support webp can handle the history management SWUP does)
        if (window.isModern || window.WebpSupport) {
            console.log("%cDocument loaded, SWUP starting...", "color: #00c300");

            // Page transition manager SWUP for faster page loads
            const Swup = new swup({
                linkSelector,
                animateHistoryBrowsing: true,
                containers: ["[data-container]"],
                plugins: [
                    // new preload(), // Preload pages
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
            Swup.on("clickLink", () => {
                // Remove click event from scroll down button
                off(_scrolldown, "click", goDown);
            });
            Swup.on('contentReplaced', () => {
                init(); scroll(); resize();
            });
            Swup.on('animationInStart', () => {
                requestAnimationFrame(() => {
                    if (width(window) <= 700) {
                        removeClass(_navbar, "navbar-show");
                    }
                });
            });
            Swup.on('transitionStart', () => {
                requestAnimationFrame(() => {
                    href = window.location.href;

                    removeClass(_navLink, "navbar-link-focus");
                    each(_navLink, _link => {
                        href == _link.href && addClass(_link, "navbar-link-focus");
                    });
                });
            });
        }
    } catch (e) {
        // Swup isn't very good at handling errors in page transitions, so to avoid errors blocking the site from working properly; if SWUP crashes it should fallback to normal page linking
        on(linkSelector, 'click', e => {
            window.location.href = e.currentTarget.href;
        });

        console.error(`Swup Error: ${e.message}`);
    }
});
