/*
    Module: detect/detect.js                                                                                                 8
    Description: Used to detect various characteristics of the current browsing environment.
                 layout mode, connection speed, battery level, etc...
*/
/*jshint strict: false */
/*global DocumentTouch: true */

define([
    'common/utils/_',
    'common/utils/mediator'
], function (
    _,
    mediator
) {

    var supportsPushState,
        pageVisibility = document.visibilityState ||
                         document.webkitVisibilityState ||
                         document.mozVisibilityState ||
                         document.msVisibilityState ||
                         'visible',
        // Ordered lists of breakpoints
        // These should match those defined in stylesheets/_vars.scss
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
                isTweakpoint: true
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
        ];

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

    function isIOS() {
        return /(iPad|iPhone|iPod touch);.*CPU.*OS 7_\d/i.test(navigator.userAgent);
    }

    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    function isFireFoxOSApp() {
        return navigator.mozApps && !window.locationbar.visible;
    }

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

    function getFontFormatSupport(ua) {
        ua = ua.toLowerCase();
        var browserSupportsWoff2 = false,
            // for now only Chrome 36+ supports WOFF 2.0.
            // Opera/Chromium also support it but their share on theguardian.com is around 0.5%
            woff2browsers = /Chrome\/([0-9]+)/i,
            chromeVersion;

        if (woff2browsers.test(ua)) {
            chromeVersion = parseInt(woff2browsers.exec(ua)[1], 10);

            if (chromeVersion >= 36) {
                browserSupportsWoff2 = true;
            }
        }

        if (browserSupportsWoff2) {
            return 'woff2';
        }

        if (ua.indexOf('android') > -1) {
            return 'ttf';
        }

        return 'woff';
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
            if (!!elem.canPlayType) {
                types.mp4 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/, '');
                types.ogg = elem.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, '');
                types.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '');
            }
        } catch (e) {}

        return types;
    }

    function getOrientation() {
        return (window.innerHeight > window.innerWidth) ? 'portrait' : 'landscape';
    }

    function getBreakpoint(includeTweakpoint) {
        // default to mobile
        var breakpoint = (
                window.getComputedStyle
                    ? window.getComputedStyle(document.body, ':after').getPropertyValue('content')
                    : document.getElementsByTagName('head')[0].currentStyle.fontFamily
            ).replace(/['",]/g, '') || 'mobile',
            index;

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
                    pagehide:h
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

    return {
        hasCrossedBreakpoint: hasCrossedBreakpoint,
        getConnectionSpeed: getConnectionSpeed,
        getFontFormatSupport: getFontFormatSupport,
        getVideoFormatSupport: getVideoFormatSupport,
        hasTouchScreen: hasTouchScreen,
        hasPushStateSupport: hasPushStateSupport,
        getOrientation: getOrientation,
        getBreakpoint: getBreakpoint,
        isIOS: isIOS,
        isAndroid: isAndroid,
        isFireFoxOSApp: isFireFoxOSApp,
        isBreakpoint: isBreakpoint,
        initPageVisibility: initPageVisibility,
        pageVisible: pageVisible,
        hasWebSocket: hasWebSocket,
        getPageSpeed: getPageSpeed,
        breakpoints: breakpoints
    };

});
