define([
    'common',
    'swipeview',
    'bean',
    'bonzo',
    'ajax',
    'modules/url'
], function(
    common,
    SwipeView,
    bean,
    bonzo,
    ajax,
    urls
) {

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

    var module = function (useropts) {

        var
            // general purpose do-nothing function
            noop = function () {},
            opts = common.extend(
                {
                    // Swipe container element
                    swipeContainer: undefined,

                    // Callback after a pane is loaded (including hidden panes); use for fancy js-managed rendering.
                    afterLoad: noop,

                    // Callback after a pane is made visible; use for analytics events, social buttons, etc.
                    afterShow: noop,

                    // CSS selector for clickable elements that should initiate a preload+swipe
                    clickSelector: '',

                    // The CSS selector for the element in each pane that should receive the ajax'd in content
                    contentSelector: '*:first-child',

                    // The config for the initial page.
                    config: {},

                    // Initial sequence
                    sequence: []
                },
                useropts
            ),

            swipeContainer = $(opts.swipeContainer),

            body = $('body'),
            throttle,
            canonicalLink = $('link[rel=canonical]'),
            config = {}, // the current pane's config
            contentArea = swipeContainer[0],
            contentAreaTop = swipeContainer.offset().top,
            sequencePos = -1,
            sequence = [],
            sequenceCache,
            sequenceLen = 0,
            initiatedBy = 'initial',
            initialUrl = urlAbsPath(window.location.href),
            noHistoryPush = false,
            visiblePane = $('#preloads-inner > #preload-1', contentArea)[0],
            panes,
            paneNow = 1,
            paneThen = 1,
            pendingHTML = '<div class="preload-msg">Loading page...</div>',
            visiblePaneMargin = 0,
            hiddenPaneMargin = 0;


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
                el.contentArea = el.contentArea || el.querySelector(opts.contentSelector);
                el.contentArea.innerHTML = pendingHTML;

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
            el.contentArea.innerHTML = html;
            opts.afterLoad(el);
        }

        // Make the contentArea height equal to the visiblePane height. (We view the latter through the former.)
        function updateHeight() {
            var height = $('*:first-child', visiblePane).offset().height; // NB visiblePane has height:100% set by swipeview, so we look within it
            if (height) {
                $(contentArea).css('height', height + visiblePaneMargin + 'px');
            }
        }

        // Fire post load actions
        function doAfterShow (context) {
            var url,
                div;

            updateHeight();
            throttle = false;

            if (initiatedBy === 'initial') {
                loadSidePanes();
                return;
            }

            url = context.dataset.url;
            setSequencePos(url);

            config = (sequenceCache[url] || {}).config || {};

            // Add swipe info & api to the config
            config.swipe = {
                context: context,
                initiatedBy: initiatedBy,
                api: api
            };

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

            // Fire the main aftershow callback
            opts.afterShow(config);
        }

        function setSequencePos(url) {
            sequencePos = getSequencePos(urlAbsPath(url));
        }

        function getSequencePos(url) {
            url = sequenceCache[urlAbsPath(url)];
            return url ? url.pos : -1;
        }

        function getSequenceUrl(pos) {
            return pos > -1 && pos < sequenceLen ? sequence[pos].url : sequence[0].url;
        }

        function setSequence(arr) {
            var len = arr.length,
                pos,
                i;

            if (len >= 3) {
                sequence = arr;
                sequenceLen = len;
                sequenceCache = {};

                for (i = 0; i < len; i += 1) {
                    arr[i].pos = i;
                    sequenceCache[arr[i].url] = arr[i];
                    //window.console.log(i + " " + arr[i].url);
                }
                setSequencePos(window.location.href);
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
            // Cases where we've got next/prev overrides in the current page's data
            else if (config.nextUrl && dir === 1) {
                return config.nextUrl;
            }
            else if (config.prevUrl && dir === -1) {
                return config.prevUrl;
            }
            // Cases where we've got an sequence position already
            else if (sequencePos > -1) {
                return getSequenceUrl(mod(sequencePos + dir, sequenceLen));
            }
            else{
                // We're displaying a non-sequence page; have current-sequence-page to the left, next-sequence-page to right
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

        // MAIN exec

        // Set up the DOM structure
        prepareDOM();

        // Set the initial sequence
        setSequence(opts.sequence);

        // Cache the config of the initial page, in case the 2nd swipe is backwards to this page.
        sequenceCache[initialUrl].config = opts.config;

        // SwipeView init
        panes = new SwipeView(contentArea, {});

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

        // Identify and decorate the initially visible pane
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
        if (opts.clickSelector){
            bean.on(document, 'click', opts.clickSelector, function (e) {
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
        }, 509); // Prime number, for good luck

        // Return an API
        return api;

    };

    return module;

});
