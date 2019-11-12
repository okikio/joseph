import { assign, _is } from './util';
import el, { data, scrollTop, scrollLeft, offset, width, height, each, style, on, off } from './dom';

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
        this.isPlaying = this.opts.play;

        this.screenX = 0;
        this.screenY = 0;

        this.posX = 0;
        this.posY = 0;

        this.list = [];
        this.loop = null;

        if (this.isPlaying) this.start();
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
        let $transform = this.getTransform($el);

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
        return this;
        // self.options.callback(positions);
    }

    applyEvents() {
        const { wrapper } = this.opts;
        this.loop = null;
        on(window, 'resize orientationchange', this.removeEvents.bind(this));
        on(window, 'scroll', this.removeEvents.bind(this));
        on(wrapper ? wrapper : window, 'scroll', this.removeEvents.bind(this));
        on(wrapper ? wrapper : document, 'touchmove', this.removeEvents.bind(this));
        // Don't animate until we get a position updating event
        // window.addEventListener('resize', this.deferredUpdate.bind(this));
        // window.addEventListener('orientationchange', this.deferredUpdate.bind(this));
        // (wrapper ? wrapper : window).addEventListener('scroll', this.deferredUpdate.bind(this), supportsPassive ? { passive: true } : false);
        // (wrapper ? wrapper : document).addEventListener('touchmove', this.deferredUpdate.bind(this), supportsPassive ? { passive: true } : false);
    }

    removeEvents() {
        const { wrapper } = this.opts;
        off(window, 'resize orientationchange', this.removeEvents.bind(this));
        off(window, 'scroll', this.removeEvents.bind(this));
        off(wrapper ? wrapper : window, 'scroll', this.removeEvents.bind(this));
        off(wrapper ? wrapper : document, 'touchmove', this.removeEvents.bind(this));
        // window.removeEventListener('resize', this.deferredUpdate.bind(this));
        // window.removeEventListener('orientationchange', this.deferredUpdate.bind(this));
        // (wrapper ? wrapper : window).removeEventListener('scroll', this.deferredUpdate.bind(this));
        // (wrapper ? wrapper : document).removeEventListener('touchmove', this.deferredUpdate.bind(this));

        // Loop again
        this.loop = _raf(this.update.bind(this));
    }

    play() {
        this.isPlaying = true;
        return this;
    }  

    pause() {
        this.isPlaying = false;
        return this;
    }    

    // Loop
    update() {
        if (this.setPos() && this.isPlaying) {
            this.animate();

            // Loop again
            this.loop = _raf(this.update.bind(this));
        } else { this.applyEvents(); }

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
        if (!this.isPlaying && this.mobileDevices) {
            on(window, 'resize', this.start.bind(this));
            this.play();

            // Start the loop
            this.update();
        }
    }

    destroy() {
        each(this.elems, ($el, i) => {
            this.elems[i].style.cssText = this.list[i].style;
        }, this);

        // Remove resize event listener if not pause, and pause
        if (this.isPlaying) {
            off(window, 'resize', this.start.bind(this));
            this.pause();
        }

        // Clear the animation loop to prevent possible memory leak
        _cancelRaf(this.loop);
        this.loop = null;
    }
    
    // Allow to recalculate the initial values whenever we want
    get refresh() {
        return this.start;
    }
}

export let parallax = (...args) => new Parallax(...args);
export default parallax;