import { _matches, _is, _fnval, _capital } from "./util";
import ele, { _qsa, _elem, _createElem } from './ele-dev';

// Quick access to a new ele object
export let el = (sel, ctxt) => {
    return _is.inst(sel, ele) && !_is.usable(ctxt) ? sel : new ele(sel, ctxt);
};

// Select specific element at an index of the ele object
export let get = (_el, idx) => {
    _el = el(_el);
    return _is.undef(idx) ? [].slice.call(_el) : _el[idx >= 0 ? idx : idx + _el.length];
};
export let nth = get;
export let toArray = val => (_is.inst(val, ele) ? get(val) : val); // Convert ele objects to arrays
export let indexOf = (_el, val) => [].indexOf.call(el(_el), val); // Array.indexOf for the ele object

// Array.slice designed to work with Elements
export let slice = (_el, ...args) => el([].slice.apply(el(_el), args));

// Create a wrapper ele object for an element at a certain index
export let eq = (_el, idx) => {
    return idx === -1 ? slice(_el, idx) : slice(_el, idx, +idx + 1);
};

// Select the first element in ele object
export let first = _el => {
    let el = get(_el, 0);
    return el && !_is.obj(el) ? el : new ele(el);
};

// Select the last element in ele object
export let last = _el => {
    let el = get(_el, -1);
    return el && !_is.obj(el) ? el : new ele(el);
};

// Support the Element Object as an Array
let _concat = function (...args) {
    [].map.call(args, val => toArray(val)); // Transform Elements to Arrays
    return [].concat(...args);
};

// Map objects and remove undefined/null values
let _map = (obj, fn, ctxt) => {
    let arr = [].map.call(obj, fn, ctxt)
        .filter(item => _is.usable(item));

    // Creates a flat Array of Objects
    return (arr.length > 0 ? _concat(...arr) : arr);
};

// Added support for element mapping
export let map = (_el, fn) => {
    _el = el(_el);
    return el(_map(_el, (el, i) => fn.call(el, el, i)));
};

// Functions the same way Array.forEach does
export let forEach = (_el, fn, ctxt) => {
    _el = el(_el);
    [].forEach.call(_el, function (el, idx)
        { fn.call(ctxt, el, idx); }, ctxt);
    return _el;
};

/* Similar to forEach, however, the context of the iterator is set and
   it allows the iterators return value to stop the iteration just like Array.every */
export let each = (_el, fn) => {
    _el = el(_el);
    [].every.call(_el, function (el, idx)
        { return fn.call(el, el, idx) !== false; });
    return _el;
};

// Quickly filter nodes by a selector
export let filter = (_el, sel) => {
    _el = el(_el);
    if (_is.undef(sel)) return _el;
    return el([].filter.call(_el, _is.fn(sel) ? sel : ele => _matches(ele, sel), _el));
};

// Check if the parent node contains the given DOM node. Returns false if both are the same node.
let _contains = (parent, node) => {
    if (parent.contains) return parent !== node && parent.contains(node);
    while (node && (node = node.parentNode))
        if (node === parent) return true;
    return false;
};

// Find an element that matches a selector in a ele object
export let find = (_el, sel) => {
    let result;
    _el = el(_el);
    if (!sel) result = el();
    else if (_is.obj(sel)) {
        result = filter(sel, el => {
            return [].some.call(_el, parent => _contains(parent, el));
        });
    } else if (_el.length === 1) { result = el(_qsa(first(_el), sel)); }
    else { result = map(_el, el => _qsa(el, sel)); }
    return result;
};

// Check to see if a ele object has a certain element
export let has = (_el, sel) => {
    return filter(_el, el => {
        return _is.obj(sel) ? _contains(el, sel) : find(el, sel).length;
    });
};

// Traverse upwards from the current element to find the first element that matches the selector.
export let closest = (_el, sel, ctxt) => {
    let list = _is.obj(sel) && el(sel);
    _el = el(el);
    return el(
        [].reduce.call(_el, (acc, $el) => {
            do {
                if (list ? indexOf(list, $el) >= 0 : _matches($el, sel)) break;
                $el = $el !== ctxt && !_is.doc($el) && $el.parentNode;
            } while ($el !== null && $el.nodeType === 1);
            if ($el && acc.indexOf($el) < 0) acc.push($el);
            return acc;
        }, [])
    );
};

