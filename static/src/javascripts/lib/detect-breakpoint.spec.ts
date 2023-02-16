import type { Breakpoint } from '@guardian/source-foundations';
import { breakpoints } from '@guardian/source-foundations';
import {
	getBreakpoint,
	getCurrentBreakpoint,
	getCurrentTweakpoint,
	getTweakpoint,
	matchesBreakpoints,
} from './detect-breakpoint';

/**
 * The new `detect-viewport.ts` should have methods that return the exact same
 * values you would get from using `detect.js`
 */
describe('Same API as detect', () => {
	describe('getBreakpoint', () => {
		const widths: Array<[number, Breakpoint]> = [
			[260, 'mobile'],
			[320, 'mobile'],

			[479, 'mobile'],
			[480, 'mobile'],
			[481, 'mobile'],
			[739, 'mobile'],

			[740, 'tablet'],
			[979, 'tablet'],

			[980, 'desktop'],
			[1140, 'desktop'],

			[1300, 'wide'],
			[1560, 'wide'],
		];

		it.each(widths)(
			'For %f, gets the correct breakpoint: %s',
			(width, breakpoint) => {
				expect(getBreakpoint(width)).toEqual(breakpoint);
			},
		);
	});

	describe('getTweakpoint', () => {
		const tweakpointsWidths: Array<[number, Breakpoint]> = [
			[260, 'mobile'],
			[320, 'mobile'],
			[374, 'mobile'],

			[375, 'mobileMedium'],
			[479, 'mobileMedium'],

			[480, 'mobileLandscape'],
			[659, 'mobileLandscape'],

			[660, 'phablet'],
			[739, 'phablet'],

			[740, 'tablet'],
			[979, 'tablet'],

			[980, 'desktop'],

			[1140, 'leftCol'],

			[1300, 'wide'],
			[1560, 'wide'],
		];

		it.each(tweakpointsWidths)(
			'For %f, gets the correct tweakpoint: %s',
			(width, tweakpoint) => {
				expect(getTweakpoint(width)).toEqual(tweakpoint);
			},
		);
	});
});

describe('getCurrentBreakpoint', () => {
	const widths: Array<[number, Breakpoint]> = [
		[260, 'mobile'],
		[320, 'mobile'],

		[479, 'mobile'],
		[480, 'mobile'],
		[481, 'mobile'],
		[739, 'mobile'],

		[740, 'tablet'],
		[979, 'tablet'],

		[980, 'desktop'],
		[1140, 'desktop'],

		[1300, 'wide'],
		[1560, 'wide'],
	];

	it.each(widths)(
		'For %f, gets the correct breakpoint: %s',
		(width, breakpoint) => {
			window.innerWidth = width;
			expect(getCurrentBreakpoint()).toEqual(breakpoint);
		},
	);
});

describe('getCurrentTweakpoint', () => {
	const tweakpointsWidths: Array<[number, Breakpoint]> = [
		[260, 'mobile'],
		[320, 'mobile'],
		[374, 'mobile'],

		[375, 'mobileMedium'],
		[479, 'mobileMedium'],

		[480, 'mobileLandscape'],
		[659, 'mobileLandscape'],

		[660, 'phablet'],
		[739, 'phablet'],

		[740, 'tablet'],
		[979, 'tablet'],

		[980, 'desktop'],

		[1140, 'leftCol'],

		[1300, 'wide'],
		[1560, 'wide'],
	];

	it.each(tweakpointsWidths)(
		'For %f, gets the correct tweakpoint: %s',
		(width, tweakpoint) => {
			window.innerWidth = width;

			expect(getCurrentTweakpoint()).toEqual(tweakpoint);
		},
	);
});

describe('matchesBreakpoint', () => {
	const betweenBreakpoints: Array<[Breakpoint | null, Breakpoint | null]> = [
		['mobile', 'mobileMedium'],
		['mobile', null],
		[null, 'desktop'],
	];

	it.each(betweenBreakpoints)(
		'For between %s and %s should match query',
		(min, max) => {
			// matchMedia is not supported by JSDOM, so we need to mock it
			(window.matchMedia as jest.MockedFunction<typeof window.matchMedia>)
				// @ts-expect-error -- it's a mock
				.mockImplementation((query) => {
					expect(
						query.includes(
							`min-width: ${min ? breakpoints[min] : ''}`,
						),
					).toEqual(min ? true : false);

					expect(
						query.includes(
							`max-width: ${max ? breakpoints[max] - 1 : ''}`,
						),
					).toEqual(max ? true : false);

					return {
						matches: true,
					};
				});

			const criteria: { min?: Breakpoint; max?: Breakpoint } = {};

			if (min) {
				criteria['min'] = min;
			}

			if (max) {
				criteria['max'] = max;
			}

			matchesBreakpoints(criteria);
		},
	);
});
