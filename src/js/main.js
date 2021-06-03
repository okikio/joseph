// Imported external libraries
import swup from "swup";
import scrollPlugin from "@swup/scroll-plugin";
import preloadPlugin from "@swup/preload-plugin";

// Internal use components
import { setTheme, getTheme } from "./theme";
import { _constrain, _map, toFixed } from "./components/util";
import { on, off, toggleClass, each, find, get, addClass, removeClass, scrollTo, scrollTop, hasClass, height, style, width, offset, attr } from "./components/dom";

const _layer = '.layer';
const _navbar = '.navbar';
const _hero = '.layer-hero';
const _menu = '.navbar-menu';
const _backUp = '.back-to-top';
const _skipMain = ".skip-main";
const _navLink = '.navbar-link';
const _layer_img = ".layer-image";
const _load_img = ".load-img";
const _themeSwitcher = ".theme-switcher";
const _actioncenter = ".layer-action-center";
const _scrolldown = '.layer-hero-scroll-down';
const linkSelector = `a[href^="${window.location.origin}"]:not([data-no-pjax]), a[href^="/"]:not([data-no-pjax])`;

let onload = $load_img => function () {
    addClass($load_img, "core-img-show"); // Hide the image preview
};

// On navbar menu click (this will only occur on mobile; click is a tiny bit more efficient), show navbar
on(_menu, "click", () => {
    toggleClass(_navbar, "navbar-show");
    attr(_menu, "aria-expanded", `` + hasClass(_navbar, "navbar-show"));
});

// The focus pt., 10px past the height of the navbar
let navHeight = height(_navbar);
let _images = new Set(), windowWid;
let resize, scroll;
let canScroll = true, canResize = true;
on(window, {
    // On window resize make sure the scroll down hero button, is expanded and visible
    'resize': resize = () => {
        // Prevent layout-thrashing: [wilsonpage.co.uk/preventing-layout-thrashing/]
        if (canResize) {
            let srcset, src, _core_img, srcWid, srcHei;
            let timer, raf;
            canResize = false;

            raf = requestAnimationFrame(() => {
                windowWid = width(window);
                toggleClass(_scrolldown, "action-btn-expand", windowWid <= 650);

                // Find the layer-images in each layer
                each(_load_img, $img => {
                    srcWid = Math.round(width($img));
                    srcHei = Math.round(height($img));

                    // Find the core-img in the layer-image container
                    _core_img = get(find($img, ".core-img"), 0);

                    // Make sure the image that is loaded is the same size as its container
                    srcset = attr(_core_img, "data-src");

                    // On larger screens load smaller images, for faster image load times
                    src = srcset.replace(/w_auto/, `w_${srcWid}`);
                    if (srcHei > srcWid) src = src.replace(/ar_4:3,/, `ar_3:4,`);

                    // Only load a new image If something has changed
                    if (src !== attr(_core_img, "src")) {
                        // Ensure the image has loaded, then replace the small preview
                        attr(_core_img, "src", src);
                        on(_core_img, "load", onload($img));
                    }
                });

                // set a timeout to un-throttle
                timer = window.setTimeout(() => {
                    canResize = true;
                    timer = window.clearTimeout(timer);
                    raf = window.cancelAnimationFrame(raf);
                }, 150);
            });
        }
    },

    // On scroll accomplish a set of tasks
    'scroll': scroll = () => {
        // Prevent layout-thrashing: [wilsonpage.co.uk/preventing-layout-thrashing/]
        if (canScroll) {
            let raf;
            canScroll = false;

            raf = window.requestAnimationFrame(() => {
                let _scrollTop = scrollTop(window);
                let isBanner = hasClass(_layer, "banner-mode");
                let _isMobile = windowWid < 650;

                // If the current page uses a banner ensure the navbar is still visible
                toggleClass(_navbar, "navbar-focus", isBanner || _scrollTop >= 5);

                // Hide and show the action-center if the window has been scrolled past the visible height of the page
                toggleClass(_actioncenter, "layer-action-center-show", _scrollTop > window.innerHeight);

                // If device width is greater than 700px
                if (!_isMobile && "Promise" in window) {
                    _images.forEach(data => {
                        // On scroll turn on parallax effect for images with the class "effect-parallax"
                        if (hasClass(data.target, "effect-parallax")) {
                            let { clientRect, load_img, overlay, isHero, header, main } = data;
                            let { top, height } = clientRect;

                            let endPt = height + top;
                            let startPt = top;

                            // Only compute the parallax effect, if the image is in view
                            if (_scrollTop + navHeight >= startPt && _scrollTop <= endPt) {
                                // Convert `value` to a scale of 0 to 1
                                let value = _map(_scrollTop, startPt, endPt, 0, 1);

                                // Restrict value to a min of 0 and a max of 1
                                value = _constrain(value, 0, 1);

                                if (isHero) {
                                    style(overlay, {
                                        opacity: _map(value, 0, 0.75, 0.45, 0.8).toFixed(2)
                                    });
                                }

                                // Ensure moblie devices can handle smooth animation, or else the parallax effect is pointless
                                let translateY = _map(value, 0, 0.75, 0, height / 2).toFixed(4);
                                style(load_img, {
                                    transform: `translateY(${translateY}px)`,
                                });

                                let opacity = _map(value, 0, 0.45, 1, 0).toFixed(4);
                                translateY = _constrain(_map(value, 0, 1, 0, height / 2), 0, height / 3).toFixed(4);

                                let transform = `translateY(${translateY}px)`;
                                if (header) style(header, { transform });
                                if (main) style(main, { transform, opacity });
                            }
                        }
                    });
                }

                canScroll = true;
                raf = window.cancelAnimationFrame(raf);
            });
        }
    }
});