// Select the parents of an element
export let parents = (_el, sel) => {
    let ancestors = [], nodes = el(_el);
    while (nodes.length > 0) {
        nodes = map(nodes, el => {
            if ((el = el.parentNode) && !_is.doc(el) && ancestors.indexOf(el) < 0) {
                ancestors.push(el);
                return el;
            }
        });
    }
    return filter(ancestors, sel);
};

// `pluck` based on underscore.js, select a specific property from the ele object
export let pluck = (_el, prop) => map(_el, el => el[prop]);

// Select all the different values in an Array, based on underscorejs
let _uniq = arr => {
    return [].filter.call(arr, (val, idx) => arr.indexOf(val) === idx);
};

// Get immediate parents of each element in the collection. If CSS selector is given, filter results to include only ones matching the selector.
export let parent = (_el, sel) => {
    return filter(_uniq(pluck(_el, 'parentNode')), sel);
};

// Select all children of an element
let _children = val => {
    return 'children' in val ? [].slice.call(val.children) :
        _map(val.childNodes, node => {
            if (node.nodeType === 1) return node;
        });
};

// Get immediate children of each element in the current collection. If selector is given, filter the results to only include ones matching the CSS selector.
export let children = (_el, sel) => {
    return filter(map(_el, el => _children(el)), sel);
};

// Get the children of each element in the collection, including text and comment nodes.
export let contents = _el => {
    return map(_el, el => el.contentDocument || [].slice.call(el.childNodes));
};

// Get all sibling nodes of each element in the collection. If CSS selector is specified, filter the results to contain only elements that match the selector.
export let siblings = (_el, sel) => {
    return filter(map(_el, el =>
        [].filter.call(
            _children(el.parentNode),
            child => (child !== el)
        )
    ), sel);
};

/* - DOM Manipulation - */
// Remove elements in the current collection from their parent nodes, effectively detaching them from the DOM.
export let remove = _el => {
    return each(_el, el => {
        if (_is.def(el.parentNode));
            el.parentNode.removeChild(el);
    });
};

// Traverse DOM Depth First
let traverseDF = (_node, fn) => {
    let recurse;
    // This is a recurse and immediately-invoking function
    recurse = node => { // Step 2
        node.childNodes && [...node.childNodes].forEach(recurse, node); // Step 3
        fn.call(node, node); // Step 4
    };
    recurse(_node); // Step 1
};

