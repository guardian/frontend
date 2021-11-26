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
	// mobile: breakpoints['mobile'],
	mobileMedium: sourceBreakpoints['mobileMedium'],
	mobileLandscape: sourceBreakpoints['mobileLandscape'],
	phablet: sourceBreakpoints['phablet'],
	// tablet: breakpoints['tablet'],
	// desktop: breakpoints['desktop'],
	leftCol: sourceBreakpoints['leftCol'],
	// wide: breakpoints['wide'],
};
type Tweakpoint = keyof typeof tweakpoints;

// let currentBreakpoint: Breakpoint;
// let currentTweakpoint: Tweakpoint | Breakpoint;

// const getBreakpointFromTweakpoint = (point: Tweakpoint): Breakpoint => {
// 	switch (point) {
// 		case 'mobileMedium':
// 			return 'mobile';
// 		case 'phablet':
// 			return 'tablet';
// 		case 'leftCol':
// 			return 'desktop';
// 	}
// };

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
		// This is captured in tests
	});

	return (point ?? 'mobile') as Point<IncludeTweakpoints>;
};

const getBreakpoint = (width: number): Breakpoint => getPoint(false, width);

const getTweakpoint = (width: number): Tweakpoint | Breakpoint =>
	getPoint(true, width);

export { getBreakpoint, getTweakpoint };
