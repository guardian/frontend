import { breakpoints } from '@guardian/source-foundations';

type BreakpointKeys = Pick<
	typeof breakpoints,
	'mobile' | 'tablet' | 'desktop' | 'wide'
>;

type BreakpointSizes = {
	breakpoint: keyof BreakpointKeys;
	width: typeof breakpoints[keyof BreakpointKeys];
	height: number;
};

const breakpointsToTest: Array<keyof BreakpointKeys> = [
	'mobile',
	'tablet',
	'desktop',
	'wide',
];

const heights = {
	mobile: 600,
	tablet: 1100,
	desktop: 1100,
	wide: 1100,
} as const;

const breakpointSizes: BreakpointSizes[] = breakpointsToTest.map((b) => ({
	breakpoint: b,
	width: breakpoints[b],
	height: heights[b],
}));

export { breakpointSizes as breakpoints };
