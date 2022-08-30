import { breakpoints } from '@guardian/source-foundations';

type BreakpointKeys = keyof typeof breakpoints;
type BreakpointSizes = {
	breakpoint: BreakpointKeys;
	width: typeof breakpoints[BreakpointKeys];
};

const breakpointsToTest: Array<keyof typeof breakpoints> = [
	// 'mobile',
	// 'tablet',
	'desktop',
	// 'wide',
];

const breakpointSizes: BreakpointSizes[] = breakpointsToTest.map((b) => ({
	breakpoint: b,
	width: breakpoints[b],
}));

export { breakpointSizes as breakpoints };
