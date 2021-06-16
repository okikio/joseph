// Imported external libraries
import swup from "swup";
import scrollPlugin from "@swup/scroll-plugin";
import preloadPlugin from "@swup/preload-plugin";

// Internal use components
import { setTheme, getTheme } from "./theme";
import { _constrain as limit, _map as scale } from "./components/util";
import { el, on, off, has, toggleClass, each, find, addClass, removeClass, scrollTop, hasClass, height, style, width, offset, attr } from "./components/dom";

const _dropdownBtn = '.dropdown-btn';
const _dropdown = '.dropdown';
const _navOverlay = '.navbar-overlay';
const _navbar = '.navbar';
const _banner = '.banner';
const _menu = '.navbar-menu';
const _backUp = '#to-top';
const _skipMain = ".skip-main";
const _navLink = '.navbar-link a';
const _image = ".image";
const _themeSwitcher = ".theme-switcher";
const _scrolldown = '#scroll-down';
const linkSelector = `a[href^="${window.location.origin}"]:not([data-no-pjax]), a[href^="/"]:not([data-no-pjax])`;

let onload = image => function () {
    addClass(image, "core-img-show"); // Hide the image preview
};

// On navbar menu click (this will only occur on mobile; click is a tiny bit more efficient), show navbar
on(_menu, "click", () => {
    toggleClass(_navbar, "navbar-show");
});

let dropdownLink = el(".dropdown-link");
on(document, "click", ({ target }) => {
    !has(dropdownLink, target).length && removeClass(_dropdown, "show");
});

on(_dropdownBtn, "click", () => {
    toggleClass(_dropdown, "show");
});

// The focus pt., 10px past the height of the navbar
let navHeight = height(_navbar);
let bannerInfo, windowWid;

let resize, scroll;
let canScroll = true, canResize = true;
on(window, {
    // On window resize make sure the scroll down banner button, is expanded and visible
    'resize': resize = () => {
        // Prevent layout-thrashing: [wilsonpage.co.uk/preventing-layout-thrashing/]
        if (canResize) {
            let srcset, src, coreImg, srcWid, srcHei;
            let timer, raf;
            canResize = false;

            raf = requestAnimationFrame(() => {
                windowWid = width(window);
                
                // On Resize re-scale the parallax effect
                let target = find(_banner, _image)[0];
                let clientRect = offset(target);
                bannerHeight = clientRect?.height;
            
                // In each layer-image find load-img image container and store all key info, important for creating a parallax effect
                bannerInfo = {
                    ...bannerInfo,
                    target,
                    clientRect
                };

                // Find the layer-images in each layer
                each(_image, image => {
                    srcWid = Math.round(width(image));
                    srcHei = Math.round(height(image));

                    // Find the core-img in the layer-image container
                    coreImg = find(image, ".core-img")[0];

                    // Make sure the image that is loaded is the same size as its container
                    srcset = attr(coreImg, "data-src");

                    // On larger screens load smaller images, for faster image load times
                    src = srcset.replace(/w_auto/, `w_${srcWid}`);
                    if (srcHei > srcWid) src = src.replace(/ar_4:3,/, `ar_3:4,`);

                    // Only load a new image If something has changed
                    if (src !== attr(coreImg, "src")) {
                        // Ensure the image has loaded, then replace the small preview
                        attr(coreImg, "src", src);
                        on(coreImg, "load", onload(image));
                    }
                });

                // set a timeout to un-throttle
                timer = window.setTimeout(() => {
                    canResize = true;
                    timer = window.clearTimeout(timer);
                    raf = window.cancelAnimationFrame(raf);
                }, 300);
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
                let _isMobile = windowWid < 650;

                let banner = el(_banner);
                let isBanner = banner.length ? !hasClass(banner, "hero") : false;

                // If the current page uses a banner ensure the navbar is still visible
                toggleClass(_navbar, "navbar-focus", isBanner || _scrollTop >= 5);

                // Hide and show the action-center if the window has been scrolled past the visible height of the page
                toggleClass(_backUp, "hide", _scrollTop < window.innerHeight);

                // If device width is greater than 700px
                if ("Promise" in window && !_isMobile) {
                    let { clientRect, target, figure, overlay, header, main, isHero } = bannerInfo;

                    // On scroll turn on parallax effect for images with the class "effect-parallax"
                    if (target && hasClass(target, "effect-parallax")) {
                        let { top, height } = clientRect;

                        let topScroll = _scrollTop;
                        if (isHero) topScroll += navHeight;

                        let endPt = height + top;
                        let startPt = top;

                        // Only compute the parallax effect, if the image is in view
                        if (topScroll >= startPt && _scrollTop <= endPt) {
                            // Convert `value` to a scale of 0 to 1
                            let value = scale(topScroll, startPt, endPt, 0, 1);

                            // Restrict value to a min of 0 and a max of 1
                            value = limit(value, 0, 1);

                            let opacity = parseFloat( scale(value, 0, 0.75, 0.55, 0.8).toFixed(_isMobile ? 2 : 4) );
                            style(overlay, { opacity });

                            // Ensure moblie devices can handle smooth animation, or else the parallax effect is pointless
                            let translateY = parseFloat( scale(value, 0, 0.75, 0, height / 2).toFixed(_isMobile ? 2 : 4) );
                            let transform = `translateY(${translateY}px)`;
                            style(figure, { transform });

                            opacity = parseFloat( scale(value, 0, 0.45, 1, 0).toFixed(_isMobile ? 2 : 4) );
                            translateY = parseFloat( limit(scale(value, 0, 1, 0, height / 2), 0, height / 3).toFixed(_isMobile ? 2 : 4) );
                            transform = `translateY(${translateY}px)`;
                            if (header) style(header, { transform });
                            if (main) style(main, { transform, opacity });
                        }
                    }
                }

                canScroll = true;
                raf = window.cancelAnimationFrame(raf);
            });
        }
    }
});

