import { _is, keys, assign, has, _log } from "./util";
import { el, on, scrollTo, prop, filter, first, text } from "./dom";
import _event from "./event";

let { href, origin, pathname, search, protocol, host } = window.location;
let { state, replaceState, pushState } = window.history;
let { title } = document;

export class Partial extends _event {
    constructor(_el, opts) {
        this.isTransitioning = false;
        this.containers = _el;
        this.cache = {};
    }

    startTransition() {
        this.isTransitioning = true;
    }

    request(url) {
        let { emit, cache, containers } = this;
        // Don't prefetch if we have the content already or if it's a form
        if (has(cache, url)) return;

        // Check the length of the cache and clear it if needed
        if (keys(cache) > 10) cache = {};

        // Let other parts of the code know we're working on getting the content
        cache[url] = { status: 'fetching' };

        let ajaxRequest = fetch(url)
            .then(response => {
                if (response.ok) {
                    response.text().then(html => {
                        // Initialize the DOM parser
                        let parser = new DOMParser();

                        // Parse the text
                        let doc = parser.parseFromString(html, "text/html");

                        // Content is indexed by the url
                        cache[url] = { 
                            status: 'loaded',
                            // Stores the title of the page
                            title: text(first(filter(doc, 'title'))),
                            // Stores the contents of the page
                            html: [...doc.querySelectorAll(containers)], 
                        };
                    });
                }
            })
            .catch(() => {
                cache[url].status = 'error';
            });
    }

    load (url) {
        let { emit, cache, request } = this;

        var
            /** List of responses for the states of the page request */
            responses = {

                /** Page is ready, update the content */
                loaded: function () {
                    var eventName = hasRunCallback ? 'ss.onProgressEnd' : 'ss.onStartEnd';

                    if (!callbBackEnded || !hasRunCallback) {
                        $container.one(eventName, function () {
                            updateContent(url);
                        });
                    } else if (callbBackEnded) {
                        updateContent(url);
                    }

                    pushState({ id: elementId }, cache[url].title, url);
                },

                /** Loading, wait 10 ms and check again */
                fetching: function () {

                    if (!hasRunCallback) {

                        hasRunCallback = true;

                        // Run the onProgress callback and set trigger
                        $container.one('ss.onStartEnd', function () {

                            // Add loading class
                            if (options.loadingClass) {
                                $body.addClass(options.loadingClass);
                            }

                            options.onProgress.render($container);

                            window.setTimeout(function () {
                                $container.trigger('ss.onProgressEnd');
                                callbBackEnded = true;
                            }, options.onProgress.duration);

                        });
                    }

                    window.setTimeout(function () {
                        // Might of been canceled, better check!
                        if (has(cache, url)) {
                            responses[cache[url].status]();
                        }
                    }, 10);
                },

                /** Error, abort and redirect */
                error: function () {
                    window.location = url;
                    _log(`There was an error loading: ${url}`);
                }
            };

        if (!cache.hasOwnProperty(url)) {
            request(settings);
        }

        // Run the onStart callback and set trigger
        options.onStart.render($container);

        window.setTimeout(function () {
            $body.scrollTop(0);
            $container.trigger('ss.onStartEnd');
        }, options.onStart.duration);

        // Start checking for the status of content
        responses[cache[url].status]();
        
    }

    _eventHandler (el) {
        let { containers, startTransition, emit, load } = this;
        on(el, "click", e => {
            let anchor = e.currentTarget;

            // Ignore modified clicks.
            if (e.button !== 0) return;
            if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

            // Ignore links to other sites.
            if ((anchor.protocol + '//' + anchor.host) !== origin) return;

            // Ignore links intended to affet other tabs or windows.
            if (anchor.target === '_blank' || anchor.target === '_top') return;

            // Ignore links with the data-no-pjax attribute.
            if (anchor.hasAttribute('data-no-pjax')) return;

            // Ignore hash links on the same page if `pjax.scrollOffsetSelector` is
            // unspecified.
            if (anchor.pathname === pathname)
                return;

            // stopPropagation so that event doesn't fire on parent containers.
            // isTransitioning = true;
            startTransition();
            e.stopPropagation();
            e.preventDefault();

            emit("before", [anchor, containers]);

            load(anchor.href);
        });
    }
}

// A transition manager [based on smoothState.js, swup.js, barba.js & highway.js]
// export default class _partial extends _event {
//     // _class: "Partial-Transition-Manager",
//     static defaults = {
//         headers: {
//             "x-partial": "html"
//         },
//         containers: ["[data-partial]"],
//         anchors: `a[href^="${origin}"]:not([data-partial-default]),
//               a[href^="/"]:not([data-partial-default]),
//               a[href^="#"]:not([data-partial-default])`,
//         enable: true,
//         cache: true,
//         events: {}
//     };

//     constructor(opts) {
//         this.opts = assign({}, this.defaults, opts);
//         this.scrollEle = null;
//         this.transition = {};

//         if (this.opts.enable) this.enable();
//     }

//     enable() {
//         if (_is.undef(pushState)) return this;
//     }
// }

// export let _partial = _partial;


// Current request. Only one can be active at a time.
let currentXhr = null

// Used to detect useless popstate events.
let lastPathname = ''
let lastQuery = ''
rememberPath()

const attrNames = ['data-noscroll', 'data-force-reload', 'data-scroll-to-id'];

// Used with each `history.pushState` call to help us discard redundant popstate
// events.
function rememberPath() {
    lastPathname = pathname;
    lastQuery = search;
}

function pathUnchanged() {
    return pathname === lastPathname && search === lastQuery;
}

