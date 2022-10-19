import { breakpoints as sourceBreakpoints } from '@guardian/source-foundations';

const breakpoints = {
	mobile: sourceBreakpoints['mobile'],
	tablet: sourceBreakpoints['tablet'],
	desktop: sourceBreakpoints['desktop'],
	wide: sourceBreakpoints['wide'],
};
type Breakpoint = keyof typeof breakpoints;

const isBreakpoint = (point: Breakpoint | Tweakpoint): point is Breakpoint =>
	point in breakpoints;

const tweakpoints = {
	mobileMedium: sourceBreakpoints['mobileMedium'],
	mobileLandscape: sourceBreakpoints['mobileLandscape'],
	phablet: sourceBreakpoints['phablet'],
	leftCol: sourceBreakpoints['leftCol'],
};
type Tweakpoint = keyof typeof tweakpoints;

type Point<IncludeTweakpoints extends boolean> =
	IncludeTweakpoints extends false ? Breakpoint : Breakpoint | Tweakpoint;

const getPoint = <IncludeTweakpoints extends boolean>(
	includeTweakpoint: IncludeTweakpoints,
	width: number,
): Point<IncludeTweakpoints> => {
	const sizes: Array<Breakpoint | Tweakpoint> = [
		'wide',
		'leftCol',
		'desktop',
		'tablet',
		'phablet',
		'mobileLandscape',
		'mobileMedium',
		'mobile',
	];

	const point = sizes.find((point) => {
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

type Viewport = { width: number; height: number };

/**
 * Expects `window.innerWidth` or `document.body.clientWidth` to return
 * a value
 * @returns
 */
const getViewport = (): Viewport => {
	return {
		width: window.innerWidth || document.body.clientWidth || 0,
		height: window.innerHeight || document.body.clientHeight || 0,
	};
};

const getBreakpoint = (width: number): Breakpoint => getPoint(false, width);

const getTweakpoint = (width: number): Point<true> => getPoint(true, width);

const getCurrentBreakpoint = (): Breakpoint =>
	getBreakpoint(getViewport().width);

const getCurrentTweakpoint = (): Point<true> =>
	getTweakpoint(getViewport().width);

const getMediaQuery = ({
	min,
	max,
}: {
	min?: Point<true>;
	max?: Point<true>;
}): string => {
	const minWidth = min ? sourceBreakpoints[min] : 0;
	const maxWidth = max ? sourceBreakpoints[max] - 1 : 999999;

	return `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`;
};
const matchesBreakpoints = ({
	min,
	max,
}: {
	min?: Point<true>;
	max?: Point<true>;
}): boolean => window.matchMedia(getMediaQuery({ min, max })).matches;

type BreakpointCallback = (is: Point<true>, was: Point<true>) => unknown;

const hasCrossedBreakpoint = (
	includeTweakpoint: boolean,
): ((cb: BreakpointCallback) => unknown) => {
	let was = includeTweakpoint
		? getCurrentTweakpoint()
		: getCurrentBreakpoint();

	return (callback: BreakpointCallback) => {
		const is = includeTweakpoint
			? getCurrentTweakpoint()
			: getCurrentBreakpoint();

		if (is !== was) {
			callback(is, was);
			was = is;
		}
	};
};
export {
	getBreakpoint,
	getTweakpoint,
	getViewport,
	Viewport,
	getCurrentBreakpoint,
	getCurrentTweakpoint,
	matchesBreakpoints,
	hasCrossedBreakpoint,
};
