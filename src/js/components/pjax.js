"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parse_options_1 = require("./lib/parse-options");
var trigger_1 = require("./lib/events/trigger");
var parse_dom_1 = require("./lib/parse-dom");
var scroll_1 = require("./lib/util/scroll");
var clear_active_1 = require("./lib/util/clear-active");
var state_manager_1 = require("@pageworks/state-manager");
var device_manager_1 = require("@pageworks/device-manager");
var Pjax = (function () {
    function Pjax(options) {
        var _this = this;
        this.handleManualLoad = function (e) {
            var uri = e.detail.uri;
            if (_this.options.debug) {
                console.log('%c[Pjax] ' + ("%cmanually loading " + uri), 'color:#f3ff35', 'color:#eee');
            }
            _this.doRequest(uri);
        };
        this.handlePopstate = function (e) {
            if (e.state) {
                if (_this.options.debug) {
                    console.log('%c[Pjax] ' + "%chijacking popstate event", 'color:#f3ff35', 'color:#eee');
                }
                _this._scrollTo = e.state.scrollPos;
                _this.loadUrl(e.state.uri, 'popstate');
            }
        };
        this.handleContinue = function (e) {
            _this._transitionFinished = true;
            if (_this._cachedSwitch !== null) {
                if (_this.options.titleSwitch) {
                    document.title = _this._cachedSwitch.title;
                }
                _this.handleSwitches(_this._cachedSwitch.queue);
            }
        };
        this._dom = document.documentElement;
        if (device_manager_1.default.isIE) {
            console.log('%c[Pjax] ' + "%cIE 11 detected - Pjax aborted", 'color:#f3ff35', 'color:#eee');
            this._dom.classList.remove('dom-is-loading');
            this._dom.classList.add('dom-is-loaded');
            return;
        }
        this._cache = null;
        this.options = parse_options_1.default(options);
        this._request = null;
        this._response = null;
        this._confirmed = false;
        this._cachedSwitch = null;
        this._scrollTo = { x: 0, y: 0 };
        this._isPushstate = true;
        this._scriptsToAppend = [];
        this._requestId = 0;
        this._transitionFinished = false;
        this.init();
    }
    Pjax.prototype.init = function () {
        if (this.options.debug) {
            console.group();
            console.log('%c[Pjax] ' + ("%cinitializing Pjax version " + Pjax.VERSION), 'color:#f3ff35', 'color:#eee');
            console.log('%c[Pjax] ' + "%cview Pjax documentation at https://github.com/Pageworks/pjax", 'color:#f3ff35', 'color:#eee');
            console.log('%c[Pjax] ' + "%cloaded with the following options: ", 'color:#f3ff35', 'color:#eee');
            console.log(this.options);
            console.groupEnd();
        }
        this._dom.classList.add('dom-is-loaded');
        this._dom.classList.remove('dom-is-loading');
        new state_manager_1.default(this.options.debug, true);
        window.addEventListener('popstate', this.handlePopstate);
        if (this.options.customTransitions) {
            document.addEventListener('pjax:continue', this.handleContinue);
        }
        document.addEventListener('pjax:load', this.handleManualLoad);
        parse_dom_1.default(document.body, this);
    };
    Pjax.prototype.loadUrl = function (href, loadType) {
        if (this._confirmed) {
            return;
        }
        this.abortRequest();
        this._cache = null;
        this.handleLoad(href, loadType);
    };
    Pjax.prototype.abortRequest = function () {
        this._request = null;
        this._response = null;
    };
    Pjax.prototype.finalize = function () {
        if (this.options.debug) {
            console.log('%c[Pjax] ' + "%cpage transition completed", 'color:#f3ff35', 'color:#eee');
        }
        scroll_1.default(this._scrollTo);
        if (this.options.history) {
            if (this._isPushstate) {
                state_manager_1.default.doPush(this._response.url, document.title);
            }
            else {
                state_manager_1.default.doReplace(this._response.url, document.title);
            }
        }
        trigger_1.default(document, ['pjax:complete']);
        if (!this._scriptsToAppend.length) {
            if (this.options.debug) {
                console.log('%c[Pjax] ' + "%cNo new scripts to load", 'color:#f3ff35', 'color:#eee');
                trigger_1.default(document, ['pjax:scriptContentLoaded']);
            }
        }
        this._dom.classList.add('dom-is-loaded');
        this._dom.classList.remove('dom-is-loading');
        this._cache = null;
        this._request = null;
        this._response = null;
        this._cachedSwitch = null;
        this._isPushstate = true;
        this._scrollTo = { x: 0, y: 0 };
        this._confirmed = false;
        this._transitionFinished = false;
    };
    Pjax.prototype.handleSwitches = function (switchQueue) {
        for (var i = 0; i < switchQueue.length; i++) {
            switchQueue[i].current.innerHTML = switchQueue[i].new.innerHTML;
            parse_dom_1.default(switchQueue[i].current, this);
        }
        this.finalize();
    };
    Pjax.prototype.switchSelectors = function (selectors, tempDocument) {
        var _this = this;
        if (tempDocument === null) {
            if (this.options.debug) {
                console.log('%c[Pjax] ' + ("%ctemporary document was null, telling the browser to load " + ((this._cache !== null) ? this._cache.url : this._response.url)), 'color:#f3ff35', 'color:#eee');
            }
            if (this._cache !== null) {
                this.lastChance(this._cache.url);
            }
            else {
                this.lastChance(this._response.url);
            }
            return;
        }
        if (!this.options.importScripts) {
            var newScripts = Array.from(tempDocument.querySelectorAll('script'));
            if (newScripts.length) {
                var currentScripts_1 = Array.from(document.querySelectorAll('script'));
                newScripts.forEach(function (newScript) {
                    var isNewScript = true;
                    currentScripts_1.forEach(function (currentScript) {
                        if (newScript.src === currentScript.src) {
                            isNewScript = false;
                        }
                    });
                    if (isNewScript) {
                        if (_this.options.debug) {
                            console.log('%c[Pjax] ' + "%cthe new page contains scripts", 'color:#f3ff35', 'color:#eee');
                        }
                        _this.lastChance(_this._response.url);
                    }
                });
            }
        }
        if (!this.options.importCSS) {
            var newStylesheets = Array.from(tempDocument.querySelectorAll('link[rel="stylesheet"]'));
            if (newStylesheets.length) {
                var currentStylesheets_1 = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
                newStylesheets.forEach(function (newStylesheet) {
                    var isNewSheet = true;
                    currentStylesheets_1.forEach(function (currentStylesheet) {
                        if (newStylesheet.getAttribute('href') === currentStylesheet.getAttribute('href')) {
                            isNewSheet = false;
                        }
                    });
                    if (isNewSheet) {
                        if (_this.options.debug) {
                            console.log('%c[Pjax] ' + "%cthe new page contains new stylesheets", 'color:#f3ff35', 'color:#eee');
                        }
                        _this.lastChance(_this._response.url);
                    }
                });
            }
        }
        var switchQueue = [];
        for (var i = 0; i < selectors.length; i++) {
            var newContainers = Array.from(tempDocument.querySelectorAll(selectors[i]));
            var currentContainers = Array.from(document.querySelectorAll(selectors[i]));
            if (this.options.debug) {
                console.log('%c[Pjax] ' + ("%cswapping content from " + selectors[i]), 'color:#f3ff35', 'color:#eee');
            }
            if (newContainers.length !== currentContainers.length) {
                if (this.options.debug) {
                    console.log('%c[Pjax] ' + "%cthe dom doesn't look the same", 'color:#f3ff35', 'color:#eee');
                }
                this.lastChance(this._response.url);
                return;
            }
            for (var k = 0; k < newContainers.length; k++) {
                var newContainer = newContainers[k];
                var currentContainer = currentContainers[k];
                var switchObject = {
                    new: newContainer,
                    current: currentContainer
                };
                switchQueue.push(switchObject);
            }
        }
        if (switchQueue.length === 0) {
            if (this.options.debug) {
                console.log('%c[Pjax] ' + "%ccouldn't find anything to switch", 'color:#f3ff35', 'color:#eee');
            }
            this.lastChance(this._response.url);
            return;
        }
        if (this.options.importScripts) {
            this.handleScripts(tempDocument);
        }
        if (this.options.importCSS) {
            if (!this.options.requireCssBeforeComplete) {
                this.handleCSS(tempDocument);
            }
            else {
                this.handleSynchronousCss(tempDocument)
                    .then(function () {
                    if (!_this.options.customTransitions) {
                        if (_this.options.titleSwitch) {
                            document.title = tempDocument.title;
                        }
                        _this.handleSwitches(switchQueue);
                    }
                    else {
                        _this._cachedSwitch = {
                            queue: switchQueue,
                            title: tempDocument.title
                        };
                        if (_this._transitionFinished) {
                            if (_this.options.titleSwitch) {
                                document.title = _this._cachedSwitch.title;
                            }
                            _this.handleSwitches(_this._cachedSwitch.queue);
                        }
                    }
                });
            }
        }
        if (this.options.importCSS && this.options.requireCssBeforeComplete) {
            return;
        }
        if (!this.options.customTransitions) {
            if (this.options.titleSwitch) {
                document.title = tempDocument.title;
            }
            this.handleSwitches(switchQueue);
        }
        else {
            this._cachedSwitch = {
                queue: switchQueue,
                title: tempDocument.title
            };
            if (this._transitionFinished) {
                if (this.options.titleSwitch) {
                    document.title = this._cachedSwitch.title;
                }
                this.handleSwitches(this._cachedSwitch.queue);
            }
        }
    };
    Pjax.prototype.lastChance = function (uri) {
        if (this.options.debug) {
            console.log('%c[Pjax] ' + ("%csomething caused Pjax to break, native loading " + uri), 'color:#f3ff35', 'color:#eee');
        }
        window.location.href = uri;
    };
    Pjax.prototype.statusCheck = function () {
        for (var status_1 = 200; status_1 <= 206; status_1++) {
            if (this._cache.status === status_1) {
                return true;
            }
        }
        return false;
    };
    Pjax.prototype.loadCachedContent = function () {
        if (!this.statusCheck()) {
            this.lastChance(this._cache.url);
            return;
        }
        clear_active_1.default();
        state_manager_1.default.doReplace(window.location.href, document.title);
        this.switchSelectors(this.options.selectors, this._cache.document);
    };
    Pjax.prototype.parseContent = function (responseText) {
        var tempDocument = document.implementation.createHTMLDocument('pjax-temp-document');
        var contentType = this._response.headers.get('Content-Type');
        if (contentType === null) {
            return null;
        }
        var htmlRegex = /text\/html/gi;
        var matches = contentType.match(htmlRegex);
        if (matches !== null) {
            tempDocument.documentElement.innerHTML = responseText;
            return tempDocument;
        }
        return null;
    };
    Pjax.prototype.cacheContent = function (responseText, responseStatus, uri) {
        var tempDocument = this.parseContent(responseText);
        this._cache = {
            status: responseStatus,
            document: tempDocument,
            url: uri
        };
        if (tempDocument instanceof HTMLDocument) {
            if (this.options.debug) {
                console.log('%c[Pjax] ' + "%ccaching content", 'color:#f3ff35', 'color:#eee');
            }
        }
        else {
            if (this.options.debug) {
                console.log('%c[Pjax] ' + "%cresponse wan't an HTML document", 'color:#f3ff35', 'color:#eee');
            }
            trigger_1.default(document, ['pjax:error']);
        }
    };
    Pjax.prototype.loadContent = function (responseText) {
        var tempDocument = this.parseContent(responseText);
        if (tempDocument instanceof HTMLDocument) {
            clear_active_1.default();
            state_manager_1.default.doReplace(window.location.href, document.title);
            this.switchSelectors(this.options.selectors, tempDocument);
        }
        else {
            if (this.options.debug) {
                console.log('%c[Pjax] ' + "%cresponse wasn't an HTML document", 'color:#f3ff35', 'color:#eee');
            }
            trigger_1.default(document, ['pjax:error']);
            this.lastChance(this._response.url);
            return;
        }
    };
    Pjax.prototype.handleScripts = function (newDocument) {
        var _this = this;
        if (newDocument instanceof HTMLDocument) {
            var newScripts = Array.from(newDocument.querySelectorAll('script'));
            var currentScripts_2 = Array.from(document.querySelectorAll('script'));
            newScripts.forEach(function (newScript) {
                var appendScript = true;
                var newScriptFilename = 'inline-script';
                if (newScript.getAttribute('src') !== null) {
                    newScriptFilename = newScript.getAttribute('src').match(/[^/]+$/g)[0];
                }
                currentScripts_2.forEach(function (currentScript) {
                    var currentScriptFilename = 'inline-script';
                    if (currentScript.getAttribute('src') !== null) {
                        currentScriptFilename = currentScript.getAttribute('src').match(/[^/]+$/g)[0];
                    }
                    if (newScriptFilename === currentScriptFilename && newScriptFilename !== 'inline-script') {
                        appendScript = false;
                    }
                });
                if (appendScript) {
                    _this._scriptsToAppend.push(newScript);
                }
            });
            if (this._scriptsToAppend.length) {
                var scriptLoadCount_1 = 0;
                this._scriptsToAppend.forEach(function (script) {
                    if (script.src === '') {
                        var newScript = document.createElement('script');
                        newScript.dataset.src = _this._response.url;
                        newScript.innerHTML = script.innerHTML;
                        _this.options.scriptImportLocation.appendChild(newScript);
                        scriptLoadCount_1++;
                        _this.checkForScriptLoadComplete(scriptLoadCount_1);
                    }
                    else {
                        fetch(script.src, {
                            method: 'GET',
                            credentials: 'include',
                            headers: new Headers({
                                'X-Requested-With': 'XMLHttpRequest',
                                'Accept': 'text/javascript'
                            })
                        })
                            .then(function (request) { return request.text(); })
                            .then(function (response) {
                            var newScript = document.createElement('script');
                            newScript.setAttribute('src', script.src);
                            newScript.innerHTML = response;
                            _this.options.scriptImportLocation.appendChild(newScript);
                            scriptLoadCount_1++;
                            _this.checkForScriptLoadComplete(scriptLoadCount_1);
                        })
                            .catch(function (error) {
                            console.error('Failed to fetch script', script.src, error);
                        });
                    }
                });
            }
        }
    };
    Pjax.prototype.checkForScriptLoadComplete = function (scriptCount) {
        if (scriptCount === this._scriptsToAppend.length) {
            if (this.options.debug) {
                console.log('%c[Pjax] ' + "%cAll scripts have been loaded", 'color:#f3ff35', 'color:#eee');
            }
            this._scriptsToAppend = [];
            trigger_1.default(document, ['pjax:scriptContentLoaded']);
        }
    };
    Pjax.prototype.handleCSS = function (newDocument) {
        if (newDocument instanceof HTMLDocument) {
            var newStyles = Array.from(newDocument.querySelectorAll('link[rel="stylesheet"]'));
            var currentStyles_1 = Array.from(document.querySelectorAll('link[rel="stylesheet"], style[href]'));
            var stylesToAppend_1 = [];
            newStyles.forEach(function (newStyle) {
                var appendStyle = true;
                var newStyleFile = newStyle.getAttribute('href').match(/[^/]+$/g)[0];
                currentStyles_1.forEach(function (currentStyle) {
                    var currentStyleFile = currentStyle.getAttribute('href').match(/[^/]+$/g)[0];
                    if (newStyleFile === currentStyleFile) {
                        appendStyle = false;
                    }
                });
                if (appendStyle) {
                    stylesToAppend_1.push(newStyle);
                }
            });
            if (stylesToAppend_1.length) {
                stylesToAppend_1.forEach(function (style) {
                    fetch(style.href, {
                        method: 'GET',
                        credentials: 'include',
                        headers: new Headers({
                            'X-Requested-With': 'XMLHttpRequest',
                            'Accept': 'text/javascript'
                        })
                    })
                        .then(function (request) { return request.text(); })
                        .then(function (response) {
                        var newStyle = document.createElement('style');
                        newStyle.setAttribute('rel', 'stylesheet');
                        newStyle.setAttribute('href', style.href);
                        newStyle.innerHTML = response;
                        document.head.appendChild(newStyle);
                    })
                        .catch(function (error) {
                        console.error('Failed to fetch stylesheet', style.href, error);
                    });
                });
            }
        }
    };
    Pjax.prototype.handleSynchronousCss = function (newDocument) {
        return new Promise(function (resolve) {
            if (newDocument instanceof HTMLDocument) {
                var newStyles = Array.from(newDocument.querySelectorAll('link[rel="stylesheet"]'));
                var currentStyles_2 = Array.from(document.querySelectorAll('link[rel="stylesheet"], style[href]'));
                var stylesToAppend_2 = [];
                var fetched_1 = 0;
                newStyles.forEach(function (newStyle) {
                    var appendStyle = true;
                    var newStyleFile = newStyle.getAttribute('href').match(/[^/]+$/g)[0];
                    currentStyles_2.forEach(function (currentStyle) {
                        var currentStyleFile = currentStyle.getAttribute('href').match(/[^/]+$/g)[0];
                        if (newStyleFile === currentStyleFile) {
                            appendStyle = false;
                        }
                    });
                    if (appendStyle) {
                        stylesToAppend_2.push(newStyle);
                    }
                });
                if (stylesToAppend_2.length) {
                    stylesToAppend_2.forEach(function (style) {
                        fetch(style.href, {
                            method: 'GET',
                            credentials: 'include',
                            headers: new Headers({
                                'X-Requested-With': 'XMLHttpRequest'
                            })
                        })
                            .then(function (request) { return request.text(); })
                            .then(function (response) {
                            var newStyle = document.createElement('style');
                            newStyle.setAttribute('rel', 'stylesheet');
                            newStyle.setAttribute('href', style.href);
                            newStyle.innerHTML = response;
                            document.head.appendChild(newStyle);
                        })
                            .catch(function (error) {
                            console.error('Failed to fetch stylesheet', style.href, error);
                        })
                            .then(function () {
                            fetched_1++;
                            if (fetched_1 === stylesToAppend_2.length) {
                                resolve();
                            }
                        });
                    });
                }
                else {
                    resolve();
                }
            }
        });
    };
    Pjax.prototype.handleResponse = function (response) {
        var _this = this;
        if (this._request === null) {
            return;
        }
        if (this.options.debug) {
            console.log('%c[Pjax] ' + ("%cRequest status: " + response.status), 'color:#f3ff35', 'color:#eee');
        }
        if (!response.ok) {
            trigger_1.default(document, ['pjax:error']);
            return;
        }
        this._response = response;
        response.text().then(function (responseText) {
            switch (_this._request) {
                case 'prefetch':
                    if (_this._confirmed) {
                        _this.loadContent(responseText);
                    }
                    else {
                        _this.cacheContent(responseText, _this._response.status, _this._response.url);
                    }
                    break;
                case 'popstate':
                    _this._isPushstate = false;
                    _this.loadContent(responseText);
                    break;
                case 'reload':
                    _this._isPushstate = false;
                    _this.loadContent(responseText);
                    break;
                default:
                    _this.loadContent(responseText);
                    break;
            }
        });
    };
    Pjax.prototype.doRequest = function (href) {
        var _this = this;
        this._requestId++;
        var idAtStartOfRequest = this._requestId;
        var uri = href;
        var queryString = href.split('?')[1];
        if (this.options.cacheBust) {
            uri += (queryString === undefined) ? ("?cb=" + Date.now()) : ("&cb=" + Date.now());
        }
        var fetchMethod = 'GET';
        var fetchHeaders = new Headers({
            'X-Requested-With': 'XMLHttpRequest',
            'X-Pjax': 'true'
        });
        fetch(uri, {
            method: fetchMethod,
            headers: fetchHeaders
        }).then(function (response) {
            if (idAtStartOfRequest === _this._requestId) {
                _this.handleResponse(response);
            }
        }).catch(function (error) {
            if (_this.options.debug) {
                console.group();
                console.error('%c[Pjax] ' + "%cFetch error:", 'color:#f3ff35', 'color:#eee');
                console.error(error);
                console.groupEnd();
            }
        });
    };
    Pjax.prototype.handlePrefetch = function (href) {
        if (this._confirmed) {
            return;
        }
        if (this.options.debug) {
            console.log('%c[Pjax] ' + ("%cprefetching " + href), 'color:#f3ff35', 'color:#eee');
        }
        this.abortRequest();
        trigger_1.default(document, ['pjax:prefetch']);
        this._request = 'prefetch';
        this.doRequest(href);
    };
    Pjax.prototype.handleLoad = function (href, loadType, el) {
        if (el === void 0) { el = null; }
        if (this._confirmed) {
            return;
        }
        trigger_1.default(document, ['pjax:send'], el);
        this._dom.classList.remove('dom-is-loaded');
        this._dom.classList.add('dom-is-loading');
        this._confirmed = true;
        if (this._cache !== null) {
            if (this.options.debug) {
                console.log('%c[Pjax] ' + ("%cloading cached content from " + href), 'color:#f3ff35', 'color:#eee');
            }
            this.loadCachedContent();
        }
        else if (this._request !== 'prefetch') {
            if (this.options.debug) {
                console.log('%c[Pjax] ' + ("%cloading " + href), 'color:#f3ff35', 'color:#eee');
            }
            this._request = loadType;
            this.doRequest(href);
        }
    };
    Pjax.prototype.clearPrefetch = function () {
        if (!this._confirmed) {
            this._cache = null;
            this.abortRequest();
            trigger_1.default(document, ['pjax:cancel']);
        }
    };
    Pjax.load = function (url) {
        var customEvent = new CustomEvent('pjax:load', {
            detail: {
                uri: url
            }
        });
        document.dispatchEvent(customEvent);
    };
    Pjax.VERSION = '2.3.2';
    return Pjax;
}());
exports.default = Pjax;
//# sourceMappingURL=pjax.js.map



