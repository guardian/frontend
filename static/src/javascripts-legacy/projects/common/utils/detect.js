/*
    Module: detect/detect.js                                                                                                 8
    Description: Used to detect various characteristics of the current browsing environment.
                 layout mode, connection speed, battery level, etc...
*/
/*global DocumentTouch: true */

define([
    'common/utils/mediator',
    'lodash/functions/memoize',
    'Promise'
], function (
    mediator,
    memoize,
    Promise
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
                name: 'mobileMedium',
                isTweakpoint: true,
                width: 375
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

    var breakpointNames = breakpoints.map(getBreakpointName);

    var currentBreakpoint;
    var currentTweakpoint;

    init(window);

    function init(win) {
        if ('matchMedia' in win) {
            initMediaQueryListeners(win);
        } else {
            updateBreakpoints.call(win);
            mediator.on('window:throttledResize', updateBreakpoints);
        }
    }

    function initMediaQueryListeners(win) {
        breakpoints
            .forEach(function (bp, index, bps) {
                // We create mutually exclusive (min-width) and (max-width) media queries
                // to facilitate the breakpoint/tweakpoint logic.
                bp.mql = index < bps.length - 1 ?
                    win.matchMedia('(min-width:'+ bp.width +'px) and (max-width:'+ (bps[index+1].width - 1) +'px)') :
                    win.matchMedia('(min-width:'+ bp.width +'px)');
                bp.listener = onMatchingBreakpoint.bind(bp);
                bp.mql.addListener(bp.listener);
                bp.listener(bp.mql);
            });
    }

    function onMatchingBreakpoint(mql) {
        if (mql.matches) {
            updateBreakpoint(this);
        }
    }

    function updateBreakpoint(breakpoint) {
        if (breakpoint.isTweakpoint) {
            currentTweakpoint = breakpoint.name;
            currentBreakpoint = findBreakpoint(currentTweakpoint);
        } else {
            currentBreakpoint = currentTweakpoint = breakpoint.name;
        }
    }

    function findBreakpoint(tweakpoint) {
        var breakpointIndex = breakpointNames.indexOf(tweakpoint);
        var breakpoint = breakpoints[breakpointIndex];
        while (breakpointIndex >= 0 && breakpoint.isTweakpoint) {
            breakpointIndex -= 1;
            breakpoint = breakpoints[breakpointIndex];
        }
        return breakpoint.name;
    }

    function updateBreakpoints() {
        // The implementation for browsers that don't support window.matchMedia is simpler,
        // but relies on (1) the resize event, (2) layout and (3) hidden generated content
        // on a pseudo-element
        var bodyStyle = window.getComputedStyle(document.body, '::after');
        var breakpointName = bodyStyle.content.substring(1, bodyStyle.content.length - 1);
        var breakpointIndex = breakpointNames.indexOf(breakpointName);
        updateBreakpoint(breakpoints[breakpointIndex]);
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
        tem = ua.match(/version\/(\d+)/i);
        if (tem !== null) { M.splice(1, 1, tem[1]); }
        return {
            browser: M[0],
            version: M[1]
        };
    })();

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

    function getBreakpointName(breakpoint) {
        return breakpoint.name;
    }

    function getBreakpoint(includeTweakpoint) {
        return includeTweakpoint ? currentTweakpoint : currentBreakpoint;
    }

    /**
     *     Usage:
     *     detect.isBreakpoint({min: 'tablet', max: 'leftCol'}) // Will return true for tablet, desktop, leftCol
     *     detect.isBreakpoint({min: 'tablet'}) // Will return true for tablet, desktop, leftCol, wide
     *     detect.isBreakpoint({max: 'tablet'}) // Will return true for mobile, mobileLandscape, tablet and phablet
     *
     *
     */
    function isBreakpoint(criteria) {
        var indexMin = criteria.min ? breakpointNames.indexOf(criteria.min) : 0;
        var indexMax = criteria.max ? breakpointNames.indexOf(criteria.max) : breakpointNames.length - 1;
        var indexCur = breakpointNames.indexOf(currentTweakpoint || currentBreakpoint);
        return indexMin <= indexCur && indexCur <= indexMax;
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
        } else if (('mozHidden') in document) {
            document.addEventListener('mozvisibilitychange', onchange);
        } else if (('webkitHidden') in document) {
            document.addEventListener('webkitvisibilitychange', onchange);
        } else if (('msHidden') in document) {
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

    function isEnhanced() {
        return window.guardian.isEnhanced;
    }

    var adblockInUse = new Promise(function (resolve) {
        if (window.guardian.adBlockers.hasOwnProperty('active')) {
            // adblock detection has completed
            resolve(window.guardian.adBlockers.active);
        } else {
            // Push a listener for when the JS loads
            window.guardian.adBlockers.onDetect.push(resolve);
        }
    });

    function getReferrer() {
        return document.referrer || '';
    }

    detect = {
        hasCrossedBreakpoint: hasCrossedBreakpoint,
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
        breakpoints: breakpoints,
        isEnhanced: isEnhanced,
        adblockInUse: adblockInUse,
        getReferrer: getReferrer,
        init: init
    };
    return detect;
});
