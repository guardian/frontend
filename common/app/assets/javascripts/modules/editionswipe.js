// Description: Edition Swipe module
// Author: Stephan Fowler

define([
    'swipeview',
    'bean',
    'bonzo',
    'qwery',
    'ajax'
], function(
    SwipeView,
    bean,
    bonzo,
    qwery,
    ajax
) {

    function $(selector, context) {
        return bonzo(qwery(selector, context));
    }

    function extend(destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        }
        return destination;
    }

    function inArray(needle, haystack) {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i] === needle) {
                return i;
            }
        }
        return -1;
    }

    function isEmptyObj(obj) {
        for(var i in obj) {
            return false;
        }
        return true;
    }

    var deBounce = (function () {
        var timers = {};
        return function (fn, time, key) {
            key = key || 1;
            clearTimeout(timers[key]);
            timers[key] = setTimeout(fn, time);
        };
    }());

    var uid = (function () {
        var i = 0;
        return {
            set: function (n) { i = n; },
            nxt: function () { return i += 1; },
            get: function () { return i; }
        };
    }());

    // TODO: make a local fn instead
    if (typeof Number.prototype.mod !== 'function') {
        Number.prototype.mod = function (n) {
            return ((this % n) + n) % n;
        };
    }

    var module = function (useropts) {

        var
            // general purpose do-nothing function
            noop = function () {},

            // Configuration options.
            opts = extend(
                {
                    // Container element
                    el: undefined,

                    // Callback after a pane is loaded (including hidden panes); use for fancy js-managed rendering.
                    afterLoad: noop,

                    // Callback before any pane is made visible.
                    beforeShow: noop,

                    // Callback after a pane is made visible; use for analytics events, social buttons, etc.
                    afterShow: noop,

                    // Milliseconds until edition should expire, i.e. cache should flush and/or content should reload instead of Ajax'ing. 0 => no expiry.
                    expiryPeriod: 0,

                    // CSS selector for anchors that should initiate an ajax+pushState reload.
                    linkSelector: 'a:not(.no-ajax)',

                    // The CSS selector for the element in each pane that should receive the ajax'd in content
                    bodySelector: '*',

                    // The name of the query param sent wth Ajax page-fragment requests
                    queryParam: 'frag_width',

                    // CSS selector for a spinner/busy indicator
                    loadingIndicator: undefined
                },
                useropts
            ),

            // Private vars
            androidVersion,
            ajaxCount = 0,
            ajaxRegex = new RegExp(opts.ajaxRegex,'g'),
            throttle,
            cache = {},
            canonicalLink = $('link[rel=canonical]'),
            contentArea = $(opts.el)[0],
            contentAreaTop = $(opts.el).offset().top,
            editionPos = -1,
            edition = [],
            editionLookup,
            editionLen = 0,
            editionChecksum,
            supportsHistory = false,
            supportsTransitions = false,
            inEdition = false,
            initialised,
            initialPage,
            initiatedBy = 'initial',
            noHistoryPush,
            visiblePane = $('#swipepages-inner > #swipepage-1', opts.el)[0],
            pageData,
            panes,
            paneNow = 1,
            paneThen = 1,
            swipeSpec,
            vendorPrefixes = ['ms', 'Khtml', 'O', 'Moz', 'Webkit', ''],
            visiblePaneMargin = 0,
            hiddenPaneMargin = 0,
            referrer = document.referrer;

        function normalizeUrl(url) {
            var a = document.createElement('a');
            a.href = url;
            a = a.pathname + a.search;
            a = a.indexOf('/') === 0 ? a : '/' + a; // because IE doesn't return a leading '/'
            return a;
        }

        function load(o) {
            var
                url = o.url,
                el = o.container,
                callback = o.callback || noop,
                spec,
                rx,
                i;
            if (url && el) {
                el.dataset = el.dataset || {};
                el.dataset.url = url;
                    
                // Ask the cache
                spec = cache[url];

                // Is cached ?
                if (spec) {
                    populate(el, spec);
                    callback();
                }
                else {
                    el.dataset.waiting = '1';
                    ajax({
                        url: url,
                        method: 'get',
                        type: 'jsonp',
                        jsonpCallbackName: 'swipePreload',
                        success: function (spec) {
                            var i;

                            if (el.dataset.url === url) {
                                populate(el, spec);
                                cache[url] = spec;
                                callback();
                            }

                            el.dataset.waiting = '';
                            ajaxCount += 1;
                            // Maybe flush cache
                            if (ajaxCount > 50) {
                                ajaxCount = 0;
                                cache = {};
                            }
                        }
                    });
                    if (o.showSpinner) {
                        spinner.show();
                    }
                }
            }
        }

        function populate(el, spec) {
            el.querySelector(opts.bodySelector).innerHTML = spec.html;
            spinner.hide();
            opts.afterLoad(el);
        }

        function reloadContent() {
            reloadPane( 0);
            reloadPane( 1);
            reloadPane(-1);
        }

        function repaintContent() {
            repaintPane( 0);
            repaintPane( 1);
            repaintPane(-1);
        }

        /*
        bean.on(window, 'resize', function () {
            // Emulator mode: detect a window resize and re-request the content, throttled to one reload per second.
            if (opts.emulator) {
                deBounce(function () {
                    cache = {};
                    reloadContent();
                }, 1013, 'reloadContent');
            }
            // Normal mode: redraw the existing content
            else {
                repaintContent();
            }
        });
        */

        // Make the contentArea height equal to the visiblePane height. (We view the latter through the former.)
        function updateHeight() {
            var height = $('*:first-child', visiblePane).offset().height; // NB visiblePane has height:100% set by swipeview, so we look within it
            if (height) {
                $(contentArea).css('height', height + visiblePaneMargin + 'px');
            }
        }

        // Fire post load actions
        function doAfterShow () {
            var url, div, pos;

            updateHeight();
            throttle = false;

            swipeSpec = {
                visiblePane: visiblePane,
                initiatedBy: initiatedBy,
                api: api
            };

            if (initialPage) {
                initialPage = false;
                swipeSpec.config = {
                    referrer: document.referrer
                };
                /*
                if (supportsHistory) {
                    ? create cache obj from the initial page from .parts__body and the config obj
                }
                */
            }
            else {
                // Set the url for pushState
                url = visiblePane.dataset.url;
                setEditionPos(url);

                swipeSpec.config = (cache[url] || {}).config || {};
                swipeSpec.config.referrer = window.location.href; // works because we havent yet push'd the new URL
                swipeSpec.visiblePane = visiblePane;

                if (swipeSpec.config.webTitle) {
                    div = document.createElement('div');
                    div.innerHTML = swipeSpec.config.webTitle; // resolves any html entities
                    document.title = div.firstChild.nodeValue;
                }

                if (!noHistoryPush) {
                    var state = {
                        id: uid.nxt(),
                        editionPos: editionPos
                    };
                    doHistoryPush(state, document.title, url);
                }
                noHistoryPush = false;

                // Update href of canonical link tag, using newly updated location
                canonicalLink.attr('href', window.location.href);
            }

            // Fire the main aftershow callback
            opts.afterShow(swipeSpec);
        }

        var spinner = (function () {
            var
                el = $(opts.loadingIndicator),
                obj = {};
            if(el.length) {
                obj.show = function () {
                    el.show();
                };
                obj.hide = function () {
                    el.hide();
                };
            }
            else {
                obj.show = obj.hide = noop;
            }
            return obj;
        }());

        function setEditionPos(url) {
            editionPos = posInEdition(normalizeUrl(url));
            inEdition = (editionPos > -1);
        }

        function posInEdition(url) {
            url = editionLookup[normalizeUrl(url)];
            return url ? url.pos : -1;
        }

        function urlInEdition(pos) {
            return pos > -1 && pos < editionLen ? edition[pos].url : edition[0].url;
        }

        function setEdition(arr) {
            var len = arr.length,
                pos,
                i;

            if (len >= 3) {
                edition = arr;
                editionLen = len;
                editionLookup = {};
                for (i = 0; i < len; i += 1) {
                    arr[i].pos = i;
                    editionLookup[arr[i].url] = arr[i];
                    window.console.log(i + " " + arr[i].url);
                }
                setEditionPos(window.location.href);
                cache = {};
            }
        }

        function gotoUrl(url, dir) {
            var pos = posInEdition(url);
            doFirst();
            if (normalizeUrl(window.location.pathname) === url) {
                dir = 0; // load back into visible pane
            }
            else if (typeof dir === 'undefined') {
                dir = pos > -1 && pos < editionPos ? -1 : 1;
            }
            preparePane({
                url: url,
                dir: dir,
                slideIn: true
            });
        }


        function getAdjacentUrl(dir) {
            // dir = 1 : right
            // dir = -1 : left

            if (dir === 0) {
                return urlInEdition(editionPos);
            }
            // Cases where we've got next/prev overrides in the current page's data
            else if (swipeSpec.config && swipeSpec.config.nextUrl && dir === 1) {
                return swipeSpec.config.nextUrl;
            }
            else if (swipeSpec.config && swipeSpec.config.prevUrl && dir === -1) {
                return swipeSpec.config.prevUrl;
            }
            // Cases where we've got an edition position already
            else if (editionPos > -1 && inEdition) {
                return urlInEdition((editionPos + dir).mod(editionLen));
            }
            else if (editionPos > -1 && !inEdition) {
                // We're displaying a non-edition page; have current-edition-page to the left, next-edition-page to right
                return urlInEdition((editionPos + (dir === 1 ? 1 : 0)).mod(editionLen));
            }
            // Cases where we've NOT yet got an edition position
            else if (dir === 1) {
                return urlInEdition(1);
            }
            else {
                return urlInEdition(0);
            }
        }

        function throttledSlideIn(dir) {
            if (!throttle) {
                throttle = true;
                slideInPane(dir);
            }
        }

        function validateClick(event) {
            var link = event.currentTarget;
            // Middle click, cmd click, and ctrl click should open links in a new tab as normal.
            if (event.which > 1 || event.metaKey || event.ctrlKey) { return; }
            // Ignore cross origin links
            if (location.protocol !== link.protocol || location.host !== link.host) { return; }
            // Ignore anchors on the same page
            if (link.hash && link.href.replace(link.hash, '') === location.href.replace(location.hash, '')) { return; }
            return true;
        }

        function gotoEditionPage(pos) {
            var dir;
            if (pos !== editionPos && pos < editionLen) {
                doFirst();
                dir = pos < editionPos ? -1 : 1;
                editionPos = pos;
                gotoUrl(urlInEdition(pos), dir);
            }
        }

        function doHistoryPush(state, title, url) {
            window.history.pushState(state, title, url);
        }

        function doFirst() {
            opts.beforeShow();
        }

        function genChecksum(s) {
            var i;
            var chk = 0x12345678;
            for (i = 0; i < s.length; i++) {
                chk += (s.charCodeAt(i) * i);
            }
            return chk;
        }

        function reloadPane(dir) {
            var el = panes.masterPages[(paneNow + dir).mod(3)];
            load({
                url: el.dataset.url,
                container: el
            });
        }

        function repaintPane(dir) {
            var el = panes.masterPages[(paneNow + dir).mod(3)];
            opts.afterLoad(el);
        }

        function preparePane(o) {
            var
                dir = o.dir || 0, // 1 is right, -1 is left.
                url = o.url,
                doSlideIn = !!o.slideIn,
                el;

            if (!url) {
                url = getAdjacentUrl(dir);
            }
            url = normalizeUrl(url); // normalize

            el = panes.masterPages[(paneNow + dir).mod(3)];
            
            // Only load if not already loaded into this pane, or cache has been flushed
            if (el.dataset.url !== url || isEmptyObj(cache)) {
                //el.querySelector(opts.bodySelector).innerHTML = ''; // Apparently this is better at preventing memory leaks that jQuert's .empty()
                load({
                    url: url,
                    container: el,
                    showSpinner: doSlideIn,
                    callback: function () {
                        // el might have become visiblePane since request was made, e.g. due to rapid swiping. If so, no need to slideInPane
                        if (el === visiblePane) {
                            doAfterShow();
                        }
                        // before slideInPane, confirm that this pane hasn't had its url changed since the request was made
                        else if (doSlideIn && el.dataset.url === url) {
                            slideInPane(dir);
                        }
                    }
                });
            }
            else if (doSlideIn) {
                slideInPane(dir);
            }
        }

        function slideInPane(dir) {
            doFirst();
            switch(dir) {
                case 1:
                    panes.next();
                    break;
                case -1:
                    panes.prev();
                    break;
                default:
                    doAfterShow();
            }
        }

        function loadSidePanes() {
            preparePane({
                dir: 1
            });
            preparePane({
                dir: -1
            });
        }

        // This'll be the public api
        var api = {
            setEdition: setEdition,

            loadSidePanes: loadSidePanes,

            getEdition: function(){
                return edition;
            },

            gotoEditionPage: function(pos, type){
                initiatedBy = type ? type.toString() : 'position';
                gotoEditionPage(pos, type);
            },

            gotoUrl: function(url, type){
                initiatedBy = type ? type.toString() : 'link';
                gotoUrl(url);
            },

            gotoNext: function(type){
                initiatedBy = type ? type.toString() : 'screen_arrow';
                throttledSlideIn( 1);
            },

            gotoPrev: function(type){
                initiatedBy = type ? type.toString() : 'screen_arrow';
                throttledSlideIn(-1);
            }
        };

        // MAIN: Render the initial content

        // Detect capabilities
        if (window.history && history.pushState) {
            supportsHistory = true;
            // Revert supportsHistory for Android <= 4.0, unless it's Chrome/Firefox browser
            androidVersion = window.navigator.userAgent.match(/Android\s+([\d\.]+)/i);
            if (androidVersion && parseFloat(androidVersion[1]) <= 4.1) {
                supportsHistory = !!window.navigator.userAgent.match(/(Chrome|Firefox)/i);
            }
        }
        if (!supportsHistory) {
            return;
        }

        // Tests for vendor specific prop
        while(vendorPrefixes.length) {
            if (vendorPrefixes.pop() + 'Transition' in document.body.style) {
                supportsTransitions = true;
                break;
            }
        }
        if (!supportsTransitions) {
            return;
        }

        // Setup some context
        initialPage = normalizeUrl(window.location.href);

        // Swipe setup
        panes = new SwipeView(contentArea, {});

        panes.onFlip(function () {
            paneNow = (panes.pageIndex+1).mod(3);
            if (paneThen !== paneNow) {
                // shuffle down the pane we've just left
                $(panes.masterPages[paneThen]).css('marginTop', hiddenPaneMargin);
                visiblePaneMargin = hiddenPaneMargin;

                paneThen = paneNow;
                visiblePane = panes.masterPages[paneNow];

                if (visiblePane.dataset && visiblePane.dataset.waiting === '1') {
                    spinner.show();
                }
                doAfterShow();
            }
        });
        panes.onMoveOut(function () {
            doFirst();
            initiatedBy = 'swipe';
        });

        // Identify and decorate the initially visible pane
        visiblePane = panes.masterPages[1];
        visiblePane.dataset.url = normalizeUrl(window.location.href);

        // Set a body class. Might be useful.
        $('body').addClass('has-swipe');

        doAfterShow();

        // Flush cache on expiry
        /*
        if (opts.expiryPeriod) {
            setInterval(function(){
                cache = {};
            }, parseInt(opts.expiryPeriod, 10));
        }
        */
   
        // Set a periodic height adjustment for the content area. Necessary to account for diverse heights of side-panes as they slide in, and dynamic page elements.
        setInterval(function(){
            updateHeight();
        }, 509); // Prime number, for good luck


        // Bind back/forward button behavior
        window.onpopstate = function (event) {
            var
                state = event.state,
                popId,
                dir;
            // Ignore inital popstate that some browsers fire on page load
            if (!state) { return; }
            initiatedBy = 'browser_history';
            popId = state.id ? state.id : -1;
            // Deduce the bac/fwd pop direction
            dir = popId < uid.get() ? -1 : 1;
            uid.set(popId);
            // Prevent a history stats from being pushed
            noHistoryPush = true;
            editionPos = state.editionPos;
            // Reveal the newly poped location
            gotoUrl(normalizeUrl(window.location.href), dir);
        };

        // Bind clicks
        bean.on(document, 'click', opts.linkSelector, function (e) {
            var
                url;
            if (!validateClick(e)) { return true; }
            e.preventDefault();
            url = normalizeUrl($(this).attr('href'));
            if (url === normalizeUrl(window.location.href)) {
                // Force a complete reload if the link is for the current page
                window.location.reload(true);
            }
            else {
                initiatedBy = 'link';
                gotoUrl(url);
            }
        });

        // Fix pane margins, so sidepanes come in at their top
        bean.on(window, 'scroll', function () {
            hiddenPaneMargin = Math.max( 0, $(window).scrollTop() - contentAreaTop );
            if( hiddenPaneMargin < visiblePaneMargin ) {
                // We've scrolled up over the offset; reset all margins and jump to topmost scroll
                $(panes.masterPages[(paneNow).mod(3)]).css(  'marginTop', 0);
                $(panes.masterPages[(paneNow+1).mod(3)]).css('marginTop', 0);
                $(panes.masterPages[(paneNow-1).mod(3)]).css('marginTop', 0);
                // And reset the scroll
                $(window).scrollTop( contentAreaTop );
                visiblePaneMargin = 0;
                hiddenPaneMargin = 0;
            }
            else {
                // We've scrolled down; push L/R sidepanes down to level of current pane
                $(panes.masterPages[(paneNow+1).mod(3)]).css('marginTop', hiddenPaneMargin);
                $(panes.masterPages[(paneNow-1).mod(3)]).css('marginTop', hiddenPaneMargin);
            }
        });

        bean.on(document, 'keydown', function (e) {
            initiatedBy = 'keyboard_arrow';
            switch(e.keyCode) {
                case 37: throttledSlideIn(-1);
                    break;
                case 39: throttledSlideIn(1);
                    break;
            }
        });

        // Return an API
        return api;

    };

    return module;

});