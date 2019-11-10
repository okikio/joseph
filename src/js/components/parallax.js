import { assign, _is } from './util';
import el, { data, scrollTop, scrollLeft, offset, width, height, each, style, on } from './dom';

const _raf = window.requestAnimationFrame;
const _cancelRaf = window.cancelAnimationFrame;

const defaultOpts = {
    relativeToWrapper: false,
    mobileDevices: false,
    horizontal: false,
    vertical: true,
    wrapper: null,
    center: false,
    round: true,
    play: false,
    speed: -2
};

export class Parallax {
    constructor($el = '.effect-parallax', opts) {
        const { wrapper } = opts;
        this.opts = assign({}, defaultOpts, opts);
        this.elems = el($el);

        // Has a wrapper and it exists
        _is.usable(wrapper) && (this.opts.wrapper = el(wrapper));
        this.play = this.opts.play;

        this.screenX = 0;
        this.screenY = 0;

        this.posX = 0;
        this.posY = 0;

        this.list = [];
        this.loop = null;

        self.destroy = function() {
            for (let i = 0; i < self.elems.length; i++) {
                self.elems[i].style.cssText = blocks[i].style;
            }

            // Remove resize event listener if not pause, and pause
            if (!pause) {
                window.removeEventListener('resize', init);
                pause = true;
            }

            // Clear the animation loop to prevent possible memory leak
            clearLoop(loopId);
            loopId = null;
        };

        // Init
        init();

        // Allow to recalculate the initial values whenever we want
        self.refresh = init;

        return self;
    }

    getPos(percentx, percenty, speed) {
        const { round } = this.opts;
        let valuex = (speed * (100 * (1 - percentx)));
        let valuey = (speed * (100 * (1 - percenty)));

        return {
            x: round ? Math.round(valuex) : Math.round(valuex * 100) / 100,
            y: round ? Math.round(valuey) : Math.round(valuey * 100) / 100
        };
    }

    getTransform(el) {
        // ~~Store non-translate3d transforms~~
        // Store inline styles and extract transforms
        let style = el.style.cssText;

        // Check if there's an inline styled transform
        let result = /transform\s*:/i.exec(style);
        if (result) {
            // Get the index of the transform
            let { index } = result;

            // Trim the style to the transform point and get the following semi-colon index
            let transform = style.slice(index);
            let delimiter = transform.includes(";") ? transform.indexOf(';') : undefined;

            // Remove "transform" string and save the attribute
            return " " + transform.slice(11, delimiter).replace(/\s/g, '');
        }

        return '';
    }

    getData($el) {
        const { wrapper, vertical, horizontal, speed, relativeToWrapper, center } = this.opts;
        const dataPercentage = data($el, 'parallax-percentage');
        const dataZindex = data($el, 'parallax-zindex') || 0;
        const dataSpeed = data($el, 'parallax-speed');
        const dataMin = data($el, 'parallax-min');
        const dataMax = data($el, 'parallax-max');

        let x_scrll = scrollLeft(window);
        let y_scrll = scrollTop(window);

        let wrapperY = wrapper ? scrollTop(wrapper) : y_scrll;
        if (relativeToWrapper) wrapperY = y_scrll - offset(wrapper).top;

        let posY = vertical ? (dataPercentage || center ? wrapperY : 0) : 0;
        let posX = horizontal ? (dataPercentage || center ? (wrapper ? scrollLeft(wrapper) : x_scrll) : 0) : 0;

        let { top, left } = $el.getBoundingClientRect();
        let blockTop = posY + top, blockLeft = posX + left;
        let blockW = $el.clientWidth || $el.offsetWidth || $el.scrollWidth;
        let blockH = $el.clientHeight || $el.offsetHeight || $el.scrollHeight;

        this.screenX = width(window);
        this.screenY = height(window);

        let percentx = dataPercentage ? dataPercentage :
            (posX - blockLeft + this.screenX) / (blockW + this.screenX);
        let percenty = dataPercentage ? dataPercentage :
            (posY - blockTop + this.screenY) / (blockH + this.screenY);
        if (center) { percentx = 0.5; percenty = 0.5; }

        // Optional individual block speed as data attr, otherwise global speed
        let $speed = dataSpeed ? dataSpeed : speed;
        let $bases = this.getPos(percentx, percenty, $speed);
        let $transform = this.getTransform(el);

        return {
            style: $el.style.cssText,
            transform: $transform,
            zindex: dataZindex,
            baseX: $bases.x,
            baseY: $bases.y,
            left: blockLeft,
            height: blockH,
            width: blockW,
            top: blockTop,
            speed: speed,
            min: dataMin,
            max: dataMax
        };
    }