// Method to run on scroll down button click
let goDown = () => {
    scrollTo(heroHeight, "800ms");
};

// Initialize images
let init = () => {
    _images.clear();

    // On scroll down button click animate scroll to the height of the hero layer
    on(_scrolldown, "click", goDown);

    // Determine the height of the hero
    heroHeight = height(_hero);

    // Find the layer-images in each layer
    let layer_image, isHero, overlay, load_img, clientRect, header, main, _isbanner;
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

            _images.add({
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
};

// Run once each page, this is put into SWUP, so for every new page, all the images transition without having to maually rerun all the scripts on the page
init();
resize();
scroll();

// On backup button click animate back to the top
on(_backUp, "click", () => {
    scrollTo("0px", "1400ms");
});

// On skip main button click animate to the main content
let heroHeight;
on(_skipMain, "click", () => {
    scrollTo(heroHeight, "1400ms");
});

const activeNavLink = () => {
    let href = window.location.href || "";
    href = href.replace("projects", "portfolio");

    requestAnimationFrame(() => {
        removeClass(_navLink, "navbar-link-focus");
        each(_navLink, _link => {
            let path = attr(_link, "data-path") || " ";
            toggleClass(_link, "navbar-link-focus", href.includes(path.toLowerCase()));
        });
    });
};

on(document, "ready", () => {
    // SWUP library
    try {
        // To avoid bugs in older browser, SWUP can only run if the browser supports modern es6 features or supports webp (most browser that support webp can handle the history management SWUP does)
        if ("Promise" in window) {
            console.log("%cDocument loaded, SWUP starting...", "color: #00c300");

            // Page transition manager SWUP for faster page loads
            const Swup = new swup({
                linkSelector,
                animateHistoryBrowsing: true,
                containers: ["[data-container]"],
                plugins: [
                    // Preload pages
                    new preloadPlugin(),

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
            Swup.cache.remove(window.location.pathname);

            // This event runs for every page view after initial load
            Swup.on("clickLink", () => {
                // Remove click event from scroll down button
                off(_scrolldown, "click", goDown);

                if (windowWid <= 700) {
                    requestAnimationFrame(() => {
                        removeClass(_navbar, "navbar-show");
                    });
                }
            });

            Swup.on("samePage", () => {
                // If on the same page reinvigorate the scroll down button click event
                // On scroll down button click animate scroll to the height of the hero layer
                on(_scrolldown, "click", goDown);
            });

            Swup.on('contentReplaced', () => {
                init(); resize(); scroll();
            });

            Swup.on('willReplaceContent', activeNavLink);
        }

        activeNavLink();
    } catch (e) {
        // Swup isn't very good at handling errors in page transitions, so to avoid errors blocking the site from working properly; if SWUP crashes it should fallback to normal page linking
        on(linkSelector, 'click', e => {
            window.location.href = e.currentTarget.href;
        });

        console.error(`Swup Error: ${e.message}`);
    }
});

try {
    // This code comes from the theme.js file
    // Control localStorage storage of theme
    const html = document.querySelector("html");

    // Get theme from html tag, if it has a theme or get it from localStorage
    let themeGet = () => {
        let themeAttr = attr(html, "theme");
        if (themeAttr && themeAttr.length) {
            return themeAttr;
        }

        return getTheme();
    };

    // Set theme in localStorage, as well as in the html tag
    let themeSet = theme => {
        attr(html, "theme", theme);
        setTheme(theme);
    };

    // On theme switcher button click toggle the theme between dark and light mode
    on(_themeSwitcher, "click", () => {
        themeSet(themeGet() === "dark" ? "light" : "dark");
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener("change", e => {
        themeSet(e.matches ? "dark" : "light");
    });
} catch (e) {
    console.warn("Theme switcher button broke, :(.");
}