// @flow

import config from 'lib/config';
import mediator from 'lib/mediator';

declare class MediaQueryListEvent extends Event {
    matches: boolean;
    media: string;
}

type MediaQueryList = {
    matches: boolean,
    media: string,
    onchange: (callback: (event: MediaQueryListEvent) => void) => void,
    addListener: (callback: (event: MediaQueryListEvent) => void) => void,
    removeListener: (callback: (event: MediaQueryListEvent) => void) => void,
};

type BreakpointName =
    | 'mobile'
    | 'mobileMedium'
    | 'mobileLandscape'
    | 'phablet'
    | 'tablet'
    | 'desktop'
    | 'leftCol'
    | 'wide';

export type Breakpoint = {
    name: BreakpointName,
    isTweakpoint: boolean,
    listener?: (mql: MediaQueryList) => void,
    mql?: MediaQueryList,
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
// #?: Consider dropping support for vendor-specific implementations
let pageVisibility =
    document.visibilityState ||
    // $FlowFixMe
    document.webkitVisibilityState ||
    // $FlowFixMe
    document.mozVisibilityState ||
    // $FlowFixMe
    document.msVisibilityState ||
    'visible';

const breakpointNames: Array<BreakpointName> = breakpoints.map(
    breakpoint => breakpoint.name
);

const findBreakpoint = (tweakpoint: BreakpointName): BreakpointName => {
    let breakpointIndex = breakpointNames.indexOf(tweakpoint);
    let breakpoint = breakpoints[breakpointIndex];
    while (breakpointIndex >= 0 && breakpoint.isTweakpoint) {
        breakpointIndex -= 1;
        breakpoint = breakpoints[breakpointIndex];
    }
    return breakpoint.name;
};

const updateBreakpoint = (breakpoint: Breakpoint): void => {
    currentTweakpoint = breakpoint.name;

    if (breakpoint.isTweakpoint) {
        currentBreakpoint = findBreakpoint(currentTweakpoint);
    } else {
        currentBreakpoint = currentTweakpoint;
    }
};

// this function has a Breakpoint as context, so we can't use fat arrows
const onMatchingBreakpoint = function(
    mql: MediaQueryListEvent | MediaQueryList
): void {
    if (mql && mql.matches) {
        updateBreakpoint(this);
    }
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

const initMediaQueryListeners = (): void => {
    breakpoints.forEach((bp, index, bps) => {
        // We create mutually exclusive (min-width) and (max-width) media queries
        // to facilitate the breakpoint/tweakpoint logic.
        const minWidth = `(min-width: ${bp.width}px)`;

        bp.mql =
            index < bps.length - 1
                ? window.matchMedia(
                      `${minWidth} and (max-width: ${bps[index + 1].width -
                          1}px)`
                  )
                : window.matchMedia(minWidth);

        bp.listener = onMatchingBreakpoint.bind(bp);

        if (bp.mql) {
            bp.mql.addListener(bp.listener);
        }

        if (bp.mql && bp.listener) {
            bp.listener(bp.mql);
        }
    });
};

const initBreakpoints = (): void => {
    if ('matchMedia' in window) {
        initMediaQueryListeners();
    } else {
        updateBreakpoints();
        mediator.on('window:throttledResize', updateBreakpoints);
    }
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

const hasCrossedBreakpoint = (includeTweakpoint: boolean): Function => {
    let was = getBreakpoint(includeTweakpoint);

    return (callback: Function): void => {
        const is = getBreakpoint(includeTweakpoint);

        if (is !== was) {
            callback(is, was);
            was = is;
        }
    };
};

// https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_js_api/checking_for_apple_pay_availability
const applePayApiAvailable = !!window.ApplePaySession;

const isIOS = (): boolean =>
    /(iPad|iPhone|iPod touch)/i.test(navigator.userAgent);

const isAndroid = (): boolean => /Android/i.test(navigator.userAgent);

const hasTouchScreen = (): boolean =>
    'ontouchstart' in window ||
    (window.DocumentTouch && document instanceof window.DocumentTouch);

const hasPushStateSupport = (): boolean => {
    if (supportsPushState !== undefined) {
        return supportsPushState;
    }

    if (window.history && window.history.pushState) {
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

const isEnhanced = (): boolean => window.guardian.isEnhanced;

const getAdblockInUse = () => {
    if (config.get('isDotcomRendering', false)) {
        return Promise.resolve(false);
    }
    return new Promise(resolve => {
        if (window.guardian.adBlockers.hasOwnProperty('active')) {
            // adblock detection has completed
            resolve(window.guardian.adBlockers.active);
        } else {
            // Push a listener for when the JS loads
            window.guardian.adBlockers.onDetect.push(resolve);
        }
    });
};

const adblockInUse: Promise<?boolean> = getAdblockInUse();

const getReferrer = (): string => document.referrer || '';

const getUserAgent = ((): string | { browser: string, version: string } => {
    if (!navigator && !navigator.userAgent) {
        return '';
    }

    const ua: string = navigator.userAgent;
    let tem: ?Array<any>;
    let M: ?Array<any> =
        ua.match(
            /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
        ) || [];

    if (M && M[1] && /trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua);

        if (tem && tem[1]) {
            return `IE ${tem[1]}`;
        }
    }

    if (M && M[1] === 'Chrome') {
        tem = ua.match(/\bOPR\/(\d+)/);

        if (tem && tem[1]) {
            return `Opera ${tem[1]}`;
        }
    }

    M =
        M && M[2]
            ? [M[1], M[2]]
            : [navigator.appName, navigator.appVersion, '-?'];
    tem = ua.match(/version\/(\d+)/i);

    if (tem && tem[1]) {
        M.splice(1, 1, tem[1]);
    }

    return {
        browser: M[0],
        version: M[1],
    };
})();

initBreakpoints();

export {
    hasCrossedBreakpoint,
    hasTouchScreen,
    hasPushStateSupport,
    getBreakpoint,
    getUserAgent,
    getViewport,
    isIOS,
    applePayApiAvailable,
    isAndroid,
    isBreakpoint,
    initPageVisibility,
    pageVisible,
    breakpoints,
    isEnhanced,
    adblockInUse,
    getReferrer,
};