// Configuration for interfacing between anchors, `location`, and programmatic
// triggers.
function _anchor(urlUtil, attrs) {
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
    };

    // Copy main attributes.
    for (const key in config) if (key in urlUtil) config[key] = urlUtil[key];

    // Define path.
    config.path = config.protocol + '//' + config.host + config.pathname;

    // Copy attributes, if applicable.
    if (_is.inst(urlUtil, HTMLElement)) {
        attrNames.forEach(name => {
            if (urlUtil.hasAttribute(name)) {
                config[name] = urlUtil.getAttribute(name);
            }
        });
    }

    // Add any additionally passed attributes.
    if (attrs) for (const key in attrs) config[key] = attrs[key];
    return config
}

function transitionTo(config) {
    // Special behaviour if this is a push transition within one page. If it leads
    // to a hash target, try to scroll to it. Pjax is not performed.
    const path = `${protocol}//${host + pathname}`;

    if (config.isPush && config.path === path &&
        config.search === search && !('data-force-reload' in config)) {
        // Change the URL and history, if applicable. This needs to be done before
        // changing the scroll position in order to let the browser correctly
        // remember the current position.
        if (config.href !== href) {
            pushState(null, document.title, config.href);
            rememberPath();
        }

        return;
    }

    // No-op if a request is currently in progress.
    if (currentXhr) return;

    const xhr = currentXhr = new XMLHttpRequest();

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
            pushState(null, newDocument.title, replacementHref)
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

        let noScroll = 'data-noscroll' in config;
        // First scroll: before the transition.
        if (!noScroll) {
            window.scrollTo(0, 0);
        }

        // Hook for scripts to clean up before the transition.
        document.dispatchEvent(createEvent('simple-pjax-before-transition'))

        // Switch to the new document.
        replaceDocument(newDocument)
        indicateLoadEnd();

        // Provide a hook for scripts that may want to run when the document
        // is loaded.
        document.dispatchEvent(createEvent('simple-pjax-after-transition'))

        // Second scroll: after the transition.
        if (!noScroll) {
            window.scrollTo(0, 0);
        }
    }

    xhr.onabort = xhr.onerror = xhr.ontimeout = function () {
        currentXhr = null
        if (config.isPush) pushState(null, '', xhr.responseURL || config.href);
        location.reload();
    }

    xhr.open('GET', config.href);
    // IE compat: responseType must be set after opening the request.
    xhr.responseType = 'document';
    xhr.send(null);

    indicateLoadStart(xhr)
}

// Based on simple-pjax
on(document, "click", e => {
    // Find a clicked <a>. No-op if no anchor is available.
    let anchor = e.target;
    do {
        if (anchor instanceof HTMLAnchorElement) break;
    } while ((anchor = anchor.parentElement));
    if (!anchor) return;

    // Ignore modified clicks.
    if (e.button !== 0) return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

    // Ignore links to other sites.
    if ((anchor.protocol + '//' + anchor.host) !== origin) return;

    // Ignore links intended to affet other tabs or windows.
    if (anchor.target === '_blank' || anchor.target === '_top') return;

    // Ignore links with the data-no-pjax attribute.
    if (anchor.hasAttribute('data-no-pjax')) return;

    // Ignore hash links on the same page if `pjax.scrollOffsetSelector` is
    // unspecified.
    if ((anchor.pathname === pathname) && anchor.hash)
        return;

    // Load clicked link.
    e.preventDefault();
    transitionTo(_anchor(anchor, { isPush: true }))
});

on(window, 'popstate', () => {
    // Ignore useless popstate events. This includes initial popstate in Webkit
    // (not in Blink), and popstate on hash changes. Note that we ignore hash
    // changes by not remembering or comparing the hash at all.
    if (pathUnchanged()) return;
    rememberPath();

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

    const currentY = window.scrollY;
    const rafId = requestAnimationFrame(() => {
        scrollTo(currentY, 700);
    })

    transitionTo(_anchor(location, { rafId }))
});

// function indicateLoadStart(xhr) {
//     if (pjax.loadIndicatorDelay > 0) {
//         const id = setTimeout(function () {
//             if (xhr.readyState === 4) {
//                 clearTimeout(id)
//                 return
//             }
//             if (typeof pjax.onIndicateLoadStart === 'function') {
//                 pjax.onIndicateLoadStart()
//             }
//         }, pjax.loadIndicatorDelay)
//     }
// }

// function indicateLoadEnd() {
//     if (pjax.loadIndicatorDelay > 0 && typeof pjax.onIndicateLoadEnd === 'function') {
//         pjax.onIndicateLoadEnd()
//     }
// }

// TODO test in Opera.
function getDocument(xhr) {
    const type = xhr.getResponseHeader('Content-Type') || 'text/html'
    // Ignore non-HTML resources, such as XML or plan text.
    if (!/html/.test(type)) return null
    if (xhr.responseXML) return xhr.responseXML
    return new DOMParser().parseFromString(xhr.responseText, 'text/html')
}

function replaceDocument(doc) {
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

function removeScriptsWithSrc(doc) {
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
function copyScript(originalScript) {
    const script = document.createElement('script')
    if (!destroysDocument(originalScript.textContent)) {
        if (originalScript.type) script.type = originalScript.type
        script.textContent = originalScript.textContent
    }
    return script
}

// Very primitive check if the given script contains calls that potentially
// erase the document's contents.
function destroysDocument(script) {
    return /document\s*\.\s*(?:write|open)\s*\(/.test(script)
}


// IE compat: IE doesn't support dispatching events created with constructors,
// at least not for document.dispatchEvent.
function createEvent(name) {
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
}