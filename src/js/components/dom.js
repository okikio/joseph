import { _matches, _log, _is, keys, _fnval, _capital, assign } from "./util";
import _event from './event';

const { documentElement } = document;

let Ele;
let tagRE = /^\s*<(\w+|!)[^>]*>/;
let { applyNative, nativeEvents } = _event;
let tagExpandRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;
let _cssNumber = ["column-count", "columns", "font-weight", "line-height", "opacity", "z-index", "zoom"];
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

// Check if the parent node contains the given DOM node. Returns false if both are the same node.
export let _contains = (parent, node) => {
    if (parent.contains) return parent !== node && parent.contains(node);
    while (node && (node = node.parentNode))
        if (node === parent) return true;
    return false;
};

// Support the Element Object as an Array
export let _toArr = val => (_is.inst(val, Ele) ? val.toArray() : val);
export let _concat = function (...args) {
    [].map.call(args, val => _toArr(val));
    return [].concat.apply(_toArr(this), args);
};

// Create a flat Array
export let _flatten = arr => (arr.length > 0 ? _concat.apply([], arr) : arr);

// Map Objects
export let _map = (obj, fn, ctxt) => {
    return _flatten([].map.call(obj, fn, ctxt)
        .filter(item => _is.def(item)));
};

// Select all children of an element
let _children = el => {
    return 'children' in el ? [].slice.call(el.children) :
        _map(el.childNodes, node => {
            if (node.nodeType === 1) return node;
        });
};

// Class name cache
let _cache = {};

// Get the class name for an Element
let _getclass = function classNme(node, value) {
    let name = node.className || '';
    let svg  = name && !_is.undef(name.baseVal);

    if (_is.undef(value)) return svg ? name.baseVal : name;
    svg ? (name.baseVal = value) : (node.className = value);
};

