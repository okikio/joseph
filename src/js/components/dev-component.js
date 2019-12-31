
// this._dom.classList.add('dom-is-loaded');
// this._dom.classList.remove('dom-is-loading');
// new state_manager_1.default(this.options.debug, true);
window.addEventListener('popstate', function (e) {
    if (e.state) {
        if (_this.options.debug) {
            console.log('%c[Pjax] ' + "%chijacking popstate event", 'color:#f3ff35', 'color:#eee');
        }
        _this._scrollTo = e.state.scrollPos;
        _this.loadUrl(e.state.uri, 'popstate');
    }
});
if (this.options.customTransitions) {
    document.addEventListener('pjax:continue', function (e) {
        _this._transitionFinished = true;
        if (_this._cachedSwitch !== null) {
            if (_this.options.titleSwitch) {
                document.title = _this._cachedSwitch.title;
            }
            (function (switchQueue) {
                for (var i = 0; i < switchQueue.length; i++) {
                    switchQueue[i].current.innerHTML = switchQueue[i].new.innerHTML;
                    parse_dom_1.default(switchQueue[i].current, this);
                }
                this.finalize();
            }) (_this._cachedSwitch.queue);
        }
    });
}
document.addEventListener('pjax:load', function (e) {
    var uri = e.detail.uri;
    if (_this.options.debug) {
        console.log('%c[Pjax] ' + ("%cmanually loading " + uri), 'color:#f3ff35', 'color:#eee');
    }
    _this.doRequest(uri);
});

let parseContent = function (responseText) {
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

let loadContent = function (responseText) {
    var tempDocument = parseContent(responseText);
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

let handleResponse = function (response) {
    var _this = this;
    if (this._request === null) {
        return;
    }
    console.log(`'%c[Page Transition] - "%cRequest status: ${response.status}`, 'color:#f3ff35', 'color:#eee');
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

let request = function (href) {
    var _this = this;
    fetch(href, {
        method: 'GET',
        headers: new Headers({
            'X-Requested-With': 'XMLHttpRequest',
            'X-Pjax': 'true'
        })
    }).then(function (response) {
        _this.handleResponse(response);
    }).catch(function (err) {
        console.error(`%c[Page Transition] - %cFetch error: ${err}`, 'color:#f3ff35', 'color:#eee');
    });
};