// Generate the `after`, `prepend`, `before`, `append`, `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
export let { after, prepend, before, append, insertAfter, insertBefore, appendTo, prependTo } = [ 'after', 'prepend', 'before', 'append' ].reduce((acc, fn, idx) => {
    let inside = idx % 2 //=> prepend, append
    acc[fn] = function (_el, ...args) {
        _el = el(el);
        // Arguments can be nodes, arrays of nodes, Element objects and HTML strings
        let clone = _el.length > 1;
        let nodes = _map(args, arg => {
            if (_is.arr(arg)) {
                return arg.reduce((acc, el) => {
                    if (_is.def(el.nodeType)) acc.push(el);
                    else if (_is.inst(el, ele)) acc = acc.concat(toArray(el));
                    else if (_is.str(el)) acc = acc.concat(_createElem(el));
                    return acc;
                }, []);
            }

            return _is.obj(arg) || _is.nul(arg) ? arg : _createElem(arg);
        });

        return each(_el, target => {
            let parent = inside ? target : target.parentNode;
            let parentInDoc = _contains(document.documentElement, parent);
            let next = target.nextSibling, first = target.firstChild;

            // Convert all methods to a "before" operation
            target = [next, first, target, null] [idx];
            nodes.forEach(node => {
                if (clone) node = node.cloneNode(true);
                else if (!parent) return remove(node);
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
    acc[inside ? `${fn}To` : `insert${_capital(fn)}`] = (_el, html) => {
        _el = el(_el);
        acc[fn](el(html), _el);
        return _el;
    };

    return acc;
}, {});

// Replace each element in the collection–both its contents and the element itself–with the new content. Content can be of any type described in before.
export let replaceWith = (_el, content) => remove(before(_el, content));
export let clone = _el => map(_el, el => el.cloneNode(true)); // Duplicate all elements in the collection via deep clone.

// CSS properties that use unitless numbers
let _cssNumber = ["column-count", "columns", "font-weight", "line-height", "opacity", "z-index", "zoom"];

// Decide if the value deserves px at the
let _maybeAddPx = (name, val) => {
    return _is.num(+val) && !_cssNumber.includes(name) ? `${val}px` : val;
};

// Read or set CSS properties on DOM elements.
export let style = (_el, ...args) => {
    let [prop, val] = args, css = '', key;
    if (args.length < 2) {
        let el = first(_el);
        if (!el) return;
        if (_is.str(prop)) {
            return el.style[prop] || window.getComputedStyle(el, '').getPropertyValue(prop);
        } else if (_is.arr(prop)) {
            let props = {};
            let computedStyle = window.getComputedStyle(el, '');
            prop.forEach(_prop => {
                props[_prop] = (el.style[_prop] || computedStyle.getPropertyValue(_prop));
            });
            return props;
        }
    }

    if (_is.str(prop)) {
        if (!val && val !== 0) {
            each(_el, el => { el.style.removeProperty(prop); });
        } else {
            css = prop + ":" + _maybeAddPx(prop, val);
        }
    } else {
        for (key in prop) {
            if (!prop[key] && prop[key] !== 0) {
                each(_el, el => { el.style.removeProperty(key); });
            } else {
                css += key + ':' + _maybeAddPx(key, prop[key]) + ';';
            }
        }
    }

    return each(_el, el => { el.style.cssText += ';' + css; });
};

// Generate the `width` and `height` methods
export let { width, height }= ['width', 'height'].reduce((acc, sz) => {
    let prop = _capital(sz);
    acc[sz] = (_el, value) => {
        let _offset, el = first(_el);
        if (_is.undef(value)) {
            if (_is.win(el)) {
                return el[`inner${prop}`];
            } else if (_is.doc(el)) {
                return el.documentElement[`scroll${prop}`];
            } else { return (_offset = offset(_el)) && _offset[sz]; }
        } else {
            return each(_el, ($el, idx) => {
                style($el, sz, _fnval(value, [idx, el[sz]()], $el));
            });
        }
    };

    return acc;
}, {});

// Show/hide an element
export let show = _el => { return style(_el, "display", ""); };
export let hide = _el => { return style(_el, "display", "none"); };

// Toggle between showing and hiding each of element in the ele object, based on whether the first element is visible or not.
export let toggle = (_el, opt) => {
    return each(_el, el => {
        let _el = _elem(el);
        let _opt = opt || style(_el, "display") === "none";
        _opt ? show(_el) : hide(_el)
    });
};

// Select element siblings based on selector
export let prev = (_el, sel) => filter(pluck(_el, 'previousElementSibling'), sel || '*');
export let next = (_el, sel) => filter(pluck(_el, 'nextElementSibling'), sel || '*');

// Empty the value of an element in the ele object
export let empty = _el => each(_el, el => { el.innerHTML = ''; });

// Get or set HTML contents of elements in the collection. When no content given, returns innerHTML of the first element.
export let html = (_el, ...args) => {
    let [html] = args;
    _el = el(_el);
    return args.length ?
        each(_el, (el, idx) => {
            let originHTML = el.innerHTML;
            append(empty(el), _fnval(html, [idx, originHTML], el));
        }) : (_el.length ? first(_el).innerHTML : null);
};

export let text = (_el, ...args) => {
    let [text] = args;
    _el = el(_el);
    return args.length ?
        each(_el, (el, idx) => {
            let newText = _fnval(text, [idx, el.textContent], el);
            el.textContent = _is.nul(newText) ? '' : `${newText}`;
        }) : (_el.length ? pluck(_el, 'textContent').join("") : null);
};

// Quickly set the value of an attribute or remove the attribute completely from a node
let _setAttr = (node, name, value) => value === null ? node.removeAttribute(name) : node.setAttribute(name, value);

// Set the attribute of elements in the ele object
export let attr = (_el, name, val) => {
    let result;
    _el = el(_el);
    if (_is.str(name) && _is.undef(val)) {
        result = _el.length && first(_el).nodeType === 1 &&
            first(_el).getAttribute(name);
        return !_is.nul(result) ? result : undefined;
    } else {
        return each(_el, (el, idx) => {
            if (el.nodeType !== 1) return;
            if (_is.arr(name)) {
                for (let i in name)
                    _setAttr(el, i, name[i]);
            } else {
                _setAttr(el, name, _fnval(val, [idx, el.getAttribute(name)], el));
            }
        });
    }
};

// Remove an attribute from all elements in the ele object
export let removeAttr = (_el, name) => {
    return each(_el, el => {
        el.nodeType === 1 && name.split(' ')
            .forEach(attr => { _setAttr(el, attr); });
    });
};

// Transform string values to the proper type of value eg. "12" = 12, "[12, 'xyz']" = [12, 'xyz']
let _valfix = value => {
    let validTypes = /^true|false|null|undefined|\d+$/;
    let _fn = v => Function(`"use strict"; return ${v};`) ();
    let objectType = /^[[{]([\s\S]+)?[\]}]$/;
    try {
        return validTypes.test(value) ? _fn(value) :
            objectType.test(value) ? JSON.parse(value.replace(/'/g, "\"")) : value;
    } catch (e) { return value; }
};

// Read or write data-* DOM attributes. Behaves like attr, but prepends data- to the attribute name.
export let data = (_el, name, value) => {
    let attrName = `data-${name}`.toLowerCase();
    let data = _is.def(value) ? attr(_el, attrName, value) : attr(_el, attrName);
    return data !== null ? _valfix(data) : undefined;
};

/* Get or set the value of form controls. When no value is given, return the value of the first element.
   For <select multiple>, an array of values is returend. When a value is given, set all elements to this value. */
export let val = (_el, value, ...args) => {
    _el = el(_el);
    if (args.length) {
        if (_is.nul(value)) value = "";
        return each(_el, (el, idx) => {
            el.value = _fnval(value, [idx, el.value], el);
        });
    } else {
        _el = first(_el);
        return _el && (_el.multiple ?
            pluck(filter(find(_el, 'option'), el => el.selected), 'value') :
            _el.value);
    }
};

// Get position of the element in the document. Returns an object with properties: top, left, width and height.
export let offset = (_el, coords) => {
    let obj;
    _el = el(_el);
    if (coords) {
        return each(_el, (el, idx) => {
            let $this = new ele(el);
            let _coords = _fnval(coords, [idx, offset($this)], el);
            let parentOffset = offset(offsetParent($this));
            let props = {
                top: _coords.top - parentOffset.top,
                left: _coords.left - parentOffset.left
            };

            if (style($this, 'position') === 'static') props.position = 'relative';
            style($this, props);
        })
    }

    if (!_el.length) return null;
    if (document.documentElement !== first(_el) && !_contains(document.documentElement, first(_el)))
        return { top: 0, left: 0 };

    obj = first(_el).getBoundingClientRect();
    return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
    };
};

// Get the position of an element in the ele object collection. When no element is given, returns position of the current element among its siblings. When an element is given, returns its position in the current collection. Returns -1 if not found.
export let index = (_el, el) => {
    _el = new ele(_el);
    return el ? indexOf(_el, first(el)) : indexOf(children(parent(_el)), first(_el));
};

// Class name cache
let classcache = {};

// Get the class name for an element
let getclass = (node, value) => {
    let name = node.className || '';
    let svg  = name && !_is.undef(name.baseVal);

    if (_is.undef(value)) return svg ? name.baseVal : name;
    svg ? (name.baseVal = value) : (node.className = value);
};

// Class name RegExp
let _classRE = name => {
    return name in classcache ? classcache[name] :
        (classcache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
};

// Check if any elements in the collection have the specified class.
export let hasClass = (_el, name) => {
    if (!name) return false;
    return [].some.call(el(_el), el => {
        return _classRE(name).test(getclass(el));
    });
};

// Add class name to each of the elements in the collection. Multiple class names can be given in a space-separated string.
export let addClass = (_el, name) => {
    _el = el(_el);
    if (!name) return _el;
    return each(_el, (el, idx) => {
        if (!('className' in el)) return;

        let classList = [], cls = getclass(el);
        _fnval(name, [idx, cls], el).split(/\s+/g).forEach(_name => {
            if (!hasClass(el, _name)) classList.push(_name);
        });

        classList.length && getclass(el, cls + (cls ? " " : "") + classList.join(" "));
    });
};

// Remove the specified class name from all elements in the collection. When the class name isn’t given, remove all class names. Multiple class names can be given in a space-separated string.
export let removeClass = (_el, name) => {
    return each(_el, function (el, idx) {
        if (!('className' in el)) return;
        if (_is.undef(name)) return getclass(el, '');

        let classList = getclass(el);
        _fnval(name, [idx, classList], el).split(/\s+/g).forEach(_name => {
            classList = classList.replace(_classRE(_name), " ");
        });

        getclass(el, classList.trim());
    });
};

// Toggle given class names (space-separated) in each element in the collection. The class name is removed if present on an element; otherwise it’s added.
export let toggleClass = (_el, name, when) => {
    _el = el(_el);
    if (!name) return _el;
    return each(_el, function (el, idx) {
        let $this = new ele(el);
        _fnval(name, [idx, getclass(el)], el).split(/\s+/g)
        .forEach(_name => {
            (_is.undef(when) ? !hasClass($this, _name) : when) ?
            addClass($this, _name) : removeClass($this, _name);
        });
    });
};

// Find the first ancestor element that is positioned, meaning its CSS position value is "relative", "absolute" or "fixed".
export let offsetParent = _el => {
    return map(_el, el => {
        let parent = el.offsetParent || document.body;
        while (parent && !/^(?:body|html)$/i.test(parent.nodeName) &&
            style(parent, "position") === "static") {
            parent = parent.offsetParent;
        }
        return parent;
    });
};

// Get the position of the first element in the collection, relative to the offsetParent. This information is useful when absolutely positioning an element to appear aligned with another.
export let position = _el => {
    _el = el(_el);
    if (!_el.length) return;

    let elem = first(_el),
        _offsetParent = offsetParent(_el),
        _offset = offset(_el),
        parentOffset = /^(?:body|html)$/i.test(_offsetParent[0].nodeName) ? { top: 0, left: 0 } : offset(_offsetParent);

    _offset.top -= parseFloat(style(elem, 'margin-top')) || 0;
    _offset.left -= parseFloat(style(elem, 'margin-left')) || 0;

    parentOffset.top += parseFloat(style(_offsetParent[0], 'border-top-width')) || 0;
    parentOffset.left += parseFloat(style(_offsetParent[0], 'border-left-width')) || 0;

    return {
        top: _offset.top - parentOffset.top,
        left: _offset.left - parentOffset.left
    }
};

// Gets or sets how many pixels were scrolled down so far on window or scrollable element on the page.
export let scrollTop = (_el, val) => {
    _el = el(_el);
    if (!_el.length) return;

    let hasScroll = 'scrollTop' in first(_el);
    if (_is.undef(val)) return first(_el)[hasScroll ? "scrollTop" : "pageYOffset"];
    return each(_el, el => {
        hasScroll ? (el.scrollTop = val) : el.scrollTo(el.scrollX, val);
    });
};

// Gets or sets how many pixels were scrolled right so far on window or scrollable element on the page.
export let scrollLeft = (_el, val) => {
    _el = el(_el);
    if (!_el.length) return;

    let hasScroll = 'scrollLeft' in first(_el);
    if (_is.undef(val)) return first(_el)[hasScroll ? "scrollLeft" : "pageXOffset"];
    return each(_el, el => {
        hasScroll ? (el.scrollLeft = val) : el.scrollTo(val, el.scrollY);
    });
};

// Generate shortforms for events eg. onclick(), onhover(), etc...
export let { onready, onload, onblur, onfocus, onfocusin, onfocusout, onresize, onclick, onscroll, ondblclick, onmousedown,
    onmouseup, onmousemove, onmouseover, onmouseout, onmouseenter, onmouseleave, onchange, onselect, onsubmit,
    onkeydown, onkeypress, onkeyup, oncontextmenu } = `ready load blur focus focusin focusout resize click scroll dblclick mousedown
    mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit
    keydown keypress keyup contextmenu`.split(/[\s\n]+/g)
.reduce((acc, name) => {
    // Handle event binding
    acc[`on${name}`] = (_el, ...args) => el(_el).on(name, ...args);
    return acc;
}, {
    onhover: (_el, fnOver, fnOut) =>
        el(_el).on("mouseenter", fnOver)
               .on("mouseleave", fnOut || fnOver)
});

export default el;