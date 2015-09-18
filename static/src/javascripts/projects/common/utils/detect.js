/*
    Module: detect/detect.js                                                                                                 8
    Description: Used to detect various characteristics of the current browsing environment.
                 layout mode, connection speed, battery level, etc...
*/
/*global DocumentTouch: true */

define([
    'common/utils/_',
    'common/utils/mediator',
    'common/utils/$'
], function (
    _,
    mediator,
    $
) {

    var supportsPushState,
        getUserAgent,
        pageVisibility = document.visibilityState ||
                         document.webkitVisibilityState ||
                         document.mozVisibilityState ||
                         document.msVisibilityState ||
                         'visible',
        // Ordered lists of breakpoints
        // These should match those defined in:
        //   stylesheets/_vars.scss
        //   common/app/layout/Breakpoint.scala
        breakpoints = [
            {
                name: 'mobile',
                isTweakpoint: false,
                width: 0
            },
            {
                name: 'mobileLandscape',
                isTweakpoint: true,
                width: 480
            },
            {
                name: 'phablet',
                isTweakpoint: true,
                width: 660
            },
            {
                name: 'tablet',
                isTweakpoint: false,
                width: 740
            },
            {
                name: 'desktop',
                isTweakpoint: false,
                width: 980
            },
            {
                name: 'leftCol',
                isTweakpoint: true,
                width: 1140
            },
            {
                name: 'wide',
                isTweakpoint: false,
                width: 1300
            }
        ],
        detect;

    /**
     *     Util: returns a function that:
     *     1. takes a callback function
     *     2. calls it if the window width has crossed any of our layout modes since the last call to this function
     *     Usage. Setup:
     *      var hasCrossedTheMagicLines = hasCrossedBreakpoint()
     *     then:
     *       hasCrossedTheMagicLines(function(){ do stuff })
     */
    function hasCrossedBreakpoint(includeTweakpoint) {
        var was = getBreakpoint(includeTweakpoint);
        return function (callback) {
            var is = getBreakpoint(includeTweakpoint);
            if (is !== was) {
                callback(is, was);
                was = is;
            }
        };
    }

    /**
     * @param performance - Object allows passing in of window.performance, for testing
     */
    function getPageSpeed(performance) {

        //https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html#sec-window.performance-attribute

        var startTime,
            endTime,
            totalTime,
            perf = performance || window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;

        if (perf && perf.timing) {
            startTime =  perf.timing.requestStart || perf.timing.fetchStart || perf.timing.navigationStart;
            endTime = perf.timing.responseEnd;

            if (startTime && endTime) {
                totalTime = endTime - startTime;
            }
        }

        return totalTime;
    }

    function isReload() {
        var perf = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;
        if (!!perf && !!perf.navigation) {
            return perf.navigation.type === perf.navigation.TYPE_RELOAD;
        } else {
            // We have no way of knowing if it was a reload on unsupported browsers.
            // I figure we could only possibly want to treat it as false in that case.
            return false;
        }
    }

    function isIOS() {
        return /(iPad|iPhone|iPod touch)/i.test(navigator.userAgent);
    }

    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    function isFireFoxOSApp() {
        return navigator.mozApps && !window.locationbar.visible;
    }

    function isFacebookApp() {
        return navigator.userAgent.indexOf('FBAN/') > -1;
    }

    function isTwitterApp() {
        // NB Android app is indistinguishable from Chrome: http://mobiforge.com/research-analysis/webviews-and-user-agent-strings
        return navigator.userAgent.indexOf('Twitter for iPhone') > -1;
    }

    function isTwitterReferral() {
        return /\.t\.co/.test(document.referrer);
    }

    function isFacebookReferral() {
        return /\.facebook\.com/.test(document.referrer);
    }

    function isGuardianReferral() {
        return /\.theguardian\.com/.test(document.referrer);
    }

    function socialContext() {
        var override = /socialContext=(facebook|twitter)/.exec(window.location.hash);

        if (override !== null) {
            return override[1];
        } else if (isFacebookApp() || isFacebookReferral()) {
            return 'facebook';
        } else if (isTwitterApp() || isTwitterReferral()) {
            return 'twitter';
        } else {
            return null;
        }
    }

    getUserAgent = (function () {
        var ua = navigator.userAgent, tem,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem =  /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\bOPR\/(\d+)/);
            if (tem !== null) { return 'Opera ' + tem[1]; }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) !== null) { M.splice(1, 1, tem[1]); }
        return {
            browser: M[0],
            version: M[1]
        };
    })();

    function getConnectionSpeed(performance, connection, reportUnknown) {

        connection = connection || navigator.connection || navigator.mozConnection || navigator.webkitConnection || {type: 'unknown'};

        var isMobileNetwork = connection.type === 3 // connection.CELL_2G
                || connection.type === 4 // connection.CELL_3G
                || /^[23]g$/.test(connection.type), // string value in new spec
            loadTime,
            speed;

        if (isMobileNetwork) {
            return 'low';
        }

        loadTime = getPageSpeed(performance);

        // Assume high speed for non supporting browsers
        speed = 'high';
        if (reportUnknown) {
            speed = 'unknown';
        }

        if (loadTime) {
            if (loadTime > 1000) { // One second
                speed = 'medium';
                if (loadTime > 3000) { // Three seconds
                    speed = 'low';
                }
            }
        }

        return speed;

    }

    function hasTouchScreen() {
        return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
    }

    function hasPushStateSupport() {
        if (supportsPushState !== undefined) {
            return supportsPushState;
        }
        if (window.history && history.pushState) {
            supportsPushState = true;
            // Android stock browser lies about its HistoryAPI support.
            if (window.navigator.userAgent.match(/Android/i)) {
                supportsPushState = !!window.navigator.userAgent.match(/(Chrome|Firefox)/i);
            }
        }
        return supportsPushState;
    }

    function getVideoFormatSupport() {
        //https://github.com/Modernizr/Modernizr/blob/master/feature-detects/video.js
        var elem = document.createElement('video'),
            types = {};

        try {
            if (elem.canPlayType) {
                types.mp4 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/, '');
                types.ogg = elem.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, '');
                types.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '');
            }
        } catch (e) {/**/}

        return types;
    }

    function getOrientation() {
        return (window.innerHeight > window.innerWidth) ? 'portrait' : 'landscape';
    }

    function getViewport() {
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0];

        return {
            width:  w.innerWidth  || e.clientWidth  || g.clientWidth,
            height: w.innerHeight || e.clientHeight || g.clientHeight
        };
    }

    /** TEMPORARY: I'm going to update lodash in a separate pull request. */
    function takeWhile(xs, f) {
        var acc = [],
            i,
            size = xs.length;

        for (i = 0; i < size; i++) {
            if (f(xs[i])) {
                acc.push(xs[i]);
            } else {
                break;
            }
        }

        return acc;
    }

    function getBreakpoint(includeTweakpoint) {
        var viewportWidth = detect.getViewport().width,
            index,
            breakpoint = _.last(takeWhile(breakpoints, function (bp) {
                return bp.width <= viewportWidth;
            })).name;
        if (!includeTweakpoint) {
            index = _.findIndex(breakpoints, function (b) {
                return b.name === breakpoint;
            });
            breakpoint = _(breakpoints)
                .first(index + 1)
                .findLast(function (b) {
                    return !b.isTweakpoint;
                })
                .valueOf()
                .name;
        }

        return breakpoint;
    }

    function isBreakpoint(criteria) {
        var c = _.defaults(
                criteria,
                {
                    min: _.first(breakpoints).name,
                    max: _.last(breakpoints).name
                }
            ),
            currentBreakpoint = getBreakpoint(true);
        return _(breakpoints)
            .rest(function (breakpoint) {
                return breakpoint.name !== c.min;
            })
            .initial(function (breakpoint) {
                return breakpoint.name !== c.max;
            })
            .pluck('name')
            .contains(currentBreakpoint);
    }

    // Page Visibility
    function initPageVisibility() {
        // Taken from http://stackoverflow.com/a/1060034
        var hidden = 'hidden';

        function onchange(evt) {
            var v = 'visible',
                h = 'hidden',
                evtMap = {
                    focus: v,
                    focusin: v,
                    pageshow: v,
                    blur: h,
                    focusout: h,
                    pagehide: h
                };

            evt = evt || window.event;
            if (evt.type in evtMap) {
                pageVisibility = evtMap[evt.type];
            } else {
                pageVisibility = this[hidden] ? 'hidden' : 'visible';
            }

            mediator.emit('modules:detect:pagevisibility:' + pageVisibility);
        }

        // Standards:
        if (hidden in document) {
            document.addEventListener('visibilitychange', onchange);
        } else if ((hidden = 'mozHidden') in document) {
            document.addEventListener('mozvisibilitychange', onchange);
        } else if ((hidden = 'webkitHidden') in document) {
            document.addEventListener('webkitvisibilitychange', onchange);
        } else if ((hidden = 'msHidden') in document) {
            document.addEventListener('msvisibilitychange', onchange);
        } else if ('onfocusin' in document) { // IE 9 and lower:
            document.onfocusin = document.onfocusout = onchange;
        } else { // All others:
            window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
        }
    }

    function pageVisible() {
        return pageVisibility === 'visible';
    }

    function hasWebSocket() {
        return 'WebSocket' in window;
    }

    function isModernBrowser() {
        return window.guardian.isModernBrowser;
    }

    function adblockInUse() {
        var sacrificialAd = createSacrificialAd();
        var contentBlocked = isHidden(sacrificialAd);
        sacrificialAd.remove();
        return contentBlocked;

        function isHidden(bonzoElement) {
            return bonzoElement.css('display') === 'none';
        }
    }

    /** Includes Firefox Adblock Plus users who whitelist the Guardian domain */
    function getFirefoxAdblockPlusInstalled() {
        var sacrificialAd = createSacrificialAd();
        var adUnitMozBinding = sacrificialAd.css('-moz-binding');
        if (adUnitMozBinding) {
            return adUnitMozBinding.match('elemhidehit') !== null;
        } else {
            return false;
        }
    }

    function createSacrificialAd() {
        var sacrificialAd = $.create('<div class="ad_unit" style="position: absolute; left: -9999px; height: 10px">&nbsp;</div>');
        sacrificialAd.appendTo(document.body);
        return sacrificialAd;
    }

    detect = {
        hasCrossedBreakpoint: hasCrossedBreakpoint,
        getConnectionSpeed: getConnectionSpeed,
        getVideoFormatSupport: getVideoFormatSupport,
        hasTouchScreen: hasTouchScreen,
        hasPushStateSupport: hasPushStateSupport,
        getOrientation: getOrientation,
        getBreakpoint: getBreakpoint,
        getViewport: getViewport,
        getUserAgent: getUserAgent,
        isIOS: isIOS,
        isAndroid: isAndroid,
        isFireFoxOSApp: isFireFoxOSApp,
        isFacebookApp: isFacebookApp,
        isTwitterApp: isTwitterApp,
        isFacebookReferral: isFacebookReferral,
        isTwitterReferral: isTwitterReferral,
        isGuardianReferral: isGuardianReferral,
        socialContext: socialContext,
        isBreakpoint: isBreakpoint,
        isReload:  isReload,
        initPageVisibility: initPageVisibility,
        pageVisible: pageVisible,
        hasWebSocket: hasWebSocket,
        getPageSpeed: getPageSpeed,
        breakpoints: breakpoints,
        isModernBrowser: isModernBrowser,
        adblockInUse: adblockInUse(),
        getFirefoxAdblockPlusInstalled: getFirefoxAdblockPlusInstalled
    };
    return detect;
});
