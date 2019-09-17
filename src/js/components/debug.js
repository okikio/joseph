// export const { assign, keys, values } = Object;
// export let { isArray, from, of } = Array;
export const assign = Object.assign;
export const values = Object.values;
export const keys = Object.keys;

export const isArray = Array.isArray;
export const from = Array.from;
export const of = Array.of;

// Remove certain properties
export let _removeProps = (prop, obj) => {
    let newObj = Object.assign({}, obj);
    prop.forEach(key => delete newObj[key]);
    return newObj;
 };

// Create an array of values that two array share in common
export let _intersect = (a, b) => a.filter(val => b.includes(val));

// Log values
export let _log = (...args) => args.forEach(v => console.log(v));

// Capitalize strings
export let _capital = val => val[0].toUpperCase() + val.slice(1);

// Test the type of a value
export let _is = (val, type) => (typeof val === type);

// Is Instance Of
let _isInst = (ctor, obj) => (ctor instanceof obj);
let _type = type => { // Tweak of _is
    return val => _is(val, type);
};

assign(_is, {
    el: el => _isInst(el, Element) || _isInst(el, Document),
    arrlike (obj) {
        let len = _is(obj.length, "number") && obj.length;
        return len === 0 || len > 0 && (len - 1) in obj;
    },
    num: val => !isNaN(val) && _type("number") (val),
    class: obj => obj && obj._method && obj._class,
    not: (type, ...args) => !_is[type](...args),
    doc: ctor => _isInst(ctor, Document),
    def: val => !_is(val, "undefined"),
    win: val => val && val.window,
    undef: _type("undefined"),
    bool: _type("boolean"),
    fn: _type("function"),
    str: _type("string"),
    obj: _type("object"),
    nul: v => v === null,
    inst: _isInst,
    arr: isArray,
    _type
});

/**
 * @param  {Function} fn
 * @param  {Array<any>} args
 * @param  {Object} ctxt
 */
export let _fnval = (fn, args, ctxt) => {
    if (_is.not("fn", fn) ||
        keys(fn.prototype || {}).length > 0)
        { return fn; }
    return fn.apply(ctxt, args);
};

let STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
let ARGUMENT_NAMES = /(?:^|,)\s*([^\s,=]+)/g;

// Argument names
export let _argNames = fn => {
    let fnStr = fn.toString().replace(STRIP_COMMENTS, '');
    let argsList = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'));
    let result = argsList.match( ARGUMENT_NAMES ), stripped = [];

    if (_is.nul(result)) return [];
    else {
        for (let i = 0; i < result.length; i ++) {
            stripped.push( result[i].replace(/[\s,]/g, '') );
        }

        return stripped;
    }
};

// Get or set a value in an Object, based on it's path
export let _path = (obj, path, val) => {
    path = path.toString().split(/[.,]/g);
    if (_is.def(val)) {
        if (path.length > 1) {
            _path(obj[path.shift()], path, val);
        } else { obj[path[0]] = val; }
        return val;
    } else {
        path.forEach(_val => { obj = obj[_val]; });
    }
    return obj;
};

/*
    Builds on path and adds more power,
    * Allows for multiple paths one value
    * Using Objects as paths and setting the values individually
    * Access values as an Array, from multiple paths
*/
export let _attr = (obj, path, val) => {
    if (_is.obj(path) && _is.not("arr", path))
        { return assign(obj, path); }
    else if (_is.arr(path)) {
        if (_is.undef(val)) {
            return path.map(_key => _path(obj, _key));
        } else {
            path.forEach(_key => { _path(obj, _key, val); });
        }
    } else { return _path(obj, path, val); }
    return obj;
};

// The matches() method checks to see if the Element would be selected by the provided selectorString -- in other words -- checks if the element "is" the selector.
export let _matches = (ele, sel) => {
    if (_is.undef(ele)) return;
    let matchSel = ele.matches || ele.msMatchesSelector || ele.webkitMatchesSelector;
    if (matchSel) return matchSel.call(ele, sel);
};

