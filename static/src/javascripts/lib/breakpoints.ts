import type { Breakpoint as BreakpointName } from '@guardian/source-foundations';
import { mediator } from './mediator';

type Breakpoint = {
	name: BreakpointName;
	isTweakpoint: boolean;
	width: number;
	listener?: (mql: MediaQueryListEvent | MediaQueryList) => void;
	mql?: MediaQueryList;
};

const breakpoints: Breakpoint[] = [
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

let currentBreakpoint: BreakpointName | undefined;
let currentTweakpoint: BreakpointName | undefined;

const isBreakpointName = (name: string): name is BreakpointName =>
	breakpoints.some((breakpoint) => name === breakpoint.name);

const breakpointNames: BreakpointName[] = breakpoints.map(
	(breakpoint) => breakpoint.name,
);

const findBreakpoint = (tweakpoint: BreakpointName) => {
	let breakpointIndex = breakpointNames.indexOf(tweakpoint);
	let breakpoint = breakpoints[breakpointIndex];
	while (breakpointIndex >= 0 && breakpoint.isTweakpoint) {
		breakpointIndex -= 1;
		breakpoint = breakpoints[breakpointIndex];
	}
	return breakpoint.name;
};

const updateBreakpoint = (breakpoint: Breakpoint) => {
	currentTweakpoint = breakpoint.name;

	if (breakpoint.isTweakpoint) {
		currentBreakpoint = findBreakpoint(currentTweakpoint);
	} else {
		currentBreakpoint = currentTweakpoint;
	}
};

// this function has a Breakpoint as context, so we can't use fat arrows
const onMatchingBreakpoint = function (
	this: Breakpoint,
	mql: MediaQueryListEvent | MediaQueryList,
) {
	if (mql.matches) {
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
	if (isBreakpointName(breakpointName)) {
		const breakpointIndex = breakpointNames.indexOf(breakpointName);
		updateBreakpoint(breakpoints[breakpointIndex]);
	}
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

		bp.mql.addEventListener('change', bp.listener);

		bp.listener(bp.mql);
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

const getBreakpoint = (
	includeTweakpoint?: boolean,
): BreakpointName | undefined =>
	includeTweakpoint ? currentTweakpoint : currentBreakpoint;

const isBreakpoint = (criteria: {
	min?: BreakpointName;
	max?: BreakpointName;
}): boolean => {
	const indexMin = criteria.min ? breakpointNames.indexOf(criteria.min) : 0;
	const indexMax = criteria.max
		? breakpointNames.indexOf(criteria.max)
		: breakpointNames.length - 1;
	const current = currentTweakpoint ?? currentBreakpoint;
	if (current) {
		const indexCur = breakpointNames.indexOf(current);

		return indexMin <= indexCur && indexCur <= indexMax;
	}

	return false;
};

const hasCrossedBreakpoint = (
	includeTweakpoint?: boolean,
): ((
	callback: (
		is: BreakpointName | undefined,
		was: BreakpointName | undefined,
	) => void,
) => void) => {
	let was = getBreakpoint(includeTweakpoint);

	return (callback) => {
		const is = getBreakpoint(includeTweakpoint);

		if (is !== was) {
			callback(is, was);
			was = is;
		}
	};
};

initBreakpoints();

export { hasCrossedBreakpoint, getBreakpoint, isBreakpoint, breakpoints };
