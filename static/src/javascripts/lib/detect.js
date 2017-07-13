// @flow

import mediator from 'lib/mediator';

type BreakpointName =
    | 'mobile'
    | 'mobileMedium'
    | 'mobileLandscape'
    | 'phablet'
    | 'tablet'
    | 'desktop'
    | 'leftCol'
    | 'wide';

type Breakpoint = {
    name: BreakpointName,
    isTweakpoint: boolean,
    listener: void | ((mql: MediaQueryList) => void),
    mql: ?MediaQueryList,
    width: number,
};

// These should match those defined in:
//   stylesheets/_vars.scss
//   common/app/layout/Breakpoint.scala
const breakpoints: Array<Breakpoint> = [
    {
        name: 'mobile',
        isTweakpoint: false,
        width: 0,
    },
    {
        name: 'mobileMedium',
        isTweakpoint: true,
        width: 375,
    },
    {
        name: 'mobileLandscape',
        isTweakpoint: true,
        width: 480,
    },
    {
        name: 'phablet',
        isTweakpoint: true,
        width: 660,
    },
    {
        name: 'tablet',
        isTweakpoint: false,
        width: 740,
    },
    {
        name: 'desktop',
        isTweakpoint: false,
        width: 980,
    },
    {
        name: 'leftCol',
        isTweakpoint: true,
        width: 1140,
    },
    {
        name: 'wide',
        isTweakpoint: false,
        width: 1300,
    },
];

let currentBreakpoint: BreakpointName;
let currentTweakpoint: BreakpointName;
let supportsPushState: boolean;
let pageVisibility: string =
    document.visibilityState ||
    document.webkitVisibilityState ||
    document.mozVisibilityState ||
    document.msVisibilityState ||
    'visible';

const breakpointNames: Array<BreakpointName> = breakpoints.map(
    breakpoint => breakpoint.name
);

const init = (win: window): void => {
    if ('matchMedia' in win) {
        initMediaQueryListeners(win);
    } else {
        updateBreakpoints.call(win);
        mediator.on('window:throttledResize', updateBreakpoints);
    }
};

const findBreakpoint = (tweakpoint: BreakpointName): BreakpointName => {
    let breakpointIndex = breakpointNames.indexOf(tweakpoint);
    let breakpoint = breakpoints[breakpointIndex];
    while (breakpointIndex >= 0 && breakpoint.isTweakpoint) {
        breakpointIndex -= 1;
        breakpoint = breakpoints[breakpointIndex];
    }
    return breakpoint.name;
};

const updateBreakpoint = (breakpoint: Object): void => {
    if (breakpoint.isTweakpoint) {
        currentTweakpoint = breakpoint.name;
        currentBreakpoint = findBreakpoint(currentTweakpoint);
    } else {
        currentTweakpoint = breakpoint.name;
        currentBreakpoint = currentTweakpoint;
    }
};

const onMatchingBreakpoint = mql => {
    if (mql && mql.matches) {
        updateBreakpoint(this);
    }
};

const initMediaQueryListeners = win => {
    breakpoints.forEach((bp, index, bps) => {
        // We create mutually exclusive (min-width) and (max-width) media queries
        // to facilitate the breakpoint/tweakpoint logic.
        bp.mql =
            index < bps.length - 1
                ? win.matchMedia(
                      `(min-width:${bp.width}px) and (max-width:${bps[index + 1]
                          .width - 1}px)`
                  )
                : win.matchMedia(`(min-width:${bp.width}px)`);
        bp.listener = onMatchingBreakpoint.bind(bp);

        if (bp.mql) {
            bp.mql.addListener(bp.listener);
        }

        bp.listener(bp.mql);
    });
};

const updateBreakpoints = (): void => {
    // The implementation for browsers that don't support window.matchMedia is simpler,
    // but relies on (1) the resize event, (2) layout and (3) hidden generated content
    // on a pseudo-element
    const bodyStyle = window.getComputedStyle(document.body, '::after');
    const breakpointName = bodyStyle.content.substring(
        1,
        bodyStyle.content.length - 1
    );
    const breakpointIndex = breakpointNames.indexOf(breakpointName);
    updateBreakpoint(breakpoints[breakpointIndex]);
};

const getViewport = (): { width: number, height: number } => {
    if (
        !window.innerWidth ||
        !(document && document.body && document.body.clientWidth)
    ) {
        return {
            height: 0,
            width: 0,
        };
    }

    return {
        width: window.innerWidth || document.body.clientWidth,
        height: window.innerHeight || document.body.clientHeight,
    };
};

const hasCrossedBreakpoint = (includeTweakpoint: boolean): Function => {
    let was = getBreakpoint(includeTweakpoint);

    return function(callback: Function): void {
        const is = getBreakpoint(includeTweakpoint);

        if (is !== was) {
            callback(is, was);
            was = is;
        }
    };
};

const isIOS = () => /(iPad|iPhone|iPod touch)/i.test(navigator.userAgent);

const isAndroid = () => /Android/i.test(navigator.userAgent);

const isFireFoxOSApp = () => navigator.mozApps && !window.locationbar.visible;

const isFacebookApp = () => navigator.userAgent.includes('FBAN/');

const isTwitterApp = () => navigator.userAgent.includes('Twitter for iPhone');

const isTwitterReferral = () => /\.t\.co/.test(document.referrer);

