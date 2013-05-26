/*
    Module: detect/detect.js                                                                                                 8
    Description: Used to detect various characteristics of the current browsing environment.
                 layout mode, connection speed, battery level, etc...
*/
/*jshint strict: false */
/*global DocumentTouch: true */

define(['modules/userPrefs'], function (userPrefs) {

    var BASE_WIDTH     = 600,
        MEDIAN_WIDTH   = 900,
        EXTENDED_WIDTH = 1280,
        mobileOS,
        supportsPushState;
    
    /**
     * @param Number width Allow passing in of width, for testing (innerWidth read only
     * in firefox
     */
    function getLayoutMode(width) {
        var mode = "mobile";

        width = (width !== undefined) ? width : (typeof document.body.clientWidth === 'number' ? document.body.clientWidth : window.innerWidth);

        if (width >= BASE_WIDTH) {
            mode = "tablet";
        }

        if (width >= MEDIAN_WIDTH) {
            mode = "desktop";
        }

        if (width >= EXTENDED_WIDTH) {
            mode = "extended";
        }

        return mode;
    }

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
        var was = getLayoutMode();
        return function(callback){
            var is = getLayoutMode();
            if ( is !== was ) {
                was = is;
                callback(is);
            }
        };
    }

    function getPixelRatio() {
        return window.devicePixelRatio;
    }

    /**
     * @param Object performance Allow passing in of window.performance, for testing
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
        var speed = "high";
        if (reportUnknown) {
            speed = "unknown";
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

    // http://modernizr.com/download/#-svg
    function hasSvgSupport() {
        var ns = {'svg': 'http://www.w3.org/2000/svg'};
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
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

    function getMobileOS() {
        var ua,
            uaindex;

        if(mobileOS !== undefined) {
            return mobileOS;
        }

        ua = navigator.userAgent;

        if (ua.match(/iPad/i) || ua.match(/iPhone/i)) {
            uaindex = ua.indexOf('OS ');
            mobileOS = {
                name: 'iOS',
                version: uaindex > -1 ? parseFloat(ua.substr(uaindex + 3, 3).replace('_', '.'), 10) : -1
            };
        } else if (ua.match(/Android/i)) {
            uaindex = ua.indexOf('Android ');
            mobileOS = {
                name: 'Android',
                version: uaindex > -1 ? parseFloat(ua.substr(uaindex + 8, 3), 10) : -1
            };
        } else {
            mobileOS = false;
        }
        return mobileOS;
    }

    function canSwipe() {
        var os;
        if (!hasPushStateSupport()) {
            return false;
        }
        os = getMobileOS();
        // iOS
        if (os.name === 'iOS' && os.version >= 6) {
            // This'll be true only for iPhone5:
            return window.devicePixelRatio >= 2 && screen.availHeight === 548;
        }
        /*
        // Android
        if (os.name === 'Android' && os.version >= 4) {
            return true;
        }
        */
        return false;
    }

    return {
        getLayoutMode: getLayoutMode,
        getMobileOS: getMobileOS,
        canSwipe: canSwipe,
        hasCrossedBreakpoint: hasCrossedBreakpoint,
        getPixelRatio: getPixelRatio,
        getConnectionSpeed: getConnectionSpeed,
        getFontFormatSupport: getFontFormatSupport,
        getVideoFormatSupport: getVideoFormatSupport,
        hasSvgSupport: hasSvgSupport,
        hasTouchScreen: hasTouchScreen,
        hasPushStateSupport: hasPushStateSupport
    };

});
