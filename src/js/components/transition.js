import { isArray, keys } from "./util";
import _event from "./event";

export default {};

  // basic default transition (with no rules and minimal hooks)
/*
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
});*/
    // _load();

/*
_load();
})

// This event runs for every page view after initial load
.on('contentReplaced', _load);

 */