// Method to run on scroll down button click
let bannerHeight;
let goDown = () => {
    window.scrollTo({
        top: bannerHeight,
        behavior: "smooth"
    });
};

// On skip main button click animate to the main content
on(_skipMain, "click", goDown);

// On backup button click animate back to the top
on(_backUp, "click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

on(_navOverlay, "click", () => {
    removeClass(_navbar, "navbar-show");
})

// Initialize images
let init = () => {
    let banner = el(_banner);
    let header = find(banner, "h1")[0];
    let main = find(banner, "h2")[0];

    let target = find(banner, _image)[0];
    let figure = find(target, "figure")[0];
    let overlay = find(target, ".image-overlay")[0];
    let clientRect = offset(target);
    bannerHeight = clientRect?.height;

    // In each layer-image find load-img image container and store all key info, important for creating a parallax effect
    bannerInfo = {
        isHero: hasClass(banner, "hero"),
        overlay,
        target,
        figure,
        clientRect,
        header,
        main
    };

    // On scroll down button click animate scroll to the height of the banner layer
    if (target) on(_scrolldown, "click", goDown);
};

// Run once each page, this is put into SWUP, so for every new page, all the images transition without having to maually rerun all the scripts on the page
init();
resize();
scroll();

const activeNavLink = () => {
    let href = window.location.href || "";
    href = href.replace("projects", "portfolio");

    removeClass(_navLink, "active");
    each(_navLink, _link => {
        let path = attr(_link, "data-path") || " ";
        toggleClass(_link, "active", href.includes(path.toLowerCase()));
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

                removeClass(_dropdown, "show");
                if (windowWid <= 700) {
                    removeClass(_navbar, "navbar-show");
                }
            });

            Swup.on("samePage", () => {
                // If on the same page reinvigorate the scroll down button click event
                // On scroll down button click animate scroll to the height of the banner layer
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
        html.className = theme;
        attr(html, "theme", theme);
    };

    // On theme switcher button click toggle the theme between dark and light mode
    on(_themeSwitcher, "click", () => {
        let theme = themeGet() === "dark" ? "light" : "dark";
        themeSet(theme);
        setTheme(theme);

    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener("change", e => {
        themeSet(e.matches ? "dark" : "light");
    });
} catch (e) {
    console.warn("Theme switcher button broke, :(.");
}