    setPos() {
        const { wrapper, vertical, horizontal, relativeToWrapper } = this.opts;
        let oldX = this.posX, oldY = this.posY;

        let x_scrll = scrollLeft(window);
        let y_scrll = scrollTop(window);

        this.posX = wrapper ? scrollLeft(wrapper) : x_scrll;
        this.posY = wrapper ? scrollTop(wrapper) : y_scrll;

        if (relativeToWrapper) this.posY = y_scrll - offset(wrapper).top;
        return (oldY !== this.posY && vertical) || (oldX !== this.posX && horizontal);
    }

    hasPosChanged() {
        const { wrapper, vertical, horizontal, relativeToWrapper } = this.opts;
        let oldX = this.posX, oldY = this.posY;

        let x_scrll = scrollLeft(window);
        let y_scrll = scrollTop(window);

        let posX = wrapper ? scrollLeft(wrapper) : x_scrll;
        let posY = wrapper ? scrollTop(wrapper) : y_scrll;

        if (relativeToWrapper) posY = y_scrll - offset(wrapper).top;
        return (oldY !== posY && vertical) || (oldX !== posX && horizontal);
    }

    animate() {
        const { vertical, horizontal } = this.opts;
        each(this.elems, ($el, i) => {
            let { top, left, height, width, speed, baseY, baseX, min, max, zindex, transform } = this.list[i];
            let percentx = ((this.posX - left + this.screenX) / (width + this.screenX));
            let percenty = ((this.posY - top + this.screenY) / (height + this.screenY));

            // Subtracting initialize value, so element stays in same spot as HTML
            let pos = this.getPos(percentx, percenty, speed);
            let _posX = pos.x - baseX;
            let _posY = pos.y - baseY;

            // Check if a min limit is defined
            if (!_is.nul(min)) {
                if (horizontal) _posX = _posX <= min ? min : _posX;
                if (vertical) _posY = _posY <= min ? min : _posY;
            }

            // Check if a max limit is defined
            if (!_is.nul(max)) {
                if (horizontal) _posX = _posX >= max ? max : _posX;
                if (vertical) _posY = _posY >= max ? max : _posY;
            }

            // Move that element
            // (Set the new translation and append initial inline transforms.)
            style($el, "transform", `translate3d(${horizontal ? _posX : '0'}px, ${vertical ? _posY : '0'}px,${zindex}px) ${transform}`);
        }, this);
        // self.options.callback(positions);
    }

    // Remove event listeners and loop again
    deferredUpdate() {
        const { wrapper } = this.opts;
        window.removeEventListener('resize', this.deferredUpdate.bind(this));
        window.removeEventListener('orientationchange', this.deferredUpdate.bind(this));
        (wrapper ? wrapper : window).removeEventListener('scroll', this.deferredUpdate.bind(this));
        (wrapper ? wrapper : document).removeEventListener('touchmove', this.deferredUpdate.bind(this));

        // loop again
        this.loop = _raf(this.update.bind(this));
    }

    applyEvents() {

    }

    removeEvents() {

    }

    // Loop
    update() {
        const { wrapper } = this.opts;
        if (this.setPos() && this.play) {
            this.animate();

            // loop again
            this.loop = _raf(this.update.bind(this));
        } else {
            this.loop = null;

            on(window, 'resize')
            // Don't animate until we get a position updating event
            window.addEventListener('resize', this.deferredUpdate.bind(this));
            window.addEventListener('orientationchange', this.deferredUpdate.bind(this));
            (wrapper ? wrapper : window).addEventListener('scroll', this.deferredUpdate.bind(this), supportsPassive ? { passive: true } : false);
            (wrapper ? wrapper : document).addEventListener('touchmove', this.deferredUpdate.bind(this), supportsPassive ? { passive: true } : false);
        }
    }

    start() {
        this.list.forEach((block, i) => {
            this.elems[i].style.cssText = block.style;
        }, this);

        this.list = [];

        this.screenX = width(window);
        this.screenY = height(window);
        this.setPos();

        each(this.elems, ($el, i) => {
            this.list[i] = this.getData($el);
        }, this);

        this.animate();

        // If paused, unpause and set listener for window resizing events
        if (!this.play) {
            on(window, 'resize', this.start.bind(this));
            this.play = true;
            // Start the loop
            this.update();
        }
    }
}
