import type { Breakpoint } from '@guardian/source-foundations';
import { getBreakpoint, getTweakpoint } from './detect-viewport';

// const updateViewport = (width: number) => {
// 	Object.defineProperty(window, 'innerWidth', {
// 		writable: true,
// 		configurable: true,
// 		value: width,
// 	});

// 	mediator.trigger('window:throttledResize', []);
// };

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
