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