// A more efficient `new` keyword that allows for arrays to be passed as arguments
export let _new = function (ctor, args) {
    let F = function () { return ctor.apply(this, args); };
    F.prototype = ctor.prototype;
    return new F();
};

export default { _matches, _capital, _is, _intersect, _fnval, _argNames, _path, _attr, _new, assign, keys, values, from, of, _log };

// export default { assign, keys, values, _intersect, _log };
// export default {  _log };

// import './components/smoothstate';
// import _class from "./components/class";
// import _event from "./components/event";

// _log(anime);
// _log(anime);


// anime({
//     targets: '.anim',
//     translateX: [0, 250],
//     loop: true
// });

// _log(el(".anim"));

/*
// Event class
let _event = _class({
    _class: "Event", // Class name
    init() {
        this._events = {}; // Event info.
        this._emit = [];  // Store events set to be emitted
    },

    // Name of all event's
    _names: _get("Object.keys(_events)"),

    // Number of events
    _eventCount: _get("_names.length"),

    // Prepare the event
    _preEvent(evt) {
        if (!this._events[evt]) // List of event's
            { this._events[evt] = []; }
        return this._events[evt];
    },

    // Apply event as object
    _eventApp(callback, scope, event) {
        return {
            callback: callback,
            scope: scope,
            event: event
        };
    },

    // Add a listener for a given event
    on(evt, callback, scope) {
        let $EvtApp, $evt;
        if (_is.undef(evt)) { return; } // If there is no event break
        if (_is.str(evt)) { evt = evt.split(/\s/g); }
        if (_is.not("arr", evt) && _is.not("obj", evt)) { evt = [evt]; } // Set evt to an array

        // Loop through the list of events
        keys(evt).forEach(function (key) {
            $evt = evt[key];
            if (_is.obj(evt) && _is.not("arr", evt)) {
                $EvtApp = this._eventApp($evt, callback || this, key);
                this._preEvent(key).push($EvtApp); // Set event list
            } else {
                $EvtApp = this._eventApp(callback, scope, $evt);
                this._preEvent($evt).push($EvtApp); // Set event list
            }
        }, this);
        return this;
    },

    // Call all function(s) within an event
    emit(evt, args, scope) {
        let $Evt, $args = args;
        if (_is.undef(evt)) { return; } // If there is no event break
        if (_is.str(evt)) { evt = evt.split(/\s/g); }
        if (_is.not("arr", evt)) { evt = [evt]; } // Set evt to an array

        // Loop through the list of events
        evt.forEach(function ($evt) {
            $Evt = this._preEvent($evt);
            if (!this._emit.includes($evt))
                { this._emit.push($evt); }

            $Evt.forEach(_evt => {
                $args = args;
                if (_argNames(_evt.callback)[0] === "$evt")
                    { $args = [_evt, ...args]; }
                _evt.callback
                    .apply(_is.undef(_evt.scope) ? scope : _evt.scope, $args);
            }, this);
        }, this);
        return this;
    },

    // Removes a listener for a given event
    off(evt, callback, scope) {
        let $evt;
        if (_is.undef(evt)) { return; } // If there is no event break
        if (_is.str(evt)) { evt = evt.split(/\s/g); }
        if (_is.not("arr", evt) && _is.not("obj", evt)) { evt = [evt]; } // Set evt to an array

        let _off = function ($evt, callback, scope) {
            let _Evt = this._preEvent($evt);

            if (callback) {
                let i, app = this._eventApp(callback, scope, $evt);

                _Evt.forEach((val, _i) => {
                    if (_stringify(val) === _stringify(app)) { i = _i; }
                }, this);

                if (i > - 1) { _Evt.splice(i, 1); }
            } else { delete this._events[$evt]; }
        }.bind(this);

        keys(evt).forEach(function (key) {
            $evt = evt[key];
            if (_is.obj(evt) && _is.not("obj", evt)) {
                _off(key, $evt, scope);
            } else { _off($evt, callback, scope); }
        }, this);
        return this;
    },

    // Adds a one time event listener for a given event
    once(evt, callback, scope) {
        if (_is.undef(evt)) { return; } // If there is no event break
        if (_is.str(evt)) { evt = evt.split(/\s/g); }
        if (_is.not("arr", evt) && _is.not("obj", evt)) { evt = [evt]; } // Set evt to an array

        let $Fn = function (...args) {
            this.off(evt, $Fn, scope);
            callback.apply(scope, args);
        };

        this.on(evt, $Fn, scope);
        return this;
    },

    // List's all listeners for a given event
    listeners(evt) {
        let $Evt = this._preEvent(evt);
        if (!$Evt.length) { return []; }
        return $Evt.map(val => val.callback);
    },

    // List's all listener values for a given event
    listenerValues(evt, ...args) {
        let $Evt = this._preEvent(evt);
        if (!$Evt.length) { return []; }
        return $Evt.map(val => val.callback.call(val.scope, ...args));
    },

    // Clear all events
    clear()
        { this._eventCount = 0; this._events = {}; return this; },

    // Clear all events
    clearListeners(evt)
        { this._events[evt] = []; return this; },

    // Alias for the `on` method
    add: _get("on"),
    bind: _get("on"),

    // Alias for the `off` method
    remove: _get("off"),
    unbind: _get("off"),

    // Alias for the `emit` method
    fire: _get("emit"),
    trigger: _get("emit"),

    // Alias for the `listeners` method
    callbacks: _get("listeners")
})
.static({
    nativeEvents: `ready load blur focus focusin focusout resize click scroll dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu`.replace(/\s+/g, " ").split(" "),
    applyNative(evt, el, ev, i, action = "addEventListener", delegate) {
        if (!ev.length) return;

        let useCapture;
        let _emit = _ev => e => {
            if (_is.str(delegate) && _matches(e.target, delegate))
                evt.emit(_ev, [e, e.target, evt, i], e.target);
            else if (!_is.str(delegate))
                evt.emit(_ev, [e, el, evt, i], el);
        };

        if (/ready|load/.test(ev)) {
            if (!/in/.test(readyState)) { _emit("ready load") (); }
            else if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', _emit("ready load"));
            } else {
                document.attachEvent('onreadystatechange', e => {
                    if (!/in/.test(readyState)) _emit("ready load") (e);
                });
            }
        } else {
            ev.split(" ").forEach(val => {
                useCapture = /blur|focus/.test(val);
                el[action](val, _emit(ev), ev === "scroll" ? passive :
                            { useCapture });
            });
        }
    }
});

export default _event; */

