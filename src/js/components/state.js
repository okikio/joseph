import { _is, keys, assign, has, _log } from "./util";
import { el, on, scrollTo, prop, filter, first, text } from "./dom";
import _event from "./event";

export default class State {
    constructor (opts) {
        let defaults = {
            container: "[data-container]",
            maxCacheLength: 30,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-Pjax': 'true'
            }
        };
        this.opts = assign({}, defaults, opts);

        this.maxCacheLength = this.opts.maxCacheLength;
        this.container = el(this.opts.container);
        this.headers = this.opts.headers;
        this.status = {}; // Loading, Prefetching, Error, Completed
        this.cache = {};
    }

    // Changes the loading status of an individual URL
    changeStatus (url, value) {
        this.status[url] = value;
    }

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
    }

    // Convert content into HTML and cache it
    parseContent (url, html) {
        // Initialize the DOM parser
        let parser = new DOMParser();

        // Parse the text
        let doc = parser.parseFromString(html, "text/html");
        
        // Content is indexed by the url
        this.cacheHTML(url, doc);
    }

    // Check if the URL has already been cached
    inCache (url) {
        return has(this.cache, url);
    }

    // Clear cache if it becomes to big
    clearCache () {
        // Check the length of the cache and clear it if needed
        if (keys(this.cache).length > this.maxCacheLength) this.cache = {};
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
                console.warn(`%c[Page Transition] - %cUnknow error, the repsonse was not 'ok'.`, 'color:#f3ff35', 'color:#eee');
            }
        })
        .catch(err => {
            this.errorState(url); // Status of error
            console.error(`%c[Page Transition] - %cFetch error: ${err}`, 'color:#f3ff35', 'color:#eee');
        });
    }
}