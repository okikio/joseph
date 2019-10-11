// import swup from "swup";
// import { el } from "./components/ele";
import { _log } from "./components/util";
// import preload from '@swup/preload-plugin';
// import scrollPlugin from "@swup/scroll-plugin";
// import { _global, _body } from "./components/global";
// import { _is } from "./components/util";
// import anime from 'animejs';
import el, { onclick, toggleClass } from "./components/dom";
// onclick,
try {
    let _navbar = el('.navbar');
    onclick(_navbar, '.navbar-menu', e => {
        e.preventDefault();
        toggleClass(_navbar, "navbar-show");
        console.log("Navbar-show");
    });
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

    let actioncenter = el(".layer-action-center");
    _global.scroll(_scroll = () => {
        _navbar.toggleClass("navbar-focus", (_global.scrollTop() + _height) >= _focusPt);
        _navbar.hasClass("navbar-show") && _navbar.removeClass("navbar-show");

        if ((_global.scrollTop() + _height) >= _focusPt * 2) {
            actioncenter.show();
        } else { actioncenter.hide(); }
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
            actioncenter.show();
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
    .on('contentReplaced', _load); */
} catch (e) {
    let _img = [...document.getElementsByClassName("placeholder-img")];
    let _navbar = [...document.getElementsByClassName("navbar")];
    _navbar.forEach(function (nav) {
        nav.classList.add("navbar-focus");
    });
    _img.forEach(function (img) {
        img.classList.add("core-img-show");
    });
}