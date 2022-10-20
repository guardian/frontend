import { breakpoints } from '@guardian/source-foundations';
import { hasCrossedBreakpoint } from 'lib/detect-breakpoint';
import { mediator } from '../../../../lib/mediator';
import type { Advert } from './Advert';
import { breakpointNameToAttribute } from './breakpoint-name-to-attribute';
import { dfpEnv } from './dfp-env';
import { refreshAdvert } from './load-advert';

/**
 * Invokes the callback if a breakpoint has been crossed since last invocation
 */
const hasBreakpointChanged = hasCrossedBreakpoint(true);

/**
 * Array of breakpoint names
 */
const breakpointNames = Object.keys(breakpoints);

// TODO: reset advert flags
const refresh = (currentBreakpoint: string, previousBreakpoint: string) => {
	const getBreakpointIndex = (
		breakpoint: string,
		slotBreakpoints: string[],
	) => {
		const validBreakpointNames = breakpointNames
			.slice(0, breakpointNames.indexOf(breakpoint) + 1)
			.map(breakpointNameToAttribute);
		return Math.max(
			...slotBreakpoints.map((slotBreakpoint) =>
				validBreakpointNames.lastIndexOf(slotBreakpoint),
			),
		);
	};

	const shouldRefresh = (advert: Advert) => {
		// get the slot breakpoints
		const slotBreakpoints = Object.keys(advert.sizes);
		// find the currently matching breakpoint
		const currentSlotBreakpoint = getBreakpointIndex(
			currentBreakpoint,
			slotBreakpoints,
		);
		// find the previously matching breakpoint
		const previousSlotBreakpoint = getBreakpointIndex(
			previousBreakpoint,
			slotBreakpoints,
		);
		return (
			currentSlotBreakpoint !== -1 &&
			currentSlotBreakpoint !== previousSlotBreakpoint
		);
	};

	// only refresh if the slot needs to
	const advertsToRefresh = dfpEnv.advertsToRefresh.filter(shouldRefresh);
	advertsToRefresh.forEach(refreshAdvert);
};

const windowResize = () => {
	// refresh on resize
	hasBreakpointChanged(refresh);
};

export const refreshOnResize = (): void => {
	mediator.on('window:throttledResize', windowResize);
};
