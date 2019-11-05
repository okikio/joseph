import { _matches, _is, keys } from "./util";
import _event from './event';

// Test for passive support, based on [github.com/rafrex/detect-passive-events]
let passive = false, opts = {}, noop = () => { };
try {
    opts = Object.defineProperty({}, "passive", {
        get: () => passive = { capture: false, passive: true }
    });

    window.addEventListener("PassiveEventTest", noop, opts);
    window.removeEventListener("PassiveEventsTest", noop, opts);
} catch (e) {}

let ele;
let tagRE = /^\s*<(\w+|!)[^>]*>/;
let tagExpandRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;
export let _qsa = (dom = document, sel) => {
    let classes;
    if (!_is.str(sel) && sel.length === 0) return [];
    if (/^(#?[\w-]+|\.[\w-.]+)$/.test(sel)) {
        switch (sel.charAt(0)) {
            case '#':
                return [dom.getElementById(sel.substr(1))];
            case '.':
                classes = sel.substr(1).replace(/\./g, ' ');
                return [...dom.getElementsByClassName(classes)];
            default:
                return [...dom.getElementsByTagName(sel)];
        }
    }

    return [...dom.querySelectorAll(sel)];
};

// Create an Element List from a HTML string
export let _createElem = html => {
    let dom, container;
    container = document.createElement('div');
    container.innerHTML = '' + html.replace(tagExpandRE, "<$1></$2>");
    dom = [].slice.call(container.childNodes);
    dom.forEach(el => {
        container.removeChild(el);
    });

    return dom;
};

// Element selector
export let _elem = (sel, ctxt) => {
    if (_is.str(sel)) {
        sel = sel.trim();
        if (tagRE.test(sel)) { return _createElem(sel); }
        else { return _qsa(ctxt, sel); }
    } else if (_is.inst(sel, ele)) { return sel; }
    else if (_is.arr(sel) || _is.inst(sel, NodeList))
        { return [...sel].filter(item => _is.def(item)); }
    else if (_is.obj(sel) || _is.el(sel)) { return [sel]; }
    else if (_is.fn(sel)) { new ele(document).on("ready", sel); }
    return [];
};

// Element Object [Based on Zepto.js]
export default ele = class extends _event {
    constructor(sel = '', ctxt) {
        super();
        this.sel = sel; // Selector
        this.ele = _elem(this.sel, ctxt); // Element

        for (let i = 0; i < this.ele.length; i++) {
            this[i] = this.ele[i];
        }
        this.length = this.ele.length;
    }

    on(evt, opts, callback) {
        let _newEvts, _evt, delegate, $super = _event.prototype.on.bind(this);
        if (_is.undef(evt)) { return; } // If there is no event break
        if (_is.str(evt)) { evt = evt.split(/\s/g); }
        if (!_is.arr(evt) && !_is.obj(evt)) { evt = [evt]; } // Set evt to an array

        _evt = (_is.obj(evt) && !_is.arr(evt) ? keys(evt) : evt);
        _newEvts = _evt.filter(val => !(val in this._events), this);

        if (_is.str(opts)) delegate = opts;
        else callback = opts;

        [].forEach.call(this, (el, i) => {
            $super(evt, callback);
            if (!(_newEvts.length > 0) && !_is.undef(el) && !_is.nul(el)) return;

            let useCapture;
            let _emit = evt => e => {
                let target = _is.str(delegate) && _matches(e.target, delegate) ? e.target : el;
                if (!_is.str(delegate) || _matches(e.target, delegate))
                    return this.emit(evt, [e, target, this, i], target);
            };

            if (/ready/.test(_newEvts)) {
                if (!/in/.test(document.readyState)) { _emit("ready") (); }
                else if (document.addEventListener) {
                    document.addEventListener('DOMContentLoaded', _emit("ready"));
                } else {
                    // Support for IE
                    document.attachEvent('onreadystatechange', e => {
                        if (!/in/.test(document.readyState)) _emit("ready") (e);
                    });
                }
            } else {
                _newEvts.forEach(val => {
                    useCapture = /blur|focus/.test(val);
                    el.addEventListener(val, _emit(val), val === "scroll" ? passive : { useCapture });
                });
            }
        });
        return this;
    }
};
