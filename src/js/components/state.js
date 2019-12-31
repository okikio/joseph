import { _is, keys, assign, has, _log } from "./util";
import { el, on, filter, first, text, scrollTo, replaceWith, each } from "./dom";
import _event from "./event";

let { href, origin, pathname } = window.location;
let { replaceState, pushState } = window.history;

export default class State extends _event {
    constructor (opts) {
        let defaults = {
            container: "[data-container]",
            maxCacheLength: 30,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-Pjax': 'true'
            }
        };

        super();
        this.opts = assign({}, defaults, opts);

        this.maxCacheLength = this.opts.maxCacheLength;
        this.containers = el(this.opts.container);
        this.headers = this.opts.headers;
        this.currentURL = href; // Url of the content that is currently displayed
        this.status = {}; // Loading, Prefetching, Error, Completed
        this.cache = {};

        // Initialize push state
        this.replaceState(url);
        this.bindEvents(this.opt.container);
    }

    // Changes the loading status of an individual URL
    changeStatus (url, value) { this.status[url] = value; }
    getStatus (url) { return this.status[url]; } // Get current state of a URL

    // Various status' as methods
    loadingState (url) { this.changeStatus(url, "loading"); }
    prefetchState (url) { this.changeStatus(url, "prefetch"); }
    errorState (url) { this.changeStatus(url, "error"); }
    completedState (url) { this.changeStatus(url, "completed"); }

    // Cache content by URL
    cacheHTML (url, doc) {
        let { container } = this.opts;
        
        // URL has completed loading
        this.completedState(url);

        // Content is indexed by the url
        this.cache[url] = { 
            // Stores the title of the page
            title: text(first(filter(doc, 'title'))),

            // Stores the contents of the page
            html: [...doc.querySelectorAll(container)], 
        };
        return this;
    }

    // Convert content into HTML and cache it
    parseContent (url, html) {
        // Initialize the DOM parser
        let parser = new DOMParser();

        // Parse the text
        let doc = parser.parseFromString(html, "text/html");
        
        // Content is indexed by the url
        this.cacheHTML(url, doc);
        return this;
    }

    // Check if the URL has already been cached
    inCache (url) {
        return has(this.cache, url);
    }

    // Clear cache if it becomes to big
    clearCache () {
        // Check the length of the cache and clear it if needed
        if (keys(this.cache).length > this.maxCacheLength) this.cache = {};
        return this;
    }

    // Loads a URL with ajax, puts the response body inside a the cache
    request (url) {
        // Don't prefetch if we have the content already or if it's a form
        if (this.inCache(url)) return;

        // Check the length of the cache and clear it if needed
        this.clearCache();

        // The URL has a status of loading
        this.loadingState(url);
        
        // New Fetch for the URL
        fetch(url, {
            method: 'GET',
            headers: new Headers(this.headers)
        })
        .then(response => {
            if (response.ok) {
                response.text().then(this.parseContent.bind(this));
            } else {
                console.warn(`%c[Page Load] - %cUnknow error, the repsonse was not 'ok'.`, 'color:#f3ff35', 'color:#eee');
            }
        })
        .catch(err => {
            this.errorState(url); // Status of error
            console.error(`%c[Page Load] - %cFetch error: ${err}`, 'color:#f3ff35', 'color:#eee');
        });
        return this;
    }

    // Get data from cache
    getFromCache (url) { return this.cache[url]; }
    getTitle (url) { return this.getFromCache(url) && this.getFromCache(url).title || document.title; }
    getHTML (url) { return this.getFromCache(url) && this.getFromCache(url).html; }

    // Load URL and render page
    load (url) {
        // If URL is new request and cache it
        if (!this.inCache(url)) this.request(url);

        // Run the event that most matches with the status
        this.emit(this.getStatus(url), [url, this], this);
        return this;
    }

    // Render the newly loaded page
    render (url) {
        // If the content has been requested and is done.
        let newcontainers = this.getFromCache(url) ? this.getHTML(url) : null;
        if (newcontainers.length) {
            // Update the title
            document.title = this.getTitle(url);

            // Update current url
            this.currentURL = url;

            // Emit the after event 
            this.emit("after", [this.containers, newcontainers], this);
        } else if (_is.null(newcontainers)) {
            // Throw warning to help debug error
            console.warn(`%c[Page Render] - No containers have been found in the response from ${url} in ${}.`);
        } else {
            // No content availble to update with, aborting...
            window.location = url;
        }

        return this;
    }

    // Determine if anchor is valid for load
    validAnchor (e, anchor) {
        return !(
            // Ignore modified clicks.
            (e.button !== 0) ||
            (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) ||
            
            // Ignore links to other sites.
            ((anchor.protocol + '//' + anchor.host) !== origin) ||

            // Ignore links intended to affet other tabs or windows.
            (anchor.target === '_blank' || anchor.target === '_top') ||

            // Ignore links with the data-no-state-change attribute.
            (anchor.hasAttribute('data-no-state-change')) ||

            // Ignore hash links on the same page.
            (anchor.pathname === pathname) 
        );
    }

    // On the click of an anchor, ensure link is valid
    anchorClick (e) {
        let anchor = e.currentTarget;
        if (this.validAnchor(e, anchor)) {
            // Stop propagation so that event doesn't fire on parent element.
            e.stopPropagation();
            e.preventDefault();

            this.emit("before", [anchor, this.containers], this);
            this.load(anchor.href); // Load new page
        }
    }

    // On Hover of an anchor reuest the anchor href 
    anchorHover (e) {
        let anchor = e.currentTarget;
        if (this.validAnchor(e, anchor)) {
            // Stop propagation so that event doesn't fire on parent element.
            e.stopPropagation();
            e.preventDefault();

            // If URL is new request and cache it
            if (!this.inCache(anchor.href)) this.request(anchor.href);
            this.prefetchState(url);
        }
    }

    // Since replaceState and pushState contain similar info. when modifing the history state
    stateModifier (action = "push", url) {
        (action == "push" ? pushState : replaceState) ({
            url,
            pushState: action == "push",
            title: this.getTitle(url),
            scrollPos: {
                x: window.scrollX,
                y: window.scrollY
            }
        }, this.getTitle(url), url);
        return this;
    }

    // Push state handler
    pushState (url) {
        return this.stateModifier("push", url);
    }

    // Replace state handler
    replaceState (url) {
        return this.stateModifier("replace", url);
    }

    // Handles the popstate event, like when the user hits 'back' 
    onPopState(e) {
        if (e.state) {
            const currentY = window.scrollY;
            scrollTo(currentY, "800ms");

            // Striphash
            let url = window.location.href.replace(/#.*/, '');
            let currentURL = this.currentURL.replace(/#.*/, '');
            if (currentURL !== url) {
                this.load(url).render(url);
            }
        }
    }

    // Binds all events and initialize default functionality
    bindEvents ($el) {
        this.on({
            "loading": () => {
            },
            "error": url => {
                window.location = url;
            },
            "prefetch": () => {},
            "completed": url => {
                this.render(url);
                this.pushState(url);
            },
            "after": (oldcontainers, newcontainers) => {
                each(oldcontainers, (container, i) => {
                    replaceWith(container, newcontainers[i]);
                });
            }
        });

        on($el, "click", this.anchorClick, this);
        on($el, "mouseover touchstart", this.anchorHover, this);
        on(window, 'popstate', this.onPopState, this);
    }
}

export let state = opts => new State();
