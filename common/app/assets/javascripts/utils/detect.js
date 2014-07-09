/*
    Module: detect/detect.js                                                                                                 8
    Description: Used to detect various characteristics of the current browsing environment.
                 layout mode, connection speed, battery level, etc...
*/
/*jshint strict: false */
/*global DocumentTouch: true */

define([
    'common/modules/userPrefs',
    'common/utils/mediator'
], function (
    userPrefs,
    mediator
) {

    var supportsPushState,
        pageVisibility = document.visibilityState ||
                         document.webkitVisibilityState ||
                         document.mozVisibilityState ||
                         document.msVisibilityState ||
                         'visible';

    /**
     *     Util: returns a function that:
     *     1. takes a callback function
     *     2. calls it if the window width has crossed any of our layout modes since the last call to this function
     *     Usage. Setup:
     *      var hasCrossedTheMagicLines = hasCrossedBreakpoint()
     *     then:
     *       hasCrossedTheMagicLines(function(){ do stuff })
     */
    function hasCrossedBreakpoint(){
        var was = getBreakpoint();
        return function(callback){
            var is = getBreakpoint();
            if ( is !== was ) {
                was = is;
                callback(is);
            }
        };
    }

    /**
     * @param performance - Object allows passing in of window.performance, for testing
     */
    function getPageSpeed(performance) {

        //https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html#sec-window.performance-attribute

        var start_time,
            end_time,
            total_time;

        var perf = performance || window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance;

        if (perf && perf.timing) {
            start_time =  perf.timing.requestStart || perf.timing.fetchStart || perf.timing.navigationStart;
            end_time = perf.timing.responseEnd;

            if (start_time && end_time) {
                total_time = end_time - start_time;
            }
        }

        return total_time;
    }

    function getConnectionSpeed(performance, connection, reportUnknown) {

        connection = connection || navigator.connection || navigator.mozConnection || navigator.webkitConnection || {type: 'unknown'};

        var isMobileNetwork = connection.type === 3 // connection.CELL_2G
                  || connection.type === 4 // connection.CELL_3G
                  || /^[23]g$/.test( connection.type ); // string value in new spec

        if (isMobileNetwork) {
            return 'low';
        }

        var loadTime = getPageSpeed(performance);

        // Assume high speed for non supporting browsers
        var speed = 'high';
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
        var format = 'woff';
            ua = ua.toLowerCase();

        if (ua.indexOf('android') > -1) {
            format = 'ttf';
        }
        return format;
    }

    function hasTouchScreen() {
        return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
    }

    function hasPushStateSupport() {
        if(supportsPushState !== undefined) {
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
        var elem = document.createElement('video');
        var types = {};

        try {
            if (!!elem.canPlayType) {
                types.mp4 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');
                types.ogg = elem.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,'');
                types.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }
        } catch(e){}

        return types;
    }

    function getOrientation() {
        return (window.innerHeight > window.innerWidth) ? 'portrait' : 'landscape';
    }

    function getBreakpoint() {
        // default to mobile
        var breakpoint = (document.body && window.getComputedStyle(document.body, ':after').getPropertyValue('content')) || 'mobile';
        // firefox seems to wrap the value in quotes
        return breakpoint.replace(/^"([^"]*)"$/, '$1');
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
        }
        // IE 9 and lower:
        else if ('onfocusin' in document) {
            document.onfocusin = document.onfocusout = onchange;
        }
        // All others:
        else {
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
        initPageVisibility: initPageVisibility,
        pageVisible: pageVisible,
        hasWebSocket: hasWebSocket,
        getPageSpeed: getPageSpeed
    };

});
