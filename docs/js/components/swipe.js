// import { _is, keys, _argNames } from "./util";
// import event from "./event";
import { on } from "./dom";
let xInit = null;
let yInit = null;
let xDiff = null;
let yDiff = null;
let timeDown = null;
let startEl = null;

// Based on [github.com/john-doherty/swiped-events/]
on(document, {
    'touchstart': e => {
        startEl = e.target;

        if (_matches(startEl, _navbar)) {
            timeDown = Date.now();
            xInit = e.touches[0].clientX;
            yInit = e.touches[0].clientY;
            xDiff = 0;
            yDiff = 0;
        }
    },
    'touchend': () => {
        let swipeThreshold = 20;    // default 10px
        let swipeTimeout = 500;      // default 1000ms
        let timeDiff = Date.now() - timeDown;

        if (Math.abs(xDiff) < Math.abs(yDiff)) {
            if (Math.abs(yDiff) > swipeThreshold && timeDiff < swipeTimeout) {
                // Swipe down
                if (yDiff < 0) {
                    addClass(_navbar, "navbar-show");
                }
            }
        }

        // reset values
        xInit = null;
        yInit = null;
        timeDown = null;
    },
    'touchmove': e => {
        if (!xInit || !yInit) return;
        let { clientX, clientY } = e.touches[0];

        xDiff = xInit - clientX;
        yDiff = yInit - clientY;
    },
});
