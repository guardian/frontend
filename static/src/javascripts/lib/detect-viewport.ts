import { breakpoints as sourceBreakpoints } from '@guardian/source-foundations';

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
const pageVisibility = document.visibilityState;

const breakpointNames = Object.keys(breakpoints);