/*
// Element Object [Based on Zepto.js]
Ele = _event.extend(arrProto, {
    init($super, sel = '', ctxt) {
        $super();
        this.sel = sel; // Selector
        this.ele = _elem(this.sel, ctxt); // Element

        for (let i = 0; i < this.ele.length; i++) {
            this[i] = this.ele[i];
        }
    },

    slice(...args) { return Ele([].slice.apply(this, args)); },
    map(fn) {
        return Ele(_map(this, (el, i) => fn.call(el, el, i), this));
    },

    on($super, evt, opts, callback) {
        let _newEvts, _evt, delegate;
        if (_is.undef(evt)) { return; } // If there is no event break
        if (_is.str(evt)) { evt = evt.split(/\s/g); }
        if (_is.not("arr", evt) && _is.not("obj", evt)) { evt = [evt]; } // Set evt to an array

        _evt = (_is.obj(evt) && _is.not("arr", evt) ? keys(evt) : evt);
        _newEvts = _evt.filter(val => !(val in this._events), this).join(" ");

        if (_is.str(opts)) delegate = opts;
        else callback = opts;

        this.forEach(function (el, i) {
            $super(evt, callback);
            applyNative(this, el, _newEvts, i, "addEventListener", delegate);
        }, this);
        return this;
    },

    off($super, evt, callback) {
        let _evt;
        if (_is.undef(evt)) { return; } // If there is no event break
        if (_is.str(evt)) { evt = evt.split(/\s/g); }
        if (_is.not("arr", evt) && _is.not("obj", evt)) { evt = [evt]; } // Set evt to an array
        _evt = (_is.obj(evt) && _is.not("arr", evt) ? keys(evt) : evt).join(" ");

        this.forEach(function (el, i) {
            $super(evt, callback);
            applyNative(this, el, _evt, i, "removeEventListener");
        }, this);
        return this;
    },

    length: _get("len"),
    len: _get("ele.length"),
    each(fn) {
        [].every.call(this, function (el, idx)
            { return fn.call(el, el, idx) !== false; });
        return this;
    },

    get(idx) {
        return _is.undef(idx) ? [].slice.call(this) : this[idx >= 0 ? idx : idx + this.length];
    },
    nth: _get("get"),

    size() { return this.length; },
    toArray() { return this.get(); },
    remove() {
        return this.each(el => {
            if (_is.def(el.parentNode));
                el.parentNode.removeChild(el);
        });
    },

    not(sel) {
        let excludes, $this = this;
        return Ele(
            this.reduce(function (acc, el, idx) {
                if (_is.fn(sel) && _is.def(sel.call)) {
                    if (!sel.call(el, el, idx)) acc.push(el);
                } else {
                    excludes = _is.str(sel) ? $this.filter(sel) :
                        (_is.arrlike(sel) && _is.fn(sel.item)) ? [].slice.call(sel) : Ele(sel);
                    if (excludes.indexOf(el) < 0) acc.push(el);
                }
                return acc;
            }, [], this)
        );
    },

    filter(sel) {
        if (_is.fn(sel)) return this.not(this.not(sel));
        return [].filter.call(this, ele => _matches(ele, sel), this);
    },

    has(sel) {
        return this.filter(el => {
            return _is.obj(sel) ? _contains(el, sel) : Ele(el).find(sel).size();
        });
    },

    eq(idx) {
        return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
    },

    first() {
        let el = this.get(0);
        return el && !_is.obj(el) ? el : Ele(el);
    },

    last() {
        let el = this.get(-1);
        return el && !_is.obj(el) ? el : Ele(el);
    },

    find(sel) {
        let result, $this = this;
        if (!sel) result = Ele();
        else if (_is.obj(sel)) {
            result = Ele(sel).filter(el => {
                return [].some.call($this, parent => _contains(parent, el));
            });
        } else if (this.length === 1) { result = Ele(_qsa(this.get(0), sel)); }
        else { result = this.map(el => _qsa(el, sel)); }
        return result;
    },

    closest(sel, ctxt) {
        let list = _is.obj(sel) && Ele(sel);
        return Ele(
            this.reduce((acc, ele) => {
                do {
                    if (list ? list.indexOf(ele) >= 0 : _matches(ele, sel)) break;
                    ele = ele !== ctxt && _is.not("doc", ele) && ele.parentNode;
                } while (ele !== null && ele.nodeType === 1);
                if (ele && acc.indexOf(ele) < 0) acc.push(ele);
                return acc;
            }, [])
        );
    },

    parents(sel) {
        let ancestors = [], nodes = this;
        while (nodes.length > 0) {
            nodes = nodes.map(el => {
                if ((el = el.parentNode) && !_is.doc(el) && ancestors.indexOf(el) < 0) {
                    ancestors.push(el);
                    return el;
                }
            });
        }
        return _filter(ancestors, sel);
    },

    // `pluck` based on underscore.js, but way more powerful
    pluck(prop) { return this.map(el => el[prop]); },
    parent(sel) {
        return _filter(_uniq(this.pluck('parentNode')), sel);
    },

    children(sel) {
        return _filter(this.map(el => _children(el)), sel);
    },

    contents() {
        return this.map(el => el.contentDocument || [].slice.call(el.childNodes));
    },

    siblings(sel) {
        return _filter(this.map(el =>
            [].filter.call(
                _children(el.parentNode),
                child => (child !== el)
            )
        ), sel);
    },

    replaceWith(content) { return this.before(content).remove(); },
    clone() { return this.map(el => el.cloneNode(true)); },

    toggle(opt) {
        return this.each(el => {
            let _el = Ele(el);
            let _opt = opt || _el.style("display") === "none";
            _el[_opt ? "show" : "hide"]();
        });
    },

    prev(sel){ return Ele(this.pluck('previousElementSibling')).filter(sel || '*'); },
    next(sel){ return Ele(this.pluck('nextElementSibling')).filter(sel || '*'); },
    html(...args) {
        let [html] = args;
        return args.length ?
            this.each((el, idx) => {
                let originHTML = el.innerHTML;
                Ele(el).empty().append(_fnval(html, [idx, originHTML], el));
            }) : (this.length ? this.get(0).innerHTML : null);
    },

    text(...args) {
        let [text] = args;
        return args.length ?
            this.each((el, idx) => {
                let newText = _fnval(text, [idx, el.textContent], el);
                el.textContent = _is.nul(newText) ? '' : `${newText}`;
            }) : (this.length ? this.pluck('textContent').join("") : null);
    },

    attr(name, val) {
        let result;
        if (_is.str(name) && _is.undef(val)) {
            result = this.length && this.get(0).nodeType === 1 &&
                this.get(0).getAttribute(name);
            return !_is.nul(result) ? result : undefined;
        } else {
            return this.each((el, idx) => {
                if (el.nodeType !== 1) return;
                if (_is.arr(name)) {
                    for (let i in name)
                        _setAttr(el, i, name[i]);
                } else {
                    _setAttr(el, name, _fnval(val, [idx, el.getAttribute(name)], el));
                }
            });
        }
    },

    removeAttr(name) {
        return this.each(el => {
            el.nodeType === 1 && name.split(' ')
                .forEach(attr => { _setAttr(el, attr); });
        });
    },

    data(name, value) {
        let attrName = `data-${name}`.toLowerCase();
        let data = _is.def(value) ? this.attr(attrName, value) : this.attr(attrName);
        return data !== null ? _valfix(data) : undefined;
    },

    val(...args) {
        let [value] = args, _el;
        if (args.length) {
            if (_is.nul(value)) value = "";
            return this.each((el, idx) => {
                el.value = _fnval(value, [idx, el.value], el);
            });
        } else {
            _el = this.get(0);
            return _el && (_el.multiple ?
                Ele(_el).find('option').filter(el => el.selected).pluck('value') :
                _el.value);
        }
    },

    offset(coords) {
        let obj;
        if (coords) {
            return this.each((el, idx) => {
                let $this = Ele(el);
                let _coords = _fnval(coords, [idx, $this.offset()], el);
                let parentOffset = $this.offsetParent().offset();
                let props = {
                    top: _coords.top - parentOffset.top,
                    left: _coords.left - parentOffset.left
                };

                if ($this.style('position') === 'static') props.position = 'relative';
                $this.style(props);
            })
        }

        if (!this.length) return null;
        if (documentElement !== this.get(0) && !_contains(documentElement, this.get(0)))
            return { top: 0, left: 0 };

        obj = this.get(0).getBoundingClientRect();
        return {
            left: obj.left + window.pageXOffset,
            top: obj.top + window.pageYOffset,
            width: Math.round(obj.width),
            height: Math.round(obj.height)
        };
    },

    style(...args) {
        let [prop, val] = args, css = '', key;
        if (args.length < 2) {
            let el = this.get(0);
            if (!el) return;
            if (_is.str(prop)) {
                return el.style[prop] || window.getComputedStyle(el, '').getPropertyValue(prop);
            } else if (_is.arr(prop)) {
                let props = {};
                let computedStyle = window.getComputedStyle(el, '');
                prop.forEach(_prop => {
                    props[_prop] = (el.style[_prop] || computedStyle.getPropertyValue(_prop))
                });
                return props;
            }
        }

        if (_is.str(prop)) {
            if (!val && val !== 0) {
                this.each(el => { el.style.removeProperty(prop); });
            } else {
                css = prop + ":" + _maybeAddPx(prop, val);
            }
        } else {
            for (key in prop) {
                if (!prop[key] && prop[key] !== 0) {
                    this.each(el => { el.style.removeProperty(key); });
                } else {
                    css += key + ':' + _maybeAddPx(key, prop[key]) + ';';
                }
            }
        }

        return this.each(el => { el.style.cssText += ';' + css; });
    },

    show() { return this.style("display", ""); },
    hide() { return this.style("display", "none"); },
    empty() { return this.each(el => { el.innerHTML = ''; }); },
    index(el) {
        return el ? this.indexOf(Ele(el).get(0)) : this.parent().children().indexOf(this.get(0));
    },

    hasClass(name) {
        if (!name) return false;
        return [].some.call(this, function (el) {
            return this.test(_getclass(el));
        }, _classRE(name));
    },

    addClass(name) {
        if (!name) return this;
        return this.each(function (el, idx) {
            if (!('className' in el)) return;

            let classList = [], cls = _getclass(el);
            _fnval(name, [idx, cls], el).split(/\s+/g).forEach(function (_name) {
                if (!Ele(this).hasClass(_name)) classList.push(_name);
            }, el);

            classList.length && _getclass(el, cls + (cls ? " " : "") + classList.join(" "));
        });
    },

    removeClass(name) {
        return this.each(function (el, idx) {
            if (!('className' in el)) return;
            if (_is.undef(name)) return _getclass(el, '');

            let classList = _getclass(el);
            _fnval(name, [idx, classList], el).split(/\s+/g).forEach(function (_name) {
                classList = classList.replace(_classRE(_name), " ");
            });

            _getclass(el, classList.trim());
        });
    },

    toggleClass(name, when) {
        if (!name) return this;
        return this.each(function (el, idx) {
            let $this = Ele(el);
            _fnval(name, [idx, _getclass(el)], el).split(/\s+/g)
            .forEach(function (_name) {
                (_is.undef(when) ? !$this.hasClass(_name) : when) ?
                    $this.addClass(_name) : $this.removeClass(_name);
            });
        });
    },

    scrollTop(val) {
        if (!this.length) return;

        let hasScroll = 'scrollTop' in this.get(0);
        if (_is.undef(val)) return this.get(0)[hasScroll ? "scrollTop" : "pageYOffset"];
        return this.each(function () {
            hasScroll ? (this.scrollTop = val) : this.scrollTo(this.scrollX, val);
        });
    },

    scrollLeft(val) {
        if (!this.length) return;

        let hasScroll = 'scrollLeft' in this.get(0);
        if (_is.undef(val)) return this.get(0)[hasScroll ? "scrollLeft" : "pageXOffset"];
        return this.each(function () {
            hasScroll ? (this.scrollLeft = val) : this.scrollTo(val, this.scrollY);
        });
    },

    offsetParent() {
        return this.map(function (el) {
            let parent = el.offsetParent || document.body;
            while (parent && !/^(?:body|html)$/i.test(parent.nodeName) &&
                Ele(parent).style("position") === "static")
                parent = parent.offsetParent;
            return parent;
        });
    },

    position() {
        if (!this.length) return;

        let elem = this.get(0),
            offsetParent = this.offsetParent(),
            offset = this.offset(),
            parentOffset = /^(?:body|html)$/i.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

        offset.top -= parseFloat(Ele(elem).style('margin-top')) || 0;
        offset.left -= parseFloat(Ele(elem).style('margin-left')) || 0;

        parentOffset.top += parseFloat(Ele(offsetParent[0]).style('border-top-width')) || 0;
        parentOffset.left += parseFloat(Ele(offsetParent[0]).style('border-left-width')) || 0;

        return {
            top: offset.top - parentOffset.top,
            left: offset.left - parentOffset.left
        }
    },

    getAnime() { return this.anime; },
    timeline(opt = {}) {
        this.anime = timeline({
            targets: _toArr(this),
            ...opt
        });

        return this;
    },
    animate(opt = {}, offset) {
        opt = _fnval(opt, [{ stagger, remove, random }, offset], this);
        _is.def(this.anime) && this.anime.add ? this.anime.add(opt, offset) :
            (this.anime = anime({ targets: _toArr(this), ...opt }));

        return this;
    },
},

// Generate shortforms for events eg. .click(), .hover(), etc...
nativeEvents.reduce((acc, name) => {
    // Handle event binding
    acc[name] = function (...args) { return this.on(name, ...args); };
    return acc;
}, {
    hover(fnOver, fnOut)
        { return this.mouseenter(fnOver).mouseleave(fnOut || fnOver); }
}),

// Generate the `width` and `height` methods
['width', 'height'].reduce((acc, sz) => {
    let prop = _capital(sz);
    acc[sz] = function (value) {
        let offset, el = this.get(0);
        if (_is.undef(value)) {
            if (_is.win(el)) {
                return el[`inner${prop}`];
            } else if (_is.doc(el)) {
                return el.documentElement[`scroll${prop}`];
            } else { return (offset = this.offset()) && offset[sz]; }
        } else {
            return this.each((_el, idx) => {
                el = Ele(_el);
                el.style(sz, _fnval(value, [idx, el[sz]()], _el));
            });
        }
    };

    return acc;
}, {}),

// Generate the `after`, `prepend`, `before`, `append`, `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
[ 'after', 'prepend', 'before', 'append' ].reduce(function (acc, fn, idx) {
    let inside = idx % 2 //=> prepend, append
    acc[fn] = function (...args) {
        // Arguments can be nodes, arrays of nodes, Element objects and HTML strings
        let clone = this.length > 1;
        let nodes = _map(args, function (arg) {
            if (_is.arr(arg)) {
                return arg.reduce((acc, el) => {
                    if (_is.def(el.nodeType)) acc.push(el);
                    else if (_is.inst(el, Ele)) acc = acc.concat(el.get());
                    else if (_is.str(el)) acc = acc.concat(_createElem(el));
                    return acc;
                }, []);
            }

            return _is.obj(arg) || _is.nul(arg) ? arg : _createElem(arg);
        });

        return this.each(function (target) {
            let parent = inside ? target : target.parentNode;
            let parentInDoc = _contains(documentElement, parent);
            let next = target.nextSibling, first = target.firstChild;

            // Convert all methods to a "before" operation
            target = [next, first, target, null] [idx];
            nodes.forEach(function (node) {
                if (clone) node = node.cloneNode(true);
                else if (!parent) return Ele(node).remove();
                parent.insertBefore(node, target);

                if (parentInDoc) {
                    traverseDF(node, function (el) {
                        if (!_is.nul(el.nodeName) && el.nodeName.toUpperCase() === 'SCRIPT' &&
                            (!el.type || el.type === 'text/javascript') && !el.src) {
                            let target = el.ownerDocument ? el.ownerDocument.defaultView : window;
                            target.eval.call(target, el.innerHTML);
                        }
                    });
                }
            });
        });
    };

    // after    => insertAfter, prepend  => prependTo
    // before   => insertBefore, append   => appendTo
    acc[inside ? `${fn}To` : `insert${_capital(fn)}`] = function (html) {
        Ele(html) [fn] (this);
        return this;
    };

    return acc;
}, {}));

export let el = Ele;
export default Ele;
*/