/*!
 * Copyright 2012, Chris Wanstrath
 * Released under the MIT License
 * https://github.com/defunkt/jquery-pjax
 */

(function($){

    // When called on a container with a selector, fetches the href with
    // ajax into the container or with the data-pjax attribute on the link
    // itself.
    //
    // Tries to make sure the back button and ctrl+click work the way
    // you'd expect.
    //
    // Exported as $.fn.pjax
    //
    // Accepts a jQuery ajax options object that may include these
    // pjax specific options:
    //
    //
    // container - String selector for the element where to place the response body.
    //      push - Whether to pushState the URL. Defaults to true (of course).
    //   replace - Want to use replaceState instead? That's cool.
    //
    // For convenience the second parameter can be either the container or
    // the options object.
    //
    // Returns the jQuery object
    function fnPjax(selector, container, options) {
      options = optionsFor(container, options)
      return this.on('click.pjax', selector, function(event) {
        var opts = options
        if (!opts.container) {
          opts = $.extend({}, options)
          opts.container = $(this).attr('data-pjax')
        }
        handleClick(event, opts)
      })
    }
    
    // Public: pjax on click handler
    //
    // Exported as $.pjax.click.
    //
    // event   - "click" jQuery.Event
    // options - pjax options
    //
    // Examples
    //
    //   $(document).on('click', 'a', $.pjax.click)
    //   // is the same as
    //   $(document).pjax('a')
    //
    // Returns nothing.
    function handleClick(event, container, options) {
      options = optionsFor(container, options)
    
      var link = event.currentTarget
      var $link = $(link)
    
      if (link.tagName.toUpperCase() !== 'A')
        throw "$.fn.pjax or $.pjax.click requires an anchor element"
    
      // Middle click, cmd click, and ctrl click should open
      // links in a new tab as normal.
      if ( event.which > 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey )
        return
    
      // Ignore cross origin links
      if ( location.protocol !== link.protocol || location.hostname !== link.hostname )
        return
    
      // Ignore case when a hash is being tacked on the current URL
      if ( link.href.indexOf('#') > -1 && stripHash(link) == stripHash(location) )
        return
    
      // Ignore event with default prevented
      if (event.isDefaultPrevented())
        return
    
      var defaults = {
        url: link.href,
        container: $link.attr('data-pjax'),
        target: link
      }
    
      var opts = $.extend({}, defaults, options)
      var clickEvent = $.Event('pjax:click')
      $link.trigger(clickEvent, [opts])
    
      if (!clickEvent.isDefaultPrevented()) {
        pjax(opts)
        event.preventDefault()
        $link.trigger('pjax:clicked', [opts])
      }
    }
    
    
    // Loads a URL with ajax, puts the response body inside a container,
    // then pushState()'s the loaded URL.
    //
    // Works just like $.ajax in that it accepts a jQuery ajax
    // settings object (with keys like url, type, data, etc).
    //
    // Accepts these extra keys:
    //
    // container - String selector for where to stick the response body.
    //      push - Whether to pushState the URL. Defaults to true (of course).
    //   replace - Want to use replaceState instead? That's cool.
    //
    // Use it just like $.ajax:
    //
    //   var xhr = $.pjax({ url: this.href, container: '#main' })
    //   console.log( xhr.readyState )
    //
    // Returns whatever $.ajax returns.
    function pjax(options) {
      options = $.extend(true, {}, $.ajaxSettings, pjax.defaults, options)
    
      if ($.isFunction(options.url)) {
        options.url = options.url()
      }
    
      var hash = parseURL(options.url).hash
    
      var containerType = $.type(options.container)
      if (containerType !== 'string') {
        throw "expected string value for 'container' option; got " + containerType
      }
      var context = options.context = $(options.container)
      if (!context.length) {
        throw "the container selector '" + options.container + "' did not match anything"
      }
    
      // We want the browser to maintain two separate internal caches: one
      // for pjax'd partial page loads and one for normal page loads.
      // Without adding this secret parameter, some browsers will often
      // confuse the two.
      if (!options.data) options.data = {}
      if ($.isArray(options.data)) {
        options.data.push({name: '_pjax', value: options.container})
      } else {
        options.data._pjax = options.container
      }
    
      function fire(type, args, props) {
        if (!props) props = {}
        props.relatedTarget = options.target
        var event = $.Event(type, props)
        context.trigger(event, args)
        return !event.isDefaultPrevented()
      }
    
      var timeoutTimer
    
      options.beforeSend = function(xhr, settings) {
        // No timeout for non-GET requests
        // Its not safe to request the resource again with a fallback method.
        if (settings.type !== 'GET') {
          settings.timeout = 0
        }
    
        xhr.setRequestHeader('X-PJAX', 'true')
        xhr.setRequestHeader('X-PJAX-Container', options.container)
    
        if (!fire('pjax:beforeSend', [xhr, settings]))
          return false
    
        if (settings.timeout > 0) {
          timeoutTimer = setTimeout(function() {
            if (fire('pjax:timeout', [xhr, options]))
              xhr.abort('timeout')
          }, settings.timeout)
    
          // Clear timeout setting so jquerys internal timeout isn't invoked
          settings.timeout = 0
        }
    
        var url = parseURL(settings.url)
        if (hash) url.hash = hash
        options.requestUrl = stripInternalParams(url)
      }
    
      options.complete = function(xhr, textStatus) {
        if (timeoutTimer)
          clearTimeout(timeoutTimer)
    
        fire('pjax:complete', [xhr, textStatus, options])
    
        fire('pjax:end', [xhr, options])
      }
    
      options.error = function(xhr, textStatus, errorThrown) {
        var container = extractContainer("", xhr, options)
    
        var allowed = fire('pjax:error', [xhr, textStatus, errorThrown, options])
        if (options.type == 'GET' && textStatus !== 'abort' && allowed) {
          locationReplace(container.url)
        }
      }
    
      options.success = function(data, status, xhr) {
        var previousState = pjax.state
    
        // If $.pjax.defaults.version is a function, invoke it first.
        // Otherwise it can be a static string.
        var currentVersion = typeof $.pjax.defaults.version === 'function' ?
          $.pjax.defaults.version() :
          $.pjax.defaults.version
    
        var latestVersion = xhr.getResponseHeader('X-PJAX-Version')
    
        var container = extractContainer(data, xhr, options)
    
        var url = parseURL(container.url)
        if (hash) {
          url.hash = hash
          container.url = url.href
        }
    
        // If there is a layout version mismatch, hard load the new url
        if (currentVersion && latestVersion && currentVersion !== latestVersion) {
          locationReplace(container.url)
          return
        }
    
        // If the new response is missing a body, hard load the page
        if (!container.contents) {
          locationReplace(container.url)
          return
        }
    
        pjax.state = {
          id: options.id || uniqueId(),
          url: container.url,
          title: container.title,
          container: options.container,
          fragment: options.fragment,
          timeout: options.timeout
        }
    
        if (options.push || options.replace) {
          window.history.replaceState(pjax.state, container.title, container.url)
        }
    
        // Only blur the focus if the focused element is within the container.
        var blurFocus = $.contains(context, document.activeElement)
    
        // Clear out any focused controls before inserting new page contents.
        if (blurFocus) {
          try {
            document.activeElement.blur()
          } catch (e) { /* ignore */ }
        }
    
        if (container.title) document.title = container.title
    
        fire('pjax:beforeReplace', [container.contents, options], {
          state: pjax.state,
          previousState: previousState
        })
        context.html(container.contents)
    
        // FF bug: Won't autofocus fields that are inserted via JS.
        // This behavior is incorrect. So if theres no current focus, autofocus
        // the last field.
        //
        // http://www.w3.org/html/wg/drafts/html/master/forms.html
        var autofocusEl = context.find('input[autofocus], textarea[autofocus]').last()[0]
        if (autofocusEl && document.activeElement !== autofocusEl) {
          autofocusEl.focus()
        }
    
        executeScriptTags(container.scripts)
    
        var scrollTo = options.scrollTo
    
        // Ensure browser scrolls to the element referenced by the URL anchor
        if (hash) {
          var name = decodeURIComponent(hash.slice(1))
          var target = document.getElementById(name) || document.getElementsByName(name)[0]
          if (target) scrollTo = $(target).offset().top
        }
    
        if (typeof scrollTo == 'number') $(window).scrollTop(scrollTo)
    
        fire('pjax:success', [data, status, xhr, options])
      }
    
    
      // Initialize pjax.state for the initial page load. Assume we're
      // using the container and options of the link we're loading for the
      // back button to the initial page. This ensures good back button
      // behavior.
      if (!pjax.state) {
        pjax.state = {
          id: uniqueId(),
          url: window.location.href,
          title: document.title,
          container: options.container,
          fragment: options.fragment,
          timeout: options.timeout
        }
        window.history.replaceState(pjax.state, document.title)
      }
    
      // Cancel the current request if we're already pjaxing
      abortXHR(pjax.xhr)
    
      pjax.options = options
      var xhr = pjax.xhr = $.ajax(options)
    
      if (xhr.readyState > 0) {
        if (options.push && !options.replace) {
          // Cache current container element before replacing it
          cachePush(pjax.state.id, [options.container, cloneContents(context)])
    
          window.history.pushState(null, "", options.requestUrl)
        }
    
        fire('pjax:start', [xhr, options])
        fire('pjax:send', [xhr, options])
      }
    
      return pjax.xhr
    }
    
    // Public: Reload current page with pjax.
    //
    // Returns whatever $.pjax returns.
    function pjaxReload(container, options) {
      var defaults = {
        url: window.location.href,
        push: false,
        replace: true,
        scrollTo: false
      }
    
      return pjax($.extend(defaults, optionsFor(container, options)))
    }
    
    // Internal: Hard replace current state with url.
    //
    // Work for around WebKit
    //   https://bugs.webkit.org/show_bug.cgi?id=93506
    //
    // Returns nothing.
    function locationReplace(url) {
      window.history.replaceState(null, "", pjax.state.url)
      window.location.replace(url)
    }
    
    
    var initialPop = true
    var initialURL = window.location.href
    var initialState = window.history.state
    
    // Initialize $.pjax.state if possible
    // Happens when reloading a page and coming forward from a different
    // session history.
    if (initialState && initialState.container) {
      pjax.state = initialState
    }
    
    // Non-webkit browsers don't fire an initial popstate event
    if ('state' in window.history) {
      initialPop = false
    }
    
    // popstate handler takes care of the back and forward buttons
    //
    // You probably shouldn't use pjax on pages with other pushState
    // stuff yet.
    function onPjaxPopstate(event) {
    
      // Hitting back or forward should override any pending PJAX request.
      if (!initialPop) {
        abortXHR(pjax.xhr)
      }
    
      var previousState = pjax.state
      var state = event.state
      var direction
    
      if (state && state.container) {
        // When coming forward from a separate history session, will get an
        // initial pop with a state we are already at. Skip reloading the current
        // page.
        if (initialPop && initialURL == state.url) return
    
        if (previousState) {
          // If popping back to the same state, just skip.
          // Could be clicking back from hashchange rather than a pushState.
          if (previousState.id === state.id) return
    
          // Since state IDs always increase, we can deduce the navigation direction
          direction = previousState.id < state.id ? 'forward' : 'back'
        }
    
        var cache = cacheMapping[state.id] || []
        var containerSelector = cache[0] || state.container
        var container = $(containerSelector), contents = cache[1]
    
        if (container.length) {
          if (previousState) {
            // Cache current container before replacement and inform the
            // cache which direction the history shifted.
            cachePop(direction, previousState.id, [containerSelector, cloneContents(container)])
          }
    
          var popstateEvent = $.Event('pjax:popstate', {
            state: state,
            direction: direction
          })
          container.trigger(popstateEvent)
    
          var options = {
            id: state.id,
            url: state.url,
            container: containerSelector,
            push: false,
            fragment: state.fragment,
            timeout: state.timeout,
            scrollTo: false
          }
    
          if (contents) {
            container.trigger('pjax:start', [null, options])
    
            pjax.state = state
            if (state.title) document.title = state.title
            var beforeReplaceEvent = $.Event('pjax:beforeReplace', {
              state: state,
              previousState: previousState
            })
            container.trigger(beforeReplaceEvent, [contents, options])
            container.html(contents)
    
            container.trigger('pjax:end', [null, options])
          } else {
            pjax(options)
          }
    
          // Force reflow/relayout before the browser tries to restore the
          // scroll position.
          container[0].offsetHeight // eslint-disable-line no-unused-expressions
        } else {
          locationReplace(location.href)
        }
      }
      initialPop = false
    }
    
    // Fallback version of main pjax function for browsers that don't
    // support pushState.
    //
    // Returns nothing since it retriggers a hard form submission.
    function fallbackPjax(options) {
      var url = $.isFunction(options.url) ? options.url() : options.url,
          method = options.type ? options.type.toUpperCase() : 'GET'
    
      var form = $('<form>', {
        method: method === 'GET' ? 'GET' : 'POST',
        action: url,
        style: 'display:none'
      })
    
      if (method !== 'GET' && method !== 'POST') {
        form.append($('<input>', {
          type: 'hidden',
          name: '_method',
          value: method.toLowerCase()
        }))
      }
    
      var data = options.data
      if (typeof data === 'string') {
        $.each(data.split('&'), function(index, value) {
          var pair = value.split('=')
          form.append($('<input>', {type: 'hidden', name: pair[0], value: pair[1]}))
        })
      } else if ($.isArray(data)) {
        $.each(data, function(index, value) {
          form.append($('<input>', {type: 'hidden', name: value.name, value: value.value}))
        })
      } else if (typeof data === 'object') {
        var key
        for (key in data)
          form.append($('<input>', {type: 'hidden', name: key, value: data[key]}))
      }
    
      $(document.body).append(form)
      form.submit()
    }
    
    // Internal: Abort an XmlHttpRequest if it hasn't been completed,
    // also removing its event handlers.
    function abortXHR(xhr) {
      if ( xhr && xhr.readyState < 4) {
        xhr.onreadystatechange = $.noop
        xhr.abort()
      }
    }
    
    // Internal: Generate unique id for state object.
    //
    // Use a timestamp instead of a counter since ids should still be
    // unique across page loads.
    //
    // Returns Number.
    function uniqueId() {
      return (new Date).getTime()
    }
    
    function cloneContents(container) {
      var cloned = container.clone()
      // Unmark script tags as already being eval'd so they can get executed again
      // when restored from cache. HAXX: Uses jQuery internal method.
      cloned.find('script').each(function(){
        if (!this.src) $._data(this, 'globalEval', false)
      })
      return cloned.contents()
    }
    
    // Internal: Strip internal query params from parsed URL.
    //
    // Returns sanitized url.href String.
    function stripInternalParams(url) {
      url.search = url.search.replace(/([?&])(_pjax|_)=[^&]*/g, '').replace(/^&/, '')
      return url.href.replace(/\?($|#)/, '$1')
    }
    
    // Internal: Parse URL components and returns a Locationish object.
    //
    // url - String URL
    //
    // Returns HTMLAnchorElement that acts like Location.
    function parseURL(url) {
      var a = document.createElement('a')
      a.href = url
      return a
    }
    
    // Internal: Return the `href` component of given URL object with the hash
    // portion removed.
    //
    // location - Location or HTMLAnchorElement
    //
    // Returns String
    function stripHash(location) {
      return location.href.replace(/#.*/, '')
    }
    
    // Internal: Build options Object for arguments.
    //
    // For convenience the first parameter can be either the container or
    // the options object.
    //
    // Examples
    //
    //   optionsFor('#container')
    //   // => {container: '#container'}
    //
    //   optionsFor('#container', {push: true})
    //   // => {container: '#container', push: true}
    //
    //   optionsFor({container: '#container', push: true})
    //   // => {container: '#container', push: true}
    //
    // Returns options Object.
    function optionsFor(container, options) {
      if (container && options) {
        options = $.extend({}, options)
        options.container = container
        return options
      } else if ($.isPlainObject(container)) {
        return container
      } else {
        return {container: container}
      }
    }
    
    // Internal: Filter and find all elements matching the selector.
    //
    // Where $.fn.find only matches descendants, findAll will test all the
    // top level elements in the jQuery object as well.
    //
    // elems    - jQuery object of Elements
    // selector - String selector to match
    //
    // Returns a jQuery object.
    function findAll(elems, selector) {
      return elems.filter(selector).add(elems.find(selector))
    }
    
    function parseHTML(html) {
      return $.parseHTML(html, document, true)
    }
    
    // Internal: Extracts container and metadata from response.
    //
    // 1. Extracts X-PJAX-URL header if set
    // 2. Extracts inline <title> tags
    // 3. Builds response Element and extracts fragment if set
    //
    // data    - String response data
    // xhr     - XHR response
    // options - pjax options Object
    //
    // Returns an Object with url, title, and contents keys.
    function extractContainer(data, xhr, options) {
      var obj = {}, fullDocument = /<html/i.test(data)
    
      // Prefer X-PJAX-URL header if it was set, otherwise fallback to
      // using the original requested url.
      var serverUrl = xhr.getResponseHeader('X-PJAX-URL')
      obj.url = serverUrl ? stripInternalParams(parseURL(serverUrl)) : options.requestUrl
    
      var $head, $body
      // Attempt to parse response html into elements
      if (fullDocument) {
        $body = $(parseHTML(data.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0]))
        var head = data.match(/<head[^>]*>([\s\S.]*)<\/head>/i)
        $head = head != null ? $(parseHTML(head[0])) : $body
      } else {
        $head = $body = $(parseHTML(data))
      }
    
      // If response data is empty, return fast
      if ($body.length === 0)
        return obj
    
      // If there's a <title> tag in the header, use it as
      // the page's title.
      obj.title = findAll($head, 'title').last().text()
    
      if (options.fragment) {
        var $fragment = $body
        // If they specified a fragment, look for it in the response
        // and pull it out.
        if (options.fragment !== 'body') {
          $fragment = findAll($fragment, options.fragment).first()
        }
    
        if ($fragment.length) {
          obj.contents = options.fragment === 'body' ? $fragment : $fragment.contents()
    
          // If there's no title, look for data-title and title attributes
          // on the fragment
          if (!obj.title)
            obj.title = $fragment.attr('title') || $fragment.data('title')
        }
    
      } else if (!fullDocument) {
        obj.contents = $body
      }
    
      // Clean up any <title> tags
      if (obj.contents) {
        // Remove any parent title elements
        obj.contents = obj.contents.not(function() { return $(this).is('title') })
    
        // Then scrub any titles from their descendants
        obj.contents.find('title').remove()
    
        // Gather all script[src] elements
        obj.scripts = findAll(obj.contents, 'script[src]').remove()
        obj.contents = obj.contents.not(obj.scripts)
      }
    
      // Trim any whitespace off the title
      if (obj.title) obj.title = $.trim(obj.title)
    
      return obj
    }
    
    // Load an execute scripts using standard script request.
    //
    // Avoids jQuery's traditional $.getScript which does a XHR request and
    // globalEval.
    //
    // scripts - jQuery object of script Elements
    //
    // Returns nothing.
    function executeScriptTags(scripts) {
      if (!scripts) return
    
      var existingScripts = $('script[src]')
    
      scripts.each(function() {
        var src = this.src
        var matchedScripts = existingScripts.filter(function() {
          return this.src === src
        })
        if (matchedScripts.length) return
    
        var script = document.createElement('script')
        var type = $(this).attr('type')
        if (type) script.type = type
        script.src = $(this).attr('src')
        document.head.appendChild(script)
      })
    }
    
    // Internal: History DOM caching class.
    var cacheMapping      = {}
    var cacheForwardStack = []
    var cacheBackStack    = []
    
    // Push previous state id and container contents into the history
    // cache. Should be called in conjunction with `pushState` to save the
    // previous container contents.
    //
    // id    - State ID Number
    // value - DOM Element to cache
    //
    // Returns nothing.
    function cachePush(id, value) {
      cacheMapping[id] = value
      cacheBackStack.push(id)
    
      // Remove all entries in forward history stack after pushing a new page.
      trimCacheStack(cacheForwardStack, 0)
    
      // Trim back history stack to max cache length.
      trimCacheStack(cacheBackStack, pjax.defaults.maxCacheLength)
    }
    
    // Shifts cache from directional history cache. Should be
    // called on `popstate` with the previous state id and container
    // contents.
    //
    // direction - "forward" or "back" String
    // id        - State ID Number
    // value     - DOM Element to cache
    //
    // Returns nothing.
    function cachePop(direction, id, value) {
      var pushStack, popStack
      cacheMapping[id] = value
    
      if (direction === 'forward') {
        pushStack = cacheBackStack
        popStack  = cacheForwardStack
      } else {
        pushStack = cacheForwardStack
        popStack  = cacheBackStack
      }
    
      pushStack.push(id)
      id = popStack.pop()
      if (id) delete cacheMapping[id]
    
      // Trim whichever stack we just pushed to to max cache length.
      trimCacheStack(pushStack, pjax.defaults.maxCacheLength)
    }
    
    // Trim a cache stack (either cacheBackStack or cacheForwardStack) to be no
    // longer than the specified length, deleting cached DOM elements as necessary.
    //
    // stack  - Array of state IDs
    // length - Maximum length to trim to
    //
    // Returns nothing.
    function trimCacheStack(stack, length) {
      while (stack.length > length)
        delete cacheMapping[stack.shift()]
    }
    
    // Public: Find version identifier for the initial page load.
    //
    // Returns String version or undefined.
    function findVersion() {
      return $('meta').filter(function() {
        var name = $(this).attr('http-equiv')
        return name && name.toUpperCase() === 'X-PJAX-VERSION'
      }).attr('content')
    }
    
    // Install pjax functions on $.pjax to enable pushState behavior.
    //
    // Does nothing if already enabled.
    //
    // Examples
    //
    //     $.pjax.enable()
    //
    // Returns nothing.
    function enable() {
      $.fn.pjax = fnPjax
      $.pjax = pjax
      $.pjax.enable = $.noop
      $.pjax.disable = disable
      $.pjax.click = handleClick
      $.pjax.submit = handleSubmit
      $.pjax.reload = pjaxReload
      $.pjax.defaults = {
        timeout: 650,
        push: true,
        replace: false,
        type: 'GET',
        dataType: 'html',
        scrollTo: 0,
        maxCacheLength: 20,
        version: findVersion
      }
      $(window).on('popstate.pjax', onPjaxPopstate)
    }
    
    // Disable pushState behavior.
    //
    // This is the case when a browser doesn't support pushState. It is
    // sometimes useful to disable pushState for debugging on a modern
    // browser.
    //
    // Examples
    //
    //     $.pjax.disable()
    //
    // Returns nothing.
    function disable() {
      $.fn.pjax = function() { return this }
      $.pjax = fallbackPjax
      $.pjax.enable = enable
      $.pjax.disable = $.noop
      $.pjax.click = $.noop
      $.pjax.submit = $.noop
      $.pjax.reload = function() { window.location.reload() }
    
      $(window).off('popstate.pjax', onPjaxPopstate)
    }
    
    
    // Add the state property to jQuery's event object so we can use it in
    // $(window).bind('popstate')
    if ($.event.props && $.inArray('state', $.event.props) < 0) {
      $.event.props.push('state')
    } else if (!('state' in $.Event.prototype)) {
      $.event.addProp('state')
    }
    
    // Is pjax supported by this browser?
    $.support.pjax =
      window.history && window.history.pushState && window.history.replaceState &&
      // pushState isn't reliable on iOS until 5.
      !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]\D|WebApps\/.+CFNetwork)/)
    
    if ($.support.pjax) {
      enable()
    } else {
      disable()
    }
    
    })(jQuery)