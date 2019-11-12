// import swup from "swup";
// import { el } from "./components/ele";
import { _log, _is } from "./components/util";
// import Rellax from "rellax";
// import rallax from 'rallax.js';
// import preload from '@swup/preload-plugin';
// import scrollPlugin from "@swup/scroll-plugin";
// import { _is } from "./components/util";
// import anime from 'animejs';
import { on, onscroll, toggleClass, each, find, get, addClass, removeClass, scrollTo, scrollTop, hasClass, height, width } from "./components/dom";
import parallax from "./components/parallax";

let _img = ".load-img";
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
on(_backUp, "click", () => {
    scrollTo("0px", "700s");
});

// touchstart
on(_scrolldown, "click", () => {
    scrollTo(height(_hero) + _focusPt, "700s");
});

onscroll(window, () => {
    toggleClass(_navbar, "navbar-focus", scrollTop(window) >= 5);
    hasClass(_navbar, "navbar-show") && removeClass(_navbar, "navbar-show");

    toggleClass(_actioncenter, "layer-action-center-show", scrollTop(window) > _focusPt * 2);
    toggleClass(_actioncenter, "layer-action-center-hide", scrollTop(window) <= _focusPt * 2);
});

each(_img, $img => {
    let _core_img = get(find($img, ".core-img"), 0);
    let _placeholder_img = find($img, ".placeholder-img");

    if (_is.def(_core_img)) {
        if (_core_img.complete) {
            addClass(_placeholder_img, "core-img-show");
        } else {
            _core_img.addEventListener("load", function() {
                addClass(_placeholder_img, "core-img-show");
            }, false);
        }
    }
});

let images = [], isVisible = [];

/*
let observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => isVisible[i] = entry.intersectionRatio > 0);
}, {
  rootMargin: '0px',
  threshold: 1.0
});
*/
each('.load-img', ($el, i) => {
    images[i] = parallax($el, {
        play: true,
        speed: -6,
        center: true,
        round: true,
    });
});




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

// // helper functions
// const MathUtils = {
//     // map number x from range [a, b] to [c, d]
//     map: (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c,
//     // linear interpolation
//     lerp: (a, b, n) => (1 - n) * a + n * b
// };

// // body element
// const body = document.body;

// // calculate the viewport size
// let winsize;
// const calcWinsize = () => winsize = {width: window.innerWidth, height: window.innerHeight};
// calcWinsize();
// // and recalculate on resize
// window.addEventListener('resize', calcWinsize);

// // scroll position and update function
// let docScroll;
// const getPageYScroll = () => docScroll = window.pageYOffset || document.documentElement.scrollTop;
// window.addEventListener('scroll', getPageYScroll);

// // Item
// class Item {
//     constructor(el) {
//         // the .item element
//         this.DOM = {el: el};
//         // the inner image
//         this.DOM.image = this.DOM.el.querySelector('.core-img');
//         this.renderedStyles = {
//             // here we define which property will change as we scroll the page and the items is inside the viewport
//             // in this case we will be translating the image on the y-axis
//             // we interpolate between the previous and current value to achieve a smooth effect
//             innerTranslationY: {
//                 // interpolated value
//                 previous: 0,
//                 // current value
//                 current: 0,
//                 // amount to interpolate
//                 ease: 0.1,
//                 // the maximum value to translate the image is set in a CSS variable (--overflow)
//                 maxValue: parseInt(80, 10),
//                 // current value setter
//                 // the value of the translation will be:
//                 // when the item's top value (relative to the viewport) equals the window's height (items just came into the viewport) the translation = minimum value (- maximum value)
//                 // when the item's top value (relative to the viewport) equals "-item's height" (item just exited the viewport) the translation = maximum value
//                 setValue: () => {
//                     const maxValue = this.renderedStyles.innerTranslationY.maxValue;
//                     const minValue = -1 * maxValue;
//                     return Math.max(Math.min(MathUtils.map(this.props.top - docScroll, winsize.height, -1 * this.props.height, minValue, maxValue), maxValue), minValue)
//                 }
//             }
//         };
//         // set the initial values
//         this.update();
//         // use the IntersectionObserver API to check when the element is inside the viewport
//         // only then the element translation will be updated
//         this.observer = new IntersectionObserver((entries) => {
//             entries.forEach(entry => this.isVisible = entry.intersectionRatio > 0);
//         });
//         this.observer.observe(this.DOM.el);
//         // init/bind events
//         this.initEvents();
//     }
//     update() {
//         // gets the item's height and top (relative to the document)
//         this.getSize();
//         // sets the initial value (no interpolation)
//         for (const key in this.renderedStyles ) {
//             this.renderedStyles[key].current = this.renderedStyles[key].previous = this.renderedStyles[key].setValue();
//         }
//         // translate the image
//         this.layout();
//     }
//     getSize() {
//         const rect = this.DOM.el.getBoundingClientRect();
//         this.props = {
//             // item's height
//             height: rect.height,
//             // offset top relative to the document
//             top: docScroll + rect.top
//         }
//     }
//     initEvents() {
//         window.addEventListener('resize', () => this.resize());
//     }
//     resize() {
//         // on resize rest sizes and update the translation value
//         this.update();
//     }
//     render() {
//         // update the current and interpolated values
//         for (const key in this.renderedStyles ) {
//             this.renderedStyles[key].current = this.renderedStyles[key].setValue();
//             this.renderedStyles[key].previous = MathUtils.lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].ease);
//         }
//         // and translates the image
//         this.layout();
//     }
//     layout() {
//         // translates the image
//         this.DOM.image.style.transform = `translate3d(0,${this.renderedStyles.innerTranslationY.previous}px,0)`;
//     }
// }