const isFacebookReferral = () => /\.facebook\.com/.test(document.referrer);

const isGuardianReferral = () => /\.theguardian\.com/.test(document.referrer);

const socialContext = () => {
    const override = /socialContext=(facebook|twitter)/.exec(
        window.location.hash
    );

    if (override !== null) {
        return override[1];
    } else if (isFacebookApp() || isFacebookReferral()) {
        return 'facebook';
    } else if (isTwitterApp() || isTwitterReferral()) {
        return 'twitter';
    }

    return null;
};

const hasTouchScreen = () =>
    'ontouchstart' in window ||
    (window.DocumentTouch && document instanceof window.DocumentTouch);

const hasPushStateSupport = () => {
    if (supportsPushState !== undefined) {
        return supportsPushState;
    }

    if (window.history && history.pushState) {
        supportsPushState = true;
        // Android stock browser lies about its HistoryAPI support.
        if (window.navigator.userAgent.match(/Android/i)) {
            supportsPushState = !!window.navigator.userAgent.match(
                /(Chrome|Firefox)/i
            );
        }
    }

    return supportsPushState;
};

const getVideoFormatSupport = () => {
    const elem = document.createElement('video');
    const types = {};

    try {
        if (elem.canPlayType) {
            types.mp4 = elem
                .canPlayType('video/mp4; codecs="avc1.42E01E"')
                .replace(/^no$/, '');
            types.ogg = elem
                .canPlayType('video/ogg; codecs="theora"')
                .replace(/^no$/, '');
            types.webm = elem
                .canPlayType('video/webm; codecs="vp8, vorbis"')
                .replace(/^no$/, '');
        }
    } catch (e) {}

    return types;
};

const getOrientation = (): 'portrait' | 'landscape' =>
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

const getBreakpoint = (includeTweakpoint?: boolean): BreakpointName =>
    includeTweakpoint ? currentTweakpoint : currentBreakpoint;

const isBreakpoint = (criteria: Object): boolean => {
    const indexMin = criteria.min ? breakpointNames.indexOf(criteria.min) : 0;
    const indexMax = criteria.max
        ? breakpointNames.indexOf(criteria.max)
        : breakpointNames.length - 1;
    const indexCur = breakpointNames.indexOf(
        currentTweakpoint || currentBreakpoint
    );

    return indexMin <= indexCur && indexCur <= indexMax;
};

const initPageVisibility = (): void => {
    const onchange = (evt: Event = window.event) => {
        const v = 'visible';
        const evtMap = {
            focus: v,
            focusin: v,
            pageshow: v,
            blur: 'hidden',
            focusout: 'hidden',
            pagehide: 'hidden',
        };

        if (evt.type in evtMap) {
            pageVisibility = evtMap[evt.type];
        } else {
            pageVisibility = window && window.hidden ? 'hidden' : 'visible';
        }
    };

    // Standards:
    if ('hidden' in document) {
        document.addEventListener('visibilitychange', onchange);
    } else if ('msHidden' in document) {
        document.addEventListener('msvisibilitychange', onchange);
    } else if ('onfocusin' in document) {
        // IE 9 and lower:
        window.onfocusout = onchange;
        window.onfocusin = onchange;
    } else {
        // All others:
        window.onpageshow = onchange;
        window.onpagehide = onchange;
        window.onfocus = onchange;
        window.onblur = onchange;
    }
};

const pageVisible = (): boolean => pageVisibility === 'visible';

const hasWebSocket = (): boolean => 'WebSocket' in window;

const isEnhanced = (): boolean => window.guardian.isEnhanced;

const adblockInUse: Promise<?boolean> = new Promise(resolve => {
    if (window.guardian.adBlockers.hasOwnProperty('active')) {
        // adblock detection has completed
        resolve(window.guardian.adBlockers.active);
    } else {
        // Push a listener for when the JS loads
        window.guardian.adBlockers.onDetect.push(resolve);
    }
});

const getReferrer = (): string => document.referrer || '';

const getUserAgent:
    | string
    | { browser: string, version: string } = (function():
    | string
    | { browser: string, version: string } {
    if (!navigator && !navigator.userAgent) {
        return '';
    }

    const ua: string = navigator.userAgent;
    let tem: Array<string>;
    let M: Array<string> =
        ua.match(
            /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
        ) || [];

    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return `IE ${tem[1] || ''}`;
    }

    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR\/(\d+)/);

        if (tem !== null) {
            return `Opera ${tem[1]}`;
        }
    }

    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    tem = ua && ua.match(/version\/(\d+)/i);

    if (tem !== null) {
        M.splice(1, 1, tem[1]);
    }

    return {
        browser: M[0],
        version: M[1],
    };
})();

init(window);

export {
    hasCrossedBreakpoint,
    getVideoFormatSupport,
    hasTouchScreen,
    hasPushStateSupport,
    getOrientation,
    getBreakpoint,
    getUserAgent,
    getViewport,
    isIOS,
    isAndroid,
    isFireFoxOSApp,
    isFacebookApp,
    isTwitterApp,
    isFacebookReferral,
    isTwitterReferral,
    isGuardianReferral,
    socialContext,
    isBreakpoint,
    initPageVisibility,
    pageVisible,
    hasWebSocket,
    breakpoints,
    isEnhanced,
    adblockInUse,
    getReferrer,
    init,
};
