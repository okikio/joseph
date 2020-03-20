// export let { assign, keys, values } = Object;
// export let { isArray, from, of } = Array;
export let assign = Object.assign;
export let values = Object.values;
export let keys = Object.keys;

export let isArray = Array.isArray;
export let from = Array.from;
export let of = Array.of;

// These are all the major "classes" in use on any page
export const class_map = {"layer-":"lr","layout-":"ly","align-":"aln","-hero":"hr","-shorten":"shrt","-size":"sz","style-":"st","margin-":"m","padding-":"p","-main":"mn","-vert":"v","-horz":"h","-btn":"b","navbar-":"n","-title":"t","-font":"f","-device":"d","-primary":"pp","-secondary":"s","-tertiary":"ty","-icon":"i","-desktop":"dp","-laptop":"lp","-tablet":"tt","-family":"fam","-bold":"em","-phone":"ph","-color":"c","-hover":"-hv","-focus":"-fs","-placeholder":"plh","-left":"lft","-right":"rght","-top":"tp","-bottom":"btm","-contain":"cc","-center":"ctr","action-":"a","-huge":"hg","-extra":"ex","-large":"lrg","-default":"dlt","-small":"sml"};
export const class_keys = ["layer-","layout-","align-","-hero","-shorten","-size","style-","margin-","padding-","-main","-vert","-horz","-btn","navbar-","-title","-font","-device","-primary","-secondary","-tertiary","-icon","-desktop","-laptop","-tablet","-family","-bold","-phone","-color","-hover","-focus","-placeholder","-left","-right","-top","-bottom","-contain","-center","action-","-huge","-extra","-large","-default","-small"];


// During compilation I optimize classes in css and html, this is to compensate for that.
export let optimize = val => {
    
    if (val && val.includes) {
        for (let i = 0; i < class_keys.length; i ++) {
            if (val.includes(class_keys[i])) {
                let regex = new RegExp(class_keys[i], 'g');
                val = val.replace(regex, class_map[class_keys[i]]);
            }
        }
    }
    
    return val;
};

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// From davidwalsh: davidwalsh.name/javascript-debounce-function
export let debounce = (fn, wait, immediate) => {
	let timeout, later, context, callNow;
	return function (...args) {
		context = this;
		later = () => {
			timeout = null;
			if (!immediate) fn.apply(context, args);
        };

		callNow = immediate && !timeout;
		window.clearTimeout(timeout);
		timeout = window.setTimeout(later, wait);
		if (callNow) fn.apply(context, args);
	};
};

// Remove certain properties
export let _removeProps = (prop, obj) => {
    let newObj = { ...obj };
    prop.forEach(key => delete newObj[key]);
    return newObj;
 };

// Limits a number to a max, and a min value
export let _constrain = (v, a, b) => (v > b ? b : v < a ? a : v);

// Re-maps a number from one range to another. Numbers outside the range are not clamped to 0 and 1, because out-of-range values are often intentional and useful.
export let _map = (e, t, n, r, i) => (r + (i - r) * ((e - t) / (n - t)));

// Log values
export let _log = (...args) => args.forEach(v => console.log(v));

// Capitalize strings
export let _capital = val => val[0].toUpperCase() + val.slice(1);

// Test the type of a value
export let _is = (val, type) => (typeof val === type);

// Does the object contain the given key ? Identical to object.hasOwnProperty(key), but uses a safe reference to the hasOwnProperty function, in case it's been overridden
export let has = (obj, path) => {
    return obj != null && ({}).hasOwnProperty.call(obj, path);
};

// Is Instance Of
let _isInst = (ctor, obj) => (ctor instanceof obj);
let _type = type => { // Tweak of _is
    return val => _is(val, type);
};

/* This caused some errors in IE */
// assign(_is, {
//     el: el => _isInst(el, Element) || _isInst(el, Document),
//     arrlike (obj) {
//         let len = _is(obj.length, "number") && obj.length;
//         return len === 0 || len > 0 && (len - 1) in obj;
//     },
//     num: val => !isNaN(val) && _type("number") (val),
//     usable: v => !_is(v, "undefined") && v !== null,
//     class: obj => obj && obj._method && obj._class,
//     not: (type, ...args) => !_is[type](...args),
//     doc: ctor => _isInst(ctor, Document),
//     def: v => !_is(v, "undefined"),
//     undef: _type("undefined"),
//     win: v => v && v.window,
//     bool: _type("boolean"),
//     fn: _type("function"),
//     null: v => v === null,
//     str: _type("string"),
//     obj: _type("object"),
//     nul: v => v === null,
//     inst: _isInst,
//     arr: isArray,
//     _type
// });

_is.el = el => _isInst(el, Element) || _isInst(el, Document);
_is.arrlike = obj => {
    let len = _is(obj.length, "number") && obj.length;
    return len === 0 || len > 0 && (len - 1) in obj;
};
_is.usable = v => !_is(v, "undefined") && v !== null;
// _is.class = obj => obj && obj._method && obj._class;
_is.num = val => !isNaN(val) && _type("number") (val);
_is.not = (type, ...args) => !_is[type](...args);
_is.doc = ctor => _isInst(ctor, Document);
_is.def = v => !_is(v, "undefined");
_is.undef = _type("undefined");
_is.win = v => v && v.window;
_is.bool = _type("boolean");
_is.fn = _type("function");
_is.null = v => v === null;
_is.str = _type("string");
_is.obj = _type("object");
_is.nul = v => v === null;
_is.inst = _isInst;
_is.arr = isArray;
_is.type = _type;

/**
 * @param  {Function} fn
 * @param  {Array<any>} args
 * @param  {Object} ctxt
 */
export let _fnval = (fn, args, ctxt) => {
    if (!_is.fn(fn) ||
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

export default { _capital, _is, _constrain, _map, _fnval, _argNames, assign, keys, values, from, of, _log };