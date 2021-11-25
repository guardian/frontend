import { breakpoints as sourceBreakpoints } from '@guardian/source-foundations';
import config from './config';
import mediator from './mediator';

const breakpoints = {
	mobile: sourceBreakpoints['mobile'],
	tablet: sourceBreakpoints['tablet'],
	desktop: sourceBreakpoints['desktop'],
	wide: sourceBreakpoints['wide'],
};
type Breakpoint = keyof typeof breakpoints;

const tweakpoints = {
	mobileMedium: sourceBreakpoints['mobileMedium'],
	phablet: sourceBreakpoints['phablet'],
	leftCol: sourceBreakpoints['leftCol'],
};
type Tweakpoint = keyof typeof tweakpoints;

let currentBreakpoint: Breakpoint;
let currentTweakpoint: Tweakpoint;
let supportsPushState: boolean;
// #?: Consider dropping support for vendor-specific implementations
let pageVisibility = document.visibilityState;

const breakpointNames = Object.keys(breakpoints);

const findBreakpoint = (tweakpoint: Tweakpoint) => {
	let breakpointIndex = breakpointNames.indexOf(tweakpoint);
	let breakpoint = breakpoints[breakpointIndex];
	while (breakpointIndex >= 0 && breakpoint.isTweakpoint) {
		breakpointIndex -= 1;
		breakpoint = breakpoints[breakpointIndex];
	}
	return breakpoint.name;
};

const updateBreakpoint = (breakpoint) => {
	currentTweakpoint = breakpoint.name;

	if (breakpoint.isTweakpoint) {
		currentBreakpoint = findBreakpoint(currentTweakpoint);
	} else {
		currentBreakpoint = currentTweakpoint;
	}
};

// this function has a Breakpoint as context, so we can't use fat arrows
const onMatchingBreakpoint = function (mql) {
	if (mql && mql.matches) {
		updateBreakpoint(this);
	}
};

const updateBreakpoints = () => {
	// The implementation for browsers that don't support window.matchMedia is simpler,
	// but relies on (1) the resize event, (2) layout and (3) hidden generated content
	// on a pseudo-element
	const bodyStyle = window.getComputedStyle(document.body, '::after');
	const breakpointName = bodyStyle.content.substring(
		1,
		bodyStyle.content.length - 1,
	);
	const breakpointIndex = breakpointNames.indexOf(breakpointName);
	updateBreakpoint(breakpoints[breakpointIndex]);
};

const initMediaQueryListeners = () => {
	breakpoints.forEach((bp, index, bps) => {
		// We create mutually exclusive (min-width) and (max-width) media queries
		// to facilitate the breakpoint/tweakpoint logic.
		const minWidth = `(min-width: ${bp.width}px)`;

		bp.mql =
			index < bps.length - 1
				? window.matchMedia(
						`${minWidth} and (max-width: ${
							bps[index + 1].width - 1
						}px)`,
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

const initBreakpoints = () => {
	if ('matchMedia' in window) {
		initMediaQueryListeners();
	} else {
		updateBreakpoints();
		mediator.on('window:throttledResize', updateBreakpoints);
	}
};

const getViewport = () => {
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

const getBreakpoint = (includeTweakpoint) =>
	includeTweakpoint ? currentTweakpoint : currentBreakpoint;

const isBreakpoint = (criteria) => {
	const indexMin = criteria.min ? breakpointNames.indexOf(criteria.min) : 0;
	const indexMax = criteria.max
		? breakpointNames.indexOf(criteria.max)
		: breakpointNames.length - 1;
	const indexCur = breakpointNames.indexOf(
		currentTweakpoint || currentBreakpoint,
	);

	return indexMin <= indexCur && indexCur <= indexMax;
};

const hasCrossedBreakpoint = (includeTweakpoint) => {
	let was = getBreakpoint(includeTweakpoint);

	return (callback) => {
		const is = getBreakpoint(includeTweakpoint);

		if (is !== was) {
			callback(is, was);
			was = is;
		}
	};
};

// https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_js_api/checking_for_apple_pay_availability
const applePayApiAvailable = !!window.ApplePaySession;

const isIOS = () => /(iPad|iPhone|iPod touch)/i.test(navigator.userAgent);

const isAndroid = () => /Android/i.test(navigator.userAgent);

const hasTouchScreen = () =>
	'ontouchstart' in window ||
	(window.DocumentTouch && document instanceof window.DocumentTouch);

const hasPushStateSupport = () => {
	if (supportsPushState !== undefined) {
		return supportsPushState;
	}

	if (window.history && window.history.pushState) {
		supportsPushState = true;
		// Android stock browser lies about its HistoryAPI support.
		if (/Android/i.exec(window.navigator.userAgent)) {
			supportsPushState = !!/(Chrome|Firefox)/i.exec(
				window.navigator.userAgent,
			);
		}
	}

	return supportsPushState;
};

const initPageVisibility = () => {
	const onchange = (evt = window.event) => {
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
			pageVisibility = document && document.hidden ? 'hidden' : 'visible';
		}
		mediator.emit(`modules:detect:pagevisibility:${pageVisibility}`);
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

const pageVisible = () => pageVisibility === 'visible';

const isEnhanced = () => window.guardian.isEnhanced;

const getAdblockInUse = () => {
	if (config.get('isDotcomRendering', false)) {
		return Promise.resolve(false);
	}
	return new Promise((resolve) => {
		if (window.guardian.adBlockers.hasOwnProperty('active')) {
			// adblock detection has completed
			resolve(window.guardian.adBlockers.active);
		} else {
			// Push a listener for when the JS loads
			window.guardian.adBlockers.onDetect.push(resolve);
		}
	});
};

const adblockInUse = getAdblockInUse();

const getReferrer = () => document.referrer || '';

const getUserAgent = (() => {
	if (!navigator && !navigator.userAgent) {
		return '';
	}

	const ua = navigator.userAgent;
	let tem;
	let M =
		/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i.exec(
			ua,
		) || [];

	if (M && M[1] && /trident/i.test(M[1])) {
		tem = /\brv[ :]+(\d+)/g.exec(ua);

		if (tem && tem[1]) {
			return `IE ${tem[1]}`;
		}
	}

	if (M && M[1] === 'Chrome') {
		tem = /\bOPR\/(\d+)/.exec(ua);

		if (tem && tem[1]) {
			return `Opera ${tem[1]}`;
		}
	}

	M =
		M && M[2]
			? [M[1], M[2]]
			: [navigator.appName, navigator.appVersion, '-?'];
	tem = /version\/(\d+)/i.exec(ua);

	if (tem && tem[1]) {
		M.splice(1, 1, tem[1]);
	}

	return {
		browser: M[0],
		version: M[1],
	};
})();

const isGoogleProxy = () =>
	!!(
		navigator &&
		navigator.userAgent &&
		(navigator.userAgent.includes('Google Web Preview') ||
			navigator.userAgent.includes('googleweblight'))
	);

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
	isGoogleProxy,
};
