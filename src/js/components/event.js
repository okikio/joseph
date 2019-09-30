import { _stringify } from "../../../util/stringify";
import { _matches, _is, keys, _argNames } from "./util";
const { readyState } = document;

// Test for passive support, based on [github.com/rafrex/detect-passive-events]
let passive = false, opts = {}, noop = () => { };
opts = Object.defineProperty({}, "passive", {
	get: () => passive = { capture: false, passive: true }
});

window.addEventListener("PassiveEventTest", noop, opts);
window.removeEventListener("PassiveEventsTest", noop, opts);

export default class _event {
    constructor() {
        this._events = {}; // Event info.
        this._emit = [];  // Store events set to be emitted
    }

    // Prepare the event
    _preEvent(evt) {
        if (!this._events[evt]) // List of event's
            { this._events[evt] = []; }
        return this._events[evt];
    }

    // Apply event as object
    _eventApp(callback, scope, event) {
        return {
            callback: callback,
            scope: scope,
            event: event
        };
    }

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
    }

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
    }

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
    }

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
    }

    // List's all listeners for a given event
    listeners(evt) {
        let $Evt = this._preEvent(evt);
        if (!$Evt.length) { return []; }
        return $Evt.map(val => val.callback);
    }

    // List's all listener values for a given event
    listenerValues(evt, ...args) {
        let $Evt = this._preEvent(evt);
        if (!$Evt.length) { return []; }
        return $Evt.map(val => val.callback.call(val.scope, ...args));
    }

    // Clear all events
    clear()
        { this._eventCount = 0; this._events = {}; return this; }

    // Clear all events
    clearListeners(evt)
        { this._events[evt] = []; return this; }

    // Name of all event's
    get _names() { return Object.keys(this._events); }

    // Number of events
    get _eventCount() { return this._names.length; }

    // Alias for the `on` method
    add(...args) { return this.on(...args); }
    bind(...args) { return this.on(...args); }

    // Alias for the `off` method
    remove(...args) { return this.off(...args); }
    unbind(...args) { return this.off(...args); }

    // Alias for the `emit` method
    fire(...args) { return this.emit(...args); }
    trigger(...args) { return this.emit(...args); }

    // Alias for the `listeners` method
    callbacks(...args) { return this.listeners(...args); }

    static get nativeEvents() { return "ready load blur focus focusin focusout resize click scroll dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".replace(/\s+/g, " ").split(" "); }
    static applyNative(evt, el, ev, i, action = "addEventListener", delegate) {
        if (!ev.length || el === undefined) return;

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
}