//     let items = [];
//     [...document.querySelectorAll(_img)].forEach(item => items.push(new Item(item)));

//     let render = function () {
//         // for every item
//         for (const item of items) {
//             // if the item is inside the viewport call it's render function
//             // this will update the item's inner image translation, based on the document scroll value and the item's position on the viewport
//             if ( item.isVisible ) {
//                 item.render();
//             }
//         }


//         requestAnimationFrame(() => render());
//     };

//         // start the render loop
//         requestAnimationFrame(() => render());


// Get the scroll position
// getPageYScroll();
// Initialize the Smooth Scrolling
// new SmoothScroll();;


    // let _backToTop = el('#back-to-top');

    // let _height = _navbar.height();
    // let _focusPt = _height + 20;
    // let _load, _scroll, _scrollEle = _body.get(0);
/*
// _scrollEle = window.document.scrollingElement || window.document.body || window.document.documentElement;
// _scrollEle = el(_scrollEle);
_navbar.click('.navbar-menu', e => {
    e.preventDefault();
    _navbar.toggleClass("navbar-show");
});

_backToTop.click(e => {
    e.preventDefault();
    anime({
        targets: _scrollEle,
        scrollTop: 0,
        duration: 500,
        easing: 'easeInOutQuad'
    });
});

let _actioncenter = el(".layer-action-center");
window.scroll(_scroll = () => {
    _navbar.toggleClass("navbar-focus", (window.scrollTop() + _height) >= _focusPt);
    _navbar.hasClass("navbar-show") && _navbar.removeClass("navbar-show");

    if ((window.scrollTop() + _height) >= _focusPt * 2) {
        _actioncenter.show();
    } else { _actioncenter.hide(); }
});


_load = () => {
    let _next_layer_btn = el(".next-layer"), _next_layer;
    let _img = el(".load-img");
    let _main = el(".main");

    _scroll();

    var body = document.body,
        html = document.documentElement;

    var height = Math.max( body.scrollHeight, body.offsetHeight,
                        html.clientHeight, html.scrollHeight, html.offsetHeight );

    if (height <= window.innerHeight) {
        _actioncenter.show();
    }

    _img.each($img => {
        let img = el($img);
        let _core_img = img.find(".core-img").get(0);
        let _placeholder_img = img.find(".placeholder-img");

        if (_is.def(_core_img)) {
            if (_core_img.complete) {
                _placeholder_img.addClass("core-img-show");
            } else {
                _core_img.addEventListener("load", function () {
                    _placeholder_img.addClass("core-img-show");

                    setTimeout(function () { _placeholder_img.hide(); }, 3000);
                }, false);
            }
        }
    });

    _next_layer_btn.click((e, _el) => {
        e.preventDefault();
        _next_layer = el(_el).closest(".layer", _main).next(".layer");
        anime({
            targets: _scrollEle,
            scrollTop: el(_next_layer).offset().top - _height,
            duration: 500,
            easing: 'easeInOutQuad'
        });
    });

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