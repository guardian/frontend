define([
    'common',
    'modules/userPrefs',
    'modules/pageconfig',
    'swipeview',
    'bean',
    'bonzo',
    'ajax',
    'modules/url'
], function(
    common,
    userPrefs,
    pageConfig,
    SwipeView,
    bean,
    bonzo,
    ajax,
    urls
){
    var noop = function () {},
        body,
        bodyPartSelector = '.parts__body',
        canonicalLink,
        clickSelector,
        contentAreaTop,
        height,
        hiddenPaneMargin = 0,
        initiatedBy = 'initial',
        initialUrl,
        noHistoryPush = false,
        panes,
        paneNow = 1,
        paneThen = 1,
        pendingHTML = '<div class="preload-msg">Loading page...<div class="is-updating"></div></div>',
        referrer,
        referrerPageName,
        sequencePos = -1,
        sequence = [],
        sequenceCache,
        sequenceLen = 0,
        swipeContainer = '#preloads',
        swipeContainerEl = document.querySelector(swipeContainer),
        throttle,
        visiblePane,
        visiblePaneMargin = 0;

    function $(selector, context) {
        if (typeof selector === 'string'){
            context = context || document;
            return bonzo(context.querySelectorAll(selector));
        } else {
            return bonzo(selector);
        }
    }

    function urlAbsPath(url) {
        var a = document.createElement('a');
        a.href = url;
        a = a.pathname + a.search;
        a = a.indexOf('/') === 0 ? a : '/' + a; // because IE doesn't return a leading '/'
        return a;
    }

    function mod(x, m) {
        return ((x % m) + m) % m;
    }

    function mod3(x) {
        return mod(x, 3);
    }

    function prepareDOM() {
        var pages = document.querySelector('#preloads'),
            page0 = pages.querySelector('#preload-0 .parts'),
            page1 = pages.querySelector('#preload-1 .parts'),
            page2 = pages.querySelector('#preload-2 .parts'),
            head  = page1.querySelector('.parts__head'),
            foot  = page1.querySelector('.parts__foot'),
            initialBodyHtml = '<div class="parts__body">' + pendingHTML + '</div>';

        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = "#preload-0{left: -100%} #preload-1{left:0%} #preload-2{left: 100%}";
        document.body.appendChild(css);

        bonzo(page0).append(head.cloneNode(true));
        bonzo(page0).append(bonzo.create(initialBodyHtml));
        bonzo(page0).append(foot.cloneNode(true));

        bonzo(page2).append(head.cloneNode(true));
        bonzo(page2).append(bonzo.create(initialBodyHtml));
        bonzo(page2).append(foot.cloneNode(true));
    }

    function load(o) {
        var
            url = o.url,
            el = o.container,
            callback = o.callback || noop,
            frag;

        if (url && el) {
            el.dataset = el.dataset || {};
            el.dataset.url = url;
            
            // Associate a contenet area with this pane, if not already done so
            el.bodyPart = el.bodyPart || el.querySelector(bodyPartSelector);
            el.bodyPart.innerHTML = pendingHTML;

            // Ask the cache
            frag = sequenceCache[url];

            // Is cached ?
            if (frag && frag.html) {
                populate(el, frag.html);
                common.mediator.emit('module:swipenav:pane:loaded', el);
                callback();
            }
            else {
                el.pending = true;
                ajax({
                    url: url,
                    method: 'get',
                    type: 'jsonp',
                    jsonpCallbackName: 'swipePreload',
                    success: function (frag) {
                        var html;

                        delete el.pending;
                        frag   = frag || {};
                        html   = frag.html || '<div class="preload-msg">Oops. This page might be broken?</div>';

                        sequenceCache[url] = sequenceCache[url] || {};
                        sequenceCache[url].html = html;
                        sequenceCache[url].config = frag.config || {};

                        if (el.dataset.url === url) {
                            populate(el, html);
                            common.mediator.emit('module:swipenav:pane:loaded', el);
                            callback();
                        }
                    }
                });
            }
        }
    }

    function populate(el, html) {
        el.bodyPart.innerHTML = html;
    }

    // Make the swipeContainer height equal to the visiblePane height. (We view the latter through the former.)
    function updateHeight() {
        var h = $('*:first-child', visiblePane).offset().height; // NB visiblePane has height:100% set by swipeview, so we look within it
        if (height !== h) {
            height = h;
            $(swipeContainer).css('height', height + visiblePaneMargin + 'px');
        }
    }

    // Fire post load actions
    function doAfterShow (context) {
        var url,
            div,
            config;

        throttle = false;

        if (initiatedBy === 'initial') {
            loadSidePanes();
            return;
        }

        url = context.dataset.url;
        setSequencePos(url);

        config = (sequenceCache[url] || {}).config || {};

        if (config.page && config.page.webTitle) {
            div = document.createElement('div');
            div.innerHTML = config.page.webTitle; // resolves html entities
            document.title = div.firstChild.nodeValue;
        }

        // Update canonical tag using pushed location
        canonicalLink.attr('href', window.location.href);

        if (!noHistoryPush) {
            urls.pushUrl({}, document.title, url);
        }
        noHistoryPush = false;

        config.swipe = {
            initiatedBy: initiatedBy,
            referrer: referrer,
            referrerPageName: referrerPageName,
        };

        common.mediator.emit('page:ready', pageConfig(config), context);

        referrer = window.location.href;
        referrerPageName = config.page.analyticsName;

        if(clickSelector && initiatedBy === 'click') {
            loadSequence(function(sequence){
                setSequence(sequence);
                loadSidePanes();
            });
        } else {
            loadSidePanes();
        }

    }

    function setSequencePos(url) {
        sequencePos = getSequencePos(url);
    }

    function getSequencePos(url) {
        url = sequenceCache[url];
        return url ? url.pos : -1;
    }

    function getSequenceUrl(pos) {
        return pos > -1 && pos < sequenceLen ? sequence[pos].url : sequence[0].url;
    }

    function loadSequence(callback) {
        var section = window.location.pathname.match(/^\/[^\/]+/);
        ajax({
            url: '/front-trails' + (section ? section[0] : ''),
            type: 'jsonp',
            success: function (json) {
                if (json.stories && json.stories.length >= 3) {
                    callback(json.stories);
                }
            }
        });
    }

    function setSequence(arr) {
        var len = arr.length,
            url = window.location.pathname,
            sectionUrl = url.match(/^\/[^\/]*/)[0],
            s,
            i;

        if (len) {

            // Make sure url is the first in the sequence
            if(arr[0].url !== url) {
                arr.unshift({url: url});
                len += 1;
            }

            // Add the "section" page as the last position in the sequence
            arr.push({url: sectionUrl});
            len += 1;

            sequence = [];
            sequenceLen = 0;
            sequenceCache = {};

            for (i = 0; i < len; i += 1) {
                s = arr[i];
                // dedupe, while also creating a lookup obj
                if(!sequenceCache[s.url]) {
                    s.pos = i;
                    sequenceCache[s.url] = s;
                    sequence.push(s);
                    sequenceLen += 1;
                    window.console.log(i + " " + s.url);
                }
            }
            setSequencePos(window.location.pathname);
        }
    }

    function gotoUrl(url, dir) {
        var pos = getSequencePos(url);
        if (typeof dir === 'undefined') {
            dir = pos > -1 && pos < sequencePos ? -1 : 1;
        }
        preparePane({
            url: url,
            dir: dir,
            slideIn: true
        });
    }

    function getAdjacentUrl(dir) {
        // dir = 1   => the right pane
        // dir = -1  => the left pane

        if (dir === 0) {
            return getSequenceUrl(sequencePos);
        }
        else if (sequencePos > -1) {
            return getSequenceUrl(mod(sequencePos + dir, sequenceLen));
        }
        else{
            return getSequenceUrl((dir === 1 ? 1 : 0), sequenceLen);
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

    function gotoSequencePage(pos) {
        var dir;
        if (pos !== sequencePos && pos < sequenceLen) {
            dir = pos < sequencePos ? -1 : 1;
            sequencePos = pos;
            gotoUrl(getSequenceUrl(pos), dir);
        }
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

        url = urlAbsPath(url);

        el = panes.masterPages[mod3(paneNow + dir)];
        
        // Only load if not already loaded into this pane
        if (el.dataset.url !== url) {
            load({
                url: url,
                container: el,
                callback: function () {
                    // before slideInPane, confirm that this pane hasn't had its url changed since the request was made
                    if (doSlideIn && el.dataset.url === url) {
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
        switch(dir) {
            case 1:
                panes.next();
                break;
            case -1:
                panes.prev();
                break;
            default:
                common.mediator.emit('module:swipenav:pane:loaded', visiblePane);
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

    var pushDownSidepanes = common.debounce(function(){
        hiddenPaneMargin = Math.max( 0, body.scrollTop() - contentAreaTop );

        if( hiddenPaneMargin < visiblePaneMargin ) {
            // We've scrolled up over the offset; reset all margins and jump to topmost scroll
            $(panes.masterPages[mod3(paneNow)]).css(  'marginTop', 0);
            $(panes.masterPages[mod3(paneNow+1)]).css('marginTop', 0);
            $(panes.masterPages[mod3(paneNow-1)]).css('marginTop', 0);
            // And reset the scroll
            body.scrollTop( contentAreaTop );
            visiblePaneMargin = 0;
            hiddenPaneMargin = 0;
        }
        else {
            // We've scrolled down; push L/R sidepanes down to level of current pane
            $(panes.masterPages[mod3(paneNow+1)]).css('marginTop', hiddenPaneMargin);
            $(panes.masterPages[mod3(paneNow-1)]).css('marginTop', hiddenPaneMargin);
        }
    }, 250);

    // This'll be the public api
    var api = {
        setSequence: setSequence,

        loadSidePanes: loadSidePanes,

        getSequence: function(){
            return sequence;
        },

        gotoSequencePage: function(pos, type){
            initiatedBy = type ? type.toString() : 'position';
            gotoSequencePage(pos, type);
        },

        gotoUrl: function(url, type){
            initiatedBy = type ? type.toString() : 'click';
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

    function start() {

        // SwipeView
        panes = new SwipeView(swipeContainer, {});

        updateHeight();

        panes.onFlip(function () {
            paneNow = mod3(panes.pageIndex+1);
            if (paneThen !== paneNow) {
                // shuffle down the pane we've just left
                $(panes.masterPages[paneThen]).css('marginTop', hiddenPaneMargin);
                visiblePaneMargin = hiddenPaneMargin;

                paneThen = paneNow;
                visiblePane = panes.masterPages[paneNow];

                common.mediator.emit('module:swipenav:pane:loaded', visiblePane);
            }
        });

        panes.onMoveOut(function () {
            initiatedBy = 'swipe';
        });

        // Identify and annotate the initially visible pane
        visiblePane = panes.masterPages[1];
        visiblePane.dataset.url = initialUrl;

        // Set a body class. Might be useful.
        body.addClass('has-swipe');

        // Render panes that come into view, and that are not still loading
        common.mediator.on('module:swipenav:pane:loaded', function(el){
            if(el === visiblePane && !el.pending) {
                doAfterShow(el);
            }
        });

        // Fire the first pane-loaded event
        common.mediator.emit('module:swipenav:pane:loaded', visiblePane);

        // BINDINGS

        // Bind clicks to cause swipe-in transitions
        if (clickSelector){
            bean.on(document, 'click', clickSelector, function (e) {
                var url;

                if (!validateClick(e)) { return true; }

                e.preventDefault();

                url = urlAbsPath($(this).attr('href'));

                if (url === urlAbsPath(window.location.href)) {
                    // Force a complete reload if the link is for the current page
                    window.location.reload(true);
                }
                else {
                    initiatedBy = 'click';
                    gotoUrl(url);
                }
            });
        }

        // Fix pane margins, so sidepanes come in at their top
        bean.on(window, 'scroll', function () {
            pushDownSidepanes();
        });

        // Bind left/right keyboard keys. Might clash with other stuff (galleries...)
        bean.on(document, 'keydown', function (e) {
            initiatedBy = 'swipe';
            switch(e.keyCode) {
                case 37: throttledSlideIn(-1);
                    break;
                case 39: throttledSlideIn(1);
                    break;
            }
        });

        // Bind back/forward button behavior
        window.onpopstate = function (event) {
            var state = event.state,
                popId,
                dir;

            // Ignore inital popstate that some browsers fire on page load
            if (!state) { return; }

            initiatedBy = 'browser_history';

            // Prevent a history state from being pushed as a result of calling gotoUrl
            noHistoryPush = true;

            // Reveal the newly poped location
            gotoUrl(urlAbsPath(window.location.href));
        };

        // Set a periodic height adjustment for the content area. Necessary to account for diverse heights of side-panes as they slide in, and dynamic page elements.
        setInterval(function(){
            updateHeight();
        }, 2003); // Prime number, for good luck
    }

    var initialise = function(config) {
        loadSequence(function(sequence){
            var loc = window.location.href;

            initialUrl       = urlAbsPath(loc);
            referrer         = loc;
            referrerPageName = config.page.analyticsName;
            body             = $('body');
            canonicalLink    = $('link[rel=canonical]');
            contentAreaTop   = $(swipeContainerEl).offset().top;
            visiblePane      = $('#preloads-inner > #preload-1', swipeContainerEl)[0];

            if (config.switches.swipeNavOnClick || userPrefs.isOn('swipe-nav-on-click')) {
                clickSelector = 'a:not(.control)';
            }

            // Set up the DOM structure
            prepareDOM();

            // Set the initial sequence
            setSequence(sequence);

            // Cache the config of the initial page, in case the 2nd swipe is backwards to this page.
            if (sequenceCache[initialUrl]) {
                sequenceCache[initialUrl].config = config;
            }

            start();

            return api;
        });
    };

    return initialise;
});
