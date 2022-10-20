import { breakpoints as sourceBreakpoints } from '@guardian/source-foundations';
import type { Breakpoint as SourceBreakpoint } from '@guardian/source-foundations';
import { getViewport } from './detect-viewport';

const breakpoints = {
	mobile: sourceBreakpoints['mobile'],
	tablet: sourceBreakpoints['tablet'],
	desktop: sourceBreakpoints['desktop'],
	wide: sourceBreakpoints['wide'],
};
type Breakpoint = keyof typeof breakpoints;
type Tweakpoint = keyof typeof tweakpoints;

const isSourceBreakpoint = (point: string): point is SourceBreakpoint =>
	point in sourceBreakpoints;

const isBreakpoint = (point: SourceBreakpoint): point is Breakpoint =>
	point in breakpoints;

const tweakpoints = {
	mobileMedium: sourceBreakpoints['mobileMedium'],
	mobileLandscape: sourceBreakpoints['mobileLandscape'],
	phablet: sourceBreakpoints['phablet'],
	leftCol: sourceBreakpoints['leftCol'],
};

const breakpointNames: SourceBreakpoint[] = [
	'wide',
	'leftCol',
	'desktop',
	'tablet',
	'phablet',
	'mobileLandscape',
	'mobileMedium',
	'mobile',
];

type Point<IncludeTweakpoints extends boolean> =
	IncludeTweakpoints extends false ? Breakpoint : SourceBreakpoint;

let currentBreakpoint: Breakpoint | undefined;
let currentTweakpoint: SourceBreakpoint | undefined;

// Get the closest breakpoint to a given width
const getPoint = <IncludeTweakpoints extends boolean>(
	includeTweakpoint: IncludeTweakpoints,
	width: number,
): Point<IncludeTweakpoints> => {
	const point = breakpointNames.find((point) => {
		if (isBreakpoint(point)) {
			return width >= breakpoints[point];
		} else if (includeTweakpoint) {
			return width >= tweakpoints[point];
		}
		return false;
	});

	// This assertion is captured in tests
	return (point ?? 'mobile') as Point<IncludeTweakpoints>;
};

const getBreakpoint = (width: number): Breakpoint => getPoint(false, width);

const getTweakpoint = (width: number): SourceBreakpoint =>
	getPoint(true, width);

const getCurrentBreakpoint = (): Breakpoint =>
	currentBreakpoint ?? getBreakpoint(getViewport().width);

const getCurrentTweakpoint = (): SourceBreakpoint =>
	currentTweakpoint ?? getTweakpoint(getViewport().width);

// create a media query string from a min and max breakpoint
const getMediaQuery = ({
	min,
	max,
}: {
	min?: SourceBreakpoint | number;
	max?: SourceBreakpoint | number;
}): string => {
	const minWidth = min
		? typeof min === 'number'
			? min
			: sourceBreakpoints[min]
		: null;
	const maxWidth = max
		? typeof max === 'number'
			? max
			: sourceBreakpoints[max] - 1
		: null;

	const minQuery = minWidth ? `(min-width: ${minWidth}px)` : null;
	const maxQuery = maxWidth ? `(max-width: ${maxWidth}px)` : null;

	return [minQuery, maxQuery].filter(Boolean).join(' and ');
};

const updateBreakpoint = (breakpoint: SourceBreakpoint): void => {
	currentTweakpoint = breakpoint;

	currentBreakpoint = getPoint(false, sourceBreakpoints[currentTweakpoint]);
};

/**
 * We use media queries to keep track of what breakpoint we're in. This is to avoid
 * using getViewPort, which utilizes window.innerWidth which causes a reflow.
 */
const initMediaQueryListeners = () => {
	Object.entries(sourceBreakpoints).forEach(([bp], index, bps) => {
		if (isSourceBreakpoint(bp)) {
			// noUncheckedIndexedAccess is not enabled
			const nextBp = bps[index + 1] as
				| [SourceBreakpoint, number]
				| undefined;

			const mql = window.matchMedia(
				getMediaQuery({ min: bp, max: nextBp ? nextBp[1] : undefined }),
			);

			const listener = (mql: MediaQueryListEvent | MediaQueryList) =>
				mql.matches && updateBreakpoint(bp);

			mql.addEventListener('change', listener);

			listener(mql);
		}
	});
};

const matchesBreakpoints = ({
	min,
	max,
}: {
	min?: SourceBreakpoint;
	max?: SourceBreakpoint;
}): boolean => window.matchMedia(getMediaQuery({ min, max })).matches;

type CrossedBreakpointCallback = (
	is: SourceBreakpoint,
	was: SourceBreakpoint,
) => unknown;

const hasCrossedBreakpoint = (
	includeTweakpoint: boolean,
): ((cb: CrossedBreakpointCallback) => unknown) => {
	let was = includeTweakpoint
		? getCurrentTweakpoint()
		: getCurrentBreakpoint();

	return (callback: CrossedBreakpointCallback) => {
		const is = includeTweakpoint
			? getCurrentTweakpoint()
			: getCurrentBreakpoint();

		if (is !== was) {
			callback(is, was);
			was = is;
		}
	};
};

initMediaQueryListeners();

const _ = {
	updateBreakpoint,
};

export {
	getBreakpoint,
	getTweakpoint,
	getCurrentBreakpoint,
	getCurrentTweakpoint,
	matchesBreakpoints,
	hasCrossedBreakpoint,
	_,
};
