import { _is, _constrain, _map } from "./components/util";
import { on, toggleClass, each, find, get, addClass, removeClass, scrollTo, scrollTop, hasClass, height, style, width } from "./components/dom";

let _layer = ".layer";
let _navbar = '.navbar';
let _hero = ".layer-hero";
let _menu = '.navbar-menu';
let _backUp = '.back-to-top';
let _actioncenter = ".layer-action-center";
let _scrolldown = '.layer-hero-scroll-down';

try {
    let _focusPt = height(_navbar) + 10;

    //  touchstart
    on(_menu, "click", () => {
        toggleClass(_navbar, "navbar-show");
    });

    // touchstart
    on(_backUp, "click touchstart", () => {
        scrollTo("0px", "2500ms");
    });

    // touchstart
    on(_scrolldown, "click touchstart", () => {
        scrollTo(height(_hero) + _focusPt, "700ms");
    });

    let _images = [];
    each(_layer, $layer => {
        let header = get(find($layer, ".layer-header"), 0);
        // let footer = get(find($layer, ".layer-footer"), 0);
        let main = get(find($layer, ".layer-main"), 0);
        let layer_image = find($layer, ".layer-image");

        each(layer_image, ($img, i) => {
            let load_img = get(find($img, ".load-img"), 0);
            let overlay = get(find($img, ".layer-image-overlay"), 0);
            let clientRect = $img.getBoundingClientRect();
            _images.push({
                header: i === 0 ? header : null,
                // footer: i === 0 ? footer : null,
                main: i === 0 ? main : null,
                overlay, load_img,
                target: $img,
                clientRect
            });

            let _core_img = get(find($img, ".core-img"), 0);
            let _placeholder_img = find($img, ".placeholder-img");

            if (_is.def(_core_img)) {
                if (_core_img.complete) {
                    addClass(_placeholder_img, "core-img-show");
                } else {
                    on(_core_img, "load", function () {
                        addClass(_placeholder_img, "core-img-show");
                    }, false);
                }
            }
        });
    });

    let _load;
    on(window, 'scroll', _load = () => {
        let _scrollTop = scrollTop(window);
        hasClass(_navbar, "banner-mode") && addClass(_navbar, "navbar-focus") || toggleClass(_navbar, "navbar-focus", _scrollTop >= 5);
        hasClass(_navbar, "navbar-show") && removeClass(_navbar, "navbar-show");

        toggleClass(_actioncenter, "layer-action-center-show", _scrollTop > _focusPt * 2);
        toggleClass(_actioncenter, "layer-action-center-hide", _scrollTop <= _focusPt * 2);

        if (width(window) > 500) {
            _images.forEach(data => {
                if (hasClass(data.target, "effect-parallax")) {
                    let { clientRect, load_img, overlay, header, main } = data; // , footer 
                    let { top, height } = clientRect;
                    let dist = _scrollTop - top + 60;

                    if (dist >= -_focusPt && dist <= height - _focusPt) {
                        let value = Math.round(_map(_constrain(dist, 0, height), 0, height, 0, 1) * 100) / 100;

                        style(overlay, { opacity: _map(value, 0, 0.75, 0.35, 0.15) });
                        style(load_img, {
                            transform: `translateY(${_map(_constrain(value - _map(60, 0, height, 0, 1), 0, 1), 0, 1, 0, height / 2)}px)`,
                        });

                        let translate = _constrain(_map(value, 0, 0.75, 0, height * 5 / 16), 0, height * 5 / 16);
                        let opacity = _constrain(_map(_constrain(value - 0.15, 0, 1), 0, 0.40, 1, 0), 0, 1);

                        if (header) {
                            style(header, {
                                transform: `translateY(${translate}px)`,
                                opacity
                            });
                        }

                        if (main) {
                            style(main, {
                                transform: `translateY(${translate}px)`,
                                opacity
                            });
                        }

                        // if (footer) {
                        //     style(footer, { 
                        //         transform: `scale(${_constrain(_map(_constrain(value - 0.15, 0, 1), 0.5, 1, 1, 0.45), 0, 1)})`
                        //     });
                        // }
                    }
                }
            });
        }
    });

    _load();

} catch (e) {
    let _img = [...document.getElementsByClassName("placeholder-img")];
    let _navbar = [...document.getElementsByClassName("navbar")];
    _navbar.forEach(function (nav) {
        nav.classList.add("navbar-focus");
    });
    _img.forEach(function (img) {
        img.classList.add("core-img-show");
    });
}
/*
_load();
new swup({
    requestHeaders: {
        "X-Requested-With": "swup", // So we can tell request comes from swup
        "x-partial": "swup" // Request a partial html page
    },
    plugins: [new scrollPlugin({
        doScrollingRightAway: false,
        animateScroll: true,
        scrollFriction: 0.3,
        scrollAcceleration: 0.04,
    })] // new preload(),
})

// This event runs for every page view after initial load
.on('contentReplaced', _load);

// / global location, XMLHttpRequest, Location, requestAnimationFrame, cancelAnimationFrame, history, HTMLElement, HTMLScriptElement, HTMLAnchorElement, HTMLDocument, DOMParser, Event, getComputedStyle

// /
//  * Export.
//  /
const pjax = {

    // /
    //  * Configuration.


    // Disables pjax globally.
    disabled: false,

    // How long until we run loading indicators.
    loadIndicatorDelay: 250,

    // Called when loading takes longer than `loadIndicatorDelay`. Should
    // visibly indicate the loading.
    onIndicateLoadStart() {
        document.documentElement.style.transition = 'opacity linear 0.05s'
        document.documentElement.style.opacity = '0.8'
    },

    // Called when transition is finished. Should roll back the effects of
    // `onIndicateLoadStart`.
    onIndicateLoadEnd() {
        document.documentElement.style.transition = ''
        document.documentElement.style.opacity = ''
    },

    // If a CSS selector is provided, it's checked every time when scrolling to an
    // element (e.g. via data-scroll-to-id). If an element with the {position:
    // 'fixed', top: '0px'} computed style properties is found, the scroll
    // position will be offset by that element's height.
    scrollOffsetSelector: '',

    // If a value is provided, it will be used as the default id for the
    // `[data-scroll-to-id]` attribute.
    defaultMainId: '',

    // /
    //  * Methods.
    //  /

    // Triggers a pjax transition to the current page, reloading it without
    // destroying the JavaScript runtime and other assets.
    reload() {
        transitionTo(createConfig(location, {
            'data-noscroll': true,
            'data-force-reload': true
        }))
    }
}

// Export in a CommonJS environment, otherwise assign to window.
if (typeof module === 'object' && module !== null &&
    typeof module.exports === 'object' && module.exports !== null) {
    module.exports = pjax
} else {
    window.simplePjax = pjax
}

// Current request. Only one can be active at a time.
let currentXhr: XMLHttpRequest = null

// Used to detect useless popstate events.
let lastPathname = ''
let lastQuery = ''
rememberPath()

const attrNames = ['data-noscroll', 'data-force-reload', 'data-scroll-to-id']

// Configuration for interfacing between anchors, `location`, and programmatic
// triggers.
function createConfig(urlUtil: HTMLAnchorElement | Location, attrs) {
    const config = {
        href: '',
        host: '',
        hash: '',
        pathname: '',
        path: '',
        protocol: '',
        search: '',
        isPush: false,
        rafId: 0
    }

    // Copy main attributes.
    for (const key in config) if (key in urlUtil) config[key] = urlUtil[key]

    // Define path.
    config.path = config.protocol + '//' + config.host + config.pathname

    // Copy attributes, if applicable.
    if (urlUtil instanceof HTMLElement) {
        attrNames.forEach(name => {
            if (urlUtil.hasAttribute(name)) {
                config[name] = urlUtil.getAttribute(name)
            }
        })
    }

    // Add any additionally passed attributes.
    if (attrs) for (const key in attrs) config[key] = attrs[key]

    return config
}

// Based on simple-pjax
on(document, "click", event => {
    // Find a clicked <a>. No-op if no anchor is available.
    let anchor = event.target;
    do {
        if (anchor instanceof HTMLAnchorElement) break;
    } while ((anchor = anchor.parentElement));
    if (!anchor) return;

    // Ignore modified clicks.
    if (event.button !== 0) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    // Ignore links to other sites.
    if ((anchor.protocol + '//' + anchor.host) !== location.origin) return

    // Ignore links intended to affet other tabs or windows.
    if (anchor.target === '_blank' || anchor.target === '_top') return

    // Ignore links with the data-no-pjax attribute.
    if (anchor.hasAttribute('data-no-pjax')) return

    // Ignore hash links on the same page if `pjax.scrollOffsetSelector` is
    // unspecified.
    if ((anchor.pathname === location.pathname) && anchor.hash && !pjax.scrollOffsetSelector) {
        return
    }

    // Load clicked link.
    event.preventDefault()
    transitionTo(createConfig(anchor, { isPush: true }))
});

// Main listener.
document.addEventListener('click', event => {
    // No-op if pjax is disabled.
    if (pjax.disabled) return

    // Find a clicked <a>. No-op if no anchor is available.
    let anchor: HTMLAnchorElement = event.target
    do {
        if (anchor instanceof HTMLAnchorElement) break
    } while ((anchor = anchor.parentElement))
    if (!anchor) return

    // Ignore modified clicks.
    if (event.button !== 0) return
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

    // Ignore links to other sites.
    if ((anchor.protocol + '//' + anchor.host) !== location.origin) return

    // Ignore links intended to affet other tabs or windows.
    if (anchor.target === '_blank' || anchor.target === '_top') return

    // Ignore links with the data-no-pjax attribute.
    if (anchor.hasAttribute('data-no-pjax')) return

    // Ignore hash links on the same page if `pjax.scrollOffsetSelector` is
    // unspecified.
    if ((anchor.pathname === location.pathname) && anchor.hash && !pjax.scrollOffsetSelector) {
        return
    }

    // Load clicked link.
    event.preventDefault()
    transitionTo(createConfig(anchor, { isPush: true }))
})

window.addEventListener('popstate', event => {
    // Ignore useless popstate events. This includes initial popstate in Webkit
    // (not in Blink), and popstate on hash changes. Note that we ignore hash
    // changes by not remembering or comparing the hash at all.
    if (pathUnchanged()) return
    rememberPath()

    // /
    //  * After a popstate event, Blink/Webkit (what about Edge?) restore the
    //  * last scroll position the browser remembers for that history entry.
    //  * Because our XHR is asynchronous and there's a delay before replacing the
    //  * document, this causes the page to jump around. To prevent that, we
    //  * artificially readjust the scroll position. If the XHR is finished before
    //  * the next frame runs, we cancel the task.
    //  *
    //  * Webkit (Safari) does receive the correct scroll values, but the page still
    //  * jumps around. TODO look for a workaround.
    //  /

    const currentX = window.scrollX
    const currentY = window.scrollY
    const rafId = requestAnimationFrame(() => {
        window.scrollTo(currentX, currentY)
    })

    transitionTo(createConfig(location, { rafId: rafId }))
})

function transitionTo(config) {
    // Special behaviour if this is a push transition within one page. If it leads
    // to a hash target, try to scroll to it. Pjax is not performed.
    const path = location.protocol + '//' + location.host + location.pathname

    if (config.isPush && config.path === path &&
        config.search === location.search && !('data-force-reload' in config)) {
        // Change the URL and history, if applicable. This needs to be done before
        // changing the scroll position in order to let the browser correctly
        // remember the current position.
        if (config.href !== location.href) {
            history.pushState(null, document.title, config.href)
            rememberPath()
        }

        if (config.hash) {
            // Hash found: try to scroll to it.
            const target = document.querySelector(config.hash)
            if (target instanceof HTMLElement) {
                target.scrollIntoView()
                offsetScroll()
            }
        }

        return
    }

    // No-op if a request is currently in progress.
    if (currentXhr) return

    const xhr = currentXhr = new XMLHttpRequest()

    xhr.onload = function () {
        if (xhr.status < 200 || xhr.status > 299) {
            xhr.onerror(null)
            return
        }

        // Cancel the scroll readjustment, if any. If it has already run, this
        // should have no effect.
        if (config.rafId) cancelAnimationFrame(config.rafId)

        currentXhr = null
        const newDocument = getDocument(xhr)

        if (!newDocument) {
            xhr.onerror(null)
            return
        }

        if (config.isPush) {
            const replacementHref = xhr.responseURL && (xhr.responseURL !== config.path)
                ? xhr.responseURL
                : config.href
            history.pushState(null, newDocument.title, replacementHref)
            rememberPath()
        }

        //
        //  * Workaround for a Safari glitch. In Safari, if the document has been
        //  * scrolled down by the user before the transition, and if it has any
        //  * fixed-positioned elements, these elements will jump around for a
        //  * moment after completing a pjax transition. This happens if we only
        //  * scroll _after_ replacing the document. To avoid this, we basically
        //  * have to scroll twice: before and after the transition. This doesn't
        //  * eliminate the problem, but makes it less frequent.
        //  *
        //  * Safari truly is the new IE.
         //

        let noScroll = 'data-noscroll' in config
        let targetId = location.hash ? location.hash.slice(1) : null
        if (!targetId && config.isPush && 'data-scroll-to-id' in config) {
            targetId = config['data-scroll-to-id'] || pjax.defaultMainId
        }

        // First scroll: before the transition.
        let target = document.getElementById(targetId)
        if (target) {
            target.scrollIntoView()
            offsetScroll()
        } else if (!targetId && !noScroll) {
            window.scrollTo(0, 0)
        }

        // Hook for scripts to clean up before the transition.
        document.dispatchEvent(createEvent('simple-pjax-before-transition'))

        // Switch to the new document.
        replaceDocument(newDocument)
        indicateLoadEnd()

        // Provide a hook for scripts that may want to run when the document
        // is loaded.
        document.dispatchEvent(createEvent('simple-pjax-after-transition'))

        // Second scroll: after the transition.
        target = document.getElementById(targetId)
        if (target) {
            target.scrollIntoView()
            offsetScroll()
        } else if (!noScroll) {
            window.scrollTo(0, 0)
        }
    }

    xhr.onabort = xhr.onerror = xhr.ontimeout = function () {
        currentXhr = null
        if (config.isPush) history.pushState(null, '', xhr.responseURL || config.href)
        location.reload()
    }

    xhr.open('GET', config.href)
    // IE compat: responseType must be set after opening the request.
    xhr.responseType = 'document'
    xhr.send(null)

    indicateLoadStart(xhr)
}

function indicateLoadStart(xhr: XMLHttpRequest) {
    if (pjax.loadIndicatorDelay > 0) {
        const id = setTimeout(function () {
            if (xhr.readyState === 4) {
                clearTimeout(id)
                return
            }
            if (typeof pjax.onIndicateLoadStart === 'function') {
                pjax.onIndicateLoadStart()
            }
        }, pjax.loadIndicatorDelay)
    }
}

function indicateLoadEnd() {
    if (pjax.loadIndicatorDelay > 0 && typeof pjax.onIndicateLoadEnd === 'function') {
        pjax.onIndicateLoadEnd()
    }
}

// TODO test in Opera.
function getDocument(xhr: XMLHttpRequest): HTMLDocument {
    const type = xhr.getResponseHeader('Content-Type') || 'text/html'
    // Ignore non-HTML resources, such as XML or plan text.
    if (!/html/.test(type)) return null
    if (xhr.responseXML) return xhr.responseXML
    return new DOMParser().parseFromString(xhr.responseText, 'text/html')
}

function replaceDocument(doc: HTMLDocument) {
    // Replace the `title` as the only user-visible part of the head. Assume
    // resource links, `<base>`, and other meaningful metadata to be identical.
    document.title = doc.title

        // Remove all scripts from the current `<head>` to ensure consistent state.
        ;[].slice.call(document.head.querySelectorAll('script')).forEach(script => {
            script.parentNode.removeChild(script)
        })

    // Remove all `src` scripts under the assumption that they're the same on all
    // pages.
    removeScriptsWithSrc(doc)

    // Replace the body.
    document.body = doc.body

        // Execute inline scripts found in the new document. Creating copies and
        // adding them to the DOM (instead of using `new Function(...)()` to eval)
        // should allow custom script types to work (TODO test). We leave the original
        // scripts in the DOM to preserve the behaviour of scripts that target
        // themselves by `id` to be replaced with a widget (common strategy for iframe
        // embeds).
        ;[].slice.call(document.scripts).forEach(script => {
            document.body.appendChild(copyScript(script))
        })
}

function removeScriptsWithSrc(doc: HTMLDocument) {
    [].slice.call(doc.scripts).forEach(script => {
        if (!!script.src && !!script.parentNode) {
            script.parentNode.removeChild(script)
        }
    })
}

// Creates an incomplete copy of the given script that inherits only type and
// content from the original. Other attributes such as `id` are not copied in
// order to preserve the behaviour of scripts that target themselves by `id` to
// be replaced with a widget. If the script potentially destroys the document
// through a `document.write` or `document.open` call, a dummy is returned.
function copyScript(originalScript: HTMLScriptElement): HTMLScriptElement {
    const script = document.createElement('script')
    if (!destroysDocument(originalScript.textContent)) {
        if (originalScript.type) script.type = originalScript.type
        script.textContent = originalScript.textContent
    }
    return script
}

// Very primitive check if the given script contains calls that potentially
// erase the document's contents.
function destroysDocument(script: string): boolean {
    return /document\s*\.\s*(?:write|open)\s*\(/.test(script)
}

// Used with each `history.pushState` call to help us discard redundant popstate
// events.
function rememberPath() {
    lastPathname = location.pathname
    lastQuery = location.search
}

function pathUnchanged(): boolean {
    return location.pathname === lastPathname && location.search === lastQuery
}

// IE compat: IE doesn't support dispatching events created with constructors,
// at least not for document.dispatchEvent.
function createEvent(name: string): Event {
    const event = document.createEvent('Event')
    event.initEvent(name, true, true)
    return event
}

// See pjax.scrollOffsetSelector.
function offsetScroll() {
    if (pjax.scrollOffsetSelector) {
        const elem = document.querySelector(pjax.scrollOffsetSelector)
        const style = getComputedStyle(elem)
        if (style.position === 'fixed' && style.top === '0px') {
            window.scrollBy(0, -elem.getBoundingClientRect().height)
        }
    }
} */