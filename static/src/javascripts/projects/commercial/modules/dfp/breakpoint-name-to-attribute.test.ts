/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { breakpointNameToAttribute } from './breakpoint-name-to-attribute';

describe('breakpointNameToAttribute', () => {
	it.each([
		['mobile', 'mobile'],
		['mobileMedium', 'mobile-medium'],
		['mobileLandscape', 'mobile-landscape'],
		['phablet', 'phablet'],
		['tablet', 'tablet'],
		['desktop', 'desktop'],
		['leftCol', 'left-col'],
		['wide', 'wide'],
	])('breakpoint %s is attribute %s', (breakpoint, attribute) => {
		expect(breakpointNameToAttribute(breakpoint)).toEqual(attribute);
	});
});