// Class name RegExp
let _classRE = name => {
    return name in _cache ? _cache[name] :
        (_cache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
};

// Create an Element List from a HTML string
let _createElem = html => {
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
let _elem;
let el = _elem = (sel, ctxt) => {
    if (_is.str(sel)) {
        sel = sel.trim();
        if (tagRE.test(sel)) { return _createElem(sel); }
        else { return _qsa(ctxt, sel); }
    } else if (_is.inst(sel, Ele)) { return sel.ele; }
    else if (_is.arr(sel) || _is.inst(sel, NodeList))
        { return [...sel].filter(item => _is.def(item)); }
    else if (_is.obj(sel) || _is.el(sel)) { return [sel]; }
    else if (_is.fn(sel)) { new Ele(document).ready(sel); }
    return [];
};

// Traverse DOM Depth First
let traverseDF = (_node, fn, childType = "childNodes") => {
    let recurse;
    // This is a recurse and immediately-invoking function
    recurse = node => { // Step 2
        node[childType] && node[childType].forEach(recurse, node); // Step 3
        fn.call(node, node); // Step 4
    };
    recurse(_node); // Step 1
};

// Quickly filter nodes by a selector
export let _filter = (nodes, sel) => !_is.def(sel) ? el(nodes) : filter(el(nodes), sel);

// Select all the different values in an Array, based on underscorejs
export let _uniq = arr => {
    return [].filter.call(arr, (val, idx) => arr.indexOf(val) === idx);
};

// Quickly set the value of an attribute or remove the attribute completely from a node
let _setAttr = (node, name, value) => value === null ? node.removeAttribute(name) : node.setAttribute(name, value);

// Transform  string value to the proper type of value eg. "12" = 12, "[12, 'xyz']" = [12, 'xyz']
let _valfix = value => {
    let validTypes = /^true|false|null|undefined|\d+$/;
    let _fn = v => Function(`"use strict"; return ${v};`) ();
    let objectType = /^[[{]([\s\S]+)?[\]}]$/;
    try {
        return validTypes.test(value) ? _fn(value) :
            objectType.test(value) ? JSON.parse(value.replace(/'/g, "\"")) : value;
    } catch (e) { return value; }
};

// Decide if the value deserves px at the
let _maybeAddPx = (name, val) => {
    return _is.num(+val) && !_cssNumber.includes(name) ? `${val}px` : val;
};

// Element Object [Based on Zepto.js]
export let slice = (_el, ...args) => el([].slice.apply(_el, args));
export let map = (_el, fn) => el(_map(_el, (el, i) => fn.call(el, el, i), _el));
export let each = (_el, fn) => {
    [].every.call(_el, function (el, idx)
        { return fn.call(el, el, idx) !== false; });
    return _el;
};
export let get = (_el, idx) => {
    return _is.undef(idx) ? [].slice.call(_el) : _el[idx >= 0 ? idx : idx + _el.length];
};
export let nth = get;
    // size() { return this.length; }
export let toArray = _el  => get(_el);
export let remove = _el => {
    return each(_el, el => {
        if (_is.def(el.parentNode));
            el.parentNode.removeChild(el);
    });
};
export let filter = (_el, sel) => {
    _el = el(_el);
    if (!_is.def(sel)) return _el;
    if (_is.fn(sel))
        return [].filter.call(_el, sel, _el);
    return [].filter.call(_el, ele => _matches(ele, sel), _el);
};
export let find = (_el, sel) => {
    let result;
    if (!sel) result = el();
    else if (_is.obj(sel)) {
        result = filter(el(sel), el => {
            return [].some.call(_el, parent => _contains(parent, el));
        });
    } else if (_el.length === 1) { result = el(_qsa(get(_el, 0), sel)); }
    else { result = map(_el, el => _qsa(el, sel)); }
    return result;
};
export let has = (_el, sel) => {
    return filter(_el, el => {
        return _is.obj(sel) ? _contains(el, sel) : find(_elem(el), sel).length;
    });
};
export let eq = (_el, idx) => {
    return idx === -1 ? slice(_el, idx) : slice(_el, idx, +idx + 1);
};
export let first = _el => {
    let el = get(_el, 0);
    return el && !_is.obj(el) ? el : _elem(el);
};
export let last = _el => {
    let el = get(_el, -1);
    return el && !_is.obj(el) ? el : _elem(el);
};
export let closest = (_el, sel, ctxt) => {
    let list = _is.obj(sel) && el(sel);
    return el(
        [].reduce((acc, ele) => {
            do {
                if (list ? [].indexOf.apply(list, ele) >= 0 : _matches(ele, sel)) break;
                ele = ele !== ctxt && !_is.doc( ele) && ele.parentNode;
            } while (ele !== null && ele.nodeType === 1);
            if (ele && acc.indexOf(ele) < 0) acc.push(ele);
            return acc;
        }, [])
    );
};
export let parents = (_el, sel) => {
    let ancestors = [], nodes = _el;
    while (nodes.length > 0) {
        nodes = nodes.map(el => {
            if ((el = el.parentNode) && !_is.doc(el) && ancestors.indexOf(el) < 0) {
                ancestors.push(el);
                return el;
            }
        });
    }
    return filter(ancestors, sel);
};

// `pluck` based on underscore.js, but way more powerful
export let pluck = (_el, prop) => map(_el, el => el[prop]);
export let parent = (_el, sel) => {
    return filter(_uniq(pluck(_el, 'parentNode')), sel);
};
export let children = (_el, sel) => {
    return filter(map(_el, el => _children(el)), sel);
};
export let contents = _el => {
    return map(_el, el => el.contentDocument || [].slice.call(el.childNodes));
};
export let siblings = (_el, sel) => {
    return filter(map(_el, el =>
        [].filter.call(
            _children(el.parentNode),
            child => (child !== el)
        )
    ), sel);
};
export let replaceWith = (_el, content) => remove(before(_el, content));
export let clone = _el => map(_el, el => el.cloneNode(true));
export let toggle = (_el, opt) => {
    return each(_el, el => {
        let _el = _elem(el);
        let _opt = opt || _el.style("display") === "none";
        _el[_opt ? "show" : "hide"]();
    });
};
export let prev = (_el, sel) => filter(_elem(pluck(_el, 'previousElementSibling')), sel || '*');
export let next = (_el, sel) => filter(_elem(pluck(_el, 'nextElementSibling')), sel || '*');
export let html = (_el, ...args) => {
    let [html] = args;
    return args.length ?
        this.each((el, idx) => {
            let originHTML = el.innerHTML;
            new Ele(el).empty().append(_fnval(html, [idx, originHTML], el));
        }) : (this.length ? this.get(0).innerHTML : null);
};

export let text = (_el, ...args) => {
        let [text] = args;
        return args.length ?
            this.each((el, idx) => {
                let newText = _fnval(text, [idx, el.textContent], el);
                el.textContent = _is.nul(newText) ? '' : `${newText}`;
            }) : (this.length ? this.pluck('textContent').join("") : null);
    }

export let attr = (_el, name, val) => {
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
    }

export let removeAttr = (_el, name) => {
        return this.each(el => {
            el.nodeType === 1 && name.split(' ')
                .forEach(attr => { _setAttr(el, attr); });
        });
    }

export let data = (_el, name, value) => {
        let attrName = `data-${name}`.toLowerCase();
        let data = _is.def(value) ? this.attr(attrName, value) : this.attr(attrName);
        return data !== null ? _valfix(data) : undefined;
    }

export let val = (_el, ...args) => {
        let [value] = args, _el;
        if (args.length) {
            if (_is.nul(value)) value = "";
            return this.each((el, idx) => {
                el.value = _fnval(value, [idx, el.value], el);
            });
        } else {
            _el = this.get(0);
            return _el && (_el.multiple ?
                new Ele(_el).find('option').filter(el => el.selected).pluck('value') :
                _el.value);
        }
    }

export let offset = (_el, coords) => {
        let obj;
        if (coords) {
            return this.each((el, idx) => {
                let $this = new Ele(el);
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
    }

export let style = (_el, ...args) => {
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
    }

export let show = (_el, ) { return this.style("display", ""); => }
export let hide = (_el, ) { return this.style("display", "none"); => }
export let empty = (_el, ) { return this.each(el => { el.innerHTML = ''; }); => }
export let index = (_el, el) => {
        return el ? this.indexOf(new Ele(el).get(0)) : this.parent().children().indexOf(this.get(0));
    }

export let hasClass = (_el, name) => {
        if (!name) return false;
        return [].some.call(this, function (el) {
            return this.test(_getclass(el));
        }, _classRE(name));
    }

export let addClass = (_el, name) => {
        if (!name) return this;
        return this.each(function (el, idx) {
            if (!('className' in el)) return;

            let classList = [], cls = _getclass(el);
            _fnval(name, [idx, cls], el).split(/\s+/g).forEach(function (_name) {
                if (!new Ele(this).hasClass(_name)) classList.push(_name);
            }, el);

            classList.length && _getclass(el, cls + (cls ? " " : "") + classList.join(" "));
        });
    }

export let removeClass = (_el, name) => {
        return this.each(function (el, idx) {
            if (!('className' in el)) return;
            if (_is.undef(name)) return _getclass(el, '');

            let classList = _getclass(el);
            _fnval(name, [idx, classList], el).split(/\s+/g).forEach(function (_name) {
                classList = classList.replace(_classRE(_name), " ");
            });

            _getclass(el, classList.trim());
        });
    }

export let toggleClass = (_el, name, when) => {
        if (!name) return this;
        return this.each(function (el, idx) {
            let $this = new Ele(el);
            _fnval(name, [idx, _getclass(el)], el).split(/\s+/g)
            .forEach(function (_name) {
                (_is.undef(when) ? !$this.hasClass(_name) : when) ?
                    $this.addClass(_name) : $this.removeClass(_name);
            });
        });
    }

export let scrollTop = (_el, val) => {
        if (!this.length) return;

        let hasScroll = 'scrollTop' in this.get(0);
        if (_is.undef(val)) return this.get(0)[hasScroll ? "scrollTop" : "pageYOffset"];
        return this.each(function () {
            hasScroll ? (this.scrollTop = val) : this.scrollTo(this.scrollX, val);
        });
    }

export let scrollLeft = (_el, val) => {
        if (!this.length) return;

        let hasScroll = 'scrollLeft' in this.get(0);
        if (_is.undef(val)) return this.get(0)[hasScroll ? "scrollLeft" : "pageXOffset"];
        return this.each(function () {
            hasScroll ? (this.scrollLeft = val) : this.scrollTo(val, this.scrollY);
        });
    }

export let offsetParent = (_el, ) => {
        return this.map(function (el) {
            let parent = el.offsetParent || document.body;
            while (parent && !/^(?:body|html)$/i.test(parent.nodeName) &&
                new Ele(parent).style("position") === "static")
                parent = parent.offsetParent;
            return parent;
        });
    }

export let position = (_el, ) => {
        if (!this.length) return;

        let elem = this.get(0),
            offsetParent = this.offsetParent(),
            offset = this.offset(),
            parentOffset = /^(?:body|html)$/i.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

        offset.top -= parseFloat(new Ele(elem).style('margin-top')) || 0;
        offset.left -= parseFloat(new Ele(elem).style('margin-left')) || 0;

        parentOffset.top += parseFloat(new Ele(offsetParent[0]).style('border-top-width')) || 0;
        parentOffset.left += parseFloat(new Ele(offsetParent[0]).style('border-left-width')) || 0;

        return {
            top: offset.top - parentOffset.top,
            left: offset.left - parentOffset.left
        }
    }
};

assign(Ele.prototype,
    // Generate shortforms for events eg. .click(), .hover(), etc...
    `ready load blur focus focusin focusout resize click scroll dblclick mousedown
    mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit
    keydown keypress keyup contextmenu`.split(/[\s\n]+/g).reduce((acc, name) => {
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
                    el = new Ele(_el);
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
                    else if (!parent) return new Ele(node).remove();
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
            new Ele(html) [fn] (this);
            return this;
        };

        return acc;
    }, {})
);

export let el = (sel, ctxt) => {
    return new Ele(sel, ctxt);
};